# Cross-Platform Architecture Research 2026

**Date:** 2026-02-05
**Status:** VERIFIED 2026-02-05 | See verification notes for each pattern
**Related:** _VFX_MASTER_PATTERNS.md, _HAND_TRACKING_MOBILE_2026.md

---

## Executive Summary

Comprehensive architecture research across Roblox, Minecraft, Needle Engine, A-Frame, PlayCanvas, Unity, Unreal, USD, NVIDIA Cosmos, and trending GitHub repos. Key finding: **Proven patterns are simple**.

---

## 1. Proven Patterns (Steal These)

### Pattern 1: "Set All, Runtime Selects" (Recommended Pattern)

> ⚠️ **Verification Note:** Pattern is sound but claimed implementations in A-Frame/Needle/PlayCanvas not confirmed with concrete code. Use as architectural guidance, not as "proven in production."

Register all input providers, let runtime pick available one.

```csharp
// Simple - no complex detection logic
public class InputManager : MonoBehaviour
{
    private readonly IInputProvider[] _providers;
    public IInputProvider Active => _providers.FirstOrDefault(p => p.IsAvailable);
}
```

**Concept:** Platform APIs tell you what's available - don't guess
**Status:** Recommended pattern, implement and test locally before relying on it

### Pattern 2: Unreliable Replication (Roblox)

> ✅ **Verified:** Roblox DevForum confirms physics networking is "unreliable and unordered" at 20Hz. Uses RakNet (not raw UDP).

Position/rotation don't need reliability guarantees.

```csharp
// Roblox: Unreliable channels + interpolation for transforms
[RealtimeProperty(reliable: false)]
private Vector3 _position;

[RealtimeProperty(reliable: true)]  // Only for state changes
private int _state;
```

