import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export interface RiggedCharacterAsset {
  model: THREE.Group;
  skeleton: THREE.Skeleton;
  animations: Map<string, THREE.AnimationClip>;
  isProceduralRig: boolean;
}

export class CharacterModelLoader {
  private static instance: CharacterModelLoader | null = null;
  private loader: GLTFLoader;
  private cache: Map<string, { scene: THREE.Group; animations: THREE.AnimationClip[] }> = new Map();
  private loadingPromises: Map<string, Promise<RiggedCharacterAsset>> = new Map();

  private constructor() {
    this.loader = new GLTFLoader();
  }

  public static getInstance(): CharacterModelLoader {
    if (!CharacterModelLoader.instance) {
      CharacterModelLoader.instance = new CharacterModelLoader();
    }
    return CharacterModelLoader.instance;
  }

  /**
   * Load a GLB/GLTF character model or generate a procedural rigged skinned mesh fallback.
   */
  public async loadCharacter(url?: string, jacketColorHex: string = '#00F0FF'): Promise<RiggedCharacterAsset> {
    if (url && this.cache.has(url)) {
      const cached = this.cache.get(url)!;
      const clone = SkeletonUtils.clone(cached.scene) as THREE.Group;
      const animMap = new Map<string, THREE.AnimationClip>();
      cached.animations.forEach((clip) => animMap.set(clip.name.toLowerCase(), clip));
      const skeleton = this.findSkeleton(clone);
      return {
        model: clone,
        skeleton: skeleton || new THREE.Skeleton([]),
        animations: animMap,
        isProceduralRig: false
      };
    }

    if (url) {
      if (this.loadingPromises.has(url)) {
        return this.loadingPromises.get(url)!;
      }

      const loadPromise = new Promise<RiggedCharacterAsset>((resolve) => {
        this.loader.load(
          url,
          (gltf) => {
            this.cache.set(url, { scene: gltf.scene, animations: gltf.animations });
            const clone = SkeletonUtils.clone(gltf.scene) as THREE.Group;
            const animMap = new Map<string, THREE.AnimationClip>();
            gltf.animations.forEach((clip) => animMap.set(clip.name.toLowerCase(), clip));
            const skeleton = this.findSkeleton(clone);
            this.loadingPromises.delete(url);
            resolve({
              model: clone,
              skeleton: skeleton || new THREE.Skeleton([]),
              animations: animMap,
              isProceduralRig: false
            });
          },
          undefined,
          () => {
            this.loadingPromises.delete(url);
            resolve(this.createProceduralRiggedCharacter(jacketColorHex));
          }
        );
      });

      this.loadingPromises.set(url, loadPromise);
      return loadPromise;
    }

    return this.createProceduralRiggedCharacter(jacketColorHex);
  }

