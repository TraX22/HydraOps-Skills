# Matching a reference image: measure, do not judge by eye

A model that looks at its own render tends to find it fine. These helpers replace the
opinion with numbers: how much of the frame the model fills, how bright and how saturated
the render is next to the reference, and which colors dominate each image. Run them, read
the numbers, fix, and put the numbers in your report.

Each block is self-contained. Nothing survives between `execute_blender_code` calls:
paste the helpers you need into the call that uses them.

## The helpers

```python
import bpy, os
import numpy as np
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

def find_reference(file_name):
    """The path of an image attached in THIS conversation, given its stored file name (the last
    part of a line like "storage/uploads/1791118524833-house.png"). Works when Blender runs on
    the same computer as HydraOps. Returns None when the name is not an image or is not there.
    Only the name is used: it cannot be made to open a file somewhere else."""
    name = os.path.basename(str(file_name or "").replace("\\", "/"))
    if not name or os.path.splitext(name)[1].lower() not in (".png", ".jpg", ".jpeg", ".webp"):
        return None
    roots = [os.path.join(os.environ.get("APPDATA", ""), "HydraOps", "data"),
             os.path.expanduser("~/Library/Application Support/HydraOps/data"),
             os.path.expanduser("~/.config/HydraOps/data")]
    for root in roots:
        path = os.path.join(root, "storage", "uploads", name)
        if os.path.isfile(path):
            return path
    return None

def image_stats(path, size=96):
    """Brightness, saturation, burnt and black areas, and the dominant colors of an image file."""
    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    img.scale(size, max(1, round(size * h / w)))
    px = np.empty(len(img.pixels), dtype=np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    rgb = px.reshape(-1, 4)[:, :3]
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    mx, mn = rgb.max(axis=1), rgb.min(axis=1)
    sat = np.where(mx > 1e-4, (mx - mn) / np.maximum(mx, 1e-4), 0.0)
    q = np.clip((rgb * 5.999).astype(int), 0, 5)            # 6 levels per channel
    keys = q[:, 0] * 36 + q[:, 1] * 6 + q[:, 2]
    counts = np.bincount(keys, minlength=216)
    colors = []
    for k in counts.argsort()[::-1][:5]:
        if counts[k] == 0:
            break
        mean = rgb[keys == k].mean(axis=0)
        colors.append(("#%02x%02x%02x" % tuple(int(round(float(c) * 255)) for c in mean),
                       int(round(100 * counts[k] / len(keys)))))
    return {"size": (w, h),
            "brightness": round(float(lum.mean()), 3),
            "saturation": round(float(sat.mean()), 3),
            "burnt_pct": round(100 * float((lum > 0.97).mean()), 1),
            "black_pct": round(100 * float((lum < 0.03).mean()), 1),
            "colors": colors}                                # (hex, percent of the image)

def model_objects(col, skip=("ground", "backdrop", "floor", "sky")):
    """The meshes of the model itself: the big plane behind it is left out by its name."""
    return [o for o in col.all_objects
            if o.type == 'MESH' and not any(s in o.name.lower() for s in skip)]

def coverage(cam, objs):
    """How much of the frame the objects fill (0-1 of its width and height) and where their center falls."""
    scene = bpy.context.scene
    bpy.context.view_layer.update()
    pts = [world_to_camera_view(scene, cam, o.matrix_world @ Vector(c)) for o in objs for c in o.bound_box]
    xs, ys = [p.x for p in pts], [p.y for p in pts]
    return {"width": round(max(xs) - min(xs), 3), "height": round(max(ys) - min(ys), 3),
            "center": (round((max(xs) + min(xs)) / 2, 3), round((max(ys) + min(ys)) / 2, 3))}

def frame_model(cam, objs, fill=0.8):
    """Moves the camera along its own view direction (or changes its orthographic scale) until
    the objects fill `fill` of the frame in their larger direction, centered. The angle is kept."""
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    center = (lo + hi) / 2
    forward = cam.matrix_world.to_quaternion() @ Vector((0.0, 0.0, -1.0))
    dist = max((center - cam.matrix_world.translation).dot(forward), 0.5)
    for _ in range(10):
        cam.location = center - forward * dist
        c = coverage(cam, objs)
        size = max(c["width"], c["height"])
        if abs(size - fill) < 0.01:
            break
        if cam.data.type == 'ORTHO':
            cam.data.ortho_scale *= size / fill
        else:
            dist *= size / fill
    # What is left off-center (perspective makes the box lopsided) is taken out with the lens shift.
    # (The shift is measured in units of the longer side of the frame.)
    c = coverage(cam, objs)
    r = bpy.context.scene.render
    longer = max(r.resolution_x, r.resolution_y)
    cam.data.shift_x += (c["center"][0] - 0.5) * r.resolution_x / longer
    cam.data.shift_y += (c["center"][1] - 0.5) * r.resolution_y / longer
    return coverage(cam, objs)

def quick_render(name="match_check.png", width=320):
    """A small render of the current camera to Blender's temp folder; returns the path."""
    scene = bpy.context.scene
    r = scene.render
    keep = (r.resolution_x, r.resolution_y, r.resolution_percentage, r.filepath)
    path = os.path.join(bpy.app.tempdir, name)
    r.resolution_x, r.resolution_y = width, max(1, round(width * keep[1] / keep[0]))
    r.resolution_percentage, r.filepath = 100, path
    bpy.ops.render.render(write_still=True)
    r.resolution_x, r.resolution_y, r.resolution_percentage, r.filepath = keep
    return path
```

