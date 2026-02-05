# AR Foundation 6.x Complete Tracking Capabilities Reference

**Date**: 2026-01-20
**Version**: AR Foundation 6.2.1, XR Hands 1.7.1
**Status**: Production Reference

---

## Executive Summary

AR Foundation 6.x provides **16 native tracking subsystems**. iOS ARKit has superior support (body 91j, face 468pt, LiDAR meshing). This document catalogs ALL tracking capabilities with implementation status in MetavidoVFX.

---

## 1. Human Body Tracking (ARHumanBodyManager)

**Status**: iOS ARKit 3+ only | **MetavidoVFX**: Integrated

### Capabilities
- **91-joint skeleton** (not 17!) - Complete articulation
  - 48 finger joints (24 per hand)
  - 7-segment spine
  - 18 head/facial joints
- **2D joint tracking** - Screen-space positions
- **3D joint tracking** - World-space with confidence
- **Pose estimation** - Real-time body pose
- **Event callbacks** - `humanBodiesChanged`

### Data Access
```csharp
ARHumanBody body = humanBodyManager.trackables.First();
NativeArray<XRHumanBodyJoint> joints = body.joints; // 91 joints
Vector3 position = joints[i].localPose.position;
Quaternion rotation = joints[i].localPose.rotation;
float confidence = joints[i].trackingState;
```

### Joint Index Reference (Key)
| Index | Joint | Index | Joint |
|-------|-------|-------|-------|
| 0 | Hips | 12 | LeftShoulder |
| 1 | LeftUpLeg | 13 | RightShoulder |
| 2 | RightUpLeg | 14 | Neck |
| 3 | LeftLeg | 15 | LeftHand (start) |
| 4 | RightLeg | 63 | RightHand (start) |
| 5 | LeftFoot | 87 | Head |
| 6 | RightFoot | 88-90 | Eyes, Jaw |

### Performance
- 353 FPS @ 10 active VFX (verified Jan 16, 2026)
- ~2-3ms inference time

---

## 2. Human Segmentation / Occlusion (AROcclusionManager)

**Status**: iOS ARKit 15+ (full) / Android ARCore (limited) | **MetavidoVFX**: PRIMARY

### Capabilities
| Texture | Resolution | Purpose |
|---------|------------|---------|
| `humanDepthTexture` | 256x192 | Distance per pixel |
| `humanStencilTexture` | 256x192 | Binary human mask |
| `environmentDepthTexture` | LiDAR native | Full environment depth |
| `environmentDepthConfidenceTexture` | LiDAR native | Confidence per pixel |

### Occlusion Modes
```csharp
public enum OcclusionPreferenceMode
{
    NoOcclusion,                    // Disable occlusion
    PreferEnvironmentOcclusion,     // Environment depth only
    PreferHumanOcclusion,           // Human stencil only
    PreferEnvironmentAndHumanOcclusion // Both blended
}
```

### Implementation (ARDepthSource.cs)
```csharp
// Singleton compute pipeline - ONE dispatch for ALL VFX
private void UpdateTextures()
{
    _depthTexture = TryGetTexture(() => _occlusionManager.environmentDepthTexture);
    _stencilTexture = TryGetTexture(() => _occlusionManager.humanStencilTexture);

    // GPU compute: depth → world positions
    DispatchDepthToWorld();
}

// Critical: TryGetTexture pattern prevents crashes
Texture TryGetTexture(Func<Texture> getter)
{
    try { return getter?.Invoke(); }
    catch { return null; }
}
```

### VFX Properties Exposed
| Property | Type | Description |
|----------|------|-------------|
| `DepthMap` | Texture2D | Raw AR depth |
| `StencilMap` | Texture2D | Human mask (0=bg, 1=human) |
| `PositionMap` | Texture2D | GPU-computed world positions |
| `VelocityMap` | Texture2D | Camera velocity |
| `ColorMap` | Texture2D | Camera RGB |
| `RayParams` | Vector4 | (0, 0, tan(fov/2)*aspect, tan(fov/2)) |
| `InverseView` | Matrix4x4 | Inverse view matrix |
| `DepthRange` | Vector2 | Near/far (default 0.1-10m) |

---

## 3. Face Tracking (ARFaceManager)

**Status**: iOS ARKit 3+ (TrueDepth camera) | **MetavidoVFX**: Research only

### Capabilities
- **468-point face mesh** - Full topology
- **52 blend shapes** - Facial expressions
- **Face anchor** - Position/rotation tracking
- **Eye tracking** - Left/right eye gaze
- **Head pose** - Roll, pitch, yaw

### Blend Shape Reference (Key)
| Blend Shape | Range | Blend Shape | Range |
|-------------|-------|-------------|-------|
| eyeBlinkLeft | 0-1 | mouthSmileLeft | 0-1 |
| eyeBlinkRight | 0-1 | mouthSmileRight | 0-1 |
| jawOpen | 0-1 | browDownLeft | 0-1 |
| mouthFunnel | 0-1 | browDownRight | 0-1 |

### Data Access
```csharp
ARFace face = faceManager.trackables.First();
float[] blendShapes = face.blendShapes;
Mesh faceMesh = face.mesh; // 468 vertices
Vector3 leftEyePos = face.leftEye.position;
```

---

## 4. AR Mesh Detection (ARMeshManager)

**Status**: iOS ARKit 14+ (LiDAR) | **MetavidoVFX**: Integrated (EchoVision)

### Capabilities
- **Real-time mesh generation** - Dynamic environmental mesh
- **Mesh classification** - Surface type labels
- **Mesh updates** - Added, updated, removed events
- **Full mesh data** - Vertices, normals, triangles

