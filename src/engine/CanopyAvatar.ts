import * as THREE from 'three';
import { RiggedAvatar, type RiggedPose } from './RiggedAvatar';

export type CanopyPose =
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

export interface AvatarCustomization {
  jacketColor: string;
  hasGlasses: boolean;
  hairStyle?: 'bun' | 'dreads' | 'short';
  name: string;
}

export const AVATAR_COLORWAYS = [
  { key: 'lime', name: 'Alpine Lime', hex: '#84CC16', jacket: '#84CC16', pants: '#1F2937', shoes: '#84CC16' },
  { key: 'cobalt', name: 'Cobalt Runner', hex: '#2563EB', jacket: '#2563EB', pants: '#111827', shoes: '#2563EB' },
  { key: 'plum', name: 'Plum Trail', hex: '#86198F', jacket: '#86198F', pants: '#1F2937', shoes: '#86198F' },
  { key: 'ochre', name: 'Golden Ochre', hex: '#D97706', jacket: '#D97706', pants: '#18181B', shoes: '#D97706' },
  { key: 'coral', name: 'Sunset Coral', hex: '#EA580C', jacket: '#EA580C', pants: '#292524', shoes: '#EA580C' },
  { key: 'slate', name: 'Slate Obsidian', hex: '#475569', jacket: '#475569', pants: '#0F172A', shoes: '#38BDF8' },
];

/**
 * Production-Grade Skinned Explorer Avatar
 * Powered by RiggedAvatar SkinnedMesh skeletal deformation & AnimationMixer blend trees.
 */
export class CanopyAvatar {
  public group = new THREE.Group();
  public riggedAvatar: RiggedAvatar;
  public onFootstep?: (side: 'left' | 'right') => void;

  private pose: CanopyPose = 'idle';

  constructor(customization: Partial<AvatarCustomization> = {}) {
    const jacketHex = customization.jacketColor || '#84CC16';
    const showGlasses = customization.hasGlasses ?? true;
    const displayName = customization.name || 'Runner';

    this.riggedAvatar = new RiggedAvatar({
      jacketColor: jacketHex,
      hasGlasses: showGlasses,
      name: displayName
    });

    this.riggedAvatar.onFootstep = (side) => {
      this.onFootstep?.(side);
    };

    this.group.add(this.riggedAvatar.group);
  }

  public setGlasses(show: boolean) {
    // Handled via rigged accessories
    this.riggedAvatar.group.traverse((child) => {
      if (child.name === 'HeadAttachment') {
        const frame = child.children.find((c) => c instanceof THREE.Mesh && c.geometry instanceof THREE.BoxGeometry);
        if (frame) frame.visible = show;
      }
    });
  }

  public setJacketColor(colorHex: string) {
    this.riggedAvatar.setJacketColor(colorHex);
  }

  public setPose(newPose: CanopyPose) {
    if (this.pose !== newPose) {
      this.pose = newPose;
      this.riggedAvatar.playPose(newPose as RiggedPose, 0.2);
    }
  }

  public update(delta: number, isMoving: boolean, speedMultiplier: number = 1) {
    this.riggedAvatar.update(delta, isMoving, speedMultiplier);
  }

  public showSpeech(text: string, durationMs: number = 6000) {
    this.riggedAvatar.showSpeech(text, durationMs);
  }

  public dispose() {
    this.riggedAvatar.dispose();
    this.group.remove(this.riggedAvatar.group);
  }
}
