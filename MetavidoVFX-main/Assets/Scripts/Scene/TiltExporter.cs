// TiltExporter.cs - Export XRRAI scenes to .tilt format (OpenBrush compatible)
// Part of Spec 016: XRRAI Scene Format & Cross-Platform Export
//
// .tilt format: 16-byte header + PKZIP archive containing:
// - metadata.json (scene info, brush definitions)
// - data.sketch (binary stroke data)
// - thumbnail.png (256x256 preview)

using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;

namespace XRRAI.Scene
{
    /// <summary>
    /// Exports XRRAI scenes to .tilt format for OpenBrush compatibility.
    /// </summary>
    public class TiltExporter : MonoBehaviour
    {
        // .tilt format constants
        private const string MAGIC = "tilT";
        private const int VERSION = 6; // Current .tilt version
        private const int HEADER_SIZE = 16;

        // Default brush GUIDs (from OpenBrush)
        private static readonly Dictionary<string, Guid> DefaultBrushGuids = new()
        {
            { "Light", new Guid("2d35bcf0-e4d8-452c-97b1-3311be063130") },
            { "Glow", new Guid("89d104cd-d012-426a-b35a-f929e7dc2a0e") },
            { "Fire", new Guid("cb92b597-94ca-4255-8a17-69e8f0a77e2e") },
            { "Smoke", new Guid("c8dc7eaa-9fc4-45b5-8e64-4a6fcc1e3476") },
            { "Flat", new Guid("2241cd32-8ba2-48a5-9ee7-2caef7e9ed62") },
            { "Marker", new Guid("429ed64a-4e97-4466-84d3-145a861ef684") },
            { "Ink", new Guid("f5c336cf-5108-4b40-aca9-c2c5ee5e36ba") },
            { "Oil", new Guid("f72ec0e7-a844-4e38-82e3-140c44772699") },
            { "Taffy", new Guid("d90c6ae1-6a0c-4db0-ab33-0cf3622cd4a1") },
            { "Wire", new Guid("f8e0a0ea-e6a4-4d15-ac9d-3a5f35f53a6e") }
        };

        /// <summary>
        /// Export scene to .tilt format
        /// </summary>
        public async Task<bool> ExportAsync(XRRAIScene scene, string filepath)
        {
            if (scene == null)
            {
                Debug.LogError("[TiltExporter] No scene to export");
                return false;
            }

            try
            {
                // Create temporary directory for archive contents
                var tempDir = Path.Combine(Application.temporaryCachePath, "tilt_export_" + Guid.NewGuid().ToString("N"));
                Directory.CreateDirectory(tempDir);

                try
                {
                    // Generate components
                    var metadata = GenerateMetadata(scene);
                    var sketchData = GenerateSketchData(scene);
                    var thumbnail = GenerateThumbnail();

                    // Write files to temp directory
                    File.WriteAllText(Path.Combine(tempDir, "metadata.json"), metadata);
                    File.WriteAllBytes(Path.Combine(tempDir, "data.sketch"), sketchData);
                    File.WriteAllBytes(Path.Combine(tempDir, "thumbnail.png"), thumbnail);

                    // Create .tilt file (header + zip)
                    await CreateTiltFileAsync(filepath, tempDir, scene.strokes.Count);

                    Debug.Log($"[TiltExporter] Exported {scene.strokes.Count} strokes to {filepath}");
                    return true;
                }
                finally
                {
                    // Cleanup temp directory
                    if (Directory.Exists(tempDir))
                        Directory.Delete(tempDir, true);
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"[TiltExporter] Export failed: {ex}");
                return false;
            }
        }

        /// <summary>
        /// Synchronous export wrapper
        /// </summary>
        public bool Export(XRRAIScene scene, string filepath)
        {
            return ExportAsync(scene, filepath).GetAwaiter().GetResult();
        }

        #region Metadata Generation

        string GenerateMetadata(XRRAIScene scene)
        {
            var sb = new StringBuilder();
            sb.AppendLine("{");
            sb.AppendLine($"  \"BrushIndex\": [");

            // Map brushes to GUIDs
            var brushGuids = new List<string>();
            foreach (var brush in scene.brushes)
            {
                var guid = GetBrushGuid(brush.name);
                brushGuids.Add($"    \"{guid}\"");
            }

            // Add default brush if no brushes defined
            if (brushGuids.Count == 0)
            {
                brushGuids.Add($"    \"{DefaultBrushGuids["Light"]}\"");
            }

            sb.AppendLine(string.Join(",\n", brushGuids));
            sb.AppendLine("  ],");

            // Environment settings
            sb.AppendLine("  \"Environment\": {");
            sb.AppendLine("    \"GradientColorA\": [0.1, 0.1, 0.15, 1.0],");
            sb.AppendLine("    \"GradientColorB\": [0.2, 0.2, 0.25, 1.0],");
            sb.AppendLine("    \"FogDensity\": 0.0");
            sb.AppendLine("  },");

            // Layers
            sb.AppendLine("  \"Layers\": [");
            foreach (var layer in scene.layers)
            {
                sb.AppendLine($"    {{ \"Name\": \"{layer.name}\", \"Visible\": {layer.visible.ToString().ToLower()} }}");
            }
            if (scene.layers.Count == 0)
            {
                sb.AppendLine("    { \"Name\": \"Main\", \"Visible\": true }");
            }
            sb.AppendLine("  ],");

            // Scene info
            sb.AppendLine($"  \"SceneTransformInRoomSpace\": [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1],");
            sb.AppendLine($"  \"ThumbnailCameraTransformInRoomSpace\": [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,1.5,-2,1],");
            sb.AppendLine($"  \"ModelVersion\": {VERSION}");

            sb.AppendLine("}");
            return sb.ToString();
        }

