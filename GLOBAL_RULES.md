# Global Project Rules

**Applies To**: Claude Code, Windsurf, Cursor, Gemini, Codex, Rider, Unity, ALL AI tools

## ⚠️ CORE LOOP (Anthropic-Aligned)

```
Explore → Plan → Code → Commit → Log discovery
```

**Shortcut for simple tasks**: Search KB → Act → Done

### Highest Leverage Practice: Verification Criteria
**Single most impactful thing**: Give Claude a way to verify its work.

| Before | After |
|--------|-------|
| "implement email validation" | "write validateEmail. tests: user@example.com=true, invalid=false. run tests after" |
| "make dashboard look better" | "[paste screenshot] implement this. take screenshot of result and compare" |
| "build is failing" | "build fails with [error]. fix and verify build succeeds. address root cause" |

### ⚠️ Before ANY Change - Ask Two Questions

**ALWAYS ask before implementing:**

1. **"Do we really need this?"**
   - Is this solving a real problem or a hypothetical one?
   - Is there a simpler alternative?
   - Does the KB already have a solution?

2. **"Could this cause other issues?"**
   - What are the side effects?
   - What breaks if this fails?
   - Is this reversible?

**Examples of good skepticism:**
- Disabling file watchers → Could break git sync detection
- Adding new dependencies → Could conflict with existing packages
- Changing global configs → Could affect other projects
- Auto-fixing without understanding → Could mask root cause

**When in doubt**: Ask user, keep changes minimal, prefer reversible options.

### Quick Reference
- **Session start**: `mcp-kill-dupes`
- **Before coding**: Search `KnowledgeBase/` first → start with `_KB_INDEX.md`
- **On error**: Check `_QUICK_FIX.md`
- **Discovery**: Append to `LEARNING_LOG.md`
- **User patterns**: See `_USER_PATTERNS_JAMES.md`
- **Agents guide**: Keep `AGENTS.md` synchronized with codebase/docs/specs/KB and `CLAUDE.md`.
- **Cross-tool sync**: Keep docs/rules/memory aligned across Codex, Claude Code, and Gemini.
- **KB Index**: `~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_KB_INDEX.md`

### KB Search Commands (Zero Tokens - Always Try First)

```bash
# Priority order (fastest to slowest, all zero main tokens)
kbfix "CS0246"        # 1. Error → Fix lookup (instant)
kbtag "vfx"           # 2. Find pattern files by tag
kb "hologram depth"   # 3. Search all 137 KB files
kbrepo "hand track"   # 4. Search 520+ GitHub repos
ss                    # 5. Screenshot for visual context (→ paste)
ssu                   # 6. Unity window screenshot
```

**Smart Search Patterns**:
```bash
# Combine terms (AND)
kb "depth AND texture"

# Error code + context
kbfix "CS0246" && kb "namespace unity"

# Find then read
kbtag "mcp" | head -3  # → see which files match

# Chain searches
kb "VFX" | grep -i "buffer"  # VFX files mentioning buffer
```

**Common Lookups** (memorize these):
| Need | Command | File |
|------|---------|------|
| Fix error | `kbfix "error"` | _QUICK_FIX.md |
| VFX patterns | `kbtag "vfx"` | _VFX25_*.md |
| MCP reference | `kb "batch_execute"` | _UNITY_MCP_*.md |
| GitHub repos | `kbrepo "hand"` | _MASTER_GITHUB_*.md |
| Token tips | `kb "token"` | _TOKEN_EFFICIENCY_*.md |

**KB + Tool Integration** (holistic decision flow):
```
Error/Question arrives
        │
        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1. kbfix/kbtag  │────▶│ 2. Found?       │────▶│ 3. Apply direct │
│    (0 tokens)   │ No  │    grep KB      │ Yes │    (done)       │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │ No
                                 ▼
                        ┌─────────────────┐
                        │ 4. MCP/Agent?   │
                        │ JetBrains/Unity │
                        └────────┬────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
     ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
     │ JetBrains MCP  │ │ Unity MCP      │ │ Explore Agent  │
     │ C# code search │ │ Editor state   │ │ Multi-file     │
     │ (~100 tokens)  │ │ (~50 tokens)   │ │ (independent)  │
     └────────────────┘ └────────────────┘ └────────────────┘
```

**Full reference**: `KnowledgeBase/_KB_SEARCH_COMMANDS.md`

**Full docs**: `_SIMPLIFIED_INTELLIGENCE_CORE.md`

---

## Architecture Overview

**Full Reference**: `KnowledgeBase/_CROSS_TOOL_ARCHITECTURE.md`

### Shared Resources (All Tools)
```
~/GLOBAL_RULES.md                    ← This file
~/AGENTS.md                          ← Codex compatibility
~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/  ← Pattern library
```

