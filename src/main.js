import "./style.css";
import Navigation from "./experience/navigation.js";
import RollingBackground from "./rolling-background.js";
import MobileNavigation from "./mobile-nav.js";

// ========== GLOBAL INSTANCES ==========
let rollingBackground;
let mobileNav;

// ========== DOM READY INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");

  // Initialize rolling background FIRST (background layer)
  rollingBackground = new RollingBackground();
  console.log("Rolling background initialized");

  // Initialize navigation BEFORE experience (UI layer)
  const navigation = new Navigation();
  console.log("Navigation initialized");

  // Initialize mobile navigation (mobile UI layer)
  mobileNav = new MobileNavigation();
  console.log("Mobile navigation initialized");

  // Store instances for debugging
  window.navigation = navigation;
  window.mobileNav = mobileNav;

  // Dynamically load Three.js experience (3D layer)
  import("./experience/experience.js").then(({ default: Experience }) => {
    console.log("Experience dynamically imported");
    const canvas = document.querySelector(".experience-canvas");
    console.log("Canvas:", canvas);
    const experience = new Experience(canvas);
    console.log("Experience instance created:", experience);

    // Store experience for debugging
    window.experience = experience;
  });
});

// ========== PAGE VISIBILITY HANDLING ==========
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    console.log("Page is visible again");
  } else {
    console.log("Page is hidden");
  }
});

// ========== DEBUGGING EXPORTS ==========
// window.Navigation = Navigation;
// window.RollingBackground = RollingBackground;
// window.MobileNavigation = MobileNavigation;
