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
    // ========== SINGLETON PATTERN ==========
    if (Experience.instance) {
      return Experience.instance;
    }
    Experience.instance = this;

    console.log("Experience initialized");

    // ========== CORE SETUP ==========
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    // ========== UTILITIES ==========
    this.time = new Time();
    this.sizes = new Sizes();
    this.resources = new Resources(assets);

    // ========== COMPONENTS ==========
    this.theme = new Theme();
    this.camera = new Camera();
    this.renderer = new Renderer();

    // ========== WORLD & PRELOADER ==========
    this.world = new World();
    this.preloader = new Preloader();

    // ========== EVENT LISTENERS ==========
    this.sizes.on("resize", () => {
      this.resize();
    });

    this.time.on("update", () => {
      this.update();
    });
  }

  // ========== RESIZE HANDLING ==========
  resize() {
    this.camera.resize();
    this.renderer.resize();
    if (this.world) {
      this.world.resize();
    }
  }

  // ========== UPDATE LOOP ==========
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
