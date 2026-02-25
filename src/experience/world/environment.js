import * as THREE from "three";
import Experience from "../experience.js";

export default class Environment {
  constructor() {
    // ========== DEPENDENCIES ==========
    this.experience = Experience.instance;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // ========== INITIALIZATION ==========
    this.setSunlight();
    this.setEnvironmentMap();
    this.setFog();
  }

  // ========== FOG ==========
  setFog() {
    this.scene.fog = new THREE.Fog(0xcccccc, 12, 25);
    console.log("Fog added to scene");
  }

  // ========== LIGHTING ==========
  setSunlight() {
    this.createDirectionalLight();
    this.createAmbientLight();
    this.createHemisphereLight();
  }

  createDirectionalLight() {
    // Main directional light (sun)
    this.sunLight = new THREE.DirectionalLight("#ffffff", 4);
    this.sunLight.position.set(5, 5, 5);
    this.sunLight.castShadow = true;

    // Configure shadow
    this.sunLight.shadow.camera.far = 20;
    this.sunLight.shadow.mapSize.set(2048, 2048);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.shadow.bias = -0.001;

    this.scene.add(this.sunLight);
  }

  createAmbientLight() {
    // Ambient light
    this.ambientLight = new THREE.AmbientLight("#ffffff", 20);
    this.scene.add(this.ambientLight);
  }

  createHemisphereLight() {
    // Optional: Add hemisphere light for more natural lighting
    this.hemisphereLight = new THREE.HemisphereLight(
      0xffffff, // sky color
      0x000000, // ground color
      0.5, // intensity
    );
    this.scene.add(this.hemisphereLight);
  }

  // ========== ENVIRONMENT MAP ==========
  setEnvironmentMap() {
    this.initializeEnvironmentMap();
    this.applyEnvironmentMapToScene();
    this.applyEnvironmentMapToMaterials();
  }

  initializeEnvironmentMap() {
    // Create environment map for reflections
    this.environmentMap = {};
    this.environmentMap.intensity = 0.4;
    this.environmentMap.texture = this.resources.items.environmentMapTexture;

    if (this.environmentMap.texture) {
      this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace;
    }
  }

  applyEnvironmentMapToScene() {
    if (!this.environmentMap.texture) return;

    this.scene.environment = this.environmentMap.texture;
    this.scene.background = this.environmentMap.texture;
  }

  applyEnvironmentMapToMaterials() {
    if (!this.environmentMap.texture) return;

    // Update all materials in the scene
    this.scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.material.envMap = this.environmentMap.texture;
        child.material.envMapIntensity = this.environmentMap.intensity;
        child.material.needsUpdate = true;
      }
    });
  }

  // ========== RESIZE HANDLING ==========
  resize() {
    // Handle resize if needed
  }

  // ========== UPDATE LOOP ==========
  update() {
    // Update lighting if needed
  }
}
