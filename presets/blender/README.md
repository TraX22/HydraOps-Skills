# Blender

Lets an agent work inside your Blender: read the scene, create and edit objects, materials and lights by running Python (`bpy`), take viewport screenshots and export.

- Server: [MCP for Blender](https://github.com/ahujasid/blender-mcp) `2.1.3`, started with `uvx`.
- Needs Blender 3.0+ open, with the **MCP for Blender** add-on enabled. Install the add-on once with `uvx mcp-for-blender==2.1.3 install-addon`, then enable it in Blender's Preferences → Add-ons. The add-on starts its own server (port 9876) when Blender opens.
- If Blender was closed when HydraOps tried to connect, nothing needs restarting: the connection is retried on the next task.

## What the tools do

- **Reading your scene** (`get_scene_info`, `get_object_info`, `get_viewport_screenshot`, the status and lookup tools) neither reads outside content nor changes anything: they run freely.
- **Searching asset libraries** (Poly Haven, Sketchfab, Poly Pizza) brings in third-party content.
- **`execute_blender_code`**, `set_texture` and `export_scene` change your scene or your disk.
- **Downloading or generating assets** both reads third-party content and changes the scene, and the generators (Hyper3D, Hunyuan3D, Tripo) may cost money on those services.

After a task has read outside content, the tools that act wait for your approval.
