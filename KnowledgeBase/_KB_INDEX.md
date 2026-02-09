# KnowledgeBase Index

**Files**: 174 | **Size**: ~4MB | **Updated**: 2026-02-05

> **On audits**: Verify Quick Access matches current projects. Check `ls -lt ~/Documents/GitHub/ | head -10` for active work. Archive stale files (>6 months). See GLOBAL_RULES.md §KB Relevance Check.

---

## Quick Access (Start Here)

| Need | File |
|------|------|
| Error fix | `_QUICK_FIX.md` |
| Unity MCP tools | `_UNITY_MCP_MASTER.md` |
| VFX patterns | `_VFX_MASTER_PATTERNS.md` |
| Compute shaders | `_COMPUTE_SHADER_PATTERNS.md` |
| AR Foundation | `_ARFOUNDATION_VFX_MASTER_LIST.md` |
| Token tips | `_TOKEN_EFFICIENCY_COMPLETE.md` |
| GitHub repos | `_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md` |
| Community sources | `_TRUSTED_COMMUNITY_SOURCES.md` |
| Visual debugging | `_KB_SEARCH_COMMANDS.md` §Screenshot Commands |

### portals_v4 Specific
| Need | File |
|------|------|
| UAAL iOS | `_UNITY_AS_A_LIBRARY_IOS.md` |
| RN Unity bridge | `_REACT_NATIVE_UNITY_PACKAGES.md` |
| Voice → Unity | `_VOICE_COMPOSER_PATTERNS.md` |
| Wire system | `_VOICE_COMPOSER_PATTERNS.md` |
| Hand VFX | `_HAND_VFX_PATTERNS.md` |
| Keijiro patterns | `_KEIJIRO_METAVIDO_VFX_RESEARCH.md` (**Updated 2026-02-08: Full architecture research**) |
| Icosa Gallery API | `_ICOSA_GALLERY_PATTERNS.md` |
| Normcore multiplayer | `_NORMCORE_MULTIPLAYER_PATTERNS.md` |

**Online KB**: `https://cdn.jsdelivr.net/gh/imclab/xrai@main/KnowledgeBase/`

---

## Claude Code (5 active + 4 archived)

| File | Content |
|------|---------|
| `_CLAUDE_CODE_MASTER.md` | Features, workflows, commands |
| `_CLAUDE_CODE_OFFICIAL_BEST_PRACTICES.md` | **Official best practices (Feb 2026)** |
| `_CLAUDE_CODE_HOOKS.md` | Hooks reference & patterns |
| `_CLAUDE_CODE_SUBAGENTS.md` | Subagent patterns |
| `_CLAUDE_CODE_UNITY_WORKFLOW.md` | Unity-specific workflows |

**Archived** (in `_archive/`):
- `_CLAUDE_CODE_ARCHITECTURE_DEEP_DIVE.md` - Deep dive (superseded by OFFICIAL)
- `_CLAUDE_CODE_WORKFLOW_OPTIMIZATION.md` - Merged into TOKEN docs
- `_CLAUDE_CODE_INSIGHTS_CHECKLIST.md` - Checklist format

## Unity (28 files)

### Core
| File | Content |
|------|---------|
| `_UNITY_MCP_MASTER.md` | MCP tools + dev hooks |
| `_UNITY_MCP_QUICK_REFERENCE.md` | MCP quick reference |
| `_UNITY_MCP_DEV_HOOKS.md` | MCP development hooks |
| `_UNITY_DEBUGGING_MASTER.md` | Console, errors, analysis |
| `_UNITY_DEBUGGING_REFERENCE.md` | Debugging reference |
| `_UNITY_EDITOR_ERROR_LOG_ANALYSIS.md` | Error log analysis |
| `_UNITY_INTELLIGENCE_PATTERNS.md` | AI integration patterns |
| `_UNITY_PATTERNS_BY_INTEREST.md` | Patterns by topic |
| `_UNITY_SOURCE_REFERENCE.md` | Unity source code refs |
| `_MAC_UNITY_OPTIMIZATION.md` | macOS optimization |

