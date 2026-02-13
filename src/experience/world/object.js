import * as THREE from "three";
import Experience from "../experience.js";
import GSAP from "gsap";
import GUI from "lil-gui";

export default class Object3D {
  constructor() {
    this.experience = Experience.instance;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.sizes = this.experience.sizes;

    const gltfData = this.resources.items.room;

    // Check if we have data
    if (!gltfData) {
      console.error("No GLTF data found!");
      return;
    }

    // Check if scene exists
    if (!gltfData.scene) {
      console.error("GLTF data has no scene property!");
      return;
    }

    this.actualObject = gltfData.scene;
    console.log("✅ Using scene:", this.actualObject);

    this.gltf = gltfData;

    console.log("=== OBJECT3D READY ===");

    this.setModel();
    this.setupAnimations();
    // this.setupDebugGUI();

    // this.setupInteractions();
  }
  // Add this method to your Object3D class
  debugModelPosition() {
    console.log("=== MODEL POSITION DEBUG ===");
    console.log(
      "Model position:",
      this.actualObject.position.clone().toArray(),
    );

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(this.actualObject);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    console.log("Bounding box center:", center.toArray());
    console.log("Bounding box size:", size.toArray());
    console.log("Bounding box min:", box.min.toArray());
    console.log("Bounding box max:", box.max.toArray());

    // Add visual markers
    this.addDebugMarkers(center);
  }

  addDebugMarkers(modelCenter) {
    // Red sphere at world origin (0,0,0)
    const originMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    );
    this.scene.add(originMarker);

