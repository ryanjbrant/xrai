# Cross-Tool Session Insights

> Extracted 2026-02-12 from Kilo Code, Roo Cline, Claude Dev, and Gemini CLI chat histories.
> Source sessions documented in `_AI_CHAT_HISTORY_LOCATIONS.md`.

---

## 1. Architecture Patterns

### OpenClaw 6-Stage Agent Pipeline
Source: Kilo Code session `019c4b28` (kb-cli creation)

A proven architecture for building Claude Code-like CLI agents:

| Stage | Name | Responsibility |
|-------|------|---------------|
| 1 | Channel Adapter | Normalize any input format to `KBMessage` dataclass |
| 2 | Gateway | Session coordination, state management, transcript setup |
| 3 | Task Router | Analyze message for parallelism safety, match skills |
| 4 | Agent Runner | Build context from KB, assemble prompt, select model |
| 5 | Execution | Call model, parse tool calls, execute tools |
| 6 | Response Path | Format output with tool results |

Implementation: `kb-cli/kb` lines 470-810.

### Lane Queue Pattern (Serial + Controlled Parallelism)
Source: Kilo Code session `019c4b28`

Serial-by-default execution with bounded parallelism for read operations:
- **Read operations** (search, grep, list, find, show, get) -> parallel queue, semaphore-bounded (max 4)
- **Write operations** -> serial queue, one at a time
- **Priority keywords** ("urgent", "critical", "error", "fix", "security") get priority=10

This mirrors Claude Code's internal tool execution model.

### Conditional Compilation Guard for Optional SDKs
Source: Roo Cline session `019c4b1b` (Normcore plan)

```csharp
#if NORMCORE_AVAILABLE
// Normcore-dependent code here
#endif
```

Add scripting define to Player Settings when SDK is present. Ensures clean compilation without optional dependencies. Apply to: Normcore, ARKit Face Tracking, Immersal, any optional SDK.

### Skill Discovery Pattern
Source: Kilo Code session `019c4b28`

JSON skill files in discoverable directories, loaded at startup:
- Project-level: `.kb/skills/*.json`
- Tool-level: `kb-cli/skills/*.json`
- Schema: `{name, description, command (template), parameters}`
- Matched against user input for rapid command expansion
- Reusable across any agentic CLI tool

### Hierarchical Configuration
Source: Both Kilo Code sessions

Standard pattern across Claude Code, Codex, and similar tools:
```
CLI args > Environment variables > User config (~/.config/) > Defaults
```

### Chrome Extension KB Integration
Source: Roo Cline session `019c4b1b`

Full Manifest V3 extension architecture:
- Background service worker manages state
- Content scripts capture page data
- Popup provides UI with suggestion engine
- Suggestion scoring: goalRelevance (0.4) + contextMatch (0.3) + timeSensitivity (0.2) + userPreference (0.1)
- Connected to local KB-CLI server on localhost:8000

---

## 2. Tools Built

### kb-cli (Python Agentic CLI)
- **Location**: `kb-cli/kb` (975 lines Python3)
- **Built in**: Kilo Code (Windsurf), 2026-02-11
- **Models**: Ollama qwen2.5:7b-instruct (text) + qwen2.5-vl:7b (vision)
- **Features**: Interactive REPL, single-command, file attachment, MCP client, JSONL transcripts
- **Tools**: read_file, write_to_file, search_files, list_files, git, run_command, kb_search, mcp_call

### Chrome Extension for KB
- **Location**: `kb-cli/chrome-extension/` (18 files)
- **Features**: Tab tracking, knowledge capture, suggestion engine, history analysis, knowledge graph
- **Status**: Foundation built, needs server component wired up

### Normcore AR Multiuser Drawing Plan
- **Location**: `plans/010-normcore-ar-multiuser-implementation-plan.md` (26KB)
- **Built in**: Roo Cline Architect mode, 2026-02-11
- **Scope**: 4-sprint plan adapting VR Normcore multiplayer drawing for iOS AR Foundation
- **Key mapping**: XR controller -> Touch raycast, OpenXR trigger -> Touch state machine

