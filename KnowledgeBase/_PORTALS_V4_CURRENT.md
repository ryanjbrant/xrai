# Portals V4 - Current Architecture

**Project**: Unity 6 + React Native 0.81 (Fabric) + AR Foundation 6.2
**Updated**: 2026-02-05
**Specs**: `portals_main/specs/`, `portals_main/.specify/specs/`

---

## Quick Reference

| Component | Technology | Location |
|-----------|------------|----------|
| AR Engine | Unity 6 + AR Foundation 6.2 | `unity/` |
| UI Layer | React Native 0.81 (Fabric) | `src/` |
| State | Zustand | `src/stores/` |
| VFX | VFX Graph (NOT Shuriken) | `unity/Assets/VFX/` |
| Bridge | BridgeTarget.cs ↔ UnityArView.tsx | JSON messages |

---

## Core Philosophy

> "If it is Logic, write in React Native. If it is 10,000 Particles, write in Unity VFX Graph."

### Layer Separation

| Layer | Owns | Does NOT Own |
|-------|------|--------------|
| React Native | User state, Auth, Navigation, Business logic | 3D rendering, Physics, VFX |
| Unity | Spatial transforms, Frame-accurate VFX, AR tracking | User data, Network state, UI logic |

---

## Long-Term Roadmap

| Phase | Focus | Key Capabilities |
|-------|-------|------------------|
| **1. Foundation** | Unity AR Composer | Object placement, VFX, recording, single-user |
| **2. Natural Input** | Speech & Gesture | Voice commands, hand tracking, eye gaze |
| **3. High-Fidelity** | Zero-Latency AR | Predictive input, GPU particles, neural rendering |
| **4. Multiplayer** | Collaborative Creation | 100+ users, cross-platform sync, spatial presence |
| **5. Platform** | Open World | Scene marketplace, remixing, AI assistants |

---

## VFX Architecture (from MetavidoVFX)

### O(1) Compute Pattern

```
ARDepthSource.cs (SINGLETON)
  └── Single compute dispatch per frame
  └── Outputs: PositionMap, StencilMap, VelocityMap
      ↓
VFXARBinder.cs (per VFX, ~0.2ms)
  └── Just SetTexture() calls
  └── No per-VFX compute
      ↓
VFX Graph
```

### Mobile Constraints

| Platform | Max Particles | Target FPS |
|----------|---------------|------------|
| iPhone 12+ | 50,000 | 60 |
| iPad Pro | 100,000 | 60 |
| Quest 2 | 30,000 | 72 |
| Quest 3 | 50,000 | 90 |

### Standard Properties

```
DepthMap      Texture2D    Raw AR depth (RFloat)
ColorMap      Texture2D    Camera RGB
StencilMap    Texture2D    Human segmentation mask
PositionMap   Texture2D    GPU-computed world XYZ
RayParams     Vector4      Camera intrinsics
InverseView   Matrix4x4    Camera-to-world transform
```

---

## Open Source Strategy

### Proprietary (Closed Source)

- Core App (RN + Unity)
- AI Scene Composer
- Voice-to-World Engine
- Feed Algorithm
- Authentication

### Open Source

| Component | License | Purpose |
|-----------|---------|---------|
| XRAI Format | MIT | Scene interchange |
| VNMF Format | MIT | VFX/Neural/Model assets |
| VFX Library | MIT | Community effects |
| SDK | MIT | Third-party integration |
| AI Model Wrappers | Apache 2.0 | Model integration |

See: `specs/OPEN_SOURCE_ARCHITECTURE.md`

---

## Build Commands

```bash
# Standard build (~5 min)
./scripts/build_minimal.sh

# Nuclear clean (~10-15 min)
./scripts/nuclear_clean_build.sh

# Force clean Unity export
UNITY_CLEAN_BUILD=1 ./scripts/build_minimal.sh
```

---

## Key Specs

| Spec | Purpose | Location |
|------|---------|----------|
| VFX Architecture | VFX Graph patterns, AR integration | `specs/VFX_ARCHITECTURE.md` |
| Open Source | Closed/open split, XRAI/VNMF formats | `specs/OPEN_SOURCE_ARCHITECTURE.md` |
| Unity Integration | UAAL, AR Foundation | `specs/unity-integration.md` |
| Asset Pipeline | Cloud processing, R2/CDN | `specs/asset-pipeline.md` |
| Constitution | Project principles | `.specify/memory/constitution.md` |
| Advanced Composer | Unity composer migration | `.specify/specs/001-unity-advanced-composer/` |

---

## References

- **Portals Repo**: `portals_main/`
- **Build Guide**: `portals_main/CLAUDE.md`
- **MetavidoVFX Patterns**: `Unity-XR-AI/References/MetavidoVFX-main/`
- **Archived V4 Docs**: `_archive/_PORTALS_V4_ARCHITECTURE.md`
