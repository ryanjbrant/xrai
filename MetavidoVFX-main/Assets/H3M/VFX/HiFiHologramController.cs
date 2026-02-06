// HiFiHologramController.cs - Quality controller for hologram VFX
// SIMPLIFIED: VFXARBinder handles all data binding (ColorMap, DepthMap, etc.)
// This controller ONLY handles quality presets and appearance tuning.
//
// Required: VisualEffect + VFXARBinder (handles all texture/matrix binding)
// This script: ParticleCount, ParticleSize, ColorSaturation, auto-quality

using UnityEngine;
using UnityEngine.VFX;
using XRRAI.VFXBinders;

namespace XRRAI.Hologram
{
    /// <summary>
    /// Quality presets for hologram rendering.
    /// Higher quality = more particles, slower performance.
    /// </summary>
    public enum HologramQuality
    {
        /// <summary>10K particles, 5mm size - Mobile/stress testing</summary>
        Low,
        /// <summary>50K particles, 3mm size - Balanced</summary>
        Medium,
        /// <summary>100K particles, 2mm size - High quality</summary>
        High,
        /// <summary>200K particles, 1.5mm size - Maximum fidelity (Quest 3/PC)</summary>
        Ultra
    }

    /// <summary>
    /// Quality controller for HiFi hologram VFX.
    /// NOTE: VFXARBinder handles all data binding (ColorMap, DepthMap, StencilMap, etc.)
    /// This controller ONLY manages: ParticleCount, ParticleSize, ColorSaturation, auto-quality.
    /// </summary>
    [RequireComponent(typeof(VisualEffect))]
    public class HiFiHologramController : MonoBehaviour
    {
        #region Serialized Fields

        [Header("Quality Settings")]
        [SerializeField] private HologramQuality _quality = HologramQuality.High;
        [SerializeField] private bool _autoAdjustQuality = true;
        [SerializeField] private int _targetFPS = 60;

        [Header("Appearance (Unique to HiFi)")]
        [SerializeField] private float _particleSizeMultiplier = 1f;
        [SerializeField] private float _colorSaturation = 1f;
        [SerializeField] private float _colorBrightness = 1f;
        [SerializeField] private bool _enableDepthFade = true;
        [SerializeField] private Vector2 _depthFadeRange = new Vector2(0.2f, 5f);
        [SerializeField] private float _velocityStrength = 0.1f;

        [Header("Debug")]
        [SerializeField] private bool _showDebugInfo = false;
        [SerializeField] private bool _verboseDebug = false;

        #endregion

        #region Private Fields

        private VisualEffect _vfx;
        private float _lastFPSCheck;
        private int _frameCount;
        private float _currentFPS;

        // Quality presets: (particleCount, particleSize in meters)
        private static readonly (int particles, float size)[] QualityPresets =
        {
            (10000, 0.005f),    // Low
            (50000, 0.003f),    // Medium
            (100000, 0.002f),   // High
            (200000, 0.0015f)   // Ultra
        };

        // VFX property IDs (ONLY quality/appearance - NO textures/matrices)
        // NOTE: Not all VFX expose all properties - controller uses fallbacks
        private static class PropertyID
        {
            // Ideal properties (future VFX should expose these)
            public static readonly int ParticleCount = Shader.PropertyToID("ParticleCount");
            public static readonly int ParticleSize = Shader.PropertyToID("ParticleSize");
            public static readonly int ColorSaturation = Shader.PropertyToID("ColorSaturation");
            public static readonly int ColorBrightness = Shader.PropertyToID("ColorBrightness");
            public static readonly int DepthFadeNear = Shader.PropertyToID("DepthFadeNear");
            public static readonly int DepthFadeFar = Shader.PropertyToID("DepthFadeFar");
            public static readonly int VelocityStrength = Shader.PropertyToID("VelocityStrength");

            // Fallback properties (what current HiFi VFX actually expose)
            // hifi_hologram_people.vfx: Spawn, DepthRange
            // hifi_hologram_pointcloud.vfx: Throttle, Ripple, HueShift
            // hifi_hologram_optimized.vfx: Alpha
            public static readonly int Throttle = Shader.PropertyToID("Throttle");
            public static readonly int Alpha = Shader.PropertyToID("Alpha");
            public static readonly int Spawn = Shader.PropertyToID("Spawn");
            public static readonly int HueShift = Shader.PropertyToID("HueShift");
            public static readonly int Ripple = Shader.PropertyToID("Ripple");
            public static readonly int DepthRange = Shader.PropertyToID("DepthRange");
            public static readonly int Brightness = Shader.PropertyToID("Brightness"); // Alias
        }

        // Binding status (detected once in Start)
        private bool _hasIdealProperties;
        private bool _hasFallbackProperties;

        #endregion

        #region Properties

        public HologramQuality Quality
        {
            get => _quality;
            set
            {
                _quality = value;
                ApplyQualitySettings();
            }
        }

