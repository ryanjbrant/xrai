# DataViz Hub Patterns - WarpJobs

**Last Updated:** 2026-02-12
**Context:** ECharts-GL visualization system for job dashboard (3000+ nodes, multi-dimensional analysis)
**Applies To:** `web/datavis.html`, interactive analytics, large graph rendering

---

## 1. ECharts-GL Version Lock Pattern

**Pattern:** Pin compatible versions - echarts@5 + echarts-gl@2.0.9

```html
<!-- CDN Load Order (CRITICAL) -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/echarts-gl@2.0.9/dist/echarts-gl.min.js"></script>
```

**Why:** ECharts-GL 2.0.9 pairs with ECharts 5.x. Mismatches break 3D charts silently.

**Learnings:**
- echarts-gl@2.1+ requires echarts@5.4+
- Test after any version bump
- Check browser console for "echarts-gl not found" errors

---

## 2. ForceAtlas2 GPU Layout for Large Graphs

**Pattern:** 2000+ node graphs use GPU-accelerated physics

```javascript
const option = {
  series: [{
    type: 'graphGL',
    coordinateSystem: 'globe',
    data: nodes,        // 2757 nodes / 3240 edges
    links: edges,
    forceAtlas2: {
      steps: 5,                 // WebGL2 capable
      maxSteps: 3000,          // Convergence limit
      gravity: 5,
      jitterTolerance: 10,
      barnesHutOptimize: {      // CPU fallback
        enable: true,
        theta: 0.8
      }
    },
    focusNodeAdjacencyOn: 'click'  // Click to isolate
  }]
};
```

**GPU Tier Adaptation:**
- WebGL2 capable: steps=5-10
- WebGL fallback: steps=1
- CPU only: Use static layout or reduce nodes

**Community Detection:**
```javascript
// Modularity with resolution scaling
communities: analyzeModularity(edges, { resolution: 2, sort: true })
```

---

## 3. Scatter3D Multi-Axis Job Analysis

**Pattern:** Three-axis analysis: Freshness × Source Quality × Priority

```javascript
const option = {
  xAxis3D: { name: 'Freshness (Days Since Posted)', data: [...] },
  yAxis3D: { name: 'Source Quality Score', data: [...] },
  zAxis3D: { name: 'Priority Tier', data: [...] },
  series: [{
    type: 'scatter3D',
    data: jobs.map(j => [
      Math.max(0, daysSincePosted - 30),  // Inverted, 30-day window
      sourceQuality[j.source],             // Greenhouse=90, Ashby=88, Lever=85
      getTierScore(j)
    ]),
    symbolSize: 8,
    itemStyle: { color: colorByCompany(job, top20companies) }
  }]
};
```

**Source Quality Hardcoded Tiers:**
- Greenhouse/Lever/Ashby: 85-90 (direct ATS, verified)
- LinkedIn/Indeed: 50-60 (noisy)
- RSS feeds: 30-40 (low signal)

---

## 4. Globe Visualization without Textures

**Pattern:** Clean dark globe without external image assets

```javascript
const option = {
  globe: {
    baseColor: '#111111',     // Dark background
    shading: 'color',
    light: {
      main: { intensity: 1.2 },
      ambient: { intensity: 0.4 }
    },
    viewControl: { autoRotate: true, autoRotateSpeed: 2 },
    atmosphere: {
      show: true,
      glowPower: 4,           // Subtle glow (4-6 range)
      glowColor: '#ffffff'
    }
  },
  series: [{
    type: 'scatter3D',
    coordinateSystem: 'globe',
    data: cityPoints
  }, {
    type: 'lines3D',
    coordinateSystem: 'globe',
    lineStyle: { width: 2, opacity: 0.8 },
    effect: { show: true, trailLength: 0.8 }
  }]
};
```

**Why No Textures:**
- Reduce CDN dependencies
- Faster load (< 2KB per chart)
- Cleaner, less distraction

