import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { TextureGenerator } from './TextureGenerator';

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

    const isDefaultCyan = jacketColorHex.toUpperCase() === '#00F0FF';
    const suitBaseColor = isDefaultCyan ? '#2B2F38' : jacketColorHex;

    // ── Procedural PBR Textures ──
    const fabricNormal = TextureGenerator.createFabricNormalMap();
    const skinNormal = TextureGenerator.createSkinNormalMap();
    const leatherNormal = TextureGenerator.createLeatherNormalMap();
    const faceTexture = TextureGenerator.createCuratorFaceTexture();
    const badgeTexture = TextureGenerator.createCuratorBadgeTexture();

    // ── Curated Materials Matching Vance Reference ──
    const suitMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(suitBaseColor),
      roughness: 0.82,
      metalness: 0.04,
      normalMap: fabricNormal
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0E9AA8'), // Iconic teal dress shirt
      roughness: 0.68,
      metalness: 0.02,
      normalMap: fabricNormal
    });

    const trousersMat = new THREE.MeshStandardMaterial({
      color: 0x252830, // Charcoal tailored trousers
      roughness: 0.84,
      metalness: 0.04,
      normalMap: fabricNormal
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xD69F82, // Warm Mediterranean/Caucasian skin
      roughness: 0.58,
      metalness: 0.0,
      normalMap: skinNormal,
      normalScale: new THREE.Vector2(0.25, 0.25)
    });

    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.55,
      metalness: 0.0
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x221B17, // Natural dark brunette/charcoal
      roughness: 0.74,
      metalness: 0.04
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0x16171B, // Polished black/charcoal dress leather
      roughness: 0.36,
      metalness: 0.08,
      normalMap: leatherNormal
    });

    const shoeSoleMat = new THREE.MeshStandardMaterial({
      color: 0x0E0F12,
      roughness: 0.85
    });

    const badgeMat = new THREE.MeshStandardMaterial({
      map: badgeTexture,
      roughness: 0.25,
      metalness: 0.75
    });

    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0x121418,
      roughness: 0.3
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

    // ── 2. Sculpted Anatomical Character Attachments ──

    // ── PELVIS & TROUSER TOP ──
    const pelvisGeo = new THREE.BoxGeometry(0.36, 0.16, 0.22);
    const pelvisMesh = mkMesh(pelvisGeo, trousersMat);
    pelvisMesh.name = 'CharacterSuitPelvis';
    hipsBone.add(pelvisMesh);

    // ── SPINE / LOWER JACKET WAIST ──
    const waistGeo = new THREE.BoxGeometry(0.40, 0.20, 0.24);
    const waistMesh = mkMesh(waistGeo, suitMat);
    waistMesh.name = 'CharacterSuitWaist';
    spineBone.add(waistMesh);

    // Waist button (lower suit button)
    const buttonGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.008, 12);
    buttonGeo.rotateX(Math.PI / 2);
    const waistButton = mkMesh(buttonGeo, buttonMat);
    waistButton.position.set(0, 0.04, 0.125);
    spineBone.add(waistButton);

    // ── CHEST / TAILORED SUIT JACKET & TEAL SHIRT ──
    // Base Teal Collared Dress Shirt
    const shirtChestGeo = new THREE.BoxGeometry(0.37, 0.32, 0.22);
    chestBone.add(mkMesh(shirtChestGeo, shirtMat));

    // Tailored Suit Jacket Outer Shell (Back, Sides & Shoulders)
    const jacketBackGeo = new THREE.BoxGeometry(0.44, 0.33, 0.14);
    jacketBackGeo.translate(0, 0, -0.06);
    const jacketBackMesh = mkMesh(jacketBackGeo, suitMat);
    jacketBackMesh.name = 'CharacterSuitChestBack';
    chestBone.add(jacketBackMesh);

    // Jacket Left Chest Flap
    const jacketLGeo = new THREE.BoxGeometry(0.14, 0.32, 0.12);
    jacketLGeo.translate(-0.14, 0, 0.07);
    const jacketLMesh = mkMesh(jacketLGeo, suitMat);
    jacketLMesh.name = 'CharacterSuitChestL';
    chestBone.add(jacketLMesh);

    // Jacket Right Chest Flap
    const jacketRGeo = new THREE.BoxGeometry(0.14, 0.32, 0.12);
    jacketRGeo.translate(0.14, 0, 0.07);
    const jacketRMesh = mkMesh(jacketRGeo, suitMat);
    jacketRMesh.name = 'CharacterSuitChestR';
    chestBone.add(jacketRMesh);

    // Suit Notched Lapels (Left & Right)
    const lapelGeoL = new THREE.BoxGeometry(0.065, 0.24, 0.015);
    lapelGeoL.rotateZ(0.24);
    const lapelL = mkMesh(lapelGeoL, suitMat);
    lapelL.name = 'CharacterSuitLapelL';
    lapelL.position.set(-0.075, 0.03, 0.135);
    chestBone.add(lapelL);

    const lapelGeoR = new THREE.BoxGeometry(0.065, 0.24, 0.015);
    lapelGeoR.rotateZ(-0.24);
    const lapelR = mkMesh(lapelGeoR, suitMat);
    lapelR.name = 'CharacterSuitLapelR';
    lapelR.position.set(0.075, 0.03, 0.135);
    chestBone.add(lapelR);

    // Top Suit Button
    const chestButton = mkMesh(buttonGeo, buttonMat);
    chestButton.position.set(0, -0.08, 0.135);
    chestBone.add(chestButton);

    // Left Breast Pocket & "AT30 / CURATOR VANCE" ID Badge
    const pocketGeo = new THREE.BoxGeometry(0.085, 0.012, 0.008);
    const pocket = mkMesh(pocketGeo, suitMat);
    pocket.position.set(-0.115, 0.055, 0.134);
    chestBone.add(pocket);

    const badgeGeo = new THREE.BoxGeometry(0.075, 0.028, 0.006);
    const badgeMesh = mkMesh(badgeGeo, badgeMat);
    badgeMesh.position.set(-0.115, 0.068, 0.140);
    chestBone.add(badgeMesh);

    // Teal Shirt Collar Wings (Unbuttoned Executive Look)
    const collarWingGeoL = new THREE.BoxGeometry(0.055, 0.032, 0.01);
    collarWingGeoL.rotateZ(0.4);
    const collarL = mkMesh(collarWingGeoL, shirtMat);
    collarL.position.set(-0.045, 0.15, 0.118);
    chestBone.add(collarL);

    const collarWingGeoR = new THREE.BoxGeometry(0.055, 0.032, 0.01);
    collarWingGeoR.rotateZ(-0.4);
    const collarR = mkMesh(collarWingGeoR, shirtMat);
    collarR.position.set(0.045, 0.15, 0.118);
    chestBone.add(collarR);

    // Exposed Collarbone / Neck V-opening Skin
    const vSkinGeo = new THREE.BufferGeometry();
    const vSkinVerts = new Float32Array([
      -0.035, 0.14, 0.114,
       0.035, 0.14, 0.114,
       0.0,   0.03, 0.114
    ]);
    vSkinGeo.setAttribute('position', new THREE.BufferAttribute(vSkinVerts, 3));
    vSkinGeo.computeVertexNormals();
    const vSkinMesh = new THREE.Mesh(vSkinGeo, skinMat);
    chestBone.add(vSkinMesh);

    // ── NECK ──
    const neckGeo = new THREE.CylinderGeometry(0.062, 0.072, 0.14, 16);
    const neckMesh = mkMesh(neckGeo, skinMat);
    neckMesh.position.y = 0.07;
    neckBone.add(neckMesh);

    // ── HEAD & REALISTIC FACIAL ANATOMY ──
    // Cranium / Head Base
    const headCraniumGeo = new THREE.BoxGeometry(0.21, 0.22, 0.21);
    headCraniumGeo.translate(0, 0.08, -0.01);
    headBone.add(mkMesh(headCraniumGeo, skinMat));

    // Sculpted Jawline & Chin
    const jawGeo = new THREE.BoxGeometry(0.18, 0.09, 0.16);
    jawGeo.translate(0, -0.01, 0.015);
    headBone.add(mkMesh(jawGeo, skinMat));

    // Anatomical Front Face Plane (eyes, irises, brows, nose shading, lips)
    const facePlaneGeo = new THREE.PlaneGeometry(0.19, 0.21);
    const facePlaneMesh = new THREE.Mesh(facePlaneGeo, faceMat);
    facePlaneMesh.position.set(0, 0.075, 0.106);
    headBone.add(facePlaneMesh);

    // 3D Nose Bridge & Tip (gives dimensional profile)
    const noseGeo = new THREE.ConeGeometry(0.018, 0.055, 4);
    noseGeo.rotateX(Math.PI / 2);
    noseGeo.rotateY(Math.PI / 4);
    const noseMesh = mkMesh(noseGeo, skinMat);
    noseMesh.position.set(0, 0.072, 0.118);
    headBone.add(noseMesh);

    // Sculpted Ears
    const earGeo = new THREE.CylinderGeometry(0.014, 0.010, 0.045, 8);
    earGeo.rotateZ(Math.PI / 2);
    earGeo.rotateY(0.2);

    const earL = mkMesh(earGeo, skinMat);
    earL.position.set(-0.112, 0.075, -0.01);
    headBone.add(earL);

    const earR = mkMesh(earGeo, skinMat);
    earR.position.set(0.112, 0.075, -0.01);
    headBone.add(earR);

    // ── NATURAL STYLED BRUNETTE HAIR (Matching Vance Reference) ──
    // Top styled volume cap (side-part contour)
    const hairTopGeo = new THREE.BoxGeometry(0.225, 0.07, 0.225);
    hairTopGeo.translate(0, 0.19, -0.01);
    headBone.add(mkMesh(hairTopGeo, hairMat));

    // Forehead hair sweep fringe
    const hairFringeGeo = new THREE.BoxGeometry(0.21, 0.035, 0.08);
    hairFringeGeo.rotateX(-0.25);
    hairFringeGeo.translate(0.01, 0.175, 0.085);
    headBone.add(mkMesh(hairFringeGeo, hairMat));

    // Sideburns and temples
    const sideburnGeo = new THREE.BoxGeometry(0.018, 0.12, 0.16);
    const sideburnL = mkMesh(sideburnGeo, hairMat);
    sideburnL.position.set(-0.110, 0.11, -0.02);
    headBone.add(sideburnL);

    const sideburnR = mkMesh(sideburnGeo, hairMat);
    sideburnR.position.set(0.110, 0.11, -0.02);
    headBone.add(sideburnR);

    // Back hair fade down to neck
    const backHairGeo = new THREE.BoxGeometry(0.19, 0.14, 0.03);
    const backHair = mkMesh(backHairGeo, hairMat);
    backHair.position.set(0, 0.09, -0.115);
    headBone.add(backHair);

    // ── ARMS & HANDS ──
    const armGeo = new THREE.BoxGeometry(0.13, 0.30, 0.13);
    armGeo.translate(0, -0.12, 0);

    const forearmGeo = new THREE.BoxGeometry(0.12, 0.25, 0.12);
    forearmGeo.translate(0, -0.10, 0);

    // Suit sleeve wrist cuff
    const cuffGeo = new THREE.BoxGeometry(0.126, 0.025, 0.126);
    cuffGeo.translate(0, -0.22, 0);

    // Teal dress shirt cuff peeking from suit sleeve
    const shirtCuffGeo = new THREE.BoxGeometry(0.118, 0.015, 0.118);
    shirtCuffGeo.translate(0, -0.235, 0);

    // Anatomical Hands with thumb definition
    const palmGeo = new THREE.BoxGeometry(0.075, 0.075, 0.04);
    palmGeo.translate(0, -0.035, 0);
    const thumbGeo = new THREE.BoxGeometry(0.024, 0.04, 0.024);
    const fingersGeo = new THREE.BoxGeometry(0.07, 0.05, 0.03);
    fingersGeo.translate(0, -0.08, 0.005);

    // Left Arm assembly
    const leftArmMesh = mkMesh(armGeo, suitMat);
    leftArmMesh.name = 'CharacterSuitArmL';
    leftArm.add(leftArmMesh);

    const leftForeArmMesh = mkMesh(forearmGeo, suitMat);
    leftForeArmMesh.name = 'CharacterSuitForeArmL';
    leftForeArm.add(leftForeArmMesh);
    leftForeArm.add(mkMesh(cuffGeo, suitMat));
    leftForeArm.add(mkMesh(shirtCuffGeo, shirtMat));

    const leftHandPalm = mkMesh(palmGeo, skinMat);
    const leftThumb = mkMesh(thumbGeo, skinMat);
    leftThumb.position.set(0.042, -0.03, 0.01);
    leftThumb.rotation.z = 0.35;
    leftHandPalm.add(leftThumb);
    leftHandPalm.add(mkMesh(fingersGeo, skinMat));
    leftHand.add(leftHandPalm);

    // Right Arm assembly
    const rightArmMesh = mkMesh(armGeo, suitMat);
    rightArmMesh.name = 'CharacterSuitArmR';
    rightArm.add(rightArmMesh);

    const rightForeArmMesh = mkMesh(forearmGeo, suitMat);
    rightForeArmMesh.name = 'CharacterSuitForeArmR';
    rightForeArm.add(rightForeArmMesh);
    rightForeArm.add(mkMesh(cuffGeo, suitMat));
    rightForeArm.add(mkMesh(shirtCuffGeo, shirtMat));

    const rightHandPalm = mkMesh(palmGeo, skinMat);
    const rightThumb = mkMesh(thumbGeo, skinMat);
    rightThumb.position.set(-0.042, -0.03, 0.01);
    rightThumb.rotation.z = -0.35;
    rightHandPalm.add(rightThumb);
    rightHandPalm.add(mkMesh(fingersGeo, skinMat));
    rightHand.add(rightHandPalm);

    // ── LEGS & TAILORED TROUSERS ──
    const thighGeo = new THREE.BoxGeometry(0.145, 0.44, 0.15);
    thighGeo.translate(0, -0.20, 0);

    const shinGeo = new THREE.BoxGeometry(0.135, 0.42, 0.14);
    shinGeo.translate(0, -0.19, 0);

    // Trouser hem cuff at ankle
    const hemGeo = new THREE.BoxGeometry(0.142, 0.03, 0.148);
    hemGeo.translate(0, -0.38, 0);

    leftUpLeg.add(mkMesh(thighGeo, trousersMat));
    leftLeg.add(mkMesh(shinGeo, trousersMat));
    leftLeg.add(mkMesh(hemGeo, trousersMat));

    rightUpLeg.add(mkMesh(thighGeo, trousersMat));
    rightLeg.add(mkMesh(shinGeo, trousersMat));
    rightLeg.add(mkMesh(hemGeo, trousersMat));

    // ── OXFORD LEATHER DRESS SHOES ──
    const shoeUpperGeo = new THREE.BoxGeometry(0.132, 0.075, 0.22);
    const shoeToeCapGeo = new THREE.BoxGeometry(0.128, 0.055, 0.07);
    const shoeHeelGeo = new THREE.BoxGeometry(0.125, 0.03, 0.075);
    const shoeWeltGeo = new THREE.BoxGeometry(0.138, 0.018, 0.235);

    [leftFoot, rightFoot].forEach((foot) => {
      // Main shoe upper body
      const upper = mkMesh(shoeUpperGeo, shoeMat);
      upper.position.set(0, 0.045, 0.025);
      foot.add(upper);

      // Toe cap (smooth tapered front)
      const toeCap = mkMesh(shoeToeCapGeo, shoeMat);
      toeCap.position.set(0, 0.035, 0.115);
      foot.add(toeCap);

      // Raised rear heel block
      const heel = mkMesh(shoeHeelGeo, shoeSoleMat);
      heel.position.set(0, 0.015, -0.05);
      foot.add(heel);

      // Outsole welt rim
      const welt = mkMesh(shoeWeltGeo, shoeSoleMat);
      welt.position.set(0, 0.009, 0.025);
      foot.add(welt);
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
