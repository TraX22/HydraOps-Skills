# Low-poly recipes

Written against Blender 4.2 - 5.x. Nothing survives between `execute_blender_code` calls, so each one carries the
helpers it uses: copy the "Helpers" block to the top of your script, then the recipe.
All sizes are meters. Every recipe uses a fixed random seed so a re-run gives the same
model.

## Helpers

```python
import bpy, bmesh, math, random
from mathutils import Vector, Matrix

def lp_collection(name):
    col = bpy.data.collections.get(name)
    if col is None:
        col = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(col)
    return col

def lp_material(name, rgb, roughness=0.9):
    """A plain, matte, single-color material. rgb is linear 0-1."""
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.0
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.2
    mat.diffuse_color = (*rgb, 1.0)
    return mat

def lp_object(name, bm, col, mat=None, location=(0, 0, 0), rotation=(0, 0, 0)):
    """Turns a bmesh into a flat-shaded object, replacing the mesh of an object with the same name."""
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    for poly in mesh.polygons:
        poly.use_smooth = False
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, mesh)
        col.objects.link(obj)
    else:
        old = obj.data
        obj.data = mesh
        if old.users == 0:
            bpy.data.meshes.remove(old)
    if mat is not None:
        obj.data.materials.append(mat)
    obj.location = location
    obj.rotation_euler = rotation
    return obj

def lp_box(size, taper=1.0):
    """A box of size (x, y, z) standing on z = 0; taper scales the top face (0.8 = narrower top)."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    sx, sy, sz = size
    for v in bm.verts:
        top = v.co.z > 0
        k = taper if top else 1.0
        v.co = Vector((v.co.x * sx * k, v.co.y * sy * k, (v.co.z + 0.5) * sz))
    return bm

def lp_jitter(bm, amount, seed=1):
    """Moves every vertex randomly by up to `amount`: the hand-made irregularity."""
    rng = random.Random(seed)
    for v in bm.verts:
        v.co += Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1))) * amount
    return bm
```

## A palette

```python
PALETTE = {
    "LP_Wall_Light": (0.80, 0.74, 0.62),
    "LP_Wall_Dark":  (0.66, 0.60, 0.50),
    "LP_Wood_Dark":  (0.23, 0.13, 0.07),
    "LP_Wood_Light": (0.42, 0.26, 0.13),
    "LP_Roof_Red":   (0.55, 0.16, 0.10),
    "LP_Roof_Dark":  (0.40, 0.11, 0.08),
    "LP_Stone":      (0.45, 0.46, 0.48),
    "LP_Stone_Dark": (0.30, 0.31, 0.34),
    "LP_Grass":      (0.30, 0.50, 0.16),
    "LP_Leaf_Dark":  (0.13, 0.33, 0.14),
    "LP_Glass":      (0.45, 0.70, 0.85),
    "LP_Water":      (0.16, 0.45, 0.70),
}
mats = {name: lp_material(name, rgb) for name, rgb in PALETTE.items()}
lp_material("LP_Glass", PALETTE["LP_Glass"], roughness=0.25)
lp_material("LP_Water", PALETTE["LP_Water"], roughness=0.2)
print(sorted(mats))
```

These are linear values. From an sRGB hex color, convert each channel with
`((c / 255 + 0.055) / 1.055) ** 2.4`.

## Walls with a gable roof

```python
col = lp_collection("LP_House")
W, D, H, ROOF_H, OVERHANG = 3.0, 2.6, 2.2, 1.5, 0.3

walls = lp_object("House_Walls", lp_box((W, D, H), taper=0.97), col, mats["LP_Wall_Light"])

def gable_prism(width, depth, height):
    """Triangle profile across X, extruded along Y, base on z = 0."""
    bm = bmesh.new()
    hw, hd = width / 2, depth / 2
    pts = [(-hw, -hd, 0), (hw, -hd, 0), (0, -hd, height), (-hw, hd, 0), (hw, hd, 0), (0, hd, height)]
    v = [bm.verts.new(p) for p in pts]
    for idx in [(0, 1, 2), (5, 4, 3), (0, 3, 4, 1), (1, 4, 5, 2), (2, 5, 3, 0)]:
        bm.faces.new([v[i] for i in idx])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm

roof = lp_object("House_Roof", gable_prism(W + 2 * OVERHANG, D + 2 * OVERHANG, ROOF_H),
                 col, mats["LP_Roof_Red"], location=(0, 0, H))
print(walls.name, roof.name)
```

## Rows of roof tiles on one slope

