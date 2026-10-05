---
name: blender-low-poly
description: Builds stylized low-poly models and scenes in Blender through a Blender connection (the official Blender Lab server or MCP for Blender) - chunky faceted shapes with few polygons, flat shading, a small color palette of plain materials, exaggerated proportions, and the soft lighting the style needs. Use when the user asks for low poly, faceted, stylized, cartoon or game-style models (a house, tree, rock, terrain, vehicle, prop, diorama) or wants a model to look like a low-poly reference image.
metadata:
  author: HydraOps
  version: 1.3.4
  tools: [blenderlab, blender]
---

# Low-poly modeling in Blender

Low poly is a **style**, not just a low triangle count: big readable shapes, visible
flat facets, a handful of plain colors, and proportions pushed a little past reality.
A realistic model with fewer polygons is not low poly; it is a rough realistic model.

The general working loop (look at the scene, plan in parts, one part per call, screenshot
after each step, never delete what you did not create) is in the `blender-modeling`
skill: follow it. This skill says what is different for low poly.

## Which Blender connection you have

HydraOps offers two Blender connections. Your tool names tell you which one you were
given; use the names of that column and never call a tool of the other.

| What you need | **BlenderLab**, the official Blender Lab server: tools `blenderlab_…` | **Blender**, MCP for Blender: tools `blender_…` |
|---|---|---|
| What is in the scene | `get_objects_summary` | `get_scene_info` |
| One object in detail | `get_object_detail_summary` (by `name`) | `get_object_info` |
| The file: saved or not, its path | `get_blendfile_summary_path_info` | code: `bpy.data.filepath` |
| Run Python | `execute_blender_code` | `execute_blender_code` |
| See the 3D viewport | `get_screenshot_of_area_as_image` with `area_ui_type: "VIEW_3D"` (whole window: `get_screenshot_of_window_as_image`) | `get_viewport_screenshot` |
| Point the viewport at an object | `jump_to_view3d_object_by_name` | code |
| Check the Python API | `get_python_api_docs` (an identifier such as `bpy.types.BevelModifier`), `search_api_docs`; the manual: `search_manual_docs` | `bpy_api_lookup`, `describe_node_type` |
| Quick render | `render_thumbnail_to_path`, `render_viewport_to_path`: the image goes to Blender's temp folder and the result gives the real path | code |
| Export | code | `export_scene`, or code |
| Asset libraries, 3D generators | none | Poly Haven, Sketchfab, Poly Pizza; Hyper3D, Hunyuan3D, Tripo |

On both, do not count on anything surviving between `execute_blender_code` calls (carry
your helpers in each script), and what the script prints comes back. On BlenderLab you
can also assign a dict to `result` for structured data, and its guard refuses a few
operators (quitting Blender, factory resets).

If neither set of tools is available, stop and say so: the user has to install a Blender
connection (Tools → Connections), give it to this agent, and have Blender open with that
connection's add-on running. Do not describe work as done when you could not do it.

## The style, as rules

1. **Flat shading everywhere.** Every face is one flat color; no smooth shading, no
   auto smooth. This is what makes the facets show.
2. **Few segments, on purpose.** Cylinders 6-8 sides, cones 5-6, spheres as icospheres
   with 1-2 subdivisions. A 32-sided cylinder ruins the look more than anything else.
3. **No Bevel, no Subdivision Surface.** They round the facets away. For a softer edge
   use a single-segment chamfer at most.
4. **Plain color, no textures.** One material per color, Principled BSDF with Base
   Color, Roughness 0.8-1.0, Metallic 0, no specular shine. Reuse materials: a whole
   scene usually needs 6-12.
5. **A deliberate palette.** Pick it before modeling: 1-2 dominant colors, 2-3 supporting
   ones, 1 accent. Slightly desaturated mid-tones, warm and cool balanced, and two tones
   of each main color (light and dark) for variety between neighboring parts.
6. **Chunky, exaggerated proportions.** Thicker walls, beams and trunks than real life;
   oversized roofs, doors and windows; tapered shapes (wider at the base, or at the top
   for a cartoon feel). Thin parts disappear at this level of detail.
7. **Imperfection by hand, in small doses.** Nothing perfectly aligned: tilt a chimney
   2-4°, vary roof tiles by a few percent of their size and 2-3° of tilt, move vertices of
   rocks and terrain randomly. The structure must still read: rows of tiles stay rows, no
   piece turned sideways or lifted off the surface. With a fixed random seed, so a re-run
   gives the same result.
