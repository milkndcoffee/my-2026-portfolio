import { EventEmitter } from "events";
import Experience from "./experience.js";
import GSAP from "gsap";

export default class Preloader extends EventEmitter {
  constructor() {
    super();

    this.experience = Experience.instance;
    this.scene = this.experience.scene;
    this.sizes = this.experience.sizes;
    this.resources = this.experience.resources;
    this.world = this.experience.world;

    // Get DOM elements
    this.loadingScreen = document.querySelector(".loading-screen");
    this.progressBar = document.querySelector(".progress-bar");
    this.progressText = document.querySelector(".progress-text");
    this.loadingText = document.querySelector(".loading-text");

    // Check if loading screen exists
    if (!this.loadingScreen) {
      console.warn("Loading screen element not found in DOM");
      this.createLoadingScreen();
    }

    // Set initial state
    this.loaded = 0;
    this.total = this.resources.queue;
    this.isWorldReady = false;
    this.isIntroPlayed = false;

    console.log(`Preloader: Loading ${this.total} assets`);

    // Listen for resource progress
    this.setResourceListeners();

    // Listen for world ready
    this.world.on("worldready", () => {
      this.isWorldReady = true;
      this.checkIfComplete();
    });
  }

  createLoadingScreen() {
    // Create loading screen dynamically if not in HTML
    this.loadingScreen = document.createElement("div");
    this.loadingScreen.className = "loading-screen";
    this.loadingScreen.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading 3D Model...</div>
        <div class="loading-progress">
          <div class="progress-bar"></div>
          <div class="progress-text">0%</div>
        </div>
      </div>
    `;
    document.body.appendChild(this.loadingScreen);

    this.progressBar = this.loadingScreen.querySelector(".progress-bar");
    this.progressText = this.loadingScreen.querySelector(".progress-text");
    this.loadingText = this.loadingScreen.querySelector(".loading-text");
  }

  setResourceListeners() {
    // Update progress as resources load
    this.resources.on("progress", (progress) => {
      this.updateProgress(progress);
    });

    // When all resources are loaded
    this.resources.on("ready", () => {
      console.log("All resources loaded");
      this.loadingText.textContent = "Setting up scene...";
      this.updateProgress(100);
    });
  }

  updateProgress(percentage) {
    const progress = Math.min(percentage, 100);

    // Update progress bar
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
    }

    // Update text
    if (this.progressText) {
      this.progressText.textContent = `${Math.round(progress)}%`;
    }

    // Update loading text based on progress
    if (this.loadingText) {
      if (progress < 30) {
        this.loadingText.textContent = "Loading model...";
      } else if (progress < 70) {
        this.loadingText.textContent = "Loading textures...";
      } else if (progress < 100) {
        this.loadingText.textContent = "Finalizing...";
      }
    }

    console.log(`Loading: ${progress}%`);
  }

  checkIfComplete() {
    // Only proceed if world is ready
    if (this.isWorldReady && !this.isIntroPlayed) {
      this.isIntroPlayed = true;
      this.playIntro();
    }
  }

  setAssets() {
    // Get references to 3D object
    if (this.world.object3D) {
      this.object = this.world.object3D.actualObject;
      console.log("Assets set for preloader");
    } else {
      console.warn("Object3D not available yet");
      setTimeout(() => this.setAssets(), 100);
    }
  }

  firstIntro() {
    console.log("Playing intro animation...");

    // Fade out loading screen
    GSAP.to(this.loadingScreen, {
      opacity: 0,
      duration: 1,
      delay: 0.5,
      onComplete: () => {
        this.loadingScreen.classList.add("hidden");
        setTimeout(() => {
          this.loadingScreen.style.display = "none";
        }, 500);
      },
    });

    // Play your model intro animation
    if (this.object) {
      GSAP.from(this.object.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: "back.out(1.7)",
        delay: 0.2,
      });

      // Example: Fade in
      GSAP.from(this.object.position, {
        y: -5,
        duration: 1,
        ease: "power2.out",
      });
    }

    // Emit event that preloader is done
    setTimeout(() => {
      this.emit("preloadercomplete");
    }, 1000);
  }

  playIntro() {
    this.setAssets();

    // Small delay to ensure everything is ready
    setTimeout(() => {
      this.firstIntro();
    }, 300);
  }
}
