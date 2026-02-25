import Experience from "./experience.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Camera {
  constructor() {
    // ========== DEPENDENCIES ==========
    this.experience = Experience.instance;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    // ========== DEFAULT POSITIONS ==========
    this.defaultPosition = new THREE.Vector3(0, 3, 15);
    this.defaultTarget = new THREE.Vector3(0, 1, 0);
    this.defaultFOV = 35;

    // ========== INITIALIZATION ==========
    this.createPerspectiveCamera();
    this.setOrbitControls();
    this.initializeViewOffset();
    this.applyViewOffset();
  }

  // ========== CAMERA CREATION ==========
  createPerspectiveCamera() {
    this.perspectiveCamera = new THREE.PerspectiveCamera(
      this.defaultFOV,
      this.sizes.aspect,
      0.1,
      1000,
    );
    this.scene.add(this.perspectiveCamera);

    this.perspectiveCamera.position.copy(this.defaultPosition);
    this.perspectiveCamera.lookAt(this.defaultTarget);

    console.log(
      "✅ Perspective camera created at:",
      this.defaultPosition.toArray(),
    );
  }

  // ========== ORBIT CONTROLS ==========
  setOrbitControls() {
    // Create controls
    this.controls = new OrbitControls(this.perspectiveCamera, this.canvas);

    // Configure properties
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 50;

    // Set target
    this.controls.target.copy(this.defaultTarget);

    console.log("✅ OrbitControls created");
  }

  // ========== VIEW OFFSET ==========
  initializeViewOffset() {
    if (this.sizes.width < 1920) {
      this.viewOffset = {
        enabled: true,
        offsetX: -this.sizes.width * 0.15, // Shift left by 15% of screen width
        offsetY: 0,
      };
    } else {
      this.viewOffset = {
        enabled: true,
        offsetX: -450,
        offsetY: 0,
      };
    }
  }

  applyViewOffset() {
    if (this.viewOffset.enabled) {
      this.perspectiveCamera.setViewOffset(
        this.sizes.width,
        this.sizes.height,
        this.viewOffset.offsetX,
        this.viewOffset.offsetY,
        this.sizes.width,
        this.sizes.height,
      );
    } else {
      this.perspectiveCamera.clearViewOffset();
    }
    this.perspectiveCamera.updateProjectionMatrix();
  }

  setCharacterScreenPosition(position = "center") {
    switch (position) {
      case "center":
        this.viewOffset.enabled = false;
        this.viewOffset.offsetX = 0;
        this.viewOffset.offsetY = 0;
        break;
      case "right":
        this.viewOffset.enabled = true;
        this.viewOffset.offsetX = -this.sizes.width * 0.15;
        this.viewOffset.offsetY = 0;
        break;
      case "left":
        this.viewOffset.enabled = true;
        this.viewOffset.offsetX = this.sizes.width * 0.15;
        this.viewOffset.offsetY = 0;
        break;
      case "right-third":
        this.viewOffset.enabled = true;
        this.viewOffset.offsetX = -this.sizes.width * 0.33;
        this.viewOffset.offsetY = 0;
        break;
      case "left-third":
        this.viewOffset.enabled = true;
        this.viewOffset.offsetX = this.sizes.width * 0.33;
        this.viewOffset.offsetY = 0;
        break;
    }
    this.applyViewOffset();
  }

  // ========== RESIZE HANDLING ==========
  resize() {
    this.perspectiveCamera.aspect = this.sizes.aspect;

    if (this.viewOffset?.enabled) {
      const offsetPercentageX = this.viewOffset.offsetX / this.sizes.width;
      const offsetPercentageY = this.viewOffset.offsetY / this.sizes.height;

      this.viewOffset.offsetX = this.sizes.width * offsetPercentageX;
      this.viewOffset.offsetY = this.sizes.height * offsetPercentageY;
      this.applyViewOffset();
    }

    this.perspectiveCamera.updateProjectionMatrix();
  }

  // ========== UPDATE LOOP ==========
  update() {
    this.controls?.update();
  }
}
