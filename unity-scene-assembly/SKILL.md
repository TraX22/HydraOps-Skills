---
name: unity-scene-assembly
description: Builds and arranges scenes in the user's Unity project through the Unity connection (Unity's own CLI as an MCP server) - placing and moving the prefabs and models the project already has (asset packs, the user's own prefabs), grouping them under tidy roots, lighting the result and showing it as a capture in the chat. Use when the user asks to build, lay out, populate, decorate or rearrange a level, a scene, a room, a village, a ruin, a camp or any environment in Unity from assets that are already in the project, or to move, rotate, duplicate, remove or tidy objects in an open scene.
metadata:
  author: HydraOps
  version: 1.0.1
  tools: [unity]
---

# Assembling scenes in Unity

A Unity scene is assembled, not modeled: the pieces already exist as prefabs (an asset
pack, the user's own) and your work is to find the right ones, put them where they belong
at the right size and angle, keep the hierarchy readable, light the result and show it.
Everything here goes through the typed tools of the Unity connection; you never write C#
for this kind of work.

## Your Unity connection

The connection is Unity's own MCP server; its tools are `unity_…`. The editor must be
open on the project while you work: if the connection shows no tools, say so and stop
(the user opens the project, or presses Reconnect in Tools → Connections). Do not
describe work as done when you could not do it.

- **Find things in the scene**: `find_gameobjects` (by `name`, `tag`, component `type`
  or exact `hierarchy_path`, combined), `search` (a Unity Search query such as
  `h: Altar` for the hierarchy, `p: Pillar t:Prefab` for assets, with a `limit`),
  `get_selection` (what the user has selected in the editor).
- **Find assets**: `find_assets` with `type: "GameObject"` and a `name` substring,
  scoped with `search_in` to a pack's folder (`Synty/PolygonNatureBiomes`), `limit` small.
- **The whole tree**: `get_scene_hierarchy`. It has no depth limit: on a populated
  scene it returns thousands of nodes and lands in the vault, where you would spend a
  dozen calls paging through it. Use it only on a small scene, or when the user asks for
  a full inventory, and then read the root objects and stop.
- **Create and place**: `instantiate_prefab` (a prefab path from `find_assets`, an
  optional `name`), `create_gameobject` (an empty, or a primitive, with a `parent`),
  `create_gameobjects` (N at once with `positions`, `rotations`, `scales`),
  `set_transform` (local `position`, `rotation` in degrees, `scale`; omitted channels
  stay), `set_parent`, `rename_gameobject`, `set_active`, `delete_gameobject` (undoable).
- **Many steps in one round**: ask for several calls at once (eight
  `instantiate_prefab`, then eight `set_transform`, then eight `set_parent`): they run
  in one round each. `batch` would do the same as one Undo step, but the server's
  current schema types its `params` as text and then rejects text, so it fails; try
  it once at most, and fall back to the parallel calls.
- **Components and materials**: `get_component_properties`, `set_component_properties`,
  `add_component`, `remove_component`, `get_material_properties`,
  `set_material_properties`.
- **Prefabs**: `unpack_prefab`, `create_prefab`, `create_prefab_variant`,
  `apply_prefab_overrides`, `revert_prefab_overrides`. Editing a prefab's own asset
  changes every copy in the project: see "What you do not touch".
- **Scenes**: `list_open_scenes` (which is active, which is dirty), `open_scene`,
  `save_scene`, `save_all`.
- **Captures**: `capture_scene_view`, `capture_game_view`, `screenshot`. See "Showing
  the result".
- **Not for building**: `eval`, `eval_file`, `run_script`, `write_text_file`,
  `create_script`, `menu`. They run or write code in the editor and every call waits
  for the user's approval (the task goes on without the answer). Nothing in placing,
  moving, parenting or framing needs them: `find_gameobjects`,
  `get_component_properties`, `set_transform` and the review camera do all of that.
  The one use left to code is a read-only measurement the typed tools cannot give:
  see "Placing things well".

## Workflow

1. **Look, narrowly.** Which scenes are open and which is active (`list_open_scenes`);
   the roots the user names, found by `find_gameobjects` with a `hierarchy_path` or a
   `name`; the pieces the user mentions, found by `search` with `h:`. If the user has
   something selected, `get_selection` tells you where their attention is. Do not
   fetch the whole hierarchy to orient yourself, not even to inventory one root: a
   root's contents are the families of pieces it holds, and `search` with
   `h: <family name>` (one query per family, small `limit`) or `find_gameobjects`
   with a `name` lists them with their handles, which is all a placement needs.
   Remember that positions you read from a child are local to its parent: add the
   parent's position to get the world position before computing anything.
2. **Plan in parts, against the step budget.** A task gives you a limited number of tool
   rounds; every call spends one. Count the parts (the ground, the main building, the
   props, the vegetation, the light), decide what goes in each round, put the most
   visible part first, and say in one line what you will do before doing it.
3. **Find the assets before placing anything.** `find_assets` by name substring, scoped
   to the pack's folder, a `limit` of 10-20. Read the names you get back: packs name
   their pieces by family (`SM_Env_Rock_Cliff_01`, `_02`, `_03`), and a family placed
   together looks like one landscape, a random mix looks like a junkyard.
4. **Place.** One `instantiate_prefab` for the first piece, check it landed where you
   meant with a capture, then the rest in a `batch`. Positions are local to the parent;
   rotations are Euler degrees; 1 unit = 1 meter. Give every instance a real name
   (`Pillar_North_02`, not `ST_Env_Pillar_01 (3)`).
5. **Keep the hierarchy readable.** Your work goes under a root named for it
   (`03_Temple_Props`), next to the roots that already exist and in their numbering
   style. One root per group: pillars under `Pillars`, trees under `Trees`. Nothing new
   loose at the scene root.
6. **Capture, look, correct.** After each visible part, a capture framed on it (see
   "Showing the result"). Compare it with what the user asked and with the picture you
   had in mind; fix what is off before moving on. Expect two or three correction rounds;
   that is normal.
7. **Save and report.** `save_scene` when the user asked for a change to stay, and say
   so; if you did not save, say that the scene is dirty and why. The report is in
   "Before you say it is done".

### Your step budget

- Open this skill once; do not reopen it in the same conversation.
- About 2 rounds to look, 1 to find assets, 6-8 to build (batches count as one each),
  2-3 captures, 1 spare for a fix. If the request does not fit, say so in the plan,
  finish a coherent part well and end with the exact list of what is left.
- When a capture and a lookup do not depend on each other, ask for both in one round.

## Placing things well

- **On the ground.** Read the ground's height first (the terrain or floor object's
  transform and, if it is a mesh, its renderer bounds from `get_component_properties`
  on the `MeshRenderer`); put the bottom of a piece at that height, not its pivot
  somewhere above it. A pack's prefabs usually have their pivot at the base; a captured
  gap or a sunk base tells you when one does not.
- **Scale 1, unless the user says otherwise.** Pack pieces are built to scale; a tree
  scaled to 3 to "fill space" looks wrong next to everything else. Vary rotation around
  Y (0-360) and a little scale (0.9-1.1) between repeated pieces instead.
- **Measure what you surround before choosing where things go.** A ring "6 m from the
  center" lands on a building's own floor when the floor is 10 m wide. No typed tool
  returns an object's bounds (a renderer's serialized properties do not carry them), so
  measure the way the scene is built: a structure made of pieces is as wide as the
  spread of its pieces. `search` with `h: <piece name>` (or `find_gameobjects` by
  `name`) lists the floor pieces, their `Transform` properties give the positions,
  the farthest ones from the center plus one piece's size (its scale times the pack's
  module, usually 1-2 m) is the edge. Put what you place outside that with a margin
  (`radius = half extent + 2-3 m`). If the user's number puts pieces inside something,
  say so and use the measured value, or ask.
