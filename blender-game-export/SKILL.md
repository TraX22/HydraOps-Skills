---
name: blender-game-export
description: Prepares a Blender model for a game engine and exports it as glTF/GLB or FBX through the Blender connection - applied transforms, origin and pivot, scale and axes, triangle count, normals, UVs, material slots, naming, and a check of the exported file. Use when the user wants a Blender model in Unity, Godot, Unreal or a web viewer, asks to export to GLB, glTF or FBX, or reports that an exported model arrives rotated, tiny, huge, untextured or with broken shading.
metadata:
  author: HydraOps
  version: 1.0.0
  tools: [blender]
---

# Exporting a Blender model for a game engine

You work in the user's Blender through the **Blender connection** (`blender_…` tools).
Exporting writes files on the user's disk: say where, and never overwrite a file without
saying so. If the `blender_…` tools are missing, say so and stop.

## Ask or state, once

- **Target**: Unity, Godot, Unreal, or the web (three.js and similar). It decides the
  format and the axis settings.
- **What to export**: the whole scene or named objects, as one file or one per object.
- **Where**: the folder. For Unity, a folder under the project's `Assets/`.

If the user did not say, state your assumptions and go on.

| Target | Format | Why |
|---|---|---|
| Godot, web, anything modern | **GLB** (binary glTF) | One file, materials and textures inside, axes handled by the format |
| Unity | **FBX**, or GLB if the project has a glTF importer (glTFast) | FBX is what Unity imports natively |
| Unreal | **FBX**, or glTF | Both are imported natively |

## Preparation checklist

Work on the objects to export, in this order. Code for every step is in
[references/export-recipes.md](references/export-recipes.md).

1. **Inspect first**: for each object print name, type, scale, rotation, dimensions,
   modifier list, material slots, vertex and triangle counts, UV layers.
2. **Do not destroy the user's model.** Applying modifiers, joining and triangulating
   are one-way. Export with "apply modifiers" on (the file gets the final geometry, the
   scene keeps the modifiers), or work on duplicates in an `Export` collection. Say which
   you did.
3. **Apply scale and rotation** (scale 1, 1, 1 and rotation 0 on export objects). An
   unapplied scale is the usual cause of wrong sizes, skewed normals and physics that
   misbehave in the engine.
4. **Origin where the engine needs the pivot**: bottom center for props and characters
   that stand on the ground, the hinge for a door, the center for a pickup. Then put the
   object at the world origin unless the layout of a whole scene is being exported.
5. **Real scale**: 1 Blender unit = 1 m = 1 Unity unit. Check the dimensions against the
   real object.
6. **Normals and shading**: faces pointing outwards (recalculate if lighting looks
   inverted), smooth shading with sharp edges where needed.
7. **Geometry budget**: report triangles per object. Rough guides: a small prop
   500-5,000, a hero prop 5,000-30,000, a character 20,000-80,000. Lower Subdivision or
   Bevel segments, or add a Decimate modifier, if it is far over; ask before reducing
   detail the user built on purpose.
8. **UVs**: every textured mesh needs a UV map; engines also want a second,
   non-overlapping one for baked lighting only if the project bakes lightmaps.
9. **Materials**: few slots (each is a draw call), named clearly. Only what the format
   can carry survives: Principled BSDF base color, metallic, roughness, normal, emission
   and their image textures. Procedural node textures do **not** export: bake them to
   images first, or tell the user the engine material will need to be rebuilt.
10. **Names**: objects and meshes named for the engine (`SM_Crate_01`, no `.001`
    suffixes, no spaces or accents).

## Export settings that matter

**GLB / glTF**: selected objects only, apply modifiers, +Y up (the default), include
materials, images embedded. Add animations only if there are some.

**FBX for Unity**: selected objects only, object types Mesh (plus Armature if rigged,
with "add leaf bones" off), apply modifiers, scale option `FBX Units Scale`, forward
`-Z`, up `Y`, and "apply transform" so the object does not arrive rotated -90° on X with
a scale of 100. With a rig, leave "apply transform" off and fix the rotation in the
import settings instead: baking it breaks armatures.

**FBX for Unreal**: same, with forward `X`, up `Z`, and smoothing set to `Face`.

Operator keywords change between Blender versions: check with `bpy_api_lookup` when one
is rejected, rather than dropping settings silently.

## Verify the file

- The file exists, and its size is plausible (a GLB of a few hundred bytes is empty).
- Print what was exported: object count, total triangles, materials, file size, path.
- For GLB you can re-import the file into a temporary collection, compare object and
  triangle counts, then remove that collection; do this when the user reported a broken
  export, and make sure you remove only what the re-import created.
- You cannot see the model inside the engine. Say what to check there: scale next to a
  1 m cube, the pivot, the rotation (should be 0, 0, 0), and the materials.

## When it arrives wrong in the engine

| Symptom | Cause | Fix |
|---|---|---|
| Rotated 90° | Axis settings, or unapplied rotation | Apply rotation; FBX forward/up as above with apply transform |
| 100 times too big or small in Unity | FBX unit scale | `FBX Units Scale`, scene unit scale 1.0 |
| Dark or inside-out faces | Flipped normals, negative scale | Apply scale, recalculate normals outside |
| No textures | Procedural materials, or images not packed | Bake to images; GLB embeds them, FBX needs the image files alongside or "embed" path mode |
| Faceted or melted shading | Missing smooth/sharp data | Smooth shading with sharp edges; FBX smoothing `Face` |
| Pivot far from the object | Origin not set | Set origin, move object to world origin |
| Many objects instead of one | Separate objects exported | Join duplicates before export, if one mesh was wanted |
| Huge file | Subdivision applied at a high level, 4K textures | Lower levels, resize textures |

## Report

Give the path and size of each file, the format and the key settings used, triangles and
material slots per object, what you changed in the scene (or that you worked on
duplicates), and the import settings to use in the engine.
