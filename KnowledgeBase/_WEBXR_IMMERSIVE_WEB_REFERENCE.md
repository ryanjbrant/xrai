# WebXR & Immersive Web Reference

**Source**: https://immersiveweb.dev/
**Last Updated**: 2026-02-07

## What is WebXR?

The WebXR Device API enables access to input (headset/controller pose data) and output (hardware display) capabilities for virtual and augmented reality experiences on the web. It allows developers to create and host immersive content accessible through standard web browsers.

## Core Capabilities

| Platform | Capability |
|----------|------------|
| Mobile phones | VR via pose rendering (Cardboard-style), AR using ARCore |
| Desktop computers | Tethered VR hardware (Oculus Rift, HTC Vive) |
| AR headsets | Immersive AR via platform capabilities |
| VR headsets | Scene rendering through platform VR systems |

## Browser Support

| Feature | Support |
|---------|---------|
| **WebXR Core** | Chrome 79+, Safari on visionOS, Firefox via WebXR Viewer, Meta Quest Browser 7.0+ |
| **AR Module** | Chrome for Android 81+, iOS via WebXR Viewer |
| **Hit Test** | Chrome for Android 81+, Safari on visionOS |
| **Hand Input** | Chrome 131+, Safari 15.1+ |
| **Anchors** | Chrome for Android 85+, Safari 15.2+ |

## Key Benefits

- **Instant deployment** across XR platforms with WebXR-enabled browsers
- **Single release** supporting VR, AR, handheld, and head-mounted devices
- **No app store** requirements - immediate user access
- **WebGL ecosystem** - mature tools and developer community

## Development Frameworks

| Framework | Description |
|-----------|-------------|
| **A-Frame** | HTML/JavaScript-based, Three.js foundation |
| **Babylon.js** | TypeScript engine with WebXR Experience Helper |
| **Three.js** | Cross-browser 3D graphics library |
| **React-XR** | React hooks for react-three-fiber |
| **PlayCanvas** | Open-source WebGL engine |
| **Needle Engine** | glTF-based with Unity/Blender integration |
| **Wonderland Engine** | WebAssembly-powered, performance-focused |
| **Unity** | Via WebXR Export plugin |
| **Verge3D** | Artist-friendly for Blender/3ds Max/Maya |

## Standards & Specifications

- **W3C Spec**: https://www.w3.org/TR/webxr/
- **GitHub**: https://github.com/immersive-web/
- **Explainer**: https://github.com/immersive-web/webxr/blob/master/explainer.md

## GitHub Repository Index

**Organization**: https://github.com/immersive-web (W3C Immersive Web Working Group)

### Core Specs

| Repository | Stars | Description |
|------------|-------|-------------|
| **webxr** | 3.1k | WebXR Device API Specification (main spec) |
| **webxr-ar-module** | - | AR-specific extensions |
| **webxr-gamepads-module** | 35 | Controller/gamepad input handling |
| **webxr-hand-input** | - | Hand tracking API |
| **layers** | - | Multi-layer rendering support |

### Features & Extensions

| Repository | Description |
|------------|-------------|
| **hit-test** | Ray-based surface detection |
| **anchors** | Persistent world anchors |
| **plane-detection** | Detected plane exposure API |
| **real-world-meshing** | Environmental mesh mapping |
| **depth-sensing** | Depth buffer access |
| **lighting-estimation** | Scene lighting data |
| **webxr-face-tracking-1** | Facial tracking features |
| **capture** | Privacy-preserving content capture |

### Tools & Resources

| Repository | Stars | Description |
|------------|-------|-------------|
| **webxr-samples** | 1.1k | Official API usage demos |
| **webxr-polyfill** | 408 | Fallback for WebVR 1.1/Cardboard |
| **webxr-test-api** | - | WPT testing framework |
| **model-element** | - | `<model>` HTML tag for 3D content |
| **proposals** | 97 | Future feature proposals |

### Key Repos to Watch

1. **webxr** - Core spec, track for API changes
2. **webxr-samples** - Reference implementations
3. **proposals** - Upcoming features (mesh, face tracking, etc.)

## Input Handling

**Source**: https://immersive-web.github.io/webxr/input-explainer.html

### Input Source Types

| Type | Description | Examples |
|------|-------------|----------|
| **Gaze** | No independent tracking, uses head position | 0DOF clickers, headset buttons, voice |
| **Tracked Pointer** | Separate spatial tracking from viewer | Motion controllers, hand tracking |
| **Screen** | Mouse/touch converted to 3D rays | Handheld AR tap interactions |

### Core API

```javascript
// Access input sources
xrSession.inputSources  // Array of XRInputSource

// Get targeting ray pose each frame
const pose = xrFrame.getPose(inputSource.targetRaySpace, referenceSpace);

// Grip space for rendering held objects (tracked pointers only)
const gripPose = xrFrame.getPose(inputSource.gripSpace, referenceSpace);
```

### Selection Events

| Event | When |
|-------|------|
| `selectstart` | Action initiated (button press) |
| `select` | Action completed (user activation) |
| `selectend` | Action ended or cancelled |

### Controller Profiles

The `inputSource.profiles` array lists device identifiers in preference order:
- Specific: `"oculus-touch-v3"`
- Generic: `"generic-trigger-thumbstick"`

## Spatial Tracking

**Source**: https://immersive-web.github.io/webxr/spatial-tracking-explainer.html

### Reference Space Types

| Type | Origin | Use Case |
|------|--------|----------|
| **viewer** | At headset position/orientation | Inline experiences, no device motion |
| **local** | Near viewer at creation | Seated VR (racing sims, video) |
| **local-floor** | Floor level (y=0) | Standing experiences (VR chat) |
| **bounded-floor** | Floor + boundary polygon | Room-scale (painting, dance games) |
| **unbounded** | Dynamic, adjusts for stability | Large-area AR (campus tours) |

### Pose Queries

```javascript
// Get pose relative to reference space
const pose = xrFrame.getPose(space, referenceSpace);

// pose.transform contains:
// - position (vec3)
// - orientation (quaternion)
// Orientation applied before position
```

### Tracking States

- `emulatedPosition: true` - Position not actively tracked (orientation-only HW, tracking loss)
- `onreset` event - Origin discontinuity (playspace transition, map recovery)

## Developer Tools

| Tool | Purpose |
|------|---------|
| **Immersive Web Emulator** | Chrome/Edge extension for Quest device testing |
| **WebXR Input Profiles** | Library for motion controller profiles |
| **WebXR Polyfill** | Backward compatibility support |

## Unity Integration

For Unity projects targeting WebXR:
1. Use **WebXR Export** plugin from Unity Asset Store
2. Alternative: **Needle Engine** for glTF-based workflow
3. Build target: WebGL with WebXR extensions

## Relevance to Portals Project

WebXR provides an alternative deployment path for XR experiences:
- Bypass App Store review for rapid iteration
- Cross-platform web access for demos/prototypes
- Consider for web-based companion experiences

## Sample Applications

- **Spatial Fusion** - Spatial mapping demo
- **Vanveer** - E-commerce XR
- **Above Par-adowski Mini-Golf** - Gaming
- **Project Flowerbed** - Enterprise
- **XR Dinosaurs** - Educational
- **Hello WebXR** - Starter template

## Quick Links

- Main site: https://immersiveweb.dev/
- Samples: https://immersive-web.github.io/webxr-samples/
- Community: https://discord.gg/Jt5tfaM (WebXR Discord)

---

**Tags**: #webxr #immersive-web #browser-xr #cross-platform #web-vr #web-ar
