# LLMR & XR+AI Architecture Patterns

**Last Updated**: 2026-02-08
**Source**: Microsoft LLMR (CHI 2024), MIT research, Google XR Blocks, spatial AI research

---

## LLMR (Large Language Model for Mixed Reality)

**Microsoft Research** framework for real-time XR scene creation via natural language prompting.
**Repository**: https://github.com/microsoft/LLMR
**Paper**: https://arxiv.org/html/2309.12276v2

### Core Capabilities

1. **Object Creation** - Unity primitives or Sketchfab 3D models via natural language
2. **Behavior Programming** - Runtime C# code generation for interactive tools
3. **Scene Editing** - Real-time modifications (colors, layouts, accessibility)
4. **Multi-Modal Generation** - DALL-E scene composition + CLIP semantic matching

### Multi-GPT Orchestration

| Component | Role | Implementation |
|-----------|------|----------------|
| **Planner (P)** | Decomposes user prompts into subtask sequences | Prompt chaining |
| **SceneAnalyzerGPT (SA)** | Scene understanding, object inventory with properties (size, color, functionality) | Context summarization |
| **SkillLibraryGPT (SL)** | Determines needed skills/capabilities for Builder | Skill routing + namespace resolution |
| **BuilderGPT (B)** | C# Unity code generation (architect) | Code synthesis from decomposed tasks |
| **InspectorGPT (I)** | Validates code, iterative self-debugging (compilation + runtime errors) | Error correction loops |

**Key Result**: 4x error rate reduction vs standalone GPT-4 through task planning, scene understanding, self-debugging, and memory management.

### Architecture Pattern

```
User Prompt → Planner (decompose) → Scene Analyzer (context)
                                           ↓
                                    Skill Library (select)
                                           ↓
                                    Builder (generate C#)
                                           ↓
                                    Inspector (validate)
                                           ↓
                                    Roslyn Compiler (runtime)
                                           ↓
                                    Unity Engine → XR Scene
                                           │
                └──────────────── Error Feedback Loop ─────────┘
```

---

## Unity Integration (LLMR Technical Implementation)

### Runtime C# Compilation

**Roslyn Compiler Integration** (Trivial Interactive package from Unity Asset Store):
- Runtime compilation of LLM-generated C# code
- Preloaded assembly DLLs in `Assemblies/` folder (project root)
- Assembly Reference Assets created via Trivial Interactive package
- Direct GameObject code attachment at runtime

**Why Roslyn**: Open-source alternatives lack built-in GameObject attachment mechanisms.

### OpenAI API Integration

**Wrapper Library**: https://github.com/RageAgainstThePixel/com.openai.unity

**Dependencies** (package manifest):
```json
{
  "com.openai.unity": "4.3.0",
  "com.siccity.gltfutility": "github-based",
  "openupm scoped registry": "package management"
}
```

### Unity Versions Tested

- Unity 2021.3.25f1
- Unity 2022.3.11f1

### Multi-Modal Pipeline (DALL-E + CLIP + Sketchfab)

**Flask Application**: `CLIP-DallE-SketchFab-001`
**Requirements**: Python 3.9+

**Endpoints**:
1. `/get_scene_from_prompt` - DALL-E generates scene composition images
2. `/get_image_from_prompt` - Creates target images for single objects
3. `/get_closest_skfb_model` - CLIP semantic similarity → optimal Sketchfab UID selection

**Workflow**:
```
Text Prompt → DALL-E (scene composition) → CLIP (semantic match) → Sketchfab (3D model retrieval) → Unity instantiation
```

### User Interaction Pattern

**Empty Playground Scene**:
- Natural language input in-game
- Tab key submits to Planner
- Right Control engages chat planner agent (complex requests)
- Asynchronous processing with "Processing finished" message
- Generated code visible on Builder GameObject (Output + History fields)

**Error Handling**:
- Console displays compilation errors
- Runtime errors logged post-generation
- Namespace resolution issues acknowledged (incomplete assembly DLL coverage)

---

## Prompt Engineering Patterns for Spatial Content

### Spatial Reasoning Techniques

1. **Spatial Prefix-Prompting (SPP)**
   - Pre-prompt with spatial associations before main task
   - 33% F1 gains on 3D trajectories
   - Example: "In a 3D space where X is forward, Y is up... [task]"

