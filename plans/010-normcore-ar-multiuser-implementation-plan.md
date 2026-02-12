# Implementation Plan: Spec 010 - Normcore AR Multiuser Drawing

**Created**: 2026-02-11
**Status**: Ready for Implementation
**Spec Reference**: `MetavidoVFX-main/Assets/Documentation/specs/010-normcore-multiuser/`

---

## Executive Summary

This plan implements AR-only multiplayer drawing using Normcore SDK. The original reference project (`_ref/Normcore-Multiplayer-Drawing-Multiplayer/`) targets Quest VR with OpenXR; we adapt it for iOS AR Foundation.

### Key Adaptations

| Original (VR)              | Target (AR)                   |
| -------------------------- | ----------------------------- |
| XRNode controller tracking | ARBrushInput touch raycasting |
| OpenXR trigger input       | Touch begin/move/end          |
| 6DOF headset               | ARKit world tracking          |
| Built-in render pipeline   | URP                           |

### Existing Components (Already Built)

- **ARBrushInput.cs** - Touch-to-world-position with AR plane raycasting ✅
- **ARPlaneDrawing.cs** - AR plane management and stroke anchoring ✅
- **BrushManager.cs** - Stroke management (from Spec 011) ✅

### Components to Add

- **ARBrush.cs** - Normcore-integrated brush using ARBrushInput
- **NormcoreStroke.cs** - BrushStroke adapted for AR + Normcore
- **NormcoreConnectionUI.cs** - Connection status display
- **VoiceChatManager.cs** - RealtimeAvatarVoice wrapper

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              iOS AR Device A                                     │
│                                                                                  │
│  ┌────────────────────────┐    ┌────────────────────────┐                       │
│  │  AR Session            │    │  ARBrushInput          │                       │
│  │  - ARPlaneManager      │───►│  - Touch → World Pos   │                       │
│  │  - ARRaycastManager    │    │  - Plane hit detection │                       │
│  └────────────────────────┘    └──────────┬─────────────┘                       │
│                                           │                                      │
│  ┌────────────────────────────────────────▼─────────────────────────────────────┐
│  │                              ARBrush.cs                                       │
│  │                                                                               │
│  │  if (arBrushInput.IsDrawing AND _activeBrushStroke == null)                  │
│  │      _activeBrushStroke = Realtime.Instantiate(BrushStrokePrefab)            │
│  │                                                                               │
│  │  if (arBrushInput.IsDrawing)                                                  │
│  │      _activeBrushStroke.MoveBrushTipToPoint(position, rotation)              │
│  │                                                                               │
│  │  if (!arBrushInput.IsDrawing AND _activeBrushStroke != null)                 │
│  │      _activeBrushStroke.EndBrushStroke()                                      │
│  │      _activeBrushStroke = null                                                │
│  └──────────────────────────────────────────────────────────────────────────────┘
│                                           │                                      │
│                                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐
│  │                         Normcore Realtime                                     │
│  │  - Room: ar-drawing-demo                                                      │
│  │  - BrushStroke[] synced via RealtimeArray                                    │
│  │  - RealtimeAvatarVoice for voice chat                                        │
│  └──────────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            │ WebSocket/UDP
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Normcore Cloud                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────┐
│  │  Room State:                                                                  │
│  │    - clients: [clientA, clientB, ...]                                        │
│  │    - BrushStroke[]: RealtimeModel per stroke                                 │
│  │    - Voice streams: WebRTC audio                                             │
│  └──────────────────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            │ WebSocket/UDP
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              iOS AR Device B                                     │
│  [Same architecture as Device A - receives synced strokes]                      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Sprint 0: Project Setup (3-4 hours)

### Task 0.1: Add Normcore SDK to Project

**File**: `MetavidoVFX-main/Packages/manifest.json`

Add Normcore scoped registry:

```json
{
  "scopedRegistries": [
    {
      "name": "Keijiro",
      "url": "https://registry.npmjs.com",
      "scopes": ["jp.keijiro", "com.github.asus4"]
    },
    {
      "name": "package.openupm.com",
      "url": "https://package.openupm.com",
      "scopes": ["com.github-glitchenzo.nugetforunity"]
    },
    {
      "name": "Normal",
      "url": "https://normcore-registry.normcore.io",
      "scopes": ["com.normalvr", "io.normcore"]
    }
  ],
  "dependencies": {
    "com.normalvr.normcore": "2.9.0"
    // ... existing dependencies
  }
}
```

