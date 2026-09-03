import * as THREE from 'three';
import { CanopyAvatar, type CanopyPose } from './CanopyAvatar';
import { CanopyRunScene, type FallType, type SurfaceType } from './CanopyRunScene';
import { canopyAudio } from '../utils/canopyAudio';

export interface ControllerState {
  stamina: number;
  maxStamina: number;
  isSprinting: boolean;
  isOnBalanceBeam: boolean;
  isNearLedge: boolean;
  activePrompt: string | null;
  speedKmh: number;
}

export class CanopyController {
  // Movement & physics vectors
  public position = new THREE.Vector3(0, 0, 130);
  private velocity = new THREE.Vector3();
  private velocityY = 0;
  private isGrounded = true;
  private currentGroundY = 0;
  private currentSurface: SurfaceType = 'dirt';

  // Jump Enhancements
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private isClimbing: boolean = false;
  private climbTimer: number = 0;

  // Stamina Burst
  public stamina: number = 100;
  public readonly maxStamina: number = 100;

  // Fall & Recovery State
  public checkpointIndex: number = 0;
  private fallingType: FallType | null = null;
  private fallDuration: number = 0;
  private isRecovering: boolean = false;
  private recoveryTimer: number = 0;

  // Camera Orbit
  private cameraOffset = new THREE.Vector3(1.35, 2.05, 3.85);
  private cameraLookAhead = new THREE.Vector3(0, 1.0, -4.4);
  private currentCameraPos = new THREE.Vector3(0, 4, 136);

  // Input bindings
  private keys = new Set<string>();
  private touchStick = { x: 0, y: 0 };
  private touchSprintActive = false;

  // Callbacks
  private avatar: CanopyAvatar;
  private camera: THREE.PerspectiveCamera;
  private world: CanopyRunScene;
  private onFall: (type: FallType) => void;
  private onCheckpoint: (index: number) => void;
  private onFinish: () => void;

  constructor(
    avatar: CanopyAvatar,
    camera: THREE.PerspectiveCamera,
    world: CanopyRunScene,
    onFall: (type: FallType) => void,
    onCheckpoint: (index: number) => void,
    onFinish: () => void
  ) {
    this.avatar = avatar;
    this.camera = camera;
    this.world = world;
    this.onFall = onFall;
    this.onCheckpoint = onCheckpoint;
    this.onFinish = onFinish;

    // Connect avatar footstep callback to audio and VFX engine
    this.avatar.onFootstep = () => {
      if (this.isGrounded && !this.fallingType) {
        canopyAudio.playFootstep(this.currentSurface);

        if (this.position.z >= 58 && this.position.z <= 94) {
          this.world.vfx.spawnWaterSplash(this.position);
        } else if (this.velocity.lengthSq() > 8) {
          this.world.vfx.spawnFootstepDust(this.position, this.velocity);
        }
      }
    };

    this.resetToStart();
    this.setupInputs();
  }

