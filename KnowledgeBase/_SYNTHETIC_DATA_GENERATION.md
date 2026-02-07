# Synthetic Data Generation for AI/ML

**Sources**:
- https://docs.isaacsim.omniverse.nvidia.com/5.1.0/replicator_tutorials/tutorial_replicator_cosmos.html

**Last Updated**: 2026-02-07

## Overview

Synthetic data generation creates training datasets from simulated environments, enabling AI/ML model training without manual data collection and labeling.

## NVIDIA Replicator

Isaac Sim extension for perception data generation through synthetic dataset creation.

### Capabilities

| Feature | Description |
|---------|-------------|
| **Multi-modal capture** | RGB, depth, segmentation, edges simultaneously |
| **Domain randomization** | Vary lighting, materials, poses, environments |
| **Ground truth** | Automatic labeling (bounding boxes, masks, poses) |
| **Sensor simulation** | Camera, LiDAR, radar data generation |

### Output Modalities

| Modality | Use Case |
|----------|----------|
| **RGB** | Visual recognition, object detection |
| **Depth** | Spatial understanding, 3D reconstruction |
| **Segmentation** | Instance/semantic masks for tracking |
| **Shaded Segmentation** | Realistic masks with lighting |
| **Edges** | Boundary detection, Canny edges |

## NVIDIA Cosmos

Platform for creating high-quality visual simulations through Multi-ControlNet architecture.

### Cosmos Transfer

Transforms low-resolution control signals into high-quality visual simulations:

```
Control Inputs (depth, edges, segmentation)
           ↓
    Cosmos Transfer
           ↓
Photorealistic Output
```

### Control Weights

Each modality accepts weight (0.0-1.0):
- **High weight**: Strict adherence to control signal
- **Low weight**: More creative freedom in generation

## Data Generation Pipeline

```
1. Load USD Stage
2. Place Assets (robots, objects, environment)
3. Configure Sensors (cameras, LiDAR)
4. Set Randomization Parameters
5. Capture Clips (multi-frame sequences)
6. Export Multi-Modal Data
7. Train AI/ML Models
```

## Domain Randomization Strategies

| Strategy | Parameters |
|----------|------------|
| **Lighting** | Intensity, color, position, type |
| **Materials** | Textures, colors, roughness, metallic |
| **Poses** | Object positions, rotations |
| **Distractors** | Random objects in scene |
| **Camera** | Position, focal length, exposure |
| **Environment** | Time of day, weather, backgrounds |

## Unity Alternatives

### Unity Perception Package

```csharp
// Example: Add labelers to camera
var perceptionCamera = camera.AddComponent<PerceptionCamera>();
perceptionCamera.AddLabeler(new BoundingBox2DLabeler());
perceptionCamera.AddLabeler(new SemanticSegmentationLabeler());
perceptionCamera.AddLabeler(new InstanceSegmentationLabeler());
```

### Unity Perception Features

| Feature | Description |
|---------|-------------|
| **Randomizers** | Built-in domain randomization |
| **Labelers** | 2D/3D bounding boxes, segmentation, keypoints |
| **Scenarios** | Configurable data generation runs |
| **Dataset Insights** | Visualization and analysis tools |

### Unity Simulation

- Cloud-based batch rendering
- Scales to millions of images
- Integrates with ML frameworks

## Use Cases for XR/AR

| Application | Training Data Needed |
|-------------|---------------------|
| **Object detection** | RGB + bounding boxes |
| **Hand tracking** | RGB + keypoint annotations |
| **Scene understanding** | RGB + semantic segmentation |
| **Depth estimation** | RGB + ground truth depth |
| **6DoF pose** | RGB + object poses |

## Best Practices

1. **Match target domain**: Simulate conditions similar to deployment
2. **Diverse randomization**: Cover edge cases in training data
3. **Balanced datasets**: Equal representation of classes
4. **Validate on real data**: Test with real-world samples
5. **Iterative refinement**: Identify gaps, add targeted data

## Tools Comparison

| Tool | Platform | Strengths |
|------|----------|-----------|
| **Isaac Sim Replicator** | Omniverse | Physics simulation, robotics focus |
| **Unity Perception** | Unity | Game engine integration, accessibility |
| **NVIDIA Omniverse** | Cross-platform | USD-based, multi-app collaboration |
| **Blender + Python** | Open source | Free, flexible scripting |

## Output Formats

| Format | Use |
|--------|-----|
| **COCO** | Object detection, segmentation |
| **KITTI** | Autonomous driving |
| **SOLO** | Unity Perception native |
| **Custom** | Framework-specific needs |

---

**Tags**: #synthetic-data #replicator #cosmos #domain-randomization #perception #training-data
