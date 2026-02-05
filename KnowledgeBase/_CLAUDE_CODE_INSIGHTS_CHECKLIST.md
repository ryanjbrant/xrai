# Claude Code Insights Integration Checklist

**Purpose**: Verify all key insights are integrated into KB/CLAUDE.md/GLOBAL_RULES.md
**Last Verified**: 2026-02-05

---

## From Official Docs (code.claude.com)

### Best Practices
| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| Context window is primary constraint | ✅ | ✅ | ✅ |
| Verification criteria (highest leverage) | ✅ | ✅ | — |
| Explore → Plan → Code → Commit workflow | ✅ | ✅ | — |
| Scope tasks precisely (before/after examples) | ✅ | — | — |
| Rich content input (@file, images, URLs, pipes) | ✅ | — | — |
| CLAUDE.md what to include/exclude | ✅ | — | — |
| @import syntax in CLAUDE.md | ✅ | — | ✅ |
| Memory file locations (5 types) | ✅ | — | — |
| Modular rules (.claude/rules/*.md) | ✅ | — | ✅ |
| Path-specific rules with frontmatter | ✅ | — | ✅ |
| Glob patterns for rules | ✅ | — | ✅ |
| Session commands (/clear, /compact, /rewind, /rename) | ✅ | ✅ | ✅ |
| Session picker shortcuts (P, R, /, A, B) | ✅ | — | — |
| Permission modes (Shift+Tab cycling) | ✅ | ✅ | ✅ |
| Extended thinking (Option+T, MAX_THINKING_TOKENS) | ✅ | ✅ | — |
| Subagent patterns (context isolation) | ✅ | ✅ | ✅ |
| Custom subagents (.claude/agents/*.md) | ✅ | — | ✅ |
| Headless mode (claude -p) | ✅ | ✅ | — |
| Output formats (text, json, stream-json) | ✅ | ✅ | — |
| Fan-out pattern (parallel file processing) | ✅ | ✅ | — |
| Writer/Reviewer pattern | ✅ | ✅ | — |
| Git worktrees for parallel sessions | ✅ | ✅ | — |
| Common failure patterns (5 types) | ✅ | ✅ | — |
| Skills vs Subagents vs Hooks vs MCP | ✅ | — | ✅ |
| CLI verification integration | ✅ | ✅ | — |
| --continue, --resume, --from-pr flags | ✅ | ✅ | ✅ |
| --fork-session flag | ✅ | ✅ | ✅ |
| --permission-mode plan | ✅ | ✅ | — |
| --dangerously-skip-permissions | ✅ | ✅ | — |
| --add-dir for additional directories | ✅ | ✅ | — |
| --print-system-prompt (debug) | ✅ | ✅ | — |
| --verbose flag | ✅ | ✅ | — |
| /doctor command | ✅ | ✅ | — |
| /agents command | ✅ | ✅ | — |
| /permissions command | ✅ | ✅ | — |
| /config command | ✅ | ✅ | — |
| Recursive CLAUDE.md lookup | ✅ | — | — |

### How Claude Code Works
| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| Agentic loop (gather → act → verify) | ✅ | ✅ | — |
| Tool categories (File, Search, Exec, Web, Code Intel) | ✅ | ✅ | — |
| Sessions are ephemeral (no persistent memory) | ✅ | — | — |
| Checkpoints only track Claude's changes | ✅ | — | — |
| Delegate, don't dictate philosophy | ✅ | — | — |
| Course-correct early (Esc to stop) | ✅ | ✅ | ✅ |
| Keyboard shortcuts (Esc, Esc+Esc, Shift+Tab, Ctrl+G, Ctrl+O) | ✅ | ✅ | ✅ |

### Memory Management
| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| 5 memory types hierarchy | ✅ | — | — |
| .claude/rules/ for modular rules | ✅ | — | ✅ |
| YAML frontmatter with paths | ✅ | — | ✅ |
| Recursive CLAUDE.md lookup (parent dirs) | ✅ | — | — |
| @path imports | ✅ | — | ✅ |
| --add-dir for additional directories | ✅ | — | — |
| /memory command | ✅ | ✅ | ✅ |
| /init command | ✅ | ✅ | ✅ |

### Common Workflows
| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| Codebase overview workflow | ✅ | — | — |
| Find relevant code pattern | ✅ | — | — |
| Bug fixing workflow | ✅ | ✅ | — |
| Refactoring workflow | ✅ | — | — |
| Plan mode (--permission-mode plan) | ✅ | ✅ | — |
| Ctrl+G to open plan in editor | ✅ | ✅ | ✅ |
| Test writing workflow | ✅ | — | — |
| /commit-push-pr skill | ✅ | — | — |
| Documentation workflow | ✅ | — | — |
| Image handling (drag & drop, copy/paste) | ✅ | — | — |
| @ file references | ✅ | — | — |
| Session resume patterns | ✅ | ✅ | ✅ |
| Output format control | ✅ | ✅ | — |

---

## From Team Tips (@bcherny Twitter)

| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| 3-5 worktrees in parallel ("biggest unlock") | ✅ | ✅ | — |
| Shell aliases (za, zb, zc) | ✅ | ✅ | — |
| Dedicated analysis worktree | ✅ | ✅ | — |
| Plan mode mastery (every complex task) | ✅ | ✅ | — |
| Writer/Reviewer with plans | ✅ | ✅ | — |
| Switch back to plan when sideways | ✅ | ✅ | — |
| Plan mode for verification steps | ✅ | ✅ | — |
| Self-improving CLAUDE.md prompt | ✅ | ✅ | — |
| Notes directory per task/project | ✅ | ✅ | — |
| Skills rule: >1x/day → skill | ✅ | — | — |
| /techdebt skill idea | ✅ | — | — |
| /sync-context skill idea | ✅ | — | — |
| /analytics skill idea | ✅ | — | — |
| Slack MCP + "fix" pattern | ✅ | — | — |
| "Go fix the failing CI tests" | ✅ | — | — |
| Docker logs debugging | ✅ | — | — |
| "Grill me" prompt | ✅ | ✅ | — |
| "Prove to me this works" prompt | ✅ | ✅ | — |
| "Elegant solution" redo prompt | ✅ | ✅ | — |
| Interview prompt (AskUserQuestion) | ✅ | ✅ | — |
| Visual verify with Chrome extension | ✅ | ✅ | — |
| Ghostty terminal | ✅ | — | — |
| /statusline customization | ✅ | — | — |
| Color-coded tabs / tmux | ✅ | — | — |
| Voice dictation (fn x2, 3x faster) | ✅ | ✅ | — |
| "use subagents" suffix | ✅ | ✅ | — |
| Opus 4.5 permission hook | ✅ | — | — |
| bq CLI / BigQuery skill | ✅ | ✅ | — |
| Learning/Explanatory output style | ✅ | — | — |
| HTML presentations for code | ✅ | — | — |
| ASCII diagrams | ✅ | — | — |
| Spaced-repetition learning skill | ✅ | — | — |

---

## User-Requested Additions

| Insight | KB | GLOBAL | CLAUDE.md |
|---------|:--:|:------:|:---------:|
| MANDATORY reuse check before implementation | ✅ | ✅ | — |
| Search codebase → KB → GitHub → docs | ✅ | ✅ | — |
| CI duplication checks (claude -p) | ✅ | ✅ | — |
| Code review for missed reuse | ✅ | ✅ | — |
| Anti-pattern: writing without reuse check | — | ✅ | — |
| Anti-pattern: duplicating utilities | — | ✅ | — |
| DRY principle in Code Quality | — | ✅ | — |

---

## Coverage Summary

| File | Total Insights | Covered |
|------|---------------|---------|
| **KB (Best Practices)** | 70+ | **70+** ✅ |
| **GLOBAL_RULES.md** | 70+ | **55+** ✅ |
| **~/.claude/CLAUDE.md** | 70+ | **15+** ✅ |

**Note**: Not all insights need to be in all files. KB is comprehensive reference, GLOBAL_RULES has actionable patterns, CLAUDE.md has quick-reference commands.

---

## Auto-Application Triggers

These patterns will be suggested/applied in future sessions:

1. **Plan mode** - Triggered for complex tasks (multi-file, architecture)
2. **Reuse check** - Triggered before any new code implementation
3. **Subagents** - Triggered for investigation/verification tasks
4. **Duplication check** - Part of code review workflow
5. **Worktrees** - Suggested when parallel work detected
6. **Verification criteria** - Reminded when implementing features
7. **Self-improving CLAUDE.md** - Suggested after corrections

---

**Tags**: #checklist #verification #claude-code #integration
