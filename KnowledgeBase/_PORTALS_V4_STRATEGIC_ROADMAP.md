# Portals V4 Strategic Roadmap

**Created:** 2026-02-05
**Author:** @jamestunick + Claude Opus 4.5
**Vision:** "Open Brush meets Paint-AR meets Voice/Gesture Vibe Coder" — AR+AI first, platform-agnostic, scalable, collaborative, real-time, intuitive, magical world builder

---

## Executive Summary

This document synthesizes research from Open Brush, Portals V3, MetavidoVFX, and keijiro's reference projects to define the strategic roadmap for Portals V4.

**The Goal**: Build a "vibe coder" for spatial creation — where users describe what they want ("add a glowing cube that floats and pulses with the music") and the system makes it happen through voice, gesture, and AI-assisted composition.

**Key Principles**:
- **AR+AI First**: Every feature designed for augmented reality with AI assistance
- **Platform Agnostic**: iOS → Quest → visionOS → Web from a single codebase
- **Real-time Collaborative**: Multiple creators in the same space
- **Zero Friction**: Voice and gesture as primary input, no menus required
- **Magical**: Effects that feel impossible — particles that respond to depth, sound, and intent

---

## 🪄 Magic Features Priority (Easy Wins First)

> **Principle**: "Features that feel like magic + super charge collaborative creativity"
> **Strategy**: Ship **wow moments** fast. Users remember feeling, not feature lists.

### Tier 1: Maximum Magic, Minimum Effort (Ship in 1-2 Weeks)

These features leverage **existing infrastructure** and deliver instant "wow":

| Feature | Magic Factor | Why It's Easy | Collaborative Boost |
|---------|-------------|---------------|---------------------|
| **🎵 Audio-Reactive VFX** | 🔥🔥🔥🔥🔥 | MetavidoVFX has beat detection + 4-band FFT ready to port | Everyone sees same visuals responding to shared music |
| **✨ One-Tap VFX Effects** | 🔥🔥🔥🔥 | 5 VFX presets already in 002 spec, just expose to UI | "Look what I just made!" - instant gratification |
| **🎤 Basic Voice Commands** | 🔥🔥🔥🔥🔥 | iOS 17+ Dictation = 0 setup, 460ms latency | Voice inherently social - others hear commands |
| **📍 Live Cursors** | 🔥🔥🔥🔥 | Normcore RealtimeTransform is <20 lines | See collaborators in real-time, feels alive |

```
┌─────────────────────────────────────────────────────────────────────┐
│ TIER 1 IMPLEMENTATION PATH (Week 1-2 After 002)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   Day 1-2: Audio-Reactive VFX                                       │
│   ═══════════════════════════                                       │
│   □ Port AudioBridge.cs from MetavidoVFX                            │
│   □ Port VFXAudioDataBinder.cs                                      │
│   □ Create 1 beat-reactive effect (pulse on beat)                   │
│   □ Wire microphone input → spectrum → VFX property                 │
│   ✨ DEMO: Play music, particles pulse with beat                    │
│                                                                      │
│   Day 3-4: Voice Commands (With LLM!)                               │
│   ═══════════════════════════════════                               │
│   □ Copy VoiceService + AISceneComposer from FigmentAR (100% reuse) │
│   □ Create UnityCompiler.ts (LLM actions → bridge messages)         │
│   □ Copy VoiceComposerButton.tsx (press-hold UI)                    │
│   □ Wire to ComposerBridgeTarget message handlers                   │
│   💡 FULL LLM pipeline already exists in FigmentAR!                 │
│       "add a glowing cube behind the chair" → Gemini → action       │
│   ✨ DEMO: Natural language scene editing via voice                 │
│   📚 See: _FIGMENTAR_UNITY_REUSE_ANALYSIS.md                        │
│                                                                      │
│   📦 Audio Architecture Note:                                       │
│   ─────────────────────────────                                     │
│   Voice commands (expo-audio) and Audio reactivity (Unity.Micro)    │
│   use SEPARATE streams - no memory conflicts, can run in parallel.  │
│   See: _FIGMENTAR_UNITY_REUSE_ANALYSIS.md → Modular Audio Arch     │
│                                                                      │
│   Day 5-6: Live Cursors (Collaborative Magic)                       │
│   ════════════════════════════════════════════                      │
│   □ Add Normcore to project (already evaluated)                     │
│   □ Create RealtimeTransform for player indicator                   │
│   □ Simple colored sphere at each user's gaze point                 │
│   □ Room join via shareable code                                    │
│   ✨ DEMO: Two phones see each other's cursors moving               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Tier 2: High Magic, Medium Effort (Week 3-4)

These require more integration but deliver **signature experiences**:

| Feature | Magic Factor | Effort | Why It Matters |
|---------|-------------|--------|----------------|
| **🎨 Draw in Air (Hand Tracking)** | 🔥🔥🔥🔥🔥 | 5-7 days | iOS 17+ ready, feels like sci-fi |
| **🌧️ Environment Effects** | 🔥🔥🔥🔥 | 3-4 days | Rain/snow that occludes behind furniture |
| **🗣️ AI Voice Composer** | 🔥🔥🔥🔥🔥 | 5-7 days | "Arrange these in a circle" - complex commands |
| **👥 Synchronized Edits** | 🔥🔥🔥🔥 | 5-7 days | Real-time object sync via Normcore |

```
Tier 2 Quick Wins:
──────────────────

🎨 Hand Tracking "Draw in Air"
   Pre-req: AR Foundation 6.2 hand tracking (in project)
   Implementation:
   - HandVFXController pattern from MetavidoVFX
   - Pinch gesture → emit particles from index finger
   - Trail renderer for stroke persistence
   Magic moment: User sees ribbon of light following their fingertip

🌧️ Environment Effects with AR Depth
   Pre-req: O(1) depth compute (in 002)
   Implementation:
   - Rain particles spawn at ceiling height
   - Depth occlusion hides rain behind objects
   Magic moment: Rain falls around user but stops at furniture

🗣️ AI Voice Composer
   Pre-req: Basic voice commands (Tier 1)
   Implementation:
   - GPT-4o function calling for complex parsing
   - Scene context builder (current objects, positions)
   Magic moment: "Make the cube spin and add fire to it" → works

👥 Synchronized Object Edits
   Pre-req: Live cursors (Tier 1)
   Implementation:
   - Normcore RealtimeView on spawned objects
   - Ownership transfer on grab
   - Conflict resolution (last-write-wins)
   Magic moment: Friend moves an object on their phone, you see it move
