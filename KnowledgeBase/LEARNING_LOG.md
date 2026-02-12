# Learning Log

## 2026-02-10 - Gemini CLI - Strategic Resolution: The Hybrid Bridge & Lifelike Standard

**Context**: Deep analysis of Keijiro's `Metavido` and `MetavidoVFX` repositories to identify the "Simplest Lifelike" hologram pipeline for the Standalone App and Portals V4.

**Discoveries**:
1.  **Hybrid Bridge is the Winner**: The combination of `ARDepthSource` (Single Compute Dispatch) and `VFXARBinder` (Universal Binding) is the definitive architecture. It scales to O(1) for infinite VFX and uses standard Metavido protocols.
2.  **Stochastic Transparency**: The local `RcamBackground.shader` is superior to the base package. It uses stochastic discarding (random noise) to blend the hologram with the AR background, creating a "ghostly" look that is cheap to render on mobile.
3.  **VFX Switching**: The `VfxSwitcher.cs` pattern using Unity 6's `Awaitable` + toggling the `Spawn` property (instead of GameObject activation) is the "Gold Standard" for zero-latency transitions.
4.  **Subgraph Synergy**: The "Lifelike" quality comes from three specific VFX subgraphs:
    *   `Metavido Filter`: Precision alpha-based segmentation.
    *   `Metavido Inverse Projection`: Unified world-space tracking.
    *   `Metavido Sample Random`: Organic, non-grid particle distribution.

5.  **Lite Rendering Strategy**: `Configurator.cs` provides a blueprint for performance scaling. On mobile, it automatically switches to a `RendererLite.asset` and disables high-cost optional VFX.
6.  **Camera Proxy Visualization**: The `CameraProxy` VFX set (AxisLines, Circle, Frustum) is the professional way to show users where the holographic person was captured from, aiding in spatial alignment.

**Action**: Hardened the `MetavidoVFX-main` project as the L3 verification target. Fixed critical bugs in `hifi_hologram_people.vfx` (dynamic sizing) and `hifi_hologram_pointcloud.vfx` (strip capacity). Standardized URP assets for Lite/Full parity.

**Next Step**: Deploy `HOLOGRAM 3.unity` to iPhone 12+ for final 60FPS verification.
## 2026-02-10 22:08 EST - Claude Hook - Auto Session Persistence
- **Discovery**: Pre-compact/session-end checkpointing now runs automatically.
- **Context**: Triggered by SessionEnd (other) in `portals_main`.
- **Impact**:
  - Reduces manual "save session" follow-ups.
  - Preserves resume context across '/compact' and session exits.
- **Pattern**: `~/.claude/hooks/auto-session-persist.sh` via `PreCompact` + `SessionEnd` hooks.
- **Category**: workflow
- **ROI**: High - prevents context loss at transition boundaries.
- **Related**: `~/.claude/session_memories/`, `~/KnowledgeBase/_AGENT_HANDOFF.md`

## 2026-02-11 00:17 EST - Claude Hook - Auto Session Persistence
- **Discovery**: Pre-compact/session-end checkpointing now runs automatically.
- **Context**: Triggered by SessionEnd (other) in `unity-xr-ai`.
- **Impact**:
  - Reduces manual "save session" follow-ups.
  - Preserves resume context across '/compact' and session exits.
- **Pattern**: `~/.claude/hooks/auto-session-persist.sh` via `PreCompact` + `SessionEnd` hooks.
- **Category**: workflow
- **ROI**: High - prevents context loss at transition boundaries.
- **Related**: `~/.claude/session_memories/`, `~/KnowledgeBase/_AGENT_HANDOFF.md`

## 2026-02-11 00:52 EST - Claude Hook - Auto Session Persistence
- **Discovery**: Pre-compact/session-end checkpointing now runs automatically.
- **Context**: Triggered by SessionEnd (other) in `metavidovfx-main`.
- **Impact**:
  - Reduces manual "save session" follow-ups.
  - Preserves resume context across '/compact' and session exits.
- **Pattern**: `~/.claude/hooks/auto-session-persist.sh` via `PreCompact` + `SessionEnd` hooks.
- **Category**: workflow
- **ROI**: High - prevents context loss at transition boundaries.
- **Related**: `~/.claude/session_memories/`, `~/KnowledgeBase/_AGENT_HANDOFF.md`

## 2026-02-11 07:15 EST - Performance Optimization - IDE & Workflow De-bloating
- **Discovery**: Significant IDE latency (Rider/Unity) caused by background automation agents and synchronous git hooks.
- **Context**: Rider CPU spikes (26%+) from Semantic Search/Backend; Unity refresh loops.
- **Impact**: 
  - Reduced background CPU overhead by disabling automation agents in `automation-config.json`.
  - Faster git operations by disabling synchronous `pre-commit` and `post-commit` hooks.
  - Improved Play Mode entry speed via `m_EnterPlayModeOptionsEnabled`.
- **Pattern**: Rename git hooks to `.disabled` and set `automation-config.json:enabled` to `false` for low-spec or high-load environments.
- **Category**: #performance #workflow #devops
- **ROI**: High - increases developer velocity by reducing tool-induced friction.

