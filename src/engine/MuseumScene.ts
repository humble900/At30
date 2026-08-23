import * as THREE from 'three';
import { EXHIBITS } from '../data/exhibits';
import type { ExhibitItem } from '../types';
import { TextureGenerator } from './TextureGenerator';

export interface BoundingBox2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  topY?: number;
}

// ─── WING ROOM LAYOUT CONSTANTS ─────────────────────────────
// Each wing has: Lobby (Room1) → Hallway → Gallery (Room2) → Hallway → Inner Sanctum (Room3)

const WALL_H = 6;         // Standard wall height
const WALL_THICK = 0.5;   // Wall thickness
const CORRIDOR_W = 4;     // Corridor width
const CORRIDOR_CEIL = 4.5;

// Atrium: centered at origin, 20×20
const ATRIUM_SIZE = 20;
const ATRIUM_HALF = ATRIUM_SIZE / 2;

// Room sizes
const LOBBY_W = 12;
const LOBBY_D = 10;
const GALLERY_W = 14;
const GALLERY_D = 12;
const SANCTUM_W = 10;
const SANCTUM_D = 10;
const HALL_LEN = 8; // Hallway length between rooms

export class MuseumScene {
  public scene: THREE.Scene;
  public exhibits: { item: ExhibitItem; meshGroup: THREE.Group; ringMesh: THREE.Mesh }[] = [];
  public collisionBoxes: BoundingBox2D[] = [];
  public animatedObjects: { mesh: THREE.Object3D; update: (time: number) => void }[] = [];