```

### Tier 3: Ultimate Magic, Requires Foundation (Week 5+)

These are the **differentiators** that make Portals V4 unique:

| Feature | Magic Factor | Why Worth Waiting |
|---------|-------------|-------------------|
| **🎙️ Spatial Voice Chat** | 🔥🔥🔥🔥🔥 | Voices from where people "are" in AR space |
| **🤖 AI Object Generation** | 🔥🔥🔥🔥🔥 | "Create a dragon" → 3D model appears (Tripo3D API) |
| **🌍 Cross-Platform Sessions** | 🔥🔥🔥🔥 | iPhone + Quest users in same session |
| **🎬 Collaborative Recording** | 🔥🔥🔥🔥 | Multiple POVs, sync'd recordings |

### Magic Metrics to Track

| Metric | Target | Why |
|--------|--------|-----|
| **Time to First "Wow"** | <30 seconds | User should gasp in first minute |
| **Share Rate** | >40% of recordings shared | If it's magical, they want to show people |
| **Return Session Rate** | >60% same day | If they keep coming back, it's working |
| **Voice Command Usage** | >3 per session | Voice is our differentiator |
| **Multiplayer Session Length** | >5 minutes | Collaborative features are sticky |

### Quick Reference: Magic Feature → Implementation Path

```
"I want users to..." → Implementation

🎵 Hear music create visuals
   → Port AudioBridge + VFXAudioDataBinder from MetavidoVFX
   → 2 days, already proven code

🎤 Speak and things happen
   → iOS Dictation API + simple command parser
   → 2-3 days, no AI dependency for basics

👀 See other creators live
   → Normcore RealtimeTransform + sphere indicator
   → 1-2 days, Normcore handles the hard parts

🎨 Paint with their hands
   → AR Foundation hand tracking + trail renderer
   → 3-4 days, iOS 17+ native support

🌧️ Feel immersed in weather
   → VFX Graph + O(1) depth occlusion
   → 3-4 days, patterns from MetavidoVFX

🗣️ Have conversations with AI
   → GPT-4o function calling + scene context
   → 5-7 days, requires basic voice first

🤖 Describe and spawn 3D models
   → Tripo3D API → GLB download → glTFast load
   → 7-10 days, API integration + caching
```

### 🤝 Collaborative Creativity Accelerators

Features specifically designed to **multiply creative energy** when people work together:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              COLLABORATIVE MAGIC PATTERNS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. PRESENCE INDICATORS (1-2 days)                                          │
│  ══════════════════════════════════                                         │
│  What: Colored orbs showing where each collaborator is looking              │
│  Why Magic: "I can SEE you!" - instant connection                           │
│  Implementation:                                                            │
│    - Normcore RealtimeTransform on camera position                          │
│    - Simple glowing sphere per user                                         │
│    - Username label floating above                                          │
│                                                                              │
│  2. REACTION BURSTS (Half day)                                              │
│  ══════════════════════════════                                             │
│  What: Tap to spawn confetti/hearts/stars at your location                  │
│  Why Magic: Instant feedback, celebration, communication                    │
│  Implementation:                                                            │
│    - 3 VFX presets: confetti, hearts, fireworks                             │
│    - Sync spawn position via Normcore                                       │
│    - Auto-despawn after 3 seconds                                           │
│                                                                              │
│  3. SHARED MUSIC REACTIVE (2-3 days)                                        │
│  ════════════════════════════════════                                       │
│  What: One person plays music, everyone sees particles dance                │
│  Why Magic: Synchronized experience, instant party                          │
│  Implementation:                                                            │
│    - Audio spectrum → Normcore float array (4 bands)                        │
│    - 60Hz sync (matches frame rate)                                         │
│    - VFX reads from synced values                                           │
│                                                                              │
│  4. VOICE ACTIVITY INDICATORS (1 day)                                       │
│  ══════════════════════════════════════                                     │
│  What: Glow/pulse effect when someone is speaking                           │
│  Why Magic: "Social presence" - know who's talking                          │
│  Implementation:                                                            │
│    - Normcore VoIP level → VFX emission rate                                │
│    - Subtle ring around user's presence orb                                 │
│                                                                              │
│  5. COLLABORATIVE PAINTING (3-4 days)                                       │
│  ═════════════════════════════════════                                      │
│  What: Multiple people drawing trails simultaneously                        │
│  Why Magic: Jackson Pollock together in AR                                  │
│  Implementation:                                                            │
│    - Each user has unique color                                             │
│    - Trail positions synced via Normcore                                    │
│    - Persistence for session duration                                       │
│                                                                              │
│  6. "FOLLOW ME" MODE (2 days)                                               │
│  ══════════════════════════════                                             │
│  What: One person leads, others see their POV indicators                    │
│  Why Magic: Teaching, touring, guided creation                              │
│  Implementation:                                                            │
│    - Leader's gaze ray visible to followers                                 │
│    - "Look here" button spawns attention marker                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Collaborative Priority Order** (based on magic-per-effort ratio):

| Priority | Feature | Days | Magic | Compound Effect |
|----------|---------|------|-------|-----------------|
| 1 | Presence Indicators | 1-2 | ⭐⭐⭐⭐ | Foundation for all multiplayer |
| 2 | Reaction Bursts | 0.5 | ⭐⭐⭐⭐⭐ | Immediate "fun factor" |
| 3 | Voice Activity | 1 | ⭐⭐⭐ | Makes voice chat feel spatial |
| 4 | Shared Music Reactive | 2-3 | ⭐⭐⭐⭐⭐ | "Party mode" - high shareability |
| 5 | Follow Me Mode | 2 | ⭐⭐⭐⭐ | Enables teaching/onboarding |
| 6 | Collaborative Painting | 3-4 | ⭐⭐⭐⭐⭐ | The "Open Brush for AR" feature |

**Total: ~10-12 days for full collaborative suite**

---

## Current State Assessment

### Spec 001: Unity-RN Bridge (90% Complete)

| Status | Details |
|--------|---------|
| **Completed** | UAAL embedding, RN→Unity messaging, Unity→RN callbacks, ready handshake, VSync fix |
| **Pending** | T031: Device performance verification (60 FPS, <16ms bridge RTT) |
| **Key Wins** | Fabric patches automated, message queue buffering, 2-5ms typical latency |
| **Blockers** | None - foundation is solid |

**Expected Outcome After Implementation:**
- ✅ **Success (95% likely)**: Clean bidirectional bridge, 60 FPS sustained, <32ms RTT
- ⚠️ **Partial Success (4%)**: Performance issues on older devices (iPhone 12 baseline)
- ❌ **Failure (1%)**: Fabric compatibility regression after RN update

### Spec 002: Unity Advanced Composer (Not Started)

| Status | Details |
|--------|---------|
| **Spec Status** | Complete with deep FigmentAR analysis (95% confidence) |
| **Plan Status** | Complete with reuse strategy defined |
| **Tasks** | 35 tasks defined, 12 parallelizable |
| **Dependency** | Requires 001 completion (bridge foundation) |

**Expected Outcomes After Implementation:**
- ✅ **Success (75% likely)**: Full FigmentAR parity with VFX Graph effects, recording, sharing
- ⚠️ **Partial Success (20%)**: Core features work, some VFX effects need iteration
- ❌ **Failure (5%)**: Performance issues with complex VFX + AR occlusion

---

## Key Insights Synthesis

### From Open Brush (Reference Architecture)

| Insight | Application to Portals V4 |
|---------|---------------------------|
| **.tilt format** (zip + binary strokes) | Inform XRAI scene format design - consider binary stroke data |
| **Lua plugin system** (4 types) | Future extensibility - consider TypeScript/JS scripting layer |
| **HTTP API (localhost:40074)** | Enable external tool integration, AI agent control |
| **6 brush geometry types** | Phase 2: Paint strokes via VFX Graph ribbons/trails |
| **Icosa Gallery integration** | Asset marketplace - Icosa REST API + device code OAuth |

### From Portals V3 (FigmentAR Legacy)

| Insight | Application to Portals V4 |
|---------|---------------------------|
| **56 files, 3500+ LOC** | Reuse UI components, port Redux → Zustand |
| **6 animation types** | Port to Unity coroutines/DOTween |
| **8 particle presets** | Create equivalent VFX Graph assets |
| **Scene JSON format** | Maintain compatibility for migration |
| **Gesture guards** | Critical: Local transform during gesture, sync on end |
| **Voice → Scene compiler** | Extend with AI (GPT-4 function calling) |

### From MetavidoVFX (VFX Architecture)

| Insight | Application to Portals V4 |
|---------|---------------------------|
| **O(1) Compute Pattern** | ARDepthSource singleton + VFXARBinder per-VFX |
| **VFX Naming Convention** | `{effect}_{datasource}_{target}_{origin}.vfx` |
| **Property Standard** | DepthMap, ColorMap, StencilMap, RayParams, InverseView |
| **73 VFX Effects** | Reference library for Portals V4 VFX presets |
| **Audio Bridge** | Beat detection, 4 frequency bands, mobile-compatible |
| **Brush Manager** | 107 brushes - reference for Phase 2 paint system |

### From Keijiro Reference Projects

| Project | Key Pattern | Portals V4 Application |
|---------|-------------|------------------------|
| **Rcam2/3/4** | Depth→VFX pipeline evolution, URP migration | AR depth integration for VFX |
| **VFXProxBuffer** | 16³ spatial hash grid for neighbor queries | Plexus/metaball effects |
| **Blitter class** | Graphics.Blit replacement for Unity 6 | Modern fullscreen passes |
| **InverseProjection** | UV→World position reconstruction | Depth-aware particle spawning |
| **Lasp/LaspVfx** | Audio FFT → VFX bindings | Voice/audio reactive effects |
| **Smrvfx** | Skinned mesh → VFX particles | Character effect trails |

---

## Proposed Spec Sequence (Magic-First Ordering)

### Phase 1: Foundation (Q1 2026) ✅

```
[001-unity-rn-bridge] ─────► [002-unity-advanced-composer]
     90% complete              FigmentAR → Unity
