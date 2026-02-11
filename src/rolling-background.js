// src/rolling-background.js - WITH PERSPECTIVE EFFECT (LIGHT THEME ONLY)
import Sizes from "./experience/utils/sizes";

class RollingBackground {
  constructor(config = {}) {
    this.sizes = new Sizes();
    console.log('WIDTH:', this.sizes.width);

    // Default configuration - LIGHT THEME ONLY
    this.config = {
      // SVG settings
      svgScale: this.sizes.width < 1500 ? .2 : 0.3,
      svgOpacity: 0.4,

      // Spacing settings
      padding: 15,

      perspective: 800,
      skewX: 0,
      skewY: 0,
      scaleX: 1.05,
      scaleY: 1.0,
      rotateX: -5,
      rotateY: 0,

      animationSpeed: 35,
      distortion: "none",

      perspectiveOrigin: "center center",
      
      // REMOVED: theme property
    };

    this.init();
  }

  init() {
    this.createBackground();
    this.createPerspectiveWrapper();
    this.applyStyles();
    this.addToDOM();
    this.startAnimation();
    // REMOVED: autoDetectTheme() call
  }

  createBackground() {
    this.background = document.createElement("div");
    this.background.className = "rolling-background";
  }

  createPerspectiveWrapper() {
    this.perspectiveWrapper = document.createElement("div");
    this.perspectiveWrapper.className = "rolling-background-perspective";
    this.perspectiveWrapper.appendChild(this.background);
  }

  calculateTileSize() {
    const baseSize = 453;
    const svgSize = baseSize * this.config.svgScale;
    const totalSize = svgSize + this.config.padding * 2;

    return {
      svg: svgSize,
      total: totalSize,
      base: baseSize,
      padding: this.config.padding,
    };
  }

  generateSVGPattern() { // REMOVED: theme parameter
    const tileSize = this.calculateTileSize();
    const padding = this.config.padding;
    const translateX = padding;
    const translateY = padding;

    // LIGHT THEME ONLY
    const lightSVG = `
      <svg width="${tileSize.total}" height="${tileSize.total}" viewBox="0 0 ${tileSize.total} ${tileSize.total}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(${translateX}, ${translateY}) scale(${this.config.svgScale})">
          <path d="M5 134C5 62.7553 62.7553 5 134 5H319C390.245 5 448 62.7553 448 134V319C448 390.245 390.245 448 319 448H134C62.7553 448 5 390.245 5 319V134Z" fill="#6C6C6C" fill-opacity="${0.12 * this.config.svgOpacity}"/>
          <path d="M26 142C26 77.935 77.935 26 142 26H312C376.065 26 428 77.935 428 142V312C428 376.065 376.065 428 312 428H142C77.935 428 26 376.065 26 312V142Z" fill="url(#paint0_radial_light)" fill-opacity="${0.86 * this.config.svgOpacity}"/>
          <path d="M5 134C5 62.7553 62.7553 5 134 5H319C390.245 5 448 62.7553 448 134V319C448 390.245 390.245 448 319 448H134C62.7553 448 5 390.245 5 319V134Z" stroke="black" stroke-opacity="${0.04 * this.config.svgOpacity}" stroke-width="10"/>
          <path d="M26 142C26 77.935 77.935 26 142 26H312C376.065 26 428 77.935 428 142V312C428 376.065 376.065 428 312 428H142C77.935 428 26 376.065 26 312V142Z" stroke="black" stroke-opacity="${0.04 * this.config.svgOpacity}" stroke-width="10"/>
        </g>
        <defs>
          <radialGradient id="paint0_radial_light" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(227 227) rotate(90) scale(201)">
            <stop stop-color="#BEBEBE" stop-opacity="${0 * this.config.svgOpacity}"/>
            <stop offset="0.870192" stop-color="#E3E3E3" stop-opacity="${1.0 * this.config.svgOpacity}"/>
          </radialGradient>
        </defs>
      </svg>
    `;

    return `url("data:image/svg+xml,${encodeURIComponent(lightSVG)}")`;
  }

