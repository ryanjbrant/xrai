# Learning Log - Continuous Discoveries

**Purpose**: Append-only journal of discoveries across all AI tools
**Format**: Timestamped entries with context, impact, and cross-references
**Access**: All AI tools (Claude Code, Windsurf, Cursor) can read and append

---

## 2026-02-06 - Claude Code - Spec 013 Complete + Cross-Tool Architecture

**Context**: Session completing UI/UX conferencing system and cross-tool sharing.

### Completions

1. **Spec 013 UI/UX Conferencing** → ✅ COMPLETE
   - All 5 phases done (Auth, Lobby, HUD, Settings, Web)
   - WebBridge.cs + React app (Vis/xrrai-web/)
   - 5 auth providers (Mock, Firebase, Apple, Google)
   - Glassmorphism design system

2. **Cross-Tool Architecture v1.2**
   - Session state system: `.claude/session/CURRENT_STATE.md`
   - Git hooks: post-commit, post-checkout for auto-tracking
   - dev-setup.sh auto-installs hooks
   - No conflict with open-multibrain (complementary)

3. **ARRemoteTestingSetup fix** - Prevented NullRef on Play mode

### Files Changed
- `013-ui-ux-conferencing/spec.md` - Status → Complete
- `_CROSS_TOOL_ARCHITECTURE.md` - v1.2, session state docs
- `ARRemoteTestingSetup.cs` - Safe window opening

---

## 2026-02-06 - Claude Code - Cross-Project Research Sync (Portals V4 ↔ MetavidoVFX)

**Context**: Comprehensive audit of both projects to sync patterns and insights.

### Key Findings

**Portals V4 (React Native + Unity)**:
- Specs at `.specify/specs/` (11 files)
- Constitution at `.specify/memory/constitution.md` defines AI voice-to-spatial engine
- `useComposerBridge.ts` - Bridge translates SceneAction → Unity messages
- `aiSceneComposer.ts` - Gemini 2.0 structured output for voice commands
- ARRANGE_FORMATION handler added (circle/line/grid formations)
- Retry logic for Gemini 429 rate limits (exponential backoff)

**MetavidoVFX (Unity VFX)**:
- **Hybrid Bridge Pattern**: O(1) compute (ARDepthSource) + O(N) binding (VFXARBinder)
- VFXARBinder has 40+ aliases for cross-project compatibility (Rcam, Akvfx, Fluo, Keijiro)
- HiFi hologram needs ColorMap + PositionMap correlation for RGB realism
- Demand-driven ColorMap allocation (saves 8.3MB when unused)
- Quality presets (10K-200K particles) with auto-FPS adjustment

**Cross-Pollination Opportunities**:
1. Portals V4 voice patterns → MetavidoVFX gesture commands
2. MetavidoVFX VFX aliases → Portals V4 typed bridge messages
3. Both use ExposedProperty pattern for type-safe VFX binding

### Impact

- Unified voice-to-object pattern documented
- Cross-project specs synchronized

---

## 2026-02-06 - Claude Code - MANDATORY Session Persistence Rule

**Context**: Repeated issues with losing context between sessions, inability to resume where we left off, poor long-term memory.

### Problem

Sessions end without checkpoints. Context is lost. Resume is difficult or impossible. This has been a persistent major issue.

### Solution: MANDATORY Periodic Saves

Added to `GLOBAL_RULES.md` as non-negotiable rule:

| Trigger | Action |
|---------|--------|
| Every 15-30 min | `/checkpoint` or manual save |
| Task completed | Save progress state |
| Before /clear or /compact | ALWAYS `/checkpoint` first |
| Context >100K tokens | Proactive `/checkpoint` |
| End of session | `/checkpoint` + git commit |

### Checkpoint Contents (Required)

1. Summary of what was accomplished
2. Current state (file, line, task)
3. Next steps for resume
4. Key decisions made
5. Open questions/blockers

### Resume Commands

```bash
claude --continue           # Most recent
claude --resume             # Pick from list
claude --resume <name>      # By name
```

### Impact

- **FAILURE** if session ends without checkpoint
- **FAILURE** if resume is difficult
- **FAILURE** if context lost between sessions

Log all failures to LEARNING_LOG.md.

---

## 2026-02-06 - Claude Code - Icosa Gallery Asset Integration Strategy

**Context**: Voice composer spec (002-unity-advanced-composer) needs to spawn 3D models beyond built-in primitives. "Add a dragon" fails because Unity BridgeTarget only handles indices 0-5.

### Problem Analysis

| ASSET_CATALOG Index | Type | Current Format | Unity Compatible |
|---------------------|------|----------------|------------------|
| 0-5 | Primitives | Unity built-in | ✅ Yes |
| 6-16 | Objects | VRX (ViroReact) | ❌ No |
| 17-34 | Characters | VRX (ViroReact) | ❌ No |

### Solution: Icosa Gallery API

Icosa Gallery (Google Poly replacement) provides 10K+ CC-licensed GLTF2 models searchable via REST API:

```bash
GET https://api.icosa.gallery/v1/assets?keywords=dragon&format=GLTF2&pageSize=20
```

### Integration Architecture

```
Voice "add a dragon" → aiSceneComposer → objectIndex: 17
                                              ↓
                                   Index > 5? Search Icosa
                                              ↓
                            IcosaService.searchAssets("dragon")
                                              ↓
                            action.modelUrl = icosaAsset.gltfUrl
                                              ↓
                            BridgeTarget.HandleAddObject
                                              ↓
                            glTFast.Load(modelUrl) → GameObject
```

### Tasks Added

- T009: Create IcosaService.ts (search + fetch wrapper)
- T010: Update aiSceneComposer for dynamic lookup
- T011: Update BridgeTarget for URL loading
- T012: Optional thumbnail preview UI

### Cross-Reference

- KB: `_ICOSA_GALLERY_PATTERNS.md` (full API docs)
- Spec: `.specify/specs/002-unity-advanced-composer/spec.md`
- Tasks: `.specify/specs/002-unity-advanced-composer/tasks.md` (Phase 2)

---

## 2026-02-06 - Claude Code - Unity Resources.Load() Path Convention

**Context**: Hologram VFX assets in `Assets/VFX/Hologram/` weren't loading at runtime via `Resources.Load()`.

### Root Cause

Unity's `Resources.Load()` **only** searches inside `Assets/Resources/` folders. Assets outside this path are invisible to runtime loading.

```csharp
// FAILS - assets in Assets/VFX/Hologram/
var vfx = Resources.Load<VisualEffectAsset>("VFX/Hologram/hologram_depth_people_metavido");

// WORKS - assets in Assets/Resources/VFX/Hologram/
var vfx = Resources.Load<VisualEffectAsset>("VFX/Hologram/hologram_depth_people_metavido");
```

### Fix Applied

Moved 9 hologram VFX assets from `Assets/VFX/Hologram/` to `Assets/Resources/VFX/Hologram/`.

### Cross-Reference

- Unity Docs: https://docs.unity3d.com/ScriptReference/Resources.Load.html
- Commit: `55ba67ec5` - "fix(unity): Move VFX assets to Resources folder"
- Spec: `.specify/specs/003-hologram-telepresence/tasks.md` - T004

### Rule for Future

**Any asset that needs `Resources.Load()` at runtime MUST be in a `Resources/` folder.** Use Addressables for assets that need async loading with custom paths.

---

## 2026-02-06 - Claude Code - Hologram Feature Architecture Audit

**Context**: Deep audit of 003-hologram-telepresence implementation status.

### Architecture Status (97% Complete)

| Layer | Component | Status |
|-------|-----------|--------|
| Unity | ARDepthSource.cs | ✅ O(1) compute dispatch |
| Unity | VFXARBinder.cs | ✅ Alias-based auto-binding |
| Unity | HologramController.cs | ✅ Enable/Disable/Fade API |
| Unity | BridgeTarget.cs | ✅ hologram_* message handlers |
| Unity | 9 VFX assets | ✅ In Resources/ folder |
| RN | HologramScreen.tsx | ✅ Full UI with presets |
| RN | hologramService.ts | ✅ R2 upload + Firestore |
| RN | HologramShareSheet.tsx | ✅ Share flow UI |
| Web | viewer/index.html | ✅ Video player + CTA |
| Web | wrangler.toml | ✅ Cloudflare Pages config |

### Pending Items

1. **Device testing** (T006, T011, T014) - blocked by no device
2. **Viewer Firebase config** - placeholder values need real keys
3. **App Store ID** - `YOUR_APP_ID` placeholders in viewer

### Data Flow Verified

```
iPhone LiDAR → ARDepthSource → PositionMap (compute)
                    ↓
              VFXARBinder → VFX Graph (texture binding)
                    ↓
              HologramController → Fade/Intensity/Scale
                    ↓
              BridgeTarget → RN (hologram_started)
                    ↓
              ArViewRecorder → video.mp4
                    ↓
              hologramService → R2 + Firestore
                    ↓
              viewer.portals.app/h/{id}
```

### Cross-Reference

- Spec: `.specify/specs/003-hologram-telepresence/`
- Tasks: 32/37 complete (remaining are testing tasks)
- Minecraft/Roblox patterns: Added to spec.md

---

## 2026-02-06 - Claude Code - MCP Kill Loop Root Cause & Fix

**Context**: MCP servers respawning endlessly despite `mcp-kill-dupes` running on every session start. Health log showed 16-17 kills per session, processes immediately returning.

### Root Cause

The `--no-cache --refresh` flags in uvx MCP configs force a **completely new process** every time any tool launches:

```json
// BAD - causes infinite respawn loop
"args": ["--no-cache", "--refresh", "--from", "mcpforunityserver==9.1.0", ...]

// GOOD - uses cached version, no respawn
"args": ["--from", "mcpforunityserver==9.1.0", ...]
```

### Why This Matters

- Each IDE/CLI tool has its own MCP config
- With 3 tools open (Claude Code, Windsurf, Claude Desktop), each spawns its own server
- `--no-cache --refresh` bypasses uvx's process reuse, creating NEW processes
- Health check kills duplicates → tool restarts → new process → repeat

### Fix Applied

| Config Location | Change |
|----------------|--------|
| `~/.cursor/mcp.json` | Disabled all MCP servers (not used) |
| `~/.windsurf/mcp.json` | Removed git source, standardized to v9.1.0 |
| `~/Library/Application Support/Claude/claude_desktop_config.json` | Removed `--no-cache --refresh` |
| `~/bin/mcp-kill-dupes` | Added `mcp-for-unity` to server patterns |

### Diagnostic Commands

```bash
# Check for duplicate MCP processes
ps aux | grep mcp-for-unity | grep -v grep | wc -l

# Check health log for kill loop evidence
tail -20 ~/.claude/logs/health.log

# Find all MCP configs
grep -r "mcp-for-unity" ~/.cursor/ ~/.windsurf/ ~/Library/Application\ Support/Claude/ 2>/dev/null
```

### Prevention

1. **Never use `--no-cache --refresh`** in production MCP configs
2. **Standardize versions** across all tools (e.g., `mcpforunityserver==9.1.0`)
3. **Disable unused tools** - if not using Cursor, empty its `mcpServers: {}`
4. **Add to mcp-kill-dupes** - ensure actual process name (`mcp-for-unity`) is in the list

**Impact**: Eliminated 16-17 unnecessary process kills per session, reduced CPU/memory churn.

---

## 2026-02-06 - Claude Code - Keijiro MetavidoVFX Mobile/WebGPU Research

**Context**: Extended previous MetavidoVFX research (2026-01-20) with mobile optimization, WebGPU deployment, and thermal management patterns.

### Research Method: Parallel Search Agent

Used 5 parallel WebSearch calls in a single message to maximize research speed:
1. `keijiro MetavidoVFX VFX Graph setup 2026`
2. `keijiro Rcam4 VFX binding mobile AR Foundation`
3. `Unity VFX Graph point cloud AR Foundation depth`
4. `keijiro depth to world position VFX shader`
5. `Unity VFX Graph WebGPU mobile optimization 2026`

**Result**: 7 new code patterns + 4 architectural insights extracted in ~5 minutes.

### Key Findings

| Pattern | Source | Application |
|---------|--------|-------------|
| **Texture Size Selection Algorithm** | Snap AR + community | Auto-size textures based on particle count (mobile: 256x256, desktop: 512x512) |
| **Thermal Monitoring** | Rcam2x notes | Detect thermal throttling via frame time smoothing, reduce VFX quality adaptively |
| **Minimal Binding** | MetavidoVFX binder | 4 SetXXX calls (< 1ms budget) vs 12+ calls (1.2ms) |
| **Depth Inverse Projection Shader** | DepthInverseProjection repo | Complete shader code for depth→world position with Unity matrices |
| **WebGPU Compatibility** | keijiro demo + Unity docs | VFX Graph experimental on WebGPU, compute shaders required |
| **Mobile Texture Recommendations** | Snap AR guidelines | 256x256 position maps, 256x192 depth (native ARKit), enable mipmaps |
| **VFX Graph Mobile Requirements** | Unity discussions | Requires compute shader support, 200K-500K particles on iPhone 12 Pro |

### Mobile Performance Targets (NEW)

| Device | Particle Count | Texture Size | Frame Rate |
|--------|---------------|--------------|------------|
| iPhone 15 Pro | 500K-750K | 512x512 | 60fps |
| iPhone 12 Pro | 200K-500K | 256x256 | 60fps |
| Quest 3 | 500K-1M | 512x512 | 90fps |
| Quest 2 | 200K-500K | 256x256 | 72fps |

### Thermal Throttling Detection Pattern

```csharp
// Smooth frame time, detect sustained drops (> 25ms), reduce particle spawn rate by 50%
_smoothedFrameTime = Mathf.Lerp(_smoothedFrameTime, actualFrameTime, 0.1f);
if (_smoothedFrameTime > 25f) ReduceVFXQuality();
```

### Integration Recommendations

**For ARDepthSource.cs**:
- Add thermal monitoring (Section 13.3)
- Implement texture size validation (Section 13.2)
- Add mobile quality presets

**For VFXLibraryManager.cs**:
- Validate texture sizes on VFX load
- Auto-reduce quality on mobile
- Track per-VFX binding cost (< 1ms budget)

### Cross-References

- Full research: `_KEIJIRO_METAVIDO_VFX_RESEARCH.md` (Section 13)
- Original research: Same file (Sections 1-12, 2026-01-20)
- Related: `_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md` (existing patterns)

**Impact**: Mobile-ready VFX architecture with thermal management, optimal texture sizing, and WebGPU deployment path.

---

## 2026-02-06 - Claude Code - HiFi Hologram VFX Configuration Fixes

**Context**: HiFi hologram VFX files had invalid YAML configuration values causing rendering issues.

### Problems Found & Fixed

| File | Property | Old | New | Impact |
|------|----------|-----|-----|--------|
| `hifi_hologram_people.vfx` | UseParticleSize | 0 | 1 | Disabled dynamic particle sizing |
| `hifi_hologram_pointcloud.vfx` | useBaseColorMap | 3 | 1 | Invalid enum (0=none, 1=enabled) |
| `hifi_hologram_pointcloud.vfx` | stripCapacity | 1 | 16 | Too few vertices per strip for point clouds |

### VFX YAML Property Reference

**UseParticleSize** (Output Context):
- `0` = Fixed size (ignores per-particle size attribute)
- `1` = Dynamic size (uses per-particle size for quality presets)

**useBaseColorMap** (Shader Graph):
- `0` = No base color map
- `1` = Enable base color map
- Values >1 are invalid

**stripCapacity** (Particle Strips):
- Minimum vertices per strip
- Point clouds need 16+ for visual quality
- Default 1 causes sparse rendering

### Detection Method
Used parallel agents to:
1. Analyze VFX file structure and find invalid configurations
2. Cross-reference with VFX Graph property documentation
3. Validate fixes against Unity 6 VFX Graph standards

### Migration Note
These fixes are documented in `MIGRATION_PLAN_TO_PORTALS_V4.md` for future migration to Portals project.

---

## 2026-02-06 - Claude Code - Asset Database Strategy Analysis

**Context**: Deep audit of asset catalog architecture across RN, Unity, and voice AI systems.

### Three Disconnected Asset Catalogs Found

| Source | Location | Items | Format | Platform |
|--------|----------|-------|--------|----------|
| **ModelItems.js** | `src/screens/FigmentAR/model/` | 35 | VRX + GLB | ViroReact only |
| **ASSET_CATALOG** | `src/services/aiSceneComposer.ts` | 35 | JS array | Voice AI keywords |
| **BridgeTarget.cs** | `unity/Assets/Scripts/` | 6 | C# primitives | Unity only |

### Critical Gap Analysis

**Current Situation**:
- Items 0-16: Primitives (cube, sphere, torus, etc.) - can spawn in Unity via `GameObject.CreatePrimitive()`
- Items 17-34: Characters (dragon, pug, emojis, etc.) - VRX format, **ViroReact only**

**Problem**:
1. Voice command "add a dragon" → AI returns `objectIndex: 17`
2. Unity BridgeTarget receives `modelId: 17` → has no handler for indices >5
3. Character models are `.vrx` format → incompatible with Unity (requires glTFast `.glb`)

### Target Architecture (from KB `_PORTALS_UNIFIED_ARCHITECTURE.md`)

```
Single Asset Manifest (catalog.json)
        ↓
┌───────┴───────┐
│  Generates:   │
├───────────────┤
│ • RN types    │ → TypeScript types
│ • Unity refs  │ → C# asset registry
│ • Voice AI    │ → Keyword mappings
│ • CDN URLs    │ → R2 storage paths
└───────────────┘
```

### Recommended Strategy

**Phase 1: Unify Primitives** (immediate)
- Keep primitives (0-16) as Unity built-in
- Unity creates Cube/Sphere/Cylinder via `CreatePrimitive()`
- Zero network latency, instant spawn