- **Code is the last resort for measuring, not the first.** When the typed tools
  really cannot give a number you need (combined bounds of hundreds of pieces, the
  ground height under a point), a read-only `eval` is acceptable: it waits for the
  user's approval, so say in one line what it measures and that it changes nothing,
  and go on with the rest of the work meanwhile. Never use code to create, move or
  delete anything.
- **Rows, rings and grids are computed, not eyeballed.** For a ring of 8 pillars at
  radius `r` around `(cx, y, cz)`: angle `a = i*45`, position
  `(cx + r*sin a, y, cz + r*cos a)`, rotation `(0, a + 180, 0)` so each faces the
  center. Compute every number before the first call.
- **Density.** Vegetation and props cluster: a few dense patches and open space between
  them read as a place; an even sprinkle reads as noise. Keep paths and the front of
  the main building clear.
- **Collisions and overlaps.** Two pieces interpenetrating show as z-fighting and
  broken silhouettes in the capture; move one.
- **Light.** A scene usually has a `Directional Light` already: leave it, or set its
  rotation for the mood the user asked (a low sun of `(15, -30, 0)` for evening). Add
  lights only when asked; baking is slow and is never part of assembling.

## Showing the result

You cannot see the editor. A capture is the only evidence of what you did, and the
user sees it in the chat as a card when the tool returns it inline.

