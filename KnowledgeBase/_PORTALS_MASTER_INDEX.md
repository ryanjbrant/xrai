# Portals V4: Master Knowledge Index

**Date:** 2026-02-05
**Purpose:** Single entry point for all Portals strategic and technical knowledge

---

## Quick Navigation

| Document | Purpose | Status |
|----------|---------|--------|
| [_PORTALS_NEXT_STEP.md](./_PORTALS_NEXT_STEP.md) | **START HERE** - Immediate action plan | Active |
| [_PORTALS_SIMPLIFIED_PLAN.md](./_PORTALS_SIMPLIFIED_PLAN.md) | 4-week focused plan (Luma-inspired) | Active |
| [_PORTALS_VIDEO_TO_MAGIC_ARCHITECTURE.md](./_PORTALS_VIDEO_TO_MAGIC_ARCHITECTURE.md) | Video → Magic pipeline | Reference |
| [_PORTALS_PRODUCT_VISION.md](./_PORTALS_PRODUCT_VISION.md) | Core vision & principles | Reference |
| [_PORTALS_HISTORY_AND_VISION.md](./_PORTALS_HISTORY_AND_VISION.md) | Paint-AR lineage & manifesto | Reference |
| [_PORTALS_BRAND_MESSAGING.md](./_PORTALS_BRAND_MESSAGING.md) | Sound bites & positioning | Reference |
| [_PORTALS_V4_STRATEGIC_AUDIT_2026-02.md](./_PORTALS_V4_STRATEGIC_AUDIT_2026-02.md) | Full strategic audit | Reference |
| [_PORTALS_UNIFIED_ARCHITECTURE.md](./_PORTALS_UNIFIED_ARCHITECTURE.md) | Edit-once-publish-everywhere | Reference |

---

## Key Strategic Decisions (Feb 2026)

### 1. The "One Thing" Focus

**Chosen:** Video → Hologram (live particle hologram video calls)

**Why:**
- Higher "wow" factor than voice → object
- Telepresence solves real loneliness problem
- Less crowded market than AI scene builders
- MetavidoVFX has core already built

### 2. Luma AI Pattern

```
Sparse Input → AI Understanding → Rich Output
     │               │                │
  Video         Scene/Body         VFX Magic
  LiDAR         Tracking           Holograms
```

**Key insight:** Minimal input, maximum magic. Don't try to capture everything - let AI fill in the gaps.

### 3. Port, Don't Build

**MetavidoVFX already has:**
- Single user recording/playback ✅
- WebRTC P2P conferencing ✅
- UI/UX (Lobby, HUD) ✅
- 73+ VFX assets ✅

**Effort:** ~3000 LOC, ~1 week to port

### 4. Platform Priority

```
iOS (LiDAR) → Android (ARCore) → Web (WebGPU) → Quest
```

**Web proven:** keijiro WebGPU demo runs VFX Graph in browser.

---

## Key Technical Learnings

### Record3D Ecosystem

| Repo | Purpose | Direction |
|------|---------|-----------|
| `record3d` | iOS RGBD streaming (USB) | iOS → Computer |
| `record3d_unity_demo` | Unity VFX integration | iOS → Unity |
| `record3d-wifi-streaming-demo` | Three.js web viewer | iOS → Browser |

**Important:** Record3D Three.js is ONE-WAY only (no webcam → Unity).

### MetavidoVFX Implementation

| Component | File | Status |
|-----------|------|--------|
| Recording | `RecordingController.cs` | ✅ Complete |
| Playback | `HologramController.cs` | ✅ Complete |
| WebRTC | `HologramConferenceManager.cs` | ✅ Complete |
| Encoder | `MetavidoWebRTCEncoder.cs` | ✅ Complete |
| Decoder | `MetavidoWebRTCDecoder.cs` | ✅ Complete |
| Signaling | `H3MSignalingClient.cs` | ✅ Complete |
| VFX Binder | `H3MWebRTCVFXBinder.cs` | ✅ Complete |

**WebRTC Plugin:** Use `WebRtcVideoChat` (NOT `com.unity.webrtc` - causes iOS conflicts).

### Hybrid Bridge Pattern

```
ARDepthSource (1 compute) → WorldState → VFXARBinder (N bindings)
        O(1)                Singleton         ~5μs each
```

**Performance:** 353 FPS with 10 VFX on iPhone 15 Pro.

---

## Implementation Phases

### Phase 1: Selfie Hologram (Week 1-2)
- Port MetavidoVFX hologram code
- Single user sees self as particle hologram
- Basic recording/playback

### Phase 2: P2P Hologram Call (Week 3-4)
- Port WebRTC conferencing code
- Two users see each other as holograms
- <200ms latency on WiFi

### Phase 3: Polish & Scale (Month 2)
- 4-6 user support (SFU if needed)
- WebGPU web build
- Production signaling/TURN servers

### Phase 4: Lifelike Mode (Month 3+)
- Denser point cloud rendering
- Gaussian splat option
- visionOS Persona-style quality

---

## Hologram Styles

| Style | Look | Technique | Priority |
|-------|------|-----------|----------|
| Abstract/Painterly | Particles, trails, glow | VFX Graph | P0 (first) |
| Lifelike (Persona) | Solid, facial detail | Dense point cloud / GSplat | P2 (later) |

---

## What NOT to Build

| Don't Build | Why |
|-------------|-----|
| New encoding format | Metavido exists |
| New VFX system | VFX Graph exists |
| New streaming protocol | WebRTC exists |
| New depth extraction | AR Foundation exists |
| Voice → Object (yet) | Focus on one thing first |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Selfie hologram latency | <50ms |
| P2P call latency | <200ms |
| Memory usage | <150MB |
| User reaction | "Wow!" (8/10) |

---

## External References

| Resource | URL | Notes |
|----------|-----|-------|
| keijiro MetavidoVFX | github.com/keijiro/MetavidoVFX | WebGPU demo |
| keijiro WebGPU Demo | keijiro.tokyo/WebGPU-Test/MetavidoVFX/ | Live browser demo |
| Record3D | record3d.app | iOS RGBD capture |
| Record3D GitHub | github.com/marek-simonik/record3d | USB streaming lib |
| Luma AI | lumalabs.ai | Inspiration for sparse→rich |

---

## Constitution Updates

These learnings are now in `portals_main/.specify/memory/constitution.md`:
- Strategic Audit Principles
- "Prove magic first" approach
- Radical simplification targets
- Paint-AR lineage reference

---

*Single source of truth for Portals V4 strategy.*
*Last Updated: 2026-02-05*