**GitHub Repos**:
- KB: [imclab/xrai](https://github.com/imclab/xrai) (Unity-XR-AI)
- portals_v4: [ryanjbrant/portals_v4](https://github.com/ryanjbrant/portals_v4)
- MetavidoVFX: See `_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md` (520+ repos)

### Tool Selection
| Task | Tool | Notes |
|------|------|-------|
| Implementation | Claude Code + MCP | Primary, best integration |
| Research | Gemini CLI / Antigravity | FREE 1M context |
| Quick edits | Windsurf | Cascade for multi-file |
| Code gen | Codex | AGENTS.md compatible |
| Navigation | Rider + JetBrains MCP | Indexed search |

### Project Quick Commands
**portals_v4** (Unity + React Native):
```bash
./scripts/build_minimal.sh          # Incremental (~5 min)
./scripts/nuclear_clean_build.sh    # Full rebuild (~10 min)
./scripts/capture_device_logs.sh 10 "Unity|Bridge"  # Debug
```

**MetavidoVFX** (VFX Graph):
```bash
manage_vfx(action="vfx_set_float", target="Effect", parameter="Intensity", value=1.5)
batch_execute([{...}, {...}], parallel=true)  # Multiple VFX ops
```

**See**: Project `CLAUDE.md` for full build details

### MCP Servers
| Server | Port | Use |
|--------|------|-----|
| UnityMCP | 6400 | Editor ops |
| JetBrains | 63342 | Search/refactor |
| claude-mem | — | Semantic memory |

**Startup**: `mcp-kill-dupes`

### Agent Decision
- **3+ step task** → Use agent (independent budget)
- **KB lookup** → `kbfix "error"` (0 tokens)
- **Simple edit** → Direct Edit tool

**Agent Chaining** (output → input):
```
Explore "find auth files"
    │ returns: [file1, file2, file3]
    ▼
Plan "design auth refactor for: {files}"
    │ returns: implementation plan
    ▼
Code (direct) using plan
    │
    ▼
Subagent "verify changes in: {files}"
```

**When NOT to Use Agents** (faster direct):
- Single grep/read operation
- Edit to file already in context
- MCP call with known parameters
- KB lookup (`kbfix`, `kbtag`)
- Screenshot paste (`ss`, `ssu`)

### Plugin/Extension Ecosystem

| Category | Examples | Integration Point |
|----------|----------|-------------------|
| **MCP Servers** | UnityMCP, JetBrains, github | `~/.claude/settings.json` |
| **Claude Skills** | /commit, /review, custom | `~/.claude/commands/` |
| **IDE Plugins** | Codeium, Tabnine, Copilot | IDE-specific |
| **Shell Aliases** | kb, kbfix, kbtag | `~/.zshrc` |
| **Git Hooks** | Pre-commit, post-merge | `.git/hooks/` |
| **LaunchAgents** | MCP cleanup, backups | `~/Library/LaunchAgents/` |

### Config File Hierarchy

```
Priority (highest to lowest):
1. Command-line args          claude --model opus
2. Environment vars           CLAUDE_MODEL=opus
3. Project .claude/           ./project/.claude/settings.json
4. User config                ~/.claude/settings.json
5. GLOBAL_RULES.md            ~/GLOBAL_RULES.md
6. Defaults                   Built-in Claude behavior
```

### Cross-Tool Workflows

**Token Budget Rules**:
- Stay <95% weekly limit, warn at 80%
- Auto-reduce verbosity when approaching limit
- Use subagents for 3+ step tasks (independent budgets)
- Never run out before reset - switch tools early

**Rollover (Token Limit)**:
```
Claude Code (200K) → Gemini (1M FREE) → Codex (128K)
All read: GLOBAL_RULES.md, KnowledgeBase/, CLAUDE.md
```

**Parallel Work**:
```
Claude Code: Complex implementation
Gemini: Research (FREE, 1M context)
Rider: Code completion (local, fast)
Unity: Play mode testing
```

**Handoff Pattern**:
```
1. Claude Code hits limit
2. Export: git stash, summary to ROLLOVER_CHECKPOINT.md
3. Switch: gemini or codex
4. Import: "Read ~/GLOBAL_RULES.md and project/CLAUDE.md"
```

### Memory Hierarchy (Speed vs Persistence)

| Type | Speed | Persistence | Token Cost | Best For |
|------|-------|-------------|------------|----------|
| **Conversation** | Instant | Session | Free | Current task |
| **grep KB** | <1s | Permanent | 0 | Pattern lookup |
| **claude-mem** | ~2s | Permanent | ~500 | Semantic recall |
| **LEARNING_LOG** | Instant | Permanent | 0 | Discovery journal |
| **Git history** | ~1s | Permanent | 0 | Code archaeology |

### Automation Layer

| Automation | Trigger | Purpose |
|------------|---------|---------|
| `mcp-kill-dupes` | Session start | Clean duplicate servers |
| `unity-mcp-cleanup` | Session start | Remove stale Unity instances |
| `pattern-indexer.sh` | Manual/cron | Rebuild _PATTERN_TAGS.md |
| `ai-usage-advisor.sh` | Before task | Suggest AI vs manual |
| LaunchAgent backups | Daily | Archive configs |

### Headless Mode (CI/Scripts)
```bash
# One-off query
claude -p "Explain what this project does"

# Structured output
claude -p "List all API endpoints" --output-format json

# Streaming for real-time
claude -p "Analyze this log file" --output-format stream-json

# Fan-out pattern (parallel file processing)
for file in $(cat files.txt); do
  claude -p "Migrate $file to Vue. Return OK or FAIL." --allowedTools "Edit"
done

# Lint integration
"lint:claude": "claude -p 'look at changes vs main, report typos. filename:line then description.'"

# DUPLICATION CHECK (run in CI)
"check:duplication": "claude -p 'Analyze the codebase for duplicated code. Look for: (1) copy-pasted functions, (2) similar logic that could be abstracted, (3) utilities that exist but are reimplemented elsewhere. Report: file:line, duplicate of file:line, suggested refactor. Exit 1 if critical duplication found.'"

# CODE REVIEW (CI pre-merge)
"review:pr": "claude -p 'Review changes in this PR for: (1) code duplication, (2) missing reuse of existing utilities, (3) patterns that contradict codebase conventions. Reference existing code when suggesting improvements.'"
```

### CI Code Review Checks
Add to CI pipeline:
```yaml
# .github/workflows/code-review.yml
- name: Check for duplication
  run: claude -p "Find duplicated code in changes vs main. Report file:line pairs." --output-format json

- name: Check for missed reuse
  run: claude -p "Check if any new code reimplements existing utilities in src/utils/ or src/helpers/. List violations."
```

### Writer/Reviewer Pattern (Quality Boost)
Use separate sessions for writing and reviewing (fresh context = unbiased review):

| Session A (Writer) | Session B (Reviewer) |
|-------------------|---------------------|
| `Implement rate limiter` | |
| | `Review @src/middleware/rateLimiter.ts for edge cases, race conditions` |
| `Apply feedback: [B's output]` | |

---

## ⚠️ TOKEN LIMIT (CHECK EVERY RESPONSE)
**Stay below 95% of weekly/session limits.** If approaching limit: stop non-essential work, summarize, end session.

- **Search Date**: Always include results through current date (2026-01-21). Never limit to past years.
- **Priorities**: Align with `_JT_PRIORITIES.md` from Portals V6.

## Rider + Claude Code Optimization

### MCP Lean Mode (ALWAYS at Rider start)
Keep only essential MCP servers for faster response times:
- ✅ **UnityMCP** - Unity Editor integration
- ✅ **jetbrains** - Rider integration (uses indexed search)
- ✅ **claude-mem** - Persistent memory
- ✅ **github** - Repo operations
- ❌ memory, filesystem, fetch - Redundant, remove if present

```bash
# Run at session start if these are connected:
claude mcp remove memory filesystem fetch 2>/dev/null
```

## Rider + Claude Code + Unity (PRIMARY WORKFLOW)
### Codex Alignment (Required)

Codex also follows the Cross-Tool Integration and Unity MCP Optimization guidance below.

Codex uses the same Tool Selection and Fast Workflows tables below.

#### Tool Selection (Always Pick Best)

| Task | Tool | Params |
|------|------|--------|
| Find files | JetBrains find_files_by_name_keyword | fileCountLimit=25 |
| Search code | JetBrains search_in_files_by_text | maxUsageCount=50, fileMask="*.cs" |
| Read C# | JetBrains get_file_text_by_path | maxLinesCount=300 |
| Edit C# | Claude Edit | (not Write) |
| Symbol info | JetBrains get_symbol_info | line, column |
| Rename | JetBrains rename_refactoring | project-wide |
| Find objects | Unity find_gameobjects | page_size=10 |
| Check errors | Unity read_console | types=["error"], count=5 |
| Components | Unity manage_components | include_properties=false first |

#### Fast Workflows

**Fix Error (3 calls):**
1) read_console(types=["error"], count=3)
2) get_file_text_by_path(path, maxLinesCount=100)
3) Edit(file, old, new)

