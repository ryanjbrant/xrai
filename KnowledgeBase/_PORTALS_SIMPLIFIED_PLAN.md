# Portals: Simplified Implementation Plan

**Date:** 2026-02-05
**Approach:** Learn from Luma AI - one thing, done magically well

---

## Luma AI Lessons

| What They Did | Lesson |
|---------------|--------|
| Started with ONE feature (3D capture) | Focus beats features |
| Free app, 2M users before Series A | Prove magic before monetizing |
| Phone only (no desktop) first | Constraint creates focus |
| "Scan → beautiful 3D" in seconds | Zero friction to magic |
| Added video generation LATER | Expand only after mastering one |
| B2B pivot once proven | Consumer validates, enterprise pays |

**Key insight:** Luma didn't launch with video, Gaussian splatting, AND 3D capture. They launched with ONE THING: scan with phone → get beautiful 3D.

---

## Our "One Thing" - Two Options

### Option A: Voice → Object

```
"Add a glowing cube behind the chair"
     ↓
     ✨ It appears ✨
```

### Option B: Video → Hologram

```
Point camera at yourself or friend
     ↓
     ✨ Live hologram in AR ✨
```

---

## Comparison: Which "One Thing"?

| Dimension | Voice → Object | Video → Hologram |
|-----------|----------------|------------------|
| **Wow factor** | High ("I spoke, it appeared") | Very high ("I'm a hologram!") |
| **Technical risk** | Low (FigmentAR code exists) | Medium (Metavido integration) |
| **Differentiation** | AI+AR (competitors catching up) | Telepresence (fewer competitors) |
| **Single user** | Natural fit | Works (selfie hologram) |
| **Multiplayer path** | Add later | Built-in (Zoom for holograms) |
| **Code reuse** | 100% FigmentAR | ~70% Metavido patterns |
| **Time to demo** | 1-2 weeks | 2-3 weeks |

### Option B Details: Video → Hologram

**Modes:**
1. **Selfie hologram** - See yourself as AR hologram (single user)
2. **Live stream** - Friend's video becomes hologram in your space
3. **Recorded playback** - Watch volumetric recordings in AR
4. **Zoom-style call** - Multiple people as holograms (future)

**Why it might be better:**
- "Holographic Zoom" is a clearer pitch than "voice AR editor"
- Telepresence solves real loneliness problem (from vision)
- Luma did capture → then expanded. We could too.
- Less crowded market than AI scene builders

**Simplest v0.1:**
```
Open app → See yourself as hologram → Record → Share
```

No voice, no LLM, no scene editing. Just: **you, as a hologram.**

---

## Decision: Pick ONE

| If you want... | Choose |
|----------------|--------|
| Fastest to demo | Option A (Voice) |
| Highest wow | Option B (Hologram) |
| AI differentiator | Option A |
| Telepresence vision | Option B |
| Lower risk | Option A |
| Bolder bet | Option B |

**Recommendation:** Test BOTH as 1-day prototypes, see which gets better reaction.

---

## Option B: 4-Week Plan

### Week 1: Selfie Hologram

```
Day 1-2: Integrate Metavido encoder
├── XRDataProvider → FrameEncoder
└── Test: See encoded frame

Day 3-4: Display as hologram
├── Decode back to point cloud or mesh
├── Render in AR space
└── Test: See yourself as hologram

Day 5: Polish
├── Position hologram in front of camera
├── Basic lighting match
└── Test: "Wow, I'm a hologram!"
```

### Week 2: Record & Playback

```
Day 1-2: Recording
├── Avfi integration (or simpler MP4)
├── Save to camera roll
└── Test: Record 10-sec hologram

Day 3-4: Playback
├── Load recorded video
├── Decode and display
└── Test: Watch yourself as hologram

Day 5: Share
├── Export shareable video
├── Basic share sheet
└── Test: Send to friend
```

### Week 3: Live Stream (P2P)

```
Day 1-3: WebRTC basics
├── Simple peer connection
├── Send video stream
└── Test: Two phones connected

Day 4-5: Hologram stream
├── Encode on sender
├── Decode on receiver
├── Display as hologram
└── Test: See friend as hologram!
```

### Week 4: User Testing

Same as Option A - 10 users, gather feedback.

---

## Hybrid Option: Voice + Hologram

If both feel essential, sequence them:

