import * as THREE from "three";
import Experience from "../experience.js";

export default class Object3D {
  constructor() {
    this.experience = Experience.instance;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.sizes = this.experience.sizes;
    this.camera = this.experience.camera;
    this.renderer = this.experience.renderer;

    const gltfData = this.resources.items.room;
    if (!gltfData?.scene) {
      console.error(!gltfData ? "No GLTF data!" : "GLTF has no scene!");
      return;
    }

    this.actualObject = gltfData.scene;
    this.gltf = gltfData;
    this.actions = {};
    this.keywords = ["cylinder"];

    console.log("=== OBJECT3D READY ===", this.actualObject);

    this.init();
  }

  // ========== INITIALIZATION ==========
  init() {
    this.setModel();
    setTimeout(() => this.setupAnimations(), 100);
    setTimeout(() => this.debug(), 2000);
  }

  setModel() {
    // Position & scale
    const scale = 1920 * 0.0002;
    this.actualObject.scale.set(scale, scale, scale);
    this.actualObject.position.set(-5.25, 0, 0);

    // Process meshes (shadows only, no hover tracking)
    this.actualObject.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = child.receiveShadow = true;
    });

    this.scene.add(this.actualObject);
    console.log(`✅ Model added to scene`);
  }

  adjustPosition(scale, x, y, z) {
    this.actualObject.scale.set(scale, scale, scale);
    this.actualObject.position.set(x, y, z);
  }

  // ========== ANIMATIONS ==========
  setupAnimations() {
    if (!this.gltf.animations?.length) {
      console.log("No animations found");
      return;
    }

    console.log(`Setting up ${this.gltf.animations.length} animations`);
    this.mixer = new THREE.AnimationMixer(this.actualObject);

    this.gltf.animations.forEach((clip, i) => {
      const name = clip.name || `anim_${i}`;
      this.actions[name] = this.mixer.clipAction(clip);
    });

    this.playAnimation("idleComputer", { loop: THREE.LoopRepeat });
  }

  playAnimation(name, options = {}) {
    const action = this.actions[name];
    if (!action) return console.error(`Animation "${name}" not found`);

    Object.values(this.actions).forEach((a) => a !== action && a.stop());

    action.reset();
    action.setLoop(
      options.loop || THREE.LoopRepeat,
      options.repetitions || Infinity,
    );
    action.clampWhenFinished = options.clampWhenFinished || false;
    action.timeScale = options.speed || 1;
    action.play();

    console.log(`▶️ Playing: ${name}`);
  }

  stopAllAnimations() {
    Object.values(this.actions).forEach((a) => a.stop());
    console.log("⏹️ All animations stopped");
  }

  crossfadeTo(newName, duration = 0.5) {
    const newAction = this.actions[newName];
    if (!newAction) return console.error(`Animation "${newName}" not found`);

    const current = Object.values(this.actions).find(
      (a) => a.isRunning() && a.getEffectiveWeight() > 0,
    );

    if (current && current !== newAction) current.fadeOut(duration);

    newAction.reset();
    newAction
      .setEffectiveTimeScale(1)
      .setEffectiveWeight(1)
      .fadeIn(duration)
      .play();

    console.log(`🔄 Crossfade to: ${newName}`);
  }

  // ========== UTILITIES ==========
  debug() {
    console.log("=== DEBUG ===");
    console.log("Model loaded successfully");
  }

  // ========== LIFECYCLE ==========
  resize() {}

  update() {
    if (this.mixer && this.experience.time) {
      this.mixer.update(this.experience.time.delta / 1000);
    }
  }

  destroy() {
    // Clean up animation mixer if needed
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
  }
}