  // Materials (shared)
  private wallMat!: THREE.MeshStandardMaterial;
  private galleryWallMat!: THREE.MeshStandardMaterial;
  private baseboardMat!: THREE.MeshStandardMaterial;
  private crownMat!: THREE.MeshStandardMaterial;
  private ceilingMat!: THREE.MeshStandardMaterial;
  private floorMat!: THREE.MeshStandardMaterial;
  private runnerMat!: THREE.MeshStandardMaterial;
  private frameMat!: THREE.MeshStandardMaterial;
  private benchMat!: THREE.MeshStandardMaterial;
  private pillarMat!: THREE.MeshStandardMaterial;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0C0E14);
    this.scene.fog = new THREE.FogExp2(0x0C0E14, 0.012);

    this.initMaterials();
    this.buildLighting();
    this.buildFloor();
    this.buildAtrium();
    this.buildAtriumCenterpiece();
    this.buildEastWing();  // PosterBooking
    this.buildNorthWing(); // ClayRent
    this.buildWestWing();  // LeadMagic
    this.buildSouthEntrance();
    this.buildExhibits();
  }

  private initMaterials() {
    const wallTex = TextureGenerator.createWallTexture();
    const galleryWallTex = TextureGenerator.createGalleryWallTexture();
    const ceilingTex = TextureGenerator.createCeilingTexture();
    const marbleTex = TextureGenerator.createMarbleFloorTexture();
    const runnerTex = TextureGenerator.createFloorRunnerTexture();

    this.wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.7, metalness: 0.1 });
    this.galleryWallMat = new THREE.MeshStandardMaterial({ map: galleryWallTex, roughness: 0.6, metalness: 0.05 });
    this.baseboardMat = new THREE.MeshStandardMaterial({ color: 0x0E1018, roughness: 0.8, metalness: 0.2 });
    this.crownMat = new THREE.MeshStandardMaterial({ color: 0x2A2E3A, roughness: 0.4, metalness: 0.5 });
    this.ceilingMat = new THREE.MeshStandardMaterial({ map: ceilingTex, roughness: 0.8, metalness: 0.05 });
    this.floorMat = new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.15, metalness: 0.25 });
    this.runnerMat = new THREE.MeshStandardMaterial({ map: runnerTex, roughness: 0.25, metalness: 0.15 });
    this.frameMat = new THREE.MeshStandardMaterial({ color: 0x2A1F14, roughness: 0.5, metalness: 0.4 });
    this.benchMat = new THREE.MeshStandardMaterial({ color: 0x1A1610, roughness: 0.7, metalness: 0.15 });
    this.pillarMat = new THREE.MeshStandardMaterial({ color: 0x1E222D, metalness: 0.8, roughness: 0.2 });
  }

  // ─── WALL HELPERS ─────────────────────────────────────────────

  /** Add a wall box with collision and baseboard + crown trim */
  private addWall(w: number, h: number, d: number, x: number, y: number, z: number, mat?: THREE.Material) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat || this.wallMat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Add architectural trim
    this.addBaseboard(w + (w > d ? 0 : 0.05), d + (d > w ? 0 : 0.05), x, z);
    this.addCrown(w + (w > d ? 0 : 0.05), d + (d > w ? 0 : 0.05), x, z, h);

    this.collisionBoxes.push({
      minX: x - w / 2 - 0.3,
      maxX: x + w / 2 + 0.3,
      minZ: z - d / 2 - 0.3,
      maxZ: z + d / 2 + 0.3,
      topY: h
    });
  }

  /** Add baseboard strip along a wall */
  private addBaseboard(w: number, d: number, x: number, z: number) {
    const geo = new THREE.BoxGeometry(w, 0.15, d);
    const mesh = new THREE.Mesh(geo, this.baseboardMat);
    mesh.position.set(x, 0.075, z);
    this.scene.add(mesh);
  }

  /** Add crown molding strip */
  private addCrown(w: number, d: number, x: number, z: number, h: number = WALL_H) {
    const geo = new THREE.BoxGeometry(w, 0.1, d);
    const mesh = new THREE.Mesh(geo, this.crownMat);
    mesh.position.set(x, h - 0.05, z);
    this.scene.add(mesh);
  }

  /** Add a ceiling panel */
  private addCeiling(w: number, d: number, x: number, z: number, h: number = WALL_H) {
    const geo = new THREE.PlaneGeometry(w, d);
    geo.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(geo, this.ceilingMat);
    mesh.position.set(x, h, z);
    this.scene.add(mesh);
  }

  /** Add floor runner strip */
  private addRunner(w: number, d: number, x: number, z: number) {
    const geo = new THREE.PlaneGeometry(w, d);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, this.runnerMat);
    mesh.position.set(x, 0.01, z);
    this.scene.add(mesh);
  }

  /** Add a decorative column pair at a doorway */
  private addColumnPair(x: number, z: number, gapWidth: number, rotated: boolean = false) {
    const colGeo = new THREE.CylinderGeometry(0.25, 0.3, WALL_H, 16);
    const offset = gapWidth / 2 + 0.4;
    if (rotated) {
      // Gap along X axis
      const c1 = new THREE.Mesh(colGeo, this.pillarMat);
      c1.position.set(x, WALL_H / 2, z - offset);
      c1.castShadow = true;
      this.scene.add(c1);
      const c2 = new THREE.Mesh(colGeo, this.pillarMat);
      c2.position.set(x, WALL_H / 2, z + offset);
      c2.castShadow = true;
      this.scene.add(c2);
    } else {
      // Gap along Z axis
      const c1 = new THREE.Mesh(colGeo, this.pillarMat);
      c1.position.set(x - offset, WALL_H / 2, z);
      c1.castShadow = true;
      this.scene.add(c1);
      const c2 = new THREE.Mesh(colGeo, this.pillarMat);
      c2.position.set(x + offset, WALL_H / 2, z);
      c2.castShadow = true;
      this.scene.add(c2);
    }
  }

  /** Add gallery bench */
  private addBench(x: number, z: number, rotY: number = 0) {
    const benchGroup = new THREE.Group();
    // Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.7), this.benchMat);
    seat.position.y = 0.48;
    benchGroup.add(seat);
    // Legs
    const legGeo = new THREE.BoxGeometry(0.08, 0.42, 0.6);
    const l1 = new THREE.Mesh(legGeo, this.benchMat); l1.position.set(-1.0, 0.21, 0); benchGroup.add(l1);
    const l2 = new THREE.Mesh(legGeo, this.benchMat); l2.position.set(1.0, 0.21, 0); benchGroup.add(l2);
    benchGroup.position.set(x, 0, z);
    benchGroup.rotation.y = rotY;
    benchGroup.castShadow = true;
    this.scene.add(benchGroup);

    // Collision with topY height for jump-on support
    const isRot = Math.abs(rotY) > 0.1;
    this.collisionBoxes.push({
      minX: x - (isRot ? 0.5 : 1.3),
      maxX: x + (isRot ? 0.5 : 1.3),
      minZ: z - (isRot ? 1.3 : 0.5),
      maxZ: z + (isRot ? 1.3 : 0.5),
      topY: 0.52
    });
  }

  /** Add a framed painting on a wall surface */
  private addWallPainting(
    x: number, y: number, z: number,
    faceDir: 'north' | 'south' | 'east' | 'west',
    paintingTex: THREE.CanvasTexture,
    labelTitle: string,
    labelDesc: string,
    frameW: number = 3.2,
    frameH: number = 2.2
  ) {
    const group = new THREE.Group();

    // Frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(frameW + 0.3, frameH + 0.3, 0.08),
      this.frameMat
    );
    group.add(frame);

    // Canvas
    const canvasMat = new THREE.MeshBasicMaterial({ map: paintingTex });
    const artCanvas = new THREE.Mesh(new THREE.PlaneGeometry(frameW, frameH), canvasMat);
    artCanvas.position.z = 0.045;
    group.add(artCanvas);

    // Info plaque
    const labelTex = TextureGenerator.createGalleryLabelTexture(labelTitle, labelDesc);
    const labelMat = new THREE.MeshBasicMaterial({ map: labelTex });
    const label = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), labelMat);
    label.position.set(0, -(frameH / 2 + 0.35), 0.045);
    group.add(label);

    // Position and orient
    group.position.set(x, y, z);
    switch (faceDir) {
      case 'south': group.rotation.y = 0; break;
      case 'north': group.rotation.y = Math.PI; break;
      case 'east':  group.rotation.y = -Math.PI / 2; break;
      case 'west':  group.rotation.y = Math.PI / 2; break;
    }

    // Spotlight aimed at painting
    const spotLight = new THREE.SpotLight(0xFFF5E0, 2.5, 8, Math.PI / 6, 0.6, 1.5);
    spotLight.position.set(x, WALL_H - 0.5, z);
    spotLight.target = frame;
    this.scene.add(spotLight);

    this.scene.add(group);
  }

  /** Add arch/banner signage over a doorway */
  private addDoorwaySign(title: string, subtitle: string, color: string, x: number, z: number, rotY: number) {
    const bannerTex = TextureGenerator.createArchBannerTexture(title, subtitle, color);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex, transparent: true });
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), bannerMat);
    banner.position.set(x, WALL_H - 1.2, z);
    banner.rotation.y = rotY;
    this.scene.add(banner);

    // Glowing header beam
    const headerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.2
    });
    const header = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 0.6), headerMat);
    header.position.set(x, WALL_H - 0.1, z);
    header.rotation.y = rotY;
    this.scene.add(header);
  }

  // ─── LIGHTING ──────────────────────────────────────────────────

  private buildLighting() {
    // Soft ambient
    const ambient = new THREE.AmbientLight(0xD8DEE9, 0.45);
    this.scene.add(ambient);

    // Main directional (skylight)
    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    dirLight.position.set(20, 40, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    dirLight.shadow.camera.left = -60;
    dirLight.shadow.camera.right = 60;
    dirLight.shadow.camera.top = 60;
    dirLight.shadow.camera.bottom = -60;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Atrium center glow
    const centerGlow = new THREE.PointLight(0x00F0FF, 1.5, 18);
    centerGlow.position.set(0, 5, 0);
    this.scene.add(centerGlow);
  }

  /** Add warm ambient light for a room */
  private addRoomLight(x: number, z: number, color: number = 0xFFF5E0, intensity: number = 1.2, dist: number = 16) {
    const light = new THREE.PointLight(color, intensity, dist);
    light.position.set(x, WALL_H - 1, z);
    this.scene.add(light);
  }

  // ─── FLOOR ────────────────────────────────────────────────────

  private buildFloor() {
    const floorGeo = new THREE.PlaneGeometry(140, 140);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMesh = new THREE.Mesh(floorGeo, this.floorMat);
    floorMesh.receiveShadow = true;
    this.scene.add(floorMesh);
  }

  // ─── SOUTH ENTRANCE ───────────────────────────────────────────

  private buildSouthEntrance() {
    // South wall with entrance gap
    const doorW = 5;
    const sideW = (ATRIUM_SIZE - doorW) / 2;
    // Left wall
    this.addWall(sideW, WALL_H, WALL_THICK, -(doorW / 2 + sideW / 2), WALL_H / 2, ATRIUM_HALF);
    // Right wall
    this.addWall(sideW, WALL_H, WALL_THICK, (doorW / 2 + sideW / 2), WALL_H / 2, ATRIUM_HALF);

    // Short entrance corridor walls
    const entranceLen = 6;
    this.addWall(WALL_THICK, WALL_H, entranceLen, -doorW / 2, WALL_H / 2, ATRIUM_HALF + entranceLen / 2);
    this.addWall(WALL_THICK, WALL_H, entranceLen, doorW / 2, WALL_H / 2, ATRIUM_HALF + entranceLen / 2);

    // Entrance back wall
    this.addWall(doorW + WALL_THICK, WALL_H, WALL_THICK, 0, WALL_H / 2, ATRIUM_HALF + entranceLen);

    // Welcome sign
    const welcomeTex = TextureGenerator.createWelcomeWallTexture('At30 Pavilion', 'Where Innovation Meets Discovery', '#00F0FF');
    const welcomeMat = new THREE.MeshBasicMaterial({ map: welcomeTex });
    const welcomeSign = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.25), welcomeMat);
    welcomeSign.position.set(0, 2.5, ATRIUM_HALF + entranceLen - 0.3);
    welcomeSign.rotation.y = Math.PI;
    this.scene.add(welcomeSign);

    this.addCeiling(doorW, entranceLen, 0, ATRIUM_HALF + entranceLen / 2, CORRIDOR_CEIL);
    this.addRunner(2.5, entranceLen, 0, ATRIUM_HALF + entranceLen / 2);
    this.addColumnPair(0, ATRIUM_HALF, doorW);
  }

  // ─── ATRIUM (Central Hub) ─────────────────────────────────────

  private buildAtrium() {
    // Atrium ceiling
    this.addCeiling(ATRIUM_SIZE, ATRIUM_SIZE, 0, 0, WALL_H);

    // Atrium has 4 openings: south (entrance), east (PB), north (CR), west (LM)
    const doorW = 5;
    const sideW = (ATRIUM_SIZE - doorW) / 2;

    // North wall (opening to ClayRent corridor)
    this.addWall(sideW, WALL_H, WALL_THICK, -(doorW / 2 + sideW / 2), WALL_H / 2, -ATRIUM_HALF);
    this.addWall(sideW, WALL_H, WALL_THICK, (doorW / 2 + sideW / 2), WALL_H / 2, -ATRIUM_HALF);
    this.addDoorwaySign('ClayRent Pavilion', 'Modern Habitat & Asset Gallery ▲', '#E06D53', 0, -ATRIUM_HALF, 0);
    this.addColumnPair(0, -ATRIUM_HALF, doorW);

    // East wall (opening to PosterBooking corridor)
    this.addWall(WALL_THICK, WALL_H, sideW, ATRIUM_HALF, WALL_H / 2, -(doorW / 2 + sideW / 2));
    this.addWall(WALL_THICK, WALL_H, sideW, ATRIUM_HALF, WALL_H / 2, (doorW / 2 + sideW / 2));
    this.addDoorwaySign('PosterBooking Wing', 'The Digital Canvas Gallery ➔', '#0066FF', ATRIUM_HALF, 0, -Math.PI / 2);
    this.addColumnPair(ATRIUM_HALF, 0, doorW, true);

    // West wall (opening to LeadMagic corridor)
    this.addWall(WALL_THICK, WALL_H, sideW, -ATRIUM_HALF, WALL_H / 2, -(doorW / 2 + sideW / 2));
    this.addWall(WALL_THICK, WALL_H, sideW, -ATRIUM_HALF, WALL_H / 2, (doorW / 2 + sideW / 2));
    this.addDoorwaySign('LeadMagic Vault', '⬅ AI Data Intelligence Matrix', '#A855F7', -ATRIUM_HALF, 0, Math.PI / 2);
    this.addColumnPair(-ATRIUM_HALF, 0, doorW, true);

    // Room ambient
    this.addRoomLight(0, 0, 0xE0F0FF, 1.0, 20);
  }

  // ─── EAST WING: POSTERBOOKING ─────────────────────────────────
  // Layout: Atrium → Corridor → Lobby → Hallway → Gallery → Hallway → Sanctum
  // Extends along +X axis

  private buildEastWing() {
    const color = '#0066FF';
    const doorW = 4;

    // ── Corridor from Atrium to Lobby (along +X) ──
    const corrStartX = ATRIUM_HALF;
    const corrEndX = corrStartX + HALL_LEN;
    // North wall of corridor
    this.addWall(HALL_LEN, WALL_H, WALL_THICK, corrStartX + HALL_LEN / 2, WALL_H / 2, -CORRIDOR_W / 2);
    // South wall of corridor
    this.addWall(HALL_LEN, WALL_H, WALL_THICK, corrStartX + HALL_LEN / 2, WALL_H / 2, CORRIDOR_W / 2);
    this.addCeiling(HALL_LEN, CORRIDOR_W, corrStartX + HALL_LEN / 2, 0, CORRIDOR_CEIL);
    this.addRunner(HALL_LEN, 2, corrStartX + HALL_LEN / 2, 0);

    // Corridor paintings
    this.addWallPainting(corrStartX + 3, 2.0, -CORRIDOR_W / 2 + 0.3, 'south',
      TextureGenerator.createMasterpieceTexture(0), 'The Great Wave off Kanagawa', 'Katsushika Hokusai (1831)', 2.5, 1.6);
    this.addWallPainting(corrStartX + 6, 2.0, CORRIDOR_W / 2 - 0.3, 'north',
      TextureGenerator.createMasterpieceTexture(1), 'The Starry Night', 'Vincent van Gogh (1889)', 2.5, 1.6);

    // ── Lobby (Room 1) ──
    const lobbyX = corrEndX + LOBBY_D / 2;
    // North wall
    this.addWall(LOBBY_D, WALL_H, WALL_THICK, lobbyX, WALL_H / 2, -LOBBY_W / 2, this.galleryWallMat);
    // South wall
    this.addWall(LOBBY_D, WALL_H, WALL_THICK, lobbyX, WALL_H / 2, LOBBY_W / 2, this.galleryWallMat);
    // East wall (with door)
    const lSideW = (LOBBY_W - doorW) / 2;
    this.addWall(WALL_THICK, WALL_H, lSideW, corrEndX + LOBBY_D, WALL_H / 2, -(doorW / 2 + lSideW / 2), this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, lSideW, corrEndX + LOBBY_D, WALL_H / 2, (doorW / 2 + lSideW / 2), this.galleryWallMat);
    // West wall (corridor opening) — the corridor walls connect here
    this.addWall(WALL_THICK, WALL_H, (LOBBY_W - CORRIDOR_W) / 2, corrEndX, WALL_H / 2, -(CORRIDOR_W / 2 + (LOBBY_W - CORRIDOR_W) / 4), this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, (LOBBY_W - CORRIDOR_W) / 2, corrEndX, WALL_H / 2, (CORRIDOR_W / 2 + (LOBBY_W - CORRIDOR_W) / 4), this.galleryWallMat);

    this.addCeiling(LOBBY_D, LOBBY_W, lobbyX, 0, WALL_H);
    this.addRoomLight(lobbyX, 0, 0xCCDDFF, 1.0, 14);

    // Lobby welcome wall
    const welcomeTex = TextureGenerator.createWelcomeWallTexture('PosterBooking', 'Dynamic 8K Digital Canvas & Signage Gallery', color);
    const welcomeMat = new THREE.MeshBasicMaterial({ map: welcomeTex });
    const welcomeWall = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.8), welcomeMat);
    welcomeWall.position.set(lobbyX, 2.2, -LOBBY_W / 2 + 0.3);
    welcomeWall.rotation.y = 0; // faces south
    this.scene.add(welcomeWall);

    // Lobby side paintings
    this.addWallPainting(lobbyX, 2.0, LOBBY_W / 2 - 0.3, 'north',
      TextureGenerator.createMasterpieceTexture(2), 'Water Lilies (Nymphéas)', 'Claude Monet (1906)', 2.8, 1.8);

    this.addBench(lobbyX, 0);

    // ── Hallway 1 (Lobby to Gallery) ──
    const hall1StartX = corrEndX + LOBBY_D;
    const hall1EndX = hall1StartX + HALL_LEN;
    this.addWall(HALL_LEN, WALL_H, WALL_THICK, hall1StartX + HALL_LEN / 2, WALL_H / 2, -doorW / 2);
    this.addWall(HALL_LEN, WALL_H, WALL_THICK, hall1StartX + HALL_LEN / 2, WALL_H / 2, doorW / 2);
    this.addCeiling(HALL_LEN, doorW, hall1StartX + HALL_LEN / 2, 0, CORRIDOR_CEIL);
    this.addRunner(HALL_LEN, 1.8, hall1StartX + HALL_LEN / 2, 0);

    this.addWallPainting(hall1StartX + 4, 2.0, -doorW / 2 + 0.3, 'south',
      TextureGenerator.createMasterpieceTexture(3), 'Girl with a Pearl Earring', 'Johannes Vermeer (1665)', 2.2, 1.4);
    this.addWallPainting(hall1StartX + 4, 2.0, doorW / 2 - 0.3, 'north',
      TextureGenerator.createMasterpieceTexture(4), 'Wanderer above the Sea of Fog', 'Caspar David Friedrich (1818)', 2.2, 1.4);

    // ── Gallery Hall (Room 2) ──
    const galleryX = hall1EndX + GALLERY_D / 2;
    // North wall
    this.addWall(GALLERY_D, WALL_H, WALL_THICK, galleryX, WALL_H / 2, -GALLERY_W / 2, this.galleryWallMat);
    // South wall
    this.addWall(GALLERY_D, WALL_H, WALL_THICK, galleryX, WALL_H / 2, GALLERY_W / 2, this.galleryWallMat);
    // East wall (with door)
    const gSideW = (GALLERY_W - doorW) / 2;
    this.addWall(WALL_THICK, WALL_H, gSideW, hall1EndX + GALLERY_D, WALL_H / 2, -(doorW / 2 + gSideW / 2), this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, gSideW, hall1EndX + GALLERY_D, WALL_H / 2, (doorW / 2 + gSideW / 2), this.galleryWallMat);
    // West wall (hallway opening)
    this.addWall(WALL_THICK, WALL_H, (GALLERY_W - doorW) / 2, hall1EndX, WALL_H / 2, -(doorW / 2 + (GALLERY_W - doorW) / 4), this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, (GALLERY_W - doorW) / 2, hall1EndX, WALL_H / 2, (doorW / 2 + (GALLERY_W - doorW) / 4), this.galleryWallMat);

    this.addCeiling(GALLERY_D, GALLERY_W, galleryX, 0, WALL_H);
    this.addRoomLight(galleryX, 0, 0xBBCCFF, 1.2, 16);

    // Gallery paintings on walls
    this.addWallPainting(galleryX - 3, 2.0, -GALLERY_W / 2 + 0.3, 'south',
      TextureGenerator.createMasterpieceTexture(5), 'A Sunday on La Grande Jatte', 'Georges Seurat (1884)');
    this.addWallPainting(galleryX + 3, 2.0, -GALLERY_W / 2 + 0.3, 'south',
      TextureGenerator.createMasterpieceTexture(6), 'Mona Lisa', 'Leonardo da Vinci (1503)');
    this.addWallPainting(galleryX - 3, 2.0, GALLERY_W / 2 - 0.3, 'north',
      TextureGenerator.createMasterpieceTexture(7), 'Classical Antiquity Sculpture', 'Hellenistic Masters (c. 200 BCE)');
    this.addWallPainting(galleryX + 3, 2.0, GALLERY_W / 2 - 0.3, 'north',
      TextureGenerator.createMasterpieceTexture(8), 'Sunflowers in Golden Amber', 'Vincent van Gogh (1888)');

    this.addBench(galleryX, 0);

    // ── Hallway 2 (Gallery to Sanctum) ──
    const hall2StartX = hall1EndX + GALLERY_D;
    const hall2EndX = hall2StartX + 6;
    this.addWall(6, WALL_H, WALL_THICK, hall2StartX + 3, WALL_H / 2, -doorW / 2);
    this.addWall(6, WALL_H, WALL_THICK, hall2StartX + 3, WALL_H / 2, doorW / 2);
    this.addCeiling(6, doorW, hall2StartX + 3, 0, CORRIDOR_CEIL);

    // Blue glow intensifying
    this.addRoomLight(hall2StartX + 3, 0, 0x0066FF, 0.8, 10);

    // ── Inner Sanctum (Room 3 — THE CODE ROOM) ──
    const sanctumX = hall2EndX + SANCTUM_D / 2;
    // North wall
    this.addWall(SANCTUM_D, WALL_H, WALL_THICK, sanctumX, WALL_H / 2, -SANCTUM_W / 2, this.galleryWallMat);
    // South wall
    this.addWall(SANCTUM_D, WALL_H, WALL_THICK, sanctumX, WALL_H / 2, SANCTUM_W / 2, this.galleryWallMat);
    // East wall (solid)
    this.addWall(WALL_THICK, WALL_H, SANCTUM_W, hall2EndX + SANCTUM_D, WALL_H / 2, 0, this.galleryWallMat);
    // West wall (hallway opening)
    this.addWall(WALL_THICK, WALL_H, (SANCTUM_W - doorW) / 2, hall2EndX, WALL_H / 2, -(doorW / 2 + (SANCTUM_W - doorW) / 4), this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, (SANCTUM_W - doorW) / 2, hall2EndX, WALL_H / 2, (doorW / 2 + (SANCTUM_W - doorW) / 4), this.galleryWallMat);

    this.addCeiling(SANCTUM_D, SANCTUM_W, sanctumX, 0, WALL_H);
    this.addRoomLight(sanctumX, 0, 0x3366FF, 1.5, 12);

    // Blue floor accent
    const blueAccent = TextureGenerator.createFloorAccentTexture(color);
    const accentMat = new THREE.MeshStandardMaterial({ map: blueAccent, roughness: 0.3, metalness: 0.2 });
    const accentFloor = new THREE.Mesh(new THREE.PlaneGeometry(SANCTUM_D - 1, SANCTUM_W - 1), accentMat);
    accentFloor.rotation.x = -Math.PI / 2;
    accentFloor.position.set(sanctumX, 0.02, 0);
    this.scene.add(accentFloor);
  }

  // ─── NORTH WING: CLAYRENT ─────────────────────────────────────
  // Extends along -Z axis

  private buildNorthWing() {
    const color = '#E06D53';
    const doorW = 4;

    // ── Corridor from Atrium ──
    const corrStartZ = -ATRIUM_HALF;
    const corrEndZ = corrStartZ - HALL_LEN;
    this.addWall(WALL_THICK, WALL_H, HALL_LEN, -CORRIDOR_W / 2, WALL_H / 2, corrStartZ - HALL_LEN / 2);
    this.addWall(WALL_THICK, WALL_H, HALL_LEN, CORRIDOR_W / 2, WALL_H / 2, corrStartZ - HALL_LEN / 2);
    this.addCeiling(CORRIDOR_W, HALL_LEN, 0, corrStartZ - HALL_LEN / 2, CORRIDOR_CEIL);
    this.addRunner(2, HALL_LEN, 0, corrStartZ - HALL_LEN / 2);

    this.addWallPainting(-CORRIDOR_W / 2 + 0.3, 2.0, corrStartZ - 3, 'east',
      TextureGenerator.createMasterpieceTexture(9), 'Abstract Harmonic Form', 'Wassily Kandinsky (1923)', 2.5, 1.6);
    this.addWallPainting(CORRIDOR_W / 2 - 0.3, 2.0, corrStartZ - 6, 'west',
      TextureGenerator.createMasterpieceTexture(10), 'Still Life with Quince', 'Paul Cézanne (1899)', 2.5, 1.6);

    // ── Lobby ──
    const lobbyZ = corrEndZ - LOBBY_D / 2;
    this.addWall(WALL_THICK, WALL_H, LOBBY_D, -LOBBY_W / 2, WALL_H / 2, lobbyZ, this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, LOBBY_D, LOBBY_W / 2, WALL_H / 2, lobbyZ, this.galleryWallMat);
    const lSideW = (LOBBY_W - doorW) / 2;
    this.addWall(lSideW, WALL_H, WALL_THICK, -(doorW / 2 + lSideW / 2), WALL_H / 2, corrEndZ - LOBBY_D, this.galleryWallMat);
    this.addWall(lSideW, WALL_H, WALL_THICK, (doorW / 2 + lSideW / 2), WALL_H / 2, corrEndZ - LOBBY_D, this.galleryWallMat);
    this.addWall((LOBBY_W - CORRIDOR_W) / 2, WALL_H, WALL_THICK, -(CORRIDOR_W / 2 + (LOBBY_W - CORRIDOR_W) / 4), WALL_H / 2, corrEndZ, this.galleryWallMat);
    this.addWall((LOBBY_W - CORRIDOR_W) / 2, WALL_H, WALL_THICK, (CORRIDOR_W / 2 + (LOBBY_W - CORRIDOR_W) / 4), WALL_H / 2, corrEndZ, this.galleryWallMat);

    this.addCeiling(LOBBY_W, LOBBY_D, 0, lobbyZ, WALL_H);
    this.addRoomLight(0, lobbyZ, 0xFFE0CC, 1.0, 14);

    const crWelcomeTex = TextureGenerator.createWelcomeWallTexture('ClayRent', 'Modern Habitat, Villa Architecture & Assets', color);
    const crWelcomeMat = new THREE.MeshBasicMaterial({ map: crWelcomeTex });
    const crWelcome = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.8), crWelcomeMat);
    crWelcome.position.set(-LOBBY_W / 2 + 0.3, 2.2, lobbyZ);
    crWelcome.rotation.y = Math.PI / 2;
    this.scene.add(crWelcome);

    this.addWallPainting(LOBBY_W / 2 - 0.3, 2.0, lobbyZ, 'west',
      TextureGenerator.createMasterpieceTexture(11), 'Sistine Vault Fresco', 'Michelangelo Buonarroti (1512)', 2.8, 1.8);
    this.addBench(0, lobbyZ, Math.PI / 2);

    // ── Hallway 1 ──
    const hall1StartZ = corrEndZ - LOBBY_D;
    const hall1EndZ = hall1StartZ - HALL_LEN;
    this.addWall(WALL_THICK, WALL_H, HALL_LEN, -doorW / 2, WALL_H / 2, hall1StartZ - HALL_LEN / 2);
    this.addWall(WALL_THICK, WALL_H, HALL_LEN, doorW / 2, WALL_H / 2, hall1StartZ - HALL_LEN / 2);
    this.addCeiling(doorW, HALL_LEN, 0, hall1StartZ - HALL_LEN / 2, CORRIDOR_CEIL);
    this.addRunner(1.8, HALL_LEN, 0, hall1StartZ - HALL_LEN / 2);

    this.addWallPainting(-doorW / 2 + 0.3, 2.0, hall1StartZ - 4, 'east',
      TextureGenerator.createMasterpieceTexture(0), 'The Great Wave off Kanagawa', 'Katsushika Hokusai (1831)', 2.2, 1.4);
    this.addWallPainting(doorW / 2 - 0.3, 2.0, hall1StartZ - 4, 'west',
      TextureGenerator.createMasterpieceTexture(1), 'The Starry Night', 'Vincent van Gogh (1889)', 2.2, 1.4);

    // ── Gallery Hall (Room 2) ──
    const galleryZ = hall1EndZ - GALLERY_D / 2;
    this.addWall(WALL_THICK, WALL_H, GALLERY_D, -GALLERY_W / 2, WALL_H / 2, galleryZ, this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, GALLERY_D, GALLERY_W / 2, WALL_H / 2, galleryZ, this.galleryWallMat);
    const gSideW = (GALLERY_W - doorW) / 2;
    this.addWall(gSideW, WALL_H, WALL_THICK, -(doorW / 2 + gSideW / 2), WALL_H / 2, hall1EndZ - GALLERY_D, this.galleryWallMat);
    this.addWall(gSideW, WALL_H, WALL_THICK, (doorW / 2 + gSideW / 2), WALL_H / 2, hall1EndZ - GALLERY_D, this.galleryWallMat);
    this.addWall((GALLERY_W - doorW) / 2, WALL_H, WALL_THICK, -(doorW / 2 + (GALLERY_W - doorW) / 4), WALL_H / 2, hall1EndZ, this.galleryWallMat);
    this.addWall((GALLERY_W - doorW) / 2, WALL_H, WALL_THICK, (doorW / 2 + (GALLERY_W - doorW) / 4), WALL_H / 2, hall1EndZ, this.galleryWallMat);

    this.addCeiling(GALLERY_W, GALLERY_D, 0, galleryZ, WALL_H);
    this.addRoomLight(0, galleryZ, 0xFFDDBB, 1.2, 16);

    this.addWallPainting(-GALLERY_W / 2 + 0.3, 2.0, galleryZ - 3, 'east',
      TextureGenerator.createMasterpieceTexture(2), 'Water Lilies', 'Claude Monet (1906)');
    this.addWallPainting(-GALLERY_W / 2 + 0.3, 2.0, galleryZ + 3, 'east',
      TextureGenerator.createMasterpieceTexture(3), 'Girl with a Pearl Earring', 'Johannes Vermeer (1665)');
    this.addWallPainting(GALLERY_W / 2 - 0.3, 2.0, galleryZ - 3, 'west',
      TextureGenerator.createMasterpieceTexture(4), 'Wanderer above the Sea of Fog', 'Caspar David Friedrich (1818)');
    this.addWallPainting(GALLERY_W / 2 - 0.3, 2.0, galleryZ + 3, 'west',
      TextureGenerator.createMasterpieceTexture(5), 'A Sunday on La Grande Jatte', 'Georges Seurat (1884)');

    this.addBench(0, galleryZ, Math.PI / 2);

    // ── Hallway 2 ──
    const hall2StartZ = hall1EndZ - GALLERY_D;
    const hall2EndZ = hall2StartZ - 6;
    this.addWall(WALL_THICK, WALL_H, 6, -doorW / 2, WALL_H / 2, hall2StartZ - 3);
    this.addWall(WALL_THICK, WALL_H, 6, doorW / 2, WALL_H / 2, hall2StartZ - 3);
    this.addCeiling(doorW, 6, 0, hall2StartZ - 3, CORRIDOR_CEIL);
    this.addRoomLight(0, hall2StartZ - 3, 0xE06D53, 0.8, 10);

    // ── Inner Sanctum (Room 3) ──
    const sanctumZ = hall2EndZ - SANCTUM_D / 2;
    this.addWall(WALL_THICK, WALL_H, SANCTUM_D, -SANCTUM_W / 2, WALL_H / 2, sanctumZ, this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, SANCTUM_D, SANCTUM_W / 2, WALL_H / 2, sanctumZ, this.galleryWallMat);
    this.addWall(SANCTUM_W, WALL_H, WALL_THICK, 0, WALL_H / 2, hall2EndZ - SANCTUM_D, this.galleryWallMat);
    this.addWall((SANCTUM_W - doorW) / 2, WALL_H, WALL_THICK, -(doorW / 2 + (SANCTUM_W - doorW) / 4), WALL_H / 2, hall2EndZ, this.galleryWallMat);
    this.addWall((SANCTUM_W - doorW) / 2, WALL_H, WALL_THICK, (doorW / 2 + (SANCTUM_W - doorW) / 4), WALL_H / 2, hall2EndZ, this.galleryWallMat);

    this.addCeiling(SANCTUM_W, SANCTUM_D, 0, sanctumZ, WALL_H);
    this.addRoomLight(0, sanctumZ, 0xFFAA77, 1.5, 12);

    const terracottaAccent = TextureGenerator.createFloorAccentTexture(color);
    const tcMat = new THREE.MeshStandardMaterial({ map: terracottaAccent, roughness: 0.3, metalness: 0.2 });
    const tcFloor = new THREE.Mesh(new THREE.PlaneGeometry(SANCTUM_W - 1, SANCTUM_D - 1), tcMat);
    tcFloor.rotation.x = -Math.PI / 2;
    tcFloor.position.set(0, 0.02, sanctumZ);
    this.scene.add(tcFloor);
  }

  // ─── WEST WING: LEADMAGIC ─────────────────────────────────────
  // Extends along -X axis

  private buildWestWing() {
    const color = '#A855F7';
    const doorW = 4;

    // ── Corridor from Atrium ──
    const corrStartX = -ATRIUM_HALF;
    const corrEndX = corrStartX - HALL_LEN;
    this.addWall(HALL_LEN, WALL_H, WALL_THICK, corrStartX - HALL_LEN / 2, WALL_H / 2, -CORRIDOR_W / 2);
    this.addWall(HALL_LEN, WALL_H, WALL_THICK, corrStartX - HALL_LEN / 2, WALL_H / 2, CORRIDOR_W / 2);
    this.addCeiling(HALL_LEN, CORRIDOR_W, corrStartX - HALL_LEN / 2, 0, CORRIDOR_CEIL);
    this.addRunner(HALL_LEN, 2, corrStartX - HALL_LEN / 2, 0);

    this.addWallPainting(corrStartX - 3, 2.0, -CORRIDOR_W / 2 + 0.3, 'south',
      TextureGenerator.createMasterpieceTexture(6), 'Mona Lisa (La Gioconda)', 'Leonardo da Vinci (1503)', 2.5, 1.6);
    this.addWallPainting(corrStartX - 6, 2.0, CORRIDOR_W / 2 - 0.3, 'north',
      TextureGenerator.createMasterpieceTexture(7), 'Classical Sculpture Study', 'Hellenistic Antiquity Masters', 2.5, 1.6);

    // ── Lobby ──
    const lobbyX = corrEndX - LOBBY_D / 2;
    this.addWall(LOBBY_D, WALL_H, WALL_THICK, lobbyX, WALL_H / 2, -LOBBY_W / 2, this.galleryWallMat);
    this.addWall(LOBBY_D, WALL_H, WALL_THICK, lobbyX, WALL_H / 2, LOBBY_W / 2, this.galleryWallMat);
    const lSideW = (LOBBY_W - doorW) / 2;
    this.addWall(WALL_THICK, WALL_H, lSideW, corrEndX - LOBBY_D, WALL_H / 2, -(doorW / 2 + lSideW / 2), this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, lSideW, corrEndX - LOBBY_D, WALL_H / 2, (doorW / 2 + lSideW / 2), this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, (LOBBY_W - CORRIDOR_W) / 2, corrEndX, WALL_H / 2, -(CORRIDOR_W / 2 + (LOBBY_W - CORRIDOR_W) / 4), this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, (LOBBY_W - CORRIDOR_W) / 2, corrEndX, WALL_H / 2, (CORRIDOR_W / 2 + (LOBBY_W - CORRIDOR_W) / 4), this.galleryWallMat);

    this.addCeiling(LOBBY_D, LOBBY_W, lobbyX, 0, WALL_H);
    this.addRoomLight(lobbyX, 0, 0xDDCCFF, 1.0, 14);

    const lmWelcomeTex = TextureGenerator.createWelcomeWallTexture('LeadMagic', 'B2B Lead Intelligence, IP Reveal & Graph', color);
    const lmWelcomeMat = new THREE.MeshBasicMaterial({ map: lmWelcomeTex });
    const lmWelcome = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.8), lmWelcomeMat);
    lmWelcome.position.set(lobbyX, 2.2, -LOBBY_W / 2 + 0.3);
    lmWelcome.rotation.y = 0;
    this.scene.add(lmWelcome);

    this.addWallPainting(lobbyX, 2.0, LOBBY_W / 2 - 0.3, 'north',
      TextureGenerator.createMasterpieceTexture(8), 'Sunflowers in Golden Amber', 'Vincent van Gogh (1888)', 2.8, 1.8);
    this.addBench(lobbyX, 0);

    // ── Hallway 1 ──
    const hall1StartX = corrEndX - LOBBY_D;
    const hall1EndX = hall1StartX - HALL_LEN;
    this.addWall(HALL_LEN, WALL_H, WALL_THICK, hall1StartX - HALL_LEN / 2, WALL_H / 2, -doorW / 2);
    this.addWall(HALL_LEN, WALL_H, WALL_THICK, hall1StartX - HALL_LEN / 2, WALL_H / 2, doorW / 2);
    this.addCeiling(HALL_LEN, doorW, hall1StartX - HALL_LEN / 2, 0, CORRIDOR_CEIL);
    this.addRunner(HALL_LEN, 1.8, hall1StartX - HALL_LEN / 2, 0);

    this.addWallPainting(hall1StartX - 4, 2.0, -doorW / 2 + 0.3, 'south',
      TextureGenerator.createMasterpieceTexture(9), 'Abstract Harmonic Form', 'Wassily Kandinsky (1923)', 2.2, 1.4);
    this.addWallPainting(hall1StartX - 4, 2.0, doorW / 2 - 0.3, 'north',
      TextureGenerator.createMasterpieceTexture(10), 'Still Life with Quince', 'Paul Cézanne (1899)', 2.2, 1.4);

    // ── Gallery Hall (Room 2) ──
    const galleryX = hall1EndX - GALLERY_D / 2;
    this.addWall(GALLERY_D, WALL_H, WALL_THICK, galleryX, WALL_H / 2, -GALLERY_W / 2, this.galleryWallMat);
    this.addWall(GALLERY_D, WALL_H, WALL_THICK, galleryX, WALL_H / 2, GALLERY_W / 2, this.galleryWallMat);
    const gSideW = (GALLERY_W - doorW) / 2;
    this.addWall(WALL_THICK, WALL_H, gSideW, hall1EndX - GALLERY_D, WALL_H / 2, -(doorW / 2 + gSideW / 2), this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, gSideW, hall1EndX - GALLERY_D, WALL_H / 2, (doorW / 2 + gSideW / 2), this.galleryWallMat);
    this.addWall((GALLERY_W - doorW) / 2, WALL_H, WALL_THICK, -(doorW / 2 + (GALLERY_W - doorW) / 4), WALL_H / 2, hall1EndX, this.galleryWallMat);
    this.addWall((GALLERY_W - doorW) / 2, WALL_H, WALL_THICK, (doorW / 2 + (GALLERY_W - doorW) / 4), WALL_H / 2, hall1EndX, this.galleryWallMat);

    this.addCeiling(GALLERY_D, GALLERY_W, galleryX, 0, WALL_H);
    this.addRoomLight(galleryX, 0, 0xCCBBFF, 1.2, 16);

    this.addWallPainting(galleryX - 3, 2.0, -GALLERY_W / 2 + 0.3, 'south',
      TextureGenerator.createMasterpieceTexture(11), 'Sistine Vault Fresco', 'Michelangelo Buonarroti (1512)');
    this.addWallPainting(galleryX + 3, 2.0, -GALLERY_W / 2 + 0.3, 'south',
      TextureGenerator.createMasterpieceTexture(0), 'The Great Wave off Kanagawa', 'Katsushika Hokusai (1831)');
    this.addWallPainting(galleryX - 3, 2.0, GALLERY_W / 2 - 0.3, 'north',
      TextureGenerator.createMasterpieceTexture(1), 'The Starry Night', 'Vincent van Gogh (1889)');
    this.addWallPainting(galleryX + 3, 2.0, GALLERY_W / 2 - 0.3, 'north',
      TextureGenerator.createMasterpieceTexture(2), 'Water Lilies (Nymphéas)', 'Claude Monet (1906)');

    this.addBench(galleryX, 0);

    // ── Hallway 2 ──
    const hall2StartX = hall1EndX - GALLERY_D;
    const hall2EndX = hall2StartX - 6;
    this.addWall(6, WALL_H, WALL_THICK, hall2StartX - 3, WALL_H / 2, -doorW / 2);
    this.addWall(6, WALL_H, WALL_THICK, hall2StartX - 3, WALL_H / 2, doorW / 2);
    this.addCeiling(6, doorW, hall2StartX - 3, 0, CORRIDOR_CEIL);
    this.addRoomLight(hall2StartX - 3, 0, 0xA855F7, 0.8, 10);

    // ── Inner Sanctum (Room 3) ──
    const sanctumX = hall2EndX - SANCTUM_D / 2;
    this.addWall(SANCTUM_D, WALL_H, WALL_THICK, sanctumX, WALL_H / 2, -SANCTUM_W / 2, this.galleryWallMat);
    this.addWall(SANCTUM_D, WALL_H, WALL_THICK, sanctumX, WALL_H / 2, SANCTUM_W / 2, this.galleryWallMat);
    this.addWall(WALL_THICK, WALL_H, SANCTUM_W, hall2EndX - SANCTUM_D, WALL_H / 2, 0, this.galleryWallMat);
    this.addWall((SANCTUM_W - doorW) / 2, WALL_H, WALL_THICK, -(doorW / 2 + (SANCTUM_W - doorW) / 4), WALL_H / 2, hall2EndX, this.galleryWallMat);
    this.addWall((SANCTUM_W - doorW) / 2, WALL_H, WALL_THICK, (doorW / 2 + (SANCTUM_W - doorW) / 4), WALL_H / 2, hall2EndX, this.galleryWallMat);

    this.addCeiling(SANCTUM_D, SANCTUM_W, sanctumX, 0, WALL_H);
    this.addRoomLight(sanctumX, 0, 0x8844FF, 1.5, 12);

    const purpleAccent = TextureGenerator.createFloorAccentTexture(color);
    const pMat = new THREE.MeshStandardMaterial({ map: purpleAccent, roughness: 0.3, metalness: 0.2 });
    const pFloor = new THREE.Mesh(new THREE.PlaneGeometry(SANCTUM_D - 1, SANCTUM_W - 1), pMat);
    pFloor.rotation.x = -Math.PI / 2;
    pFloor.position.set(sanctumX, 0.02, 0);
    this.scene.add(pFloor);
  }

  // ─── ATRIUM CENTERPIECE ────────────────────────────────────────

  private buildAtriumCenterpiece() {
    const centerGroup = new THREE.Group();

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x141824, metalness: 0.6, roughness: 0.3 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.2, 0.5, 32), baseMat);
    base.position.y = 0.25;
    base.receiveShadow = true;
    centerGroup.add(base);

    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.05, 16, 64), innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.52;
    centerGroup.add(innerRing);

    const emblemTex = TextureGenerator.createAt30LogoTexture();
    const emblemMat = new THREE.MeshBasicMaterial({ map: emblemTex, side: THREE.DoubleSide, transparent: true });
    const emblem = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), emblemMat);
    emblem.position.y = 2.2;
    centerGroup.add(emblem);

    this.animatedObjects.push({
      mesh: emblem,
      update: (time: number) => {
        emblem.rotation.y = time * 0.8;
        emblem.position.y = 2.2 + Math.sin(time * 2) * 0.12;
      }
    });

    const orbitMat = new THREE.MeshBasicMaterial({ color: 0xA855F7, transparent: true, opacity: 0.6 });
    const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.025, 16, 64), orbitMat);
    orbitRing.position.y = 2.2;
    centerGroup.add(orbitRing);

    this.animatedObjects.push({
      mesh: orbitRing,
      update: (time: number) => {
        orbitRing.rotation.x = time * 0.5;
        orbitRing.rotation.z = time * 0.7;
      }
    });

    this.scene.add(centerGroup);

    this.collisionBoxes.push({ minX: -3.0, maxX: 3.0, minZ: -3.0, maxZ: 3.0, topY: 0.55 });
  }

  // ─── EXHIBITS (Interactive Code Exhibits in Room 3s) ──────────

  private buildExhibits() {
    EXHIBITS.forEach(item => {
      const meshGroup = new THREE.Group();
      meshGroup.position.set(...item.position);
      meshGroup.rotation.y = item.rotationY;

      if (item.type === 'screen') {
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x0A0D14, metalness: 0.9, roughness: 0.2 });
        const frame = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.8, 0.2), frameMat);
        frame.castShadow = true;
        meshGroup.add(frame);

        const screenTex = TextureGenerator.createPosterBookingScreenTexture(item.id.includes('menu') ? 'menu' : 'master');
        const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 3.4), screenMat);
        screen.position.z = 0.11;
        meshGroup.add(screen);
      } else if (item.type === 'pedestal') {
        const standMat = new THREE.MeshStandardMaterial({ color: 0x221B18, metalness: 0.5, roughness: 0.4 });
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 1.5, 32), standMat);
        stand.position.y = -0.75;
        stand.castShadow = true;
        meshGroup.add(stand);

        const bpTex = TextureGenerator.createClayRentTexture();
        const bpMat = new THREE.MeshBasicMaterial({ map: bpTex });
        const bpBoard = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 4.5), bpMat);
        bpBoard.position.set(0, 1.2, -0.8);
        meshGroup.add(bpBoard);

        const keyMat = new THREE.MeshStandardMaterial({
          color: 0xD4AF37, metalness: 0.95, roughness: 0.1, emissive: 0x886611, emissiveIntensity: 0.3
        });
        const keyMesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.35, 0.1, 64, 16), keyMat);
        keyMesh.position.y = 0.5;
        meshGroup.add(keyMesh);

        this.animatedObjects.push({
          mesh: keyMesh,
          update: (time: number) => {
            keyMesh.rotation.y = time * 1.2;
            keyMesh.rotation.x = time * 0.4;
            keyMesh.position.y = 0.5 + Math.sin(time * 2.5) * 0.08;
          }
        });
      } else if (item.type === 'crystal') {
        const standMat = new THREE.MeshStandardMaterial({ color: 0x120E22, metalness: 0.8, roughness: 0.2 });
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 1.2, 16), standMat);
        stand.position.y = -0.9;
        stand.castShadow = true;
        meshGroup.add(stand);

        const lmTex = TextureGenerator.createLeadMagicTexture();
        const lmMat = new THREE.MeshBasicMaterial({ map: lmTex });
        const lmBoard = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 4.5), lmMat);
        lmBoard.position.set(0, 1.2, -0.8);
        meshGroup.add(lmBoard);

        const crystalMat = new THREE.MeshStandardMaterial({
          color: 0xA855F7, emissive: 0x6366F1, emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.9
        });
        const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), crystalMat);
        crystal.position.y = 0.5;
        meshGroup.add(crystal);

        const cageMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8, wireframe: true });
        const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), cageMat);
        cage.position.y = 0.5;
        meshGroup.add(cage);

        this.animatedObjects.push({
          mesh: crystal,
          update: (time: number) => {
            crystal.rotation.y = time * 1.5;
            crystal.rotation.z = time * 0.8;
            cage.rotation.y = -time * 0.9;
            crystal.position.y = 0.5 + Math.sin(time * 3) * 0.09;
          }
        });
      } else {
        // Standard painting
        const canvasTex = item.brandKey === 'clayrent'
          ? TextureGenerator.createClayRentTexture()
          : item.brandKey === 'leadmagic'
          ? TextureGenerator.createLeadMagicTexture()
          : TextureGenerator.createPosterBookingScreenTexture('menu');

        const pFrameMat = new THREE.MeshStandardMaterial({ color: 0x2A241F, metalness: 0.4, roughness: 0.5 });
        const pFrame = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3.4, 0.15), pFrameMat);
        meshGroup.add(pFrame);

        const canvasMat = new THREE.MeshBasicMaterial({ map: canvasTex });
        const artCanvas = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 3.0), canvasMat);
        artCanvas.position.z = 0.08;
        meshGroup.add(artCanvas);
      }

      // Interactive proximity ring
      const ringGeo = new THREE.RingGeometry(1.8, 2.1, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(item.themeColor),
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(0, 0.03 - item.position[1], 1.5);
      meshGroup.add(ringMesh);

      this.scene.add(meshGroup);
      this.exhibits.push({ item, meshGroup, ringMesh });
    });
  }

  // ─── ANIMATION LOOP ───────────────────────────────────────────

  public update(time: number) {
    this.exhibits.forEach(ex => {
      const scale = 1 + Math.sin(time * 4) * 0.08;
      ex.ringMesh.scale.set(scale, scale, 1);
    });

    this.animatedObjects.forEach(obj => {
      obj.update(time);
    });
  }
}
