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

    // Soft Ground Contact Ambient Occlusion Shadow Decal
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 62);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    sGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.35)');
    sGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.08)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(0.85, 0.85);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    this.shadowDecal = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowDecal.position.y = 0.02;
    this.group.add(this.shadowDecal);
  }

  public updateName(name: string) {
    this.riggedAvatar.updateNameTag(name);
  }

  /** Hide the floating name card (local player should not see their own). */
  public hideNameTag() {
    this.riggedAvatar.hideNameTag();
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
    const mat = this.shadowDecal.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    mat.dispose();
  }
}
