# Compute Shader Patterns

**Updated**: 2026-02-06 | **Source**: Portals_6 codebase analysis

## Core Pattern: Particle Struct

All particle compute shaders use similar struct:

```hlsl
struct Params {
    float3 emitPos;
    float3 position;
    float4 velocity;  // xyz = vel, w = coef
    float3 life;      // x = elapsed, y = lifetime, z = active
    float3 size;      // x = current, y = start, z = target
    float4 color;
};
RWStructuredBuffer<Params> buf;
```

## Lorenz Attractor (Strange Attractor)

Simple 3-line chaotic system:

```hlsl
float3 LorenzAttractor(float3 pos) {
    float p = 10.0, r = 28.0, b = 2.667;
    float dxdt = p * (pos.y - pos.x);
    float dydt = pos.x * (r - pos.z) - pos.y;
    float dzdt = pos.x * pos.y - b * pos.z;
    return float3(dxdt, dydt, dzdt) * DT;
}
```

## Curl Noise (Divergence-Free Flow)

```hlsl
float3 curlNoise(float3 coord) {
    float3 dx = float3(EPSILON, 0, 0);
    float3 dy = float3(0, EPSILON, 0);
    float3 dz = float3(0, 0, EPSILON);

    float3 dpdx0 = simplexNoise(coord - dx);
    float3 dpdx1 = simplexNoise(coord + dx);
    // ... similar for y, z

    float x = dpdy1.z - dpdy0.z + dpdz1.y - dpdz0.y;
    float y = dpdz1.x - dpdz0.x + dpdx1.z - dpdx0.z;
    float z = dpdx1.y - dpdx0.y + dpdy1.x - dpdy0.x;
    return float3(x, y, z) / EPSILON * 2.0;
}
```

## SDF Distance Functions (Raymarching)

```hlsl
float SphereDistance(float3 eye, float3 centre, float radius) {
    return distance(eye, centre) - radius;
}

float CubeDistance(float3 eye, float3 centre, float3 size) {
    float3 o = abs(eye - centre) - size;
    float ud = length(max(o, 0));
    float n = max(max(min(o.x, 0), min(o.y, 0)), min(o.z, 0));
    return ud + n;
}

float TorusDistance(float3 eye, float3 centre, float r1, float r2) {
    float2 q = float2(length((eye - centre).xz) - r1, eye.y - centre.y);
    return length(q) - r2;
}
```

## SDF Combine Operations

```hlsl
float4 Combine(float dstA, float dstB, float3 colA, float3 colB, int op, float k) {
    if (op == 0) return dstB < dstA ? float4(colB, dstB) : float4(colA, dstA); // Union
    if (op == 1) return Blend(dstA, dstB, colA, colB, k);  // Smooth blend
    if (op == 2) return -dstB > dstA ? float4(colB, -dstB) : float4(colA, dstA); // Cut
    if (op == 3) return dstB > dstA ? float4(colB, dstB) : float4(colA, dstA); // Mask
}

// Smooth min (IQ's polynomial)
float4 Blend(float a, float b, float3 colA, float3 colB, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return float4(lerp(colB, colA, h), lerp(b, a, h) - k * h * (1.0 - h));
}
```

## Reaction Diffusion (Gray-Scott)

```hlsl
// Laplacian kernel weights
static const float laplacePower[9] = {
    0.05, 0.2, 0.05,
    0.2, -1.0, 0.2,
    0.05, 0.2, 0.05
};

// Update step
float newU = u + (_DU * laplaceU - u * v * v + _Feed * (1.0 - u)) * _DT;
float newV = v + (_DV * laplaceV + u * v * v - (_K + _Feed) * v) * _DT;
```

## TiltBrush Shader Pattern

```hlsl
// Audio reactive support
#pragma multi_compile __ AUDIO_REACTIVE

// Bloom color helper
o.color = bloomColor(v.color, _EmissionGain);

// Scroll animation
half2 displacement = tex2D(_MainTex, i.texcoord + float2(_Scroll1, 0)).xy;
```

## Unity Integration Pattern

```csharp
// C# dispatch pattern
[SerializeField] ComputeShader compute;
ComputeBuffer particleBuffer;

void Start() {
    particleBuffer = new ComputeBuffer(count, Marshal.SizeOf<Params>());
    compute.SetBuffer(0, "buf", particleBuffer);
}

void Update() {
    compute.SetFloat("time", Time.time);
    compute.Dispatch(0, count / 128, 1, 1);
}
```

## Key Resources

- IQ's distance functions: iquilezles.org/articles/distfunctions
- IQ's smooth min: iquilezles.org/articles/smin
- Simplex noise: github.com/keijiro/NoiseShader

## Implementation Checklist

- [ ] Particle buffer struct matches C# struct
- [ ] Thread count matches dispatch (128 typical)
- [ ] Double-buffer for read/write separation
- [ ] deltaTime passed as uniform
