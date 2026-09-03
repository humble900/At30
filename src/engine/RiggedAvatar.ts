import * as THREE from 'three';
import { CharacterModelLoader, type RiggedCharacterAsset } from './CharacterModelLoader';

export type RiggedPose =
  | 'idle'
  | 'walk'
  | 'run'
  | 'sprint'
  | 'jump'
  | 'balance'
  | 'climb'
  | 'stumble'
  | 'fall'
  | 'contacted'
  | 'finish';

export interface RiggedAvatarOptions {
  jacketColor?: string;
  hasGlasses?: boolean;
  name?: string;
  modelUrl?: string;
}

export class RiggedAvatar {
  public group: THREE.Group = new THREE.Group();
  public mixer: THREE.AnimationMixer | null = null;
  public actions: Map<string, THREE.AnimationAction> = new Map();
  public currentAction: THREE.AnimationAction | null = null;
  public isLoaded: boolean = false;
  public currentPose: RiggedPose = 'idle';

  private asset: RiggedCharacterAsset | null = null;
  private jacketColor: string;
  private nameSprite: THREE.Sprite | null = null;
  private speechSprite: THREE.Sprite | null = null;
  private speechExpiresAt: number = 0;
  private walkCycleTimer: number = 0;
  public onFootstep?: (side: 'left' | 'right') => void;

  constructor(options: RiggedAvatarOptions = {}) {
    this.jacketColor = options.jacketColor || '#84CC16';
    this.group.name = 'RiggedAvatarContainer';

    // Initialize with rigged asset
    this.initCharacter(options);
    if (options.name) {
      this.updateNameTag(options.name);
    }
  }

  private async initCharacter(options: RiggedAvatarOptions) {
    const loader = CharacterModelLoader.getInstance();
    this.asset = await loader.loadCharacter(options.modelUrl, this.jacketColor);
    
    this.group.add(this.asset.model);
    this.mixer = new THREE.AnimationMixer(this.asset.model);

    // Setup animation actions
    this.asset.animations.forEach((clip, name) => {
      if (this.mixer) {
        const action = this.mixer.clipAction(clip);
        this.actions.set(name.toLowerCase(), action);
      }
    });

    // Start with idle animation
    this.playPose('idle', 0.1);
    this.isLoaded = true;
  }

  public playPose(pose: RiggedPose, crossFadeDuration: number = 0.25) {
    if (this.currentPose === pose && this.currentAction?.isRunning()) return;

    let targetActionName = 'idle';
    if (pose === 'walk') targetActionName = 'walk';
    else if (pose === 'run') targetActionName = 'run';
    else if (pose === 'sprint') targetActionName = 'sprint';
    else if (pose === 'jump') targetActionName = 'jump';
    else if (pose === 'stumble' || pose === 'contacted') targetActionName = 'stumble';
    else if (pose === 'balance' || pose === 'climb') targetActionName = 'balance';

    let nextAction = this.actions.get(targetActionName);
    if (!nextAction && this.actions.has('idle')) {
      nextAction = this.actions.get('idle')!;
    }

    if (nextAction) {
      if (this.currentAction && this.currentAction !== nextAction) {
        this.currentAction.fadeOut(crossFadeDuration);
        nextAction
          .reset()
          .setEffectiveTimeScale(1)
          .setEffectiveWeight(1)
          .fadeIn(crossFadeDuration)
          .play();
      } else {
        nextAction.reset().fadeIn(crossFadeDuration).play();
      }
      this.currentAction = nextAction;
      this.currentPose = pose;
    }
  }

  public update(delta: number, isMoving: boolean, speedRatio: number = 0): boolean {
    let stepTriggered = false;

    if (this.mixer) {
      // Adjust animation playback speed smoothly according to physical velocity
      if (this.currentAction && isMoving) {
        const speedScale = THREE.MathUtils.clamp(speedRatio * 1.5, 0.9, 2.8);
        this.currentAction.setEffectiveTimeScale(speedScale);
      }
      this.mixer.update(delta);
    }

    // Footstep cadence trigger
    if (isMoving) {
      this.walkCycleTimer += delta * (speedRatio > 1.2 ? 18 : 12);
      if (Math.sin(this.walkCycleTimer) > 0.96) {
        stepTriggered = true;
        const side = Math.cos(this.walkCycleTimer) > 0 ? 'left' : 'right';
        this.onFootstep?.(side);
      }
    }

    // Update speech expiry
    this.updateSpeech();

    return stepTriggered;
  }

  public setJacketColor(colorHex: string) {
    this.jacketColor = colorHex;
    if (this.asset) {
      this.asset.model.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name.startsWith('CharacterSuit')) {
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.color.set(colorHex);
          }
        }
      });
    }
  }

  public updateNameTag(name: string) {
    if (this.nameSprite) {
      this.group.remove(this.nameSprite);
      this.disposeSprite(this.nameSprite);
    }
    this.nameSprite = this.createNameTagSprite(name);
    this.nameSprite.position.set(0, 2.05, 0);
    this.group.add(this.nameSprite);
  }

  private createNameTagSprite(name: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(15, 17, 23, 0.85)';
    ctx.strokeStyle = this.jacketColor;
    ctx.lineWidth = 3;
    ctx.roundRect(8, 8, 240, 48, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.35, 1);
    return sprite;
  }

  public showSpeech(rawText: string, durationMs: number = 6000) {
    const text = rawText.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);
    if (!text) return;
    if (this.speechSprite) {
      this.group.remove(this.speechSprite);
      this.disposeSprite(this.speechSprite);
    }
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;
    context.fillStyle = 'rgba(255,255,255,0.96)';
    context.strokeStyle = '#101310';
    context.lineWidth = 4;
    context.roundRect(8, 8, 496, 96, 18);
    context.fill();
    context.stroke();
    context.fillStyle = '#101310';
    context.font = '600 24px Inter, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const displayText = text.length > 48 ? `${text.slice(0, 47)}…` : text;
    context.fillText(displayText, 256, 56, 460);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.speechSprite = new THREE.Sprite(material);
    this.speechSprite.scale.set(2.8, 0.7, 1);
    this.speechSprite.position.set(0, 2.5, 0);
    this.speechSprite.renderOrder = 50;
    this.group.add(this.speechSprite);
    this.speechExpiresAt = Date.now() + durationMs;
  }

  private updateSpeech() {
    if (this.speechSprite && Date.now() >= this.speechExpiresAt) {
      this.group.remove(this.speechSprite);
      this.disposeSprite(this.speechSprite);
      this.speechSprite = null;
    }
  }

  private disposeSprite(sprite: THREE.Sprite) {
    sprite.material.map?.dispose();
    sprite.material.dispose();
  }

  public dispose() {
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    if (this.nameSprite) {
      this.disposeSprite(this.nameSprite);
    }
    if (this.speechSprite) {
      this.disposeSprite(this.speechSprite);
    }
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => m.dispose());
      }
    });
  }
}
