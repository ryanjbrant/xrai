// VFXARBinderMinimal.cs - Minimal AR→VFX binder following keijiro's pattern
// For new VFX with standardized property names (no alias lookups)
//
// Use this for:
// - New HiFi hologram VFX
// - Simple VFX requiring only DepthMap + ColorMap + camera matrices
//
// Use VFXARBinder for:
// - Legacy VFX with non-standard property names
// - VFX requiring extended bindings (audio, hand tracking, etc.)

using UnityEngine;
using UnityEngine.VFX;

namespace XRRAI.VFXBinders
{
    /// <summary>
    /// Minimal AR→VFX binder: 5 core properties, no aliases, no auto-detection.
    /// Property names must match exactly: DepthMap, PositionMap, ColorMap, RayParams, InverseView.
    /// </summary>
    [RequireComponent(typeof(VisualEffect))]
    public class VFXARBinderMinimal : MonoBehaviour
    {
        // Property IDs (computed once)
        static readonly int s_DepthMap = Shader.PropertyToID("DepthMap");
        static readonly int s_PositionMap = Shader.PropertyToID("PositionMap");
        static readonly int s_ColorMap = Shader.PropertyToID("ColorMap");
        static readonly int s_RayParams = Shader.PropertyToID("RayParams");
        static readonly int s_InverseView = Shader.PropertyToID("InverseView");
        static readonly int s_DepthRange = Shader.PropertyToID("DepthRange");

        VisualEffect _vfx;
        ARDepthSource _source;

        // Which properties does this VFX have?
        bool _hasDepth, _hasPosition, _hasColor, _hasRayParams, _hasInvView, _hasDepthRange;

        [Header("Settings")]
        [Tooltip("Enable verbose logging for debugging")]
        [SerializeField] bool _verboseDebug;

        [Tooltip("Depth range (near, far) in meters")]
        [SerializeField] Vector2 _depthRange = new Vector2(0.1f, 10f);

        void Awake()
        {
            _vfx = GetComponent<VisualEffect>();
        }

        void OnEnable()
        {
            DetectProperties();
        }

        void DetectProperties()
        {
            if (_vfx == null) _vfx = GetComponent<VisualEffect>();
            if (_vfx.visualEffectAsset == null) return;

            _hasDepth = _vfx.HasTexture(s_DepthMap);
            _hasPosition = _vfx.HasTexture(s_PositionMap);
            _hasColor = _vfx.HasTexture(s_ColorMap);
            _hasRayParams = _vfx.HasVector4(s_RayParams);
            _hasInvView = _vfx.HasMatrix4x4(s_InverseView);
            _hasDepthRange = _vfx.HasVector2(s_DepthRange);

            if (_verboseDebug)
            {
                Debug.Log($"[VFXARBinderMinimal] {_vfx.name} properties: " +
                    $"DepthMap={_hasDepth}, PositionMap={_hasPosition}, ColorMap={_hasColor}, " +
                    $"RayParams={_hasRayParams}, InverseView={_hasInvView}, DepthRange={_hasDepthRange}");
            }

            // Request ColorMap if needed
            if (_hasColor && _source != null)
                _source.RequestColorMap(true);
        }

        void LateUpdate()
        {
            // Lazy-load source
            if (_source == null)
            {
                _source = ARDepthSource.Instance;
                if (_source == null) return;

                // Request ColorMap now that we have source
                if (_hasColor) _source.RequestColorMap(true);
            }

            if (_vfx == null) return;

            // Bind textures (null-safe)
            if (_hasDepth && _source.DepthMap != null)
                _vfx.SetTexture(s_DepthMap, _source.DepthMap);

            if (_hasPosition && _source.PositionMap != null)
                _vfx.SetTexture(s_PositionMap, _source.PositionMap);

            if (_hasColor && _source.ColorMap != null)
                _vfx.SetTexture(s_ColorMap, _source.ColorMap);

            // Bind camera matrices
            if (_hasRayParams)
                _vfx.SetVector4(s_RayParams, _source.RayParams);

            if (_hasInvView)
                _vfx.SetMatrix4x4(s_InverseView, _source.InverseView);

            if (_hasDepthRange)
                _vfx.SetVector2(s_DepthRange, _depthRange);
        }

        void OnDisable()
        {
            if (_hasColor && _source != null)
                _source.RequestColorMap(false);
        }

        // Public API
        public void SetDepthRange(Vector2 range) => _depthRange = range;
        public void SetDepthRange(float near, float far) => _depthRange = new Vector2(near, far);

        /// <summary>
        /// Binding status for debugging
        /// </summary>
        public string GetBindingStatus()
        {
            return $"DepthMap={_hasDepth && _source?.DepthMap != null}, " +
                   $"PositionMap={_hasPosition && _source?.PositionMap != null}, " +
                   $"ColorMap={_hasColor && _source?.ColorMap != null}";
        }

        [ContextMenu("Debug Binding Status")]
        void DebugStatus()
        {
            Debug.Log($"[VFXARBinderMinimal] {name}: {GetBindingStatus()}");
        }
    }
}
