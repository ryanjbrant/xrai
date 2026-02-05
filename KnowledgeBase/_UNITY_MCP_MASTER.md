# Unity MCP Quick Reference

**Tags**: `unity` `mcp` `token-optimization` `debugging`
**Updated**: 2026-01-21
**Purpose**: Token-efficient MCP patterns for rapid Unity development

---

## Token Optimization Matrix

| Default | Optimized | Savings |
|---------|-----------|---------|
| Individual calls | `batch_execute` | **10-100x** |
| `include_properties=true` | `include_properties=false` | **5-10x** |
| `generate_preview=true` | `generate_preview=false` | **10x+** (no base64) |
| Full console | `types=["error"]` | **3-5x** |
| `include_stacktrace=true` | `include_stacktrace=false` | **2-3x** |
| Polling tests | `wait_timeout=60` | **10x** fewer calls |
| Full hierarchy | `page_size=50, max_depth=3` | **5x** |

---

## Most Used Tools (By Frequency)

### 1. Console (Debugging)
```javascript
// OPTIMAL: Errors only, no stacktrace
read_console({
  types: ["error"],
  count: 5,
  include_stacktrace: false
})

// When debugging: Include stacktrace
read_console({
  types: ["error", "warning"],
  count: 10,
  include_stacktrace: true
})
```

### 2. Find GameObjects
```javascript
// Returns IDs only (lightweight)
find_gameobjects({
  search_term: "Player",
  search_method: "by_name",  // by_tag, by_component, by_path, by_id
  page_size: 10
})

// Then fetch specific data
// Use resource: mcpforunity://scene/gameobject/{instance_id}
```

### 3. Batch Execute (CRITICAL)
```javascript
// 10-100x faster than individual calls
batch_execute({
  commands: [
    {tool: "manage_gameobject", params: {action: "create", name: "Cube1"}},
    {tool: "manage_gameobject", params: {action: "create", name: "Cube2"}},
    {tool: "manage_components", params: {action: "add", target: "Cube1", component_type: "Rigidbody"}},
    {tool: "manage_components", params: {action: "add", target: "Cube2", component_type: "Rigidbody"}}
  ],
  parallel: true  // For read-only operations
})
```

### 4. Scene Hierarchy
```javascript
// OPTIMAL: Paginated, limited depth
manage_scene({
  action: "get_hierarchy",
  page_size: 50,
  max_depth: 3,
  max_nodes: 100
})
// Follow cursor for more
```

### 5. Asset Search
```javascript
// OPTIMAL: No previews, paginated
manage_asset({
  action: "search",
  path: "Assets/VFX",
  search_pattern: "*.vfx",
  page_size: 25,
  generate_preview: false  // CRITICAL: Prevents huge base64
})
```

### 6. Script Validation
```javascript
// Check before compile
validate_script({
  uri: "Assets/Scripts/MyScript.cs",
  level: "standard",
  include_diagnostics: true
})
```

### 7. Tests (Async Pattern)
```javascript
// Start test (returns immediately)
run_tests({mode: "EditMode"})  // → job_id

// Wait for completion (reduces polling)
get_test_job({
  job_id: "xxx",
  wait_timeout: 60,  // Waits up to 60s
  include_failed_tests: true,
  include_details: false
})
```

### 8. Refresh Unity
```javascript
// OPTIMAL: Only if dirty, specific scope
refresh_unity({
  mode: "if_dirty",    // Not "force"
  scope: "scripts",    // Not "all"
  wait_for_ready: true
})
```

---

## Gemini Specific Optimization Patterns

*   **Scene Inspection**: `find_gameobjects` (ID-only) → `manage_gameobject(target=ID, search_method="by_id")`.
*   **Rapid Debug Loop**: Edit → `refresh_unity(mode="if_dirty")` → `read_console(types=["error"], count=5)`.
*   **VFX Batching**: Group `manage_vfx` calls in `batch_execute` for simultaneous property updates.
*   **Rider Priority**: Use `search_in_files_by_text` (JetBrains MCP) over `grep` for code search when Rider is active.
*   **Token Efficiency**: Use `--max-count 10` for shell searches to prevent context flooding.

---

