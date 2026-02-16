# Skills Creation And Access Guide (2026-02-13)

## Scope
Follow-up learning requested by user: how to create skills, where global skills live, and current installed skill snapshot.

## Canonical Global Skills Location
- Primary shared path: `~/.agents/skills`
- Also mirrored to:
  - `~/.codex/skills`
  - `~/.claude/skills`
  - `~/.gemini/skills`

## Fast Skill Creation Workflow
1. Create: `<repo>/.codex/skills/<skill-name>/`
2. Add `SKILL.md` with `name` + `description` frontmatter.
3. Add `scripts/` for checks/install actions.
4. Add `references/` for policy IDs/checklists.
5. Add `agents/openai.yaml` (or tool config) for explicit role/triggers/outputs.
6. Validate by running scripts directly.
7. Mirror globally:
   - `./scripts/install-documentation-librarian-global.sh --apply`

## Current Skills Snapshot (this environment)
### `~/.agents/skills`
- `bug-fix-at-scale`
- `docs-for-changes`
- `documentation-librarian`
- `global-rules-police`
- `summarize-and-plan`

### `~/.codex/skills`
- `documentation-librarian`
- `global-rules-police`

### `~/.claude/skills`
- `documentation-librarian`
- `global-rules-police`
- `unity-status`

### `~/.gemini/skills`
- `documentation-librarian`
- `global-rules-police`

## Enforcement Notes
- Prefer event-driven enforcement (session start + post-commit + pre-push).
- Avoid cron/login daemons unless explicitly approved and justified.