### Unity Automation Framework
- **Location**: `kb-cli/automation/`
- **Components**: AutomationManager.cs, SystemMonitor.cs, AutomationWindow.cs
- **Features**: Automated testing, stall detection, CPU/memory monitoring, retry queues

---

## 3. Known Bugs in kb-cli (Fix Before Use)

| Bug | Location | Fix |
|-----|----------|-----|
| argparse `show_version` | `kb` line 947 | Use `action='version', version=f'KB CLI v{VERSION}'` |
| `tool_ls` variable mismatch | `kb` line 775 | Change `f.name` to `i.name` |
| Missing tool handlers | `tool_git`, `tool_run` | Add method implementations to `KBAgent` class |
| Streaming response parsing | `_call_model()` | Handle streaming vs non-streaming Ollama response |
| No conversation history | `_call_model()` | Populate `history` list from session state |
| Chrome manifest JSON | `manifest.json` line 2 | Remove stray `i` character before `"manifest_version"` |
| Duplicate .env key | `.env` lines 1-2 | Remove duplicate `OPENROUTER_API_KEY` |
| SECURITY: Exposed API key | `kb-cli/.env` | Rotate key, add to .gitignore |

---

## 4. Cross-Tool Memory Insights

### MCP Memory is the Only True Cross-Tool Memory
Source: Gemini session (Feb 9)

All other memory mechanisms (CLAUDE.md, session files, .gemini/session_memories) are tool-specific. MCP Memory (knowledge graph: entities + relations + observations) is the only system readable/writable by any tool with MCP access.

### Token Rollover Strategy
Source: Kilo Code session `019c4ba8`

```
Claude Code (200K) -> Gemini (1M FREE) -> Codex (128K)
```

When one tool's token budget is exhausted, switch to the next. Free/local models (Ollama) have unlimited tokens.

### Gemini Session Memories Are Unreliable
`~/.gemini/session_memories/*.md` files contain only empty "Session Update" timestamps. Discoveries in Gemini only persist if committed to git. Always commit insights immediately.

### Tool Selection Matrix
| Task | Best Tool | Rationale |
|------|-----------|-----------|
| Implementation | Claude Code / Codex | Strong agentic coding + MCP |
| Research | Gemini / Antigravity | Very large context windows |
| Quick edits | Windsurf / Cursor | Fast IDE loop |
| Navigation | Rider | JetBrains indexed search |
| KB operations | kb-cli (local) | Free, fast, Ollama-powered |

---

## 5. VFX Pipeline Resolution (MetavidoVFX Deep Analysis)

Source: Gemini CLI session `session-2026-02-10T20-32` (168 messages, 12.6MB)

### Definitive Pipeline: Hybrid Bridge
The VFX pipeline is standardized on the **Hybrid Bridge** pattern:
- **Core**: `ARDepthSource` (O(1) compute dispatch) + `VFXARBinder` (Universal Binding)
- **Performance**: Single GPU dispatch (`DepthToWorld.compute`) handles person/background separation via Hardware Stencil once for all active VFX
- **Encoding**: `DepthHueEncoder.compute` uses `Hue2RGB()` with `mtvd_DepthHueMargin` (0.01) and `mtvd_DepthHuePadding` (0.01) -- verified bit-exact match with Keijiro's Metavido standard
- **Multiplexed layout**: RGB Left, Stencil Top-Right, Hue-Depth Bottom-Right

### Pipeline Comparison (Keijiro vs Local vs Portals V4)

| Feature | Keijiro Reference | MetavidoVFX (Local) | Portals V4 |
|---------|------------------|--------------------|-----------|
| Data Source | `XRDataProvider` (raw) | `ARDepthSource` (unified) | `ARDepthSource` (ported) |
| Compute | Duplicates per VFX | O(1) singleton | O(1) singleton |
| VFX Binding | Manual per-graph | `VFXARBinder` universal | `VFXARBinder` ported |
| VFX Switching | `VfxSwitcher.cs` | Same pattern | Same pattern |

