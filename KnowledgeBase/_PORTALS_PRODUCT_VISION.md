# Portals: Product Vision

**Version:** 1.0
**Date:** 2026-02-05
**Status:** Definitive North Star

---

## The Dream

> **"Minecraft in physical spaces. Say the words, see it build. Wave your hands, see magic from fingertips."**

Zero-latency vibe world creator for the real world. AI amplifies human expression. Collaborative creativity becomes telepresence. Spatial computing made magical.

---

## Core Promise

```
Speak → See it build
Gesture → See magic
Share → Feel together
```

**One sentence:** The most natural way to create and share magical experiences in physical space.

---

## Design Principles

### 1. Simple

| Principle | Meaning |
|-----------|---------|
| Minimal code | Every line must earn its place |
| Minimal dependencies | Only what's essential |
| Minimal abstraction | Explicit > clever |
| Minimal cost | Free tier first, scale later |

### 2. Modular

| Principle | Meaning |
|-----------|---------|
| Swappable parts | Replace any component without rewriting |
| Clear boundaries | Each module owns one thing |
| No god objects | Nothing knows everything |
| Easy to delete | Remove a feature in <1 hour |

### 3. Extensible

| Principle | Meaning |
|-----------|---------|
| Plugin architecture | Add features without core changes |
| Open formats | Standard data, not proprietary |
| API-first | Everything is an interface |
| Community-ready | Others can build on it |

### 4. Scalable

| Principle | Meaning |
|-----------|---------|
| Single user → millions | Same architecture |
| Single device → cross-platform | Same codebase |
| Prototype → production | Same patterns |
| Indie → enterprise | Same foundation |

---

## Single Source of Truth

### The "Edit Once, Publish Everywhere" Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SINGLE SOURCE OF TRUTH                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                   │
│  │  Single UI  │   │Single Scene │   │ Single Asset│                   │
│  │  Definition │   │   Format    │   │   Database  │                   │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘                   │
│         │                 │                 │                           │
│         └────────────┬────┴────────────────┘                           │
│                      │                                                  │
│                      ▼                                                  │
│              ┌───────────────┐                                          │
│              │  Build System │                                          │
│              │  (one config) │                                          │
│              └───────┬───────┘                                          │
│                      │                                                  │
│    ┌─────────┬───────┼───────┬─────────┬─────────┐                     │
│    ▼         ▼       ▼       ▼         ▼         ▼                     │
│ ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                  │
│ │ iOS │  │Droid│  │ Web │  │vOS  │  │Quest│  │ Mac │                  │
│ │     │  │     │  │(GL) │  │(Web)│  │     │  │ /PC │                  │
│ └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Single UI Definition

```
UI Definition (declarative)
├── Components (buttons, panels, sliders)
├── Layout (responsive, adaptive)
├── Theme (colors, fonts, spacing)
└── Behavior (interactions, animations)

Renderers:
├── Unity (UI Toolkit / Canvas)
├── Web (React / Three.js)
└── Native (SwiftUI / Jetpack Compose) [optional]
```

### Single Scene Format

```
Scene (JSON + glTF)
├── Objects (transforms, meshes, materials)
├── Effects (VFX references, audio)
├── Logic (interactions, animations)
└── Metadata (author, version, permissions)

Loaders:
├── Unity (glTFast, native VFX)
├── Web (Three.js, custom VFX)
└── Quest (Unity native)
```

### Single Asset Database

```
Asset Database (cloud-native)
├── 3D Models (glTF/GLB)
├── Textures (WebP/KTX2)
├── Audio (AAC/Opus)
├── VFX Definitions (JSON + shaders)
└── AI Models (ONNX) [future]

Storage:
├── R2/S3 (CDN-backed)
├── Local cache (device)
└── Offline fallback (bundled essentials)
```

---

## Platform Priority

### Phase 1: Mobile First (Now)

| Platform | Priority | Approach |
|----------|----------|----------|
| **iOS** | #1 | Unity UAAL (AR Foundation) |
| **Android** | #2 | Unity UAAL (ARCore) |

**Why mobile first:**
- Largest audience
- AR Foundation mature
- Touch/voice input proven
- Camera/sensors everywhere

### Phase 2: Web Everywhere (Next)

| Platform | Priority | Approach |
|----------|----------|----------|
| **Mobile Web** | #3 | WebGL (Three.js or Unity) |
| **Desktop Web** | #4 | Same build, larger screen |
| **visionOS Safari** | #5 | WebXR (same web build) |

**Why web second:**
- Zero install friction
- Universal access
- Share via link
- visionOS gets web "for free"

### Phase 3: Immersive (Future)

| Platform | Priority | Approach |
|----------|----------|----------|
| **Quest** | #6 | Unity native (MR passthrough) |
| **visionOS Native** | #7 | Unity PolySpatial (if needed) |