```
Month 1: Hologram (selfie → record → share)
Month 2: Add voice ("make my hologram glow")
Month 3: Add telepresence (friend as hologram)
```

Voice becomes a feature OF the hologram experience, not the core.

---

### Why This One Thing?

| Alternative | Why NOT first |
|-------------|---------------|
| Audio-reactive VFX | Nice, but not unique |
| Hand tracking paint | Hardware limited (Vision) |
| Multiplayer | Needs solo experience first |
| Recording/sharing | Needs content to share |
| Full scene composer | Too complex for v1 |

| Voice → AR | Why FIRST |
|------------|-----------|
| Feels like magic | "I spoke and it appeared" |
| AI differentiator | Competitors don't have this |
| Works on any iPhone 12+ | No special hardware |
| 100% code reuse | FigmentAR pipeline exists |
| <1 week to working demo | Low risk |

---

## Simplified Architecture

### What We Need (Minimum)

```
┌────────────────────────────────────────────────────────────────┐
│                      MINIMUM VIABLE MAGIC                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Input                                                     │
│  └── Voice (expo-audio, already have)                          │
│                                                                 │
│  AI Understanding                                               │
│  └── Gemini API (already integrated)                           │
│                                                                 │
│  AR Rendering                                                   │
│  └── Unity + AR Foundation (already working)                   │
│                                                                 │
│  Objects                                                        │
│  └── 5 primitives: cube, sphere, cylinder, plane, capsule      │
│                                                                 │
│  That's it. Nothing else for v0.1.                             │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### What We DON'T Need (Yet)

```
❌ Custom scene format (use Unity native)
❌ Asset database (primitives are built-in)
❌ Web viewer (mobile only first)
❌ Multiplayer (solo first)
❌ Recording (prove magic first)
❌ Hand tracking (voice only first)
❌ Audio reactivity (voice only first)
❌ VFX Graph effects (solid colors first)
❌ Android (iOS only first)
```

---

## Implementation: 4 Weeks to Magic

### Week 1: Voice → Text → Action

**Goal:** Speak "add a red cube" → get action JSON

```
Day 1-2: Copy FigmentAR voice code
├── voice.ts → Unity project equivalent
├── VoiceComposerButton UI
└── Test: button works, audio records

Day 3-4: Wire Gemini
├── Copy aiSceneComposer.ts logic
├── Simplified prompt (primitives only)
└── Test: "add a cube" → { action: "spawn", type: "cube" }

Day 5: Error handling
├── No internet? Show message
├── Gemini fails? Retry once
└── Test: graceful failures
```

**Deliverable:** Press button, speak, see action JSON logged

### Week 2: Action → Unity Object

**Goal:** Action JSON → visible AR object

```
Day 1-2: Bridge message
├── RN sends action to Unity
├── ComposerBridgeTarget receives
└── Test: message arrives in Unity

Day 3-4: Spawn primitives
├── PrimitiveSpawner.cs (50 lines)
├── 5 primitives: cube, sphere, etc.
├── Position: 1m in front of camera
└── Test: spawn command creates object

Day 5: Basic transforms
├── Color from voice ("red", "blue")
├── Scale from voice ("big", "small")
└── Test: "add a big red cube" works
```

**Deliverable:** Voice creates colored primitive in AR

### Week 3: Polish & Test

**Goal:** Smooth enough for others to try

```
Day 1-2: UX polish
├── Loading indicator during AI call
├── Confirmation sound when object appears
├── Error messages users understand

Day 3-4: Device testing
├── Test on 3 different iPhones
├── Fix any device-specific issues
├── Performance check (60 FPS)

Day 5: TestFlight build
├── Create TestFlight version
├── Write 1-paragraph description
└── Submit for review
```

**Deliverable:** TestFlight link ready to share

### Week 4: User Feedback

**Goal:** 10 people try it, we learn

```
Day 1: Share with 5 friends
├── Send TestFlight link
├── Ask: "Try saying 'add a blue cube'"
├── Watch them use it (screen share)

Day 2-3: Collect feedback
├── What confused them?
├── What delighted them?
├── What did they try that didn't work?