        Guid GetBrushGuid(string brushName)
        {
            // Try to match known brush names
            foreach (var kvp in DefaultBrushGuids)
            {
                if (brushName.Contains(kvp.Key, StringComparison.OrdinalIgnoreCase))
                    return kvp.Value;
            }

            // Default to Light brush
            return DefaultBrushGuids["Light"];
        }

        #endregion

        #region Sketch Data Generation

        byte[] GenerateSketchData(XRRAIScene scene)
        {
            using var ms = new MemoryStream();
            using var writer = new BinaryWriter(ms);

            // Write header
            writer.Write(VERSION); // version
            writer.Write(0); // reserved
            writer.Write(0); // additional header size (uint32)
            writer.Write(scene.strokes.Count); // num_strokes

            // Write each stroke
            int brushIndex = 0;
            foreach (var stroke in scene.strokes)
            {
                // Find brush index
                brushIndex = Math.Max(0, scene.brushes.FindIndex(b => b.id == stroke.brushId));

                WriteStroke(writer, stroke, brushIndex);
            }

            return ms.ToArray();
        }

        void WriteStroke(BinaryWriter writer, XRRAIStrokeData stroke, int brushIndex)
        {
            // Brush index
            writer.Write(brushIndex);

            // Brush color (RGBA float32x4)
            var color = stroke.GetUnityColor();
            writer.Write(color.r);
            writer.Write(color.g);
            writer.Write(color.b);
            writer.Write(color.a);

            // Brush size
            writer.Write(stroke.size);

            // Extension masks (simplified - no extensions)
            uint strokeExtMask = 0; // No stroke extensions
            uint cpExtMask = 0; // No control point extensions
            writer.Write(strokeExtMask);
            writer.Write(cpExtMask);

            // Number of control points
            writer.Write(stroke.points.Count);

            // Write control points
            foreach (var point in stroke.points)
            {
                // Position (float32x3)
                writer.Write(point.p.x);
                writer.Write(point.p.y);
                writer.Write(point.p.z);

                // Rotation (quaternion float32x4)
                writer.Write(point.r.x);
                writer.Write(point.r.y);
                writer.Write(point.r.z);
                writer.Write(point.r.w);
            }
        }

        #endregion

        #region Thumbnail Generation

        byte[] GenerateThumbnail()
        {
            // Generate simple 256x256 thumbnail
            // In production, render actual scene preview
            var texture = new Texture2D(256, 256, TextureFormat.RGBA32, false);

            // Simple gradient background
            for (int y = 0; y < 256; y++)
            {
                for (int x = 0; x < 256; x++)
                {
                    float t = y / 255f;
                    var color = Color.Lerp(
                        new Color(0.1f, 0.1f, 0.15f),
                        new Color(0.2f, 0.2f, 0.25f),
                        t
                    );
                    texture.SetPixel(x, y, color);
                }
            }

            // Add "XRRAI" text indicator (simple pattern)
            for (int i = 100; i < 156; i++)
            {
                texture.SetPixel(i, 128, Color.white);
                texture.SetPixel(128, i, Color.white);
            }

            texture.Apply();
            var png = texture.EncodeToPNG();
            DestroyImmediate(texture);

            return png;
        }

        #endregion

        #region File Creation

        async Task CreateTiltFileAsync(string filepath, string tempDir, int strokeCount)
        {
            await Task.Run(() =>
            {
                // Create intermediate zip
                var zipPath = filepath + ".zip";
                if (File.Exists(zipPath))
                    File.Delete(zipPath);

                ZipFile.CreateFromDirectory(tempDir, zipPath);

                // Read zip data
                var zipData = File.ReadAllBytes(zipPath);
                File.Delete(zipPath);

                // Create .tilt file with header
                using var fs = new FileStream(filepath, FileMode.Create);
                using var writer = new BinaryWriter(fs);

                // Write magic "tilT"
                writer.Write(Encoding.ASCII.GetBytes(MAGIC));

                // Write header (12 bytes)
                writer.Write(VERSION); // int32 version
                writer.Write(0); // int32 reserved
                writer.Write(0); // uint32 additional header size

                // Write zip archive
                writer.Write(zipData);
            });
        }

        #endregion
    }
}
