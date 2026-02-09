# Voice Composer Patterns

**Updated**: 2026-02-06 | **Confidence**: 95% verified

## Wire Format (Minimal Reactive Binding)

Simple 3-field JSON for connecting data sources to targets:

```json
{"src": "audio.bass", "mod": "scale:0.5", "tgt": "*.scale"}
```

| Field | Purpose | Examples |
|-------|---------|----------|
| `src` | Data source | `audio.bass`, `time.t`, `hand.dist`, `noise.v` |
| `mod` | Modifier chain | `scale:0.5`, `invert`, `sin:2`, `smooth:0.1` |
| `tgt` | Target property | `*.scale`, `cube.emission`, `*.alpha` |

**JS Implementation**: `src/lib/wire-interpreter.js` (~50 lines)
**Unity Implementation**: `WireSystem.cs` (~60 lines)

## Voice → Wire Translation

`VoiceToWire.cs` converts natural language to wires:

```csharp
// Pattern dictionaries
{"beat|music|audio", "audio.bass"}  // source
{"pulse|throb", "sin:2"}            // modifier
{"glow|emit", "*.emission"}         // target

// Fallback for unknown commands
Parse("make it funky") → {"src":"audio.bass", "mod":"sin:1", "tgt":"*.scale"}
```

## Scene Context (Contextual Awareness)

Gemini receives full scene state so it can reference existing objects:

```typescript
// SceneContext passed to buildPrompt()
{
  objectCount: 5,
  objects: [
    { uuid: "obj_1", name: "cube_obj_1", position: [0, 0, -2] },
    { uuid: "obj_2", name: "sphere_obj_2", position: [-1, 0, -2] }
  ]
}
```

**Prompt includes spatial descriptions**:
```
OBJECTS IN SCENE:
  1. "cube_obj_1" [id:obj_1] at (0.0, 0.0, -2.0) - center, eye-level, medium distance
  2. "sphere_obj_2" [id:obj_2] at (-1.0, 0.0, -2.0) - left, eye-level, medium distance
```

**Object Targeting**:
- By uuid: `{ uuid: "obj_1" }` - exact match from scene state
- By name/type: `{ objectName: "cube" }` - fuzzy match
- By position: "the one on the left" - Gemini interprets from positions

## Composer Bridge Actions

| Action | Description | Handler |
|--------|-------------|---------|
| `ADD_OBJECT` | Spawn primitive or GLB | `HandleAddObject` |
| `ADD_EMITTER` | Particle system/VFX | `HandleAddEmitter` |
| `MOVE_OBJECT` | Move by uuid/name | Supports uuid targeting |
| `REMOVE_OBJECT` | Remove by uuid/name | Supports uuid targeting |
| `GENERATE_STRUCTURE` | wall/tower/pyramid/igloo | Uses multiple `ADD_OBJECT` |
| `ARRANGE_FORMATION` | circle/line/grid | Position calculation |
| `BATCH_TRANSFORM` | Transform all objects | Iterates spawned objects |

## Emitter Presets (ParticleSystem Fallback)

```csharp
// When VFX Graph unavailable, creates basic ParticleSystem
switch (preset) {
    case "fire":   // orange, cone, fast upward
    case "snow":   // white, slow fall, box emitter
    case "sparkles": // yellow, sphere burst
    case "smoke":  // gray, cone, slow rise
    case "rain":   // blue-white, fast fall
    case "bubbles": // translucent, float up
    case "confetti": // multicolor, gravity fall
}
```

## Integration Pattern

```
Voice → Gemini 2.0 → SceneAction JSON → useComposerBridge → BridgeTarget.cs → Unity
         ↓                                      ↓
   Structured output              Maps action type to handler
```

## Key Learnings

1. **Simple primitives combine for complexity** - Wire format is just 3 strings
2. **Fallback chains are critical** - VFX Graph → ParticleSystem → basic object
3. **Action types are extensible** - Switch statement pattern in both TS and C#
4. **Position arrays must be `[x,y,z]`** - Not `{x,y,z}` objects

## Files

- `src/hooks/useComposerBridge.ts` - Action → Unity message mapping
- `src/services/aiSceneComposer.ts` - Voice → Gemini → Actions
- `unity/Assets/Scripts/BridgeTarget.cs` - Unity message handlers
- `unity/Assets/Scripts/WireSystem.cs` - Reactive binding system
- `unity/Assets/Scripts/VoiceToWire.cs` - NL → Wire conversion

## Thin Client & Meta-Registry Architecture (Restored 2026-02-09)

The system uses a "Meta-Registry" to ensure the AI, TypeScript, and Unity C# stay in sync without manual coding.

### 1. The Source of Truth: `unity/registry_config.json`
Define supported components, defaults, and editable properties in this file.

### 2. Auto-Generation: `scripts/generate_registry.cjs`
Running `npm run prebuild` triggers this script, which generates C# handlers, AI schema, and tests.

### 3. Unity Execution: `BridgeTarget.cs`
The bridge routes generic `ADD_COMPONENT` and `SET_PROPERTY` messages through the `ComponentRegistry`.

**Stable Baseline Commit**: `f43d94342` (Feb 9 01:54)