---

## 5. Bar3D Skill-Source Cross-Tab

**Pattern:** 3D matrix visualization of skills × sources

```javascript
// Pre-compute cross-tab
const matrix = {};
jobs.forEach(j => {
  const src = j.source || 'unknown';
  sourceKeywords[src].forEach(kw => {
    const key = `${src}|${kw}`;
    matrix[key] = (matrix[key] || 0) + 1;
  });
});

const option = {
  xAxis3D: { type: 'category', data: sources },
  yAxis3D: { type: 'category', data: skillTerms },
  zAxis3D: { type: 'value', name: 'Job Count' },
  series: [{
    type: 'bar3D',
    data: Object.entries(matrix).map(([k, v]) => {
      const [src, skill] = k.split('|');
      return [sources.indexOf(src), skills.indexOf(skill), v];
    }),
    shading: 'lambert',
    label: { show: true, formatter: '{c}' },
    itemStyle: { opacity: 0.8 },
    emphasis: { itemStyle: { opacity: 1 } }
  }]
};
```

**Keyword Regex (Word Boundary):**
```javascript
// Prevent 'vault' matching 'ar'
const matches = text.match(/\b(xr|vr|ar|ai|ml|3d|llm|nlp|cv|rl)\b/gi);
```

---

## 6. Geo Map with Static City Geocoding

**Pattern:** ~80 hardcoded cities cover ~85% of job locations

```javascript
const cityGeo = {
  'San Francisco, CA': [-122.4194, 37.7749],
  'New York, NY': [-74.0060, 40.7128],
  'Austin, TX': [-97.7431, 30.2672],
  // ... 77 more cities
  'Remote': [-95.7129, 37.0902]  // US center
};

// Fuzzy match in job location
function getCoords(location) {
  const loc = location.toLowerCase();
  if (loc.includes('remote')) return cityGeo['Remote'];

  for (const [city, coords] of Object.entries(cityGeo)) {
    if (loc.includes(city.toLowerCase())) return coords;
  }
  return null;  // Skip ungeocodable
}

const option = {
  geo: {
    map: 'world',
    roam: true,
    itemStyle: { borderColor: '#404040', areaColor: '#1a1a1a' }
  },
  series: [{
    type: 'effectScatter',
    coordinateSystem: 'geo',
    data: jobs.map(j => ({
      name: j.company,
      value: [...getCoords(j.location), priorityScore(j)]
    })),
    rippleEffect: { brushType: 'stroke', scale: 3 },
    hoverAnimation: true,
    label: { formatter: '{b}', position: 'right' }
  }, {
    type: 'lines',
    coordinateSystem: 'geo',
    data: hiringCorridors,  // Major city-pair connections
    lineStyle: { width: 1, opacity: 0.4 },
    effect: { show: true, trailLength: 0.3 }
  }]
};
```

**Register World Map at Runtime:**
```javascript
fetch('https://cdn.jsdelivr.net/npm/echarts@5/map/json/world.json')
  .then(r => r.json())
  .then(geoJSON => echarts.registerMap('world', geoJSON));
```

---

## 7. GPU Tier Detection & Fallback

**Pattern:** Adaptive quality based on device capability

```javascript
function detectGPUTier() {
  // WebGPU > WebGL2 > WebGL > CPU
  if (navigator.gpu) return 'webgpu';

  const canvas = document.createElement('canvas');
  const gl2 = canvas.getContext('webgl2');
  if (gl2) return 'webgl2';

  const gl = canvas.getContext('webgl');
  if (gl) return 'webgl';

  return 'cpu';
}

const tier = detectGPUTier();
const config = {
  webgpu: { forceAtlas2Steps: 10, atmosphereGlow: 6, devicePixelRatio: 2 },
  webgl2: { forceAtlas2Steps: 5, atmosphereGlow: 4, devicePixelRatio: 1.5 },
  webgl: { forceAtlas2Steps: 1, atmosphereGlow: 2, devicePixelRatio: 1 },
  cpu: { forceAtlas2Steps: 0, useStaticLayout: true, maxNodes: 500 }
}[tier];
```

