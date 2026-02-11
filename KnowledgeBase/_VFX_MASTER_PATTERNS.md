# VFX Graph YAML Reference (Detailed)

**Tags**: #vfx #yaml #unity #detailed-spec
**Quick ref**: `_VFX_QUICK_REF.md` | **AR**: `_VFX_AR_MASTER.md` | **Bindings**: `_VFX_BINDINGS_MASTER.md`

Unity VFX Graph YAML reference for programmatic manipulation.

**Updated**: 2026-01-20 | **Unity**: 6000.2.14f1 (VFX Graph 17.2.0)

---

## File Types

| Extension | Purpose | Category Path |
|-----------|---------|---------------|
| `.vfx` | Complete VFX Graph asset | - |
| `.vfxoperator` | Subgraph operator (pure computation) | `Subgraph Operator` |
| `.vfxblock` | Subgraph block (particle manipulation) | `Subgraph Block` |

---

## YAML Structure Overview

All VFX files share the same basic structure:

```yaml
%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!2058629511 &8926484042661614527
VisualEffectResource:
  m_Name: MyVFX
  m_Graph: {fileID: 114350483966674976}
  m_Infos:
    m_RendererSettings: ...
    m_CullingFlags: 3
    m_UpdateMode: 0
    m_InitialEventName: OnPlay
    m_InstancingMode: 0
    m_InstancingCapacity: 64
```

### Key File IDs

| Class ID | Type | Purpose |
|----------|------|---------|
| `2058629511` | VisualEffectResource | Main asset container |
| `114` | MonoBehaviour | All graph elements (contexts, blocks, slots, operators) |

---

## Core Components

### 1. VisualEffectResource (Root)

The main asset container. References the graph and runtime settings.

```yaml
VisualEffectResource:
  m_Name: MyVFX
  m_Graph: {fileID: 114350483966674976}  # Reference to VFXGraph MonoBehaviour
  m_Infos:
    m_RendererSettings:
      motionVectorGenerationMode: 0  # 0=Camera, 1=Object, 2=ForceNoMotion
      shadowCastingMode: 0           # 0=Off, 1=On, 2=TwoSided, 3=ShadowsOnly
      rayTracingMode: 0              # 0=Off, 1=Static, 2=Dynamic
      receiveShadows: 0              # 0/1
      reflectionProbeUsage: 0        # 0=Off, 1=BlendProbes
      lightProbeUsage: 0             # 0=Off, 1=BlendProbes
    m_CullingFlags: 3                # 0=AlwaysSimulate, 1=CullSimulate, 2=CullBoundsUpdate, 3=All
    m_UpdateMode: 0                  # 0=DeltaTime, 1=FixedDeltaTime, 2=IgnoreTimeScale
    m_PreWarmDeltaTime: 0.05
    m_PreWarmStepCount: 0
    m_InitialEventName: OnPlay
    m_InstancingMode: 0              # 0=Disabled, 1=Automatic, -1=Default
    m_InstancingCapacity: 64
```

### 2. VFXGraph (Main Graph Container)

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: 7d4c867f6b72b714dbb5fd1780afe208, type: 3}
  m_Name: MyVFX
  m_Children:           # List of all top-level elements (contexts, parameters)
  - {fileID: ...}
  m_UIInfos: {fileID: ...}
  m_CustomAttributes: []
  m_ParameterInfo: []   # Exposed property definitions (see below)
  m_GraphVersion: 18    # Current graph format version
  m_ResourceVersion: 1
  m_SubgraphDependencies: []
  m_CategoryPath:       # For subgraphs: "Subgraph Operator" or "Subgraph Block"
```

---

## Context Types

VFX Graphs use a pipeline of contexts. Each context type has a specific GUID in `m_Script`.

### Context Script GUIDs

| Context | GUID | Purpose |
|---------|------|---------|
| VFXBasicSpawner | `73a13919d81fb7444849bae8b5c812a2` | Spawn system (rate/burst) |
| VFXBasicInitialize | `9dfea48843f53fc438eabc12a3a30abc` | Initialize particles |
| VFXBasicUpdate | `2dc095764ededfa4bb32fa602511ea4b` | Update particles per frame |
| VFXQuadOutput | `a0b9e6b9139e58d4c957ec54595da7d3` | Render as billboards/quads |
| VFXMeshOutput | `...` | Render as meshes |
| VFXDecalOutput | `...` | Render as decals |
| GPUEvent | `...` | GPU-triggered spawn |

### Spawn Context

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: 73a13919d81fb7444849bae8b5c812a2, type: 3}
  m_Name: VFXBasicSpawner
  m_Label: Spawn System
  m_Data: {fileID: ...}        # Reference to VFXDataSpawner
  m_InputFlowSlot:
  - link: []                    # Start trigger
  - link: []                    # Stop trigger
  m_OutputFlowSlot:
  - link:
    - context: {fileID: ...}    # Link to Initialize
      slotIndex: 0
  loopDuration: 0
  loopCount: 0
  delayBeforeLoop: 0
  delayAfterLoop: 0
```

### Initialize Context

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: 9dfea48843f53fc438eabc12a3a30abc, type: 3}
  m_Name: VFXBasicInitialize
  m_Label: Initialize Particles
  m_Data: {fileID: ...}        # Reference to VFXDataParticle
  m_InputSlots:
  - {fileID: ...}              # bounds (AABox)
  - {fileID: ...}              # boundsPadding (Vector3)
  m_InputFlowSlot:
  - link:
    - context: {fileID: ...}   # Link from Spawn
      slotIndex: 0
  m_OutputFlowSlot:
  - link:
    - context: {fileID: ...}   # Link to Update
      slotIndex: 0
```

### Update Context

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: 2dc095764ededfa4bb32fa602511ea4b, type: 3}
  m_Name: VFXBasicUpdate
  m_Label: Update Particles
  integration: 0               # 0=None, 1=Euler, 2=EulerIntegration
  angularIntegration: 0        # 0=None, 1=Euler
  ageParticles: 1              # 0/1 - increment age
  reapParticles: 1             # 0/1 - kill particles when age > lifetime
  skipZeroDeltaUpdate: 0       # 0/1
```

### Output Context (Quad/Billboard)

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: a0b9e6b9139e58d4c957ec54595da7d3, type: 3}
  m_Name: VFXQuadOutput
  m_Label: Render Quad
  blendMode: 1                 # 0=Opaque, 1=Additive, 2=Alpha, 3=AlphaPremultiplied
  cullMode: 0                  # 0=Default, 1=Front, 2=Back
  zWriteMode: 0                # 0=Default, 1=On, 2=Off
  zTestMode: 0                 # 0=Default, 1=Less, 2=LEqual, etc.
  useAlphaClipping: 0
  generateMotionVector: 0
  sortingPriority: 0
  colorMapping: 0              # 0=Default, 1=GradientMapped
  uvMode: 0                    # 0=Default, 1=Simple, 2=ScaleAndBias
  flipbookLayout: 0            # 0=Texture2D, 1=Texture2DArray
  flipbookBlendFrames: 0       # 0/1
  useSoftParticle: 0           # 0/1
  sort: 0                      # 0=Off, 1=Auto
  sortMode: 0                  # 0=ByDistance, 1=YoungestFirst, 2=OldestFirst
  indirectDraw: 0              # 0/1 - GPU culling
  computeCulling: 0            # 0/1
  frustumCulling: 0            # 0/1
  castShadows: 0               # 0/1
  primitiveType: 1             # 0=Triangle, 1=Quad, 2=Octagon
  shaderGraph: {fileID: 0}     # Optional Shader Graph reference
```

---

## Data Containers

### VFXDataParticle

Shared particle data container referenced by Initialize, Update, and Output contexts.

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: d78581a96eae8bf4398c282eb0b098bd, type: 3}
  m_Name: VFXDataParticle
  title: System Name
  m_Owners:                    # Contexts sharing this data
  - {fileID: ...}              # Initialize
  - {fileID: ...}              # Update
  - {fileID: ...}              # Output
  dataType: 0                  # 0=Particle, 1=ParticleStrip
  capacity: 64                 # Max particle count
  stripCapacity: 16            # Strip mode only
  particlePerStripCount: 16    # Strip mode only
  needsComputeBounds: 0
  boundsMode: 0                # 0=Manual, 1=Recorded, 2=Automatic
  m_Space: 0                   # 0=Local, 1=World
```

### VFXDataSpawner

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: f68759077adc0b143b6e1c101e82065e, type: 3}
  m_Name: VFXDataSpawner
  m_Owners:
  - {fileID: ...}              # Spawn context
```

---

## Slots and Properties

### Slot Types (by GUID)

| GUID | Type | Purpose |
|------|------|---------|
| `f780aa281814f9842a7c076d436932e7` | VFXSlotFloat | Single float |
| `ac39bd03fca81b849929b9c966f1836a` | VFXSlotFloat3 | Vector3 |
| `70a331b1d86cc8d4aa106ccbe0da5852` | VFXSlotTexture2D | Texture2D |
| `d5ff4abdfc4ddb54992e15a0636f5d0e` | VFXSlotGraphicsBuffer | GraphicsBuffer |
| `1b605c022ee79394a8a776c0869b3f9a` | VFXSlot (generic) | Container slot |

### Slot Structure

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: f780aa281814f9842a7c076d436932e7, type: 3}
  m_Name: VFXSlotFloat
  m_MasterSlot: {fileID: ...}    # Root slot (self if this is root)
  m_MasterData:
    m_Owner: {fileID: ...}        # Owning context/block
    m_Value:
      m_Type:
        m_SerializableType: System.Single, mscorlib, ...
      m_SerializableObject: 1.0   # Default value
    m_Space: -1                   # -1=None, 0=Local, 1=World
  m_Property:
    name: myProperty
    m_serializedType:
      m_SerializableType: System.Single, mscorlib, ...
  m_Direction: 0                  # 0=Input, 1=Output
  m_LinkedSlots: []               # Connections to other slots
```

---

## Exposed Properties (m_ParameterInfo)

Exposed properties appear in the VFX Graph inspector and can be bound at runtime.

```yaml
m_ParameterInfo:
- name: KeypointBuffer           # Inspector display name
  path:                          # Empty for GraphicsBuffer type
  tooltip: Pose keypoint buffer
  space: -1                      # -1=None, 0=Local, 1=World
  spaceable: 0                   # Can user toggle space?
  sheetType:                     # Property sheet type (see below)
  realType: GraphicsBuffer       # C# type name
  defaultValue:
    m_Type:
      m_SerializableType: UnityEngine.GraphicsBuffer, ...
    m_SerializableObject:        # JSON default value
  min: -Infinity
  max: Infinity
  enumValues: []
  descendantCount: 0
```

### Common sheetType Values

| sheetType | C# Type | Example |
|-----------|---------|---------|
| `m_Float` | `Single` | 0.5 |
| `m_Vector2f` | `Vector2` | `{"x":0.0,"y":0.0}` |
| `m_Vector3f` | `Vector3` | `{"x":0.0,"y":0.0,"z":0.0}` |
| `m_Vector4f` | `Vector4` | `{"x":0.0,"y":0.0,"z":0.0,"w":0.0}` |
| `m_Matrix4x4f` | `Matrix4x4` | Identity matrix JSON |
| `m_NamedObject` | `Texture2D` | Asset reference |
| (empty) | `GraphicsBuffer` | Buffer reference |

---

## Parameter Node Structure

Parameters (exposed properties) are defined as nodes in the graph:

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: 330e0fca1717dde4aaa144f48232aa64, type: 3}
  m_Name: Parameter
  m_OutputSlots:
  - {fileID: ...}                 # Output slot
  m_ExposedName: PositionMap      # Exposed property name
  m_Exposed: 1                    # 1=visible in inspector
  m_Order: 0                      # Inspector order
  m_Category:                     # Grouping category
  m_Min:                          # Range constraint
  m_Max:                          # Range constraint
  m_IsOutput: 0                   # 0=input param, 1=output param
  m_Tooltip: World positions      # Inspector tooltip
  m_Nodes:                        # Node instances in graph
  - m_Id: 1
    linkedSlots:
    - outputSlot: {fileID: ...}
      inputSlot: {fileID: ...}
    position: {x: 100, y: 200}
    expanded: 1
```

---

## UI Information (VFXUI)

Graph visual layout and grouping:

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: d01270efd3285ea4a9d6c555cb0a8027, type: 3}
  m_Name: VFXUI
  groupInfos:
  - title: Keypoint Retrieval
    position:
      x: -363
      y: 638
      width: 916
      height: 498
    contents:
    - model: {fileID: ...}        # Node in group
      id: 0
      isStickyNote: 0
  stickyNoteInfos: []
  categories: []
  uiBounds:                       # Overall graph bounds
    x: 0
    y: 0
    width: 1999
    height: 1918
```

---

## Spawn Blocks

### Constant Spawn Rate

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: ...}
  m_Name: ConstantSpawnRate
  m_InputSlots:
  - {fileID: ...}                 # Rate slot
```

### Single Burst

```yaml
MonoBehaviour:
  m_Script: {fileID: 11500000, guid: 5e382412bb691334bb79457a6c127924, type: 3}
  m_Name: VFXSpawnerBurst
  m_InputSlots:
  - {fileID: ...}                 # Count
  - {fileID: ...}                 # Delay
  repeat: 0                       # 0=once, 1=repeat
  spawnMode: 0                    # 0=Total, 1=Rate
  delayMode: 0                    # 0=Constant, 1=Random
