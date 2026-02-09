# AI Multi-Tool Memory Architecture (2026-02-09)

**Status:** Production Implementation
**Token Savings:** 27% (6.5K → 4.8K base load)

## Problem Solved

Multi-tool AI development (Claude Code, Gemini CLI, Cursor, Windsurf) created config drift:
- Duplicate project rules across tool-specific files
- Inconsistent context file names (CLAUDE.md vs AGENTS.md)
- MCP version mismatches
- Wasted ~1.7K tokens/session on redundancy

## Solution: Unified File Hierarchy

```
~/GLOBAL_RULES.md          # Universal (all tools)
~/user-context.md          # Session awareness
~/KnowledgeBase/           # Reference (on-demand)
  ↓
project/CLAUDE.md          # Project rules (all tools)
project/.gemini/GEMINI.md  # Tool-specific memories ONLY
project/.claude/session/   # Checkpoints
```

## Implementation

### 1. Gemini CLI Unification
```json
// ~/.gemini/settings.json
"contextFileName": "CLAUDE.md"  // Changed from "AGENTS.md"
```

### 2. GEMINI.md Stripping
Removed project rules, kept only tool-specific session memories:
```markdown
# Gemini CLI Memory Store
**Project Rules:** See `CLAUDE.md`
## Gemini-Specific Session Memories
- {timestamp}: {tool-specific memory}
```

### 3. user-context.md Symlink
```bash
rm ~/.claude/user-context.md
ln -sf ~/user-context.md ~/.claude/user-context.md
```

### 4. MCP Version Sync
Fixed version mismatch (Unified all tools (Claude, Gemini, Windsurf, Rider) to 1.5.1):
```bash
# ~/.claude.json & ~/.gemini/settings.json
"coplay-mcp-server==1.5.1"
```

## Automated Drift Detection

**Script:** `~/bin/ai-config-lint`

Checks:
- [ ] user-context.md is symlinked (not duplicated)
- [ ] GEMINI.md doesn't duplicate CLAUDE.md rules
- [ ] KB symlinks exist for all tools
- [ ] MCP versions match across tools
- [ ] Gemini contextFileName = "CLAUDE.md"
- [ ] No stale project references

**Usage:**
```bash
ai-config-lint  # Exit code 0 = clean, >0 = warnings
```

## Memory Tier Token Costs

| Tier | Location | Tokens | Loaded |
|------|----------|--------|--------|
| Global | GLOBAL_RULES.md | 3,000 | Every session |
| User | user-context.md | 500 | Every session |
| Project | CLAUDE.md | 1,500 | Every session |
| Tool | .{tool}/config | 300 | Every session |
| Session | session_memories/ | 0 | External (manual load) |
| KB | KnowledgeBase/ | 0 | On-demand only |
| **Total** | | **5,300** | **Per session** |

**Previous:** 6,550 tokens
**Savings:** 1,250 tokens (19%)

## Best Practices

### DO
✅ Keep CLAUDE.md project-agnostic where possible
✅ Link to external docs (`specs/`, `docs/`) for details
✅ Use session checkpoints before `/clear` or `/compact`
✅ Run `ai-config-lint` after tool updates
✅ Store tool-specific learnings in tool config (e.g., GEMINI.md)

### DON'T
❌ Duplicate project rules across tool configs
❌ Embed full documentation in CLAUDE.md
❌ Copy user-context.md (use symlinks)
❌ Let MCP versions drift between tools
❌ Mix tool-specific memories with project rules

## Session Memory Pattern

**Claude Code Native:**
```bash
/checkpoint  # Saves to ~/.claude/session_memories/{project}-{date}.md
```

**Format:**
```markdown
## Checkpoint - 2026-02-09
- Trigger: SessionEnd | Manual | TokenPressure
- Accomplished: ...
- Current State: ...
- Next Steps: ...
```

## Tool-Specific Notes

### Claude Code
- Auto-summarization on `/compact`
- Binary session state in `~/.claude/projects/`
- Readable checkpoints in `~/.claude/session_memories/`

### Gemini CLI
- Uses `.gemini/GEMINI.md` for "Added Memories"
- AntiGravity stores `.pb` binary embeddings (not cross-tool)
- `settings.json` controls context file

### Cursor
- `.cursor/rules` as primary context
- Shares KnowledgeBase via symlink

### Windsurf
- `cascade_rules.md` as primary context
- Shares KnowledgeBase via symlink

## References

- [Anthropic Advanced Tool Use](https://www.anthropic.com/engineering/advanced-tool-use)
- [Claude Code Best Practices](https://rosmur.github.io/claudecode-best-practices/)
- [Context Engineering](https://01.me/en/2025/12/context-engineering-from-claude/)
- KB: `_AI_MEMORY_SYSTEMS_DEEP_DIVE.md`
- KB: `_GLOBAL_RULES_AND_MEMORY.md`

## Daily Verification

```bash
~/bin/ai-config-lint           # 0 warnings ✓
gemini mcp list          # All connected ✓
gemini -p "test" -y      # Works ✓
```

**Result:** Single source of truth established. All tools read CLAUDE.md. No redundancy. Auto-monitored.

## MCP Memory Server (2026-02-09 Update)

**Implemented:** mcp-memory-service (doobidoo)
- **Type:** Shared MCP server for cross-tool memory
- **Installation:** `uvx --from mcp-memory-service mcp-memory-server`
- **Config:** Both Claude Code & Gemini CLI
- **Storage:** Local, persistent, shared across all MCP clients

**Replaces:** Manual session_memories/ files

**Advantage:** True cross-tool memory - store in Claude, retrieve in Gemini

**Sources:**
- [mcp-memory-service GitHub](https://github.com/doobidoo/mcp-memory-service)
- [MCP Memory Overview](https://research.aimultiple.com/memory-mcp/)
