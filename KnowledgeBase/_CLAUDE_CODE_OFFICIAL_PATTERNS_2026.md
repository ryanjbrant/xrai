# Claude Code Official Patterns (2026-02-08)

**Source**: Official Claude Code documentation (19 pages)
**Purpose**: Consolidated reference of official architecture, configuration, and optimization patterns
**Validation**: Anthropic's production deployment, cross-referenced with ACE-FCA patterns

---

## Quick Reference

**Core Architecture**: Agentic loop (gather context → take action → verify results)
**Context Target**: 40-60% utilization (80-120K for 200K budget) per ACE-FCA
**Permission Hierarchy**: Managed > CLI > Local > Project > User
**Extension Priority**: CLAUDE.md → Skills → MCP → Subagents → Hooks

---

## Architecture Patterns

### The Agentic Loop

**Three-phase cycle**:
1. **Gather context**: Search files, read code, understand dependencies
2. **Take action**: Edit files, run commands, create PRs
3. **Verify results**: Run tests, check console, validate output

**Key insights**:
- Phases blend together, not strictly sequential
- User can interrupt at any point to steer
- Model reasons, tools execute, harness orchestrates
- Each tool use returns info that feeds next decision

**Tool categories**:
- File operations: Read, Edit, Write
- Search: Glob, Grep (or LSP with code intelligence plugins)
- Execution: Bash, git, build tools
- Web: WebFetch, WebSearch
- Orchestration: Task (subagents), AskUserQuestion, LSP

### Context Management

**What loads when**:
- **Session start**: CLAUDE.md (full), MCP tool schemas, skill descriptions
- **On demand**: Skill full content (when invoked or auto-loaded)
- **Per turn**: Conversation history, tool results, file contents
- **Subagents**: Isolated context with specified skills preloaded

**Context window phases**:
1. **Under 40%**: Add more context (research, examples)
2. **40-60% (optimal)**: Sweet spot for complex tasks
3. **Over 60%**: Noise degrades quality, trigger compaction

**Compaction strategies**:
- Automatic: Clear old tool outputs, then summarize conversation
- Manual `/compact`: With focus instructions
- Selective: Preserve requests and key code, lose detailed instructions
- Targeted: `/rewind` + "Summarize from here" (compress middle only)

**Context costs by feature**:
| Feature | Load time | Context cost | Optimization |
|---------|-----------|--------------|--------------|
| CLAUDE.md | Session start | Every request | Keep <500 lines, move reference to skills |
| Skills | Session start (descriptions) | Low until used | `disable-model-invocation: true` for manual-only |
| MCP servers | Session start | All tool schemas | Tool search defers >10% context |
| Subagents | On spawn | Isolated (zero parent cost) | Use for tasks that don't need full context |
| Hooks | On trigger | Zero unless returns context | Ideal for side effects |

### Session Lifecycle

**Session continuity**:
- `claude --continue`: Resume same session ID, append messages
- `claude --continue --fork-session`: New ID, preserve history up to that point
- Multiple terminals, same session: Messages interleave (avoid, use fork instead)

**Checkpointing**:
- Automatic: Before every file edit
- Scope: File changes only (not git, not remote systems)
- Access: `Esc` twice or `/rewind` menu
- Actions: Restore code, restore conversation, restore both, summarize from point

**Cleanup**:
- Sessions auto-delete after 30 days (configurable)
- Checkpoints persist with sessions
- Git worktrees enable parallel sessions without conflict

---

## Configuration Patterns

### Settings Hierarchy (Precedence Order)

1. **Managed** (highest) - System-level, IT-deployed, cannot override
2. **Command line** - Session-specific flags
3. **Local** (`.claude/settings.local.json`) - Personal project settings, gitignored
4. **Project** (`.claude/settings.json`) - Team-shared, committed
5. **User** (lowest) (`~/.claude/settings.json`) - Personal global settings

**Managed settings locations** (require admin):
- macOS: `/Library/Application Support/ClaudeCode/managed-settings.json`
- Linux/WSL: `/etc/claude-code/managed-settings.json`
- Windows: `C:\Program Files\ClaudeCode\managed-settings.json`

**Key managed controls**:
- `allowedMcpServers` / `deniedMcpServers`: Restrict MCP by name/command/URL
- `strictKnownMarketplaces`: Whitelist plugin sources
- `allowManagedHooksOnly`: Block user/project/plugin hooks
- `allowManagedPermissionRulesOnly`: Enforce org-wide permission rules
- `forceLoginMethod`: Control auth method
- `CLAUDE_CODE_MAX_OUTPUT_TOKENS`: Token limits

