import * as THREE from 'three';
import { NatureTextureGenerator } from './NatureTextureGenerator';

export class CanopyWater {
  public mesh: THREE.Mesh;
  public foamMesh: THREE.Mesh;
  private normalMap1: THREE.CanvasTexture;
  private normalMap2: THREE.CanvasTexture;
  private waterMaterial: THREE.MeshStandardMaterial;
  private foamParticles: THREE.Points;
  private waterBasePositions: Float32Array;
  private elapsed = 0;
  public group = new THREE.Group();

  constructor(width = 46, length = 16) {
    // 1. Procedural normal maps for dual-flow wave ripples
    this.normalMap1 = NatureTextureGenerator.createWaterNormalMap();
    this.normalMap2 = NatureTextureGenerator.createWaterNormalMap();

    // 1. Submerged Riverbed with Sand and Pebbles (visible through clear water)
    const riverbedTexture = NatureTextureGenerator.createRiverBedTexture();
    const riverbedMat = new THREE.MeshStandardMaterial({
      map: riverbedTexture,
      roughness: 0.92,
      metalness: 0.05
    });
    const riverbedMesh = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.05, length * 1.05, 16, 16), riverbedMat);
    riverbedMesh.rotation.x = -Math.PI / 2;
    riverbedMesh.position.y = -0.55; // submerged underneath water surface
    riverbedMesh.receiveShadow = true;
    this.group.add(riverbedMesh);

    // 2. Crystal Mountain Stream Surface (Translucent cyan-teal with sun glints)
    this.waterMaterial = new THREE.MeshStandardMaterial({
      color: '#288899',
      roughness: 0.12,
      metalness: 0.35,
      transparent: true,
      opacity: 0.78,
      normalMap: this.normalMap1,
      normalScale: new THREE.Vector2(0.95, 0.95),
      envMapIntensity: 1.5
    });

    const waterGeom = new THREE.PlaneGeometry(width, length, 32, 16);
    this.mesh = new THREE.Mesh(waterGeom, this.waterMaterial);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.receiveShadow = true;
    this.group.add(this.mesh);
    this.waterBasePositions = new Float32Array(waterGeom.attributes.position.array as Float32Array);

    // 3. Shoreline & Rapids Whitewater Foam Mesh
    const foamMat = new THREE.MeshBasicMaterial({
      color: '#F0F9FF',
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending
    });
    this.foamMesh = new THREE.Mesh(new THREE.PlaneGeometry(width, length), foamMat);
    this.foamMesh.rotation.x = -Math.PI / 2;
    this.foamMesh.position.y = 0.02;
    this.group.add(this.foamMesh);

    // 4. Floating foam spray particles along rapids
    const particleCount = 110;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * width * 0.9;
      positions[i + 1] = 0.05 + Math.random() * 0.08;
      positions[i + 2] = (Math.random() - 0.5) * length * 0.8;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: '#FFFFFF',
      size: 0.32,
      transparent: true,
      opacity: 0.75
    });

    this.foamParticles = new THREE.Points(geom, pMat);
    this.group.add(this.foamParticles);
  }

  public update(delta: number) {
    this.elapsed += delta;
    // Dual scroll normal map offset for non-repeating dynamic swirling flow
    this.normalMap1.offset.x += delta * 0.14;
    this.normalMap1.offset.y += delta * 0.08;

    this.normalMap2.offset.x -= delta * 0.09;
    this.normalMap2.offset.y += delta * 0.12;

    // The water surface itself travels downstream. This produces real changing highlights,
    // instead of a static blue sheet with a moving texture.
    const vertices = this.mesh.geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = this.waterBasePositions[i * 3];
      const y = this.waterBasePositions[i * 3 + 1];
      const ripple = Math.sin(x * .78 + this.elapsed * 4.2) * .035 + Math.cos(y * 1.1 - this.elapsed * 2.6) * .025;
      vertices.setZ(i, ripple);
    }
    vertices.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
    this.waterMaterial.color.setHSL(.52, .58, .27 + Math.sin(this.elapsed * .55) * .018);

    // Drift foam particles downriver (along X axis)
    const pos = this.foamParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i] += delta * 2.2; // flow speed
      if (pos[i] > 22) {
        pos[i] = -22;
        pos[i + 2] = (Math.random() - 0.5) * 12;
      }
    }
    this.foamParticles.geometry.attributes.position.needsUpdate = true;
  }

  public dispose() {
    this.normalMap1.dispose();
    this.normalMap2.dispose();
    this.waterMaterial.dispose();
    this.mesh.geometry.dispose();
    this.foamMesh.geometry.dispose();
    this.foamParticles.geometry.dispose();
  }
}