### Unity as a Library (UAAL)
| File | Content |
|------|---------|
| `_UNITY_UAAL_MASTER.md` | UAAL master reference |
| `_UNITY_AS_A_LIBRARY_IOS.md` | iOS UAAL integration |
| `_UNITY_AS_A_LIBRARY_ANDROID.md` | Android UAAL integration |
| `_UNITY_AS_A_LIBRARY_OVERVIEW.md` | UAAL overview |
| `_REACT_NATIVE_UNITY_PACKAGES.md` | RN Unity packages comparison |
| `_REACT_NATIVE_UNITY_FABRIC_FIX.md` | Fabric fix documentation |

### Rendering
| File | Content |
|------|---------|
| `_UNITY_RENDERING_MASTER.md` | URP, post-processing, HLSL |
| `_UNITY_URP_OPTIMIZATION.md` | URP optimization |
| `_UNITY_URP_POST_PROCESSING.md` | URP post-processing |
| `_UNITY6_HLSL_COMPUTE_SHADER_GUIDE.md` | Unity 6 HLSL/compute |
| `_RENDER_PIPELINE_DETECTION.md` | Pipeline detection |

### ML/AI
| File | Content |
|------|---------|
| `_UNITY_ML_MASTER.md` | Sentis, ONNX inference |
| `_UNITY_SENTIS_ML_INFERENCE.md` | Sentis ML inference |
| `_UNITY_SENTIS_ONNX_MOBILE_XR_RESEARCH_2026.md` | Sentis/ONNX research 2026 |
| `_ONNXRUNTIME_UNITY_EXAMPLES.md` | ONNX Runtime examples |
| `_OPENCV_VS_MEDIAPIPE_UNITY_RESEARCH.md` | OpenCV vs MediaPipe |

### Assets
| File | Content |
|------|---------|
| `_UNITY_ASSET_MANAGEMENT.md` | Addressables, bundles |

## VFX Graph (19 files)

### Core
| File | Content |
|------|---------|
| `_VFX_MASTER_PATTERNS.md` | VFX Graph patterns |
| `_VFX_QUICK_REF.md` | VFX quick reference |
| `_VFX_GRAPH_YAML_REFERENCE.md` | VFX Graph YAML reference |
| `_VFX_PIPELINE_COMPARISON.md` | Pipeline comparison |

### Bindings
| File | Content |
|------|---------|
| `_VFX_BINDINGS_MASTER.md` | Property bindings master |
| `_VFX_SOURCE_BINDINGS.md` | Source bindings |
| `_VFX_SOURCES_REGISTRY.md` | Sources registry |
| `_AKVFX_SDFVFX_BINDING_SPECIFICATION.md` | AKVFX/SDFVFX bindings |
| `_LASPVFX_AUDIO_BINDING_PATTERNS.md` | LaspVFX audio bindings |
| `_RCAM_VFX_BINDING_SPECIFICATION.md` | RCAM VFX bindings |

### AR/XR VFX
| File | Content |
|------|---------|
| `_VFX_AR_MASTER.md` | AR + VFX integration |
| `_AR_VFX_HUMAN_PARTICLE_PATTERNS.md` | Human particle patterns |
| `_HAND_VFX_PATTERNS.md` | Hand VFX patterns |
| `_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md` | AR Foundation VFX KB |
| `_ARFOUNDATION_VFX_MASTER_LIST.md` | AR Foundation VFX list |

### Specialized
| File | Content |
|------|---------|
| `_VFX25_HOLOGRAM_PORTAL_PATTERNS.md` | Hologram/portal VFX |
| `_GAUSSIAN_SPLATTING_VFX_PATTERNS.md` | Gaussian splatting VFX |
| `_KEIJIRO_AUDIO_VFX_RESEARCH.md` | Keijiro audio VFX |
| `_KEIJIRO_METAVIDO_VFX_RESEARCH.md` | Keijiro Metavido research |

## XR/AR (10 files)

