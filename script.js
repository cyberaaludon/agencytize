(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Mobile navigation
  const toggle = $("#menuToggle");
  const nav = $("#mainNav");
  const closeMenu = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("menu-open");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
  });
  $$("a", nav).forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });

  // Scroll progress
  const progressBar = $("#progressBar");
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // Reveal sections when they enter the viewport
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      observer.observe(item);
    });
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Subtle cursor glow on larger screens
  const glow = $("#cursorGlow");
  if (glow && window.matchMedia("(pointer:fine)").matches) {
    window.addEventListener("pointermove", event => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
      glow.style.opacity = ".85";
    }, { passive: true });
    document.addEventListener("pointerleave", () => { glow.style.opacity = "0"; });
  }

  // Tiny, restrained parallax tilt for the camera object
  const camera = $("#cameraObject");
  const heroArt = $(".hero-art");
  if (camera && heroArt && window.matchMedia("(pointer:fine) and (prefers-reduced-motion: no-preference)").matches) {
    heroArt.addEventListener("pointermove", event => {
      const rect = heroArt.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      camera.style.animationPlayState = "paused";
      camera.style.transform = `translateY(-5px) rotateX(${y * -7}deg) rotateY(${x * 10}deg)`;
    });
    heroArt.addEventListener("pointerleave", () => {
      camera.style.animationPlayState = "running";
      camera.style.transform = "";
    });
  }

  $("#year").textContent = new Date().getFullYear();
})();