### Permission Modes

**Four modes** (cycle with `Shift+Tab`):
1. **Default** (Ask): Prompt before file edits and Bash commands
2. **Auto-accept edits** (Code): Auto-approve file edits, ask for Bash
3. **Plan**: Read-only tools only, creates plan for approval
4. **Delegate** (Agent teams only): Coordinate through teammates, no direct implementation

**Permission rule syntax**:
- `Tool` matches any use of that tool
- `Tool(specifier)` filters by parameter (e.g., `Bash(npm *)`)
- Space before `*` for prefix matching: `Bash(git diff *)` allows `git diff`, not `git diff-index`

**Rule precedence**:
1. `deny` rules (evaluated first)
2. `ask` rules
3. `allow` rules (evaluated last)

**Example configuration**:
```json
{
  "permissions": {
    "deny": ["Read(./.env*)", "Bash(rm -rf *)"],
    "allow": ["Bash(npm run *)", "Bash(git *)"]
  }
}
```

### MCP Configuration

**Installation scopes**:
- **Local** (default): User-specific for current project (`~/.claude.json`)
- **Project**: Shared via `.mcp.json` (version controlled)
- **User**: Personal across all projects (`~/.claude.json`)

**Managed restrictions**:
- `allowedMcpServers`: Whitelist by serverName, serverCommand, or serverUrl
- `deniedMcpServers`: Blacklist (takes precedence over allowlist)
- URL patterns support wildcards: `https://mcp.company.com/*`
- Command arrays must match exactly (command + all args in order)

**Tool Search** (scales MCP):
- Enabled by default when tools exceed 10% of context
- Defers tool loading until Claude searches for them
- Configure: `ENABLE_TOOL_SEARCH=auto:5` (5% threshold) or `true`/`false`
- Requires Sonnet 4+ or Opus 4+ (Haiku not supported)

**OAuth 2.0 patterns**:
- `/mcp` command for authentication flow
- Pre-configured credentials: `--client-id`, `--client-secret`, `--callback-port`
- Tokens stored securely, refreshed automatically
- Clear auth: `/mcp` → "Clear authentication"

**Dynamic updates**:
- MCP servers can send `list_changed` notifications
- Claude Code automatically refreshes capabilities
- No reconnect required

---

## Extension Patterns

### When to Use What

**Decision matrix**:
| Need | Use | Why |
|------|-----|-----|
| Always-on context | CLAUDE.md | Loaded every session, persistent rules |
| Reusable workflows | Skill | On-demand loading, invocable with `/<name>` |
| External connections | MCP | Protocol for external services |
| Context isolation | Subagent | Fresh context, only summary returns |
| Parallel coordination | Agent teams | Independent sessions with shared tasks |
| Deterministic automation | Hook | No LLM, predictable scripts |
| Bundle features | Plugin | Package skills/hooks/MCP for distribution |

**Combinations**:
- **Skill + MCP**: MCP provides connection, skill documents how to use it (e.g., MCP connects to DB, skill has schema docs)
- **Skill + Subagent**: Skill spawns isolated workers (e.g., `/review` kicks off security/performance/style subagents)
- **CLAUDE.md + Skills**: CLAUDE.md has rules, skills have reference material (e.g., CLAUDE.md says "follow API conventions," skill contains full API guide)
- **Hook + MCP**: Hook triggers external actions (e.g., post-edit hook sends Slack notification via MCP)

### Skills Architecture

**File structure**:
```
skills/
└── skill-name/
    ├── SKILL.md       # Frontmatter + instructions
    ├── reference.md   # Optional additional docs
    └── scripts/       # Optional supporting files
```

**Frontmatter schema**:
```yaml
---
name: skill-name
description: When Claude should use this skill
context: fork              # Optional: "fork" for isolated context
agent: general-purpose     # Optional: subagent type if context=fork
allowed-tools: Read,Grep   # Optional: tool restrictions
model: haiku              # Optional: model override
disable-model-invocation: true  # Optional: manual-only (saves context)
hooks:                    # Optional: skill-scoped hooks
  PostToolUse:
    - matcher: "Write|Edit"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
---
```

**Loading behavior**:
- Session start: Names + descriptions load (for model decision-making)
- On use: Full content loads into conversation
- With `disable-model-invocation: true`: Zero cost until manually invoked
- In subagents: Skills specified in `skills:` field are fully preloaded at launch