```python
def tile_rows(name, col, mat_a, mat_b, width, depth, roof_h, base_z, side=1, rows=6, per_row=7, seed=3):
    """Slabs on the +X (side=1) or -X (side=-1) slope of a gable of the given size."""
    rng = random.Random(seed)
    slope_len = math.hypot(width / 2, roof_h)
    angle = math.atan2(roof_h, width / 2)
    tile_l, tile_w = slope_len / rows * 1.25, depth / per_row
    made = []
    for r in range(rows):
        t = (r + 0.5) / rows                      # 0 at the eave, 1 at the ridge
        x = side * (width / 2) * (1 - t)
        z = base_z + roof_h * t + 0.03
        for c in range(per_row):
            y = -depth / 2 + tile_w * (c + 0.5) + (tile_w / 2 if r % 2 else 0) - tile_w / 4
            bm = lp_box((tile_l * rng.uniform(0.9, 1.05), tile_w * rng.uniform(0.85, 0.97), 0.05))
            tile = lp_object(f"{name}_{r}_{c}", bm, col, mat_a if rng.random() < 0.6 else mat_b,
                             location=(x, y, z),
                             rotation=(rng.uniform(-0.03, 0.03), side * angle, rng.uniform(-0.04, 0.04)))
            made.append(tile)
    return made

tiles = tile_rows("Roof_Tile_R", col, mats["LP_Roof_Red"], mats["LP_Roof_Dark"], W + 2 * OVERHANG, D + 2 * OVERHANG, ROOF_H, H, side=1)
tiles += tile_rows("Roof_Tile_L", col, mats["LP_Roof_Red"], mats["LP_Roof_Dark"], W + 2 * OVERHANG, D + 2 * OVERHANG, ROOF_H, H, side=-1, seed=4)
print(len(tiles), "tiles")
```

Many small objects are fine while building; join them into one mesh when the roof looks
right (see "Join the pieces").

## Timber frame, window and door

```python
def beam(name, start, end, thickness, col, mat):
    """A box from start to end (world points)."""
    a, b = Vector(start), Vector(end)
    length = (b - a).length
    obj = lp_object(name, lp_box((thickness, thickness, length)), col, mat, location=a)
    obj.rotation_euler = (b - a).to_track_quat('Z', 'Y').to_euler()
    return obj

T = 0.16                                               # chunky on purpose
fy = -D / 2 - 0.02                                     # just in front of the front wall
for i, x in enumerate((-W / 2, W / 2)):
    beam(f"Beam_Corner_{i}", (x, fy, 0), (x, fy, H), T, col, mats["LP_Wood_Dark"])
beam("Beam_Top", (-W / 2, fy, H), (W / 2, fy, H), T, col, mats["LP_Wood_Dark"])
beam("Beam_Diag", (-W / 2, fy, 0.2), (-W / 2 + 0.9, fy, H), T * 0.8, col, mats["LP_Wood_Dark"])

def window(name, center, w, h, col, frame_mat, glass_mat, frame=0.09):
    cx, cy, cz = center
    lp_object(name + "_Glass", lp_box((w, 0.04, h)), col, glass_mat, location=(cx, cy, cz - h / 2))
    for tag, a, b in (("B", (cx - w / 2, cy, cz - h / 2), (cx + w / 2, cy, cz - h / 2)),
                      ("T", (cx - w / 2, cy, cz + h / 2), (cx + w / 2, cy, cz + h / 2)),
                      ("L", (cx - w / 2, cy, cz - h / 2), (cx - w / 2, cy, cz + h / 2)),
                      ("R", (cx + w / 2, cy, cz - h / 2), (cx + w / 2, cy, cz + h / 2)),
                      ("M", (cx, cy, cz - h / 2), (cx, cy, cz + h / 2))):
        beam(f"{name}_Frame_{tag}", a, b, frame, col, frame_mat)

window("Window_Front", (0.75, fy, 1.25), 0.7, 0.8, col, mats["LP_Wood_Light"], mats["LP_Glass"])
door = lp_object("Door", lp_box((0.75, 0.08, 1.5), taper=0.95), col, mats["LP_Wood_Light"], location=(-0.6, fy, 0))
```

## Chimney, slightly crooked

```python
chimney = lp_object("Chimney", lp_box((0.5, 0.5, 1.6), taper=0.85), col, mats["LP_Stone"],
                    location=(0.8, 0.5, H + 0.3), rotation=(math.radians(2), math.radians(-3), 0))
cap = lp_object("Chimney_Cap", lp_box((0.56, 0.56, 0.12)), col, mats["LP_Stone_Dark"],
                location=(0.8, 0.5, H + 1.85), rotation=(math.radians(2), math.radians(-3), 0))
```

## Rock

```python
def rock(name, col, mat, radius=0.4, seed=1, location=(0, 0, 0)):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=1, radius=radius)
    lp_jitter(bm, radius * 0.22, seed)
    for v in bm.verts:
        v.co.z *= 0.65                               # squashed
    return lp_object(name, bm, col, mat, location=(location[0], location[1], location[2] + radius * 0.25))

rng = random.Random(7)
for i in range(5):
    rock(f"Rock_{i}", col, mats["LP_Stone" if i % 2 else "LP_Stone_Dark"], radius=rng.uniform(0.15, 0.45),
         seed=10 + i, location=(rng.uniform(-3, 3), rng.uniform(-3.2, -2.0), 0))
```

## Trees

