import * as THREE from "three";
import Experience from "./experience.js";
import GSAP from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default class Controls {
  constructor() {
    this.experience = Experience.instance;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;
    this.camera = this.experience.camera;
    this.object = this.experience.world.object3D.actualObject;
    this.sizes = this.experience.sizes;

    GSAP.registerPlugin(ScrollTrigger);

    // Camera positions for each section
    this.cameraStates = {
      home: {
        position: this.camera.defaultPosition,
        target: new THREE.Vector3(0, 1, 0),
        fov: 35,
      },
      about: {
        position: new THREE.Vector3(0, 6.08, 5.24),
        target: new THREE.Vector3(0, 1.2, 0),
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

    this.setupScrollTriggers();
  }

  setupScrollTriggers() {
    // Create a timeline for each section
    Object.keys(this.cameraStates).forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (!section) return;

      // Get the state for this section
      const state = this.cameraStates[sectionId];

      // Create ScrollTrigger for this section
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () => this.animateToState(state),
        onEnterBack: () => this.animateToState(state),
      });
    });

    // Optional: Parallax effect on scroll
    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        // Subtle camera movement based on overall scroll progress
        // Comment this out if you want only section-based movement
        // const progress = self.progress;
        // const basePos = this.cameraStates.home.position;
        // this.camera.perspectiveCamera.position.y = basePos.y + progress * 0.5;
        // this.camera.perspectiveCamera.lookAt(0, 1 + progress * 0.3, 0);
      },
    });

    console.log("✅ Scroll triggers set up for all sections");
  }

  animateToState(state) {
    // Kill any ongoing animations
    GSAP.killTweensOf(this.camera.perspectiveCamera.position);
    GSAP.killTweensOf(this.camera.perspectiveCamera);
    GSAP.killTweensOf(this.camera.controls.target);

    // Animate camera position
    GSAP.to(this.camera.perspectiveCamera.position, {
      x: state.position.x,
      y: state.position.y,
      z: state.position.z,
      duration: 1.5,
      ease: "power2.inOut",
    });

    // Animate camera FOV
    GSAP.to(this.camera.perspectiveCamera, {
      fov: state.fov,
      duration: 1.2,
      ease: "power2.inOut",
      onUpdate: () => {
        this.camera.perspectiveCamera.updateProjectionMatrix();
      },
    });

    // Animate controls target (what the camera looks at)
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
    } else {
      // Fallback: use lookAt if no controls
      GSAP.to(
        {},
        {
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => {
            this.camera.perspectiveCamera.lookAt(state.target);
          },
        },
      );
    }

    console.log(
      `🎥 Camera moving to ${state.position
        .toArray()
        .map((n) => n.toFixed(1))
        .join(", ")}`,
    );
  }

  // Method to update camera states for responsive design
  updateForScreenSize() {
    if (this.sizes.width < 768) {
      // Mobile adjustments
      this.cameraStates.about.position.set(1.5, 1.2, 12);
      this.cameraStates.about.target.set(0, 1, 0);
      // ... adjust other states for mobile
    } else if (this.sizes.width < 1400) {
      // Tablet adjustments
      this.cameraStates.about.position.set(1.8, 1.3, 11);
      this.cameraStates.about.target.set(0, 1, 0);
    }
  }

  // Method to add custom camera state for a section
  addCameraState(sectionId, position, target, fov = 35) {
    this.cameraStates[sectionId] = {
      position: new THREE.Vector3(position.x, position.y, position.z),
      target: new THREE.Vector3(target.x, target.y, target.z),
      fov: fov,
    };

    // Recreate triggers for this section
    this.setupScrollTriggers();
  }

  update() {
    // Only update if you're using OrbitControls
    // if (this.orbitControls) {
    //   this.orbitControls.update();
    // }
  }
}
