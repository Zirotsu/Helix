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
  const nav = document.querySelector('nav');
  const navLinks = document.querySelector('.nav-links');
  let navToggle = document.querySelector('.nav-toggle');

  /* Las landing SEO comparten el mismo nav y este fallback garantiza
     que el menú siga siendo usable en tablet/mobile aunque el HTML
     de una página no incluya el botón explícitamente. */
  if (!navToggle && nav && navLinks) {
    navToggle = document.createElement('button');
    navToggle.className = 'nav-toggle';
    navToggle.type = 'button';
    navToggle.setAttribute('aria-label', 'Abrir menú');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.innerHTML = '<span></span><span></span><span></span>';
    nav.insertBefore(navToggle, navLinks);
  }

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
   SHOWCASE DE SOLUCIONES SEO
   Mantiene las URLs indexables del HTML y convierte visualmente
   el listado básico en una sección comercial integrada a HelixFix.
   ============================================================ */
(function () {
  'use strict';

  const serviceSection = document.querySelector('#servicios');
  if (!serviceSection) return;

  const seoLink = serviceSection.querySelector('a[href="software-para-pymes-chile.html"]');
  if (!seoLink) return;

  const originalBlock = seoLink.closest('p');
  if (!originalBlock) return;

  const expectedUrls = [
    'software-para-pymes-chile.html',
    'automatizacion-de-procesos-chile.html',
    'inteligencia-artificial-para-empresas-chile.html',
    'software-a-medida-chile.html'
  ];

  const hasEverySeoLink = expectedUrls.every(url =>
    originalBlock.querySelector(`a[href="${url}"]`)
  );
  if (!hasEverySeoLink) return;

  if (!document.querySelector('link[data-solutions-showcase]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'solutions-showcase.css?v=20260824';
    stylesheet.dataset.solutionsShowcase = 'true';
    document.head.appendChild(stylesheet);
  }

  const showcase = document.createElement('div');
  showcase.className = 'solutions-showcase reveal visible';
  showcase.setAttribute('aria-labelledby', 'solutions-showcase-title');
  showcase.innerHTML = `
    <div class="solutions-showcase-head">
      <div>
        <div class="solutions-kicker">Explora · Soluciones</div>
        <h3 class="solutions-title" id="solutions-showcase-title">
          Tecnología construida alrededor <em>de tu negocio.</em>
        </h3>
      </div>
      <p class="solutions-intro">
        No adaptamos tu operación a una plantilla. Partimos del problema real y construimos
        la solución que necesita tu empresa para vender, automatizar y crecer con control.
      </p>
    </div>

    <div class="solutions-grid">
      <a class="solution-card" href="software-para-pymes-chile.html" aria-label="Explorar software para pymes en Chile">
        <div class="solution-card-top">
          <span class="solution-index">01 / 04</span>
          <span class="solution-icon" aria-hidden="true"><i class="fa-solid fa-layer-group"></i></span>
        </div>
        <div class="solution-card-body">
          <h4>Software para Pymes</h4>
          <p>Ventas, inventario, clientes, pedidos y caja conectados en una operación que puede crecer por módulos.</p>
        </div>
        <div class="solution-card-cta"><span>Explorar solución</span><i class="fa-solid fa-arrow-up-right-from-square"></i></div>
      </a>

      <a class="solution-card" href="automatizacion-de-procesos-chile.html" aria-label="Explorar automatización de procesos en Chile">
        <div class="solution-card-top">
          <span class="solution-index">02 / 04</span>
          <span class="solution-icon" aria-hidden="true"><i class="fa-solid fa-gears"></i></span>
        </div>
        <div class="solution-card-body">
          <h4>Automatización de Procesos</h4>
          <p>Elimina tareas repetitivas, conecta sistemas dispersos y devuelve tiempo al equipo sin perder trazabilidad.</p>
        </div>
        <div class="solution-card-cta"><span>Automatizar operación</span><i class="fa-solid fa-arrow-up-right-from-square"></i></div>
      </a>

      <a class="solution-card" href="inteligencia-artificial-para-empresas-chile.html" aria-label="Explorar inteligencia artificial para empresas en Chile">
        <div class="solution-card-top">
          <span class="solution-index">03 / 04</span>
          <span class="solution-icon" aria-hidden="true"><i class="fa-solid fa-brain"></i></span>
        </div>
        <div class="solution-card-body">
          <h4>Inteligencia Artificial</h4>
          <p>Agentes, orquestadores, análisis y asistentes IA aplicados donde generan valor operativo medible.</p>
        </div>
        <div class="solution-card-cta"><span>Conocer soluciones IA</span><i class="fa-solid fa-arrow-up-right-from-square"></i></div>
      </a>

      <a class="solution-card" href="software-a-medida-chile.html" aria-label="Explorar software a medida en Chile">
        <div class="solution-card-top">
          <span class="solution-index">04 / 04</span>
          <span class="solution-icon" aria-hidden="true"><i class="fa-solid fa-code"></i></span>
        </div>
        <div class="solution-card-body">
          <h4>Software a Medida</h4>
          <p>Cuando una plataforma genérica ya no alcanza, construimos alrededor de tu proceso, tus datos y tus reglas.</p>
        </div>
        <div class="solution-card-cta"><span>Ver desarrollo a medida</span><i class="fa-solid fa-arrow-up-right-from-square"></i></div>
      </a>
    </div>
  `;

  originalBlock.replaceWith(showcase);
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