## Resources vs Tools

**Use Resources (Read-Only)**:
| Resource | Purpose |
|----------|---------|
| `editor_state` | Check readiness, compilation status |
| `project_info` | Unity version, platform, paths |
| `project_tags` | Available tags |
| `project_layers` | Available layers |
| `editor_selection` | Currently selected objects |
| `get_tests` | Available tests |
| `menu_items` | All menu items |
| `gameobject/{id}` | Full GameObject data |
| `gameobject/{id}/components` | Component data |

**Use Tools (Mutations)**:
| Tool | Purpose |
|------|---------|
| `manage_gameobject` | Create/modify/delete GameObjects |
| `manage_components` | Add/remove/modify components |
| `manage_scene` | Load/save/create scenes |
| `manage_editor` | Play/pause/stop, tags, layers |
| `manage_vfx` | VFX Graph, ParticleSystem, Line/Trail |
| `manage_material` | Create/modify materials |
| `manage_asset` | Asset CRUD operations |
| `script_apply_edits` | Structured C# edits |

---

## VFX Management

### Action Prefixes
| Prefix | Component Required |
|--------|-------------------|
| `particle_*` | ParticleSystem |
| `vfx_*` | VisualEffect (VFX Graph) |
| `line_*` | LineRenderer |
| `trail_*` | TrailRenderer |

### Common VFX Operations
```javascript
// Set VFX Graph parameter
manage_vfx({
  action: "vfx_set_float",
  target: "HologramVFX",
  parameter: "IntensityMultiplier",
  value: 2.5
})

// Send VFX event with attributes
manage_vfx({
  action: "vfx_send_event",
  target: "ParticleEmitter",
  event_name: "OnSpawn",
  position: [0, 1, 0],
  color: [1, 0, 0, 1],
  size: 0.5
})

// Control playback
manage_vfx({action: "vfx_play", target: "MyVFX"})
manage_vfx({action: "vfx_stop", target: "MyVFX"})
```

---

## Rapid Debug Loop (MCP-Powered)

```
1. read_console(types=["error"], count=5)
   ↓
2. find_in_file(uri, pattern)  OR  get_file_text_by_path()
   ↓
3. Edit(file, old, new)  OR  script_apply_edits()
   ↓
4. refresh_unity(mode="if_dirty", scope="scripts")
   ↓
5. read_console(types=["error"], count=5)  → Verify fix
   ↓
6. run_tests() + get_test_job(wait_timeout=60)  → Regression check
```

**Time Savings**: 30-60% faster than manual debugging

---

## Anti-Patterns (Never Do)

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| `generate_preview=true` | Huge base64 blobs | Always false |
| Individual create calls | 100x slower | Use batch_execute |
| `include_stacktrace=true` default | Bloated responses | Only when debugging |
| Polling test status | Many round trips | Use wait_timeout |
| Full hierarchy fetch | Token explosion | Use find_gameobjects |
| `include_properties=true` first | Unnecessary data | Metadata first |
| `refresh_unity(force, all)` | Slow, wasteful | if_dirty, scripts |

---

## Script Editing Patterns

### Prefer Structured Edits
```javascript
// BETTER: Structured method replacement
script_apply_edits({
  name: "VFXARBinder",
  path: "Assets/Scripts/Bridges",
  edits: [{
    op: "replace_method",
    className: "VFXARBinder",
    methodName: "UpdateTexture",
    replacement: "public void UpdateTexture() { /* new impl */ }"
  }]
})

// ALSO GOOD: Anchor-based insert
script_apply_edits({
  name: "VFXARBinder",
  path: "Assets/Scripts/Bridges",
  edits: [{
    op: "anchor_insert",
    anchor: "// INSERT_POINT",
    text: "\n    public void NewMethod() { }\n"
  }]
})
```

### Use apply_text_edits for Precise Edits
```javascript
// When you need exact character positions
apply_text_edits({
  uri: "Assets/Scripts/MyScript.cs",
  edits: [{
    startLine: 45,
    startCol: 1,
    endLine: 50,
    endCol: 1,
    newText: "// Replaced block\n"
  }]
})
```

---

## Editor State Check (Before Operations)

