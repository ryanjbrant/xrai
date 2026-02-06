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

## Composer Bridge Actions

| Action | Description | Handler |
|--------|-------------|---------|
| `ADD_OBJECT` | Spawn primitive or GLB | `HandleAddObject` |
| `ADD_EMITTER` | Particle system/VFX | `HandleAddEmitter` |
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
