# XRRAI Scene Viewer

Web-based viewer for XRRAI scenes exported from MetavidoVFX.

**Part of Spec 016: XRRAI Scene Format & Cross-Platform Export**

## Features

- **GLB Loading**: Drag & drop or URL parameter loading
- **Three.js Rendering**: WebGL with orbit controls
- **AR Preview**: model-viewer integration for iOS Quick Look / Android WebXR
- **Icosa Integration**: Load scenes from Icosa Gallery

## Quick Start

```bash
npm install
npm run dev
```

Opens at http://localhost:3016

## Usage

### Drag & Drop

Drop a `.glb` or `.xrrai` file onto the viewer.

### URL Parameters

```
# Load from URL
http://localhost:3016?url=https://example.com/scene.glb

# Load from Icosa Gallery
http://localhost:3016?icosa=assetId
```

### AR Mode

Click "View in AR" to launch:
- **iOS**: Quick Look with USDZ auto-conversion
- **Android**: WebXR or Scene Viewer

## Build

```bash
npm run build
```

Output in `dist/` - deploy to any static host.

## Dependencies

- [Three.js](https://threejs.org/) - 3D rendering
- [model-viewer](https://modelviewer.dev/) - AR preview
- [Vite](https://vitejs.dev/) - Build tool

## Roadmap

- [ ] three-icosa integration for brush shaders
- [ ] WebGPU renderer option
- [ ] Animation playback
- [ ] .tilt file loading

## License

MIT
