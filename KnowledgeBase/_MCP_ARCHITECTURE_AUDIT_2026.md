# MCP Architecture Audit (2026-02-09)

## Summary: No Conflicts Detected ✓

**Key Insight:** stdio MCP servers spawn independent processes per client.

## Architecture

```
Claude Code ──stdio──> coplay-mcp-server (proc 1) ──TCP:6401──> Unity Editor
Gemini CLI  ──stdio──> coplay-mcp-server (proc 2) ──TCP:6401──> Unity Editor
                                                                      ↓
                                                              Handles both
```

## Current Configuration

### Claude Code (`~/.claude.json`)
```json
{
  "coplay-mcp": {
    "type": "stdio",
    "command": "coplay-mcp-server",
    "args": [],
    "env": {"MCP_TOOL_TIMEOUT": "720000"}
  },
  "github": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"]
  }
}
```

### Gemini CLI (`~/.gemini/settings.json` + extensions)
```json
{
  "mcpServers": {
    "coplay-mcp": {
      "command": "coplay-mcp-server",
      "args": [],
      "env": {"MCP_TOOL_TIMEOUT": "720000"}
    }
  }
}
```

**Extensions** (separate process tree):
- `chrome-devtools-mcp` (stdio)
- `context7` (stdio)

## How stdio Works (No Conflict)

1. **Each client spawns its own server process**
   - Claude Code starts → new `coplay-mcp-server` process
   - Gemini CLI starts → new `coplay-mcp-server` process
   
2. **Both connect to Unity on TCP:6401**
   - Unity Editor listens on port 6401
   - Multiple MCP clients can connect simultaneously
   - Unity handles multiplexing

3. **No resource contention**
   - Each process has independent stdin/stdout
   - Unity manages concurrent connections
   - Tools don't conflict

## Verified Behavior

```bash
# Gemini MCP status
✓ coplay-mcp: Connected
✓ chrome-devtools: Connected
✓ context7: Connected

# Unity listening
TCP 127.0.0.1:6401 (Unity Editor)

# Process count when both running
ps aux | grep coplay-mcp-server
# Shows 0-2 processes (1 per active CLI)
```

## Tool Availability Matrix

| MCP Server | Claude Code | Gemini CLI | Notes |
|------------|-------------|------------|-------|
| coplay-mcp | ✓ | ✓ | Shared, no conflict |
| github | ✓ (disabled) | ✗ | Claude only |
| chrome-devtools | ✗ | ✓ | Gemini extension |
| context7 | ✗ | ✓ | Gemini extension |

## Best Practices

### DO
✅ Use same command in both configs (`coplay-mcp-server`)
✅ Keep MCP_TOOL_TIMEOUT consistent (720000ms)
✅ Run both CLIs simultaneously (they won't conflict)
✅ Let each CLI spawn its own MCP process

### DON'T
❌ Try to share a single MCP process (not how stdio works)
❌ Mix version specifiers (use bare command for system default)
❌ Worry about port conflicts (Unity handles multiplexing)

## Maintenance

```bash
# Health check
ai-config-lint                 # Config consistency
gemini mcp list                # Gemini connection status
lsof -iTCP:6401 -sTCP:LISTEN   # Unity port check

# Kill stale processes
pkill -f coplay-mcp-server
pkill -f chrome-devtools-mcp
```

## References

- FastMCP: https://gofastmcp.com
- Coplay MCP: Connects to Unity Editor on port 6401
- MCP Protocol: stdio-based servers spawn per-client