**Build criteria** (from skills patterns):
- 3+ repetitions of same multi-step task
- 5+ tool calls for mechanical work
- >20% token savings from preloading vs on-demand reads
- Reusable across projects

### Subagent Architecture

**Scopes** (override precedence):
1. Managed (admin-controlled)
2. CLI flag (`claude --agents '{...}'`)
3. Project (`.claude/agents/`)
4. User (`~/.claude/agents/`)
5. Plugin (bundled with plugin)

**Definition schema**:
```yaml
---
name: agent-name
description: When to invoke this agent
tools: Read,Grep,Glob      # Optional: restrict tools
disallowedTools: Bash      # Optional: deny specific tools
model: sonnet              # Optional: model override
skills: skill1,skill2      # Optional: preload skills
maxTurns: 50               # Optional: turn limit
---
System prompt for agent describing role and behavior.
```

**Context isolation**:
- Fresh context window
- System prompt shared with parent (for cache efficiency)
- Skills in `skills:` field are fully preloaded
- CLAUDE.md and git status inherited from parent
- No conversation history from parent
- Results return as summary only

**When to use**:
- Task requires reading many files but only needs summary
- Context window in parent is getting full
- Parallel research (spawn multiple for different angles)
- Specialized worker with restricted tools (e.g., read-only researcher)

**Subagent vs Agent Team**:
| Aspect | Subagent | Agent Team |
|--------|----------|------------|
| Context | Reports to parent only | Fully independent with peer messaging |
| Coordination | Parent manages all work | Shared task list, self-coordination |
| Token cost | Lower (summary only) | Higher (each is full Claude instance) |
| Best for | Focused tasks | Complex work requiring collaboration |

### Hook Architecture

**Hook events** (in lifecycle order):
1. `SessionStart`: Session begins/resumes
2. `UserPromptSubmit`: User submits prompt
3. *[Agentic loop begins]*
4. `PreToolUse`: Before tool execution (can block)
5. `PermissionRequest`: Permission dialog shown (can auto-approve)
6. `PostToolUse`: After tool success
7. `PostToolUseFailure`: After tool failure
8. `SubagentStart`: Subagent spawned
9. `SubagentStop`: Subagent finishes (can prevent stop)
10. `Stop`: Agent finishes (can prevent stop)
11. `TeammateIdle`: Agent team member idle (can prevent)
12. `TaskCompleted`: Task marked done (can prevent)
13. *[Loop continues or ends]*
14. `PreCompact`: Before compaction
15. `SessionEnd`: Session terminates

**Hook types**:
- **Command** (`type: "command"`): Shell script receives JSON on stdin, controls via exit codes + JSON stdout
- **Prompt** (`type: "prompt"`): LLM evaluates with single turn, returns `{"ok": true/false, "reason": "..."}`
- **Agent** (`type: "agent"`): Subagent with tools (Read, Grep, Glob) verifies conditions, returns `{"ok": ...}`

**Exit code patterns**:
- **0**: Success, parse stdout JSON for decisions
- **2**: Blocking error, stderr fed to Claude (tool blocked for PreToolUse, etc.)
- **Other**: Non-blocking error, stderr shown in verbose mode

**JSON decision control** (exit 0 required):
```json
{
  "continue": false,              // Universal: stop Claude entirely
  "stopReason": "Build failed",   // Universal: message to user
  "suppressOutput": true,         // Universal: hide stdout from verbose
  "systemMessage": "Warning...",  // Universal: warning to user
  "hookSpecificOutput": {         // Event-specific controls
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny", // PreToolUse: allow/deny/ask
    "permissionDecisionReason": "Dangerous command",
    "updatedInput": {...},        // PreToolUse/PermissionRequest: modify tool params
    "additionalContext": "..."    // Various: add context to conversation
  }
}
```

**Matcher patterns** (regex):
| Event | Matches on | Example values |
|-------|------------|----------------|
| Tool events | tool name | `Bash`, `Edit\|Write`, `mcp__.*` |
| SessionStart | how started | `startup`, `resume`, `clear`, `compact` |
| SessionEnd | why ended | `clear`, `logout`, `prompt_input_exit`, `other` |
| Notification | type | `permission_prompt`, `idle_prompt`, `auth_success` |
| SubagentStart/Stop | agent type | `Bash`, `Explore`, `Plan`, custom names |
| PreCompact | trigger | `manual`, `auto` |

