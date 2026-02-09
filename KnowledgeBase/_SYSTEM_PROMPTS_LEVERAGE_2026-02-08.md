# System Prompts Corpus Analysis (Leverage-Only)

**Date**: 2026-02-08  
**Goal**: Extract practical, low-complexity improvements from public prompt corpora without overfitting to leaked/stale content.

## Sources Reviewed

- `x1xhlol/system-prompts-and-models-of-ai-tools` (commit `bbad8ad`, 2026-02-06)
- `Piebald-AI/claude-code-system-prompts` (commit `44d0751`, 2026-02-07)
- `EliFuzz/awesome-system-prompts` (commit `6abf19a`, 2026-02-01)
- Official docs cross-check:
  - OpenAI Codex config/AGENTS/skills docs
  - Claude Code hooks + common workflows docs

## Corpus Snapshot (for signal weighting)

- `x1xhlol/system-prompts-and-models-of-ai-tools`:
  - 106 files in current tree
  - keyword density (approx): `must 935`, `should 913`, `never 664`, `do not 637`, `parallel 243`
- `Piebald-AI/claude-code-system-prompts`:
  - 137 files, with 133 under `system-prompts/`
  - strongest focus: plan-mode orchestration and tool-policy reminders
- `EliFuzz/awesome-system-prompts`:
  - 565 files total, 481 under `leaks/`
  - broad historical archive; high value for pattern mining, low value as current truth source

## Reliability Model (Important)

1. **Official docs** = source of truth for current behavior.  
2. **Open-source prompt repos** = useful for patterns, not authoritative behavior.  
3. **Leak aggregators** = treat as hypotheses only; validate before operational changes.

## High-Confidence Cross-Tool Invariants

These patterns recur across all three corpora and official docs:

1. **Read/search before edit** prevents blind changes.
2. **Plan first, re-plan after failures** avoids looped thrashing.
3. **Parallelize independent reads/searches** but keep dependent mutations sequential.
4. **Post-change verification is mandatory** (tests/lint/console/diff).
5. **Instruction layers should be lean**; duplicate rule layers degrade consistency.

## What We Should Actually Leverage

1. **Policy-as-tests, not more prompt text**
   - Implement one verification command (`ai-sync-verify`) to validate:
   - shared links, MCP parity, instruction discovery settings.
2. **One sync command**
   - Keep `ai-sync-all` as the single converging command for cross-tool setup.
3. **Minimal cross-agent coordination**
   - Use one active handoff file (`_AGENT_HANDOFF.md`) + durable `LEARNING_LOG.md`.
4. **Prefer official doc refresh cadence**
   - Re-validate assumptions monthly against official Codex/Claude docs.

## What To Avoid

1. Building behavior on leaked prompt wording.
2. Adding many per-tool custom rule layers that duplicate global rules.
3. “Prompt archaeology” as a primary optimization strategy.

## Net Recommendation

Keep the setup **boringly simple**:

- `GLOBAL_RULES.md` as shared baseline
- `ai-sync-all` for rollout
- `ai-sync-verify` for triple-check
- `_AGENT_HANDOFF.md` for active multi-agent coordination
- `LEARNING_LOG.md` for durable insights

This gives most of the benefit from cross-agent/cross-tool alignment with minimal maintenance overhead.

## Citations

- https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools
- https://github.com/Piebald-AI/claude-code-system-prompts
- https://github.com/EliFuzz/awesome-system-prompts
- https://developers.openai.com/codex/config-reference/
- https://developers.openai.com/codex/guides/agents-md/
- https://developers.openai.com/codex/skills/
- https://docs.anthropic.com/en/docs/claude-code/common-workflows
- https://docs.anthropic.com/en/docs/claude-code/hooks