| File | Content |
|------|---------|
| `_XR_CAPABILITIES_MASTER.md` | AR Foundation, hand tracking |
| `_XRAI_MASTER.md` | XRAI format spec |
| `_XRAI_FORMAT_RESEARCH_2026.md` | XRAI format research |
| `_XRAI_HYPERGRAPH_WORLD_GENERATION.md` | Hypergraph world gen |
| `_XR_SCENE_FORMAT_COMPARISON.md` | Scene format comparison |
| `_XR_AI_INDUSTRY_ROADMAP_2025-2027.md` | Industry roadmap |
| `_ARFOUNDATION_TRACKING_CAPABILITIES.md` | AR tracking capabilities |
| `_HAND_SENSING_CAPABILITIES.md` | Hand sensing |
| `_VISION_PRO_SPATIAL_PERSONAS_PATTERNS.md` | visionOS patterns |
| `_HCI_SPATIAL_DESIGN_PRINCIPLES.md` | Spatial design |

## MCP (9 files)

| File | Content |
|------|---------|
| `_MCP_SERVER_MANAGEMENT.md` | **Server deduplication, hooks vs LaunchAgents** |
| `_MCP_MODEL_CONTEXT_PROTOCOL.md` | MCP protocol reference |
| `_MCP_TYPESCRIPT_SDK.md` | TypeScript SDK |
| `_MCP_BUILD_SERVER_CLIENT.md` | Build server/client |
| `_BUILDING_MCP_WITH_LLMS.md` | Building MCP with LLMs |
| `_GEMINI_UNITY_MCP_SETUP.md` | Gemini Unity MCP setup |
| `_UNITY_MCP_MASTER.md` | (also in Unity section) |
| `_UNITY_MCP_QUICK_REFERENCE.md` | (also in Unity section) |
| `_UNITY_MCP_DEV_HOOKS.md` | (also in Unity section) |

## Hologram/Recording (10 files)

| File | Content |
|------|---------|
| `_HOLOGRAM_MASTER.md` | Recording, playback master |
| `_HOLOGRAM_RECORDING_PLAYBACK.md` | Recording/playback details |
| `_COMPREHENSIVE_HOLOGRAM_PIPELINE_ARCHITECTURE.md` | Pipeline architecture |
| `_H3M_HOLOGRAM_ROADMAP.md` | H3M roadmap |
| `_HOLOGRAM_VERIFICATION_2026-01-15.md` | Verification Jan 2026 |
| `_RCAM_MASTER.md` | Keijiro RCAM patterns |
| `_RCAM_QUICK_REFERENCE.md` | RCAM quick reference |
| `_RCAM_SERIES_ARCHITECTURE_RESEARCH.md` | RCAM architecture |
| `_REPLAYKIT_VS_ARVIEWRECORDER.md` | Recording comparison |
| `_AR_RECORDING_COMPARISON_METAVIDO_VS_RERUN.md` | Metavido vs Rerun |

## Web/WebGL (15 files)

| File | Content |
|------|---------|
| `_WEB_MASTER.md` | WebGL, WebGPU, WebRTC |
| `_WEBGL_3D_VISUALIZATION_PATTERNS.md` | 3D viz, Three.js, D3.js |
| `_WEBGL_THREEJS_COMPREHENSIVE_GUIDE.md` | Three.js guide |
| `_WEBGL_INTELLIGENCE_PATTERNS.md` | WebGL patterns |
| `_WEBGPU_THREEJS_2025.md` | WebGPU + Three.js |
| `_WEB_INTEROPERABILITY_STANDARDS.md` | Web interop |
| `_WEBRTC_MULTIUSER_MULTIPLATFORM_GUIDE.md` | WebRTC multiuser |
| `_WEBXR_DEVICE_API_EXPLAINER.md` | WebXR Device API |
| `_WEBXR_MODEL_VIEWER.md` | Model viewer |
| `_CROSS_PLATFORM_ASSET_LOADING.md` | glTF, asset loading |
| `_3D_VISUALIZATION_KNOWLEDGEBASE.md` | 3D viz KB |
| `_3DVIS_INTELLIGENCE_PATTERNS.md` | 3D viz patterns |
| `_COSMOS_VISUALIZATION_RESOURCES.md` | Cosmos viz |
| `_ECHARTS_VISUALIZATION_PATTERNS.md` | ECharts patterns |
| `_VISUALIZATION_RESOURCES_INDEX.md` | Viz resources index |

