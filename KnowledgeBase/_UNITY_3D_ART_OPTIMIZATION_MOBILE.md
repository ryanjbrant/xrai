# 3D Art Optimization Rules for Mobile Gaming (Unity)

## [SOURCES] Consulted
- Unity Learn Course: "Arm & Unity Presents: 3D Art Optimization for Mobile Applications" (10h 5m, Unity 2019.4+)
  - URL: https://learn.unity.com/course/3d-art-optimization-for-mobile-gaming-5474
  - 27 individual tutorials fetched and extracted
- Android Developer Docs: Geometry Optimization
  - URL: https://developer.android.com/games/optimize/geometry
- Unity Official: Mobile Game Optimization Tips
  - URL: https://unity.com/how-to/mobile-game-optimization-tips-part-1
- Unity Forums & Polycount: Community polygon budget consensus (2018-2025)
- GeneralistProgrammer: Unity Mobile Game Optimization Complete Guide (2025)
  - URL: https://generalistprogrammer.com/tutorials/unity-mobile-game-optimization-complete-guide

## [FINDING] Performance Budget Targets

**[STAT:confidence] HIGH -- Based on 6+ sources including Android Developer Docs and Unity official**

| Metric | Low-End Target | Mid/High-End Target |
|---|---|---|
| Triangles per frame (total scene) | < 100K | 200K-500K |
| Draw calls per frame | 50-100 | 200-500 |
| Frame rate | 30 FPS minimum | 60 FPS ideal |
| Frame budget (CPU) | 33.3 ms (at 30 FPS) | 16.67 ms (at 60 FPS) |
| Main thread render cost | < 11 ms | < 5 ms |
| Total memory | < 1 GB | < 2 GB |
| Max vertices per mesh | 65,535 (16-bit index buffer) | 65,535 (safe default) |

**Per-Asset Triangle Budgets:**

| Asset Type | Conservative | Moderate | High-End Mobile |
|---|---|---|---|
| Hero character (1-3 on screen) | 1,500-3,000 tris | 6,000-10,000 tris | 10,000-20,000 tris |
| Crowd/distant character (20+) | 300-500 tris | 500-1,000 tris | 1,000-2,000 tris |
| Environment prop (small) | 100-300 tris | 300-1,000 tris | 1,000-3,000 tris |
| Environment prop (large, featured) | 1,000-2,000 tris | 2,000-5,000 tris | 5,000-10,000 tris |
| Background/distant object | 50-200 tris | 200-500 tris | 500-1,000 tris |

Reference: Android Armies demo renders ~210,000 triangles total at 30 FPS. Circuit VR Robot (single featured character): 11,000 tris. Armies soldiers (hundreds on screen): 360 tris each. Cannon towers (large screen presence): ~3,000 tris.

---

## [FINDING] Geometry Optimization Rules

**[STAT:confidence] HIGH -- Unity Learn Course + Android Developer Docs**

### Triangle Placement
- RULE: Focus polygons on silhouette-defining shapes, not internal detail
- RULE: Use more triangles on foreground objects, fewer on background
- RULE: Delete back/bottom surfaces never visible from camera
- RULE: Remove edges that do not contribute to the silhouette
- RULE: Replace fine geometry detail with normal maps and textures

### Micro Triangle Avoidance
- RULE: Keep all triangles >= 10 pixels in screen area. Triangles 1-10 pixels waste GPU cycles
- RULE: Avoid long thin triangles (< 10px in one dimension). They cause light flickering on shiny materials and are expensive to rasterize
- RULE: Keep triangles as close to equilateral as possible (more area per edge = more efficient)

### Mesh Import Settings
- RULE: Set Animation Type to "None" for non-animated FBX models (prevents unused Animator components)
- RULE: Disable "Read/Write Enabled" if mesh is not modified at runtime (prevents duplicate memory copy)
- RULE: Disable Rig import and BlendShapes when not needed
- RULE: Disable normals/tangents import when not required by shader
- RULE: Enable Static Batching for objects that never move/rotate/scale
- RULE: Use `Mesh.CombineMeshes()` with `mergeSubMeshes=true` when meshes share the same material to reduce draw calls

### Shape Exaggeration
- RULE: Exaggerate visually important features (e.g., hands, faces) for readability on small mobile screens, especially when using low poly counts

### Topology
- RULE: Keep topology clean for animated/deforming objects
- RULE: For static objects, perfect topology is less important than polygon count -- players never see wireframes

---

## [FINDING] Level of Detail (LOD) Rules

**[STAT:confidence] HIGH -- Unity Learn Course + Android Developer Docs consensus**

