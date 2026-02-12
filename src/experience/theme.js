/* Future TODO */
// src/experience/theme.js
import { EventEmitter } from "events";

export default class Theme extends EventEmitter {
  constructor() {
    super();
    this.theme = "light"; // Always light theme
    console.log("Theme initialized - Light theme only");
  }

  // No toggle functionality needed
}
