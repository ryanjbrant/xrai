# Claude-Mem Archive (Jan 2026)

**Exported**: 2026-02-06
**Source**: claude_memories ChromaDB collection (25 documents)
**Purpose**: Preserved insights before simplifying hooks

---

## Critical Rules

### Session Start Rule
Always load and follow ~/GLOBAL_RULES.md at the start of every session. Contains:
1. File Safety - NEVER delete files without explicit permission
2. Debugging protocols
3. MCP-first verification
4. Process awareness - never kill without verification
5. Unity/WebGL/3DVis intelligence patterns
6. Spec-driven development
7. Persistent learning requirements

### Never Delete Rule
Files are NEVER deleted without explicit permission saying 'delete' or 'remove'. Moving, renaming, marking as deprecated = OK. Deleting = ONLY with explicit instruction.

### Startup Tasks
1. Run `mcp-kill-dupes` immediately when starting a new Claude Code session
2. Check for duplicate MCP server instances (mcp-for-unity, chroma-mcp, github)
3. Minimize token usage - keep responses concise, use agents for independent budgets

---

## MetavidoVFX Architecture

### Hybrid Bridge Pattern (KEY)
**O(1) compute dispatch + O(N) lightweight binding**

- ARDepthSource singleton does ONE GPU compute dispatch per frame for ALL VFX
- VFXARBinder per-VFX does just SetTexture() calls - no compute
- Scales linearly: 1 VFX = ~2ms, 10 VFX = ~5ms, 20 VFX = ~8ms
- Reference: YoHana19/HumanParticleEffect pattern (~200 lines vs VFXBinderManager 1357 lines)

**Performance Verified**:
- 353 FPS with 10 active VFX
- <2ms compute per frame
- <0.1ms binding per VFX

### VFX Graph Global Texture Limitation
VFX Graph CANNOT read textures from `Shader.SetGlobalTexture()` - only works for regular shaders. VFX must use explicit `vfx.SetTexture()` per-VFX instance.

HOWEVER: GraphicsBuffers work globally via `Shader.SetGlobalBuffer()` because VFX can access them through HLSL includes. Vector4/Matrix4x4 globals also work.

### Platform Compatibility
- iOS/Android/Quest = full VFX Graph support
- WebGL 2.0 = NOT SUPPORTED (no compute shaders)
- WebGPU experimental in Unity 6.1+
- Web alternatives: WebGPU future, Legacy ParticleSystem fallback, WebRTC video streaming

---

## Key Scripts & Locations

| Script | Location | Purpose |
|--------|----------|---------|
| ARDepthSource.cs | Assets/Scripts/Bridges | Primary AR data source, singleton |
| VFXARBinder.cs | Assets/Scripts/Bridges | Lightweight per-VFX binder |
| VFXLibraryManager.cs | Assets/Scripts/VFX | 920 LOC manager for all VFX |
| NNCamKeypointBinder.cs | Assets/NNCam/Scripts | Body tracking to VFX |
| HandVFXController.cs | Assets/Scripts/HandTracking | Velocity-driven hand tracking |

---

## Critical Bug Fixes

### AR Texture Access Crash (BUG 6) - Fixed 2026-01-20
AR Foundation texture property getters throw NullReferenceException when AR subsystem isn't ready. The `?.` null-coalescing operator does NOT protect.

**TryGetTexture Pattern**:
```csharp
Texture TryGetTexture(System.Func<Texture> getter)
{
    try { return getter?.Invoke(); }
    catch { return null; }
}
var depth = TryGetTexture(() => occlusionManager.humanDepthTexture);
```

**Files Fixed**: ARDepthSource.cs, SimpleHumanHologram.cs, DiagnosticOverlay.cs, DirectDepthBinder.cs, HumanParticleVFX.cs, DepthImageProcessor.cs

### C# ref/out Property Limitation (CS0206)
Auto-properties like `public RenderTexture PositionMap { get; private set; }` cannot be used with ref/out. Must use backing fields:
```csharp
RenderTexture _positionMap;
public RenderTexture PositionMap => _positionMap;
// Then: EnsureRenderTexture(ref _positionMap, ...)
```

