# Notion ↔ Knowledgebase Sync Guide

**Last Synced**: 2026-02-05
**Notion Page**: [Portals XR AI Live VFX Learning Guide](https://handsome-trillium-4b1.notion.site/Portals-XR-AI-Live-VFX-Learning-Guide-1ef5a71be33e8048a0c9c3414a360fc1)
**KB Location**: `Unity-XR-AI/KnowledgeBase/`

---

## Quick Sync Checklist

When updating either Notion or KB, ensure both have:

- [ ] All VFX Graph repos (Keijiro collection)
- [ ] AR Foundation depth/stencil projects
- [ ] Audio reactive VFX projects
- [ ] Gaussian splatting implementations
- [ ] Hand/body tracking VFX
- [ ] HoloKit/Reality Labs projects
- [ ] React Native Unity integration
- [ ] Three.js/WebXR projects

---

## Key Repos for Notion (from KB)

### VFX Graph Essentials (Keijiro)
| Repo | Purpose | Priority |
|------|---------|----------|
| [keijiro/MetavidoVFX](https://github.com/keijiro/MetavidoVFX) | O(1) compute pattern, AR depth VFX | **Critical** |
| [keijiro/Rcam4](https://github.com/keijiro/Rcam4) | Latest depth streaming + VFX | **Critical** |
| [keijiro/Rcam3](https://github.com/keijiro/Rcam3) | Depth camera VFX patterns | High |
| [keijiro/Rcam2](https://github.com/keijiro/Rcam2) | Original depth VFX (HDRP) | Medium |
| [keijiro/SplatVFX](https://github.com/keijiro/SplatVFX) | Gaussian splatting VFX | High |
| [keijiro/Akvfx](https://github.com/keijiro/Akvfx) | Point cloud VFX patterns | Medium |
| [keijiro/Fluo](https://github.com/keijiro/Fluo) | Audio-reactive brushes | Medium |
| [keijiro/LaspVfx](https://github.com/keijiro/LaspVfx) | Audio VFX binders | Medium |
| [keijiro/Khoreo](https://github.com/keijiro/Khoreo) | Stage performance VFX | Medium |

### AR Foundation Integration
| Repo | Purpose | Priority |
|------|---------|----------|
| [Unity-Technologies/arfoundation-samples](https://github.com/Unity-Technologies/arfoundation-samples) | Official AR samples | **Critical** |
| [Unity-Technologies/arfoundation-demos](https://github.com/Unity-Technologies/arfoundation-demos) | Advanced demos | High |
| [DanMillerDev/ARFoundation_VFX](https://github.com/DanMillerDev/ARFoundation_VFX) | AR + VFX integration | High |
| [cdmvision/arfoundation-densepointcloud](https://github.com/cdmvision/arfoundation-densepointcloud) | LiDAR point clouds | Medium |

### Hand/Body Tracking VFX
| Repo | Purpose | Priority |
|------|---------|----------|
| [holokit/touching-hologram](https://github.com/holokit/touching-hologram) | Hand VFX (21 effects) | **Critical** |
| [realitydeslab/holokit-app](https://github.com/realitydeslab/holokit-app) | HoloKit AR experiences | High |
| [mao-test-h/FaceTracking-VFX](https://github.com/mao-test-h/FaceTracking-VFX) | Face mesh VFX | High |
| [homuler/MediaPipeUnityPlugin](https://github.com/homuler/MediaPipeUnityPlugin) | ML body/face tracking | High |

### Gaussian Splatting
| Repo | Purpose | Priority |
|------|---------|----------|
| [aras-p/UnityGaussianSplatting](https://github.com/aras-p/UnityGaussianSplatting) | Full Unity implementation | **Critical** |
| [keijiro/SplatVFX](https://github.com/keijiro/SplatVFX) | VFX Graph integration | High |
| [playcanvas/supersplat](https://github.com/playcanvas/supersplat) | Web splat editor | Medium |
| [mkkellogg/GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D) | Three.js splats | Medium |

### React Native + Unity
| Repo | Purpose | Priority |
|------|---------|----------|
| [YourArtOfficial/react-native-unity](https://github.com/YourArtOfficial/react-native-unity) | UAAL Fabric integration | **Critical** |
| [azesmway/react-native-unity](https://github.com/azesmway/react-native-unity) | Original RN Unity | High |
| [fusetools/react-native-unity2](https://github.com/nicholasluimy/react-native-unity2) | Alternative approach | Medium |

### WebXR/Three.js
| Repo | Purpose | Priority |
|------|---------|----------|
| [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | React Three.js | High |
| [pmndrs/xr](https://github.com/pmndrs/xr) | WebXR for R3F | High |
| [needle-tools/needle-engine-support](https://github.com/needle-tools/needle-engine-support) | Unity → Web | High |
| [AR-js-org/AR.js](https://github.com/AR-js-org/AR.js) | Web AR | Medium |

---

## Key Repos for KB (if missing from Notion)

### Unity 6 / VFX Graph 17+
| Repo | Notes |
|------|-------|
| [Unity-Technologies/VisualEffectGraph-Samples](https://github.com/Unity-Technologies/VisualEffectGraph-Samples) | Official VFX samples |
| [Unity-Technologies/EntityComponentSystemSamples](https://github.com/Unity-Technologies/EntityComponentSystemSamples) | DOTS for particles |

### Spec-Kit Workflow
| Repo | Notes |
|------|-------|
| [github/spec-kit](https://github.com/github/spec-kit) | SDD methodology |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | AI coding assistant |

### VisionOS / PolySpatial
| Repo | Notes |
|------|-------|
| [dilmerv/UnityVisionOS2DAndVR](https://github.com/dilmerv/UnityVisionOS2DAndVR) | visionOS examples |
| [imclab/Apple-Vision-PRO-AR-VR-XR-AI](https://github.com/imclab/Apple-Vision-PRO-AR-VR-XR-AI) | Vision Pro resources |

---

## Notion Page Structure Suggestion

```
Portals XR AI Live VFX Learning Guide
├── Getting Started
│   ├── Project Setup
│   ├── Build Commands
│   └── Quick Reference
├── VFX Graph Patterns
│   ├── O(1) Compute (MetavidoVFX)
│   ├── AR Depth Integration
│   ├── Audio Reactive
│   └── Mobile Optimization
├── GitHub Repos (by category)
│   ├── Core VFX (Keijiro)
│   ├── AR Foundation
│   ├── Hand/Body Tracking
│   ├── Gaussian Splatting
│   └── WebXR/Three.js
├── Specs & Architecture
│   ├── VFX_ARCHITECTURE.md
│   ├── OPEN_SOURCE_ARCHITECTURE.md
│   └── Constitution
└── Learning Resources
    ├── Unity Docs
    ├── Tutorials
    └── External Tools
```

---

## Cross-Reference Files

| KB File | Notion Section |
|---------|----------------|
| `_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md` | GitHub Repos |
| `_VFX_SOURCES_REGISTRY.md` | VFX Graph Patterns |
| `_VFX_SOURCE_BINDINGS.md` | AR Depth Integration |
| `_PORTALS_V4_CURRENT.md` | Architecture |
| `_HAND_VFX_PATTERNS.md` | Hand Tracking |
| `_GAUSSIAN_SPLATTING_VFX_PATTERNS.md` | Gaussian Splatting |
| `_KEIJIRO_AUDIO_VFX_RESEARCH.md` | Audio Reactive |

---

## Sync Process

### KB → Notion
1. Export key sections from KB markdown files
2. Format for Notion (headers, tables, callouts)
3. Update Notion page sections
4. Add new repos from recent research

### Notion → KB
1. Export Notion page as markdown
2. Parse for new repos/resources
3. Add to `_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md`
4. Update category-specific KB files

---

## Recently Added (2026-02-05)

From VFX Architecture research:
- O(1 compute pattern documentation
- UV-to-world HLSL algorithm
- Mobile performance constraints (50K particles)
- VFX naming convention: `{effect}_{datasource}_{target}_{origin}.vfx`

From Open Source research:
- XRAI format specification
- VNMF asset format specification
- Proprietary/open split strategy
