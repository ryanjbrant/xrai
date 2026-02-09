# Figment AR Screen

AR scene composer with 3D models, portals, and effects. Ported from the original [ViroReact Figment AR](https://github.com/viromedia/figment-ar) sample app.

## Architecture

```
FigmentAR/
├── app.js                 # Main component with UI and Redux dispatch
├── figment.js             # ViroARScene with model/portal/effect rendering
├── component/
│   ├── ModelItemRender.js # Renders individual 3D models
│   ├── PortalItemRender.js # Renders individual portals
│   ├── EffectItemRender.js # Renders effects (particles, post-processing)
│   ├── FigmentListView.js # Bottom item picker list
│   └── ListViewItem.js    # Individual list items
├── model/
│   ├── ModelItems.js      # 3D model data definitions
│   └── PortalItems.js     # Portal data definitions
├── redux/
│   ├── actions/index.js   # Redux action creators
│   └── reducers/arobjects.js # Redux reducer for AR objects
└── res/                   # 3D assets, textures, icons
```

---

## Core Flows

### Adding an Object

```
User taps model icon in list
    ↓
FigmentListView._onListItemPressed(index)
    ↓
app.js._onListPressed(index)
    ↓
dispatchAddModel(index) or dispatchAddPortal(index)
    ↓
Redux adds item to modelItems/portalItems with new UUID
    ↓
figment.js._renderModels() / _renderPortals()
    ↓
ModelItemRender / PortalItemRender created
    ↓
componentDidMount → forceUpdate after 100ms
    ↓
Viro3DObject/ViroPortalScene loads
    ↓
onLoadEnd triggers
    ↓
_onARHitTestResults positions object
    ↓
Object visible in AR
```

### Removing an Object

```
User taps trash button
    ↓
app.js._onContextMenuRemoveButtonPressed()
    ↓
dispatchChangeItemClickState(-1, '', '') // Clears selection immediately
    ↓
TimerMixin.setTimeout 200ms
    ↓
dispatchRemoveModelWithUUID(uuid) or dispatchRemovePortalWithUUID(uuid)
    ↓
Redux sets hidden:true (NOT delete)
    ↓
figment.js passes isHidden={true} to component
    ↓
Component renders with visible={false}
    ↓
Object hidden (NOT unmounted - prevents crash)
```

---

## Debugging Tips

### Model Not Appearing
1. Check console for `[ModelItemRender] render - UUID:` logs
2. Verify `nodeIsVisible: true` in initial state
3. Check if `forceUpdate` is in `componentDidMount`
4. Look for errors in `onLoadStart`/`onLoadEnd` callbacks

### Crash on Delete
1. Check if using `hidden: true` pattern (not `delete`)
2. Verify `isHidden` prop is passed in `figment.js`
3. Check `_isMounted` guards on all async callbacks
4. Look for ViroSpotLight that should be commented out

### Items Duplicating
1. Check UUID generation is using `uuidv4()` correctly
2. Verify `key={item.uuid}` is set on components
3. Check Redux reducer for proper immutable updates

---

## Dependencies

- `@reactvision/react-viro` - AR/VR components (NOT original `react-viro`)
- `react-redux` - State management
- `react-native-video` - Video playback in portals
- `react-native-share` - Share functionality
- `uuid` - UUID generation for object IDs

---

## Testing Checklist

After making changes, verify:

- [ ] Tap model icon → model appears immediately (not on second tap)
- [ ] Tap portal icon → portal appears immediately
- [ ] Tap trash icon → object disappears (no crash)
- [ ] Tap "Remove All Objects" → all objects removed (no crash)
- [ ] Add multiple items → all visible and interactive
- [ ] Walk through portal → 360 image/video visible inside
- [ ] Rapid tapping → no crashes, no duplicates

---

## Restoration Instructions

If something breaks, compare with: `_ref/figment-ar/js/`

### To restore object removal:
1. Revert `redux/reducers/arobjects.js` to use `hidden: true` pattern
2. Ensure `figment.js` passes `isHidden` prop
3. Ensure render components check `isHidden` in visibility

### To restore first-tap visibility:
1. Add `forceUpdate()` in `componentDidMount` for both render components
2. Set `nodeIsVisible: true` in `getInitialState()`

### To restore safe async:
1. Add `_isMounted` flag in `componentDidMount` / `componentWillUnmount`
2. Guard ALL `setState` calls with `if (this._isMounted)`
3. Guard ALL `setNativeProps` calls with `if (this.arNodeRef)`

---

## Animation System

> **CRITICAL:** ViroReact's native `animation` prop causes crashes on `Viro3DObject`. This codebase uses a **JS-driven animation loop** with `setNativeProps` instead.

### Architecture

```
User toggles animation in ObjectPropertiesPanel
        ↓
app.js._onUpdateObjectAnimation(type, params, active)
        ↓
dispatch(updateObjectAnimation(uuid, type, animData))
        ↓
Redux arobjects.objectAnimations updated
        ↓
figment.js receives objectAnimations via selectProps
        ↓
ModelItemRender receives via props.objectAnimations
        ↓
componentDidUpdate calls _updateAnimationState()
        ↓
_startAnimationLoop() creates setInterval (30fps)
        ↓
_tickAnimation() calculates + applies transforms via setNativeProps
```

### Available Animation Types

| Type | Effect | Parameters |
|------|--------|------------|
| `bounce` | Vertical hop | `intensity` (height) |
| `pulse` | Scale throb | `intensity` (amount) |
| `rotate` | Continuous spin | `intensity` (speed), `axis` {x, y, z} |
| `scale` | Grow/shrink | `intensity` (amount) |
| `wiggle` | Z-axis wobble | `intensity` (angle) |
| `random` | Ocean wave drift | `intensity` (feel), `distance` (travel range) |

### Animation Data Structure

```javascript
// Redux state: arobjects.objectAnimations
{
  "model-uuid-1234": {
    "bounce": { active: true, intensity: 1.0 },
    "rotate": { active: true, intensity: 0.5, axis: { x: false, y: true, z: true } },
    "random": { active: false, intensity: 1.0, distance: 2.0 }
  }
}
```

### Layering Multiple Animations

Animations are **additive** - multiple can run simultaneously:

```javascript
// In _tickAnimation():
for (const animType of activeAnimTypes) {
  switch(animType) {
    case 'bounce':
      positionOffset[1] += bounceValue;  // Adds to Y
      break;
    case 'rotate':
      rotationOffset[1] += rotateValue;  // Adds to Y rotation
      break;
    case 'pulse':
      scaleMultiplier *= pulseValue;     // Multiplies scale
      break;
  }
}

// Final transform = base + all offsets combined
```

### The Random/Ocean Wave Animation

Uses **Lissajous curves** for organic, looping motion:

```javascript
// Different frequencies create complex but seamless loop
const xFreq = 2;  // 2 cycles per loop
const yFreq = 3;  // 3 cycles (creates figure-8)
const zFreq = 2;  // 2 cycles, phase-shifted

// Phase offsets create "pushed by waves" feeling
positionOffset[0] += sin(progress * 2π * xFreq) * amplitude;
positionOffset[1] += sin(progress * 2π * yFreq + π/4) * amplitude * 0.6;
positionOffset[2] += sin(progress * 2π * zFreq + π/2) * amplitude;
```

**Parameters:**
- `intensity` - Controls animation feel/speed
- `distance` - Controls travel range (0.5x to 3x)

### Key Implementation Files

| File | Role |
|------|------|
| `ModelItemRender.js` | JS animation loop: `_startAnimationLoop`, `_tickAnimation`, `_stopAnimationLoop` |
| `ObjectPropertiesPanel.js` | UI: dropdown selector, intensity/distance pills, axis toggles |
| `app.js` | Dispatcher: `_onUpdateObjectAnimation` |
| `redux/actions/index.js` | Action: `updateObjectAnimation(uuid, type, data)` |
| `redux/reducers/arobjects.js` | Reducer: `UPDATE_OBJECT_ANIMATION` case |

### Adding a New Animation Type

1. **Add to constant array** (`ObjectPropertiesPanel.js`):
   ```javascript
   const ANIMATION_TYPES = ['bounce', 'pulse', 'rotate', 'scale', 'wiggle', 'random', 'newType'];
   ```

2. **Implement transform logic** (`ModelItemRender.js` in `_tickAnimation`):
   ```javascript
   case 'newType':
     const myValue = calculateSomething(cycleProgress, intensity);
     positionOffset[0] += myValue;  // or rotationOffset or scaleMultiplier
     break;
   ```

3. **Set cycle duration** (`ModelItemRender.js` in `_getAnimationCycleDuration`):
   ```javascript
   case 'newType': return 1500; // milliseconds
   ```

4. **Add UI controls** (optional, in `ObjectPropertiesPanel.js`):
   ```javascript
   {type === 'newType' && (
     <View>{ /* custom controls */ }</View>
   )}
   ```

### Persistence

Animations are stored in Redux `arobjects.objectAnimations` but are **NOT yet serialized** with scene data. To add persistence:

1. Add `objectAnimations` to `FigmentSceneSerializer.js`
2. Restore in `arobjects.js` `LOAD_SCENE` case

---

## Version History

| Date | Change |
|------|--------|
| 2024-12-16 | Fixed object removal crash (hidden instead of delete) |
| 2024-12-16 | Fixed first-tap visibility (forceUpdate workaround) |
| 2024-12-16 | Fixed async crashes (_isMounted guards) |
| 2024-12-16 | Simplified Viro3DObject props |
| 2024-12-19 | Added JS-driven animation system (bypasses native crashes) |
| 2024-12-20 | Applied matte material workaround for IBL reflection rotation bug |
