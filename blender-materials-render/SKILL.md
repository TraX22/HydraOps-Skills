---
name: blender-materials-render
description: Gives Blender objects materials that actually render (Principled BSDF, glass, metal, emission, procedural textures), sets up lighting, world, camera and render settings, and produces a final image through a Blender connection (the official BlenderLab server). Use when the user asks for materials, colors, textures, lighting, a camera or a render of a Blender scene, or when a render comes out black, grey, flat or noisy.
metadata:
  author: HydraOps
  version: 1.1.1
  tools: [blenderlab]
---

# Materials, lighting and rendering in Blender

You work in the user's Blender through the **BlenderLab connection**.
The viewport capture and the final render are different things: the capture shows
whatever shading mode the viewport is in, the render uses the render engine, the lights
and the world. Most "it looked fine but the render is wrong" problems come from that.

## Your Blender connection

You work through **BlenderLab**, the official Blender Lab server; its tools are
`blenderlab_…`:

- What is in the scene: `get_objects_summary`; one object in detail:
  `get_object_detail_summary` (by `name`). The file, saved or not, and its path:
  `get_blendfile_summary_path_info`.
- Run Python: `execute_blender_code`. Nothing survives between calls (carry your helpers in
  each script); what the script prints comes back, and a dict assigned to `result` comes
  back as data. Its guard refuses a few operators (quitting Blender, factory resets).
- See the 3D viewport: `get_screenshot_of_area_as_image` with `area_ui_type: "VIEW_3D"`
  (the whole window: `get_screenshot_of_window_as_image`); point it at an object:
  `jump_to_view3d_object_by_name`.
- Check the Python API: `get_python_api_docs` (an identifier such as
  `bpy.types.BevelModifier`), `search_api_docs`; the manual: `search_manual_docs`.
- Quick render: `render_thumbnail_to_path`, `render_viewport_to_path`; the image goes to
  Blender's temp folder and the result gives the real path.
- Export: code (`bpy.ops.export_scene.gltf`, `bpy.ops.export_scene.fbx`).
- Asset libraries and 3D generators: none. Build the object, or ask the user for a file
  to import.

If these tools are not available, stop and say so: the user has to install the BlenderLab
connection (Tools → Connections), give it to this agent, and have Blender open with the
add-on's server started. Do not describe work as done when you could not do it.

## Order of work

1. **Look**: the scene tool; which objects, which already have materials, is there a
   camera, a light, a world? Read `bpy.app.version_string` and the current render engine.
2. **Materials**, one per distinct surface, named for what they are (`Oak_Wood`,
   `Brushed_Steel`), reused across objects.
3. **Light and world** before judging any material: a material cannot be evaluated in
   the dark.
4. **Camera**: framed on the subject, sensible focal length.
5. **Test render** small (25-50 % resolution, few samples), look at it, fix.
6. **Final render** to a file, and report the path, engine, resolution and time.

Code for each step is in [references/shading-and-render.md](references/shading-and-render.md).
Open it before writing the first script.

## Materials: what goes wrong

- **Color set on the wrong place.** `material.diffuse_color` and `object.color` are
  viewport display colors only: they do **not** render. The color that renders is the
  **Base Color input of the Principled BSDF node**. Set both if you want the solid-mode
  viewport to match.
- **Input names changed in Blender 4.0.** `Transmission` became `Transmission Weight`,
  `Emission` became `Emission Color`, `Specular` became `Specular IOR Level`, `Clearcoat`
  became `Coat Weight`, `Subsurface` became `Subsurface Weight`. Look an input up by name
  and check it exists before setting it; use the API tool of your connection when unsure.
- **Material made but never assigned.** Append it to `obj.data.materials`; for different
  materials on parts of one mesh, assign `polygon.material_index`.
- **Find the node by type, not by name.** The node is called "Principled BSDF" only in
  an English interface. Use `next(n for n in nodes if n.type == 'BSDF_PRINCIPLED')`.

