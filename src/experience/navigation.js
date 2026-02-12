// src/experience/navigation.js
export default class Navigation {
  constructor() {
    this.navItems = document.querySelectorAll(".nav-item");
    this.primaryNavItems = document.querySelectorAll(".navbar-main .nav-item");
    this.secondaryNavItems = document.querySelectorAll(
      ".navbar-secondary .nav-item",
    );
    this.navToggle = document.querySelector(".nav-toggle");
    this.cardsContainer = document.querySelector(".navbar-cards-container");
    this.shuffleButton = document.getElementById("shuffleNav");
    this.isShuffled = false;

    this.init();
    this.handleResize();
    this.updateActiveOnScroll();
  }

  init() {
    // Set active nav item on click
    this.navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        // Only process clicks if the navbar card is active (in front)
        const parentCard = item.closest(".navbar-main, .navbar-secondary");
        const isCardActive = parentCard.classList.contains("navbar-main")
          ? !this.isShuffled
          : this.isShuffled;

        if (isCardActive) {
          this.setActiveItem(item);
          this.scrollToSection(item.dataset.section);
        }
      });
    });

    // Shuffle button click
    if (this.shuffleButton) {
      this.shuffleButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleShuffle();
      });
    }

    // Mobile toggle
    if (this.navToggle) {
      this.navToggle.addEventListener("click", () => {
        this.toggleMobileMenu();
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

    // Close shuffle on click outside (optional)
    document.addEventListener("click", (e) => {
      if (
        this.isShuffled &&
        !this.cardsContainer.contains(e.target) &&
        e.target !== this.shuffleButton
      ) {
        this.toggleShuffle(false);
      }
    });

    // Set initial pointer events
    this.updatePointerEvents();
  }

  toggleShuffle(animate = true) {
    this.isShuffled = !this.isShuffled;

    if (animate) {
      if (this.isShuffled) {
        this.cardsContainer.classList.add("shuffled");
        console.log("Secondary navbar card activated");
      } else {
        this.cardsContainer.classList.remove("shuffled");
        console.log("Main navbar card activated");
      }
    } else {
      // For instant toggle without animation
      this.cardsContainer.style.transition = "none";
      if (this.isShuffled) {
        this.cardsContainer.classList.add("shuffled");
      } else {
        this.cardsContainer.classList.remove("shuffled");
      }
      setTimeout(() => {
        this.cardsContainer.style.transition = "";
      }, 50);
    }

    // Update pointer events for interactivity
    this.updatePointerEvents();

    // Animate shuffle button
    this.animateShuffleButton();
  }

  updatePointerEvents() {
    if (this.isShuffled) {
      // Secondary nav items are interactive
      this.secondaryNavItems.forEach((item) => {
        item.style.pointerEvents = "auto";
        item.style.cursor = "pointer";
      });
      // Primary nav items are not interactive
      this.primaryNavItems.forEach((item) => {
        item.style.pointerEvents = "none";
        item.style.cursor = "default";
      });
    } else {
      // Primary nav items are interactive
      this.primaryNavItems.forEach((item) => {
        item.style.pointerEvents = "auto";
        item.style.cursor = "pointer";
      });
      // Secondary nav items are not interactive
      this.secondaryNavItems.forEach((item) => {
        item.style.pointerEvents = "none";
        item.style.cursor = "default";
      });
    }
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

  setActiveItem(activeItem) {
    // Remove active class from all items in the same card
    const parentCard = activeItem.closest(".navbar-main, .navbar-secondary");
    const itemsInSameCard = parentCard.querySelectorAll(".nav-item");

    itemsInSameCard.forEach((item) => {
      item.classList.remove("active");
    });

    // Add active class to clicked item
    activeItem.classList.add("active");
  }

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

  toggleMobileMenu() {
    this.navToggle.classList.toggle("active");
    this.cardsContainer.classList.toggle("mobile-expanded");

    if (this.cardsContainer.classList.contains("mobile-expanded")) {
      // Expand cards for mobile
      this.cardsContainer.style.height = "auto";
      this.cardsContainer.style.minHeight = "200px";
      // Hide shuffle button when expanded
      this.shuffleButton.style.display = "none";
    } else {
      // Collapse cards
      this.cardsContainer.style.height = "";
      this.cardsContainer.style.minHeight = "";
      // Show shuffle button
      this.shuffleButton.style.display = "flex";
    }
  }

  handleResize() {
    if (window.innerWidth > 768) {
      // Desktop: reset mobile states
      this.navToggle.classList.remove("active");
      this.cardsContainer.classList.remove("mobile-expanded");
      this.cardsContainer.style.height = "";
      this.cardsContainer.style.minHeight = "";
      this.shuffleButton.style.display = "flex";

      // Always show text on desktop
      this.navItems.forEach((item) => {
        const text = item.querySelector(".nav-text");
        if (text) text.style.display = "block";
      });
    } else {
      // Mobile: handle text display
      const isExpanded =
        this.cardsContainer.classList.contains("mobile-expanded");
      this.navItems.forEach((item) => {
        const text = item.querySelector(".nav-text");
        if (text && !isExpanded && !item.classList.contains("main-home")) {
          text.style.display = "none";
        } else if (text) {
          text.style.display = "block";
        }
      });
    }
  }

  updateActiveOnScroll() {
    const sections = [
      "home",
      "about",
      "projects",
      "experience",
      "contact",
      "resume",
      "archive",
    ];
    const scrollMiddle = window.scrollY + window.innerHeight / 2;

    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollMiddle >= sectionTop && scrollMiddle < sectionBottom) {
        // Find corresponding nav item and activate it
        this.navItems.forEach((item) => {
          if (item.dataset.section === sectionId) {
            this.setActiveItem(item);
          }
        });
      }
    });
  }
}
