import * as THREE from 'three';
import { RiggedAvatar } from './RiggedAvatar';

export class Avatar {
  public group: THREE.Group;
  public riggedAvatar: RiggedAvatar;
  private shadowDecal: THREE.Mesh;

  constructor(color: string = '#00F0FF', name: string = 'Explorer') {
    this.group = new THREE.Group();
    this.group.name = 'AvatarRoot';

    this.riggedAvatar = new RiggedAvatar({
      jacketColor: color,
      name
    });
    this.group.add(this.riggedAvatar.group);

    // Soft Ground Contact Shadow Decal
    const shadowGeo = new THREE.CircleGeometry(0.35, 24);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35
    });
    this.shadowDecal = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowDecal.position.y = 0.02;
    this.group.add(this.shadowDecal);
  }

  public updateName(name: string) {
    this.riggedAvatar.updateNameTag(name);
  }

  public setColor(color: string) {
    this.riggedAvatar.setJacketColor(color);
  }

  public showSpeech(rawText: string, durationMs: number = 6000) {
    this.riggedAvatar.showSpeech(rawText, durationMs);
  }

  public updateSpeech() {
    // Handled inside riggedAvatar.update()
  }

  public animate(isMoving: boolean, speedMultiplier: number = 1, delta: number = 0.016): boolean {
    if (isMoving) {
      if (speedMultiplier > 1.3) {
        this.riggedAvatar.playPose('sprint', 0.2);
      } else if (speedMultiplier > 0.8) {
        this.riggedAvatar.playPose('run', 0.2);
      } else {
        this.riggedAvatar.playPose('walk', 0.2);
      }
    } else {
      this.riggedAvatar.playPose('idle', 0.25);
    }

    return this.riggedAvatar.update(delta, isMoving, speedMultiplier);
  }

  public dispose() {
    this.riggedAvatar.dispose();
    this.shadowDecal.geometry.dispose();
    (this.shadowDecal.material as THREE.Material).dispose();
  }
}