### Setup Rules
- RULE: Reduce triangle count by ~50% between each LOD level
- RULE: Remove more polygons from flat/planar areas first; preserve silhouette edges
- RULE: Do NOT concentrate high-density triangle clusters in lower LOD versions
- RULE: Match LOD transitions to actual gameplay camera distances (test on device)
- RULE: Base LOD complexity on object importance and screen presence

### When to Use LOD
- USE when objects move toward/away from camera
- USE for characters, vehicles, and prominent environment objects
- SKIP when camera and scene objects are both stationary
- SKIP when objects already use minimal polygon counts
- SKIP when memory overhead from multiple mesh copies is prohibitive

### LOD + Texture
- RULE: Use mipmaps alongside mesh LOD (mipmaps are texture-LOD)
- RULE: Reduce texture count/resolution on lower LOD levels
- RULE: Consider simpler materials/shaders on distant LOD levels

---

## [FINDING] Texture Optimization Rules

**[STAT:confidence] HIGH -- Unity Learn Course, 9 texture-specific tutorials**

### Size Guidelines
- RULE: Diffuse/albedo textures: 1024x1024 max recommended for mobile
- RULE: Detail maps (roughness, metallic, AO): 512x512 recommended
- RULE: Minor/background objects: 256x256 is sufficient
- RULE: Never exceed what is visually necessary at gameplay distance on a mobile screen
- RULE: Always use power-of-two dimensions (128, 256, 512, 1024, 2048) for optimal mipmap generation
- RULE: GUI textures may remain uncompressed to prevent visible artifacts

### Compression
- RULE: Use ASTC (Arm Scalable Texture Compression) as primary format on Android -- superior quality vs ETC at same memory cost
- RULE: ASTC block size starting points: 5x5 or 6x6. Use larger blocks (8x8, 10x10) for distant/less detailed textures; smaller blocks (4x4) for close-up hero textures
- RULE: Use ETC2 as fallback if ASTC is not supported or for faster iteration during development
- RULE: Customize compression per texture -- do NOT apply uniform compression across all assets
- RULE: RGBA 4x4 is the smallest available ASTC block size (highest quality, largest memory)

### Color Space
- RULE: sRGB color space for diffuse/color/albedo textures ONLY
- RULE: Linear (non-sRGB) for ALL data maps: metallic, roughness, normal maps, masks
- CRITICAL: Applying sRGB to data maps produces WRONG visual results on materials

### Mipmaps
- RULE: Enable mipmaps by default for all 3D scene textures (Unity does this automatically)
- RULE: Disable mipmaps for GUI/HUD textures (they are always at fixed screen distance)
- RULE: Mipmaps add ~33% memory overhead but save significant GPU bandwidth at distance
- RULE: Power-of-two textures generate optimal mipmaps

### Texture Filtering
- RULE: Default to bilinear filtering for balance of performance and quality
- RULE: Use trilinear sparingly -- it demands more memory bandwidth than bilinear
- RULE: Prefer bilinear + 2x anisotropic OVER trilinear + 1x anisotropic (looks better AND performs better)
- RULE: Keep anisotropic level low (max 2x). Only use higher for critical ground/floor textures viewed at steep angles
- CRITICAL: Texture filtering can consume up to HALF of GPU energy on mobile

### Texture Atlasing
- RULE: Atlas textures for objects sharing the same material to enable batching and reduce draw calls
- RULE: Objects must share BOTH the atlas texture AND the same material for batching to work
- RULE: Plan atlas layout BEFORE UV unwrapping (retroactive atlasing requires UV rework)
- RULE: Atlasing reduces both draw calls (CPU-bound scenarios) and total texture memory (fewer separate textures)

### UV Unwrap
- RULE: Keep UV islands straight -- easier packing, less wasted space, avoids staircase artifacts
- RULE: Place UV seams where they are visually hidden (behind objects, at hard edges)
- RULE: Split UV islands at hard/sharp edges with small spacing between them

### Texture Channel Packing
- RULE: Pack roughness + smoothness + metallic into ONE texture using RGB channels (3 maps in 1 file)
- RULE: Store the most important mask in the GREEN channel (green has more bits due to human eye sensitivity)
- RULE: Store alpha/opacity masks in the R channel of roughness/metallic textures instead of a dedicated alpha texture
- RULE: Bake ambient occlusion directly into diffuse/albedo textures when possible
- CRITICAL: Adding a dedicated alpha channel converts texture to 32-bit format, nearly doubling file size. Pack alpha into existing channels instead

### Normal Maps
- RULE: Use normal maps sparingly on lower-end devices -- each adds extra texture fetches
- RULE: Only use normal maps when the polygon reduction they enable justifies their cost
- RULE: Split UVs at hard edges (angles > 90 degrees) with matching smoothing groups to eliminate visible seams
- RULE: Use mesh cages during baking to control raycast distance

---

## [FINDING] Shader and Material Optimization Rules

