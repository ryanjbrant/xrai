# Insight Review Checklist (Lightweight)

Purpose: keep improvements proactive without adding process overhead.

When to run:
- End of substantial session
- After repeated failures
- When token/cost usage spikes
- Before broad config changes

Checklist:
1. Successes
- What worked repeatedly?
- Should it be standardized?
- Scope decision: `project-only` or `global`

2. Failures
- What failed repeatedly?
- Root cause + prevention rule
- Scope decision: `project-only` or `global`

3. Insights
- What new high-confidence insight is evidence-backed?
- Where to log:
  - durable: `LEARNING_LOG.md`
  - short handoff: `_AGENT_HANDOFF.md`

4. Usage drift
- Are token/cost/context trends worsening?
- Which single highest-impact simplification should be applied now?

5. Focus correction
- Is current effort high-cost/low-leverage?
- Propose one simpler next step with expected impact.

Output format (to user):
- `Key success: ...`
- `Key failure: ...`
- `Key insight: ...`
- `Recommendation: ...`
- `Apply scope: project-only | global`

Priority coaching add-on:
- `Priority next step: ...`
- `Potential blocker: ...`
- `Preemptive action: ...`
