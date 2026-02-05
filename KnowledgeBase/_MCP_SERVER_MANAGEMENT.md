# MCP Server Management

**Version:** 1.0
**Last Updated:** 2026-02-05
**Author:** @jamestunick + Claude Opus 4.5
**Tags:** mcp, server, management, performance, memory, hooks

---

## Quick Reference

```bash
mcp-kill-dupes   # Kill duplicate servers (auto-runs at Claude Code session start)
mcp-nuke         # Kill duplicates + heavy servers (playwright, puppeteer, etc)
mcp-kill-all     # Nuclear - kill ALL MCP servers
mcp-count        # Show running MCP server count
mcp-mem          # Show MCP memory usage
mcp-ps           # List MCP servers by type
```

---

## Problem: Multi-IDE MCP Duplication

When running multiple AI IDEs simultaneously (Windsurf, Antigravity, Claude Code, Cursor), each spawns its own MCP servers independently:

| IDE | Spawns Own MCP Servers |
|-----|------------------------|
| Claude Code | ✅ Yes |
| Windsurf | ✅ Yes |
| Antigravity | ✅ Yes |
| Cursor | ✅ Yes |

**Result:** 3-4x duplicate servers → memory exhaustion → force quits

### Symptoms
- Force quits of Claude Code or Windsurf
- Slow MCP tool responses (>30s)
- High memory usage (>1GB for MCP alone)
- 30+ MCP processes running

---

## Solution: Automatic Deduplication

### 1. SessionStart Hook (Primary)

The `session-health-check.sh` hook runs automatically when Claude Code starts:

**Location:** `~/.claude/hooks/session-health-check.sh`

```bash
# Checks for >5 MCP processes
# Runs mcp-kill-dupes if found
# Reports fixes to conversation
```

**Configuration:** `~/.claude/settings.json` → `hooks.SessionStart`

### 2. Kill Script

**Location:** `~/bin/mcp-kill-dupes`

```bash
#!/bin/bash
# Kills duplicate MCP servers (keeps oldest of each type)
# Run manually or via hook

# Servers to deduplicate
SERVERS=(
    "chrome-devtools-mcp"
    "context7-mcp"
    "mcp-server-fetch"
    "Unity-XR-AI/mcp-server"
    "ShaderToy-MCP"
    "mcp_vfx_graph_server"
    "mcp-server-github"
    "chroma-mcp"
    "unity-mcp"
    "jetbrains"
    "claude-mem"
)

# Heavy servers (killed with KILL_HEAVY=1)
HEAVY_SERVERS=(
    "playwright-mcp"
    "mcp-server-puppeteer"
    "mcp-server-sequential-thinking"
    "mcp-server-memory"
    "blender-mcp"
)
```

---

## Best Practice: Hooks over LaunchAgents

**For Claude Code automation, ALWAYS prefer hooks over LaunchAgents:**

| Approach | When to Use |
|----------|-------------|
| **Hooks** ✅ | Claude Code tasks - run in context, access conversation state, no background processes |
| **LaunchAgents** | System-wide tasks unrelated to AI tools (backup, sync, etc.) |

### Why Hooks Win

1. **Resource efficient** - Run only when Claude Code session starts
2. **Context aware** - Have access to environment and can report to conversation
3. **No zombies** - No persistent background processes eating memory
4. **Auto cleanup** - Automatically cleaned up when Claude Code closes

### Hook Types Available

| Hook | Trigger | Use Case |
|------|---------|----------|
| `SessionStart` | Claude Code starts | Health checks, MCP dedup, context loading |
| `Stop` | Claude Code exits | Save progress, cleanup |
| `UserPromptSubmit` | User sends message | Keyword triggers, context injection |
| `PostToolUse` | After tool execution | Failure tracking, logging |
| `Notification` | System notification | User alerts |

---

## Troubleshooting

### MCP Too Slow

```bash
# Check count
pgrep -f "mcp" | wc -l

# If >15, clean up
mcp-kill-dupes

# If still slow, nuke heavy servers
mcp-nuke
```

### Finding Parent Processes

```bash
# See what's spawning MCP servers
for pid in $(pgrep -f "mcp" | head -10); do
    ppid=$(ps -o ppid= -p $pid | tr -d ' ')
    pname=$(ps -o comm= -p $ppid)
    echo "MCP $pid ← $pname"
done
```

### Memory Check

```bash
# Total MCP memory
ps aux | grep -E "mcp" | grep -v grep | awk '{sum += $6} END {printf "%.1f MB\n", sum/1024}'
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `~/bin/mcp-kill-dupes` | Deduplication script |
| `~/.claude/hooks/session-health-check.sh` | Auto-runs at session start |
| `~/.claude/settings.json` | Hook configuration |
| `~/.zshrc` | Shell aliases |
| `~/.windsurf/mcp.json` | Windsurf MCP config |
| `~/.cursor/mcp.json` | Cursor MCP config |

---

## Prevention Strategies

1. **Close unused IDEs** - Each open IDE spawns servers
2. **Use dedicated tools** - Claude Code for implementation, Gemini for research (no MCP)
3. **Regular cleanup** - `mcp-kill-dupes` when switching projects
4. **Monitor memory** - `mcp-mem` to check usage

---

## Related Docs

- `_TOOL_INTEGRATION_MAP.md` - Cross-tool configuration
- `_OPEN_MULTIBRAIN_SYNC.md` - Multi-AI sync architecture
- `_CLAUDE_CODE_HOOKS.md` - Hook documentation
- `GLOBAL_RULES.md` - MCP Server Management section

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-05 | Initial version - documented deduplication fix |
