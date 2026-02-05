# WebGL 3D Visualization Patterns

**Tags**: #visualization #webgl #threejs #mcp #dataviz #d3 #force-graph
**Cross-refs**: `_WEB_MASTER.md`, `_UNITY_MCP_MASTER.md`, `_MASTER_GITHUB_REPO_KNOWLEDGEBASE.md`
**Source**: https://github.com/AICodingGenius/AI-XR-MCP

---

## Overview

Patterns for interactive 3D data visualizations using WebGL, Three.js, and D3.js. Covers:
- Force-directed graphs
- Hierarchical layouts
- Radial layouts
- MCP server integration
- Real-time data streaming

---

## Key Libraries

| Library | Purpose | GitHub |
|---------|---------|--------|
| **3d-force-graph** | 3D force-directed graphs | [vasturiano/3d-force-graph](https://github.com/vasturiano/3d-force-graph) |
| **three-globe** | Geographic visualizations | [vasturiano/three-globe](https://github.com/vasturiano/three-globe) |
| **react-three-fiber** | React + Three.js | [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) |
| **d3-3d** | D3.js 3D projections | [Niekes/d3-3d](https://github.com/Niekes/d3-3d) |
| **stardust.js** | GPU-based vis | [stardustjs.github.io](https://stardustjs.github.io/) |

---

## 3D Force Graph API

### Initialization

```javascript
import ForceGraph3D from '3d-force-graph';

const Graph = ForceGraph3D()
  (document.getElementById('3d-graph'))
  .graphData(data)
  .backgroundColor('#000011')
  .nodeAutoColorBy('group')
  .linkDirectionalArrowLength(3.5);
```

### Data Structure

```typescript
type GraphData = {
  nodes: Array<{
    id: string;
    name: string;
    val: number;        // Node size
    group?: string;     // Color grouping
    color?: string;     // Override color
    fx?: number;        // Fixed X position
    fy?: number;        // Fixed Y position
    fz?: number;        // Fixed Z position
  }>;
  links: Array<{
    source: string;     // Node ID
    target: string;     // Node ID
    value?: number;     // Link weight
  }>;
};
```

### Node Styling

```javascript
Graph
  .nodeRelSize(6)                    // Base node size
  .nodeColor(node => node.color)     // Color accessor
  .nodeLabel('name')                 // Hover label
  .nodeOpacity(0.75)                 // Transparency
  .nodeThreeObject(node => {         // Custom 3D object
    const sprite = new SpriteText(node.name);
    sprite.color = node.color;
    sprite.textHeight = 8;
    return sprite;
  });
```

### Link Styling

```javascript
Graph
  .linkColor(() => 'rgba(255,255,255,0.2)')
  .linkWidth(link => Math.sqrt(link.value))
  .linkOpacity(0.2)
  .linkCurvature(0.25)
  .linkDirectionalArrowLength(3.5)
  .linkDirectionalParticles(2)
  .linkDirectionalParticleSpeed(0.01);
```

### Camera Control

```javascript
// Set camera position
Graph.cameraPosition(
  { x: 0, y: 0, z: 500 },  // Position
  { x: 0, y: 0, z: 0 },    // Look-at
  3000                      // Transition ms
);

// Auto-fit all nodes
Graph.zoomToFit(1000, 50);  // Duration, padding

// Camera modes: 'trackball', 'orbit', 'fly'
Graph.controls().type = 'orbit';
```

---

## Layout Algorithms

### Force-Directed (Default)

Natural clustering based on connections.

```javascript
Graph
  .d3Force('charge', d3.forceManyBody().strength(-120))
  .d3Force('link', d3.forceLink().distance(30))
  .d3Force('center', d3.forceCenter())
  .d3VelocityDecay(0.3)
  .cooldownTicks(200);
```

### Radial Layout

Nodes arranged by group in concentric circles.

```javascript
Graph.d3Force('radial', d3.forceRadial()
  .radius(node => {
    if (node.group === 'root') return 0;
    if (node.group === 'directory') return 100;
    return 200;
  })
  .strength(1)
);
```

### Hierarchical Layout

Tree structure with fixed positions.

```javascript
function positionNodesHierarchically(rootNode, graphData) {
  const levels = {};
  const queue = [rootNode.id];
  let currentLevel = 0;
  levels[rootNode.id] = 0;

  // BFS traversal
  while (queue.length > 0) {
    const levelSize = queue.length;
    const nodesInLevel = [];

    for (let i = 0; i < levelSize; i++) {
      const nodeId = queue.shift();
      const node = graphData.nodes.find(n => n.id === nodeId);
      nodesInLevel.push(node);

      // Find children
      graphData.links.forEach(link => {
        const targetId = link.target.id || link.target;
        if (link.source === nodeId && !levels[targetId]) {
          queue.push(targetId);
          levels[targetId] = currentLevel + 1;
        }
      });
    }

    // Position in circle at level
    const radius = 100 * (currentLevel + 1);
    const angleStep = (2 * Math.PI) / nodesInLevel.length;

    nodesInLevel.forEach((node, idx) => {
      node.fx = radius * Math.cos(idx * angleStep);
      node.fy = radius * Math.sin(idx * angleStep);
      node.fz = -currentLevel * 100;
    });

    currentLevel++;
  }
}
```

### DAG Mode (Directed Acyclic Graph)

```javascript
Graph
  .dagMode('td')           // 'td', 'bu', 'lr', 'rl', 'radialout', 'radialin'
  .dagLevelDistance(100)
  .dagNodeFilter(node => !node.isHelper);
```

---

## MCP Tool Definition

```typescript
const WEBGL_3D_VISUALIZATION_TOOL: Tool = {
  name: 'webgl-3d-visualization',
  description: 'Generate 3D force-directed graph visualization',
  inputSchema: {
    type: 'object',
    properties: {
      source: {
        type: 'string',
        description: 'URL, GitHub repo, or local path'
      },
      sourceType: {
        type: 'string',
        enum: ['website', 'github', 'local']
      },
      depth: {
        type: 'integer',
        default: 2,
        minimum: 1,
        maximum: 5
      },
      layout: {
        type: 'string',
        enum: ['force', 'radial', 'hierarchical'],
        default: 'force'
      },
      outputFormat: {
        type: 'string',
        enum: ['html', 'json', 'url'],
        default: 'html'
      }
    },
    required: ['source', 'sourceType']
  }
};
```

---

## Source Processing Patterns

### Website Structure

```typescript
async function processWebsite(url: string, depth: number): Promise<GraphData> {
  const response = await fetch(url);
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const graphData: GraphData = { nodes: [], links: [] };

  // Root node
  graphData.nodes.push({
    id: 'root',
    name: url,
    val: 5,
    group: 'root',
    color: '#FF6B6B'
  });

  // Process DOM elements
  const elements = ['div', 'section', 'nav', 'header', 'main'];
  elements.forEach(tag => {
    document.querySelectorAll(tag).forEach((el, idx) => {
      const id = `${tag}-${idx}`;
      graphData.nodes.push({
        id,
        name: `${tag}.${el.className || ''}`,
        val: 2,
        group: tag
      });
      graphData.links.push({ source: 'root', target: id });
    });
  });

  return graphData;
}
```

### GitHub Repository

```typescript
async function processGithubRepo(repoUrl: string): Promise<GraphData> {
  const octokit = new Octokit();
  const [owner, repo] = repoUrl.split('/').slice(-2);

  const { data: tree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: 'HEAD',
    recursive: 'true'
  });

  const graphData: GraphData = { nodes: [], links: [] };

  // Root
  graphData.nodes.push({
    id: 'root',
    name: repo,
    val: 10,
    group: 'root'
  });

  // Files and directories
  tree.tree.forEach(item => {
    const parentPath = item.path.split('/').slice(0, -1).join('/') || 'root';
    graphData.nodes.push({
      id: item.path,
      name: item.path.split('/').pop(),
      val: item.type === 'tree' ? 5 : 2,
      group: item.type === 'tree' ? 'directory' : getFileType(item.path)
    });
    graphData.links.push({
      source: parentPath === '' ? 'root' : parentPath,
      target: item.path
    });
  });

  return graphData;
}

function getFileType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const groups = {
    js: 'javascript', ts: 'javascript', jsx: 'javascript', tsx: 'javascript',
    py: 'python',
    md: 'documentation',
    json: 'config', yaml: 'config', yml: 'config',
    css: 'style', scss: 'style'
  };
  return groups[ext] || 'other';
}
```

### Local Directory

```typescript
async function processLocalDirectory(dirPath: string, depth: number): Promise<GraphData> {
  const graphData: GraphData = { nodes: [], links: [] };

  graphData.nodes.push({
    id: 'root',
    name: path.basename(dirPath),
    val: 10,
    group: 'root'
  });

  async function scanDir(currentPath: string, parentId: string, level: number) {
    if (level > depth) return;

    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const fullPath = path.join(currentPath, entry.name);
      const nodeId = fullPath.replace(dirPath, '');

      graphData.nodes.push({
        id: nodeId,
        name: entry.name,
        val: entry.isDirectory() ? 5 : 2,
        group: entry.isDirectory() ? 'directory' : getFileType(entry.name),
        path: fullPath
      });

      graphData.links.push({ source: parentId, target: nodeId });

      if (entry.isDirectory()) {
        await scanDir(fullPath, nodeId, level + 1);
      }
    }
  }

  await scanDir(dirPath, 'root', 1);
  return graphData;
}
```

---

## Color Schemes

```javascript
const COLOR_SCHEMES = {
  fileTypes: {
    javascript: '#F7DF1E',
    typescript: '#3178C6',
    python: '#3776AB',
    rust: '#DEA584',
    go: '#00ADD8',
    documentation: '#083FA1',
    config: '#6D6D6D',
    style: '#CC6699',
    directory: '#7CB342',
    root: '#FF6B6B',
    other: '#9E9E9E'
  },

  htmlElements: {
    div: '#4CAF50',
    section: '#2196F3',
    nav: '#9C27B0',
    header: '#FF9800',
    footer: '#795548',
    main: '#00BCD4',
    article: '#E91E63'
  }
};

function getColorForNode(node) {
  return COLOR_SCHEMES.fileTypes[node.group] || '#9E9E9E';
}
```

---

## Interaction Handlers

```javascript
Graph
  .onNodeClick((node, event) => {
    // Focus on node
    Graph.centerAt(node.x, node.y, 1000);
    Graph.zoom(2.5, 1000);
  })

  .onNodeHover(node => {
    document.body.style.cursor = node ? 'pointer' : 'default';
  })

  .onNodeDrag((node, translate) => {
    node.fx = node.x + translate.x;
    node.fy = node.y + translate.y;
    node.fz = node.z + translate.z;
  })

  .onNodeDragEnd(node => {
    node.fx = node.fy = node.fz = undefined;
  })

  .onLinkClick((link, event) => {
    console.log('Link clicked:', link);
  })

  .onBackgroundClick(() => {
    Graph.zoomToFit(1000, 50);
  });
```

---

## Performance Optimization

```javascript
// For large graphs (1000+ nodes)
Graph
  .warmupTicks(100)        // Pre-calculate positions
  .cooldownTicks(0)        // Disable animation
  .enableNodeDrag(false)   // Disable dragging
  .enableNavigationControls(true);

// Use WebGL renderer settings
Graph.renderer().setPixelRatio(Math.min(window.devicePixelRatio, 2));

// LOD (Level of Detail)
Graph.nodeThreeObject(node => {
  const distance = Graph.cameraPosition().z;
  if (distance > 500) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(node.val),
      new THREE.MeshBasicMaterial({ color: node.color })
    );
  }
  // Detailed object for close-up
  return createDetailedNode(node);
});
```

---

## Related Repositories

### Three.js Visualization

| Repo | Description |
|------|-------------|
| [mkkellogg/GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D) | Gaussian splatting in Three.js |
| [yeemachine/kalidoface](https://github.com/yeemachine/kalidoface) | VTuber face tracking |
| [hopepdm/WebGl-Three.js-Model-Viewer](https://github.com/hopepdm/WebGl-Three.js-Model-Viewer) | OBJ/STL viewer |
| [tehzwen/MultiplayerWebGL](https://github.com/tehzwen/MultiplayerWebGL) | Multiplayer with Socket.io |

### D3.js + WebGL

| Repo | Description |
|------|-------------|
| [d3/d3](https://github.com/d3/d3) | Core D3 library |
| [vasturiano/3d-force-graph](https://github.com/vasturiano/3d-force-graph) | 3D force graphs |
| [vasturiano/three-globe](https://github.com/vasturiano/three-globe) | Globe visualization |
| [Niekes/d3-3d](https://github.com/Niekes/d3-3d) | 3D with D3 |

### Unity Data Visualization

| Repo | Description |
|------|-------------|
| [drewfrobot/unity-and-data](https://github.com/drewfrobot/unity-and-data) | SQLite + 3D scatter plots |
| [Dandarawy/Unity3D-Globe](https://github.com/Dandarawy/Unity3D-Globe) | Data globe |
| [pennmem/brain_viz_unity](https://github.com/pennmem/brain_viz_unity) | Brain visualization |

---

## Example Output

See: `CodeSnippets/webgl-3d-visualization-example.html`

Interactive 3D graph with:
- Zoom/pan/rotate controls
- Node hover tooltips
- Click to focus
- Color-coded by file type
- Layout switching (force/radial/hierarchical)
- Real-time simulation

---

## Integration with Claude Desktop

Add to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "webgl3d": {
      "command": "node",
      "args": ["/path/to/ai-xr-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

**Full repo**: https://github.com/AICodingGenius/AI-XR-MCP

---

## WebGPU Visualization Patterns

**Browser Support (2026)**: Chrome 113+, Safari 26+, Firefox 141+, Edge (all)

### Why WebGPU for Portals/MetavidoVFX

| Feature | WebGL | WebGPU | Project Need |
|---------|-------|--------|--------------|
| Compute Shaders | ❌ | ✅ | VFX particle systems |
| 1M+ particles | Slow | 60 FPS | Metavido effects |
| Storage buffers | ❌ | ✅ | AR depth processing |
| Shader compilation | Slow | Cached | Fast scene loading |

### WebGPU Million Particles (Operation Swarm Pattern)

From `shadowofaroman/Operation-Swarm` - 400K+ particles at 60FPS.

```javascript
import { StorageInstancedBufferAttribute } from 'three/webgpu';

// GPU read/write storage attributes
const positionAttribute = new StorageInstancedBufferAttribute(
  new Float32Array(PARTICLE_COUNT * 3), 3
);
const velocityAttribute = new StorageInstancedBufferAttribute(
  new Float32Array(PARTICLE_COUNT * 3), 3
);

// Attach to instanced mesh
const mesh = new InstancedMesh(geometry, material, PARTICLE_COUNT);
mesh.instanceMatrix.setUsage(DynamicDrawUsage);
```

### TSL (Three Shading Language) Compute

```javascript
import { tslFn, storage, uniform, instanceIndex, If } from 'three/tsl';

const computeParticles = tslFn(() => {
  const position = storage(positionAttribute, 'vec3', instanceIndex);
  const velocity = storage(velocityAttribute, 'vec3', instanceIndex);

  // Physics
  const gravity = uniform(new Vector3(0, -9.81, 0));
  const drag = uniform(0.98);
  const deltaTime = uniform(0.016);

  // Update velocity
  velocity.addAssign(gravity.mul(deltaTime));
  velocity.mulAssign(drag);

  // Update position
  position.addAssign(velocity.mul(deltaTime));

  // Floor collision
  If(position.y.lessThan(0), () => {
    position.y.assign(0);
    velocity.y.mulAssign(-0.5);
  });
});

// Run compute shader
renderer.computeAsync(computeParticles);
```

### WebGPU + AR Depth (MetavidoVFX Pattern)

```javascript
// Depth texture from AR Foundation → WebGPU compute
const depthTexture = new StorageTexture(width, height);

const processDepth = tslFn(() => {
  const depth = texture(depthTexture, uv());
  const worldPos = reconstructWorldPosition(depth, inverseViewProj);

  // Output to particle buffer
  storage(particlePositions, 'vec3', index).assign(worldPos);
});
```

### Keijiro WebGPU Demos (Reference)

| Demo | URL | Pattern |
|------|-----|---------|
| SdfVfxTrails | [WebGPU-Test/SdfVfxTrails](https://www.keijiro.tokyo/WebGPU-Test/SdfVfxTrails/) | Particles on SDF surface |
| SdfVfxStickies | [WebGPU-Test/SdfVfxStickies](https://www.keijiro.tokyo/WebGPU-Test/SdfVfxStickies/) | Particles stick on approach |

### WebGPU Repos

| Repo | Description |
|------|-------------|
| [shadowofaroman/Operation-Swarm](https://github.com/shadowofaroman/Operation-Swarm) | 400K particles demo |
| [ULuIQ12/webgputest-particlesSDF](https://github.com/ULuIQ12/webgputest-particlesSDF) | SDF particles |
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | WebGPU renderer in examples/jsm/renderers/ |

### Migration: WebGL → WebGPU

```javascript
// Before (WebGL)
import { WebGLRenderer } from 'three';
const renderer = new WebGLRenderer();

// After (WebGPU)
import { WebGPURenderer } from 'three/webgpu';
const renderer = new WebGPURenderer();
await renderer.init();  // Async initialization required
```

### Fallback Pattern

```javascript
async function createRenderer() {
  if (navigator.gpu) {
    const { WebGPURenderer } = await import('three/webgpu');
    const renderer = new WebGPURenderer();
    await renderer.init();
    return renderer;
  }
  // Fallback to WebGL
  return new WebGLRenderer();
}
```

---

## Project-Specific Applications

### Portals v4

| Feature | Implementation |
|---------|----------------|
| AR scene visualization | Force graph of scene nodes |
| Asset dependency graph | Hierarchical layout |
| Real-time collaboration | Live graph updates via WebSocket |
| Cross-platform | WebGPU with WebGL fallback |

### MetavidoVFX

| Feature | Implementation |
|---------|----------------|
| VFX parameter visualization | Real-time 3D scatter plot |
| Particle system preview | WebGPU compute for 1M+ |
| Depth data visualization | Point cloud from AR depth |
| Performance monitoring | Frame time graphs |

---

## Full Reference

- **_WEB_MASTER.md** - Complete WebGL/WebGPU guide (273KB)
- **_VFX_MASTER_PATTERNS.md** - Unity VFX Graph (107KB)
- **_VFX_AR_MASTER.md** - AR + VFX integration (102KB)
- **CodeSnippets/webgl-3d-visualization-example.html** - Interactive example
