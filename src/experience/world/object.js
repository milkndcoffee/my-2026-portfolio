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
    // this.setupDebugGUI(); // Add this line

    // this.setupInteractions();
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

    // Scale factor - adjust this based on your model size
    let scaleFactor = this.sizes.width * 0.0002; // Default scaling based on screen size

    console.log("Using scale factor:", scaleFactor);
    this.actualObject.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // Desktop format adjustment for scale and position
    this.actualObject.position.x = 1 / (this.sizes.width * 0.4);
    this.actualObject.position.y = -2;
    this.actualObject.position.z = 1.7;

    // Partial Desktop Size format adjustment for scale and position
    if (this.sizes.width < 1400) {
      this.actualObject.scale.set(0.15, 0.15, 0.15);
      this.actualObject.position.x = -0.5;
      this.actualObject.position.y = 1;
      this.actualObject.position.z = 9.5;
    }

    // Tablet format adjustment for scale and position
    if (this.sizes.width < 960) {
      // this.actualObject.scale.set(0.15, 0.15, 0.15);
      this.actualObject.position.x = -1.2;
      this.actualObject.position.y = 1;
      this.actualObject.position.z = 10;
    }

    // Mobile format adjustment for scale and position
    if (this.sizes.width < 600) {
      this.actualObject.scale.set(0.12, 0.12, 0.12);
      this.actualObject.position.x = -1.2;
      this.actualObject.position.y = -0.5;
      this.actualObject.position.z = 10;
    }

    console.log("Position :", this.actualObject.position);

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
  playAnimationMakeComment(duration = 3000, message){
    const estimatedDuration = duration; 

    this.playAnimation("comment_up", {
      loop: THREE.LoopOnce,
      clampWhenFinished: true,
    });

    setTimeout(() => {
      // Return to idle
      const idleAnimationName = "idleComputer";
      this.playAnimation(idleAnimationName);
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

    const oldAction = this.mixer._listeners.find(
      (listener) => listener.action && listener.action.isRunning(),
    )?.action;

    if (oldAction) {
      // Fade out old, fade in new
      oldAction.fadeOut(fadeDuration);
    }

    newAction.reset();
    newAction.setEffectiveTimeScale(1);
    newAction.setEffectiveWeight(1);
    newAction.fadeIn(fadeDuration);
    newAction.play();

    console.log(`Crossfading to: ${newAnimationName}`);
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
