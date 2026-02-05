# XRAI Format Research Summary (2026-02-05)

**Status:** Complete | **Confidence:** 99%
**Full Spec:** `portals_main/specs/XRAI_FORMAT_SPECIFICATION_V2.md`

---

## Key Decision: Consolidate XRAI + VNMF

XRAI v2.0 consolidates the previous XRAI (scene) and VNMF (asset) formats into a **single glTF-based specification**.

### Why glTF 2.0 Base?

| Factor | Finding |
|--------|---------|
| Industry Convergence | NVIDIA, Apple, Google, Meta all converging on glTF 2.0 |
| No glTF 3.0 | Khronos strategy: extend 2.0 indefinitely |
| Gaussian Splats | KHR_gaussian_splatting Q2 2026 (90% compression) |
| MaterialX | Integration coming for procedural textures |

---

## Core Innovation: Generative Encoding

> "Simple rules, infinite complexity" - DNA, L-systems, Wolfram, fractals

| Content | Explicit | Generative | Ratio |
|---------|----------|------------|-------|
| Forest (1000 trees) | 50 MB | 80 KB | 625:1 |
| Procedural city | 200 MB | 500 KB | 400:1 |
| Terrain (1 km²) | 500 MB | 100 KB | 5000:1 |

---

## Universal Compression Principles (Cross-Domain Research)

| Principle | Source | Application |
|-----------|--------|-------------|
| Store rules, not output | Mandelbrot, Perlin, Wolfram | Generators |
| Sparse activation (1-2%) | Neuroscience | Minimal active elements |
| Content-addressing | Git (Torvalds), IPLD | Hash-based deduplication |
| Shannon entropy floor | Information Theory | Compression limit |
| Minimal spanning (n-1 edges) | Graph Theory | Tree structures |
| Topological invariants | Topology | Transform-preserved properties |
| Strategic redundancy | DNA (3:1 codons) | Error tolerance critical paths |

---

## Platform Roadmaps (2025-2035)

### NVIDIA
- OpenUSD as foundational core
- Cosmos world models (2048x compression)
- glTF Gaussian Splatting support
- RTX IO with GDeflate (44% size reduction)

### Apple
- USDZ stable (OpenUSD Core Spec 1.0)
- visionOS 26/27 spatial computing
- MV-HEVC for spatial video
- On-device ML (privacy-preserving)

### Google/Meta
- OpenXR 1.1 convergence
- OpenXR Spatial Entities (anchors, planes)
- WebXR Interop 2026
- glTF 2.0 extensions (NOT 3.0)

### Khronos
- KHR_gaussian_splatting (Q2 2026)
- PBR material extensions wave
- MaterialX integration
- OpenXR 2.0 (2027 projected)

---

## Innovative Format Patterns

### From Shader Community (IQ/Shadertoy)
- SDF: Mathematical shapes, ~10 lines → full 3D scene
- Procedural noise: 50 bytes → infinite textures
- Raymarching: No mesh data needed

### From Data Formats
- **IPLD**: Content-addressed (`{"/": "QmHash..."}`)
- **Yjs/Automerge**: CRDT for collaboration
- **Observable**: Reactive dependency propagation
- **JSON Canvas**: Spatial node-edge model
- **tldraw**: Typed record store with migrations

### From Computational Pioneers
- **Perlin**: Hash → infinite textures
- **Mandelbrot**: Self-similarity (IFS compression)
- **Wolfram**: 8 bits → universal computation
- **Torvalds**: Content-addressable storage

---

## XRAI v2.0 Extension Registry

| Extension | Purpose | Status |
|-----------|---------|--------|
| `XRAI_core` | Metadata, versioning | Required |
| `XRAI_generators` | L-system, cellular, PCG, parametric | Optional |
| `XRAI_vfx` | Particle systems, VFX | Optional |
| `XRAI_ai` | AI model refs, latent data | Optional |
| `XRAI_spatial` | AR anchors, planes, occlusion | Optional |
| `XRAI_collaboration` | CRDT, remixing | Optional |
| `XRAI_reactive` | Dependency propagation | Optional |