**Acceptance Criteria**:

- [ ] Normcore compiles without errors
- [ ] `NORMCORE_AVAILABLE` scripting define added to Player Settings

### Task 0.2: Configure Normcore App Settings

**Action**: Create Normcore app at https://normcore.io/dashboard

**File**: `MetavidoVFX-main/Assets/Resources/NormcoreAppSettings.asset`

```yaml
# ScriptableObject settings
appKey: "YOUR_APP_KEY_HERE"
matcherURL: "" # Use default
```

**Note**: App key should NOT be committed to version control. Use `.gitignore` or environment variables.

### Task 0.3: Create NormcoreARDrawing Scene

**File**: `MetavidoVFX-main/Assets/Scenes/Spec010_NormcoreARDrawing.unity`

**Scene Hierarchy**:

```
NormcoreARDrawing
├── AR Session
│   └── AR Session component
├── AR Session Origin
│   ├── AR Camera
│   │   └── AR Camera Background
│   ├── AR Plane Manager
│   ├── AR Raycast Manager
│   └── AR Anchor Manager
├── Normcore
│   └── Realtime
│       ├── Realtime component
│       │   - Room Name: ar-drawing-demo
│       │   - Join Room On Start: true
│       └── RealtimeAvatarManager
├── Drawing
│   └── ARBrush
│       ├── ARBrush component
│       ├── ARBrushInput component
│       └── ARPlaneDrawing component
├── UI
│   └── ConnectionStatusCanvas
│       └── StatusText (TMP)
└── EventSystem
```

**Prefab**: `MetavidoVFX-main/Assets/Resources/NormcoreBrushStroke.prefab`

```
NormcoreBrushStroke
├── RealtimeView component
├── RealtimeTransform component
├── BrushStroke component (adapted)
└── BrushStrokeMesh component
    └── MeshFilter
    └── MeshRenderer (URP/Lit material)
```

---

## Sprint 1: Core Networking & AR Input (6-8 hours)

### Task 1.1: Create ARBrush.cs

**File**: `MetavidoVFX-main/Assets/Scripts/Normcore/ARBrush.cs`

```csharp
// ARBrush.cs - Normcore-integrated brush for AR Foundation
// Adapts VR Brush.cs to use ARBrushInput instead of XRNode

using UnityEngine;
#if NORMCORE_AVAILABLE
using Normal.Realtime;
#endif

namespace XRRAI.Normcore
{
    public class ARBrush : MonoBehaviour
    {
#if NORMCORE_AVAILABLE
        [Header("Normcore")]
        [SerializeField] private Realtime _realtime;
        [SerializeField] private GameObject _brushStrokePrefab;

        [Header("AR Input")]
        [SerializeField] private XRRAI.BrushPainting.ARBrushInput _arBrushInput;

        [Header("Brush Settings")]
        [SerializeField] private Color _brushColor = Color.white;
        [SerializeField] private float _brushWidth = 0.01f;

        private BrushStroke _activeBrushStroke;
        private bool _wasDrawing;

        private void Update()
        {
            if (_realtime == null || !_realtime.connected)
                return;

            bool isDrawing = _arBrushInput != null && _arBrushInput.IsDrawing;
            Vector3 position = _arBrushInput.Position;
            Quaternion rotation = _arBrushInput.Rotation;

            // Start new stroke
            if (isDrawing && !_wasDrawing && _activeBrushStroke == null)
            {
                var options = new Realtime.InstantiateOptions
                {
                    ownedByClient = true,
                    useInstance = _realtime
                };

                GameObject strokeGO = Realtime.Instantiate(
                    _brushStrokePrefab.name,
                    position,
                    rotation,
                    options
                );

                _activeBrushStroke = strokeGO.GetComponent<BrushStroke>();
                _activeBrushStroke.BeginBrushStrokeWithBrushTipPoint(position, rotation);

                // Apply brush settings
                _activeBrushStroke.SetColor(_brushColor);
                _activeBrushStroke.SetWidth(_brushWidth);
            }

            // Continue stroke
            if (isDrawing && _activeBrushStroke != null)
            {
                _activeBrushStroke.MoveBrushTipToPoint(position, rotation);
            }

            // End stroke
            if (!isDrawing && _wasDrawing && _activeBrushStroke != null)
            {
                _activeBrushStroke.EndBrushStrokeWithBrushTipPoint(position, rotation);
                _activeBrushStroke = null;
            }

            _wasDrawing = isDrawing;
        }

        public void SetBrushColor(Color color)
        {
            _brushColor = color;
        }

        public void SetBrushWidth(float width)
        {
            _brushWidth = Mathf.Clamp(width, 0.001f, 0.1f);
        }
#endif
    }
}
```