```javascript
// Quick readiness check
// Resource: mcpforunity://editor/state

// Key fields:
{
  "advice": {
    "ready_for_tools": true,  // Safe to proceed
    "blocking_reasons": [],
    "recommended_next_action": "none"
  },
  "compilation": {
    "is_compiling": false,
    "is_domain_reload_pending": false
  }
}
```

**Always check `advice.ready_for_tools` before batch operations.**

---

## Integration with KB

| MCP Result | Log To |
|------------|--------|
| New error pattern | `_QUICK_FIX.md` |
| Useful VFX pattern | `_VFX25_HOLOGRAM_PORTAL_PATTERNS.md` |
| Performance insight | `LEARNING_LOG.md` |
| Debug workflow | `_AI_CODING_BEST_PRACTICES.md` |

---

---

## Custom MCP Tools (Extend Your Workflow)

### When to Create Custom Tools
- Repetitive Unity operations (scene setup, prefab creation)
- Project-specific automation (MetavidoVFX patterns)
- Domain logic the AI should invoke (hologram config)

### Implementation Patterns (3 Frameworks)

| Framework | Attribute | Location |
|-----------|-----------|----------|
| CoplayDev | `[McpForUnityTool]` | `Editor/` folder |
| IvanMurzak | `[McpPluginTool]` | Any folder |
| CoderGamester | `McpToolBase` class | `Editor/` folder |

### Quick Example (CoplayDev Pattern)
```csharp
// Assets/Editor/MyCustomTool.cs
[McpForUnityTool("setup_hologram_scene")]
public static class SetupHologramScene
{
    public class Parameters
    {
        [ToolParameter("VFX prefab path")]
        public string vfxPath { get; set; }
    }

    public static object HandleCommand(JObject @params)
    {
        var p = @params.ToObject<Parameters>();

        // Use Undo for editor operations
        Undo.RecordObject(target, "Setup Hologram");

        // Your automation logic
        return new SuccessResponse("Scene ready", new { created = true });
    }
}
```

### Best Practices (From GitHub Repos)
```
1. Undo.RecordObject() before modifying scene/assets
2. Undo.RegisterCreatedObjectUndo() for new objects
3. Single Responsibility - one tool, one task
4. MainThread.Instance.Run() for Unity API in async
5. Return SuccessResponse/ErrorResponse (not exceptions)
6. [ToolParameter] descriptions help AI understand params
```

### Long-Running Operations (Polled)
```csharp
[McpForUnityTool("build_project", RequiresPolling = true, PollAction = "status")]
// Return PendingResponse, AI polls until complete
// Use McpJobStateStore for state persistence across domain reloads
```

---

## Runtime AI (IvanMurzak Unique Feature)

**Only IvanMurzak/Unity-MCP supports this:**
```
LLM → MCP Server → Unity Runtime (not just Editor)
```

### Use Cases
- In-game AI debugging
- Dynamic NPC behavior
- Player-AI interaction in shipped games
- Live code compilation without restart

### Pattern
```csharp
[McpPluginToolType]
public class GameAI
{
    [McpPluginTool("npc_decide_action")]
    public static string DecideAction(string gameState)
    {
        // Called by LLM at runtime
        return MainThread.Instance.Run(() => {
            // Access Unity API on main thread
            return "move_forward";
        });
    }
}
```

---

## Roslyn Validation (Strict C# Checking)

**Enable in Project Settings:**
1. Install NuGetForUnity
2. Add Microsoft.CodeAnalysis v4.14.0
3. Add `USE_ROSLYN` to Scripting Define Symbols
4. Restart Unity

**Benefits:**
- Catches undefined namespaces before compile
- Type checking before domain reload
- Faster error detection

**MCP Usage:**
```javascript
validate_script({
  uri: "Assets/Scripts/MyScript.cs",
  level: "standard",  // Uses Roslyn if enabled
  include_diagnostics: true
})
```

---

## MCP Debugging

### Inspector Tool
```bash
npx @modelcontextprotocol/inspector node Server/build/index.js
```
Real-time MCP traffic debugging.

### Check Editor State First
```javascript
// Before batch operations, verify readiness
// Resource: mcpforunity://editor/state
// Check: advice.ready_for_tools === true
```