  private setupInputs() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keys.add(key);

    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      e.preventDefault();
    }

    if (key === ' ' || key === 'spacebar') {
      this.jumpBufferTimer = 0.15; // 150ms buffer
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  public setTouchStick(x: number, y: number) {
    this.touchStick = { x, y };
  }

  public setTouchSprint(active: boolean) {
    this.touchSprintActive = active;
  }

  public triggerTouchJump() {
    this.jumpBufferTimer = 0.15;
  }

  public resetToStart() {
    this.checkpointIndex = 0;
    this.position.copy(this.world.checkpoints[0].position);
    this.velocity.set(0, 0, 0);
    this.velocityY = 0;
    this.stamina = 100;
    this.fallingType = null;
    this.isRecovering = false;
    this.avatar.group.position.copy(this.position);
    this.avatar.setPose('idle');

    this.currentCameraPos.copy(this.position).add(this.cameraOffset);
    this.camera.position.copy(this.currentCameraPos);
    this.camera.lookAt(this.position.clone().add(this.cameraLookAhead));
  }

  public update(delta: number) {
    // -------------------------------------------------------------
    // 1. FALL & RECOVERY LIFECYCLE
    // -------------------------------------------------------------
    if (this.fallingType) {
      this.fallDuration += delta;
      this.velocityY -= 22 * delta;
      this.position.y += this.velocityY * delta;
      this.avatar.setPose('fall');

      if (this.fallDuration > 1.6) {
        this.completeRespawnAtCheckpoint();
      }

      this.syncScene(delta, false);
      return;
    }

    if (this.isRecovering) {
      this.recoveryTimer -= delta;
      if (this.recoveryTimer <= 0) {
        this.isRecovering = false;
      }
      this.avatar.setPose('stumble');
      this.syncScene(delta, false);
      return;
    }

    // -------------------------------------------------------------
    // 2. INPUT DIRECTION & STAMINA
    // -------------------------------------------------------------
    const inputX =
      (this.keys.has('d') || this.keys.has('arrowright') ? 1 : 0) -
      (this.keys.has('a') || this.keys.has('arrowleft') ? 1 : 0) +
      this.touchStick.x;

    const inputZ =
      (this.keys.has('s') || this.keys.has('arrowdown') ? 1 : 0) -
      (this.keys.has('w') || this.keys.has('arrowup') ? 1 : 0) +
      this.touchStick.y;

    const moveVector = new THREE.Vector3(inputX, 0, inputZ);
    const isMoving = moveVector.lengthSq() > 0.02;

    const wantsSprint = (this.keys.has('shift') || this.touchSprintActive) && isMoving;
    const canSprint = wantsSprint && this.stamina > 4;

    if (canSprint) {
      this.stamina = Math.max(0, this.stamina - 24 * delta);
    } else {
      const regenRate = isMoving ? 14 : 28;
      this.stamina = Math.min(this.maxStamina, this.stamina + regenRate * delta);
    }

    // -------------------------------------------------------------
    // 3. GROUND HEIGHT & SURFACE QUERY
    // -------------------------------------------------------------
    this.currentGroundY = this.world.getGroundHeight(this.position.x, this.position.z);
    this.currentSurface = this.world.getSurfaceType(this.position.x, this.position.z);
    const isOnBalance = this.world.isOnBalanceSurface(this.position);
    const isNearLedge = this.world.isNearClimbLedge(this.position);

    // -------------------------------------------------------------
    // 4. CLIMB / MANTLE MECHANICS
    // -------------------------------------------------------------
    if (isNearLedge && isMoving && inputZ < -0.4 && (this.jumpBufferTimer > 0 || wantsSprint)) {
      if (!this.isClimbing) {
        this.isClimbing = true;
        this.climbTimer = 0.45;
        canopyAudio.playClimb();
      }
    }

    if (this.isClimbing) {
      this.climbTimer -= delta;
      this.position.y += delta * 4.2;
      this.position.z -= delta * 3.5;
      this.avatar.setPose('climb');

      if (this.climbTimer <= 0) {
        this.isClimbing = false;
        this.velocityY = 0;
      }

      this.syncScene(delta, true);
      return;
    }

    // -------------------------------------------------------------
    // 5. JUMP, COYOTE TIME & GRAVITY
    // -------------------------------------------------------------
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= delta;

    if (this.isGrounded) {
      this.coyoteTimer = 0.12; // 120ms coyote window
    } else {
      this.coyoteTimer -= delta;
    }

    // Trigger Jump if buffered within coyote window
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      const jumpImpulse = canSprint ? 9.4 : 8.5;
      this.velocityY = jumpImpulse;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      canopyAudio.playJump();
    }

    // Apply gravity
    this.velocityY -= 24 * delta;
    this.position.y += this.velocityY * delta;

    // Ground landing check
    if (this.position.y <= this.currentGroundY) {
      if (!this.isGrounded && this.velocityY < -5) {
        canopyAudio.playLanding();
      }
      this.position.y = this.currentGroundY;
      this.velocityY = 0;
      this.isGrounded = true;

      // Check Stepping Stone Edge Slip (Wrong footing!)
      if (this.position.z >= 58 && this.position.z <= 94) {
        for (const stone of CanopyRunScene.STEPPING_STONES) {
          const dx = this.position.x - stone.x;
          const dz = this.position.z - stone.z;
          const dist = Math.hypot(dx, dz);
          if (dist <= stone.r && dist > stone.r * 0.62) {
            // Unbalanced footing on wet mossy rock edge: slide outward!
            const slipSpeed = (dist - stone.r * 0.62) * 9.5;
            this.velocity.x += (dx / dist) * slipSpeed;
            this.velocity.z += (dz / dist) * slipSpeed;
          }
        }
      }
    } else {
      this.isGrounded = false;
    }

    // -------------------------------------------------------------
    // 6. SPEED, CROSSWIND & HORIZONTAL MOVEMENT
    // -------------------------------------------------------------
    let targetSpeed = 5.0;
    if (canSprint) targetSpeed = 14.5;
    else if (isMoving) targetSpeed = 8.8;
    if (isOnBalance) targetSpeed = Math.min(targetSpeed, 6.2); // balance beam constraint

    // Physical Crosswind on High Wind Chasm Bridge (Z: -72 to -122)
    let windPushX = 0;
    if (this.position.z <= -72 && this.position.z >= -122) {
      // Dynamic oscillating canyon crosswind
      windPushX = Math.sin(Date.now() * 0.0022) * 2.8;
    }

    if (isMoving) {
      moveVector.normalize();
      const desiredVel = moveVector.multiplyScalar(targetSpeed);
      desiredVel.x += windPushX; // Apply wind shear

      this.velocity.lerp(desiredVel, Math.min(1, delta * 16));
      this.position.addScaledVector(this.velocity, delta);

      // Resolve solid obstacle collisions with realistic physical surface deflection
      for (const obs of this.world.obstacleColliders) {
        const dx = this.position.x - obs.center.x;
        const dz = this.position.z - obs.center.z;
        const dist = Math.hypot(dx, dz);
        const minDist = obs.radius + 0.28;

        // Only block if player is at or below obstacle height (allow jumping cleanly over hurdles)
        if (dist < minDist && this.position.y < obs.center.y + obs.height * 0.45) {
          const overlap = minDist - dist;
          const nx = dx / (dist || 1);
          const nz = dz / (dist || 1);

          // Push out along collision normal
          this.position.x += nx * overlap;
          this.position.z += nz * overlap;

          // Deflect velocity along obstacle tangent to slide organically
          const dot = this.velocity.x * nx + this.velocity.z * nz;
          if (dot < 0) {
            this.velocity.x -= dot * nx * 1.15;
            this.velocity.z -= dot * nz * 1.15;
          }

          if (this.velocity.lengthSq() > 15) {
            this.world.vfx.spawnFootstepDust(this.position, this.velocity);
          }
        }
      }

      // Resolve Dynamic Moving Lumber / Timber Hazards Collision
      for (const lumber of this.world.movingLumberHazards) {
        const dx = this.position.x - lumber.currentPos.x;
        const dz = this.position.z - lumber.currentPos.z;
        const distXZ = Math.hypot(dx, dz);
        const hitRadius = lumber.radius + 0.38;
        const dy = Math.abs((this.position.y + 0.75) - lumber.currentPos.y);

        if (distXZ < hitRadius + lumber.width * 0.42 && dy < 1.15) {
          // VIOLENT TIMBER IMPACT: Knocks the racer down and triggers fall!
          const logSpeed = lumber.velocity.length();
          const impactDir = new THREE.Vector3();
          if (lumber.velocity.lengthSq() > 0.1) {
            impactDir.copy(lumber.velocity).normalize();
          } else {
            impactDir.set(dx, 0, dz).normalize();
          }

          const knockback = Math.max(14.0, logSpeed * 3.8);
          this.velocity.x = impactDir.x * knockback;
          this.velocity.z = impactDir.z * knockback;
          this.velocityY = 5.6; // pops racer off ground
          this.isGrounded = false;

          this.world.vfx.spawnFootstepDust(this.position, this.velocity);
          canopyAudio.playCliffFall();
          this.triggerFall('cliff');
          return;
        }
      }

      // Face direction of travel
      const targetHeading = Math.atan2(this.velocity.x, this.velocity.z);
      this.avatar.group.rotation.y = targetHeading;
    } else {
      // Idle on bridge still drifts slightly with wind
      const idleDrift = new THREE.Vector3(windPushX * 0.4, 0, 0);
      this.velocity.lerp(idleDrift, Math.min(1, delta * 10));
      this.position.addScaledVector(this.velocity, delta);
    }

    // -------------------------------------------------------------
    // 7. POSE STATE SELECTION
    // -------------------------------------------------------------
    let currentPose: CanopyPose = 'idle';
    if (!this.isGrounded) {
      currentPose = 'jump';
    } else if (isOnBalance) {
      currentPose = 'balance';
    } else if (isMoving) {
      currentPose = canSprint ? 'sprint' : 'run';
    }

    this.avatar.setPose(currentPose);

    // -------------------------------------------------------------
    // 8. FALL DETECTION & CHECKPOINTS
    // -------------------------------------------------------------
    const fall = this.world.getFallType(this.position);
    if (fall && !this.fallingType) {
      this.triggerFall(fall);
      return;
    }

    // Advance checkpoints
    const nextCp = this.world.getCheckpoint(this.position, this.checkpointIndex);
    if (nextCp !== this.checkpointIndex) {
      this.checkpointIndex = nextCp;
      canopyAudio.playCheckpoint();
      this.onCheckpoint(nextCp);

      // Final Checkpoint is Bell Clearing Finish
      if (nextCp === this.world.checkpoints.length - 1) {
        this.world.triggerBellRingAnimation();
        this.world.vfx.spawnBellVictorySparks(new THREE.Vector3(0, 4.2, -158));
        canopyAudio.playBellRing();
        this.avatar.setPose('finish');
        this.onFinish();
      }
    }

    this.syncScene(delta, isMoving);
  }

  private triggerFall(type: FallType) {
    this.fallingType = type;
    this.fallDuration = 0;
    this.velocityY = -2.5;

    if (type === 'water') {
      this.world.vfx.spawnWaterSplash(this.position);
      canopyAudio.playWaterSplash();
    } else {
      canopyAudio.playCliffFall();
    }

    this.onFall(type);
  }

  private completeRespawnAtCheckpoint() {
    this.fallingType = null;
    this.fallDuration = 0;
    this.velocityY = 0;
    this.isRecovering = true;
    this.recoveryTimer = 0.8;

    // Reset to last validated checkpoint
    const cp = this.world.checkpoints[this.checkpointIndex];
    this.position.copy(cp.respawnPoint);
    this.position.y = this.world.getGroundHeight(this.position.x, this.position.z);
    this.velocity.set(0, 0, 0);

    this.avatar.group.position.copy(this.position);
    this.avatar.setPose('stumble');
  }

  private syncScene(delta: number, isMoving: boolean) {
    this.world.update(delta);
    this.avatar.group.position.copy(this.position);

    // Speed ratio for animation blending
    const speed = this.velocity.length();
    const speedRatio = Math.min(speed / 6.0, 2.5);
    this.avatar.update(delta, isMoving, speedRatio);

    // Dynamic Sprint FOV Dilation (58° idle → 72° full sprint)
    const targetFov = isMoving && speed > 7.5 ? 72 : 58;
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, delta * 5);
    this.camera.updateProjectionMatrix();

    // Dynamic third-person spring-arm camera with motion bob
    const strideSway = isMoving ? Math.sin(performance.now() * 0.009) * 0.06 : 0;
    const sprintPullBack = speed > 7.5 ? 0.45 : 0;
    const targetCamPos = this.position.clone()
      .add(this.cameraOffset)
      .add(new THREE.Vector3(strideSway, Math.abs(strideSway) * 0.45, sprintPullBack));
    this.currentCameraPos.lerp(targetCamPos, Math.min(1, delta * 6.5));
    this.camera.position.copy(this.currentCameraPos);

    const lookTarget = this.position.clone().add(this.cameraLookAhead);
    this.camera.lookAt(lookTarget);
  }

  public getState(): ControllerState {
    const isSprinting = (this.keys.has('shift') || this.touchSprintActive) && this.stamina > 4;
    const isOnBalance = this.world.isOnBalanceSurface(this.position);
    const isNearLedge = this.world.isNearClimbLedge(this.position);

    let prompt: string | null = null;
    if (isNearLedge) prompt = 'CLIMB LEDGE [SPACE]';
    else if (isOnBalance) prompt = 'BALANCE ON LOG';
    else if (this.isGrounded && this.checkpointIndex === 1) prompt = 'JUMP STEPS [SPACE]';

    const speedKmh = Math.round(this.velocity.length() * 3.6);

    return {
      stamina: this.stamina,
      maxStamina: this.maxStamina,
      isSprinting,
      isOnBalanceBeam: isOnBalance,
      isNearLedge,
      activePrompt: prompt,
      speedKmh
    };
  }

  public dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
