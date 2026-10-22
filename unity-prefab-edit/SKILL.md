---
name: unity-prefab-edit
description: Changes what a prefab is in the user's Unity project through the Unity connection (Unity's own CLI as an MCP server) - a variant of a pack's piece, a different default scale, a collider or another component with its values, another material, a child renamed or turned off - and swaps the copies already placed in a scene for the changed prefab. Use when the user asks to edit, modify, adjust or make a variant of a prefab, to add a collider, component, script values or material to a prefab, to change a prefab's size or pivot, or to replace the instances of a prefab in a scene with a new or changed one. For placing and arranging prefabs in a scene, see unity-scene-assembly.
metadata:
  author: HydraOps
  version: 1.0.0
  tools: [unity]
---

# Editing prefabs in Unity

A prefab is a reusable thing: every copy of it in every scene follows the asset. This
skill is for changing the thing itself (its size, its components, its material, its
children) and for bringing the copies in a scene up to date. Arranging copies in a scene
(where they go, how many, how they face) is `unity-scene-assembly`'s work: open that one
when the request is about placement; open both when it is about both.

Everything here goes through the typed tools of the Unity connection. **You never write
or run code for this work**: not `eval`, `eval_file`, `run_script`, `write_text_file`,
`create_script` or `menu`. Every one of them waits for the user's approval, and nothing
in editing a prefab needs them: the typed tools read and set every serialized value,
fit a collider to a mesh, and apply the result to the asset.

## Your Unity connection

The connection is Unity's own MCP server; its tools are `unity_…`. The editor must be
open on the project: if the connection shows no tools, say so and stop (the user opens
the project, or presses Reconnect in Tools → Connections). Do not describe work as done
when you could not do it.

- **Find the asset**: `find_assets` with `type: "GameObject"`, a `name` substring,
  `search_in` the pack's or the project's folder, a small `limit`. It returns paths and
  GUIDs; a path is the handle every other tool takes.
- **Find copies in the scene**: `find_gameobjects` by `name` or `hierarchy_path`,
  `search` with `h: <name>` (a Unity Search query, with a `limit`), `get_selection`.
- **Read**: `get_component_properties` (`target` the GameObject plus `type`, or a
  component handle) gives a component's serialized values; `get_serialized_fields`
  gives the same with each field's path and type, which is what you need before
  setting something whose name you are not sure of; `get_material_properties` reads a
  material's shader and properties.
- **Change an instance**: `set_transform` (`position`, `rotation` in degrees, `scale`;
  omitted channels stay), `add_component` (`target`, `type` such as `BoxCollider`),
  `remove_component`, `set_component_properties` (`properties`: a map of serialized
  property name to value; vectors and colors as arrays, object references as handles),
  `set_active`, `rename_gameobject`, `set_parent`.
- **Prefab assets**: `create_prefab_variant` (`base` path, variant `path`),
  `create_prefab` (a scene object saved as a new asset), `instantiate_prefab` (`prefab`
  path, optional `name`), `apply_prefab_overrides` and `revert_prefab_overrides` (on an
  `instance`), `unpack_prefab`, `save_prefab_contents` (only two edits: `rename_child`
  with `new_name`, and `set_active_child` with `active`; it cannot change a transform,
  a component or a material).
- **Other assets**: `copy_asset` (`asset`, `destination` path), `rename_asset`,
  `move_asset`, `set_material_properties` (`material`, `properties` with the leading
  underscore such as `_BaseColor`), `delete_asset` (destructive; only when asked).
- **Scenes and captures**: `list_open_scenes`, `save_scene`, `save_all`, and the review
  camera described in `unity-scene-assembly` ("Showing the result").

## The one rule: a prefab is edited through an instance

The tools that change transforms, components and materials work on GameObjects in a
scene, and `save_prefab_contents` only renames or toggles children. So a change to the
asset is always this loop:

1. `instantiate_prefab` the asset (the base, or the variant you just created) into the
   active scene, under a temporary empty named `_PrefabEdit` that you create first.
   Where it lands does not matter; leave its position alone.
2. Change the instance with the typed tools: `set_transform` for a default scale,
   `add_component` and `set_component_properties` for components, the material steps
   below for a material.
3. `apply_prefab_overrides` on the instance. Every override on it goes into the asset
   the instance comes from: the variant when you instantiated a variant, the base when
   you instantiated the base. Read the instance's properties once more right after, as
   the check that the values you meant are the ones applied.
4. Delete the instance and the `_PrefabEdit` root (`delete_gameobject`). What stays is
   the asset.

The same loop, with `revert_prefab_overrides` instead of apply, is how a copy in the
scene is put back to what its asset says.

## Workflow

1. **Look, narrowly.** The asset the user names, by `find_assets`; one existing copy of
   it in the scene if there is one, by `find_gameobjects`; its `Transform` and the
   components the request touches, read in a single round of `get_component_properties`
   calls (several calls in one round, not one per round). Do not fetch the scene's whole
   hierarchy to find a prefab's copies: `search` with `h: <name>` lists them.
2. **Base or variant.** A prefab that came with an asset pack is not edited: changing it
   changes every copy in every scene, and the pack's next update overwrites it. The
   user's change becomes a **variant**, created with `create_prefab_variant` next to the
   base (or in the user's own folder, `Assets/_Project/…`, when the pack's folder is
   read-only to them), named as the user said or, if they did not, as the base plus a
   suffix that says what changed (`_Tall`, `_NoCollider`). The base itself is edited only
   when the user names it and asks for the base to change; then say in the report that
   every copy in the project changed with it. A prefab the user made (in their own
   folder) is theirs to edit directly when they ask.
3. **Plan in parts, against the step budget.** Say in one line what you will change,
   on which asset, and what you will not touch.
