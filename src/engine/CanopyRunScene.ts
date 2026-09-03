import * as THREE from 'three';
import { NatureTextureGenerator } from './NatureTextureGenerator';
import { NatureSculptor } from './NatureSculptor';
import { CanopyWater } from './CanopyWater';
import { CanopyVFX } from './CanopyVFX';
import { EnvironmentLighting } from './EnvironmentLighting';

export type FallType = 'water' | 'cliff' | 'out';
export type SurfaceType = 'dirt' | 'wood' | 'stone' | 'grass';

export interface CheckpointData {
  id: number;
  name: string;
  subtitle: string;
  position: THREE.Vector3;
  respawnPoint: THREE.Vector3;
  triggerRadiusSq: number;
}

export interface MovingLumberHazard {
  id: string;
  group: THREE.Group;
  pivot: THREE.Vector3;
  length: number;
  radius: number;
  width: number;
  speed: number;
  amplitude: number;
  phase: number;
  currentPos: THREE.Vector3;
  velocity: THREE.Vector3;
}

export class CanopyRunScene {
  public scene = new THREE.Scene();
  public vfx = new CanopyVFX();
  public movingLumberHazards: MovingLumberHazard[] = [];
  private disposables: THREE.Object3D[] = [];
  private dynamicWater: CanopyWater | null = null;
  private envLighting: EnvironmentLighting | null = null;


  // -------------------------------------------------------------
  // EXPANDED 7-CHECKPOINT COURSE DEFINITION (~320m Expedition)
  // -------------------------------------------------------------
  public checkpoints: CheckpointData[] = [
    {
      id: 0,
      name: 'Trailhead Pines',
      subtitle: 'Ancient sequoia forest & winding trail',
      position: new THREE.Vector3(0, 0, 125),
      respawnPoint: new THREE.Vector3(0, 0, 125),
      triggerRadiusSq: 20
    },
    {
      id: 1,
      name: 'Lower River Rapids',
      subtitle: 'Zigzag stepping stones & curved log',
      position: new THREE.Vector3(0, 0, 85),
      respawnPoint: new THREE.Vector3(0, 0, 85),
      triggerRadiusSq: 22
    },
    {
      id: 2,
      name: 'Fern Bluff Scree',
      subtitle: 'Hairpin switchbacks & granite ledges',
      position: new THREE.Vector3(0, 3.2, 45),
      respawnPoint: new THREE.Vector3(0, 3.2, 45),
      triggerRadiusSq: 22
    },
    {
      id: 3,
      name: 'Canopy Treehouse',
      subtitle: 'Spiral sequoia ramp & treetop boardwalk',
      position: new THREE.Vector3(-1.5, 8.8, -5),
      respawnPoint: new THREE.Vector3(-1.5, 8.8, -5),
      triggerRadiusSq: 24
    },
    {
      id: 4,
      name: 'Waterfall Cavern',
      subtitle: 'Wet cavern path & roaring mist gorge',
      position: new THREE.Vector3(2.0, 7.2, -45),
      respawnPoint: new THREE.Vector3(2.0, 7.2, -45),
      triggerRadiusSq: 24
    },
    {
      id: 5,
      name: 'Wind Chasm Bridge',
      subtitle: '50m high suspension bridge & wind shear',
      position: new THREE.Vector3(0, 10.5, -95),
      respawnPoint: new THREE.Vector3(0, 10.5, -95),
      triggerRadiusSq: 26
    },
    {
      id: 6,
      name: 'Summit Bell Clearing',
      subtitle: 'Final descent & resonant finish bell',
      position: new THREE.Vector3(0, 1.4, -158),
      respawnPoint: new THREE.Vector3(0, 1.4, -158),
      triggerRadiusSq: 20
    }
  ];

  // Dynamic Animated Objects
  private bellMesh: THREE.Group | null = null;
  private bellRingTimer: number = 0;
  private leavesParticles: THREE.Points | null = null;

  // Stepping stones layout across Lower Creek Rapids (Z: 91.5 to 60.5)
  public static readonly STEPPING_STONES = [
    { x: -0.4, z: 91.5, r: 0.9 }, // Trailhead approach rock (Seamless transition from dirt!)
    { x: -0.8, z: 88.5, r: 0.8 },
    { x: 0.7, z: 85.0, r: 0.8 },
    { x: -0.6, z: 81.5, r: 0.8 },
    { x: 0.6, z: 78.0, r: 0.8 },
    { x: -0.7, z: 74.5, r: 0.8 },
    { x: 0.5, z: 71.0, r: 0.8 },
    { x: -0.5, z: 67.5, r: 0.8 },
    { x: 0.4, z: 64.0, r: 0.8 },
    { x: 0.0, z: 60.8, r: 0.95 } // Bluff exit rock (Seamless transition to scree!)
  ];

  // Solid Obstacle Colliders (Boulders, Hurdle Logs, Cavern Pillars)
  public obstacleColliders: { center: THREE.Vector3; radius: number; height: number }[] = [];

  constructor() {
    this.setupAtmosphere();
    this.buildTerrainAndCurvilinearTrail();
    this.buildGrandWildernessForest();
    this.buildZone1TrailheadPines();
    this.buildZone2LowerRiverRapids();
    this.buildZone3FernBluffScree();
    this.buildZone4SequoiaTreehouseCanopy();
    this.buildZone5WaterfallCavernGorge();
    this.buildZone6HighWindChasmBridge();
    this.buildZone7SummitRidgeFinishBell();
    this.buildCheckpointsAndSignage();
    this.buildAtmosphericParticles();
    this.buildInstancedMicroFoliage();
    this.buildCanopyGodRays();
    this.scene.add(this.vfx.group);
  }

  private setupAtmosphere() {
    // Atmospheric fog
    this.scene.fog = new THREE.FogExp2('#B8D5C4', 0.009);

    // Vibrant Alpine Lighting (Sky + Sun + Shadow Frustum + Zone Accents)
    this.envLighting = new EnvironmentLighting(this.scene, undefined, {
      elevation: 28,
      azimuth: 145
    });

    // Distant Mountain Ranges (Majestic Alpine Horizon)
    const mountainMat = new THREE.MeshStandardMaterial({ color: '#44728A', roughness: 0.95 });
    const mountains = [
      { x: 90, y: 35, z: -210, r: 120, h: 85 },
      { x: -95, y: 40, z: -230, r: 140, h: 95 },
      { x: 0, y: 45, z: -260, r: 160, h: 110 },
      { x: 130, y: 25, z: 50, r: 90, h: 65 },
      { x: -140, y: 28, z: 70, r: 100, h: 70 }
    ];

    mountains.forEach((m) => {
      const ridge = new THREE.Mesh(new THREE.ConeGeometry(m.r, m.h, 7), mountainMat);
      ridge.position.set(m.x, m.y, m.z);
      this.scene.add(ridge);
      this.disposables.push(ridge);
    });
  }