**Async hooks**:
- `"async": true` runs in background without blocking
- Only for `type: "command"` hooks
- Cannot return decisions (action already proceeded)
- Output delivered on next conversation turn
- Use for: tests, deployments, external API calls

**Security best practices**:
- Always quote shell variables: `"$VAR"` not `$VAR`
- Validate and sanitize inputs
- Block path traversal (check for `..`)
- Use absolute paths: `"$CLAUDE_PROJECT_DIR"` for project root
- Skip sensitive files: `.env`, `.git/`, keys

### Plugin Architecture

**Plugin components**:
- **Skills**: `skills/` directory with `<name>/SKILL.md` structure
- **Agents**: `agents/` directory with markdown files
- **Hooks**: `hooks/hooks.json` or inline in `plugin.json`
- **MCP servers**: `.mcp.json` or inline in `plugin.json`
- **LSP servers**: `.lsp.json` or inline in `plugin.json` (requires binary installed)

**Plugin manifest** (`.claude-plugin/plugin.json`):
```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "Plugin description",
  "commands": "./custom/commands/",  // Optional
  "agents": "./custom/agents/",      // Optional
  "skills": "./custom/skills/",      // Optional
  "hooks": "./config/hooks.json",    // Optional
  "mcpServers": "./.mcp.json",       // Optional
  "lspServers": "./.lsp.json"        // Optional
}
```

**Installation scopes**:
- **User** (default): `~/.claude/settings.json` (personal, all projects)
- **Project**: `.claude/settings.json` (team-shared, version controlled)
- **Local**: `.claude/settings.local.json` (personal, gitignored)
- **Managed**: `managed-settings.json` (admin-controlled, read-only)

**Plugin caching**:
- Plugins copied to `~/.claude/plugins/cache/` on install
- Symlinks followed during copy
- Paths outside plugin root not accessible (unless symlinked)
- `${CLAUDE_PLUGIN_ROOT}` variable for plugin-relative paths

**Marketplace structure**:
```json
{
  "name": "marketplace-name",
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./plugins/plugin-name",  // Relative path
      "version": "1.0.0",
      "description": "Plugin description"
    }
  ]
}
```

**Distribution sources**:
- GitHub: `owner/repo` format
- Git: Any HTTPS/SSH URL, optional `#branch` or `#tag`
- Local: Path to directory or `marketplace.json`
- URL: Direct HTTPS link to `marketplace.json`

**Auto-update behavior**:
- Official Anthropic marketplaces: Auto-update enabled by default
- Third-party/local: Auto-update disabled by default
- Toggle per marketplace in `/plugin` → Marketplaces tab
- Disable all: `DISABLE_AUTOUPDATER=true` (also disables Claude Code updates)
- Disable Claude Code only: `DISABLE_AUTOUPDATER=true` + `FORCE_AUTOUPDATE_PLUGINS=true`

---

## Optimization Patterns

### Context Optimization

**Target: 40-60% utilization** (ACE-FCA guideline):
- Under 40%: Underutilizing capacity, add more context
- 40-60%: Optimal sweet spot for complex tasks
- Over 60%: Noise degrades quality, trigger compaction

**For 200K context window**: Target 80-120K tokens for complex tasks

**Reduction strategies**:
1. **CLAUDE.md**: Keep <500 lines, move reference to skills
2. **Skills**: Use `disable-model-invocation: true` for manual-only skills
3. **MCP**: Enable Tool Search (auto at 10%), disconnect unused servers
4. **Subagents**: Offload tasks that don't need full conversation context
5. **Compaction**: Manual `/compact` with focus, or targeted `/rewind` + summarize

**Check usage**:
- `/context`: Shows context breakdown
- `/mcp`: Shows per-server token costs
- `claude --debug`: Logs context usage per turn

### Tool Search (MCP Scaling)

**How it works**:
- Defers MCP tool loading until Claude searches for them
- Only tools Claude actually needs enter context
- Requires models with `tool_reference` support: Sonnet 4+, Opus 4+

**Configuration**:
```bash
# Auto mode (default): activates when MCP tools exceed 10% context
export ENABLE_TOOL_SEARCH=auto

# Custom threshold (5% example)
export ENABLE_TOOL_SEARCH=auto:5

# Always on
export ENABLE_TOOL_SEARCH=true

# Disabled (all MCP tools loaded upfront)
export ENABLE_TOOL_SEARCH=false
```

