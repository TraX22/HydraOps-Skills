---
name: comfyui-image-to-3d
description: Turns an image into a 3D model (GLB) with the user's local ComfyUI - choosing the right saved workflow for the image (a single view or a sheet of several views), picking the generator when a workflow offers two, asking for a lighter model when it is meant for a game, and reporting the result honestly. Use when the user attaches or names an image and asks for a 3D model, mesh or GLB of what it shows, or asks to reconstruct an object in 3D from a picture. Needs the comfy_workflows tool and the ComfyUI connection.
metadata:
  author: HydraOps
  version: 1.0.0
  tools: [comfy_workflows, comfyui]
---

# Image to 3D model with ComfyUI

ComfyUI reconstructs a mesh from an image with a local model (Trellis.2, Pixal3D,
Hunyuan3D…). You do not model anything: you choose the workflow, run it and deliver the
file. It runs on the user's GPU, costs nothing and takes from a few minutes to a quarter
of an hour.

The mechanics are already in your tools: `comfy_workflows` lists the workflows the user
saved, prepares one with the attached image and collects the result, and tells you each
next step; the ComfyUI connection validates, runs and waits. Follow what those tools
return. This skill is about the choices they leave to you.

If you have neither `comfy_workflows` nor the ComfyUI connection's tools, stop and say so:
the user installs the ComfyUI connection (Tools → Connections), gives this agent
`comfy_workflows`, `comfyui_validate_workflow`, `comfyui_run_workflow` and `comfyui_job`,
and keeps ComfyUI open.

## Which workflow

`comfy_workflows` with `action: "list"` shows what the user saved. Choose by what the
image is:

| The image is | Use a workflow for |
|---|---|
| One picture of one object (a photo, a render, a concept) | image to 3D model, single image |
| A sheet with several views of the same object (front, side, back; a character turnaround) | multi-view to 3D model |
| Several separate attached images of the same object | multi-view, if the workflow reads several files; otherwise ask which image to use |

- A workflow the user names wins over your choice.
- If two saved workflows fit and nothing tells them apart, ask; do not run both.
- If none fits, say so and name what the user has. Only then offer a template from
  Comfy's online gallery (`comfyui_search_templates`, if you have it), and tell the user
  beforehand that the gallery is content from the internet, so the app will ask them to
  approve each step after you read it.

## What to prepare

- Pass the attached image in `files`, with the name the conversation shows for it.
- One object per run. If the picture shows several objects, ask which one, or say that
  the model will contain the whole scene as a single piece.
- A picture with a plain background and the whole object in frame gives the best model.
  If the object is cut off by the edge or hidden behind something, say so before
  running: the generator invents what it cannot see.

## Choices inside a workflow

`comfy_workflows` quotes the notes the workflow's author left. Read them: they say what
the workflow's switches do.

- **Two generators behind a switch** (a workflow that can use either of two models):
  leave it as the user saved it. Change it only when they name the generator they want,
  with `comfyui_list_workflow_slots` to find the switch and `comfyui_set_workflow_slot`
  to set it, and say in the report which one ran.
- **A lighter model.** Reconstruction gives hundreds of thousands of triangles. When the
  user says it is for a game, the web or a phone, or asks for a light model, lower the
  face count BEFORE running, in two calls on the prepared file:
  1. `comfyui_list_workflow_slots`, and in its answer find the slot whose name is
     `target_face_count` (it belongs to a `DecimateMesh` node); copy its `address`.
  2. `comfyui_set_workflow_slot` with `stdout: false` and
     `[{"address": "<that address>", "value": 50000}]` for a prop in a game (150000 for
     a hero object the camera gets close to).
  Then validate and run as usual, and say in the report what you set. If the workflow
  has no such slot, or you lack those two tools, run it as it is and say plainly that
  the model is heavy for a game and by how much.
- **Resolution and sampler settings**: leave them. The workflow adapts to the image.

## When it does not run

- **A model or node is missing**: name the files the validation reports and stop. The
  user installs them from ComfyUI (opening the workflow there offers the downloads).
  Do not switch to another workflow to get around it.
- **The job fails**: `comfy_workflows` with `action: "collect"` reports the node and the
  reason. Out of memory is the common one: say so, and offer to try again with a lower
  resolution or with the other generator if the workflow has one. Do not retry by
  yourself more than once.
- **A wait times out**: the job is still running. Wait again; never start it twice.

## The report

- The file `collect` returned, its size and its triangle count, exactly as given.
- Which workflow ran, and anything you changed in it.
- You have not seen the model: say that it was generated, not how it looks.
- One line on what to expect: the sides the picture does not show are invented by the
  generator, and the result is a single mesh with baked textures, not separate parts.
- If the user wants it cleaned up, reduced further or exported for an engine, that is
  work for Blender (the `blender-game-export` skill).
