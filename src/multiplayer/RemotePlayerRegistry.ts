import * as THREE from 'three';
import { Avatar } from '../engine/Avatar';
import type { AvatarSpeechMessage, PlayerPresence, PlayerTransformMessage } from './types';

interface RemotePlayer { avatar: Avatar; presence: PlayerPresence; targetPosition: THREE.Vector3; targetRotation: number; animation: PlayerTransformMessage['animation']; lastSequence: number; }

export class RemotePlayerRegistry {
  private readonly players = new Map<string, RemotePlayer>();
  private readonly scene: THREE.Scene;
  constructor(scene: THREE.Scene) { this.scene = scene; }

  sync(presence: PlayerPresence[]) {
    const activeIds = new Set(presence.map((player) => player.sessionId));
    for (const player of presence) {
      if (this.players.has(player.sessionId)) continue;
      const avatar = new Avatar(player.avatarColor, player.displayName);
      avatar.group.position.set(0, 0, 13.5);
      this.scene.add(avatar.group);
      avatar.group.userData.sessionId = player.sessionId;
      this.players.set(player.sessionId, { avatar, presence: player, targetPosition: avatar.group.position.clone(), targetRotation: Math.PI, animation: 'idle', lastSequence: -1 });
    }
    for (const [sessionId, player] of this.players) {
      if (!activeIds.has(sessionId)) { this.scene.remove(player.avatar.group); player.avatar.dispose(); this.players.delete(sessionId); }
    }
  }

  applyTransform(message: PlayerTransformMessage) {
    const player = this.players.get(message.sessionId);
    if (!player || message.sequence <= player.lastSequence) return;
    player.lastSequence = message.sequence;
    player.targetPosition.set(message.position.x, message.position.y, message.position.z);
    player.targetRotation = message.rotationY;
    player.animation = message.animation;
  }

  showSpeech(message: AvatarSpeechMessage) { this.players.get(message.sessionId)?.avatar.showSpeech(message.text, Math.max(0, message.expiresAt - Date.now())); }

  pickPlayer(camera: THREE.Camera, normalizedX: number, normalizedY: number, localPosition: THREE.Vector3, maxDistance = 10) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), camera);
    const hits = raycaster.intersectObjects(Array.from(this.players.values()).map(player => player.avatar.group), true);
    for (const hit of hits) {
      let object: THREE.Object3D | null = hit.object;
      while (object && !object.userData.sessionId) object = object.parent;
      const sessionId = object?.userData.sessionId as string | undefined;
      const player = sessionId ? this.players.get(sessionId) : undefined;
      if (player && player.avatar.group.position.distanceTo(localPosition) <= maxDistance) {
        return { sessionId: player.presence.sessionId, displayName: player.presence.displayName };
      }
    }
    return null;
  }

  update(delta: number) {
    for (const player of this.players.values()) {
      const distance = player.avatar.group.position.distanceTo(player.targetPosition);
      player.avatar.group.position.lerp(player.targetPosition, 1 - Math.exp(-12 * delta));
      player.avatar.group.rotation.y = THREE.MathUtils.lerp(player.avatar.group.rotation.y, player.targetRotation, 1 - Math.exp(-14 * delta));
      player.avatar.animate(distance > 0.015 || player.animation !== 'idle', player.animation === 'run' ? 1.7 : 1, delta);
      player.avatar.updateSpeech();
    }
  }

  dispose() { for (const player of this.players.values()) { this.scene.remove(player.avatar.group); player.avatar.dispose(); } this.players.clear(); }
}