  private buildTerrainAndCurvilinearTrail() {
    // 1. Massive Continuous Forest Floor
    const grassMat = new THREE.MeshStandardMaterial({ color: '#497337', roughness: 0.85 });
    const forestFloor = NatureTextureGenerator.createForestFloorTexture();
    const forestFloorNormal = NatureTextureGenerator.createForestFloorNormalMap();
    grassMat.map = forestFloor;
    grassMat.normalMap = forestFloorNormal;
    grassMat.normalScale = new THREE.Vector2(0.42, 0.42);
    grassMat.roughness = 0.96;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 380, 32, 64), grassMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.05, -20);
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.disposables.push(ground);

    // 2. Curvilinear Winding Dirt Trail Ribbon
    const trailDiffuse = NatureTextureGenerator.createDirtTrailTexture();
    const trailNormal = NatureTextureGenerator.createDirtTrailNormalMap();
    const trailMat = new THREE.MeshStandardMaterial({
      map: trailDiffuse,
      normalMap: trailNormal,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughness: 0.9
    });

    // Generate natural winding trail spline
    const splinePoints: THREE.Vector3[] = [];
    for (let z = 135; z >= -170; z -= 5) {
      const x = this.getPathCenterlineX(z);
      const y = this.getGroundHeight(x, z) + 0.015;
      splinePoints.push(new THREE.Vector3(x, y, z));
    }

    const trailCurve = new THREE.CatmullRomCurve3(splinePoints);
    const trailGeom = new THREE.TubeGeometry(trailCurve, 120, 2.7, 8, false);
    // Flatten tube into a path ribbon
    trailGeom.scale(1, 0.02, 1);
    const trail = new THREE.Mesh(trailGeom, trailMat);
    trail.receiveShadow = true;
    this.scene.add(trail);
    this.disposables.push(trail);

    // 3. Rope-Wrapped Wooden Bollard Posts along path transitions
    [130, 96, 56, 18, -26, -72, -122, -156].forEach((bz) => {
      const bx = this.getPathCenterlineX(bz);
      this.createRopeWrappedBollard(bx - 2.8, this.getGroundHeight(bx - 2.8, bz), bz);
      this.createRopeWrappedBollard(bx + 2.8, this.getGroundHeight(bx + 2.8, bz), bz);
    });
  }

  public getPathCenterlineX(z: number): number {
    // Smooth natural S-curves through the terrain
    if (z > 95) return Math.sin((z - 95) * 0.07) * 3.5;
    if (z > 58) return 0.0; // Creek crossing zone
    if (z > 20) return Math.sin((z - 20) * 0.09) * 4.5;
    if (z > -25) return -Math.cos((z + 25) * 0.08) * 3.0;
    if (z > -70) return Math.sin((z + 70) * 0.06) * 3.8;
    if (z > -120) return 0.0; // High suspension bridge
    return Math.sin((z + 120) * 0.08) * 3.2; // Final descent
  }

  private createRopeWrappedBollard(x: number, y: number, z: number) {
    const postMat = new THREE.MeshStandardMaterial({ color: '#784E2D', roughness: 0.85 });
    const ropeTexture = NatureTextureGenerator.createRopeTexture();
    const ropeMat = new THREE.MeshStandardMaterial({ map: ropeTexture, roughness: 0.9 });

    const group = new THREE.Group();
    group.position.set(x, y, z);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1, 10), postMat);
    post.position.y = 0.55;
    post.castShadow = true;
    post.receiveShadow = true;
    group.add(post);

    for (let r = 0; r < 4; r++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.032, 6, 14), ropeMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.42 + r * 0.06;
      group.add(ring);
    }

    this.scene.add(group);
    this.disposables.push(group);
  }

  private buildGrandWildernessForest() {
    const barkTexture = NatureTextureGenerator.createTreeBarkTexture();
    const barkMat = new THREE.MeshStandardMaterial({ map: barkTexture, roughness: 0.9 });
    const oakMat = new THREE.MeshStandardMaterial({ color: '#3E7439', roughness: 0.92 });
    const pineMat = new THREE.MeshStandardMaterial({ color: '#254D31', roughness: 0.96 });

    // Populate 160 organic trees flanking the winding trail
    for (let i = 0; i < 160; i++) {
      const z = 135 - (i * 1.95);
      const isRight = i % 2 === 0;
      const pathX = this.getPathCenterlineX(z);
      const offsetDist = 6.5 + (i * 4.3) % 45;
      const x = pathX + (isRight ? offsetDist : -offsetDist);
      const baseElev = this.getTerrainBaseElevation(z);

      const tree = new THREE.Group();
      tree.position.set(x, baseElev, z);

      const trHeight = 7.2 + (i % 7) * 1.15;
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.65, trHeight, 8), barkMat);
      tr.position.y = trHeight / 2;
      tr.rotation.z = Math.sin(i * 2.17) * 0.035;
      tr.castShadow = true;
      tree.add(tr);

      const isPine = i % 3 !== 0;
      if (isPine) {
        for (let tier = 0; tier < 4; tier++) {
          const cone = new THREE.Mesh(new THREE.ConeGeometry(2.9 - tier * 0.46, 2.5 + (i % 3) * .18, 10), pineMat);
          cone.position.set(Math.sin(i * 3.1 + tier) * .24, trHeight - 1.2 + tier * 1.65, Math.cos(i * 1.7 + tier) * .2);
          cone.rotation.y = (i + tier) * .7;
          cone.scale.x = .9 + ((i + tier) % 3) * .08;
          cone.castShadow = true;
          tree.add(cone);
        }
      } else {
        for (let c = 0; c < 3; c++) {
          const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2, 1), oakMat);
          crown.position.set((c - 1) * 1.2, trHeight + 1.2 + c * 0.8, (c === 1 ? 0.8 : -0.8));
          crown.castShadow = true;
          tree.add(crown);
        }
      }

      // Mid-ground understory breaks the repeated “prop forest” rhythm.
      if (i % 2 === 0) {
        const fernMat = new THREE.MeshStandardMaterial({ color: i % 4 ? '#6f9b45' : '#8ea94b', roughness: 1, side: THREE.DoubleSide });
        for (let f=0; f<4; f++) { const frond=new THREE.Mesh(new THREE.PlaneGeometry(.5+Math.random()*.35,.18),fernMat);frond.position.set((Math.random()-.5)*2.5,.18+Math.random()*.22,(Math.random()-.5)*2.5);frond.rotation.set(-1.1,Math.random()*Math.PI,.12);tree.add(frond); }
      }

      this.scene.add(tree);
      this.disposables.push(tree);
    }

    const bladeMat = new THREE.MeshStandardMaterial({ color: '#6E9C43', roughness: 1, side: THREE.DoubleSide });
    for (let i = 0; i < 240; i++) {
      const z = 132 - (i * 1.25);
      const trailX = this.getPathCenterlineX(z);
      const x = trailX + (i % 2 ? 1 : -1) * (3.8 + (i * 2.17) % 12);
      const cover = new THREE.Group();
      cover.position.set(x, this.getTerrainBaseElevation(z), z);
      for (let blade = 0; blade < 6; blade++) {
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(.12 + Math.random() * .1, .45 + Math.random() * .45), bladeMat);
        leaf.position.set((Math.random() - .5) * 1.6, .22 + Math.random() * .18, (Math.random() - .5) * 1.4);
        leaf.rotation.set(0, Math.random() * Math.PI, .15 + (Math.random() - .5) * .3);
        cover.add(leaf);
      }
      this.scene.add(cover); this.disposables.push(cover);
    }
  }

  // -------------------------------------------------------------
  // ZONE 1: TRAILHEAD PINES & ROOT HURDLES (Z: 135 -> 95)
  // -------------------------------------------------------------
  private buildZone1TrailheadPines() {
    const barkTexture = NatureTextureGenerator.createTreeBarkTexture();
    const logMat = new THREE.MeshStandardMaterial({ map: barkTexture, roughness: 0.85 });

    // Gnarled Tree Root Hurdles across trail
    const rootHurdles = [
      { z: 120, x: this.getPathCenterlineX(120), h: 0.45 },
      { z: 106, x: this.getPathCenterlineX(106), h: 0.48 }
    ];

    rootHurdles.forEach((rh) => {
      const rootLog = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.26, 5.0, 10),
        logMat
      );
      rootLog.rotation.z = Math.PI / 2;
      rootLog.position.set(rh.x, rh.h / 2, rh.z);
      rootLog.castShadow = true;
      this.scene.add(rootLog);
      this.disposables.push(rootLog);

      this.obstacleColliders.push({
        center: new THREE.Vector3(rh.x, rh.h / 2, rh.z),
        radius: 0.35,
        height: rh.h
      });
    });

    // Dynamic Moving Lumber Hazard 1: Trailhead Swinging Timber Pendulum
    this.createSwingingTimberHazard({
      id: 'lumber_pines',
      pivot: new THREE.Vector3(this.getPathCenterlineX(113), 3.8, 113),
      length: 3.2,
      width: 4.6,
      radius: 0.3,
      speed: 2.2,
      amplitude: 0.65,
      phase: 0.0
    });
  }

  // -------------------------------------------------------------
  // ZONE 2: LOWER RIVER RAPIDS & TEETER LOG (Z: 95 -> 58)
  // -------------------------------------------------------------
  private buildZone2LowerRiverRapids() {
    const cliffTexture = NatureTextureGenerator.createGraniteCliffTexture();
    const cliffMat = new THREE.MeshStandardMaterial({ map: cliffTexture, roughness: 0.85 });
    const stoneTexture = NatureTextureGenerator.createRiverStoneTexture();
    const barkTexture = NatureTextureGenerator.createTreeBarkTexture();
    const plankTexture = NatureTextureGenerator.createWeatheredPlankTexture();
    const plankMat = new THREE.MeshStandardMaterial({ map: plankTexture, roughness: 0.8 });
    const ropeTexture = NatureTextureGenerator.createRopeTexture();


    // River Trench Bedrock
    const riverTrench = new THREE.Mesh(new THREE.BoxGeometry(60, 2.4, 38), cliffMat);
    riverTrench.position.set(0, -1.2, 76);
    riverTrench.receiveShadow = true;
    this.scene.add(riverTrench);
    this.disposables.push(riverTrench);

    // Dynamic Sparkling Creek Water
    this.dynamicWater = new CanopyWater(60, 36);
    this.dynamicWater.group.position.set(0, -0.1, 76);
    this.scene.add(this.dynamicWater.group);

    // Wet, irregular banks interrupt the hard rectangular trench silhouette.
    const bankRocks = [
      [-25, 90, 1.5], [-18, 84, 1.0], [-13, 69, 1.3], [-7, 62, .85],
      [25, 88, 1.35], [19, 78, 1.05], [14, 67, 1.45], [8, 61, .8]
    ];
    bankRocks.forEach(([x, z, r], index) => {
      const rock = NatureSculptor.createSculptedRiverStone(r, r * (.55 + (index % 3) * .1), stoneTexture);
      rock.position.set(x, -.2, z); rock.rotation.y = index * .76;
      this.scene.add(rock); this.disposables.push(rock);
    });

    // 1. 9-Stone Zigzag Stepping Stone Chain
    CanopyRunScene.STEPPING_STONES.forEach((sp) => {
      const stone = NatureSculptor.createSculptedRiverStone(sp.r, 0.45, stoneTexture);
      stone.position.set(sp.x, 0.16, sp.z);
      this.scene.add(stone);
      this.disposables.push(stone);
    });

    // 2. Curved Fallen Redwood Log Shortcut (Left side)
    const logPoints = [
      new THREE.Vector3(-2.8, 0.25, 92),
      new THREE.Vector3(-2.1, 0.44, 76),
      new THREE.Vector3(-2.7, 0.25, 60)
    ];
    const sculptedLog = NatureSculptor.createSculptedFallenLog(logPoints, 0.48, barkTexture);
    this.scene.add(sculptedLog);
    this.disposables.push(sculptedLog);

    this.createRopeWrappedBollard(-2.9, 0, 93.5);
    this.createRopeWrappedBollard(-2.1, 0.44, 76); // Mounted directly on curved log (Exact Cover Art match!)
    this.createRopeWrappedBollard(-2.8, 0, 58.5);

    // 3. Rope Slat Suspension Bridge (Right side)
    const bridgeSlatsCount = 20;
    for (let s = 0; s < bridgeSlatsCount; s++) {
      const t = s / (bridgeSlatsCount - 1);
      const bz = 92 - t * 32;
      const by = 0.2 + Math.sin(t * Math.PI) * 0.4;
      const bx = 2.8;

      const slat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.45), plankMat);
      slat.position.set(bx, by, bz);
      slat.castShadow = true;
      slat.receiveShadow = true;
      this.scene.add(slat);
      this.disposables.push(slat);
    }

    const ropeL = NatureSculptor.createCatenaryRope(new THREE.Vector3(1.9, 0.9, 93), new THREE.Vector3(1.9, 0.9, 59), 0.5, 0.035, ropeTexture);
    this.scene.add(ropeL);
    const ropeR = NatureSculptor.createCatenaryRope(new THREE.Vector3(3.7, 0.9, 93), new THREE.Vector3(3.7, 0.9, 59), 0.5, 0.035, ropeTexture);
    this.scene.add(ropeR);

    this.createRopeWrappedBollard(2.8, 0, 93.5);
    this.createRopeWrappedBollard(2.8, 0, 58.5);
  }

  // -------------------------------------------------------------
  // ZONE 3: FERN BLUFF SCREE SWITCHBACKS (Z: 58 -> 20, y: 0 -> 5.5m)
  // -------------------------------------------------------------
  private buildZone3FernBluffScree() {
    const cliffTexture = NatureTextureGenerator.createGraniteCliffTexture();
    const cliffMat = new THREE.MeshStandardMaterial({ map: cliffTexture, roughness: 0.88 });

    // Ascending Bluff Terraces
    const ledges = [
      { z: 48, y: 1.4, h: 1.4, d: 10 },
      { z: 38, y: 3.0, h: 1.6, d: 10 },
      { z: 28, y: 4.6, h: 1.6, d: 10 },
      { z: 18, y: 5.8, h: 1.2, d: 10 }
    ];

    ledges.forEach((ld) => {
      const bluff = new THREE.Mesh(new THREE.BoxGeometry(36, ld.h, ld.d), cliffMat);
      bluff.position.set(0, ld.y - ld.h / 2, ld.z);
      bluff.castShadow = true;
      bluff.receiveShadow = true;
      this.scene.add(bluff);
      this.disposables.push(bluff);
    });

    // Slalom Boulders (Alternating on left & right sides with clean clear running line)
    const slalomBoulders = [
      { x: -1.35, y: 0.8, z: 50, r: 0.85 },
      { x: 1.35, y: 2.2, z: 40, r: 0.85 },
      { x: -1.35, y: 3.8, z: 30, r: 0.85 },
      { x: 1.35, y: 5.2, z: 20, r: 0.85 }
    ];

    slalomBoulders.forEach((sb) => {
      const boulder = NatureSculptor.createSculptedRiverStone(sb.r, sb.r * 1.15);
      boulder.position.set(sb.x, sb.y, sb.z);
      this.scene.add(boulder);
      this.disposables.push(boulder);

      this.obstacleColliders.push({
        center: new THREE.Vector3(sb.x, sb.y, sb.z),
        radius: sb.r * 0.9,
        height: sb.r * 1.2
      });
    });

    // Dynamic Moving Lumber Hazard 2: Fern Bluff Heavy Pendulum Battering Ram
    this.createSwingingTimberHazard({
      id: 'lumber_bluff',
      pivot: new THREE.Vector3(0, 6.8, 35),
      length: 3.4,
      width: 5.2,
      radius: 0.35,
      speed: 2.6,
      amplitude: 0.72,
      phase: 1.5
    });

    // Granite Climbing Pillars
    const cliffPillars = [
      { x: 1.2, y: 1.4, z: 46, r: 0.95 },
      { x: -1.1, y: 3.0, z: 36, r: 1.0 },
      { x: 1.0, y: 4.6, z: 26, r: 1.05 }
    ];

    cliffPillars.forEach((cp) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(cp.r, cp.r * 1.2, cp.y, 14), cliffMat);
      pillar.position.set(cp.x, cp.y / 2, cp.z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);
      this.disposables.push(pillar);
    });
  }

  // -------------------------------------------------------------
  // ZONE 4: SEQUOIA TREEHOUSE CANOPY (Z: 20 -> -25, y: 5.5m -> 9.2m)
  // -------------------------------------------------------------
  private buildZone4SequoiaTreehouseCanopy() {
    const barkTexture = NatureTextureGenerator.createTreeBarkTexture();
    const barkMat = new THREE.MeshStandardMaterial({ map: barkTexture, roughness: 0.9 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#854D0E', roughness: 0.8 });
    const plankTexture = NatureTextureGenerator.createWeatheredPlankTexture();
    const plankMat = new THREE.MeshStandardMaterial({ map: plankTexture, roughness: 0.8 });
    const ropeTexture = NatureTextureGenerator.createRopeTexture();

    // Giant Ancient Sequoia Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.2, 28, 16), barkMat);
    trunk.position.set(-3.5, 14, -2);
    trunk.castShadow = true;
    this.scene.add(trunk);
    this.disposables.push(trunk);

    // Spiral Wooden Ramp climbing sequoia (y: 5.5m -> 9.2m)
    for (let i = 0; i < 24; i++) {
      const t = i / 24;
      const angle = t * Math.PI * 1.4;
      const rx = -3.5 + Math.cos(angle) * 3.4;
      const rz = -2 + Math.sin(angle) * 3.4;
      const ry = 5.5 + t * 3.7;

      const step = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.16, 0.65), plankMat);
      step.position.set(rx, ry, rz);
      step.rotation.y = -angle;
      step.castShadow = true;
      step.receiveShadow = true;
      this.scene.add(step);
      this.disposables.push(step);
    }

    // High Treehouse Platform Deck (y = 9.2m)
    const treehouseDeck = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.4, 0.35, 8), woodMat);
    treehouseDeck.position.set(-1.5, 9.1, -12);
    treehouseDeck.castShadow = true;
    treehouseDeck.receiveShadow = true;
    this.scene.add(treehouseDeck);
    this.disposables.push(treehouseDeck);

    // Aerial Treetop Boardwalk over to Waterfall Gorge
    for (let bz = -14; bz >= -26; bz -= 0.95) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 0.72), plankMat);
      plank.position.set(0, 9.2 - (-14 - bz) * 0.15, bz);
      plank.castShadow = true;
      plank.receiveShadow = true;
      this.scene.add(plank);
      this.disposables.push(plank);
    }

    const ropeRailL = NatureSculptor.createCatenaryRope(new THREE.Vector3(-1.3, 10.0, -14), new THREE.Vector3(-1.3, 8.2, -26), 0.2, 0.035, ropeTexture);
    this.scene.add(ropeRailL);
    const ropeRailR = NatureSculptor.createCatenaryRope(new THREE.Vector3(1.3, 10.0, -14), new THREE.Vector3(1.3, 8.2, -26), 0.2, 0.035, ropeTexture);
    this.scene.add(ropeRailR);
  }

  // -------------------------------------------------------------
  // ZONE 5: WATERFALL CAVERN & ROARING GORGE (Z: -25 -> -70, y: 7.5m -> 11.5m)
  // -------------------------------------------------------------
  private buildZone5WaterfallCavernGorge() {
    const cliffTexture = NatureTextureGenerator.createGraniteCliffTexture();
    const cliffMat = new THREE.MeshStandardMaterial({ map: cliffTexture, roughness: 0.88 });
    const barkTexture = NatureTextureGenerator.createTreeBarkTexture();
    const logMat = new THREE.MeshStandardMaterial({ map: barkTexture, roughness: 0.85 });

    // Cavern Rock Archway
    const cavernArchL = new THREE.Mesh(new THREE.BoxGeometry(6, 12, 38), cliffMat);
    cavernArchL.position.set(-6, 6, -48);
    this.scene.add(cavernArchL);
    this.disposables.push(cavernArchL);

    const cavernArchR = new THREE.Mesh(new THREE.BoxGeometry(6, 12, 38), cliffMat);
    cavernArchR.position.set(6, 6, -48);
    this.scene.add(cavernArchR);
    this.disposables.push(cavernArchR);

    // Roaring Mountain Waterfall Curtain (Translucent Blue-White Plane)
    const waterSheetMat = new THREE.MeshStandardMaterial({
      color: '#BAE6FD',
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.8
    });
    const waterfallSheet = new THREE.Mesh(new THREE.PlaneGeometry(8, 16), waterSheetMat);
    waterfallSheet.position.set(-3.5, 8, -48);
    waterfallSheet.rotation.y = Math.PI / 2;
    this.scene.add(waterfallSheet);
    this.disposables.push(waterfallSheet);

    // Wet Cavern Stalagmite Obstacles
    const stalagmites = [
      { x: -0.8, y: 7.2, z: -35, r: 0.7 },
      { x: 0.9, y: 8.0, z: -48, r: 0.75 },
      { x: -0.6, y: 9.5, z: -60, r: 0.8 }
    ];

    stalagmites.forEach((sm) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(sm.r, 2.4, 8), cliffMat);
      cone.position.set(sm.x, sm.y + 1.2, sm.z);
      cone.castShadow = true;
      this.scene.add(cone);
      this.disposables.push(cone);

      this.obstacleColliders.push({
        center: new THREE.Vector3(sm.x, sm.y + 1.2, sm.z),
        radius: sm.r,
        height: 2.4
      });
    });

    // Floating Log Jump Pads across the Cavern Gorge
    const jumpLogs = [
      { x: 0.5, y: 7.8, z: -40 },
      { x: -0.6, y: 8.8, z: -53 },
      { x: 0.4, y: 10.2, z: -65 }
    ];

    jumpLogs.forEach((jl) => {
      const logPad = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.4, 10), logMat);
      logPad.position.set(jl.x, jl.y, jl.z);
      logPad.castShadow = true;
      logPad.receiveShadow = true;
      this.scene.add(logPad);
      this.disposables.push(logPad);
    });

    // Dynamic Moving Lumber Hazard 3: Waterfall Cavern Swinging Timber
    this.createSwingingTimberHazard({
      id: 'lumber_cavern',
      pivot: new THREE.Vector3(0, 12.2, -48),
      length: 3.6,
      width: 4.8,
      radius: 0.34,
      speed: 3.0,
      amplitude: 0.8,
      phase: 3.0
    });
  }

  // -------------------------------------------------------------
  // ZONE 6: 50-METER HIGH WIND CHASM BRIDGE (Z: -70 -> -125, y: 11.5m -> 8.0m)
  // -------------------------------------------------------------
  private buildZone6HighWindChasmBridge() {
    const plankTexture = NatureTextureGenerator.createWeatheredPlankTexture();
    const plankMat = new THREE.MeshStandardMaterial({ map: plankTexture, roughness: 0.8 });
    const ropeTexture = NatureTextureGenerator.createRopeTexture();

    const ironMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.5, metalness: 0.8 });
    const cliffTexture = NatureTextureGenerator.createGraniteCliffTexture();
    const cliffMat = new THREE.MeshStandardMaterial({ map: cliffTexture, roughness: 0.9 });

    // Deep Canyon Abyss underneath (y = -10m)
    const canyonAbyss = new THREE.Mesh(new THREE.BoxGeometry(45, 18, 58), cliffMat);
    canyonAbyss.position.set(0, -2.0, -97);
    canyonAbyss.receiveShadow = true;
    this.scene.add(canyonAbyss);
    this.disposables.push(canyonAbyss);

    // Bridge Planks with 4 missing broken plank jump gaps!
    let pIdx = 0;
    for (let bz = -72; bz >= -122; bz -= 0.95) {
      pIdx++;

      // 4 Missing Slat Gap Intervals (Skill Jumps Required!)
      const isMissingGap =
        (bz <= -78.8 && bz >= -80.4) ||
        (bz <= -91.0 && bz >= -92.6) ||
        (bz <= -102.8 && bz >= -104.4) ||
        (bz <= -115.0 && bz >= -116.6);

      if (isMissingGap) {
        const brokenPlankL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 0.5), plankMat);
        const centerDist = Math.abs(bz - (-97)) / 26;
        const sagY = 11.5 - Math.sin((1 - Math.min(1, centerDist)) * Math.PI) * 1.1;
        brokenPlankL.position.set(-0.95, sagY, bz);
        this.scene.add(brokenPlankL);
        this.disposables.push(brokenPlankL);
        continue;
      }

      const centerDist = Math.abs(bz - (-97)) / 26;
      const sagY = 11.5 - Math.sin((1 - Math.min(1, centerDist)) * Math.PI) * 1.1;

      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.72), plankMat);
      plank.position.set(0, sagY, bz);
      plank.castShadow = true;
      plank.receiveShadow = true;
      this.scene.add(plank);
      this.disposables.push(plank);
    }

    // Heavy Catenary Suspension Cables
    const cableL = NatureSculptor.createCatenaryRope(new THREE.Vector3(-1.35, 13.8, -71), new THREE.Vector3(-1.35, 10.4, -123), 1.8, 0.05, ropeTexture);
    this.scene.add(cableL);
    const cableR = NatureSculptor.createCatenaryRope(new THREE.Vector3(1.35, 13.8, -71), new THREE.Vector3(1.35, 10.4, -123), 1.8, 0.05, ropeTexture);
    this.scene.add(cableR);

    // Entrance & Exit Pylons
    [-71, -123].forEach((pz) => {
      const pylonL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 4.2, 8), ironMat);
      pylonL.position.set(-1.35, 12.6, pz);
      this.scene.add(pylonL);
      const pylonR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 4.2, 8), ironMat);
      pylonR.position.set(1.35, 12.6, pz);
      this.scene.add(pylonR);
    });
  }

  // -------------------------------------------------------------
  // ZONE 7: SUMMIT RIDGE & THE FINISH BELL (Z: -125 -> -165)
  // -------------------------------------------------------------
  private buildZone7SummitRidgeFinishBell() {
    const cliffTexture = NatureTextureGenerator.createGraniteCliffTexture();
    const cliffMat = new THREE.MeshStandardMaterial({ map: cliffTexture, roughness: 0.88 });
    const grassMat = new THREE.MeshStandardMaterial({ color: '#497337', roughness: 0.85 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#784E2D', roughness: 0.85 });
    const brassBellMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.25, metalness: 0.9 });

    // Solid Granite Mountain Descent Ridge (Grounded to y=0)
    const descentRidge = new THREE.Mesh(new THREE.BoxGeometry(26, 8.4, 34), cliffMat);
    descentRidge.position.set(0, 4.2, -140);
    descentRidge.receiveShadow = true;
    this.scene.add(descentRidge);
    this.disposables.push(descentRidge);

    // Dynamic Moving Lumber Hazard 4: Summit Ridge Alpine Swinging Ram
    this.createSwingingTimberHazard({
      id: 'lumber_summit',
      pivot: new THREE.Vector3(0, 8.2, -142),
      length: 3.6,
      width: 5.0,
      radius: 0.35,
      speed: 2.8,
      amplitude: 0.75,
      phase: 4.2
    });

    // Solid Meadow Plateau Base (Grounded to y=0)
    const meadowBase = new THREE.Mesh(new THREE.CylinderGeometry(15, 18, 2.4, 24), cliffMat);
    meadowBase.position.set(0, 1.2, -158);
    meadowBase.receiveShadow = true;
    this.scene.add(meadowBase);
    this.disposables.push(meadowBase);

    // Finish Meadow Lawn
    const meadowGrass = new THREE.Mesh(new THREE.CircleGeometry(14.8, 24), grassMat);
    meadowGrass.rotation.x = -Math.PI / 2;
    meadowGrass.position.set(0, 1.42, -158);
    meadowGrass.receiveShadow = true;
    this.scene.add(meadowGrass);
    this.disposables.push(meadowGrass);

    // The Timber Gantry Finish Bell
    this.bellMesh = new THREE.Group();
    this.bellMesh.position.set(0, 1.4, -158);

    const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.6, 8), woodMat);
    platform.position.y = 0.3;
    platform.castShadow = true;
    platform.receiveShadow = true;
    this.bellMesh.add(platform);

    const postL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.4, 0.32), woodMat);
    postL.position.set(-1.1, 2.0, 0);
    postL.castShadow = true;
    this.bellMesh.add(postL);

    const postR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.4, 0.32), woodMat);
    postR.position.set(1.1, 2.0, 0);
    postR.castShadow = true;
    this.bellMesh.add(postR);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.34, 0.38), woodMat);
    beam.position.set(0, 3.5, 0);
    beam.castShadow = true;
    this.bellMesh.add(beam);

    const bellGroup = new THREE.Group();
    bellGroup.position.set(0, 2.9, 0);

    const bellDome = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.75, 18), brassBellMat);
    bellDome.castShadow = true;
    bellGroup.add(bellDome);

    const bellLip = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.07, 8, 24), brassBellMat);
    bellLip.rotation.x = Math.PI / 2;
    bellLip.position.set(0, -0.37, 0);
    bellGroup.add(bellLip);

    this.bellMesh.add(bellGroup);
    this.scene.add(this.bellMesh);
    this.disposables.push(this.bellMesh);
  }

  private buildCheckpointsAndSignage() {
    const bannerMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.5, side: THREE.DoubleSide });
    const postMat = new THREE.MeshStandardMaterial({ color: '#3E2514', roughness: 0.85 });

    this.checkpoints.forEach((cp) => {
      const g = new THREE.Group();
      g.position.copy(cp.position);

      const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.8, 8), postMat);
      postL.position.set(-2.2, 1.9, 0);
      postL.castShadow = true;
      g.add(postL);

      const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 3.8, 8), postMat);
      postR.position.set(2.2, 1.9, 0);
      postR.castShadow = true;
      g.add(postR);

      const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.6, 8), postMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, 3.6, 0);
      g.add(crossbar);

      const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.75), bannerMat);
      flag.position.set(0, 3.0, 0);
      g.add(flag);

      this.scene.add(g);
      this.disposables.push(g);
    });
  }

  private buildAtmosphericParticles() {
    const count = 240;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 85;
      pos[i + 1] = 1 + Math.random() * 18;
      pos[i + 2] = 135 - Math.random() * 300;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: '#FEF08A', size: 0.18, transparent: true, opacity: 0.7 });
    this.leavesParticles = new THREE.Points(geom, mat);
    this.scene.add(this.leavesParticles);
  }

  /**
   * PILLAR 1: Instanced Micro-Foliage Clumping
   * Eliminates flat polygonal intersections by scattering 1,200+ 3D ferns,
   * wild grass tufts, and river pebbles along trails and riverbanks.
   */
  private buildInstancedMicroFoliage() {
    const dummy = new THREE.Object3D();

    // 1. INSTANCED FERNS (400 Clusters)
    const fernTexture = NatureTextureGenerator.createFernLeafTexture();
    const fernMat = new THREE.MeshStandardMaterial({
      map: fernTexture,
      transparent: true,
      alphaTest: 0.45,
      roughness: 0.82,
      side: THREE.DoubleSide
    });

    const fernGeom = new THREE.PlaneGeometry(0.7, 0.95);
    fernGeom.translate(0, 0.45, 0); // pivot at base of leaf

    const fernMesh = new THREE.InstancedMesh(fernGeom, fernMat, 400);
    fernMesh.castShadow = true;
    fernMesh.receiveShadow = true;

    for (let i = 0; i < 400; i++) {
      const z = 130 - (i / 400) * 280;
      const pathX = this.getPathCenterlineX(z);
      const isRiverBank = z >= 56 && z <= 96;
      const spreadX = isRiverBank ? 3.5 + Math.random() * 4.5 : 2.5 + Math.random() * 8.0;
      const side = (i % 2 === 0 ? 1 : -1);
      const x = pathX + side * spreadX;
      const y = this.getGroundHeight(x, z);

      dummy.position.set(x, y, z);
      dummy.rotation.set((Math.random() - 0.5) * 0.35, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.35);
      const s = 0.75 + Math.random() * 0.65;
      dummy.scale.set(s, s * 1.1, s);
      dummy.updateMatrix();

      fernMesh.setMatrixAt(i, dummy.matrix);
    }
    fernMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(fernMesh);
    this.disposables.push(fernMesh);

    // 2. INSTANCED WILD GRASS TUFTS (500 Clusters)
    const grassGeom = new THREE.ConeGeometry(0.18, 0.45, 4);
    const grassMat = new THREE.MeshStandardMaterial({ color: '#558B2F', roughness: 0.85 });
    const grassMesh = new THREE.InstancedMesh(grassGeom, grassMat, 500);

    for (let i = 0; i < 500; i++) {
      const z = 135 - (i / 500) * 290;
      const pathX = this.getPathCenterlineX(z);
      const side = (i % 2 === 0 ? 1 : -1);
      const x = pathX + side * (1.8 + Math.random() * 12.0);
      const y = this.getGroundHeight(x, z);

      dummy.position.set(x, y + 0.22, z);
      dummy.rotation.set((Math.random() - 0.5) * 0.25, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.25);
      const s = 0.6 + Math.random() * 0.8;
      dummy.scale.set(s, s * 1.2, s);
      dummy.updateMatrix();

      grassMesh.setMatrixAt(i, dummy.matrix);
    }
    grassMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(grassMesh);
    this.disposables.push(grassMesh);

    // 3. INSTANCED SHORELINE RIVER PEBBLES (300 Stones)
    const pebbleGeom = new THREE.SphereGeometry(0.12, 6, 6);
    pebbleGeom.scale(1.2, 0.5, 1.0);
    const pebbleMat = new THREE.MeshStandardMaterial({ color: '#78716C', roughness: 0.7 });
    const pebbleMesh = new THREE.InstancedMesh(pebbleGeom, pebbleMat, 300);

    for (let i = 0; i < 300; i++) {
      const z = 58 + Math.random() * 36;
      const x = (Math.random() - 0.5) * 22;
      const y = 0.05 + Math.random() * 0.08;

      dummy.position.set(x, y, z);
      dummy.rotation.set(Math.random() * 0.4, Math.random() * Math.PI * 2, Math.random() * 0.4);
      const s = 0.6 + Math.random() * 1.1;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();

      pebbleMesh.setMatrixAt(i, dummy.matrix);
    }
    pebbleMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(pebbleMesh);
    this.disposables.push(pebbleMesh);
  }

  /**
   * PILLAR 4: Volumetric Canopy God Rays (Dappled Sunlight Shafts)
   */
  private buildCanopyGodRays() {
    const rayMat = new THREE.MeshBasicMaterial({
      color: '#FEF3C7',
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const rayGeom = new THREE.PlaneGeometry(6.5, 32);

    const rayPositions = [
      { x: 4, y: 14, z: 110, rotZ: 0.38 },
      { x: -6, y: 15, z: 80, rotZ: -0.32 },
      { x: 3, y: 16, z: 65, rotZ: 0.35 },
      { x: -5, y: 18, z: 35, rotZ: -0.4 },
      { x: 6, y: 20, z: 5, rotZ: 0.36 },
      { x: -4, y: 22, z: -35, rotZ: -0.34 },
      { x: 5, y: 24, z: -85, rotZ: 0.38 },
      { x: -3, y: 16, z: -140, rotZ: -0.32 }
    ];

    rayPositions.forEach((rp) => {
      const ray = new THREE.Mesh(rayGeom, rayMat);
      ray.position.set(rp.x, rp.y, rp.z);
      ray.rotation.x = Math.PI / 4;
      ray.rotation.z = rp.rotZ;
      this.scene.add(ray);
      this.disposables.push(ray);
    });
  }

  public triggerBellRingAnimation() {
    this.bellRingTimer = 1.5;
  }

  public createSwingingTimberHazard(config: {
    id: string;
    pivot: THREE.Vector3;
    length: number;
    width: number;
    radius: number;
    speed: number;
    amplitude: number;
    phase: number;
  }) {
    const woodMat = new THREE.MeshStandardMaterial({ color: '#784E2D', roughness: 0.85 });
    const barkTexture = NatureTextureGenerator.createTreeBarkTexture();
    const barkMat = new THREE.MeshStandardMaterial({ map: barkTexture, roughness: 0.9 });
    const ropeTexture = NatureTextureGenerator.createRopeTexture();
    const ropeMat = new THREE.MeshStandardMaterial({ map: ropeTexture, roughness: 0.9 });
    const ironMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.4, metalness: 0.8 });

    const gantry = new THREE.Group();
    gantry.position.copy(config.pivot);

    // Supporting A-Frame Gantry Posts
    const frameHeight = config.length + 1.2;
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, frameHeight, 8), woodMat);
    postL.position.set(-config.width * 0.7 - 1.2, -frameHeight / 2, 0);
    postL.rotation.z = -0.15;
    postL.castShadow = true;
    gantry.add(postL);

    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, frameHeight, 8), woodMat);
    postR.position.set(config.width * 0.7 + 1.2, -frameHeight / 2, 0);
    postR.rotation.z = 0.15;
    postR.castShadow = true;
    gantry.add(postR);

    // Crossbeam
    const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(config.width * 1.8 + 2.8, 0.35, 0.35), woodMat);
    crossbeam.position.y = 0;
    crossbeam.castShadow = true;
    gantry.add(crossbeam);

    // Swinging Pendulum Arm (Rotates around pivot z-axis)
    const swingGroup = new THREE.Group();
    swingGroup.position.set(0, 0, 0);

    // Dual Hanging Ropes
    const ropeL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, config.length, 6), ropeMat);
    ropeL.position.set(-config.width * 0.4, -config.length / 2, 0);
    swingGroup.add(ropeL);

    const ropeR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, config.length, 6), ropeMat);
    ropeR.position.set(config.width * 0.4, -config.length / 2, 0);
    swingGroup.add(ropeR);

    // Heavy Horizontal Timber Battering Log
    const log = new THREE.Mesh(new THREE.CylinderGeometry(config.radius, config.radius * 1.08, config.width, 12), barkMat);
    log.rotation.z = Math.PI / 2;
    log.position.set(0, -config.length, 0);
    log.castShadow = true;
    log.receiveShadow = true;
    swingGroup.add(log);

    // Iron reinforcement bands
    [-config.width * 0.38, config.width * 0.38].forEach((bx) => {
      const band = new THREE.Mesh(new THREE.TorusGeometry(config.radius * 1.05, 0.035, 6, 16), ironMat);
      band.rotation.y = Math.PI / 2;
      band.position.set(bx, -config.length, 0);
      swingGroup.add(band);
    });

    gantry.add(swingGroup);
    this.scene.add(gantry);
    this.disposables.push(gantry);

    this.movingLumberHazards.push({
      id: config.id,
      group: swingGroup,
      pivot: config.pivot.clone(),
      length: config.length,
      radius: config.radius,
      width: config.width,
      speed: config.speed,
      amplitude: config.amplitude,
      phase: config.phase,
      currentPos: new THREE.Vector3(config.pivot.x, config.pivot.y - config.length, config.pivot.z),
      velocity: new THREE.Vector3()
    });
  }

  public update(delta: number) {
    if (this.dynamicWater) this.dynamicWater.update(delta);
    this.vfx.update(delta);

    // Dynamic Moving Lumber / Timber Hazards Animation
    const nowSec = performance.now() * 0.001;
    for (const lumber of this.movingLumberHazards) {
      const theta = Math.sin(nowSec * lumber.speed + lumber.phase) * lumber.amplitude;
      const omega = lumber.speed * Math.cos(nowSec * lumber.speed + lumber.phase) * lumber.amplitude;

      lumber.group.rotation.z = theta;

      // Exact world position of swinging log center
      const logX = lumber.pivot.x + Math.sin(theta) * lumber.length;
      const logY = lumber.pivot.y - Math.cos(theta) * lumber.length;
      const logZ = lumber.pivot.z;

      // Linear velocity
      const vx = omega * Math.cos(theta) * lumber.length;
      const vy = omega * Math.sin(theta) * lumber.length;

      lumber.currentPos.set(logX, logY, logZ);
      lumber.velocity.set(vx, vy, 0);
    }

    if (this.bellRingTimer > 0 && this.bellMesh) {
      this.bellRingTimer -= delta;
      const wobble = Math.sin(this.bellRingTimer * 28) * (this.bellRingTimer * 0.14);
      this.bellMesh.rotation.z = wobble;
    }

    if (this.leavesParticles) {
      const pos = this.leavesParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= delta * 0.35;
        if (pos[i] < 0.2) pos[i] = 18;
      }
      this.leavesParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  // -------------------------------------------------------------
  // PHYSICAL GROUND HEIGHT QUERY FOR FULL EXPANDED WORLD
  // -------------------------------------------------------------
  public getGroundHeight(x: number, z: number): number {
    // Zone 1: Trailhead Pines (Z: 140 -> 91.5)
    if (z >= 91.5) return 0.0;

    // Zone 2: Lower River Rapids (Z: 91.5 -> 60.5)
    if (z >= 60.5) {
      // Stepping stones
      for (const stone of CanopyRunScene.STEPPING_STONES) {
        if (Math.hypot(x - stone.x, z - stone.z) <= stone.r + 0.15) return 0.32;
      }
      // Curved Redwood Log (Left side shortcut)
      if (z >= 60 && z <= 92) {
        const expectedX = -2.1 - 0.7 * Math.pow((z - 76) / 16, 2);
        if (Math.abs(x - expectedX) <= 0.65) return 0.44;
      }
      // Slat Bridge (Right side shortcut)
      if (z >= 60 && z <= 92 && x >= 1.6 && x <= 4.0) return 0.28;
      // Rushing river water
      return -1.0;
    }

    // Zone 3: Fern Bluff Scree (Z: 60.5 -> 20, y: 0 -> 5.5m)
    if (z > 48) return 0.0 + (60.5 - z) * 0.11;
    if (z > 38) return 1.4 + (48 - z) * 0.16;
    if (z > 28) return 3.0 + (38 - z) * 0.16;
    if (z > 20) return 4.6 + (28 - z) * 0.15;

    // Zone 4: Sequoia Treehouse Canopy (Z: 20 -> -25, y: 5.5m -> 9.2m)
    if (z > -14) {
      // Spiral ramp around sequoia
      const t = Math.min(1, Math.max(0, (20 - z) / 34));
      return 5.5 + t * 3.7;
    }
    if (z >= -25) {
      // Aerial Boardwalk
      return 9.2 - (-14 - z) * 0.15;
    }

    // Zone 5: Waterfall Cavern Gorge (Z: -25 -> -70, y: 7.5m -> 11.5m)
    if (z >= -70) {
      const cavernProg = (-25 - z) / 45;
      return 7.5 + cavernProg * 4.0;
    }

    // Zone 6: High Wind Chasm Bridge (Z: -70 -> -125, y: 11.5m -> 8.0m)
    if (z >= -125) {
      const isMissingGap =
        (z <= -78.8 && z >= -80.4) ||
        (z <= -91.0 && z >= -92.6) ||
        (z <= -102.8 && z >= -104.4) ||
        (z <= -115.0 && z >= -116.6);

      if (isMissingGap) return -12.0; // Canyon abyss drop

      if (Math.abs(x) <= 1.45) {
        const centerDist = Math.abs(z - (-97)) / 26;
        const bridgeSag = Math.sin((1 - Math.min(1, centerDist)) * Math.PI) * 1.1;
        return 11.5 - bridgeSag;
      }
      return -12.0;
    }

    // Zone 7: Summit Ridge Descent to Finish Bell (Z: -125 -> -175)
    if (z >= -155) {
      const descentProgress = (-125 - z) / 30;
      return 8.0 - descentProgress * 6.6;
    }

    return 1.4; // Finish Bell Clearing
  }

  public getSurfaceType(x: number, z: number): SurfaceType {
    if (z >= 60.5 && z <= 91.5) {
      for (const stone of CanopyRunScene.STEPPING_STONES) {
        if (Math.hypot(x - stone.x, z - stone.z) <= stone.r + 0.15) return 'stone';
      }
      if (x < -1.2 || x > 1.6) return 'wood';
    }
    if (z <= -14 && z >= -26) return 'wood'; // boardwalk
    if (z <= -70 && z >= -125 && Math.abs(x) <= 1.45) return 'wood'; // bridge
    if (z <= 60.5 && z >= 20) return 'stone';
    if (z <= -25 && z >= -70) return 'stone'; // cavern
    return 'dirt';
  }

  public getFallType(pos: THREE.Vector3): FallType | null {
    if (Math.abs(pos.x) > 38 || pos.z > 140 || pos.z < -180) return 'out';

    // River water fall (strictly within active water surface between Z: 91.5 and 60.5)
    if (pos.z >= 60.5 && pos.z <= 91.5 && pos.y < 0.08) {
      let onSolid = false;
      for (const stone of CanopyRunScene.STEPPING_STONES) {
        if (Math.hypot(pos.x - stone.x, pos.z - stone.z) <= stone.r + 0.18) {
          onSolid = true;
          break;
        }
      }
      if (!onSolid && pos.z >= 60 && pos.z <= 92) {
        const expectedX = -2.1 - 0.7 * Math.pow((pos.z - 76) / 16, 2);
        if (Math.abs(pos.x - expectedX) <= 0.65) onSolid = true;
      }
      if (!onSolid && pos.z >= 60 && pos.z <= 92 && pos.x >= 1.6 && pos.x <= 4.0) onSolid = true;

      if (!onSolid) return 'water';
    }

    // High Canopy Bridge Chasm Fall & Gap Drops
    if (pos.z >= -125 && pos.z <= -70) {
      if (Math.abs(pos.x) > 1.55 || pos.y < 8.5) return 'cliff';

      const isMissingGap =
        (pos.z <= -78.8 && pos.z >= -80.4) ||
        (pos.z <= -91.0 && pos.z >= -92.6) ||
        (pos.z <= -102.8 && pos.z >= -104.4) ||
        (pos.z <= -115.0 && pos.z >= -116.6);

      if (isMissingGap && pos.y < 10.8) return 'cliff';
    }

    if (pos.y < -2.0) return 'cliff';
    return null;
  }

  public isNearClimbLedge(pos: THREE.Vector3): boolean {
    if (pos.z >= 20 && pos.z <= 56) {
      const distToLedge = Math.abs(pos.z % 10);
      if (distToLedge < 1.4 && pos.x < -1.2) return true;
    }
    return false;
  }

  public isOnBalanceSurface(pos: THREE.Vector3): boolean {
    if (pos.z >= 60 && pos.z <= 92 && pos.x > -3.2 && pos.x < -1.4) return true;
    if (pos.z >= -122 && pos.z <= -72 && Math.abs(pos.x) > 0.9 && Math.abs(pos.x) <= 1.45) return true;
    return false;
  }

  public getCheckpoint(pos: THREE.Vector3, currentCpIndex: number): number {
    const nextIndex = Math.min(currentCpIndex + 1, this.checkpoints.length - 1);
    const target = this.checkpoints[nextIndex];
    const distSq = pos.distanceToSquared(target.position);

    if (distSq <= target.triggerRadiusSq) return nextIndex;
    return currentCpIndex;
  }

  private getTerrainBaseElevation(z: number): number {
    if (z > 94) return 0;
    if (z > 58) return 0;
    if (z > 20) return Math.min(5.5, (58 - z) * 0.14);
    if (z > -25) return 5.5;
    if (z > -70) return 7.5;
    if (z > -125) return 11.5;
    if (z > -155) return Math.max(1.4, 8.0 - (-125 - z) * 0.22);
    return 1.4;
  }

  /**
   * Call after renderer is created to generate IBL environment reflections
   * from the atmospheric sky dome for metallic and wet surface reflections.
   */
  public initEnvironmentMap(renderer: THREE.WebGLRenderer) {
    this.envLighting?.updateEnvironmentMap(renderer);
  }

  public dispose() {
    this.envLighting?.dispose();
    this.dynamicWater?.dispose();
    this.vfx.dispose();
    this.disposables.forEach((obj) => {
      this.scene.remove(obj);
      obj.traverse((child) => {
        const m = child as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material.dispose();
        }
      });
    });
  }
}
