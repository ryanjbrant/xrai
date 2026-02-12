# PLAN-001: Toolchain Optimization

**Status:** Completed
**Spec:** SPEC-001
**Duration:** 1 session (2 hours)
**Context Used:** ~45K tokens

---

## Approach

Sequential audit + fix workflow, with each phase validated before proceeding.

### Phase 1: Discovery (Audit)
- **Task:** tech-lead-advisor agent audits all configs, agents, hooks, skills
  - Search for orphaned files across ~/.claude/, ~/Scripts/
  - Identify unused hooks in settings.json
  - List all auto-loaded rules and estimate token cost
  - Map all log sources and growth rates
- **Output:** Audit report with prioritized findings
- **Model:** Opus (deep analysis required)

### Phase 2: Discovery (Log Analysis)
- **Task:** tech-lead-advisor agent audits all log sources
  - Find all directories matching log patterns
  - Measure current size and growth rate
  - Identify rotation policies (if any)
  - Classify as bounded vs unbounded
- **Output:** Log index with growth projections
- **Model:** Opus (analysis)

### Phase 3: Cleanup (File Deletion)
- **Task:** bash agent deletes all orphaned files
  - Delete 14 orphaned files (pre-session.js, auto-intelligence.sh, etc.)
  - Delete 5 orphaned directories
  - Delete 10 accumulated temp files
  - Verify no references remain before deletion
- **Output:** Deletion log with verification
- **Model:** Haiku (mechanical deletion)

### Phase 4: Fix (Broken Hook)
- **Task:** general-purpose agent removes broken PreToolUse hook
  - Edit ~/.mcp-server-stdio/settings.json
  - Remove filter-test-output.sh from PreToolUse array
  - Verify syntax and test Bash command
  - Document removal in CLAUDE.md
- **Output:** Updated settings.json, verified Bash execution
- **Model:** Sonnet (file editing)

### Phase 5: Create (Log Infrastructure)
- **Task:** general-purpose agent creates log management files
  - Create docs/LOG_INDEX.md with all log sources, debug commands, watchlist
  - Create Scripts/automation/log-cleanup.sh with rotation logic
  - Add comments with deployment instructions
  - Test script on subset of logs
- **Output:** Two new files, tested
- **Model:** Sonnet (file creation)

### Phase 6: Refactor (Split GLOBAL_RULES.md)
- **Task:** general-purpose agent splits rules by usage frequency
  - Identify "core" rules (used every session, high priority)
  - Move "reference" rules (consulted as needed, reference only)
  - Create new GLOBAL_RULES_REFERENCE.md
  - Update GLOBAL_RULES.md with link to reference
  - Estimate token reduction
- **Output:** Two files, <10K combined tokens per session
- **Model:** Sonnet (refactoring)

### Phase 7: Enforce (Search Tool)
- **Task:** general-purpose agent updates all configs
  - Replace grep with rg in GLOBAL_RULES.md
  - Update project CLAUDE.md with grep→rg rule
  - Add entry to LEARNING_LOG.md explaining advantage
  - Verify no scripts depend on grep behavior
- **Output:** Updated files, LEARNING_LOG entry
- **Model:** Haiku (text replacement)

### Phase 8: Document (Create Spec)
- **Task:** main context (you) creates spec-kit spec
  - Adapt feature template to toolchain work
  - Document problem statement, changes, metrics, lessons
  - Create PLAN-001.md alongside spec
  - Commit both files
- **Output:** SPEC-001.md and PLAN-001.md in .specify/specs/001-toolchain-optimization/
- **Model:** Haiku (structured documentation)

---

## Execution

### Sequential Tasks (Delegated)
Each task delegated to appropriate agent, run in dependency order:

```
Phase 1 (Audit)
    ↓
Phase 2 (Log Audit) ← can run parallel with Phase 1
    ↓
Phase 3 (Cleanup) ← must complete before other changes
    ↓
Phase 4 (Hook Fix) ← independent
Phase 5 (Log Infra) ← independent
Phase 6 (Split Rules) ← independent
Phase 7 (Enforce rg) ← independent
    ↓
Phase 8 (Spec) ← main context
```

### Agents Used

| Phase | Agent | Model | Budget |
|-------|-------|-------|--------|
| 1 | tech-lead-advisor | Opus | 30K tokens |
| 2 | tech-lead-advisor | Opus | 20K tokens |
| 3 | bash | Haiku | 10K tokens |
| 4 | general-purpose | Sonnet | 15K tokens |
| 5 | general-purpose | Sonnet | 15K tokens |
| 6 | general-purpose | Sonnet | 20K tokens |
| 7 | general-purpose | Haiku | 10K tokens |
| 8 | main context | Claude | 10K tokens |

**Total Agent Budget:** ~130K tokens (distributed across independent agents)
**Main Context Saved:** ~15K tokens (by delegating mechanical work)

---

## Token Discipline Rule

This work demonstrates the new token discipline rule from CLAUDE.md:

> **"Delegate >3 step tasks to Task agents per token discipline rule. Main context used only for coordination and user communication."**

All audits, file operations, and creation delegated to Task agents. Main context reserved for:
- Asking clarifying questions
- Reviewing agent findings
- Making architectural decisions
- Documenting results (spec, plan, commit messages)

**Result:** Haiku main context stays focused, agents with larger budgets handle heavy lifting.

---

## Success Criteria

- [ ] Phase 1: Audit report identifies all orphaned files and configs (>25 items)
- [ ] Phase 2: Log index identifies unbounded sources and growth rates
- [ ] Phase 3: All orphaned files deleted, deletion verified with `git status`
- [ ] Phase 4: Broken hook removed, Bash command executes without latency
- [ ] Phase 5: Log cleanup script created and tested on subset
- [ ] Phase 6: GLOBAL_RULES.md split, token cost reduced by 80%+
- [ ] Phase 7: rg enforced across all config files, LEARNING_LOG updated
- [ ] Phase 8: SPEC-001.md and PLAN-001.md created and committed

---

## Remaining Work (Tracked in SPEC-001)

After completion, 7 items remain in "Remaining Work" section of spec:
- Wire log-cleanup.sh to cron/launchd (Medium priority)
- Prune WebFetch domains (Medium priority)
- Various lower-priority cleanups (Low priority)

These will be tracked in TODO.md and handled in future sessions.

---

## Architecture Decision: Why Delegate?

**Main context (Haiku) limitations:**
- 200K token budget, but shared with user interaction
- Best used for coordination, decision-making, communication
- Mechanical work (audits, file ops, creation) wastes tokens on Haiku

**Task agents (Opus/Sonnet):**
- Independent 200K token budgets per agent
- Designed for deep analysis (Opus) or file creation (Sonnet)
- Can work in parallel on independent tasks
- Main context only coordinates, reviews findings, makes decisions

**Result:**
- Faster session completion (parallel execution)
- Higher quality analysis (Opus model for audits)
- Better token efficiency (Haiku not wasted on mechanics)
- Scalable pattern (proven for future multi-phase work)