### VFXToggleUI NullReferenceException - Fixed 2026-01-22
UpdateCategoryHeader was called before UI initialization. Added null check for _categoriesContainer. Error occurred due to Start() callback ordering.

---

## Testing & Debugging

### Triple-Verified Workflow
1. Unity Console Check: `mcp__unity__read_console` after every edit
2. Play Mode Test: Enter Play mode, check VFX renders correctly
3. Device Test: Build to iOS, verify on-device

### MCP Tools for Testing
- `read_console`: Check compilation errors
- `manage_editor(action="play")`: Start Play mode
- `find_gameobjects`: Locate VFX in scene
- `manage_components`: Inspect component properties

### Verbose Logging Pattern
```csharp
[Header("Debug")]
public bool verboseLogging = false;
void Update() {
    if (verboseLogging) Debug.Log($"[{name}] Status: {status}");
}
```

---

## Scene Structure (HOLOGRAM.unity)

### AR Pipeline
- **ARDepthSource** (ID: 129478) - Singleton compute source
  - Provides: DepthMap, StencilMap, PositionMap, VelocityMap, ColorMap, RayParams

### AR Camera
- **AR Camera** (ID: 129600) - Main camera with AR components
  - Components: Camera, ARCameraManager, ARCameraBackground, TrackedPoseDriver, AROcclusionManager, ARCameraTextureProvider

### Hologram System
- **Hologram** (ID: 128402) - Parent container
  - Components: HologramPlacer, HologramController, VideoPlayer, MetadataDecoder, TextureDemuxer
- **HologramVFX** (ID: 129162) - VFX renderer
  - Components: VisualEffect, VFXARBinder, VFXCategory

---

## VFX Property Bindings

Standard names used by VFXARBinder:
- DepthMap, StencilMap, PositionMap, VelocityMap, ColorMap
- RayParams (Vector4), InverseView (Matrix4x4)
- MapWidth, MapHeight (float), Dimensions (Vector2 for Rcam4)
- Position aliases: PositionMap, Position, WorldPosition, Positions

---

## Debug Patterns

### VFXPipelineDashboard
IMGUI-based real-time debug overlay:
- FPS graph (60-frame history)
- Pipeline flow visualization (ARDepthSource→VFXARBinder→VFX)
- Binding status with color indicators
- Memory usage (RenderTexture allocations)
- Toggle with Tab key

### VFXTestHarness
Keyboard shortcuts for rapid VFX testing:
- 1-9: favorites
- Space: cycle next
- C: cycle categories
- A: toggle all
- P: auto-cycle profiling mode
- R: refresh list

---

## NNCam Eyes VFX Fix (2026-01-20)
eyes_any_nncam2.vfx needs world-space positioning. Wire existing 'Get Keypoint World' subgraph (Assets/VFX/NNCam2/Get Keypoint World.vfxoperator) which takes KeypointBuffer + PositionMap and outputs world Position. The subgraph already exists - just needs to be connected. Key insight: Always check for existing solutions before creating new code.

---

## HiFi Hologram Architecture (2026-01-21)

**Key Insight**: Metavido VFX computes depth→position per-particle in HLSL (MetavidoInverseProjection). ARDepthSource computes PositionMap via GPU compute shader (one dispatch). Using both = redundant computation.

**HiFi Approach**: Read PositionMap directly + ColorMap for RGB (no redundant computation)

**Key Scripts**:
1. Assets/Shaders/HiFiHologramVFX.hlsl - HLSL sampling functions
2. Assets/Scripts/Editor/HiFiHologramVFXCreator.cs - Menu: H3M > HiFi Hologram
3. Assets/Scripts/Editor/RealisticHologramSetup.cs - One-click RGB hologram setup

---

## WarpJobs Insights (2026-02-05)

### Simplified Scoring
5-tier system (T1-T5 based on hire probability):
- T1 (1000+): Interviews/responses
- T2 (200): Core+Senior+Dream
- T3 (100): Core+Senior
- T4 (50): Adjacent+Senior
- T5 (25): Engineering@Dream

### Interview Calendar Best Practice
Use Calendar.app native alarms via AppleScript instead of LaunchAgent plists:
- Calendar handles lifecycle
- Syncs to all devices via iCloud
- No cleanup needed

---

*Archived from claude-mem ChromaDB collection before simplifying hooks*