**[STAT:confidence] HIGH -- Unity Learn Course, 5 shader-specific tutorials**

### Shader Selection
- RULE: Use unlit shaders for lower-end devices and stylized art styles (cheapest computation)
- RULE: Use URP/Simple Lit as the performant lit shader for mobile (NOT Standard shader)
- RULE: Enable ONLY the shader features you actually use -- Unity generates optimized variants based on enabled features
- RULE: Move calculations from pixel/fragment shaders to vertex shaders when possible (fewer vertices than pixels)

### Expensive Operations to Avoid
- RULE: Avoid `sin()`, `pow()`, `cos()`, `divide()`, `noise()` in fragment shaders
- RULE: Prefer addition and multiplication (cheapest operations)
- RULE: This constraint is CRITICAL on GLES 2.0 devices

### Material Management
- RULE: Share materials across objects wherever possible (enables batching)
- RULE: Objects sharing the same material + same mesh can be batched (static or dynamic)
- RULE: Use Unity's built-in particle shader for particles, not custom shaders

### Transparency Rules
- RULE: Prefer opaque materials whenever possible -- transparency is significantly more expensive
- RULE: Transparent objects layered on top of each other cause overdraw (compounding GPU cost)
- RULE: Alpha Blend (transparent) is generally recommended over Alpha Test (cutout) on mobile -- cutout disables GPU optimizations
- RULE: Alpha Test produces harsh aliased edges but is better for moving foliage
- RULE: Minimize number and screen coverage of transparent objects
- RULE: To reduce overdraw from particles: reduce particle count AND particle size

### Draw Call Reduction
- RULE: Combine meshes sharing the same material with `Mesh.CombineMeshes()`
- RULE: Use texture atlases so multiple objects can share one material
- RULE: Mark non-moving objects as Static for static batching
- RULE: Dynamic batching handles objects with fewer vertices sharing materials (automatic)
- RULE: Use SRP Batcher with URP for additional batching

---

## [FINDING] Lighting Optimization Rules

**[STAT:confidence] HIGH -- Unity Learn Course, 6 lighting-specific tutorials**

### Light Mode Strategy
- RULE: Use BAKED lighting as primary strategy for mobile. It is the LEAST computationally expensive mode
- RULE: Avoid realtime/dynamic lights in mobile games -- they are the MOST expensive mode
- RULE: Mixed lighting is also expensive -- use only when absolutely necessary for stationary lights affecting dynamic objects
- RULE: URP forward renderer limit: 8 lights per object (4 on OpenGL ES 2.0)
- STRATEGY: "Handle all lighting with baked lighting, light probes, and material effects"

### Lightmap Settings
- RULE: Start Lightmap Resolution at 5-10, increase only as needed (higher = exponentially larger files)
- RULE: Use "Scale In Lightmap" per-object to reduce texels on small, thin, or low-variation objects
- RULE: Do NOT allocate lightmap texels to invisible surfaces
- RULE: Use Progressive CPU or Progressive GPU lightmapper (NOT deprecated Enlighten)
- RULE: Minimize total lightmap size for mobile

### Light Probes
- RULE: Use light probes for dynamic/moving objects to receive baked lighting cheaply
- RULE: Light probes complement lightmaps -- probes for moving objects, lightmaps for static surfaces
- RULE: Place probes throughout areas where dynamic objects travel
- LIMITATION: Light probes only store static scene lighting data; no realtime light updates

### Shadows
- RULE: Fake shadows on mobile using blob shadow meshes/quads with blurred textures beneath characters
- RULE: Or use custom shaders for blob shadow effects
- RULE: Bake shadow detail into textures (painted lighting) to avoid realtime shadow computation
- RULE: Disable "Cast Shadows" on Renderers if using blob shadows
- RULE: Disable "Receive Shadows" on Renderers in pre-baked lighting scenarios
- RULE: Turn off EVERY shadow feature you are not actively using

### Static Object Setup
- RULE: Mark all non-moving objects as Static (Everything flag) for baked lighting
- WARNING: If Batching Static is enabled, you CANNOT move or animate that object

---

## [FINDING] Animation Optimization (from Geometry Best Practices)

**[STAT:confidence] MEDIUM -- Covered indirectly in geometry tutorials**

- RULE: Set Animation Type to "None" on all non-animated FBX models
- RULE: Disable Rig import when skeletal animation is not needed
- RULE: Disable BlendShapes import when not used
- RULE: Clean topology is essential for deforming/animated meshes
- RULE: For animated characters, maintain proper edge loops at joints

---

## [FINDING] The Optimization Process Framework

**[STAT:confidence] HIGH -- Unity Learn Course introductory module**

