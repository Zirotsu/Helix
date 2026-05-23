/* ============================================================
   HELIX · dna.js
   Fondo 3D de doble hélice (WebGL) en desktop.
   En mobile/tablet usa un fallback liviano basado en imagen.
   ============================================================ */

const isMobileViewport = window.matchMedia(
  '(max-width: 1024px), (hover: none) and (pointer: coarse)'
).matches;

if (isMobileViewport) {
  /* Fallback estático para mobile/tablet */
  const fallback = document.createElement('div');
  fallback.id = 'dna-fallback';
  fallback.setAttribute('aria-hidden', 'true');
  fallback.style.cssText = `
    position: fixed; inset: 0; z-index: 1; pointer-events: none;
    background:
      radial-gradient(ellipse at 50% 30%, rgba(6, 214, 255, 0.10), transparent 60%),
      radial-gradient(ellipse at 50% 70%, rgba(124, 58, 237, 0.08), transparent 60%),
      url('assets/dna-strand.png') center / contain no-repeat;
    opacity: 0.16;
    filter: blur(0.5px);
  `;
  document.body.appendChild(fallback);
  const cv = document.getElementById('dna-canvas');
  if (cv) cv.style.display = 'none';
} else {
  /* Desktop: WebGL helix con postprocessing */
  import('https://unpkg.com/three@0.160.0/build/three.module.js').then(THREE_NS => {
    return Promise.all([
      THREE_NS,
      import('https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js'),
      import('https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js'),
      import('https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js'),
      import('https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/OutputPass.js'),
    ]);
  }).then(([THREE, ECMod, RPMod, UBPMod, OPMod]) => {
    const { EffectComposer } = ECMod;
    const { RenderPass } = RPMod;
    const { UnrealBloomPass } = UBPMod;
    const { OutputPass } = OPMod;

    const canvas = document.getElementById('dna-canvas');
    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
    });
    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    /* DNA — double helix */
    const DNA = new THREE.Group();

    const HELIX_RADIUS = 1.85;
    const TURNS = 8;
    const PITCH = 4.6;
    const HELIX_LEN = TURNS * PITCH;
    const TUBE_RADIUS = 0.11;
    const TUBE_SEGS = 480;
    const TUBE_RADIAL = 14;
    const RUNG_RADIUS = 0.07;
    const RUNGS_PER_TURN = 10;

    class HelixCurve extends THREE.Curve {
      constructor(phase) { super(); this.phase = phase; }
      getPoint(t, target = new THREE.Vector3()) {
        const angle = t * TURNS * Math.PI * 2 + this.phase;
        const y = (t - 0.5) * HELIX_LEN;
        return target.set(
          HELIX_RADIUS * Math.cos(angle),
          y,
          HELIX_RADIUS * Math.sin(angle)
        );
      }
    }

    const strandMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x9be4ff),
      emissive: new THREE.Color(0x18a0d8),
      emissiveIntensity: 0.32,
      metalness: 0,
      roughness: 0.22,
      clearcoat: 1.0,
      clearcoatRoughness: 0.14,
      transmission: 0.5,
      thickness: 0.9,
      ior: 1.42,
      attenuationColor: new THREE.Color(0x4ed0ff),
      attenuationDistance: 2.5,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });

    const rungMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xbfeeff),
      emissive: new THREE.Color(0x2fb8e8),
      emissiveIntensity: 0.45,
      metalness: 0,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      transmission: 0.35,
      thickness: 0.5,
      ior: 1.42,
      transparent: true,
      opacity: 0.95,
    });

    const strand1 = new THREE.Mesh(
      new THREE.TubeGeometry(new HelixCurve(0), TUBE_SEGS, TUBE_RADIUS, TUBE_RADIAL, false),
      strandMat
    );
    const strand2 = new THREE.Mesh(
      new THREE.TubeGeometry(new HelixCurve(Math.PI), TUBE_SEGS, TUBE_RADIUS, TUBE_RADIAL, false),
      strandMat
    );
    DNA.add(strand1, strand2);

    const totalRungs = TURNS * RUNGS_PER_TURN;
    const RUNG_BODY_LEN = 2 * HELIX_RADIUS - 2 * RUNG_RADIUS;
    const rungGeo = new THREE.CapsuleGeometry(RUNG_RADIUS, RUNG_BODY_LEN, 8, 18);
    const _up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i <= totalRungs; i++) {
      const t = i / totalRungs;
      const angle = t * TURNS * Math.PI * 2;
      const y = (t - 0.5) * HELIX_LEN;
      const p1 = new THREE.Vector3(HELIX_RADIUS * Math.cos(angle), y, HELIX_RADIUS * Math.sin(angle));
      const p2 = new THREE.Vector3(HELIX_RADIUS * Math.cos(angle + Math.PI), y, HELIX_RADIUS * Math.sin(angle + Math.PI));
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const dir = p2.clone().sub(p1).normalize();
      const rung = new THREE.Mesh(rungGeo, rungMat);
      rung.position.copy(mid);
      rung.quaternion.setFromUnitVectors(_up, dir);
      DNA.add(rung);
    }

    const capGeo = new THREE.SphereGeometry(TUBE_RADIUS * 1.15, 16, 12);
    [strand1, strand2].forEach(s => {
      const curve = s.geometry.parameters.path;
      [0, 1].forEach(end => {
        const p = curve.getPoint(end);
        const cap = new THREE.Mesh(capGeo, strandMat);
        cap.position.copy(p);
        DNA.add(cap);
      });
    });

    DNA.rotation.z = 0;
    DNA.position.set(0, 0, 0);
    scene.add(DNA);

    /* Lights */
    scene.add(new THREE.AmbientLight(0x1a2d4a, 0.55));
    const keyLight = new THREE.PointLight(0x6fdcff, 14, 26, 1.7);
    keyLight.position.set(3.8, 5.0, 4.4);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x1d6cff, 7, 22, 1.8);
    fillLight.position.set(-4.5, -2.5, 3.0);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0x8ce6ff, 1.4);
    rimLight.position.set(-2, 1, -3);
    scene.add(rimLight);

    /* Particles */
    function makeParticleSprite() {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const rad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      rad.addColorStop(0.00, 'rgba(180,230,255,1)');
      rad.addColorStop(0.35, 'rgba(110,200,255,.55)');
      rad.addColorStop(1.00, 'rgba(0,0,0,0)');
      g.fillStyle = rad;
      g.fillRect(0, 0, 64, 64);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }
    const partTex = makeParticleSprite();

    const PCOUNT = isMobile ? 120 : 260;
    const ppos = new Float32Array(PCOUNT * 3);
    for (let i = 0; i < PCOUNT; i++) {
      ppos[i * 3 + 0] = (Math.random() - 0.5) * 22;
      ppos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      ppos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    const partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
    const partMat = new THREE.PointsMaterial({
      size: 0.085, map: partTex, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
      sizeAttenuation: true, color: 0xbfeaff,
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    const FCOUNT = isMobile ? 30 : 70;
    const fpos = new Float32Array(FCOUNT * 3);
    for (let i = 0; i < FCOUNT; i++) {
      fpos[i * 3 + 0] = (Math.random() - 0.5) * 28;
      fpos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      fpos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 7;
    }
    const farGeo = new THREE.BufferGeometry();
    farGeo.setAttribute('position', new THREE.BufferAttribute(fpos, 3));
    const farMat = new THREE.PointsMaterial({
      size: 0.22, map: partTex, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
      sizeAttenuation: true, color: 0x6fbfff, opacity: 0.55,
    });
    const farPart = new THREE.Points(farGeo, farMat);
    scene.add(farPart);

    /* Post: bloom */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      isMobile ? 0.42 : 0.55, 0.65, 0.18
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* Scroll → rotateY */
    const state = { rotY: 0, tRotY: 0, scroll: 0 };
    function onScroll() {
      const y = window.scrollY || window.pageYOffset;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, y / max));
      state.scroll = p;
      state.tRotY = p * Math.PI * 2;
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Pointer parallax */
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', e => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 0.25;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 0.18;
    });

    function onResize() {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloom.setSize(w, h);
    }
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    function tick() {
      const t = clock.elapsedTime;
      state.rotY += (state.tRotY - state.rotY) * 0.085;

      DNA.rotation.y = state.rotY + t * 0.05;
      DNA.position.y = Math.sin(t * 0.4) * 0.06;

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      camera.position.x = pointer.x;
      camera.position.y = -pointer.y;
      camera.lookAt(0, 0, 0);

      particles.rotation.y = t * 0.025;
      particles.rotation.x = Math.sin(t * 0.18) * 0.03;
      farPart.rotation.y = -t * 0.012;

      composer.render();
      requestAnimationFrame(tick);
    }
    onResize();
    onScroll();
    tick();

    window.__dna = { DNA, camera, state, scene };
  });
}
