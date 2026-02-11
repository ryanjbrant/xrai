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
