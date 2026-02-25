import { EventEmitter } from "events";

export default class Time extends EventEmitter {
  constructor() {
    super();

    // ========== INITIAL TIME VALUES ==========
    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16; // Approximate 60fps frame time

    // ========== START UPDATE LOOP ==========
    this.update();
  }

  // ========== UPDATE LOOP ==========
  update() {
    this.calculateTimeDelta();
    this.emit("update");
    this.requestNextFrame();
  }

  calculateTimeDelta() {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;
  }

  requestNextFrame() {
    window.requestAnimationFrame(() => {
      this.update();
    });
  }

  // ========== UTILITY METHODS ==========
  getElapsedSeconds() {
    return this.elapsed / 1000;
  }
}
