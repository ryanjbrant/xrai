# KB Insight: Claude Chat Suggestions Relevance and Timeliness
Last updated: February 13, 2026

Target KB file: `~/KnowledgeBase/_AI_SUGGESTION_QUALITY_PATTERNS.md`
Source project: `portals_main`

## Problem
Claude chat suggestions drifted into low-value outputs (not relevant, not timely, repeated stale steps).

## High-Confidence Fix Pattern
Define a short project-local suggestion playbook in `CLAUDE.md` with:
- 4-6 workflow-specific prompt templates (not generic suggestions)
- timeliness constraints (last 1-2 requests, skip stale failed steps)
- fastest-reversible-path preference
- mandatory verification command on each suggestion

## Why It Works
- Reduces generic next-step noise.
- Forces suggestions to align with active workflow (VFX migrate, compile-fix, rapid iOS loop, KB debug).
- Makes suggestions immediately actionable with command-level precision.

## Applied Here
- Added `## Claude Quick Suggestions` to `CLAUDE.md`.
- Included templates for:
  - VFX dependency migration audit
  - Unity compile triage loop
  - Enforced rapid iOS test sequence
  - KB-assisted debugging
  - Doc drift guard

## Reuse Trigger
Apply this pattern when users report:
- “suggestions are not useful”
- “not relevant”
- “not timely”
- repeated low-signal assistant next steps

## Verification
- Confirm `CLAUDE.md` contains workflow-specific templates.
- Confirm each suggested action includes a verification command.
- Confirm stale failed steps are not re-suggested without a fix delta.
