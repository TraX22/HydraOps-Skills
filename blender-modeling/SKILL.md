---
name: blender-modeling
description: Builds and edits 3D models in the user's Blender through a Blender connection (the official Blender Lab server or MCP for Blender) - inspecting the scene, writing bpy code in small verified steps, real-world scale, clean naming, modifiers and checking the result with viewport screenshots. Use when the user asks to model, build, create, fix or change an object or a scene in Blender, or to make a 3D model from a description or a reference image.
metadata:
  author: HydraOps
  version: 1.1.0
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
3. **Build one part per call.** One `execute_blender_code` call per part or per coherent
   change, 10-40 lines. Small calls fail small: a traceback in a 200-line script tells
   you little and leaves the scene half-changed.
4. **Verify.** After each meaningful step capture the 3D viewport and actually compare it
   with the plan: proportions, parts touching where they should, nothing floating,
   nothing inside something else. Fix before moving on. If the capture comes back marked
   as not visible to you, your model cannot see images: verify with numbers instead
   (dimensions, positions, counts), and say that you could not look.
5. **Report.** Say what you built, the object names, the dimensions, and anything that
   differs from what was asked.

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
- Pick one measurement to anchor the scale (the user's, or a sensible real-world size)
  and derive the rest from proportions.
- After the blockout, take a screenshot from a similar angle and compare part by part.
  Expect two or three correction rounds; that is normal, not a failure.

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

- Screenshot taken after the last change, and it matches the request.
- Objects named, in their collection, at real scale, standing on z = 0 unless asked
  otherwise.
- Nothing of the user's was deleted or moved.
- For materials, lighting or a final image, continue with the `blender-materials-render`
  skill; for a game engine, `blender-game-export`.