- **The Scene View is not where you left it.** The editor's Scene View camera points
  wherever the user last looked, often at nothing; `capture_scene_view` returns that.
  Do not use `menu` ("Edit/Frame Selected") to aim it: that is a code command and waits
  for approval.
- **Use a review camera.** Create an empty `ReviewCamera` under your root with a
  `Camera` component (`create_gameobject` + `add_component`), aim it with
  `set_transform`, and capture with `capture_game_view` with `source: "camera"` and
  `camera: "ReviewCamera"`. Move it between captures; delete it before saving, or
  disable it (`set_active: false`) and say it is there if the user may want it.
- **Aim it by arithmetic, not by feel.** A camera looks along its +Z. To look from
  position `C` at a target `T` (the center of what you placed, at about its mid
  height): `dx = T.x - C.x`, `dy = T.y - C.y`, `dz = T.z - C.z`,
  `yaw = atan2(dx, dz)` in degrees, `pitch = -atan2(dy, sqrt(dx² + dz²))` in degrees;
  rotation is `[pitch, yaw, 0]`. Pick `C` at a distance of about 1.5 times the width
  of what you want in the frame, and about half that distance above the target: for a
  30 m wide ring around a point at `(0, 1, 30)`, `C = (0, 22, -15)` gives `dz = 45`,
  `dy = -21`, `yaw = 0`, `pitch = 25`. A camera too close shows one wall; a camera
  too low shows the sky. Write the numbers you used in the report.
- **Inline, not saved.** Leave `save_path` out: the image comes back inline, you see it
  (when your model sees images) and the chat shows it as a card. If you must save one,
  save it under a folder at the project root such as `Captures/`, never under
  `Assets/`: Unity imports everything in `Assets/` as a texture asset.
- **Re-aim before every capture.** The camera stays where the last capture left it,
  which is never where the new work is. Before each capture, compute the position and
  rotation for the center of what you just placed and apply them with `set_transform`,
  in the same round as the capture if you like. A `ReviewCamera` left disabled by an
  earlier task does not render: `set_active` it on first, and pass `source: "camera"`
  with its name, or the capture silently comes from the main camera. A capture that does not show what you
  placed is not evidence of anything: move the camera and capture again, once.
- **One capture per visible part, plus one of the whole.** A wide capture of the whole
  scene and a closer one of the part you just placed tell the user more than five
  similar ones.
- If a capture comes back marked as not visible to you, your model cannot see images:
  verify with numbers instead (positions, counts, bounds) and say that you could not look.

## What you do not touch

- **Nothing you did not create**, unless the user asked: no deleting, moving or renaming
  the user's objects to make room; no "clear the scene". If something is in the way,
  work beside it or ask.
- **Prefab assets.** Changing a prefab's own asset (`apply_prefab_overrides`, editing
  the prefab file) changes every copy in the project. Your changes stay on the instance
  in the scene. When the user wants a changed piece as a reusable thing, make a
  `create_prefab_variant` or a new prefab in the user's own folder (`Assets/_Project/…`),
  never overwrite the pack's.
- **Project settings, packages, build settings.** Not part of assembling a scene.
- **The scene file by hand.** `write_text_file` on a `.unity` or `.prefab` file
  corrupts it; the typed tools exist for every change you need.

## Before you say it is done

- The scene is saved, or you say it is not and why.
- The report says: the root you worked under, what you placed (counts by family, e.g.
  "8 pillars, 2 cliff pieces, 14 birches"), the names of the main objects, what differs
  from the request and why, and what is left if you ran out of steps. The last capture is
  the proof; describe only what it shows.
- A `ReviewCamera` you left in the scene is mentioned.
- Say what you did, not what you intended: a capture you could not take, a part you
  could not place, a lookup that found nothing, are reported as such.
