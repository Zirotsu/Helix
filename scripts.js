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
  const mockup = document.querySelector('.case-mockup');

  if (mockup && canHover) {
    const frame = mockup.querySelector('.case-mockup-frame');

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
  }
})();
