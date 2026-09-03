import * as THREE from 'three';

export interface EnvironmentLightingOptions {
  elevation?: number;
  azimuth?: number;
}

export class EnvironmentLighting {
  public scene: THREE.Scene;
  public sunLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public fillLight: THREE.DirectionalLight;
  public zoneLights: THREE.Light[] = [];

  constructor(scene: THREE.Scene, _renderer?: THREE.WebGLRenderer, _options: EnvironmentLightingOptions = {}) {
    this.scene = scene;

    // 1. Crystal-Clear Alpine Blue Sky & Atmospheric Fog
    this.scene.background = new THREE.Color('#91C5D2');
    this.scene.fog = new THREE.FogExp2('#B8D5C4', 0.009);

    // 2. High-Caliber Directional Sun Light (Crisp Warm Golden Sunlight)
    this.sunLight = new THREE.DirectionalLight('#FFF3D6', 2.4);
    this.sunLight.position.set(-65, 60, -15);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 1.0;
    this.sunLight.shadow.camera.far = 420;
    
    // Wide shadow frustum encompassing full course
    const shadowDist = 180;
    this.sunLight.shadow.camera.left = -shadowDist;
    this.sunLight.shadow.camera.right = shadowDist;
    this.sunLight.shadow.camera.top = shadowDist;
    this.sunLight.shadow.camera.bottom = -shadowDist;
    this.sunLight.shadow.bias = -0.00035;
    this.sunLight.shadow.radius = 2.0;

    this.sunLight.target.position.set(0, 5, -15);
    this.scene.add(this.sunLight.target);
    this.scene.add(this.sunLight);

    // 3. Natural Canopy Ambient Bounce (Warm Golden Sky vs Deep Forest Loam)
    this.hemiLight = new THREE.HemisphereLight('#F8EFD5', '#1B2E1C', 1.4);
    this.scene.add(this.hemiLight);

    // 4. Subtle Alpine Fill Light (Softens rock crevices without washing out blacks)
    this.fillLight = new THREE.DirectionalLight('#7EB6C6', 0.4);
    this.fillLight.position.set(55, 35, -40);
    this.scene.add(this.fillLight);

    // 5. Zone-Specific Atmospheric Accent Lights
    this.buildZoneAtmosphericLights();
  }

  private buildZoneAtmosphericLights() {
    // Zone 2: River Rapids Specular Aqua Shimmer (Z: 85)
    const riverLight = new THREE.PointLight('#38BDF8', 1.6, 30, 1.5);
    riverLight.position.set(0, 2.8, 85);
    this.scene.add(riverLight);
    this.zoneLights.push(riverLight);

    // Zone 4: Treehouse Rustic Amber Lanterns (Z: -12)
    const treehouseLantern = new THREE.PointLight('#F59E0B', 2.0, 24, 1.2);
    treehouseLantern.position.set(-1.5, 11.2, -12);
    this.scene.add(treehouseLantern);
    this.zoneLights.push(treehouseLantern);

    // Zone 5: Waterfall Cavern Roaring Mist Glow (Z: -45)
    const cavernGlow = new THREE.PointLight('#0284C7', 2.4, 28, 1.2);
    cavernGlow.position.set(2.0, 9.5, -45);
    this.scene.add(cavernGlow);
    this.zoneLights.push(cavernGlow);

    // Zone 7: Summit Bell Golden Finish Beacon (Z: -158)
    const bellBeacon = new THREE.PointLight('#D97706', 2.8, 26, 1.2);
    bellBeacon.position.set(0, 4.8, -158);
    this.scene.add(bellBeacon);
    this.zoneLights.push(bellBeacon);
  }

  public updateEnvironmentMap(_renderer: THREE.WebGLRenderer) {
    // No-op to keep colors clean and prevent washed out white environment maps
  }

  public dispose() {
    this.scene.remove(this.sunLight);
    this.scene.remove(this.sunLight.target);
    this.scene.remove(this.hemiLight);
    this.scene.remove(this.fillLight);
    this.zoneLights.forEach((light) => this.scene.remove(light));
  }
}
