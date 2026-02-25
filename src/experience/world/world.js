import Experience from "../experience.js";
import Object3D from "./object.js";
import Environment from "./environment.js";
import Controls from "../controls.js";
import Floor from "./floor.js";
import { EventEmitter } from "events";

export default class World extends EventEmitter {
  constructor() {
    super();

    // ========== DEPENDENCIES ==========
    this.experience = Experience.instance;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.theme = this.experience.theme;

    // ========== INITIALIZATION ==========
    this.waitForResources();
  }

  // ========== RESOURCE LOADING ==========
  waitForResources() {
    // When resources are ready, create the world
    this.resources.on("ready", () => {
      this.createWorld();
      this.emit("worldready");
    });
  }

  createWorld() {
    this.object3D = new Object3D();
    this.environment = new Environment();
    this.floor = new Floor();
    this.controls = new Controls();
  }

  // ========== RESIZE HANDLING ==========
  resize() {
    if (this.object3D && typeof this.object3D.resize === "function") {
      this.object3D.resize();
    }
    if (this.environment && typeof this.environment.resize === "function") {
      this.environment.resize();
    }
    if (this.floor && typeof this.floor.resize === "function") {
      this.floor.resize();
    }
    if (this.controls && typeof this.controls.resize === "function") {
      this.controls.resize();
    }

    console.log("World resize called");
  }

  // ========== UPDATE LOOP ==========
  update() {
    if (this.object3D) {
      this.object3D.update();
    }
    if (this.controls) {
      this.controls.update();
    }
  }
}
