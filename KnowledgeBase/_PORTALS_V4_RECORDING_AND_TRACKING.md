# Portals V4: Recording & Tracking Decision Framework

**Created:** 2026-02-05
**Purpose:** Guide decision-making for recording and tracking capabilities
**Approach:** Research-first, no tech assumptions, short-term wins → long-term scale

---

## Core Questions to Answer

Before choosing any implementation, we need clarity on:

### 1. Recording - What are we capturing and why?

| Question | Short-Term Answer | Long-Term Consideration |
|----------|-------------------|-------------------------|
| **Who is the audience?** | Social sharing (friends, feed) | Professional creators, enterprise |
| **What fidelity is needed?** | Screen pixels are fine | Volumetric replay, spatial audio |
| **Where does it play back?** | Same device, social apps | Cross-platform, web, VR headsets |
| **How long are recordings?** | 15-60 sec clips | Full sessions (minutes to hours) |

### 2. Tracking - What body/hand/face data do we need?

| Question | Short-Term Answer | Long-Term Consideration |
|----------|-------------------|-------------------------|
| **What drives VFX?** | Simple triggers (tap, gesture) | Full body, hands, face expression |
| **How precise?** | Zone detection (near/far) | Joint-level (fingers, skeleton) |
| **What platforms?** | iOS first | Android, Quest, visionOS, Web |
| **Real-time or recorded?** | Real-time only | Record + playback for editing |

### 3. Audio - What streams do we need?

| Question | Short-Term Answer | Long-Term Consideration |
|----------|-------------------|-------------------------|
| **Voice commands?** | Yes - LLM scene building | Multi-language, contextual AI |
| **Audio reactivity?** | Nice-to-have | Core feature, music sync |
| **Multiplayer voice?** | No | Yes (Phase 4+) |
| **Record all audio?** | Video soundtrack only | Separate stems for remix |

---

## Decision Framework: Recording

### Dimension 1: Capture Complexity

```
Level 1: Screen Capture Only
├── What: Pixels as user sees them
├── Easiest: Already have ArViewRecorder
├── Limits: No metadata, no replay editing
└── Scale: Add audio tracks later

Level 2: Screen + AR Metadata
├── What: Pixels + camera pose + depth
├── Enables: View-dependent playback
├── Effort: Medium (Unity-side encoder)
└── Scale: Foundation for volumetric

Level 3: Full Volumetric Capture
├── What: RGBD + pose + tracking data
├── Enables: 6DOF replay, holographic
├── Effort: High (Metavido-style)
└── Scale: Professional content creation
```

**Recommendation**: Start Level 1 (already working), design for Level 2 extensibility.

### Dimension 2: Storage & Playback

```
Local Only (simplest)
├── Save to device camera roll
├── Share via iOS share sheet
└── No cloud cost

Cloud-Enabled (scalable)
├── Upload to R2/S3
├── Stream playback
└── Social feed integration

Hybrid (recommended)
├── Local by default
├── Cloud on user action (share)
└── Progressive upload
```

**Recommendation**: Local-first with opt-in cloud (already have this pattern).

---

## Decision Framework: Tracking

### Dimension 1: What to track?

```
Level 1: Touch/Gaze Only
├── What: Screen taps, device orientation
├── Already have: Full support in RN + Unity
├── Enough for: Object placement, basic UI
└── No additional work needed

Level 2: Body Presence (coarse)
├── What: Is a person there? Silhouette?
├── Enables: Occlusion, "you are here" effects
├── Effort: Low (ARKit built-in)
└── Platform: iOS only for now

Level 3: Skeletal Tracking (joints)
├── What: 17-91 joint positions
├── Enables: Avatar driving, gesture recognition
├── Effort: Medium (provider abstraction)
└── Platform: iOS native, others need ML

Level 4: Full Multimodal
├── What: Body + hands + face + audio
├── Enables: Full avatar, emotion, VFX sync
├── Effort: High (multiple providers)
└── Platform: Per-platform implementations
```

**Recommendation**: Start Level 1-2 (already working), design interfaces for Level 3-4.

### Dimension 2: Platform Strategy

```
Option A: iOS-First, Others Later
├── Ship fast on primary platform
├── ~70% of target users
├── Add Android/Quest when proven
└── Risk: Platform-specific code debt

Option B: Abstraction-First
├── ITrackingProvider interface now
├── iOS implementation first
├── Stubs for other platforms
└── Risk: Over-engineering early

Option C: Hybrid (Recommended)
├── iOS native for core features
├── Light abstraction for hot-swap
├── MockProvider for Editor testing
└── Add platforms as needed
```

**Recommendation**: Option C - iOS native with minimal abstraction that allows growth.

---

## Decision Framework: Audio

### Dimension 1: Voice Commands

```
Option A: RN-Side (Current)
├── expo-audio → Gemini → Bridge
├── 100% code reuse from FigmentAR
├── Works immediately
└── Latency: 1.2-2.0s (acceptable)

Option B: Unity-Side
├── Unity.Microphone → local model
├── Lower latency possible
├── More work, less proven
└── Better for Quest standalone

Option C: Server-Side
├── Firebase Cloud Function
├── Multiplayer-ready
├── Adds cloud dependency
└── Better for scale
```

**Recommendation**: Start Option A (proven), design for Option B/C portability.