### Key Formats Discovered
- **Metawire (`.metawire`)**: YAML ScriptedImporter for procedural geometry (lines, quads, grids). Tiny file, mesh baked at editor time by `Metawire.Importer`. Zero runtime cost.
- **VFX Block (`.vfxblock`)**: Reusable VFX Graph sub-components (filter, sample, inverse projection)
- **ShaderGraph (`.shadergraph`)**: Node-based shader definitions for URP

### Files Created by Gemini
- `MetavidoVFX-main/Assets/Scripts/Editor/VFXGraphValidator.cs` -- Validates all VFX graphs against Hybrid Bridge standard
- `migrate_polish.sh` -- Migration script for CameraProxy, Stochastic Transparency, flagship VFX
- `run_vfx_validation_cli.sh` -- CLI validation runner

### CodeViz C4 Architecture Diagrams (Jan 11)
Source: Gemini CLI via CodeViz VS Code extension
- `knowledge_base_architecture.cv` -- C4 Context/Container diagram of full KB system
- `knowledge_base_data_flow.cv` -- Data flow diagram
- `knowledge_ingestion_and_learning_flow.cv` -- Activity diagram for KB learning
- Location: `~/Library/Application Support/Code/User/workspaceStorage/.../CodeViz.codeviz/graphs/`

---

## 6. Normcore AR Adaptation Playbook

Source: Roo Cline session `019c4b1b`

### VR-to-AR Mapping Table
| VR Concept | AR Equivalent |
|-----------|---------------|
| XR controller tracking | Touch raycast on AR planes |
| 6DOF headset | ARKit world tracking |
| OpenXR trigger (button) | Touch begin/move/end state machine |
| Built-in render pipeline | URP materials |
| VR locomotion | AR session origin placement |
| Controller haptics | Taptic engine feedback |

### Implementation Order
1. Sprint 0: SDK setup + scene creation
2. Sprint 1: Basic brush input + room connection
3. Sprint 2: Stroke sync + late joiner support
4. Sprint 3: Voice chat + UI + performance testing

Full plan: `plans/010-normcore-ar-multiuser-implementation-plan.md`

---

## 7. Bridge & Voice AI Architecture

Source: Gemini CLI session `session-2026-02-10T22-42` (230 msgs) + `session-2026-02-09T05-17` (610 msgs)

