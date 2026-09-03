import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export interface PostProcessingOptions {
  bloomThreshold?: number;
  bloomStrength?: number;
  bloomRadius?: number;
}

export class PostProcessingPipeline {
  public composer: EffectComposer;
  public renderPass: RenderPass;
  public bloomPass: UnrealBloomPass;
  public outputPass: OutputPass;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    options: PostProcessingOptions = {}
  ) {

    const width = renderer.domElement.clientWidth || window.innerWidth;
    const height = renderer.domElement.clientHeight || window.innerHeight;

    // High precision render target for HDR pipeline
    const renderTarget = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      samples: 2
    });

    this.composer = new EffectComposer(renderer, renderTarget);

    // 1. Base Scene Render Pass
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // 2. Cinematic Unreal Bloom Pass (Sunlight, God-Rays, Water Reflections)
    const threshold = options.bloomThreshold ?? 0.88;
    const strength = options.bloomStrength ?? 0.38;
    const radius = options.bloomRadius ?? 0.55;

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      strength,
      radius,
      threshold
    );
    this.composer.addPass(this.bloomPass);

    // 3. Color Management & ACES Tone Mapping Output Pass
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  public setSize(width: number, height: number) {
    this.composer.setSize(width, height);
    this.bloomPass.resolution.set(width, height);
  }

  public render() {
    this.composer.render();
  }

  public dispose() {
    this.composer.renderTarget1.dispose();
    this.composer.renderTarget2.dispose();
    this.bloomPass.dispose();
  }
}
