import Experience from "./experience.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

export default class Camera {
  constructor() {
    this.experience = Experience.instance;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    // Default camera coordinates
    this.defaultPosition = new THREE.Vector3(0, 3, 15);
    this.defaultTarget = new THREE.Vector3(0, 1, 0);
    this.defaultFOV = 35;

    this.createPerspectiveCamera();
    this.setOrbitControls();

    // Initialize viewOffset
    this.viewOffset = {
      enabled: true,
      offsetX: -450,
      offsetY: 0,
    };
    this.applyViewOffset();

    // Setup GUI AFTER everything is initialized
    // this.setupDebugGUI();
  }

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

  // SINGLE setOrbitControls method - remove the duplicate!
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

  setupDebugGUI() {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.search.includes("debug")
    ) {
      console.log("🎮 Creating GUI...");
      this.gui = new GUI({
        title: "Camera Controls",
        width: 450,
        closed: true,
      });

      // ===== 1. CAMERA POSITION & TARGET GRABBER =====
      const grabFolder = this.gui.addFolder("🎯 Grab Camera Data");

      // Current position display (read-only)
      const posDisplay = {
        x: this.perspectiveCamera.position.x,
        y: this.perspectiveCamera.position.y,
        z: this.perspectiveCamera.position.z,
      };

      grabFolder.add(posDisplay, "x").name("Position X").listen();
      grabFolder.add(posDisplay, "y").name("Position Y").listen();
      grabFolder.add(posDisplay, "z").name("Position Z").listen();

      // Current target display (read-only)
      const targetDisplay = {
        x: this.controls.target.x,
        y: this.controls.target.y,
        z: this.controls.target.z,
      };

      grabFolder.add(targetDisplay, "x").name("Target X").listen();
      grabFolder.add(targetDisplay, "y").name("Target Y").listen();
      grabFolder.add(targetDisplay, "z").name("Target Z").listen();

      // GRAB BUTTON
      grabFolder
        .add(
          {
            grabCameraData: () => {
              const pos = this.perspectiveCamera.position;
              const target = this.controls.target;
              console.log("\n=== 📸 CAMERA DATA GRABBED ===");
              console.log(
                `position: new THREE.Vector3(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}),`,
              );
              console.log(
                `target: new THREE.Vector3(${target.x.toFixed(2)}, ${target.y.toFixed(2)}, ${target.z.toFixed(2)}),`,
              );
              console.log(`fov: ${this.perspectiveCamera.fov},`);
              console.log("===============================\n");
            },
          },
          "grabCameraData",
        )
        .name("📋 GRAB CURRENT CAMERA DATA");

      grabFolder.open();

      // ===== 2. LIVE CAMERA POSITION CONTROLS =====
      const posFolder = this.gui.addFolder("📐 Live Camera Controls");

      // VERIFY these properties exist
      console.log("Camera Position:", this.perspectiveCamera.position);
      console.log("Controls Target:", this.controls.target);

      // IMPORTANT: Add sliders that directly control the camera!
      if (this.perspectiveCamera.position) {
        posFolder
          .add(this.perspectiveCamera.position, "x", -20, 20)
          .name("Position X")
          .onChange(() => this.controls?.update());
        posFolder
          .add(this.perspectiveCamera.position, "y", -20, 20)
          .name("Position Y")
          .onChange(() => this.controls?.update());
        posFolder
          .add(this.perspectiveCamera.position, "z", 1, 50)
          .name("Position Z (Distance)")
          .onChange(() => this.controls?.update());
      }

      // Target controls
      if (this.controls?.target) {
        posFolder
          .add(this.controls.target, "x", -10, 10)
          .name("Target X")
          .onChange(() => this.controls?.update());
        posFolder
          .add(this.controls.target, "y", -5, 5)
          .name("Target Y")
          .onChange(() => this.controls?.update());
        posFolder
          .add(this.controls.target, "z", -10, 10)
          .name("Target Z")
          .onChange(() => this.controls?.update());
      }

      posFolder.open();

      // ===== 3. CAMERA PRESETS =====
      const presetFolder = this.gui.addFolder("🎬 Camera Presets");

      presetFolder
        .add(
          {
            front: () => {
              this.perspectiveCamera.position.set(0, 1, 15);
              this.controls.target.set(0, 1, 0);
              this.controls.update();
            },
          },
          "front",
        )
        .name("👤 Front View");

      presetFolder
        .add(
          {
            side: () => {
              this.perspectiveCamera.position.set(10, 1, 5);
              this.controls.target.set(0, 1, 0);
              this.controls.update();
            },
          },
          "side",
        )
        .name("↔️ Side View");

      presetFolder
        .add(
          {
            threeQuarter: () => {
              this.perspectiveCamera.position.set(8, 4, 12);
              this.controls.target.set(0, 1, 0);
              this.controls.update();
            },
          },
          "threeQuarter",
        )
        .name("🎯 Three-Quarter View");

      presetFolder.open();

      // ===== 4. CHARACTER SCREEN POSITION =====
      const charFolder = this.gui.addFolder("🎯 Character Screen Position");

      if (this.viewOffset) {
        charFolder
          .add(this.viewOffset, "enabled")
          .name("Enable View Offset")
          .onChange(() => this.applyViewOffset());
        charFolder
          .add(this.viewOffset, "offsetX", -2000, 2000)
          .name("←→ Shift Horizontal")
          .onChange(() => {
            this.viewOffset.enabled = true;
            this.applyViewOffset();
          });
        charFolder
          .add(this.viewOffset, "offsetY", -2000, 2000)
          .name("↑↓ Shift Vertical")
          .onChange(() => {
            this.viewOffset.enabled = true;
            this.applyViewOffset();
          });
      }

      // Preset buttons
      charFolder
        .add(
          { center: () => this.setCharacterScreenPosition("center") },
          "center",
        )
        .name("📌 Center");
      charFolder
        .add({ right: () => this.setCharacterScreenPosition("right") }, "right")
        .name("➡️ Right Side (15%)");
      charFolder
        .add({ left: () => this.setCharacterScreenPosition("left") }, "left")
        .name("⬅️ Left Side (15%)");

      charFolder.open();

      // ===== 5. CAMERA SETTINGS =====
      const settingsFolder = this.gui.addFolder("⚙️ Camera Settings");

      if (this.perspectiveCamera) {
        settingsFolder
          .add(this.perspectiveCamera, "fov", 10, 100)
          .name("Field of View (FOV)")
          .onChange(() => this.perspectiveCamera.updateProjectionMatrix());
      }

      if (this.controls) {
        settingsFolder
          .add(this.controls, "enableDamping")
          .name("Enable Smooth Damping");
        settingsFolder
          .add(this.controls, "dampingFactor", 0, 0.2)
          .name("Damping Factor");
        settingsFolder.add(this.controls, "enableZoom").name("Enable Zoom");
        settingsFolder.add(this.controls, "enablePan").name("Enable Pan");
        settingsFolder.add(this.controls, "enableRotate").name("Enable Rotate");
      }

      settingsFolder.open();
      grabFolder.close();
      presetFolder.close();
      charFolder.close();
      settingsFolder.close();

      // ===== 6. RESET =====
      this.gui
        .add(
          {
            resetAll: () => {
              this.perspectiveCamera.position.copy(this.defaultPosition);
              this.perspectiveCamera.fov = this.defaultFOV;
              this.controls.target.copy(this.defaultTarget);
              this.perspectiveCamera.updateProjectionMatrix();
              this.controls.update();

              this.viewOffset.enabled = true;
              this.viewOffset.offsetX = -450;
              this.viewOffset.offsetY = 0;
              this.applyViewOffset();
            },
          },
          "resetAll",
        )
        .name("🔄 Reset All");

      // Force GUI to refresh
      this.gui.controllers.forEach((c) => c.updateDisplay());

      console.log("✅ Camera debug GUI ready with full controls!");
    }
  }

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

  update() {
    this.controls?.update();
  }
}
