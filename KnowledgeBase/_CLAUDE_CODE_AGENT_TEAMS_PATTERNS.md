# Claude Code Agent Teams Patterns (2026-02-08)

**Source**: https://code.claude.com/docs/en/agent-teams
**Status**: Experimental (disabled by default)

## Quick Reference

Agent teams = multiple Claude Code instances coordinating with shared task list and messaging.

**Enable**: Add to settings.json:
```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Architecture

| Component | Role |
|-----------|------|
| **Team lead** | Main session, spawns teammates, coordinates work |
| **Teammates** | Separate Claude instances working on assigned tasks |
| **Task list** | Shared work items (file-locked, auto-dependency tracking) |
| **Mailbox** | Inter-agent messaging system |

**Storage**:
- Team config: `~/.claude/teams/{team-name}/config.json`
- Task list: `~/.claude/tasks/{team-name}/`

## When to Use

### Good Use Cases
- **Research and review**: parallel investigation, teammates challenge each other
- **New modules/features**: each teammate owns separate piece
- **Debugging with competing hypotheses**: test different theories in parallel
- **Cross-layer coordination**: frontend/backend/tests, each owned by different teammate

### Poor Use Cases
- Sequential tasks
- Same-file edits (conflict risk)
- Tasks with many dependencies
- Routine work (token cost too high)

## Subagents vs Agent Teams

| | Subagents (Task tool) | Agent Teams |
|---|---|---|
| **Context** | Own context, results return to caller | Own context, fully independent |
| **Communication** | Report back to main only | Teammates message each other |
| **Coordination** | Main agent manages all work | Shared task list, self-coordination |
| **Best for** | Focused tasks, result matters | Complex work, discussion needed |
| **Token cost** | Lower (summarized results) | Higher (each is separate instance) |

## Usage

### Start Team
```
Create an agent team to explore this from different angles: one on UX,
one on technical architecture, one playing devil's advocate.
```

### Display Modes
| Mode | Experience | Requirements |
|------|-----------|--------------|
| `in-process` | All teammates in main terminal, Shift+Up/Down to select | Any terminal |
| `split-panes` | Each teammate in own pane | tmux or iTerm2 + `it2` CLI |
| `auto` (default) | Split if in tmux, else in-process | Varies |

**Override in settings.json**:
```json
{
  "teammateMode": "in-process"
}
```

### Control Team
```bash
# Specify teammates and models
Create a team with 4 teammates. Use Sonnet for each.

# Require plan approval
Spawn architect teammate. Require plan approval before changes.

# Delegate mode (lead coordinates only, doesn't implement)
# Start team, then press Shift+Tab

# Talk to teammates directly
# In-process: Shift+Up/Down to select, type to message
# Split-pane: Click into pane

# Shut down teammate
Ask the researcher teammate to shut down

# Clean up team (lead only, after all teammates shut down)
Clean up the team
```

### Task Management
- Lead creates tasks
- Teammates self-claim or lead assigns
- States: pending → in_progress → completed
- Dependency tracking: blocked tasks auto-unblock when dependencies complete

## Patterns

### Parallel Code Review
```
Create agent team to review PR #142. Spawn three reviewers:
- Security implications
- Performance impact
- Test coverage
Have them each review and report findings.
```

### Competing Hypotheses
```
Users report app exits after one message. Spawn 5 teammates to investigate
different hypotheses. Have them debate to disprove each other's theories.
Update findings doc with consensus.
```

## Best Practices

1. **Give teammates enough context**: They load CLAUDE.md/MCP/skills but NOT lead's conversation history
2. **Size tasks appropriately**: Self-contained units (function, test file, review) — not too small, not too large
3. **Wait for teammates**: If lead starts implementing, tell it to wait
4. **Start with research**: If new to teams, start with review/research (no code conflicts)
5. **Avoid file conflicts**: Each teammate owns different files
6. **Monitor and steer**: Check progress, redirect, synthesize findings

## Quality Gates (Hooks)

```yaml
# hooks.yaml
- hook: TeammateIdle
  command: ./.claude/hooks/check-teammate-done.sh
  # Exit code 2 = send feedback, keep teammate working

- hook: TaskCompleted
  command: ./.claude/hooks/validate-task.sh
  # Exit code 2 = prevent completion, send feedback
```

## Limitations (Experimental)

1. **No session resumption with in-process teammates** — `/resume` doesn't restore teammates
2. **Task status can lag** — Manual nudging may be needed
3. **Shutdown can be slow** — Teammates finish current request first
4. **One team per session** — Clean up before starting new team
5. **No nested teams** — Teammates can't spawn teams
6. **Lead is fixed** — Can't transfer leadership
7. **Permissions set at spawn** — Can change after, not before
8. **Split panes require tmux/iTerm2** — Not in VS Code, Windows Terminal, Ghostty

## Token Cost

**Significantly higher than single session.** Each teammate = separate Claude instance with own context window.

Cost scales with:
- Number of teammates
- Length of work
- Amount of messaging

**Mitigation**: Use for high-value parallel work only (research, review, new features).

## When to Use Git Worktrees Instead

If you want manual control without automated coordination:
- See `/common-workflows#run-parallel-claude-code-sessions-with-git-worktrees`
- Create separate working directories for parallel sessions
- No automatic task list or messaging
- You manually coordinate

## Assessment for Portals Main Project

**Current state**:
- Already using Task tool (subagents) extensively
- Unity MCP enables parallel work (editor + console + scripts)
- Project size supports parallel development (RN + Unity + iOS)

**Where agent teams make sense**:
1. **Architecture review**: Security, performance, test coverage reviewers in parallel
2. **Cross-platform debugging**: RN teammate, Unity teammate, iOS teammate investigating same issue
3. **Feature implementation**: Voice composer (RN), AR interactions (Unity), native bridge (iOS)

**Where agent teams DON'T make sense** (use Task tool instead):
1. Build script debugging (sequential, dependent steps)
2. Config fixes (single file edits)
3. Unity script edits (console check after every change)
4. Quick research (Task+Explore agent is faster)

**Recommendation**: Keep using Task tool for current workflows. Consider agent teams for:
- Major architecture reviews
- Cross-platform feature development where RN/Unity/iOS work can be parallelized
- Complex debugging where competing hypotheses need exploration

**Prerequisite**: Build skills first (0 → 10+) before adding agent teams complexity.