## 1. Framing

Look at the reference and choose how much of the frame its subject fills, in its larger
direction: **0.95** when it reaches the edges, **0.8** with a little air, **0.6** with
generous air. Then let the code place the camera, and report the numbers it prints.

```python
col = bpy.data.collections["LP_Model"]          # the model's collection
cam = bpy.context.scene.camera
objs = model_objects(col)                       # without the backdrop plane
result = frame_model(cam, objs, fill=0.8)
print("coverage after framing:", result)        # width / height / center, measured
```

- Set the format first (`scene.render.resolution_x / resolution_y`: vertical, square or
  wide, as the reference) and the angle (rotation of the camera); `frame_model` only
  changes the distance and the centering.
- Never write a coverage number you did not get from `coverage()`.
- The plane behind the model has to fill the frame: make it at least 20 times the size
  of the model, or give the world the same color, so no edge or horizon shows.

## 2. Brightness and color

```python
# The stored name of the reference, exactly as this conversation shows it; "" when you do not have it.
ref_path = find_reference("1791118524833-house.png")
render_path = quick_render()
mine = image_stats(render_path)
print("render   :", mine)
if ref_path:
    ref = image_stats(ref_path)
    print("reference:", os.path.basename(ref_path), ref)
    print("brightness render - reference:", round(mine["brightness"] - ref["brightness"], 3))
    print("saturation render - reference:", round(mine["saturation"] - ref["saturation"], 3))
```

Read the result like this:

| What the numbers say | What to change |
|---|---|
| Render darker than the reference by more than 0.08 | Raise the sun and the world strength, both by the ratio reference / render (at most ×2 per round) |
| Render brighter by more than 0.08, or `burnt_pct` over 3 | Lower them by the same ratio; burnt areas mean the sun is too strong |
| Render less saturated by more than 0.10 | View transform to `Standard` (`scene.view_settings.view_transform`), look to `None`; then check the Base Color of the materials |
| The dominant colors do not resemble the reference's | Compare the two lists of colors and correct the materials (or the world color) that are off; a color tint over everything comes from the world or the sun color |
| `black_pct` over 10 | Add world light: the shadows are black |

**Which file is the reference.** Use only a file name that this conversation gave you: a
line such as `storage/uploads/1791118524833-house.png` next to a message, or a path the user
wrote. Never look through the uploads folder for "the latest image" or list its files:
other conversations keep their attachments there too, and those are not yours to open.
If you have no name, do not guess one: ask the user for the image's path, or go on without it.

Without a reference file (`find_reference(...)` gave None), aim at: brightness 0.35-0.65,
burnt under 3 %, black under 5 %, and compare the dominant colors with the ones you see
in the reference.

Repeat the render and the measurement after each change, **two rounds at most**: each
round costs steps. Change one thing per round (light first, then colors), so a correction
does not overshoot.

## 3. The report

Give the measured numbers: coverage after framing, brightness and saturation of the
render and of the reference, and the dominant colors of both. If a difference over the
thresholds above remains, say which one. Do not describe the render as matching while
the numbers say otherwise.
