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

    GSAP.registerPlugin(ScrollTrigger);

    // Add OrbitControls for interactive viewing
    this.orbitControls = new OrbitControls(
      this.camera.perspectiveCamera,
      this.canvas,
    );
    this.orbitControls.enableDamping = true;
    this.orbitControls.enableZoom = true;
    this.orbitControls.enablePan = true;

    this.setScrollTrigger();
  }

  setScrollTrigger() {
    // Simple zoom on scroll
    ScrollTrigger.create({
      trigger: ".first-move",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const scale = 1 + self.progress * 0.5;
        // this.object.scale.set(scale, scale, scale);
      },
    });
  }

  update() {
    if (this.orbitControls) {
      this.orbitControls.update();
    }
  }
}