## AI/ML (12 files + OpenClaw research in LEARNING_LOG.md)

| File | Content |
|------|---------|
| `_ML_RESEARCH_MASTER.md` | Style transfer, CV |
| `_AI_CODING_BEST_PRACTICES.md` | AI coding patterns |
| `_ML_CV_CROSSPLATFORM_COMPATIBILITY_RESEARCH.md` | Cross-platform ML/CV |
| `_LIVE_AI_STYLE_TRANSFER_NEURAL_OVERLAY.md` | Live style transfer |
| `_AI_AGENT_PHILOSOPHY.md` | AI agent philosophy |
| `_AI_MEMORY_SYSTEMS_DEEP_DIVE.md` | Memory systems deep dive |
| `_AI_CHARACTER_PATTERNS.md` | AI character patterns |
| `_AI_ENTRY_POINT.md` | AI entry point |
| `_AI_HEALTH_SCRIPTS.md` | AI health scripts |
| `_AI_CONFIG_FILES_REFERENCE.md` | AI config reference |
| `_ADVANCED_AI_INFRASTRUCTURE_GUIDE.md` | Advanced AI infrastructure |
| `_COMPREHENSIVE_AI_DEVELOPMENT_GUIDE.md` | Comprehensive AI guide |
| `LEARNING_LOG.md` | **Feb 8: OpenClaw agent patterns (10 searches)** |

## Tools/Integration (15 files)

| File | Content |
|------|---------|
| `_CROSS_TOOL_ARCHITECTURE.md` | Multi-tool setup |
| `_TOOL_INTEGRATION_MAP.md` | Tool capabilities |
| `_OPEN_MULTIBRAIN_SYNC.md` | Cross-tool sync |
| `_CROSS_TOOL_ROLLOVER_GUIDE.md` | Tool rollover guide |
| `_TOKEN_EFFICIENCY_COMPLETE.md` | Token optimization |
| `_OPENBRUSH_BRUSH_SYSTEM_PATTERNS.md` | Brush patterns |
| `_GAUSSIAN_SPLATTING_AND_VIZ_TOOLS.md` | Gaussian splatting tools |
| `_IDE_EXTENSIONS_AND_MODELS.md` | IDE extensions |
| `_MASTER_AI_TOOLS_REGISTRY.md` | AI tools registry |
| `_SHELL_CONFIG_REFERENCE.md` | Shell config |
| `_CLAUDE_AI_DOCUMENTATION.md` | Claude AI docs |
| `_OH_MY_CLAUDECODE_PATTERNS.md` | oh-my-claudecode patterns |
| `_EXPO_SDK_DOCUMENTATION.md` | Expo SDK docs |
| `AI_CLI_TOOLS_REFERENCE.md` | AI CLI tools |
| `KB_TOOLS_REFERENCE.md` | KB tools reference |

## Operations (12 files)

| File | Content |
|------|---------|
| `_QUICK_FIX.md` | Error → fix lookup |
| `_AUTO_FIX_PATTERNS.md` | Extended fix patterns |
| `_TRUSTED_COMMUNITY_SOURCES.md` | Forums, subreddits, experts |
| `_KB_HEALTH.md` | KB health & auto-improve |
| `_SELF_HEALING_SYSTEM.md` | Self-healing system |
| `_CONTINUOUS_LEARNING_SYSTEM.md` | Continuous learning |
| `_SELF_IMPROVING_MEMORY_ARCHITECTURE.md` | Self-improving memory |
| `_INTELLIGENCE_SYSTEMS_INDEX.md` | Intelligence systems |
| `_SIMPLIFIED_INTELLIGENCE_CORE.md` | Simplified core |
| `LEARNING_LOG.md` | Session discoveries |
| `AUTOMATION_QUICK_START.md` | Automation scripts |
| `_AUTOMATED_MAINTENANCE_GUIDE.md` | Maintenance guide |

## Reference (30+ files)