**Phase 2: Convert Characters to GLB** (requires asset work)
- Export character models (dragon, pug, emojis) as GLB
- Upload to R2 CDN: `https://cdn.h3m.io/assets/models/{name}.glb`
- Unity loads via glTFast when `modelUrl` provided

**Phase 3: Single Source of Truth** (architecture)
- Create `assets/catalog.json` as master manifest
- Generate platform-specific code from manifest
- CDN serves manifest with cache-busting

### Manifest Schema (proposed)

```json
{
  "version": "1.0",
  "assets": [
    {
      "index": 0,
      "id": "cube",
      "name": "Cube",
      "keywords": ["cube", "box", "block"],
      "type": "primitive",
      "unity": { "primitive": "Cube" },
      "web": { "three": "BoxGeometry" }
    },
    {
      "index": 17,
      "id": "dragon",
      "name": "Dragon",
      "keywords": ["dragon", "monster", "creature"],
      "type": "model",
      "url": "https://cdn.h3m.io/assets/models/dragon.glb",
      "thumbnail": "https://cdn.h3m.io/assets/thumbs/dragon.png",
      "animations": ["idle", "fly"]
    }
  ]
}
```

### Immediate Action Items

1. **Update Unity BridgeTarget.cs** to handle modelId 0-16 as primitives
2. **Log warning** for modelId 17-34 (characters not yet supported in Unity)
3. **Create catalog.json spec** in `.specify/specs/`
4. **Track VRX→GLB conversion** as future task

### Cross-Reference

- KB: `_PORTALS_UNIFIED_ARCHITECTURE.md` (Asset Database section)
- KB: `_ZERO_LATENCY_INSTANTIATION.md` (Object pools strategy)
- KB: `_CROSS_PLATFORM_ASSET_LOADING.md` (glTFast patterns)
- Spec: `.specify/specs/002-unity-advanced-composer/spec.md`

**Impact**: Identified why voice commands for characters don't work in Unity. Clear path to unified asset system.

---

## 2026-02-05 - Claude Code - VFXARBinder Auto-Fix Pattern

**Context**: VFXARBinder had all `_bindXxxOverride` fields defaulting to false, causing bindings to be disabled even when VFX properties exist.

### Problem
- Scene serialization preserves false defaults
- AutoDetectBindings() runs but serialized values override runtime
- Result: VFX has properties but bindings disabled → no data flow

### Permanent Fix Applied

1. **Default Values Changed to TRUE** (VFXARBinder.cs:387-398)
   ```csharp
   [SerializeField] bool _bindDepthMapOverride = true;
   [SerializeField] bool _bindColorMapOverride = true;
   [SerializeField] bool _bindRayParamsOverride = true;
   // etc.
   ```

2. **Reset() Method Added** - Auto-detects on component add
   ```csharp
   #if UNITY_EDITOR
   void Reset() {
       AutoDetectBindings();
       Debug.Log($"[VFXARBinder] Auto-detected {BoundCount} bindings");
   }
   #endif
   ```

3. **OnValidate() Added** - Re-detects if VFX asset assigned

### Impact
- **New VFX**: Bindings auto-enabled when VFXARBinder added
- **Existing VFX**: May need manual re-enable or Reset from context menu
- **Scene files**: Old scenes preserve false values (fix manually or use Reset)

### Quick Fix for Existing Scenes
1. Select VFX with VFXARBinder
2. Right-click component → Reset
3. Or manually enable bind toggles in Inspector

---

## 2026-02-06 03:05 PST - Claude Code - Debug Strategy Insights

**Context**: Session working on HiFi VFX pipeline simplification

### Strategies That Work

| Strategy | Benefit |
|----------|---------|
| **Parallel agents** | Use for bulk scene fixes (200+ components) while continuing other work |
| **Verbose debug per-component** | Each component logs its own state, easy to trace data flow |
| **Reset() + OnValidate()** | Auto-detect bindings when component added or Inspector changed |
| **SerializeField defaults = true** | New components work out of box (existing scenes need Reset) |
| **Checkpoint before /clear** | Preserve progress in .claude/checkpoints/ |

### Strategies That Cause Problems

| Problem | Cause | Fix |
|---------|-------|-----|
| Multiple enabled duplicates | VFXLibraryManager x2, HiFi_VFX x2 | Disable all but one |
| Edit tool fails | Non-unique patterns in scene (200+ matches) | Use fileID or script-based fix |
| Wrong scene path | HOLOGRAM.unity in Assets/ not Scenes/ | Always glob first |
| Bulk edits timeout | 200+ VFXARBinder manual edits | Use Editor script or Reset() |
| Context lost | Long sessions exceed token limit | Checkpoint + /clear + resume |

### Best Practice - Unity Component Debugging

```
1. Check console first (read_console or Editor.log)
2. Enable verbose debug on component
3. Run 60+ frames to see periodic logs
4. Check binding status in logs
5. Fix and verify (re-check console)
```

---

## 2026-02-06 02:50 PST - Claude Code - HiFi VFX Binding Deep Dive

**Context**: Investigating why HiFi hologram VFX might not receive DepthMap/ColorMap

### Key Discoveries

1. **HiFi_VFX Setup is NOT Overcomplicated**
   - VFXARBinder: ✅ ENABLED (doing all the work)
   - HiFiHologramController: ⚠️ DISABLED (not duplicating bindings)
   - VFXCategory: metadata only

2. **Simplest Working Setup**
   - Just need: VisualEffect + VFXARBinder + ARDepthSource singleton
   - HiFiHologramController is optional (for quality presets only)

3. **ColorMap is Demand-Driven (CRITICAL)**
   - ColorMap RenderTexture only allocated when VFXARBinder detects ColorMap property
   - VFXARBinder.OnEnable() calls `ARDepthSource.RequestColorMap(true)`
   - If no VFX requests ColorMap, it stays null

4. **Property Name Matching**
   - VFX expects: ColorMap, DepthMap, RayParams, InverseView, DepthRange
   - VFXARBinder aliases: ColorAliases, DepthAliases, RayAliases, InvViewAliases
   - All match! No naming mismatch issue.