### 5-Step Iterative Cycle
1. **PROFILE** -- Measure performance with profiling tools (Unity Profiler, Arm Streamline)
2. **ANALYZE** -- Identify the actual bottleneck (CPU-bound vs GPU-bound)
3. **DETERMINE** -- Select the appropriate optimization technique
4. **VERIFY** -- Confirm the optimization actually improved performance
5. **REPEAT** -- Cycle back; fixing one bottleneck may reveal another

### Key Principle
- Optimization is cyclical. Never assume one fix solves everything.
- Always profile on TARGET DEVICE, not desktop. Mobile screens are smaller and GPUs are weaker.
- Common symptoms of poor optimization: low FPS, visual stuttering, device overheating, rapid battery drain.

---

## [SYNTHESIS] Summary

This document distills **10+ hours** of Unity Learn course content (co-authored by Arm) plus Android Developer documentation and community consensus into actionable rules. The core principles:

1. **Budget first**: Set triangle, draw call, and memory budgets before building assets. ~100K-200K triangles/frame at 30 FPS is a safe mobile target.
2. **Silhouette over detail**: On mobile screens, silhouette matters more than surface detail. Use normal maps and textures for fine detail instead of geometry.
3. **LOD everything**: 50% triangle reduction per LOD level. Skip LOD only for already-simple or static-camera objects.
4. **ASTC compression**: Use ASTC 5x5 or 6x6 as default texture compression on Android. Linear color space for data maps, sRGB only for albedo.
5. **Channel pack aggressively**: Roughness + metallic + AO in one RGB texture. Alpha masks in the R channel of existing textures, never as a dedicated 32-bit alpha.
6. **Bake everything possible**: Baked lighting, baked shadows, baked AO into diffuse. Realtime lighting is the most expensive operation on mobile.
7. **Fake shadows**: Use blob shadow meshes/textures instead of realtime shadow maps.
8. **Minimize transparency**: Every transparent pixel is expensive. Reduce particle count and size. Prefer opaque materials.
9. **Share materials**: Shared material + texture atlas = automatic batching = fewer draw calls.
10. **Profile on device**: Desktop testing is insufficient. Always validate on target mobile hardware.

---

## [LIMITATION] Gaps

- The Unity Learn course (2019.4) does not cover Unity 6 / URP 17+ features (e.g., GPU Resident Drawer, Render Graph). Rules remain valid but newer batching systems may provide additional optimization paths.
- No specific iOS PVRTC texture guidance (the course focuses on Arm/Android ASTC/ETC2).
- Animation optimization is covered only superficially (import settings). No bone count budgets or animation compression settings.
- No specific guidance on VFX Graph / Shader Graph mobile optimization (post-dates course).
- Polygon budgets are approximate community consensus, not hard GPU limits -- always profile on your target device.

## [RECOMMENDATION] Next Steps

1. Save this document to your KnowledgeBase for AI agent reference during asset creation and review.
2. Create a pre-flight checklist script that validates assets against these rules at import time (e.g., check triangle count, texture dimensions, compression format, Read/Write toggle).
3. For Unity 6 projects, supplement with URP 17 documentation on GPU Resident Drawer and BatchRendererGroup.
4. For AR/XR projects, tighten budgets further: AR overlays compete with camera feed for GPU bandwidth, so aim for the low-end column in all budget tables.

---

Sources:
- [Unity Learn: 3D Art Optimization for Mobile Gaming (Full Course)](https://learn.unity.com/course/3d-art-optimization-for-mobile-gaming-5474)
- [Android Developers: Geometry Optimization](https://developer.android.com/games/optimize/geometry)
- [Unity Official: Mobile Game Optimization Tips Part 1](https://unity.com/how-to/mobile-game-optimization-tips-part-1)
- [Unity Discussions: Good polygon count for mobile?](https://discussions.unity.com/t/good-polygons-count-for-mobile/815217)
- [Unity Discussions: Recommendation of polygon count for mobile game](https://forum.unity.com/threads/recommendation-of-count-of-polygons-tris-for-mobile-game.517210/)
- [Polycount: Maximum polycount for mobile in 2018](https://polycount.com/discussion/206859/maximum-polycount-for-mobile-in-2018)
- [Polycount: How many polys should character models have in a mobile game?](https://polycount.com/discussion/230521/how-many-polys-should-character-models-have-in-a-mobile-game)
- [GeneralistProgrammer: Unity Mobile Game Optimization Complete Guide 2025](https://generalistprogrammer.com/tutorials/unity-mobile-game-optimization-complete-guide)
- [GitHub: unity-mobile-optimization](https://github.com/GuardianOfGods/unity-mobile-optimization)
- [Unity Docs: Modeling Characters for Optimal Performance](https://docs.unity3d.com/560/Documentation/Manual/ModelingOptimizedCharacters.html)