### Dimension 2: Audio Reactivity

```
Option A: Unity-Only (Simplest)
├── Unity.Microphone → GetSpectrumData
├── Local, low latency (~10ms)
├── No RN involvement
└── Bridge message to enable/disable

Option B: RN-Controlled
├── RN handles mic permission
├── Passes audio data to Unity
├── More control, more complexity
└── Not recommended

Option C: Parallel Streams
├── Voice (RN) and Reactivity (Unity) separate
├── Each owns its mic context
├── No conflicts (discrete vs continuous)
└── Recommended
```

**Recommendation**: Option C - separate streams, Unity owns reactivity.

---

## Recommended Implementation Order

### Sprint 1: Prove Core Value (1-2 weeks)

**Goal**: Voice → Unity scene editing working on device

| Task | Approach | Risk |
|------|----------|------|
| Copy FigmentAR voice pipeline | 100% reuse | Low |
| Create UnityCompiler.ts | ~100 lines | Low |
| Wire to existing ComposerBridgeTarget | Bridge exists | Low |
| Test on iOS device | Already buildable | Low |

**No new libraries. No new abstractions. Prove the magic works.**

### Sprint 2: Recording for Social (1 week)

**Goal**: Record + share AR creations to feed

| Task | Approach | Risk |
|------|----------|------|
| Wire ArViewRecorder to Unity screen | Already works for ViroReact | Low |
| Copy PostDetailsScreen flow | 100% reuse | Low |
| Verify MP4 includes audio | May need config | Medium |

**No volumetric yet. Screen capture is enough for social proof.**

### Sprint 3: Audio Reactivity (1 week)

**Goal**: VFX responds to music/ambient sound

| Task | Approach | Risk |
|------|----------|------|
| Add AudioReactivityManager.cs | Unity.Microphone + FFT | Low |
| Create 1 audio-reactive VFX | Port from MetavidoVFX | Medium |
| Bridge toggle (enable/disable) | Simple message | Low |

**Research**: Do we need separate mic sessions on iOS? Test first.

### Sprint 4+: Evaluate & Extend

Based on learnings from Sprints 1-3:

| If... | Then... |
|-------|---------|
| Voice latency is issue | Research Unity-side STT |
| Recording needs metadata | Design Metavido-lite encoder |
| Android users demand | Add ITrackingProvider abstraction |
| Multiplayer is priority | Evaluate Normcore vs Photon |

---

## Research Questions (Not Answered Yet)

These need investigation before committing to solutions:

### Recording
- [ ] Can ArViewRecorder capture Unity view audio? (test needed)
- [ ] What's the simplest path to embed camera pose in MP4? (format research)
- [ ] R2 vs Firebase Storage for video hosting? (cost analysis)

### Tracking
- [ ] What's minimum viable body tracking for VFX? (just silhouette?)
- [ ] BodyPix vs ARKit segmentation quality? (visual comparison)
- [ ] Quest standalone feasibility for Phase 5? (hardware limits)

### Audio
- [ ] iOS mic session conflict between expo-audio and Unity? (test needed)
- [ ] FFT band count for good VFX reactivity? (4? 6? 16?)
- [ ] Normcore vs Photon for multiplayer voice? (feature comparison)

---

## Anti-Patterns to Avoid

| Don't | Why | Instead |
|-------|-----|---------|
| Build volumetric capture first | Over-engineering | Screen capture proves value faster |
| Abstract before you have 2 implementations | YAGNI | iOS-native first, abstract when needed |
| Assume you need all tracking modes | Complexity | Start with touch/gaze, add on demand |
| Mix audio streams through single manager | Coupling | Keep voice and reactivity independent |
| Build for Quest before iOS is solid | Platform creep | One platform well > two platforms poorly |

---

## Success Criteria

### Short-Term (Sprints 1-3)
- [ ] Voice command creates object in Unity scene
- [ ] Recording captures Unity view with audio
- [ ] At least one VFX responds to audio input
- [ ] All above works on physical iOS device

### Long-Term (6+ months)
- [ ] Same codebase runs on iOS + Android
- [ ] Multiplayer voice chat working
- [ ] Volumetric recording for professional use
- [ ] Quest standalone mode

---

## References

### Existing Implementations (Study, Don't Copy Blindly)
- **FigmentAR voice pipeline**: `src/services/voice.ts`, `aiSceneComposer.ts`
- **ArViewRecorder**: `modules/ar-view-recorder/ios/`
- **MetavidoVFX tracking**: `Assets/Scripts/Tracking/ITrackingProvider.cs`
- **MetavidoVFX recording**: `Assets/Documentation/RECORDING_ARCHITECTURE.md`

### Portals V3 (Hours Already Invested)
- **_JT_PRIORITIES.md**: 320-430 hours of AR work already done
- **Hand tracking**: HoloKit integration complete
- **Body VFX**: PeopleOcclusionVFXManager working
- **Audio reactive**: Mic.cs + Reaktion prototype exists

### Decision: What to Port vs Rebuild
| Port from V3 | Rebuild Fresh |
|--------------|---------------|
| Hand tracking concepts | Unity UAAL architecture |
| VFX patterns | Bridge message protocol |
| Audio FFT approach | State management |

---

*Approach: Research → Prototype → Learn → Decide → Scale*
*Last Updated: 2026-02-05*
