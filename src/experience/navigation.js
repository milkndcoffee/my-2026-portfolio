export default class Navigation {
  constructor() {
    this.navbarMain = document.querySelector(".navbar-main");
    this.navbarSecondary = document.querySelector(".navbar-secondary");
    this.navItems = document.querySelectorAll(".nav-item");
    this.primaryNavItems = document.querySelectorAll(".navbar-main .nav-item");
    this.secondaryNavItems = document.querySelectorAll(
      ".navbar-secondary .nav-item",
    );
    this.cardsContainer = document.querySelector(".navbar-cards-container");
    this.shuffleButton = document.getElementById("shuffleNav");
    this.isShuffled = false;
    this.currentSection = null;

    this.sectionOwnership = {
      main: ["home", "about", "projects", "experience", "contact"],
      secondary: ["resume", "archive"],
    };

    this.init();
    this.handleResize();
    this.updateActiveOnScroll();
  }

  // ========== INITIALIZATION ==========
  init() {
    // Set active nav item on click
    this.navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        this.scrollToSection(item.dataset.section);
      });
    });

    // Shuffle button click
    if (this.shuffleButton) {
      this.shuffleButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleShuffle();
      });
    }

    // Handle window resize
    window.addEventListener("resize", () => {
      this.handleResize();
    });

    // Handle scroll to update active item
    window.addEventListener("scroll", () => {
      this.updateActiveOnScroll();
    });

    // Close shuffle on click outside
    document.addEventListener("click", (e) => {
      if (
        this.isShuffled &&
        !this.cardsContainer.contains(e.target) &&
        e.target !== this.shuffleButton
      ) {
        this.toggleShuffle(false);
      }
    });

    // Set initial state
    this.updatePointerEvents();

    // Find initial section on page load
    setTimeout(() => this.updateActiveOnScroll(), 100);
  }

  // ========== CARD SHUFFLING ==========
  toggleShuffle(animate = true) {
    const isSecondaryFront = this.navbarSecondary.classList.contains("front");

    if (isSecondaryFront) {
      // Secondary is front, bring main to front
      this.setFrontNavbar("main");
    } else {
      // Main is front, bring secondary to front
      this.setFrontNavbar("secondary");
    }

    this.animateShuffleButton();
  }

  setFrontNavbar(navbarName) {
    // Remove front class from both
    this.navbarMain.classList.remove("front");
    this.navbarSecondary.classList.remove("front");

    // Add front class to the specified navbar
    if (navbarName === "main") {
      this.navbarMain.classList.add("front");
    } else {
      this.navbarSecondary.classList.add("front");
    }

    // Update pointer events
    this.updatePointerEvents();
  }

  // ========== UI UPDATES ==========
  updatePointerEvents() {
    const isMainFront = this.navbarMain.classList.contains("front");
    const isSecondaryFront = this.navbarSecondary.classList.contains("front");

    this.primaryNavItems.forEach((item) => {
      item.style.pointerEvents = isMainFront ? "auto" : "none";
      item.style.cursor = isMainFront ? "pointer" : "default";
    });

    this.secondaryNavItems.forEach((item) => {
      item.style.pointerEvents = isSecondaryFront ? "auto" : "none";
      item.style.cursor = isSecondaryFront ? "pointer" : "default";
    });
  }

  animateShuffleButton() {
    // Add pulsing animation to shuffle button
    this.shuffleButton.style.animation = "none";
    void this.shuffleButton.offsetWidth; // Trigger reflow
    this.shuffleButton.style.animation = "cardPulse 0.5s ease";

    setTimeout(() => {
      this.shuffleButton.style.animation = "";
    }, 500);
  }

  // ========== SECTION NAVIGATION ==========
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      console.log(`Section ${sectionId} not found`);
    }
  }

  // ========== RESPONSIVE HANDLING ==========
  handleResize() {
    if (window.innerWidth > 768) {
      // Desktop: reset any mobile states
      this.cardsContainer.classList.remove("mobile-expanded");
      this.cardsContainer.style.height = "";
      this.cardsContainer.style.minHeight = "";
      this.shuffleButton.style.display = "flex";

      // Always show text on desktop
      this.navItems.forEach((item) => {
        const text = item.querySelector(".nav-text");
        if (text) text.style.display = "block";
      });
    }
  }

  // ========== SCROLL DETECTION ==========
  updateActiveOnScroll() {
    const scrollMiddle = window.scrollY + window.innerHeight / 2;

    // Find current section
    let activeSection = null;
    for (const [navbar, sections] of Object.entries(this.sectionOwnership)) {
      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (!section) continue;

        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollMiddle >= sectionTop && scrollMiddle < sectionBottom) {
          activeSection = sectionId;
          break;
        }
      }
      if (activeSection) break;
    }

    // If section changed, update everything
    if (activeSection && activeSection !== this.currentSection) {
      this.currentSection = activeSection;
      this.syncNavbarToSection(activeSection);
    }
  }

  syncNavbarToSection(sectionId) {
    // Find which navbar owns this section
    let ownerNavbar = null;
    for (const [navbar, sections] of Object.entries(this.sectionOwnership)) {
      if (sections.includes(sectionId)) {
        ownerNavbar = navbar;
        break;
      }
    }

    if (!ownerNavbar) return;

    // Bring owner navbar to front
    this.setFrontNavbar(ownerNavbar);

    // Update active item
    this.updateActiveItem(sectionId);
  }

  updateActiveItem(sectionId) {
    // Remove all active classes from both navbars
    this.primaryNavItems.forEach((item) => item.classList.remove("active"));
    this.secondaryNavItems.forEach((item) => item.classList.remove("active"));

    // Find and activate the correct item
    this.navItems.forEach((item) => {
      if (item.dataset.section === sectionId) {
        item.classList.add("active");
      }
    });
  }
}
