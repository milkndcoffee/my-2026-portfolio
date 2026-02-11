import { EventEmitter } from "events";

export default class Time extends EventEmitter {
  constructor() {
    super();

    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.delta = 16; // Approximate 60fps frame time

    this.update();
  }

  update() {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsed = this.current - this.start;

    this.emit("update");

    window.requestAnimationFrame(() => {
      this.update();
    });
  }

  getElapsedSeconds() {
    return this.elapsed / 1000;
  }
}