```

---

## Subgraph Operators (.vfxoperator)

Reusable computation nodes that take inputs and produce outputs.

```yaml
m_CategoryPath: Subgraph Operator
m_ParameterInfo:
- name: PositionMap
  path: PositionMap
  tooltip: World position texture
  realType: Texture2D
- name: UV
  path: UV
  realType: Vector2
  defaultValue:
    m_SerializableObject: '{"x":0.5,"y":0.5}'
```

---

## Subgraph Blocks (.vfxblock)

Reusable particle manipulation blocks.

```yaml
m_CategoryPath: Subgraph Block
m_ParameterInfo:
- name: Metavido Data            # Input group
- name: ColorMap
  path: ColorMap
  realType: Texture2D
- name: UV
  path: UV
  realType: Vector2
```

---

## Common Patterns

### Adding a New Exposed Property (C#)

```csharp
// Use VisualEffect.SetTexture/SetVector/etc. at runtime
// The property must exist in m_ParameterInfo

var vfx = GetComponent<VisualEffect>();
vfx.SetTexture("PositionMap", positionTexture);
vfx.SetVector4("RayParams", new Vector4(0, 0, tanFovX, tanFovY));
vfx.SetGraphicsBuffer("KeypointBuffer", keypointBuffer);
```

### Property Name Resolution

VFX Graph uses `ExposedProperty<T>` internally:
```csharp
static readonly ExposedProperty<Texture> PositionMap = "PositionMap";
vfx.SetTexture(PositionMap, texture);  // Faster than string lookup
```

### Finding Properties Programmatically

```csharp
bool HasExposedProperty(VisualEffect vfx, string name)
{
    return vfx.HasTexture(name) || vfx.HasVector4(name) ||
           vfx.HasFloat(name) || vfx.HasGraphicsBuffer(name);
}
```

---

## MetavidoVFX Property Standards

Based on project conventions:

| Property | Type | Source | Description |
|----------|------|--------|-------------|
| `DepthMap` | Texture2D | ARDepthSource | Raw AR depth |
| `StencilMap` | Texture2D | ARDepthSource | Human segmentation |
| `PositionMap` | Texture2D | ARDepthSource | GPU-computed world positions |
| `VelocityMap` | Texture2D | ARDepthSource | GPU-computed velocity |
| `ColorMap` | Texture2D | AR Camera | Camera RGB |
| `RayParams` | Vector4 | ARDepthSource | (0, 0, tan(fov/2)*aspect, tan(fov/2)) |
| `InverseView` | Matrix4x4 | ARDepthSource | Camera inverse view |
| `DepthRange` | Vector2 | Config | Near/far (default 0.1-10m) |
| `KeypointBuffer` | GraphicsBuffer | BodyPartSegmenter | 17 pose landmarks |
| `Threshold` | Float | Config | Confidence threshold (0-1) |
| `MaskTexture` | Texture2D | Config | Masking texture |

---

## Runtime API (Official Documentation)

> Source: [Visual Effect Component API](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@7.1/manual/ComponentAPI.html)

### Property Access Methods

Properties can be accessed via:
- **String name** - Easy but less optimized
- **Integer ID** - Generated via `Shader.PropertyToID(string name)`
- **ExposedProperty Helper Class** - Caches int value for best performance

### Supported Property Types

| Type | Has | Get | Set |
|------|-----|-----|-----|
| Int | `HasInt()` | `GetInt()` | `SetInt()` |
| UInt | `HasUInt()` | `GetUInt()` | `SetUInt()` |
| Bool | `HasBool()` | `GetBool()` | `SetBool()` |
| Float | `HasFloat()` | `GetFloat()` | `SetFloat()` |
| Vector2 | `HasVector2()` | `GetVector2()` | `SetVector2()` |
| Vector3 | `HasVector3()` | `GetVector3()` | `SetVector3()` |
| Vector4 | `HasVector4()` | `GetVector4()` | `SetVector4()` |
| Gradient | `HasGradient()` | `GetGradient()` | `SetGradient()` |
| AnimationCurve | `HasAnimationCurve()` | `GetAnimationCurve()` | `SetAnimationCurve()` |
| Mesh | `HasMesh()` | `GetMesh()` | `SetMesh()` |
| Texture | `HasTexture()` | `GetTexture()` | `SetTexture()` |
| Matrix4x4 | `HasMatrix4x4()` | `GetMatrix4x4()` | `SetMatrix4x4()` |
| GraphicsBuffer | `HasGraphicsBuffer()` | - | `SetGraphicsBuffer()` |

### Event Handling

```csharp
// Send events to VFX
vfx.SendEvent("OnPlay");
vfx.SendEvent(eventNameOrId, eventAttribute);

// Create event attributes
var attr = vfx.CreateVFXEventAttribute();
attr.SetVector3("position", Vector3.zero);
vfx.SendEvent("Spawn", attr);
```

### Reset Property Overrides

```csharp
// Reset a property to its default value
vfx.ResetOverride("PropertyName");
```

---

## Effect Playback Control

> Source: [VisualEffect API](https://docs.unity3d.com/ScriptReference/VFX.VisualEffect.html)

### Playback Methods

| Method | Description |
|--------|-------------|
| `Play()` | Sends the default "OnPlay" event to the effect |
| `Play(VFXEventAttribute)` | Sends "OnPlay" with custom attributes |
| `Stop()` | Sends the default "OnStop" event |
| `Stop(VFXEventAttribute)` | Sends "OnStop" with custom attributes |
| `Reinit()` | Resets simulation and re-sends "OnPlay" |
| `AdvanceOneFrame()` | Advances simulation by one frame (useful for prewarming) |

### Playback Properties

```csharp
// Check if effect is playing
bool isPlaying = vfx.HasAnySystemAwake();

// Pause/resume
vfx.pause = true;   // Pauses simulation
vfx.pause = false;  // Resumes

// Playback rate
vfx.playRate = 0.5f;  // Half speed
vfx.playRate = 2.0f;  // Double speed

// Random seed control
vfx.resetSeedOnPlay = true;  // New seed each Play()
vfx.startSeed = 42;          // Fixed seed for reproducibility
```

### Prewarming Effects

```csharp
// Advance simulation without rendering (useful for prewarming)
IEnumerator PrewarmEffect(VisualEffect vfx, float seconds, float deltaTime = 0.02f)
{
    int steps = Mathf.CeilToInt(seconds / deltaTime);
    for (int i = 0; i < steps; i++)
    {
        vfx.Simulate(deltaTime);
    }
    yield return null;
}
```

---

## Particle Attributes

> Source: [Attributes Documentation](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.2/manual/Attributes.html)

### Standard Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| `position` | Vector3 | Particle world/local position | (0,0,0) |
| `velocity` | Vector3 | Movement per second | (0,0,0) |
| `direction` | Vector3 | Normalized direction | (0,0,1) |
| `lifetime` | float | Total lifetime in seconds | 1.0 |
| `age` | float | Current age in seconds | 0.0 |
| `color` | Vector4/Color | RGBA color | (1,1,1,1) |
| `alpha` | float | Alpha transparency | 1.0 |
| `size` | float | Uniform scale | 0.1 |
| `scale` | Vector3 | Non-uniform scale | (1,1,1) |
| `angle` | Vector3 | Euler rotation (degrees) | (0,0,0) |
| `angularVelocity` | Vector3 | Rotation per second | (0,0,0) |
| `mass` | float | Particle mass | 1.0 |
| `oldPosition` | Vector3 | Previous frame position | position |
| `targetPosition` | Vector3 | Attraction target | (0,0,0) |
| `seed` | uint | Per-particle random seed | random |
| `particleId` | uint | Unique ID per particle | auto |

### Attribute Storage Rules

Attributes can be **stored** (persisted per particle) or **computed** (calculated each frame):

```
Storage Decision:
├── Written in Initialize → STORED (if read later)
├── Written in Update → STORED (if read later in Update/Output)
├── Read in Output only → Can be CURRENT (not stored)
└── Not used → OPTIMIZED OUT
```

**Current vs Stored:**
- **Current**: Computed fresh each frame, no memory cost
- **Stored**: Persisted in particle buffer, costs memory per particle

### Custom Attributes

Define in Initialize or Update context:

```yaml
# In YAML (m_CustomAttributes)
m_CustomAttributes:
- customAttribute: myCustomFloat
  type: 0                    # 0=Float, 1=Float2, 2=Float3, 3=Float4
```

Access in blocks/operators:
```hlsl
// Read/write custom attribute
float myValue = Get Attribute: myCustomFloat
Set Attribute: myCustomFloat = newValue
```

---

## VFXEventAttribute (Detailed)

> Source: [Component API](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@7.1/manual/ComponentAPI.html)

### Creating Event Attributes

```csharp
// Create reusable event attribute
VFXEventAttribute eventAttr = vfx.CreateVFXEventAttribute();

// Pool these for performance - don't create every frame
private VFXEventAttribute _cachedAttr;
void Start() => _cachedAttr = vfx.CreateVFXEventAttribute();
```

### Setting Attribute Values

```csharp
// Supported types for VFXEventAttribute
eventAttr.SetFloat("rate", 100f);
eventAttr.SetInt("count", 50);
eventAttr.SetUint("seed", 12345u);
eventAttr.SetBool("enabled", true);
eventAttr.SetVector2("uv", new Vector2(0.5f, 0.5f));
eventAttr.SetVector3("position", transform.position);
eventAttr.SetVector4("color", new Vector4(1, 0, 0, 1));
eventAttr.SetMatrix4x4("transform", transform.localToWorldMatrix);
```

### Getting Attribute Values

```csharp
float rate = eventAttr.GetFloat("rate");
Vector3 pos = eventAttr.GetVector3("position");
bool enabled = eventAttr.GetBool("enabled");
```

### Checking Attribute Existence

```csharp
if (eventAttr.HasFloat("rate"))
{
    float rate = eventAttr.GetFloat("rate");
}
```

### Copying Between Attributes

```csharp
// Copy all values from one attribute to another
eventAttr.CopyValuesFrom(sourceAttr);
```

### Sending Events with Attributes

```csharp
// Standard spawn with position override
var attr = vfx.CreateVFXEventAttribute();
attr.SetVector3("position", hitPoint);
attr.SetVector3("velocity", hitNormal * 5f);
attr.SetVector4("color", Color.red);
vfx.SendEvent("OnSpawn", attr);

// GPU Event spawn (from Output context)
// Attributes are inherited from dying particle
vfx.SendEvent("OnDeath", attr);
```

### Event Attribute Flow

```
SendEvent("MyEvent", attr)
    ↓
Spawn Context receives event
    ↓
Initialize Context: Get Attribute: eventAttr.position
    ↓
Particle spawns with overridden position
```

---

## Output Events (GPU → CPU)

> Source: [Output Event Handler](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.2/manual/OutputEvent.html)

Output Events allow particles to send data back to C# code.

### Setting Up Output Events

```csharp
// Subscribe to output events
void OnEnable()
{
    var vfx = GetComponent<VisualEffect>();
    vfx.outputEventReceived += OnOutputEvent;
}

void OnDisable()
{
    var vfx = GetComponent<VisualEffect>();
    vfx.outputEventReceived -= OnOutputEvent;
}

void OnOutputEvent(VFXOutputEventArgs args)
{
    // args.nameId - Event name ID
    // args.eventAttribute - Contains particle data

    Vector3 position = args.eventAttribute.GetVector3("position");
    Vector3 velocity = args.eventAttribute.GetVector3("velocity");
    Vector4 color = args.eventAttribute.GetVector4("color");

    // Spawn audio, trigger effects, etc.
    AudioSource.PlayClipAtPoint(clip, position);
}
```

### Batched Output Events

```csharp
// For high-frequency events, use batched handler
void OnOutputEvent(VFXOutputEventArgs args)
{
    // Check event count for this frame
    int eventCount = args.eventAttribute.GetInt("eventCount");

    // Process in batch
    for (int i = 0; i < eventCount; i++)
    {
        // Event data is in arrays
    }
}
```

---

## Simulation Control

### Manual Simulation

```csharp
// Disable auto-update
vfx.culled = true;  // Prevent automatic updates

// Manually simulate
vfx.Simulate(Time.deltaTime, 1);  // (deltaTime, stepCount)
```

### Culling Control

```csharp
// Culling modes (set in VisualEffectResource YAML)
// m_CullingFlags: 0 = Always simulate
// m_CullingFlags: 1 = Cull simulate when invisible
// m_CullingFlags: 2 = Cull bounds update
// m_CullingFlags: 3 = Cull all

// Runtime override
vfx.culled = true;   // Force culled state
vfx.culled = false;  // Resume normal culling
```

### Bounds Control

```csharp
// Get current bounds
Bounds bounds = vfx.GetOutputMeshBounds();

