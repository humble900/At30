---
name: aaa-environment-technical-director
description: Complete Technical Direction, Shader Engineering, and AAA Environment Art guidelines for photorealistic and stylized 3D worlds in WebGL / Three.js.
---

# AAA Environment Art & Technical Direction Skill

Use this skill when building or upgrading 3D game environments to achieve AAA visual fidelity, physical presence, and cinematic aesthetics in WebGL and Three.js.

---

## 1. Core Principles of Physical Presence in WebGL

To avoid the "sterile computer model" look, every natural element must adhere to these physical cues:

### A. The 5 Realism Rules
1. **Never use flat single-color primitives**: Every surface must have micro-roughness variations, normal displacement, and ambient contact shading.
2. **Multi-Texture Height Blending**: Paths, terrain, and riverbanks must transition organically via splatting (e.g. Dirt $\rightarrow$ Pine Needle Loam $\rightarrow$ Grass Mounds).
3. **Fluid Dynamics & Depth Absorption**: Water must exhibit directional flow velocity (flowmaps), depth-based color extinction (Beer-Lambert law), sun caustics, and collision foam against rocks.
4. **Organic Asset Deformation**: Rocks and logs must use noise-displaced vertex geometry (eroded shapes, wet waterline rings, bark furrows, cut growth rings).
5. **Physical Reactivity & Particle Feedback**: Footstep dust puffs on dirt, water splash bursts on stone landing, and camera spring dynamics.

---

## 2. Technical Shader & Geometry Recipes

### A. 3-Way Height-Blended Terrain & Trail Shader
```typescript
// Height-based blending equation in GLSL Fragment Shader:
// weight = clamp((height1 - height2 + blendFactor) / blendFactor, 0.0, 1.0);
// Displace path vertices downward by 0.08m to simulate worn foot depressions.
```

### B. Dynamic River Fluid Shader
```glsl
// Dual-scrolling normal maps with flow velocity:
vec2 uv1 = vUv * 4.0 + vec2(uTime * 0.14, uTime * 0.08);
vec2 uv2 = vUv * 4.0 + vec2(-uTime * 0.09, uTime * 0.12);
vec3 normal1 = texture2D(uNormalMap1, uv1).rgb * 2.0 - 1.0;
vec3 normal2 = texture2D(uNormalMap2, uv2).rgb * 2.0 - 1.0;
vec3 blendedNormal = normalize(normal1 + normal2);

// Depth Murkiness & Fresnel:
float fresnel = pow(1.0 - max(dot(vViewPosition, blendedNormal), 0.0), 3.0);
vec3 waterColor = mix(uShallowColor, uDeepColor, vDepth);
```

### C. Organic Rock & Log Sculptor
- Subdivide base icosahedron/cylinder geometry.
- Apply 3-octave Simplex 3D noise displacement to vertex positions along their normals.
- Apply darker, higher-roughness material below $y = 0.15\text{m}$ to simulate wet waterline absorption.

### D. Catenary Rope Physics
```typescript
// Catenary curve formula for suspension cables:
// y = a * cosh(x / a) - a
const cablePoints = [];
for (let i = 0; i <= segments; i++) {
  const t = (i / segments) * 2 - 1; // -1 to 1
  const sag = Math.cosh(t * 1.5) - 1.0;
  cablePoints.push(new THREE.Vector3(x, baseY + sag * maxSag, z));
}
```

---

## 3. Lighting & Post-Processing Setup

Always configure the Three.js renderer with:
```typescript
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```