2. **Visualization-of-Thought (VoT)**
   - LLM visualizes spatial concepts during reasoning
   - 27% accuracy boost over chain-of-thought
   - Example: "Visualize the room layout as a grid... [task]"

3. **Chain-of-Symbol (CoS) Prompting**
   - Condensed symbols replace verbose natural language
   - Clearer prompts, enhanced spatial reasoning
   - Example: "🔵→🟢→🔴 means 'blue object in front of green, red behind'"

4. **Spatial-to-Relational (S2R)**
   - Transform spatial prompts into entity relations
   - Entity relation chains reduce hallucination
   - Example: "Object A (above B) AND (left-of C)" → relation graph

5. **Entity-Relation (ER) Construction**
   - Explicit entity + relationship identification
   - Significantly reduces spatial hallucination

### LLMR Skill Library Pattern

**Namespace as Skill** - Platform dependencies (namespaces, packages) added as "Skills":
```csharp
// Skill: Unity Physics
using UnityEngine;
public class PhysicsSkill : ISkill
{
    public string[] RequiredNamespaces => new[] { "UnityEngine", "UnityEngine.Physics" };
    public string Description => "Enable rigid body, collider, and force interactions";
}
```

**Quick Enable Interaction Modalities** - User adds capabilities by prompt:
```
User: "Enable hand tracking"
SkillLibrary: Adds XR Hands package namespace to Builder context
Builder: Generates code using UnityEngine.XR.Hands
```

### Meta Prompting

LLMs generating and optimizing their own prompts.

**Key Patterns**:

1. **Prompt Chaining**: Break complex tasks into subtask chain (LLMR Planner module)
2. **Self-Refinement**: Generate → Critique → Improve loop (LLMR Inspector module)
3. **Skill Selection**: Match intent to available capabilities (LLMR Skill Library)

**Self-Refinement Loop**:
```
Draft Response → Self-Critique (Inspector) → Feedback → Improved Response → (repeat until valid)
```

---

## Testing Without Hardware

### Mock Provider Pattern

- Priority -100 (lowest), only used when nothing else available
- Simulates all capabilities (`TrackingCap.All`)
- Generates realistic idle motion, occasional gestures

### Record & Replay

- Record sessions on device
- Replay in editor for testing
- Unit tests run against recordings

### Simulation-First Development (XR Blocks)

- Build/test in desktop browser
- Same code deploys to XR
- Web reproducibility for all demos

---

## Platform-Agnostic Design

### Zero External Dependencies Core

```csharp
namespace Tracking.Core
{
    // Pure C# - no Unity, no external libs
    public struct Vector3f { float X, Y, Z; }
    public struct JointData { int Id; Vector3f Position; float Confidence; }
}
```

### Capability-Based Routing

```csharp
[Flags]
public enum TrackingCap
{
    BodySegmentation24Part = 1 << 0,
    HandTracking21 = 1 << 1,
    // ... etc
}
```

### Layer Architecture

```
APPLICATION  - VFX, Avatars, Games (interfaces only)
SERVICE      - TrackingService, VoiceService (orchestration)
ABSTRACTION  - ITrackingProvider, IVoiceProvider (contracts)
ADAPTER      - ARKit, Meta, Sentis, WebXR implementations
PLATFORM     - Native SDKs, Hardware, OS APIs
```

Dependencies flow DOWN only.

---

## LLM Integration Patterns

### IContextProvider (like SceneAnalyzerGPT)

```csharp
public interface IContextProvider
{
    string GetContextSummary();
    Dictionary<string, object> GetContextDetails();
}
```

### ISkillRouter (like SkillLibraryGPT)

```csharp
public interface ISkillRouter
{
    ISkill SelectBestSkill(string intent, TrackingCap available);
}
```

### ISelfValidator (like InspectorGPT)

```csharp
public interface ISelfValidator
{
    ValidationResult Validate(object output);
    object FixIfPossible(object output, ValidationResult errors);
}
```

---

## XR+LLM Interaction Paradigms (CHI 2025)

1. **Understanding** - Users and contexts
2. **Responding** - To user requests
3. **Changing** - Contexts
4. **Prompting** - Users to act

### Five Pillars of Awareness

