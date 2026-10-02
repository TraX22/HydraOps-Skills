---
name: blender-low-poly
description: Builds stylized low-poly models and scenes in Blender through a Blender connection (the official Blender Lab server or MCP for Blender) - chunky faceted shapes with few polygons, flat shading, a small color palette of plain materials, exaggerated proportions, and the soft lighting the style needs. Use when the user asks for low poly, faceted, stylized, cartoon or game-style models (a house, tree, rock, terrain, vehicle, prop, diorama) or wants a model to look like a low-poly reference image.
metadata:
  author: HydraOps
  version: 1.1.0
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
7. **Imperfection by hand.** Nothing perfectly aligned: tilt a chimney 2-4°, make roof
   tiles uneven, move vertices of rocks and terrain randomly. With a fixed random seed,
   so a re-run gives the same result.
8. **Detail through separate small pieces, not through subdividing.** A window is a frame
   of four boxes plus a pane; roof tiles are rows of small slabs; stones are a few
   irregular blocks set into the wall. Each piece is simple; the arrangement gives the
   richness.
9. **Pieces may intersect.** Low-poly parts are pushed into each other instead of being
   welded: a beam sinks into a wall, a rock into the ground. Do not spend effort on
   booleans or clean joins.

## Workflow

1. **Read the reference, if there is one**: list the parts, count what repeats (rows of
   tiles, number of beams, windows per wall), note the proportions between parts (roof
   height against wall height), and name the palette colors. Build from that list.
2. **Blockout** the big masses first with boxes and wedges at the right proportions.
   Take a screenshot and compare the silhouette: if the silhouette is wrong, details
   will not save it.
3. **Palette**: create the materials once, named by what they color (`LP_Wall_Light`,
   `LP_Roof_Red`, `LP_Wood_Dark`).
4. **Structure**, then **secondary parts** (beams, frames, chimney, steps), then
   **small detail** (tiles, stones, planks, cracks), then **surroundings** (ground slab,
   a few rocks, grass tufts).
5. **Roughen**: the random offsets and tilts of rule 7.
6. **Light and frame** (below), screenshot, compare with the reference part by part, fix.

Expect two or three rounds of correction against the reference. Say what still differs.

Code for every recipe is in [references/low-poly-recipes.md](references/low-poly-recipes.md):
palette, flat shading, tapered boxes, gable roofs, rows of tiles, windows and doors,
timber frames, rocks, trees, terrain, scatter and the lighting setup. Open it before the
first script.

## Shapes and how to get them

| Want | Build it as |
|---|---|
| Walls, beams, planks, steps | Boxes, scaled; taper the top or bottom for character |
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
  black. No three-point studio setup.
- A slightly warm sun against a slightly cool world gives the classic look.
- Set the view transform to `Standard` so palette colors stay as chosen (the default
  transform greys them).
- Camera: three-quarter view from above (30-35° down), long lens (50-85 mm) or
  orthographic for a diorama.
- A plain background in a palette color, or a ground slab that ends in a clean edge.
- EEVEE is enough and fast. Soft shadows and ambient occlusion help a lot.

Materials, rendering to a file and troubleshooting are in `blender-materials-render`.

## For a game engine

Low-poly assets usually go to an engine. Keep flat shading when exporting (the facets
are stored as split normals, which raises the vertex count but not the triangle count),
merge the pieces of one asset into one mesh with a few material slots, and put the
origin at the bottom center. Follow `blender-game-export` for the rest.

## Before you say it is done

- Flat shaded, no Bevel or Subdivision modifiers, no high-segment cylinders or spheres.
- A palette of plain materials, each assigned; view transform `Standard`.
- Silhouette and proportions match the request or the reference; parts slightly
  irregular, nothing floating.
- Screenshot taken under the sun-and-sky light; triangle count reported against the
  budget; what differs from the reference said plainly.