    // Green sphere at where camera is looking (0,1,0)
    const targetMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
    );
    targetMarker.position.set(0, 1, 0);
    this.scene.add(targetMarker);

    // Blue sphere at model's bounding box center
    if (modelCenter) {
      const modelCenterMarker = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x0000ff }),
      );
      modelCenterMarker.position.copy(modelCenter);
      this.scene.add(modelCenterMarker);
    }

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ff00, 0x444444);
    this.scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    console.log("✅ Debug markers added:");
    console.log("  🔴 Red: World origin (0,0,0)");
    console.log("  🟢 Green: Camera target (0,1,0)");
    console.log("  🔵 Blue: Model center");
  }
  // In object.js, add this method
  // setupDebugGUI() {
  //   // Only create GUI if we're in development/localhost
  //   if (
  //     window.location.hostname === "localhost" ||
  //     window.location.hostname === "127.0.0.1" ||
  //     window.location.search.includes("debug")
  //   ) {
  //     // Give it a moment to ensure DOM is ready
  //     setTimeout(() => {
  //       this.gui = new GUI({ title: "Model Controls", width: 300 });

  //       // Position controls
  //       const positionFolder = this.gui.addFolder("Position");
  //       positionFolder.add(this.actualObject.position, "x", -20, 20).name("X");
  //       positionFolder.add(this.actualObject.position, "y", -20, 20).name("Y");
  //       positionFolder.add(this.actualObject.position, "z", -20, 20).name("Z");
  //       positionFolder.open();

  //       // Scale controls
  //       const scaleFolder = this.gui.addFolder("Scale");
  //       scaleFolder
  //         .add(this.actualObject.scale, "x", 0.001, 2)
  //         .name("X")
  //         .onChange((value) => {
  //           this.actualObject.scale.set(value, value, value);
  //         });
  //       scaleFolder.add(this.actualObject.scale, "y", 0.001, 2).name("Y");
  //       scaleFolder.add(this.actualObject.scale, "z", 0.001, 2).name("Z");
  //       scaleFolder.open();

  //       // Rotation controls (in degrees)
  //       const rotationFolder = this.gui.addFolder("Rotation");
  //       const rotationInDegrees = {
  //         x: THREE.MathUtils.radToDeg(this.actualObject.rotation.x),
  //         y: THREE.MathUtils.radToDeg(this.actualObject.rotation.y),
  //         z: THREE.MathUtils.radToDeg(this.actualObject.rotation.z),
  //       };

  //       rotationFolder
  //         .add(rotationInDegrees, "x", -180, 180)
  //         .name("X")
  //         .onChange((value) => {
  //           this.actualObject.rotation.x = THREE.MathUtils.degToRad(value);
  //         });
  //       rotationFolder
  //         .add(rotationInDegrees, "y", -180, 180)
  //         .name("Y")
  //         .onChange((value) => {
  //           this.actualObject.rotation.y = THREE.MathUtils.degToRad(value);
  //         });
  //       rotationFolder
  //         .add(rotationInDegrees, "z", -180, 180)
  //         .name("Z")
  //         .onChange((value) => {
  //           this.actualObject.rotation.z = THREE.MathUtils.degToRad(value);
  //         });
  //       rotationFolder.open();

  //       // Reset button
  //       this.gui
  //         .add(
  //           {
  //             reset: () => {
  //               this.actualObject.position.set(0, 0, 0);
  //               this.actualObject.scale.set(1, 1, 1);
  //               this.actualObject.rotation.set(0, 0, 0);
  //               positionFolder.controllers.forEach((c) => c.updateDisplay());
  //               scaleFolder.controllers.forEach((c) => c.updateDisplay());
  //               rotationInDegrees.x = 0;
  //               rotationInDegrees.y = 0;
  //               rotationInDegrees.z = 0;
  //               rotationFolder.controllers.forEach((c) => c.updateDisplay());
  //             },
  //           },
  //           "reset",
  //         )
  //         .name("Reset Model");

  //       console.log("Debug GUI created");
  //     }, 100);
  //   }
  // }

  setModel() {
    console.log("Setting up model...");

    // Position the model in the CENTER of the 3D world
    // Camera will use viewOffset to shift it to the right on screen

    let scaleFactor = this.sizes.width * 0.0002;
    this.actualObject.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // TEMPORARY: Set position to (0,0,0) to see where the model root is
    this.actualObject.position.set(0, 0, 0);
    this.actualObject.rotation.set(0, 0, 0);
    // Desktop format - model centered at (0, y, z)
    // this.actualObject.position.x = 0; // CENTERED
    // this.actualObject.position.y = -2;
    // this.actualObject.position.z = 1.7;
    this.actualObject.position.set(-5.25, 0, 0);

    // Partial Desktop Size
    if (this.sizes.width < 1400) {
      this.actualObject.scale.set(0.15, 0.15, 0.15);
      this.actualObject.position.x = 0; // CENTERED
      this.actualObject.position.y = 1;
      this.actualObject.position.z = 9.5;
    }

    // Tablet format
    if (this.sizes.width < 960) {
      this.actualObject.position.x = 0; // CENTERED
      this.actualObject.position.y = 1;
      this.actualObject.position.z = 10;
    }

    // Mobile format
    if (this.sizes.width < 600) {
      this.actualObject.scale.set(0.12, 0.12, 0.12);
      this.actualObject.position.x = 0; // CENTERED
      this.actualObject.position.y = -0.5;
      this.actualObject.position.z = 10;
    }

    console.log("Model centered at:", this.actualObject.position);

    this.debugModelPosition();

    // Enable shadows
    this.actualObject.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.scene.add(this.actualObject);
    console.log("Model added to scene!");
  }

  /**
   * Animations
   */
  setupAnimations() {
    // Check if model has animations
    if (!this.gltf.animations || this.gltf.animations.length === 0) {
      console.log("No animations found in model");
      return;
    }

    console.log(`Setting up ${this.gltf.animations.length} animations`);

    // Create animation mixer
    this.mixer = new THREE.AnimationMixer(this.actualObject);
    this.actions = {}; // Store animation actions

    // Create actions for each animation clip
    this.gltf.animations.forEach((clip, index) => {
      const action = this.mixer.clipAction(clip);
      this.actions[clip.name || `animation_${index}`] = action;

      console.log(`Created action: ${clip.name || `animation_${index}`}`);
    });

    // Play the idle animation by default
    const idleAnimationName = "idleComputer";
    this.playAnimation(idleAnimationName, { loop: THREE.LoopRepeat, speed: 1 });

    setTimeout(() => {
      this.playAnimationMakeComment();
    }, 3000); // Delay to ensure everything is set up
    //
  }

  /* TODO
  //todo message parameter to display comment text in the scene
    // need to implement user looking at the camera
    */
  playAnimationMakeComment(duration = 3000, message) {
    const estimatedDuration = duration;

    this.crossfadeTo("comment_up", 0.3);

    // Configure comment_up to not loop and to clamp when finished
    const commentAction = this.actions["comment_up"];
    commentAction.setLoop(THREE.LoopOnce, 1);
    commentAction.clampWhenFinished = true;

    setTimeout(() => {
      this.crossfadeTo("idleComputer", 0.5);
    }, estimatedDuration);
  }

  // Method to play a specific animation
  playAnimation(name, options = {}) {
    if (!this.actions[name]) {
      console.error(
        `Animation "${name}" not found. Available:`,
        Object.keys(this.actions),
      );
      return;
    }

    const action = this.actions[name];

    // Stop all other animations
    Object.values(this.actions).forEach((otherAction) => {
      if (otherAction !== action) {
        otherAction.stop();
      }
    });

    // Configure and play
    action.reset();
    action.setLoop(
      options.loop || THREE.LoopRepeat,
      options.repetitions || Infinity,
    );
    action.clampWhenFinished = options.clampWhenFinished || false;
    action.timeScale = options.speed || 1;

    action.play();
    console.log(`Playing animation: ${name}`);
  }

  // Method to stop all animations
  stopAllAnimations() {
    Object.values(this.actions).forEach((action) => {
      action.stop();
    });
    console.log("All animations stopped");
  }

  // Method to fade between animations
  crossfadeTo(newAnimationName, fadeDuration = 0.5) {
    const newAction = this.actions[newAnimationName];
    if (!newAction) {
      console.error(`Animation "${newAnimationName}" not found`);
      return;
    }

    // Find currently playing action
    let currentAction = null;
    for (const [name, action] of Object.entries(this.actions)) {
      if (action.isRunning() && action.getEffectiveWeight() > 0) {
        currentAction = action;
        break;
      }
    }

    if (currentAction && currentAction !== newAction) {
      // Fade out current action
      currentAction.fadeOut(fadeDuration);
    }

    // Reset and configure new action
    newAction.reset();
    newAction.setEffectiveTimeScale(1);
    newAction.setEffectiveWeight(1);
    newAction.fadeIn(fadeDuration);
    newAction.play();

    console.log(
      `Crossfading from ${currentAction ? "current" : "none"} to: ${newAnimationName}`,
    );
  }

  resize() {}

  update() {
    if (this.mixer && this.experience.time) {
      // Update animation mixer with delta time
      const delta = this.experience.time.delta / 1000; // Convert ms to seconds
      this.mixer.update(delta);
    }

    // Add any other updates here
    // this.actualObject.rotation.y += 0.001; // Example rotation
  }
}