        public float CurrentFPS => _currentFPS;
        public float ColorSaturation { get => _colorSaturation; set { _colorSaturation = value; ApplyAppearanceSettings(); } }
        public float ColorBrightness { get => _colorBrightness; set { _colorBrightness = value; ApplyAppearanceSettings(); } }

        #endregion

        #region MonoBehaviour

        private void Awake()
        {
            _vfx = GetComponent<VisualEffect>();
        }

        private void Start()
        {
            DetectAvailableProperties();
            ApplyQualitySettings();
            ApplyAppearanceSettings();
        }

        private void DetectAvailableProperties()
        {
            if (_vfx == null || _vfx.visualEffectAsset == null) return;

            // Check for ideal properties
            _hasIdealProperties = _vfx.HasUInt(PropertyID.ParticleCount) ||
                                  _vfx.HasFloat(PropertyID.ParticleSize) ||
                                  _vfx.HasFloat(PropertyID.ColorSaturation);

            // Check for fallback properties
            _hasFallbackProperties = _vfx.HasFloat(PropertyID.Throttle) ||
                                     _vfx.HasFloat(PropertyID.Alpha) ||
                                     _vfx.HasBool(PropertyID.Spawn) ||
                                     _vfx.HasFloat(PropertyID.HueShift);

            string vfxName = _vfx.visualEffectAsset.name;

            if (_hasIdealProperties)
            {
                Debug.Log($"[HiFiHologram] {vfxName}: Ideal properties detected - full quality control available");
            }
            else if (_hasFallbackProperties)
            {
                Debug.Log($"[HiFiHologram] {vfxName}: Using fallback properties (Throttle/Alpha/Spawn/HueShift)");
                Debug.Log($"[HiFiHologram] For full control, add ParticleCount (UInt), ParticleSize (Float), ColorSaturation (Float) to VFX Blackboard");
            }
            else
            {
                Debug.LogWarning($"[HiFiHologram] {vfxName}: No controllable properties found! VFX will render but quality adjustment disabled.");
            }
        }

        private void Update()
        {
            if (_autoAdjustQuality)
                TrackFPS();

            // Verbose debug logging every 60 frames
            if (_verboseDebug && Time.frameCount % 60 == 0)
            {
                var binder = GetComponent<VFXARBinder>();
                Debug.Log($"[HiFiHologram] {gameObject.name} Frame:{Time.frameCount} - Quality:{_quality}, FPS:{_currentFPS:F0}, AutoQuality:{_autoAdjustQuality}");
                Debug.Log($"[HiFiHologram] Appearance - Saturation:{_colorSaturation:F2}, Brightness:{_colorBrightness:F2}, DepthFade:{_enableDepthFade}");
                if (binder != null)
                    Debug.Log($"[HiFiHologram] VFXARBinder present - check its verbose debug for binding status");
                else
                    Debug.LogWarning($"[HiFiHologram] NO VFXARBinder found! Add VFXARBinder component for AR data.");
            }
        }

        #endregion

        #region Public API

        /// <summary>
        /// Force quality level change (bypasses auto-adjustment).
        /// </summary>
        public void ForceQuality(HologramQuality quality)
        {
            _autoAdjustQuality = false;
            Quality = quality;
        }

        /// <summary>
        /// Enable auto quality adjustment based on FPS.
        /// </summary>
        public void EnableAutoQuality(int targetFPS = 60)
        {
            _targetFPS = targetFPS;
            _autoAdjustQuality = true;
        }

        #endregion

        #region Quality Management

        private void ApplyQualitySettings()
        {
            if (_vfx == null) return;

            var (particleCount, particleSize) = QualityPresets[(int)_quality];
            bool anyPropertySet = false;

            // Try ideal properties first
            if (_vfx.HasUInt(PropertyID.ParticleCount))
            {
                _vfx.SetUInt(PropertyID.ParticleCount, (uint)particleCount);
                anyPropertySet = true;
            }

            if (_vfx.HasFloat(PropertyID.ParticleSize))
            {
                _vfx.SetFloat(PropertyID.ParticleSize, particleSize * _particleSizeMultiplier);
                anyPropertySet = true;
            }

            // Fallback: Map quality to Throttle (0.0-1.0)
            // Low=0.25, Medium=0.5, High=0.75, Ultra=1.0
            if (!anyPropertySet && _vfx.HasFloat(PropertyID.Throttle))
            {
                float throttle = ((int)_quality + 1) * 0.25f;
                _vfx.SetFloat(PropertyID.Throttle, throttle);
                anyPropertySet = true;
            }

            // Fallback: Map quality to Alpha (0.6-1.0)
            // Low=0.6, Medium=0.75, High=0.9, Ultra=1.0
            if (_vfx.HasFloat(PropertyID.Alpha))
            {
                float alpha = 0.6f + ((int)_quality * 0.133f);
                _vfx.SetFloat(PropertyID.Alpha, Mathf.Min(alpha, 1f));
                anyPropertySet = true;
            }

            // Fallback: Spawn boolean (false for Low, true otherwise)
            if (_vfx.HasBool(PropertyID.Spawn))
            {
                _vfx.SetBool(PropertyID.Spawn, _quality != HologramQuality.Low);
            }

            if (anyPropertySet || _hasIdealProperties || _hasFallbackProperties)
            {
                Debug.Log($"[HiFiHologram] Quality: {_quality} ({particleCount} particles target, {particleSize * 1000:F1}mm target)");
            }
        }

