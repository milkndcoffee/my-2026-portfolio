import Sizes from "./experience/utils/sizes.js";

class RollingBackground {
  constructor(config = {}) {
    this.sizes = new Sizes();

    // Default configuration
    this.config = {
      svgScale: this.sizes.width < 1500 ? 0.2 : 0.3,
      svgOpacity: 0.4,
      padding: 15,
    };

    this.init();
  }

  // ========== INITIALIZATION ==========
  init() {
    this.createBackground();
    this.createPerspectiveWrapper();
    this.applyDynamicStyles();
    this.addToDOM();
    this.startAnimation();
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

  // ========== SVG GENERATION ==========
  calculateTileSize() {
    const baseSize = 453;
    const svgSize = baseSize * this.config.svgScale;
    const totalSize = svgSize + this.config.padding * 2;
    return { total: totalSize };
  }

  generateSVGPattern() {
    const tileSize = this.calculateTileSize();
    const padding = this.config.padding;
    const translateX = padding;
    const translateY = padding;

    const svg = `
      <svg width="${tileSize.total}" height="${tileSize.total}" viewBox="0 0 ${tileSize.total} ${tileSize.total}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(${translateX}, ${translateY}) scale(${this.config.svgScale})">
          <path d="M5 134C5 62.7553 62.7553 5 134 5H319C390.245 5 448 62.7553 448 134V319C448 390.245 390.245 448 319 448H134C62.7553 448 5 390.245 5 319V134Z" fill="#6C6C6C" fill-opacity="${0.12 * this.config.svgOpacity}"/>
          <path d="M26 142C26 77.935 77.935 26 142 26H312C376.065 26 428 77.935 428 142V312C428 376.065 376.065 428 312 428H142C77.935 428 26 376.065 26 312V142Z" fill="url(#grad)" fill-opacity="${0.86 * this.config.svgOpacity}"/>
          <path d="M5 134C5 62.7553 62.7553 5 134 5H319C390.245 5 448 62.7553 448 134V319C448 390.245 390.245 448 319 448H134C62.7553 448 5 390.245 5 319V134Z" stroke="black" stroke-opacity="${0.04 * this.config.svgOpacity}" stroke-width="10"/>
          <path d="M26 142C26 77.935 77.935 26 142 26H312C376.065 26 428 77.935 428 142V312C428 376.065 376.065 428 312 428H142C77.935 428 26 376.065 26 312V142Z" stroke="black" stroke-opacity="${0.04 * this.config.svgOpacity}" stroke-width="10"/>
        </g>
        <defs>
          <radialGradient id="grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(227 227) rotate(90) scale(201)">
            <stop stop-color="#BEBEBE" stop-opacity="0"/>
            <stop offset="0.870192" stop-color="#E3E3E3" stop-opacity="${this.config.svgOpacity}"/>
          </radialGradient>
        </defs>
      </svg>
    `;

    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }

  // ========== STYLE APPLICATION ==========
  applyDynamicStyles() {
    const tileSize = this.calculateTileSize();
    const pattern = this.generateSVGPattern();

    // Only set the dynamic properties
    this.background.style.backgroundImage = pattern;
    this.background.style.backgroundSize = `${tileSize.total}px ${tileSize.total}px`;
  }

  // ========== DOM MANIPULATION ==========
  addToDOM() {
    document.body.insertBefore(
      this.perspectiveWrapper,
      document.body.firstChild,
    );
  }

  startAnimation() {
    this.background.classList.add("rolling-animation");
  }

  // ========== CONFIGURATION UPDATES ==========
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
    const pattern = this.generateSVGPattern();
    this.background.style.backgroundImage = pattern;
    this.background.style.backgroundSize = `${tileSize.total}px ${tileSize.total}px`;
  }
}

export default RollingBackground;
