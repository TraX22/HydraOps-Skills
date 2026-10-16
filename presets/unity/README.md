# Unity

Unity's own MCP server: the [Unity CLI](https://docs.unity.com/en-us/unity-cli/use-unity-cli) started as `unity mcp`, talking to a Unity 6 editor that has the **Unity Pipeline** package (`com.unity.pipeline`) in its project. 160 tools: scenes, GameObjects, components, prefabs, materials, animation, timeline, lighting and NavMesh bakes, packages, project settings, play mode, tests, builds, console, captures of the Scene and Game views, and C# run inside the editor.

- Server: the `unity` program itself (no `uvx`/`npx`: it is a native binary Unity publishes). Unity Hub installs it; otherwise `winget install Unity.CLI`, `brew install --cask unity-cli` or Unity's install script, see the docs. It must be on the `PATH` (`unity --version` answers).
- **It updates itself.** Unlike the other connections, this one cannot pin the server's version: the CLI is a beta that upgrades on its own (`unity self-update`), and the tools live in the Pipeline package of each project. This preset was classified with CLI `1.0.0-beta.12` and Pipeline `0.8.0-exp.1`; a newer version that publishes a tool not listed here shows it as *unclassified* (worst case) until the preset is updated.
- The editor must be **open on the project** while the agent works. The server starts fine without it but publishes no tools; HydraOps retries a connection with no tools and picks them up once the editor is open.
- Needs **HydraOps 0.1.63 or newer**: the `unity` launcher, the `{{UNITY_PROJECT}}` placeholder, the `approve` class and the project folder as a source of captures are new there.
- Licensed by Unity under its own terms; HydraOps starts it as a separate program and ships none of its code.

## The project (`UNITY_PROJECT`)

The server is started as `unity mcp --project-path <UNITY_PROJECT>`. The value comes from the connection's environment variable `UNITY_PROJECT` (Add-ons → MCP servers, after installing):

- **Empty** (the default): the `--project-path` pair is left out and the server attaches to whichever editor with the Pipeline package is open. Enough when you work on one project at a time.
- **A project folder** (`D:\Games\MyGame`, `/home/me/MyGame`): the server finds that project's editor, and HydraOps treats the folder as a place where this connection's tools leave their output, so a capture saved inside it reaches the chat (see below).

Updating the connection keeps the value.

## Giving it to an agent

One line in the agent's tools gives it the whole connection:

```
unity
```

A scene-building agent does not need code execution. To leave out the nine tools that run or write code, list what it needs by name instead (`unity_create_gameobject`, `unity_set_transform`, `unity_capture_scene_view`, …).

## What the tools do, and why each got its class

- **Reading the project and the editor** is `neutral`: every `get_…`, `list_…`, `find_…`, `…_status`, `console`, `console_status`, `search`, `read_text_file` (a file under the project's authoring root), `report_evals`, `log` (one line into the console) and `package_list` (what the project has). What they return is your own project.
- **Captures** (`capture_scene_view`, `capture_game_view`, `screenshot`) are `neutral` too: a picture of your editor, nothing changed. Without `save_path`, the first two return the image to the agent; `screenshot` always saves a file (`<project>/Temp/pipeline-screenshots/` by default).
- **Building and editing** is `acts`: creating, placing, renaming, deleting and reparenting objects; components, materials, prefabs, animation and timeline edits; opening, saving and creating scenes; assets (`create_asset`, `import_asset`, `copy_asset`, `move_asset`, `delete_asset`, `create_folder`); every `set_…` of project settings and of the authoring root; bakes and their cancellation; play mode, focus, autotick, recompile, tests, builds, waits, `quit`; `batch` (several of these in one transactional request; it refuses the code tools) and `package_remove` / `package_resolve`. These wait for your approval only after the task has read outside content.
- **The registry** is content from the internet: `package_search` is `read` (it marks the task), and `package_add` is `both`: it downloads a package from the registry, a git URL or a local path and the package's code runs in the editor, so it waits for your approval.
- **Code in the editor is `approve`**: every call waits for your approval, whether or not the task read outside content and whatever the security mode. `eval` and `eval_file` compile and run arbitrary C# in the editor process; `run_script` compiles a project file and runs an entry point; the three `reload_file…` apply code edits in place; `write_text_file` and `create_script` write files that the editor compiles next; `menu` executes any Editor menu item by path (Build, Quit, Delete…). The editor runs with your user account: C# in it reads and writes any file you can, starts programs and reaches the network. The approval card shows the code before it runs.

## Captures in the chat

A capture returned inline (`capture_scene_view` without `save_path`) is handed to the agent's model when it sees images, and the agent describes what it saw. A capture saved as a file is brought under the reply when it lands where this connection leaves its output: the project folder named in `UNITY_PROJECT`. With `UNITY_PROJECT` empty, a file saved in the project stays there and the reply only names its path.

## When the editor is closed

`unity mcp` starts and answers with no tools. The connection shows *Connected · 0 tools*; open the project in the editor and HydraOps reconnects within a minute (or press **Reconnect** in Tools → Connections). The same happens when you close and reopen the editor during a task: the next call fails with "not connected", the server is restarted, and the agent tries again.

## Known limits

- One editor per connection: with several projects open and `UNITY_PROJECT` empty, the CLI picks one. Set the folder.
- `wait_for` with a synchronous wait holds the server's queue; a wait longer than the connection's tool timeout (5 minutes) is cut off, the editor keeps waiting.