```

### Phase 2: MAGIC SPRINT (Q1-Q2 2026) 🪄 NEW PRIORITY

**Reordered to ship "wow" moments faster:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  MAGIC SPRINT: Ship Magic Fast                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Week 1-2 (After 002):                                              │
│  ═════════════════════                                              │
│  [003-audio-reactive-vfx]     ← MOVED UP (2 days, maximum wow)      │
│       │                                                              │
│       └──► [003b-basic-voice-commands] (2-3 days, no AI needed)     │
│                 │                                                    │
│                 └──► [003c-live-cursors] (1-2 days, Normcore)       │
│                                                                      │
│  Week 3-4:                                                          │
│  ═════════                                                          │
│  [004-collaborative-reactions] (0.5 day, confetti/hearts)           │
│       │                                                              │
│       └──► [004b-synchronized-edits] (3-5 days)                     │
│                 │                                                    │
│                 └──► [004c-voice-activity] (1 day)                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Phase 3: Natural Input Enhancement (Q2 2026)

```
[005-ai-voice-composer] ─────► [006-hand-gesture-input]
     GPT-4o function calling       Draw in air, pinch gestures
```

### Phase 4: Full Collaborative Suite (Q2-Q3 2026)

```
[007-spatial-voice-chat] ────► [008-collaborative-painting]
     Normcore VoIP + 3D audio       Multi-user trails + persistence
```

### Phase 5: Platform Expansion (Q3-Q4 2026)

```
[009-ai-object-generation] ──► [010-cross-platform-export]
     Tripo3D/AI → GLB                Quest, visionOS, Web
```

### Quick Spec Reference (New Numbering)

| Spec | Name | Days | Magic | Dependency |
|------|------|------|-------|------------|
| 001 | Unity-RN Bridge | ✅ | Foundation | None |
| 002 | Advanced Composer | ~20 | Foundation | 001 |
| 003 | Audio-Reactive VFX | 2 | 🔥🔥🔥🔥🔥 | 002 |
| 003b | Basic Voice Commands | 2-3 | 🔥🔥🔥🔥🔥 | 002 |
| 003c | Live Cursors (Normcore) | 1-2 | 🔥🔥🔥🔥 | 002 |
| 004 | Collaborative Reactions | 0.5 | 🔥🔥🔥🔥🔥 | 003c |
| 004b | Synchronized Edits | 3-5 | 🔥🔥🔥🔥 | 003c |
| 004c | Voice Activity Indicators | 1 | 🔥🔥🔥 | 003c |
| 005 | AI Voice Composer | 5-7 | 🔥🔥🔥🔥🔥 | 003b |
| 006 | Hand Gesture Input | 5-7 | 🔥🔥🔥🔥🔥 | 002 |
| 007 | Spatial Voice Chat | 3-4 | 🔥🔥🔥🔥🔥 | 003c |
| 008 | Collaborative Painting | 3-4 | 🔥🔥🔥🔥🔥 | 006, 003c |
| 009 | AI Object Generation | 7-10 | 🔥🔥🔥🔥🔥 | 005 |
| 010 | Cross-Platform Export | 15+ | 🔥🔥🔥🔥 | 002 |

---

## Detailed Spec Proposals

### Spec 003: Voice Scene Composer

**Priority:** P0 (Differentiator)
**Dependency:** 002 (Advanced Composer)
**Estimated Tasks:** 25

**Overview:**
Natural language scene composition using voice commands. Extends FigmentAR's voice system with modern AI (GPT-4o function calling, Whisper).

**User Stories:**
- US1: "Add a cube in front of me" → spawns cube at AR raycast
- US2: "Make it spin slowly" → applies rotation animation
- US3: "Add fire to it" → attaches VFX emitter
- US4: "Arrange three copies in a circle" → formation command

**Technical Approach:**
```
Voice Input (iOS Dictation)
    ↓
Whisper STT (on-device or API)
    ↓
Scene Context Builder (current objects, positions)
    ↓
GPT-4o Function Calling (structured commands)
    ↓