### Task 1.2: Create NormcoreConnectionUI.cs

**File**: `MetavidoVFX-main/Assets/Scripts/Normcore/NormcoreConnectionUI.cs`

```csharp
using UnityEngine;
using TMPro;
#if NORMCORE_AVAILABLE
using Normal.Realtime;
#endif

namespace XRRAI.Normcore
{
    public class NormcoreConnectionUI : MonoBehaviour
    {
        [SerializeField] private TMP_Text _statusText;
        [SerializeField] private TMP_Text _clientCountText;

#if NORMCORE_AVAILABLE
        [SerializeField] private Realtime _realtime;

        private float _connectStartTime;

        private void OnEnable()
        {
            if (_realtime != null)
            {
                _connectStartTime = Time.time;
                _realtime.didConnectToRoom += OnConnected;
                _realtime.didDisconnectFromRoom += OnDisconnected;
            }
        }

        private void OnDisable()
        {
            if (_realtime != null)
            {
                _realtime.didConnectToRoom -= OnConnected;
                _realtime.didDisconnectFromRoom -= OnDisconnected;
            }
        }

        private void OnConnected(Realtime realtime)
        {
            float elapsed = Time.time - _connectStartTime;
            Debug.Log($"[Normcore] Connected in {elapsed:F2}s, clientID={realtime.clientID}");

            if (_statusText != null)
                _statusText.text = $"Connected ({elapsed:F1}s)\nClient: {realtime.clientID}";
        }

        private void OnDisconnected(Realtime realtime)
        {
            if (_statusText != null)
                _statusText.text = "Disconnected";
        }

        private void Update()
        {
            if (_realtime == null) return;

            if (!_realtime.connected)
            {
                if (_statusText != null)
                    _statusText.text = "Connecting...";
                return;
            }

            // Update client count
            if (_clientCountText != null)
            {
                int clientCount = _realtime.room.clientCount;
                _clientCountText.text = $"Users: {clientCount}";
            }
        }
#endif
    }
}
```

### Task 1.3: Adapt BrushStroke for AR + Color/Width

**File**: `MetavidoVFX-main/Assets/Scripts/Normcore/NormcoreBrushStroke.cs`

This extends the original BrushStroke to support:

- Color property (synced via RealtimeModel)
- Width property (synced via RealtimeModel)
- URP material support

```csharp
using UnityEngine;
#if NORMCORE_AVAILABLE
using Normal.Realtime;
using Normal.Realtime.Serialization;
#endif

namespace XRRAI.Normcore
{
#if NORMCORE_AVAILABLE
    public class NormcoreBrushStroke : RealtimeComponent<NormcoreBrushStrokeModel>
    {
        [SerializeField] private NormcoreBrushStrokeMesh _mesh;

        // ... (copy BrushStroke.cs logic)

        public void SetColor(Color color)
        {
            model.brushColor = color;
            _mesh.UpdateMaterialColor(color);
        }

        public void SetWidth(float width)
        {
            model.brushWidth = width;
        }

        protected override void OnRealtimeModelReplaced(
            NormcoreBrushStrokeModel previousModel,
            NormcoreBrushStrokeModel currentModel)
        {
            // ... (copy model replacement logic)

            // Apply color/width from model
            if (currentModel != null)
            {
                _mesh.UpdateMaterialColor(currentModel.brushColor);
            }
        }
    }
#endif
}
```

**Model File**: `MetavidoVFX-main/Assets/Scripts/Normcore/NormcoreBrushStrokeModel.cs`

```csharp
using UnityEngine;
#if NORMCORE_AVAILABLE
using Normal.Realtime.Serialization;

namespace XRRAI.Normcore
{
    [RealtimeModel]
    public partial class NormcoreBrushStrokeModel
    {
        [RealtimeProperty(1, true)]
        private RealtimeArray<RibbonPointModel> _ribbonPoints;

        [RealtimeProperty(2, false)]
        private Vector3 _brushTipPosition;

        [RealtimeProperty(3, false)]
        private Quaternion _brushTipRotation;

        [RealtimeProperty(4, true)]
        private bool _brushStrokeFinalized;

        // New properties for color/width
        [RealtimeProperty(5, true)]
        private Color _brushColor;

        [RealtimeProperty(6, true)]
        private float _brushWidth;
    }
}
#endif
```

