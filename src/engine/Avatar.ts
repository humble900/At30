import * as THREE from 'three';

export class Avatar {
  public group: THREE.Group;
  private torso!: THREE.Mesh;
  private head!: THREE.Mesh;
  private leftArm!: THREE.Group;
  private rightArm!: THREE.Group;
  private leftLeg!: THREE.Group;
  private rightLeg!: THREE.Group;
  private shadowDecal!: THREE.Mesh;
  private nameSprite!: THREE.Sprite;

  private walkCycle: number = 0;
  private primaryColor: string = '#00F0FF';

  constructor(color: string = '#00F0FF', name: string = 'Explorer') {
    this.primaryColor = color;
    this.group = new THREE.Group();
    this.buildCharacter(name);
  }

  private buildCharacter(name: string) {
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xE8BEAC,
      roughness: 0.5,
      metalness: 0.1
    });

    const suitMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.primaryColor),
      roughness: 0.3,
      metalness: 0.4
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x1E222D,
      roughness: 0.7,
      metalness: 0.2
    });

    const visorMaterial = new THREE.MeshStandardMaterial({
      color: 0x00FFFF,
      emissive: 0x00A3FF,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9
    });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.3);
    this.torso = new THREE.Mesh(torsoGeo, suitMaterial);
    this.torso.position.y = 0.95;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Glowing Chest Core
    const coreGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16);
    coreGeo.rotateX(Math.PI / 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00FFFF,
      emissive: 0x00F0FF,
      emissiveIntensity: 0.8
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0.05, 0.16);
    this.torso.add(core);

    // Explorer Backpack
    const packGeo = new THREE.BoxGeometry(0.36, 0.45, 0.18);
    const pack = new THREE.Mesh(packGeo, darkMaterial);
    pack.position.set(0, 0.05, -0.22);
    this.torso.add(pack);

    // 2. Head
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.45;
    
    const headGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
    this.head = new THREE.Mesh(headGeo, skinMaterial);
    this.head.castShadow = true;
    headGroup.add(this.head);

    // Hair / Cap
    const capGeo = new THREE.BoxGeometry(0.34, 0.12, 0.34);
    const cap = new THREE.Mesh(capGeo, darkMaterial);
    cap.position.y = 0.12;
    headGroup.add(cap);

    // Visor
    const visorGeo = new THREE.BoxGeometry(0.28, 0.09, 0.06);
    const visor = new THREE.Mesh(visorGeo, visorMaterial);
    visor.position.set(0, 0.02, 0.17);
    headGroup.add(visor);

    this.group.add(headGroup);

    // 3. Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.35, 1.2, 0);
    const armGeo = new THREE.BoxGeometry(0.14, 0.55, 0.14);
    armGeo.translate(0, -0.25, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, suitMaterial);
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);
    this.group.add(this.leftArm);

    // 4. Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.35, 1.2, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, suitMaterial);
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);
    this.group.add(this.rightArm);

    // 5. Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.16, 0.65, 0);
    const legGeo = new THREE.BoxGeometry(0.16, 0.65, 0.16);
    legGeo.translate(0, -0.3, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, darkMaterial);
    leftLegMesh.castShadow = true;
    this.leftLeg.add(leftLegMesh);
    this.group.add(this.leftLeg);

    // 6. Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.16, 0.65, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, darkMaterial);
    rightLegMesh.castShadow = true;
    this.rightLeg.add(rightLegMesh);
    this.group.add(this.rightLeg);

    // 7. Soft Shadow Decal
    const shadowGeo = new THREE.CircleGeometry(0.4, 24);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4
    });
    this.shadowDecal = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowDecal.position.y = 0.02;
    this.group.add(this.shadowDecal);

    // 8. Name Tag Billboard Sprite
    this.nameSprite = this.createNameTagSprite(name);
    this.nameSprite.position.set(0, 1.85, 0);
    this.group.add(this.nameSprite);
  }

  private createNameTagSprite(name: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(15, 17, 23, 0.75)';
    ctx.strokeStyle = this.primaryColor;
    ctx.lineWidth = 3;
    ctx.roundRect(10, 10, 236, 44, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 128, 38);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.35, 1);
    return sprite;
  }

  public updateName(name: string) {
    if (this.nameSprite) {
      this.group.remove(this.nameSprite);
      this.nameSprite = this.createNameTagSprite(name);
      this.nameSprite.position.set(0, 1.85, 0);
      this.group.add(this.nameSprite);
    }
  }

  public setColor(color: string) {
    this.primaryColor = color;
  }

  public animate(isMoving: boolean, speedMultiplier: number = 1, delta: number = 0.016): boolean {
    let triggeredStep = false;
    if (isMoving) {
      this.walkCycle += delta * 12 * speedMultiplier;
      
      const armAngle = Math.sin(this.walkCycle) * 0.6;
      const legAngle = Math.sin(this.walkCycle) * 0.7;

      this.leftArm.rotation.x = armAngle;
      this.rightArm.rotation.x = -armAngle;
      this.leftLeg.rotation.x = -legAngle;
      this.rightLeg.rotation.x = legAngle;

      // Subtle torso bob
      this.torso.position.y = 0.95 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.04;
      
      // Step sound cadence trigger
      if (Math.sin(this.walkCycle) > 0.95) {
        triggeredStep = true;
      }
    } else {
      // Smoothly return to neutral idle stance
      this.leftArm.rotation.x *= 0.8;
      this.rightArm.rotation.x *= 0.8;
      this.leftLeg.rotation.x *= 0.8;
      this.rightLeg.rotation.x *= 0.8;
      this.torso.position.y = 0.95 + Math.sin(Date.now() * 0.003) * 0.02; // Gentle breathing idle
    }
    return triggeredStep;
  }
}
