---
name: blender-modeling
description: Builds and edits 3D models in the user's Blender through a Blender connection (the official Blender Lab server or MCP for Blender) - inspecting the scene, writing bpy code in small verified steps, real-world scale, clean naming, modifiers and checking the result with viewport screenshots. Use when the user asks to model, build, create, fix or change an object or a scene in Blender, or to make a 3D model from a description or a reference image.
metadata:
  author: HydraOps
  version: 1.3.3
  tools: [blenderlab, blender]
---

# Modeling in Blender

You work inside the user's running Blender through a **Blender connection**. You cannot
see the viewport unless you ask for a capture, and every change you make is real: it
lands in the file the user has open.

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

## The loop

Work in this order, every time. Skipping the look-first and look-after steps is how
models end up wrong without anyone noticing.

1. **Look.** The scene tool for what exists (collections, objects, active camera). For an
   object you will touch, the object-detail tool. Never assume an empty scene.
2. **Plan in parts.** Break the model into named parts with sizes in meters and a
   position each ("seat 0.45 × 0.45 × 0.04 at z = 0.45"). State the plan in one short
   list before building anything larger than a couple of objects.
3. **Build in stages.** Two or three related parts per `execute_blender_code` call
   (walls, plinth and roof; door and windows), 30-90 lines. A single part per call when
   it is tricky (a boolean, a curved surface) or right after a failure: a traceback in a
   200-line script tells you little and leaves the scene half-changed.
4. **Verify at the milestones.** Capture the 3D viewport once the main volumes stand,
   once the details are in, and at the end, and actually compare it with the plan:
   proportions, parts touching where they should, nothing floating, nothing inside
   something else. Between captures, check with the numbers your code printed. Fix before
   moving on. If the capture comes back marked as not visible to you, your model cannot
   see images: verify with numbers instead (dimensions, positions, counts), and say that
   you could not look.
5. **Report.** Say what you built, the object names, the dimensions, and anything that
   differs from what was asked.

### Your step budget

A task gives you a limited number of tool rounds (15 unless the user raised it), and
every call spends one: opening a skill, a scene summary, a build call, a capture.

- Open the skills you need once, together, and their reference files only if you will
  use them. Do not reopen one you already opened in this conversation.
- Plan the stages against the budget before the first build call: about 1 round to look,
  8-9 to build, 3 captures, 1 spare for a fix. Order them so the most visible parts come
  first.
- When a capture and a summary do not depend on each other, ask for both in one round.
- If the request does not fit, say so in the plan, finish a coherent part of it well and
  end with the exact list of what is left, so the user only has to say "continue". Never
  stop in the middle of a part.

## Rules that prevent most failures

- **Do not delete or overwrite what you did not create** unless the user asked. No
  "select all, delete" to get a clean scene; no `read_factory_settings`. If the default
  cube is in the way, ask or work beside it.
- **Put your work in its own collection**, named after the model, and give every object
  and mesh a real name (`Chair_Leg_FL`, not `Cube.004`). Later steps find objects by
  name.
- **Real scale.** 1 unit = 1 meter. A door is 2.0 m tall, a mug 0.10 m. Check
  `obj.dimensions` after building instead of trusting the numbers you typed.
- **Transforms:** set `location`, `rotation_euler` (radians: use `math.radians`) and
  `scale` directly; apply scale before bevels or exports (see the reference).
- **Prefer data over operators.** `bpy.data` and `bmesh` work regardless of what is
  selected; `bpy.ops` depends on context and fails in ways that are hard to read. When
  you must use an operator, select and activate the object explicitly first.
- **Make scripts re-runnable.** Look an object up by name and reuse or replace it,
  instead of creating `Leg.001`, `Leg.002` on every retry.
- **Send back what you need.** End a call with a short `print` of names, dimensions or
  counts (on BlenderLab, or a dict assigned to `result`) so the next step starts from
  facts.
- **Unsure of an API name?** Blender's Python API changes between versions. Check it with
  the API tool of your connection before guessing, and read the version from
  `bpy.app.version_string` once at the start.

Patterns for primitives, bmesh, modifiers, smoothing, curves, arrays and parenting are
in [references/bpy-patterns.md](references/bpy-patterns.md). Open it before writing the
first script of a task.

## Choosing how to build a shape

| Shape | Approach |
|---|---|
| Boxes, cylinders, furniture, architecture, props | Primitives, scaled and positioned; Bevel modifier for edges |
| Anything repeated (fence, stairs, teeth of a gear) | One part + Array modifier, or a loop that links the same mesh |
| Round or turned objects (vase, glass, bottle, wheel) | A profile + Screw modifier, or a curve with bevel |
| Pipes, cables, handles, rails | A curve with `bevel_depth` |
| Symmetric things (vehicle, character blockout) | Half the model + Mirror modifier |
| Text, logos, coins, plaques | Text or curve object, extruded, then converted to mesh |
| Soft, organic forms | Blockout from primitives + Subdivision Surface; say honestly that sculpted detail is limited this way |