Bridge Messages to Unity
```

**Key Decisions:**
- On-device STT (iOS 17+ Dictation) for low latency
- Cloud AI for complex reasoning (GPT-4o)
- Function calling schema defines allowed operations
- Zustand maintains voice session state

**Success Metrics:**
- <500ms voice→action latency
- 90% command accuracy
- Works offline for basic commands

---

### Spec 004: Hand Gesture Input

**Priority:** P1 (Natural Interaction)
**Dependency:** 002, 003
**Estimated Tasks:** 20

**Overview:**
Hand tracking for spatial input - pinch to place, grab to move, gestures for commands.

**Technical Approach:**
- AR Foundation Hand Tracking (iOS 17+)
- XR Interaction Toolkit gestures
- MetavidoVFX HandVFXController patterns

**User Stories:**
- US1: Pinch gesture places object at hand position
- US2: Grab gesture selects/moves objects
- US3: Two-hand pinch for scale
- US4: Palm up summons palette menu

---

### Spec 005: VFX Library System

**Priority:** P1 (Content)
**Dependency:** 002
**Estimated Tasks:** 30

**Overview:**
Managed VFX library with categories, presets, customization, and AR occlusion.

**Categories:**
- Environment (rain, snow, fog, clouds)
- Fire/Energy (flames, sparks, lightning, plasma)
- Particles (confetti, bubbles, dust, petals)
- Trails (ribbons, smoke, sparkle trails)
- Audio-Reactive (spectrum, waveform, beat pulse)

**Technical Approach:**
- VFX Graph assets with ExposedProperties
- VFXARBinder for depth occlusion
- Scriptable Objects for preset configs
- Addressables for lazy loading

---

### Spec 006: Audio-Reactive VFX

**Priority:** P2 (Polish)
**Dependency:** 005
**Estimated Tasks:** 15

**Overview:**
Beat detection and frequency band visualization driving VFX properties.

**Technical Approach (from MetavidoVFX):**
```csharp
// AudioBridge singleton pattern
AudioListener.GetSpectrumData() → FFT
    ↓
BeatDetector → BeatPulse property
    ↓
VFXAudioDataBinder → VFX Graph properties
    ↓
AudioDataTexture (global shader property)
```

**Features:**
- 4 frequency bands (SubBass, Bass, Mids, Treble)
- Adaptive beat detection
- Global shader properties for all VFX
- Compatible with voice/music input

---

### Spec 007: Normcore Multiplayer

**Priority:** P2 (Scale)
**Dependency:** 002, 005
**Estimated Tasks:** 40

**Overview:**
Real-time collaborative scene editing with Normcore.

**Features:**
- Room-based sessions
- Object ownership and permissions
- Voice chat (Normcore VoIP)
- Spectator mode
- State persistence

**Technical Approach:**
```
Local Edit → Normcore RealtimeModel → Remote Sync
                ↓
    RealtimeTransform (automatic position sync)
    RealtimeView (ownership management)
    VoIPManager (spatial audio)