---

## See Also

- `GLOBALGLOBAL_RULES.md` - MCP optimization section
- `_AI_CODING_BEST_PRACTICES.md` - Research-backed workflows
- `_QUICK_FIX.md` - Error → Fix lookup
- `_VFX25_HOLOGRAM_PORTAL_PATTERNS.md` - VFX patterns

## Sources

- [CoplayDev/unity-mcp](https://github.com/CoplayDev/unity-mcp) - 24 tools, batch_execute, Roslyn
- [CoderGamester/mcp-unity](https://github.com/CoderGamester/mcp-unity) - 31 tools, multi-client
- [IvanMurzak/Unity-MCP](https://github.com/IvanMurzak/Unity-MCP) - 50+ tools, runtime AI
- [notargs/UnityNaturalMCP](https://github.com/notargs/UnityNaturalMCP) - Natural UX
- [mika-f/uMCP](https://github.com/mika-f/umcp) - Security-focused
# Unity MCP Development, Debugging & Planning Hooks

## Overview

This document provides comprehensive hooks for AI-assisted Unity development using Model Context Protocol (MCP) servers. These enable Claude Code and other AI assistants to interact directly with Unity Editor for debugging, planning, and accelerated development.

---

## Unity MCP Server Implementations

### 1. CoplayDev/unity-mcp (Recommended)
**URL**: https://github.com/CoplayDev/unity-mcp

**Architecture**: Python MCP Server + Unity Bridge (HTTP-first)

**Installation**:
```bash
# Via Unity Package Manager Git URL
https://github.com/CoplayDev/unity-mcp.git?path=/MCPForUnity

# Via OpenUPM
openupm add com.coplaydev.unity-mcp
```

**Claude Code Configuration**:
```bash
# macOS
claude mcp add --scope user UnityMCP -- uv --directory /Users/USERNAME/Library/AppSupport/UnityMCP/UnityMcpServer/src run server.py

# Windows
claude mcp add --scope user UnityMCP -- "C:/Users/USERNAME/AppData/Local/Microsoft/WinGet/Links/uv.exe" --directory "C:/Users/USERNAME/AppData/Local/UnityMCP/UnityMcpServer/src" run server.py
```

---

### 2. CoderGamester/mcp-unity
**URL**: https://github.com/CoderGamester/mcp-unity

**Architecture**: Node.js MCP Server + WebSocket Bridge

**Installation**:
```bash
# Via Unity Package Manager Git URL
https://github.com/CoderGamester/mcp-unity.git
```

**Claude Code Configuration**:
```json
{
  "mcpServers": {
    "mcp-unity": {
      "command": "node",
      "args": ["ABSOLUTE/PATH/TO/mcp-unity/Server~/build/index.js"]
    }
  }
}
```

---

## MCP Tools Reference

### Scene & GameObject Management

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `manage_gameobject` | Create, modify, delete, find, duplicate GameObjects | "Create a cube at position (0, 5, 0)" |
| `find_gameobjects` | Search by name, tag, layer, component, path (paginated) | "Find all objects tagged 'Enemy'" |
| `get_gameobject` | Get detailed info including components | "Get details of the Player object" |
| `select_gameobject` | Select objects in hierarchy | "Select the Main Camera" |
| `update_gameobject` | Update name, tag, layer, active/static state | "Set Player's tag to 'Enemy'" |

### Component Management

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `manage_components` | Add, remove, set properties on components | "Add Rigidbody to Player, set mass to 5" |
| `update_component` | Update component fields | "Change the BoxCollider size to (2, 2, 2)" |

### Script & Code Management

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `manage_script` | Create, read, delete C# scripts | "Create a new PlayerController script" |
| `create_script` | Create new C# script at path | "Create Scripts/Managers/GameManager.cs" |
| `validate_script` | Fast syntax/structure validation | "Validate PlayerController.cs" |
| `apply_text_edits` | Precise line/column edits with hash preconditions | "Edit line 45 of PlayerController.cs" |
| `script_apply_edits` | Structured C# method/class edits | "Add a Jump() method to PlayerController" |
| `find_in_file` | Regex search in C# scripts | "Find all uses of 'GetComponent' in scripts" |
| `recompile_scripts` | Force script recompilation | "Recompile all scripts" |

### Material & Shader

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `manage_material` | Create, set properties, colors, assign to renderers | "Create a red material and apply to cube" |
| `manage_shader` | Shader CRUD operations | "Create a custom hologram shader" |

### VFX & Visual Effects

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `manage_vfx` | Line/trail renderer, particle system, VFX Graph | "Add a particle system to the explosion prefab" |

### Scene Management

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `manage_scene` | Load, save, create, get hierarchy, screenshot | "Save the current scene" |
| `create_scene` | Create and save new scene | "Create a new scene called 'Level2'" |
| `load_scene` | Load scene with optional additive mode | "Load MainMenu scene additively" |
| `delete_scene` | Delete scene and remove from Build Settings | "Delete the TestScene" |

### Prefab Management

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `manage_prefabs` | Open/close prefab stage, save, create from GO | "Create a prefab from the Player object" |
| `create_prefab` | Create prefab with script and serialized fields | "Create a prefab named 'Enemy' with EnemyController" |

### Asset Management

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `manage_asset` | Import, create, modify, delete, search assets | "Import all textures from Downloads folder" |
| `add_asset_to_scene` | Add asset from AssetDatabase to scene | "Add the Player prefab to current scene" |
| `add_package` | Install Unity Package Manager packages | "Add TextMeshPro package" |

### Editor Control

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `manage_editor` | Control play mode, active tool, tags, layers | "Enter Play Mode" |
| `execute_menu_item` | Execute Unity menu items | "Execute 'File/Save Project'" |
| `refresh_unity` | Refresh asset database and compile | "Refresh the asset database" |

### Debugging & Testing

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `read_console` | Get or clear Unity console messages | "Show me the last 20 error logs" |
| `get_console_logs` | Retrieve logs with pagination | "Get all warnings from console" |
| `send_console_log` | Send log message to Unity | "Send a test message to console" |
| `run_tests` | Start tests asynchronously | "Run all EditMode tests" |
| `get_test_job` | Poll async test job for results | "Check status of test job #123" |

### Multi-Instance Support

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `set_active_instance` | Route tools to specific Unity instance | "Set active instance to ProjectA@abc123" |

### Performance Optimization

| Tool | Description | Example Prompt |
|------|-------------|----------------|
| `batch_execute` | Execute multiple commands in one batch (10-100x faster) | "Create 10 colored cubes using batch_execute" |

---

## MCP Resources Reference

### Editor State

| Resource | URI | Description |
|----------|-----|-------------|
| `editor_state` | `mcpforunity://editor/state` | Editor readiness, staleness info |
| `editor_selection` | `mcpforunity://editor/selection` | Currently selected objects |
| `editor_active_tool` | `mcpforunity://editor/active-tool` | Current tool (Move, Rotate, Scale) |
| `editor_prefab_stage` | `mcpforunity://editor/prefab-stage` | Prefab editing context |
| `editor_windows` | `mcpforunity://editor/windows` | Open editor windows |

### Project Information

| Resource | URI | Description |
|----------|-----|-------------|
| `project_info` | `mcpforunity://project/info` | Root path, Unity version, platform |
| `project_layers` | `mcpforunity://project/layers` | All layers (0-31) |
| `project_tags` | `mcpforunity://project/tags` | All tags from TagManager |
| `unity_instances` | `mcpforunity://instances` | Running Unity Editor instances |

### Scene Data

| Resource | URI | Description |
|----------|-----|-------------|
| `scenes_hierarchy` | `unity://scenes-hierarchy` | Scene hierarchy structure |
| `gameobject` | `mcpforunity://scene/gameobject/{id}` | GameObject data |
| `gameobject_components` | `mcpforunity://scene/gameobject/{id}/components` | All components on GO |
| `gameobject_component` | `mcpforunity://scene/gameobject/{id}/component/{name}` | Specific component |
| `gameobject_api` | `mcpforunity://scene/gameobject-api` | API documentation |

### Assets & Packages

| Resource | URI | Description |
|----------|-----|-------------|
| `unity://assets` | `unity://assets` | AssetDatabase information |
| `unity://packages` | `unity://packages` | Installed and available packages |
| `menu_items` | `mcpforunity://menu-items` | Available menu items |

### Testing

| Resource | URI | Description |
|----------|-----|-------------|
| `get_tests` | `mcpforunity://tests` | All tests (EditMode + PlayMode) |
| `get_tests_for_mode` | `mcpforunity://tests/{mode}` | Tests for specific mode |

---

## Unity Documentation Quick Reference

### Core Documentation URLs

| Section | URL |
|---------|-----|
| **Scripting API** | https://docs.unity3d.com/6000.3/Documentation/ScriptReference/ |
| **Manual** | https://docs.unity3d.com/6000.2/Documentation/Manual/ |
| **Package Manager API** | https://docs.unity3d.com/6000.1/Documentation/Manual/upm-api.html |
| **Unity 6 Resources Hub** | https://unity.com/campaign/unity-6-resources |

### Key Package Documentation

| Package | Documentation URL |
|---------|-------------------|
| **ARFoundation 6.4** | https://docs.unity3d.com/Packages/com.unity.xr.arfoundation@6.4/ |
| **VFX Graph 17.0** | https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.0/ |
| **Sentis** | https://docs.unity3d.com/Packages/com.unity.sentis@latest/ |
| **Input System** | https://docs.unity3d.com/Packages/com.unity.inputsystem@latest/ |
| **Netcode for GameObjects** | https://docs-multiplayer.unity3d.com/ |
| **Addressables** | https://docs.unity3d.com/Packages/com.unity.addressables@latest/ |

---

## Unity Technologies GitHub Repos

### Most Active & Useful (176 repos with 100+ stars)

| Repository | Description | Use Case |
|------------|-------------|----------|
| [ml-agents](https://github.com/Unity-Technologies/ml-agents) | Machine Learning Agents Toolkit | AI/RL training |
| [UnityCsReference](https://github.com/Unity-Technologies/UnityCsReference) | Unity C# reference source | Understanding internals |
| [EntityComponentSystemSamples](https://github.com/Unity-Technologies/EntityComponentSystemSamples) | DOTS/ECS samples | High-performance patterns |
| [Graphics](https://github.com/Unity-Technologies/Graphics) | Scriptable Render Pipeline | Custom rendering |
| [arfoundation-samples](https://github.com/Unity-Technologies/arfoundation-samples) | AR Foundation examples | AR development |
| [VisualEffectGraph-Samples](https://github.com/Unity-Technologies/VisualEffectGraph-Samples) | VFX Graph examples | Visual effects |
| [com.unity.netcode.gameobjects](https://github.com/Unity-Technologies/com.unity.netcode.gameobjects) | Netcode for GameObjects | Multiplayer |
| [InputSystem](https://github.com/Unity-Technologies/InputSystem) | New Input System | Cross-platform input |
| [UnityRenderStreaming](https://github.com/Unity-Technologies/UnityRenderStreaming) | Streaming server | Remote rendering |
| [Addressables-Sample](https://github.com/Unity-Technologies/Addressables-Sample) | Addressables demo | Asset management |
| [XR-Interaction-Toolkit-Examples](https://github.com/Unity-Technologies/XR-Interaction-Toolkit-Examples) | XRI examples | VR/AR interaction |
| [Unity-Robotics-Hub](https://github.com/Unity-Technologies/Unity-Robotics-Hub) | Robotics simulation | ROS integration |
| [game-programming-patterns-demo](https://github.com/Unity-Technologies/game-programming-patterns-demo) | Design patterns | Architecture learning |

---

## Claude Code Hooks for Unity

### Pre-Code Hooks

```bash
# .claude/hooks/pre-tool-use.sh
#!/bin/bash
# Check Unity console before writing code
if [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]]; then
  # Query MCP for console errors
  echo "Checking Unity console for existing errors..."
fi
```

### Post-Code Hooks

```bash
# .claude/hooks/post-tool-use.sh
#!/bin/bash
# After writing Unity scripts, trigger recompilation check
if [[ "$TOOL_NAME" == "Edit" && "$FILE_PATH" == *.cs ]]; then
  echo "C# script modified - triggering Unity recompilation check"
fi
```

### CLAUDE.md Unity Configuration

```markdown
# Unity Project CLAUDE.md

## MCP Server
This project uses Unity MCP for AI-assisted development.
- MCP Server: CoplayDev/unity-mcp (HTTP mode)
- Port: 8080 (default)

## Commands
- Check console: Use `read_console` tool before debugging
- Validate scripts: Use `validate_script` before committing
- Run tests: Use `run_tests` after significant changes

## Architecture
- ARFoundation 6.1 for AR features
- VFX Graph 17.2 for particle effects
- URP for rendering
- Addressables for asset management

## Debugging Workflow
1. Read console logs first: `read_console`
2. Get scene hierarchy: `manage_scene` with action="get_hierarchy"
3. Find problematic objects: `find_gameobjects`
4. Inspect components: `mcpforunity://scene/gameobject/{id}/components`
5. Fix and validate: `validate_script`
6. Recompile: `recompile_scripts`
7. Test: `run_tests`
```

---

## Debugging Workflows

### Console Error Investigation

```text
1. "Show me the last 50 error logs from Unity console"
   → read_console or get_console_logs

2. "Find the script causing the NullReferenceException"
   → find_in_file with error pattern

3. "Get the GameObject mentioned in the error"
   → get_gameobject or find_gameobjects

4. "Show me all components on that object"
   → mcpforunity://scene/gameobject/{id}/components

5. "Fix the script and validate"
   → script_apply_edits + validate_script

6. "Recompile and verify"
   → recompile_scripts + read_console
```

### Scene Setup Automation

```text
1. "Create a new scene called 'TestLevel'"
   → create_scene

2. "Set up basic lighting and camera using batch_execute"
   → batch_execute with multiple manage_gameobject calls

3. "Add the Player prefab at spawn point"
   → add_asset_to_scene

4. "Configure the camera to follow the player"
   → update_component on camera

5. "Save the scene"
   → manage_scene with action="save"
```

### Performance Profiling Setup

```text
1. "Check current editor state"
   → mcpforunity://editor/state

2. "List all objects in scene hierarchy"
   → unity://scenes-hierarchy

3. "Find objects with expensive components (MeshRenderer count)"
   → find_gameobjects + batch inspection

4. "Run performance tests"
   → run_tests with performance test filter
```

---

## Advanced: Roslyn Integration

For **Strict** script validation with full C# compiler diagnostics:

1. Install NuGetForUnity
2. Add `Microsoft.CodeAnalysis` version 4.14.0
3. Add `SQLitePCLRaw.core` and `SQLitePCLRaw.bundle_e_sqlite3`
4. Add `USE_ROSLYN` to Scripting Define Symbols
5. Restart Unity

This enables `validate_script` to catch:
- Undefined namespaces
- Missing types
- Invalid method signatures
- Full compiler errors

---

## Performance Tips

### Use batch_execute for Multiple Operations

```text
❌ Slow: Create 5 cubes → 5 separate manage_gameobject calls
✅ Fast: Create 5 cubes → 1 batch_execute with 5 commands

❌ Slow: Find objects, add components to each → N+M calls
✅ Fast: Find + batch component adds → 2 calls total
```

### Paginate Large Queries

- `find_gameobjects` supports pagination for large scenes
- `get_console_logs` supports limit/offset
- Use `unity://scenes-hierarchy` for overview before deep queries

---

## Integration with Your Projects

### HyperGraph Knowledge Explorer

Use Unity MCP resources to build knowledge graphs:
- `unity://scenes-hierarchy` → Node structure
- `mcpforunity://scene/gameobject/{id}/components` → Component relationships
- `unity://packages` → Dependency graph

### XRAI Format

Unity MCP can validate XRAI-compatible VFX Graph assets:
- `manage_vfx` for VFX Graph operations
- `validate_script` for custom XRAI loaders
- `find_gameobjects` to locate XRAI-rendered objects

---

*Generated: 2026-01-13*
*Sources: CoplayDev/unity-mcp, CoderGamester/mcp-unity, Unity Documentation*
