// XRRAISceneTests - EditMode tests for scene serialization (spec-016 T5.1)
// Tests JSON round-trip, data integrity, version compatibility

#if UNITY_EDITOR
using NUnit.Framework;
using UnityEngine;
using XRRAI.Scene;
using System.Collections.Generic;

namespace MetavidoVFX.Editor.Tests
{
    [TestFixture]
    public class XRRAISceneTests
    {
        #region Round-Trip Serialization Tests

        [Test]
        public void XRRAIScene_JsonRoundTrip_PreservesVersion()
        {
            var scene = new XRRAIScene();
            scene.xrrai = "1.0";

            string json = JsonUtility.ToJson(scene);
            var restored = JsonUtility.FromJson<XRRAIScene>(json);

            Assert.AreEqual("1.0", restored.xrrai);
        }

        [Test]
        public void XRRAIScene_JsonRoundTrip_PreservesMetadata()
        {
            var scene = new XRRAIScene();
            scene.scene.name = "Test Scene";
            scene.scene.description = "A test description";
            scene.scene.tags.Add("test");
            scene.scene.tags.Add("xrrai");

            string json = JsonUtility.ToJson(scene);
            var restored = JsonUtility.FromJson<XRRAIScene>(json);

            Assert.AreEqual("Test Scene", restored.scene.name);
            Assert.AreEqual("A test description", restored.scene.description);
            Assert.AreEqual(2, restored.scene.tags.Count);
            Assert.Contains("test", restored.scene.tags);
        }

        [Test]
        public void XRRAIScene_JsonRoundTrip_PreservesStrokes()
        {
            var scene = new XRRAIScene();

            var stroke = new XRRAIStrokeData
            {
                id = "stroke_test123456",
                brushId = "brush_flat",
                size = 0.05f
            };
            stroke.SetColor(new Color(1f, 0f, 0f, 1f));
            stroke.points.Add(new StrokePoint(Vector3.zero, Quaternion.identity, 1f, 0));
            stroke.points.Add(new StrokePoint(Vector3.one, Quaternion.identity, 0.8f, 100));

            scene.strokes.Add(stroke);

            string json = JsonUtility.ToJson(scene);
            var restored = JsonUtility.FromJson<XRRAIScene>(json);

            Assert.AreEqual(1, restored.strokes.Count);
            Assert.AreEqual("stroke_test123456", restored.strokes[0].id);
            Assert.AreEqual(2, restored.strokes[0].points.Count);
            Assert.AreEqual(0.05f, restored.strokes[0].size, 0.001f);
        }

        [Test]
        public void XRRAIScene_JsonRoundTrip_PreservesAnchors()
        {
            var scene = new XRRAIScene();

            var anchor = new AnchorData
            {
                id = "anchor_floor001",
                type = "plane",
                classification = "floor",
                confidence = 0.95f,
                persistent = true
            };
            anchor.position = new[] { 1f, 0f, 2f };
            anchor.rotation = new[] { 0f, 0f, 0f, 1f };

            scene.anchors.Add(anchor);

            string json = JsonUtility.ToJson(scene);
            var restored = JsonUtility.FromJson<XRRAIScene>(json);

            Assert.AreEqual(1, restored.anchors.Count);
            Assert.AreEqual("floor", restored.anchors[0].classification);
            Assert.AreEqual(0.95f, restored.anchors[0].confidence, 0.001f);
            Assert.AreEqual(1f, restored.anchors[0].position[0], 0.001f);
        }

        #endregion

        #region Transform Data Tests

        [Test]
        public void TransformData_FromTransform_ExtractsCorrectValues()
        {
            var go = new GameObject("TestTransform");
            go.transform.localPosition = new Vector3(1f, 2f, 3f);
            go.transform.localRotation = Quaternion.Euler(45f, 90f, 0f);
            go.transform.localScale = new Vector3(2f, 2f, 2f);

            var data = TransformData.FromTransform(go.transform);

            Assert.AreEqual(1f, data.position[0], 0.001f);
            Assert.AreEqual(2f, data.position[1], 0.001f);
            Assert.AreEqual(3f, data.position[2], 0.001f);
            Assert.AreEqual(2f, data.scale[0], 0.001f);

            Object.DestroyImmediate(go);
        }

        [Test]
        public void TransformData_ApplyToTransform_SetsCorrectValues()
        {
            var data = new TransformData
            {
                position = new[] { 5f, 10f, 15f },
                rotation = new[] { 0f, 0f, 0f, 1f },
                scale = new[] { 3f, 3f, 3f }
            };

            var go = new GameObject("TestTransform");
            data.ApplyToTransform(go.transform);

            Assert.AreEqual(5f, go.transform.localPosition.x, 0.001f);
            Assert.AreEqual(10f, go.transform.localPosition.y, 0.001f);
            Assert.AreEqual(15f, go.transform.localPosition.z, 0.001f);
            Assert.AreEqual(3f, go.transform.localScale.x, 0.001f);

            Object.DestroyImmediate(go);
        }

        #endregion

        #region Bounds Data Tests

        [Test]
        public void BoundsData_FromUnityBounds_ConvertsCorrectly()
        {
            var unityBounds = new Bounds(new Vector3(0, 1, 0), new Vector3(10, 5, 10));

            var data = BoundsData.FromUnityBounds(unityBounds);

            Assert.AreEqual(-5f, data.min[0], 0.001f); // center.x - size.x/2
            Assert.AreEqual(-1.5f, data.min[1], 0.001f); // center.y - size.y/2
            Assert.AreEqual(5f, data.max[0], 0.001f);
        }