### Data-Driven ComponentRegistry
- Transition from `else-if` chains in `BridgeTarget.cs` to `ComponentRegistry.cs` + `registry_config.json`
- IL2CPP-safe dictionary of component adders and property setters (14 components, 40+ properties)
- Auto-generated by `generate_registry.cjs` from config
- Goal: reduce triple-commit problem (Unity C# + React Native TS + AI Schema) to single commit

### Dynamic VFX Property Discovery
- `GetParameters` reflects on `VisualEffectAsset` at runtime, returning JSON schema of all exposed properties
- No hardcoded property allowlists -- fully dynamic
- Property ID caching via `Shader.PropertyToID` for compiled-C# performance
- Type inference for voice AI: `"0.5"` -> Float, `"[1,0,0]"` -> Vector3, `"#FF0000"` -> Color

### Voice AI VFX Control Patterns
- **"Spawn" Boolean Pattern**: Toggle VFX on/off via `Spawn` boolean instead of `SetActive`/`Destroy`. Particles die naturally for professional cross-fade. From Keijiro's `VfxSwitcher.cs` using `Awaitable.WaitForSecondsAsync()` (Unity 6).
- **Event-Driven Control**: `SendEvent` with `VFXEventAttribute` payloads for atomic position+velocity+color (no race conditions)
- **"Attribute Hallucination"**: AI can invent custom attribute names. If exposed property exists, applied silently; if not, ignored gracefully.
- **Semantic VFX naming**: `{effect}_{source}_{target}_{origin}.vfx`

### Coplay MCP Insights
- `BatchExecute` runs sequentially on main thread for safety; batching reduces IPC overhead
- Tools internally check for asset types (prefab vs primitive) -- "Resource-First Grounding"
- 86 tools available through Coplay MCP

---

## 8. Codebase Cleanup Patterns (Jan 22 Session)

Source: Gemini CLI session `session-2026-01-22T01-43` (266 msgs, ~6.3 hours)

### RenderTexture.active Bug Pattern
Root cause of "Reading pixels out of bounds" across multiple scripts:
- Scripts assigned `RenderTexture.active` but failed to restore previous state
- **Fix**: Always save/restore `RenderTexture.active` with `try-finally` around every `ReadPixels` call
- Set `RenderTexture.active` explicitly immediately before reading
- Add `IsCreated()` guards before operations

### Legacy Code Migration
- Move deprecated code to `.deprecated/` outside `Assets/` to reduce Unity scan noise
- Keep actively-referenced legacy scripts in `Assets/Scripts/_Legacy/`
- Use `System.Reflection` in migration tools to avoid compile-time dependencies on legacy code

### Tool Scoping (Unity MCP)
- `batch_execute` can only call tools registered within the Unity server
- `read_file`, `write_file`, `grep` are project/system tools outside Unity
- This is a critical architectural boundary for agent tool routing

---

## 9. Missing Pieces for Portals V4 MVP

Consolidated from all Gemini sessions:

| Component | Source | Status | Priority |
|-----------|--------|--------|----------|
| Camera Proxy (AxisLines, Frustum, ImagePlane) | MetavidoVFX golden master | Needs migration | Medium |
| Stochastic Transparency shader | MetavidoVFX `RcamBackground.shader` | Needs migration | High |
| Displaced Mesh Builder | MetavidoVFX `MeshBuilder.compute` | Needs migration | Medium |
| Metawire package | MetavidoVFX | Needs migration | Low |
| VFX multi-mode (Spec 007) | Not started | Beat detection + VFXModeController | High |
| Device testing (all VFX modes) | Not done | Required before MVP | Critical |
| VFXGraphValidator run | Script created, not executed | Validate 418+ graphs | Medium |

---

## 10. Reusable Patterns Summary

1. **6-Stage Agent Pipeline** -- For any CLI agent tool
2. **Lane Queue** -- Serial writes, parallel reads, priority escalation
3. **Conditional Compilation** -- `#if SDK_AVAILABLE` for optional Unity dependencies
4. **Skill Discovery** -- JSON skills in `.kb/skills/` dirs
5. **Chrome Extension KB Bridge** -- Manifest V3 + localhost server pattern
6. **Zero-Token KB Search** -- grep KB before sending to model (free context enrichment)
7. **JSONL Transcript Logging** -- Per-session audit trail for replay/debugging
8. **CDN KB Access** -- `cdn.jsdelivr.net/gh/imclab/xrai@main/KnowledgeBase/{file}` for tool-agnostic access
9. **Smart KB Fallback** -- Local (~1ms) -> CDN (~100ms) -> Model search (tokens)
10. **RenderTexture.active save/restore** -- Always wrap `ReadPixels` in try-finally with state save/restore
11. **VFX Spawn Boolean** -- Toggle particle systems via exposed bool, not SetActive/Destroy
12. **Dynamic Property Discovery** -- Reflect on VisualEffectAsset at runtime for AI-driven VFX
13. **O(1) Compute Singleton** -- Single dispatch shared by all consumers (ARDepthSource pattern)
14. **Data-Driven Registry** -- Config JSON + codegen script replaces hardcoded handler chains

---

*Updated: 2026-02-12. See `_AI_CHAT_HISTORY_LOCATIONS.md` for session source paths.*