  getDistortionPath(type = "default") {
    const paths = {
      default: "polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)",
      subtle: "polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)",
      strong: "polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)",
      wave: "polygon(0% 15%, 10% 0%, 90% 0%, 100% 15%, 100% 85%, 90% 100%, 10% 100%, 0% 85%)",
      none: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      tunnel: "polygon(20% 20%, 80% 20%, 90% 30%, 90% 70%, 80% 80%, 20% 80%, 10% 70%, 10% 30%)",
      fisheye: "polygon(30% 30%, 70% 30%, 85% 45%, 85% 55%, 70% 70%, 30% 70%, 15% 55%, 15% 45%)",
    };

    return paths[type] || paths.default;
  }

  applyStyles() {
    const style = document.createElement("style");

    const tileSize = this.calculateTileSize();
    const lightPattern = this.generateSVGPattern(); // REMOVED: dark pattern
    const distortionPath = this.getDistortionPath(this.config.distortion);
    const animationDistance = tileSize.total;

    const transform = `
      perspective(${this.config.perspective}px)
      rotateX(${this.config.rotateX}deg)
      rotateY(${this.config.rotateY}deg)
      scaleX(${this.config.scaleX})
      scaleY(${this.config.scaleY})
      skew(${this.config.skewX}deg, ${this.config.skewY}deg)
    `.replace(/\s+/g, " ").trim();

    style.textContent = `
      /* PERSPECTIVE WRAPPER */
      .rolling-background-perspective {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -9999;
        perspective: ${this.config.perspective}px;
        perspective-origin: ${this.config.perspectiveOrigin};
        overflow: hidden;
        pointer-events: none;
      }
      
      /* ROLLING BACKGROUND WITH PERSPECTIVE */
      .rolling-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: ${transform};
        transform-style: preserve-3d;
        
        /* Generated SVG with proper spacing */
        background-image: ${lightPattern};
        background-size: ${tileSize.total}px ${tileSize.total}px;
        background-position: 0 0;
        
        /* Distorted corners */
        clip-path: ${distortionPath};
        
        /* Optional: Add depth with box-shadow */
        box-shadow: 
          0 0 100px rgba(0, 0, 0, 0.1) inset,
          0 0 50px rgba(255, 255, 255, 0.05);
        
        /* Create vignette effect for tunnel vision */
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse at center,
            transparent 30%,
            rgba(0, 0, 0, 0.1) 70%,
            rgba(0, 0, 0, 0.3) 100%
          );
          pointer-events: none;
          z-index: 1;
          mix-blend-mode: multiply;
        }
      }
      
      /* Animation */
      @keyframes rollVector {
        0% { 
          background-position: 0 0;
          transform: ${transform} translateZ(0);
        }
        50% {
          transform: ${transform} translateZ(10px);
        }
        100% { 
          background-position: ${animationDistance}px ${animationDistance}px;
          transform: ${transform} translateZ(0);
        }
      }
      
      /* Configurable animation speed */
      .rolling-animation {
        animation: rollVector ${this.config.animationSpeed}s linear infinite;
      }
      
      /* Optional: Add subtle parallax effect */
      @media (prefers-reduced-motion: no-preference) {
        .rolling-background {
          will-change: transform, background-position;
        }
      }
      
      /* Optional: Pause animation when user prefers reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .rolling-animation {
          animation: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  addToDOM() {
    document.body.insertBefore(
      this.perspectiveWrapper,
      document.body.firstChild,
    );
  }

  startAnimation() {
    this.background.classList.add("rolling-animation");
  }

  // REMOVED: autoDetectTheme() method
  // REMOVED: updateTheme() method

  // Update perspective (field of view)
  updatePerspective(value) {
    this.config.perspective = value;
    this.perspectiveWrapper.style.perspective = `${value}px`;
  }

  // Update skew (tunnel vision effect)
  updateSkew(x, y) {
    this.config.skewX = x;
    this.config.skewY = y;
    this.updateTransform();
  }

  // Update scale (asymmetric stretching)
  updateScale(x, y) {
    this.config.scaleX = x;
    this.config.scaleY = y;
    this.updateTransform();
  }

  // Update rotation (3D tilt)
  updateRotation(x, y) {
    this.config.rotateX = x;
    this.config.rotateY = y;
    this.updateTransform();
  }

  // Update perspective origin
  updatePerspectiveOrigin(x, y) {
    this.config.perspectiveOrigin = `${x} ${y}`;
    this.perspectiveWrapper.style.perspectiveOrigin = `${x} ${y}`;
  }

  // Update the complete transform
  updateTransform() {
    const transform = `
      perspective(${this.config.perspective}px)
      rotateX(${this.config.rotateX}deg)
      rotateY(${this.config.rotateY}deg)
      scaleX(${this.config.scaleX})
      scaleY(${this.config.scaleY})
      skew(${this.config.skewX}deg, ${this.config.skewY}deg)
    `.replace(/\s+/g, " ").trim();

    this.background.style.transform = transform;
  }

  // Preset perspective effects
  applyPreset(presetName) {
    const presets = {
      tunnelVision: {
        perspective: 500,
        skewX: 5,
        skewY: 2,
        scaleX: 1.1,
        scaleY: 1.05,
        rotateX: 5,
        rotateY: -2,
        perspectiveOrigin: "center 30%",
        distortion: "tunnel",
      },
      fisheye: {
        perspective: 300,
        skewX: 10,
        skewY: 8,
        scaleX: 0.9,
        scaleY: 0.85,
        rotateX: 0,
        rotateY: 0,
        perspectiveOrigin: "center center",
        distortion: "fisheye",
      },
      subtleDepth: {
        perspective: 1500,
        skewX: 1,
        skewY: 0.5,
        scaleX: 1.02,
        scaleY: 1.01,
        rotateX: 2,
        rotateY: -1,
        perspectiveOrigin: "center center",
        distortion: "subtle",
      },
      dramatic: {
        perspective: 200,
        skewX: 15,
        skewY: 8,
        scaleX: 1.2,
        scaleY: 1.1,
        rotateX: 10,
        rotateY: -5,
        perspectiveOrigin: "center 40%",
        distortion: "strong",
      },
    };

    const preset = presets[presetName];
    if (preset) {
      Object.assign(this.config, preset);
      this.updateTransform();
      this.updatePerspectiveOrigin(...this.config.perspectiveOrigin.split(" "));
      this.setDistortion(this.config.distortion);
    }
  }

  updateSVGScale(scale) {
    this.config.svgScale = scale;
    this.updatePattern();
  }

  updateSVGOpacity(opacity) {
    this.config.svgOpacity = Math.max(0.0, Math.min(1.0, opacity));
    this.updatePattern();
  }

  updatePadding(padding) {
    this.config.padding = padding;
    this.updatePattern();
  }

  updatePattern() {
    const tileSize = this.calculateTileSize();
    const pattern = this.generateSVGPattern(); // REMOVED: theme parameter

    this.background.style.backgroundImage = pattern;
    this.background.style.backgroundSize = `${tileSize.total}px ${tileSize.total}px`;
    this.updateAnimationDistance(tileSize.total);
  }

  updateAnimationDistance(distance) {
    const styleSheet = Array.from(document.styleSheets).find(
      (s) => s.ownerNode && s.ownerNode.textContent.includes("rollVector"),
    );

    if (styleSheet) {
      try {
        const transform = this.background.style.transform;
        const newKeyframes = `
          @keyframes rollVector {
            0% { 
              background-position: 0 0;
              transform: ${transform} translateZ(0);
            }
            50% {
              transform: ${transform} translateZ(10px);
            }
            100% { 
              background-position: ${distance}px ${distance}px;
              transform: ${transform} translateZ(0);
            }
          }
        `;

        const rules = Array.from(styleSheet.cssRules || styleSheet.rules);
        const keyframeRule = rules.find((r) => r.name === "rollVector");

        if (keyframeRule) {
          styleSheet.deleteRule(rules.indexOf(keyframeRule));
          styleSheet.insertRule(newKeyframes, rules.length - 1);
        }
      } catch (e) {
        console.warn("Could not update animation keyframes:", e);
      }
    }
  }

  setAnimationSpeed(speed) {
    this.config.animationSpeed = speed;
    this.background.style.animationDuration = `${speed}s`;
  }

  setDistortion(type) {
    this.config.distortion = type;
    const path = this.getDistortionPath(type);
    this.background.style.clipPath = path;
  }

  toggleAnimation() {
    this.background.classList.toggle("rolling-animation");
  }

  getConfig() {
    return {
      ...this.config,
      tileSize: this.calculateTileSize(),
    };
  }
}

export default RollingBackground;