Day 4-5: Triage
├── List all feedback
├── Mark: critical / nice-to-have / ignore
├── Plan Week 5 based on learnings
```

**Deliverable:** Feedback doc, prioritized next steps

---

## Success Criteria (Week 4)

| Metric | Pass | Fail |
|--------|------|------|
| Voice → object works | 90%+ success rate | <70% |
| Time to magic | <5 seconds | >15 seconds |
| User reaction | "Cool!" or "Wow!" | "Meh" or confusion |
| Retention | Try 3+ commands | Quit after 1 |
| Crashes | <1 per session | >3 per session |

---

## After Week 4: Decision Tree

```
IF users say "wow" AND retention is good:
    → Week 5-8: Add recording + sharing
    → Build social loop

IF users say "I wish it could ___":
    → Build that ONE thing
    → Re-test with same users

IF users are confused:
    → Simplify further
    → Better onboarding
    → Re-test

IF voice accuracy is the issue:
    → Try different STT
    → Better prompts
    → Re-test

IF AR is the issue:
    → Debug AR Foundation
    → Test on more devices
    → Consider non-AR fallback
```

---

## File Structure (Minimal)

```
portals/
├── src/
│   ├── services/
│   │   ├── voice.ts           # Copy from FigmentAR
│   │   └── voiceComposer.ts   # Simplified AI service
│   ├── components/
│   │   └── VoiceButton.tsx    # Press-to-talk UI
│   └── screens/
│       └── ARComposer.tsx     # Main screen
│
├── unity/Assets/Scripts/
│   ├── Bridge/
│   │   └── ComposerBridgeTarget.cs  # Receive commands
│   └── Composer/
│       └── PrimitiveSpawner.cs      # Create objects
│
└── That's it. ~10 files for v0.1.
```

---

## What We're NOT Building (Yet)

| Feature | When | Why Wait |
|---------|------|----------|
| Scene save/load | Week 5+ | Need content first |
| Recording | Week 5+ | Need content first |
| Sharing | Week 6+ | Need recording first |
| Android | Week 8+ | iOS proves concept |
| Web viewer | Month 2+ | Mobile proves concept |
| Custom models | Month 2+ | Primitives prove concept |
| VFX effects | Month 2+ | Solid objects first |
| Audio reactivity | Month 3+ | After core is solid |
| Hand tracking | Month 3+ | Voice proves concept |
| Multiplayer | Month 4+ | Solo proves concept |

---

## Anti-Goals for v0.1

| Don't | Why |
|-------|-----|
| Build the "platform" | Build one magic moment |
| Support all commands | Support 10 commands well |
| Handle all edge cases | Handle happy path perfectly |
| Make it pretty | Make it work |
| Write documentation | Ship and learn |
| Plan Month 2 | Finish Week 4 first |

---

## Simplified Vision Alignment

### Big Vision (5+ years)

> "Minecraft in physical spaces. Say it, see it build. Wave hands, see magic."

### v0.1 Vision (4 weeks)

> "Say it, see a cube appear."

### The Path

```
v0.1: Voice → cube
v0.2: Voice → objects + colors + positions
v0.3: Recording → share
v0.4: Gallery → social
v0.5: Hand paint → draw in air
...
v2.0: Multiplayer → build together
...
v5.0: Full platform → the dream
```

**Each version is ONE THING done well.**

---

## Luma Parallel

| Luma | Portals |
|------|---------|
| Scan → 3D | Voice → AR object |
| Phone app, free | Phone app, free |
| Beautiful renders | Magical appearance |
| 2M users → Series A | 10K users → next phase |
| Added video later | Add features later |

---

## Final Checklist: Week 1 Start

- [ ] FigmentAR voice.ts copied
- [ ] Gemini prompt simplified (primitives only)
- [ ] VoiceButton component created
- [ ] ARComposer screen created
- [ ] ComposerBridgeTarget updated
- [ ] PrimitiveSpawner created (50 lines)
- [ ] Test: "add a cube" → cube appears
- [ ] Ship to TestFlight

**Everything else is scope creep.**

---

*"Make it work, then make it good, then make it fast."*
*We're on "make it work."*

---

Sources:
- [Luma AI Growth & Funding](https://sacra.com/c/luma-ai/)
- [Luma Series C at $4B Valuation](https://kr-asia.com/luma-ai-draws-saudi-backing-to-pivot-toward-multimodal-foundation-models)
- [Luma Dream Machine - 30M Users](https://www.superbcrew.com/luma-ai-raises-900-million-in-series-c-funding-round/)

*Last Updated: 2026-02-05*
