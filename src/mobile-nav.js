class MobileNavigation {
  constructor() {
    this.mobileToggle = document.getElementById("mobileNavToggle");
    this.navbarContainer = document.getElementById("navbarCardsContainer");
    this.overlay = document.getElementById("navbarOverlay");
    this.shuffleButton = document.querySelector(".shuffle-button");

    this.init();
  }

  // ========== INITIALIZATION ==========
  init() {
    if (!this.mobileToggle || !this.navbarContainer) return;
    this.bindEvents();
  }

  bindEvents() {
    // Toggle expanded state
    this.mobileToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleMobileNav();
    });

    // Close when clicking on overlay
    if (this.overlay) {
      this.overlay.addEventListener("click", () => this.closeMobileNav());
    }

    // Close when selecting a nav item (on mobile)
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        if (window.innerWidth <= 480) {
          this.closeMobileNav();
        }
      });
    });

    // Handle resize - reset on desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 480) {
        this.closeMobileNav();
        document.body.style.overflow = "";
      }
    });
  }

  // ========== NAVIGATION CONTROLS ==========
  toggleMobileNav() {
    this.navbarContainer.classList.toggle("mobile-expanded");
    this.mobileToggle.classList.toggle("active");

    if (this.overlay) {
      this.overlay.classList.toggle("active");
    }

    // Prevent body scroll when expanded
    if (this.navbarContainer.classList.contains("mobile-expanded")) {
      document.body.style.overflow = "hidden";
      this.shuffleButton.style.display = "flex"; // Show shuffle button when nav is expanded
    } else {
      document.body.style.overflow = "";
      this.shuffleButton.style.display = "none";

      // Check which nav card should be in front based on active item
      this.ensureActiveCardIsFront();
    }
  }

  closeMobileNav() {
    this.navbarContainer.classList.remove("mobile-expanded");
    this.mobileToggle.classList.remove("active");
    this.shuffleButton.style.display = "none";

    if (this.overlay) {
      this.overlay.classList.remove("active");
    }

    document.body.style.overflow = "";

    // Check which nav card should be in front based on active item
    this.ensureActiveCardIsFront();
  }

  // ========== CARD MANAGEMENT ==========
  ensureActiveCardIsFront() {
    // Find the active nav item
    const activeItem = document.querySelector(".nav-item.active");
    if (!activeItem) return;

    // Get the navbar cards
    const mainCard = document.querySelector(".navbar-main");
    const secondaryCard = document.querySelector(".navbar-secondary");

    // Check if active item is in secondary nav
    const isInSecondary = activeItem.closest(".navbar-secondary") !== null;

    // Remove front class from both cards
    mainCard.classList.remove("front");
    secondaryCard.classList.remove("front");

    if (isInSecondary) {
      // If active item is in secondary, bring secondary to front
      secondaryCard.classList.add("front");

      // Also trigger shuffle if needed (add shuffled class to container)
      if (!this.navbarContainer.classList.contains("shuffled")) {
        this.navbarContainer.classList.add("shuffled");
      }
    } else {
      // If active item is in main, bring main to front
      mainCard.classList.add("front");

      // Remove shuffled class if active item is in main
      if (this.navbarContainer.classList.contains("shuffled")) {
        this.navbarContainer.classList.remove("shuffled");
      }
    }
  }
}

export default MobileNavigation;