# Portals: Unified Architecture

**Version:** 1.0
**Date:** 2026-02-05
**Purpose:** Edit once, publish everywhere - technical approach

---

## Overview

Three single sources of truth enable multi-platform publishing:

```
┌────────────────────────────────────────────────────────────────┐
│                    SINGLE SOURCES OF TRUTH                      │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. UI Definition      2. Scene Format      3. Asset Database │
│   (what users see)      (what they create)   (what they use)   │
│                                                                 │
│   ↓ Compiles to ↓       ↓ Loads on ↓         ↓ Streams to ↓    │
│                                                                 │
│   iOS · Android · Web · visionOS · Quest · Mac · PC            │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 1. Single UI Definition

### Approach: Declarative UI Schema

Instead of platform-specific UI code, define UI in a declarative format:

```json
{
  "screen": "composer",
  "layout": {
    "type": "stack",
    "children": [
      {
        "type": "toolbar",
        "position": "top",
        "items": [
          { "id": "undo", "icon": "arrow-left", "action": "scene.undo" },
          { "id": "redo", "icon": "arrow-right", "action": "scene.redo" }
        ]
      },
      {
        "type": "canvas",
        "id": "ar-view",
        "flex": 1
      },
      {
        "type": "palette",
        "position": "bottom",
        "categories": ["objects", "effects", "lighting"]
      }
    ]
  }
}
```

### Renderers

| Platform | Renderer | Notes |
|----------|----------|-------|
| Unity (all) | UI Toolkit | Newest, flexible |
| Unity (legacy) | uGUI Canvas | If needed |
| Web | React components | From JSON schema |
| Native (optional) | SwiftUI/Compose | For deep integration |

### Implementation Path

```
Phase 1: Unity UI Toolkit (all Unity builds)
├── iOS, Android, Quest, Mac, PC
└── One codebase

Phase 2: Web renderer
├── React/Preact from same JSON
└── Shared component library

Phase 3: Native wrappers (optional)
├── SwiftUI shell for iOS
└── Jetpack Compose for Android
└── Only for platform-specific features
```

---

## 2. Single Scene Format

### Approach: JSON + glTF

Standard formats that every platform can read:

```
scene.json
├── metadata (author, version, created)
├── environment (lighting, skybox, ground)
├── objects[] (references to glTF assets)
├── effects[] (VFX definitions)
├── audio[] (sound sources)
├── logic[] (interactions, animations)
└── multiplayer (sync settings)
```

### Object Definition

```json
{
  "id": "cube-001",
  "type": "model",
  "asset": "assets/primitives/cube.glb",
  "transform": {
    "position": [0, 1, -2],
    "rotation": [0, 45, 0],
    "scale": [1, 1, 1]
  },
  "material": {
    "color": "#ff6b6b",
    "emission": 0.5
  },
  "interactions": [
    { "trigger": "tap", "action": "animate", "params": { "name": "spin" } }
  ]
}
```

### VFX Definition

```json
{
  "id": "effect-001",
  "type": "vfx",
  "template": "particle-burst",
  "params": {
    "color": ["#ff0000", "#ffff00"],
    "count": 1000,
    "lifetime": 2,
    "audioReactive": true,
    "audioBinding": "bass"
  },
  "attachTo": "cube-001"
}
```

### Platform Loading

| Platform | 3D Loader | VFX System |
|----------|-----------|------------|
| Unity | glTFast | VFX Graph (compiled templates) |
| Web | Three.js GLTFLoader | Custom particle system |
| Quest | Unity glTFast | VFX Graph (optimized) |

---

## 3. Single Asset Database

### Approach: Cloud-Native with Local Cache

```
┌─────────────────────────────────────────────────────────────────┐
│                     ASSET DATABASE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cloud (R2/S3)           CDN                    Device          │
│  ┌──────────────┐    ┌──────────┐    ┌─────────────────────┐   │
│  │ Original     │───▶│ Edge     │───▶│ Local Cache         │   │
│  │ Assets       │    │ Cached   │    │ (LRU, size-limited) │   │
│  └──────────────┘    └──────────┘    └─────────────────────┘   │
│                                                                  │
│  Formats:                                                        │
│  ├── 3D: glTF/GLB (universal)                                   │
│  ├── Textures: WebP (small) or KTX2 (GPU-compressed)            │
│  ├── Audio: AAC (iOS) or Opus (Web)                             │
│  └── VFX: JSON definition + compiled shaders per platform       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Asset Manifest