```

---

### Spec 008: Cross-Platform Export

**Priority:** P2 (Reach)
**Dependency:** 007
**Estimated Tasks:** 35

**Overview:**
Export scenes to multiple platforms: Quest, visionOS, Web.

**Targets:**
| Platform | Approach | Notes |
|----------|----------|-------|
| Quest 2/3 | Unity native build | Passthrough AR |
| visionOS | Unity PolySpatial | Bounded volumes |
| Web | Three.js / Needle | XRAI scene loader |

**Scene Format (XRAI v2.0):**
```json
{
  "version": "2.0",
  "format": "xrai",
  "base": "gltf",
  "extensions": ["XRAI_scene", "XRAI_vfx", "KHR_gaussian_splatting"],
  "entities": [...],
  "environment": {...}
}
```

---

## Success/Failure Scenarios

### Spec 001 + 002 Combined Outcomes

**Scenario A: Full Success (70% probability)**
- Bridge works flawlessly, 60 FPS
- Composer has FigmentAR parity
- Recording + sharing flow complete
- Ready for voice/gesture specs

**Scenario B: Partial Success (25% probability)**
- Bridge works but has edge cases
- Composer missing some VFX effects
- Recording works, some sharing bugs
- Can proceed with limitations

**Scenario C: Major Issues (5% probability)**
- Performance problems on baseline devices
- AR occlusion not working reliably
- Need architecture revision

### Mitigation Strategies

| Risk | Mitigation |
|------|------------|
| Performance regression | Profiling checkpoints, device matrix testing |
| VFX complexity | Start with 5 simple effects, add complexity iteratively |
| Bridge message volume | Debouncing, batching, binary protocol if needed |
| AR tracking issues | Fallback modes, graceful degradation |

---

## Implementation Priorities

### Immediate (This Week)
1. Complete T031 (device performance verification) for 001
2. Start 002 setup tasks (T001-T003)
3. Create ComposerScene in Unity

### Short-Term (This Month)
1. Complete 002 Phase 1-3 (object system, RN screen)
2. Basic recording integration
3. 5 VFX effect presets

### Medium-Term (This Quarter)
1. Complete 002 Phase 4-7 (VFX, library, polish)
2. Start 003 (voice composer) spec
3. Research hand tracking integration

---

## Key Metrics to Track

| Metric | Target | Measurement |
|--------|--------|-------------|
| Frame Rate | 60 FPS sustained | Unity Profiler |
| Bridge Latency | <32ms RTT | Timestamp comparison |
| Memory Usage | <500MB total | Xcode Memory Graph |
| Model Load Time | <2s for 5MB GLB | Network profiler |
| Voice→Action | <500ms | End-to-end timing |
| Build Time | <10 min incremental | CI metrics |

---

## Technology Stack Summary

| Layer | Technology | Status |
|-------|------------|--------|
| **Platform Shell** | React Native 0.81 + Expo SDK 54 | ✅ Stable |
| **Reality Engine** | Unity 6000.2 + AR Foundation 6.3 | ✅ Stable |
| **Bridge** | @artmajeur/react-native-unity | ✅ Patched |
| **VFX** | VFX Graph 17.x | ✅ Ready |
| **State** | Zustand (RN) | ✅ Stable |
| **Storage** | Firebase + Cloudflare R2 | ✅ Stable |
| **AI** | OpenAI GPT-4o + Whisper | 🔄 Integration needed |
| **Multiplayer** | Normcore | 📋 Spec 007 |

---

## References

- `specs/ARCHITECTURE_AUDIT_2026.md` - Full architecture documentation
- `.specify/specs/001-unity-rn-bridge/` - Bridge specification
- `.specify/specs/002-unity-advanced-composer/` - Composer specification
- **`KnowledgeBase/_FIGMENTAR_UNITY_REUSE_ANALYSIS.md`** - **FigmentAR module reuse analysis (Voice+LLM 100% portable)**
- `KnowledgeBase/_KEIJIRO_METAVIDO_VFX_RESEARCH.md` - VFX patterns
- `KnowledgeBase/_OPEN_BRUSH_ICOSA_RESEARCH.md` - Open Brush architecture
- `KnowledgeBase/LEARNING_LOG.md` - Discovery journal

---

## Practical Implementation Strategy

### Critical Path: Spec 001 → 002

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CRITICAL PATH TO MVP                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  001: Unity-RN Bridge (90% Done)                                            │
│  ════════════════════════════════                                           │
│  [DONE] T001-T030: Bridge foundation                                        │
│  [TODO] T031: Device performance verification                               │
│            │                                                                 │
│            ▼                                                                 │
│  ┌─────────────────────────────────┐                                        │
│  │ GATE 001: Performance Check     │                                        │
│  │ ─────────────────────────────── │                                        │
│  │ □ 60 FPS sustained (5 min)      │                                        │
│  │ □ <32ms bridge RTT (avg)        │                                        │
│  │ □ <500MB memory                 │                                        │
│  │ □ No console errors             │                                        │
│  └─────────────────────────────────┘                                        │
│            │                                                                 │
│            ├── PASS ───────────────────────────────────────────────┐        │
│            │                                                       │        │
│            │   002: Unity Advanced Composer                        │        │
│            │   ════════════════════════════                        │        │
│            │                                                       │        │
│            │   Phase 2A: Foundation (Week 1)                       │        │
│            │   ┌────────────────────────────────┐                  │        │
│            │   │ T001-T003: Setup               │                  │        │
│            │   │ T010-T013: Unity scene + bridge│                  │        │
│            │   └────────────────────────────────┘                  │        │
│            │            │                                          │        │
│            │            ▼                                          │        │
│            │   ┌────────────────────────────────┐                  │        │
│            │   │ CHECKPOINT 002A                │                  │        │
│            │   │ □ ComposerScene loads          │                  │        │
│            │   │ □ Ping/pong from RN works      │                  │        │
│            │   │ □ 60 FPS maintained            │                  │        │
│            │   └────────────────────────────────┘                  │        │
│            │            │                                          │        │
│            │            ▼                                          │        │
│            │   Phase 2B: Object System (Week 2)                    │        │
│            │   ┌────────────────────────────────┐                  │        │
│            │   │ T020-T025: Object lifecycle    │                  │        │
│            │   │ - Spawn/destroy objects        │                  │        │
│            │   │ - Gesture handling (XRI)       │                  │        │
│            │   │ - Selection highlight          │                  │        │
│            │   └────────────────────────────────┘                  │        │
│            │            │                                          │        │
│            │            ▼                                          │        │
│            │   ┌────────────────────────────────┐                  │        │
│            │   │ CHECKPOINT 002B                │                  │        │
│            │   │ □ Add/remove objects via RN    │                  │        │
│            │   │ □ Drag/pinch/rotate works      │                  │        │
│            │   │ □ Transforms sync to RN        │                  │        │
│            │   └────────────────────────────────┘                  │        │
│            │            │                                          │        │
│            │            ▼                                          │        │
│            │   Phase 2C: RN UI (Week 2-3)                          │        │
│            │   ┌────────────────────────────────┐                  │        │
│            │   │ T030-T036: React Native screen │                  │        │
│            │   │ - Port FigmentAR components    │                  │        │
│            │   │ - Zustand state                │                  │        │
│            │   │ - Touch passthrough            │                  │        │
│            │   └────────────────────────────────┘                  │        │
│            │            │                                          │        │
│            │            ▼                                          │        │
│            │   ┌────────────────────────────────┐                  │        │
│            │   │ CHECKPOINT 002C                │                  │        │
│            │   │ □ Full UI renders over Unity   │                  │        │
│            │   │ □ Panels functional            │                  │        │
│            │   │ □ No touch conflicts           │                  │        │
│            │   └────────────────────────────────┘                  │        │
│            │            │                                          │        │
│            │            ▼                                          │        │
│            │   Phase 2D: VFX (Week 3-4)                            │        │
│            │   ┌────────────────────────────────┐                  │        │
│            │   │ T040-T044: VFX Graph effects   │                  │        │
│            │   │ - 5 initial presets            │                  │        │
│            │   │ - AR occlusion binding         │                  │        │
│            │   │ - Effect attachment            │                  │        │
│            │   └────────────────────────────────┘                  │        │
│            │            │                                          │        │
│            │            ▼                                          │        │
│            │   ┌────────────────────────────────┐                  │        │
│            │   │ CHECKPOINT 002D                │                  │        │
│            │   │ □ Fire, snow, sparkles work    │                  │        │
│            │   │ □ Effects respect AR depth     │                  │        │
│            │   │ □ <50K particles @ 60 FPS      │                  │        │
│            │   └────────────────────────────────┘                  │        │
│            │            │                                          │        │
│            │            ▼                                          │        │
│            │   Phase 2E: Recording (Week 4)                        │        │
│            │   ┌────────────────────────────────┐                  │        │
│            │   │ T060-T063: Recording flow      │                  │        │
│            │   │ - ArViewRecorder + Unity       │                  │        │
│            │   │ - Full share flow test         │                  │        │
│            │   └────────────────────────────────┘                  │        │
│            │            │                                          │        │
│            │            ▼                                          │        │
│            │   ┌────────────────────────────────┐                  │        │
│            │   │ GATE 002: MVP Complete         │                  │        │
│            │   │ □ Record 30s with VFX          │                  │        │
│            │   │ □ Share to feed works          │                  │        │
│            │   │ □ FigmentAR parity (80%+)      │                  │        │
│            │   └────────────────────────────────┘                  │        │
│            │                                                       │        │
│            └── FAIL ────────────────────────────────────┐         │        │
│                                                         │         │        │
│                                                         ▼         │        │
│                                              ┌──────────────────┐ │        │
│                                              │ Mitigation Path  │ │        │
│                                              │ ────────────────│ │        │
│                                              │ See "Failure     │ │        │
│                                              │ Recovery" below  │ │        │
│                                              └──────────────────┘ │        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Micro-Milestones: Spec 001 Completion

### T031: Device Performance Verification (Final Task)

**Objective**: Prove the bridge foundation is production-ready before building on it.

**Step-by-Step Execution**:

```
T031 Execution Plan
═══════════════════

Day 1: Setup
────────────
□ 1.1 Create performance test scene
      - Add 10 simple cubes with transforms
      - Add timer-based transform updates (60/sec)
      - Add frame rate counter overlay

□ 1.2 Build and deploy to device
      ./scripts/build_minimal.sh

Day 2: Measurement
──────────────────
□ 2.1 Run 5-minute stress test
      - Log frame times to Documents/perf_log.txt
      - Measure bridge RTT with timestamps

□ 2.2 Collect metrics
      - Average FPS: target ≥58
      - 99th percentile frame time: target <20ms
      - Bridge RTT average: target <20ms
      - Memory usage: target <450MB

□ 2.3 Profile with Xcode Instruments
      - CPU profiler (identify hotspots)
      - GPU profiler (verify 60 FPS sustained)
      - Memory (check for leaks)

Day 3: Verification
───────────────────
□ 3.1 Run on iPhone 12 (baseline device)
□ 3.2 Run on iPad Pro (if available)
□ 3.3 Document results in 001 tasks.md
□ 3.4 Update spec status to 100%

Pass Criteria (ALL required):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 60 FPS sustained for 5 minutes
✓ Bridge RTT <32ms (99th percentile)
✓ No memory leaks
✓ No console errors
✓ Works on iPhone 12 (baseline)
```

---

## Micro-Milestones: Spec 002 Implementation

### Phase 2A: Foundation (3-4 days)

```
Phase 2A: Foundation
════════════════════

T001: Create feature branch
───────────────────────────
□ git checkout -b 002-unity-advanced-composer
□ Update .specify/specs/002-*/tasks.md status

T002: Verify Unity MCP
──────────────────────
□ read_console(types=["error", "warning"])
□ Confirm connection: should return 0 errors

T003: Verify iOS device
───────────────────────
□ xcrun devicectl list devices
□ Confirm device name and UDID visible

T010: Create ComposerScene
──────────────────────────
□ Duplicate UnityTestScene.unity → ComposerScene.unity
□ Open in Unity Editor
□ Add to EditorBuildSettings
□ Verify scene loads in Editor

