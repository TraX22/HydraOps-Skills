# Export recipes

Written against Blender 4.2 - 5.x. Exporter keywords are the part of the API that
changes most: when one is rejected, look the operator up with `bpy_api_lookup`.

## Inspect

```python
import bpy
dg = bpy.context.evaluated_depsgraph_get()
for o in bpy.context.scene.objects:
    if o.type != 'MESH':
        continue
    ev = o.evaluated_get(dg)
    mesh = ev.to_mesh()
    mesh.calc_loop_triangles()
    print(o.name, "| scale", [round(s, 3) for s in o.scale],
          "| rot", [round(r, 3) for r in o.rotation_euler],
          "| dims", [round(d, 3) for d in o.dimensions],
          "| tris", len(mesh.loop_triangles),
          "| mats", [s.material.name if s.material else None for s in o.material_slots],
          "| uvs", [u.name for u in o.data.uv_layers],
          "| mods", [m.type for m in o.modifiers])
    ev.to_mesh_clear()
```

The triangle count here includes modifiers, which is what the engine will receive.

## Work on duplicates in an Export collection

```python
import bpy
src = [bpy.data.objects[n] for n in ("Crate_Body", "Crate_Lid")]
col = bpy.data.collections.get("Export") or bpy.data.collections.new("Export")
if col.name not in bpy.context.scene.collection.children:
    bpy.context.scene.collection.children.link(col)
copies = []
for o in src:
    c = o.copy()
    c.data = o.data.copy()
    c.name = "SM_" + o.name
    col.objects.link(c)
    copies.append(c)
print([c.name for c in copies])
```

## Select exactly what you mean

```python
def select_only(objs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
```

## Apply rotation and scale

```python
select_only(copies)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
```

Objects that share one mesh cannot have transforms applied: make the data single-user
first (`o.data = o.data.copy()`).

## Origin at the bottom center

```python
import bpy
from mathutils import Vector, Matrix

def origin_to_bottom_center(obj):
    corners = [Vector(c) for c in obj.bound_box]              # local space
    center = sum(corners, Vector()) / 8.0
    pivot = Vector((center.x, center.y, min(c.z for c in corners)))
    obj.data.transform(Matrix.Translation(-pivot))            # move the mesh
    obj.matrix_world = obj.matrix_world @ Matrix.Translation(pivot)   # keep it in place

for o in copies:
    origin_to_bottom_center(o)
    o.location = (0.0, 0.0, 0.0)      # only when exporting single assets, not a layout
```

## Normals

```python
import bmesh
for o in copies:
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(o.data)
    bm.free()
    for poly in o.data.polygons:
        poly.use_smooth = True
```

## Reduce geometry without destroying it

```python
dec = obj.modifiers.new("Decimate", 'DECIMATE')
dec.ratio = 0.5            # keep half the triangles; look at the result before going lower
```

Lowering a Subdivision Surface level or the Bevel segments is cleaner than decimating.

## A quick UV map

```python
select_only([obj])
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=1.15192, island_margin=0.02)   # 66 degrees
bpy.ops.object.mode_set(mode='OBJECT')
```

Always return to object mode; a script that leaves Blender in edit mode breaks the next
call.

## Join into one mesh

```python
select_only(copies)
bpy.ops.object.join()                 # the active object keeps its name
joined = bpy.context.view_layer.objects.active
```

## Export GLB

```python
import bpy, os
folder = os.path.dirname(bpy.data.filepath) or bpy.app.tempdir
glb_path = os.path.join(folder, "SM_Crate_01.glb")
if os.path.exists(glb_path):
    print("will overwrite:", glb_path)
select_only(copies)
bpy.ops.export_scene.gltf(
    filepath=glb_path,
    export_format='GLB',
    use_selection=True,
    export_apply=True,        # apply modifiers in the file only
    export_yup=True,
)
print(glb_path, os.path.getsize(glb_path), "bytes")
```

## Export FBX for Unity

```python
fbx_path = os.path.join(folder, "SM_Crate_01.fbx")
select_only(copies)
bpy.ops.export_scene.fbx(
    filepath=fbx_path,
    use_selection=True,
    object_types={'MESH'},            # add 'ARMATURE' for a rigged model
    use_mesh_modifiers=True,
    mesh_smooth_type='FACE',
    apply_scale_options='FBX_SCALE_UNITS',
    axis_forward='-Z',
    axis_up='Y',
    bake_space_transform=True,        # leave False when exporting an armature
    add_leaf_bones=False,
    path_mode='COPY',
    embed_textures=True,
)
print(fbx_path, os.path.getsize(fbx_path), "bytes")
```

For Unreal: `axis_forward='X'`, `axis_up='Z'`.

## Re-import a GLB to check it

```python
before = set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=glb_path)
new = [o for o in bpy.data.objects if o not in before]
tris = 0
for o in new:
    if o.type == 'MESH':
        o.data.calc_loop_triangles()
        tris += len(o.data.loop_triangles)
print("reimported", len(new), "objects,", tris, "triangles")
for o in new:                           # remove only what the import created
    bpy.data.objects.remove(o, do_unlink=True)
```

## Baking a procedural material to an image

Baking needs Cycles, a UV map, and an image texture node selected in the material as the
bake target. It is slow and has many settings; do it only when the user wants the
procedural look in the engine, tell them it takes time, and check the operator with
`bpy_api_lookup` (`bpy.ops.object.bake`) before writing the script.