```json
{
  "version": "1.0",
  "assets": [
    {
      "id": "cube-primitive",
      "type": "model",
      "variants": {
        "default": "cube.glb",
        "lowpoly": "cube-lod1.glb"
      },
      "size": 12400,
      "hash": "a1b2c3..."
    },
    {
      "id": "fire-vfx",
      "type": "vfx",
      "platforms": {
        "unity": "fire.vfx",
        "web": "fire.json"
      }
    }
  ]
}
```

### Caching Strategy

```
1. Bundled essentials (ship with app)
   ├── UI assets
   ├── Primitive shapes
   └── Core VFX templates

2. On-demand download (user triggers)
   ├── Custom models
   ├── User-created content
   └── Premium assets

3. Predictive prefetch (background)
   ├── Trending assets
   ├── Friends' creations
   └── Likely next actions
```

---

## Platform Build Matrix

### Unity Builds

| Platform | Build Target | AR System | Renderer |
|----------|--------------|-----------|----------|
| iOS | iOS | AR Foundation (ARKit) | URP |
| Android | Android | AR Foundation (ARCore) | URP |
| Quest | Android (Meta) | OpenXR + Passthrough | URP |
| Mac | macOS | None (3D only) | URP |
| PC | Windows | None (3D only) | URP |

### Web Builds

| Platform | Technology | AR System | Notes |
|----------|------------|-----------|-------|
| Mobile Web | Three.js | WebXR (limited) | Fallback to 3D-only |
| Desktop Web | Three.js | None | Full 3D viewer |
| visionOS Safari | Three.js + WebXR | WebXR | Same as mobile web |

### Build Configuration

```yaml
# portals-build.yaml
version: 1.0

unity:
  version: 6000.2.x
  pipeline: URP
  targets:
    - ios
    - android
    - quest
    - macos
    - windows

web:
  framework: vite
  renderer: three.js
  targets:
    - mobile
    - desktop
    - webxr

shared:
  scene_format: json+gltf
  asset_cdn: r2.portals.app
  ui_schema: v1
```

---

## VFX Cross-Platform Strategy

### Challenge

VFX Graph (Unity) doesn't run on web. Need equivalent visual quality.

### Solution: VFX Compiler

```
VFX Definition (JSON)
        │
        ▼
┌───────────────────┐
│   VFX Compiler    │
│                   │
│  Reads definition │
│  Outputs:         │
│  ├── Unity .vfx   │
│  ├── Web shader   │
│  └── Quest .vfx   │
└───────────────────┘
        │
        ▼
Platform-specific implementation
```

### VFX Template System

```json
{
  "template": "particle-burst",
  "description": "Exploding particles from a point",
  "params": {
    "count": { "type": "int", "default": 1000, "min": 100, "max": 50000 },
    "color": { "type": "gradient", "default": ["#fff", "#000"] },
    "lifetime": { "type": "float", "default": 2, "min": 0.1, "max": 10 }
  },
  "implementations": {
    "unity": "Packages/com.portals.vfx/Runtime/Templates/ParticleBurst.vfx",
    "web": "src/vfx/templates/particle-burst.js"
  }
}
```

### Quality Tiers

| Tier | Platforms | Particle Limit | Features |
|------|-----------|----------------|----------|
| High | iOS, Quest, Desktop | 50K | Full VFX Graph |
| Medium | Android, Mobile Web | 20K | Simplified shaders |
| Low | Old devices | 5K | Sprite-based |

---

## Multiplayer Architecture

