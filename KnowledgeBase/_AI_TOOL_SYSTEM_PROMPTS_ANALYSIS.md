# AI Tool System Prompts & Configuration Analysis

**Source**: [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) (114K stars)
**Additional**: Official docs for each tool
**Last Updated**: 2026-02-08

---

## Cross-Tool Configuration Map

| Tool | Config File | Rules Dir | Memory System | Priority |
|------|------------|-----------|---------------|----------|
| **Claude Code** | `CLAUDE.md` (project + `~/.claude/`) | `.claude/rules/*.md` | Auto-memory + CLAUDE.md | Project > User |
| **Codex** | `AGENTS.md` + `instructions.md` + `config.toml` | `.codex/rules/` | Skills + AGENTS.md | Project > User |
| **Windsurf** | `global_rules.md` | `.windsurf/rules/*.md` | Auto-generated memories | Global + Workspace |
| **Cursor** | `.cursorrules` or `.cursor/CLAUDE.md` | `.cursor/rules/*.md` | `update_memory` tool | Project-level |
| **Rider/Junie** | `.junie/guidelines.md` | N/A | IDE-indexed search | Project-level |
| **VSCode Copilot** | N/A (system prompt only) | N/A | `update_user_preferences` | System only |

---

## Key Insights by Tool

### Claude Code
- **Memory loading**: Recursive upward from cwd to `/`. Parent CLAUDE.md files load automatically.
- **Rules path targeting**: `.claude/rules/*.md` with YAML frontmatter `paths:` for conditional loading. Same priority as CLAUDE.md.
- **Limits**: 6K chars per rule file, 12K total combined global + local rules.
- **Auto-memory**: First 200 lines of MEMORY.md loaded at launch.
- **`@` imports**: `@.claude/rules/architecture.md` resolved recursively up to 5 levels.
- **Subagents**: Task tool spawns independent context windows. "use subagents" trigger.

### Codex (OpenAI)
- **Open-source Rust codebase** — system prompts extractable from source.
- **Key prompt patterns**: "Think first before any tool call", "Batch everything", use `multi_tool_use.parallel`.
- **Skills hierarchy**: repo `.agents/skills/` → user `~/.codex/skills/` → admin → system.
- **Code comments**: "Succinct comments for non-obvious code only. Usage should be rare."
- **AGENTS.md**: Project-scoped, loads only when folder is trusted.

### Windsurf (Cascade)
- **Three rule levels**: Global (`global_rules.md`) → Workspace (`.windsurf/rules/`) → Enterprise (system-level).
- **Auto-discovery**: Searches up to git root for rules in parent directories.
- **Activation modes**: Always On, Manual (@mention), Model Decision (natural language trigger).
- **Limits**: 6K chars per rule file, 12K total (global + workspace). Excess truncated.
- **Auto-memories**: Cascade auto-generates and persists context. No credit cost.

### Cursor
- **Agent prompt v1.2**: "If you make a plan, immediately follow it, do NOT wait for user confirmation."
- **Memory**: `update_memory` tool with create/update/delete. "If user contradicts memory, delete rather than update."
- **Restriction**: "NEVER create memories for implementation plans or task-specific info" — memories are for persistent knowledge only.
- **Linter discipline**: "Max 3 iterations on linter errors before escalation to user."
- **Search priority**: "Prefer semantic_search over grep unless you know exact string."

### VSCode Copilot (GitHub)
- **Post-edit verification**: "After editing a file, you MUST call get_errors to validate the change."
- **Preference learning**: "After user corrects, use update_user_preferences to save."
- **Tool philosophy**: "If a tool exists to do a task, use the tool. No need to ask permission."
- **Never show code**: "NEVER print a codeblock representing a change — use insert_edit_into_file instead."

### JetBrains Junie/Rider
- **Guidelines file**: `.junie/guidelines.md` for project-level instructions.
- **IDE-powered**: Leverages JetBrains indexed search, refactoring, and type analysis.
- **MCP integration**: HTTP transport on port 63342.

---

## Patterns That Recur Across ALL Tools

1. **Post-edit verification** — Every tool's system prompt requires verifying changes after edits. Claude Code, Copilot, and Cursor all mandate error-checking after writes.

2. **Correction → persistent rule** — Claude Code ("update CLAUDE.md"), Copilot ("update_user_preferences"), Cursor ("update_memory") all have this pattern. Boris Cherny independently confirmed this as highest-leverage habit.

3. **Plan before execute** — Codex ("Think first"), Cursor ("make a plan, immediately follow it"), Claude Code (Plan Mode). All tools converge on planning as quality multiplier.

4. **Prefer tools over asking** — Copilot ("If a tool exists, use it"), Cursor ("prefer gathering info via tools over asking users"), Codex ("batch everything"). All tools prioritize autonomous tool use.

5. **Lint/error iteration cap** — Cursor caps at 3 iterations. Claude Code's GLOBAL_RULES caps at 2 failed attempts. Prevents infinite loops.

6. **Parallel tool calls when independent** — Every tool's system prompt encourages batching independent operations for speed.

---

## Actionable Cross-Tool Insights for This Setup

### Already Implemented
- [x] Correction habit (GLOBAL_RULES.md + all tool configs)
- [x] Re-plan after failures (GLOBAL_RULES.md)
- [x] Verification after changes (GLOBAL_RULES.md)
- [x] Path-targeted rules (`.claude/rules/unity-csharp.md`)
- [x] Parallel tool calls (GLOBAL_RULES.md)

### Missing / Gaps
- [ ] **Windsurf has no rules** — Create `~/.windsurf/rules/global_rules.md` with shared baseline
- [ ] **Cursor has no rules** — `.cursorrules` or `.cursor/rules/` not configured
- [ ] **`@` imports in CLAUDE.md** — Could use `@.claude/rules/...` to keep CLAUDE.md lean
- [ ] **3-iteration cap** (from Cursor) — Consider adding to GLOBAL_RULES.md as explicit limit
- [ ] **"Never create memories for task-specific info"** (Cursor pattern) — Relevant to session_memories/ cleanup

---

## Related Resources

| Topic | File |
|-------|------|
| Boris Cherny Tips | `_CLAUDE_CODE_TEAM_TIPS_BORIS_CHERNY.md` |
| Official Best Practices | `_CLAUDE_CODE_OFFICIAL_BEST_PRACTICES.md` |
| Tool Integration Map | `_TOOL_INTEGRATION_MAP.md` |
