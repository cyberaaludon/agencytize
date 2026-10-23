(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // Branded intro; the site remains usable if a browser is slow.
  const loader = $("#loader");
  window.addEventListener("load", () => setTimeout(() => loader?.classList.add("done"), 550));
  setTimeout(() => loader?.classList.add("done"), 2200);

  // Mobile navigation with escape-key and link-close support.
  const menuButton = $("#menuButton");
  const nav = $("#nav");
  const closeMenu = () => {
    nav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
  };
  menuButton?.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
  });
  $$("a", nav || document).forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

  // Scroll progress.
  const progress = $("#scrollProgress");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
  };
  addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // Reveal-on-scroll, with a graceful fallback.
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12, rootMargin: "0px 0px -25px 0px" });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 65}ms`;
      observer.observe(el);
    });
  } else reveals.forEach(el => el.classList.add("visible"));

  $("#year").textContent = new Date().getFullYear();

  // Three.js hero sculpture: chrome torus-knot + floating glass sphere + orbiting rings.
  // Uses CDN import dynamically; if WebGL/Three.js is unavailable, CSS artwork remains as fallback.
  const canvas = $("#hero3d");
  const visual = $("#heroVisual");
  if (!canvas || !visual) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smallScreen = matchMedia("(max-width: 700px)").matches;

  const startThree = async () => {
    try {
      const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js");
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, smallScreen ? 1.5 : 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0, 0, 8.4);

      scene.add(new THREE.AmbientLight(0xc9d6ad, 1.25));
      const key = new THREE.PointLight(0xeaffb0, 170, 30); key.position.set(3, 3, 5); scene.add(key);
      const rim = new THREE.PointLight(0x86a5ff, 110, 25); rim.position.set(-4, -1, 3); scene.add(rim);
      const warm = new THREE.PointLight(0xff714d, 90, 20); warm.position.set(1, -3, -2); scene.add(warm);

      const group = new THREE.Group(); scene.add(group);
      const chrome = new THREE.MeshPhysicalMaterial({ color: 0xd9dfcf, metalness: 0.92, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 });
      const limeMetal = new THREE.MeshPhysicalMaterial({ color: 0xcaff45, metalness: 0.55, roughness: 0.22, clearcoat: 0.8 });
      const glass = new THREE.MeshPhysicalMaterial({ color: 0x9ebd63, metalness: 0.2, roughness: 0.1, transmission: 0.35, thickness: 0.8, clearcoat: 1 });

      const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.08, 0.31, 180, 24, 2, 5), chrome);
      knot.rotation.set(0.3, 0.2, -0.25); group.add(knot);
      const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.48, 3), glass);
      orb.position.set(1.32, 0.72, 0.4); group.add(orb);
      const smallOrb = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 32), limeMetal);
      smallOrb.position.set(-1.3, -0.65, 0.4); group.add(smallOrb);

      const ringMat = new THREE.MeshBasicMaterial({ color: 0xcaff45, transparent: true, opacity: 0.72 });
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.008, 8, 160), ringMat);
      ring1.rotation.set(1.18, 0.3, -0.25); group.add(ring1);
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.005, 8, 160), new THREE.MeshBasicMaterial({ color: 0xe7e9de, transparent: true, opacity: 0.32 }));
      ring2.rotation.set(0.1, 1.05, 0.4); group.add(ring2);

      const dustGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(150 * 3);
      for (let i = 0; i < 150; i++) {
        positions[i*3] = (Math.random() - .5) * 7;
        positions[i*3+1] = (Math.random() - .5) * 6;
        positions[i*3+2] = (Math.random() - .5) * 3 - 1;
      }
      dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xd6ff55, size: 0.018, transparent: true, opacity: .7 }));
      scene.add(dust);

      let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
      visual.addEventListener("pointermove", e => {
        const rect = visual.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / rect.width - .5) * .65;
        targetY = ((e.clientY - rect.top) / rect.height - .5) * .45;
      }, { passive: true });
      visual.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; });

      const resize = () => {
        const w = visual.clientWidth, h = visual.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.position.z = smallScreen ? 8.8 : 8.0;
        camera.updateProjectionMatrix();
        group.scale.setScalar(smallScreen ? 0.82 : 1);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(visual); resize();

      const clock = new THREE.Clock();
      renderer.setAnimationLoop(() => {
        const t = clock.getElapsedTime();
        pointerX += (targetX - pointerX) * 0.035;
        pointerY += (targetY - pointerY) * 0.035;
        group.rotation.y = (reducedMotion ? 0 : t * 0.13) + pointerX;
        group.rotation.x = (reducedMotion ? 0 : Math.sin(t * 0.55) * 0.12) + pointerY;
        group.position.y = reducedMotion ? 0 : Math.sin(t * 0.8) * 0.12;
        knot.rotation.z = (reducedMotion ? -0.25 : -0.25 + Math.sin(t * 0.27) * 0.14);
        orb.position.y = 0.72 + (reducedMotion ? 0 : Math.sin(t * 1.2) * 0.12);
        smallOrb.position.x = -1.3 + (reducedMotion ? 0 : Math.sin(t * 0.7) * 0.09);
        ring1.rotation.z += reducedMotion ? 0 : 0.0016;
        ring2.rotation.x += reducedMotion ? 0 : 0.0011;
        dust.rotation.y = reducedMotion ? 0 : t * 0.012;
        renderer.render(scene, camera);
      });
    } catch (error) {
      // CSS grid, orbit rings and stickers remain visible; no broken page if WebGL/CDN is unavailable.
      canvas.style.display = "none";
      console.warn("3D scene unavailable; showing CSS fallback.", error);
    }
  };
  startThree();
})();