## 2026-02-11 07:56 EST - Claude Hook - Auto Session Persistence
- **Discovery**: Pre-compact/session-end checkpointing now runs automatically.
- **Context**: Triggered by SessionEnd (other) in `unity`.
- **Impact**:
  - Reduces manual "save session" follow-ups.
  - Preserves resume context across '/compact' and session exits.
- **Pattern**: `~/.claude/hooks/auto-session-persist.sh` via `PreCompact` + `SessionEnd` hooks.
- **Category**: workflow
- **ROI**: High - prevents context loss at transition boundaries.
- **Related**: `~/.claude/session_memories/`, `~/KnowledgeBase/_AGENT_HANDOFF.md`

## 2026-02-11 20:33 EST - Claude Hook - Auto Session Persistence
- **Discovery**: Pre-compact/session-end checkpointing now runs automatically.
- **Context**: Triggered by SessionEnd (logout) in `portals_main`.
- **Impact**:
  - Reduces manual "save session" follow-ups.
  - Preserves resume context across '/compact' and session exits.
- **Pattern**: `~/.claude/hooks/auto-session-persist.sh` via `PreCompact` + `SessionEnd` hooks.
- **Category**: workflow
- **ROI**: High - prevents context loss at transition boundaries.
- **Related**: `~/.claude/session_memories/`, `~/KnowledgeBase/_AGENT_HANDOFF.md`

## 2026-02-12 00:00 EST - Claude Hook - Auto Session Persistence
- **Discovery**: Pre-compact/session-end checkpointing now runs automatically.
- **Context**: Triggered by SessionEnd (other) in `portals_main`.
- **Impact**:
  - Reduces manual "save session" follow-ups.
  - Preserves resume context across '/compact' and session exits.
- **Pattern**: `~/.claude/hooks/auto-session-persist.sh` via `PreCompact` + `SessionEnd` hooks.
- **Category**: workflow
- **ROI**: High - prevents context loss at transition boundaries.
- **Related**: `~/.claude/session_memories/`, `~/KnowledgeBase/_AGENT_HANDOFF.md`

## 2026-02-12 01:54 EST - Claude Hook - Auto Session Persistence
- **Discovery**: Pre-compact/session-end checkpointing now runs automatically.
- **Context**: Triggered by PreCompact (auto) in `warpjobs`.
- **Impact**:
  - Reduces manual "save session" follow-ups.
  - Preserves resume context across '/compact' and session exits.
- **Pattern**: `~/.claude/hooks/auto-session-persist.sh` via `PreCompact` + `SessionEnd` hooks.
- **Category**: workflow
- **ROI**: High - prevents context loss at transition boundaries.
- **Related**: `~/.claude/session_memories/`, `~/KnowledgeBase/_AGENT_HANDOFF.md`


## Auto-extracted from claude-mem (2026-02-12)

### [2026-01-16] MetavidoVFX
**Tags**: vfx,pipeline,hybrid-bridge,ARDepthSource,VFXARBinder
RECOMMENDED ARCHITECTURE:
- ARDepthSource (singleton, ~80 LOC) - ONE compute dispatch
- VFXARBinder (per-VFX, ~40 LOC) - lightweight SetTexture() binding

### [2026-01-16] MetavidoVFX
**Tags**: vfx,pipeline,hybrid-bridge,ARDepthSource,VFXARBinder
KEY INSIGHT: VFX Graph cannot read Shader.SetGlobalTexture() - must use explicit vfx.SetTexture()

### [2026-01-16] MetavidoVFX
**Tags**: vfx,pipeline,hybrid-bridge,ARDepthSource,VFXARBinder
PERFORMANCE:
- 1 VFX: 1.15ms (vs 1.1ms old)
- 10 VFX: 1.6ms (vs 11ms old)
- 20 VFX: 2.1ms (vs 22ms old)

### [2026-01-16] MetavidoVFX
**Tags**: testing,debugging,verbose-logging,mcp,unity
PERFORMANCE TARGETS:
- 60 FPS on iPhone 15 Pro
- <2ms compute per frame
- <0.1ms binding per VFX

### [2026-01-16] MetavidoVFX
**Tags**: WebGL,VFX,react-unity,compute-shaders
MetavidoVFX Platform Compatibility (2026-01-16): VFX Graph requires compute shaders - WebGL 2.0 NOT SUPPORTED. react-unity-webgl inherits WebGL limitations. iOS/Android/Quest = full support. WebGPU experimental in Unity 6.1+. Web alternatives: 1) WebGPU future, 2) Legacy ParticleSystem fallback, 3) WebRTC video streaming from device. Key sources: Unity docs, keijiro/VfxGraphGraphicsBufferTest (86 stars). Triple-verified against official Unity documentation and GitHub sources.

