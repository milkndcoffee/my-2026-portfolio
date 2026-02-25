import * as THREE from "three";
import Experience from "./experience.js";
import GSAP from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Controls {
  constructor() {
    // ========== DEPENDENCIES ==========
    this.experience = Experience.instance;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.camera = this.experience.camera;
    this.object = this.experience.world.object3D; // Reference to Object3D instance
    this.sizes = this.experience.sizes;

    GSAP.registerPlugin(ScrollTrigger);

    // ========== CAMERA STATES ==========
    this.cameraStates = {
      home: {
        position: this.camera.defaultPosition,
        target: new THREE.Vector3(0, 1, 0),
        fov: 35,
      },
      about: {
        position: new THREE.Vector3(-0.49, 2.97, 5.94),
        target: new THREE.Vector3(-0.49, 1.79, -0.13),
        fov: 40,
      },
      projects: {
        position: new THREE.Vector3(-1.62, 3.47, 2.37),
        target: new THREE.Vector3(-0.68, 0.35, 1.25),
        fov: 38,
      },
      experience: {
        position: new THREE.Vector3(5.08, 1.9, 1.33),
        target: new THREE.Vector3(-0.02, 1.9, 1.27),
        fov: 37,
      },
      contact: {
        position: new THREE.Vector3(1.46, 2.58, -1.3),
        target: new THREE.Vector3(-2.95, -0.69, 7.28),
        fov: 42,
      },
      resume: {
        position: new THREE.Vector3(1.5, 1.6, 13),
        target: new THREE.Vector3(0, 1.3, 0),
        fov: 39,
      },
      archive: {
        position: new THREE.Vector3(-1.69, 3.25, 4.76),
        target: new THREE.Vector3(-1.58, 1.82, -0.17),
        fov: 36,
      },
    };

    // ========== ANIMATION CONFIG ==========
    this.sectionAnimations = {
      home: {
        type: "simple",
        idle: "idleComputer",
        idleLoop: true,
        delay: 0.2,
        idleCrossfadeDuration: 0.4,
        speed: 1,
      },
      about: {
        type: "complex",
        entry: "about1",
        entryClamp: true,
        idle: "about2",
        idleLoop: true,
        delay: 0.3,
        entryCrossfadeDuration: 0.2,
        idleCrossfadeDuration: 0.5,
        speed: 1,
        maxDuration: 5,
        returnToIdle: "idleComputer",
        returnCrossfadeDuration: 0.5,
      },
      projects: {
        type: "simple",
        idle: "idleComputer",
        idleLoop: true,
        delay: 0.2,
        entryCrossfadeDuration: 0.5,
        speed: 1,
      },
      experience: {
        type: "complex",
        entry: "focus_in",
        entryClamp: true,
        idle: "focus_type",
        idleLoop: true,
        delay: 0.1,
        entryCrossfadeDuration: 0.4,
        idleCrossfadeDuration: 0.4,
        speed: 1,
        maxDuration: 4,
        returnToIdle: "idleComputer",
        returnCrossfadeDuration: 0.5,
      },
      contact: {
        type: "complex",
        entry: "turn_back",
        entryClamp: true,
        idle: "idleComputer",
        idleLoop: true,
        delay: 0.02,
        entryCrossfadeDuration: 0.1,
        idleCrossfadeDuration: 0.4,
        speed: 1,
      },
      resume: {
        type: "simple",
        idle: "idleComputer",
        idleLoop: true,
        delay: 0.2,
        entryCrossfadeDuration: 0.2,
        speed: 1,
      },
      archive: {
        type: "simple",
        idle: "idleComputer",
        idleLoop: true,
        delay: 0.2,
        entryCrossfadeDuration: 0.2,
        speed: 1,
      },
    };

    // ========== STATE TRACKING ==========
    this.currentSection = null;
    this.isAnimating = false;
    this.currentAnimation = null;
    this.returnTimeout = null;

    // ========== INITIALIZATION ==========
    this.setupScrollTriggers();
  }

  // ========== SCROLL TRIGGERS ==========
  setupScrollTriggers() {
    Object.keys(this.cameraStates).forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (!section) return;

      const state = this.cameraStates[sectionId];

      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () => this.handleSectionEnter(sectionId, state),
        onEnterBack: () => this.handleSectionEnter(sectionId, state),
      });
    });

    console.log("✅ Scroll triggers set up for all sections");
  }

  // ========== SECTION HANDLING ==========
  handleSectionEnter(sectionId, cameraState) {
    if (this.currentSection === sectionId) return;

    console.log(`📍 Entering section: ${sectionId}`);
    this.currentSection = sectionId;

    if (this.returnTimeout) {
      clearTimeout(this.returnTimeout);
      this.returnTimeout = null;
    }

    this.animateCameraToState(cameraState);

    const animConfig = this.sectionAnimations[sectionId];
    if (!animConfig) return;

    if (this.animationTimeout) clearTimeout(this.animationTimeout);
    if (this.idleTimeout) clearTimeout(this.idleTimeout);

    this.cameraAnimationDuration = 1.5;

    this.animationTimeout = setTimeout(
      () => {
        if (animConfig.type === "complex") {
          this.animateComplexSection(animConfig);
        } else {
          this.animateSimpleSection(animConfig);
        }
      },
      (animConfig.delay || 0.2) * 1000 + this.cameraAnimationDuration * 1000,
    );
  }

  // ========== CAMERA ANIMATION ==========
  animateCameraToState(state) {
    GSAP.killTweensOf(this.camera.perspectiveCamera.position);
    GSAP.killTweensOf(this.camera.perspectiveCamera);
    GSAP.killTweensOf(this.camera.controls.target);

    GSAP.to(this.camera.perspectiveCamera.position, {
      x: state.position.x,
      y: state.position.y,
      z: state.position.z,
      duration: 1.5,
      ease: "power2.inOut",
    });

    GSAP.to(this.camera.perspectiveCamera, {
      fov: state.fov,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => {
        this.camera.perspectiveCamera.updateProjectionMatrix();
      },
    });

    if (this.camera.controls) {
      GSAP.to(this.camera.controls.target, {
        x: state.target.x,
        y: state.target.y,
        z: state.target.z,
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
          this.camera.controls.update();
        },
      });
    }
  }

  // ========== COMPLEX SECTION ANIMATION ==========
  animateComplexSection(config) {
    const {
      entry,
      idle,
      entryCrossfadeDuration = 0.5,
      idleCrossfadeDuration = 0.4,
      speed = 1,
      maxDuration,
      returnToIdle = "idleComputer",
      returnCrossfadeDuration = 0.5,
      entryClamp = true,
      idleLoop = true,
    } = config;

    if (!this.object || !this.object.actions) return;

    console.log(
      `🎬 Crossfading to entry: ${entry} (idle will ${idleLoop ? "loop" : "play once"})`,
    );

    if (this.returnTimeout) {
      clearTimeout(this.returnTimeout);
      this.returnTimeout = null;
    }

    // Handle entry animation
    const currentAction = this.findCurrentAnimation();

    if (currentAction && currentAction !== this.object.actions[entry]) {
      currentAction.fadeOut(entryCrossfadeDuration);
    }

    let entryAction = this.object.actions[entry];
    if (!entryAction) {
      console.error(`Animation "${entry}" not found`);
      return;
    }

    // Configure entry animation (always non-looping)
    entryAction.reset();
    entryAction.setLoop(THREE.LoopOnce, 1);
    entryAction.clampWhenFinished = entryClamp;
    entryAction.timeScale = speed;

    if (currentAction && currentAction !== entryAction) {
      entryAction.fadeIn(entryCrossfadeDuration);
    }
    entryAction.play();

    this.currentAnimation = entry;

    // Schedule transition to idle
    const entryDuration = this.getAnimationDuration(entry) || 2.0;

    this.idleTimeout = setTimeout(
      () => {
        console.log(
          `🎬 Crossfading to idle: ${idle} (${idleLoop ? "looping" : "once"})`,
        );

        let idleAction = this.object.actions[idle];
        if (!idleAction) {
          console.error(`Animation "${idle}" not found`);
          return;
        }

        // Configure idle based on idleLoop flag
        idleAction.reset();

        if (idleLoop) {
          idleAction.setLoop(THREE.LoopRepeat, Infinity);
          idleAction.clampWhenFinished = false;
          console.log(`   ✅ ${idle} set to LOOP`);
        } else {
          idleAction.setLoop(THREE.LoopOnce, 1);
          idleAction.clampWhenFinished = true;
          console.log(`   ⏱️ ${idle} set to play ONCE`);
        }

        idleAction.timeScale = speed;

        // Crossfade from entry to idle
        if (entryAction.isRunning()) {
          entryAction.fadeOut(idleCrossfadeDuration);
        }

        idleAction.fadeIn(idleCrossfadeDuration).play();
        this.currentAnimation = idle;

        // Schedule return to idleComputer if needed
        if (maxDuration && idle !== "idleComputer") {
          this.returnTimeout = setTimeout(() => {
            this.returnToIdleAnimation(returnToIdle, returnCrossfadeDuration);
          }, maxDuration * 1000);
        }
      },
      entryDuration * 1000 - idleCrossfadeDuration * 1000 * 0.5,
    );
  }

  // ========== SIMPLE SECTION ANIMATION ==========
  animateSimpleSection(config) {
    const {
      idle,
      entryCrossfadeDuration = 0.5,
      speed = 1,
      maxDuration,
      returnToIdle = "idleComputer",
      returnCrossfadeDuration = 0.5,
      idleLoop = true,
    } = config;

    if (!this.object || !this.object.actions) return;

    console.log(
      `🎬 Crossfading to idle: ${idle} (${idleLoop ? "looping" : "once"})`,
    );

    if (this.returnTimeout) {
      clearTimeout(this.returnTimeout);
      this.returnTimeout = null;
    }

    const currentAction = this.findCurrentAnimation();
    let idleAction = this.object.actions[idle];

    if (!idleAction) {
      console.error(`Animation "${idle}" not found`);
      return;
    }

    // Configure idle based on idleLoop flag
    idleAction.reset();

    if (idleLoop) {
      idleAction.setLoop(THREE.LoopRepeat, Infinity);
      idleAction.clampWhenFinished = false;
      console.log(`   ✅ ${idle} set to LOOP`);
    } else {
      idleAction.setLoop(THREE.LoopOnce, 1);
      idleAction.clampWhenFinished = true;
      console.log(`   ⏱️ ${idle} set to play ONCE`);
    }

    idleAction.timeScale = speed;

    if (currentAction && currentAction !== idleAction) {
      currentAction.fadeOut(entryCrossfadeDuration);
      idleAction.fadeIn(entryCrossfadeDuration);
    }

    idleAction.play();
    this.currentAnimation = idle;

    // Schedule return to idleComputer if needed
    if (maxDuration && idle !== "idleComputer") {
      this.returnTimeout = setTimeout(() => {
        this.returnToIdleAnimation(returnToIdle, returnCrossfadeDuration);
      }, maxDuration * 1000);
    }
  }

  // ========== ANIMATION UTILITIES ==========
  returnToIdleAnimation(
    returnToIdle = "idleComputer",
    crossfadeDuration = 0.5,
  ) {
    if (!this.object || !this.object.actions) return;

    console.log(`🔄 Returning to idle: ${returnToIdle}`);

    const currentAction = this.findCurrentAnimation();
    const idleAction = this.object.actions[returnToIdle];

    if (!idleAction) {
      console.error(`Idle animation "${returnToIdle}" not found`);
      return;
    }

    // Configure idle for looping
    idleAction.reset();
    idleAction.setLoop(THREE.LoopRepeat, Infinity);
    idleAction.timeScale = 1;

    if (currentAction && currentAction !== idleAction) {
      currentAction.fadeOut(crossfadeDuration);
      idleAction.fadeIn(crossfadeDuration);
    }

    idleAction.play();
    this.currentAnimation = returnToIdle;
  }

  findCurrentAnimation() {
    if (!this.object || !this.object.actions) return null;

    for (let name in this.object.actions) {
      const action = this.object.actions[name];
      if (action.isRunning() && action.getEffectiveWeight() > 0.1) {
        return action;
      }
    }
    return null;
  }

  getAnimationDuration(animationName) {
    if (this.object.gltf && this.object.gltf.animations) {
      const clip = this.object.gltf.animations.find(
        (a) => a.name === animationName,
      );
      if (clip) return clip.duration;
    }

    const durations = {
      wave_hello: 1.5,
      point_at_screen: 2.0,
      wave_goodbye: 1.8,
      look_at_archive: 2.2,
      about1: 2.5,
      about2: 3.0,
      focus_in: 1.8,
      focus_type: 2.2,
      turn_back: 1.5,
      look_back: 1.8,
      idleComputer: 2.0,
    };

    return durations[animationName] || 2.0;
  }

  // ========== RESPONSIVE HANDLING ==========
  updateForScreenSize() {
    if (this.sizes.width < 768) {
      this.cameraStates.about.position.set(1.5, 1.2, 12);
      this.cameraStates.about.target.set(0, 1, 0);
    } else if (this.sizes.width < 1400) {
      this.cameraStates.about.position.set(1.8, 1.3, 11);
      this.cameraStates.about.target.set(0, 1, 0);
    }
  }

  // ========== PUBLIC API ==========
  addCameraState(sectionId, position, target, fov = 35) {
    this.cameraStates[sectionId] = {
      position: new THREE.Vector3(position.x, position.y, position.z),
      target: new THREE.Vector3(target.x, target.y, target.z),
      fov: fov,
    };
    this.setupScrollTriggers();
  }

  // ========== LIFECYCLE ==========
  destroy() {
    if (this.animationTimeout) clearTimeout(this.animationTimeout);
    if (this.idleTimeout) clearTimeout(this.idleTimeout);
    if (this.returnTimeout) clearTimeout(this.returnTimeout);
  }

  update() {
    // Update animation mixer if needed
    // if (this.object && this.object.mixer && this.experience.time) {
    //   this.object.mixer.update(this.experience.time.delta / 1000);
    // }
  }
}