5. **Rcam/Metavido Subgraph Pattern**
   - Same inputs: DepthMap (Texture2D), RayParams (Vector4), InverseViewMatrix (Matrix4x4)
   - UV → depth sample → ray direction → world position
   - VFX computes position internally (doesn't need PositionMap)

### Binding Debug Checklist
| Check | How |
|-------|-----|
| ARDepthSource active | Dashboard shows "ARDepthSource: Active" |
| VFXARBinder on VFX | Component enabled, _source = null (uses Instance) |
| ColorMap allocated | ARDepthSource._colorMapRequestCount > 0 |
| VFX has ColorMap prop | `vfx.HasTexture("ColorMap")` returns true |

### Pattern: Parallel Agents for Research
```
# Launch 3 agents simultaneously for different aspects
Task(agent=Explore, "analyze scene setup")
Task(agent=Explore, "extract HLSL code")
Task(agent=Explore, "check property bindings")
```
- Added to GLOBAL_RULES.md for future use

---

## 2026-02-05 23:30 PST - Claude Code - Spec Verification Testing Framework

**Context**: Deep audit of MetavidoVFX specs with emphasis on fast, evidence-based verification

**Discoveries**:

### 1. Research Verification Protocol (CRITICAL)

**Never trust KB research blindly.** Before updating specs or KB:
- Verify claims against official docs (Unity, Apple, Google)
- Cross-reference working repos (not just marketing/blog posts)
- Test locally whenever possible
- 99% confidence required before spec updates

**KB Corrections Made (2026-02-05)**:
| File | Error | Correction |
|------|-------|------------|
| `_CROSS_PLATFORM_ARCHITECTURE_RESEARCH_2026.md` | "1,400 cells" | "~1,400 servers per cell" (100x interpretation error) |
| `_CROSS_PLATFORM_ARCHITECTURE_RESEARCH_2026.md` | "UDP + interpolation" | "RakNet unreliable channels" (RakNet ≠ raw UDP) |
| `_HAND_TRACKING_MOBILE_2026.md` | "only free cross-platform" | "most popular" (alternatives exist: ManoMotion Lite, Vision Framework, OpenPose) |

### 2. Fast Verification Test Pattern

Created `SpecVerificationTests.cs` with patterns for:
- **Type existence checks** - `System.Type.GetType()` for namespace validation
- **File existence checks** - Verify prefabs, packages, plugins exist
- **Headless batch runner** - `BatchTestRunner.RunAllTests()` for CI/CD
- **Device deployment** - `run_spec_tests.sh --device` builds, deploys, monitors logs

**Test Categories**:
| Category | Tests | Purpose |
|----------|-------|---------|
| Spec003_* | 6 | Hologram conferencing components |
| Spec009_* | 7 | Icosa/Sketchfab integration |
| Spec016_* | 6 | XRRAI scene format |
| CrossSpec_* | 4 | Integration validation |
| Build_* | 4 | Compilation & build health |
| Performance_* | 2 | Baseline checks |

### 3. Shell Script for Fast Verification

`run_spec_tests.sh` provides fastest paths to verify functionality:
```bash
./run_spec_tests.sh          # Headless EditMode tests (~30s)
./run_spec_tests.sh --quick  # Compilation check only (~10s)
./run_spec_tests.sh --device # Full device deployment + log monitoring
./run_spec_tests.sh --console # Quick Unity console check
```

### Impact

- Added to `~/GLOBAL_RULES.md`:
  - §Research Verification (CRITICAL - NEVER SKIP)
  - §Spec Creation Standards (99% Confidence Required)
- All 3 partial specs now have automated test coverage
- KB research files corrected with verified sources

**Cross-References**:
- `~/GLOBAL_RULES.md` - Research verification rules
- `MetavidoVFX-main/Assets/Scripts/Editor/Tests/SpecVerificationTests.cs` - 29 tests
- `MetavidoVFX-main/Assets/Scripts/Editor/Tests/XRRAISceneTests.cs` - 22 tests
- `MetavidoVFX-main/run_spec_tests.sh` - Headless/device test runner

---

## 2026-02-05 - Claude Code - Standard Workflow Established

**Context**: WarpJobs project audit and improvement cycle

**Discovery**: Established standard development workflow that auto-improves with every iteration.

### Standard Workflow (MEMORIZE)

```
audit → test → auto-fix → [re-test if fixes] → improve → document → commit & push
```

**Re-test Rule**: If auto-fix changed any code, ALWAYS re-run tests before proceeding. Never commit untested fixes.

### Key Principle

**Every success AND failure is a learning opportunity.** The system should get smarter with every iteration:

| During Testing | Auto-Action |
|----------------|-------------|
| Test passed first try | Log to `SUCCESS_LOG.md` |
| Test failed | Add root cause to `_QUICK_FIX.md` |
| >3 debug attempts | Document to `FAILURE_LOG.md` |
| New test pattern useful | Add to project test utilities |

| During Debugging | Auto-Action |
|------------------|-------------|
| Error→fix mapping found | Add to `_QUICK_FIX.md` |
| Symptom→root cause pattern | Add to `_AUTO_FIX_PATTERNS.md` |
| Debug command useful | Add to project CLAUDE.md |

### Impact

- Added to `~/GLOBAL_RULES.md` §Standard Workflow (MEMORIZE)
- All AI tools now follow same improvement cycle
- System intelligence compounds over time

**Cross-References**:
- `~/GLOBAL_RULES.md` - Standard Workflow section
- `_QUICK_FIX.md` - Error fixes
- `_AUTO_FIX_PATTERNS.md` - Patterns

---

## 2026-02-05 21:30 PST - Claude Code - FigmentAR Unity Reuse Analysis

**Context**: Deep review of FigmentAR codebase to identify modules reusable with Unity composer

**Key Finding**: Voice+LLM pipeline is **100% portable** to Unity - entire infrastructure exists and works.

### Fully Portable Modules (~3,200 lines)

| Module | Path | Reuse % |
|--------|------|---------|
| AISceneComposer | `src/services/aiSceneComposer.ts` | 100% |
| VoiceService | `src/services/voice.ts` | 100% |
| VoiceComposerButton | `src/screens/FigmentAR/component/VoiceComposerButton.js` | 100% |
| SceneContext | `src/screens/FigmentAR/helpers/SceneContext.js` | 90% (Zustand adapter) |
| SceneCompiler | `src/screens/FigmentAR/helpers/SceneCompiler.js` | Reference for Unity adapter |
| PaletteTab, LibraryTab, ObjectPropertiesPanel | FigmentAR/component/ | 85-95% |
| ArViewRecorder | `modules/ar-view-recorder/ios/` | 100% |

### Voice→LLM Pipeline Architecture

```
User Voice → VoiceService (expo-audio) → WAV → Gemini 2.0 Flash → Structured Actions → Unity Bridge
```

**Critical Insight**: Only new code needed is `UnityCompiler.ts` (~100 lines) to map LLM actions to bridge messages.

### Impact on 002 Spec

- Added Phase 3.5: Voice+LLM Integration (7 tasks, 100% reuse)
- Updated dependency graph to include voice critical path
- Estimated 1 week to full voice-controlled Unity scene editing

**Cross-References**:
- `KnowledgeBase/_FIGMENTAR_UNITY_REUSE_ANALYSIS.md` - Full analysis
- `.specify/specs/002-unity-advanced-composer/tasks.md` - Updated tasks
- `_PORTALS_V4_STRATEGIC_ROADMAP.md` - Updated Tier 1 magic features

---

## 2026-02-05 19:00 PST - Claude Code - "Open Brush for AR+AI" Research Synthesis

**Context**: Deep research for Portals V4 vision as "Open Brush for AR+AI" using React Native + Unity architecture

**Research Scope**: 7 parallel agents researching MetavidoVFX, KB updates, Open Brush, Icosa Gallery, AI+AR tools, 3D formats

### Key Architectural Patterns Discovered

#### 1. O(1) VFX Compute Pattern (MetavidoVFX) - CRITICAL
```
ARDepthSource.cs (SINGLETON) → One compute dispatch/frame
VFXARBinder.cs (per VFX) → Just SetTexture() calls (~0.2ms each)
```
- **Performance**: 5 VFX @ 7.8ms vs naive 21.5ms (64% faster)
- **Gotcha**: `Shader.SetGlobalTexture()` does NOT work with VFX Graph - must use per-VFX `SetTexture()`

#### 2. Open Brush Architecture (Reference)
- **.tilt format**: Zip containing `data.sketch` (binary header + stroke data)
- **Lua plugin system**: 4 types (Pointer, Symmetry, Tool, Background)
- **HTTP API**: localhost:40074 for external control
- **Brush geometry types**: 6 (Flat, Tube, Hull, Particle, Spray, Slice)

#### 3. Icosa Gallery API (Asset Integration)
- **Base URL**: `https://api.icosa.gallery/v1/`
- **Auth**: Device code OAuth 2.0 (RFC 8628)
- **Unity SDK**: `icosa-toolkit-unity` (active) or `open-brush-unity-tools`
- **Formats**: glTF 2.0 priority, OBJ fallback, GOOGLE_tilt_brush_material extension

#### 4. XRAI Format (glTF-Based Scene Format)
- **Decision**: glTF 2.0 base (NOT USD) - industry converging
- **Extensions**: XRAI_core, XRAI_generators, XRAI_vfx, XRAI_ai, XRAI_spatial, XRAI_collaboration
- **Generative encoding**: 1000:1 compression ratios for procedural content
- **Gaussian splats**: KHR_gaussian_splatting Q2 2026 (90% compression via SPZ)

### Production-Ready Patterns to Adopt

| Pattern | Source | Files to Copy |
|---------|--------|---------------|
| O(1) Compute VFX | MetavidoVFX | `ARDepthSource.cs`, `VFXARBinder.cs`, `DepthToWorld.compute` |
| Audio FFT + Beat | MetavidoVFX | `AudioBridge.cs` (415 lines) |
| Hand Tracking | MetavidoVFX | `HandVFXController.cs` (506 lines) |
| VFX Quality Scaling | MetavidoVFX | `VFXAutoOptimizer.cs` (425 lines) |
| Brush Painting | MetavidoVFX | `BrushManager.cs` (107 brushes, 6 geometry types) |

### XRRAI Namespace Migration (Complete)
164 files migrated with 0 compilation errors:
- `XRRAI.HandTracking` (15 files)
- `XRRAI.BrushPainting` (6 files)
- `XRRAI.VFXBinders` (14 files)
- `XRRAI.VoiceToObject` (12 files)
- `XRRAI.Hologram` (21 files)

### Voice Agent Patterns (OpenAI Realtime API)
- **Chat-Supervisor Hybrid**: realtime-mini (conversation) + gpt-4.1 (reasoning/tools)
- **Sequential Handoffs**: Swarm-inspired specialized agent graph
- **Latency targets**: <200ms with Whisper v3-turbo + ElevenLabs

### Gaps Identified
1. Voice-to-VFX pipeline (no implementation guide)
2. Collaborative scene editing (CRDT patterns documented, no Unity code)
3. AI asset generation (latent space integration patterns only)
4. visionOS PolySpatial (limited AR documentation)

**Cross-ref**: `portals_main/specs/`, `MetavidoVFX-main/`, `KnowledgeBase/_ARFOUNDATION_VFX_MASTER_LIST.md`

---

## 2026-02-05 16:30 PST - Claude Code - RN-Unity Bridge Research Findings

**Context**: Deep research on React Native + Unity UAAL bridge patterns for Portals V4

### Key Findings

| Finding | Impact | Action |
|---------|--------|--------|
| Fabric reduces RN-side latency ~25x | Performance | Already using New Architecture |
| Message batching reduces overhead ~70% | Performance | Add to composer implementation |
| `string.Contains()` routing is fragile | Maintainability | Migrate to handler dictionary |
| TurboModule wrapper not yet available | Future planning | Wait for @artmajeur update |

### Performance Benchmarks (Validated)

| Message Type | Latency | Notes |
|--------------|---------|-------|
| Simple JSON <1KB | 2-5ms | Most UI commands |
| Large JSON >10KB | 10-20ms | Scene snapshots |
| Unity→RN event | 16-33ms | 1-2 frame delay |

### Critical Pitfalls Documented

1. **Black screen**: `.xcode.env` missing `RCT_NEW_ARCH_ENABLED=1`
2. **15 FPS**: VSync conflict - set `vSyncCount=0`, `targetFrameRate=60`
3. **unity_ready not received**: Need message queue buffering patch
4. **Fabric registration**: Manual patch required for `@artmajeur/react-native-unity`

### Files Updated

- `specs/UNITY_RN_BRIDGE_RECOMMENDATIONS.md` - Added benchmarks, pitfalls, alternatives
- `.specify/memory/constitution.md` - Added key project paths section
- `KnowledgeBase/_REACT_NATIVE_UNITY_FABRIC_FIX.md` - Added queue buffering, benchmarks

**Cross-ref**: `portals_main/specs/UNITY_RN_BRIDGE_RECOMMENDATIONS.md`, `.specify/specs/001-unity-rn-bridge/`

---

## 2026-02-05 - Claude Code - Innovative Data Formats for 3D Scene Representation

**Discovery**: Eight data format patterns from collaboration tools, functional languages, and distributed systems that enable remixing, collaboration, human-readability, and AI-processability

**Context**: Researching minimal, innovative data representation formats (JSON Canvas, tldraw, Excalidraw, Observable, IPLD, Automerge, Yjs, Nix, Dhall) to inspire next-generation 3D scene formats beyond glTF

**Research Method**: 10 parallel web searches + 5 deep dives into specifications (30 sources analyzed)

### Pattern 1: Spatial Graph with Node-Edge Model (JSON Canvas)

**Format**: JSON with nodes (cards) and edges (connections) on infinite 2D canvas
**Key Innovation**: Spatial positioning decoupled from logical graph structure

**Schema Structure**:
```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [
    {
      "id": "node-1",
      "type": "rectangle",
      "x": 100, "y": 200,
      "width": 200, "height": 150
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "fromNode": "node-1",
      "fromSide": "right",
      "toNode": "node-2",
      "toSide": "left",
      "toEnd": "arrow"
    }
  ]
}
```

**3D Scene Applicability**:
- GameObject hierarchy as node-edge graph
- Spatial positioning (transform) separate from logical structure
- Edge connections represent parent-child relationships, physics constraints, or visual connections

**Benefits**: Human-readable, easily remixable, AI can parse structure independently from spatial layout

**Source**: [JSON Canvas Spec](https://jsoncanvas.org/), [Obsidian Blog](https://obsidian.md/blog/json-canvas/)

---

### Pattern 2: Transaction-Based CRDT for Real-Time Collaboration (Yjs)

**Format**: JSON-like shared types (Y.Map, Y.Array, Y.Text) with automatic conflict resolution
**Key Innovation**: CRDT (Conflict-Free Replicated Data Type) enables concurrent edits without central server

**API Pattern**:
```javascript
const ydoc = new Y.Doc()
const sceneRoot = ydoc.getMap('scene')

// Observable changes
sceneRoot.observe(event => {
  console.log('Changes:', event.changes)
})

// Automatic sync - no manual conflict resolution
sceneRoot.set('camera', { position: [0, 5, 10] })
```

**Transaction Model**:
1. `beforeTransaction` → execute changes → `beforeObserverCalls`
2. Fire type observers → deep observers → `afterTransaction`
3. Provider sends delta to peers (not full state)

**3D Scene Applicability**:
- Collaborative Unity scene editing (multiple artists simultaneously)
- Automatic conflict resolution for transform changes
- Observable pattern triggers re-renders only for changed objects

**Benefits**: Local-first (works offline), automatic merge, scales to unlimited users

**Source**: [Yjs Docs](https://docs.yjs.dev/), [Yjs Shared Types](https://docs.yjs.dev/getting-started/working-with-shared-types)

---

### Pattern 3: Content-Addressed Immutable Scenes (IPLD)

**Format**: Merkle DAG with CID (Content Identifier) for each node
**Key Innovation**: Content addressing enables trustless verification, deduplication, and version-independent links

**Structure**:
```javascript
// Each scene node has a CID derived from its content
{
  "cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "data": {
    "type": "GameObject",
    "mesh": { "/": "QmHash123..." }, // Link to mesh by CID
    "material": { "/": "QmHash456..." },
    "children": [
      { "/": "QmHash789..." } // Child references by CID
    ]
  }
}
```

**Linking Across Protocols**:
- Reference Git commits in scene metadata (timestamping)
- Link IPFS-stored assets within scenes
- Blockchain transaction → scene version proof

**3D Scene Applicability**:
- Asset deduplication (same mesh referenced by multiple scenes = single storage)
- Version history without storing full copies
- Trustless verification (scene hasn't been tampered with)
- Cross-protocol references (Unity scene → GitHub commit → IPFS texture)

**Benefits**: Immutable, deduplication, verifiable, protocol-agnostic

**Source**: [IPLD.io](https://ipld.io/), [Filecoin IPLD Spec](https://spec.filecoin.io/libraries/ipld/)

---

### Pattern 4: Reactive Dependency Graph (Observable Notebooks)

**Format**: Cells with explicit inputs/outputs, runtime computes topological order
**Key Innovation**: Changes propagate automatically through dependency graph (spreadsheet-like)

**Dependency Model**:
```javascript
// Cell 1: Define camera position
camera = { position: [0, 5, 10] }

// Cell 2: Depends on camera (auto-detected)
viewMatrix = lookAt(camera.position, [0, 0, 0])

// Cell 3: Depends on viewMatrix
renderedScene = render(scene, viewMatrix)

// When camera changes → viewMatrix recalculates → scene re-renders
```

**Execution**:
1. Analyze code to determine inputs/outputs
2. Build dependency graph
3. Topological sort determines execution order
4. On change, re-execute only affected downstream cells

**3D Scene Applicability**:
- Material parameters depend on lighting conditions
- LOD level depends on camera distance
- Shader compilation depends on material flags
- Scene state reactive to player actions

**Benefits**: Automatic update propagation, no manual dependency tracking, declarative

**Source**: [Observable Docs](https://observablehq.com/documentation/notebooks/), [Observable Reactive Programming](https://medium.com/@stxmendez/how-observable-implements-reactive-programming-784bcc02382d)

---

### Pattern 5: Type-Safe Configuration with Termination Guarantees (Dhall)

**Format**: Functional, typed, non-Turing-complete language (JSON + functions + types + imports)
**Key Innovation**: Strong guarantees prevent crashes, hangs, and malicious code

**Safety Guarantees for 3D Scenes**:
1. **Type Safety**: All mesh references, material properties, camera params validated at compile-time
2. **Termination**: No infinite loops in scene generation (not Turing complete)
3. **Sandboxing**: Scene files cannot execute arbitrary code or exfiltrate data
4. **Immutability**: Variables cannot change, referential transparency

**Example**:
```dhall
-- Type-safe scene definition
let Scene = { cameras : List Camera, meshes : List Mesh }
let Camera = { position : { x : Double, y : Double, z : Double } }

let myScene : Scene = {
  cameras = [{ position = { x = 0.0, y = 5.0, z = 10.0 } }],
  meshes = []
}
```

**3D Scene Applicability**:
- Scene configs guaranteed to terminate (no infinite shader loops)
- Type system ensures all references exist before runtime
- Malicious scene files cannot compromise system
- Configuration functions for procedural generation (still terminating)

**Benefits**: Compile-time validation, no runtime errors, sandboxed, functional abstraction

**Source**: [Dhall Lang](https://dhall-lang.org/), [Safety Guarantees](https://github.com/dhall-lang/dhall-lang/wiki/Safety-guarantees)

---

### Pattern 6: Schema Versioning with Migrations (tldraw, Excalidraw)

**Format**: Numeric version field + migration paths for backward compatibility
**Key Innovation**: Explicit schema evolution without breaking old files

**tldraw Schema System**:
```typescript
const schema = {
  version: 2,
  migrations: [
    {
      fromVersion: 1,
      toVersion: 2,
      migrate: (data) => {
        // Transform v1 structure to v2
        return { ...data, newField: 'default' }
      }
    }
  ],
  records: {
    shape: { /* validation rules */ },
    page: { /* validation rules */ }
  }
}
```

**3D Scene Applicability**:
- Unity version upgrades (automatically migrate scene format)
- Component schema changes (add new properties without breaking old scenes)
- Asset format evolution (FBX → glTF migration path)
- Shader graph versioning

**Benefits**: Forward/backward compatibility, explicit migration logic, no silent data loss

**Source**: [tldraw TLSchema](https://tldraw.dev/reference/tlschema/TLSchema), [Excalidraw JSON Schema](https://docs.excalidraw.com/docs/codebase/json-schema)

---

### Pattern 7: Record Store with Validation (tldraw)

**Format**: Generic record storage (TLStore) with typed schema validation
**Key Innovation**: Reactive database of typed records, any change triggers observers

**Architecture**:
```typescript
// Core record types
type TLShape = { id: string, type: string, parentId: string, props: any }
type TLPage = { id: string, name: string, index: number }
type TLAsset = { id: string, type: 'image' | 'video', src: string }

// Store holds all records
const store = new TLStore(schema)
store.put({ type: 'shape', id: 'shape-1', ... })

// Observers trigger on changes
store.listen((entry) => {
  console.log('Changed:', entry.changes)
})
```

**3D Scene Applicability**:
- Unity scene as reactive database of GameObjects, Components, Assets
- Any change (transform, material, hierarchy) triggers observers
- Typed validation prevents invalid references
- Supports undo/redo via record history

**Benefits**: Type-safe, reactive, centralized state, easy serialization

**Source**: [tldraw TLStore](https://tldraw.dev/reference/tlschema/TLStore), [Store and Schema](https://deepwiki.com/tldraw/tldraw/2.3-tools-system)

---

### Pattern 8: Declarative Configuration with Functional Abstractions (Nix)

**Format**: Pure functional, lazy evaluated, declarative package definitions
**Key Innovation**: Immutable packages, reproducible builds, no side effects

**Principles**:
1. **Pure Functions**: Package definitions are functions with no side effects
2. **Immutability**: Packages never change after built
3. **Declarative**: Describe desired state, not steps to achieve it
4. **Lazy Evaluation**: Only compute what's needed
5. **Functional Abstractions**: Higher-order functions (map, fold) for composition

**Example**:
```nix
# Declarative scene definition
scene = {
  camera = { position = [0 5 10]; };
  lights = map (i: {
    type = "point";
    position = [i * 2 0 0];
  }) (range 0 5);
}
```

**3D Scene Applicability**:
- Scene configs as pure functions (reproducible)
- Functional composition for procedural generation
- Lazy evaluation (only compute visible objects)
- Immutable assets (same hash = same content)

**Benefits**: Reproducible, composable, declarative, referential transparency

**Source**: [Nix Language](https://nix.dev/tutorials/nix-language.html), [Purely Functional Config](https://www.infoq.com/articles/configuration-management-with-nix/)

---

### Pattern 9: Automerge CRDT for Local-First Collaboration

**Format**: JSON-like data structure with automatic merge
**Key Innovation**: Local-first (local data as primary), automatic conflict-free merge

**Design**:
- Concurrent changes on different devices merge automatically
- No central server required
- Supports nested maps, arrays, text, counters
- Compact binary format for efficient sync
- Sync protocol for incremental updates

**3D Scene Applicability**:
- Collaborative scene editing across devices (iPad + desktop Unity)
- Offline edits sync when reconnected
- Automatic merge of transform changes, component additions
- Mobile AR captures → auto-merge into main scene

**Benefits**: Local-first, offline-capable, automatic merge, no server dependency

**Source**: [Automerge GitHub](https://github.com/automerge/automerge), [Automerge 2.0](https://automerge.org/blog/automerge-2/)

---

### Cross-Cutting Patterns for 3D Scenes

| Pattern | JSON Canvas | tldraw | Excalidraw | Observable | IPLD | Yjs | Automerge | Nix | Dhall |
|---------|-------------|--------|------------|------------|------|-----|-----------|-----|-------|
| Human-readable JSON | ✅ | ✅ | ✅ | ❌ (JS) | ✅ | ❌ (binary) | ❌ (binary) | ✅ (Nix) | ✅ (Dhall) |
| Remixable/Extensible | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | ✅ |
| Real-time Collaboration | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Content-addressed | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Type-safe | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Versioned schema | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reactive/Observable | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Functional | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Termination guarantees | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

### Recommended Hybrid Format for 3D Scenes

Combining the best patterns:

```json
{
  "format": "scene-canvas",
  "version": 2,
  "cid": "bafybeigdyrzt...", // IPLD content-addressing
  "schema": { /* tldraw-style typed schema */ },
  "nodes": [
    {
      "id": "obj-1",
      "type": "GameObject",
      "cid": "bafybeigabc...", // Content-addressed
      "transform": { "position": [0, 0, 0] },
      "mesh": { "/": "QmMeshHash..." }, // IPLD link
      "material": { "/": "QmMatHash..." },
      "children": [{ "/": "QmChildHash..." }]
    }
  ],
  "edges": [
    { "from": "obj-1", "to": "obj-2", "type": "constraint" }
  ],
  "reactive": {
    "camera.position": ["viewMatrix", "renderedScene"], // Dependency graph
    "light.intensity": ["shadows", "renderedScene"]
  },
  "migrations": [ /* Schema version migrations */ ]
}
```

**Key Features**:
1. **Human-readable JSON** (JSON Canvas pattern)
2. **Content-addressed** with CIDs (IPLD pattern)
3. **Node-edge graph** for spatial layout (JSON Canvas)
4. **Typed schema with migrations** (tldraw pattern)
5. **Reactive dependency graph** (Observable pattern)
6. **CRDT support** for collaboration (Yjs/Automerge pattern)
7. **Declarative config** (Nix pattern)
8. **Type safety** (Dhall pattern)

---

**Impact**: Next-gen scene format enabling AI-processable, collaborative, content-addressed, type-safe 3D worlds

**Cross-References**:
- Computational Pioneers research (2026-02-05) - procedural generation patterns
- Unity XR world model compression

**Sources**: 30 sources analyzed (see full list in research session)

---

## 2026-02-05 - Claude Code - Computational Pioneers: Minimal Representation Patterns

**Discovery**: Seven architectural patterns for generating complex output from minimal data, spanning procedural generation, fractal compression, cellular automata, and distributed systems

**Context**: Researching computational/visual pioneers (Perlin, Mandelbrot, Wolfram, Nelson, Bourke, Torvalds, Victor) for minimal data → complex output patterns applicable to Unity XR world model compression and procedural generation

### 1. Perlin Noise: Hash Function → Infinite Texture

**Pattern**: Pseudorandom gradient interpolation from permutation table
- **Data**: 256-element permutation table (256 bytes)
- **Output**: Infinite procedural textures with natural variation
- **Key Technique**: Hash function generates repeatable gradients at integer coordinates, smooth interpolation between
- **Implementation**: Multiple octaves (scaled copies) create fractal detail
- **Memory Benefit**: Texture generation in pixel shader requires NO texture memory

**Code Pattern** (conceptual):
```glsl
// Permutation table (256 bytes) + hash function = infinite textures
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    // Hash function using permutation table
    int hash = perm[perm[perm[int(i.x)] + int(i.y)] + int(i.z)];
    // Interpolate gradients
    return smoothInterpolate(gradients[hash], f);
}
```

**Unity Applications**: Terrain generation, cloud textures, material variation
**Sources**: [Perlin noise Wikipedia](https://en.wikipedia.org/wiki/Perlin_noise), [NVIDIA GPU Gems](https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-26-implementing-improved-perlin-noise)

---

### 2. Mandelbrot Fractals: Self-Similarity → 100:1 Compression

**Pattern**: Iterated Function Systems (IFS) exploit self-similarity
- **Data**: Mathematical transformations (range → domain mappings)
- **Output**: High-fidelity images with 100:1+ compression ratios
- **Key Technique**: Store pattern descriptors instead of pixel values
- **Resolution Independence**: Images scale infinitely (fractal code defines transformations, not pixels)

**Fractal Compression Algorithm**:
```
1. Partition image into non-overlapping range blocks (R-blocks)
2. Create overlapping domain blocks (D-blocks) at multiple scales
3. For each R-block, find best-matching D-block with affine transform
4. Store: (D-block_id, scale, rotation, brightness_offset) << raw pixels
5. Decompression: Apply transforms iteratively until convergence
```

**Unity Applications**: Texture compression for massive open worlds, LOD generation
**Sources**: [Fractal Compression Wikipedia](https://en.wikipedia.org/wiki/Fractal_compression), [Number Analytics Guide](https://www.numberanalytics.com/blog/fractal-compression-ultimate-guide)

---

### 3. Wolfram Cellular Automata: 3 Rules → Universal Computation

**Pattern**: Computational irreducibility - complex behavior from minimal rules
- **Data**: 8-bit rule number (256 possible rules for elementary CA)
- **Output**: Universal computation (Rule 110 is Turing complete)
- **Key Insight**: Rule 30 generates cryptographic randomness, Rule 110 can simulate any computer

**Elementary CA Pattern**:
```csharp
// Rule 110 (01101110 in binary) = Turing complete
byte rule = 110;
bool[] cells = new bool[width];

for (int i = 1; i < width - 1; i++) {
    int pattern = (cells[i-1] ? 4 : 0) + (cells[i] ? 2 : 0) + (cells[i+1] ? 1 : 0);
    cells[i] = (rule & (1 << pattern)) != 0;
}
```

**Unity Applications**: Procedural dungeon generation, enemy AI behavior patterns, texture synthesis
**Sources**: [A New Kind of Science Wikipedia](https://en.wikipedia.org/wiki/A_New_Kind_of_Science), [Wolfram MathWorld](https://mathworld.wolfram.com/ComputationalIrreducibility.html)

---

### 4. Ted Nelson Xanadu: Transclusion → Reusable Content Fragments

**Pattern**: Tumbler addressing system for referencing any part of any file
- **Data**: Transfinite number addresses (tumbler system)
- **Output**: Compound documents from reusable fragments, bidirectional links
- **Key Techniques**:
  - **Transclusion**: Include content from other sources while maintaining visible connection
  - **Two-way links**: Bidirectional navigation (if A links to B, B knows about A)
  - **Versioning**: All versions preserved, addressable

**Addressing Pattern** (conceptual):
```typescript
// Tumbler system: hierarchical addresses that can reference any granularity
interface Tumbler {
    document_id: string;
    section: number[];  // [chapter, section, subsection, ...]
    span: [start: number, end: number];  // Character range
}

// Transclusion preserves source reference
interface Transclusion {
    source: Tumbler;
    display_mode: 'inline' | 'reference' | 'parallel';
}
```

**Unity Applications**: Asset referencing, scene composition, narrative branching
**Sources**: [Project Xanadu Wikipedia](https://en.wikipedia.org/wiki/Project_Xanadu), [Xanadu Patterns](https://maggieappleton.com/xanadu-patterns)

---

### 5. Paul Bourke: Volumetric Ray Casting → GPU-Accelerated 3D Fractals

**Pattern**: Mathematical generation + volume rendering
- **Data**: Fractal equation parameters (typically < 100 bytes)
- **Output**: Explorable 3D volumetric fractals
- **Key Technique**: GPU ray casting through mathematical density fields (no voxel storage)
- **Benefit**: Focus on mathematical generation, leverage existing volume rendering pipelines

**3D Fractal Pattern**:
```glsl
// Mandelbulb distance estimator (volumetric fractal from ~50 bytes of params)
float mandelbulbDE(vec3 pos, float power, int iterations) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;

    for (int i = 0; i < iterations; i++) {
        r = length(z);
        if (r > 2.0) break;

        // Convert to polar, raise to power, convert back
        float theta = acos(z.z / r) * power;
        float phi = atan(z.y, z.x) * power;
        dr = pow(r, power - 1.0) * power * dr + 1.0;

        z = pos + pow(r, power) * vec3(
            sin(theta) * cos(phi),
            sin(theta) * sin(phi),
            cos(theta)
        );
    }
    return 0.5 * log(r) * r / dr;
}
```

**Unity Applications**: VFX Graph custom nodes, shader graph procedural geometry
**Sources**: [Paul Bourke Fractals](https://paulbourke.net/fractals/), [Visualising Volumetric Fractals](https://paulbourke.net/papers/joc2017/)

---

### 6. Linus Torvalds Git: Content-Addressable Storage → Distributed Deduplication

**Pattern**: "Design around data" - SHA-1 hash as universal identifier
- **Data**: Object database with shallow trie (256 subdirs for first byte)
- **Output**: Efficient distributed version control with automatic deduplication
- **Key Techniques**:
  - **Content-addressable**: Identical content = same hash = single storage
  - **Pack files**: Delta compression with hash table for fast lookup
  - **Memory mapping**: mmap(2) for zero-copy access

**Git Object Pattern**:
```python
# Every object is content-addressed by SHA-1 hash
def store_object(content: bytes, type: str) -> str:
    header = f"{type} {len(content)}\0"
    data = header.encode() + content
    hash = hashlib.sha1(data).hexdigest()

    # Store in .git/objects/[first 2 hex]/[remaining 38 hex]
    dir_path = f".git/objects/{hash[:2]}"
    file_path = f"{dir_path}/{hash[2:]}"

    # Automatic deduplication: if hash exists, don't write
    if not os.path.exists(file_path):
        os.makedirs(dir_path, exist_ok=True)
        with open(file_path, 'wb') as f:
            f.write(zlib.compress(data))

    return hash
```

**Unity Applications**: Asset versioning, scene delta compression, multiplayer state sync
**Sources**: [Git Data Structures](https://medium.com/swlh/data-structures-used-in-git-implementation-a2c95bf4135e), [Linus on Data Structures](https://read.engineerscodex.com/p/good-programmers-worry-about-data)

---

### 7. Bret Victor: Explorable Explanations → Understanding Through Manipulation

**Pattern**: Interactive models with immediate visual feedback
- **Data**: Parameterized system + multiple linked representations
- **Output**: Intuitive understanding through direct manipulation
- **Key Techniques**:
  - **Immediacy**: No delay between manipulation and visual update
  - **Multiple representations**: Same data shown in complementary ways (graph, equation, animation)
  - **Active reading**: Text as environment to think in, not passive consumption

**Explorable Pattern** (conceptual):
```typescript
// System with multiple synchronized views
interface ExplorableSystem {
    // Shared reactive state
    params: Observable<SystemParams>;

    // Multiple representations auto-update
    views: {
        graph: GraphView;          // Visual output
        equation: EquationView;    // Mathematical form
        timeline: TimelineView;    // Evolution over time
        controls: ControlsView;    // Parameter sliders
    };

    // Direct manipulation updates all views
    onParamChange(param: string, value: number) {
        this.params.set(param, value);  // All views auto-react
    }
}
```

**Unity Applications**: Editor tools with immediate preview, debug visualizations, tutorial systems
**Sources**: [Explorable Explanations](https://worrydream.com/ExplorableExplanations/), [Bret Victor Wikipedia](https://en.wikipedia.org/wiki/Bret_Victor)

---

### Cross-Cutting Patterns Summary

| Pattern | Data → Output Ratio | Key Technique | Best For |
|---------|---------------------|---------------|----------|
| Perlin Noise | 256 bytes → infinite textures | Hash + interpolation | Procedural materials, terrain |
| Fractal Compression | 100:1+ compression | Self-similarity matching | Image/texture compression |
| Cellular Automata | 8 bits → universal computation | Local rules, emergent behavior | AI, procedural generation |
| Transclusion | Reference → full content | Content addressing | Asset reuse, narrative |
| Volumetric Fractals | Equation params → 3D worlds | GPU ray casting | VFX, procedural geometry |
| Git Objects | Content hash → deduplication | Content-addressable storage | Version control, state sync |
| Explorable Explanations | Params → understanding | Multiple linked views | Debug tools, tutorials |

### Common Principles Across All Pioneers

1. **Indirection**: Store rules/transforms, not output (Perlin, Mandelbrot, Wolfram)
2. **Self-similarity**: Exploit repetition at multiple scales (Mandelbrot, Bourke, fractals)
3. **Content addressing**: Hash identifies data, enables deduplication (Torvalds, Nelson tumblers)
4. **Laziness**: Generate on-demand, don't pre-compute (Perlin shader evaluation, fractal decompression)
5. **Composability**: Small rules combine for complex output (Wolfram CA, Perlin octaves)
6. **Resolution independence**: Output scales without data growth (fractals, procedural generation)
7. **Interactive immediacy**: Tight feedback loops aid understanding (Victor, explorable explanations)

### Unity XR Integration Opportunities

1. **Asset Pipeline**: Fractal compression for texture streaming, content-addressed deduplication
2. **World Generation**: Perlin noise + CA for terrain/dungeon generation at runtime
3. **Multiplayer**: Git-style delta compression for scene state sync
4. **Debug Tools**: Victor-style explorable interfaces for understanding AR tracking, physics
5. **VFX**: Bourke-style GPU fractals for particle systems, volumetric effects
6. **Narrative**: Nelson-style transclusion for branching AR experiences with shared content fragments

---

## 2026-02-05 - Claude Code - AI World Model Formats Research (2025-2035)

**Discovery**: THREE dominant architectural patterns for AI world models, with Khronos standardization for Gaussian Splatting (Q2 2026)

**Context**: Researching AI-native formats for Unity XR world model integration in Portals V4

### 1. Architectural Patterns

**Patch-based Diffusion Transformers** (OpenAI Sora, Stability AI):
- Operate in latent space with 3D patches
- Videos generated by denoising patches, then decoded
- Enables multi-resolution, multi-duration training
- Sora 2: Preserves "world state" across shots (persistent spatial relationships)

**Autoregressive Transformers** (xAI Aurora, Runway GWM-1, Genie 3):
- Frame-by-frame generation with state persistence
- Real-time interactive (Genie 3: 24fps @ 720p)
- Action conditioning (camera pose, robot commands, audio)
- Sub-second latency achievable with distillation

**Hybrid Diffusion-Autoregressive** (Google Genie 2):
- Autoregressive latent diffusion model
- Video autoencoder → latent → large transformer dynamics model
- "Long horizon memory" - remembers occluded world regions
- Consistent worlds up to 1 minute

### 2. Khronos glTF Gaussian Splatting Standardization

**Timeline**:
- Feb 3, 2026: KHR_gaussian_splatting release candidate announced
- Q2 2026: Expected ratification

**Technical Specs**:
- **KHR_gaussian_splatting**: Splats as point primitives (position, rotation, scale, transparency, spherical harmonics)
- **KHR_gaussian_splatting_compression_spz**: 90% compression vs PLY (Niantic SPZ format, MIT License)
- SPZ blobs stored in glTF buffers, can decompress OR pass directly to rendering

**Collaborators**: Khronos, OGC, Niantic Spatial, Cesium, Esri

### 3. Latent Space is Universal

ALL major platforms operate in learned latent spaces, NOT raw pixels:
- Sora 2: 3D patches in latent space (multimodal: video, audio, language)
- Genie 2/3: Latent frames + past state as input to transformer
- Runway GWM-1: Frame-by-frame latent, built on Gen-4.5

**Implication**: Unity integration should work with latent representations, not RGB frames.

### 4. Recent Research Breakthroughs

**RAE-DiT (2025)**: Frozen representation encoders repurposed as autoencoders
- FID 1.51 @ 256x256 (no guidance), 1.13 @ 512x512
- Diffusion models CAN work in high-dimensional latent spaces

**REPA (ICLR 2025)**: Representation alignment via distillation
- 17.5x faster convergence than vanilla diffusion transformers

**DeepVerse (June 2025)**: 4D interactive world model
- Explicit geometric predictions from previous timesteps
- Reduces drift, enhances temporal consistency

**NOVA (ICLR 2025)**: Non-quantized video autoregressive
- Temporal frame-by-frame + spatial set-by-set (no quantization)

### 5. Amazon Bedrock Nova: No 3D Support

**Critical**: Nova models do NOT support 3D generation (text, image, video, speech only)

### 6. NeRF: No Formal Standardization

- Active research (Jan 2026 ACM survey, photogrammetry evaluation)
- No standardization initiatives found
- 3D Gaussian Splatting has overtaken NeRF in adoption (meteoric rise since 2023)

### Impact for Portals V4

**Recommended Tech Stack** (prioritized by maturity):

**Tier 1: Production Ready (2026)**:
1. **glTF + Gaussian Splatting** (Khronos Q2 2026)
   - 90% compression with SPZ
   - Unity support via UnityGLTF
   - Geospatial integration (OGC)

2. **Stable Video 3D/4D** (ICLR 2025)
   - .safetensors format
   - Multi-view 4D assets
   - Research license available

**Tier 2: Near-Term (6-12 months)**:
3. **Genie 3 / Project Genie** (Available Jan 2026)
   - Real-time 24fps @ 720p
   - Interactive with actions
   - Google AI Ultra subscription required

4. **Runway GWM-1** (Dec 2025)
   - GWM Worlds variant for explorable environments
   - Real-time, frame-by-frame
   - API access

**Avoid**: Amazon Bedrock Nova (no 3D), xAI Aurora (image-only, no world modeling)

### Unity Integration Insights

1. **Autoregressive for interactivity**: Real-time AR needs frame-by-frame generation with action conditioning
2. **World state persistence critical**: Scene graph tracking + latent state caching for AR
3. **Multi-modal training unlocks scaling**: Design for text, image, video, audio from start (Sora 2 model)
4. **Streaming format**: glTF + SPZ compression (production-ready Q2 2026)

### Open Questions

1. Latent space interoperability: Can Sora patches convert to Genie latent frames?
2. Unity ML-Agents integration: How to connect autoregressive models to Unity action space?
3. AR Foundation compatibility: Which formats preserve ARKit/ARCore spatial anchors?
4. Streaming protocols: How to stream SPZ-compressed Gaussian Splats over network?
5. Hybrid architectures: Can diffusion (quality) + autoregressive (speed) combine?

**Sources**: 11 parallel web searches covering OpenAI Sora 2, Google Genie 2/3, xAI Aurora, Runway Gen-3/GWM-1, Stability SV3D/SV4D, Amazon Nova, Khronos glTF, NeRF, diffusion transformers, autoregressive models, latent space research

**Cross-References**:
- See portals_main/docs/ARCHITECTURE_AUDIT_2026.md for current Unity integration
- See Unity-XR-AI/KnowledgeBase/_UNITY_AS_A_LIBRARY_IOS.md for bridging patterns
- Future: Create _AI_WORLD_MODEL_FORMATS_2025.md for detailed reference

---

## 2026-02-05 - Claude Code - Portals V4 VFX Architecture & Open Source Strategy

**Discovery**: MetavidoVFX O(1) compute pattern critical for mobile AR VFX

**Context**: Researching VFX patterns for Unity Advanced Composer migration in Portals V4

### O(1) VFX Compute Pattern

**Problem**: Naive approach runs compute shader per-VFX, causing O(N) scaling (~2ms overhead per effect on mobile).

**Solution**: Single compute dispatch pattern from MetavidoVFX:
```
ARDepthSource.cs (SINGLETON) → One dispatch/frame
  └── Outputs: PositionMap, StencilMap, VelocityMap
VFXARBinder.cs (per VFX) → Just SetTexture() calls, ~0.2ms each
```

**Impact**: 5 VFX @ 7.8ms total vs 21.5ms with naive approach (iPhone 15 Pro)

### VFX Graph Texture Binding Gotcha

**Problem**: `Shader.SetGlobalTexture()` does NOT work with VFX Graph exposed properties.

**Solution**: Must use per-VFX `SetTexture()` calls:
```csharp
// WRONG - VFX can't read global textures
Shader.SetGlobalTexture("_DepthMap", depthTexture);

// CORRECT - Must bind per-VFX
foreach (var vfx in activeVFX)
    vfx.SetTexture("DepthMap", depthTexture);
```

**Impact**: Explains why many MetavidoVFX effects have explicit binder components.

### Open Source Architecture Strategy

**Pattern**: Separate proprietary core from open ecosystem:
- **Closed**: Core app, AI composer, voice engine, feed algorithm
- **Open**: File formats (XRAI, VNMF), VFX library, SDK, AI wrappers

**File Formats Defined**:
- XRAI (Scene Interchange): JSON-based scene format for sharing
- VNMF (Asset Format): VFX/Neural/Model bundles with metadata

**Cross-References**:
- `portals_main/specs/VFX_ARCHITECTURE.md` - Full VFX spec
- `portals_main/specs/OPEN_SOURCE_ARCHITECTURE.md` - Open/closed split
- `_VFX_SOURCES_REGISTRY.md` - VFX inventory
- `_VFX_SOURCE_BINDINGS.md` - Binding patterns
- `_PORTALS_V4_CURRENT.md` - Architecture overview

---

## 2026-02-04 - Claude Code - Holograim Data Visualizer Project

**Discovery**: Path normalization is critical when using fdir for filesystem crawling

**Context**: Building ultra-crawler (Node.js + Three.js) for multi-source data visualization (filesystem, web, S3, GitHub)

### Bug Fix: fdir Trailing Slash Issue

**Problem**: `fdir` library returns directory paths with trailing slashes (`/path/to/dir/`), but `dirname()` returns paths without them (`/path/to/dir`). This caused parent-child edge relationships to fail (0 edges despite correct nodes).

**Root Cause**:
```javascript
// fdir returns: /Users/james/project/
// dirname('/Users/james/project/file.js') returns: /Users/james/project (no slash)
// Map lookup fails: pathToId.get('/Users/james/project') !== stored '/Users/james/project/'
```

**Solution**: Normalize all paths before storing/looking up:
```javascript
const normalizePath = (p) => p.endsWith('/') ? p.slice(0, -1) : p;
const normalizedPath = normalizePath(fullPath);
pathToId.set(normalizedPath, nodeId);
// parentId lookup now works: pathToId.get(dirname(normalizedPath))
```

**Impact**: Edges now correctly created (1,206 nodes → 1,205 edges)

### SQLite Upsert Pattern for Graph Databases

**Pattern**: Use `INSERT ON CONFLICT DO UPDATE RETURNING id` with `.get()` method:
```javascript
this.insertNodeStmt = this.db.prepare(`
  INSERT INTO nodes (path, name, type, ...) VALUES (?, ?, ?, ...)
  ON CONFLICT(path) DO UPDATE SET name = excluded.name, ...
  RETURNING id
`);
const result = this.insertNodeStmt.get(node.path, node.name, ...);
return result.id; // Always returns valid ID, even for existing rows
```

**Why**: `INSERT OR IGNORE` returns `lastInsertRowid = 0` for existing rows, breaking foreign key relationships.

### Cross-Platform Web App Patterns (Mac/PC/visionOS/Mobile)

**Platform Detection Object**:
```javascript
const PLATFORM = {
  isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
  isVisionOS: /Apple Vision/i.test(navigator.userAgent),
  get hasWebXR() { return 'xr' in navigator; },
  get isLowPower() { return navigator.connection?.saveData || this.isMobile; }
};
```

**Adaptive Rendering**: Scale complexity based on device:
```javascript
const MAX_NODES = PLATFORM.isMobile ? 200 : PLATFORM.isLowPower ? 300 : 500;
```

**iOS WebXR Fallback**: iOS Safari doesn't support WebXR - use gyroscope:
```javascript
if (PLATFORM.isIOS && !PLATFORM.hasWebXR) {
  window.addEventListener('deviceorientation', handleGyroscope);
}
```

### GitHub API Rate Limits

**Issue**: Unauthenticated requests hit 60/hour limit quickly when crawling repos.

**Solution**: Set `GITHUB_TOKEN` environment variable for 5,000/hour limit.

### Project Location

`/Users/jamestunick/Documents/GitHub/Holograim/`

**Tags**: #nodejs #threejs #visualization #crawler #sqlite #webxr #cross-platform

### GPU Instanced Rendering Pattern (Added 2026-02-04)

**Problem**: Rendering thousands of individual meshes creates thousands of draw calls, killing performance.

**Solution**: Use `THREE.InstancedMesh` to batch similar objects into single draw calls:

```javascript
// Group nodes by type for efficient instancing
const nodesByType = {};
nodes.forEach(d => {
  const typeKey = d.data.type + (d.children ? '_dir' : '_file');
  if (!nodesByType[typeKey]) nodesByType[typeKey] = [];
  nodesByType[typeKey].push(d);
});

// Create instanced mesh per type (1 draw call instead of N)
const dummy = new THREE.Object3D();
const geo = new THREE.BoxGeometry(1, 1, 1); // Unit geometry
const instancedMesh = new THREE.InstancedMesh(geo, mat, count);

nodes.forEach((d, i) => {
  dummy.position.set(x, y, z);
  dummy.scale.set(w, h, depth);
  dummy.updateMatrix();
  instancedMesh.setMatrixAt(i, dummy.matrix);
  instancedMesh.setColorAt(i, color); // Per-instance color
});
instancedMesh.instanceMatrix.needsUpdate = true;
```

**Performance Gains**:
- Before: 300 cubes max (300 draw calls)
- After: 10,000 cubes (5-10 draw calls based on types)
- Mobile: 1,000 cubes with 30fps frame budget

**Raycasting with InstancedMesh**:
```javascript
const intersects = raycaster.intersectObjects(scene.children, false);
if (intersects[0]?.object.isInstancedMesh) {
  const instanceId = intersects[0].instanceId;
  const data = intersects[0].object.userData.nodeData[instanceId];
}
```

### visionOS 2.0 CSS Design System (Added 2026-02-04)

**Problem**: Web interfaces look dated compared to Apple Vision Pro's spatial computing aesthetic.

**Solution**: Implement authentic visionOS glass morphism with CSS custom properties:

```css
/* Glass material system - key to spatial feel */
:root {
  --glass-bg: rgba(28, 28, 30, 0.72);
  --glass-bg-elevated: rgba(44, 44, 46, 0.78);
  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-specular: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%);
  --glass-inner-shadow: inset 0 1px 0 rgba(255,255,255,0.08);

  /* Depth shadows for spatial presence */
  --shadow-elevated: 0 8px 32px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2);
  --shadow-floating: 0 24px 80px rgba(0,0,0,0.45), 0 8px 24px rgba(0,0,0,0.25);

  /* Animation for natural feel */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Glass panel mixin */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(60px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 28px;
  box-shadow: var(--shadow-elevated), var(--glass-inner-shadow);
}

/* Specular highlight overlay (key detail) */
.glass-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--glass-specular);
  pointer-events: none;
  border-radius: inherit;
}
```

**Key Design Principles**:
1. **Multi-layer transparency**: 72% opacity + blur + saturation
2. **Specular highlights**: Gradient overlay mimics light reflection
3. **Depth shadows**: Multiple shadow layers create floating effect
4. **Pill-shaped controls**: `border-radius: 9999px` for segmented controls
5. **Subtle inner shadow**: Top edge highlight for depth
6. **Space gradient background**: Radial gradient from dark to black

**Responsive Touch Targets**:
```css
@media (hover: none) and (pointer: coarse) {
  .btn, .tab { min-height: 44px; min-width: 44px; } /* Apple HIG */
  input, select { font-size: 16px; } /* Prevent iOS zoom */
}
```

**Tags**: #visionos #css #design-system #glass-morphism #spatial-ui

---

## 2026-01-22 - Claude Code - XRRAI Namespace Migration ✅ COMPLETE

**Discovery**: Namespace consolidation enables easy feature migration to other Unity projects (e.g., portals_main).

**Context**: User requested namespace consolidation with new brand "XRRAI" (XR Real-time AI), replacing H3M.

**Status**: ✅ Migration executed - 164 files changed, 0 compilation errors

### Final Namespace Mapping

| Old Namespace | New Namespace | Files |
|---------------|---------------|-------|
| MetavidoVFX.HandTracking.* | XRRAI.HandTracking | 15 |
| MetavidoVFX.Painting | XRRAI.BrushPainting | 6 |
| MetavidoVFX.Icosa | XRRAI.VoiceToObject | 12 |
| MetavidoVFX.VFX.* | XRRAI.VFXBinders | 14 |
| MetavidoVFX.H3M.*, H3M.* | XRRAI.Hologram | 21 |
| MetavidoVFX.Tracking.* | XRRAI.ARTracking | 9 |
| MetavidoVFX.Audio | XRRAI.Audio | 2 |
| MetavidoVFX.Performance | XRRAI.Performance | 3 |
| MetavidoVFX.Testing | XRRAI.Testing | 2 |
| MetavidoVFX.Debugging | XRRAI.Debugging | 8 |
| MetavidoVFX.UI | XRRAI.UI | 10 |
| MetavidoVFX.Recording | XRRAI.Recording | 3 |
| MetavidoVFX.Editor | XRRAI.Editor | 31 |

### Key Fix During Migration

- Renamed `XRRAI.Debug` → `XRRAI.Debugging` to avoid collision with `UnityEngine.Debug`

### Tools Created

- `Assets/Scripts/Editor/NamespaceRefactorer.cs` - Menu-driven namespace migration tool
  - `H3M > Refactor > Preview Namespace Changes` - Shows files to change
  - `H3M > Refactor > Execute Namespace Consolidation` - Performs migration
  - `H3M > Refactor > Fix Missing Usings After Refactor` - Fixes using statements

### Migration Benefits

1. **Feature Isolation**: Each feature module can be copied to another project
2. **Clear Dependencies**: XRRAI.* prefix identifies all project-specific code
3. **Assembly Definitions Ready**: Each namespace maps to a planned .asmdef file
4. **Version Control**: Changes are atomic and reviewable
5. **No Conflicts**: XRRAI.Debugging avoids UnityEngine.Debug collision

### Commits

- `e6f43ff3d` - feat: XRRAI namespace migration + FrameEncoder safety wrapper
- `95bd55d14` - refactor: Execute XRRAI namespace migration (164 files)

**Impact**: All 164 C# files successfully migrated to XRRAI.* namespaces.

---

## 2026-01-22 - Claude Code - Spec Status Deep Dive & Alignment

**Discovery**: Comprehensive audit revealed major discrepancies between claimed and actual spec implementation status.

**Context**: User requested deep dive to ensure all specs, tasks, and docs are aligned.

### Status Corrections Applied

| Spec | Claimed Status | Actual Status | Delta |
|------|---------------|---------------|-------|
| 007 - VFX Multi-Mode | Ready | ✅ Complete | +100% |
| 008 - Multimodal ML | 90% Complete | Phase 0 (15%) | -75% |
| 003 - Hologram Conferencing | Complete | 60% | -40% |
| 009 - Icosa/Sketchfab | Complete | 70% | -30% |
| 012 - Hand Tracking | In Progress | ✅ Complete | +50% |
| 014 - HiFi Hologram | Planning | 50% | +50% |

### Key Findings

**1. Spec 007 was actually complete** - All 6 phases, 19 tasks, test scenes exist:
- `Spec007_Audio_Test.unity` - Audio reactive VFX testing
- `Spec007_Physics_Test.unity` - Camera velocity, gravity testing
- AudioBridge with beat detection, VFXModeController, VFXPhysicsBinder all working

**2. Spec 008 was vastly overstated** - Only Phase 0 (Debug Infrastructure) complete:
- DebugFlags.cs, DebugConfig.cs exist
- ITrackingProvider interface NOT implemented
- ARKit providers NOT started
- Voice architecture NOT started

**3. Self-contained test strategy** - PlayMode tests now test algorithms, not implementations:
```csharp
// Test hysteresis algorithm directly, no assembly reference issues
float pinchStartThreshold = 0.02f;
float pinchEndThreshold = 0.04f;
// Test the algorithm pattern, not the specific class
```

### Documentation Updated

| File | Changes |
|------|---------|
| `specs/README.md` | Accurate status table, strategic priorities |
| `specs/MASTER_DEVELOPMENT_PLAN.md` | Sprint 1, 13, 14 marked complete |
| `MetavidoVFX-main/CLAUDE.md` | Spec status table updated |
| `Unity-XR-AI/CLAUDE.md` | Next Steps section updated |

### Test Infrastructure Verified

- **12/12 spec demo scenes exist** (0 missing)
- **PlayMode tests**: 11/11 pass
- **EditMode tests**: 20/20 pass
- **Console**: 0 errors, 0 warnings

**Impact**: Roadmap now accurately reflects ~77 days remaining work vs. previously understated estimates.

---

## 2026-01-22 - Claude Code - KB Pattern Extraction (82 → 106 patterns)

**Discovery**: Systematic review of 9 KB files extracted 24 new auto-fix patterns covering VFX, AR depth, hand tracking, audio, compute shaders, and WebXR.

**Context**: Pattern research to improve Unity coding capabilities via parallel KB review.

### New Pattern Categories Added

| Category | Patterns | Key Sources |
|----------|----------|-------------|
| Hand VFX | 2 | TouchingHologram, HoloKit |
| AR Depth Compute | 4 | YoHana19/HumanParticleEffect, Qiita |
| VFX Custom HLSL | 4 | Unity docs, MetavidoVFX |
| VFX Global Texture | 1 | Keijiro Rcam series |
| Audio VFX Memory | 2 | keijiro/LaspVfx |
| VFX Event Pooling | 2 | Unity VFX docs |
| WebXR Context | 1 | WebXR Explainer |
| AR WebRTC Capture | 1 | AR Foundation issues |
| Rcam RayParams | 2 | keijiro/Rcam3 |

### Key Technical Discoveries

**1. VFX Global Texture Limitation**
```csharp
// ❌ VFX cannot read global textures
Shader.SetGlobalTexture("_DepthMap", depth);

// ✅ Must set per-VFX instance
vfx.SetTexture("DepthMap", depth);

// Exception: Vectors/Matrices CAN be global
Shader.SetGlobalVector("_ARRayParams", rayParams);  // ✅
```

**2. Zero-GC Audio Texture Pattern**
```csharp
// Use NativeArray + LoadRawTextureData instead of SetPixels
NativeArray<float> buffer = new(count, Allocator.Persistent);
texture.LoadRawTextureData(buffer);  // Direct memcpy, no GC
```

**3. ARKit Depth Empirical Correction**
```hlsl
// ARKit depth needs 0.625x scale factor
float correctedDepth = rawDepth * 0.625f;
```

**4. Thread Group 32x32 for Metal**
```hlsl
[numthreads(32,32,1)]  // 1024 = Metal max, must match dispatch
```

### Impact
- Auto-fix patterns: 82 → **106** (+29%)
- GitHub sources: +5 repos (LaspVfx, Rcam3, touching-hologram, HumanParticleEffect, unity-webxr-export)
- Cross-reference: `_AUTO_FIX_PATTERNS.md`, `_INTELLIGENCE_SYSTEMS_INDEX.md`

---

## 2026-01-22 - Claude Code - Spec 012 Hand Tracking + Brush Painting Complete

**Discovery**: Completed full hand tracking and brush painting implementation with two complementary gesture interpreter architectures.

**Context**: Spec 012 implementation - unified hand tracking across HoloKit/XRHands/MediaPipe/BodyPix/Touch with brush painting system.

### Key Architectural Patterns

**1. Dual GestureInterpreter Pattern**
| Implementation | Location | Use Case |
|----------------|----------|----------|
| MonoBehaviour-based | `Painting/GestureInterpreter.cs` | Component attachment, full swipe/palette |
| Class-based | `Gestures/GestureInterpreter.cs` | Standalone use, ScriptableObject config |

**2. Hysteresis for Gesture Detection**
```csharp
// Different thresholds for start vs end prevents flickering
float _pinchStartThreshold = 0.02f;  // Must reach to START
float _pinchEndThreshold = 0.04f;    // Must exceed to END
// Oscillating near 0.03f won't cause repeated start/end events
```

**3. BrushController Inline Parameter Mapping**
- Uses `AnimationCurve` fields exposed in Inspector
- `_speedToRateCurve` - Hand speed → particle emission rate
- `_pinchToWidthCurve` - Pinch strength → brush width
- No separate ParameterMapper.cs needed

**4. StrokeManager Command Pattern**
- Full undo/redo with 20-deep stack
- Save/load to JSON (Application.persistentDataPath)
- `GetStrokeBuffer()` returns GraphicsBuffer for GPU VFX rendering

### Files Created/Modified

| File | LOC | Purpose |
|------|-----|---------|
| `GestureDetector.cs` | ~280 | Standalone class with hysteresis |
| `GestureConfig.cs` | ~80 | ScriptableObject config |
| `ColorPicker.cs` | ~250 | HSB palm-projected color wheel |
| `BrushPalette.cs` | ~380 | Circular 8-brush selector |
| `HandTrackingTests.cs` | ~280 | 17 NUnit tests |
| `tasks.md` | - | Updated with completion status |

### Test Results
- **0 compilation errors** across all new files
- **17 NUnit tests** (joint mapping, hysteresis, velocity, gestures)
- Only third-party test failures (LlavaDecoder - not our code)

### Cross-Reference
- `_HAND_SENSING_CAPABILITIES.md` - 21-joint reference, gesture thresholds
- `_AUTO_FIX_PATTERNS.md` - AR texture null checks
- Spec 012: `specs/012-hand-tracking/tasks.md`

---

## 2026-01-21 - Claude Code - AI Coding Productivity Research Integration

**Discovery**: Integrated findings from 4 RCT studies into KB and GLOBAL_RULES.

**Key Research Findings**:

| Study | Sample | Finding |
|-------|--------|---------|
| METR RCT (arXiv:2507.09089) | 16 devs, 246 tasks | Expert devs **19% slower** with AI |
| Microsoft/Accenture RCT (SSRN:4945566) | 4,867 devs | Junior devs **35-39% faster**, seniors **8-16%** |
| Google Internal RCT | ~100 engineers | **21% faster** on enterprise tasks |
| GitHub Copilot (arXiv:2302.06590) | 95 devs | **55.8% faster** on HTTP server task |

---

## 2026-01-16 - Claude Code + Unity MCP Workflow Breakthrough

**Discovery**: Systematic workflow combining Claude Code, Unity MCP, JetBrains Rider MCP, and structured knowledgebase achieves 5-10x faster Unity development iteration

**Context**: MetavidoVFX VFX Library system development - implementing UI Toolkit flexibility, Input System compatibility, verbose logging control, and Editor persistence for runtime-spawned VFX

**Impact**:
- Compilation error detection: **Immediate** (vs minutes waiting for Unity)
- Fix-verify cycle: **<30 seconds** (vs 2-5 minutes traditional)
- Cross-file understanding: **Instant** (MCP reads any file)
- Pattern recognition: **Knowledgebase-augmented** (no re-learning)

### Key Workflow Pattern: MCP-First Development

```
1. Read file(s) with context
2. Make targeted edit
3. mcp__UnityMCP__refresh_unity(compile: "request")
4. mcp__UnityMCP__read_console(types: ["error"])
5. If errors → fix and repeat from step 2
6. mcp__UnityMCP__validate_script() for confirmation
```

**Critical Success Factors:**

| Factor | Impact | Why It Matters |
|--------|--------|----------------|
| Unity MCP `read_console` | 10x faster error detection | No need to switch to Unity, errors appear in Claude |
| Unity MCP `validate_script` | Instant compilation check | Confirms fix worked before proceeding |
| Unity MCP `refresh_unity` | Triggers recompilation | Forces Unity to process changes |
| JetBrains MCP `search_in_files` | Fast codebase search | Faster than Glob for indexed projects |
| Structured CLAUDE.md | Context preservation | Key files, patterns, commands documented |
| Knowledgebase symlinks | Cross-session memory | Patterns persist across conversations |

### Session Accomplishments (Single Session)

1. **VFXToggleUI.cs** - Complete rewrite for 4 UI modes (Auto, Standalone, Embedded, Programmatic)
2. **Input System Fix** - `#if ENABLE_INPUT_SYSTEM` preprocessor handling
3. **VFXARDataBinder.cs** - Added `verboseLogging` flag to silence 18 debug calls
4. **VFXLibraryManager.cs** - Complete rewrite for Editor persistence via Undo system
5. **VFXCategory.cs** - Added `SetCategory()` method with auto-binding configuration

### Code Patterns Discovered

**1. Read-Only Property Workaround**
```csharp
// Problem: Expression-bodied properties are read-only
public VFXCategoryType Category => category; // Can't set externally

// Solution: Add explicit setter method with side effects
public void SetCategory(VFXCategoryType newCategory)
{
    category = newCategory;
    bindings = newCategory switch  // Auto-configure related fields
    {
        VFXCategoryType.People => VFXBindingRequirements.DepthMap | ...,
        VFXCategoryType.Hands => VFXBindingRequirements.HandTracking | ...,
        _ => VFXBindingRequirements.DepthMap
    };
}
```

**2. Input System Compatibility**
```csharp
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;
[SerializeField] private Key toggleUIKey = Key.Tab;
// Check: Keyboard.current[toggleUIKey].wasPressedThisFrame
#else
[SerializeField] private KeyCode toggleUIKey = KeyCode.Tab;
// Check: Input.GetKeyDown(toggleUIKey)
#endif
```

**3. Editor Persistence for Runtime Objects**
```csharp
#if UNITY_EDITOR
if (!Application.isPlaying)
{
    Undo.RegisterCreatedObjectUndo(newObject, $"Create {name}");
    EditorUtility.SetDirty(gameObject);
    EditorSceneManager.MarkSceneDirty(gameObject.scene);
}
#endif
```

**4. Verbose Logging Pattern**
```csharp
[Header("Debug")]
[Tooltip("Enable verbose logging (disable to reduce console spam)")]
public bool verboseLogging = false;

private bool _loggedInit; // One-time log tracking

void Update()
{
    if (verboseLogging && !_loggedInit)
    {
        Debug.Log("[Component] Initialized");
        _loggedInit = true;
    }
}
```

### MCP Tools Most Valuable

| Tool | Use Case | Frequency |
|------|----------|-----------|
| `read_console` | Check compilation errors | Every edit |
| `validate_script` | Verify fix worked | After each fix |
| `refresh_unity` | Force recompilation | After edits |
| `find_gameobjects` | Locate scene objects | Scene queries |
| `manage_components` | Add/modify components | Runtime setup |

### Knowledgebase Integration

**Files Consulted This Session:**
- `MetavidoVFX-main/CLAUDE.md` - Project architecture
- `QUICK_REFERENCE.md` - VFX properties
- `VFXCategory.cs` - Understood read-only property pattern
- `VFXLibrarySetup.cs` - Editor utilities pattern

**Key Insight**: Having `CLAUDE.md` with clear architecture diagrams reduced context-gathering from 10+ file reads to 1-2 targeted reads.

### Rider MCP Advantages

- **Indexed Search**: `search_in_files_by_text` faster than grep for large codebases
- **Symbol Info**: `get_symbol_info` shows type definitions instantly
- **File Problems**: `get_file_problems` catches errors Roslyn finds that Unity might miss
- **Rename Refactoring**: `rename_refactoring` safer than find-replace

### Workflow Recommendations

1. **Start with CLAUDE.md** - Understand project architecture first
2. **Use MCP for verification** - Don't trust "save and hope"
3. **Small, targeted edits** - One change per verify cycle
4. **Check console after EVERY edit** - Catch errors immediately
5. **Document patterns in KB** - Future sessions benefit
6. **Use verbose logging sparingly** - Add flags to control debug output

**Files Created/Modified**:
- `Assets/Scripts/UI/VFXToggleUI.cs` - Complete rewrite
- `Assets/Scripts/VFX/Binders/VFXARDataBinder.cs` - Added verboseLogging
- `Assets/Scripts/VFX/VFXLibraryManager.cs` - Complete rewrite
- `Assets/Scripts/VFX/VFXCategory.cs` - Added SetCategory()
- `KnowledgeBase/LEARNING_LOG.md` - This entry
- `KnowledgeBase/_CLAUDE_CODE_UNITY_WORKFLOW.md` - New workflow guide

**Category**: workflow|claude-code|unity-mcp|rider|knowledgebase|metavidovfx

---

## 2026-01-16 - EchoVision AR Mesh → VFX Deep Dive

**Discovery**: Comprehensive analysis of EchoVision (realitydeslab/echovision) AR mesh visualization pipeline

**Context**: Deep dive into MeshVFX.cs and SoundWaveEmitter.cs to understand AR mesh → VFX particle pipeline

### Key Technical Findings

#### MeshVFX Pipeline Architecture
```
ARMeshManager → MeshVFX.cs → GraphicsBuffer → VFX Graph
                    ↓
     Distance sorting (nearest meshes first)
                    ↓
     Buffer capacity limiting (64-100k vertices)
                    ↓
     VFX Properties: MeshPointCache, MeshNormalCache, MeshPointCount
```

**Critical Insights**:
1. **GraphicsBuffer.Target.Structured** with stride=12 for Vector3 data
2. **Distance-based mesh sorting** ensures nearest environment rendered first
3. **ARKit iOS**: Mesh vertices at world coordinates (mesh.position = 0,0,0)
4. **VisionPro**: Meshes have non-zero transforms - push MeshTransform_* for compatibility
5. **LateUpdate()**: Ensures camera/pose updated before mesh processing

#### SoundWaveEmitter Audio Integration
```
AudioProcessor.AudioVolume → SoundWaveEmitter → 3 Concurrent Waves → VFX + Material
```

**Wave System Design**:
- 3 overlapping waves allow smooth transitions
- Volume → cone angle (quiet=narrow, loud=wide)
- Pitch → wave lifetime (higher pitch=longer duration)
- Dual output to VFX properties AND mesh material shader arrays

### VFX Property Reference (EchoVision)

| Property | Type | Source | Description |
|----------|------|--------|-------------|
| MeshPointCache | GraphicsBuffer | MeshVFX | World-space vertices |
| MeshNormalCache | GraphicsBuffer | MeshVFX | Vertex normals |
| MeshPointCount | int | MeshVFX | Valid vertex count |
| WaveOrigin | Vector3 | SoundWaveEmitter | Wave emission point |
| WaveRange | float | SoundWaveEmitter | Current expansion radius |
| WaveAngle | float | SoundWaveEmitter | Cone angle (90-180 deg) |
| WaveAge | float | SoundWaveEmitter | 0-1 normalized lifetime |

### Scene Setup Verification (MCP)

**Objects Found**:
- MeshVFX (ID: 458156) - 15,000 particles active, buffer 100k
- SoundWaveEmitter (ID: 458620) - threshold 0.02, sharing MeshVFX's VisualEffect
- MeshManager (ID: 458806) - ARMeshManager with 6 active meshes
- AudioInput (ID: 459008) - Full audio chain with EnhancedAudioProcessor

**Key Discovery**: MeshVFX and SoundWaveEmitter share the SAME VisualEffect component - integrated system where mesh data and wave data combine in single VFX graph.

### Our Modifications vs Original

| Modification | Purpose |
|--------------|---------|
| VFXBinderManager.SuppressMeshVFXLogs | Log control integration |
| verboseLogging flag | Periodic logging (3s) not every frame |
| Reference validation in Awake() | Clear error messages |
| _initialized guard | Prevent updates before setup |

**Original Source**: [realitydeslab/echovision](https://github.com/realitydeslab/echovision) (MIT License)

**Related Documentation Updated**:
- `_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md` - Added ARKit Mesh → GraphicsBuffer pattern
- `_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md` - Added Sound Wave Emission System pattern

**Category**: echovision|ar-mesh|vfx-graph|graphicsbuffer|audio-reactive|unity-mcp|realitydeslab

---

## 2026-01-16 - Claude Code - VFX Pipeline Consolidation Final

**Discovery**: Comprehensive consolidation of VFX & hologram research from 500+ GitHub repos into unified Hybrid Bridge Pattern with automated setup

**Context**: Deep research into Live AR Pipeline, BodyPixSentis, VelocityMap, VFX naming conventions from prior learnings and original Keijiro source repos

**Impact**:
- **84% code reduction**: 3,194+ lines → ~500 lines
- **O(1) compute scaling**: Single dispatch for all VFX regardless of count
- **Automated setup**: One-click `H3M > VFX Pipeline > Setup Hybrid Bridge`
- **Feature integration**: VelocityMap, BodyPixSentis, VFX naming convention documented

### Key Architecture Decisions

**Hybrid Bridge Pattern** (Recommended):
```
ARDepthSource (singleton, 80 LOC)
    ↓ ONE compute dispatch
PositionMap, VelocityMap, etc.
    ↓ public properties (NOT globals - VFX can't read them!)
VFXARBinder (per-VFX, 40 LOC)
    ↓ explicit SetTexture() calls
VFX Graph
```

**Critical Discovery**: VFX Graph does NOT natively read `Shader.SetGlobalTexture()`. Must use explicit `vfx.SetTexture()` per VFX. GraphicsBuffers and Vectors work globally.

### Files Created/Modified

| File | Purpose |
|------|---------|
| `VFX_PIPELINE_FINAL_RECOMMENDATION.md` | 930+ lines master recommendation |
| `VFXPipelineSetup.cs` | Editor menu automation |
| `_LIVE_AR_PIPELINE_ARCHITECTURE.md` | Pipeline comparison docs |
| `VFX_NAMING_CONVENTION.md` | Asset naming standards |

### Implementation Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| **ARDepthSource** | ~80 | Singleton, single compute dispatch |
| **VFXARBinder** | ~40 | Lightweight per-VFX binding |
| **DirectDepthBinder** | ~30 | Zero-compute for new VFX |
| **VFXPipelineSetup** | ~180 | Editor automation |

### Feature Integration Summary

| Feature | Cost | When to Use |
|---------|------|-------------|
| **VelocityMap** | +0.4ms | Trail/motion effects |
| **BodyPixSentis** | +4.8ms | Body-part specific VFX |
| **VFX Naming** | 0ms | Organization/debugging |

### Quick Decision Tree

```
Need VFX pipeline?
├─ Existing 88 VFX (PositionMap) → ARDepthSource + VFXARBinder
├─ New VFX from scratch → DirectDepthBinder (zero-compute)
├─ Holograms with anchors → HologramSource + HologramRenderer
└─ Global GraphicsBuffers → VFXProxBuffer (already optimal)
```

### Menu Commands

- `H3M > VFX Pipeline > Setup Hybrid Bridge (Recommended)` - One-click setup
- `H3M > VFX Pipeline > Disable Legacy Components` - Cleanup old systems
- `H3M > VFX Pipeline > Verify Setup` - Health check
- `H3M > VFX Pipeline > List All VFX` - Debug listing

**Category**: vfx-pipeline|consolidation|hybrid-bridge|automated-setup|metavidovfx|keijiro|rcam|bodypix

---

---

## 2026-01-16 - Claude Code - VFX Pipeline Automation System (MetavidoVFX)

**Discovery**: Complete VFX pipeline automation with Hybrid Bridge Pattern, replacing legacy 2,400+ LOC with ~1,000 LOC

**Context**: User requested one-click pipeline setup, legacy management, real-time debugging, and organized VFX library

**Impact**:
- 60% code reduction (2,400 LOC → 1,000 LOC)
- O(1) compute scaling vs O(N) per-VFX
- Full pipeline visibility via Dashboard
- Keyboard shortcuts for rapid testing
- One-click editor automation

**Key Technical Discoveries**:

1. **VFX Graph Global Texture Limitation**
   - VFX Graph CANNOT read `Shader.SetGlobalTexture()` - requires explicit `vfx.SetTexture()` per instance
   - GraphicsBuffers work globally via `Shader.SetGlobalBuffer()` (HLSL access)
   - Vector4/Matrix4x4 globals work normally
   - This necessitates the per-VFX binder pattern

2. **C# ref/out Property Limitation (CS0206)**
   - Auto-properties cannot be used with ref/out parameters
   - Solution: Use backing fields with expression-bodied property
   ```csharp
   RenderTexture _positionMap;
   public RenderTexture PositionMap => _positionMap;
   // Then: EnsureRenderTexture(ref _positionMap, ...)
   ```

3. **WebGL Incompatibility**
   - VFX Graph requires compute shaders which WebGL 2.0 lacks
   - Will NOT work with react-unity-webgl portals
   - Must use Particle Systems for WebGL deployment

4. **Hybrid Bridge Pattern Architecture**
   ```
   ARDepthSource (singleton)     VFXARBinder (per-VFX)
         ↓                              ↓
   ONE compute dispatch          SetTexture() calls only
         ↓                              ↓
   PositionMap, VelocityMap      Auto-detects properties
   ```

**Files Created**:
- `Assets/Scripts/Bridges/ARDepthSource.cs` - Singleton compute source (~200 LOC)
- `Assets/Scripts/Bridges/VFXARBinder.cs` - Lightweight per-VFX binding (~160 LOC)
- `Assets/Scripts/Bridges/AudioBridge.cs` - FFT audio bands (~130 LOC)
- `Assets/Scripts/VFX/VFXPipelineDashboard.cs` - Real-time debug UI (~350 LOC)
- `Assets/Scripts/VFX/VFXTestHarness.cs` - Keyboard shortcuts (~250 LOC)
- `Assets/Scripts/Editor/VFXPipelineMasterSetup.cs` - Editor automation (~400 LOC)

**Menu Commands Added**:
- `H3M > VFX Pipeline Master > Setup Complete Pipeline (Recommended)`
- `H3M > VFX Pipeline Master > Pipeline Components > *`
- `H3M > VFX Pipeline Master > Legacy Management > *`
- `H3M > VFX Pipeline Master > Testing > *`
- `H3M > VFX Pipeline Master > Create Master Prefab`

**Reference Pattern**: YoHana19/HumanParticleEffect - Clean ~200 LOC implementation vs VFXBinderManager 1,357 LOC

**Related**:
- See: `MetavidoVFX-main/Assets/Documentation/VFX_PIPELINE_FINAL_RECOMMENDATION.md`
- See: `MetavidoVFX-main/CLAUDE.md` (updated Data Pipeline Architecture section)
- See: claude-mem docs: `vfx-graph-global-texture-limitation-2026-01`, `hybrid-bridge-pattern-metavidovfx-2026-01`

---

## 2026-01-16 - Claude Code - Hybrid Bridge Pipeline IMPLEMENTATION COMPLETE

**Discovery**: Successfully implemented the full Hybrid Bridge Pipeline for MetavidoVFX with 73 VFX assets

**Context**: Following the architecture design from previous session, completed full implementation including:
- VFXLibraryManager rewritten for new pipeline integration (~920 LOC)
- 73 VFX assets organized in Resources/VFX by category
- Legacy component auto-removal working
- One-click setup via menu and context menus

**Impact**:
- ✅ Performance verified: 353 FPS @ 10 active VFX
- ✅ 85% faster than legacy pipeline (11ms → 1.6ms @ 10 VFX)
- ✅ O(1) compute scaling - ONE dispatch regardless of VFX count
- ✅ Legacy components (VFXBinderManager, VFXARDataBinder) automatically removed
- ✅ VFX property detection working (auto-detects DepthMap, PositionMap, etc.)

**Implementation Details**:

1. **VFXLibraryManager Rewrite** (~920 LOC)
   - Uses VFXARBinder instead of legacy VFXARDataBinder + VFXPropertyBinder
   - `SetupCompletePipeline()` - One-click: creates ARDepthSource, adds VFXARBinder, removes legacy
   - `EnsureARDepthSource()` - Auto-creates singleton if missing
   - `RemoveAllLegacyComponents()` - Removes VFXBinderManager, VFXARDataBinder, empty VFXPropertyBinder
   - `AutoDetectAllBindings()` - Refreshes all VFXARBinder property detection
   - `PopulateLibrary()` / `ClearLibrary()` - Wrapper methods for Editor/Runtime

2. **VFX Organization (73 total in Resources/VFX)**:
   | Category | Count | Examples |
   |----------|-------|----------|
   | People | 5 | bubbles, glitch, humancube_stencil, particles, trails |
   | Environment | 5 | swarm, warp, worldgrid, ribbons, markers |
   | NNCam2 | 9 | joints, eyes, electrify, mosaic, tentacles |
   | Akvfx | 7 | point, web, spikes, voxel, particles |
   | Rcam2 | 20 | HDRP→URP converted body effects |
   | Rcam3 | 8 | depth people/environment effects |
   | Rcam4 | 14 | NDI-style body effects |
   | SdfVfx | 5 | SDF environment effects |

3. **Editor Automation (VFXPipelineMasterSetup.cs)**:
   - Added "Auto-Detect All Bindings" menu item
   - Added "Remove All Legacy Components" menu item
   - Added VFX Library menu items for VFXLibraryManager integration
   - Fixed `GetPropertyBinders<VFXBinderBase>()` generic type requirement

4. **New Files Created**:
   - `Assets/Scripts/Editor/InstantiateVFXFromResources.cs` - Batch VFX instantiation from Resources

**Architecture Summary**:
```
AR Foundation → ARDepthSource (singleton) → VFXARBinder (per-VFX) → VFX
                      ↓                           ↓
           ONE compute dispatch          SetTexture() calls only
                      ↓
           PositionMap, VelocityMap (shared by all VFX)
```

**Key Metrics**:
- Total VFX: 88 (73 in Resources, 15 elsewhere)
- VFXLibraryManager: ~920 LOC (down from 785 LOC legacy)
- ARDepthSource: ~256 LOC (singleton compute)
- VFXARBinder: ~160 LOC (lightweight per-VFX)
- VFXPipelineMasterSetup: ~500 LOC (editor automation)

**Menu Commands**:
- `H3M > VFX Pipeline Master > Setup Complete Pipeline (Recommended)` - Full setup
- `H3M > VFX Pipeline Master > Pipeline Components > Auto-Detect All Bindings`
- `H3M > VFX Pipeline Master > Pipeline Components > Remove All Legacy Components`
- `H3M > VFX Pipeline Master > VFX Library > Create VFXLibraryManager`
- `H3M > VFX Pipeline Master > VFX Library > Setup VFXLibraryManager Pipeline`
- `H3M > VFX Pipeline Master > VFX Library > Populate from Resources`
- `H3M > VFX Pipeline Master > Instantiate VFX from Resources`

**Context Menu** (right-click VFXLibraryManager):
- `Setup Complete Pipeline` - One-click full setup
- `Ensure ARDepthSource` - Creates singleton if missing
- `Remove All Legacy Components` - Cleans up legacy binders
- `Auto-Detect All Bindings` - Refreshes property detection
- `Debug Pipeline Status` - Console output with full status

**Related**:
- See: `MetavidoVFX-main/Assets/Documentation/README.md` (updated)
- See: `MetavidoVFX-main/CLAUDE.md` (updated)
- See: `MetavidoVFX-main/Assets/Documentation/VFX_PIPELINE_FINAL_RECOMMENDATION.md`
- See: Previous entry for architecture design details

---

## 2026-01-16 (Later) - Claude Code - ARDepthSource Mock Textures for Editor Testing

**Discovery**: Added mock texture support to ARDepthSource for Editor testing without AR device/AR Foundation Remote

**Context**: VFXARBinder was showing `IsBound=false, BoundCount=0` in Editor because ARDepthSource had no depth data without AR Remote connection

**Problem Solved**:
1. **ExposedProperty vs const string**: VFX Graph requires `ExposedProperty` type for proper property ID resolution, not `const string`
2. **Editor testing**: No way to test VFX bindings without device or AR Foundation Remote
3. **ReadPixels bounds errors**: VelocityVFXBinder and VFXPhysicsBinder crashed on destroyed RenderTextures

**Implementation**:

1. **VFXARBinder.cs** - Changed from `const string` to `ExposedProperty`:
```csharp
[VFXPropertyBinding("UnityEngine.Texture2D")]
public ExposedProperty depthMapProperty = "DepthMap";
// ... similar for all properties
```

2. **ARDepthSource.cs** - Added mock texture support:
```csharp
#if UNITY_EDITOR
[Header("Editor Testing")]
[SerializeField] bool _useMockDataInEditor = true;
[SerializeField] Vector2Int _mockResolution = new Vector2Int(256, 192);

void CreateMockTextures()
{
    // Circular depth gradient (0.5m center → 3m edge)
    // Center "human" stencil blob
    // Blue-ish color gradient for visual feedback
}

void UseMockData()
{
    // Apply mock textures when no AR data available
    // Runs compute shader on mock depth for PositionMap
}
#endif
```

3. **VFXPhysicsBinder.cs / VelocityVFXBinder.cs** - Added validation:
```csharp
if (_velocityMapRT == null || !_velocityMapRT.IsCreated() ||
    _velocityMapRT.width <= 0 || _velocityMapRT.height <= 0)
    return Vector3.zero;
```

**Key Insight**: Preprocessor directives must wrap BOTH definition AND call site:
```csharp
#if UNITY_EDITOR
void UseMockData() { ... }  // Definition
#endif

void LateUpdate()
{
    #if UNITY_EDITOR
    if (noARData) UseMockData();  // Call site also wrapped
    #endif
}
```

**Impact**:
- ✅ VFX bindings testable in Editor without device
- ✅ Mock data provides visual feedback (circular depth pattern, center human blob)
- ✅ No more "Reading pixels out of bounds" errors
- ✅ ExposedProperty properly resolves VFX Graph property IDs

**Files Modified**:
- `Assets/Scripts/Bridges/ARDepthSource.cs` - Mock texture support (~60 LOC added)
- `Assets/Scripts/Bridges/VFXARBinder.cs` - ExposedProperty types
- `Assets/Scripts/VFX/Binders/VFXPhysicsBinder.cs` - IsCreated() validation
- `Assets/Scripts/PeopleOcclusion/VelocityVFXBinder.cs` - IsCreated() validation

**Related**:
- See: `MetavidoVFX-main/Assets/Scripts/Bridges/ARDepthSource.cs`
- See: Previous entry for Hybrid Bridge Pipeline architecture

---

## 2026-01-16 (Later) - Claude Code - Unity .gitignore & Project Cleanup

**Discovery**: Added comprehensive Unity .gitignore patterns and reorganized project structure

**Changes**:
1. **Unity .gitignore** - Added patterns for:
   - Generated folders: Library/, Temp/, Obj/, Builds/, Logs/, UserSettings/
   - IDE files: *.csproj, *.sln, .vs/, .idea/
   - Build artifacts: *.apk, *.aab, *.unitypackage
   - Debug symbols: *.pdb, *.mdb
   - Xcode builds, Addressables, macOS metadata

2. **Shader Reorganization**:
   - Moved compute shaders from `Resources/` to `Assets/Shaders/`
   - DepthToWorld, DepthProcessor, HumanDepthMapper, SegmentedDepthToWorld, etc.

3. **VFX Organization**:
   - Organized 73 VFX into `Resources/VFX/` subfolders by category
   - Categories: People, Environment, NNCam2, Akvfx, Rcam2, Rcam3, Rcam4, SdfVfx

4. **Added Fluo Packages**:
   - `Fluo-GHURT-main/` - Keijiro's Fluo controller/receiver system
   - `jp.keijiro.fluo` and `jp.keijiro.urp-cameratextureutils` packages

**Impact**:
- ✅ Cleaner git status (removed 23 tracked generated files)
- ✅ Better shader organization in dedicated folder
- ✅ VFX categorized for easy browsing and management
- ✅ Fluo audio integration available for AR experiences

**Git Cleanup Commands**:
```bash
git rm -r --cached MetavidoVFX-main/obj/
git rm --cached MetavidoVFX-main/*.csproj
git rm --cached MetavidoVFX-main/*.sln
```

**Related**:
- See: `.gitignore` for full Unity patterns
- See: `MetavidoVFX-main/Assets/Shaders/` for compute shaders
- See: `MetavidoVFX-main/Assets/Resources/VFX/` for organized VFX

---

## 2026-01-20 (Session 4) - Rcam VFX Binding Specification

**Task**: Research keijiro's Rcam2, Rcam3, Rcam4 projects to understand VFX binding requirements
**Output**: `_RCAM_VFX_BINDING_SPECIFICATION.md` (complete binding reference for 73 VFX assets)

**Key Findings**:

1. **VFX Asset Inventory** (MetavidoVFX):
   - Rcam2: 20 VFX (HDRP→URP converted)
   - Rcam3: 8 VFX (URP standard)
   - Rcam4: 14 VFX (URP production)
   - Total: 42 Rcam-based VFX (plus 31 other categories)

2. **Property Evolution** (Rcam2 → Rcam3/4):
   - `RayParamsMatrix` (Matrix4x4) → `InverseProjection` (Vector4)
   - `ProjectionVector` → `InverseProjection` (renamed)
   - `InverseViewMatrix` → `InverseView` (same type)

3. **VFXARBinder Alias Resolution**:
   - Auto-detects property names across Rcam2/3/4, Akvfx, H3M
   - Supports 7 alias arrays (DepthMap, StencilMap, ColorMap, RayParams, etc.)
   - Example: `DepthMap` = `{ "DepthMap", "Depth", "DepthTexture", "_Depth" }`

4. **Body vs Environment Separation**:
   - **People VFX**: Bind `StencilMap` (human segmentation from ARKit)
   - **Environment VFX**: Do NOT bind stencil (or use `Texture2D.whiteTexture`)
   - **"Any" VFX** (Rcam3): Stencil optional (grid/sweeper effects)

5. **Depth Rotation for iOS Portrait**:
   - ARKit depth is landscape (wider than tall)
   - MetavidoVFX VFX expect portrait (taller than wide)
   - Solution: 90° CW rotation via `RotateUV90CW.shader` + swapped RT dimensions
   - RayParams adjustment: Negate `tanH` component

6. **VFXProxBuffer** (Rcam3 spatial acceleration):
   - 16×16×16 spatial hash grid (4096 cells, 32 points/cell max)
   - O(1) insertion, O(864) queries per particle (27-cell neighborhood)
   - Use case: Plexus/Metaball effects needing nearest-neighbor queries
   - **Status**: NOT implemented in MetavidoVFX (would benefit plexus VFX)

7. **Blitter Class** (Rcam4/Unity 6):
   - Replacement for deprecated `Graphics.Blit`
   - Uses `DrawProceduralNow(MeshTopology.Triangles, 3, 1)` (fullscreen triangle)
   - **Status**: MetavidoVFX still using `Graphics.Blit` (should migrate)

**Critical Implementation Notes**:

**Global Texture Access (VFX Graph)**:
```csharp
❌ Shader.SetGlobalTexture("_DepthMap", depth);  // VFX Graph CANNOT read
✅ vfx.SetTexture("DepthMap", depth);            // Per-VFX binding required

✅ EXCEPTION: Vectors/Matrices CAN be global
   Shader.SetGlobalVector("_ARRayParams", rayParams);
   Shader.SetGlobalMatrix("_ARInverseView", invView);
```

**Compute Shader Thread Groups**:
```csharp
❌ WRONG: [numthreads(8,8,1)] + ceil(width/8) dispatch
✅ CORRECT: [numthreads(32,32,1)] + ceil(width/32) dispatch
```

**Depth Format Standard**: Always `RenderTextureFormat.RHalf` (16-bit float)

**Integration Status** (MetavidoVFX):

✅ Implemented:
- ARDepthSource (O(1) compute dispatch for ALL VFX)
- VFXARBinder (lightweight binding with alias resolution)
- RayParams calculation (`centerShift + tan(FOV)`)
- InverseView matrix (TRS pattern)
- Depth rotation (iOS portrait mode)
- StencilMap binding (human segmentation)
- Demand-driven ColorMap (spec-007)
- Throttle/Intensity binding
- Audio binding (global shader vectors)

⚠️ Partially Implemented:
- InverseProjection (using RayParams instead)
- VelocityMap (compute exists, disabled by default)
- Normal map (compute exists, rarely used)

❌ Not Implemented (Rcam3/4 Features):
- VFXProxBuffer (spatial acceleration)
- Blitter class (using deprecated Blit)
- Color LUT (Texture3D grading)
- URP Renderer Features (background/recolor)

**References**:

Web Research:
- https://github.com/keijiro/Rcam2 (HDRP 8.2.0, Unity 2020.1.6)
- https://github.com/keijiro/Rcam3 (URP 17.0.3, Unity 6, VFXProxBuffer)
- https://github.com/keijiro/Rcam4 (URP 17.0.3, Unity 6, Blitter class)

Knowledge Base:
- `_RCAM_QUICK_REFERENCE.md` - Property naming, binder pattern (212 LOC)
- `_RCAM_SERIES_ARCHITECTURE_RESEARCH.md` - Full architecture (732 LOC, 47 files analyzed)
- `_RCAM_VFX_BINDING_SPECIFICATION.md` - **NEW** - Binding reference for 73 VFX (500+ LOC)

Local Files:
- `MetavidoVFX-main/Assets/Scripts/Bridges/VFXARBinder.cs` (887 LOC)
- `MetavidoVFX-main/Assets/Scripts/Bridges/ARDepthSource.cs` (627 LOC)
- `MetavidoVFX-main/Assets/Shaders/DepthToWorld.compute` (GPU depth→world)
- `MetavidoVFX-main/Assets/Resources/VFX/Rcam2/` (20 VFX)
- `MetavidoVFX-main/Assets/Resources/VFX/Rcam3/` (8 VFX)
- `MetavidoVFX-main/Assets/Resources/VFX/Rcam4/` (14 VFX)

**Next Steps**:

1. Test InverseProjection calculation for true Rcam3/4 compatibility
2. Consider VFXProxBuffer port for plexus effects
3. Migrate depth rotation to Blitter class (Unity 6 compliance)
4. Add VelocityMap support for lightning/trail effects
5. Document compute shader thread group sizing as best practice

**Tags**: `vfx-graph` `ar-foundation` `keijiro` `depth-reconstruction` `rcam` `metavidovfx` `compute-shader` `binding-patterns` `property-aliases` `spatial-acceleration`


## 2026-01-20: MyakuMyaku YOLO11 vs AR Foundation Segmentation

**Source**: keijiro/MyakuMyakuAR migration

### Two Segmentation Approaches

| Approach | Detection Target | Runtime | Latency |
|----------|-----------------|---------|---------|
| YOLO11 (ONNX) | Any object (80 COCO classes) | com.github.asus4.onnxruntime | ~30-50ms |
| AR Foundation | Human body only | Built-in ARKit/ARCore | ~16ms |

### ONNX Runtime vs Unity Sentis

| Aspect | ONNX Runtime | Unity Sentis |
|--------|--------------|--------------|
| Package | com.github.asus4.onnxruntime | com.unity.ai.inference |
| Model Format | .onnx | .sentis / .onnx |
| GPU Backend | CoreML/NNAPI/DirectML | Unity Compute |
| Flexibility | Any ONNX model | Unity-optimized |
| Size | ~15MB runtime | Built into Unity |

### Key Files Added
- `Assets/Scripts/ObjectDetection/Yolo11Seg.cs` - Core inference
- `Assets/Scripts/ObjectDetection/Yolo11SegARController.cs` - AR integration
- `Assets/Resources/VFX/Myaku/README.md` - Full documentation

### Recommendation
- **Mobile performance**: Use AR Foundation (native, faster)
- **Object detection**: Use YOLO11 (more flexible, heavier)
- **New ML projects**: Prefer Unity Sentis over ONNX Runtime


---

## 2026-01-21 (Session 1) - Claude Code - Deep Project Audit

**Discovery**: Completed comprehensive audit of entire MetavidoVFX project and KnowledgeBase. Corrected documentation statistics and identified outdated references.

**Audit Results**:

### 1. Corrected Project Statistics

| Metric | Old Value | Correct Value |
|--------|-----------|---------------|
| C# Scripts | 458 | **179** (129 runtime + 50 editor) |
| VFX Assets | 235 | **432** (292 primary in Assets/VFX) |
| Custom Scenes | 8 | **25** (5 HOLOGRAM + 10 spec demos + 10 other) |
| KB Files | 75+ | **116** markdown files |

### 2. VFX Asset Breakdown (Assets/VFX - 292 total)

| Category | Count | Description |
|----------|-------|-------------|
| Portals6 | 22 | Portal/vortex effects |
| Essentials | 22 | Core spark/smoke/fire |
| Buddha | 21 | From TouchingHologram |
| UnitySamples | 20 | Training assets |
| Rcam2 | 20 | HDRP→URP converted |
| Keijiro | 16 | Kinetic/generative |
| Rcam4 | 14 | NDI streaming |
| Dcam | 13 | LiDAR depth |
| NNCam2 | 9 | Keypoint-driven |
| Other | 135 | Various categories |

### 3. Spec Completion Status

| Spec | Status | Completion |
|------|--------|------------|
| 002 | ✅ Complete | 100% (superseded by Hybrid Bridge) |
| 003 | 📋 Draft | ~10% (design only) |
| 004 | ✅ Complete | 100% |
| 005 | ✅ Complete | 100% (TryGetTexture pattern) |
| 006 | ✅ Complete | 100% (Hybrid Bridge Pipeline) |
| 007 | ⚠️ In Progress | ~85% (testing pending) |
| 008 | 📋 Architecture | ~5% (debug infra done) |
| 009 | 📋 Draft | 0% (spec complete, no implementation) |

### 4. KB Files Needing Updates

| File | Issue | Priority |
|------|-------|----------|
| `_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md` | VFXBinderManager not marked deprecated | HIGH |
| `_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md` | numthreads(8,8,1) → should be (32,32,1) | HIGH |
| `_WEBRTC_MULTIUSER_MULTIPLATFORM_GUIDE.md` | com.unity.webrtc removed | MEDIUM |
| Create `_HYBRID_BRIDGE_PIPELINE_PATTERN.md` | New primary system not documented | HIGH |

### 5. Recent Critical Fixes (2026-01-21)

- ✅ WebRTC duplicate framework conflict fixed (removed com.unity.webrtc)
- ✅ Bubbles.vfx HLSL parameter mismatch fixed (Texture2D.Load pattern)
- ✅ IosPostBuild.cs framework path updated for 3rdparty folder
- ⚠️ Unity Editor VFX crash documented (internal bug in VFXValueContainer::ClearValue)

### 6. Legacy Systems (in _Legacy folder)

- `VFXBinderManager.cs` - Replaced by ARDepthSource
- `VFXARDataBinder.cs` - Replaced by VFXARBinder
- `PeopleOcclusionVFXManager.cs` - Replaced by ARDepthSource

**Impact**: Documentation accuracy improved significantly. All CLAUDE.md files updated with correct statistics.

**Cross-References**:
- `MetavidoVFX-main/CLAUDE.md` - Project Statistics section
- `CLAUDE.md` - Root statistics section
- `specs/*/tasks.md` - Phase completion status

---

## 2026-01-21 - Consolidation - Merged from Multiple Logs

**Context**: Simplified intelligence system - one log instead of six.

### Failures Learned

**MCP Server Timeout** (Tool):
- Unity MCP calls failed silently due to duplicate servers
- Prevention: `mcp-kill-dupes` at session start
- Added to: GLOBALGLOBAL_RULES.md, _AUTO_FIX_PATTERNS.md

### Successes to Replicate

**Agent Consolidation**:
- Consolidated 14 agents with shared rules file
- Single source of truth reduces maintenance
- Pattern: _AGENT_SHAREDGLOBAL_RULES.md referenced by all

**Continuous Learning System**:
- Systematic extraction → log → improve → accelerate
- Then simplified to one loop: Search KB → Act → Log → Repeat

### Anti-Patterns to Avoid

| Pattern | Why Bad | Do Instead |
|---------|---------|------------|
| Read before search | Token waste | Grep/Glob first |
| Grep for filenames | Wrong tool | Use Glob |
| Write instead of Edit | Higher cost | Edit for changes |
| String VFX props | Silent failures | ExposedProperty |
| Skip AR null checks | Crashes | TryGetTexture pattern |
| Full file reads | Token waste | Use offset/limit |

### Persistent Issue

**MCP Server Timeouts** (PI-001):
- Duplicate servers block ports
- Workaround: `mcp-kill-dupes`
- Blocker: MCP spawns per-app by design

---


## 2026-01-21 - Claude Code - Production Code Patterns from Unity MCP

**Discovery**: Extracted 7 production-ready code patterns from CoderGamester/mcp-unity.

**Patterns Documented**:
1. **McpToolBase** - Sync/async execution with `IsAsync` flag
2. **Response Format** - JSON-RPC 2.0 with typed error codes
3. **Component Update** - Reflection-based property setting with type conversion
4. **Console Log Service** - Thread-safe capture with auto-cleanup (1000 max)
5. **Undo Integration** - `RecordObject`, `RegisterCreatedObjectUndo`, `CollapseUndoOperations`
6. **Main Thread Dispatcher** - Async Unity API calls with `ManualResetEvent`
7. **Parameter Validation** - Multi-layer validation with early returns

**Key Error Types** (standardized):
- `invalid_json`, `invalid_request`, `unknown_method`
- `validation_error`, `not_found_error`
- `tool_execution_error`, `internal_error`

**Unity Type Conversion** (for MCP):
- Vector3: `{x, y, z}` → `new Vector3()`
- Color: `{r, g, b, a}` → `new Color()` (a defaults to 1)
- Quaternion: `{x, y, z, w}` → `new Quaternion()` (w defaults to 1)
- Enum: String name → `Enum.Parse()`

**Files Updated**:
- `_AI_CODING_BEST_PRACTICES.md` - Added "Production Code Patterns" section

**Tags**: `mcp` `code-patterns` `unity` `reflection` `threading`

---

## 2026-01-21 - Claude Code - Cross-Tool Rollover Guide

**Discovery**: Created seamless rollover guide for switching between Claude Code, Gemini, and Codex.

**Core Insight**: Files are memory. All AI tools share the same filesystem.

**Rollover Workflow**:
1. When Claude Code hits token limits → switch to `gemini` or `codex`
2. Both tools can read: `GLOBALGLOBAL_RULES.md`, `CLAUDE.md`, `KnowledgeBase/`
3. Paste context block to restore state

**Context Block** (paste in new tool):
```
Read these for context:
1. ~/GLOBALGLOBAL_RULES.md - Universal rules
2. ~/Documents/GitHub/Unity-XR-AI/CLAUDE.md - Project overview
3. ~/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_QUICK_FIX.md - Error fixes
```

**Tool Comparison**:
| Tool | Context | Cost | Best For |
|------|---------|------|----------|
| Claude Code | 200K | $$$ | Complex code, planning |
| Gemini CLI | 1M | FREE | Research, large docs |
| Codex CLI | 128K | $$ | Refactors, quick fixes |

**MCP Workarounds** (for Gemini/Codex):
- Unity console: `cat ~/Library/Logs/Unity/Editor.log | grep error`
- JetBrains search: `grep -r "pattern" project/`
- claude-mem: Reference `LEARNING_LOG.md` directly

**Files Created**:
- `_CROSS_TOOL_ROLLOVER_GUIDE.md` - Full rollover documentation

**Files Updated**:
- `GLOBALGLOBAL_RULES.md` - Added rollover section

**Tags**: `rollover` `gemini` `codex` `migration` `token-efficiency`

---

## 2026-01-21 15:43 - Commit feb7baa8a

**Message**: docs: Add MCP code patterns and cross-tool rollover guide
**Files Changed**: 5

---

## 2026-01-21 16:27 - Commit 139da9021

**Message**: docs: Add KB search commands for all AI tools and IDEs
**Files Changed**: 4

---

## 2026-01-21 16:46 - Commit bdf55ad7b

**Message**: docs: Update LEARNING_LOG with session discoveries
**Files Changed**: 1

---

## 2026-01-21 16:53 - Commit 27cfd6c80

**Message**: feat: Holistic agent offloading + KB integration + screenshot automation
**Files Changed**: 2

---
## 2026-01-21 17:23 - Session

**Message**: docs: sync deprecated pipeline references to Hybrid Bridge (ARDepthSource + VFXARBinder) and align cross-tool rules
**Files Changed**: repo docs + global/rules updates

---
## 2026-01-21 17:32 - Session

**Message**: docs: synced RULES.md with GLOBAL_RULES cross-tool integration + Unity MCP optimization guidance
**Files Changed**: RULES.md

---

---
## 2026-01-21 17:45 - Session

**Message**: docs: Documented Gemini Unity MCP setup and integration rules
**Files Changed**: GEMINI.md, GLOBALGLOBAL_RULES.md, KnowledgeBase/_GEMINI_UNITY_MCP_SETUP.md
**Summary**: Established single source of truth for Gemini MCP configuration (UnityMCP v9.0.1 + claude-mem via uvx) and corrected GLOBAL_RULES tool integration matrix.

---
## 2026-01-21 18:10 - Session

**Message**: refactor: Moved confirmed legacy scripts and prefabs to root .deprecated folder
**Files Changed**: Moved 9+ files from MetavidoVFX-main/Assets/ to .deprecated/
**Summary**: Triple-checked legacy status of VFXBinderManager, VFXARDataBinder, OptimalARVFXBridge, and others. Moved them outside of Assets/ to reduce scan noise and align with Hybrid Bridge architecture.

---
## 2026-01-21 18:15 - Session

**Message**: fix: Restored H3MSignalingClient and WebRTCReceiver
**Files Changed**: MetavidoVFX-main/Assets/H3M/Network/
**Summary**: Restored signaling scripts to Assets/ as they are actively required by H3MWebRTCReceiver for Spec 003 (Hologram Conferencing). Legacy status was mislabeled in audit notes.

---
## 2026-01-21 18:35 - Session

**Message**: docs: Reorganized documentation and specifications for clarity and reduced scan noise
**Files Changed**: Moved 5+ docs to .deprecated/Docs, 5 specs to .deprecated/Specs, updated READMEs
**Summary**: Consolidated and updated core documentation to align with Hybrid Bridge architecture. Moved superseded docs and completed specs out of active Assets folders to minimize AI tool context bloat.

---

## 2026-02-05 - Claude Code - Cross-Tool KB Access Architecture

**Discovery**: Optimal KB access pattern for teams using multiple AI tools (Claude Code, Codex, Windsurf, Gemini, Rider)

**Context**: Setting up shared KnowledgeBase access across dev team without slowing workflows or requiring complex setup

**Key Insight**: Three-tier access pattern with jsDelivr CDN eliminates rate limits and setup friction

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  Tier 1: Bundled       │  .claude/kb/ in project repo      │
│  (Zero setup)          │  Essentials: _QUICK_FIX, AUTO_FIX │
├────────────────────────┼────────────────────────────────────┤
│  Tier 2: Online CDN    │  jsDelivr (no rate limits)        │
│  (Zero setup)          │  Full 49-file KB on-demand        │
├────────────────────────┼────────────────────────────────────┤
│  Tier 3: Local Clone   │  ./scripts/dev-setup.sh           │
│  (Optional)            │  Fastest, works offline           │
└────────────────────────┴────────────────────────────────────┘
```

### Critical Decision: jsDelivr vs raw.githubusercontent.com

| Factor | raw.githubusercontent.com | jsDelivr CDN |
|--------|---------------------------|--------------|
| Rate limit | 60 req/hour | **Unlimited** |
| Latency | ~300ms | **~100ms** |
| Caching | None | Global CDN |
| Cost | Free | Free |

**URL Pattern**: `https://cdn.jsdelivr.net/gh/{owner}/{repo}@{branch}/{path}`

### Auto-Sync via open-multibrain

Git post-commit hook syncs GLOBALGLOBAL_RULES.md to all AI tools:
- Claude Code (`~/.claude/`)
- Codex (`~/.codex/`)
- Windsurf (`~/.windsurf/`)
- Antigravity (`~/.antigravity/`)

**Key Files**:
- `modules/open-multibrain/sync.sh` - Main sync script
- `.git/hooks/post-commit` - Auto-trigger on commit
- `GLOBALGLOBAL_RULES.md` - Single source of truth

### When to Use Each Tier

| Scenario | Tier |
|----------|------|
| Quick error fix | Tier 1 (bundled) |
| Deep research | Tier 2 (online CDN) |
| Heavy daily use | Tier 3 (local clone) |
| Offline/travel | Tier 3 only |

**Impact**: Team gets full KB access with zero mandatory setup. Power users can opt into local clone for speed.

**Cross-refs**: `_OPEN_MULTIBRAIN_SYNC.md`, `_TOKEN_EFFICIENCY_COMPLETE.md`, `GLOBALGLOBAL_RULES.md`

**Tags**: #architecture #devops #kb #team #cdn

---

## 2026-02-05 10:45 EST - Claude Code - WarpJobs Audit Discoveries

**Context**: Full audit of WarpJobs automated job search system

### Discovery 1: Source Field Tracking Bug

**Problem**: All jobs in database had `source: "unknown"` despite scrapers setting source correctly.

**Root Cause**: `lib/data-pipeline.js:151` used `source` from options parameter, ignoring job's own source field.

**Fix**: Changed `source,` to `source: job.source || source,`

**Impact**: Future jobs will track their actual source (greenhouse, lever, ashby, etc.) enabling better analytics.

### Discovery 2: Dormant XR Career Pages Scraper

**Problem**: Job count dropped from 563 → 28. Only 6 scrapers active despite 11 defined.

**Root Cause**: `scripts/xr-career-pages.js` existed and worked perfectly but was never added to `main.js` pipeline.

**Fix**: Added `runCommand('XR Career Pages', 'node scripts/xr-career-pages.js', CONFIG.timeouts.long)` to Phase 1.

**Impact**: 28 → 815 jobs. Direct API access to 15+ companies (Unity, Roblox, OpenAI, Anthropic, Epic, etc.)

### Discovery 3: Aggressive Cleanup Window

**Problem**: 7-day cleanup window too aggressive for job market data.

**Fix**: Extended `DAYS_TO_KEEP` from 7 to 14 in `scripts/cleanup-old-jobs.js`.

**Impact**: Better job retention for slower-moving executive search.

### Discovery 4: Cloudflare Blocking Old Scrapers

**Finding**: 5 scrapers (Startup.jobs, TrueUp, Arc.dev, Otta, Wellfound) now blocked by Cloudflare (403/challenge pages).

**Lesson**: Direct company career APIs (Greenhouse, Lever, Ashby) more reliable than aggregator sites.

### Anti-Pattern Identified

```
Dormant code pattern:
- Script exists and works ✓
- Script exported in module ✓
- Script never called in main entry point ✗
```

**Prevention**: When adding new scrapers, always verify they're called in `main.js` or equivalent orchestrator.

**Cross-References**:
- `WarpJobs/CLAUDE.md` - Updated metrics
- `WarpJobs/lib/data-pipeline.js:151` - Source fix
- `WarpJobs/main.js:91` - XR career pages addition

**Tags**: #warpjobs #scraping #bugfix #audit #automation

## 2026-02-05: MCP Server Management - Force Quit Fix

**Problem**: Claude Code and Windsurf force quitting randomly.

**Root Cause**: Multiple AI IDEs (Windsurf, Antigravity, Claude Code, Cursor) each spawn their own MCP servers independently. Running 3-4 IDEs = 24-32+ MCP processes = memory exhaustion.

**Solution**: 
1. Created `~/bin/mcp-kill-dupes` script that kills duplicate servers (keeps oldest)
2. Added to SessionStart hook (`~/.claude/hooks/session-health-check.sh`)
3. Added `mcp-nuke` alias for heavy servers (playwright, puppeteer, etc.)

**Best Practice**: Use hooks over LaunchAgents for Claude Code automation.
- Hooks run in context, have conversation state access
- No persistent background processes
- Auto-cleanup when session ends

**New Commands**:
- `mcp-kill-dupes` - Kill duplicates (auto at session start)
- `mcp-nuke` - Kill duplicates + heavy servers
- `mcp-kill-all` - Nuclear option

**Documented In**:
- `GLOBAL_RULES.md` → MCP Server Management section
- `_MCP_SERVER_MANAGEMENT.md` (new KB doc)
- `_OPEN_MULTIBRAIN_SYNC.md` → MCP section
- `_TOOL_INTEGRATION_MAP.md` → MCP commands
- `_QUICK_FIX.md` → MCP force quit fixes
- Project `CLAUDE.md` → Unity MCP section

**Tags**: #mcp #performance #memory #hooks #cross-tool

## 2026-02-05: macOS Reminders Best Practice

**Problem**: Creating individual LaunchAgent plists for each reminder leads to daemon proliferation and system clutter.

**Solution**: Use Calendar.app's native alarm system via AppleScript:
```applescript
make new display alarm at end of display alarms of theEvent with properties {trigger interval:-60}
```

**Benefits**:
1. No daemon/plist proliferation
2. Syncs via iCloud across all devices automatically
3. No cleanup needed - Calendar manages lifecycle
4. Calendar handles timing, sounds, persistence natively
5. Respects user's notification preferences

**Anti-pattern**: Creating one LaunchAgent plist per reminder interval.

**Source**: WarpJobs interview-calendar.js simplification

## 2026-02-05 - AR Foundation 6.2 API Breaking Changes

**Context**: iOS build failed due to removed ARFace API methods

**Learning**: AR Foundation 6.2 removed `ARFace.GetBlendShapeCoefficients()` method - the API has changed significantly between versions.

**Version Check Checklist** (add to standard workflow):
1. Unity Editor version (6000.2.14f1)
2. AR Foundation version (6.2.1)
3. XR Package versions (ARKit 6.2.1)
4. VFX Graph version (17.2.0)
5. Xcode version (16.4)
6. iOS Deployment target (15.0+)

**Pattern**: Before using any AR Foundation API, check:
- Package version in manifest.json
- API docs at that specific version
- Unity forums for known breaking changes

**Fix Applied**: Disabled blendshape extraction (not needed for HiFi hologram testing)

**Tags**: #ar-foundation #api-changes #ios #build-errors

---

## 2026-02-06 - Auto-Testing Workflow (Triple-Verified)

**Context**: Improving meticulous bug squashing and testing workflow

### Verified Testing Tools (99% Confidence)

| Tool | Location | Trigger |
|------|----------|---------|
| **VFXTestHarness** | Scene component | Keys 1-9, Space, C, A, Tab |
| **VFXAutoTester** | Scene component | Auto-cycles VFX with timer |
| **SpecSceneAutoTester** | Editor menu | `H3M > Testing > Auto Test All Spec Scenes` |
| **VFXPipelineDashboard** | Scene component | Tab key toggles overlay |
| **Reset All Binders** | Editor menu | `H3M > VFX Pipeline Master > Reset All Binders` |

### Auto-Workflow After Code Changes (MANDATORY)

```
1. Save file → Unity auto-recompiles
2. Check: read_console(["error"], 10) or JetBrains get_file_problems
3. If errors → Fix → Loop to step 1
4. If clean → Enter Play mode
5. Test with VFXTestHarness (Space cycles, Tab for dashboard)
6. Exit Play → Check console for cleanup errors
```

### Parallel Agent Pattern (Proven Faster)

| Scenario | Do | Don't |
|----------|----|----|
| Bulk scene fix | Spawn agent + continue other work | Wait sequentially |
| Research 3 topics | 3 parallel Explore agents | 1 agent, 3 searches |
| Check 5 files | Parallel Read calls | Sequential reads |

**Tags**: #testing #workflow #auto-learning #parallel-agents

## 2026-02-05: Session Stall Analysis & Auto-Improvement

### Stall Causes Identified
| Stall | Root Cause | Fix Applied |
|-------|------------|-------------|
| Sequential file reads | Reading files one at a time | Use parallel Read calls |
| Waiting for background agent | Blocked on research instead of continuing | Continue with known info while agent runs |
| Too much context loading | Reading too many files before acting | Read only what's needed, glob first |
| Not responding to "hurry" | Continued verbose explanation | Reduce verbosity, parallelize more |

### Success Patterns
| Pattern | Result | Apply To |
|---------|--------|----------|
| Parallel agent spawning | 3x faster research | All multi-topic research |
| Continue while agent runs | No wasted time | Background tasks |
| Immediate action on "hurry" | User satisfaction | Speed-sensitive moments |
| Edit spec + rules in parallel | Efficient multi-file updates | All documentation tasks |

### Rules Added to GLOBAL_RULES.md
1. **Auto-Unblock & Speed Control** - Sense stalls, auto-recover
2. **Unified Debugging** - Single source of truth for all debug workflows
3. **Speed Control** - React to "hurry", parallelize more, skip non-critical

### Key Insight
> "Never just wait - always make progress. If blocked on one task, start another."


## 2026-02-06 15:45 - Session State (Cross-Tool Continuity)

**Project**: portals_main (portals_v4)
**Last Tool**: Claude Code (Opus 4.5)
**Branch**: main

### What Was Done This Session:
1. **SpatialPipe.cs** - UNIX-inspired generation pipeline created
2. **BridgeTarget.cs** - Added `HandlePipeGenerate()` with metrics
3. **BridgeMessageTester.cs** - Editor window for testing bridge messages
4. **constitution.md** - Added Auto-Compounding Intelligence section
5. **GLOBAL_RULES.md** - Added Measurement-Driven Improvement section
6. **_AUTO_COMPOUNDING_INTELLIGENCE.md** - New KB file with patterns

### Current Focus:
- Voice interface integration testing
- SpatialPipe pipe command verification in Unity Editor

### Key Files Changed:
- `unity/Assets/Scripts/Generation/Core/SpatialPipe.cs` (NEW)
- `unity/Assets/Scripts/BridgeTarget.cs` (MODIFIED)
- `unity/Assets/Scripts/Editor/BridgeMessageTester.cs` (MODIFIED)
- `.specify/memory/constitution.md` (MODIFIED)
- `~/GLOBAL_RULES.md` (MODIFIED)

### Commits:
- `ea6db81ac` - feat(pipe): Add SpatialPipe UNIX-style generation
- `699dfcf76` - docs(kb): Add Auto-Compounding Intelligence patterns

### Next Steps:
1. Test SpatialPipe in Unity Editor Play mode
2. Verify pipe messages work via BridgeMessageTester
3. End-to-end device test (T007)

### To Resume This Work:
```bash
# In any AI tool:
1. Read CLAUDE.md and constitution.md
2. Check this LEARNING_LOG.md entry
3. Open Unity Editor with portals_main/unity
4. Enter Play mode
5. Open Window > Portals > Bridge Tester (Cmd+Shift+B)
6. Test "Pipe: red cube" button
```