### GitHub/Repos
| File | Content |
|------|---------|
| `_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md` | 520+ repo index |
| `_GITHUB_TRENDING_INDEX.md` | Trending repos |
| `_KEY_PEOPLE_INDEX.md` | Researchers, visionaries |

### Project-Specific
| File | Content |
|------|---------|
| `_PORTALS_V4_CURRENT.md` | Current project state |
| `_PORTALS_V4_ARCHITECTURE.md` | V4 architecture |
| `_PORTALS_AR_FEATURES_SUMMARY.md` | AR features summary |
| `_ADVANCED_AR_FEATURES_IMPLEMENTATION_PLAN.md` | AR features plan |
| `_JT_PRIORITIES.md` | User priorities |
| `_USER_PATTERNS_JAMES.md` | Working patterns |

### Methodology
| File | Content |
|------|---------|
| `_SPEC_KIT_METHODOLOGY.md` | Spec-kit method |
| `_PATTERN_ARCHITECTURE.md` | Pattern architecture |
| `_PATTERN_TAGS.md` | Tag reference |
| `_PERFORMANCE_PATTERNS_REFERENCE.md` | Performance patterns |
| `_LLMR_XR_AI_ARCHITECTURE_PATTERNS.md` | LLM + XR patterns |
| `_MULTI_AGENT_COORDINATION.md` | Multi-agent coordination |
| `_WARPJOBS_INTELLIGENCE_FINDINGS.md` | WarpJobs findings |

### System/Config
| File | Content |
|------|---------|
| `_SYSTEM_ARCHITECTURE.md` | System arch |
| `_PROJECT_CONFIG_REFERENCE.md` | Config files |
| `_REPO_GRAPH_SCHEMA.md` | Graph schema |
| `_GLOBAL_RULES_AND_MEMORY.md` | Rules & memory |
| `_DIRECTIVE_CONFLICTS_RESOLUTION.md` | Conflict resolution |

### Notion
| File | Content |
|------|---------|
| `_NOTION_MASTER.md` | Notion sync |
| `_NOTION_PAGES_INDEX.md` | Notion pages |
| `_NOTION_SYNC_GUIDE.md` | Sync guide |

### Other
| File | Content |
|------|---------|
| `_UNIFIED_AUDIO_REACTIVE_PATTERNS.md` | Audio reactive |
| `_OFFICIAL_SOURCES_LATEST_UPDATES.md` | Official docs |
| `_KB_META.md` | KB metadata |
| `CLOUD_NATIVE_KB_ARCHITECTURE_2025.md` | Cloud KB arch |
| `TROUBLESHOOTING_AND_LOGIC.md` | Debug patterns |
| `KB_ARCHITECTURE_DIAGRAM.md` | KB architecture |
| `KB_IMPLEMENTATION_QUICKSTART.md` | KB quickstart |
| `SESSION_CHECKPOINT_2026-01-14.md` | Session checkpoint |

---

## KB System Files

| File | Content |
|------|---------|
| `_KB_INDEX.md` | This index |
| `_KB_ACCESS_GUIDE.md` | Access guide |
| `_KB_CROSS_LINKS.md` | Cross-links |
| `_KB_SEARCH_COMMANDS.md` | Search commands |
| `_INDEX.md` | Legacy index |
| `_MASTER_KNOWLEDGEBASE_INDEX.md` | Legacy master index |
| `_CORE.md` | Core system |

---

## External References

| Resource | URL |
|----------|-----|
| Anthropic Cookbook | https://github.com/anthropics/anthropic-cookbook |
| Unity MCP Reference | https://github.com/CoplayDev/unity-mcp |
| Online KB (CDN) | https://cdn.jsdelivr.net/gh/imclab/xrai@main/KnowledgeBase/ |

---

## Search

```bash
# Local search
grep -ri "term" ~/.claude/knowledgebase/

# Shell aliases (if configured)
kb "search term"
kbfix "error code"
kbtag "vfx"
```

**Tags**: `#unity` `#vfx` `#ar` `#ml` `#tools` `#web` `#fix` `#claude` `#mcp`