8. **Detail through separate small pieces, not through subdividing.** A window is a frame
   of four boxes plus a pane; roof tiles are rows of small slabs; stones are a few
   irregular blocks set into the wall. Each piece is simple; the arrangement gives the
   richness.
9. **Pieces may intersect.** Low-poly parts are pushed into each other instead of being
   welded: a beam sinks into a wall, a rock into the ground. Do not spend effort on
   booleans or clean joins.

## Workflow

1. **Read the reference, if there is one**: list the parts, count what repeats (rows of
   tiles, number of beams, windows per wall), note the proportions between parts as
   ratios (roof height against wall height, width against height), and name the palette
   colors. Build from that list. The image decides: anchor one size and derive the rest
   from the ratios, do not invent sizes in meters that the picture contradicts, and do
   not add what it does not show (a base, props) unless asked.
2. **Blockout** the big masses first with boxes and wedges at the right proportions.
   Take a screenshot and compare the silhouette: if the silhouette is wrong, details
   will not save it.
3. **Palette**: create the materials once, named by what they color (`LP_Wall_Light`,
   `LP_Roof_Red`, `LP_Wood_Dark`).
4. **Structure**, then **secondary parts** (beams, frames, chimney, steps), then
   **small detail** (tiles, stones, planks, cracks), then **surroundings** (ground slab,
   a few rocks, grass tufts).
5. **Roughen**: the random offsets and tilts of rule 7.
6. **Light and frame** (below), then put the view at the angle of the reference, capture
   it and compare part by part: silhouette, proportions, where each part sits, colors. Fix.
7. **Finish with `final_check`**, the last call of the task: the function is below, in
   "The final check". You do not see your renders; it measures the render for you (the
   model apart from the background, against the reference image when you have its file
   name) and prints a `PROBLEM:` line for what is wrong. Fix, run it again (two rounds at
   most) and put its output in the report. Measurements you make yourself do not replace
   it: a task that builds or changes a model is not finished until this function has run.

Expect two or three rounds of correction against the reference. Say what still differs.

You have a limited number of tool rounds per task (see "Your step budget" in
`blender-modeling`): build two or three related parts per call, capture at the
milestones (blockout, details, final) and put the most visible parts first.

Code for every recipe is in [references/low-poly-recipes.md](references/low-poly-recipes.md):
palette, flat shading, tapered boxes, gable roofs, rows of tiles, windows and doors,
timber frames, rocks, trees, terrain, scatter and the lighting setup. Open it before the
first script.

## Many blocks in one object

Stone courses, battlements, paving, planks and bricks are many small boxes that belong in
one object. Build them with `lp_blocks`: it finishes each box in its own bmesh and only
then adds it to the object. Do not join boxes by appending vertex and face lists by hand,
and do not move "the last N vertices" after an operation that changes their number (a
chamfer does): the faces end up on the wrong vertices and the model comes out as stretched
spikes. `final_check` names an object broken like that; rebuild it, do not report it.

```python
import bpy, bmesh
from mathutils import Matrix, Vector

def lp_blocks(name, col, mat, blocks, chamfer=0.03):
    """Many boxes in ONE flat-shaded object. blocks is a list of (center, size) or
    (center, size, z_rotation): center and size are (x, y, z) in meters, the rotation in radians.
    Each box is finished in its own bmesh and only then added to the object."""
    whole = bmesh.new()
    for center, size, *rot in blocks:
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
        if chamfer > 0:
            bmesh.ops.bevel(bm, geom=bm.edges[:], offset=min(chamfer, min(size) * 0.25), segments=1, affect='EDGES')
        bmesh.ops.transform(bm, matrix=Matrix.Translation(Vector(center)) @ Matrix.Rotation(rot[0] if rot else 0.0, 4, 'Z'), verts=bm.verts)
        piece = bpy.data.meshes.new("_piece")
        bm.to_mesh(piece)
        bm.free()
        whole.from_mesh(piece)                                   # adds the finished box to the object's mesh
        bpy.data.meshes.remove(piece)
    mesh = bpy.data.meshes.new(name)
    whole.to_mesh(mesh)
    whole.free()
    for poly in mesh.polygons:
        poly.use_smooth = False
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, mesh)
        col.objects.link(obj)
    else:
        obj.data = mesh
    obj.data.materials.append(mat)
    return obj

# One course of wall stones, alternating two sizes, in a single object.
col = bpy.data.collections["LP_Model"]
stone = bpy.data.materials["LP_Stone_Light"]
lp_blocks("Wall_Course_01", col, stone,
          [((x * 0.42 - 1.26, -1.0, 0.35), (0.40 if x % 2 else 0.36, 0.20, 0.30)) for x in range(7)])
```