        [Test]
        public void BoundsData_ToUnityBounds_ConvertsCorrectly()
        {
            var data = new BoundsData
            {
                min = new[] { -5f, 0f, -5f },
                max = new[] { 5f, 3f, 5f }
            };

            var bounds = data.ToUnityBounds();

            Assert.AreEqual(0f, bounds.center.x, 0.001f);
            Assert.AreEqual(1.5f, bounds.center.y, 0.001f);
            Assert.AreEqual(10f, bounds.size.x, 0.001f);
            Assert.AreEqual(3f, bounds.size.y, 0.001f);
        }

        #endregion

        #region ID Generation Tests

        [Test]
        public void SceneNode_GenerateId_IsUnique()
        {
            var id1 = SceneNode.GenerateId();
            var id2 = SceneNode.GenerateId();

            Assert.AreNotEqual(id1, id2);
            Assert.IsTrue(id1.StartsWith("node_"));
            Assert.AreEqual(16, id1.Length);
        }

        [Test]
        public void XRRAIStrokeData_GenerateId_HasCorrectPrefix()
        {
            var id = XRRAIStrokeData.GenerateId();

            Assert.IsTrue(id.StartsWith("stroke_"));
        }

        [Test]
        public void AnchorData_GenerateId_HasCorrectPrefix()
        {
            var id = AnchorData.GenerateId();

            Assert.IsTrue(id.StartsWith("anchor_"));
        }

        #endregion

        #region StrokePoint Tests

        [Test]
        public void StrokePoint_Constructor_SetsAllValues()
        {
            var point = new StrokePoint(
                new Vector3(1f, 2f, 3f),
                Quaternion.Euler(45f, 0f, 0f),
                0.75f,
                1234
            );

            Assert.AreEqual(1f, point.Position.x, 0.001f);
            Assert.AreEqual(2f, point.Position.y, 0.001f);
            Assert.AreEqual(3f, point.Position.z, 0.001f);
            Assert.AreEqual(0.75f, point.Pressure, 0.001f);
            Assert.AreEqual(1234, point.Timestamp);
        }

        [Test]
        public void StrokePoint_JsonRoundTrip_PreservesValues()
        {
            var original = new StrokePoint(Vector3.one, Quaternion.identity, 0.5f, 500);

            string json = JsonUtility.ToJson(original);
            var restored = JsonUtility.FromJson<StrokePoint>(json);

            Assert.AreEqual(original.Position, restored.Position);
            Assert.AreEqual(original.Pressure, restored.Pressure, 0.001f);
            Assert.AreEqual(original.Timestamp, restored.Timestamp);
        }

        #endregion

        #region Color Tests

        [Test]
        public void XRRAIStrokeData_SetColor_StoresRGBA()
        {
            var stroke = new XRRAIStrokeData();
            stroke.SetColor(new Color(0.5f, 0.25f, 0.75f, 0.9f));

            Assert.AreEqual(0.5f, stroke.color[0], 0.001f);
            Assert.AreEqual(0.25f, stroke.color[1], 0.001f);
            Assert.AreEqual(0.75f, stroke.color[2], 0.001f);
            Assert.AreEqual(0.9f, stroke.color[3], 0.001f);
        }

        [Test]
        public void XRRAIStrokeData_GetUnityColor_ReturnsCorrectColor()
        {
            var stroke = new XRRAIStrokeData
            {
                color = new[] { 1f, 0f, 0.5f, 1f }
            };

            var color = stroke.GetUnityColor();

            Assert.AreEqual(1f, color.r, 0.001f);
            Assert.AreEqual(0f, color.g, 0.001f);
            Assert.AreEqual(0.5f, color.b, 0.001f);
        }

        #endregion

        #region Hologram Data Tests

        [Test]
        public void HologramData_DefaultType_IsLive()
        {
            var hologram = new HologramData();

            Assert.AreEqual("live", hologram.type);
        }

        [Test]
        public void HologramData_DefaultQuality_IsMedium()
        {
            var hologram = new HologramData();

            Assert.AreEqual("medium", hologram.quality);
        }

        #endregion

        #region Layer Tests

        [Test]
        public void LayerData_DefaultValues_AreCorrect()
        {
            var layer = new LayerData();

            Assert.AreEqual("Layer 1", layer.name);
            Assert.IsTrue(layer.visible);
            Assert.IsFalse(layer.locked);
        }

        #endregion

        #region Version Compatibility Tests

        [Test]
        public void XRRAIScene_DefaultVersion_Is1_0()
        {
            var scene = new XRRAIScene();

            Assert.AreEqual("1.0", scene.xrrai);
        }

        [Test]
        public void XRRAIScene_DefaultGenerator_IsMetavidoVFX()
        {
            var scene = new XRRAIScene();

            Assert.AreEqual("MetavidoVFX/XRRAI", scene.generator);
        }

        [Test]
        public void XRRAIScene_Created_IsSetOnConstruction()
        {
            var scene = new XRRAIScene();

            Assert.IsNotNull(scene.created);
            Assert.IsNotEmpty(scene.created);
        }

        [Test]
        public void XRRAIScene_MarkModified_UpdatesTimestamp()
        {
            var scene = new XRRAIScene();
            string originalModified = scene.modified;

            System.Threading.Thread.Sleep(10); // Ensure time difference
            scene.MarkModified();

            Assert.AreNotEqual(originalModified, scene.modified);
        }

        #endregion
    }
}
#endif
