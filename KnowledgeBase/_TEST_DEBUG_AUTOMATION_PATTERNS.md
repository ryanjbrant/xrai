# Test/Debug Automation Patterns — Pre-Agent vs Agent Era

**Created**: 2026-02-13
**Tags**: `#testing` `#debugging` `#automation` `#agents` `#patterns`
**Source**: Portals V4 session — codified from discussion on fastest dev/test/debug loops

---

## Key Insight

> **Pre-agent:** Humans design the safety net, machines run it.
> **With agents:** Agents design, extend, and repair the safety net. Humans set the quality bar.

---

## Pre-Agent Best Practices (Still Valid)

| Practice | Purpose | Weakness |
|----------|---------|----------|
| TDD/BDD | Red→Green→Refactor. Bugs can't exist without a catching test | Writing tests is manual — skipped under pressure |
| CI/CD pipelines | Every push: compile→lint→test→deploy. Failures block merge | Config-heavy, slow feedback for local iteration |
| Pre-commit hooks | lint-staged, husky — catch before CI | Only catches what's configured |
| Structured logging | ELK/Datadog/Sentry — auto-indexed, searchable, alerted | Reactive — someone has to go look |
| Feature flags | Ship dark, toggle on, observe, rollback without deploy | Adds code complexity |
| Observability triad | Logs + Metrics + Traces (OpenTelemetry) | Setup cost, often incomplete in small projects |
| Contract testing | Pact, schema validation — catch integration breaks at boundaries | Doesn't cover runtime behavior |
| Snapshot/golden tests | UI regression by image/output diff | Brittle, frequent false positives |
| Watch mode + hot reload | Jest watch, HMR — sub-second feedback | Only covers changed-file scope |
| Chaos engineering | Break on purpose to prove resilience | Overkill for most projects |

**Core principle:** Automate detection, make failures loud, keep feedback loops under 10 seconds.

---

## Agent-Era Additions

| Practice | What changes |
|----------|-------------|
| Auto-test generation | Agent reads diff, writes/updates tests. No more "I'll add tests later" |
| Auto-triage | Agent reads logs/stack traces, correlates with recent changes, proposes root cause |
| Reproduce-on-demand | Agent isolates failing input, writes minimal repro |
| Continuous observability | Agent monitors console/logs/CI — surfaces issues before human notices |
| Cross-boundary debugging | Agent traces message across system boundaries (RN→bridge→Unity→VFX) |
| Fix generalization | Agent fixes bug, greps for same pattern elsewhere, fixes all, adds lint rule/KB |
| Self-healing CI | Agent sees failure, applies known fix pattern, re-runs |
| Living documentation | Agent codifies learnings into rules/KB. Knowledge persists across sessions |

---

## The 5 Mandatory Questions (Before Any Dev/Test/Debug)

1. **Fastest & most transparent?** — Prefer live logs, verbose output, auto-assertions
2. **Isolate or generalize?** — Can we isolate the unit? Can the fix prevent a class of bugs?
3. **Most reliable & verbose?** — Maximum observability. Silent pass/fail = unacceptable
4. **Auto-discovery of logs?** — Auto-tail, auto-grep, auto-parse live/historic logs
5. **Can we see it? Can we reproduce it?** — If NO: stop, establish observability FIRST

---

## Anti-Pattern: Debugging Blind

If you can't see the error in a log, console, or test output within 30 seconds of reproducing, you lack observability. **Fix observability first, then debug.**

---

## Frontier Gaps (Where Next Leverage Is)

1. **Auto-regression detection** — Agent watches for performance/behavior drift between commits
2. **Intent-based testing** — Natural language test specs, agent generates/maintains suite
3. **Cross-session memory** — KB + rules approach persists patterns across sessions/projects
4. **Predictive debugging** — Agent identifies risky patterns before they fail, based on KB history

---

## See Also — Test/Debug Automation Network

| Doc | What it covers |
|-----|---------------|
| `_DEV_ITERATION_WORKFLOWS.md` | Fastest feedback loops per change type + **Auto Workflow Matrix** |
| `_AUTO_FIX_PATTERNS.md` | Error→fix lookup (agents check this on CI failure before debugging) |
| `_CLAUDE_CODE_UNITY_WORKFLOW.md` | MCP-first dev loop: compile→console→fix→verify |
| `_UNITY_DEBUGGING_MASTER.md` | Log locations, device debugging, profiler, Xcode/Rider integration |
| `TROUBLESHOOTING_AND_LOGIC.md` | System troubleshooting, environment issues |
| `_UNITY_TEST_FRAMEWORK_PATTERNS.md` | UTF patterns, CI/CD flags, scene-based tests, Portals test strategy |
| `~/GLOBAL_RULES.md` §Test/Debug Philosophy | Enforcement rules for all tools/sessions |
| `~/GLOBAL_RULES.md` §Test Ladder | L1-L5 auto-advance, never skip |
| `~/GLOBAL_RULES.md` §Stall Detection | Recovery ladder for repeated failures |
| `~/GLOBAL_RULES.md` §Auto-Codification | When to write new rules/patterns to KB |