**Implement Feature (4 calls):**
1) search_in_files_by_text("pattern", fileMask="*.cs", maxUsageCount=5)
2) get_file_text_by_path(match)
3) Edit(file, old, new)
4) read_console(types=["error"], count=3)

**Debug Runtime (4 calls):**
1) read_console(types=["error","warning"], count=10)
2) find_gameobjects(search_term="Name", page_size=5)
3) manage_components(target=id, include_properties=true, page_size=5)
4) get_file_text_by_path(script)

**Rapid Debug Loop (MCP-powered, 30-60% faster):**
Error in Console
  ↓
1) read_console(types=["error"], count=5)
  ↓
2) find_in_file() OR get_file_text_by_path()
  ↓
3) Edit(file, old, new)
  ↓
4) refresh_unity(mode="if_dirty")
  ↓
5) read_console(types=["error"], count=5)
  ↓
6) run_tests() (optional)

#### Additional Fast Workflows

**Refactor/Rename (2 calls):**
1) rename_refactoring(path, oldName, newName) - project-wide
2) read_console(types=["error"], count=5)

**Multi-File Edit (2 calls):**
1) [Edit(f1,...), Edit(f2,...), Edit(f3,...)] - parallel
2) read_console(types=["error"], count=10) - single verify

**VFX Tuning (1 call):**
1) batch_execute([
  {"tool":"manage_vfx","params":{...}},
  {"tool":"manage_vfx","params":{...}}
], parallel=true)