### Mesh Classifications (ARKit 6+)
| Classification | Description |
|----------------|-------------|
| Wall | Vertical surfaces |
| Floor | Horizontal ground |
| Ceiling | Horizontal above |
| Table | Flat surfaces |
| Seat | Chairs, sofas |
| Door | Door frames |
| Window | Window frames |

### Implementation (MeshVFX.cs)
```csharp
// Sorts meshes by distance, fills GraphicsBuffer
void UpdateMeshBuffer()
{
    var meshes = meshManager.meshes.OrderBy(m =>
        Vector3.Distance(m.transform.position, head.position));

    foreach (MeshFilter mesh in meshes.Take(maxMeshes))
    {
        Vector3[] vertices = mesh.sharedMesh.vertices;
        // Fill buffer...
    }

    vfx.SetGraphicsBuffer("MeshPointCache", bufferVertex);
}
```

---

## 5. Hand Tracking (XR Hands - Separate Package)

**Status**: All platforms via com.unity.xr.hands 1.7.1 | **MetavidoVFX**: Integrated

### Capabilities
- **26-joint hand skeleton** - Detailed finger articulation
- **Both hands** - Simultaneous dual-hand tracking
- **Hand pose** - Real-time position/orientation
- **Gesture detection** - Pinch, grab, etc.

### Joint Enum (XRHandJointID)
| Joint | Index | Joint | Index |
|-------|-------|-------|-------|
| Wrist | 0 | ThumbTip | 4 |
| Palm | 1 | IndexTip | 9 |
| ThumbProximal | 2 | MiddleTip | 14 |
| ThumbIntermediate | 3 | RingTip | 19 |
| ... | ... | LittleTip | 24 |

### Implementation (HandVFXController.cs)
```csharp
// Velocity-driven VFX with pinch detection
void Update()
{
    if (handSubsystem.TryGetJoint(XRHandJointID.Wrist, out joint))
    {
        Vector3 velocity = (joint.position - lastPosition) / Time.deltaTime;
        vfx.SetVector3("HandVelocity", velocity);
        vfx.SetFloat("HandSpeed", velocity.magnitude);
    }

    // Pinch detection
    float pinchDistance = Vector3.Distance(
        GetJoint(XRHandJointID.ThumbTip),
        GetJoint(XRHandJointID.IndexTip));
    vfx.SetBool("IsPinching", pinchDistance < pinchThreshold);
}
```

---

## 6. Image Tracking (ARTrackedImageManager)

**Status**: iOS + Android | **MetavidoVFX**: Available

### Capabilities
- **2D image detection** - Detect reference images
- **Concurrent tracking** - Multiple images
- **Image size tracking** - Detected dimensions
- **Tracking state** - Quality indicators

### Data Access
```csharp
void OnTrackedImagesChanged(ARTrackedImagesChangedEventArgs args)
{
    foreach (var image in args.added.Concat(args.updated))
    {
        Vector2 size = image.size;
        Pose pose = image.transform.GetPose();
        TrackingState state = image.trackingState;
        XRReferenceImage refImage = image.referenceImage;
    }
}
```

---

## 7. Object Tracking (ARTrackedObjectManager)

**Status**: iOS ARKit 4+ / Android ARCore 4+ | **MetavidoVFX**: Available

### Capabilities
- **3D object detection** - Pre-scanned reference objects
- **Spatial tracking** - Position/rotation
- **Reference library** - `XRReferenceObjectLibrary`

### Setup
```csharp
var manager = gameObject.AddComponent<ARTrackedObjectManager>();
manager.referenceLibrary = referenceLibrary; // Pre-scanned objects
manager.trackedObjectPrefab = objectPrefab;
```

---

## 8. Plane Detection (ARPlaneManager)

**Status**: iOS + Android | **MetavidoVFX**: Via raycast

### Capabilities
- **Horizontal planes** - Floor, tables
- **Vertical planes** - Walls
- **Plane classification** - Surface types
- **Plane boundaries** - Polygon edges

### Plane Classifications
| Classification | Description |
|----------------|-------------|
| None | Unknown |
| Wall | Vertical |
| Floor | Horizontal ground |
| Ceiling | Horizontal above |
| Table | Flat surface |
| Seat | Chairs |
| Door | Door frame |
| Window | Window frame |

---

## 9. Raycasting (ARRaycastManager)

**Status**: iOS + Android | **MetavidoVFX**: PRIMARY for placement

### Capabilities
- **Hit detection** - Planes, meshes, images
- **Multiple hits** - All along ray
- **Hit filtering** - TrackableType flags

### Implementation (HologramAnchor.cs)
```csharp
List<ARRaycastHit> hits = new List<ARRaycastHit>();
if (raycastManager.Raycast(screenPoint, hits, TrackableType.PlaneWithinPolygon))
{
    Pose hitPose = hits[0].pose;
    float distance = hits[0].distance;
    // Place hologram at hitPose
}
```

---

## 10. Point Cloud (ARPointCloudManager)

**Status**: iOS + Android | **MetavidoVFX**: Research only

### Capabilities
- **Sparse feature points** - 10K-50K points
- **Point confidence** - Per-point reliability
- **Real-time updates** - Dynamic point tracking

### Note
Less dense than LiDAR mesh. Use ARMeshManager for dense point clouds.

---

## 11. Environment Probes (AREnvironmentProbeManager)

**Status**: iOS ARKit 14+ | **MetavidoVFX**: Not used

### Capabilities
- **Cubemap probes** - Environment reflections
- **HDR textures** - Lighting info
- **Automatic updates** - Real-time generation

---

## 12. Light Estimation (ARLightEstimationManager)

**Status**: iOS + Android | **MetavidoVFX**: Minimal

### Capabilities
- **Brightness** - Average scene brightness
- **Color temperature** - Lighting warmth
- **Main light direction** - Primary light vector
- **Ambient spherical harmonics** - Full environment

---

## 13. Camera (ARCameraManager)