**Server instructions importance**:
With Tool Search, server-level instructions become critical for discovery:
```json
{
  "mcpServers": {
    "database-tools": {
      "command": "/path/to/server",
      "args": [],
      "description": "Query and manage production database. Use for user data lookups, analytics queries, and schema introspection."
    }
  }
}
```

**Disable specific tool** (alternative to disabling all search):
```json
{
  "permissions": {
    "deny": ["MCPSearch"]
  }
}
```

### Performance Patterns

**Prompt caching**:
- System prompt cached across turns (automatic)
- CLAUDE.md cached (automatic)
- Skills in subagents: Shared system prompt with parent for cache efficiency
- Disable: `DISABLE_PROMPT_CACHING=1` (testing only)

**Thinking mode** (extended thinking):
- Enabled by default for complex reasoning
- Adaptive reasoning on Opus 4.6: Dynamically allocates based on effort level (low/medium/high)
- Other models: Fixed budget up to 31,999 tokens
- Configure: `MAX_THINKING_TOKENS=10000` (limit budget) or `0` (disable)
- Toggle: `Option+T` (macOS) or `Alt+T` (Windows/Linux) during session
- View thinking: `Ctrl+O` (verbose mode shows gray italic reasoning)
- Note: Thinking tokens are billable even when summarized

**Effort level** (Opus 4.6 only):
- Controls adaptive reasoning depth
- `/model` menu or `CLAUDE_CODE_EFFORT_LEVEL=low|medium|high`
- Higher effort = more thinking, slower, deeper reasoning

**Model routing**:
- **Haiku**: Quick checks, mechanical work, subagent tasks
- **Sonnet**: Standard implementation, most coding tasks
- **Opus**: Complex architecture, critical debugging

**Parallel tool calls**:
- Multiple independent tool calls in single turn
- Example: `Read file1.ts` + `Read file2.ts` + `Read file3.ts` in parallel

### CLI Optimization

**Print mode** (`-p` flag):
- Runs non-interactively, returns result and exits
- Structured output: `--output-format json` or `stream-json`
- Auto-approve tools: `--allowedTools "Bash,Read,Edit"`
- Continue: `--continue -p "next instruction"`
- Max turns: `--max-turns 5` (prevents runaway loops)

**Structured output**:
- `--output-format text`: Plain text only (default)
- `--output-format json`: JSON with metadata (session ID, usage, etc.)
- `--output-format stream-json`: Newline-delimited JSON for real-time streaming
- `--json-schema <schema>`: Extract structured data conforming to JSON Schema

**System prompt customization**:
- `--append-system-prompt "text"`: Add instructions, keep default behavior
- `--system-prompt "text"`: Replace entire system prompt (loses Claude Code capabilities)
- Use append for most cases

**CI/CD patterns**:
```bash
# Lint + auto-fix
claude -p "Run lint and fix all issues" --allowedTools "Bash,Edit"

# Create commit from staged changes
claude -p "Review staged changes and commit" --allowedTools "Bash(git *)"

# Generate structured test report
claude -p "Run tests and report failures" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"failures":{"type":"array"}}}'
```

---

## Workflow Patterns

### Explore → Plan → Code

**Three-phase workflow** (ACE-FCA aligned):
1. **Explore**: Use Plan mode (`Shift+Tab` twice) to research codebase
2. **Plan**: Create specification with file:line changes
3. **Code**: Implement phase-by-phase with verification

**Plan mode benefits**:
- Read-only tools only (no mutations)
- Claude uses `AskUserQuestion` to clarify requirements
- Creates detailed plan for approval before changes
- Catches misunderstandings early (higher ROI than code review)

**Verification criteria**:
- Include expected output, test cases, or screenshots
- Claude can self-check against criteria
- Reduces back-and-forth iterations

**Example workflow**:
```
# Phase 1: Explore
> [Plan mode] Read src/auth/ and understand session handling.
> Then explain the architecture and identify where OAuth should integrate.

# Phase 2: Plan
> Create a detailed plan for adding OAuth with file:line changes.
> [Review plan, refine through conversation]

# Phase 3: Code
> [Switch to Default or Code mode] Implement the plan phase by phase.
> After each phase, run tests and verify before continuing.
```

### Resume + Fork Patterns

**Continue existing work**:
```bash
# Resume most recent in current directory
claude --continue

# Resume by name
claude --resume auth-refactor

# Resume from PR
claude --from-pr 123
```

