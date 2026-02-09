# Session Start Protocol (2026-02-09)

## Efficient Read Order (Token-Optimized)

**Stop reading when you have enough context.** Don't load everything.

### 1. TODO.md (ALWAYS - ~50 lines)
Location: `~/Documents/GitHub/portals_main/TODO.md`
Read: 🚨 PERSISTENT ISSUE TRACKER section only
Why: Source of truth for active work
Tokens: ~200

### 2. Session Memory (IF EXISTS - ~100 lines)
Location: 
- Claude: `~/.claude/session_memories/<project>-<today>.md`
- Gemini: `~/.gemini/session_memories/<today>.md`
Why: Previous session context
Tokens: ~400

### 3. GLOBAL_RULES.md (~30 lines)
Location: `~/GLOBAL_RULES.md`
Why: Universal rules all tools follow
Tokens: ~150

### 4. CLAUDE.md (~350 lines)
Location: `~/Documents/GitHub/portals_main/CLAUDE.md`
Why: Project-specific rules
Tokens: ~1500

### 5. Spec Files (ONLY IF NEEDED)
Location: `.specify/specs/<relevant-spec>/`
Check: `~/bin/spec-status` first
Tokens: Variable (read on-demand)

### 6. KB (REFERENCE ONLY)
Location: `~/KnowledgeBase/`
Use: `kb search <topic>` instead of reading files
Tokens: 0 (external search)

## Total Base Load
- Minimal: ~750 tokens (TODO + GLOBAL_RULES + session)
- Standard: ~2250 tokens (+ CLAUDE.md)
- Maximum: ~4800 tokens (full architecture docs)

**Target:** Stay under 3K tokens on session start.

## Tools
- `~/bin/session-recover` - See all context
- `~/bin/spec-status` - Spec task summary
- `kb search <topic>` - KB lookup (zero tokens)

## Cross-Tool Recovery
**Switching tools?** Read other tool's session file:
- From Claude → Read `~/.gemini/session_memories/<today>.md`
- From Gemini → Read `~/.claude/session_memories/portals_main-<today>.md`