---

## Key References

### Standards
- [glTF 2.0 Specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)
- [OpenXR 1.1](https://registry.khronos.org/OpenXR/specs/1.1/html/xrspec.html)
- [OpenUSD Core Spec 1.0](https://aousd.org/)
- [KHR_gaussian_splatting](https://www.khronos.org/news/press/gltf-gaussian-splatting-press-release)

### Pioneers Researched
- Neil Trevett, Tony Parisi (glTF creators)
- Sebastian Grassia (USD)
- Ben Mildenhall, Jon Barron (NeRF)
- Mr.doob/Ricardo Cabello (Three.js)
- Inigo Quilez (Shadertoy)
- Ken Perlin, Benoit Mandelbrot, Stephen Wolfram
- Bret Victor, Ted Nelson, Linus Torvalds

### Startups
- LumaAI, Niantic (SPZ format)
- PlayCanvas, Needle Tools
- Polycam, 8thWall

---

## Cross-References

- `portals_main/specs/XRAI_FORMAT_SPECIFICATION_V2.md` - Full spec
- `portals_main/specs/OPEN_SOURCE_ARCHITECTURE.md` - Licensing strategy
- `portals_main/specs/VFX_ARCHITECTURE.md` - VFX patterns
- `_EDGE_AI_MODEL_FORMATS.md` - AI model formats (GGUF, SafeTensors)
- `_VFX_SOURCES_REGISTRY.md` - VFX asset registry

---

*Research completed 2026-02-05 with 99% confidence based on 50+ sources across industry, academia, and open source.*
# XRAI World Generation from Hypergraphs

**Version**: 1.0
**Created**: 2026-01-10
**Status**: Research Specification
**Related**: `_REPO_GRAPH_SCHEMA.md`, `_JT_PRIORITIES.md`, `_WEB_INTEROPERABILITY_STANDARDS.md`

---

## Executive Summary

This specification defines how **hypergraph knowledge structures** can be automatically transformed into **immersive XRAI worlds** - creating navigable, interactive 3D environments from abstract data relationships.

**Core Principle**: "From simple rules comes infinite complexity" (Wolfram)

**Value Proposition**: Any knowledge graph (MCP Memory, Neo4j, Obsidian vault, GitHub repo network) can generate a corresponding XRAI world that users can explore in VR/AR/browser.

---

## Foundational Concepts

### 1. Hypergraph → Spatial Mapping

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HYPERGRAPH → XRAI WORLD PIPELINE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  HYPERGRAPH STRUCTURE          →        XRAI SPATIAL STRUCTURE               │
│  ─────────────────────                  ────────────────────────             │
│                                                                              │
│  Nodes (Entities)              →        Spatial Objects/Rooms                │
│  Edges (Relations)             →        Portals/Corridors/Connections        │
│  Hyperedges (N-ary)            →        Gathering Spaces/Hubs                │
│  Node Properties               →        Visual Appearance/Behavior           │
│  Edge Weights                  →        Distance/Visibility                  │
│  Clusters/Communities          →        Districts/Regions/Biomes             │
│  Hierarchy Depth               →        Elevation/Scale Levels               │
│  Temporal Data                 →        Day/Night/Season Cycles              │
│  Provenance/Trust              →        Material Quality/Luminosity          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Semantic Zoom Correlation

| Hypergraph Level | XRAI World Scale | Visual Representation |
|------------------|------------------|----------------------|
| Universe (all graphs) | Galaxy View | Floating constellation of worlds |
| Domain (graph subset) | Planet/Continent | Landmass with distinct biome |
| Cluster (community) | City/District | Architecture style group |
| Hub Node | Building/Plaza | Central gathering space |
| Regular Node | Room/Object | Interactive element |
| Leaf Node | Detail/Artifact | Inspectable item |
| Observation | Particle/Aura | Ambient information |

---

## XRAI Format Extensions for Hypergraph Data

### 3. Proposed Section Types

```typescript
interface XRAIHypergraphExtension {
  // Core XRAI sections (11 existing)
  geometry: MeshData | GaussianSplats | NeRFData;
  materials: PBRMaterial[];
  animations: AnimationClip[];
  vfxSystems: VFXGraphAsset[];
  onnxModels: ONNXNetwork[];
  audio: SpatialAudioClip[];
  interactions: InteractionDefinition[];
  behaviors: BehaviorTree[];
  physics: PhysicsData;
  streaming: StreamingManifest;
  metadata: XRAIMetadata;

  // NEW: Hypergraph-Specific Sections
  sourceGraph: {
    format: 'mcp-memory' | 'neo4j' | 'obsidian' | 'json-ld' | 'rdf';
    schema: GraphSchema;
    snapshot: GraphSnapshot;      // Embedded or URI reference
    lastSync: Date;
    provenance: ProvenanceData;
  };

  spatialMapping: {
    nodeLayout: NodeLayoutAlgorithm;
    edgeRouting: EdgeRoutingStrategy;
    clusterArrangement: ClusterAlgorithm;
    scaleFactors: ScaleMapping;
  };

  generativeRules: {
    nodeToGeometry: GenerativeRule[];    // Node type → 3D object
    edgeToConnection: GenerativeRule[];  // Edge type → corridor/portal
    propertyToAppearance: GenerativeRule[]; // Property → material/scale
    aiEnhancements: ONNXRuleSet[];       // AI-driven generation
  };

  dynamicBehaviors: {
    graphUpdates: 'live' | 'periodic' | 'static';
    syncInterval?: number;              // ms
    animateChanges: boolean;
    notifyOnChange: NotificationRule[];
  };
}
```

### 4. Generative Rule System

```typescript
interface GenerativeRule {
  id: string;
  name: string;
  description: string;

  // Pattern matching
  match: {
    nodeTypes?: string[];              // e.g., ['repository', 'person']
    edgeTypes?: string[];              // e.g., ['uses', 'created_by']
    propertyConditions?: PropertyCondition[];
  };

  // Output generation
  generate: {
    type: 'mesh' | 'splats' | 'procedural' | 'prefab' | 'ai-generated';
    template?: string;                 // Prefab or model reference
    procedural?: ProceduralParameters; // Noise, L-systems, etc.
    aiModel?: string;                  // ONNX model for AI generation
    modifiers: Modifier[];             // Scale, color, effects
  };

  // Position/orientation
  placement: {
    algorithm: 'force-directed' | 'hierarchical' | 'geographic' | 'semantic';
    constraints: PlacementConstraint[];
  };
}

// Example Rules
const EXAMPLE_RULES: GenerativeRule[] = [
  {
    id: 'repo-to-building',
    name: 'Repository as Building',
    description: 'Each GitHub repository becomes a building',
    match: { nodeTypes: ['repository'] },
    generate: {
      type: 'procedural',
      procedural: {
        algorithm: 'building-generator',
        params: {
          heightFactor: 'node.stars / 1000',      // Stars → height
          widthFactor: 'node.files / 100',         // Files → footprint
          styleSeed: 'node.category',              // Category → architecture
          colorPalette: 'CATEGORY_COLORS[node.category]'
        }
      }
    },
    placement: {
      algorithm: 'force-directed',
      constraints: [
        { type: 'minDistance', value: 50 },
        { type: 'clusterByCategory', enabled: true }
      ]
    }
  },
  {
    id: 'person-to-avatar',
    name: 'Person as Avatar/Statue',
    description: 'Contributors become statue or NPC',
    match: { nodeTypes: ['person'] },
    generate: {
      type: 'ai-generated',
      aiModel: 'text-to-3d-avatar.onnx',
      modifiers: [
        { type: 'scale', value: 'log10(node.commits + 1) * 0.5' }
      ]
    },
    placement: {
      algorithm: 'semantic',
      constraints: [
        { type: 'nearRelatedNodes', radius: 20 }
      ]
    }
  },
  {
    id: 'uses-to-bridge',
    name: 'Dependency as Bridge',
    description: 'Uses relationship becomes walkable bridge',
    match: { edgeTypes: ['uses', 'depends_on'] },
    generate: {
      type: 'procedural',
      procedural: {
        algorithm: 'bridge-generator',
        params: {
          style: 'node.from.category',
          width: 'edge.strength * 5',
          material: 'glass'
        }
      }
    }
  },
  {
    id: 'trust-to-luminosity',
    name: 'Trust Score as Light',
    description: 'High trust entities glow, low trust are dim',
    match: { propertyConditions: [{ path: 'provenance.trust', exists: true }] },
    generate: {
      type: 'modifier',
      modifiers: [
        { type: 'emission', value: 'node.provenance.trust.computedScore' },
        { type: 'particleAura', enabled: 'node.provenance.trust.computedScore > 0.8' }
      ]
    }
  }
];
```

---

## World Generation Pipeline

### 5. Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      HYPERGRAPH → XRAI GENERATION PIPELINE                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │   SOURCE    │   │   LAYOUT    │   │  GEOMETRY   │   │   OUTPUT    │     │
│  │   GRAPH     │ → │   ENGINE    │ → │  GENERATOR  │ → │   XRAI      │     │
│  │             │   │             │   │             │   │   FILE      │     │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘     │
│        ↓                 ↓                 ↓                 ↓              │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│  │ MCP Memory  │   │ Force-Dir   │   │ Procedural  │   │ Binary XRAI │     │
│  │ Neo4j       │   │ Hierarchical│   │ Splats      │   │ Streaming   │     │
│  │ Obsidian    │   │ Geographic  │   │ AI-Generated│   │ Fallback    │     │
│  │ JSON-LD     │   │ Semantic    │   │ Prefab      │   │   GLTF      │     │
│  └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6. Layout Algorithms

```typescript
interface LayoutEngine {
  // Force-Directed (default for general graphs)
  forceDirected: {
    algorithm: 'fr' | 'd3-force' | 'cola' | 'ngraph';
    iterations: number;
    gravity: number;
    repulsion: number;
    linkDistance: (edge: Edge) => number;
    is3D: boolean;               // 2D layout → extrude, or native 3D
  };

  // Hierarchical (for trees, DAGs)
  hierarchical: {
    algorithm: 'sugiyama' | 'tidier' | 'radial';
    levelHeight: number;
    nodeSpacing: number;
    direction: 'TD' | 'BU' | 'LR' | 'RL';
  };

  // Geographic (for location-aware data)
  geographic: {
    projection: 'mercator' | 'orthographic' | 'custom';
    terrainGeneration: 'height-from-data' | 'flat' | 'procedural';
    scaleKm: number;
  };

  // Semantic (AI-driven placement)
  semantic: {
    embeddingModel: string;      // ONNX model for semantic embeddings
    dimensionReduction: 'pca' | 'tsne' | 'umap';
    clusterFirst: boolean;
  };
}
```

### 7. Geometry Generation

```typescript
interface GeometryGenerator {
  // Procedural Building Generation
  buildingGenerator: {
    styles: {
      'xr-tools': { base: 'modern-glass', roof: 'dome' },
      'vfx-effects': { base: 'crystalline', roof: 'spire' },
      'body-tracking': { base: 'organic', roof: 'flowing' },
      'depth-sensing': { base: 'brutalist', roof: 'antenna' },
      'gaussian-splatting': { base: 'cloud-form', roof: 'diffuse' },
      'multiplayer': { base: 'hub-radial', roof: 'beacon' },
      'ml-inference': { base: 'server-rack', roof: 'neural-net' }
    };
    heightFromProperty: 'stars' | 'commits' | 'files' | 'custom';
    lodLevels: number;
  };

  // Splat-Based Generation (for organic/natural)
  splatGenerator: {
    density: number;              // Splats per unit volume
    colorFromProperty: string;    // Property → color mapping
    sizeVariance: number;
    noiseOctaves: number;
  };

  // AI-Generated (ONNX models)
  aiGenerator: {
    textTo3D: string;            // Model for text → 3D
    imageToSplats: string;       // Model for image → Gaussian splats
    styleTransfer: string;       // Apply style to generated geometry
  };

  // Connection Generation (edges → corridors/portals)
  connectionGenerator: {
    bridgeStyles: Record<string, BridgeParams>;
    portalEffects: Record<string, VFXParams>;
    minWidth: number;
    curveSmoothing: number;
  };
}
```

---

## Use Case: Repository Knowledge Graph World

### 8. Example: GitHub Repo Explorer

**Input**: MCP Memory graph with 24 entities (repos, people, projects)

**Generated World**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         "UNITY-XR-AI KNOWLEDGE CITY"                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    🏛️ VFX District          🏗️ Body Tracking Quarter                        │
│    ├── SplatVFX Tower        ├── MediaPipe Hub                              │
│    ├── LaspVFX Building      ├── uLipSync Studio                            │
│    └── Kino Research Lab     └── ARKitFaceTracking Lab                      │
│                                                                              │
│    🔮 Neural Rendering Zone   📡 Streaming Sector                            │
│    ├── 3DGS Cloud Complex     ├── Rcam4 Broadcast Tower                     │
│    └── NeRF Research Tower    └── UnityRenderStreaming Hub                  │
│                                                                              │
│    👤 keijiro Plaza (Central Hub)                                           │
│    ├── 10+ building connections (bridges)                                   │
│    └── Avatar statue with contribution aura                                 │
│                                                                              │
│    🌐 Portals Project (User's Workspace)                                    │
│    ├── Elevated position (workspace bonus)                                  │
│    ├── Bright glow (high activity)                                          │
│    └── Multiple incoming bridges (dependencies)                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Generative Rules Applied**:

| Rule | Input | Output |
|------|-------|--------|
| repo-to-building | SplatVFX node | Tower (12 stars → height) |
| category-to-district | 'vfx-effects' | Red-tinted district |
| person-to-avatar | keijiro entity | Central plaza statue |
| uses-to-bridge | SplatVFX→VFXGraph | Glass bridge |
| trust-to-luminosity | provenance.trust=0.85 | Soft glow effect |

---

## Cross-Platform Runtime

### 9. Platform Adapters

```typescript
interface XRAIPlatformAdapter {
  // Unity (primary development)
  unity: {
    version: '>= 6000.1';
    renderPipeline: 'URP' | 'HDRP';
    xrPlatforms: ['Quest', 'visionOS', 'PC VR'];
    vfxGraphSupport: boolean;
    gaussianSplatSupport: 'SplatVFX' | 'UnityGaussianSplatting';
  };

  // WebXR (browser)
  webxr: {
    engine: 'three.js' | 'babylon.js' | 'aframe';
    splatRenderer: 'gsplat.js' | 'splat' | 'fallback-mesh';
    progressiveLoading: boolean;
    maxSplats: number;         // Browser memory limit
  };

  // visionOS (Apple native)
  visionos: {
    framework: 'RealityKit' | 'Unity';
    sharedSpaceSupport: boolean;
    immersiveSpaceSupport: boolean;
    usdzFallback: boolean;     // Convert to USDZ if needed
  };

  // Fallback (all platforms)
  fallback: {
    meshLOD: number;           // LOD level for mesh fallback
    textureResolution: number;
    animationSupport: boolean;
    format: 'gltf' | 'glb';
  };
}
```

### 10. Streaming Strategy

```typescript
interface StreamingManifest {
  // Level-of-Detail streaming
  lodLevels: {
    level: number;
    distance: number;          // Load when camera within this distance
    geometry: 'splats' | 'mesh' | 'billboard';
    resolution: number;
  }[];

  // Spatial partitioning
  chunks: {
    id: string;
    bounds: BoundingBox;
    nodeIds: string[];         // Which graph nodes in this chunk
    fileUrl: string;           // Chunk file URL
    priority: number;
  }[];

  // Predictive loading
  prediction: {
    algorithm: 'viewport-cone' | 'navigation-path' | 'popularity';
    preloadDistance: number;
    cacheSize: number;
  };
}
```

---

## DNA-Like Properties

### 11. Sparse Instructions, Rich Output

Following the XRAI philosophy of "DNA-like sparse instructions":

```typescript
// A complete world definition in ~500 bytes
interface XRAIWorldSeed {
  schema: string;              // URI to graph schema
  graph: string;               // URI to graph data (or inline)
  rules: string;               // URI to generative rules
  style: string;               // URI to style preset

  // Override defaults
  overrides?: {
    layoutAlgorithm?: string;
    colorPalette?: string;
    scale?: number;
  };
}

// Example: Entire GitHub repo world in a tweet
const seed: XRAIWorldSeed = {
  schema: 'xrai://schemas/repo-graph/1.0',
  graph: 'mcp://memory/entities?type=repository',
  rules: 'xrai://rules/repo-city/default',
  style: 'xrai://styles/cyberpunk-neon'
};

// This seed expands to:
// - Layout calculated from graph structure
// - Geometry generated from node properties
// - Materials from category colors
// - Behaviors from relationship types
// - Full XRAI world file (potentially gigabytes)
```

---

## Integration with Existing Systems

### 12. MCP Memory → XRAI World

```typescript
async function generateWorldFromMCPMemory(): Promise<XRAIWorld> {
  // 1. Read current graph state
  const graph = await mcp__memory__read_graph();

  // 2. Apply layout algorithm
  const layout = calculateLayout(graph.entities, graph.relations, {
    algorithm: 'force-directed',
    dimensions: 3
  });

  // 3. Generate geometry for each node
  const geometries = await Promise.all(
    graph.entities.map(entity =>
      generateGeometry(entity, layout.positions[entity.name])
    )
  );

  // 4. Generate connections for each edge
  const connections = await Promise.all(
    graph.relations.map(relation =>
      generateConnection(relation, layout)
    )
  );

  // 5. Package into XRAI format
  return packXRAI({
    geometry: mergeGeometries(geometries),
    connections,
    sourceGraph: graph,
    spatialMapping: layout,
    metadata: {
      generated: new Date(),
      generator: 'hypergraph-to-xrai/1.0',
      provenance: extractProvenance(graph)
    }
  });
}
```

### 13. Live Updates

```typescript
interface LiveWorldSync {
  // Watch for graph changes
  watch: {
    source: 'mcp-memory' | 'neo4j' | 'obsidian';
    pollInterval: number;      // ms (0 for websocket)
    diffDetection: 'hash' | 'version' | 'timestamp';
  };

  // Animation on change
  animations: {
    nodeAdded: 'grow-in' | 'teleport' | 'fade';
    nodeRemoved: 'shrink-out' | 'explode' | 'fade';
    edgeAdded: 'bridge-construct' | 'portal-open';
    edgeRemoved: 'bridge-collapse' | 'portal-close';
    propertyChanged: 'pulse' | 'morph' | 'recolor';
  };

  // Notification system
  notifications: {
    visual: 'particle-burst' | 'beacon' | 'overlay';
    audio: 'chime' | 'voice' | 'none';
    haptic: boolean;           // For VR controllers
  };
}
```

---

## Next Steps

### Implementation Roadmap

**Phase 1 (2026 Q1)**: Proof of Concept
- [ ] MCP Memory → basic layout (2D force-directed)
- [ ] Simple procedural buildings from node properties
- [ ] Three.js web viewer
- [ ] Export to GLTF fallback

**Phase 2 (2026 Q2)**: Full Pipeline
- [ ] 3D layout algorithms
- [ ] Gaussian splat generation
- [ ] Unity runtime loader
- [ ] Quest 3 testing

**Phase 3 (2026 Q3)**: AI Enhancement
- [ ] ONNX text-to-3D integration
- [ ] Semantic layout using embeddings
- [ ] Style transfer for visual coherence

**Phase 4 (2026 Q4)**: Production
- [ ] Live sync with graph updates
- [ ] Multi-user exploration (Normcore)
- [ ] visionOS shared space
- [ ] XRAI file format finalization

---

## References

- `_JT_PRIORITIES.md`: XRAI/VNMF research tracks
- `_WEB_INTEROPERABILITY_STANDARDS.md`: Format comparison
- `_REPO_GRAPH_SCHEMA.md`: Repository knowledge graph schema
- Wolfram Physics Project: Hypergraph universe model
- Tim Berners-Lee: Linked Data principles
- Ted Nelson: Project Xanadu (transclusion, provenance)

---

**This specification enables:**
- Automatic world generation from any knowledge graph
- Cross-platform XRAI worlds (Unity, WebXR, visionOS)
- DNA-like sparse representation (seed → full world)
- Live synchronization with graph updates
- Provenance-aware visualization (trust = luminosity)
# Universal AI+XR Spatial Media Format (XRRAI) - System Design

## Implementation approach

The Universal AI+XR Spatial Media Format (XRRAI) aims to provide a unified container format for real-time interactive 3D/4D and procedural spatial content. This format needs to support various representation types including traditional meshes, Gaussian Splats, Neural Radiance Fields (NeRFs), procedural content, and more. Given the complexity and forward-looking nature of this format, the implementation approach will focus on:

1. **Modular Architecture**: Creating a layered system that separates core functionality from extensions and platform-specific optimizations.

2. **Open Source Foundation**: Leveraging existing open-source libraries and standards where possible, including:
   - glTF as a baseline for traditional 3D representation
   - OpenXR for AR/VR integration
   - Open Neural Network Exchange (ONNX) for AI model compatibility
   - WebGPU/WebGL for web rendering
   - TensorFlow/PyTorch for neural processing pipelines

3. **Hybrid Representation System**: Supporting multiple representations of the same content to allow optimal rendering across different platforms and hardware capabilities.

4. **Streaming-First Design**: Building the format with progressive loading capabilities from the ground up.

5. **Extensibility**: Providing a well-defined extension mechanism to support future representation types and platform-specific optimizations.

6. **Cross-Platform SDK**: Developing reference implementations for key platforms (Web, Mobile, Unity, Unreal).

## Data structures and interfaces

The XRRAI format requires a comprehensive set of data structures to handle various content types and their relationships. The core system will include:

1. **Format Container**: The top-level structure that encapsulates all content and metadata
2. **Scene Graph**: Hierarchy of spatial nodes with transforms and relationships
3. **Representation Registry**: Management of multiple content representations
4. **Streaming Manager**: Controls progressive loading and optimization
5. **Neural Processing Pipeline**: Handles AI-based content transformation
6. **Platform Adapters**: Provide platform-specific rendering and optimization

The detailed data structures and interfaces will be described in the next section using class diagrams.

## Program call flow

The XRRAI format will support several key workflows:

1. **Content Creation**: Converting from traditional formats to XRRAI
2. **Loading and Parsing**: Reading XRRAI content efficiently
3. **Rendering**: Displaying content with appropriate representation
4. **Streaming**: Progressive loading of content
5. **Neural Processing**: AI-based transformation and enhancement

Detailed sequence diagrams for these workflows will be provided to illustrate the interactions between components.

## Anything UNCLEAR

Several aspects will require further investigation and specification:

1. **Standardization Process**: How will the format be standardized and governed?
2. **Hardware Acceleration**: Specific optimizations for various hardware platforms
3. **Security Model**: Detailed specification of content authentication and privacy features
4. **Intellectual Property**: Licensing and patent considerations for the format
5. **Performance Benchmarks**: Objective measurements for implementation quality