T011: Create ComposerBridgeTarget
─────────────────────────────────
□ Copy BridgeTarget.cs → ComposerBridgeTarget.cs
□ Add new message handlers (empty stubs):
    - add_object
    - remove_object
    - update_transform
    - select_object
    - add_vfx
□ Attach to BridgeTarget GameObject in scene

T012: Implement message handlers
────────────────────────────────
□ add_object: Parse JSON, log message
□ remove_object: Parse JSON, log message
□ update_transform: Parse JSON, log message
□ select_object: Parse JSON, log message

T013: Test ping/pong
────────────────────
□ Build to device: ./scripts/build_minimal.sh
□ Navigate to Composer screen (or test via existing)
□ Send test message from RN
□ Verify Unity logs message receipt
□ Verify Unity can respond to RN

CHECKPOINT 2A Verification:
━━━━━━━━━━━━━━━━━━━━━━━━━━
□ ComposerScene loads without errors
□ Ping/pong working (RN→Unity→RN)
□ 60 FPS maintained
□ No new console warnings
```

### Phase 2B: Object System (5-6 days)

```
Phase 2B: Object System
═══════════════════════

T020: ComposerObjectManager
───────────────────────────
□ Create Assets/Scripts/Composer/ComposerObjectManager.cs
□ Implement object pooling pattern (from FigmentAR)
□ Methods:
    - SpawnObject(id, prefab, transform)
    - DespawnObject(id)
    - GetObject(id)
    - GetAllObjects()

T021: ComposerModelLoader
─────────────────────────
□ Create Assets/Scripts/Composer/ComposerModelLoader.cs
□ Use glTFast for GLB loading
□ Methods:
    - LoadModel(url) → GameObject
    - LoadModelAsync(url, onProgress, onComplete)
□ Add caching to Application.persistentDataPath

T022: Wire object instantiation
───────────────────────────────
□ ComposerBridgeTarget.OnAddObject():
    - Parse add_object message
    - Call ModelLoader.LoadModelAsync()
    - On complete, add to ObjectManager
    - Send confirmation to RN

T023: Selection highlight
─────────────────────────
□ Create outline material or shader
□ Add ComposerSelectable component
□ On select: Apply highlight
□ On deselect: Remove highlight

T024: XR Interaction Toolkit
────────────────────────────
□ Verify XRI package is in project
□ Add XRRayInteractor to ARCamera
□ Add XRGrabInteractable to spawned objects
□ Configure for touch input (not VR controllers)

T025: Transform sync to RN
──────────────────────────
□ On gesture END (not during):
    - Serialize current transform
    - Send transform_update message to RN
□ Debounce if multiple rapid updates

CHECKPOINT 2B Verification:
━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Can add cube from RN → appears in AR
□ Can remove object from RN → disappears
□ Can drag object in AR
□ Can pinch-scale object
□ Can two-finger rotate
□ Selection highlight visible
□ Transforms sync back to RN on gesture end
```

### Phase 2C: React Native UI (4-5 days)

```
Phase 2C: React Native UI
═════════════════════════

T030: AdvancedComposerScreen.tsx
────────────────────────────────
□ Copy UnityTestScene.tsx structure
□ Add camera permission check
□ Add navigation setup
□ Add placeholder for panels

T031: composerSlice.ts (Zustand)
────────────────────────────────
□ Port FigmentAR Redux → Zustand:
    - currentScreen
    - selectedObjectId
    - objects: Map<string, ComposerObject>
    - arTrackingInitialized
□ Add selectors (prevent re-renders)

T032: useComposerBridge.ts hook
───────────────────────────────
□ Wrap unityRef.sendMessage
□ Add typed message helpers:
    - addObject(config)
    - removeObject(id)
    - selectObject(id)
    - addVfx(targetId, vfxType)
□ Handle incoming messages

T033: SceneToolsPanel.tsx
─────────────────────────
□ Copy from FigmentAR
□ Remove ViroReact references
□ Wire to Zustand state
□ Add tabs: Scene, Palette, Library

T034: PaletteTab.tsx
────────────────────
□ Copy from FigmentAR
□ Simplify for Unity (remove Viro effects)
□ Wire to addObject bridge calls

T035: ObjectPropertiesPanel.tsx
───────────────────────────────
□ Copy from FigmentAR
□ Remove ViroReact refs
□ Wire to updateTransform bridge calls
□ Show/hide based on selectedObjectId

T036: Touch passthrough
───────────────────────
□ Configure pointerEvents correctly:
    - Unity view: "auto"
    - Panels: "box-none"
    - Buttons: "auto"
□ Test touch behavior on device

CHECKPOINT 2C Verification:
━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Full UI renders over Unity view
□ Tabs switch correctly
□ Object list shows items
□ Properties panel appears on selection
□ Touch passes through to Unity when expected
□ Touch captured by UI buttons
```

### Phase 2D: VFX Effects (4-5 days)

```
Phase 2D: VFX Effects
═════════════════════

T040: Copy/Create VFX assets
────────────────────────────
□ Check MetavidoVFX for reusable assets
□ Create 5 initial presets:
    1. fire_depth_any.vfx
    2. snow_depth_any.vfx
    3. sparkles_depth_any.vfx
    4. rain_environment.vfx
    5. smoke_depth_any.vfx
□ Use VFX naming convention: {effect}_{datasource}_{target}

T041: ComposerVFXManager.cs
───────────────────────────
□ Create VFX management singleton
□ Methods:
    - AttachVFX(objectId, vfxType)
    - DetachVFX(objectId)
    - SetVFXProperty(objectId, property, value)
□ Use ExposedProperty pattern (not strings)

T042: AR Occlusion for VFX
──────────────────────────
□ Implement ARDepthSource (O(1) compute pattern)
□ Create VFXARBinder component
□ Bind to standard properties:
    - DepthMap
    - ColorMap
    - StencilMap
    - RayParams
    - InverseView

T043: Wire add_vfx message
──────────────────────────
□ ComposerBridgeTarget.OnAddVfx():
    - Parse add_vfx message
    - Call VFXManager.AttachVFX()
    - Send confirmation

T044: VFX tab in Palette
────────────────────────
□ Add VFX category to PaletteTab
□ Show effect thumbnails
□ On tap: addVfx bridge call

CHECKPOINT 2D Verification:
━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Fire effect plays on object
□ Snow falls with AR occlusion
□ Sparkles visible and pretty
□ <50K particles total
□ 60 FPS maintained with VFX
□ Effects toggle on/off from RN
```

### Phase 2E: Recording (3-4 days)

```
Phase 2E: Recording
═══════════════════

T060: Copy RecordButton.tsx
───────────────────────────
□ Copy from FigmentAR
□ Wire to Unity view tag (not ViroARSceneNavigator)
□ Test basic recording start/stop

T061: Verify ArViewRecorder with Unity
──────────────────────────────────────
□ Get Unity view tag: findNodeHandle(unityRef.current)
□ Pass to ArViewRecorder.startRecording()
□ Verify video captures Unity content
□ Check audio capture (Unity AudioListener)

