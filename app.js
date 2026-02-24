class TabTheCount extends HTMLElement {
  constructor() {
    super();
    this.isAnimating = false;
  }

  connectedCallback() {
    this.tabs = Array.from(this.querySelectorAll("[data-tab-count]"));
    this.panels = Array.from(this.querySelectorAll("[data-tab-count-content]"));

    if (!this.tabs.length || !this.panels.length) return;

    this.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-tab-count]");
      if (!tab || this.isAnimating) return;

      this.setActive(tab.dataset.tabCount);
    });

    const visiblePanel = this.panels.find(
      (p) => !p.classList.contains("hidden"),
    );
    const initial = visiblePanel?.dataset.tabCountContent || "1";
    this.setActive(initial, true);
  }

  async setActive(tabId, immediate = false) {
    const currentPanel = this.panels.find(
      (p) => !p.classList.contains("hidden"),
    );
    const nextPanel = this.panels.find(
      (p) => p.dataset.tabCountContent === String(tabId),
    );

    if (!nextPanel || currentPanel === nextPanel) return;

    this.tabs.forEach((t) => {
      const active = t.dataset.tabCount === String(tabId);
      t.classList.toggle("active", !active);
      t.classList.toggle("active-main", active);
    });

    if (immediate) {
      this.panels.forEach((p) =>
        p.classList.toggle(
          "hidden",
          p.dataset.tabCountContent !== String(tabId),
        ),
      );
      return;
    }

    this.isAnimating = true;

    // 🔹 Fade OUT current items
    if (currentPanel) {
      const items = currentPanel.querySelectorAll("li");

      items.forEach((item) => {
        item.classList.add("tab-fade-exit");
        requestAnimationFrame(() => {
          item.classList.add("tab-fade-exit-active");
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      currentPanel.classList.add("hidden");

      items.forEach((item) => {
        item.classList.remove("tab-fade-exit", "tab-fade-exit-active");
      });
    }

    // 🔹 Show next panel
    nextPanel.classList.remove("hidden");

    const nextItems = nextPanel.querySelectorAll("li");

    nextItems.forEach((item) => {
      item.classList.add("tab-fade-enter");
    });

    requestAnimationFrame(() => {
      nextItems.forEach((item) => {
        item.classList.add("tab-fade-enter-active");
      });
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    nextItems.forEach((item) => {
      item.classList.remove("tab-fade-enter", "tab-fade-enter-active");
    });

    this.isAnimating = false;
  }
}

customElements.define("tab-the-count", TabTheCount);

class MarqSlider extends HTMLElement {
  constructor() {
    super();
    this.flkty = null;
    this.animationFrame = null;
    this.isUserInteracting = false;
  }

  connectedCallback() {
    if (typeof Flickity === "undefined") return;
    // Wait for styles and children to be painted
    requestAnimationFrame(() => this.init());
  }

  disconnectedCallback() {
    this.destroy();
  }

  init() {
    if (this.children.length === 0) return;

    // Restore layout for Flickity
    this.classList.remove("flex");
    this.classList.add("block");

    const speed = parseFloat(this.getAttribute("data-speed")) || 1;

    this.flkty = new Flickity(this, {
      accessibility: true,
      resize: true,
      wrapAround: true,
      prevNextButtons: false,
      pageDots: false,
      percentPosition: false,
      setGallerySize: true,
      imagesLoaded: true,
      draggable: true,
      selectedAttraction: 0.015,
      friction: 0.25,
    });

    // Continuous Animation Loop
    const tick = () => {
      if (!this.flkty) return;

      // If user is not actively dragging, move the slider position
      if (!this.isUserInteracting && this.flkty.slides) {
        this.flkty.x -= speed;
        this.flkty.settle(this.flkty.x);
      }

      this.animationFrame = requestAnimationFrame(tick);
    };

    // Start moving immediately
    tick();

    // Track user interaction to prevent fighting the manual drag
    this.flkty.on("dragStart", () => {
      this.isUserInteracting = true;
    });

    this.flkty.on("dragEnd", () => {
      this.isUserInteracting = false;
    });

    // Ensure resize recalculates correctly
    this.flkty.on("staticClick", () => {
      this.isUserInteracting = false;
    });
  }

  destroy() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.flkty) this.flkty.destroy();
  }
}

customElements.define("marq-slider", MarqSlider);

document.addEventListener("DOMContentLoaded", function () {
  const accordions = document.querySelectorAll(".accordion_accordion__fyweJ");

  accordions.forEach((accordion) => {
    const toggle = accordion.querySelector(
      ".accordion_accordion__toggle__wv50_",
    );
    const content = accordion.querySelector(
      ".accordion_accordion__content__6qhiU",
    );
    const icon = accordion.querySelector(".accordion_accordion__icon__CA4qs");

    // Initial state
    content.style.maxHeight = "0px";
    content.style.overflow = "hidden";
    content.style.transition = "max-height 0.3s ease";

    toggle.addEventListener("click", () => {
      const isActive = accordion.classList.contains("activesss");

      // Close all
      accordions.forEach((item) => {
        item.classList.remove("activesss");
        const itemContent = item.querySelector(
          ".accordion_accordion__content__6qhiU",
        );
        // const itemIcon = item.querySelector(
        //   ".accordion_accordion__icon__CA4qs",
        // );

        itemContent.style.maxHeight = "0px";
        // itemIcon.style.transform = "rotate(0deg)";
      });

      // Open clicked if it wasn't already active
      if (!isActive) {
        accordion.classList.add("activesss");
        content.style.maxHeight = content.scrollHeight + "px";
        // icon.style.transform = "rotate(90deg)";
      }
    });
  });
});
