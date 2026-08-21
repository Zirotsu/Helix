/* ============================================================
   HELIX · scripts.js
   - Scroll reveal animations
   - Smooth scroll de nav
   - Tilt 3D en mockup
   - Toggle de menú hamburguesa en mobile/tablet
   ============================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------
     1. SCROLL REVEAL
     ------------------------------------------------------------ */
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ------------------------------------------------------------
     2. NAV — Toggle hamburguesa + smooth scroll
     ------------------------------------------------------------ */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    /* Cerrar al hacer click fuera */
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Smooth scroll en links del nav */
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      /* Cerrar menú mobile después de click */
      if (navLinks && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ------------------------------------------------------------
     3. TILT 3D EN MOCKUP (solo dispositivos con hover real)
     ------------------------------------------------------------ */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mockups = document.querySelectorAll('.case-mockup');

  if (mockups.length && canHover) {
    mockups.forEach((mockup) => {
      const frame = mockup.querySelector('.case-mockup-frame');
      if (!frame) return;
      mockup.addEventListener('mousemove', (e) => {
        const rect = mockup.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 10;
        const rotateX = (0.5 - y) * 10;
        frame.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      mockup.addEventListener('mouseleave', () => {
        frame.style.transform = 'rotateX(0deg) rotateY(0deg)';
      });
    });
  }
})();

/* ============================================================
   GALERÍA DE CASOS + LIGHTBOX  (agregado)
   ============================================================ */
(function () {
  'use strict';

  const galleries = Array.from(document.querySelectorAll('.case-gallery'));
  if (!galleries.length) return;

  // Construye el modelo de datos por galería desde los thumbs
  const data = galleries.map(g => {
    const thumbs = Array.from(g.querySelectorAll('.gallery-thumb'));
    return {
      el: g,
      mainImg: g.querySelector('.gallery-main-img'),
      mainCaption: g.querySelector('.gallery-caption'),
      thumbs,
      items: thumbs.map(t => ({
        full: t.dataset.full,
        caption: t.dataset.caption || ''
      })),
      index: 0
    };
  });

  function setMain(gi, idx) {
    const g = data[gi];
    g.index = idx;
    const item = g.items[idx];
    if (g.mainImg) g.mainImg.src = item.full;
    if (g.mainCaption) g.mainCaption.textContent = item.caption;
    g.thumbs.forEach((t, i) => t.classList.toggle('is-active', i === idx));
  }

  data.forEach((g, gi) => {
    g.thumbs.forEach((t, i) => {
      t.addEventListener('click', () => setMain(gi, i));
    });
    const main = g.el.querySelector('.gallery-main');
    if (main) main.addEventListener('click', () => openLightbox(gi, g.index));
  });

  /* ---- Lightbox compartido ---- */
  let lb, lbImg, lbCounter, lbCaption, current = { gi: 0, idx: 0 };

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML =
      '<div class="lightbox-stage">' +
        '<button class="lb-btn lightbox-close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>' +
        '<img class="lightbox-img" alt="">' +
        '<div class="lightbox-bar">' +
          '<div class="lightbox-meta"><span class="lb-caption"></span> · <span class="lightbox-counter"></span></div>' +
          '<div class="lightbox-nav">' +
            '<button class="lb-btn lb-prev" aria-label="Anterior"><i class="fa-solid fa-arrow-left"></i></button>' +
            '<button class="lb-btn lb-next" aria-label="Siguiente"><i class="fa-solid fa-arrow-right"></i></button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('.lightbox-img');
    lbCounter = lb.querySelector('.lightbox-counter');
    lbCaption = lb.querySelector('.lb-caption');

    lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lb.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); step(-1); });
    lb.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); step(1); });
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  }

  function renderLightbox() {
    const g = data[current.gi];
    const item = g.items[current.idx];
    lbImg.src = item.full;
    lbCaption.textContent = item.caption;
    lbCounter.textContent = (current.idx + 1) + ' / ' + g.items.length;
  }

  function openLightbox(gi, idx) {
    if (!lb) buildLightbox();
    current = { gi, idx };
    renderLightbox();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }
  function step(dir) {
    const g = data[current.gi];
    current.idx = (current.idx + dir + g.items.length) % g.items.length;
    setMain(current.gi, current.idx); // mantener galería sincronizada
    renderLightbox();
  }

  document.addEventListener('keydown', e => {
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });
})();
