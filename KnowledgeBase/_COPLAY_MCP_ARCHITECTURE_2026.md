# CoPlay MCP Architecture Research (2026-02-08)

## Ecosystem Tiers
1. **Coplay** - Premium C# plugin (86 tools, proprietary, currently free)
2. **Coplay MCP** - Python MCP server exposing 86 tools to AI clients
3. **Unity MCP** - Open-source MIT (19 tools, community-maintained)

Origin: Justin Barnett created Unity MCP as OSS. CoplayDev took over, hired Barnett.

## Standard Stack
```
AI Client → MCP Protocol → Python Server (localhost:8080) → Unity C# Bridge → Unity Editor
```
Transport: HTTP (default) or stdio (CLI). Python 3.10+, uv package manager.

## Critical Pattern: Batching (10-100x speedup)
- `batch_execute` supports up to 25 commands per batch
- Atomic transactions with rollback on failure
- "15 min from prompt to playable demo" vs "hour+ manually"

## 19 Core Tools
- Asset: manage_asset, manage_texture, manage_material, manage_shader, manage_vfx
- Scene: manage_scene, manage_gameobject, manage_prefabs, manage_components
- Script: manage_script, create_script, delete_script, validate_script, script_apply_edits, apply_text_edits
- Utility: batch_execute, find_gameobjects, find_in_file, read_console, refresh_unity, run_tests, get_test_job, execute_menu_item, get_sha

## Validation Tiers
1. **Basic** - Syntax (fast, always on)
2. **Standard** - Structural (default)
3. **Strict** - Roslyn (opt-in: NuGetForUnity + Microsoft.CodeAnalysis v5.0 + USE_ROSLYN define)

## Precondition Hashes
Prevent race conditions: include file hash with edit, rejected if file changed.

## Alternative Implementations
- **IvanMurzak/Unity-MCP**: Runtime AI (works in compiled games), reflection-powered, Roslyn compilation
- **CoderGamester/mcp-unity**: WebSocket transport, Node.js, port 8090, remote support
- **NoSpoonLab/unity-mcp**: Pure C# server (no Python)

## Config (Claude Code)
```bash
claude mcp add --scope user --transport stdio coplay-mcp --env MCP_TOOL_TIMEOUT=720000
```

## Timeouts
- 12 min (720s) for coplay_task
- 1-2 min for basic tools

## Roadmap (v10)
Current: HTTP auth, custom tools config, CLI support
Mid-term: Runtime MCP, GenAI plugins (2D/3D assets)
Long-term: Dependency injection, Play mode, E2E testing

## Sources
- [CoplayDev/unity-mcp](https://github.com/CoplayDev/unity-mcp) (5,759 stars)
- [Coplay Docs](https://docs.coplay.dev/)
- [IvanMurzak/Unity-MCP](https://github.com/IvanMurzak/Unity-MCP)
- [CoderGamester/mcp-unity](https://github.com/CoderGamester/mcp-unity)