T062: Wire to PostDetailsScreen
───────────────────────────────
□ On recording stop → navigate to share screen
□ Pass videoUri correctly
□ Verify frame scrubber works

T063: Full flow test
────────────────────
□ Test complete flow:
    1. Open composer
    2. Add objects
    3. Add VFX
    4. Record 15 seconds
    5. Select cover frame
    6. Post to feed
    7. Verify in feed

CHECKPOINT 2E / GATE 002 Verification:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Record 30s with VFX
□ Video quality acceptable
□ Share to feed works
□ Post visible in feed
□ FigmentAR feature parity ≥80%
```

---

## Decision Trees: Post-Implementation Scenarios

### Scenario Analysis: After 001 + 002 Complete

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    POST-IMPLEMENTATION DECISION TREE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         002 GATE RESULT                                      │
│                              │                                               │
│            ┌─────────────────┼─────────────────┐                            │
│            │                 │                 │                            │
│      FULL SUCCESS      PARTIAL SUCCESS    MAJOR ISSUES                      │
│       (70% prob)         (25% prob)        (5% prob)                        │
│            │                 │                 │                            │
│            ▼                 ▼                 ▼                            │
│   ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                 │
│   │ Proceed to     │ │ Stabilization  │ │ Architecture   │                 │
│   │ Phase 2        │ │ Sprint         │ │ Review         │                 │
│   └────────────────┘ └────────────────┘ └────────────────┘                 │
│            │                 │                 │                            │
│            ▼                 ▼                 ▼                            │
│   ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                 │
│   │ 003: Voice     │ │ Fix blockers:  │ │ Options:       │                 │
│   │ Composer       │ │ - VFX perf     │ │ - Simplify     │                 │
│   │                │ │ - UI bugs      │ │ - Native impl  │                 │
│   │ OR             │ │ - Bridge edge  │ │ - Hybrid       │                 │
│   │                │ │   cases        │ │ - Pivot        │                 │
│   │ 005: VFX       │ │                │ │                │                 │
│   │ Library        │ │ Then retry     │ │ Re-spec        │                 │
│   │ (parallel)     │ │ gate           │ │ required       │                 │
│   └────────────────┘ └────────────────┘ └────────────────┘                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Full Success Path (70% probability)

**Indicators**:
- 60 FPS sustained on iPhone 12
- All checkpoints passed
- Recording → Feed flow works
- FigmentAR feature parity ≥80%

**Next Actions** (choose based on priorities):

```
Option A: Voice Composer First (Differentiator)
═══════════════════════════════════════════════
Rationale: Voice is unique differentiator vs competitors

Spec 003: Voice Scene Composer
├── Week 1: Research & Spec
│   □ Review FigmentAR voice system
│   □ Design function calling schema
│   □ Define voice command categories
├── Week 2: iOS Dictation Integration
│   □ iOS 17+ Dictation API setup
│   □ On-device STT for low latency
│   □ Basic "add cube" command
├── Week 3: AI Integration
│   □ GPT-4o function calling
│   □ Scene context builder
│   □ Complex commands ("arrange in circle")
└── Week 4: Polish & Testing
    □ Error handling
    □ Offline fallback
    □ Voice feedback (confirmation sounds)


Option B: VFX Library First (Content)
═════════════════════════════════════
Rationale: More effects = more engagement

Spec 005: VFX Library System
├── Week 1: Architecture
│   □ Design preset system
│   □ Addressables for lazy loading
│   □ Category organization
├── Week 2: Effect Creation
│   □ Port MetavidoVFX effects
│   □ Create 10 additional presets
│   □ Standardize ExposedProperties
├── Week 3: UI Integration
│   □ Effect browser in RN
│   □ Preview thumbnails
│   □ Real-time customization
└── Week 4: AR Occlusion Polish
    □ Depth-aware effects
    □ Environment interactions
    □ Performance optimization
```

### Partial Success Path (25% probability)

**Indicators**:
- 50-58 FPS (not consistent 60)
- Some VFX effects not working
- Recording works but has minor bugs
- ~70% FigmentAR parity

**Stabilization Sprint** (1-2 weeks):

```
Stabilization Sprint
════════════════════

Priority 1: Performance (if <60 FPS)
────────────────────────────────────
□ Profile with Xcode Instruments
□ Identify frame time spikes
□ Common fixes:
    - Reduce particle count
    - Optimize shader complexity
    - Batch draw calls
    - Reduce texture sizes

Priority 2: VFX Issues (if effects broken)
──────────────────────────────────────────
□ Verify AR depth texture binding
□ Check ExposedProperty connections
□ Test each effect in isolation
□ Simplify problematic effects

Priority 3: Bridge Edge Cases
─────────────────────────────
□ Review message queue timing
□ Add retry logic for failed messages
□ Implement message acknowledgment
□ Add timeout handling

Priority 4: Recording Bugs
──────────────────────────
□ Test various recording durations
□ Verify audio sync
□ Check memory during recording
□ Test share flow edge cases

After Stabilization:
━━━━━━━━━━━━━━━━━━━
□ Re-run GATE 002 verification
□ If pass: proceed to Phase 2
□ If fail: escalate to architecture review
```

### Major Issues Path (5% probability)

**Indicators**:
- <50 FPS on baseline device
- AR occlusion fundamentally broken
- Bridge unreliable under load
- Memory leaks causing crashes

**Architecture Review**:

```
Architecture Review Process
═══════════════════════════

Week 1: Root Cause Analysis
───────────────────────────
□ Instrument all components
□ Identify bottleneck layer:
    - Unity rendering?
    - Bridge communication?
    - React Native UI?
    - AR Foundation?
□ Document specific failure modes

Week 2: Options Evaluation
──────────────────────────
Option A: Simplify
    - Remove complex VFX
    - Reduce scope to core features
    - Target 002-lite spec

Option B: Native Implementation
    - Move more to Unity (less RN)
    - Native UI for performance-critical paths
    - Reduce bridge traffic

Option C: Hybrid Approach
    - Split: simple features in RN, complex in Unity
    - Separate performance tiers
    - Progressive enhancement

Option D: Pivot
    - Consider alternative architecture
    - Evaluate pure Unity approach
    - Assess timeline impact

Week 3: Decision & Re-spec
──────────────────────────
□ Present options to stakeholders
□ Choose approach
□ Create revised spec
□ Update roadmap accordingly
```

---

## Phase 2+ Detailed Roadmap

### After Successful 001 + 002: Parallel Tracks

```
Q2 2026 Implementation Strategy
═══════════════════════════════

           ┌─────────────────────────────────────────────────────┐
           │              PARALLEL DEVELOPMENT TRACKS            │
           └─────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │                        │                        │
    ┌──────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
    │   TRACK A   │          │   TRACK B   │          │   TRACK C   │
    │   Features  │          │   Content   │          │   Platform  │
    └─────────────┘          └─────────────┘          └─────────────┘
           │                        │                        │
           ▼                        ▼                        ▼
    Week 1-4:                Week 1-4:                Week 1-4:
    Spec 003                 Spec 005                 Research:
    Voice Composer           VFX Library              - Normcore eval
    ─────────────            ───────────              - Quest build test
    □ iOS Dictation          □ 20 effects            - visionOS POC
    □ GPT-4o schema          □ Categories
    □ Scene context          □ Addressables
    □ Commands               □ Preview UI
           │                        │                        │
           ▼                        ▼                        ▼
    Week 5-8:                Week 5-8:                Week 5-8:
    Spec 004                 Spec 006                 Spec 007 Start
    Hand Gestures            Audio-Reactive           Normcore MVP
    ─────────────            ──────────────           ────────────
    □ AR Foundation          □ Beat detection         □ Room system
      hand tracking          □ FFT bands              □ Object sync
    □ XRI gestures           □ VFX bindings           □ Basic voice
    □ Pinch/grab             □ Visualizers            □ 2-player test
           │                        │                        │
           ▼                        ▼                        ▼
    Week 9-12:               Week 9-12:               Week 9-12:
    Integration              Polish                   Spec 008 Start
    ───────────              ──────────               ──────────────
    □ Voice + hand           □ More effects           □ Quest build
      combo                  □ User presets           □ XRAI format
    □ Multimodal             □ Sharing                □ Web viewer
      commands               □ Performance