4. **Edit through an instance** (the loop above). Group the changes: all the
   `set_transform`, `add_component` and `set_component_properties` calls on the
   temporary instance in one round, `apply_prefab_overrides` in the next.
5. **Replace the copies**, when the user asked for the scene to use the changed prefab
   (a variant does not replace the base's copies by itself). See "Replacing copies in a
   scene".
6. **Capture, look, correct.** When copies in a scene changed, one capture framed on
   them with the review camera from `unity-scene-assembly`, re-aimed before the capture.
   A change to the asset alone has no picture: its proof is the values you read back.
7. **Save and report.** `save_scene` when the scene changed and the user wants it to
   stay (a variant or an applied override is already on disk: assets save themselves);
   the report is in "Before you say it is done".

### Your step budget

- Open this skill once; do not reopen it in the same conversation.
- About 2 rounds to look, 1 for the variant, 2 for the edit loop, 3-4 to replace the
  copies, 1 capture, 1 spare. A request that does not fit is said so in the plan;
  finish the asset first (it is the reusable part), then as many copies as fit, and end
  with the exact list of what is left.
- Reads that do not depend on each other go in the same round; so do the eight
  `set_transform` calls of eight copies.

## Editing well

- **Components.** `add_component` with the type name (`BoxCollider`, `Rigidbody`,
  `AudioSource`, a script's class name). A collider added this way fits the mesh of the
  object it is added to: read it back with `get_component_properties` and you have its
  `m_Center` and `m_Size` in the object's local space, which is also how you learn the
  mesh's extent and where its pivot sits (a center at half the height means the pivot
  is at the base). To set values, read the field names first with
  `get_serialized_fields` (`format: "value"` for just the values): serialized names are
  the ones with the `m_` prefix for Unity's own components (`m_IsTrigger`, `m_Mass`),
  and the plain field names for scripts.
- **Scale and pivot.** A default size goes on the root's transform as `scale`; the
  collider fitted before the scale is expressed in local units and grows with it, so
  check the collider after scaling only if you set its size by hand. A pivot cannot be
  moved by a tool: when the user wants the pivot elsewhere, the mesh goes under a new
  empty child offset by the difference, and the root stays the thing the scene places.
- **Materials.** A pack's material is shared by many pieces: changing it changes them
  all. Make a copy first (`copy_asset` the `.mat` to the variant's folder, named for the
  variant), change the copy with `set_material_properties`, and assign the copy on the
  instance's `MeshRenderer` with `set_component_properties` (`m_Materials` is an array;
  read it first with `get_serialized_fields` to keep the other slots), then apply.
  `get_material_properties` tells you the shader's property names; URP materials use
  `_BaseColor` and `_BaseMap`, the built-in ones `_Color` and `_MainTex`.
- **Children.** Renaming or switching a child on or off inside the asset is what
  `save_prefab_contents` is for (`rename_child` is a path under the root such as
  `Body/Head`); anything else on a child goes through the instance loop, where the
  child is a GameObject like any other (`find_gameobjects` under the instance).
- **Nested prefabs.** A piece inside the prefab that is itself a prefab instance stays
  one: edit its values as overrides and apply, which keeps the link. `unpack_prefab`
  breaks the link forever and is used only when the user asks to break it.
- **Variants and overrides.** On an instance of a variant, `apply_prefab_overrides`
  writes to the variant, never to the base; the variant keeps following the base for
  everything you did not override. That is why the variant is the safe place for a
  change to a pack's piece.
- **Nothing by eye.** Every number you set (a scale, a collider size, a position) is
  computed from values you read; every claim in the report ("the collider covers the
  mesh") is backed by a value you read back.

## Replacing copies in a scene

A new variant does not change the copies of the base already placed; the user who asks
for "the pillars to use the new one" wants them swapped in place. No tool swaps a prefab
instance's asset, so the swap is: read, delete, instantiate, place.

1. List the copies (`search` with `h: <name>` or `find_gameobjects` by `name` or
   `hierarchy_path`, under the root the user names) and read each one's `Transform`
   in one round: `position`, `rotation` and `scale` are local to its parent, and the
   parent is kept.
2. Delete them in one round (`delete_gameobject` each), instantiate the variant once
   per copy in the next (`instantiate_prefab` with the same `name` each had), then
   `set_parent` to the same parent and `set_transform` with the values you read, in
   parallel rounds. Scale: the variant's default scale is already in the asset, so set
   the copy's scale only when the old copy had its own.
3. Verify two or three at random by reading their `Transform` back, and say which.
4. Names, parent and order are what the user sees in the hierarchy: keep the names,
   keep the parent, and say so.

## What you do not touch

- **A pack's base prefab**, unless the user names it and asks for it to change.
- **A shared material**, ever: copy it first.
- **Copies you were not asked about.** Replacing the eight pillars of one ring does
  not touch the pillars elsewhere in the scene; say they exist if you noticed them.
- **Project settings, packages, import settings of models.** Not part of editing a
  prefab; `get_import_settings` may be read to understand a model's scale, nothing set.
- **The `.prefab`, `.mat` or `.unity` file by hand.** `write_text_file` on them corrupts
  them; the typed tools exist for every change you need.
- **Code of any kind**, as said at the top: not to measure, not to change, not to check.

## Before you say it is done

- The asset you changed, by path, and what it now says: the override values you read
  back after applying (a scale, a collider's center and size, a material's name).
- What you did not change: the base, the shared material, the other copies.
- The copies replaced: how many, under which root, with their names and parent kept,
  and which ones you verified by reading them back.
- The scene saved, or not and why. A `_PrefabEdit` root or a `ReviewCamera` you left
  behind is mentioned; better, it is gone.
- Say what you did, not what you intended: a value you could not read, a copy you
  could not place, a lookup that found nothing, are reported as such.