// Manual bounds (when boundsMode = Manual)
vfx.SetVector3("bounds_center", center);
vfx.SetVector3("bounds_size", size);
```

---

## Instancing (Unity 6+)

VFX Graph supports GPU instancing for multiple instances of the same effect.

### YAML Configuration

```yaml
m_InstancingMode: 1       # 0=Disabled, 1=Automatic, -1=Default
m_InstancingCapacity: 64  # Max instances
```

### Runtime Instance Control

```csharp
// Each VisualEffect component is an instance
// Shared VFX asset = automatic batching
GameObject[] spawned = new GameObject[100];
for (int i = 0; i < 100; i++)
{
    spawned[i] = Instantiate(vfxPrefab, positions[i], Quaternion.identity);
    // All share same VFX asset = GPU instanced rendering
}
```

---

## Subgraph Types (Official Documentation)

> Source: [Subgraphs](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.4/manual/Subgraph.html)

### Three Subgraph Types

| Type | File | Purpose |
|------|------|---------|
| **System Subgraph** | `.vfx` | One or many Systems contained in one Graph (appears as Context) |
| **Block Subgraph** | `.vfxblock` | Operators and blocks that function as reusable block units |
| **Operator Subgraph** | `.vfxoperator` | Only contains Operators, used as Operators in other graphs |

### Creating Subgraphs

**Block Subgraph:**
1. `Assets > Create > Visual Effects > Visual Effect Subgraph Block`
2. Or: Select blocks/operators → Right-click → "Convert to Subgraph Block"

**Operator Subgraph:**
1. `Assets > Create > Visual Effects > Visual Effect Subgraph Operator`
2. Or: Select operators → Right-click → "Convert to Subgraph Operator"

### Input/Output Properties (Blackboard)

For Operator Subgraphs:
- **Inputs**: Add properties and enable "Exposed" flag
- **Outputs**: Add properties and move to Output Category

### Category Organization

Set category in Blackboard subtitle:
- Use `/` for hierarchies: `MySubgraphs/Math`
- Use `#` with numbers for sorting separators

---

## Custom HLSL Nodes (Official Documentation)

> Source: [Custom HLSL Nodes](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.3/manual/CustomHLSL-Common.html)

### Node Types

| Type | Flow | Use Case |
|------|------|----------|
| **Operator** | Horizontal | Pure computation |
| **Block** | Vertical (in contexts) | Particle manipulation |

### Function Requirements

- Return a supported type
- All parameters must be supported types
- Multiple functions require unique names
- Helper functions need `/// Hidden` comment (HLSL files only)

### Supported HLSL Types

**Basic:** `bool`, `uint`, `int`, `float`, `float2`, `float3`, `float4`, `float4x4`, `VFXGradient`, `VFXCurve`

**Textures:** `VFXSampler2D`, `VFXSampler3D`, `VFXSampler2DArray`, `VFXSamplerCube`, `Texture1D/2D/3D`, `RWTexture*`

**Buffers:** `StructuredBuffer`, `ByteAddressBuffer`, `Buffer`, `AppendStructuredBuffer`, `ConsumeStructuredBuffer`, `RWStructuredBuffer`

### Sampling Utilities

```hlsl
// Texture sampling
float4 color = SampleTexture(VFXSampler2D sampler, float2 uv, float mipLevel);

// Gradient sampling
float4 color = SampleGradient(VFXGradient gradient, float t);

// Curve sampling
float value = SampleCurve(VFXCurve curve, float t);

// Buffer access
float4 data = myStructuredBuffer[index];
uint rawData = myByteAddressBuffer.Load(byteOffset);
```

### Parameter Documentation

```hlsl
/// parameterName: This is the tooltip text
float4 MyFunction(float3 position)
{
    return float4(position, 1);
}
```

---

## Automated Validation

### VFXGraphValidator Tool

**Location**: `MetavidoVFX-main/Assets/Scripts/Editor/VFXGraphValidator.cs`
**Menu**: `XRRAI > VFX > Validate All Graphs`

The project includes an automated validator to ensure all 418+ VFX graphs comply with the **Hybrid Bridge** standard.

**Validation Checks**:
1.  **Pipeline Properties**: Must expose `DepthMap`, `ColorMap`, and `RayParams` (or `InverseView`).
2.  **Switching Logic**: Must expose a `Spawn` boolean (or `_vfx_enabled`) for zero-latency toggling.
3.  **Mobile Performance**: (Future) Warns if `capacity` > 500,000.

**CLI Mode**: `run_vfx_validation_cli.sh` performs a quick grep-based scan of the `Assets/VFX` directory.

### Standard Fix Pattern

To fix a `[FAIL]` result:
1.  Open the VFX Graph.
2.  Add a **Texture2D** property named `DepthMap` (Exposed).
3.  Add a **Bool** property named `Spawn` (Exposed).
4.  Connect `Spawn` to the `Loop State` of your Spawner context.
5.  Use `Metavido Inverse Projection` or `AR Inverse Projection` subgraphs for position logic.

---

## Unity YAML Format (Official Documentation)

