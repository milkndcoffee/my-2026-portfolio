import * as THREE from "three";
import Experience from "./experience.js";

export default class Renderer {
  constructor() {
    // ========== DEPENDENCIES ==========
    this.experience = Experience.instance;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.camera = this.experience.camera;

    // ========== INITIALIZATION ==========
    this.setRenderer();
  }

  // ========== RENDERER SETUP ==========
  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });

    // Configure renderer properties
    this.renderer.useLegacyLights = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 0); // Transparent background

    // Set initial size and pixel ratio
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // ========== RESIZE HANDLING ==========
  resize() {
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // ========== RENDER LOOP ==========
  update() {
    // Render with perspective camera
    this.renderer.render(this.scene, this.camera.perspectiveCamera);

    // If you want to render with orthographic camera instead:
    // this.renderer.render(this.scene, this.camera.orthographicCamera);
  }
}
