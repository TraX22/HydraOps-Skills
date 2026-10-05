# ComfyUI

The official local MCP server from [Comfy Org](https://docs.comfy.org/agent-tools/local). It drives a ComfyUI that is already running: it validates a workflow, runs it and follows the job, for images, video, audio and 3D models generated on your own computer.

- Server: [`comfy-mcp`](https://github.com/Comfy-Org/comfy-mcp) `0.10.0` from PyPI, started with `uvx` together with `comfy-cli` `1.22.0` (the server is a thin wrapper over it). The first start takes about a minute.
- It reaches ComfyUI through its **address** (`COMFYUI_URL`, `http://127.0.0.1:8188` by default), the same one the browser uses. It works with the portable build, the desktop app or a manual install, on this computer or on another one in your network; nothing needs to know the install folder to run workflows.
- Running your own workflows is free and needs no Comfy account. The tools named `partner_…` use hosted models and spend Comfy credits.
- Needs **HydraOps 0.1.52 or newer**. A tool call of this connection may take up to 15 minutes (`toolTimeoutSeconds`); older versions cut every call at 30 seconds, which a generation exceeds.
- `comfy-mcp` is licensed AGPL-3.0-or-later (or commercially, from Comfy Org). HydraOps starts it as a separate program and ships none of its code.

## Giving it to an agent

HydraOps has a tool of its own that works next to this connection, `comfy_workflows`: it lists the workflows **you saved in ComfyUI**, prepares one to run (a copy, with the files you attached uploaded and placed in its inputs) and brings back what the finished job saved. With it, an agent needs three tools of this connection, not all 39. List them one by one in the agent's tools:

```
comfy_workflows
comfyui_validate_workflow
comfyui_run_workflow
comfyui_job
```

Then a request such as "make a 3D model of this object" with an image attached is enough: the agent picks your saved workflow, runs it and hands you the file.

Optional additions:

- `comfyui_list_workflow_slots` and `comfyui_set_workflow_slot`, to change a value of the workflow before running it (a lighter model, another seed, a prompt).
- `comfyui_search_templates`, `comfyui_get_template` and `comfyui_fetch_template`, to use a template from Comfy's online gallery when you have no saved workflow for the job. See the next section for what that implies.

## What the tools do, and why each got its class

- **Reading your own install** (`server_info`, `system_stats`, `nodes`, `search_models`, `validate_workflow`, `list_workflow_slots`, `list_workflow_notes`, `job`, `get_logs`, `which`, `discover`, `node_dependencies`, `workflow_deps`, `auth_status`, `download`) is `neutral`: it changes nothing and what it returns comes from your computer.
- **The template gallery** (`search_templates`, `get_template`) is `read`: its content is downloaded from Comfy Org's repository on the internet, so it marks the task as having read outside content. `fetch_template` and `run_template` read it and also write or run, so they are `both`. After an agent uses one of these, every tool that acts in the same task waits for your approval. That is deliberate; an agent working only with your saved workflows never triggers it.
- **Partner models** (`list_partner_models`, `partner_model_schema`) are `read` for the same reason; `partner_generate` is `both` and spends credits.
- **Running and files** (`run_workflow`, `generate_image`, `upload_file`, `set_workflow_slot`, `vary_workflow`, `fetch_outputs`, `emit_partner_workflow`, `free_memory`, `project`, `auth_login`) are `acts`: they write files, use the GPU or change state.
- **Starting and stopping ComfyUI** (`launch_comfyui`, `stop_comfyui`, `restart_comfyui`) are `acts`. They only work on an install that `comfy-cli` manages.
- **Changing the install** (`update_comfyui`, `switch_comfyui_version`, `install_node`, `download_model`) is `both`: they download from the internet and write into your ComfyUI, and two of them run third-party code. Give these to an agent only on purpose.

## Long jobs

Submit a long generation with `run_workflow` and `wait` set to `false`, then wait for it with `job` (`action: "wait"`). A wait that times out is not a failure: the job keeps running in ComfyUI, and the agent waits again.

## Models that are not installed

`validate_workflow` and `get_template` say exactly which model file or node a workflow needs and your install lacks. The agent cannot fix that by itself with the tools recommended above: install what is missing from ComfyUI (opening the workflow or template there offers the downloads) and ask again.
