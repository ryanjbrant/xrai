# OpenUSD Reference

**Sources**:
- https://openusd.org/release/tut_usd_tutorials.html
- https://docs.isaacsim.omniverse.nvidia.com/5.1.0/omniverse_usd/open_usd.html

**Last Updated**: 2026-02-07

## What is OpenUSD?

Universal Scene Description (USD) is a text-based and binary-encoded format for describing 3D scenes and assets. USD enables seamless interchange of 3D content among diverse content creation apps with its rich, extensible language.

## Key Benefits

| Benefit | Description |
|---------|-------------|
| **Interoperability** | 3D content exchange across multiple applications |
| **Collaboration** | Live teamwork through layering without overwriting |
| **Accessibility** | Human-readable (.usda) + optimized binary (.usd/.usdc) |
| **APIs** | C++ and Python bindings |

## Core Concepts

### Prims (Primitives)

Fundamental building blocks - individual scene elements with defined types.

```python
from pxr import Usd, UsdGeom

# Create a stage
stage = Usd.Stage.CreateNew("scene.usda")

# Create prims
xform = UsdGeom.Xform.Define(stage, "/World")
sphere = UsdGeom.Sphere.Define(stage, "/World/Sphere")

stage.Save()
```

### Hierarchy

| Concept | Description |
|---------|-------------|
| **Prim** | Scene graph node containing properties |
| **Stage** | Container managing complete scene graph |
| **Layer** | Individual file that can be composed |
| **Property** | Attribute (data) or Relationship (connection) |

### Common Prim Types

| Type | Purpose |
|------|---------|
| `Xform` | Transformation container |
| `Scope` | Organizational grouping (no transform) |
| `Mesh` | Polygon geometry |
| `Sphere`, `Cube`, `Cylinder` | Geometric primitives |
| `Camera` | View definition |
| `DistantLight`, `SphereLight` | Lighting |
| `Material` | Surface shading |

## Composition

USD's power comes from non-destructive layer composition.

### Composition Arcs (Strength Order: LIVRPS)

| Arc | Purpose |
|-----|---------|
| **L**ocal | Direct opinions in current layer |
| **I**nherits | Class-based sharing |
| **V**ariants | Switchable alternatives |
| **R**eferences | Include external assets |
| **P**ayloads | Deferred loading references |
| **S**pecializes | Base class with overrides |

### Layer Example

```python
# Reference external asset
prim.GetReferences().AddReference("./robot.usd")

# Create variant set
variantSet = prim.GetVariantSets().AddVariantSet("color")
variantSet.AddVariant("red")
variantSet.AddVariant("blue")
```

## File Formats

| Extension | Format | Use Case |
|-----------|--------|----------|
| `.usda` | ASCII text | Human-readable, version control |
| `.usdc` | Binary (Crate) | Performance, production |
| `.usd` | Either | Auto-detected |
| `.usdz` | Zip archive | Distribution (iOS AR Quick Look) |

## Schemas

Schemas define prim types and their properties.

| Schema Type | Description |
|-------------|-------------|
| **IsA** | Defines prim type (e.g., `UsdGeomMesh`) |
| **API** | Adds capabilities (e.g., `UsdPhysicsRigidBodyAPI`) |

```python
# Apply API schema
from pxr import UsdPhysics
UsdPhysics.RigidBodyAPI.Apply(prim)
```

## Units (Isaac Sim / Omniverse)

| Quantity | Unit |
|----------|------|
| Distance | meters |
| Time | seconds |
| Mass | kilograms |
| Angles | degrees |

## Python API Quick Reference

```python
from pxr import Usd, UsdGeom, Gf

# Open existing stage
stage = Usd.Stage.Open("scene.usd")

# Get prim
prim = stage.GetPrimAtPath("/World/Robot")

# Get attribute value
radius = prim.GetAttribute("radius").Get()

# Set attribute
prim.GetAttribute("radius").Set(2.0)

# Transform operations
xformable = UsdGeom.Xformable(prim)
xformable.AddTranslateOp().Set(Gf.Vec3d(1, 2, 3))
xformable.AddRotateXYZOp().Set(Gf.Vec3f(0, 45, 0))
xformable.AddScaleOp().Set(Gf.Vec3f(1, 1, 1))

# Traverse stage
for prim in stage.Traverse():
    print(prim.GetPath())
```

## USD in XR/AR Context

### Apple AR Quick Look
- Uses `.usdz` format for iOS AR experiences
- Single-file archive containing USD + textures
- Reality Composer exports to USDZ

### Unity Integration
- Unity 6+ has native USD import/export
- Package: `com.unity.formats.usd`
- Supports mesh, materials, animation, variants

### Omniverse / Isaac Sim
- USD is native scene format
- Real-time collaboration via layers
- Physics simulation via PhysX schemas

## Tools

| Tool | Purpose |
|------|---------|
| `usdview` | USD scene viewer |
| `usdcat` | Print USD contents |
| `usdedit` | Edit USD in text editor |
| `usdzip` | Create USDZ archives |
| `usdchecker` | Validate USD files |

## Learning Resources

- **Official Tutorials**: `extras/usd/tutorials/` in USD distribution
- **OpenUSD Docs**: https://openusd.org/release/
- **NVIDIA Omniverse**: https://docs.omniverse.nvidia.com/
- **Apple USDZ**: https://developer.apple.com/augmented-reality/quick-look/

---

**Tags**: #usd #openusd #3d-interchange #omniverse #usdz #scene-description
