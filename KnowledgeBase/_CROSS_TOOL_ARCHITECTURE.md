# Cross-Tool AI Architecture

**Version**: 1.1
**Last Updated**: 2026-02-05
**Primary CLIs**: Claude Code, Codex, Gemini
**Primary IDEs**: Windsurf, Antigravity (Gemini), JetBrains Rider

---

## Tool Roles

| Role | Tool | Why |
|------|------|-----|
| **Implementation** | Claude Code | Best MCP, subagents, Unity integration |
| **Code Gen** | Codex | Fast, AGENTS.md standard |
| **Research** | Gemini CLI | 1M context FREE |
| **Quick Edits** | Windsurf | Fast Cascade, good completions |
| **Research IDE** | Antigravity | Gemini-powered, 1M context |
| **Navigation** | Rider | Best refactoring, JetBrains MCP |

---

## Single Source of Truth

```
~/GLOBAL_RULES.md                    ← Universal rules (ALL tools read this)
    │
    ├── ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/
    │       ← Shared pattern library (symlinked to all tools)
    │
    └── project/CLAUDE.md            ← Project-specific overrides
```

**Key Principle**: Write rules ONCE, share EVERYWHERE.

---

## Symlink Architecture

### Already Configured (Verified 2026-02-05)

| Tool | Config Dir | KB Symlink | Rules |
|------|------------|------------|-------|
| Claude Code | `~/.claude/` | ✅ `knowledgebase/` | `~/.claude/CLAUDE.md` |
| Windsurf | `~/.windsurf/` | ✅ `knowledgebase/` | ✅ `CLAUDE.md → ~/CLAUDE.md` |
| Cursor | `~/.cursor/` | ✅ `knowledgebase/` | ✅ `CLAUDE.md → ~/CLAUDE.md` |
| Antigravity | `~/.antigravity/` | ✅ `knowledgebase/` | See below |
| Codex | `~/.codex/` | ✅ `knowledgebase/` | `~/.codex/rules/` |

### Create Missing Symlinks

```bash
# Antigravity rules (if not exists)
ln -sf ~/GLOBAL_RULES.md ~/.antigravity/GLOBAL_RULES.md

# Codex rules (if not exists)
ln -sf ~/GLOBAL_RULES.md ~/.codex/rules/GLOBAL_RULES.md

# Gemini (if using)
mkdir -p ~/.gemini && ln -sf ~/GLOBAL_RULES.md ~/.gemini/GLOBAL_RULES.md
```

---

## What Goes Where

### ~/GLOBAL_RULES.md (~800 lines target)
- Core workflow (Explore → Plan → Code → Commit)
- Tool selection matrix
- Token efficiency essentials
- Session management
- Anti-patterns
- Quick fixes reference

**NOT here**: Detailed tutorials, full API docs, project-specific build commands

### KnowledgeBase/ (~30 active files target)
- Pattern libraries (VFX, AR, Unity)
- Error fix lookups
- GitHub repo references
- Research summaries
- Learning logs

**Structure**:
```
KnowledgeBase/
├── _QUICK_FIX.md              ← Error → Fix lookup
├── _VFX_MASTER.md             ← Consolidated VFX patterns
├── _ARFOUNDATION_MASTER.md    ← Consolidated AR patterns
├── _UNITY_MCP_REFERENCE.md    ← MCP tool reference
├── _GITHUB_REPOS_INDEX.md     ← 520+ repo references
├── _TOKEN_EFFICIENCY.md       ← Full token optimization guide
├── LEARNING_LOG.md            ← Session discoveries
└── _archive/                  ← Retired files (not loaded)
```

### project/CLAUDE.md (~400 lines target)
- Build commands specific to this project
- Project architecture overview
- Environment setup
- Troubleshooting specific to this codebase

**NOT here**: Universal rules, token efficiency, general patterns

---

## Tool-Specific Notes

### Claude Code
- Primary tool - most features
- MCP servers for Unity, GitHub, JetBrains
- Skills/commands in `~/.claude/commands/`
- Subagents for parallel work

### Windsurf
- Uses `.windsurfrules` or `CLAUDE.md` symlink
- Cascade for multi-file edits
- No MCP support - use direct file access

### Cursor
- Uses `.cursorrules` or `CLAUDE.md` symlink
- Composer for multi-file edits
- Tab completion strong

### Antigravity (Gemini-based)
- 1M context window
- Best for research tasks
- Link to GLOBAL_RULES.md for consistency

### Codex
- `~/.codex/rules/` directory
- Strong for code generation
- Needs explicit KB path references

### Rider (JetBrains)
- AI Assistant built-in
- Claude Code connects via JetBrains MCP
- Use for navigation, refactoring

---

## Cross-Tool Workflow

### Research Task (Use Gemini/Antigravity)
```bash
# Free, 1M context - perfect for research
antigravity "Research VFX Graph depth occlusion patterns, check KB first"
```

### Implementation Task (Use Claude Code)
```bash
# Best tool integration
claude "Implement the pattern from KB/_VFX_MASTER.md"
```

### Quick Edit (Use Cursor/Windsurf)
```bash
# Fast for small changes
cursor .  # or windsurf .
```

### Review Task (Use Claude Code Subagent)
```
Use a subagent to review this code for security issues
```

---

## Token Optimization Across Tools

| Scenario | Tool Choice | Tokens |
|----------|-------------|--------|
| Deep research | Antigravity (1M free) | 0 Claude |
| Quick lookup | `kb "pattern"` shell alias | 0 |
| Code review | Claude subagent | Independent |
| Large refactor | Cursor Composer | IDE-managed |
| Unity work | Claude + MCP | ~500/operation |

---

## Session Persistence (All Tools)

**Before ending ANY session**:
1. Commit changes to git
2. Name/save session (if tool supports)
3. Check for uncommitted work in other repos

**Recovery**:
- Claude: `claude --continue` or `--resume`
- Windsurf: Recent sessions in UI
- Cursor: Recent sessions in UI
- Antigravity: History in `~/.antigravity/`

---

## Verification Checklist

Run periodically to ensure sync:

```bash
# Check all symlinks valid
ls -la ~/.claude/knowledgebase ~/.windsurf/knowledgebase ~/.cursor/knowledgebase ~/.antigravity/knowledgebase ~/.codex/knowledgebase 2>/dev/null

# Check GLOBAL_RULES.md accessible
head -5 ~/GLOBAL_RULES.md

# Check KB file count (target: <50 active)
ls ~/.claude/knowledgebase/*.md 2>/dev/null | wc -l
```

---

## Quick Reference

| Action | Command/Location |
|--------|------------------|
| Edit global rules | `~/GLOBAL_RULES.md` |
| Edit Claude-specific | `~/.claude/CLAUDE.md` |
| Edit project rules | `project/CLAUDE.md` |
| Search KB | `kb "term"` or `kbfix "error"` |
| Add pattern | Append to `LEARNING_LOG.md` |
| Archive old file | Move to `KnowledgeBase/_archive/` |

---

**Tags**: #cross-tool #architecture #configuration #sharing