**Run Tests (2 calls):**
1) run_tests(mode="EditMode") → job_id
2) get_test_job(job_id, wait_timeout=60)

#### Session Triggers
- /compact: Context >100K, switching sub-tasks
- /clear: Unrelated task, context >150K
- New session: Context >180K, >2 hours, different project

#### Session Persistence (Prevent Chat Loss)
**Before ending ANY session with uncommitted work:**
```bash
# 1. Commit all changes to git (primary persistence)
git add -A && git commit -m "WIP: <summary>"

# 2. Name session for easy resume
/rename <descriptive-name>

# 3. For complex work, use /save skill
/save  # Creates claude-mem summary

# 4. Check for uncommitted repos
git status  # This repo
cd ~/Documents/GitHub/Unity-XR-AI && git status  # KB repo
```

**Recovery when session lost:**
```bash
# Find recent sessions
ls -lat ~/.claude/projects/-Users-jamestunick-Documents-GitHub-portals-main/*.jsonl | head -10

# Resume by name (if named)
claude --resume <session-name>

# Or resume most recent
claude --continue

# Search history for context
tail -500 ~/.claude/history.jsonl | grep -i "keyword"
```

**Session data locations:**
| Type | Location | Persistence |
|------|----------|-------------|
| Conversations | `~/.claude/projects/<project>/` | Automatic |
| Named sessions | `~/.claude/projects/<project>/sessions-index.json` | Use /rename |
| History | `~/.claude/history.jsonl` | User prompts only |
| Todos | `~/.claude/todos/` | Per-session |
| claude-mem | `~/.claude-mem/chroma/` + `.db` | Semantic memories |

**Best practice**: Commit + /rename before any `/clear` or session end.

#### Common C# Fixes (Don't Research)
- CS0246 → Add using
- CS0103 → Check spelling or add using
- CS0029 → Add explicit cast
- NullRef in AR → TryGetTexture pattern

#### Anti-Patterns (Never Do)
- Grep/Read when Rider open (use JetBrains)
- Write when Edit works
- Full hierarchy when find_gameobjects suffices
- Console check after every micro-edit
- Re-read files just edited
- Search without fileMask scope
- include_properties=true on first pass
- Sequential edit→verify per file (batch instead)
- Polling test status (use wait_timeout)

---

## Cross-Tool Integration

### Shared Resources (Symlinked)
```
~/GLOBAL_RULES.md              ← This file (Single Source of Truth)
├── ~/.claude/CLAUDE.md        ← Claude Code specific
├── ~/.windsurf/CLAUDE.md      → ~/CLAUDE.md
├── ~/.cursor/CLAUDE.md        → ~/CLAUDE.md
└── project/CLAUDE.md          ← Project overrides

Knowledgebase (all tools access):
~/.claude/knowledgebase/       → Unity-XR-AI/KnowledgeBase/
~/.windsurf/knowledgebase/     → Unity-XR-AI/KnowledgeBase/
~/.cursor/knowledgebase/       → Unity-XR-AI/KnowledgeBase/
```

### MCP Consistency (No Conflicts)
All IDE tools use same Unity MCP config (v9.0.1):
- Claude Code: `~/.claude/settings.json`
- Windsurf: `~/.windsurf/mcp.json`
- Cursor: `~/.cursor/mcp.json`

### Rollover When Token Limits Reached
When Claude Code hits limits, switch to Gemini or Codex:
```bash
# Quick switch (knowledge base available in all tools)
gemini    # FREE, 1M context
codex     # 128K context

# Both read same files: GLOBAL_RULES.md, CLAUDE.md, KnowledgeBase/
```

**Rollover Context Block** (paste in new tool):
```
Read these for context:
1. ~/GLOBAL_RULES.md - Universal rules
2. ~/Documents/GitHub/Unity-XR-AI/CLAUDE.md - Project overview
3. ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_QUICK_FIX.md - Error fixes
```

**Full guide**: `KnowledgeBase/_CROSS_TOOL_ROLLOVER_GUIDE.md`

### Integration Map
See: `KnowledgeBase/_TOOL_INTEGRATION_MAP.md`

---

### Prefer JetBrains MCP Tools (MANDATORY when Rider open)
**ALWAYS use JetBrains MCP over raw tools** - indexed searches are 5-10x faster.

