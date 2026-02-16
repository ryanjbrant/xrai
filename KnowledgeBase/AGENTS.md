# AGENTS.md - KnowledgeBase Project Rules

**Scope**: Applies when working directly in `KnowledgeBase/`.

## Core Loop
Search KB -> Plan -> Edit -> Verify -> Log discovery

## Mandatory Start
1. Read `_KB_INDEX.md`
2. Read `_KB_ACCESS_GUIDE.md`
3. Run `scripts/kb_system_librarian.sh --dry-run` when access/discovery quality matters

## Primary Goal
Keep KB access automatic and easy for all tools and developers.

## Write Gating
Only auto-write when insight is high confidence + evidenced + reusable + reversible.

## If User Asks About KB
Respond with:
1. Status: `KB access is ready` (or list missing pieces).
2. Offer a quick tour.
3. Show examples:
   - `kb "unity vfx depth binding"`
   - `kbfix "CS0246"`
   - `rg -n "VFXARBinder|ARDepthSource" ~/KnowledgeBase`
4. Offer compounding mode:
   - “Say: auto-recognize this insight/problem and add to KB + rules so it is remembered.”

## No Daemon Requirement
Prefer on-demand runs and cron schedules (1-12h), not login items or long-running daemons.
