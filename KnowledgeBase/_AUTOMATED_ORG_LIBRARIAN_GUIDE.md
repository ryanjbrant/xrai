# Automated Org Librarian Guide

**Version**: 1.0  
**Updated**: 2026-02-13  
**Owner**: system-librarian agent

## Purpose

Run a lightweight, fault-tolerant librarian loop that keeps KnowledgeBase access automatic and easy for all tools (Claude, Codex, Gemini, Rider, Cursor, Windsurf, others) without login items or daemons.

## Core Responsibilities

1. Verify KB access paths/symlinks for all major tools.
2. Verify KB discovery docs are present and cross-linked.
3. Verify KB quick commands are available (`kb`, `kbfix`) and print setup hints if missing.
4. Keep index and access docs aligned (`_KB_INDEX.md`, `_KB_ACCESS_GUIDE.md`, `AUTOMATION_QUICK_START.md`).
5. Optionally write/enrich KB only when gated conditions are met.

## Scheduling Model (No Daemon)

Use on-demand or cron. Supported interval is every `1..12` hours.

```bash
# Dry run
~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/scripts/kb_system_librarian.sh --dry-run

# Execute once
~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/scripts/kb_system_librarian.sh --execute

# Cron example: every 4 hours
0 */4 * * * ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/scripts/kb_system_librarian.sh --execute >> ~/Library/Logs/kb-system-librarian.log 2>&1
```

## Auto-Write Gating (Strict)

Auto-write is allowed only when all are true:

1. High confidence and evidence exist.
2. Insight is reusable (workflow, code pattern, repeated failure, major learning).
3. Change is small, reversible, and scoped to KB/rules docs.
4. No conflicting rule already exists.

When not met, run read-only checks and print recommendations.

## Fault Tolerance

- Lock file prevents overlap runs.
- Timeout guard auto-cleans stale lock.
- Missing dependency checks degrade gracefully (warnings, non-fatal).
- Idempotent operations (safe to run repeatedly).

## Required Files to Keep Discoverable

- `~/KnowledgeBase/_KB_INDEX.md`
- `~/KnowledgeBase/_KB_ACCESS_GUIDE.md`
- `~/KnowledgeBase/AUTOMATION_QUICK_START.md`
- `~/Documents/GitHub/Unity-XR-AI/AGENTS.md`
- `~/Documents/GitHub/Unity-XR-AI/GLOBAL_RULES.md`
- `~/Documents/GitHub/Unity-XR-AI/CLAUDE.md`
- `~/Documents/GitHub/Unity-XR-AI/GEMINI.md`
- `~/Documents/GitHub/Unity-XR-AI/CODEX.md`

## Chat Behavior Contract (For Any Agent)

If user asks about KB, respond with:

1. A 1-line “KB access is ready” status.
2. Offer a quick tour.
3. Show 3-5 examples:
   - `kb "unity vfx depth binding"`
   - `kbfix "CS0246"`
   - `rg -n "VFXARBinder|ARDepthSource" ~/KnowledgeBase`
   - “Add this as a KB insight”
   - “Add this failure to `_AUTO_FIX_PATTERNS.md`”
4. Explain compounding benefit:
   - “If you say: auto-recognize this insight/problem and add it to KB + rules, future sessions won’t repeat it.”

## Verification Checklist

Run after edits:

```bash
bash -n ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/scripts/kb_system_librarian.sh
~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/scripts/kb_system_librarian.sh --dry-run
rg -n "_AUTOMATED_ORG_LIBRARIAN_GUIDE|system-librarian|KB access is ready" ~/Documents/GitHub/Unity-XR-AI
```