```python
def pine(name, col, trunk_mat, leaf_mat, height=2.4, location=(0, 0, 0), seed=1):
    rng = random.Random(seed)
    x, y, z = location
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=5, radius1=0.12, radius2=0.08, depth=height * 0.3)
    lp_object(name + "_Trunk", bm, col, trunk_mat, location=(x, y, z + height * 0.15))
    for i in range(3):
        bm = bmesh.new()
        r = height * (0.32 - i * 0.08)
        bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=r, radius2=0.0, depth=height * 0.38)
        lp_jitter(bm, 0.03, seed + i)
        lp_object(f"{name}_Leaves_{i}", bm, col, leaf_mat,
                  location=(x, y, z + height * (0.42 + i * 0.22)), rotation=(0, 0, rng.uniform(0, 1)))

def leafy(name, col, trunk_mat, leaf_mat, height=2.0, location=(0, 0, 0), seed=1):
    x, y, z = location
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=5, radius1=0.14, radius2=0.09, depth=height * 0.5)
    lp_object(name + "_Trunk", bm, col, trunk_mat, location=(x, y, z + height * 0.25))
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=1, radius=height * 0.35)
    lp_jitter(bm, height * 0.06, seed)
    lp_object(name + "_Crown", bm, col, leaf_mat, location=(x, y, z + height * 0.72))

pine("Pine_A", col, mats["LP_Wood_Dark"], mats["LP_Leaf_Dark"], location=(-3.2, 1.0, 0), seed=2)
leafy("Tree_A", col, mats["LP_Wood_Light"], mats["LP_Grass"], location=(3.0, 1.2, 0), seed=5)
```

## Ground: a diorama slab or a small terrain

```python
def terrain(name, col, mat, size=9.0, cuts=8, height=0.35, seed=11, flat_radius=2.6):
    """A grid whose vertices rise by random amounts, kept flat near the center for a building."""
    rng = random.Random(seed)
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=cuts, y_segments=cuts, size=size / 2)
    for v in bm.verts:
        d = math.hypot(v.co.x, v.co.y)
        k = min(1.0, max(0.0, (d - flat_radius) / flat_radius))
        v.co.z = rng.uniform(0, height) * k
        v.co.x += rng.uniform(-0.15, 0.15)
        v.co.y += rng.uniform(-0.15, 0.15)
    bmesh.ops.triangulate(bm, faces=bm.faces)          # triangles make the facets show
    return lp_object(name, bm, col, mat, location=(0, 0, -0.02))

ground = terrain("Ground", col, mats["LP_Grass"])
slab = lp_object("Base_Stone", lp_jitter(lp_box((3.8, 3.4, 0.25)), 0.03, seed=2), col, mats["LP_Stone"], location=(0, 0, -0.12))
```

## Sun, sky and color management

```python
scene = bpy.context.scene
sun_data = bpy.data.lights.get("LP_Sun") or bpy.data.lights.new("LP_Sun", 'SUN')
sun_data.energy = 3.5
sun_data.color = (1.0, 0.95, 0.85)
sun_data.angle = math.radians(8)                       # soft shadow edge
sun = bpy.data.objects.get("LP_Sun")
if sun is None:
    sun = bpy.data.objects.new("LP_Sun", sun_data)
    scene.collection.objects.link(sun)
sun.rotation_euler = (math.radians(50), 0.0, math.radians(35))

world = scene.world or bpy.data.worlds.new("World")
scene.world = world
world.use_nodes = True
bg = next(n for n in world.node_tree.nodes if n.type == 'BACKGROUND')
bg.inputs["Color"].default_value = (0.55, 0.72, 0.95, 1.0)
bg.inputs["Strength"].default_value = 0.8

scene.view_settings.view_transform = 'Standard'
print("view transform:", scene.view_settings.view_transform)
```

If the user already has lights or a world they set up, ask before changing them; add the
sun in your own collection and leave theirs alone.

## Check the style

```python
dg = bpy.context.evaluated_depsgraph_get()
tris = 0
problems = []
for o in col.all_objects:
    if o.type != 'MESH':
        continue
    ev = o.evaluated_get(dg)
    m = ev.to_mesh()
    m.calc_loop_triangles()
    tris += len(m.loop_triangles)
    ev.to_mesh_clear()
    if any(p.use_smooth for p in o.data.polygons):
        problems.append(o.name + ": smooth shading")
    if any(mod.type in {'BEVEL', 'SUBSURF'} for mod in o.modifiers):
        problems.append(o.name + ": bevel/subdivision modifier")
    if not o.data.materials:
        problems.append(o.name + ": no material")
mat_names = sorted({s.material.name for o in col.all_objects if o.type == 'MESH' for s in o.material_slots if s.material})
print("objects:", len(col.all_objects), "| triangles:", tris, "| materials:", len(mat_names), mat_names)
print("problems:", problems or "none")
```

## Join the pieces (when the model is approved)

```python
parts = [o for o in col.all_objects if o.type == 'MESH' and o.name.startswith("Roof_Tile_")]
bpy.ops.object.select_all(action='DESELECT')
for o in parts:
    o.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
joined = bpy.context.view_layer.objects.active
joined.name = "House_Roof_Tiles"
print(joined.name, len(joined.data.polygons), "faces,", len(joined.material_slots), "material slots")
```

Joining is one-way: do it at the end, and say that you did.
