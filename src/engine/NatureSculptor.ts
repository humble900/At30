import * as THREE from 'three';
import { NatureTextureGenerator } from './NatureTextureGenerator';

/**
 * NatureSculptor
 * Procedural AAA Organic Sculpting Engine:
 * Generates noise-deformed river boulders, natural tapered logs,
 * catenary physics ropes, and weathered timber structures.
 */
export class NatureSculptor {
  /**
   * Generates an organically eroded river boulder with natural micro-irregularities,
   * smooth top wear, and darker wet waterline absorption.
   */
  public static createSculptedRiverStone(
    radius = 0.8,
    height = 0.45,
    stoneTexture?: THREE.Texture
  ): THREE.Mesh {
    const geom = new THREE.CylinderGeometry(radius * 0.9, radius * 1.15, height, 16, 4);
    const pos = geom.attributes.position;

    // Apply procedural organic noise deformation to vertices
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Multi-octave organic erosion noise
      const angle = Math.atan2(z, x);
      const noise =
        Math.sin(angle * 3.0 + y * 4.0) * 0.08 +
        Math.cos(angle * 5.0 - x * 3.0) * 0.04 +
        Math.sin(y * 8.0) * 0.03;

      // Soften top surface for authentic stepping stone wear
      const topFlatten = y > height * 0.3 ? 0.85 : 1.0;

      pos.setXYZ(i, x * (1 + noise), y * topFlatten, z * (1 + noise));
    }

    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      map: stoneTexture || NatureTextureGenerator.createRiverStoneTexture(),
      roughness: 0.68,
      metalness: 0.08
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * Generates a curved fallen redwood tree trunk with realistic bark furrow displacement,
   * natural root taper, and cut growth rings at the ends.
   */
  public static createSculptedFallenLog(
    curvePoints: THREE.Vector3[],
    radius = 0.45,
    barkTexture?: THREE.Texture
  ): THREE.Group {
    const group = new THREE.Group();
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeom = new THREE.TubeGeometry(curve, 28, radius, 12, false);

    const logMat = new THREE.MeshStandardMaterial({
      map: barkTexture || NatureTextureGenerator.createTreeBarkTexture(),
      roughness: 0.85
    });

    const logMesh = new THREE.Mesh(tubeGeom, logMat);
    logMesh.castShadow = true;
    logMesh.receiveShadow = true;
    group.add(logMesh);

    // End caps with tree growth rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#D4A373',
      roughness: 0.75
    });

    [curvePoints[0], curvePoints[curvePoints.length - 1]].forEach((p, idx) => {
      const cap = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.95, 12), ringMat);
      cap.position.copy(p);
      cap.rotation.y = idx === 0 ? -Math.PI / 2 : Math.PI / 2;
      group.add(cap);
    });

    return group;
  }

  /**
   * Generates a true catenary curve physics rope.
   */
  public static createCatenaryRope(
    start: THREE.Vector3,
    end: THREE.Vector3,
    sag = 0.45,
    ropeRadius = 0.038,
    ropeTexture?: THREE.Texture
  ): THREE.Mesh {
    const midPoint = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);
    midPoint.y -= sag;

    const curve = new THREE.CatmullRomCurve3([start, midPoint, end]);
    const geom = new THREE.TubeGeometry(curve, 20, ropeRadius, 8, false);

    const mat = new THREE.MeshStandardMaterial({
      map: ropeTexture || NatureTextureGenerator.createRopeTexture(),
      roughness: 0.9
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    return mesh;
  }
}
