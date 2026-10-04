---
name: blender-modeling
description: Builds and edits 3D models in the user's Blender through a Blender connection (the official Blender Lab server or MCP for Blender) - inspecting the scene, writing bpy code in small verified steps, real-world scale, clean naming, modifiers and checking the result with viewport screenshots. Use when the user asks to model, build, create, fix or change an object or a scene in Blender, or to make a 3D model from a description or a reference image.
metadata:
  author: HydraOps
  version: 1.3.0
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
- **Measure the framing, the light and the colors; do not judge them by eye.** A model
  that looks at its own render tends to find it fine, and a correction made by eye
  overshoots (too close becomes too far, burnt becomes dark). Open
  [references/match-reference.md](references/match-reference.md) and, in ONE call: place
  the camera with `frame_model` (you choose how much of the frame the subject fills, the
  code does it), make a quick render, and compare its brightness, saturation and dominant
  colors with the reference image. Fix what the numbers show, one thing per round, two
  rounds at most. Report the numbers; never write a coverage or a brightness you did not
  measure.
- A reference attached to an earlier message may no longer be visible to you. If you
  cannot see it, say so and ask for it again instead of working from memory.

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

- Screenshot taken after the last change, and it matches the request. With a reference:
  taken from its angle and compared part by part, with the framing, brightness and colors
  measured (references/match-reference.md) and the numbers in the report.
- Every object has its material: run the check in the reference file and fix any object
  it lists (an object without one shows up plain white).
- The report says what still differs. Do not call a model finished or polished while a
  difference is visible: name it.
- Objects named, in their collection, at real scale, standing on z = 0 unless asked
  otherwise.
- Nothing of the user's was deleted or moved.
- For materials, lighting or a final image, continue with the `blender-materials-render`
  skill; for a game engine, `blender-game-export`.