## Shapes and how to get them

| Want | Build it as |
|---|---|
| Walls, beams, planks, steps | Boxes, scaled; taper the top or bottom for character |
| Stone blocks, battlements, paving, bricks | `lp_blocks` (above): many chamfered boxes in one object |
| Gable roof | A prism (triangle profile extruded), overhanging the walls on all sides |
| Roof tiles | Rows of thin slabs on the roof slope, each row overlapping the one below, with small random size and tilt |
| Chimney, tower, pillar | Tapered box; cap slab slightly wider |
| Tree | Trunk: 5-6 sided tapered cylinder. Foliage: 2-3 stacked cones (pine) or 1-3 displaced icospheres (leafy) |
| Rock | Icosphere with 1 subdivision, vertices moved randomly, squashed in Z, sunk into the ground |
| Terrain, island | A grid with few cuts, vertices raised by noise, then flat shaded; or a thick irregular slab for a diorama base |
| Water | A flat plane or slab, one blue, slightly glossy (Roughness 0.2) |
| Grass, bushes | Small cones or squashed icospheres in clusters |
| Round things (barrel, wheel, well) | 6-8 sided cylinders |

## Budgets

Rough triangle counts, for judging whether something is over-built:

| Asset | Triangles |
|---|---|
| Small prop (rock, crate, bush) | 20-150 |
| Tree | 60-300 |
| House or building | 500-3,000 |
| Character | 300-1,500 |
| Whole diorama | 3,000-15,000 |

Print the count when you finish. Far over budget usually means too many segments or a
modifier that subdivides.

## Light and presentation

The style depends on the light: facets only read when neighboring faces get different
brightness.

- One **sun** at an angle (about 45° up, 30-45° to the side), strength 3-4, with soft
  shadows; plus a **world** of a light sky color at strength 0.6-1.0 so shadows are not
  black. No three-point studio setup. Do not push the light up to get a white background,
  and do not tint the world to color it: the backdrop's own material gives the color.
- A slightly warm sun against a slightly cool world gives the classic look.
- Set the view transform to `Standard` so palette colors stay as chosen (the default
  transform greys them).
- Camera: three-quarter view from above (30-35° down), long lens (50-85 mm) or
  orthographic for a diorama.
- A plain background in a palette color, or a ground slab that ends in a clean edge. A
  backdrop plane has to be far larger than the model (20 times or more), or the world the
  same color: no edge or horizon may show in the frame.
- EEVEE is enough and fast. Soft shadows and ambient occlusion help a lot.

Materials, rendering to a file and troubleshooting are in `blender-materials-render`.

## For a game engine

Low-poly assets usually go to an engine. Keep flat shading when exporting (the facets
are stored as split normals, which raises the vertex count but not the triangle count),
merge the pieces of one asset into one mesh with a few material slots, and put the
origin at the bottom center. Follow `blender-game-export` for the rest.

## The final check (always your last call)

The render tools write a file and give you its path: you never see the image. So the last
`execute_blender_code` call of the task is `final_check`, copied as it is, and what it
prints goes into the report as it is. It makes a small render from the scene's camera and
names what is wrong: objects without a material, broken geometry, a model outside the
frame, a burnt or dark render, and, with the reference's file name, the differences in
framing, brightness, color and how solid the silhouette is.

