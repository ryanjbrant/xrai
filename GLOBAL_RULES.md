# Global Rules (Lean)

Version: 2026-02-07
Purpose: keep agents fast, accurate, and predictable across Codex, Claude Code, Windsurf, Rider, and Antigravity.

## Priority
1. User request
2. System/developer/tool safety constraints
3. Project-local rules (`AGENTS.md`, `CLAUDE.md`, repo docs)
4. This global file

## Core loop
Search existing code/KB -> plan briefly -> implement -> verify -> report.

## Speed + quality defaults
- Prefer minimal context and minimal instructions.
- Prefer direct edits over broad rewrites.
- Prefer deterministic checks (tests/lint/build/logs) over guessing.
- Parallelize only independent work.
- If stuck after 2 failed attempts, change approach and state why.

## Context hygiene
- Keep global rules short.
- Avoid duplicated directives across global + project files.
- Use `/clear` between unrelated tasks.
- Use `/compact` only when needed, after checkpointing key facts.

## MCP hygiene
- Keep MCP servers minimal by default (only task-relevant servers enabled).
- Prefer stable pinned server versions over `@latest` where reliability matters.
- Avoid startup flags that force refresh/download each launch.
- Set reasonable startup/tool timeouts; fail fast on unavailable servers.

## Unity workflow defaults
- Ground state first: instance, scene/editor state, console.
- Batch related operations.
- After mutations, verify: console -> script validation -> tests.
- Use IDs/paths for deterministic targeting when possible.

## Safety and reversibility
- Make small, reversible changes.
- Back up config before broad tooling edits.
- Do not run destructive commands unless explicitly requested.

## When performance degrades
- Reduce active MCP servers.
- Disable non-essential hooks/automation.
- Trim oversized instruction surfaces.
- Restart affected tool session(s) and re-measure.

## Knowledge base usage
- Check KB before reinventing patterns.
- Log only high-confidence, evidence-backed insights.