**Branch off for alternatives**:
```bash
# Fork: New session ID, preserve history
claude --continue --fork-session

# Named fork
claude --resume auth-refactor --fork-session
```

**Git worktrees for parallel work**:
```bash
# Create worktrees for isolated directories
git worktree add ../project-feature-a -b feature-a
git worktree add ../project-bugfix -b bugfix-123

# Run Claude in each (fully isolated)
cd ../project-feature-a && claude
cd ../project-bugfix && claude
```

### Checkpoint + Rewind Patterns

**Rewind menu** (`Esc` twice or `/rewind`):
- **Restore code + conversation**: Full rewind to prior state
- **Restore conversation**: Rewind messages, keep current code
- **Restore code**: Revert file changes, keep conversation
- **Summarize from here**: Compact messages from point forward (not restore)

**Use cases**:
- **Exploring alternatives**: Try different approaches, revert to starting point
- **Recovering from mistakes**: Undo changes that broke functionality
- **Freeing context**: Summarize verbose middle section, keep early instructions

**Checkpoint scope**:
- Tracks: Direct file edits via Write/Edit tools
- Does not track: Bash command changes, external edits, remote system changes
- Storage: Persists with sessions (30-day default retention)

---

## Security Patterns

### Sandboxing (macOS, Linux, WSL2)

**Enable sandbox**:
```json
{
  "sandbox": {
    "enabled": true,
    "excludedCommands": ["docker", "kubectl"],
    "network": {
      "allowedDomains": ["github.com", "*.npmjs.org"],
      "allowLocalBinding": true
    }
  }
}
```

**What it restricts**:
- File access outside project directory
- Network access to non-whitelisted domains
- System-level operations

**Excluded commands**:
- Commands that need elevated access (docker, systemd, etc.)
- Run outside sandbox with full permissions

**Network controls**:
- `allowedDomains`: Whitelist domains (supports wildcards)
- `allowLocalBinding`: Allow localhost bindings for dev servers

### Permission Patterns

**Rule types** (precedence: deny > ask > allow):
```json
{
  "permissions": {
    "deny": [
      "Read(./.env*)",           // Block .env files
      "Read(./secrets/**)",      // Block secrets directory
      "Bash(rm -rf *)",          // Block destructive rm
      "WebFetch"                 // Block all web fetching
    ],
    "ask": [
      "Bash(npm install *)",     // Confirm installations
      "Write(./config/**)"       // Confirm config changes
    ],
    "allow": [
      "Bash(npm run *)",         // Auto-approve npm scripts
      "Bash(git status *)",      // Auto-approve git reads
      "Bash(git diff *)",        // Auto-approve git diff
      "Read(~/.zshrc)"           // Auto-approve shell config reads
    ]
  }
}
```

**Pattern syntax**:
- `Tool`: Match any use
- `Tool(specifier)`: Filter by parameter
- `*` with leading space: Prefix matching (e.g., `Bash(git diff *)` allows `git diff` commands)
- No space: `Bash(git diff*)` would also match `git diff-index` (usually unintended)

**Managed enforcement**:
```json
{
  "allowManagedPermissionRulesOnly": true,  // Ignore user/project rules
  "permissions": {
    "deny": ["Bash(curl *)", "Bash(wget *)"]  // Enforce org-wide blocks
  }
}
```

### Hook Validation Patterns

**Input validation**:
```bash
#!/bin/bash
set -euo pipefail

# Read JSON from stdin
INPUT=$(cat)

# Validate required fields
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')
if [ -z "$TOOL" ]; then
  echo "Missing tool_name in hook input" >&2
  exit 2
fi

# Extract and validate parameters
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
if [[ "$COMMAND" =~ \.\. ]]; then
  echo "Path traversal detected in command" >&2
  exit 2
fi

# Your validation logic
```

**Security checklist**:
- ✓ Always quote variables: `"$VAR"`
- ✓ Validate JSON structure with `jq empty`
- ✓ Block path traversal: Check for `..`
- ✓ Sanitize inputs before shell execution
- ✓ Use absolute paths: `"$CLAUDE_PROJECT_DIR"`
- ✓ Skip sensitive files: `.env`, `.git/`, keys
- ✓ Timeout long-running hooks (default: 10 minutes)

**Reference implementation**: `examples/hooks/bash_command_validator_example.py` (official repo)

---

## Troubleshooting Patterns

### Common Issues