> Source: [UnityYAML](https://docs.unity3d.com/Manual/UnityYAML.html), [Format Description](https://docs.unity3d.com/Manual/FormatDescription.html)

### Key Format Details

Unity uses a **custom-optimized YAML library** (UnityYAML) that does not support the full YAML specification.

**Supported:**
- Mappings (flow and block styles)
- Scalars (double/single quoted, plain, multi-line with proper indentation)
- UTF-8 characters (in double-quoted scalars only)
- Sequences (block styles, sequences containing mappings)

**Not Supported:**
- Chomping indicators (`+` and `|`)
- Comments
- Complex mapping keys
- Multiple documents per object
- Raw block sequences
- Tags (beyond Unity's internal tags)

### Object Structure

```yaml
--- !u!1 &6                    # Document marker + class ID + object ID
GameObject:
  m_ObjectHideFlags: 0
  m_Name: Cube
```

- **Class ID** (`!u!1`): Indicates object class (1=GameObject, 4=Transform, 114=MonoBehaviour)
- **Object ID** (`&6`): Unique identifier within the file
- **Property prefix** (`m_`): Serializable properties follow naming convention

### File References

```yaml
# Same file reference
m_Transform: {fileID: 6}

# Cross-file reference (requires GUID from .meta file)
m_Script: {fileID: 11500000, guid: 73a13919d81fb7444849bae8b5c812a2, type: 3}
```

### Floating Point Representation

```yaml
# Multiple valid formats
m_Value: 1              # Integer
m_Value: 1.000          # Decimal
m_Value: 0.1e1          # Scientific
m_Value: 0x3F800000(1)  # IEEE 754 hex (only hex is parsed)
```

---

## Version History

| Graph Version | Unity Version | Changes |
|---------------|---------------|---------|
| 18 | Unity 6+ | Current format |
| 17 | 2022.3+ | Instancing support |
| 16 | 2021.3+ | GPU events |

---

## References (Official Documentation)

**Unity Official:**
- [Visual Effect Graph Manual](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.2/manual/index.html)
- [VisualEffect Scripting API](https://docs.unity3d.com/ScriptReference/VFX.VisualEffect.html)
- [VFXEventAttribute API](https://docs.unity3d.com/ScriptReference/VFX.VFXEventAttribute.html)
- [SetGraphicsBuffer API](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/VFX.VisualEffect.SetGraphicsBuffer.html)
- [SetTexture API](https://docs.unity3d.com/ScriptReference/VFX.VisualEffect.SetTexture.html)
- [Component API](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@7.1/manual/ComponentAPI.html)
- [Attributes Reference](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.2/manual/Attributes.html)
- [Output Events](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.2/manual/OutputEvent.html)
- [Subgraphs](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.4/manual/Subgraph.html)
- [Custom HLSL Nodes](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.3/manual/CustomHLSL-Common.html)
- [UnityYAML](https://docs.unity3d.com/Manual/UnityYAML.html)
- [Format Description](https://docs.unity3d.com/Manual/FormatDescription.html)
- [Understanding Unity's Serialization Language](https://unity.com/blog/engine-platform/understanding-unitys-serialization-language-yaml)

**Community Resources:**
- [VfxGraphAssets (keijiro)](https://github.com/keijiro/VfxGraphAssets) - Custom subgraphs library
- [VisualEffectGraph-Samples](https://github.com/Unity-Technologies/VisualEffectGraph-Samples) - Official samples

**Project-Specific:**
- `MetavidoVFX-main/CLAUDE.md` - Project conventions
- `KnowledgeBase/_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md` - AR + VFX patterns

---

## Related Files

```
MetavidoVFX-main/
├── Assets/VFX/                      # VFX assets organized by category
│   ├── People/                      # Human-following effects
│   ├── Environment/                 # Spatial effects
│   ├── NNCam2/                      # Keypoint-driven VFX
│   ├── Rcam2-4/                     # Depth-camera effects
│   └── SdfVfx/                      # SDF-based effects
├── Packages/jp.keijiro.metavido.vfxgraph/VFX/  # Metavido subgraphs
│   ├── Metavido Sample UV.vfxblock
│   ├── Metavido Sample Random.vfxblock
│   └── Metavido Filter.vfxblock
└── Assets/Scripts/Bridges/          # Runtime binding
    ├── ARDepthSource.cs             # Compute source (singleton)
    └── VFXARBinder.cs               # Per-VFX binding
```
# Keijiro's MetavidoVFX Deep Research

**Date**: 2026-01-20
**Source**: https://github.com/keijiro/MetavidoVFX
**Related**: https://github.com/keijiro/Metavido
**Unity Version**: Unity 6 (6000.0.0f1+)
**VFX Graph Version**: 17.0.0+
**Status**: Research-only analysis (no code modifications)

---

## Executive Summary

MetavidoVFX is Keijiro's volumetric video VFX demonstration that captures iPhone Pro LiDAR depth and camera tracking data into a custom `.metavido` video format, then visualizes it using VFX Graph. The system uses a **burnt-in barcode metadata extension** to synchronize depth/stencil/color data with camera position/rotation without external files.

**Key Innovation**: UV-multiplexed video format stores color (right half), depth (top-left quarter), and human stencil (bottom-left quarter) in a single 1920x1080 frame with metadata encoded in the stencil region's blue channel.

---

## 1. Architecture Overview

### 1.1 Data Flow (AR → VFX)

```
iPhone LiDAR Capture (Metavido Encoder)
  ↓
.metavido file (1920x1080 multiplexed video)
  ├─ Color: Right half (960x1080)
  ├─ Depth: Top-left quarter (960x540) - Hue-encoded
  ├─ Stencil: Bottom-left quarter (960x540) - Human mask
  └─ Metadata: Blue channel of stencil (camera pos/rot/FOV/depth range)
  ↓
MetadataDecoder.cs (Reads burnt-in barcode from stencil blue channel)
  ├─ Metadata struct: CameraPosition, CameraRotation, CenterShift, FOV, DepthRange
  └─ RenderUtils.RayParams() → Vector4(sx, sy, h*16/9, h) where h = tan(FOV/2)
  ↓
TextureDemuxer.cs (Demux.shader)
  ├─ Pass 0: Extract Color + Stencil → ColorTexture (RGBA, 960x1080)
  └─ Pass 1: Extract + Decode Depth → DepthTexture (R16 Half, 960x540)
  ↓
VFXMetavidoBinder.cs (VFX Property Binder)
  ├─ ColorMap (Texture2D) → VFX exposed property
  ├─ DepthMap (Texture2D) → VFX exposed property
  ├─ RayParams (Vector4) → UV-to-ray conversion params
  ├─ InverseView (Matrix4x4) → Camera local-to-world transform
  └─ DepthRange (Vector2) → Near/far plane distances
  ↓
VFX Graph (Particles, Voxels, Afterimage)
  ├─ Sample DepthMap at UV
  ├─ Compute world position: MetavidoInverseProjection(UV, Depth, RayParams, InverseView)
  ├─ Sample ColorMap at UV
  └─ Apply visual effects with world-space particles
```

---

## 2. Core Components

### 2.1 VFXMetavidoBinder.cs

**File**: `/tmp/MetavidoVFX/Packages/jp.keijiro.metavido.vfxgraph/Scripts/VFXMetavidoBinder.cs`

**Purpose**: Unity VFX Property Binder that bridges Metavido decoder → VFX Graph exposed properties.

**Dependencies**:
- `MetadataDecoder _decoder` - Burnt-in metadata reader
- `TextureDemuxer _demux` - Texture splitter (color/depth)

**Exposed Properties**:
```csharp
[VFXPropertyBinding("UnityEngine.Texture2D")]
ExposedProperty _colorMapProperty = "ColorMap";

[VFXPropertyBinding("UnityEngine.Texture2D")]
ExposedProperty _depthMapProperty = "DepthMap";

[VFXPropertyBinding("UnityEngine.Vector4")]
ExposedProperty _rayParamsProperty = "RayParams";

[VFXPropertyBinding("UnityEngine.Matrix4x4")]
ExposedProperty _inverseViewProperty = "InverseView";

[VFXPropertyBinding("UnityEngine.Vector2")]
ExposedProperty _depthRangeProperty = "DepthRange";
```

**UpdateBinding Logic**:
```csharp
public override void UpdateBinding(VisualEffect component)
{
    var meta = _decoder.Metadata;
    if (!meta.IsValid) return;

    // Compute camera parameters from metadata
    var ray = RenderUtils.RayParams(meta);
    var iview = RenderUtils.InverseView(meta);

    // Bind textures and parameters to VFX
    component.SetTexture(_colorMapProperty, _demux.ColorTexture);
    component.SetTexture(_depthMapProperty, _demux.DepthTexture);
    component.SetVector4(_rayParamsProperty, ray);
    component.SetMatrix4x4(_inverseViewProperty, iview);
    component.SetVector2(_depthRangeProperty, meta.DepthRange);
}
```

**Key Pattern**: Uses `ExposedProperty` type instead of `const string` for VFX Graph property bindings (same pattern as ARFoundation VFXPropertyBinder).

---

### 2.2 RenderUtils.cs

**File**: `/tmp/Metavido/Packages/jp.keijiro.metavido/Decoder/Scripts/RenderUtils.cs`

**Purpose**: Converts Metavido metadata into shader-ready camera parameters.

**RayParams Computation**:
```csharp
public static Vector4 RayParams(in Metadata meta)
{
    var s = meta.CenterShift;        // Projection center offset (m02, m12)
    var h = Mathf.Tan(meta.FieldOfView / 2);  // Half-height of frustum
    return new Vector4(s.x, s.y, h * 16 / 9, h);
    //                 ^^^^  ^^^^ ^^^^^^^^^^  ^^^
    //                 sx    sy   width       height (aspect-corrected)
}
```

**InverseView Computation**:
```csharp
public static Matrix4x4 InverseView(in Metadata meta)
  => Matrix4x4.TRS(meta.CameraPosition, meta.CameraRotation, Vector3.one);
```

---

### 2.3 Metadata.cs

**File**: `/tmp/Metavido/Packages/jp.keijiro.metavido/Common/Scripts/Metadata.cs`

**Purpose**: Burnt-in metadata struct read from blue channel barcode.

**Stored Data**:
```csharp
readonly float _px, _py, _pz;           // Camera position
readonly float _rx, _ry, _rz;           // Camera rotation (quaternion xyz)
readonly float _sx, _sy;                // Projection center shift
readonly float _fov;                    // Vertical field of view
readonly float _near, _far;             // Depth range
readonly float _hash;                   // Frame hash for sync
```

**Public Accessors**:
```csharp
public Vector3 CameraPosition => new Vector3(_px, _py, _pz);
public Quaternion CameraRotation => new Quaternion(_rx, _ry, _rz, RW);
public Vector2 CenterShift => new Vector2(_sx, _sy);
public float FieldOfView => _fov;
public Vector2 DepthRange => new Vector2(_near, _far);
```

**Reconstruction Logic**: Quaternion W component is reconstructed from `sqrt(1 - x² - y² - z²)`.

---

### 2.4 TextureDemuxer.cs

**File**: `/tmp/Metavido/Packages/jp.keijiro.metavido/Decoder/Scripts/TextureDemuxer.cs`

**Purpose**: Splits multiplexed .metavido video frame into separate color and depth textures.

**Output Textures**:
- `ColorTexture`: RenderTexture (RGBA, 960x1080) - Contains RGB color + stencil alpha
- `DepthTexture`: RenderTexture (R16 Half, 960x540) - Linear depth in meters

**Demux Process**:
```csharp
public void Demux(Texture source, in Metadata meta)
{
    var (w, h) = (source.width, source.height);
    if (_color == null) _color = GfxUtil.RGBARenderTexture(w / 2, h);
    if (_depth == null) _depth = GfxUtil.RHalfRenderTexture(w / 2, h / 2);

    _material.SetInteger(ShaderID.Margin, _margin);
    _material.SetVector(ShaderID.DepthRange, meta.DepthRange);
    Graphics.Blit(source, _color, _material, 0);  // Pass 0: Color
    Graphics.Blit(source, _depth, _material, 1);  // Pass 1: Depth
}
```

---

### 2.5 Demux.shader

**File**: `/tmp/Metavido/Packages/jp.keijiro.metavido/Decoder/Shaders/Demux.shader`

**Purpose**: GPU shader for extracting color and depth from multiplexed video.

**Pass 0 - Color + Stencil**:
```hlsl
void VertexColor(float4 position : POSITION, float2 texCoord : TEXCOORD,
                 out float4 outPosition : SV_Position, out float4 outTexCoord : TEXCOORD)
{
    outPosition = UnityObjectToClipPos(position);
    // Map UV to color region (right half) and stencil region (bottom-left)
    outTexCoord = texCoord.xyxy * mtvd_FrameSize.xyxy / float4(2, 1, 2, 2);
    outTexCoord.x += mtvd_FrameSize.x / 2;  // Offset to right half
}

float4 FragmentColor(float4 position : SV_Position, float4 texCoord : TEXCOORD0) : SV_Target
{
    float3 c = _MainTex[texCoord.xy].rgb;    // Color from right half
    float  s = _MainTex[texCoord.zw].r;      // Stencil from bottom-left
    s = saturate(lerp(-0.1, 1, s));          // Compression noise filter
    return float4(c, s);
}
```

**Pass 1 - Depth Decoding**:
```hlsl
void VertexDepth(float4 position : POSITION, float2 texCoord : TEXCOORD,
                 out float4 outPosition : SV_Position, out float2 outTexCoord : TEXCOORD)
{
    outPosition = float4(position.x * 2 - 1, 1 - position.y * 2, 1, 1);
    outTexCoord = texCoord * mtvd_FrameSize / 2;
    outTexCoord.y += mtvd_FrameSize.y / 2;  // Map to top-left quarter
}

float4 FragmentDepth(float4 position : SV_Position, float2 texCoord : TEXCOORD) : SV_Target
{
    uint2 tc = texCoord;
    tc.x = min(tc.x, mtvd_FrameSize.x / 2 - 1 - _Margin);
    tc.y = max(tc.y, mtvd_FrameSize.y / 2 + _Margin);
    float3 rgb = _MainTex[tc].rgb;
    return mtvd_DecodeDepth(rgb, _DepthRange);  // Hue → linear depth
}
```

---

### 2.6 Common.hlsl

**File**: `/tmp/Metavido/Packages/jp.keijiro.metavido/Common/Shaders/Common.hlsl`

**Purpose**: Shared HLSL utilities for depth encoding/decoding and UV remapping.

**Depth Hue Encoding**:
```hlsl
float3 mtvd_EncodeDepth(float depth, float2 range)
{
    depth = (depth - range.x) / (range.y - range.x);  // Normalize to [0,1]
    depth = depth * (1 - mtvd_DepthHuePadding * 2) + mtvd_DepthHuePadding;
    depth = saturate(depth) * (1 - mtvd_DepthHueMargin * 2) + mtvd_DepthHueMargin;
    return mtvd_Hue2RGB(depth);  // Encode as hue (rainbow gradient)
}

float mtvd_DecodeDepth(float3 rgb, float2 range)
{
    float depth = mtvd_RGB2Hue(rgb);  // Decode hue from RGB
    depth = (depth - mtvd_DepthHueMargin ) / (1 - mtvd_DepthHueMargin  * 2);
    depth = (depth - mtvd_DepthHuePadding) / (1 - mtvd_DepthHuePadding * 2);
    return lerp(range.x, range.y, depth);  // Scale to meters
}
```

**UV Remapping Functions**:
```hlsl
// Full frame → Color region (right half)
float2 mtvd_UV_FullToColor(float2 uv)
{
    uv.x = uv.x * 2 - 1;  // Map [0,1] to [0.5,1] then to [0,1]
    return uv;
}

// Full frame → Depth region (top-left quarter)
float2 mtvd_UV_FullToDepth(float2 uv)
{
    uv *= 2;
    uv.y -= 1;  // Map to top-left
    return uv;
}

// Full frame → Stencil region (bottom-left quarter)
float2 mtvd_UV_FullToStencil(float2 uv)
{
    return uv * 2;
}
```

**Frame Layout**:
```
+-----+-----+  1920x1080 multiplexed frame
|  Z  |     |  Z: Hue-encoded depth (960x540)
+-----+  C  |  C: Color RGB (960x1080)
| S/M |     |  S: Human stencil (960x540)
+-----+-----+  M: Metadata in stencil blue channel
```

---

### 2.7 Utils.hlsl (Decoder)

**File**: `/tmp/Metavido/Packages/jp.keijiro.metavido/Decoder/Shaders/Utils.hlsl`

**Purpose**: World position reconstruction from depth.

**Distance → World Position**:
```hlsl
float3 mtvd_DistanceToWorldPosition(float2 uv, float d,
                                     in float4 rayParams,
                                     in float4x4 inverseView)
{
    // Convert UV to NDC space [-1, 1]
    float3 ray = float3((uv - 0.5) * 2, 1);

    // Apply center shift and FOV scaling
    ray.xy = (ray.xy + rayParams.xy) * rayParams.zw;
    //                   ^^^^^^^^^^^    ^^^^^^^^^^^
    //                   Center shift   FOV scale (width, height)

    // Scale ray by depth distance
    ray *= d;

    // Transform from camera space to world space
    return mul(inverseView, float4(ray, 1)).xyz;
}
```

**Key Insight**: This is the **canonical UV → world position** algorithm for depth-based VFX.

---

## 3. VFX Graph Integration

### 3.1 Metavido Inverse Projection Operator

**File**: `/tmp/MetavidoVFX/Packages/jp.keijiro.metavido.vfxgraph/VFX/Metavido Inverse Projection.vfxoperator`

**Inputs**:
- `UV` (Vector2) - Texture coordinates [0,1]
- `Depth` (Float) - Linear depth in meters
- `RayParams` (Vector4) - Camera projection parameters
- `InverseView` (Matrix4x4) - Camera local-to-world matrix

**Output**:
- `Position` (Vector3) - World-space position

**HLSL Code**:
```hlsl
float3 MetavidoInverseProjection(float2 UV, float Depth, float4 RayParams, float4x4 InverseView)
{
    float3 p = float3(UV * 2 - 1, 1);              // UV → NDC
    p.xy = (p.xy + RayParams.xy) * RayParams.zw;   // Apply center shift + FOV
    p *= Depth;                                    // Scale by depth
    return mul(InverseView, float4(p, 1)).xyz;     // Camera → world space
}
```

**Usage in VFX Graph**:
```yaml
Initialize Particle
  ├─ Sample DepthMap at random UV → Depth
  ├─ Metavido Inverse Projection(UV, Depth, RayParams, InverseView) → position
  └─ Sample ColorMap at UV → color
```

---

### 3.2 VFX Property Bindings

**Particles.vfx / Voxels.vfx / Afterimage.vfx**:

All VFX assets expect these exposed properties:

| Property Name | Type | Purpose |
|--------------|------|---------|
| `ColorMap` | Texture2D | RGB color from right half of frame |
| `DepthMap` | Texture2D | Linear depth in meters (R16 Half) |
| `RayParams` | Vector4 | `(centerShiftX, centerShiftY, widthScale, heightScale)` |
| `InverseView` | Matrix4x4 | Camera local-to-world transform |
| `DepthRange` | Vector2 | `(near, far)` depth clamp values |

**Example VFX YAML**:
```yaml
m_ExposedName: DepthMap
m_Type: UnityEngine.Texture2D

m_ExposedName: RayParams
m_Type: UnityEngine.Vector4

m_ExposedName: InverseView
m_Type: UnityEngine.Matrix4x4
```

---

### 3.3 DisplacedMeshBuilder.cs

**File**: `/tmp/MetavidoVFX/Packages/jp.keijiro.metavido.vfxgraph/Scripts/DisplacedMeshBuilder.cs`

**Purpose**: Creates a displaced mesh from depth texture for non-particle VFX.

**MeshBuilder.compute Integration**:
```csharp
void LateUpdate()
{
    var meta = _decoder.Metadata;
    var ray = RenderUtils.RayParams(meta);
    var iview = RenderUtils.InverseView(meta);

    _compute.SetVector(ShaderID.RayParams, ray);
    _compute.SetMatrix(ShaderID.InverseView, iview);
    _compute.SetTexture(0, ShaderID.DepthTexture, _demuxer.DepthTexture);

    // Vertex reconstruction
    _compute.SetInts("Dims", ColumnCount, RowCount);
    _compute.SetBuffer(0, "VertexBuffer", _vertexBuffer);
    _compute.DispatchThreads(0, ColumnCount, RowCount);  // Uses extension method

    // Index array generation
    _compute.SetBuffer(1, "IndexBuffer", _indexBuffer);
    _compute.DispatchThreads(1, ColumnCount - 1, RowCount - 1);
}
```

**DispatchThreads Extension**:
```csharp
public static void DispatchThreads(this ComputeShader compute, int kernel, int x, int y = 1, int z = 1)
{
    uint xc, yc, zc;
    compute.GetKernelThreadGroupSizes(kernel, out xc, out yc, out zc);
    x = (x + (int)xc - 1) / (int)xc;  // Ceiling division
    y = (y + (int)yc - 1) / (int)yc;
    z = (z + (int)zc - 1) / (int)zc;
    compute.Dispatch(kernel, x, y, z);
}
```

**Same pattern used in our ARDepthSource** for dynamic thread group queries.

---

### 3.4 MeshBuilder.compute

**File**: `/tmp/MetavidoVFX/Packages/jp.keijiro.metavido.vfxgraph/Shaders/MeshBuilder.compute`

**Purpose**: GPU-based mesh generation from depth texture.

**Vertex Kernel**:
```hlsl
float3 GetVertexPosition(float2 uv)
{
    float depth = tex2Dlod(_DepthTexture, float4(uv, 0, 0)).x;
    return mtvd_DistanceToWorldPosition(uv, depth, _RayParams, _InverseView);
}

[numthreads(8, 8, 1)]
void VertexKernel(uint2 id : SV_DispatchThreadID)
{
    if (any(id >= Dims)) return;

    float2 uv = (float2)id / (Dims - 1);
    float3 d = float3(2.0 / (Dims - 1), 0);

    // Central position
    float3 p = GetVertexPosition(uv);

    // Neighbors for normal calculation
    float3 p_mdx = GetVertexPosition(uv - d.xz);
    float3 p_pdx = GetVertexPosition(uv + d.xz);
    float3 p_mdy = GetVertexPosition(uv - d.zy);
    float3 p_pdy = GetVertexPosition(uv + d.zy);

    // Compute normal via cross product
    float3 n = normalize(cross(p_pdy - p_mdy, p_pdx - p_mdx));

    WriteVertex(Dims.x * id.y + id.x, p, n, uv);
}
```

**Index Kernel**:
```hlsl
[numthreads(8, 8, 1)]
void IndexKernel(uint2 id : SV_DispatchThreadID)
{
    if (any(id >= Dims - 1)) return;

    uint quad_i = id.y * (Dims.x - 1) + id.x;
    uint i = quad_i * 3 * 2;  // 2 triangles per quad
    uint vi = Dims.x * id.y + id.x;

    // Triangle 1
    WriteIndices(i + 0, uint3(vi, vi + Dims.x, vi + 1));
    // Triangle 2
    WriteIndices(i + 3, uint3(vi + Dims.x, vi + Dims.x + 1, vi + 1));
}
```

---

## 4. Key Patterns & Best Practices

### 4.1 Property Naming Conventions

| Property Type | Metavido Name | ARFoundation Equivalent | Type |
|--------------|---------------|-------------------------|------|
| RGB Texture | `ColorMap` | `ColorTexture` | Texture2D |
| Depth Texture | `DepthMap` | `DepthTexture` | Texture2D |
| Camera Params | `RayParams` | `DisplayTransform` (different) | Vector4 |
| View Matrix | `InverseView` | `InverseView` | Matrix4x4 |
| Depth Range | `DepthRange` | N/A | Vector2 |

### 4.2 ExposedProperty Pattern

**Correct** (Keijiro's approach):
```csharp
[VFXPropertyBinding("UnityEngine.Texture2D"), SerializeField]
ExposedProperty _depthMapProperty = "DepthMap";

component.SetTexture(_depthMapProperty, texture);
```

**Incorrect** (string literals):
```csharp
const string DepthMap = "DepthMap";
component.SetTexture(DepthMap, texture);  // ❌ May fail in VFX Graph
```

### 4.3 RayParams Computation

**Metavido Formula**:
```csharp
var s = meta.CenterShift;  // From projection matrix m02, m12
var h = Mathf.Tan(meta.FieldOfView / 2);
return new Vector4(s.x, s.y, h * 16 / 9, h);
```

**ARFoundation Equivalent** (for reference):
```csharp
// ARFoundation uses DisplayTransform instead
var displayTransform = screenRotation * imageAspectRatioCorrectionMatrix;
// RayParams would need to be computed from XRCameraParams.screenWidth/Height
```

### 4.4 UV → World Position Algorithm

**Standard Pipeline**:
```hlsl
// 1. UV [0,1] → NDC [-1,1]
float3 ray = float3((UV - 0.5) * 2, 1);

// 2. Apply camera intrinsics
ray.xy = (ray.xy + RayParams.xy) * RayParams.zw;
//        ^^^^^^^^^^^^^^^^^^^^^^   ^^^^^^^^^^^^^^
//        Center shift (optical axis)  FOV scale

// 3. Scale by depth
ray *= Depth;

// 4. Transform to world space
float3 worldPos = mul(InverseView, float4(ray, 1)).xyz;
```

### 4.5 Compute Shader Thread Dispatch

**Dynamic Thread Group Query** (preferred):
```csharp
public static void DispatchThreads(this ComputeShader compute, int kernel, int x, int y = 1, int z = 1)
{
    uint xc, yc, zc;
    compute.GetKernelThreadGroupSizes(kernel, out xc, out yc, out zc);
    x = (x + (int)xc - 1) / (int)xc;  // Ceiling division avoids truncation
    y = (y + (int)yc - 1) / (int)yc;
    z = (z + (int)zc - 1) / (int)zc;
    compute.Dispatch(kernel, x, y, z);
}
```

**Used in**:
- `DisplacedMeshBuilder.cs` (MetavidoVFX)
- `ARDepthSource.cs` (our implementation)

---

## 5. URP Compatibility

### 5.1 VFX Graph Requirements

- **Unity Version**: Unity 6 (6000.0.0f1+)
- **VFX Graph**: 17.0.0+
- **Render Pipeline**: URP 17.0.0+ or HDRP

### 5.2 Shader Compatibility

**Demux.shader** uses `UnityCG.cginc` (Built-in RP):
```hlsl
#include "UnityCG.cginc"  // Contains UnityObjectToClipPos()
```

**For URP Migration**, replace with:
```hlsl
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
// UnityObjectToClipPos() → TransformObjectToHClip()
```

### 5.3 Graphics.Blit Alternative

`TextureDemuxer.cs` uses `Graphics.Blit()` which is deprecated in URP:
```csharp
Graphics.Blit(source, _color, _material, 0);  // Works but legacy
```

**URP Alternative**:
```csharp
// Use CommandBuffer + Blitter API
var cmd = CommandBufferPool.Get("Demux");
Blitter.BlitCameraTexture(cmd, source, _color, _material, 0);
Graphics.ExecuteCommandBuffer(cmd);
CommandBufferPool.Release(cmd);
```

---

## 6. Comparison with Our Implementation

### 6.1 Similarities

| Feature | Keijiro (Metavido) | Our (MetavidoVFX-main) |
|---------|-------------------|----------------------|
| **Binder Pattern** | `VFXMetavidoBinder` | `VFXARBinder` |
| **Property Names** | `ColorMap`, `DepthMap` | `ColorTexture`, `DepthTexture` |
| **ExposedProperty** | ✅ Uses `ExposedProperty` | ✅ Uses `ExposedProperty` |
| **Compute Dispatch** | `DispatchThreads()` extension | `DispatchThreads()` in `ARDepthSource` |
| **UV → Position** | `MetavidoInverseProjection()` | Custom operators in VFX |
| **Performance** | Single-pass demux | Hybrid Bridge (O(1) scaling) |

### 6.2 Key Differences

| Aspect | Keijiro (Metavido) | Our (ARFoundation) |
|--------|-------------------|-------------------|
| **Data Source** | `.metavido` video files | Live AR camera (ARFoundation) |
| **Metadata** | Burnt-in barcode | `XRCameraFrame`, `AROcclusionManager` |
| **Depth Format** | Hue-encoded (rainbow) | Native ARFoundation depth (R16/RFloat) |
| **Stencil** | Human segmentation | ARFoundation segmentation |
| **Camera Params** | `RayParams` (center shift + FOV) | `DisplayTransform` (screen rotation + aspect) |
| **Platform** | Unity 6, WebGPU | Unity 6, iOS/Android/Quest |
| **Update Model** | Per-frame video decode | Per-frame AR texture access |

### 6.3 Architecture Mapping

| Metavido | ARFoundation Equivalent |
|----------|------------------------|
| `MetadataDecoder` | `XRCameraFrame.TryGetTimestamp()` |
| `TextureDemuxer` | `AROcclusionManager.environmentDepthTexture` |
| `RenderUtils.RayParams()` | Custom from `XRCameraParams` |
| `RenderUtils.InverseView()` | `Camera.main.cameraToWorldMatrix` |
| `Demux.shader` | Not needed (native depth access) |
| `VFXMetavidoBinder` | `VFXARBinder` |

---

## 7. Actionable Insights

### 7.1 Property Naming Strategy

**Recommendation**: Align with Keijiro's conventions for VFX Graph compatibility:

**Current (AR-specific)**:
```csharp
ColorTexture, DepthTexture, StencilTexture
```

**Alternative (Metavido-compatible)**:
```csharp
ColorMap, DepthMap, StencilMap
```

**Hybrid Approach** (support both):
```csharp
// VFXARBinder.cs
[VFXPropertyBinding("UnityEngine.Texture2D")]
ExposedProperty _colorProperty = "ColorTexture";  // Or "ColorMap"

public string ColorPropertyName
{
    get => (string)_colorProperty;
    set => _colorProperty = value;
}
```

### 7.2 RayParams for AR

**Compute RayParams from ARFoundation**:
```csharp
public static Vector4 ComputeRayParams(XRCameraParams cameraParams)
{
    var fov = cameraParams.zNear != 0
        ? Mathf.Atan(cameraParams.screenHeight / (2f * cameraParams.zNear)) * 2f
        : 60f * Mathf.Deg2Rad;

    var h = Mathf.Tan(fov / 2);
    var aspect = cameraParams.screenWidth / cameraParams.screenHeight;

    // Center shift (typically 0,0 for ARFoundation)
    var sx = 0f;
    var sy = 0f;

    return new Vector4(sx, sy, h * aspect, h);
}
```

### 7.3 Depth → World Position Operator

**Create VFX Operator** (`AR Inverse Projection.vfxoperator`):
```hlsl
float3 ARInverseProjection(float2 UV, float Depth, float4 RayParams, float4x4 InverseView)
{
    float3 p = float3(UV * 2 - 1, 1);
    p.xy = (p.xy + RayParams.xy) * RayParams.zw;
    p *= Depth;
    return mul(InverseView, float4(p, 1)).xyz;
}
```

**Use in VFX Graph**:
```yaml
Initialize Particle
  ├─ Sample Texture (DepthTexture) at UV → Depth
  ├─ AR Inverse Projection(UV, Depth, RayParams, InverseView) → position
  └─ Sample Texture (ColorTexture) at UV → color
```

### 7.4 Mesh Builder Pattern

**For non-particle VFX**, adapt `DisplacedMeshBuilder.cs`:

**Our Version** (`ARMeshBuilder.cs`):
```csharp
public class ARMeshBuilder : MonoBehaviour
{
    [SerializeField] ARDepthSource _depthSource;
    [SerializeField] ComputeShader _meshCompute;
    [SerializeField, Range(0, 31)] int _decimation = 7;

    void LateUpdate()
    {
        if (!_depthSource.IsTextureReady) return;

        var depthTex = _depthSource.DepthTexture;
        var (w, h) = (depthTex.width / (_decimation + 1),
                     depthTex.height / (_decimation + 1));

        // Compute RayParams from AR camera
        var rayParams = ComputeRayParams();
        var iview = Camera.main.cameraToWorldMatrix;

        _meshCompute.SetVector("_RayParams", rayParams);
        _meshCompute.SetMatrix("_InverseView", iview);
        _meshCompute.SetTexture(0, "_DepthTexture", depthTex);

        // Dispatch vertex reconstruction
        _meshCompute.SetInts("Dims", w, h);
        _meshCompute.SetBuffer(0, "VertexBuffer", _vertexBuffer);
        _meshCompute.DispatchThreads(0, w, h);

        // Dispatch index generation
        _meshCompute.SetBuffer(1, "IndexBuffer", _indexBuffer);
        _meshCompute.DispatchThreads(1, w - 1, h - 1);
    }
}
```

---

## 8. Critical Findings

### 8.1 Burnt-In Metadata Innovation

Keijiro's **barcode metadata encoding** is genius for synchronizing camera tracking with video frames **without external files**. This eliminates drift and sync issues.

**For Live AR**: We don't need this - we have direct access to `XRCameraFrame` metadata.

### 8.2 Hue Depth Encoding

**Why Hue?** Compression-resistant encoding:
- Depth → Hue (0-360°) → RGB rainbow gradient
- JPEG/H.264 compression preserves hue better than intensity
- Padding/margin prevent wraparound artifacts

**For Live AR**: We use native R16/RFloat depth textures (no encoding needed).

### 8.3 UV Multiplexing

**Frame Layout** saves bandwidth:
- Single 1920x1080 video contains color + depth + stencil + metadata
- No separate files, perfect sync guaranteed
- Trade-off: Half resolution for color (960x1080 vs 1920x1080)

**For Live AR**: We get separate textures from ARFoundation (no multiplexing).

### 8.4 ExposedProperty Pattern

**Critical for VFX Graph**:
```csharp
// ✅ Correct - Type-safe property binding
[VFXPropertyBinding("UnityEngine.Texture2D")]
ExposedProperty _depthMapProperty = "DepthMap";

// ❌ Incorrect - May fail in VFX Graph
const string DepthMap = "DepthMap";
```

**Reason**: VFX Graph internally uses `ExposedProperty` struct for property resolution. String literals may work but are not guaranteed.

---

## 9. Performance Notes

### 9.1 Demux Cost

**Per-frame operations**:
- 2x `Graphics.Blit()` calls (color + depth)
- Hue decoding on GPU (minimal cost)
- RenderTexture allocation (lazy, one-time)

**Optimization**: Could combine into single pass with MRT (Multiple Render Targets).

### 9.2 Mesh Builder Cost

**Compute shader dispatch**:
- Vertex kernel: `(w/8) * (h/8)` thread groups
- Index kernel: `((w-1)/8) * ((h-1)/8)` thread groups
- Decimation = 7 → 240x135 vertices (good balance)

**Optimization**: Already optimal with dynamic thread groups.

### 9.3 VFX Graph Cost

**Particle initialization**:
- Sample DepthMap (1 texture read)
- Sample ColorMap (1 texture read)
- Inverse projection (5 MAD ops + 1 matrix multiply)

**Per VFX**: ~3-5 texture samples, 10-20 ALU ops.

**Our Hybrid Bridge**: Optimizes this by centralizing compute dispatch in `ARDepthSource`.

---

## 10. Integration Recommendations

### 10.1 For MetavidoVFX-main Project

**Adopt from Keijiro**:
1. ✅ **ExposedProperty Pattern** - Already using in `VFXARBinder`
2. ✅ **DispatchThreads Extension** - Already using in `ARDepthSource`
3. ⬜ **RayParams Computation** - Add for AR camera parameters
4. ⬜ **Inverse Projection Operator** - Create VFX subgraph operator
5. ⬜ **Mesh Builder Pattern** - For non-particle VFX use cases

**Don't Adopt**:
- ❌ Demux shader (we have native textures)
- ❌ Hue encoding (we have native depth)
- ❌ UV multiplexing (ARFoundation provides separate textures)

### 10.2 New VFX Operators to Create

**File**: `Assets/VFX/Operators/AR Inverse Projection.vfxoperator`
```hlsl
float3 ARInverseProjection(float2 UV, float Depth, float4 RayParams, float4x4 InverseView)
{
    float3 p = float3(UV * 2 - 1, 1);
    p.xy = (p.xy + RayParams.xy) * RayParams.zw;
    p *= Depth;
    return mul(InverseView, float4(p, 1)).xyz;
}
```

**File**: `Assets/VFX/Operators/Compute RayParams.vfxoperator`
```hlsl
float4 ComputeRayParams(float FOV, float Aspect)
{
    float h = tan(FOV / 2);
    return float4(0, 0, h * Aspect, h);  // Assume center shift = 0
}
```

### 10.3 Documentation Updates

**Add to** `KnowledgeBase/_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md`:

**Section**: "Depth to World Position Conversion"
```markdown
### UV → World Position (Keijiro Pattern)

float3 ARInverseProjection(float2 UV, float Depth, float4 RayParams, float4x4 InverseView)
{
    float3 p = float3(UV * 2 - 1, 1);              // UV [0,1] → NDC [-1,1]
    p.xy = (p.xy + RayParams.xy) * RayParams.zw;   // Apply camera intrinsics
    p *= Depth;                                    // Scale by depth
    return mul(InverseView, float4(p, 1)).xyz;     // Camera → world space
}

RayParams = (centerShiftX, centerShiftY, tanFOV * aspect, tanFOV)
InverseView = Camera.cameraToWorldMatrix
```

---

## 11. References

### 11.1 GitHub Repositories

- **MetavidoVFX**: https://github.com/keijiro/MetavidoVFX
- **Metavido**: https://github.com/keijiro/Metavido

### 11.2 Key Files Analyzed

**C# Scripts**:
- `VFXMetavidoBinder.cs` - VFX property binder
- `RenderUtils.cs` - RayParams/InverseView computation
- `Metadata.cs` - Burnt-in metadata struct
- `TextureDemuxer.cs` - Texture splitting
- `DisplacedMeshBuilder.cs` - Mesh generation
- `Util.cs` - Extension methods

**Shaders**:
- `Common.hlsl` - Depth encoding, UV remapping
- `Utils.hlsl` - World position reconstruction
- `Demux.shader` - Texture demultiplexing
- `MeshBuilder.compute` - Mesh generation

**VFX Operators**:
- `Metavido Inverse Projection.vfxoperator` - UV → world position
- `Metavido Sample UV.vfxblock` - Texture sampling
- `Metavido Filter.vfxblock` - Depth filtering

**VFX Assets**:
- `Particles.vfx` - Particle-based visualization
- `Voxels.vfx` - Voxel-based visualization
- `Afterimage.vfx` - Motion trail effect

### 11.3 Unity Documentation

- VFX Graph Property Binders: https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@latest
- ExposedProperty API: Unity Scripting Reference
- ComputeShader.GetKernelThreadGroupSizes(): https://docs.unity3d.com/ScriptReference/ComputeShader.GetKernelThreadGroupSizes.html

---

## 12. Conclusion

Keijiro's MetavidoVFX demonstrates **production-grade VFX Graph architecture** for volumetric video. The key innovations are:

1. **Burnt-in barcode metadata** - Eliminates sync issues
2. **UV multiplexing** - Single video contains all data
3. **Hue depth encoding** - Compression-resistant depth
4. **ExposedProperty pattern** - Type-safe VFX bindings
5. **RayParams formula** - Canonical UV → world position
6. **Compute shader mesh builder** - GPU-accelerated geometry

**For our ARFoundation project**, we should **adopt the patterns** but not the video-specific features. The `ARInverseProjection` operator and `RayParams` computation are immediately actionable improvements.

**Performance**: Keijiro's approach is O(n) per VFX (each VFX samples textures independently). Our Hybrid Bridge is O(1) across all VFX (single compute dispatch). Both are valid - Keijiro prioritizes flexibility, we prioritize scaling.

**Next Steps**:
1. Create `AR Inverse Projection.vfxoperator` based on Keijiro's HLSL
2. Add `RayParams` property to `VFXARBinder`
3. Update VFX assets to use new operators
4. Document patterns in `_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md`

---

**Research Completed**: 2026-01-20
**Files Created**: `/Users/jamestunick/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_KEIJIRO_METAVIDO_VFX_RESEARCH.md`
**Status**: ✅ Research-only (no code modifications)
# Keijiro Audio-Reactive VFX Graph Projects - Research Report

**Target**: iOS Metal Compatible Audio → VFX Graph Patterns
**Search Duration**: 2026-01-20
**Repositories Found**: 5 primary audio-reactive VFX projects
**Unity Version**: Unity 2022.3+ (LASP v2), Unity 2019.3+ (Grubo/LaspVfx original)

---

## Executive Summary

**CRITICAL FINDING**: Keijiro's LASP (Low-latency Audio Signal Processing) plugin is **desktop-only** (Windows, macOS, Linux). It does NOT support iOS or Android mobile platforms.

However, the **binding patterns** and **VFX Graph techniques** are fully iOS Metal compatible. The limitation is purely in the audio input layer, which can be replaced with Unity's built-in `AudioListener.GetSpectrumData()` for mobile.

---

## 1. Core Projects Discovered

### 1.1 LASP v2 (Primary Audio Engine)
- **Repo**: https://github.com/keijiro/Lasp
- **Last Updated**: 2025-10-10
- **Unity**: 2022.3 LTS+
- **Platform Support**: Desktop only (Windows, macOS, Linux)
- **Key Features**:
  - Low-latency audio input (<10ms typical)
  - Real-time FFT spectrum analysis
  - Multi-channel support
  - Frequency band filtering (Low/Mid/High Pass)
  - Auto-gain normalization with peak tracking
  - Property Binder architecture for VFX Graph

**Mobile Compatibility**: ❌ Native plugin uses libsoundio (desktop-only C library)

### 1.2 LaspVfx (VFX Graph Binders)
- **Repo**: https://github.com/keijiro/LaspVfx
- **Last Updated**: 2025-03-31
- **Unity**: 2022.3+
- **Key Components**:
  - `VFXAudioLevelBinder` - Normalized audio level (0-1 float)
  - `VFXAudioGainBinder` - Current gain in dB
  - `VFXSpectrumBinder` - FFT spectrum as 1D texture (R32_SFloat)
  - `VFXWaveformBinder` - Raw waveform as 1D texture (4096 samples max)

**Mobile Compatibility**: ✅ Binder patterns are 100% mobile-compatible (standard VFX Graph API)

### 1.3 Grubo (Audio-Visual Experience)
- **Repo**: https://github.com/keijiro/Grubo
- **Last Updated**: 2023-10-09
- **Unity**: 2019.3, HDRP
- **Purpose**: Roland MC-101 MIDI + VFX Graph visualizer
- **Techniques**:
  - MIDI-driven VFX (via Minis plugin)
  - Ribbon effects (4 synth tracks)
  - Camera shake/effects
  - Colorful structure generation
  - Kino post-processing (lo-fi visual style)

**Mobile Compatibility**: ⚠️ MIDI input layer is desktop-focused, but VFX techniques are universal

### 1.4 Reaktion (Legacy Audio Toolkit)
- **Repo**: https://github.com/keijiro/Reaktion
- **Last Updated**: 2015-07-07
- **Unity**: Pre-VFX Graph era (2013-2015)
- **Status**: Archived/obsolete (replaced by LASP)

**Mobile Compatibility**: N/A - Predates VFX Graph

### 1.5 Fluo (Latest Visualizer)
- **Repo**: https://github.com/keijiro/Fluo
- **Last Updated**: 2025-10-13 (very recent!)
- **Unity**: Unity 6+
- **Purpose**: Modern visualizer project
- **Note**: Appears to be keijiro's latest audio-visual work

**Mobile Compatibility**: Unknown - requires further investigation

---

## 2. Key VFX Binding Patterns (iOS Metal Compatible)

### Pattern 1: Audio Level → Float Parameter

```csharp
// VFXAudioLevelBinder.cs (LaspVfx)
[VFXBinder("LASP/Audio Level")]
sealed class VFXAudioLevelBinder : VFXBinderBase
{
    [VFXPropertyBinding("System.Single"), SerializeField]
    ExposedProperty _property = "AudioLevel";

    public Lasp.AudioLevelTracker Target = null;

    public override bool IsValid(VisualEffect component)
      => Target != null && component.HasFloat(_property);

    public override void UpdateBinding(VisualEffect component)
      => component.SetFloat(_property, Target.normalizedLevel);
}
```

**Mobile Adaptation**:
- Replace `Lasp.AudioLevelTracker` with `AudioListener.GetOutputData()` RMS calculation
- Keep exact same VFX Graph property binding pattern
- Frequency band filtering: Manual FFT or simple low/high pass on PCM data

### Pattern 2: Spectrum → 1D Texture

```csharp
// VFXSpectrumBinder.cs (LaspVfx)
[VFXBinder("LASP/Spectrum")]
sealed class VFXSpectrumBinder : VFXBinderBase
{
    [VFXPropertyBinding("UnityEngine.Texture2D")]
    ExposedProperty _textureProperty = "WaveformTexture";

    [VFXPropertyBinding("System.UInt32")]
    ExposedProperty _resolutionProperty = "Resolution";

    public override void UpdateBinding(VisualEffect component)
    {
        if (Target.texture == null) return;
        component.SetTexture(_textureProperty, Target.texture);
        component.SetUInt(_resolutionProperty, (uint)Target.texture.width);
    }
}
```

**Texture Format**:
- **Width**: 64, 128, 256, 512, 1024, 2048 (power of 2)
- **Height**: 1 (always)
- **Format**: `TextureFormat.RFloat` (R32_SFloat)
- **Filter**: Bilinear
- **Wrap**: Clamp

**Mobile Adaptation**:
```csharp
// iOS Metal compatible
float[] spectrum = new float[256];
AudioListener.GetSpectrumData(spectrum, 0, FFTWindow.BlackmanHarris);

Texture2D spectrumTex = new Texture2D(256, 1, TextureFormat.RFloat, false) {
    filterMode = FilterMode.Bilinear,
    wrapMode = TextureWrapMode.Clamp
};

NativeArray<float> buffer = new NativeArray<float>(spectrum, Allocator.Temp);
spectrumTex.LoadRawTextureData(buffer);
spectrumTex.Apply();
buffer.Dispose();
```

### Pattern 3: Waveform → 1D Texture

```csharp
// VFXWaveformBinder.cs (LaspVfx)
const int MaxSamples = 4096;

void UpdateTexture()
{
    if (_texture == null)
    {
        _texture = new Texture2D(MaxSamples, 1, TextureFormat.RFloat, false) {
            filterMode = FilterMode.Bilinear,
            wrapMode = TextureWrapMode.Clamp
        };
    }

    var slice = Target.audioDataSlice;
    _sampleCount = Mathf.Min(_buffer.Length, slice.Length);

    if (_sampleCount > 0)
    {
        slice.CopyTo(_buffer.GetSubArray(0, _sampleCount));
        _texture.LoadRawTextureData(_buffer);
        _texture.Apply();
    }
}
```

**Mobile Adaptation**:
```csharp
// iOS Metal compatible
float[] waveform = new float[4096];
AudioListener.GetOutputData(waveform, 0);

// Same texture creation as spectrum
```

---

## 3. VFX Techniques Used

### 3.1 Particle Behaviors (from LaspVfx examples)

1. **Spectrogram Particles**:
   - Spawn rate modulated by audio level
   - Particle size driven by frequency bands
   - Color mapped to spectrum values
   - Velocity based on beat detection

2. **Lissajous Curves**:
   - Position sampling from waveform texture
   - X/Y coordinates = stereo channel data
   - Trail renderer for smooth curves
   - Dynamic resolution based on sample count

3. **Audio-Reactive Spawning**:
   - Burst emission on beat peaks
   - Spawn rate = `normalizedLevel * maxRate`
   - Lifetime variation by frequency content

### 3.2 Property Modulation Patterns

```
Audio Level (0-1) → VFX Properties:
├─ Spawn Rate (particles/sec)
├─ Particle Size (scale multiplier)
├─ Color Intensity (HDR emission)
├─ Velocity Magnitude (m/s)
├─ Turbulence Strength (noise intensity)
└─ Camera Shake (post-processing)
```

### 3.3 Frequency Band Filtering

**Low Pass** (Kick/Bass):
- Filter: <200 Hz
- Use: Camera shake, structure deformation
- VFX: Large slow particles, ground impact effects

**Band Pass** (Mid):
- Filter: 200-2000 Hz
- Use: Ribbon effects, synth visualization
- VFX: Medium particles, color shifts

**High Pass** (Hi-Hat/Cymbals):
- Filter: >2000 Hz
- Use: Sparkle effects, detail particles
- VFX: Small fast particles, emission bursts

---

## 4. Performance Characteristics

### Desktop (LASP)
- **Latency**: <10ms (native audio input)
- **FFT**: Real-time, configurable resolution
- **Update Rate**: 60-120 FPS typical
- **Overhead**: Negligible (<1ms CPU)

### Mobile (AudioListener.GetSpectrumData)
- **Latency**: ~21ms (2 buffer frames @ 48kHz)
- **FFT**: Unity's built-in (limited control)
- **Update Rate**: 30-60 FPS (OnAudioFilterRead)
- **Overhead**: 1-3ms CPU (spectrum analysis)

**Optimization Tips**:
1. Use smaller FFT windows (256-512 samples)
2. Call `GetSpectrumData()` once per frame, cache result
3. Downsample spectrum texture (128-256 width max)
4. Avoid `Apply()` on texture every frame - use double buffering
5. Use `TextureFormat.RFloat` (not RGBAFloat) - 4x memory savings

---

## 5. Mobile Alternative: Unity Built-In Audio

### iOS Metal Compatible Approach

```csharp
public class MobileAudioVFXBinder : VFXBinderBase
{
    [VFXPropertyBinding("System.Single")]
    ExposedProperty _levelProperty = "AudioLevel";

    [VFXPropertyBinding("UnityEngine.Texture2D")]
    ExposedProperty _spectrumProperty = "Spectrum";

    private Texture2D _spectrumTex;
    private float[] _spectrum = new float[256];
    private NativeArray<float> _buffer;

    void Start()
    {
        _spectrumTex = new Texture2D(256, 1, TextureFormat.RFloat, false) {
            filterMode = FilterMode.Bilinear,
            wrapMode = TextureWrapMode.Clamp
        };
        _buffer = new NativeArray<float>(256, Allocator.Persistent);
    }

    void Update()
    {
        // Get spectrum data (iOS compatible)
        AudioListener.GetSpectrumData(_spectrum, 0, FFTWindow.BlackmanHarris);

        // Calculate normalized level
        float level = CalculateRMS(_spectrum);

        // Update VFX
        if (IsValid(component))
        {
            component.SetFloat(_levelProperty, level);

            // Update spectrum texture
            _buffer.CopyFrom(_spectrum);
            _spectrumTex.LoadRawTextureData(_buffer);
            _spectrumTex.Apply();

            component.SetTexture(_spectrumProperty, _spectrumTex);
        }
    }

    float CalculateRMS(float[] samples)
    {
        float sum = 0f;
        for (int i = 0; i < samples.Length; i++)
            sum += samples[i] * samples[i];
        return Mathf.Sqrt(sum / samples.Length);
    }

    void OnDestroy()
    {
        if (_buffer.IsCreated) _buffer.Dispose();
        if (_spectrumTex != null) Destroy(_spectrumTex);
    }
}
```

### WebGL Compatibility Note

**CRITICAL**: `AudioListener.GetSpectrumData()` is **NOT supported on WebGL** (returns silent data).

**WebGL Alternative**: Use Web Audio API via JavaScript plugin:
```javascript
// Unity WebGL plugin
var audioContext = new AudioContext();
var analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
var dataArray = new Uint8Array(analyser.frequencyBinCount);

function getSpectrum() {
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
}
```

---

## 6. Existing Implementations in Unity-XR-AI Project

### Current Audio VFX System (MetavidoVFX)

**File**: `/Users/jamestunick/Documents/GitHub/Unity-XR-AI/MetavidoVFX-main/Assets/Scripts/Bridges/AudioBridge.cs`

**Current Approach**:
- Uses `AudioListener.GetSpectrumData()` ✅ iOS compatible
- Exposes frequency bands as global shader properties
- No VFX Graph binders yet

**Relevant Files**:
- `Assets/Scripts/VFX/Binders/VFXAudioDataBinder.cs` (exists but may need update)
- `Assets/Scripts/Audio/BeatDetector.cs` (beat detection system)

**Recommended Enhancement**:
1. Create `VFXAudioLevelBinder` based on Keijiro's pattern
2. Create `VFXSpectrumTextureBinder` for spectrum visualization
3. Integrate with existing `AudioBridge` system
4. Add frequency band filtering (Low/Mid/High)

---

## 7. Recommendations for MetavidoVFX

### Immediate Actions

1. **Port Keijiro's Binder Patterns**:
   - Copy `VFXBinderBase` architecture from LaspVfx
   - Replace LASP audio source with `AudioListener.GetSpectrumData()`
   - Add spectrum-to-texture conversion (256-512 width)

2. **Integrate with Existing AudioBridge**:
   ```csharp
   // AudioBridge.cs enhancement
   public float NormalizedLevel { get; private set; }
   public Texture2D SpectrumTexture { get; private set; }
   public float[] FrequencyBands { get; private set; } // Low, Mid, High
   ```

3. **Create VFX Examples**:
   - Beat-reactive particle burst (kick drum detection)
   - Spectrum visualizer bars (frequency-driven height)
   - Waveform trail (audio waveform as particle path)

### Integration with H3M Hologram System

**Use Case**: Audio-reactive hologram effects

```
Audio Input (Mic/Music)
  → AudioBridge (FFT analysis)
  → VFXAudioLevelBinder (exposed "AudioLevel" parameter)
  → H3M Hologram VFX (particle emission, color, turbulence)
  → AR Camera (rendered in AR space)
```

**Example VFX Graph Properties**:
- `AudioLevel` (float): Particle spawn rate multiplier
- `SpectrumTexture` (Texture2D): Color gradient lookup
- `BassLevel` (float): Camera shake intensity
- `HighLevel` (float): Sparkle particle emission

---

## 8. Platform Compatibility Matrix

| Feature | Desktop | iOS Metal | Android | Quest | WebGL |
|---------|---------|-----------|---------|-------|-------|
| **LASP Plugin** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **VFX Binder Patterns** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **AudioListener.GetSpectrumData()** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Texture Format RFloat** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Real-time FFT** | ✅ | ✅ | ✅ | ✅ | ⚠️* |

*WebGL requires Web Audio API plugin

---

## 9. Knowledge Base Updates

### Auto-Added Repositories

✅ **Auto-added to**: `/Users/jamestunick/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md`

**Category**: Audio & Music

```markdown
### Audio & Music
- **keijiro/Lasp** - Low-latency audio input plugin (desktop only)
  - https://github.com/keijiro/Lasp
  - Unity 2022.3+, Desktop (Win/Mac/Linux)
  - Property Binder architecture for VFX Graph

- **keijiro/LaspVfx** - VFX Graph binders for LASP
  - https://github.com/keijiro/LaspVfx
  - 4 binders: Level, Gain, Spectrum, Waveform
  - Texture-based spectrum/waveform visualization

- **keijiro/Grubo** - Audio-visual experience with Roland MC-101
  - https://github.com/keijiro/Grubo
  - MIDI + VFX Graph, HDRP
  - Ribbon effects, camera shake, colorful structures

- **keijiro/Fluo** - Modern Unity 6 visualizer
  - https://github.com/keijiro/Fluo
  - Latest audio-visual work (2025)

- **keijiro/Reaktion** - Legacy audio toolkit (archived)
  - https://github.com/keijiro/Reaktion
  - Pre-VFX Graph era (2013-2015)
```

### Extracted Patterns Added

✅ **Auto-added to**: `/Users/jamestunick/Documents/GitHub/Unity-XR-AI/KnowledgeBase/_ARFOUNDATION_VFX_KNOWLEDGE_BASE.md`

**New Section**: Audio-Reactive VFX Patterns

```markdown
## Audio-Reactive VFX Patterns

### Pattern: Audio Level Binder (iOS Metal Compatible)

```csharp
// Keijiro's VFXBinderBase pattern (LaspVfx)
[VFXBinder("Audio/Level")]
public class VFXAudioLevelBinder : VFXBinderBase
{
    [VFXPropertyBinding("System.Single")]
    ExposedProperty _property = "AudioLevel";

    public override bool IsValid(VisualEffect component)
      => component.HasFloat(_property);

    public override void UpdateBinding(VisualEffect component)
    {
        // iOS: Use AudioListener.GetSpectrumData()
        float level = CalculateAudioLevel();
        component.SetFloat(_property, level);
    }
}
```

**Use Cases**:
- Particle spawn rate modulation
- Emission intensity control
- Size/scale animation
- Turbulence strength

**iOS Compatibility**: ✅ (replace LASP with AudioListener API)

### Pattern: Spectrum Texture Binder

```csharp
// 1D spectrum texture for VFX Graph sampling
Texture2D spectrumTex = new Texture2D(256, 1, TextureFormat.RFloat, false);

float[] spectrum = new float[256];
AudioListener.GetSpectrumData(spectrum, 0, FFTWindow.BlackmanHarris);

NativeArray<float> buffer = new NativeArray<float>(spectrum, Allocator.Temp);
spectrumTex.LoadRawTextureData(buffer);
spectrumTex.Apply();
buffer.Dispose();

vfx.SetTexture("SpectrumTexture", spectrumTex);
vfx.SetUInt("Resolution", 256);
```

**VFX Graph Usage**:
- Sample texture by particle ID % resolution
- Color gradient lookup by frequency
- Height/scale driven by spectrum value

**Performance**: 1-2ms per frame @ 256 samples (iOS)
```
# VFX Pipeline Comparison

## Overview

Comprehensive comparison of all VFX pipelines available in MetavidoVFX project for driving particle effects from AR sensor data.

---

## Pipeline Architecture Diagrams

### 1. PeopleOcclusionVFXManager (GPU Compute - 3 Pass)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PeopleOcclusionVFXManager Pipeline                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │ ARKit Depth  │    │ ARKit Color  │    │ Human Stencil│              │
│  │   Texture    │    │   Texture    │    │   Texture    │              │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │
│         │                   │                    │                      │
│         ▼                   │                    ▼                      │
│  ┌──────────────────────────┴────────────────────────────┐              │
│  │            GPU Compute Pass 1: DepthToWorld           │              │
│  │      (Depth + Stencil → World Position Texture)       │              │
│  │           32x32 thread groups per dispatch            │              │
│  └───────────────────────────┬───────────────────────────┘              │
│                              │                                          │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────┐              │
│  │            GPU Compute Pass 2: Velocity               │              │
│  │      (Position[t] - Position[t-1] → Velocity)         │              │
│  │           Temporal buffer (ping-pong)                 │              │
│  └───────────────────────────┬───────────────────────────┘              │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     VFX Graph Properties                         │    │
│  │  • ColorMap (Texture2D)        • PositionMap (RenderTexture)    │    │
│  │  • StencilMap (Texture2D)      • VelocityMap (RenderTexture)    │    │
│  │  • InverseView (Matrix4x4)     • DepthRange (Vector2)           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Performance: ~2.5ms GPU @ 256x192 depth | ~4ms @ 512x384               │
│  Memory: 3 RenderTextures (Position, Velocity, Previous Position)       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. H3M HologramSource (GPU Compute - 1 Pass)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       HologramSource Pipeline                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │  Depth Tex   │    │ Color (Tex)  │    │ Stencil Tex  │              │
│  │ ARKit/LiDAR  │    │   Provider   │    │ (Optional)   │              │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │
│         │                   │                    │                      │
│         ▼                   │                    ▼                      │
│  ┌──────────────────────────┴────────────────────────────┐              │
│  │            GPU Compute: DepthToWorld Kernel           │              │
│  │                                                        │              │
│  │   Inputs:  _Depth, _Stencil, _InvVP, _DepthRange      │              │
│  │   Output:  _PositionRT (ARGBFloat)                    │              │
│  │                                                        │              │
│  │   Dispatch: ceil(w/32) × ceil(h/32) × 1               │              │
│  └───────────────────────────┬───────────────────────────┘              │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Exposed Properties                           │    │
│  │  • PositionMap (RenderTexture)  • ColorTexture (Texture)        │    │
│  │  • StencilTexture (Texture)     • DepthRange (Vector2)          │    │
│  │  • InverseViewMatrix            • RayParams (Vector4)           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Performance: ~1.5ms GPU @ 256x192 | Single compute pass                │
│  Memory: 1 RenderTexture (PositionMap ARGBFloat)                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3. H3MLiDARCapture (Direct Passthrough - 0 Compute)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    H3MLiDARCapture Pipeline (Rcam4)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐                                   │
│  │ ARKit Depth  │    │ Camera Color │                                   │
│  │   Manager    │    │   Provider   │                                   │
│  └──────┬───────┘    └──────┬───────┘                                   │
│         │                   │                                            │
│         ▼                   ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                 Direct VFX Property Binding                       │   │
│  │                                                                    │   │
│  │   vfx.SetTexture("DepthMap", environmentDepthTexture);           │   │
│  │   vfx.SetTexture("ColorMap", colorProvider.Texture);             │   │
│  │   vfx.SetMatrix4x4("InverseView", camera.cameraToWorldMatrix);   │   │
│  │   vfx.SetVector4("RayParams", rayParams);                        │   │
│  │   vfx.SetVector2("DepthRange", depthRange);                      │   │
│  │   vfx.SetBool("Spawn", true);                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Performance: ~0.2ms CPU only | No GPU compute                          │
│  Memory: No additional RenderTextures                                   │
│  Note: Depth→Position conversion happens in VFX Graph shader           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4. ARKitMetavidoBinder (VFXBinderBase Pattern)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   ARKitMetavidoBinder Pipeline                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     VFXBinderBase Lifecycle                         │ │
│  │                                                                      │ │
│  │   IsValid() → Check Manager/Texture availability                   │ │
│  │   UpdateBinding() → Push properties each frame                     │ │
│  │                                                                      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │ ARKit Depth  │    │ Camera Color │    │   Compute    │              │
│  │   Manager    │    │   Provider   │    │   Shader     │              │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘              │
│         │                   │                    │                      │
│         ▼                   ▼                    ▼                      │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   UpdateBinding() Method                          │   │
│  │                                                                    │   │
│  │   1. Dispatch DepthToWorld compute                                │   │
│  │   2. vfx.SetTexture("ColorMap", ...)                             │   │
│  │   3. vfx.SetTexture("DepthMap", ...)                             │   │
│  │   4. vfx.SetTexture("PositionMap", ...)                          │   │
│  │   5. vfx.SetMatrix4x4("InverseView", ...)                        │   │
│  │   6. vfx.SetVector4("RayParams", ...)                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Performance: ~1.5ms GPU + VFXBinder overhead                           │
│  Benefit: Pluggable via VFX Property Binders UI                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5. Echovision (Audio + Mesh Driven)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Echovision Pipeline                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    Audio Analysis Path                             │  │
│  │                                                                     │  │
│  │  ┌─────────────┐    ┌──────────────────────────────────────────┐  │  │
│  │  │ AudioSource │───▶│         AudioProcessor                   │  │  │
│  │  │ (Microphone)│    │  • GetOutputData() → RMS → dB            │  │  │
│  │  └─────────────┘    │  • GetSpectrumData() → FFT → Pitch       │  │  │
│  │                     │  • Outputs: AudioVolume, AudioPitch      │  │  │
│  │                     └────────────────────┬─────────────────────┘  │  │
│  └──────────────────────────────────────────┼────────────────────────┘  │
│                                              │                          │
│  ┌───────────────────────────────────────────┼───────────────────────┐  │
│  │                    Mesh Streaming Path    │                        │  │
│  │                                           │                        │  │
│  │  ┌─────────────┐    ┌─────────────────────┴────────────────────┐  │  │
│  │  │ ARMeshMgr   │───▶│              MeshVFX                     │  │  │
│  │  │  (LiDAR)    │    │  • GraphicsBuffer (65K verts, 12B/vert)  │  │  │
│  │  └─────────────┘    │  • MeshPointCache, MeshNormalCache       │  │  │
│  │                     │  • MeshPointCount                         │  │  │
│  │                     └────────────────────┬─────────────────────┘  │  │
│  └──────────────────────────────────────────┼────────────────────────┘  │
│                                              │                          │
│  ┌───────────────────────────────────────────┼───────────────────────┐  │
│  │                   Wave Emission           │                        │  │
│  │                                           ▼                        │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │              SoundWaveEmitter                                │  │  │
│  │  │  • 3-wave circular buffer (Wave0, Wave1, Wave2)             │  │  │
│  │  │  • TrackedPoseDriver for head position                      │  │  │
│  │  │  • Audio volume → Wave amplitude                            │  │  │
│  │  │  • WaveRadius expands over time                             │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Performance: ~1ms CPU (audio) + ~2ms GPU (mesh upload)                 │
│  Memory: 1 GraphicsBuffer (780KB for 65K vertices)                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Performance Comparison Table

| Pipeline | GPU Cost | CPU Cost | Memory | iOS Scale | Android Scale | Quest |
|----------|----------|----------|--------|-----------|---------------|-------|
| **PeopleOcclusion** | ~2.5ms | 0.5ms | 3 RT | Good (LiDAR) | Limited | N/A |
| **HologramSource** | ~1.5ms | 0.3ms | 1 RT | Excellent | Limited | N/A |
| **H3MLiDARCapture** | ~0ms | 0.2ms | 0 RT | Best | N/A | N/A |
| **ARKitMetavidoBinder** | ~1.5ms | 0.4ms | 1 RT | Good | Limited | N/A |
| **Echovision Audio** | ~0ms | 1.0ms | FFT buf | Excellent | Excellent | Good |
| **Echovision Mesh** | ~2ms | 0.5ms | 780KB | Good | Good | Limited |

### Resolution Scaling (iOS LiDAR)

| Resolution | GPU Time | Recommended Use |
|------------|----------|-----------------|
| 256×192 | ~1.5ms | Real-time VFX, high particle count |
| 512×384 | ~4.0ms | Balanced quality/performance |
| 768×576 | ~8.0ms | High quality, limited VFX |

---

## Scene Setup Instructions

### 1. PeopleOcclusionVFXManager Setup

```
Required GameObjects:
├── AR Session Origin
│   ├── AR Camera
│   │   └── AR Camera Background
│   ├── AR Occlusion Manager (required)
│   └── AR Camera Texture Provider (Metavido)
├── VFX Controller
│   └── [PeopleOcclusionVFXManager.cs]
│       ├── Compute Shader: GeneratePositionTexture
│       ├── Compute Shader: GenerateVelocityTexture
│       └── VFX Targets: [array of VisualEffect]
└── VFX Particles
    └── [VisualEffect] with required properties

Required VFX Properties:
- ColorMap (Texture2D)
- StencilMap (Texture2D)
- PositionMap (Texture2D)
- VelocityMap (Texture2D)
- InverseView (Matrix4x4)
```

### 2. HologramSource + HologramRenderer Setup

```
Required GameObjects:
├── AR Session Origin
│   ├── AR Camera
│   ├── AR Occlusion Manager
│   └── AR Camera Texture Provider
├── Hologram System
│   └── [HologramSource.cs]
│       ├── Compute Shader: DepthToWorld (Resources)
│       ├── Use Stencil: true
│       └── Depth Range: (0.1, 5.0)
└── VFX Renderer
    └── [HologramRenderer.cs]
        └── Links to HologramSource outputs

HologramRenderer reads:
- hologramSource.PositionMap
- hologramSource.ColorTexture
- hologramSource.StencilTexture
- hologramSource.GetInverseViewMatrix()
- hologramSource.GetRayParams()
```

### 3. H3MLiDARCapture Setup (Lightweight)

```
Required GameObjects:
├── AR Session Origin
│   ├── AR Camera
│   │   └── [H3MLiDARCapture.cs] ← Attach to camera
│   │       ├── Occlusion Manager: [ref]
│   │       ├── Color Provider: [ref]
│   │       ├── VFX: [VisualEffect ref]
│   │       └── Depth Range: (0.1, 5.0)
│   └── AR Occlusion Manager
└── VFX Particles
    └── [VisualEffect]

Required VFX Properties:
- DepthMap (Texture2D)
- ColorMap (Texture2D)
- InverseView (Matrix4x4)
- RayParams (Vector4)
- DepthRange (Vector2)
- Spawn (bool)
```

### 4. Echovision Audio Setup

```
Required GameObjects:
├── Audio System
│   ├── [AudioSource] (Microphone or music)
│   └── [AudioProcessor.cs]
│       └── Audio Source: [ref]
├── Head Tracking
│   └── [TrackedPoseDriver] (XR Origin camera)
└── VFX Emitter
    └── [SoundWaveEmitter.cs]
        ├── Audio Processor: [ref]
        ├── Head: [TrackedPoseDriver ref]
        └── VFX: [VisualEffect ref]

Required VFX Properties:
- Wave0_Origin, Wave0_Radius, Wave0_Amplitude
- Wave1_Origin, Wave1_Radius, Wave1_Amplitude
- Wave2_Origin, Wave2_Radius, Wave2_Amplitude
```

---

## VFX Property Standardization

### Universal Properties (All Pipelines Should Support)

```csharp
// Position & Matrices
"HandPosition"      // Vector3 - Primary control point
"HandVelocity"      // Vector3 - Motion vector
"HandSpeed"         // Float   - Velocity magnitude
"InverseView"       // Matrix4x4 - Camera to world

// Audio (Enhanced)
"AudioVolume"       // Float [0-1] - Overall amplitude
"AudioPitch"        // Float [0-1] - Dominant frequency
"AudioBass"         // Float [0-1] - Low frequency (20-250Hz)
"AudioMid"          // Float [0-1] - Mid frequency (250-2000Hz)
"AudioTreble"       // Float [0-1] - High frequency (2000-20000Hz)
"AudioSpectrum"     // Texture2D - Full FFT visualization

// Gesture
"IsPinching"        // Bool - Pinch gesture active
"BrushWidth"        // Float - Pinch-controlled parameter
"ExtendedFingers"   // Int [0-5] - Number of extended fingers

// Physics
"CollisionPlanePosition" // Vector3
"CollisionPlaneNormal"   // Vector3
"CollisionBounciness"    // Float [0-1]

// Control
"Spawn"             // Bool - Enable/disable particle spawning
"EmissionRate"      // Float - Particles per second
```

---

## Audio FFT Frequency Bands

The enhanced AudioProcessor should provide these frequency bands:

| Band | Frequency Range | Musical Content | VFX Mapping |
|------|-----------------|-----------------|-------------|
| **Sub Bass** | 20-60 Hz | Rumble, sub | Ground shake, slow pulse |
| **Bass** | 60-250 Hz | Kick, bass | Large particles, pulse |
| **Low Mid** | 250-500 Hz | Warmth | Medium particles |
| **Mid** | 500-2000 Hz | Vocals, instruments | Core emission |
| **High Mid** | 2000-4000 Hz | Presence | Sparkle start |
| **Treble** | 4000-20000 Hz | Brilliance, air | Fine detail, shimmer |

### FFT Bin Mapping (1024 samples @ 44100 Hz)

```
Bin Resolution: 44100 / 1024 = 43.07 Hz per bin
Bass (60-250 Hz):    Bins 1-5
Mid (250-2000 Hz):   Bins 6-46
Treble (2000-20000 Hz): Bins 47-464
```

---

## Scaling Recommendations

### iOS (iPhone Pro with LiDAR)

**Best Pipeline**: H3MLiDARCapture or HologramSource
- Use 256×192 depth resolution for >60fps VFX
- LiDAR provides accurate depth without compute overhead
- Human stencil available for body-specific effects

### iOS (Non-LiDAR iPhones)

**Best Pipeline**: Echovision Audio
- No depth available, use audio-reactive effects
- ARKit body detection (skeleton only, no stencil)
- Limited occlusion support

### Android (ARCore)

**Best Pipeline**: Echovision Audio + Basic depth
- Depth API varies by device (monocular estimation)
- Focus on audio-reactive and mesh-based effects
- Test depth quality per device

### Quest 3/Pro

**Best Pipeline**: Custom hand-tracking + mesh
- Native hand tracking (no ARKit)
- Room mesh for collision
- Use Oculus-specific depth features

---

## Integration Checklist

### Adding Audio + Velocity to Any Pipeline

1. **Add AudioProcessor** component to scene
2. **Add HandVFXController** for velocity tracking
3. **Ensure VFX has properties**:
   - AudioVolume, AudioPitch (basic)
   - AudioBass, AudioMid, AudioTreble (enhanced)
   - HandVelocity, HandSpeed
4. **Connect references** in inspector
5. **Test with**: Pinch to spawn, velocity to trail, audio to color/scale

### Speech-to-Text Integration (Future)

```csharp
// Planned architecture
public interface IVoiceCommandHandler
{
    void OnCommand(string command, float confidence);
}

// Example commands
"change to fire"      → SetVFX("Fire")
"bigger particles"    → SetFloat("Scale", current * 1.5f)
"follow the beat"     → SetBool("BeatSync", true)
"rainbow mode"        → SetColorMode(ColorMode.Rainbow)
```

---

## References

- `Assets/Scripts/PeopleOcclusion/PeopleOcclusionVFXManager.cs`
- `Assets/Scripts/ARKitMetavidoBinder.cs`
- `Assets/H3M/Core/HologramSource.cs`
- `Assets/Scripts/Rcam4/H3MLiDARCapture.cs`
- `Assets/Echovision/Scripts/AudioProcessor.cs`
- `Assets/Echovision/Scripts/SoundWaveEmitter.cs`
- `Assets/Echovision/Scripts/MeshVFX.cs`
- `Assets/Scripts/HandTracking/HandVFXController.cs`
- `Assets/Scripts/HandTracking/PhysicsVFXCollider.cs`

---

*Last Updated: 2026-01-14*
*Part of MetavidoVFX Unity-XR-AI Knowledge Base*
