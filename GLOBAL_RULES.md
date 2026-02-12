# Global Project Rules

**Applies To**: Claude Code, Windsurf, Cursor, Gemini, Codex, Rider, Unity, ALL AI tools

## CORE LOOP (Anthropic-Aligned)

```
Explore -> Plan -> Code -> Commit -> Log discovery
```

**Shortcut for simple tasks**: Search KB -> Act -> Done

### Highest Leverage Practice: Verification Criteria
**Single most impactful thing**: Give Claude a way to verify its work.

| Before | After |
|--------|-------|
| "implement email validation" | "write validateEmail. tests: user@example.com=true, invalid=false. run tests after" |
| "build is failing" | "build fails with [error]. fix and verify build succeeds. address root cause" |

### Before ANY Change - Ask Two Questions

**ALWAYS ask before implementing:**
1. **"Do we really need this?"** - Real problem or hypothetical? Simpler alternative? KB has a solution?
2. **"Could this cause other issues?"** - Side effects? What breaks? Reversible?

**When in doubt**: Ask user, keep changes minimal, prefer reversible options.

### Quick Reference
- **Session start**: `mcp-kill-dupes` + verify `claude --version` is current
- **Before coding**: Search `KnowledgeBase/` first -> start with `_KB_INDEX.md`
- **On error**: Check `_QUICK_FIX.md`
- **Discovery**: Append to `LEARNING_LOG.md`
- **KB Index**: `~/KnowledgeBase/_KB_INDEX.md`
- **Search:** Always use the Grep tool (ripgrep-based) or `rg` in bash. Never use `grep` in bash -- `rg` is faster and supports the same syntax.

### Session Start Defaults
- Defaults: `toolchain=auto-detect`, `scope=project-only`, `verbosity=concise`.

### Tool Version Check (MANDATORY at Session Start)
```bash
claude --version  # Compare against: npm show @anthropic-ai/claude-code version
```
- If outdated: `npm install -g @anthropic-ai/claude-code@latest`
- Watch for PATH shadowing: `which claude` should point to npm location

### Session Start Banner (MANDATORY)
Print config hierarchy, token overhead, and current token use at session start. See reference file for template.

### Auto-Log Big Wins (ALWAYS)
Automatically add to `LEARNING_LOG.md` when you discover: architecture patterns, performance wins, setup simplifications, cross-tool sync patterns. Format: Context, Solution, Impact, Cross-refs, Tags.

### KnowledgeBase Access (Default)
- **Read access**: ON by default. **Write/commit/PR**: ONLY at 99% confidence + evidence. **On-demand fetch**: don't preload.

---

## Architecture Overview

### Shared Resources
```
~/GLOBAL_RULES.md       <- This file
~/CLAUDE.md             <- Codex compatibility
~/KnowledgeBase/        <- Pattern library
```

### Tool Selection
| Task | Tool |
|------|------|
| Implementation | Claude Code + MCP |
| Research | Gemini CLI (FREE 1M context) |
| Quick edits | Windsurf |
| Code gen | Codex |
| Navigation | Rider + JetBrains MCP |

### Agent Decision
- **3+ step task** -> Use agent (independent budget)
- **KB lookup** -> `kbfix "error"` (0 tokens)
- **Simple edit** -> Direct Edit tool

---

## TOKEN LIMIT (CHECK EVERY RESPONSE)
**Stay below 95% of weekly/session limits.** If approaching limit: stop non-essential work, summarize, end session.

## Token Efficiency (MANDATORY)

**Goal**: Stay below 95% weekly limit.

### Quick Rules
- **Offload first**: Shell aliases, local scripts, KB search, MCP indexed search before AI reasoning
- `/clear` between tasks, `/compact` when >100K context
- Agents use independent budgets - use for 3+ step tasks
- JetBrains MCP over raw tools (5-10x faster)
- Edit over Write, parallel tool calls
- `.claudeignore` for Unity (saves 180K+ tokens)

### Model Selection
| Task | Model |
|------|-------|
| Simple edits | Haiku (0.3x) |
| Standard work | Sonnet (1x) |
| Architecture | Opus (3x) |
| Research | Gemini (FREE) |

### Responses
- Concise, no preambles, bullets over prose
- No emoji, no summaries, no "feel free to ask"
- Don't re-summarize previous work
- End turns promptly when task complete

---

## Rider + Claude Code (MANDATORY when Rider open)

**ALWAYS use JetBrains MCP over raw tools** - indexed searches are 5-10x faster.
**Rule**: If Rider is open, NEVER use raw Grep/Glob/Read for project files.

| Instead Of | Use This | Speed |
|------------|----------|-------|
| Grep | `search_in_files_by_text` | 10x |
| Glob | `find_files_by_name_keyword` | 5x |
| Read | `get_file_text_by_path` | 2x |
| LSP | `get_symbol_info` | Native |

**MCP Lean Mode** (ALWAYS): Keep only UnityMCP, jetbrains, claude-mem, github. Remove memory/filesystem/fetch.

#### Anti-Patterns (Never Do)
- Grep/Read when Rider open (use JetBrains)
- Write when Edit works
- Console check after every micro-edit
- Re-read files just edited
- include_properties=true on first pass
- Sequential edit->verify per file (batch instead)

See reference file for detailed tool selection tables and fast workflows.

---