**Status**: iOS + Android | **MetavidoVFX**: Integrated

### Capabilities
- **Camera texture** - RGB/YCbCr
- **Camera intrinsics** - Focal length, principal point
- **Camera pose** - Position/orientation
- **Frame time** - Synchronization

### Data Access
```csharp
Matrix4x4 projection = cameraManager.GetProjectionMatrix();
Matrix4x4 view = camera.worldToCameraMatrix;
Texture cameraTexture = cameraManager.GetLatestImageTexture();
```

---

## 14. Spatial Anchors (ARAnchorManager)

**Status**: iOS + Android | **MetavidoVFX**: Integrated

### Capabilities
- **Local anchors** - Persist across frames
- **Cloud anchors** - Share between devices
- **Anchor lifecycle** - Create, update, remove
- **Serialization** - Save/restore state

---

## 15. Scene Understanding (iOS 15+ Only)

**Status**: iOS ARKit 6+ | **MetavidoVFX**: Research

### Capabilities
- **Room type** - Living room, bedroom, etc.
- **Furniture** - Table, chair, sofa, bed
- **Appliances** - TV, refrigerator
- **Structural** - Wall, floor, ceiling, door, window

### NOT Native AR Foundation
Requires ARKit API access via native plugin or ARKitObjectDetection.

---

## 16. Semantic Segmentation

**Status**: NOT NATIVE | **MetavidoVFX**: Via BodyPix/YOLO

### Native Options
- **AROcclusionManager** - Binary human stencil only
- **ARMeshManager** - Surface classification (wall/floor/etc.)

### Third-Party Required For
- **24-part body** - BodyPixSentis
- **Object classes** - YOLO11
- **Scene semantics** - Custom ML models

---

## Summary Table

| Capability | Manager | iOS | Android | MetavidoVFX |
|------------|---------|-----|---------|-------------|
| Body 91 joints | ARHumanBodyManager | ✅ | ❌ | ✅ |
| Human depth/stencil | AROcclusionManager | ✅ | ✅ | ✅ PRIMARY |
| Environment depth | AROcclusionManager | ✅ LiDAR | ❌ | ✅ |
| Face 468pt | ARFaceManager | ✅ | ❌ | Research |
| AR mesh | ARMeshManager | ✅ LiDAR | ❌ | ✅ EchoVision |
| Hands 26j | XRHands | ✅ | ✅ | ✅ |
| Image tracking | ARTrackedImageManager | ✅ | ✅ | Available |
| Object tracking | ARTrackedObjectManager | ✅ | ✅ | Available |
| Planes | ARPlaneManager | ✅ | ✅ | Via raycast |
| Raycasting | ARRaycastManager | ✅ | ✅ | ✅ |
| Point cloud | ARPointCloudManager | ✅ | ✅ | Research |
| Env probes | AREnvironmentProbeManager | ✅ | ❌ | Not used |
| Light estimation | ARLightEstimationManager | ✅ | ✅ | Minimal |
| Camera | ARCameraManager | ✅ | ✅ | ✅ |
| Anchors | ARAnchorManager | ✅ | ✅ | ✅ |
| Scene semantics | Native plugin | ✅ iOS 15+ | ❌ | Research |
| Body 24-part | BodyPixSentis | All | All | ✅ |
| Objects | YOLO11 | All | All | Experimental |

---

## Key Files in MetavidoVFX

| File | LOC | Purpose |
|------|-----|---------|
| `ARDepthSource.cs` | 256 | Primary depth compute pipeline |
| `VFXARBinder.cs` | 160 | Per-VFX lightweight binding |
| `HumanParticleVFX.cs` | 200 | Body-reactive VFX |
| `MeshVFX.cs` | 300 | AR mesh → VFX buffer |
| `HandVFXController.cs` | 350 | Hand tracking + pinch |
| `HologramAnchor.cs` | 400 | AR placement |
| `BodyPartSegmenter.cs` | 400 | BodyPix 24-part |
| `NNCamKeypointBinder.cs` | 200 | Pose keypoints → VFX |

---

## References