Keep modifiers **unapplied** while iterating (they stay editable) and say so in the
report; apply them only for export or when a later step needs the real geometry.

## Working from a reference image

- Describe what you see first: the parts, their proportions relative to each other, and
  the count of anything repeated. Build from that list.
- **The image decides, not numbers made up for it.** Read the proportions as ratios
  (width to height to depth; how much of the total height is roof; how wide a door is
  against its wall), pick one measurement to anchor the scale (the user's, or a sensible
  real-world size) and derive every other size from the ratios. If the text of the
  request gives sizes that contradict the image, follow the image and say so.
- When you are asked to write a prompt or a brief from a reference, describe shapes,
  ratios, colors and counts. Do not invent sizes in meters: whoever builds from the brief
  will follow them instead of the picture.
- Build what the reference shows. No base, props or decoration it does not have, unless
  the user asked.
- After the blockout, and again before you report, put the view at the angle of the
  reference, capture it and compare part by part: silhouette, proportions, where each
  part sits, colors. Fix what differs; what you cannot fix, list in the report. Expect
  two or three correction rounds; that is normal, not a failure.
- **The framing, the light and the colors are measured, not judged by eye**: see "The
  final check" below. It compares your render with the reference file when you give it the
  file's name.
- A reference attached to an earlier message may no longer be visible to you. If you
  cannot see it, say so and ask for it again instead of working from memory.

## The final check (always your last call)

You do not see your renders: the render tools write a file and give you its path, and a
viewport capture does not show the scene's light. A model that reports from what it
intended, not from what came out, delivers white or black images without knowing. So the
**last `execute_blender_code` call of every task that builds or changes a model** is
`final_check`, and its printed output goes into your report as it is.

It makes a small render from the scene's camera, splits it into background (the colors of
the four corners) and model (the rest), and prints: how much of the frame the model fills,
its brightness, saturation and main colors, the objects without a material, the objects
whose geometry is broken (faces joined to the wrong vertices), and one
`PROBLEM:` line for each thing that is wrong. With the file name of the reference it
measures that image the same way and compares framing, brightness, color and how solid
the silhouette is.

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

How to use it:

- **Fix each `PROBLEM:` and run it again, two rounds at most.** One thing per round: the
  light first, then the framing, then the colors. A correction made by eye overshoots
  (too close becomes too far, burnt becomes dark): use the numbers and the call the
  message names (`frame_camera("LP_Model", fill=…)` places the camera for you).
- **The report quotes the last output**: the model's share of the frame, its brightness and
  colors, and every `PROBLEM:` line that is still there. Do not write that the result
  matches the reference, or that it is finished, while a `PROBLEM:` line remains: say
  which one. Never write a number that this function did not print.
- **The reference file** is opened only by a name this conversation gave you. Never look
  through the uploads folder for "the latest image": other conversations keep their
  attachments there. Without a name, compare the printed colors with the image you were
  shown, and say that the comparison was by eye.
- **Light and backdrop**: keep the world light white or grey; to get a colored background,
  color the backdrop object (name it `Backdrop…` or `Ground…`), never the world light,
  which would tint the whole model. Make the backdrop far larger than the model (20 times
  or more) so no edge shows. A white background does not need a strong light: a sun of
  2-4 and a world of 0.5-1.0 is the normal range; far above it everything burns to white.

## Approvals in HydraOps

Reading the scene runs freely. Tools that act (`execute_blender_code`, renders to a file,
the `jump_to_…` tools, downloads, imports) are held for the user's approval once the task
has read outside
content, such as a web page or an asset library. So do research first and tell the user
approvals will appear, or keep a modeling task free of web reading. Group related
changes into one coherent call rather than many tiny ones when approvals are in play.

## Assets and generators

Only the **Blender** (MCP for Blender) connection has them: it can search and download
assets (Poly Haven, Sketchfab, Poly Pizza) and call 3D generators (Hyper3D, Hunyuan3D,
Tripo); check the matching `get_…_status` tool first. With **BlenderLab** there are
none: build the object, or ask the user for a file to import. Generators can cost the user money and downloads bring third-party files
with their own licenses: ask before using either, and name the source and license in
your report.

## Before you say it is done

- `final_check` was your last call, its output is in the report, and no `PROBLEM:` line
  is left without being named.
- Screenshot taken after the last change, and it matches the request. With a reference:
  taken from its angle and compared part by part.
- Every object has its material: run the check in the reference file and fix any object
  it lists (an object without one shows up plain white).
- The report says what still differs. Do not call a model finished or polished while a
  difference is visible: name it.
- Objects named, in their collection, at real scale, standing on z = 0 unless asked
  otherwise.
- Nothing of the user's was deleted or moved.
- For materials, lighting or a final image, continue with the `blender-materials-render`
  skill; for a game engine, `blender-game-export`.
