# CODEX.md - Codex Project Rules

## Session Start (Mandatory)
1. Read `GLOBAL_RULES.md`
2. Read `AGENTS.md`
3. Read `~/KnowledgeBase/_KB_INDEX.md`
4. Read `~/KnowledgeBase/_KB_ACCESS_GUIDE.md`
5. Run `~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/scripts/kb_system_librarian.sh --dry-run`

## KB-First Policy
- Search KB before writing code for known patterns/fixes.
- Read access is default-on; write only when insight is high-confidence + evidenced + reusable.
- If rules drift is detected across tool files, sync rule docs first.

## If User Asks About KB
Respond with:
1. Status line: `KB access is ready` (or list missing pieces).
2. Offer quick tour.
3. Show examples:
   - `kb "unity vfx depth binding"`
   - `kbfix "CS0246"`
   - `rg -n "VFXARBinder|ARDepthSource" ~/KnowledgeBase`
4. Offer compounding memory mode:
   - “Say: auto-recognize this insight/problem and add to KB + rules so it is always remembered.”

## Scheduling
Use on-demand or cron every 1-12 hours; no login items or daemons.