```python
import bpy, os
import numpy as np
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

BACKDROP_WORDS = ("ground", "backdrop", "floor", "sky", "shadow")

def subject_stats(path, size=128):
    """An image split into background (the colors of its four corners) and subject (the rest):
    how much of the image the subject takes, its box, its brightness, saturation and colors."""
    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    sw, sh = (size, max(8, round(size * h / w))) if w >= h else (max(8, round(size * w / h)), size)
    img.scale(sw, sh)
    px = np.empty(len(img.pixels), dtype=np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    rgb = px.reshape(sh, sw, 4)[:, :, :3]                       # row 0 is the bottom of the image
    cy, cx = max(2, sh // 8), max(2, sw // 8)
    corners = np.concatenate([rgb[:cy, :cx].reshape(-1, 3), rgb[:cy, -cx:].reshape(-1, 3),
                              rgb[-cy:, :cx].reshape(-1, 3), rgb[-cy:, -cx:].reshape(-1, 3)])
    # Background = close to one of the corner colors (a gradient or a soft shadow still counts).
    q = np.unique(np.round(corners * 8).astype(int), axis=0)
    flat = rgb.reshape(-1, 3)
    dist = np.min(np.abs(flat[:, None, :] * 8 - q[None, :, :]).max(axis=2), axis=1)
    subject = (dist > 1.0).reshape(sh, sw)
    share = float(subject.mean())
    whole = flat @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    out = {"size": (w, h), "image_brightness": round(float(whole.mean()), 3), "subject_pct": round(100 * share, 1)}
    if share < 0.005:
        return out
    ys, xs = np.nonzero(subject)
    out["box"] = {"width": round(float(xs.max() - xs.min() + 1) / sw, 2), "height": round(float(ys.max() - ys.min() + 1) / sh, 2),
                  "center": (round(float(xs.max() + xs.min() + 1) / 2 / sw, 2), round(float(ys.max() + ys.min() + 1) / 2 / sh, 2))}
    sub = rgb[subject]
    lum = sub @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    mx, mn = sub.max(axis=1), sub.min(axis=1)
    out["brightness"] = round(float(lum.mean()), 3)
    out["saturation"] = round(float(np.where(mx > 1e-4, (mx - mn) / np.maximum(mx, 1e-4), 0.0).mean()), 3)
    out["burnt_pct"] = round(100 * float((lum > 0.97).mean()), 1)
    keys = (np.clip((sub * 5.999).astype(int), 0, 5) * np.array([36, 6, 1])).sum(axis=1)
    counts = np.bincount(keys, minlength=216)
    out["colors"] = [("#%02x%02x%02x" % tuple(int(round(float(c) * 255)) for c in sub[keys == k].mean(axis=0)),
                      int(round(100 * counts[k] / len(keys)))) for k in counts.argsort()[::-1][:5] if counts[k]]
    return out

def find_reference(file_name):
    """The path of an image attached in THIS conversation, by its stored file name (the last part
    of a line like "storage/uploads/1791118524833-house.png"). None when it is not there."""
    name = os.path.basename(str(file_name or "").replace("\\", "/"))
    if not name or os.path.splitext(name)[1].lower() not in (".png", ".jpg", ".jpeg", ".webp"):
        return None
    for root in (os.path.join(os.environ.get("APPDATA", ""), "HydraOps", "data"),
                 os.path.expanduser("~/Library/Application Support/HydraOps/data"),
                 os.path.expanduser("~/.config/HydraOps/data")):
        path = os.path.join(root, "storage", "uploads", name)
        if os.path.isfile(path):
            return path
    return None

def _model_points(scene, cam, col):
    """Where the model's vertices fall in the frame (the backdrop is left out by its name)."""
    bpy.context.view_layer.update()
    pts = []
    for o in col.all_objects:
        if o.type != 'MESH' or any(wd in o.name.lower() for wd in BACKDROP_WORDS):
            continue
        vs = o.data.vertices
        step = max(1, len(vs) // 400)
        pts += [world_to_camera_view(scene, cam, o.matrix_world @ vs[i].co) for i in range(0, len(vs), step)]
    return pts

def frame_camera(collection_name, fill=0.8):
    """Moves the camera along its own view direction (or changes its orthographic scale) until the
    model fills `fill` of the frame in its larger direction, centered. The angle is not changed."""
    scene, cam = bpy.context.scene, bpy.context.scene.camera
    col = bpy.data.collections[collection_name]
    bpy.context.view_layer.update()                              # the camera's matrix must be current
    forward = cam.matrix_world.to_quaternion() @ Vector((0.0, 0.0, -1.0))
    for _ in range(24):
        pts = _model_points(scene, cam, col)
        xs, ys = [p.x for p in pts], [p.y for p in pts]
        size = max(max(xs) - min(xs), max(ys) - min(ys))
        r = scene.render
        longer = max(r.resolution_x, r.resolution_y)
        cam.data.shift_x += ((max(xs) + min(xs)) / 2 - 0.5) * r.resolution_x / longer
        cam.data.shift_y += ((max(ys) + min(ys)) / 2 - 0.5) * r.resolution_y / longer
        if abs(size - fill) < 0.01:
            break
        if cam.data.type == 'ORTHO':
            cam.data.ortho_scale *= size / fill
        else:
            depth = sum(p.z for p in pts) / len(pts)             # distance to the model along the view
            cam.location = cam.location - forward * depth * (size / fill - 1.0)
    pts = _model_points(scene, cam, col)
    xs, ys = [p.x for p in pts], [p.y for p in pts]
    print("framed: width %.2f, height %.2f, center (%.2f, %.2f)" % (max(xs) - min(xs), max(ys) - min(ys), (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2))

def final_check(collection_name, reference_name=""):
    """Run this as the LAST call of the task and put what it prints in the report.
    It renders the camera view small, measures it, and names what is wrong."""
    scene, cam = bpy.context.scene, bpy.context.scene.camera
    col = bpy.data.collections.get(collection_name)
    problems = []
    if col is None or cam is None:
        print("PROBLEM: no collection named %r, or the scene has no camera." % collection_name)
        return
    meshes = [o for o in col.all_objects if o.type == 'MESH']
    no_mat = [o.name for o in meshes if not o.material_slots or any(s.material is None for s in o.material_slots)]
    if no_mat:
        problems.append("objects without a material (they render white): %s" % ", ".join(no_mat[:8]))
    # Broken geometry: a face joined to the wrong vertices crosses over itself (its outline turns both ways).
    broken = []
    for o in meshes:
        crossed = total = 0
        for p in o.data.polygons:
            co = [o.data.vertices[i].co for i in p.vertices]
            k = len(co)
            if k < 4:
                continue
            total += 1
            limit = 1e-4 * max((a - b).length for a in co for b in co) ** 2
            turns = [(co[(i + 1) % k] - co[i]).cross(co[(i + 2) % k] - co[(i + 1) % k]).dot(p.normal) for i in range(k)]
            if min(turns) < -limit and max(turns) > limit:
                crossed += 1
        if total >= 12 and crossed > 0.1 * total:
            broken.append("%s (%d%% of its faces)" % (o.name, round(100 * crossed / total)))
    if broken:
        problems.append("broken geometry, faces twisted and stretched between the wrong vertices: %s. Delete these objects and build them "
                        "again, each piece finished in its own bmesh before it is added to the object (lp_blocks in blender-low-poly)."
                        % ", ".join(broken[:8]))
    # How much of the frame the model fills, from its real shape (its vertices), not its box.
    pts = _model_points(scene, cam, col)
    expected = 0.0
    if pts:
        xs, ys = [p.x for p in pts], [p.y for p in pts]
        expected = max(0.0, min(1.0, max(xs)) - max(0.0, min(xs))) * max(0.0, min(1.0, max(ys)) - max(0.0, min(ys)))
        cov = {"width": round(max(xs) - min(xs), 2), "height": round(max(ys) - min(ys), 2),
               "center": (round((max(xs) + min(xs)) / 2, 2), round((max(ys) + min(ys)) / 2, 2))}
        print("model in the frame (from the scene):", cov)
        if min(xs) < 0 or max(xs) > 1 or min(ys) < 0 or max(ys) > 1:
            problems.append("part of the model is outside the frame. Run frame_camera(%r, fill=0.8)." % collection_name)
    # A small render of what the camera sees, measured.
    r = scene.render
    keep = (r.resolution_x, r.resolution_y, r.resolution_percentage, r.filepath)
    path = os.path.join(bpy.app.tempdir, "final_check.png")
    r.resolution_x, r.resolution_y = (320, max(1, round(320 * keep[1] / keep[0])))
    r.resolution_percentage, r.filepath = 100, path
    bpy.ops.render.render(write_still=True)
    r.resolution_x, r.resolution_y, r.resolution_percentage, r.filepath = keep
    mine = subject_stats(path)
    print("render   :", mine)
    # The model should show in about a third of the box it takes in the frame, or more.
    if mine["subject_pct"] < 100 * expected * 0.2:
        if mine["image_brightness"] > 0.9:
            problems.append("the model cannot be told apart from the background: the render is burnt to white. "
                            "Lower the sun and the world strength (halve them) and check again.")
        elif mine["image_brightness"] < 0.15:
            problems.append("the render is very dark (brightness %.2f): the model cannot be seen. Add world light or raise the sun." % mine["image_brightness"])
        else:
            problems.append("the model cannot be told apart from the background: it has the same color. "
                            "Check the materials of the model and of the backdrop.")
    elif mine["subject_pct"] >= 0.5:
        if mine["burnt_pct"] > 15:
            problems.append("%.0f%% of the model is burnt to white: lower the sun strength." % mine["burnt_pct"])
        if mine["brightness"] < 0.2:
            problems.append("the model is very dark (brightness %.2f): add world light or raise the sun." % mine["brightness"])
        if len(mine.get("colors", [])) < 2:
            problems.append("the model shows a single color: check that each part has its own material and that the light is not washing them out.")
    ref_path = find_reference(reference_name)
    if ref_path:
        ref = subject_stats(ref_path)
        print("reference:", os.path.basename(ref_path), ref)
        if ref["subject_pct"] >= 2 and mine["subject_pct"] >= 0.5:
            if abs(mine["box"]["width"] - ref["box"]["width"]) > 0.12 or abs(mine["box"]["height"] - ref["box"]["height"]) > 0.12:
                problems.append("framing differs: the subject takes %s x %s of the reference and %s x %s of the render. Run frame_camera(%r, fill=%s)."
                                % (ref["box"]["width"], ref["box"]["height"], mine["box"]["width"], mine["box"]["height"],
                                   collection_name, max(ref["box"]["width"], ref["box"]["height"])))
            # How solid the silhouette is inside its own box: a model with missing or scattered parts is far emptier.
            fill_ref = ref["subject_pct"] / 100 / max(1e-6, ref["box"]["width"] * ref["box"]["height"])
            fill_mine = mine["subject_pct"] / 100 / max(1e-6, mine["box"]["width"] * mine["box"]["height"])
            if fill_ref >= 0.4 and fill_mine < 0.6 * fill_ref:
                problems.append("the silhouette is much emptier than the reference's (the model covers %d%% of its box, the reference %d%%): "
                                "parts are missing, too thin or scattered. The shape does not match yet; say so in the report."
                                % (round(100 * fill_mine), round(100 * fill_ref)))
            if abs(mine["brightness"] - ref["brightness"]) > 0.1:
                problems.append("the subject is %s than in the reference (%.2f against %.2f): %s the sun and the world strength."
                                % ("darker" if mine["brightness"] < ref["brightness"] else "brighter", mine["brightness"], ref["brightness"],
                                   "raise" if mine["brightness"] < ref["brightness"] else "lower"))
            if mine["saturation"] < ref["saturation"] - 0.1:
                problems.append("the subject's colors are duller than the reference's (%.2f against %.2f): set the view transform to Standard, "
                                "keep the world light white or grey, and check the Base Color of the materials." % (mine["saturation"], ref["saturation"]))
    else:
        print("reference: no file (compare the colors above with the image you were shown)")
    for p in problems:
        print("PROBLEM:", p)
    print("FINAL CHECK:", "%d problem(s) to fix or to report" % len(problems) if problems else "no problem found by the measurements")

# The last call of the task. The second argument is the stored name of the reference image,
# exactly as this conversation shows it (a line such as storage/uploads/1791118524833-house.png);
# leave it "" when the conversation gave you no such name.
final_check("LP_Model", "1791118524833-house.png")
```