### Minimal Cost Approach

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTIPLAYER STACK                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Presence (who's here?)                                │
│  ├── Firebase Realtime DB (free: 100K connections/month)        │
│  └── Data: user_id, cursor_position, room_id                    │
│                                                                  │
│  Layer 2: Scene Sync (what do we see?)                          │
│  ├── CRDT (conflict-free replicated data type)                  │
│  └── Library: Yjs or Automerge                                  │
│                                                                  │
│  Layer 3: Voice (can we talk?)                                  │
│  ├── WebRTC P2P (free)                                          │
│  └── Fallback: Daily.co or Agora (paid, if needed)              │
│                                                                  │
│  Layer 4: Avatars (can we see each other?)                      │
│  ├── Position sync via Layer 1                                  │
│  └── Full body tracking: future (needs more bandwidth)          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Cost Projection

| Users | Firebase | WebRTC | CDN | Total/month |
|-------|----------|--------|-----|-------------|
| 100 | $0 | $0 | $0 | $0 |
| 1,000 | $0 | $0 | ~$1 | ~$1 |
| 10,000 | ~$25 | $0 | ~$10 | ~$35 |
| 100,000 | ~$200 | ~$50 relay | ~$100 | ~$350 |

---

## Development Workflow

### For Unity Devs

```
1. Open Unity project
2. Edit scenes, VFX, scripts
3. Test in Editor (MockAR mode)
4. Build to target platform
5. Auto-exports to scene format

Tools: Unity Editor, VFX Graph, standard workflow
```

### For Non-Unity Devs

```
1. Use Web editor (React app)
2. Drag-drop assets
3. Configure VFX via UI
4. Preview in browser
5. Publish (generates scene.json)

Tools: Browser, no Unity required
```

### Shared Assets

```
Both workflows:
├── Read from same asset database
├── Write to same scene format
├── Publish to same CDN
└── Users see same experience
```

---

## Implementation Phases

### Phase 1: Prove It (4 weeks)

```
✓ Voice → AR object (Unity, iOS)
✓ Screen recording
✓ Share to feed
✓ 10 users test it

Deliverable: Working demo, user feedback
```

### Phase 2: Unify (4 weeks)

```
□ Scene format v1 (JSON + glTF)
□ Asset database (R2)
□ Web viewer (Three.js, read-only)
□ Android build

Deliverable: Same scene viewable on iOS, Android, Web
```

### Phase 3: Create Anywhere (4 weeks)

```
□ Web editor (React)
□ VFX template system
□ Asset upload from web
□ Basic multiplayer (cursors)

Deliverable: Create on web, view on mobile
```

### Phase 4: Feel Together (4 weeks)

```
□ Voice chat (WebRTC)
□ Scene sync (CRDT)
□ Presence indicators
□ Quest build

Deliverable: Two people build together
```

---

## File Structure

```
portals/
├── unity/                    # Unity project (iOS, Android, Quest)
│   ├── Assets/
│   │   ├── Scenes/
│   │   ├── Scripts/
│   │   │   ├── Core/        # Scene loading, asset management
│   │   │   ├── AR/          # AR Foundation wrappers
│   │   │   ├── VFX/         # VFX Graph templates
│   │   │   ├── Multiplayer/ # Sync, presence
│   │   │   └── Bridge/      # RN communication (minimal)
│   │   └── Resources/       # Bundled assets
│   └── Packages/            # Custom packages
│
├── web/                      # Web viewer + editor
│   ├── viewer/              # Three.js scene viewer
│   ├── editor/              # React scene editor
│   └── shared/              # Common utilities
│
├── schemas/                  # Single source of truth definitions
│   ├── scene.schema.json    # Scene format spec
│   ├── ui.schema.json       # UI definition spec
│   └── vfx.schema.json      # VFX template spec
│
├── assets/                   # Shared asset library
│   ├── models/              # glTF files
│   ├── textures/            # Images
│   └── vfx/                 # VFX definitions
│
└── tools/                    # Build & conversion tools
    ├── vfx-compiler/        # VFX → platform-specific
    ├── asset-pipeline/      # Optimize & upload assets
    └── scene-validator/     # Validate scene format
```

---

## Success Criteria

| Criteria | How to Measure |
|----------|----------------|
| Edit once, publish everywhere | Same scene.json loads on iOS, Android, Web |
| Easy for Unity devs | Existing Unity workflow, no new tools |
| Easy for non-Unity devs | Web editor ships a scene without Unity |
| Minimal cost | <$50/month at 10K users |
| Feels like magic | Time to "wow" <30 seconds |
| Scalable | Architecture unchanged at 100K users |

---

## Open Questions (Research Needed)

| Question | Options | Decision Criteria |
|----------|---------|-------------------|
| Web 3D framework | Three.js, Babylon, Unity WebGL | Bundle size, AR support |
| CRDT library | Yjs, Automerge, custom | Complexity, bundle size |
| VFX on web | Custom particles, TSL, Babylon | Visual quality vs effort |
| Voice on web | WebRTC, Daily.co, Agora | Cost vs quality |

---

*Approach: Standard formats → Platform renderers → User magic*
*Last Updated: 2026-02-05*