| Surface | Principled BSDF settings |
|---|---|
| Painted, plastic | Base Color; Roughness 0.3-0.6; Metallic 0 |
| Metal | Metallic 1.0; Base Color = the metal's color; Roughness 0.15-0.5 |
| Glass | Transmission Weight 1.0; Roughness 0-0.05; IOR 1.45; needs a world or lights to have anything to refract |
| Glowing | Emission Color + Emission Strength (1-20) |
| Rubber, cloth, matte | Roughness 0.8-1.0 |
| Car paint, varnish | Coat Weight 1.0; Coat Roughness 0.05 |

Metallic is 0 or 1, almost never in between. Pure black (0, 0, 0) and pure white
(1, 1, 1) base colors look wrong under light: stay within about 0.03-0.9.

## Lighting and world

- **No world and no light means a black render**, and glass or chrome rendered against
  an empty world comes out black even with lights, because there is nothing to reflect
  or refract. Give the world a color and strength, or an HDRI.
- A dependable start: a large area light as key (45° to one side and above), a weaker
  fill on the other side, a rim light behind, and a world at low strength (0.2-0.5).
- Area light power is in watts and needs to be large: a 1 m area light 2 m from a small
  object wants roughly 100-500 W. A sun's strength is different: 2-5.
- A ground plane under the object gives contact shadows; without it the object floats.
- An HDRI gives realistic light and reflections in one step. The Blender (MCP for
  Blender) connection can download one from Poly Haven: it is third-party content and
  an approval in HydraOps, so ask first. On BlenderLab, ask the user for an HDRI file.

## Engines

| | EEVEE | Cycles |
|---|---|---|
| Speed | Seconds | Seconds to minutes |
| Use for | Previews, stylized, animation | Final stills, glass, accurate light |
| Watch out | Reflections and refractions need ray tracing enabled; without it glass and glossy surfaces look flat or grainy | Noise: raise samples and keep denoising on; uses the GPU only if the user configured it |

The engine identifier for EEVEE differs by version (`BLENDER_EEVEE_NEXT` in 4.2-4.5,
`BLENDER_EEVEE` before and after): the reference shows how to set it without guessing.
Do not change the user's render device or preferences.

## Camera

- Create one if there is none and make it the scene camera; do not move a camera the
  user already placed unless asked.
- Aim it with a Track To constraint at the subject or at an empty; 50-85 mm for objects,
  24-35 mm for rooms and environments.
- Check the framing with a small test render, not with the viewport screenshot (the
  viewport is not the camera unless you switch to camera view).

## Rendering

- Render **to a file** with an absolute path in a folder the user can find (next to the
  .blend if it is saved, otherwise ask or use the user's temp folder) and report the
  full path. Never overwrite an existing file without saying so. Do it with code (the
  reference has it): BlenderLab's own render tools are for quick checks and write into
  Blender's temp folder whatever path you give them; report the path their result names.
- Test small first. A full-resolution Cycles render can take minutes and blocks Blender
  while it runs; tell the user before starting a long one.
- Look at the result before declaring success: a viewport capture does not show
  a render. If you cannot view the rendered file yourself, say that plainly and describe
  what you set up rather than what the image "looks like".
- Color management: the default view transform (AgX or Filmic) desaturates strong colors
  for realism; for flat graphic colors that must match exactly, use `Standard`.

## Troubleshooting

| Symptom | Usual cause |
|---|---|
| Render is black | No light and no world; camera inside an object; object hidden from render |
| Object is grey or white | Material not assigned, or color set on `diffuse_color` instead of Base Color |
| Glass is black | Empty world; in EEVEE, ray tracing off |
| Pink or magenta | Missing image texture file |
| Grainy | Cycles: few samples or no denoiser. EEVEE: ray tracing off or soft shadows at low samples |
| Flat, no depth | Only a world light: add a key light and a ground plane |
| Washed-out colors | View transform: try `Standard`, or lower the exposure |
| Blocky curved surfaces | Flat shading: enable smooth shading |

## Before you say it is done

- Every visible object has an assigned material whose Base Color is set on the node.
- There is a light or a lit world, and a camera that frames the subject.
- A render was written to a file, and you gave the path, the engine and the resolution.
- You changed only what was asked: no deleted objects, no changed preferences.