  private findSkeleton(root: THREE.Object3D): THREE.Skeleton | null {
    let skeleton: THREE.Skeleton | null = null;
    root.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.skeleton) {
        skeleton = child.skeleton;
      }
    });
    return skeleton;
  }

  /**
   * Generates a sleek, athletic stylized rigged Explorer avatar
   * with complete humanoid bone hierarchy and detailed PBR mesh attachments.
   */
  public createProceduralRiggedCharacter(jacketColorHex: string = '#00F0FF'): RiggedCharacterAsset {
    const rootGroup = new THREE.Group();
    rootGroup.name = 'RiggedHumanoidRoot';

    // ── Curated AAA Colorway & Materials (Tuned for Outdoor Sunlight) ──
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xD9A07E,
      roughness: 0.65,
      metalness: 0.02
    });

    const suitMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(jacketColorHex),
      roughness: 0.65,
      metalness: 0.08
    });

    const darkPantsMat = new THREE.MeshStandardMaterial({
      color: 0x14171F,
      roughness: 0.82,
      metalness: 0.05
    });

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00D4FF,
      emissive: 0x007799,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.85
    });

    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00F0FF,
      emissive: 0x00C8EE,
      emissiveIntensity: 0.7
    });

    const shoeSoleMat = new THREE.MeshStandardMaterial({
      color: 0xE5E7EB,
      roughness: 0.6
    });

    const mkMesh = (geo: THREE.BufferGeometry, mat: THREE.Material): THREE.Mesh => {
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    };

    // ── 1. Standard Humanoid Bone Hierarchy ──
    const rootBone = new THREE.Bone(); rootBone.name = 'Root'; rootBone.position.set(0, 0, 0);
    const hipsBone = new THREE.Bone(); hipsBone.name = 'Hips'; hipsBone.position.set(0, 0.92, 0);
    rootBone.add(hipsBone);

    const spineBone = new THREE.Bone(); spineBone.name = 'Spine'; spineBone.position.set(0, 0.15, 0);
    hipsBone.add(spineBone);

    const chestBone = new THREE.Bone(); chestBone.name = 'Chest'; chestBone.position.set(0, 0.22, 0);
    spineBone.add(chestBone);

    const neckBone = new THREE.Bone(); neckBone.name = 'Neck'; neckBone.position.set(0, 0.18, 0);
    chestBone.add(neckBone);

    const headBone = new THREE.Bone(); headBone.name = 'Head'; headBone.position.set(0, 0.12, 0);
    neckBone.add(headBone);

    // Left Arm
    const leftShoulder = new THREE.Bone(); leftShoulder.name = 'LeftShoulder'; leftShoulder.position.set(-0.25, 0.12, 0);
    chestBone.add(leftShoulder);
    const leftArm = new THREE.Bone(); leftArm.name = 'LeftArm'; leftArm.position.set(-0.1, 0, 0);
    leftShoulder.add(leftArm);
    const leftForeArm = new THREE.Bone(); leftForeArm.name = 'LeftForeArm'; leftForeArm.position.set(0, -0.28, 0);
    leftArm.add(leftForeArm);
    const leftHand = new THREE.Bone(); leftHand.name = 'LeftHand'; leftHand.position.set(0, -0.24, 0);
    leftForeArm.add(leftHand);

    // Right Arm
    const rightShoulder = new THREE.Bone(); rightShoulder.name = 'RightShoulder'; rightShoulder.position.set(0.25, 0.12, 0);
    chestBone.add(rightShoulder);
    const rightArm = new THREE.Bone(); rightArm.name = 'RightArm'; rightArm.position.set(0.1, 0, 0);
    rightShoulder.add(rightArm);
    const rightForeArm = new THREE.Bone(); rightForeArm.name = 'RightForeArm'; rightForeArm.position.set(0, -0.28, 0);
    rightArm.add(rightForeArm);
    const rightHand = new THREE.Bone(); rightHand.name = 'RightHand'; rightHand.position.set(0, -0.24, 0);
    rightForeArm.add(rightHand);

    // Left Leg
    const leftUpLeg = new THREE.Bone(); leftUpLeg.name = 'LeftUpLeg'; leftUpLeg.position.set(-0.15, -0.06, 0);
    hipsBone.add(leftUpLeg);
    const leftLeg = new THREE.Bone(); leftLeg.name = 'LeftLeg'; leftLeg.position.set(0, -0.42, 0);
    leftUpLeg.add(leftLeg);
    const leftFoot = new THREE.Bone(); leftFoot.name = 'LeftFoot'; leftFoot.position.set(0, -0.42, 0.04);
    leftLeg.add(leftFoot);

    // Right Leg
    const rightUpLeg = new THREE.Bone(); rightUpLeg.name = 'RightUpLeg'; rightUpLeg.position.set(0.15, -0.06, 0);
    hipsBone.add(rightUpLeg);
    const rightLeg = new THREE.Bone(); rightLeg.name = 'RightLeg'; rightLeg.position.set(0, -0.42, 0);
    rightUpLeg.add(rightLeg);
    const rightFoot = new THREE.Bone(); rightFoot.name = 'RightFoot'; rightFoot.position.set(0, -0.42, 0.04);
    rightLeg.add(rightFoot);

    const bones = [
      rootBone, hipsBone, spineBone, chestBone, neckBone, headBone,
      leftShoulder, leftArm, leftForeArm, leftHand,
      rightShoulder, rightArm, rightForeArm, rightHand,
      leftUpLeg, leftLeg, leftFoot,
      rightUpLeg, rightLeg, rightFoot
    ];
    const skeleton = new THREE.Skeleton(bones);
    rootGroup.add(rootBone);

    // ── 2. Attach Mesh Components to Corresponding Bones ──

    // PELVIS / HIPS
    const pelvisGeo = new THREE.BoxGeometry(0.38, 0.16, 0.24);
    hipsBone.add(mkMesh(pelvisGeo, darkPantsMat));

    // SPINE / LOWER TORSO
    const waistGeo = new THREE.BoxGeometry(0.42, 0.2, 0.26);
    spineBone.add(mkMesh(waistGeo, suitMat));

    // CHEST / UPPER TORSO
    const chestGeo = new THREE.BoxGeometry(0.48, 0.32, 0.28);
    const chestMesh = mkMesh(chestGeo, suitMat);
    chestMesh.name = 'CharacterSuitChest';
    chestBone.add(chestMesh);

    // Glowing Chest Arc Reactor Core
    const coreGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.04, 16);
    coreGeo.rotateX(Math.PI / 2);
    const coreMesh = mkMesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0.04, 0.15);
    chestBone.add(coreMesh);

    // Explorer Backpack
    const packGeo = new THREE.BoxGeometry(0.34, 0.42, 0.16);
    const packMesh = mkMesh(packGeo, darkPantsMat);
    packMesh.position.set(0, 0.02, -0.2);
    chestBone.add(packMesh);

    // NECK
    const neckGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.12, 10);
    neckBone.add(mkMesh(neckGeo, skinMat));

    // HEAD
    const headGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    headBone.add(mkMesh(headGeo, skinMat));

    // Tactical Explorer Cap / Hair
    const capGeo = new THREE.BoxGeometry(0.32, 0.11, 0.32);
    const capMesh = mkMesh(capGeo, darkPantsMat);
    capMesh.position.y = 0.11;
    headBone.add(capMesh);

    // Cyber Visor / Glasses
    const visorGeo = new THREE.BoxGeometry(0.26, 0.08, 0.06);
    const visorMesh = mkMesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.02, 0.16);
    headBone.add(visorMesh);

    // ARMS
    const armGeo = new THREE.BoxGeometry(0.13, 0.3, 0.13);
    armGeo.translate(0, -0.12, 0);

    const forearmGeo = new THREE.BoxGeometry(0.12, 0.26, 0.12);
    forearmGeo.translate(0, -0.11, 0);

    const handGeo = new THREE.BoxGeometry(0.09, 0.1, 0.09);
    handGeo.translate(0, -0.04, 0);

    const leftArmMesh = mkMesh(armGeo, suitMat);
    leftArmMesh.name = 'CharacterSuitArmL';
    leftArm.add(leftArmMesh);
    leftForeArm.add(mkMesh(forearmGeo, suitMat));
    leftHand.add(mkMesh(handGeo, skinMat));

    const rightArmMesh = mkMesh(armGeo, suitMat);
    rightArmMesh.name = 'CharacterSuitArmR';
    rightArm.add(rightArmMesh);
    rightForeArm.add(mkMesh(forearmGeo, suitMat));
    rightHand.add(mkMesh(handGeo, skinMat));

    // LEGS
    const legGeo = new THREE.BoxGeometry(0.15, 0.44, 0.15);
    legGeo.translate(0, -0.2, 0);

    const shinGeo = new THREE.BoxGeometry(0.14, 0.42, 0.14);
    shinGeo.translate(0, -0.2, 0);

    leftUpLeg.add(mkMesh(legGeo, darkPantsMat));
    leftLeg.add(mkMesh(shinGeo, darkPantsMat));
    rightUpLeg.add(mkMesh(legGeo, darkPantsMat));
    rightLeg.add(mkMesh(shinGeo, darkPantsMat));

    // RUNNING SHOES (Upper + Midsole + Tread)
    const shoeUpperGeo = new THREE.BoxGeometry(0.15, 0.09, 0.22);
    const shoeMidGeo = new THREE.BoxGeometry(0.16, 0.035, 0.24);

    [leftFoot, rightFoot].forEach((foot) => {
      const upper = mkMesh(shoeUpperGeo, suitMat);
      upper.position.set(0, 0.045, 0.03);
      foot.add(upper);

      const mid = mkMesh(shoeMidGeo, shoeSoleMat);
      mid.position.set(0, 0.015, 0.03);
      foot.add(mid);
    });

    // ── 3. Dynamic Skeletal Animation Clips ──
    const animations = this.generateProceduralHumanoidAnimations();

    return {
      model: rootGroup,
      skeleton,
      animations,
      isProceduralRig: true
    };
  }

  /**
   * Programmatically builds bone animation clips matching AAA motion-capture timing.
   */
  private generateProceduralHumanoidAnimations(): Map<string, THREE.AnimationClip> {
    const animMap = new Map<string, THREE.AnimationClip>();

    // 1. IDLE (Organic Breathing with subtle weight shift & spine rise)
    {
      const times = [0, 1.5, 3.0];
      const spineRotQ = [
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0.02, 0, 0)),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.02, 0, 0)),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0.02, 0, 0))
      ];
      const qValues: number[] = [];
      spineRotQ.forEach((q) => qValues.push(q.x, q.y, q.z, q.w));

      const spineTrack = new THREE.QuaternionKeyframeTrack('Spine.quaternion', times, qValues);
      const hipsPosTrack = new THREE.VectorKeyframeTrack('Hips.position', times, [
        0, 0.92, 0,
        0, 0.935, 0,
        0, 0.92, 0
      ]);

      animMap.set('idle', new THREE.AnimationClip('idle', 3.0, [spineTrack, hipsPosTrack]));
    }

    // 2. WALK (Cadence: 1.0s loop)
    {
      const times = [0, 0.25, 0.5, 0.75, 1.0];
      const leftLegTrack = this.createRotationTrack('LeftUpLeg.quaternion', times, [0.45, 0.0, -0.45, 0.0, 0.45], 'x');
      const rightLegTrack = this.createRotationTrack('RightUpLeg.quaternion', times, [-0.45, 0.0, 0.45, 0.0, -0.45], 'x');
      const leftArmTrack = this.createRotationTrack('LeftArm.quaternion', times, [-0.4, 0.0, 0.4, 0.0, -0.4], 'x');
      const rightArmTrack = this.createRotationTrack('RightArm.quaternion', times, [0.4, 0.0, -0.4, 0.0, 0.4], 'x');
      const hipsBobTrack = new THREE.VectorKeyframeTrack('Hips.position', times, [
        0, 0.92, 0,
        0, 0.94, 0,
        0, 0.92, 0,
        0, 0.94, 0,
        0, 0.92, 0
      ]);

      animMap.set('walk', new THREE.AnimationClip('walk', 1.0, [
        leftLegTrack, rightLegTrack, leftArmTrack, rightArmTrack, hipsBobTrack
      ]));
    }

    // 3. RUN / SPRINT (Cadence: 0.65s athletic sprint with forward spine lean)
    {
      const times = [0, 0.16, 0.325, 0.48, 0.65];
      const leftLegTrack = this.createRotationTrack('LeftUpLeg.quaternion', times, [0.75, 0.1, -0.65, 0.1, 0.75], 'x');
      const rightLegTrack = this.createRotationTrack('RightUpLeg.quaternion', times, [-0.65, 0.1, 0.75, 0.1, -0.65], 'x');
      const leftForeArmTrack = this.createRotationTrack('LeftForeArm.quaternion', times, [-0.7, -0.4, -0.7, -0.4, -0.7], 'x');
      const rightForeArmTrack = this.createRotationTrack('RightForeArm.quaternion', times, [-0.4, -0.7, -0.4, -0.7, -0.4], 'x');
      const leftArmTrack = this.createRotationTrack('LeftArm.quaternion', times, [-0.6, 0.0, 0.6, 0.0, -0.6], 'x');
      const rightArmTrack = this.createRotationTrack('RightArm.quaternion', times, [0.6, 0.0, -0.6, 0.0, 0.6], 'x');
      const spineLeanTrack = this.createRotationTrack('Spine.quaternion', times, [0.15, 0.12, 0.15, 0.12, 0.15], 'x');
      const hipsRunBob = new THREE.VectorKeyframeTrack('Hips.position', times, [
        0, 0.90, 0,
        0, 0.95, 0,
        0, 0.90, 0,
        0, 0.95, 0,
        0, 0.90, 0
      ]);

      animMap.set('run', new THREE.AnimationClip('run', 0.65, [
        leftLegTrack, rightLegTrack, leftArmTrack, rightArmTrack, leftForeArmTrack, rightForeArmTrack, spineLeanTrack, hipsRunBob
      ]));
      animMap.set('sprint', new THREE.AnimationClip('sprint', 0.55, [
        leftLegTrack, rightLegTrack, leftArmTrack, rightArmTrack, leftForeArmTrack, rightForeArmTrack, spineLeanTrack, hipsRunBob
      ]));
    }

    // 4. JUMP (Takeoff & In-Air Suspension)
    {
      const times = [0, 0.25, 0.6];
      const leftLegTrack = this.createRotationTrack('LeftUpLeg.quaternion', times, [-0.45, -0.65, -0.2], 'x');
      const rightLegTrack = this.createRotationTrack('RightUpLeg.quaternion', times, [-0.25, -0.5, -0.1], 'x');
      const leftArmTrack = this.createRotationTrack('LeftArm.quaternion', times, [-0.8, -1.2, -0.5], 'x');
      const rightArmTrack = this.createRotationTrack('RightArm.quaternion', times, [-0.8, -1.2, -0.5], 'x');

      animMap.set('jump', new THREE.AnimationClip('jump', 0.6, [leftLegTrack, rightLegTrack, leftArmTrack, rightArmTrack]));
    }

    // 5. STUMBLE & BALANCE RECOVERY
    {
      const times = [0, 0.2, 0.5, 0.8];
      const spineTrack = this.createRotationTrack('Spine.quaternion', times, [-0.25, 0.2, -0.1, 0.0], 'z');
      const leftArmTrack = this.createRotationTrack('LeftArm.quaternion', times, [0.8, -0.7, 0.4, 0.0], 'z');
      const rightArmTrack = this.createRotationTrack('RightArm.quaternion', times, [-0.8, 0.7, -0.4, 0.0], 'z');

      animMap.set('stumble', new THREE.AnimationClip('stumble', 0.8, [spineTrack, leftArmTrack, rightArmTrack]));
      animMap.set('balance', new THREE.AnimationClip('balance', 0.8, [spineTrack, leftArmTrack, rightArmTrack]));
    }

    return animMap;
  }

  private createRotationTrack(trackName: string, times: number[], angles: number[], axis: 'x' | 'y' | 'z'): THREE.QuaternionKeyframeTrack {
    const qValues: number[] = [];
    angles.forEach((angle) => {
      const euler = new THREE.Euler(
        axis === 'x' ? angle : 0,
        axis === 'y' ? angle : 0,
        axis === 'z' ? angle : 0
      );
      const q = new THREE.Quaternion().setFromEuler(euler);
      qValues.push(q.x, q.y, q.z, q.w);
    });
    return new THREE.QuaternionKeyframeTrack(trackName, times, qValues);
  }
}