---

## Sprint 2: Stroke Sync & Testing (4-6 hours)

### Task 2.1: Stroke Sync Verification Test

**Test Script**: `MetavidoVFX-main/Assets/Scripts/Normcore/Tests/StrokeSyncTest.cs`

```csharp
#if UNITY_EDITOR && NORMCORE_AVAILABLE
using UnityEngine;
using NUnit.Framework;

namespace XRRAI.Normcore.Tests
{
    public class StrokeSyncTest
    {
        [Test]
        public void BrushStrokeModel_SerializesCorrectly()
        {
            // Test that model properties serialize/deserialize
            var model = new NormcoreBrushStrokeModel();
            model.brushTipPosition = new Vector3(1, 2, 3);
            model.brushColor = Color.red;
            model.brushWidth = 0.02f;

            Assert.AreEqual(new Vector3(1, 2, 3), model.brushTipPosition);
            Assert.AreEqual(Color.red, model.brushColor);
            Assert.AreEqual(0.02f, model.brushWidth, 0.001f);
        }
    }
}
#endif
```

### Task 2.2: Late Joiner Support

Normcore automatically handles late joiners via its RealtimeArray persistence. When a new client joins:

1. Normcore syncs all existing BrushStroke models
2. `OnRealtimeModelReplaced` is called for each stroke
3. Mesh rebuilds from `ribbonPoints` array

**Verification Test**:

1. Device A: Draw 5 strokes
2. Device B: Join room
3. Verify: Device B sees all 5 strokes with correct colors/positions

---

## Sprint 3: Voice Chat & Polish (4-6 hours)

### Task 3.1: Voice Chat Setup

**File**: `MetavidoVFX-main/Assets/Scripts/Normcore/VoiceChatManager.cs`

```csharp
using UnityEngine;
using UnityEngine.UI;
#if NORMCORE_AVAILABLE
using Normal.Realtime;
#endif

namespace XRRAI.Normcore
{
    public class VoiceChatManager : MonoBehaviour
    {
        [SerializeField] private Button _muteButton;
        [SerializeField] private Image _muteIcon;

#if NORMCORE_AVAILABLE
        [SerializeField] private RealtimeAvatarVoice _voiceComponent;

        private bool _isMuted;

        private void Start()
        {
            if (_muteButton != null)
                _muteButton.onClick.AddListener(ToggleMute);

            // Request microphone permission on iOS
            #if UNITY_IOS && !UNITY_EDITOR
            if (!Application.HasUserAuthorization(UserAuthorization.Microphone))
                Application.RequestUserAuthorization(UserAuthorization.Microphone);
            #endif
        }

        private void ToggleMute()
        {
            _isMuted = !_isMuted;

            if (_voiceComponent != null)
                _voiceComponent.mute = _isMuted;

            if (_muteIcon != null)
                _muteIcon.color = _isMuted ? Color.red : Color.white;
        }
#endif
    }
}
```

**iOS Info.plist** (add via Player Settings):

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Voice chat with other users</string>
```

### Task 3.2: Brush Color/Width UI

**File**: `MetavidoVFX-main/Assets/Scripts/Normcore/BrushSettingsUI.cs`

```csharp
using UnityEngine;
using UnityEngine.UI;

namespace XRRAI.Normcore
{
    public class BrushSettingsUI : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private ARBrush _brush;

        [Header("Color Buttons")]
        [SerializeField] private Button[] _colorButtons;
        [SerializeField] private Color[] _colors = new Color[]
        {
            Color.red, new Color(1f, 0.5f, 0f), Color.yellow,
            Color.green, Color.blue, new Color(0.5f, 0f, 1f)
        };

        [Header("Width Slider")]
        [SerializeField] private Slider _widthSlider;
        [SerializeField] private float _minWidth = 0.005f;
        [SerializeField] private float _maxWidth = 0.05f;

        private int _selectedColorIndex;