## Scene/Component Wiring (MANDATORY)
**ALL scenes MUST have components with NO missing and NO extra properties.** Validate via console (zero errors). Audit systematically.

---

## MANDATORY: Reuse Check Before Implementation
**Before writing new code, ALWAYS search for existing solutions:**
1. **Codebase** - Grep tool (or `rg`)/`search_in_files` for similar functions
2. **Knowledgebase** - `kbfix`, `kbtag`, `kb "pattern"`
3. **GitHub repos** - `kbrepo "topic"` (520+ repos)
4. **Online docs** - Platform docs for built-in solutions

---

## Code Quality Principles (ALWAYS APPLY)
All features must be: **Fast**, **Modular**, **Simple**, **Scalable**, **Extensible**, **Future-proof**, **Debuggable**, **Maintainable**, **DRY** (search for existing solutions first).

---

## Always Use Todo Lists
- Start every multi-step task with TodoWrite
- One active task at a time, mark done immediately

## Self-Improvement & Pattern Learning
**Encode patterns to**: GLOBAL_RULES.md, project CLAUDE.md, LEARNING_LOG.md
**After 3 failures**: Step back, audit approach, try different strategy

## File Safety (CRITICAL)
- **NEVER delete files** unless user explicitly says "delete" or "remove"
- When in doubt, ask first

## Process & Agent Coordination
- Never kill processes without verification
- **On session start**: `mcp-kill-dupes && unity-mcp-cleanup` + verify claude version
- MCP servers spawn per-app - duplicates waste ~1.5GB RAM

## Unity MCP Quick Fixes
1. **Not Responding**: Unity `Window > MCP for Unity > Start Server`
2. **Config Mismatch**: Restart Claude Code CLI session
3. **Transport**: Use `stdio` (default), not HTTP

## Self-Healing
**Thresholds**: CPU >90% -> kill bg, Memory >95% -> `purge`, MCP >30s -> `mcp-kill-dupes`, Tokens >150K -> `/compact`, Claude outdated -> update npm

## Stall Detection & Auto-Recovery (NON-NEGOTIABLE)
Never wait passively. Any stalled operation MUST be auto-detected and auto-recovered.

**Detection:**
1. **MCP call >60s**: Kill MCP server + clean `Temp/Coplay/MCPRequests/*.json` + retry. 3 failures -> restart Unity.
2. **Unity recompile >30s**: Check Editor.log for errors. No errors -> restart Unity.
3. **Background task >2min no output**: Kill it, retry with different approach.
4. **Same error 3x**: Stop. Check KB, try alternative, or ask user.
5. **Token usage rising, no progress**: Stop loop. Summarize, change strategy.

**Recovery Ladder:** Retry -> Clean state + retry -> Restart service + retry -> Alternative approach -> Ask user

**After Recovery:** Log to LEARNING_LOG.md. If repeatable, add to `_AUTO_FIX_PATTERNS.md`. If workflow gap, add to GLOBAL_RULES.md.

## MCP Auto-Launch (NON-NEGOTIABLE)
- **Never fail because Unity isn't open. Auto-launch it.** All MCP scripts MUST call `./scripts/ensure_unity_editor.sh` first.
- **FastMCP stdio uses NDJSON** (one JSON per line), NOT Content-Length framing.
- **Duplicate MCP processes = instability.** Always deduplicate before spawning.

---

## VERIFICATION DISCIPLINE (NON-NEGOTIABLE)

### Enforcement Hooks (Zero Token Cost)
- `auto-verify.sh` (PostToolUse:Edit|Write) -- auto-runs tsc + jest after edits
- `quality-gate.sh` (Stop) -- blocks stop if compile errors or warns on uncommitted source
- `auto-learn.sh` (PostToolUseFailure) -- logs error patterns to `.kb_buffer/ERROR_PATTERNS.md`

### Test Ladder (Never Skip a Level, Auto-Advance)
```
Code compiles -> Headless tests -> Editor tests -> Device build -> User confirms
```
- **Auto-advance**: Run full ladder automatically. Don't pause unless a level fails.
- **Spec tasks / critical TODOs**: NEVER mark done until full ladder passes AND user confirms

### Test Result Mismatch Protocol
1. **Log** in LEARNING_LOG.md (level passed, level failed, root cause, fix)
2. **Trace to root cause** -- fix underlying issue, not symptom
3. **Auto-implement permanent fix** in hooks/_AUTO_FIX_PATTERNS.md
4. **Save pattern** as template in KB

### Operating Principles (All Tools/IDEs/CLIs)
- **Root cause over symptoms** -- always trace to the actual cause
- **Confirm understanding before acting** -- ambiguity = ask user
- **Proactive flagging** -- surface risks before asked
- **Log key insights** -- LEARNING_LOG.md with tags

## CORE MANDATE: Incrementality & Compounding
**Priority**: User goals with increasing speed, accuracy, automation, simplicity.
- **Simple & modular** -- minimal dependencies, never overcomplicate
- **Reusable & extensible** -- patterns that compound across sessions
- **Fault tolerant** -- hooks fail silently (exit 0)
- **Auto-learning** -- every failure logged, every fix templated
- **Verification Chain**: Headless -> Editor -> Device. Never skip a link.
- **Scalable** -- works regardless of project, CLI, or IDE

---

For detailed workflows, KB commands, and reference material: read ~/GLOBAL_RULES_REFERENCE.md