**Why immersive later:**
- Smaller audience
- Different UX patterns
- Mobile proves product first

---

## AI+AR First Features

### Voice: Say It, See It Build

```
"Add a glowing cube behind the chair"
     │
     ▼
┌─────────────────┐
│  Speech → Text  │ (on-device or cloud)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   LLM Parser    │ (Gemini, GPT, local)
│   "What do they │
│    want?"       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Scene Action   │ (spawn, move, effect)
└────────┬────────┘
         │
         ▼
    Magic happens
```

### Gesture: Wave It, See Magic

```
Hand tracking → Gesture recognition → Action

Examples:
├── Pinch + drag → Move object
├── Two-hand spread → Scale
├── Paint motion → Draw in air
├── Wave → Trigger effect
└── Point → Select / raycast
```

### AI Assistance

```
Context-aware suggestions:
├── "You might want to add lighting here"
├── "This object could be animated"
├── "Similar scenes use these effects"
└── Auto-arrange, auto-color, auto-animate
```

---

## High Fidelity Multiplayer

### Telepresence Goals

| Feature | Quality Bar |
|---------|-------------|
| Latency | <100ms (feel instant) |
| Presence | See cursor, avatar, gaze |
| Voice | Spatial audio, low latency |
| Sync | Same scene state everywhere |

### Architecture (Minimal Cost)

```
Option A: P2P First (zero server cost)
├── WebRTC for voice/video
├── CRDT for scene sync
└── Fallback to relay if P2P fails

Option B: Lightweight Server (scale later)
├── Firebase Realtime DB (free tier)
├── Cloudflare Workers (generous free tier)
└── Normcore/Photon (when revenue exists)
```

### Collaboration Modes

```
1. Live Cursors (lowest effort)
   - See where others are looking
   - Colored indicators

2. Synchronized Editing (medium effort)
   - Objects sync across users
   - Ownership/locking

3. Full Telepresence (highest effort)
   - Avatars/holograms
   - Spatial voice
   - Body/hand presence
```

---

## Magic Experiences

### What "Magic" Means

| Moment | Implementation |
|--------|----------------|
| "I spoke and it appeared" | Voice → instant spawn |
| "It responds to music" | Audio-reactive VFX |
| "I drew with my finger" | Hand tracking paint |
| "My friend is right here" | Telepresence avatar |
| "It knows what I want" | AI anticipation |
| "It just works" | Zero config, instant start |

### VFX Quality Bar

| Platform | Target | Technique |
|----------|--------|-----------|
| iOS/Android | 60 FPS, <50K particles | VFX Graph, GPU instancing |
| Web | 30 FPS, <10K particles | Three.js, GPGPU |
| Quest | 72 FPS, <30K particles | VFX Graph, foveated |

---

## Developer Experience

### Easy for Unity Devs

```
- Standard Unity patterns
- Familiar tools (VFX Graph, Timeline)
- Clear project structure
- Good documentation
```

### Easy for Non-Unity Devs

```
- Web SDK (JavaScript)
- Scene format is JSON
- REST API for assets
- No Unity required for basic scenes
```

### Contribution Model

```
Core (proprietary)
├── App binary
├── Business logic
└── Premium features

Open (MIT/Apache)
├── Scene format spec
├── Asset format spec
├── Web viewer
├── VFX templates
└── AI model wrappers
```

---

## Success Metrics

### User Magic

| Metric | Target |
|--------|--------|
| Time to first "wow" | <30 seconds |
| Session length | 5+ minutes |
| Return rate | 40%+ week 1 |
| Share rate | 20%+ create → share |

### Technical Excellence

| Metric | Target |
|--------|--------|
| Build time | <3 minutes |
| First launch | <5 seconds |
| Frame rate | 60 FPS (mobile) |
| Crash rate | <0.1% |

### Business Sustainability

| Metric | Target (Year 1) |
|--------|-----------------|
| MAU | 10,000+ |
| Cost/user | <$0.01 |
| Revenue | $1+ (prove it's possible) |

---

## The One-Liner Test

Every feature must pass:

> **"Does this help someone say words and see magic?"**

If not, defer it.

---

## Anti-Vision (What We're NOT Building)

| NOT This | Because |
|----------|---------|
| Professional CAD tool | Too complex |
| Social network first | Platform risk |
| Hardware company | Capital intensive |
| Enterprise-only | Limits creativity |
| Walled garden | Kills community |
| Tech demo | Must be useful |

---

## The Dream, Restated

```
A child speaks: "I want a dragon"
A dragon appears, breathing fire that dances with music
Their friend across the world sees it too
They reach out, and sparkles trail from their fingers
They build a world together
It feels like magic
Because it is.
```

---

*Last Updated: 2026-02-05*
