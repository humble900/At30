import * as THREE from 'three';
import { soundEngine } from '../utils/audio';
import { Avatar } from './Avatar';
import type { BoundingBox2D } from './MuseumScene';

export interface ControllerState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  jump: boolean;
}

export class PlayerController {
  public avatar: Avatar;
  public camera: THREE.PerspectiveCamera;
  public domElement: HTMLElement;
  public collisionBoxes: BoundingBox2D[];

  public position: THREE.Vector3;
  public rotationY: number = Math.PI; // Face north toward atrium initially
  public velocityY: number = 0;
  public isGrounded: boolean = true;

  private gravity: number = 22.0;
  private jumpForce: number = 8.2;

  private inputState: ControllerState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false
  };

  public cameraAngleX: number = -0.28; // Pitch
  public cameraAngleY: number = 0;     // Yaw (0 = looking north)
  public cameraDistance: number = 5.2;
  private responsiveCameraBase: number = 5.2;
  private cameraZoomOffset: number = 0;
  private cameraLookHeight: number = 1.4;

  private isDragging: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };
  private touchVector = { x: 0, y: 0 };
  private walkStepTimer: number = 0;

  constructor(
    avatar: Avatar,
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    collisionBoxes: BoundingBox2D[]
  ) {
    this.avatar = avatar;
    this.camera = camera;
    this.domElement = domElement;
    this.collisionBoxes = collisionBoxes;

    this.position = new THREE.Vector3(0, 0, 8.5); // Spawn at south entrance of Grand Central Atrium facing north
    this.avatar.group.position.copy(this.position);
    this.avatar.group.rotation.y = this.rotationY;
    this.setupListeners();
  }

  private setupListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Pointer events on window for seamless dragging anywhere
    window.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);

    // Mouse wheel to zoom in/out
    window.addEventListener('wheel', this.onWheel, { passive: false });
  }

  public dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    window.removeEventListener('wheel', this.onWheel);
  }

  public jump() {
    if (this.isGrounded) {
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
      soundEngine.playFootstep();
    }
  }

  public setSprint(isSprinting: boolean) {
    this.inputState.run = isSprinting;
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }

    if (e.shiftKey || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift') {
      this.inputState.run = true;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.inputState.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.inputState.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.inputState.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.inputState.right = true;
        break;
      case 'Space':
        this.jump();
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.inputState.run = true;
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (!e.shiftKey && (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.key === 'Shift')) {
      this.inputState.run = false;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.inputState.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.inputState.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.inputState.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.inputState.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.inputState.run = false;
        break;
    }
  };

  private onPointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('.modal-content')
    ) {
      return;
    }

    this.isDragging = true;
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.previousMousePosition.x;
    const deltaY = e.clientY - this.previousMousePosition.y;

    this.cameraAngleY -= deltaX * 0.006;
    this.cameraAngleX = Math.max(-1.1, Math.min(0.2, this.cameraAngleX - deltaY * 0.005));

    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  private onPointerUp = () => {
    this.isDragging = false;
  };

  private onWheel = (e: WheelEvent) => {
    const nextDistance = Math.max(2.5, Math.min(10.0, this.cameraDistance + e.deltaY * 0.004));
    this.cameraZoomOffset = nextDistance - this.responsiveCameraBase;
    this.cameraDistance = nextDistance;
  };

  /** Keep the avatar's world scale consistent while adapting its screen-space framing. */
  public setViewportAspect(aspect: number) {
    const portraitAmount = THREE.MathUtils.clamp((0.82 - aspect) / 0.36, 0, 1);
    this.responsiveCameraBase = THREE.MathUtils.lerp(5.2, 6.2, portraitAmount);
    this.cameraLookHeight = THREE.MathUtils.lerp(1.4, 1.24, portraitAmount);
    this.cameraDistance = THREE.MathUtils.clamp(this.responsiveCameraBase + this.cameraZoomOffset, 2.5, 10);
  }

  public setTouchJoystick(x: number, y: number) {
    this.touchVector = { x, y };
  }

  public setDirectionalInput(forward: boolean, backward: boolean, left: boolean, right: boolean) {
    this.inputState.forward = forward;
    this.inputState.backward = backward;
    this.inputState.left = left;
    this.inputState.right = right;
  }

  /** Calculates the height of the solid surface under the character's feet (0 for floor, or higher for benches/pedestals) */
  private getGroundHeight(x: number, z: number): number {
    const r = 0.3;
    let surfaceHeight = 0; // Default floor

    for (const box of this.collisionBoxes) {
      if (
        x + r > box.minX &&
        x - r < box.maxX &&
        z + r > box.minZ &&
        z - r < box.maxZ
      ) {
        // If it's a climbable/standable obstacle (height < 2.0m)
        const topY = box.topY ?? 6.0;
        if (topY < 2.0 && topY > surfaceHeight) {
          surfaceHeight = topY;
        }
      }
    }
    return surfaceHeight;
  }

  /** Collision test: If character feet are on top of or higher than the object, horizontal movement is NOT blocked */
  private checkCollision(newX: number, newZ: number, feetY: number): boolean {
    const r = 0.38;
    for (const box of this.collisionBoxes) {
      const topY = box.topY ?? 6.0;
      // If player feet are above the top of this box (e.g. stepping onto or jumping on a bench), allow walking over
      if (feetY >= topY - 0.1) {
        continue;
      }

      if (
        newX + r > box.minX &&
        newX - r < box.maxX &&
        newZ + r > box.minZ &&
        newZ - r < box.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  public update(delta: number) {
    // Sprint speed is 12.0 (vs Walk speed 5.2) — distinct, fast, punchy acceleration
    const baseSpeed = this.inputState.run ? 12.0 : 5.2;
    const moveVector = new THREE.Vector3();

    // 1. Keyboard movement relative to camera angle
    if (this.inputState.forward) moveVector.z -= 1;
    if (this.inputState.backward) moveVector.z += 1;
    if (this.inputState.left) moveVector.x -= 1;
    if (this.inputState.right) moveVector.x += 1;

    // 2. Mobile / UI joystick injection
    if (Math.abs(this.touchVector.x) > 0.05 || Math.abs(this.touchVector.y) > 0.05) {
      moveVector.x = this.touchVector.x;
      moveVector.z = this.touchVector.y;
    }

    const isMoving = moveVector.lengthSq() > 0.01;

    if (isMoving) {
      moveVector.normalize();
      
      // Rotate movement vector by current camera yaw angle
      moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraAngleY);

      // Target character rotation facing movement direction
      const targetRotation = Math.atan2(moveVector.x, moveVector.z);
      this.rotationY = targetRotation;
      this.avatar.group.rotation.y = this.rotationY;

      // Proposed new positions
      const stepX = moveVector.x * baseSpeed * delta;
      const stepZ = moveVector.z * baseSpeed * delta;

      // X-axis collision sliding
      if (!this.checkCollision(this.position.x + stepX, this.position.z, this.position.y)) {
        this.position.x += stepX;
      }
      // Z-axis collision sliding
      if (!this.checkCollision(this.position.x, this.position.z + stepZ, this.position.y)) {
        this.position.z += stepZ;
      }

      // Footstep sound cadence
      this.walkStepTimer += delta * (this.inputState.run ? 4.5 : 2.5);
      if (this.walkStepTimer > 1.0) {
        this.walkStepTimer = 0;
        if (this.isGrounded) {
          soundEngine.playFootstep();
        }
      }
    }

    // 3. Vertical Physics (Jumping & Gravity & Landing on Objects)
    if (!this.isGrounded || this.velocityY !== 0) {
      this.velocityY -= this.gravity * delta;
      this.position.y += this.velocityY * delta;

      const groundY = this.getGroundHeight(this.position.x, this.position.z);
      if (this.position.y <= groundY) {
        this.position.y = groundY;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    } else {
      // Check if character walked off a bench/ledge
      const groundY = this.getGroundHeight(this.position.x, this.position.z);
      if (this.position.y > groundY + 0.08) {
        this.isGrounded = false;
      } else {
        this.position.y = groundY;
      }
    }

    this.avatar.group.position.copy(this.position);

    // Animate Avatar limbs (with jump stance when in air)
    this.avatar.animate(isMoving, this.inputState.run ? 2.0 : 1.0, delta);

    // 4. Smooth Camera Follow System
    const targetOffset = new THREE.Vector3(
      Math.sin(this.cameraAngleY) * Math.cos(this.cameraAngleX) * this.cameraDistance,
      -Math.sin(this.cameraAngleX) * this.cameraDistance + 1.6,
      Math.cos(this.cameraAngleY) * Math.cos(this.cameraAngleX) * this.cameraDistance
    );

    const cameraTargetPos = this.position.clone().add(targetOffset);
    this.camera.position.lerp(cameraTargetPos, 0.15);

    // Look at player chest/head
    const lookTarget = this.position.clone().add(new THREE.Vector3(0, this.cameraLookHeight, 0));
    this.camera.lookAt(lookTarget);
  }
}