**MCP servers not loading**:
1. Check `claude --debug` for initialization errors
2. Verify server binary in PATH: `which <server-command>`
3. Test server manually outside Claude Code
4. Check network restrictions (firewall, VPN)
5. WSL2: May need firewall rules or mirrored networking mode

**Context filling up**:
1. Check usage: `/context` and `/mcp`
2. Reduce CLAUDE.md to <500 lines
3. Use `disable-model-invocation: true` for manual-only skills
4. Enable Tool Search for MCP: `ENABLE_TOOL_SEARCH=auto`
5. Disconnect unused MCP servers
6. Use subagents for tasks that don't need full context

**Hooks not firing**:
1. Verify matcher regex: Test with regex tool
2. Check hook command is executable: `chmod +x script.sh`
3. Validate JSON syntax: `jq empty < hooks.json`
4. Test script manually: `./script.sh < test-input.json`
5. Check paths use `"$CLAUDE_PROJECT_DIR"`
6. Review debug output: `claude --debug`

**Skills not loading**:
1. Check `claude --debug` for loading errors
2. Verify directory structure: `skills/<name>/SKILL.md`
3. Validate frontmatter YAML syntax
4. Clear cache: `rm -rf ~/.claude/plugins/cache`
5. Test skill invocation: `/<skill-name>`
6. Check skill descriptions are clear (for auto-loading)

**Session hung or unresponsive**:
1. Press `Ctrl+C` to cancel current operation
2. Press `Esc` to interrupt Claude
3. Check for background hooks: `claude --debug`
4. Verify no infinite Stop hooks: Check transcript for stop_hook_active
5. If frozen: Close terminal, restart

**Permission prompts repeated**:
1. Add rules to `.claude/settings.json`
2. Check rule syntax: Tool names are case-sensitive
3. Verify matcher patterns with test cases
4. Use "Always allow" in permission dialog
5. Check managed settings aren't blocking user rules

### Diagnostic Commands

**Session diagnostics**:
```bash
/context       # Show context usage breakdown
/mcp           # Show MCP server status + token costs
/doctor        # Run health checks
/debug         # Enable debug logging
```

**Debug mode categories**:
```bash
claude --debug                  # All categories
claude --debug "api,hooks"      # Specific categories
claude --debug "!statsig,!file" # Exclude categories
```

**Session inspection**:
```bash
# View transcript (JSONL format)
cat ~/.claude/projects/<path>/<session-id>.jsonl | jq .

# Check context snapshots
cat ~/.claude/projects/<path>/<session-id>/context-snapshots/*.json | jq .

# Review checkpoints
ls ~/.claude/projects/<path>/<session-id>/checkpoints/
```

**Configuration validation**:
```bash
# Validate settings JSON
jq empty < .claude/settings.json

# Check effective settings
jq . < ~/.claude/projects/<path>/.effective-settings.json

# List enabled plugins
jq .enabledPlugins < .claude/settings.json
```

---

## GitHub Actions Patterns

### Authentication Methods

**Option 1: Claude API (Direct)**:
```yaml
- uses: anthropics/claude-code-action@v1
  with:
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
    prompt: "Review PR for security issues"
```

**Option 2: AWS Bedrock (OIDC)**:
```yaml
- name: Configure AWS Credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
    aws-region: us-west-2

- uses: anthropics/claude-code-action@v1
  with:
    use_bedrock: "true"
    claude_args: '--model us.anthropic.claude-sonnet-4-5-20250929-v1:0'
```

**Option 3: Google Vertex AI (Workload Identity)**:
```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
    service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

- uses: anthropics/claude-code-action@v1
  with:
    use_vertex: "true"
    claude_args: '--model claude-sonnet-4@20250514'
  env:
    ANTHROPIC_VERTEX_PROJECT_ID: ${{ steps.auth.outputs.project_id }}
    CLOUD_ML_REGION: us-east5
```

### Workflow Patterns

**Interactive mode** (responds to @claude mentions):
```yaml
on:
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]

jobs:
  claude:
    if: contains(github.event.comment.body, '@claude')
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

**Automation mode** (runs on events):
```yaml
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          prompt: "/review"  # Or skill name
          claude_args: "--max-turns 5"
```

**CLI arguments** (any Claude Code flag):
```yaml
claude_args: |
  --max-turns 5
  --model claude-sonnet-4-5-20250929
  --allowedTools "Bash,Read,Edit"
  --mcp-config ./mcp.json