- **Fix each `PROBLEM:` and run it again, two rounds at most**, one thing per round: the
  geometry first, then the light, the framing and the colors. Use the call the message
  names (`frame_camera("LP_Model", fill=…)` places the camera for you); a correction made
  by eye overshoots.
- **The report quotes the last output** and names every `PROBLEM:` line still there. Do
  not write that the result matches the reference while one remains, and never write a
  number this function did not print.
- **The reference file** is opened only by a name this conversation gave you; never look
  through the uploads folder for "the latest image".
- The measurements do not see everything: before the last call, look at one capture and
  check that no part is unfinished (a wall left as a bare box) or floating loose.

## Before you say it is done

- Flat shaded, no Bevel or Subdivision modifiers, no high-segment cylinders or spheres.
- A palette of plain materials, each assigned; view transform `Standard`. No object left
  without a material (it shows up plain white): run the check in the recipes file.
- Silhouette and proportions match the request or the reference; parts slightly
  irregular, nothing floating or turned sideways.
- Screenshot taken under the sun-and-sky light, from the angle of the reference when
  there is one; triangle count reported against the budget.
- `final_check` was the last call, its output is in the report, and no `PROBLEM:` line is
  left unnamed (step 7).
- What differs from the reference said plainly. Do not call the model finished or
  polished while a difference is visible: name it.
