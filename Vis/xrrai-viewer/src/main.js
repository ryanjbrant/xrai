/**
 * XRRAI Scene Viewer
 * Three.js + model-viewer for WebGL/WebXR rendering of XRRAI scenes
 *
 * Part of Spec 016: XRRAI Scene Format & Cross-Platform Export
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import '@google/model-viewer';

// --- DOM Elements ---
const container = document.getElementById('canvas-container');
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const titleEl = document.getElementById('title');
const infoEl = document.getElementById('info');
const errorEl = document.getElementById('error');
const dropZone = document.getElementById('drop-zone');
const arViewer = document.getElementById('ar-viewer');
const btnReset = document.getElementById('btn-reset');
const btnFullscreen = document.getElementById('btn-fullscreen');
const btnAR = document.getElementById('btn-ar');

// --- Three.js Setup ---
let scene, camera, renderer, controls;
let currentModel = null;
let currentGLBUrl = null;

function init() {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.5, 3);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0.5, 0);
  controls.update();

  // Lighting
  setupLighting();

  // Grid helper
  const grid = new THREE.GridHelper(10, 20, 0x444444, 0x222222);
  scene.add(grid);

  // Event listeners
  window.addEventListener('resize', onResize);
  setupDropZone();
  setupButtons();

  // Check URL for scene to load
  checkUrlParams();

  // Start render loop
  animate();

  // Hide loading after init
  hideLoading();
}

function setupLighting() {
  // Ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);

  // Key light
  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.position.set(5, 10, 5);
  key.castShadow = true;
  scene.add(key);

  // Fill light
  const fill = new THREE.DirectionalLight(0x8888ff, 0.3);
  fill.position.set(-5, 5, -5);
  scene.add(fill);

  // Rim light
  const rim = new THREE.DirectionalLight(0x00d4ff, 0.2);
  rim.position.set(0, -5, -10);
  scene.add(rim);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// --- Loading ---

function showLoading(text = 'Loading scene...') {
  loadingText.textContent = text;
  loading.classList.remove('hidden');
}

function hideLoading() {
  loading.classList.add('hidden');
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.classList.add('visible');
  setTimeout(() => errorEl.classList.remove('visible'), 5000);
}

// --- GLB Loading ---

async function loadGLB(url, name = 'Scene') {
  showLoading(`Loading ${name}...`);

  try {
    const loader = new GLTFLoader();

    const gltf = await new Promise((resolve, reject) => {
      loader.load(
        url,
        resolve,
        (progress) => {
          if (progress.total > 0) {
            const pct = Math.round((progress.loaded / progress.total) * 100);
            loadingText.textContent = `Loading ${name}... ${pct}%`;
          }
        },
        reject
      );
    });

    // Remove existing model
    if (currentModel) {
      scene.remove(currentModel);
      currentModel = null;
    }

    currentModel = gltf.scene;
    scene.add(currentModel);

    // Center and scale model
    const box = new THREE.Box3().setFromObject(currentModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Move to center
    currentModel.position.sub(center);
    currentModel.position.y += size.y / 2;

    // Scale if too large
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 5) {
      const scale = 5 / maxDim;
      currentModel.scale.setScalar(scale);
    }

    // Update camera target
    controls.target.set(0, size.y / 2, 0);
    controls.update();

    // Update UI
    titleEl.textContent = name;
    infoEl.textContent = `Vertices: ${countVertices(currentModel).toLocaleString()}`;

    // Store URL for AR
    currentGLBUrl = url;

    hideLoading();
    console.log('[XRRAI Viewer] Loaded:', name);

  } catch (error) {
    hideLoading();
    showError(`Failed to load: ${error.message}`);
    console.error('[XRRAI Viewer] Load error:', error);
  }
}

function countVertices(object) {
  let count = 0;
  object.traverse((child) => {
    if (child.isMesh && child.geometry) {
      const pos = child.geometry.attributes.position;
      if (pos) count += pos.count;
    }
  });
  return count;
}

// --- XRRAI Format Loading ---

async function loadXRRAI(file) {
  showLoading('Parsing XRRAI scene...');

  try {
    const text = await file.text();
    const scene = JSON.parse(text);

    // Extract metadata
    const name = scene.scene?.name || 'XRRAI Scene';
    const strokeCount = scene.strokes?.length || 0;

    // For now, just show info - full rendering would require brush shaders
    hideLoading();
    titleEl.textContent = name;
    infoEl.textContent = `Strokes: ${strokeCount} (GLB export recommended for viewing)`;

    showError('XRRAI format loaded. Export to GLB for full 3D preview.');

  } catch (error) {
    hideLoading();
    showError(`Invalid XRRAI file: ${error.message}`);
  }
}

// --- Drag & Drop ---

function setupDropZone() {
  document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZone.classList.add('active');
  });

  document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    if (e.target === dropZone) {
      dropZone.classList.remove('active');
    }
  });

  document.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const name = file.name;
    const ext = name.split('.').pop().toLowerCase();

    if (ext === 'glb' || ext === 'gltf') {
      const url = URL.createObjectURL(file);
      await loadGLB(url, name);
    } else if (ext === 'xrrai') {
      await loadXRRAI(file);
    } else {
      showError('Unsupported format. Use .glb or .xrrai');
    }
  });
}

// --- Button Handlers ---

function setupButtons() {
  btnReset.addEventListener('click', () => {
    camera.position.set(0, 1.5, 3);
    controls.target.set(0, 0.5, 0);
    controls.update();
  });

  btnFullscreen.addEventListener('click', () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  });

  btnAR.addEventListener('click', () => {
    if (!currentGLBUrl) {
      showError('Load a GLB file first');
      return;
    }

    // Use model-viewer for AR
    arViewer.src = currentGLBUrl;
    arViewer.style.display = 'block';

    // Try to activate AR
    if (arViewer.canActivateAR) {
      arViewer.activateAR();
    } else {
      showError('AR not supported on this device');
      arViewer.style.display = 'none';
    }
  });

  // model-viewer exit handler
  arViewer.addEventListener('ar-status', (e) => {
    if (e.detail.status === 'failed' || e.detail.status === 'not-presenting') {
      arViewer.style.display = 'none';
    }
  });
}

// --- URL Parameters ---

function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);

  // Load from URL: ?url=https://example.com/scene.glb
  const url = params.get('url');
  if (url) {
    loadGLB(url, url.split('/').pop());
    return;
  }

  // Load from Icosa: ?icosa=assetId
  const icosaId = params.get('icosa');
  if (icosaId) {
    const icosaUrl = `https://icosa.gallery/api/v1/assets/${icosaId}/download`;
    loadGLB(icosaUrl, `Icosa: ${icosaId}`);
    return;
  }

  // Load demo scene if no params
  // loadDemoScene();
}

// --- Initialize ---

init();
