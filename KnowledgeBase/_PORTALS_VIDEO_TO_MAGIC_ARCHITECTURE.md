# Portals: Video → Magic Architecture

**Date:** 2026-02-05
**Inspiration:** Luma AI (sparse video → rich 3D)
**Vision:** Metavido + WebRTC + AI World Model → Immersive 4D Magic

---

## The Luma Pattern

```
Luma AI approach:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Sparse Input│────▶│  AI Model   │────▶│ Rich Output │
│ (video/imgs)│     │ (NeRF/GSplat│     │ (3D scene)  │
└─────────────┘     └─────────────┘     └─────────────┘

Key insight: Minimal input → Maximum magic
```

---

## Our Pattern: Video → Magic

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     VIDEO → MAGIC PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT LAYER (Sparse)                                                   │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Video Sources:                                                  │    │
│  │ ├── Local camera (Metavido encoded: RGB + Depth + Pose)        │    │
│  │ ├── WebRTC stream (friend's camera, live)                      │    │
│  │ ├── Recorded file (MP4 with embedded metadata)                 │    │
│  │ └── Screen share (desktop/app capture)                         │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                              │                                          │
│                              ▼                                          │
│  AI WORLD MODEL (Understanding)                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Multimodal Processing:                                          │    │
│  │ ├── Scene understanding (objects, people, surfaces)            │    │
│  │ ├── Depth estimation (monocular or LiDAR)                      │    │
│  │ ├── Pose tracking (body, hands, face)                          │    │
│  │ ├── Audio analysis (speech, music, ambient)                    │    │
│  │ └── Semantic segmentation (what's what)                        │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                              │                                          │
│                              ▼                                          │
│  OUTPUT LAYER (Rich)                                                    │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Visual Renderers (pick per platform):                           │    │
│  │ ├── VFX Graph (Unity - particles, fields, simulations)         │    │
│  │ ├── Shader-based (custom materials, stylization)               │    │
│  │ ├── Gaussian Splats (photorealistic 3D from video)             │    │
│  │ ├── Point clouds (real-time depth visualization)               │    │
│  │ └── Neural rendering (future - learned representations)        │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## What Makes It "Magic"

| Sparse Input | AI Understanding | Rich Output |
|--------------|------------------|-------------|
| Phone video | "There's a person" | Particles follow body contour |
| Depth map | "That's a table" | Fire flows around furniture |
| Audio | "Music is playing" | VFX pulses with beat |
| Hand position | "They're pointing" | Magic streams from fingertip |
| Face | "They're smiling" | Sparkles around face |
| Voice | "Make it rain" | Weather system spawns |

**The AI interprets sparse signals and drives rich, responsive visual output.**

---

## Modular Architecture

### Input Modules (Swappable)

```
IVideoSource
├── LocalCameraSource (Metavido encoder)
├── WebRTCSource (peer video stream)
├── FileSource (recorded MP4)
└── MockSource (editor testing)

IAudioSource
├── MicrophoneSource (local)
├── WebRTCAudioSource (peer)
└── FileAudioSource (playback)
```

### AI Modules (Swappable)

```
IWorldModel
├── BodyTracker (pose estimation)
├── SceneUnderstanding (segmentation)
├── DepthEstimator (monocular depth)
├── AudioAnalyzer (FFT, beat detection)
├── SpeechParser (voice → intent)
└── EmotionDetector (face → mood)

Each module:
- Runs independently
- Outputs to shared "WorldState"
- Can be enabled/disabled per platform
- Can use local or cloud inference
```

### Output Modules (Swappable)

```
IVisualRenderer
├── VFXGraphRenderer (Unity)
├── ShaderRenderer (custom materials)
├── GaussianSplatRenderer (photorealistic)
├── PointCloudRenderer (depth viz)
└── ThreeJSRenderer (web)

Each renderer:
- Reads from WorldState
- Produces visual output
- Platform-specific implementation
```

---

## WorldState: The Glue

```typescript
interface WorldState {
  // From video
  colorTexture: Texture;
  depthTexture: Texture;
  cameraPose: Matrix4x4;

  // From AI
  bodies: BodyPose[];        // 0-N tracked people
  hands: HandPose[];         // 0-N tracked hands
  faces: FacePose[];         // 0-N tracked faces
  segments: Segment[];       // Semantic regions
  objects: DetectedObject[]; // Recognized items

  // From audio
  audioSpectrum: float[];    // FFT bands
  beatIntensity: float;      // 0-1 beat strength
  voiceIntent: Intent;       // Parsed command

  // Derived
  mood: Mood;                // Calm/energetic/etc
  activity: Activity;        // Dancing/talking/etc
}
```

**All renderers read WorldState. All AI modules write to it.**

---

## Platform Rendering

### Unity (iOS/Android/Quest)

```
WorldState → VFX Graph bindings

VFX Properties:
├── DepthMap (Texture2D)
├── ColorMap (Texture2D)
├── BodyPositions (StructuredBuffer)
├── HandPositions (StructuredBuffer)
├── AudioSpectrum (float[])
├── BeatIntensity (float)
└── CameraPose (Matrix4x4)

VFX responds to all of these in real-time.
```

### Web (Three.js)

```
WorldState → Three.js uniforms

Custom shaders receive:
├── uDepthMap
├── uColorMap
├── uBodyPositions
├── uAudioSpectrum
└── etc.

Same data, different renderer.
```

### Gaussian Splats

```
For telepresence:
1. Capture video + depth on sender
2. Stream via WebRTC
3. Reconstruct as Gaussian splat on receiver
4. Render in their AR space

Result: Friend appears as photorealistic hologram.
```

---

## AI World Model Options

### On-Device (Low Latency)

| Model | Purpose | Framework |
|-------|---------|-----------|
| MoveNet | Body pose (17 joints) | TFLite/CoreML |
| MediaPipe Hands | Hand tracking (21 joints) | MediaPipe |
| BodyPix | Segmentation (24 parts) | TFLite/ONNX |
| Face Mesh | 468 landmarks | MediaPipe |
| YAMNet | Audio classification | TFLite |

### Cloud (Higher Quality)

| Model | Purpose | API |
|-------|---------|-----|
| Gemini | Scene understanding, voice | Google AI |
| GPT-4V | Visual reasoning | OpenAI |
| Whisper | Speech-to-text | OpenAI |
| Custom | Specialized tasks | Self-hosted |

### Hybrid (Best of Both)

```
On-device: Real-time tracking (pose, hands, audio FFT)
Cloud: Complex understanding (voice commands, scene reasoning)

Latency budget:
├── Tracking: <16ms (60 FPS)
├── Audio FFT: <10ms
├── Voice command: 500-2000ms (acceptable)
└── Scene reasoning: 1-5s (background)
```

---

## Example Experiences

### 1. "Magic Mirror" (Single User)

```
Input: Front camera
AI: Body + face tracking
Output: Particles flow around your silhouette

User sees themselves with magical aura.
```

### 2. "Holographic Call" (Two Users)

```
Input: WebRTC video streams
AI: Body tracking on each end
Output: Friend rendered as VFX-enhanced hologram

You see friend as glowing figure in your room.
```

### 3. "Music Realm" (Audio-Reactive)

```
Input: Music (mic or file)
AI: Beat detection + frequency analysis
Output: Environment responds to music

Particles pulse, colors shift, world breathes with beat.
```

### 4. "Voice Sculptor" (Voice + Vision)

```
Input: Voice + camera
AI: Speech parsing + scene understanding
Output: VFX responds to commands

"Make fire around my hands" → fire VFX attached to tracked hands
```

### 5. "AR Stage" (Multi-User)

```
Input: Multiple WebRTC streams
AI: Track all participants
Output: Shared AR experience

Everyone as holograms in a virtual stage, with shared VFX.
```

---

## Implementation Phases

### Phase 1: Single Video → VFX (4 weeks)

```
Week 1: Metavido integration
├── Encode local camera
├── Decode to textures
└── Display in VFX Graph

Week 2: Body tracking
├── Add MoveNet or MediaPipe
├── Output to WorldState
└── VFX follows body

Week 3: Audio reactivity
├── FFT analysis
├── Beat detection
└── VFX pulses with music

Week 4: Polish + test
├── 3 VFX presets
├── User testing
└── Iterate
```

### Phase 2: Two Users → Telepresence (4 weeks)

```
Week 1: WebRTC basics
Week 2: Encode/decode over network
Week 3: Render friend as hologram
Week 4: Polish + test
```

### Phase 3: Voice + AI Enhancement (4 weeks)

```
Week 1: Voice commands
Week 2: Scene understanding
Week 3: Dynamic VFX generation
Week 4: Polish + test
```

---

## Key Differentiators vs Luma

| Luma | Portals |
|------|---------|
| Capture → static 3D | Live video → dynamic 4D |
| Single user capture | Multi-user telepresence |
| Photorealistic output | Magical/artistic output |
| Post-processing | Real-time |
| View only | Interact + create |

**We're not trying to be Luma. We're using similar input (video) but different output (magic, not realism).**

---

## The "Sparse → Rich" Philosophy

```
Luma: Video → Gaussian Splats (realistic reconstruction)
Us:   Video → VFX Magic (artistic transformation)

Same principle: Minimal input, maximum output.
Different goal: Realism vs. Magic.
```

---

## Technical Foundation (Already Have)

| Component | Source | Status |
|-----------|--------|--------|
| Metavido encoder | MetavidoVFX | Ready to port |
| VFX Graph bindings | MetavidoVFX | Ready to port |
| Body tracking | AR Foundation | Built-in |
| Hand tracking | ARKit/Vision | Built-in |
| Audio FFT | Unity | Built-in |
| WebRTC | Daily.co or native | Need to add |

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Video → VFX latency | <50ms |
| Body tracking accuracy | 90%+ |
| Audio-reactive sync | <30ms |
| WebRTC latency | <200ms |
| "Wow" reaction | 8/10 users |

---

## One-Liner

> **"Point your camera, see magic. Call a friend, they're a hologram. Speak, and the world transforms."**

---

*Sparse input → AI understanding → Rich magic*
*Last Updated: 2026-02-05*
