import * as THREE from "three";

import Sizes from "./utils/sizes.js";
import Time from "./utils/time.js";
import Resources from "./utils/resources.js";
import assets from "./utils/assets.js";

import Camera from "./camera.js";
import Theme from "./theme.js";
import Renderer from "./renderer.js";
import Preloader from "./preloader.js";

import World from "./world/world.js";

export default class Experience {
  static instance;
  constructor(canvas) {
  
    // Singleton pattern
    if (Experience.instance) {
      return Experience.instance;
    }

    Experience.instance = this;

    console.log("Experience initialized");

    // Canvas and scene
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    // Utils
    this.time = new Time();
    this.sizes = new Sizes();
    this.resources = new Resources(assets);

    // Components
    this.theme = new Theme();
    this.camera = new Camera();
    this.renderer = new Renderer();

    // World and preloader
    this.world = new World();
    this.preloader = new Preloader();

    // Event listeners
    this.sizes.on("resize", () => {
      this.resize();
    });

    this.time.on("update", () => {
      this.update();
    });
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
    if (this.world) {
      this.world.resize();
    }
  }

  update() {
    this.camera.update();
    this.renderer.update();
    if (this.world) {
      this.world.update();
    }
    if (this.preloader) {
      // Preloader update if needed
    }
  }
}