```

### GitHub App Setup

**Required permissions**:
- **Contents**: Read & write (modify files)
- **Issues**: Read & write (respond to issues)
- **Pull requests**: Read & write (create PRs, push changes)

**Custom GitHub App** (recommended for 3P providers):
```yaml
- name: Generate GitHub App token
  id: app-token
  uses: actions/create-github-app-token@v2
  with:
    app-id: ${{ secrets.APP_ID }}
    private-key: ${{ secrets.APP_PRIVATE_KEY }}

- uses: anthropics/claude-code-action@v1
  with:
    github_token: ${{ steps.app-token.outputs.token }}
    # ... other config
```

**Official Anthropic app**:
- Install: https://github.com/apps/claude
- Automatic auth, no app-token step needed

### Cost Optimization

**GitHub Actions costs**:
- Runs on GitHub-hosted runners (consumes GitHub Actions minutes)
- See [GitHub billing docs](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions)

**API costs**:
- Each Claude interaction consumes API tokens
- Usage varies by task complexity and codebase size
- See [Claude pricing](https://claude.com/platform/api)

**Optimization tips**:
- Use specific prompts to reduce unnecessary API calls
- Set `--max-turns` to prevent excessive iterations
- Configure workflow-level timeouts
- Use concurrency controls to limit parallel runs
- Use `@claude` mentions instead of auto-triggering on all events

---

## Desktop vs CLI

### Key Differences

**Desktop adds**:
- Graphical interface with visual session management
- Built-in connectors for common integrations (no manual MCP setup)
- Automatic session isolation via git worktrees (each session gets own copy)
- Diff view with inline comments
- Remote sessions that continue in cloud

**CLI adds**:
- Third-party API providers (Bedrock, Vertex, Foundry)
- CLI flags for scripting (`--print`, `--resume`, `--continue`)
- Programmatic usage via Agent SDK
- Full hook system (Desktop supports fewer events)

**Shared**:
- CLAUDE.md files
- MCP servers in `~/.claude.json` or `.mcp.json`
- Hooks and skills defined in settings
- Settings in `~/.claude.json` and `~/.claude/settings.json`
- Models (Sonnet, Opus, Haiku)

**Separate**:
- MCP servers configured for Claude Desktop chat app (`claude_desktop_config.json`) are NOT shared with Claude Code
- To use MCP in Claude Code, configure in `~/.claude.json` or `.mcp.json`

### When to Use Each

**Use CLI when**:
- Using third-party API providers (Bedrock, Vertex, Foundry)
- Scripting or CI/CD automation
- Need advanced hook events
- Prefer terminal workflow

**Use Desktop when**:
- Want visual diff viewer
- Need built-in connector setup
- Prefer graphical session management
- Want remote sessions that continue in cloud

**Use both**:
- Can run simultaneously on same machine/project
- Separate session history (CLI sessions don't appear in Desktop)
- Shared configuration (CLAUDE.md, settings, MCP, skills)

---

## References

**Official documentation**: 19 pages fetched and consolidated
- Architecture: How Claude Code works, agentic loop, tools
- Configuration: Settings, permissions, scopes
- Extension: Skills, subagents, hooks, MCP, plugins
- Optimization: Context, Tool Search, caching
- Security: Sandboxing, permissions, hook validation
- Workflows: Explore→Plan→Code, resume/fork, checkpoints
- CLI: Print mode, structured output, flags
- CI/CD: GitHub Actions, authentication, automation
- Desktop: UI features, remote sessions, CLI comparison
- Troubleshooting: Common issues, diagnostics, validation

**Cross-references**:
- `_ACE_CONTEXT_ENGINEERING_PATTERNS.md`: Context optimization (40-60% target)
- `_CLAUDE_CODE_SKILLS_PATTERNS.md`: Skill architecture and build criteria
- `_CLAUDE_CODE_AGENT_TEAMS_PATTERNS.md`: Agent team coordination
- `_AGENTSKILLS_OPEN_FORMAT_PATTERNS.md`: Open format principles
- `_CLAUDE_MD_BEST_PRACTICES.md`: CLAUDE.md optimization (1-5KB target)

**Official links**:
- Docs: https://code.claude.com/docs/en/
- GitHub: https://github.com/anthropics/claude-code
- Plugin marketplace: https://github.com/anthropics/claude-code/tree/main/plugins
- Agent SDK: https://platform.claude.com/docs/en/agent-sdk/overview