| Instead Of | Use This | Speed |
|------------|----------|-------|
| Grep | `search_in_files_by_text` | 10x |
| Grep (regex) | `search_in_files_by_regex` | 10x |
| Glob | `find_files_by_name_keyword` | 5x |
| Read | `get_file_text_by_path` | 2x |
| LSP | `get_symbol_info` | Native |

**Key params**: `maxUsageCount=50`, `fileMask="*.cs"`, `maxLinesCount=500`

**Rule**: If Rider is open, NEVER use raw Grep/Glob/Read for project files.

### Unity MCP Optimization (Token-Efficient)

**Token Savings Matrix**:
| Default | Optimized | Savings |
|---------|-----------|---------|
| Individual calls | `batch_execute` | **10-100x** |
| `include_properties=true` | `=false` | **5-10x** |
| `generate_preview=true` | `=false` | **10x+** |
| Full console | `types=["error"]` | **3-5x** |
| Polling tests | `wait_timeout=60` | **10x fewer calls** |

**Resources vs Tools** (CRITICAL):
- **Resources** = Read-only, use for state checks: `editor_state`, `project_info`, `gameobject/{id}`
- **Tools** = Mutations: `manage_*`, `script_apply_edits`, `batch_execute`

**Console Checking**:
```
read_console:
  count: 5                   # Small batch
  types: ["error"]           # Filter to errors only (skip log/warning)
  include_stacktrace: false  # Skip unless debugging
```

**Scene Hierarchy** (can be huge):
```
manage_scene(action="get_hierarchy"):
  page_size: 50              # Start small
  max_depth: 3               # Limit nesting
  max_nodes: 100             # Cap total
  cursor: <next_cursor>      # Paginate, don't fetch all
```

**Asset Search**:
```
manage_asset(action="search"):
  page_size: 25              # Keep small
  generate_preview: false    # CRITICAL - previews add huge base64
```

**GameObject Components**:
```
manage_gameobject(action="get_components"):
  include_properties: false  # Metadata only first
  page_size: 10              # Small pages
```

**Test Running** (async pattern):
```
1. run_tests(mode="EditMode") → returns job_id
2. get_test_job(job_id, wait_timeout=30, include_details=false)
3. Only include_failed_tests=true if failures found
```

**Script Validation** (before full read):
```
validate_script(uri, level="basic")  # Quick syntax check
get_sha(uri)                          # Metadata without content
```

**Batch Operations** (10-100x savings for repetitive tasks):
```
batch_execute(commands=[
  {"tool": "manage_gameobject", "params": {...}},
  {"tool": "manage_gameobject", "params": {...}},
  ...
], parallel=true)
# One call instead of 5-25 separate calls
```

**Find GameObjects** (use instance IDs):
```
find_gameobjects(search_term="Player", search_method="by_name", page_size=10)
# Returns IDs only - lightweight
# Then fetch specific: manage_gameobject(target=<id>, search_method="by_id")
```

**Script Editing** (prefer structured over raw):
```
script_apply_edits > apply_text_edits > manage_script
# Structured edits = smaller payloads, safer
```

**VFX Management** (action prefixes):
```
particle_* → ParticleSystem
vfx_*      → VisualEffect (VFX Graph)
line_*     → LineRenderer
trail_*    → TrailRenderer

# Common: vfx_set_float, vfx_send_event, vfx_play/stop
manage_vfx({action: "vfx_set_float", target: "HologramVFX", parameter: "Intensity", value: 2.5})
```

**Script Validation** (Roslyn if enabled):
```
validate_script(uri, level="standard")  # Catches errors pre-compile
get_sha(uri)                            # Metadata without content
# Enable Roslyn: Add USE_ROSLYN to Scripting Define Symbols
```

**Editor State Check** (before batch ops):
```
# Read resource: mcpforunity://editor/state
# Verify: advice.ready_for_tools === true
# Skip if just completed successful operation
```