1. Situational
2. Self
3. Spatial
4. Social
5. **Ethical** (newly proposed)

---

## Debugging & Extension

### Hot-Swap Providers (Runtime)

- F1: Switch to Mock
- F2: Switch to Recording Playback
- F3: Return to Auto-Select

### Plugin Loading

Load providers from separate DLLs at runtime.

### Provider Composition

Wrap existing provider to add new capabilities without modification.

---

## Runtime vs Editor-Time Usage Patterns

### LLMR: Pure Runtime Generation

**Philosophy**: "Spontaneous user creation at runtime - a core element of VR since its inception"

**Characteristics**:
- Zero pre-compiled assets
- All code generated and compiled at runtime
- User types prompts in VR/MR experience
- Immediate feedback loop (seconds)
- No Unity Editor interaction required

**Trade-offs**:
- Runtime flexibility > compile-time safety
- Assembly DLL management required
- Potential namespace resolution errors
- Performance overhead of Roslyn compilation

### Editor-Time Pattern (Traditional)

**Characteristics**:
- LLM generates code/assets
- Developer reviews in Unity Editor
- Manual import, configuration, testing
- Compile-time safety, full IDE support

**Trade-offs**:
- Slower iteration (minutes)
- Full tooling support
- No runtime compilation overhead
- Higher quality assurance

### Hybrid Pattern (Recommended for Production)

**Editor-Time**: Generate reusable components, skills, templates
**Runtime**: Combine/configure pre-validated components via natural language

```csharp
// Editor-generated (validated)
public class GrabInteraction : ISkill { }
public class RotateAnimation : ISkill { }

// Runtime-generated (user prompt)
"Create a spinning cube that users can grab"
→ Combines GrabInteraction + RotateAnimation
→ Minimal code generation, safer execution
```

---

## AI-Assisted Unity XR Development Workflows

### Pattern 1: Content Pipeline Acceleration

**Challenge**: Manual 3D asset creation is slow, not scalable

**AI Solution**:
1. Text → 3D model (DALL-E + CLIP + Sketchfab via LLMR)
2. Text → texture (Unity Art Engine, Stable Diffusion)
3. Sketch → 3D (AI reconstruction)
4. Voice description → scene layout (LLMR Planner)

**Integration Point**: Editor import pipeline or runtime instantiation

### Pattern 2: Behavior Prototyping

**Challenge**: Prototyping interactions requires coding expertise

**AI Solution**:
1. Natural language → C# script (LLMR Builder)
2. Inspector validates before compilation
3. Rapid iteration on behaviors
4. User: "Make this grabbable" → generates XR interaction code

**Integration Point**: Runtime component attachment or Editor script generation

### Pattern 3: Scene Understanding & Context

**Challenge**: XR apps lack spatial awareness

**AI Solution**:
1. Scene Analyzer GPT summarizes environment
2. LLM suggests context-appropriate actions
3. Spatial reasoning for object placement
4. Example: "Add lighting for kitchen" → knows kitchen geometry

**Integration Point**: Scene query system + recommendation engine

### Pattern 4: Accessibility Adaptation

**Challenge**: One-size-fits-all XR experiences

**AI Solution**:
1. User voice: "I'm colorblind"
2. Scene Analyzer inventories scene colors
3. Builder generates color adjustment shaders
4. Real-time scene modification

**Integration Point**: Runtime scene modification pipeline

### Pattern 5: Smart NPCs & Narratives

**Challenge**: Static NPC dialogue, rigid narratives

**AI Solution**:
1. LLM-powered conversational NPCs (OpenAI Unity integration)
2. Context-aware responses (Scene Analyzer provides environment state)
3. Dynamic narrative branching
4. Personalized experiences based on user behavior

**Integration Point**: NPC dialogue system + narrative state machine

---

## Novel LLMR Approaches (Key Insights)

### 1. Ensemble of Specialized GPTs

**Innovation**: Domain-specific agents vs. monolithic LLM
**Result**: 4x error reduction
**Application**: Replicate pattern for other domains (audio, animation, networking)

### 2. Iterative Self-Debugging (Inspector Module)

**Innovation**: Automated compile + runtime error correction
**Result**: Code quality without manual review
**Application**: CI/CD pipelines, automated testing