- [AR Foundation Manual](https://docs.unity3d.com/Packages/com.unity.xr.arfoundation@6.2/manual/index.html)
- [XR Hands Manual](https://docs.unity3d.com/Packages/com.unity.xr.hands@1.7/manual/index.html)
- [ARKit Feature Availability](https://developer.apple.com/documentation/arkit/arkit_in_ios)
- [MetavidoVFX CLAUDE.md](../MetavidoVFX-main/CLAUDE.md)

---

*Last Updated: 2026-01-20*
# Hand Sensing Capabilities for VFX Control

## Overview
Comprehensive list of all possible gestures, measurements, and sensing capabilities available through hand tracking, pose detection, and segmentation for controlling VFX parameters.

---

## 1. Joint Positions (21 joints per hand)

### Wrist
- `Wrist` - Base of the hand

### Thumb (4 joints)
- `ThumbCMC` - Carpometacarpal joint
- `ThumbMP` - Metacarpophalangeal joint
- `ThumbIP` - Interphalangeal joint
- `ThumbTip` - Tip of thumb

### Index Finger (4 joints)
- `IndexMCP` - Metacarpophalangeal joint
- `IndexPIP` - Proximal interphalangeal joint
- `IndexDIP` - Distal interphalangeal joint
- `IndexTip` - Tip of index finger

### Middle Finger (4 joints)
- `MiddleMCP`, `MiddlePIP`, `MiddleDIP`, `MiddleTip`

### Ring Finger (4 joints)
- `RingMCP`, `RingPIP`, `RingDIP`, `RingTip`

### Little Finger (4 joints)
- `LittleMCP`, `LittlePIP`, `LittleDIP`, `LittleTip`

---

## 2. Computed Distances (VFX Parameter Control)

### Pinch Distances
| Distance | Joints | VFX Use Case |
|----------|--------|--------------|
| **Thumb-Index** | ThumbTip ↔ IndexTip | Brush width, particle size, selection |
| **Thumb-Middle** | ThumbTip ↔ MiddleTip | Grab detection, intensity control |
| **Thumb-Ring** | ThumbTip ↔ RingTip | Secondary parameter |
| **Thumb-Little** | ThumbTip ↔ LittleTip | Tertiary parameter |

### Finger Spread
| Distance | Joints | VFX Use Case |
|----------|--------|--------------|
| **Index-Middle Spread** | IndexTip ↔ MiddleTip | Explosion radius, spray width |
| **Full Spread** | IndexTip ↔ LittleTip | VFX volume, emission area |
| **Palm Width** | IndexMCP ↔ LittleMCP | Scale factor |

### Hand Size Metrics
| Metric | Computation | VFX Use Case |
|--------|-------------|--------------|
| **Palm Size** | Area of Wrist-IndexMCP-LittleMCP-LittleMCP polygon | Global VFX scale |
| **Hand Length** | Wrist ↔ MiddleTip | Reach, trail length |
| **Fingertip Centroid** | Average of all 5 tips | VFX spawn origin |

---

## 3. Gesture Recognition

### Basic Gestures (HoloKit Native)
| Gesture | Detection | Threshold | VFX Action |
|---------|-----------|-----------|------------|
| **Pinch** | ThumbTip-IndexTip < 0.02m | Start: 0.02m, End: 0.03m | Select, spawn particle |
| **Grab/Fist** | ThumbTip-MiddleTip < 0.04m | With hysteresis 1.5x | Capture, hold VFX |
| **Five/Open Palm** | All fingers extended | Joint alignment check | Release, explode VFX |
| **Poke** | Index extended, others curled | Tip distance ratios | Point, draw |

### Extended Gestures (Detectable)
| Gesture | Detection Method | VFX Action |
|---------|------------------|------------|
| **Point** | Index extended only | Ray-based VFX, laser |
| **Peace** | Index + Middle extended | Dual emitters |
| **Rock** | Index + Little extended | Split effects |
| **Thumbs Up** | Thumb extended, fingers curled | Trigger/confirm |
| **Thumbs Down** | Thumb down, fingers curled | Cancel/undo |
| **OK Sign** | Thumb-Index ring, others extended | Fine control mode |
| **Finger Gun** | Thumb up, index forward, others curled | Projectile spawn |
| **Claw** | All fingers bent at DIP | Attraction force |
| **Wave** | Periodic wrist rotation | Modulation effect |

### Dynamic Gestures
| Gesture | Detection | VFX Action |
|---------|-----------|------------|
| **Swipe Left/Right** | Wrist velocity + direction | Switch VFX, navigate |
| **Swipe Up/Down** | Wrist vertical velocity | Intensity increase/decrease |
| **Circle** | Wrist circular motion | Create portal, loop |
| **Throw** | Fast forward motion + release | Projectile launch |
| **Catch** | Grab at object position | VFX capture |

---

## 4. Velocity & Motion Data

### Per-Joint Velocity
| Data | Computation | VFX Use Case |
|------|-------------|--------------|
| **Joint Velocity** | Position delta / deltaTime | Trail length, particle speed |
| **Joint Acceleration** | Velocity delta / deltaTime | Impact effects, burst intensity |
| **Angular Velocity** | Rotation delta / deltaTime | Spin effects, vortex |

### Derived Motion Metrics
| Metric | Computation | VFX Use Case |
|--------|-------------|--------------|
| **Hand Speed** | Wrist velocity magnitude | Overall intensity |
| **Finger Wiggle** | Sum of fingertip velocity magnitudes | Shimmer, sparkle rate |
| **Punch Detection** | High wrist acceleration forward | Explosive burst |
| **Shake Detection** | High-frequency wrist oscillation | Scatter effect |

---

## 5. Hand Stencil/Segmentation

### Silhouette-Based Parameters
| Parameter | Source | VFX Use Case |
|-----------|--------|--------------|
| **Hand Silhouette Texture** | Human segmentation | Mask for particle emission |
| **Silhouette Area** | Pixel count in stencil | VFX volume scaling |
| **Silhouette Perimeter** | Edge pixel count | Outline effects |
| **Silhouette Centroid** | Center of mass | VFX origin point |
| **Bounding Box** | Min/max extent | Containment area |

### Finger Stencil Analysis
| Parameter | Detection | VFX Use Case |
|-----------|-----------|--------------|
| **Extended Fingers Count** | Stencil topology | Emission multiplier |
| **Finger Spread Angle** | Stencil analysis | Cone angle for effects |
| **Hand Orientation** | Stencil rotation | Directional effects |

---

## 6. Audio-Reactive Parameters

### Microphone Input
| Parameter | Source | VFX Mapping |
|-----------|--------|-------------|
| **Volume/Amplitude** | RMS of audio buffer | Particle count, scale |
| **Pitch/Frequency** | FFT dominant frequency | Color hue, particle lifetime |
| **Beat Detection** | Onset detection | Pulse/burst effects |
| **Spectral Centroid** | FFT weighted average | Turbulence, chaos |

### Combined Hand + Audio
| Combination | Effect |
|-------------|--------|
| **Pinch + Volume** | Modulated brush width |
| **Hand Speed + Pitch** | Velocity-reactive trails |
| **Gesture + Beat** | Beat-synced effects |

---

## 7. Physics-Enabled VFX

### Collision Sources
| Source | Data Available | VFX Behavior |
|--------|----------------|--------------|
| **AR Mesh (LiDAR)** | Floor, walls, objects | Particles bounce off surfaces |
| **AR Planes** | Horizontal/vertical planes | Ground collision, wall bounce |
| **Hand Colliders** | Joint-based capsules | Particles interact with hands |

### Physics Parameters
| Parameter | VFX Use Case |
|-----------|--------------|
| **Bounciness** | How much particles bounce |
| **Friction** | Surface drag |
| **Gravity** | Downward force |
| **Lifetime on Collision** | Particles die or persist |

---

## 8. Implementation Patterns

### VFX Graph Properties
```csharp
// Position data
vfx.SetVector3("HandPosition", wristPosition);
vfx.SetGraphicsBuffer("HandJoints", jointBuffer);

// Distance parameters
vfx.SetFloat("PinchDistance", thumbIndexDistance);
vfx.SetFloat("HandSpread", indexLittleDistance);

// Velocity data
vfx.SetVector3("HandVelocity", wristVelocity);
vfx.SetFloat("HandSpeed", wristVelocity.magnitude);

// Gesture state
vfx.SetBool("IsPinching", isPinching);
vfx.SetInt("ExtendedFingers", fingerCount);

// Audio data
vfx.SetFloat("AudioVolume", volume);
vfx.SetFloat("AudioPitch", pitch);

// Stencil
vfx.SetTexture("HandStencil", stencilTexture);
```

### Gesture Detection Thresholds (Recommended)
```csharp
const float PINCH_START = 0.02f;      // 2cm
const float PINCH_END = 0.03f;        // 3cm (hysteresis)
const float GRAB_START = 0.04f;       // 4cm
const float GRAB_END = 0.06f;         // 6cm (hysteresis)
const float POKE_RATIO = 0.7f;        // Tip to joint ratio
const float VELOCITY_THRESHOLD = 1.0f; // m/s for fast motion
```

---

## 9. VFX Parameter Mapping Examples

### Brush Width (Pinch Control)
```
Thumb-Index Distance → Remap(0.02, 0.15) → BrushWidth (0.01, 0.5)
```

### Trail Intensity (Velocity)
```
Hand Speed → Remap(0, 3) → TrailLength (0.1, 2.0)
```

### Particle Color (Audio)
```
AudioPitch → Remap(100, 1000) → ColorHue (0, 360)
```

### Emission Rate (Gesture + Audio)
```
ExtendedFingers × AudioVolume → EmissionRate (10, 1000)
```

---

## 10. Platform Availability

| Feature | iOS (HoloKit) | Quest | WebGL |
|---------|---------------|-------|-------|
| 21 Joint Positions | ✅ | ✅ | ✅ (WebXR) |
| Joint Velocity | ✅ | ✅ | ✅ |
| Pinch/Grab Gesture | ✅ | ✅ | ✅ |
| Hand Stencil | ✅ (AROcclusion) | ❌ | ❌ |
| Audio Input | ✅ | ✅ | ✅ |
| AR Mesh Collision | ✅ (LiDAR) | ✅ (Guardian) | ❌ |
| AR Planes | ✅ | ✅ | Partial |

---

## References
- Apple Vision Framework: https://developer.apple.com/documentation/vision/vnhumanhandposeobservation
- XR Hands Package: https://docs.unity3d.com/Packages/com.unity.xr.hands@1.5
- HoloKit SDK: https://github.com/holoi/holokit-unity-sdk
- Portals_6 GestureDetector: `/Users/jamestunick/wkspaces/Portals_6/Assets/[H3M]/Portals/Code/v3/XR/GestureDetector.cs`
# XR Scene Format Comparison: .tilt vs USDZ vs glTF vs XRRAI

**Created**: 2026-01-22
**Purpose**: Comprehensive analysis of 3D scene formats for XR, hologram systems, and AI integration
**Last Updated**: 2026-01-22

---

## Executive Summary

| Format | Best For | Cross-Platform | AI/ML Ready | Streaming | Recommendation |
|--------|----------|----------------|-------------|-----------|----------------|
| **glTF/GLB** | Web, mobile, universal | ✅ Excellent | ✅ KHR_gaussian_splatting | ⚠️ Limited | **PRIMARY** |
| **USDZ** | iOS/visionOS only | ❌ Apple-only | ⚠️ Via Omniverse | ❌ No | iOS export only |
| **.tilt** | Brush strokes/art | ⚠️ VR-focused | ❌ None | ❌ No | Import compatibility |
| **XRRAI** | MetavidoVFX native | ✅ By design | ✅ Native | ✅ Chunked | **INTERNAL** |

**Recommended Strategy**:
- Internal: XRRAI JSON format (full fidelity)
- Export: glTF/GLB (universal compatibility)
- iOS: Auto-convert to USDZ for Quick Look
- Import: Support .tilt for OpenBrush compatibility

---

## 1. Format Deep Dive

### 1.1 .tilt (Tilt Brush / Open Brush)

**Structure**: 16-byte header + PKZIP archive

```
tilT (4 bytes magic) + header (12 bytes)
├── metadata.json     - Scene metadata (brushes, layers, environment)
├── data.sketch       - Binary stroke data
├── thumbnail.png     - 256x256 preview
└── hires.png         - Optional high-res thumbnail
```

**Binary data.sketch format**:
```
Header:
  int32   sentinel              // 0xc576a5cd
  int32   version               // 5 or 6
  int32   reserved              // 0
  uint32  additionalHeaderSize
  int32   num_strokes

Per Stroke:
  int32   brush_index
  float32x4 brush_color         // RGBA
  float32 brush_size
  uint32  stroke_extension_mask  // Flags, scale, group, seed, layer
  uint32  controlpoint_extension_mask
  int32   num_control_points
  [Control Points]:
    float32x3 position          // 12 bytes
    float32x4 orientation       // 16 bytes (quaternion)
    [Extensions]: pressure, timestamp
```

**Capabilities**:
| Feature | Support | Notes |
|---------|---------|-------|
| Stroke data | ✅ Full | Position, rotation, pressure, timestamp |
| Brush metadata | ✅ GUID-based | 90+ brushes |
| Layers | ✅ v22.0+ | Independent canvases |
| Models | ✅ v7.0+ | OBJ/glTF references |
| Images/Videos | ✅ v7.5+ | Embedded references |
| Environment | ✅ | Skybox, lighting, fog |
| Camera paths | ✅ v22.0+ | Animation splines |
| Audio reactive | ❌ | Runtime-only |
| AR anchors | ❌ | Not supported |
| Physics | ❌ | Not supported |
| Streaming | ❌ | Full file required |

**Platform Support**:
- Unity: TiltBrushToolkit, custom import
- Web: three-tiltloader, three-icosa
- Quest/VR: Native Open Brush
- iOS/Android: Viewer only (no creation)

**File Sizes** (typical):
- 100 strokes, 50 points each: ~200 KB
- 500 strokes: ~1 MB
- 1000 strokes, 100 points: ~4 MB
- Complex artwork: 1-20 MB

---

### 1.2 USDZ (Apple/Pixar Universal Scene Description)

**Structure**: Zero-compression ZIP archive (64-byte alignment)

```
USDZ Package (read-only archive)
├── scene.usdc         - Binary USD (default)
├── textures/          - PNG, JPEG, EXR, AVIF
└── audio/             - M4A, MP3, WAV
```

**Key Characteristics**:
- **No compression** by design (mmap/zero-copy optimization)
- **Read-only** (must unpack to edit)
- **64-byte alignment** for AVX512 optimization

**Schema Types**:
| Schema | Purpose |
|--------|---------|
| UsdGeomMesh | Polygon geometry |
| UsdGeomXform | Transformation hierarchy |
| UsdShade | Materials (MaterialX) |
| UsdSkel | Skeletal animation |
| BlendShape | Morph targets |
| UsdPhysics* | Rigid bodies, collisions, joints |
| UsdLux | Lighting |

**AR Quick Look Constraints**:
| Constraint | Recommendation | Hard Limit |
|------------|----------------|------------|
| File size | 4-8 MB | Soft |
| Memory footprint | <200 MB | ~200 MB |
| Single 4K texture | ~130 MB (memory) | Avoid |
| Polygons (single mat) | 100k | Implementation-specific |
| Triangles (complex) | 200k | Use LODs |

**Platform Support**:
| Platform | Support | Notes |
|----------|---------|-------|
| iOS/iPadOS | ✅ Native | AR Quick Look |
| visionOS | ✅ Native | Reality Composer Pro |
| Android | ❌ None | Use glTF |
| Web | ⚠️ Export only | Babylon.js 8.0 |
| Unity | ⚠️ Experimental | com.unity.formats.usd 3.0 |
| Three.js | ❌ | "Far less practical than glTF" |

**AI/ML Integration**:
- Neural rendering via NVIDIA Omniverse only
- MaterialX for procedural materials
- No native 3DGS support on Apple platforms yet

**Future (AOUSD)**:
- Core Spec 1.0: Dec 2025
- Core Spec 1.1: 2026 (animation, scaling, compliance)
- Members: Pixar, Apple, NVIDIA, Adobe, Autodesk

---

### 1.3 glTF 2.0 (Khronos Group)

**Structure**: JSON + binary + textures or single GLB

```
Option A: Separate files
├── scene.gltf         - JSON scene description
├── geometry.bin       - Binary buffers
└── textures/          - PNG, JPEG, KTX2

Option B: Single binary (recommended)
└── scene.glb          - All-in-one binary
```

**Compression Options**:
| Method | Ratio | Speed | Best For |
|--------|-------|-------|----------|
| Draco | 80-95% | Slower (WASM) | Static geometry |
| meshopt | 60-80% | Fast | Animation, morph targets |
| KTX2/Basis | 75-90% | GPU-native | Textures |
| Quantization | 2.4x | Instant | All geometry |

**Extensions (19 ratified + 15+ in progress)**:

**Materials (11 ratified)**:
- KHR_materials_unlit, clearcoat, sheen, transmission
- KHR_materials_volume, ior, specular, iridescence
- KHR_materials_anisotropy, emissive_strength, dispersion

**Geometry & Animation**:
- KHR_draco_mesh_compression
- KHR_mesh_quantization
- KHR_animation_pointer (animate any property)
- EXT_mesh_gpu_instancing

**In Development (2025-2026)**:
| Extension | Status | Purpose |
|-----------|--------|---------|
| KHR_interactivity | Review | Behavior graphs |
| KHR_physics_rigid_bodies | Review | Physics simulation |
| KHR_audio | Initial | Spatial audio |
| **KHR_gaussian_splatting** | Proposal | 3D Gaussian Splats |
| KHR_gaussian_splatting_compression_spz | Proposal | SPZ compression (90% smaller) |

**Platform Support**:
| Platform | Support | Library |
|----------|---------|---------|
| Unity | ✅ Excellent | glTFast 6.15, UnityGLTF |
| Three.js | ✅ Excellent | GLTFLoader |
| Babylon.js | ✅ Excellent | Native + WebGPU |
| iOS | ✅ Via Unity | Or model-viewer |
| Android | ✅ Native | Scene Viewer |
| Quest | ✅ Full | Unity/Unreal |
| WebXR | ✅ Primary | Standard format |
| WebGPU | ✅ | Babylon.js 8.0, Three.js |

**Performance**:
- GLB load: ~9ms (100 iterations avg)
- OBJ load: ~133ms (14x slower)
- Best compression: Draco + KTX2 = 90%+ reduction

---

### 1.4 AI/ML 3D Formats

**3D Gaussian Splatting Formats**:

| Format | Creator | Size vs PLY | glTF Integration |
|--------|---------|-------------|------------------|
| .ply | Original | 100% baseline | Via extension |
| .splat | Antimatter15 | ~40-50% | Not standardized |
| .ksplat | mkkellogg | ~30% | Not standardized |
| **.spz** | Niantic | **~10%** | **KHR_gaussian_splatting_compression_spz** |
| .sog | PlayCanvas | ~25% | Not standardized |

**SPZ Format (Recommended)**:
- "JPG for splats" - 90% compression
- MIT License - commercially viable
- Adopted by Khronos for glTF extension
- Partners: OGC, Khronos, Niantic, Cesium, Esri

**Neural Radiance Fields (NeRF)**:
- Checkpoint formats: .pt, .ckpt, .safetensors
- Export targets: Mesh (OBJ, GLB), Point cloud (PLY)
- SNeRG: 12ms per frame (3 orders magnitude faster)
- Trend: NeRF → 3DGS migration for real-time

**Volumetric Video**:
| Company | Output Format | Unity Support |
|---------|---------------|---------------|
| Microsoft MRCS | HoloStream | Via Arcturus |
| Depthkit | DK format | Dkvfx |
| 8i | OMS, WebAR | Yes |
| Metavido | H.264+metadata | Native (existing) |

**AI-Generated 3D**:
| Platform | Output | Speed |
|----------|--------|-------|
| Meshy AI | GLB, OBJ, USDZ | Fast |
| Tripo AI | GLB, FBX, OBJ | Fast |
| Stable Fast 3D | GLB | 0.5 sec |
| SPAR3D | Mesh | <1 sec |

---

## 2. Comparative Analysis Matrix

### 2.1 Core Capabilities

| Feature | .tilt | USDZ | glTF | XRRAI (proposed) |
|---------|-------|------|------|------------------|
| Brush strokes | ✅ Native | ❌ | ⚠️ Custom ext | ✅ Native |
| AR anchors | ❌ | ⚠️ Apple only | ⚠️ Proposed | ✅ Native |
| Physics | ❌ | ✅ UsdPhysics | ⚠️ KHR_physics | ✅ Native |
| Audio reactive | ❌ | ❌ | ❌ | ✅ Native |
| Gaussian splats | ❌ | ⚠️ Omniverse | ✅ KHR_gaussian | ✅ Native |
| Streaming | ❌ | ❌ | ⚠️ Progressive | ✅ Chunked |
| Layers | ✅ | ✅ | ⚠️ Via nodes | ✅ Native |
| Hologram data | ❌ | ❌ | ❌ | ✅ Native |

### 2.2 Platform Compatibility

| Platform | .tilt | USDZ | glTF | XRRAI |
|----------|-------|------|------|-------|
| iOS AR | ⚠️ View | ✅ Native | ✅ model-viewer | ✅ Via export |
| Android AR | ⚠️ View | ❌ None | ✅ Scene Viewer | ✅ Via export |
| Quest 3 | ✅ VR | ❌ | ✅ Full | ✅ Via export |
| Vision Pro | ❌ | ✅ Native | ⚠️ Web | ✅ Via USDZ |
| WebGL | ✅ three-tilt | ❌ | ✅ Primary | ✅ Via glTF |
| WebGPU | ⚠️ | ❌ | ✅ | ✅ Via glTF |
| Unity | ✅ Toolkit | ⚠️ Exp | ✅ glTFast | ✅ Native |

### 2.3 Future-Proofing

| Aspect | .tilt | USDZ | glTF | XRRAI |
|--------|-------|------|------|-------|
| Standards body | Community | AOUSD | Khronos | Internal |
| AI/ML roadmap | ❌ | ⚠️ Omniverse | ✅ 3DGS, physics | ✅ Native |
| Metaverse ready | ⚠️ | ✅ AOUSD focus | ✅ MSF member | ✅ By design |
| WebXR alignment | ⚠️ | ❌ | ✅ Primary | ✅ Via export |
| Extensibility | Bitmask | Schema | JSON ext | JSON ext |

---

## 3. XRRAI Format Specification (Proposed)

### 3.1 Design Goals

1. **Full MetavidoVFX fidelity** - All brush, hologram, VFX data
2. **Export-friendly** - Clean conversion to glTF/USDZ
3. **Streaming-ready** - Chunked loading for large scenes
4. **AI-native** - Gaussian splats, AI model refs, procedural data
5. **Cross-platform** - JSON core, binary attachments

### 3.2 File Structure

```
scene.xrrai (JSON) or scene.xrraib (binary container)
├── manifest.json         - Version, generator, dependencies
├── scene/
│   ├── hierarchy.json    - Node graph
│   ├── transforms.bin    - Position/rotation/scale (binary)
│   └── metadata.json     - Tags, descriptions
├── strokes/
│   ├── strokes.json      - Stroke metadata
│   └── points.bin        - Control points (binary)
├── holograms/
│   ├── sources.json      - Hologram configurations
│   └── recordings/       - HologramRecording data
├── vfx/
│   ├── instances.json    - VFX instance data
│   └── parameters.json   - Runtime parameters
├── anchors/
│   └── ar_anchors.json   - AR Foundation anchors
├── assets/
│   ├── meshes/           - GLB files
│   ├── textures/         - KTX2/PNG/JPEG
│   ├── audio/            - M4A/MP3
│   └── splats/           - SPZ files
└── export/
    └── preview.glb       - Pre-generated glTF export
```

### 3.3 Core Schema

```json
{
  "xrrai": "1.0",
  "generator": "MetavidoVFX/2026.1",
  "created": "2026-01-22T12:00:00Z",
  "scene": {
    "name": "My AR Scene",
    "description": "Created in MetavidoVFX",
    "tags": ["ar", "hologram", "brush"],
    "bounds": {"min": [-10,-10,-10], "max": [10,10,10]}
  },
  "extensions": ["XRRAI_hologram", "XRRAI_brush", "XRRAI_vfx"]
}
```

### 3.4 Stroke Schema (XRRAI_brush)

```json
{
  "brushes": [
    {
      "id": "brush_001",
      "name": "Glow",
      "material": "BrushStrokeGlow",
      "geometry": "flat|tube|particles",
      "audioReactive": {
        "enabled": true,
        "sizeModulation": 0.5,
        "colorModulation": 0.3,
        "frequencyBand": 1
      }
    }
  ],
  "strokes": [
    {
      "id": "stroke_001",
      "brushId": "brush_001",
      "color": [1.0, 0.5, 0.2, 1.0],
      "size": 0.02,
      "layerId": "layer_001",
      "mirrorId": "mirror_001",
      "pointsRef": "strokes/points.bin#0-1024"
    }
  ]
}
```

### 3.5 Hologram Schema (XRRAI_hologram)

```json
{
  "holograms": [
    {
      "id": "holo_001",
      "type": "live|recorded|remote",
      "source": {
        "type": "ARDepthSource|MetavidoStream|GaussianSplat",
        "config": {...}
      },
      "quality": "low|medium|high|ultra",
      "anchor": "anchor_001"
    }
  ],
  "recordings": [
    {
      "id": "rec_001",
      "duration": 30.5,
      "fps": 30,
      "dataRef": "holograms/recordings/rec_001.h264"
    }
  ]
}
```

### 3.6 AR Anchor Schema

```json
{
  "anchors": [
    {
      "id": "anchor_001",
      "type": "plane|image|face|body|world",
      "classification": "floor|wall|ceiling|table",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0, 1],
      "confidence": 0.95,
      "persistent": true
    }
  ]
}
```

### 3.7 Export Pipeline

```
XRRAI Scene
    ↓
┌───────────────────────────────────────────────────────┐
│ XRRAIExporter                                         │
│   ├── ExportGLTF() → Universal distribution           │
│   │     ├── Strokes → Meshes                          │
│   │     ├── Holograms → Point clouds / meshes         │
│   │     ├── VFX → Particle systems (where possible)   │
│   │     └── Anchors → Custom extension                │
│   │                                                   │
│   ├── ExportUSDZ() → iOS/visionOS                     │
│   │     ├── Convert meshes to UsdGeomMesh             │
│   │     ├── Materials to MaterialX                    │
│   │     └── Strip unsupported features                │
│   │                                                   │
│   └── ExportTilt() → Open Brush compatibility         │
│         ├── Strokes → data.sketch                     │
│         ├── Brushes → BrushIndex GUIDs                │
│         └── Layers → metadata.json                    │
└───────────────────────────────────────────────────────┘
```

---

## 4. Recommendations

### 4.1 MetavidoVFX Implementation Strategy

**Phase 1: Internal Format (XRRAI)**
- Implement XRRAI JSON schema for scene save/load
- Binary attachments for large data (points, textures)
- Chunked streaming support

**Phase 2: Export Pipeline**
- glTF/GLB export via glTFast
- USDZ export for iOS Quick Look
- .tilt export for Open Brush community

**Phase 3: Import Support**
- .tilt import for brush strokes
- glTF import for 3D models (Icosa integration)
- SPZ import for Gaussian splats

**Phase 4: Cloud Integration**
- Icosa Gallery upload (glTF)
- WebGPU viewer with XRRAI → glTF conversion
- Web AR via model-viewer pattern

### 4.2 Platform-Specific Guidance

| Platform | Primary Format | Fallback |
|----------|----------------|----------|
| iOS Quick Look | USDZ | - |
| Android Scene Viewer | glTF | - |
| Quest Browser | glTF | - |
| Vision Pro | USDZ | glTF (web) |
| WebXR | glTF | - |
| Open Brush VR | .tilt | glTF |
| Icosa Gallery | glTF | .tilt |

### 4.3 Future Considerations

1. **KHR_gaussian_splatting** - Monitor Khronos progress, prepare adapter
2. **KHR_interactivity** - Portable behaviors for cross-platform
3. **AOUSD Core Spec** - Track for visionOS requirements
4. **AI model integration** - Text-to-3D outputs (Meshy, Tripo) already GLB

---

## 5. References

### Specifications
- [OpenUSD USDZ Specification](https://openusd.org/dev/spec_usdz.html)
- [Khronos glTF 2.0 Specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)
- [glTF Extensions Registry](https://github.com/KhronosGroup/glTF/blob/main/extensions/README.md)
- [KHR_gaussian_splatting Proposal](https://github.com/KhronosGroup/glTF/pull/2490)

### Tools & Libraries
- [glTFast (Unity)](https://docs.unity3d.com/Packages/com.unity.cloud.gltfast@5.2/manual/index.html)
- [three-tiltloader](https://github.com/icosa-gallery/three-tiltloader)
- [three-icosa](https://github.com/icosa-foundation/three-icosa)
- [Niantic SPZ Format](https://github.com/nianticlabs/spz)
- [model-viewer](https://modelviewer.dev/)

### Research
- [AOUSD Roadmap](https://www.linuxfoundation.org/press/alliance-for-openusd-unveils-roadmap-for-core-usd-specification)
- [Khronos 3D Gaussian Splats Blog](https://www.khronos.org/blog/khronos-ogc-and-geospatial-leaders-add-3d-gaussian-splats-to-the-gltf-asset-standard)
- [Babylon.js 8.0 WebGPU/glTF](https://blogs.windows.com/windowsdeveloper/2025/04/03/part-3-babylon-js-8-0-gltf-usdz-and-webxr-advancements/)

---

*Created by deep research analysis of .tilt, USDZ, glTF, and AI/ML 3D formats*
*For MetavidoVFX/Unity-XR-AI project*
