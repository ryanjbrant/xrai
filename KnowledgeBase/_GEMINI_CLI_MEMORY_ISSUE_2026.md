# Gemini CLI Memory Issue (2026-02-09)

## Problem
Gemini CLI appears to lose context across sessions despite:
- `contextFileName: "CLAUDE.md"` ✓
- `GEMINI.md` for tool memories ✓  
- Unified architecture ✓

## Investigation

**Evidence:**
- AntiGravity stores binary .pb embeddings
- Settings read CLAUDE.md ✓
- But session memories may not persist

**Root Cause Hypothesis:**
Gemini CLI uses binary session storage, not markdown. GEMINI.md may only be advisory.

**Test Needed:**
1. Session 1: Add unique fact
2. Session 2: Query that fact
3. Check if `--resume` preserves it

## Auto-Fix Strategy
- If --resume works: Use ~/bin/gr always
- If not: Need external memory (claude-mem MCP)
- Track in TODO.md across sessions