### 3. Skill Library as Prompt Context

**Innovation**: Dynamic namespace injection based on user intent
**Result**: Reduced prompt size, faster generation
**Application**: Context-aware code completion, capability discovery

### 4. Multi-Modal Semantic Matching (CLIP)

**Innovation**: Visual + textual similarity for 3D model retrieval
**Result**: Better matches than text-only search
**Application**: Asset recommendation systems, style transfer

### 5. Planner Task Decomposition

**Innovation**: Complex prompt → subtask sequence
**Result**: Handling multi-step workflows
**Application**: Workflow automation, tutorial generation

---

## Key Takeaways

| Principle | Why | Unity XR Application |
|-----------|-----|----------------------|
| Multi-GPT orchestration | Specialized agents > monolithic LLM | Separate agents for scene, audio, VFX, networking |
| Self-refinement loops | Better accuracy, catches errors | Automated shader/script validation |
| Mock-first testing | Zero hardware dependency | Test XR features on desktop |
| Capability routing | Runtime adaptation | Platform-agnostic tracking, rendering |
| Layer isolation | Platform changes don't cascade | Abstract AR Foundation, Quest, visionOS |
| Runtime code generation | Spontaneous user creation | In-experience customization, modding |
| Spatial prompt engineering | Reduce LLM hallucination | Accurate object placement, navigation |

---

## Implementation Recommendations for Unity XR

### 1. Start with Skill Library Pattern

Create domain-specific skills (Grabbable, Teleportable, VFXEmitter) that LLMR-style system can compose.

### 2. Separate Editor & Runtime Pipelines

- **Editor**: Generate validated, reusable components
- **Runtime**: Compose pre-validated components via natural language

### 3. Use Spatial Prompting Techniques

Apply SPP, VoT, CoS patterns to reduce spatial hallucination in LLM-generated scenes.

### 4. Implement Scene Analyzer

Build system that summarizes scene state for LLM context (AR anchors, tracked objects, lighting).

### 5. Add Inspector/Validator

Catch errors before runtime, especially for VFX Graph property names, shader compatibility.

### 6. Multi-Modal Asset Retrieval

Integrate CLIP-style semantic matching for finding Unity Asset Store packages, Poly Haven assets.

---

## References

### Primary Sources
- [LLMR GitHub (Microsoft)](https://github.com/microsoft/LLMR)
- [LLMR Paper (CHI 2024)](https://dl.acm.org/doi/10.1145/3613904.3642579)
- [LLMR Project Page](https://llm4mr.github.io/)
- [LLMR arXiv Paper](https://arxiv.org/html/2309.12276v2)

### Spatial AI & Prompt Engineering
- [Spatial Reasoning in LLMs](https://www.emergentmind.com/topics/spatial-reasoning-in-llms)
- [Mitigating Spatial Hallucination (Nature)](https://www.nature.com/articles/s41598-025-93601-5)
- [LLM Reasoning Guide](https://www.promptingguide.ai/research/llm-reasoning)

### XR + AI Workflows
- [AI-Assisted Content Pipelines for XR (Thoughtworks)](https://www.thoughtworks.com/insights/blog/machine-learning-and-ai/ai-content-xr)
- [AI-Assisted XR Content Generation (XRPractices)](https://medium.com/xrpractices/ai-assisted-content-generation-pipeline-for-xr-bef6b7569d74)
- [Embedding LLMs into XR (arXiv)](https://arxiv.org/pdf/2402.03907)
- [AI Workflows for XR Developers](https://xraispotlight.substack.com/p/ai-workflows-for-xr-developers)

### Related Projects
- [3D-LLM: Injecting 3D World into LLMs](https://arxiv.org/abs/2307.12981)
- [Awesome-LLM-3D GitHub](https://github.com/ActiveVisionLab/Awesome-LLM-3D)
- [XR Blocks (Google)](https://research.google/blog/xr-blocks-accelerating-ai-xr-innovation/)
- [Meta Prompting Guide](https://www.promptingguide.ai/techniques/meta-prompting)

---

*See also: `_UNITY_INTELLIGENCE_PATTERNS.md`, `_AI_CODING_BEST_PRACTICES.md`, `_XR_AI_INDUSTRY_ROADMAP_2025-2027.md`*
