import * as THREE from 'three';

interface ActiveParticle {
  mesh: THREE.Mesh | THREE.Points;
  velocity: THREE.Vector3;
  lifespan: number;
  maxLifespan: number;
  scaleGrowth?: number;
}

/**
 * CanopyVFX
 * Physical contact dynamics: footstep dust puffs, river water splash droplets,
 * expanding ripple rings, and finish bell victory sparks.
 */
export class CanopyVFX {
  public group = new THREE.Group();
  private particles: ActiveParticle[] = [];

  // Materials
  private dustMat = new THREE.MeshBasicMaterial({
    color: '#D4A373',
    transparent: true,
    opacity: 0.55
  });

  private waterSprayMat = new THREE.MeshBasicMaterial({
    color: '#E0F2FE',
    transparent: true,
    opacity: 0.75
  });

  private sparkMat = new THREE.MeshBasicMaterial({
    color: '#F59E0B',
    transparent: true,
    opacity: 0.95
  });

  public spawnFootstepDust(pos: THREE.Vector3, dir: THREE.Vector3) {
    for (let i = 0; i < 3; i++) {
      const geom = new THREE.SphereGeometry(0.08 + Math.random() * 0.06, 6, 6);
      const mesh = new THREE.Mesh(geom, this.dustMat.clone());
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.2,
        pos.y + 0.05,
        pos.z + (Math.random() - 0.5) * 0.2
      );

      const vel = new THREE.Vector3(
        -dir.x * 0.4 + (Math.random() - 0.5) * 0.3,
        0.3 + Math.random() * 0.4,
        -dir.z * 0.4 + (Math.random() - 0.5) * 0.3
      );

      this.group.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        lifespan: 0.45,
        maxLifespan: 0.45,
        scaleGrowth: 1.8
      });
    }
  }

  public spawnWaterSplash(pos: THREE.Vector3) {
    // 1. Water spray droplets
    for (let i = 0; i < 10; i++) {
      const geom = new THREE.SphereGeometry(0.06 + Math.random() * 0.06, 6, 6);
      const mesh = new THREE.Mesh(geom, this.waterSprayMat.clone());
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.4,
        pos.y + 0.1,
        pos.z + (Math.random() - 0.5) * 0.4
      );

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 1.5;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        1.5 + Math.random() * 1.2,
        Math.sin(angle) * speed
      );

      this.group.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        lifespan: 0.6,
        maxLifespan: 0.6
      });
    }

    // 2. Expanding surface ripple ring
    const ringGeom = new THREE.RingGeometry(0.1, 0.2, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#BAE6FD',
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(pos.x, 0.02, pos.z);
    this.group.add(ringMesh);

    this.particles.push({
      mesh: ringMesh,
      velocity: new THREE.Vector3(0, 0, 0),
      lifespan: 0.75,
      maxLifespan: 0.75,
      scaleGrowth: 3.5
    });
  }

  public spawnBellVictorySparks(pos: THREE.Vector3) {
    for (let i = 0; i < 25; i++) {
      const geom = new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 6, 6);
      const mesh = new THREE.Mesh(geom, this.sparkMat.clone());
      mesh.position.copy(pos);

      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const speed = 2.5 + Math.random() * 3.5;
      const vel = new THREE.Vector3(
        Math.sin(theta) * Math.cos(phi) * speed,
        Math.cos(theta) * speed + 1.5,
        Math.sin(theta) * Math.sin(phi) * speed
      );

      this.group.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        lifespan: 1.2,
        maxLifespan: 1.2
      });
    }
  }

  public update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.lifespan -= delta;

      if (p.lifespan <= 0) {
        this.group.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (p.mesh.material && !Array.isArray(p.mesh.material)) {
          p.mesh.material.dispose();
        }
        this.particles.splice(i, 1);
        continue;
      }

      // Physics integration
      p.velocity.y -= 9.8 * delta; // gravity
      p.mesh.position.addScaledVector(p.velocity, delta);

      // Fade out opacity
      const progress = p.lifespan / p.maxLifespan;
      if (p.mesh.material && 'opacity' in p.mesh.material) {
        (p.mesh.material as THREE.Material & { opacity: number }).opacity = progress * 0.8;
      }

      // Optional scale growth (for expanding dust or ripples)
      if (p.scaleGrowth) {
        const s = 1 + (1 - progress) * p.scaleGrowth;
        p.mesh.scale.set(s, s, s);
      }
    }
  }

  public dispose() {
    this.particles.forEach((p) => {
      this.group.remove(p.mesh);
      p.mesh.geometry.dispose();
    });
    this.particles = [];
  }
}