        private void Start()
        {
            // Setup color buttons
            for (int i = 0; i < _colorButtons.Length && i < _colors.Length; i++)
            {
                int index = i;
                _colorButtons[i].onClick.AddListener(() => SelectColor(index));
                _colorButtons[i].GetComponent<Image>().color = _colors[i];
            }

            // Setup width slider
            if (_widthSlider != null)
            {
                _widthSlider.minValue = _minWidth;
                _widthSlider.maxValue = _maxWidth;
                _widthSlider.value = (_minWidth + _maxWidth) / 2f;
                _widthSlider.onValueChanged.AddListener(OnWidthChanged);
            }

            // Select first color by default
            SelectColor(0);
        }

        private void SelectColor(int index)
        {
            _selectedColorIndex = index;

            #if NORMCORE_AVAILABLE
            if (_brush != null)
                _brush.SetBrushColor(_colors[index]);
            #endif

            // Update button visuals
            for (int i = 0; i < _colorButtons.Length; i++)
            {
                var outline = _colorButtons[i].GetComponent<Outline>();
                if (outline != null)
                    outline.enabled = (i == index);
            }
        }

        private void OnWidthChanged(float value)
        {
            #if NORMCORE_AVAILABLE
            if (_brush != null)
                _brush.SetBrushWidth(value);
            #endif
        }
    }
}
```

---

## File Structure Summary

```
MetavidoVFX-main/
├── Assets/
│   ├── Scripts/
│   │   └── Normcore/
│   │       ├── ARBrush.cs                    # Main brush controller
│   │       ├── NormcoreBrushStroke.cs        # Synced stroke component
│   │       ├── NormcoreBrushStrokeModel.cs   # RealtimeModel for stroke
│   │       ├── NormcoreBrushStrokeMesh.cs    # Ribbon mesh generation
│   │       ├── NormcoreConnectionUI.cs       # Connection status UI
│   │       ├── VoiceChatManager.cs           # Voice chat wrapper
│   │       ├── BrushSettingsUI.cs            # Color/width UI
│   │       └── Tests/
│   │           └── StrokeSyncTest.cs
│   ├── Scenes/
│   │   └── Spec010_NormcoreARDrawing.unity
│   ├── Resources/
│   │   ├── NormcoreAppSettings.asset         # App key (gitignored)
│   │   └── NormcoreBrushStroke.prefab
│   └── Prefabs/
│       └── Normcore/
│           └── ARDrawingRig.prefab
└── Packages/
    └── manifest.json                          # + Normcore registry
```

---

## Testing Checklist

### Sprint 0 Tests

- [ ] Normcore SDK compiles without errors
- [ ] `NORMCORE_AVAILABLE` define is active
- [ ] Scene loads without errors

### Sprint 1 Tests

- [ ] Room connection in <5 seconds
- [ ] Touch draws locally (single device)
- [ ] Two devices connect to same room
- [ ] Client IDs are unique

### Sprint 2 Tests

- [ ] Device A stroke appears on Device B in <100ms
- [ ] Device B stroke appears on Device A
- [ ] Late joiner receives all existing strokes
- [ ] Stroke colors sync correctly
- [ ] Stroke widths sync correctly

### Sprint 3 Tests

- [ ] Microphone permission requested on iOS
- [ ] Voice transmits between devices
- [ ] Mute toggle works
- [ ] Voice latency <200ms
- [ ] 30+ FPS on iPhone 12

---

## Risk Mitigation

| Risk                                 | Mitigation                                              |
| ------------------------------------ | ------------------------------------------------------- |
| Normcore SDK license/pricing changes | Document fallback to Photon Fusion                      |
| AR Spectator package incompatible    | Build AR prefabs from scratch using existing components |
| Voice quality issues                 | Provide toggle to disable voice                         |
| High latency on cellular             | Add visual indicator + graceful degradation             |
| Battery drain concerns               | Add FPS limiter option (30/60 FPS toggle)               |

---

## Dependencies

| Package                   | Version  | Status       |
| ------------------------- | -------- | ------------ |
| com.normalvr.normcore     | 2.9.0+   | To Add       |
| com.unity.xr.arfoundation | 6.2.1    | ✅ Installed |
| com.unity.xr.arkit        | 6.2.1    | ✅ Installed |
| TextMeshPro               | Built-in | ✅ Installed |

---

## Next Steps

1. **Immediate**: Add Normcore SDK to manifest.json
2. **Sprint 0**: Create scene and prefabs
3. **Sprint 1**: Implement ARBrush.cs and test connection
4. **Sprint 2**: Verify stroke sync
5. **Sprint 3**: Add voice chat and polish

---

_Plan created by Claude Architect on 2026-02-11_
_Reference: Spec 010-normcore-multiuser_
