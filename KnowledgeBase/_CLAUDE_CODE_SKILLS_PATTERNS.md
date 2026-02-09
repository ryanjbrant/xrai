# Claude Code Skills Patterns (2026-02-08)

**Source**: https://code.claude.com/docs/en/skills

## Quick Reference

Skills = custom commands Claude can invoke automatically or via `/skill-name`.

**Location priority**: Enterprise > Personal (`~/.claude/skills/`) > Project (`.claude/skills/`) > Plugin

**Structure**:
```
~/.claude/skills/my-skill/
├── SKILL.md (required - frontmatter + instructions)
├── template.md (optional - template for output)
├── examples.md (optional - example output)
└── scripts/ (optional - executable scripts)
```

## Core Patterns

### Basic Skill Template
```yaml
---
name: skill-name
description: What it does and when to use it
---

Instructions for Claude when skill is invoked.
Use $ARGUMENTS for passed parameters.
```

### Frontmatter Fields
| Field | Purpose | Default |
|-------|---------|---------|
| `name` | Slash command name | Directory name |
| `description` | When to use (Claude decides) | Required |
| `argument-hint` | Autocomplete hint (`[issue-number]`) | None |
| `disable-model-invocation` | Only user can invoke (not Claude) | false |
| `user-invocable` | Show in `/` menu | true |
| `allowed-tools` | Tools allowed without permission | None |
| `model` | Model to use (sonnet/opus/haiku) | Inherited |
| `context` | Set to `fork` for subagent | Inline |
| `agent` | Subagent type when `context: fork` | general-purpose |

### Control Who Invokes
| Frontmatter | You invoke | Claude invokes | When loaded |
|-------------|-----------|----------------|-------------|
| (default) | Yes | Yes | Desc always, full when invoked |
| `disable-model-invocation: true` | Yes | No | Not in context |
| `user-invocable: false` | No | Yes | Desc always, full when invoked |

### Arguments
```yaml
# All args: $ARGUMENTS
# By index: $ARGUMENTS[0] or $0, $1, $2, etc.
# Session ID: ${CLAUDE_SESSION_ID}

---
name: migrate-component
---
Migrate $0 from $1 to $2. Preserve tests.
# Usage: /migrate-component SearchBar React Vue
```

### Dynamic Context Injection
```yaml
---
name: pr-summary
context: fork
agent: Explore
---
## PR context
- Diff: !`gh pr diff`
- Comments: !`gh pr view --comments`
```
`!`command`` runs BEFORE Claude sees content (preprocessing).

### Subagent Execution
```yaml
---
name: deep-research
context: fork
agent: Explore
---
Research $ARGUMENTS:
1. Find files with Glob/Grep
2. Read and analyze
3. Summarize with file:line refs
```
Skill content becomes subagent prompt.

### Visual Output Pattern
```yaml
---
name: codebase-visualizer
allowed-tools: Bash(python *)
---
Generate interactive HTML:
```bash
python ~/.claude/skills/codebase-visualizer/scripts/visualize.py .
```
Creates codebase-map.html and opens in browser.
```
Bundle script in `scripts/` dir, skill invokes it.

### Permission Control
```bash
# In /permissions:
Skill              # Deny all skills
Skill(commit)      # Allow specific skill
Skill(deploy *)    # Allow with prefix match
```

## Best Practices

1. **Keep SKILL.md <500 lines** — Move detailed docs to separate files
2. **Reference vs Task**:
   - Reference: conventions, patterns (runs inline)
   - Task: deployments, commits (use `disable-model-invocation: true`)
3. **String substitutions**: Use `$ARGUMENTS`, `$0`, `${CLAUDE_SESSION_ID}`
4. **Supporting files**: Reference from SKILL.md so Claude knows when to load
5. **Token cost**: Descriptions always in context, full content only when invoked

## Skill Ideas (0 → 10+ Target)

**High-Value Skills to Build**:
1. `/techdebt` — Scan for duplicated code, unused imports, TODO comments, dead code
2. `/context-dump` — Pull recent git log, open issues, session memories in one shot
3. `/unity-status` — Unity console + editor state + scene hierarchy
4. `/verify-all` — Run tsc + lint + tests + Unity compile + console check
5. `/session-recap` — Auto-save session memory before /clear or /compact
6. `/kb-sync` — Check KB for relevant patterns before starting work
7. `/pre-commit` — Run all verifications before commit
8. `/token-report` — Show token usage, suggest optimizations
9. `/dependency-check` — Verify package versions, check for updates
10. `/build-status` — Check all build artifacts, timestamps, versions

**Example: /unity-status skill**
```yaml
---
name: unity-status
description: Get complete Unity state - console, editor, scene
context: fork
agent: general-purpose
allowed-tools: mcp__ide__*, mcp__coplay-mcp__*
model: haiku
---
Get Unity state:
1. read_console(action="get", types=["error","warning"])
2. manage_editor(action="get")
3. editor_selection (if relevant)
Report findings in structured format.
```

## Agent Skills Standard

Claude Code implements [Agent Skills](https://agentskills.io) open standard (works across multiple AI tools).

Extensions:
- `disable-model-invocation` / `user-invocable` (invocation control)
- `context: fork` (subagent execution)
- `!`command`` (dynamic context injection)

## Troubleshooting

**Skill not triggering**: Check description keywords, verify in "What skills are available?"
**Triggers too often**: Make description more specific or add `disable-model-invocation: true`
**Not seeing all skills**: Run `/context` to check character budget (2% of context window, 16K min)

## Related

- §Agent patterns (GLOBAL_RULES.md) — Pre-req chains, batch-verify
- §Verification criteria (GLOBAL_RULES.md) — Include expected output in requests
- Subagents vs skills: Skills are persistent across sessions, subagents are ephemeral
