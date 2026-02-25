import { EventEmitter } from "events";

export default class Sizes extends EventEmitter {
  constructor() {
    super();

    // ========== INITIAL DIMENSIONS ==========
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.frustrum = 5;

    // ========== EVENT LISTENERS ==========
    this.setupResizeListener();
    this.setupOrientationListener();
  }

  // ========== RESIZE HANDLING ==========
  setupResizeListener() {
    window.addEventListener("resize", () => {
      this.updateDimensions();
      this.emit("resize");
    });
  }

  // ========== ORIENTATION HANDLING ==========
  setupOrientationListener() {
    window.addEventListener("orientationchange", () => {
      // Small delay to ensure dimensions are updated after orientation change
      setTimeout(() => {
        this.updateDimensions();
        this.emit("resize");
      }, 100);
    });
  }

  // ========== DIMENSION UPDATE UTILITY ==========
  updateDimensions() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.aspect = this.width / this.height;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }
}
