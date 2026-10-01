# BlenderLab

The official MCP server from [Blender Lab](https://www.blender.org/lab/mcp-server/), maintained by the Blender Foundation. It is deliberately small: it runs Python in your Blender, summarises the scene and the blend file, searches the Python API reference and the user manual that ship with it, captures the window and renders.

- Server: [`blender_mcp`](https://projects.blender.org/lab/blender_mcp) `v1.0.3`, started with `uvx` straight from Blender's repository at that release's commit (it is not published on PyPI; the `blender-mcp` package there is a different project). Needs `git`. The first start takes about a minute.
- Needs **Blender 5.1+** with the official **MCP** add-on (`https://projects.blender.org/lab/blender_mcp/releases/download/v1.0.3/mcp-1.0.3.zip`) installed, enabled and its server started, and *Allow Online Access* turned on in Blender's System preferences.
- Blender Lab marks it as experimental, and says plainly that it executes model-written code without real guards.

## This one or the Blender connection?

| | BlenderLab (this) | Blender (`mcp-for-blender`) |
|---|---|---|
| Maintained by | Blender Foundation | Community |
| Blender | 5.1+ | 3.0+ |
| Tools | 26: code, scene and file summaries, API and manual search, captures, renders | 36: code, scene info, captures, asset libraries, 3D generators |
| Bundled documentation | Python API reference and user manual, searchable offline | API lookup |
| Asset downloads, AI generators | No | Yes |

Both add-ons listen on port **9876** and speak different protocols: enable one of them, or move one to another port (the add-on's preferences, and `BLENDER_MCP_PORT` in this connection).

## What the tools do

- **Summaries of the open file and scene, documentation search, captures** neither read third-party content nor change anything: they run freely.
- **The `…_for_cli` summaries** open a blend file you name in a background Blender: what is in that file may come from someone else, so they mark the task as having read outside content.
- **`execute_blender_code`** (and its `_for_cli` variant), the **renders** (they write a file) and the **`jump_to_…`** tools (they change what your Blender window shows, and can change the selection) act: once the task has read outside content they wait for your approval.

The server declares `readOnlyHint` on `render_viewport_to_path`; it is classified as acting here because it writes an image to disk and can take minutes.