**Refresh Unity** (don't over-refresh):
```
refresh_unity(mode="if_dirty", scope="scripts", wait_for_ready=true)
# Only refresh what changed, wait once
# DON'T: refresh after every edit
```

**Editor State** (check before operations):
```
manage_editor(action="telemetry_status")
# Quick ping - is Unity responsive?
# Skip if you just did an operation successfully
```

**Caching Strategies**:
- Remember instance IDs from find_gameobjects (don't re-search)
- Remember asset paths from searches (don't re-search)
- Skip re-reading files you just edited
- Trust edit success (don't verify unless error)

**Avoid Redundant Operations**:
- Don't check console after every micro-edit
- Don't refresh after read-only operations
- Don't fetch hierarchy to find one object (use find_gameobjects)
- Don't get_components when you only need transform

**Scene/Component Wiring (MANDATORY)**:
**ALL scenes MUST have components with NO missing and NO extra properties.**

Before considering any scene setup complete:
1. **No missing properties** - Every serialized field has a valid reference
2. **No extra properties** - No orphaned objects, no legacy patterns, no broken refs
3. **Validate via console** - Zero errors, zero "missing reference" warnings
4. **Audit systematically** - Grep/search scene files to verify component counts

**Always check**:
- Serialized references (not null, valid GUID)
- Asset references (PanelSettings, Materials, Prefabs)
- Singleton dependencies (do required singletons exist in scene?)
- Architecture patterns (using current approach per project CLAUDE.md)

### Context Management
- `/compact` - Mid-task when context grows
- `/clear` - Fresh start for new tasks
- `/rewind` or `Esc+Esc` - Restore to checkpoint
- `/rename <name>` - Name sessions for later resume
- `claude --continue` - Resume most recent session
- `claude --resume <name>` - Resume by name
- `claude --from-pr 123` - Resume session linked to PR
- `claude --fork-session` - Branch conversation, preserve history
- `claude --dangerously-skip-permissions` - Bypass all checks (use in sandbox only)
- `claude --permission-mode plan` - Start in read-only plan mode
- `claude --add-dir ../other-repo` - Include additional directories
- `claude --print-system-prompt` - Debug: show full system prompt
- `claude --verbose` - Show detailed execution info

### Common Failure Patterns (Avoid These)

| Pattern | Problem | Fix |
|---------|---------|-----|
| Kitchen sink session | Context full of unrelated info | `/clear` between tasks |
| Repeated corrections | Failed approaches pollute context | After 2 failures, `/clear` + better prompt |
| Over-specified CLAUDE.md | Rules get ignored | Ruthlessly prune, convert to hooks |
| Trust-then-verify gap | Plausible but broken code | Always provide verification criteria |
| Infinite exploration | Context consumed by investigation | Scope narrowly or use subagents |

### Git Worktrees for Parallel Sessions
```bash
git worktree add ../project-feature-a -b feature-a  # Create isolated worktree
cd ../project-feature-a && claude                    # Run Claude in isolation
git worktree list                                    # Manage worktrees
git worktree remove ../project-feature-a            # Clean up when done

# Shell aliases for instant switching (team favorite)
alias za='cd ~/worktrees/project-a && claude'
alias zb='cd ~/worktrees/project-b && claude'
alias zc='cd ~/worktrees/project-c && claude'
```

**Pro tip**: Dedicated "analysis" worktree for read-only work (logs, BigQuery).

### Power Prompts (Claude Code Team Tips)

| Technique | Prompt |
|-----------|--------|
| Challenge | "Grill me on these changes and don't make a PR until I pass your test" |
| Prove it | "Prove to me this works" - diff behavior main vs feature |
| Elegant redo | "Knowing everything you know now, scrap this and implement the elegant solution" |
| Self-improve | "Update your CLAUDE.md so you don't make that mistake again" |
| Interview | "Interview me about this feature using AskUserQuestion. Ask about edge cases, tradeoffs, UI/UX" |
| Visual verify | "[paste screenshot] implement this. take screenshot of result and compare" (use Chrome extension) |

### Notes Directory Pattern
Maintain a `notes/` directory per task/project, updated after every PR. Point CLAUDE.md at it:
```markdown
# In CLAUDE.md
See @notes/ for task-specific context and decisions.
```

### Plan Mode Mastery
- Start **every complex task** in plan mode (`Shift+Tab` twice)
- Pour energy into the plan → Claude 1-shots implementation
- **When sideways**: Switch back to plan mode, don't keep pushing
- Use plan mode for **verification steps**, not just builds

### MANDATORY: Reuse Check Before Implementation
**Before writing new code, ALWAYS search for existing solutions:**

1. **Codebase** - `grep`/`search_in_files` for similar functions, utilities, patterns
2. **Knowledgebase** - `kbfix`, `kbtag`, `kb "pattern"` for documented solutions
3. **GitHub repos** - `kbrepo "topic"` for reference implementations (520+ repos)
4. **Online docs** - Unity/React/platform docs for built-in solutions

```
# In plan mode, always include:
"Search codebase for existing utilities that could handle X"
"Check if similar pattern exists in KB or referenced repos"
"Look for built-in API/framework solution before custom code"
```

**Anti-pattern**: Writing new code when reusable function exists elsewhere.

### Subagent Patterns
- Append **"use subagents"** to any request for more compute
- Offload individual tasks → keeps main context clean
- Example: "investigate auth token refresh using subagents"

### Voice Dictation (3x Faster Prompts)
- **macOS**: Press `fn` twice → speak → detailed prompts
- More specific = better output

---

## Debugging & Iteration Protocols

### State-of-the-Art Debugging
- **Isolate**: Binary search - Unity vs React Native vs Bridge vs Deployment
- **Verbose Fallback**: If automated script fails, run raw command with `--verbose`
- **Automated Verification**: Use `verify_device_logs.sh`, never ask user to read device screens
- **Auto Test & Continue**: Test programmatically after deploy, iterate until confirmed working

### Multi-Layer Verbose Logging
Four-channel output: (1) Unity Console, (2) NSLog/Native, (3) File Log, (4) On-Screen Overlay
**Reference**: `knowledgebase/_UNITY_RN_DEBUG_PATTERNS.md` for implementation

### MCP-First Verification Loop
Before ANY device build:
1. `read_console(types=["error"])` - No compilation errors
2. `manage_scene(action="get_hierarchy")` - Scene structure correct
3. Custom validation menu items
**30-second check vs 15-minute rebuild** - Always validate first.

### Auto-Fix Console Errors (PROACTIVE + TOKEN-EFFICIENT)
**Check and fix Unity console errors automatically** - don't wait for user to ask.

**Efficient Pattern**:
```
1. read_console(types=["error"], count=5)     # Errors only, small batch
2. If errors: read ONLY the specific file mentioned
3. Fix with Edit (not Write)
4. read_console(types=["error"], count=5)     # Verify fix
5. Stop when clean (don't over-check)
```

**Common fixes** (don't research, just apply):
- Missing `using` → Add namespace import
- Missing reference → Check asmdef dependencies
- Type mismatch → Check API changes
- Null reference → Add null checks

**DON'T**: Read multiple files speculatively, fetch full stacktraces unless stuck

### Unity Editor Play Mode Testing (BEFORE BUILD)
**Always test changes in Unity Editor Play Mode before iOS build.**
1. Open Unity Editor if not running
2. Enter Play Mode to test changes
3. Verify behavior works as expected
4. Check console for errors
5. THEN proceed to build & deploy

### Iteration Speed
- **Skip Unchanged**: Use `--skip-unity-export`, `--skip-pod-install` for 90% time savings
- **Framework Persistence**: `UnityFramework.framework` is ephemeral in DerivedData - verify exists
- **Live Reload First**: Validate in RN (fast refresh) or Unity (Play Mode) before full build

### Persistent Failures (Nuclear Option)
- **Kill**: `killall -9 Unity Hub xcodebuild java`
- **Purge**: `rm -rf ~/Library/Developer/Xcode/DerivedData ios/build ios/Pods android/build`
- **Reboot**: If stuck >30 mins

### Best Practices
- **Single Source of Truth**: Fix pipelines, not manual copy-paste
- **Adhere to Standards**: Use CocoaPods/Unity Build Player, not custom bypass scripts
- **Reproducibility**: If you can't script it, don't do it

### Code Quality Principles (ALWAYS APPLY)
All features must be:
- **Fast** - Performance-first design, minimize allocations, profile hot paths
- **Modular** - Single responsibility, clear interfaces, dependency injection
- **Simple** - Obvious code > clever code, minimal abstractions
- **Scalable** - O(1) or O(log n) algorithms, pagination, pooling
- **Extensible** - Open/closed principle, strategy pattern, plugin architecture
- **Future-proof** - Interfaces over concrete types, version tolerance
- **Debuggable** - Clear logging, debug flags, inspector exposure
- **Maintainable** - Consistent naming, documented edge cases, test coverage
- **DRY** - Search for existing solutions BEFORE writing new code (see Reuse Check)

### Research Strategy
- **Verify Sources**: Official docs, trusted repos, expert forums
- **No Assumptions**: "I verified in 2025 Unity Manual" required
- **Triple Check**: Validate against current constraints before coding

---

## Spec-Driven Development & Task Management

### Always Use Todo Lists
- Start every multi-step task with TodoWrite
- One active task at a time, mark done immediately
- Add discovered tasks as they emerge

### Spec-Kit Workflow
**Reference**: `KnowledgeBase/_SPEC_KIT_METHODOLOGY.md`

```
/speckit.specify → /speckit.plan → /speckit.tasks → /speckit.implement
```

**Use specs for**: >100 LOC, architecture changes, cross-team work
**Skip specs for**: Bug fixes, <50 LOC, config tweaks

---

## Self-Improvement & Pattern Learning

**Encode patterns to**: GLOBAL_RULES.md, project CLAUDE.md, LEARNING_LOG.md

**After correction**: "Update your CLAUDE.md so you don't make that mistake again."

**After 3 failures**: Step back, audit approach, try different strategy

**New discovery?** → Log to `LEARNING_LOG.md`

---

## File Safety (CRITICAL)

### Never Delete Without Permission
- **NEVER delete files** unless user explicitly says "delete" or "remove"
- Moving, renaming, deprecating = OK
- Deleting = ONLY with explicit instruction
- When in doubt, ask first

---

## Process & Agent Coordination

### Process Awareness
- Never kill processes without verification
- Check ownership: `ps aux | grep <process>`
- Respect user background tasks

### MCP Server Management
- **On session start**: Run `mcp-kill-dupes && unity-mcp-cleanup` to clean up duplicates and stale Unity instances
- MCP servers spawn per-app (Claude Code, Claude Desktop, VS Code) - duplicates waste ~1.5GB RAM
- Aliases: `mcp-ps` (running), `mcp-count`, `mcp-mem`, `mcp-kill-dupes`, `mcp-kill-all`
- **Unity MCP cleanup**: `unity-mcp-cleanup` removes stale `~/.unity-mcp/` status files for closed projects

### Agent Parallelism
| Safe | Independent reads, non-overlapping writes |
| Caution | Same-domain operations |
| Avoid | Resource contention, shared state mutation |

### Cross-Tool Awareness
- Shared: `DerivedData`, `node_modules`, `Pods`, Unity `Library/`
- Respect lock files regardless of which tool created them
- One tool to Unity MCP at a time
- No parallel git operations

### Device Availability
- Check before operations: `xcrun devicectl list devices` / `adb devices`
- If unavailable: inform user, do useful work instead of blocking
- iOS needs unlock for launching/debugging

---

## Cross-Tool Memory Architecture

**Principle**: Files are memory. Knowledgebase IS your AI memory.

| Pattern Type | Store In |
|--------------|----------|
| Universal rules | `GLOBAL_RULES.md` |
| Discoveries | `LEARNING_LOG.md` |
| Tool-specific | `~/.{tool}/*.md` |
| Structured facts | MCP Memory entities |
| Project-specific | `project/CLAUDE.md` |

**Reference**: `knowledgebase/_AI_MEMORY_SYSTEMS_DEEP_DIVE.md`

---

## Unity MCP Server (Claude Code)

**Quick Fixes**:
1. **Not Responding**: Unity `Window > MCP for Unity > Start Server`
2. **Config Mismatch**: Restart Claude Code CLI session
3. **Transport**: Use `stdio` (default), not HTTP

After Unity Build: MCP stops during headless builds. Restart Unity Editor to reconnect.

---

## Intelligence Patterns (Auto-Active)

| Domain | Activation | Reference |
|--------|------------|-----------|
| Unity | "Using Unity Intelligence patterns" | `_UNITY_INTELLIGENCE_PATTERNS.md` |
| WebGL | "Using WebGL Intelligence patterns" | `_WEBGL_INTELLIGENCE_PATTERNS.md` |
| 3DVis | "Using 3DVis Intelligence patterns" | `_3DVIS_INTELLIGENCE_PATTERNS.md` |

**Covers**: AR/VFX, DOTS optimization, WebGPU, Three.js, data visualization algorithms

---

## Token Efficiency (MANDATORY)

**Goal**: Stay below 95% weekly limit. **Full Reference**: `KnowledgeBase/_TOKEN_EFFICIENCY_COMPLETE.md`

### Quick Rules
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

### Key Commands
`/cost` `/stats` `/clear` `/compact` `/model` `/rename` `/rewind`

### Responses
- Concise, no preambles, bullets over prose
- No emoji, no summaries, no "feel free to ask"
- Don't re-summarize previous work
- Trust that user remembers recent exchanges
- End turns promptly when task complete

### Platform Build Optimization (Quick Reference)

**Xcode/iOS**: Build Active Arch=YES, Compilation Cache (24-77% faster)
**Android**: Gradle cache, IL2CPP "Faster builds", Quick Preview
**WebGL**: LTO, Brotli, Strip Engine Code (7MB→2MB)
**Quest**: Runtime Optimizer, Foveation, max 1K draw calls
**Unity Play Mode**: Disable Domain/Scene Reload (60% faster)

### AI CLI Tools (Quick Reference)

**Claude CLI**: `-p`, `--output-format json`, `/clear`, `/compact`
**Gemini CLI**: FREE 60 req/min, 1M context, Google Search grounding
**Codex CLI**: Compaction (multi-context), 75% cache discount, 94% fewer tokens
**VS Code**: Codeium (free/fast), Tabnine (local), llama.vscode (local LLM)

### Prompt Engineering (Quick Reference)

- Concise prompts: 30-50% token reduction
- RAG + Vector DB: Up to 70% context reduction
- XML tags for Claude: `<task>`, `<context>`
- Multi-AI: Claude (complex) + Gemini (research/free) + Codex (refactors)

See `KnowledgeBase/_TOKEN_EFFICIENCY_COMPLETE.md` for full details.

---

## Self-Healing

**Thresholds**: CPU >90% → kill bg, Memory >95% → `purge`, MCP >30s → `mcp-kill-dupes`, Tokens >150K → `/compact`

**Session start**: `mcp-kill-dupes && unity-mcp-cleanup`
**Reference**: `KnowledgeBase/_SELF_HEALING_SYSTEM.md`

---

## Automation & Agents

**Hooks**: `~/.claude/hooks/` (auto-detect modes, failure tracking, health checks)

**Key Agents**: `unity-error-fixer`, `vfx-tuner`, `parallel-researcher`, `tech-lead`, `mcp-tools-specialist`

**Key Files**: `_QUICK_FIX.md` (errors), `_AUTO_FIX_PATTERNS.md` (121 patterns), `LEARNING_LOG.md` (discoveries)

**Loop**: Error → `kbfix` → Fix → Log if new

**Reference**: `KnowledgeBase/_SYSTEM_ARCHITECTURE.md`
