# Gemini High-Velocity Workflows (2026)

**Goal**: Zero manual approvals, maximum token efficiency, and instant feedback loops.

## CLI Speed Patterns

### 1. The `g` Wrapper (Recommended)
Use `g "prompt"` for all human-AI interactions. It auto-approves all tool calls via `--approval-mode yolo`.

### 2. Scripting Standard
Always use explicit flags in automated scripts to ensure portability:
```bash
gemini -y "automated task"
```

## Hardened Settings (`~/.gemini/settings.json`)
Ensure these are active to minimize session friction:
- `security.enablePermanentToolApproval: true` (Allows "Allow for all future sessions")
- `tools.autoAccept: true` (Skips prompts for safe read tools)

## Auto-Recovery
If MCP hangs, use the "Hard Reset" pattern:
1. `pkill -f coplay-mcp-server`
2. Restart CLI session.