        private void ApplyAppearanceSettings()
        {
            if (_vfx == null) return;

            // Try ideal properties
            if (_vfx.HasFloat(PropertyID.ColorSaturation))
                _vfx.SetFloat(PropertyID.ColorSaturation, _colorSaturation);

            if (_vfx.HasFloat(PropertyID.ColorBrightness))
                _vfx.SetFloat(PropertyID.ColorBrightness, _colorBrightness);

            // Fallback: Map ColorBrightness to Brightness (alias used by some VFX)
            if (!_vfx.HasFloat(PropertyID.ColorBrightness) && _vfx.HasFloat(PropertyID.Brightness))
                _vfx.SetFloat(PropertyID.Brightness, _colorBrightness);

            // Fallback: Map ColorSaturation to HueShift (0 = neutral, negative = desaturated appearance)
            // This is a crude approximation - HueShift rotates hue, doesn't truly desaturate
            if (!_vfx.HasFloat(PropertyID.ColorSaturation) && _vfx.HasFloat(PropertyID.HueShift))
            {
                // Map saturation 0-1 to HueShift 0 (when saturation is 1, no shift needed)
                // Note: This is limited - true saturation control requires VFX modification
            }

            // Depth fade
            if (_enableDepthFade)
            {
                if (_vfx.HasFloat(PropertyID.DepthFadeNear))
                    _vfx.SetFloat(PropertyID.DepthFadeNear, _depthFadeRange.x);
                if (_vfx.HasFloat(PropertyID.DepthFadeFar))
                    _vfx.SetFloat(PropertyID.DepthFadeFar, _depthFadeRange.y);

                // Fallback: Use DepthRange (Vector2) if individual floats not available
                if (!_vfx.HasFloat(PropertyID.DepthFadeNear) && _vfx.HasVector2(PropertyID.DepthRange))
                    _vfx.SetVector2(PropertyID.DepthRange, _depthFadeRange);
            }

            if (_vfx.HasFloat(PropertyID.VelocityStrength))
                _vfx.SetFloat(PropertyID.VelocityStrength, _velocityStrength);

            // Fallback: Map VelocityStrength to Ripple (similar visual effect)
            if (!_vfx.HasFloat(PropertyID.VelocityStrength) && _vfx.HasFloat(PropertyID.Ripple))
                _vfx.SetFloat(PropertyID.Ripple, _velocityStrength);
        }

        private void TrackFPS()
        {
            _frameCount++;
            float elapsed = Time.time - _lastFPSCheck;

            if (elapsed >= 1f)
            {
                _currentFPS = _frameCount / elapsed;
                _frameCount = 0;
                _lastFPSCheck = Time.time;
                AdjustQualityIfNeeded();
            }
        }

        private void AdjustQualityIfNeeded()
        {
            if (_currentFPS < _targetFPS * 0.8f && _quality > HologramQuality.Low)
            {
                Quality = _quality - 1;
                Debug.Log($"[HiFiHologram] Reduced quality to {_quality} (FPS: {_currentFPS:F0})");
            }
            else if (_currentFPS > _targetFPS * 1.2f && _quality < HologramQuality.Ultra)
            {
                Quality = _quality + 1;
                Debug.Log($"[HiFiHologram] Increased quality to {_quality} (FPS: {_currentFPS:F0})");
            }
        }

        #endregion

        #region Debug

        private void OnGUI()
        {
            if (!_showDebugInfo) return;

            GUILayout.BeginArea(new Rect(Screen.width - 220, 10, 210, 130));
            GUILayout.BeginVertical("box");

            GUILayout.Label("HiFi Hologram (Quality Only)", GUI.skin.box);
            GUILayout.Label($"Quality: {_quality}");
            GUILayout.Label($"Particles: {QualityPresets[(int)_quality].particles:N0}");
            GUILayout.Label($"Size: {QualityPresets[(int)_quality].size * 1000:F2}mm");
            GUILayout.Label($"FPS: {_currentFPS:F0} | Auto: {(_autoAdjustQuality ? "On" : "Off")}");

            GUILayout.EndVertical();
            GUILayout.EndArea();
        }

        #endregion

        #region Editor

#if UNITY_EDITOR
        [ContextMenu("Apply High Quality")]
        private void ApplyHighQuality() => Quality = HologramQuality.High;

        [ContextMenu("Apply Ultra Quality")]
        private void ApplyUltraQuality() => Quality = HologramQuality.Ultra;

        [ContextMenu("Apply Low Quality")]
        private void ApplyLowQuality() => Quality = HologramQuality.Low;

        [ContextMenu("Toggle Debug Info")]
        private void ToggleDebugInfo() => _showDebugInfo = !_showDebugInfo;
#endif

        #endregion
    }
}
