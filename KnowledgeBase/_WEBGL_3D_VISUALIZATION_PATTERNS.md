# WebGL 3D Visualization Patterns

**Tags**: #visualization #webgl #threejs #mcp #dataviz
**Cross-refs**: `_WEB_MASTER.md`, `_UNITY_MCP_MASTER.md`
**Source**: https://github.com/AICodingGenius/AI-XR-MCP

---

## Overview

MCP server for interactive 3D WebGL visualizations of:
- Websites (site structure)
- GitHub repositories (codebase structure)
- Local file systems (directory trees)

## Key Features

| Feature | Implementation |
|---------|----------------|
| 3D Rendering | Three.js |
| Layout | Force-directed, radial, hierarchical |
| Output | HTML, JSON, data URLs |
| MCP Clients | Claude Desktop, Windsurf, Cursor |

## Three.js Force-Directed Graph Setup

```javascript
import * as THREE from 'three';
import { ForceGraph3D } from '3d-force-graph';

const graph = ForceGraph3D()
  .graphData(data)
  .nodeLabel('name')
  .nodeAutoColorBy('group')
  .linkDirectionalArrowLength(3.5)
  .linkDirectionalArrowRelPos(1)
  .linkCurvature(0.25);
```

## MCP Tool Definition

```typescript
{
  name: "visualize_repo",
  description: "Generate 3D visualization of a GitHub repository",
  inputSchema: {
    type: "object",
    properties: {
      repoUrl: { type: "string", description: "GitHub repository URL" },
      layout: {
        type: "string",
        enum: ["force", "radial", "hierarchical"],
        default: "force"
      },
      depth: { type: "number", default: 3 }
    },
    required: ["repoUrl"]
  }
}
```

## Layout Algorithms

### Force-Directed (Default)
```javascript
.d3Force('charge', d3.forceManyBody().strength(-120))
.d3Force('link', d3.forceLink().distance(30))
.d3Force('center', d3.forceCenter())
```

### Radial
```javascript
.dagMode('radialout')
.dagLevelDistance(50)
```

### Hierarchical
```javascript
.dagMode('td')  // top-down
.dagLevelDistance(100)
```

## Integration with Claude

Add to `~/.claude/config.json`:
```json
{
  "mcp": {
    "providers": {
      "webgl3d": {
        "description": "3D Visualization Tool",
        "command": "node",
        "args": ["path/to/ai-xr-mcp/dist/index.js"]
      }
    }
  }
}
```

## Example Output

See: `CodeSnippets/webgl-3d-visualization-example.html`

Interactive 3D graph with:
- Zoom/pan/rotate
- Node hover info
- Click to focus
- Color-coded by file type

## Use Cases

| Scenario | Layout | Notes |
|----------|--------|-------|
| Codebase overview | Force | Shows clustering |
| Package dependencies | Hierarchical | Shows layers |
| File relationships | Radial | Centered on entry point |
| Website sitemap | Force | Natural grouping |

---

**Full repo**: https://github.com/AICodingGenius/AI-XR-MCP
