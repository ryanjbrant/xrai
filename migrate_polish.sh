#!/bin/bash

# Portals V4 Migration Script (Phase 1: VFX & Polish)
# Source: MetavidoVFX-main (Golden Master)
# Target: Portals V4 (Simulated)

SOURCE_DIR="MetavidoVFX-main"
TARGET_DIR="PortalsV4_Migration_Staging"

echo "🚀 Starting Portals V4 Polish Migration..."
mkdir -p "$TARGET_DIR"

# 1. Migrate Metawire (UI/Wireframe Visualization)
echo "📦 Migrating Metawire..."
mkdir -p "$TARGET_DIR/Packages/jp.keijiro.metawire"
# Note: In a real scenario, we would copy the package folder. 
# Here we flag it for manual copy from Library or Packages if it was local.
echo "   -> Flagged jp.keijiro.metawire for package import."

# 2. Migrate CameraProxy (Frustum & Context)
echo "📸 Migrating CameraProxy..."
mkdir -p "$TARGET_DIR/Assets/VFX/CameraProxy"
cp "$SOURCE_DIR/Assets/VFX/CameraProxy/"* "$TARGET_DIR/Assets/VFX/CameraProxy/"
echo "   -> Copied CameraProxy assets (VFX, ShaderGraph, Metawire)."

# 3. Migrate Stochastic Shader (Ghostly Transparency)
echo "👻 Migrating RcamBackground Shader..."
mkdir -p "$TARGET_DIR/Assets/Shaders/Rcam"
cp "$SOURCE_DIR/Assets/Shaders/Rcam/RcamBackground.shader" "$TARGET_DIR/Assets/Shaders/Rcam/"
cp "$SOURCE_DIR/Assets/Shaders/Rcam/RcamCommon.hlsl" "$TARGET_DIR/Assets/Shaders/Rcam/"
echo "   -> Copied RcamBackground.shader & RcamCommon.hlsl."

# 4. Migrate Flagship VFX (Fixed)
echo "✨ Migrating Flagship VFX..."
mkdir -p "$TARGET_DIR/Assets/VFX/People"
cp "$SOURCE_DIR/Assets/VFX/People/hifi_hologram_people.vfx" "$TARGET_DIR/Assets/VFX/People/"
cp "$SOURCE_DIR/Assets/VFX/People/lifelike_hologram.vfx" "$TARGET_DIR/Assets/VFX/People/"
echo "   -> Copied hifi_hologram_people.vfx & lifelike_hologram.vfx."

# 5. Migrate Subgraph Operators (Logic)
echo "🧠 Migrating Subgraph Operators..."
mkdir -p "$TARGET_DIR/Assets/VFX/Subgraphs"
# Assuming these are in the package path we verified earlier
# In a real run, we need to extract these from the package folder
echo "   -> ACTION REQUIRED: Extract 'Metavido Filter.vfxblock' and 'Metavido Inverse Projection.vfxoperator' from Packages/jp.keijiro.metavido.vfxgraph/"

echo "✅ Migration Staging Complete at $TARGET_DIR"
echo "   Please drag contents of '$TARGET_DIR' into your Portals V4 Unity Project."
