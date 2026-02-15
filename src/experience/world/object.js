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
    this.hoverableMeshes = [];
    this.actions = {};
    this.keywords = ["cylinder"];

    console.log("=== OBJECT3D READY ===", this.actualObject);

    this.init();
  }

  // ========== INITIALIZATION ==========
  init() {
    this.setModel();
    this.setupCursor();
    setTimeout(() => this.setupAnimations(), 100);
    setTimeout(() => this.debug(), 2000);
  }

  setModel() {
    // Position & scale
    const { width } = this.sizes;
    const scale = width * 0.0002;
    this.actualObject.scale.set(scale, scale, scale);
    this.actualObject.position.set(-5.25, 0, 0);

    // Responsive adjustments
    if (width < 1400) this.adjustPosition(0.15, 0, 1, 9.5);
    if (width < 960) this.adjustPosition(0.15, 0, 1, 10);
    if (width < 600) this.adjustPosition(0.12, 0, -0.5, 10);

    // Process meshes
    this.actualObject.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = child.receiveShadow = true;

      if (this.isHumanModel(child)) {
        this.hoverableMeshes.push(child);
        console.log(`🖱️ Hoverable: ${child.name || "unnamed"}`);
      }
    });

    this.scene.add(this.actualObject);
    console.log(
      `✅ Model added with ${this.hoverableMeshes.length} hoverable meshes`,
    );
  }

  adjustPosition(scale, x, y, z) {
    this.actualObject.scale.set(scale, scale, scale);
    this.actualObject.position.set(x, y, z);
  }

  // ========== CURSOR INTERACTION ==========
  setupCursor() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.canvas = this.renderer.renderer.domElement;

    const handlers = {
      mousemove: this.onMouseMove.bind(this),
      mouseleave: this.onMouseLeave.bind(this),
      click: this.onClick.bind(this),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      this.canvas.addEventListener(event, handler);
      this[`_${event}Handler`] = handler; // Store for cleanup
    });

    console.log("✅ Cursor interaction ready");
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX / this.sizes.width) * 2 - 1;
    this.mouse.y = -(e.clientY / this.sizes.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera.perspectiveCamera);
    const hasIntersects =
      this.raycaster.intersectObjects(this.hoverableMeshes).length > 0;

    document.body.classList.toggle("mesh-hover-active", hasIntersects);
    document.body.style.cursor = "";
  }

  onMouseLeave() {
    document.body.classList.remove("mesh-hover-active");
    document.body.style.cursor = "";
  }

  onClick(e) {
    this.onMouseMove(e); // Update raycast
    const intersects = this.raycaster.intersectObjects(this.hoverableMeshes);

    if (intersects.length && this.actions?.comment_up) {
      console.log("✅ Human model clicked:", intersects[0].object.name);
      this.playAnimationMakeComment();
    }
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
    setTimeout(
      () => this.actions.comment_up && this.playAnimationMakeComment(),
      3000,
    );
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

  playAnimationMakeComment(duration = 3000, comment = "Making a comment...") {
    //TODO comment parameter |
    if (!this.actions.comment_up)
      return console.warn("Comment animation not available");

    this.crossfadeTo("comment_up", 0.3);
    // this.crossfadeTo("comment_down", 0.3);

    const action = this.actions.comment_up;
    action.setLoop(THREE.LoopOnce, 1).clampWhenFinished = true;

    // TODO: fix hand gesture
    setTimeout(() => this.crossfadeTo("comment_down", 0.3), 600);
    const action2 = this.actions.comment_down;
    action2.setLoop(THREE.LoopOnce, 1).clampWhenFinished = true;

    setTimeout(() => this.crossfadeTo("idleComputer", 0.5), duration-500);
  }

  // ========== UTILITIES ==========
  isHumanModel(mesh) {
    return this.keywords.some((keyword) =>
      mesh.name.toLowerCase().includes(keyword),
    );
  }

  debug() {
    console.log("=== DEBUG ===");
    if (!this.hoverableMeshes.length) {
      console.log("⚠️ No hoverable meshes! Scanning...");
      this.actualObject.traverse((child) => {
        if (child.isMesh && this.isHumanModel(child)) {
          this.hoverableMeshes.push(child);
          console.log(`✅ Added: ${child.name || "unnamed"}`);
        }
      });
    }

    this.hoverableMeshes.forEach((mesh, i) => {
      console.log(
        `${i}: ${mesh.name || "unnamed"}`,
        mesh.position.clone().toArray(),
      );
    });
  }

  // ========== LIFECYCLE ==========
  resize() {}

  update() {
    if (this.mixer && this.experience.time) {
      this.mixer.update(this.experience.time.delta / 1000);
    }
  }

  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener("mousemove", this._mousemoveHandler);
      this.canvas.removeEventListener("mouseleave", this._mouseleaveHandler);
      this.canvas.removeEventListener("click", this._clickHandler);
    }
    document.body.style.cursor = "default";
  }
}
