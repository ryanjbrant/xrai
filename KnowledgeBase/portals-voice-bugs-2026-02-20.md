# Portals AR - Voice Pipeline Bug Analysis

**Date:** 2026-02-20  
**Source:** #portals-production-log (James Tunick testing session)  
**Severity:** P0 (Gemini Live), P1 (AISceneComposer)  
**Analyzed by:** Ember (OpenClaw)

---

## 🐛 P0: Gemini Live Model Mismatch

**Status:** CRITICAL - Breaks VoiceIntelligence  
**Component:** VoiceIntelligence/GeminiLive WebSocket connection  

### Problem
```
WebSocket closed (code: 1008)
models/gemini-2.5-flash-live-001 is not found for API version v1beta,
or is not supported for bidiGenerateContent
```

### Root Cause
Code references `gemini-2.5-flash-live-001` which does not exist or is not available for the bidirectional API.

### Fix Required
```diff
- model: gemini-2.5-flash-live-001
+ model: gemini-2.0-flash-live-001
```

### Verification Steps
1. Check Gemini API documentation for supported live models
2. Test WebSocket connection with corrected model name
3. Verify bidirectional audio streaming works

---

## ⚠️ P1: AISceneComposer Over-Extraction

**Status:** HIGH - Causes unwanted world modifications  
**Component:** AISceneComposer intent detection  

### Problem
Composer extracts AR commands from conversational/descriptive speech, treating noun mentions as implicit `ADD_OBJECT`/`ADD_COMPONENT` commands.

### Evidence

| Input (STT) | Actual Intent | Executed Action | Result |
|-------------|---------------|-----------------|--------|
| *"Most of these cases are fairly straightforward"* | Conversation | Added Light component to obj_4 | ❌ False positive |
| *"And you just saw... this large ship, almost the size of a building"* | Description | Added ship object (5x5x5 scale) | ❌ False positive |

### Working Correctly (For Comparison)
- ✅ *"I'm also just really curious..."* → Rejected as conversational
- ✅ *"to get access to it"* → Rejected as ambiguous/incomplete
- ✅ *"Clear scene"* → Executed correctly (local intent fast-path)

### Root Cause
Intent detection doesn't sufficiently distinguish between:
1. **Imperative commands** ("add a ship", "clear scene")
2. **Descriptive speech** ("you just saw a ship")
3. **Conversational speech** ("I'm curious about...")

### Suggested Fix
Require explicit action verbs before triggering world modifications:

**Valid action verbs (whitelist):**
- add, create, spawn, place, put
- clear, delete, remove, destroy
- change, modify, update, set

**Invalid (should reject):**
- saw, see, think, curious, wonder
- "there is", "you have", descriptive phrases

### Implementation Options

**Option A: Verb Whitelist (Recommended)**
```typescript
const VALID_ACTION_VERBS = ['add', 'create', 'spawn', 'place', 'clear', 'delete', 'remove'];
// Reject unless command contains at least one valid verb
```

**Option B: Intent Confidence Threshold**
Increase threshold for `ADD_OBJECT`/`ADD_COMPONENT` actions specifically.

**Option C: Prompt Engineering**
Update system prompt to explicitly reject descriptive/conversational input.

---

## 📊 Performance Baseline

| Operation | Duration | Notes |
|-----------|----------|-------|
| Gemini STT | 1.4-2.2s | Consistent performance |
| Cloud text processing | 1.5-3.4s | Varies by complexity |
| Local intent match | ~0ms | Fast path for known commands (e.g., "clear scene") |

---

## ✅ Working Features

- Voice recording pipeline (start/stop)
- Gemini STT transcription
- Local intent fast-path for clear commands
- Object manipulation (add/remove/modify)
- Component system (Light, etc.)
- Icosa model search fallback
- Lighting theme changes (Studio, Broad, Glows, Stripes, Window)
- Emitter system (hologram variants)

---

## Related Files

- VoiceIntelligence.ts (Gemini Live WebSocket)
- AISceneComposer.ts (intent detection)
- useComposerBridge.ts (action execution)
- AdvancedComposer Unity bridge

---

*Added to XRAI KnowledgeBase via OpenClaw analysis*