---

## 8. Safe DOM Pattern (XSS Prevention)

**Pattern:** Avoid innerHTML, use textContent + setAttribute

```javascript
// BAD: innerHTML risk
chart.showLoading('default', { text: userInput });

// GOOD: Safe helpers
function el(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Element ${id} not found`);
  return element;
}

function clear(id) {
  el(id).textContent = '';  // Safe clear
}

function showLoading(id, message) {
  const container = el(id);
  container.textContent = '';
  const div = document.createElement('div');
  div.textContent = message;  // Safe content
  div.className = 'loading';
  container.appendChild(div);
}

// For chart init
const myChart = echarts.init(el('my-chart'), 'dark');
```

---

## 9. Lazy Tab Rendering Pattern

**Pattern:** Only initialize charts on first tab click, track render state

```javascript
const rendered = {};
const charts = {};

function initTab(tabName) {
  if (rendered[tabName]) return;  // Already init

  const container = el(`${tabName}-container`);
  if (!charts[tabName]) {
    charts[tabName] = echarts.init(container, 'dark');
  }

  // Fetch data and set option
  const option = buildOption(tabName);
  charts[tabName].setOption(option);
  rendered[tabName] = true;

  // Handle resize
  window.addEventListener('resize', () => {
    if (charts[tabName]) charts[tabName].resize();
  });
}

// Event listeners
document.getElementById('tab-network').addEventListener('click', () => initTab('network'));
document.getElementById('tab-scatter').addEventListener('click', () => initTab('scatter'));
```

---

## 10. Single-File Dashboard Architecture Decision

**Pattern:** All-in-one HTML files avoid build complexity

**Files:**
- `index.html` (~3000 lines) - Main dashboard
- `network.html` (~830 lines) - Network graph
- `datavis.html` (~1370 lines) - Multi-viz hub

**Structure:**
```html
<!-- CSS inline in <style> -->
<style>
  /* 200+ lines of dashboard styles */
  #chart-container { ... }
</style>

<!-- Vendor CDN imports -->
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/..."></script>

<!-- App logic inline in <script> -->
<script>
  // 1000+ lines of chart config, event handlers, data processing
  function initDashboard() { ... }
  window.addEventListener('load', initDashboard);
</script>
```

**Why Single-File:**
- No build tooling (webpack, vite, etc.)
- Easier local debugging (F12 → Sources)
- Simple deployment (copy 1 file)
- Suitable for personal tools with <5 developers

**Tradeoffs:**
- Less code organization (mitigated by clear sections + TODOs)
- Larger file size (offset by single-file caching)
- Not suitable for large teams

---

## Quick Reference

| Technique | Use Case | Node Count |
|-----------|----------|-----------|
| GraphGL ForceAtlas2 | Network topology, relationships | 1000-5000 |
| Scatter3D | Multi-axis analysis (freshness/quality/tier) | 100-2000 |
| Globe + Lines3D | Geographic flow (hiring corridors) | 100-1000 |
| Bar3D | Cross-tabulation (skills × sources) | 50-500 |
| EffectScatter | City-level data with ripple effect | <200 |

---

## Integration Checklist

- [ ] Version lock: echarts@5 + echarts-gl@2.0.9
- [ ] Register world.json before geo/globe charts
- [ ] Detect GPU tier, adapt ForceAtlas2 steps
- [ ] Use el()/clear() safe helpers for all DOM
- [ ] Lazy-load charts on tab click, track rendered state
- [ ] Test with 3000+ nodes on WebGL fallback
- [ ] Word-boundary regex for short keywords (`\b(xr|vr|ar)\b`)
- [ ] Hardcode ~80 cities for ~85% coverage
