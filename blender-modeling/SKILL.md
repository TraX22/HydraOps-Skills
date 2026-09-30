---
name: blender-modeling
description: Builds and edits 3D models in the user's Blender through the Blender connection - inspecting the scene, writing bpy code in small verified steps, real-world scale, clean naming, modifiers and checking the result with viewport screenshots. Use when the user asks to model, build, create, fix or change an object or a scene in Blender, or to make a 3D model from a description or a reference image.
metadata:
  author: HydraOps
  version: 1.0.0
  tools: [blender]
---

# Modeling in Blender

You work inside the user's running Blender through the **Blender connection** (tools
named `blender_…`). You cannot see the viewport unless you ask for a screenshot, and
every change you make is real: it lands in the file the user has open.

If no `blender_…` tools are available, stop and say so: the user has to install the
Blender connection (Tools → Connections), give it to this agent, and open Blender with
the MCP add-on enabled. Do not describe a model as built when you could not build it.

## The loop

Work in this order, every time. Skipping the look-first and look-after steps is how
models end up wrong without anyone noticing.

1. **Look.** `get_scene_info` for what exists (objects, units, active camera). For an
   object you will touch, `get_object_info`. Never assume an empty scene.
2. **Plan in parts.** Break the model into named parts with sizes in meters and a
   position each ("seat 0.45 × 0.45 × 0.04 at z = 0.45"). State the plan in one short
   list before building anything larger than a couple of objects.
3. **Build one part per call.** One `execute_blender_code` call per part or per coherent
   change, 10-40 lines. Small calls fail small: a traceback in a 200-line script tells
   you little and leaves the scene half-changed.
4. **Verify.** After each meaningful step take a `get_viewport_screenshot` and actually
   compare it with the plan: proportions, parts touching where they should, nothing
   floating, nothing inside something else. Fix before moving on.
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
- **Print what you need back.** The tool returns what the code prints; end a call with a
  short `print` of names, dimensions or counts so the next step starts from facts.
- **Unsure of an API name?** Blender's Python API changes between versions. Use
  `bpy_api_lookup` (or `describe_node_type` for nodes) before guessing, and read the
  version from `bpy.app.version_string` once at the start.

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

Reading the scene runs freely. Tools that change the scene (`execute_blender_code`,
downloads, imports) are held for the user's approval once the task has read outside
content, such as a web page or an asset library. So do research first and tell the user
approvals will appear, or keep a modeling task free of web reading. Group related
changes into one coherent call rather than many tiny ones when approvals are in play.

## Assets and generators

The connection can also search and download assets (Poly Haven, Sketchfab, Poly Pizza)
and call 3D generators (Hyper3D, Hunyuan3D, Tripo). Check the matching `get_…_status`
tool first. Generators can cost the user money and downloads bring third-party files
with their own licenses: ask before using either, and name the source and license in
your report.

## Before you say it is done

- Screenshot taken after the last change, and it matches the request.
- Objects named, in their collection, at real scale, standing on z = 0 unless asked
  otherwise.
- Nothing of the user's was deleted or moved.
- For materials, lighting or a final image, continue with the `blender-materials-render`
  skill; for a game engine, `blender-game-export`.
