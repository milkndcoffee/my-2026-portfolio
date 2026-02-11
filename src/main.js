import "./style.css";
import Navigation from "./experience/navigation.js";
import RollingBackground from "./rolling-background.js";

// Define variable
let rollingBackground;

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");

  // Initialize rolling background FIRST
  rollingBackground = new RollingBackground();
  console.log("Rolling background initialized");

  // Initialize navigation BEFORE experience
  const navigation = new Navigation();
  console.log("Navigation initialized");

  // Store for debugging
  window.navigation = navigation;

  // THEN load experience
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

// Handle page visibility change
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    console.log("Page is visible again");
  } else {
    console.log("Page is hidden");
  }
});

// Export for debugging
window.Navigation = Navigation;
window.RollingBackground = RollingBackground;
