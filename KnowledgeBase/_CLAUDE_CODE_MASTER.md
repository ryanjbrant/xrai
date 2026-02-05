# Claude Code Reference

**Tags**: #claude-code #tools #workflow #session
**Cross-refs**: `_CROSS_TOOL_ARCHITECTURE.md`, `_TOKEN_EFFICIENCY_COMPLETE.md`, ~/GLOBAL_RULES.md

---

## Commands Quick Ref

| Command | Use | When |
|---------|-----|------|
| `/clear` | Reset context | Switch tasks |
| `/compact` | Shrink context | Running low |
| `/cost` or `/stats` | Check usage | Regularly |
| `/rename` | Name session | Before ending |
| `/rewind` | Restore checkpoint | Undo mistakes |
| `/memory` | Edit memory file | Update rules |

## Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Stop mid-action |
| `Esc Esc` | Rewind menu |
| `Shift+Tab` | Cycle permission modes |
| `Option+T` | Toggle thinking |
| `Ctrl+G` | Open plan externally |

## Resume Patterns

```bash
claude --continue          # Latest session
claude --resume            # Pick from list
claude --resume <name>     # By name
claude --from-pr 123       # From PR
claude --continue --fork   # Branch off
```

---

## Workflow: Explore → Plan → Code → Commit

1. **Explore**: Understand codebase (`grep`, `glob`, `read`)
2. **Plan**: `--permission-mode plan` or Shift+Tab to Plan
3. **Code**: Implement with verification
4. **Commit**: After tests pass

**Verification > Implementation**: Always include tests/screenshots/expected output.

---

## Subagents vs Skills

| Use | For | Example |
|-----|-----|---------|
| **Subagent** | Isolated investigation | "use subagent to review auth" |
| **Skill** | Repeatable workflow | `/commit`, custom skills |
| **Hook** | Pre/post actions | `hooks.pre-commit` |

**Custom subagent**: `.claude/agents/name.md`
```yaml
---
name: reviewer
tools: Read, Grep, Glob
model: opus
---
Review code for security issues...
```

---

## Memory Hierarchy

1. `~/.claude/CLAUDE.md` - Global rules
2. `.claude/rules/*.md` - Modular rules (with path globs)
3. `project/CLAUDE.md` - Project specific
4. `@import path` - Include external files

**Modular rule example**:
```yaml
---
paths: ["src/api/**/*.ts"]
---
# API rules (only when matching paths)
```

---

## Token Efficiency

- Stay <95% weekly limit
- Use subagents (independent budgets)
- Parallel tool calls
- Edit > Write (smaller diffs)
- `.claudeignore` for large dirs

**See**: `_TOKEN_EFFICIENCY_COMPLETE.md`

---

## Pro Patterns

| Pattern | Use |
|---------|-----|
| Worktrees | 3-5 parallel sessions (`git worktree add`) |
| Fan-out | `find -name "*.ts" \| xargs -P 4 -I {} claude -p "..."` |
| Writer/Reviewer | One writes, one reviews |
| Grill me | "Now prove to me this works" |

---

## CLI Flags

| Flag | Purpose |
|------|---------|
| `--continue` | Resume latest |
| `--resume` | Pick session |
| `-p "prompt"` | Headless mode |
| `--output-format json` | JSON output |
| `--permission-mode plan` | Plan only |
| `--add-dir path` | Include extra dir |
| `--verbose` | See thinking |

---

## Failure Patterns (Avoid)

1. **Scope creep** - Adding unrequested features
2. **No verification** - Implementing without tests
3. **Ignoring errors** - Moving on despite failures
4. **Context bloat** - Not using /clear between tasks
5. **Over-reading** - Reading entire files when grep works
