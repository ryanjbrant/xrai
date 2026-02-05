# Portals: Next Step

**Date:** 2026-02-05 (Updated 21:30 PST)
**Goal:** One Magic Demo → 10 Users → Iterate
**Status:** Strategy complete, ready for implementation

---

## THE ONE-LINE STRATEGY

> **Capture is commodity. Distribution is commodity. RANKING is the moat.**

---

## IMMEDIATE NEXT STEP (This Week)

### Implementation Order: Bridge → Composer → Hologram

**Each spec unlocks the next. Don't skip ahead.**

### Step 1: Complete 001-unity-rn-bridge (90% → 100%)
```bash
# Remaining tasks:
# - Verify message queue works reliably
# - Test on multiple devices
# - Document any edge cases
# Target: Bridge is rock-solid foundation
```

### Step 2: Prove 002-unity-advanced-composer
```bash
# Key validation:
# - RN UI overlay renders on top of Unity
# - Touch events route correctly (UI vs Unity)
# - Basic object placement works
# Target: Architecture is proven viable
```

### Step 3: Then 003-hologram-telepresence
```bash
# Port from MetavidoVFX:
# - HologramController.cs
# - Hologram.prefab
# - Core VFX assets
# Target: See yourself as hologram + share
```

---

## DEPENDENCY ACTIONS (This Week)

| File | Change | Priority |
|------|--------|----------|
| `package.json` | Node >=18 → >=20 | High |
| `VideoViewer.tsx` | expo-av → expo-video | Medium |
| `AudioPlayer.tsx` | expo-av → expo-audio | Medium |
| `OnboardingScreen.tsx` | expo-av → expo-audio | Medium |
| `ArtifactViewerScreen.tsx` | expo-av → expo-video | Medium |

---

## What's Already Built (MetavidoVFX)

### Single User ✅
- `RecordingController.cs` - MP4 recording
- `HologramController.cs` - Live AR / Metavido playback
- `Hologram.prefab` - Full VFX binding

### WebRTC P2P Conferencing ✅
- `HologramConferenceManager.cs` - Room management
- `MetavidoWebRTCEncoder.cs` - AR → Metavido → WebRTC
- `MetavidoWebRTCDecoder.cs` - Stream → VFX
- `H3MSignalingClient.cs` - Signaling
- Using `WebRtcVideoChat` plugin (NOT com.unity.webrtc)

### UI/UX ✅
- Auth system, Lobby, HUD controls

---

## The Product

```
Open app → Join call → See friends as particle holograms
```

- **Live** - Real-time hologram video conference
- **Recorded** - Playback hologram recordings
- **Styles** - Abstract/painterly OR lifelike (visionOS Persona-style)

---

## Two Proven Approaches

### 1. Record3D (iOS LiDAR → Unity)

**GitHub:** [marek-simonik/record3d](https://github.com/marek-simonik/record3d)

```
iPhone LiDAR → USB/WiFi → Unity → Point Cloud/VFX
```

- Streams RGBD from TrueDepth or LiDAR
- Unity demo exists with VFX Graph
- Works iOS → Mac/Windows/Linux

### 2. MetavidoVFX (AR Foundation → VFX Graph)

**GitHub:** [keijiro/MetavidoVFX](https://github.com/keijiro/MetavidoVFX)

```
AR Foundation depth → Compute shader → VFX Graph particles
```

- 353 FPS on iPhone 15 Pro
- WebGPU build runs in browser
- Depth/color/pose in single frame

---

## For Multiuser Conference

```
┌─────────────┐    WebRTC    ┌─────────────┐
│  User A     │◀────────────▶│  User B     │
│  LiDAR+RGB  │    Stream    │  LiDAR+RGB  │
└─────────────┘              └─────────────┘
      │                            │
      ▼                            ▼
┌─────────────┐              ┌─────────────┐
│ VFX Graph   │              │ VFX Graph   │
│ Hologram    │              │ Hologram    │
└─────────────┘              └─────────────┘
```

Each user:
1. Captures LiDAR + RGB locally
2. Encodes to Metavido format
3. Streams via WebRTC
4. Receives others' streams
5. Renders as VFX particle holograms

---

## Hologram Styles

| Style | Look | Technique |
|-------|------|-----------|
| Abstract/Painterly | Particles, trails, glow | VFX Graph with artistic effects |
| Lifelike (Persona) | Solid, facial detail | Gaussian Splat or dense point cloud |

**Start with:** Abstract particles (simpler, proven)
**Add later:** Lifelike mode (needs more data/processing)

---

## Platforms

| Platform | Build | Notes |
|----------|-------|-------|
| iOS | Native Unity | LiDAR on Pro models |
| Android | Native Unity | ARCore depth |
| Web | WebGPU | keijiro demo proves it works |

---

## Hands via LiDAR

Same pipeline works for hand tracking:
- LiDAR captures hand depth
- VFX renders hand as particles
- Gestural interaction with effects

---

## Implementation Order

1. **Single user selfie hologram** (MetavidoVFX port)
2. **Two user P2P call** (WebRTC + encoded stream)
3. **Multi-user room** (signaling server)
4. **Lifelike mode** (denser rendering)

---

## Key Repos to Study

| Repo | What to Take |
|------|--------------|
| [keijiro/MetavidoVFX](https://github.com/keijiro/MetavidoVFX) | VFX Graph bindings, WebGPU |
| [marek-simonik/record3d](https://github.com/marek-simonik/record3d) | RGBD streaming (USB) |
| [record3d_unity_demo](https://github.com/marek-simonik/record3d_unity_demo) | Unity VFX integration |
| [record3d-wifi-streaming-demo](https://github.com/marek-simonik/record3d-wifi-streaming-and-rgbd-mp4-3d-video-demo) | Three.js web viewer |

---

## Record3D Three.js Demo

**Direction: ONE-WAY only**

```
iOS (Record3D) ──WiFi──▶ Web Browser (Three.js point cloud)
```

- Live WiFi stream OR mp4 playback
- Three.js 0.147.0 + custom point cloud shader
- AR mode with AR.js (marker-based)

**NOT bidirectional** - no webcam → Unity path.

---

## For True 2-Way Conferencing (Add This)

```
┌─────────────┐               ┌─────────────┐
│ iOS/Android │◀──WebRTC────▶│ Web Browser │
│ LiDAR RGBD  │               │ Webcam      │
└─────────────┘               └─────────────┘
```

**Web-side depth options:**
1. WebXR Depth API (Chrome Android)
2. MediaPipe depth estimation (ML)
3. No depth - flat video cutout (simplest)

**WebRTC** handles the 2-way streaming.

---

## One Sentence

**LiDAR + VFX Graph + WebRTC = Live particle hologram video calls.**

---

## For Portals: Port vs Build New

**Recommendation:** Port MetavidoVFX code to Portals Unity project.

| Component | Source | LOC | Effort |
|-----------|--------|-----|--------|
| Hologram prefab + scripts | MetavidoVFX | ~1500 | 2 days |
| WebRTC conferencing | MetavidoVFX | ~800 | 2 days |
| UI/UX (Lobby, HUD) | MetavidoVFX | ~600 | 1 day |
| VFX assets | MetavidoVFX | 73+ | 1 day |
| **Total** | | ~3000 | ~1 week |

---

## What Remains After Port

1. **WebGPU web build** (keijiro demo proves it works)
2. **Production signaling server** (WebSocket)
3. **TURN server** for NAT traversal
4. **4-6 user scaling** (current: 2 users)
5. **Lifelike mode** (Gaussian splat / dense point cloud)

---

*Last Updated: 2026-02-05*
