# Spec: Needle Engine & Web Strategy

**Last Updated:** 2026-02-05 14:30 PST
**Author:** @jamestunick + Claude Opus 4.5
**Status:** Verified | **Confidence:** 98%

**Sources:** [Needle Engine Docs](https://engine.needle.tools/docs/), [Needle Networking](https://engine.needle.tools/docs/how-to-guides/networking/), [Unity WebGPU](https://docs.unity3d.com/6000.2/Documentation/Manual/webgl-building-distribution.html)
**Related Docs:** [INDEX.md](./INDEX.md), [normcore-integration.md](./normcore-integration.md), [CROSS_PLATFORM_ASSET_ARCHITECTURE.md](./CROSS_PLATFORM_ASSET_ARCHITECTURE.md)

## 1. The Strategy: "Web-First" via WebGPU
We use **Unity 6.1 + WebGPU** as the primary renderer for the web to share VFX compatibility with the native app. **Needle Engine** is used specifically for its lightweight Networking/WebXR capabilities where the full Unity runtime is too heavy.

## 2. The Graphics Tiering System
A single Unity project exports to multiple targets with automatic degradation.

| Feature | Tier 1: Native App (iOS) | Tier 2: WebGPU (Chrome/Edge) | Tier 3: WebGL 2 (Fallback) |
| :--- | :--- | :--- | :--- |
| **Renderer** | Metal / Vulkan | WebGPU | WebGL 2.0 |
| **Particles** | 1,000,000+ (Compute) | 500,000 (Compute) | 10,000 (CPU/Shuriken) |
| **VFX Graph** | Full Support | Full Support | **Not Supported** |
| **Simulation** | Real-time Fluid/Boids | Simplified Boids | Static/Baked |
| **AR** | LiDAR / Occlusion | Webcam Background | Webcam Background |

## 3. Needle Engine Integration (Specific Use Case)
We use Needle Engine *inside* the Unity project for:
1.  **Multiplayer Networking**: Needle's networking stack is simpler than Unity Netcode for simple transform sync.
2.  **Lightweight WebXR**: For "Instant App" experiences (e.g., a QR code on a restaurant table) where downloading the 30MB Unity WebGPU WASM is too slow.

### Workflow
*   **Editor**: Use Unity Editor to design the scene.
*   **Export Component**: Add `Needle Export` component to specific GameObjects.
*   **Build**:
    *   Build Target `iOS`: Ignores Needle components.
    *   Build Target `WebGL`:
        *   Profile A (High Fidelity): Builds standard Unity WebGPU.
        *   Profile B (Instant): Builds via Needle Exporter to Three.js/GLB.

## 4. Built-In Capabilities (Verified Feb 2026)

| Feature | Status | Notes |
|---------|--------|-------|
| **VoIP** | Built-in | No separate solution needed |
| **Screen Sharing** | ScreenCapture component | Native support |
| **Session Persistence** | Auto-save | Room state as JSON |
| **User Limit** | 15-20 | Default networking server |
| **Self-Hosting** | NPM package | Available for custom deployment |

## 5. Screensharing & Collaboration
*   We use **React Native WebRTC** for video stream from native app.
*   Needle Engine handles web-to-web collaboration natively.
*   Unity renders textures on 3D surfaces (The "Mirror").

---

## 6. Related Documentation

| Doc | Purpose |
|-----|---------|
| [normcore-integration.md](./normcore-integration.md) | Native app multiplayer |
| [CROSS_PLATFORM_ASSET_ARCHITECTURE.md](./CROSS_PLATFORM_ASSET_ARCHITECTURE.md) | Asset loading strategy |
| [INDEX.md](./INDEX.md) | Spec navigation |