### [2026-01-16] MetavidoVFX
VFX Graph Global Property Limitation (Unity 6 VFX Graph 17.2): VFX Graph CANNOT read textures from Shader.SetGlobalTexture() - it only works for regular shaders. VFX must use explicit vfx.SetTexture() per-VFX instance. HOWEVER, GraphicsBuffers work globally via Shader.SetGlobalBuffer() because VFX can access them through HLSL includes. Vector4/Matrix4x4 globals also work. This is why Hybrid Bridge Pattern uses ARDepthSource singleton + VFXARBinder per-VFX binding. Verified via Unity Discussions Jan 2026.

### [2026-01-16] MetavidoVFX
C# Properties Cannot Be Passed as ref/out Parameters: In C#, auto-properties like 'public RenderTexture PositionMap { get; private set; }' cannot be used with ref/out. Must use backing fields: 'RenderTexture _positionMap; public RenderTexture PositionMap => _positionMap;' then 'EnsureRenderTexture(ref _positionMap, ...)'. This is a language limitation, not Unity-specific. Error CS0206.

### [2026-01-16] MetavidoVFX
Hybrid Bridge Pattern for VFX (MetavidoVFX 2026-01-16): O(1) compute dispatch + O(N) lightweight binding. ARDepthSource singleton does ONE GPU compute dispatch per frame for ALL VFX, computes PositionMap/VelocityMap. VFXARBinder per-VFX does just SetTexture() calls - no compute. Scales linearly: 1 VFX = ~2ms, 10 VFX = ~5ms, 20 VFX = ~8ms. Reference: YoHana19/HumanParticleEffect pattern (~200 lines vs VFXBinderManager 1357 lines).

### [2026-01-16] MetavidoVFX
VFX Graph WebGL 2.0 Incompatibility: VFX Graph requires compute shader support which WebGL 2.0 lacks. VFX effects will NOT work with react-unity-webgl portals or any WebGL deployment. Must use Particle Systems for WebGL or target native platforms only. Verified Jan 2026.

### [2026-01-16] MetavidoVFX
VFXPipelineDashboard Pattern (MetavidoVFX): IMGUI-based real-time debug overlay showing: FPS graph (60-frame history), pipeline flow visualization (ARDepthSource→VFXARBinder→VFX), binding status with color indicators, memory usage (RenderTexture allocations), active VFX list with particle counts. Toggle with Tab key. Uses OnGUI() for cross-platform compatibility.

### [2026-01-16] MetavidoVFX
VFXTestHarness Pattern (MetavidoVFX): Keyboard shortcuts for rapid VFX testing: 1-9=favorites, Space=cycle next, C=cycle categories, A=toggle all, P=auto-cycle profiling mode, R=refresh list. Auto-categorizes VFX by naming convention (people/human/body→People, hand/joint→Hands, audio/sound→Audio, rcam/metavido/nncam→by source). Uses InferCategory() method for smart categorization.

### [2026-01-20] MetavidoVFX
**Tags**: ARFoundation,BugFix,TryGetTexture,iOS,Unity,NullReferenceException
MetavidoVFX Session 2026-01-20: Fixed AR Foundation Texture Access Crash (BUG 6)

### [2026-01-20] MetavidoVFX
NNCam Eyes VFX Fix (2026-01-20): eyes_any_nncam2.vfx needs world-space positioning. Solution: Wire existing 'Get Keypoint World' subgraph (Assets/VFX/NNCam2/Get Keypoint World.vfxoperator) which takes KeypointBuffer + PositionMap and outputs world Position. The subgraph already exists - just needs to be connected inside the eyes VFX. PositionMap is in the Blackboard but not wired. Key insight: Always check for existing solutions before creating new code. The compute shader approach was unnecessary since VFX subgraphs already handle UV→world position conversion.

### [2026-01-20] Unity-XR-AI
Unity-XR-AI project architecture: MetavidoVFX is the main Unity project using AR Foundation 6.2.1, VFX Graph 17.2.0, Unity 6000.2.14f1. Core systems: ARDepthSource (single compute dispatch), VFXARBinder (per-VFX texture mapping), VFXLibraryManager (73 VFX organized by category). Performance verified at 353 FPS with 10 active VFX. Key patterns: Hybrid Bridge Pattern for O(1) compute scaling, ExposedProperty for VFX Graph bindings.

### [2026-01-21] MetavidoVFX
**Tags**: hologram,vfx,hifi,positionmap,colormap,architecture
MetavidoVFX HiFi Hologram Session 2026-01-21

### [2026-02-05] WarpJobs
**Tags**: scoring,calendar,interview,simplification,best-practice
KEY LEARNING: For macOS reminders, use Calendar.app native alarms via AppleScript instead of creating individual LaunchAgent plists - Calendar handles lifecycle, syncs to all devices via iCloud, no cleanup needed.

### [2026-02-06] Unity-XR-AI
**Tags**: vfx-audit,memory-system,hybrid-bridge,simplification
KEY INSIGHT - Memory Best Practice:
- Auto-save broke silently and went unnoticed for 17 days
- Built-in alternatives (--resume, LEARNING_LOG, KB files) work fine
- Simpler = more reliable: manual /save + auto-load on start

