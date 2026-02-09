# Implementation Plan: Coplay + LLMR + Prompt Hygiene

Date: 2026-02-08  
Goal: maximize delivery speed and reliability while keeping token usage predictable.

## Outcomes (What "good" looks like)
- Single Unity MCP stack across tools (Coplay MCP pinned).
- Lower prompt overhead and fewer startup inconsistencies.
- Repeatable multi-agent workflow for deep tasks (research -> implement -> verify).
- Clear metrics for drift: token burn, failures/rework, blocked sessions.

## Workstream A: Coplay MCP Standardization

Status: In progress (core baseline already switched to Coplay pinned).

1. Enforce Coplay-only baseline everywhere via sync tooling.
- Acceptance: `ai-sync-verify` passes MCP checks with no `unityMCP`.

2. Keep version pin explicit (`coplay-mcp-server==2.14.5`) in baseline and core config.
- Acceptance: no `@latest` in active baseline/core files.

3. Keep per-project exceptions explicit (only if required).
- Acceptance: any exception is documented in project-local rules with reason.

## Workstream B: LLMR-Inspired Execution Loop (Practical Version)

Status: Ready to apply.

Use this loop for complex tasks:
1. Planner: define objective + constraints + verification criteria.
2. Analyzer: gather only required context/tools.
3. Builder: implement smallest reversible changes.
4. Inspector: run deterministic verification and regression checks.
5. Logger: capture success/failure/insight in KB.

Acceptance:
- Complex tasks show explicit plan -> verify -> log pattern.
- Rework rate drops (fewer "fix after fix" loops).

## Workstream C: System-Prompt Hygiene

Status: In progress (major cleanup completed).

1. Keep global/user prompt files lean; avoid tool-help duplication.
2. Keep shared guidance in rules/checklists, not scattered long docs.
3. Run health checks after config edits.

Acceptance:
- `~/.claude/CLAUDE.md` stays below 80 lines.
- `claude-health` + `ai-sync-verify` pass after each tooling change.

## Workstream D: Model Routing Discipline

Status: Implemented in shared rules; enforce in daily use.

Defaults:
- Deep/critical: top tier.
- Standard implementation: balanced tier.
- Quick/mechanical: low-cost tier.

Acceptance:
- Reduced unnecessary top-tier usage on low-risk tasks.
- Budget warnings trigger routing changes before hard limits.

## 72-Hour Execution Plan

1. Day 1: Stabilize tooling health.
- Run `ai-sync-all` then `ai-sync-verify`.
- Resolve any failed checks immediately.

2. Day 2: Apply LLMR loop to one real complex task.
- Use explicit planner/analyzer/builder/inspector steps.
- Log outcomes to `LEARNING_LOG.md`.

3. Day 3: Review metrics and tighten.
- Check token trend and repeated blockers.
- Add one prevention rule for the most expensive recurring issue.

## Metrics To Track Weekly

- Token efficiency: average tokens/session and high-tier share.
- Reliability: failed verification count and repeated failure patterns.
- Throughput: completed priorities per week.
- Focus: number of sessions derailed by low-leverage work.

## Decision Rules (Keep It Simple)

- If a change increases complexity without clear win: reject.
- If a workflow change is not measurable in one week: rollback.
- If a blocker repeats twice: convert into a rule/check immediately.

## Scope

- Global defaults: MCP baseline, health checks, model routing, priority coaching.
- Project-only customization: domain rules, specialized skills, per-repo workflows.