```

### Spec 003: Voice Scene Composer (Detailed)

```
Spec 003: Voice Scene Composer
══════════════════════════════
Priority: P0 (Differentiator)
Dependencies: 002 complete
Estimated Duration: 4 weeks
Tasks: ~25

Week 1: Research & Specification
────────────────────────────────
□ Review FigmentAR voice implementation
    - Location: src/screens/FigmentAR/VoiceComposerButton.js
    - Existing: Whisper STT, scene context builder
□ Design function calling schema for GPT-4o
□ Define command categories:
    - Object creation: "add a cube"
    - Modification: "make it bigger"
    - Arrangement: "arrange in a circle"
    - Effects: "add fire"
    - Scene: "clear all"
□ Write spec.md and plan.md

Week 2: On-Device STT
─────────────────────
□ Implement iOS 17+ Dictation API
□ Create VoiceInputManager in RN
□ Handle microphone permissions
□ Implement start/stop recording
□ Basic command recognition (local patterns)

Week 3: AI Integration
──────────────────────
□ Create OpenAI service wrapper
□ Implement function calling schema:
    {
      "name": "add_object",
      "parameters": {
        "type": "string",
        "position": "string", // "in front", "to the left"
        "scale": "number"
      }
    }
□ Build scene context for AI:
    - Current objects list
    - Selected object
    - Camera position
□ Map AI responses to bridge messages

Week 4: Polish & Edge Cases
───────────────────────────
□ Add confirmation sounds
□ Implement offline fallback (basic commands)
□ Error handling:
    - No microphone access
    - AI service unavailable
    - Unrecognized command
□ Add visual feedback (recording indicator)

Success Metrics:
━━━━━━━━━━━━━━━
□ <500ms voice→action latency
□ 90% accuracy on test command set
□ Works offline for 5 basic commands
□ Graceful degradation when AI unavailable
```

### Spec 005: VFX Library System (Detailed)

```
Spec 005: VFX Library System
════════════════════════════
Priority: P1 (Content)
Dependencies: 002 Phase 2D complete
Estimated Duration: 4 weeks
Tasks: ~30

Week 1: Architecture Design
───────────────────────────
□ Design VFX preset structure:
    [ScriptableObject]
    VFXPreset {
      string id
      string displayName
      string category
      Texture2D thumbnail
      VisualEffectAsset asset
      ExposedPropertyConfig[] properties
    }
□ Implement VFXLibrary.cs singleton
□ Set up Addressables for lazy loading
□ Design category taxonomy:
    - Environment (rain, snow, fog, clouds)
    - Fire/Energy (flames, sparks, lightning)
    - Particles (confetti, bubbles, petals)
    - Trails (ribbons, smoke, sparkles)
    - Audio-Reactive (future, placeholder)

Week 2: Effect Creation
───────────────────────
□ Port effects from MetavidoVFX:
    1. fire_depth_any.vfx
    2. smoke_depth_any.vfx
    3. rain_environment.vfx
    4. snow_depth_any.vfx
    5. sparkles_depth_any.vfx
□ Create new effects:
    6. confetti_burst.vfx
    7. bubbles_rising.vfx
    8. lightning_arc.vfx
    9. fog_ground.vfx
    10. petals_falling.vfx
□ Apply naming convention: {effect}_{datasource}_{target}
□ Standardize ExposedProperties per effect

Week 3: React Native UI
───────────────────────
□ Create VFXLibraryTab component
□ Implement category filtering
□ Add search functionality
□ Create effect preview thumbnails
□ Implement real-time parameter adjustment:
    - Color picker
    - Rate slider
    - Size slider

Week 4: Performance & Polish
────────────────────────────
□ Profile all effects on iPhone 12
□ Set particle budgets per effect
□ Implement LOD (reduce particles at distance)
□ Add effect combinations (stack effects on object)
□ Test with 10 objects + effects simultaneously

Success Metrics:
━━━━━━━━━━━━━━━
□ 20+ effects in library
□ All effects maintain 60 FPS
□ <100ms to load new effect
□ UI browse + apply < 3 taps
```

---

## Risk Mitigation Matrix

| Risk | Probability | Impact | Mitigation | Trigger |
|------|-------------|--------|------------|---------|
| **Performance regression** | 25% | High | Profile at each checkpoint; revert if >5 FPS drop | FPS < 55 |
| **VFX complexity** | 30% | Medium | Start simple (5 effects), add incrementally | GPU time > 8ms |
| **Bridge message volume** | 20% | Medium | Debounce, batch, consider binary protocol | RTT > 50ms |
| **AR tracking issues** | 15% | High | Fallback modes, graceful degradation | Planes < 2 |
| **Memory leaks** | 20% | High | Profile every build; fix immediately | Memory > 450MB |
| **FigmentAR porting issues** | 25% | Medium | Simplify components; rewrite if needed | >50% components fail |

---

## Weekly Cadence

```
Standard Development Week
═════════════════════════

Monday:
  □ Review week goals
  □ Check Unity console (read_console)
  □ Plan tasks for the day

Tuesday-Thursday:
  □ Implementation work
  □ Build to device at least once/day
  □ Update task checkboxes
  □ Log blockers immediately

Friday:
  □ Device testing (full flow)
  □ Performance check (Xcode Instruments)
  □ Update spec/task status
  □ Document learnings in KB

Every Checkpoint:
  □ Full gate verification
  □ Performance metrics logged
  □ Screenshots/videos for documentation
  □ KB update with patterns discovered
```

---

## Definition of Done

### Per Task
- [ ] Code compiles without errors
- [ ] Runs on device (not just Editor)
- [ ] Meets performance targets (60 FPS)
- [ ] No new console warnings
- [ ] Task checkbox marked [X]

### Per Phase
- [ ] All tasks in phase complete
- [ ] Checkpoint verification passed
- [ ] Performance metrics documented
- [ ] No blocking issues for next phase

### Per Spec
- [ ] All phases complete
- [ ] Gate verification passed
- [ ] Documentation updated
- [ ] PR created with spec reference
- [ ] Merged to main

---

**Next Action:** Complete 001 T031 (device verification), then begin 002 implementation.