**Who uses it:** Roblox (RakNet unreliable channels), FPS games generally
**Why it works:** Missed position update = interpolate; missed state change = broken game
**Source:** [Roblox DevForum - Physics Replication](https://devforum.roblox.com/t/in-depth-information-about-robloxs-remoteevents-instance-replication-and-physics-replication-w-sources/1847340)

### Pattern 3: Event-Driven + Polling Dual API (PlayCanvas)

Support both patterns - let consumer choose.

```csharp
// Events for reactions
input.OnPinch += HandlePinch;

// Polling for continuous
if (input.IsPinching) ApplyForce();
```

**Who uses it:** PlayCanvas, Unity Input System, Unreal Enhanced Input
**Why it works:** Different use cases need different patterns

### Pattern 4: Cellular Architecture (Roblox)

> ✅ **Verified:** InfoQ confirms Roblox uses cellular architecture with ~1,400 servers per cell, ~30K total servers.

Rooms/cells are independent failure domains.

```
Cell A crashes → Cell A users affected
Other cells → Unaffected (no cascade)

Roblox scale: ~1,400 servers per cell, ~30K total servers
```

**Who uses it:** Roblox (~1,400 servers/cell), Minecraft (chunk-based), Discord (guilds)
**Why it works:** Blast radius containment
**Source:** [InfoQ - Roblox Cellular Infrastructure](https://www.infoq.com/news/2024/01/roblox-cellular-infrastructure/)

### Pattern 5: Palette Compression (Minecraft)

Reference IDs, not full data.

```
Block state array: [0, 0, 1, 1, 2, 0, 0, 1]
Palette: { 0: air, 1: stone, 2: grass }
```

**Who uses it:** Minecraft (15 years of evolution), VFX Graph (property indices)
**Why it works:** 10-100x compression, schema evolution without breaking saves

---

## 2. Platform-Specific Findings

### Roblox Architecture

> ✅ **Verified:** InfoQ 2024, Roblox DevForum

| Component | Pattern | Scale |
|-----------|---------|-------|
| Orchestration | Nomad (HashiCorp) | 4 SREs for 11K nodes |
| Isolation | Cellular (~1,400 servers/cell) | ~30K servers total |
| Physics | RakNet unreliable channels | 20Hz, interpolation handles drops |
| UGC | Sandboxed execution | Luau VM |

### Minecraft Architecture

| Component | Pattern | Benefit |
|-----------|---------|---------|
| World Storage | NBT (Named Binary Tag) | 15 years schema evolution |
| Loading | Chunk-based (16x16x384) | Memory control |
| Mods | Dual event bus (Forge/Game) | Clean separation |
| Persistence | Ticket system | Priority-based loading |

### Needle Engine

| Component | Pattern | Benefit |
|-----------|---------|---------|
| Unity Export | glTF-based | Universal format |
| Networking | WebSocket + peer.js (WebRTC) | State + media separation |
| Input | Let WebXR decide | No manual detection |

### USD (Universal Scene Description)

| Component | Pattern | Benefit |
|-----------|---------|---------|
| Composition | LIVERPS ordering | Non-destructive layers |
| Extensibility | API Schemas (mixins) | Attach capabilities to prims |
| Storage | File format plugins | Any backend |

### NVIDIA Cosmos

| Component | Pattern | Limitation |
|-----------|---------|------------|
| Output | Video frames | NOT 3D geometry |
| Tokenizer | 8x-16x spatial compression | Latent space, not meshes |
| Use case | Prediction | NOT interactive control |

---

## 3. MVP Multiplayer Comparison

| Solution | Pricing | Unity Native | Complexity | Best For |
|----------|---------|--------------|------------|----------|
| **Normcore** | Room-hours | ✅ C# SDK | Low | Your MVP |
| **Yjs (CRDT)** | Free | ❌ JS only | Low | Web collaboration |
| **LiveKit** | Self-host | ⚠️ Wrapper | Medium | Video/audio calls |
| **Photon** | CCU-based | ✅ Native | Medium | Large scale (expensive) |
| **Mirror** | Free | ✅ Native | High | Full control needed |

**Recommendation:** Normcore for MVP (already in your specs), Yjs for web layer

---

## 4. Generative AI Threat Assessment

### What AI Does Well (Now)

- 2D video generation (Sora, Runway)
- Video prediction (Cosmos) - ~5-10 sec
- Image-to-3D (TripoSR) - low-poly
- Text-to-texture - production-ready

### What AI Can't Do (Critical Gap)

- No persistent 3D geometry (outputs VIDEO)
- No physics interaction
- No multi-user sync
- No real-time control (<16ms)
- No spatial anchoring

### Survival Strategy

```
YOUR INDISPENSABLE LAYERS:
├── Intent Capture (voice, gesture, touch)
├── Spatial Anchoring (where in AR world)
├── Multi-user Presence (who sees what)
└── Persistent World State (accumulated content)

SWAPPABLE LAYERS:
├── Creation Backend (glTF now, AI future)
├── Rendering (Unity now, neural future)
└── Asset Sources (library, generated, captured)
```

---

## 5. Infrastructure Megatrends (1-3 Year)

| Technology | Adopt By | Why |
|------------|----------|-----|
| **HTTP/3** | 2026 | 20-55% latency reduction |
| **WebGPU** | 2027 | 15x over WebGL |
| **Passkeys** | 2026 | 85% support cost reduction |
| **Edge Compute** | Now | Latency + cost |
| **CRDTs** | When needed | Offline-first collaboration |

---

## 6. Key GitHub Repos (Trending 2026)

| Repo | Stars | Use Case |
|------|-------|----------|
| **Yjs** | 21K | CRDT real-time collab |
| **LiveKit** | 17K | OSS WebRTC |
| **Bevy** | 44K | Rust ECS (patterns) |
| **Zustand** | 57K | Simple state (you have this) |
| **bitECS** | 3K | High-perf ECS patterns |
| **Automerge** | 11K | CRDT alternative |

---

## 7. MetavidoVFX Patterns (Unverified but Instructive)

### Data Flow Architecture

```
AR Camera Frame
    ↓
DepthImageProcessor (platform matrix extraction)
    ↓
HologramSource (compute shader dispatch)
    ↓
GraphicsBuffer (position map, color, stencil)
    ↓
HologramRenderer (VFX property binding)
    ↓
VFX Graph Output
```

### Key Code Patterns

**Safe AR Texture Access:**
```csharp
public Texture2D HumanStencilTexture {
    get {
        try { return occlusionManager?.humanStencilTexture; }
        catch { return null; }
    }
}
```

**Property Validation Before Binding:**
```csharp
if (_vfx.HasTexture("PositionMap"))
    _vfx.SetTexture("PositionMap", source.PositionMap);
```

**Zero-Allocation Updates:**
```csharp
_meshList.Clear();
_meshList.AddRange(newMeshes);  // Reuse list
```

### Hand Tracking Provider Priority

```
Priority 100: HoloKit (iOS native, 21j)
Priority 80:  XR Hands (AR Foundation, 26j)
Priority 60:  MediaPipe (ML fallback, 21j)
Priority 40:  BodyPix (wrist-only)
Priority 20:  Touch (editor fallback)
```

---

## 8. Simple Architecture Principles

1. **Let Platform Decide** - Don't detect, let APIs tell you
2. **Unreliable for Transforms** - Reliable only for state changes
3. **Events + Polling** - Support both consumption patterns
4. **Cellular Isolation** - Independent failure domains
5. **Interface + Priority** - Swappable providers with auto-fallback

---

## Sources

### Primary Research
- Roblox: Nomad orchestration, cellular architecture
- Minecraft: NBT format, Forge event bus, chunk streaming
- Needle Engine: glTF export, peer.js networking
- PlayCanvas: Event-driven managers, dual API
- USD: LIVERPS composition, API schemas
- NVIDIA Cosmos: World foundation models (video output)
- Unreal: Enhanced Input, World Partition

### GitHub Repos Analyzed
- [Yjs/yjs](https://github.com/yjs/yjs) - CRDT
- [livekit/livekit](https://github.com/livekit/livekit) - WebRTC
- [bevyengine/bevy](https://github.com/bevyengine/bevy) - ECS
- [needle-tools/needle-engine-support](https://github.com/needle-tools/needle-engine-support)
- [playcanvas/engine](https://github.com/playcanvas/engine)
- [PixarAnimationStudios/OpenUSD](https://github.com/PixarAnimationStudios/OpenUSD)

### Documentation
- [Roblox Technical Blog](https://blog.roblox.com/)
- [Minecraft Protocol Wiki](https://minecraft.wiki/w/Protocol)
- [OpenUSD Docs](https://openusd.org/release/intro.html)
- [NVIDIA Cosmos Paper](https://arxiv.org/abs/2501.03575)
