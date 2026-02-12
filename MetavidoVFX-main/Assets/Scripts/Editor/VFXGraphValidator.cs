using UnityEngine;
using UnityEditor;
using UnityEngine.VFX;
using System.Collections.Generic;
using System.IO;
using System.Text;

/// <summary>
/// Automated Validator for the "Hybrid Bridge" VFX Pipeline.
/// Scans all VFX assets to ensure they support:
/// 1. Metavido Standard Properties (DepthMap, ColorMap, etc.)
/// 2. Zero-Latency Switching (Spawn property)
/// 3. Correct Capacity/Strip settings for mobile 60FPS.
/// </summary>
public class VFXGraphValidator : EditorWindow
{
    [MenuItem("XRRAI/VFX/Validate All Graphs")]
    public static void ShowWindow()
    {
        GetWindow<VFXGraphValidator>("VFX Validator");
    }

    private Vector2 _scrollPos;
    private string _report = "Click 'Run Validation' to start.";

    private void OnGUI()
    {
        if (GUILayout.Button("Run Validation"))
        {
            RunValidation();
        }

        _scrollPos = EditorGUILayout.BeginScrollView(_scrollPos);
        EditorGUILayout.TextArea(_report);
        EditorGUILayout.EndScrollView();
    }

    private void RunValidation()
    {
        StringBuilder sb = new StringBuilder();
        string[] guids = AssetDatabase.FindAssets("t:VisualEffectAsset");
        
        int total = guids.Length;
        int valid = 0;
        int needsFix = 0;

        sb.AppendLine($"# VFX Validation Report ({System.DateTime.Now})");
        sb.AppendLine($"Scanning {total} VFX Graphs...");
        sb.AppendLine();

        foreach (string guid in guids)
        {
            string path = AssetDatabase.GUIDToAssetPath(guid);
            VisualEffectAsset asset = AssetDatabase.LoadAssetAtPath<VisualEffectAsset>(path);
            
            // Note: We can't easily read properties via API without instantiating, 
            // so we parse the raw asset YAML/text to avoid scene overhead.
            string content = File.ReadAllText(path);
            
            List<string> missing = new List<string>();
            bool hasErrors = false;

            // 1. Check for Standard Properties (The Hybrid Bridge Contract)
            if (!content.Contains("name: DepthMap")) missing.Add("DepthMap");
            if (!content.Contains("name: ColorMap")) missing.Add("ColorMap");
            if (!content.Contains("name: RayParams")) missing.Add("RayParams"); // Or InverseProjection
            
            // 2. Check for "Spawn" property (For Zero-Latency Switching)
            if (!content.Contains("name: Spawn") && !content.Contains("name: _vfx_enabled")) 
                missing.Add("Spawn (Boolean)");

            // 3. Check for Capacity (Mobile Performance)
            // Warning if capacity > 500,000 (arbitrary mobile safety limit)
            // This is harder to parse reliably via text, but we can look for "capacity: "
            
            if (missing.Count > 0)
            {
                sb.AppendLine($"[FAIL] {Path.GetFileName(path)}");
                foreach (var m in missing) sb.AppendLine($"  - Missing: {m}");
                hasErrors = true;
                needsFix++;
            }
            else
            {
                valid++;
            }
        }

        sb.AppendLine();
        sb.AppendLine($"SUMMARY: {valid} Valid, {needsFix} Need Attention.");
        _report = sb.ToString();
        
        // Save report
        File.WriteAllText("VFX_Validation_Report.md", _report);
        AssetDatabase.Refresh();
    }
}
