// ───────────────────────────────────────────────────────────────────────────
//  INTERNET EPOCHALYPSE — scene, camera fly-through, morph + reskin engine
// ───────────────────────────────────────────────────────────────────────────
(function () {
  const ERAS = window.ERAS, SPACING = window.SPACING, N = ERAS.length;
  const START_YEARS = [1991, 1996, 2002, 2010, 2016, 2022, 2025];
  const lerpColor = window.lerpColor;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const container = document.getElementById('scene');

  // ── core ──────────────────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(ERAS[0].palette.bg);
  scene.fog = new THREE.FogExp2(ERAS[0].palette.fog, 0.0115);

  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 2000);
  camera.position.set(0, 13, 46);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // lightweight gradient environment so metals (chrome bust, glossy pills, star) reflect
  (function () {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#454d80'); g.addColorStop(0.5, '#11141f'); g.addColorStop(1, '#04060c');
    x.fillStyle = g; x.fillRect(0, 0, 512, 256);
    x.fillStyle = 'rgba(170,178,220,0.9)'; x.beginPath(); x.arc(150, 64, 46, 0, 7); x.fill();
    x.fillStyle = 'rgba(120,90,160,0.5)'; x.beginPath(); x.arc(380, 96, 60, 0, 7); x.fill();
    const tex = new THREE.CanvasTexture(c); tex.mapping = THREE.EquirectangularReflectionMapping;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromEquirectangular(tex).texture;
    tex.dispose(); pmrem.dispose();
  })();

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minDistance = 26;
  controls.maxDistance = 70;
  controls.maxPolarAngle = Math.PI / 2 - 0.04;
  controls.minPolarAngle = 0.25;
  controls.target.set(0, 6, 0);
  // ── orbit limited to a left↔right arc (no full 360° spin) ──
  const AZ_BOUND = 0.62;                 // max swing each side (~35°)
  controls.minAzimuthAngle = -AZ_BOUND;  // hard-clamp manual drag
  controls.maxAzimuthAngle = AZ_BOUND;
  controls.autoRotate = true;            // pendulum: sign flips at each bound
  controls.autoRotateSpeed = 0.5;

  // ── lights ─────────────────────────────────────────────────────────────────
  scene.add(new THREE.HemisphereLight(0x6a6f8a, 0x0a0a14, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 0.85);
  key.position.set(14, 30, 18); scene.add(key);
  const accentLight = new THREE.PointLight(ERAS[0].palette.accent, 2.4, 90, 1.4);
  accentLight.position.set(0, 14, 8); scene.add(accentLight);
  const accentLight2 = new THREE.PointLight(ERAS[0].palette.accent2, 1.4, 80, 1.5);
  accentLight2.position.set(0, 6, -10); scene.add(accentLight2);

  // ── floor grid (single material so it can recolor) ──────────────────────────
  const minX = -64, maxX = (N - 1) * SPACING + 64, halfZ = 70, step = 6;
  const gpts = [];
  for (let x = minX; x <= maxX; x += step) gpts.push(x, 0, -halfZ, x, 0, halfZ);
  for (let z = -halfZ; z <= halfZ; z += step) gpts.push(minX, 0, z, maxX, 0, z);
  const ggeo = new THREE.BufferGeometry();
  ggeo.setAttribute('position', new THREE.Float32BufferAttribute(gpts, 3));
  const gmat = new THREE.LineBasicMaterial({ color: ERAS[0].palette.grid, transparent: true, opacity: 0.55 });
  const grid = new THREE.LineSegments(ggeo, gmat); grid.position.y = -0.01; scene.add(grid);

  // ── starfield ────────────────────────────────────────────────────────────────
  const sc = 1400, spos = new Float32Array(sc * 3);
  for (let i = 0; i < sc; i++) {
    spos[i * 3] = (Math.random() - 0.2) * (maxX - minX + 200) + minX;
    spos[i * 3 + 1] = Math.random() * 160 - 10;
    spos[i * 3 + 2] = (Math.random() - 0.5) * 360;
  }
  const sgeo = new THREE.BufferGeometry();
  sgeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
  const stars = new THREE.Points(sgeo, new THREE.PointsMaterial({ color: 0x9fa6c8, size: 0.5, transparent: true, opacity: 0.5, sizeAttenuation: true }));
  scene.add(stars);

  // ── stations: pad + ring + artifact ─────────────────────────────────────────
  const arts = [];
  ERAS.forEach((era, i) => {
    const x = i * SPACING;
    const acc = new THREE.Color(era.palette.accent);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(18, 64),
      new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.05, side: THREE.DoubleSide }));
    pad.rotation.x = -Math.PI / 2; pad.position.set(x, 0.02, 0); scene.add(pad);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(17.6, 0.14, 8, 96),
      new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.55 }));
    ring.rotation.x = Math.PI / 2; ring.position.set(x, 0.05, 0); scene.add(ring);
    // light beam pillar
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 70, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.06, side: THREE.DoubleSide }));
    beam.position.set(x, 35, -14); scene.add(beam);

    const a = window.ARTIFACTS[era.id]();
    a.group.position.x = x; scene.add(a.group);
    arts.push({ ...a, ring, pad, x });
  });

  // ── touchstones: clickable devices + glowing affordance labels ──────────────
  const clickTargets = [];   // meshes/sprites tagged userData.touchstone
  const labels = [];         // { sprite, era, baseY, app }
  const devices = [];        // { group, tick }
  function collectMeshes(obj, app) {
    obj.traverse((m) => { if (m.isMesh) { m.userData.touchstone = app; clickTargets.push(m); } });
  }
  (window.TOUCHSTONES || []).forEach((ts) => {
    const sx = ts.era * SPACING;
    const acc = new THREE.Color(ERAS[ts.era].palette.accent);
    const hex = '#' + acc.getHexString();
    let lx = sx, ly = 12, lz = 3;

    if (ts.mode === 'build') {
      const dev = window.TOUCHSTONE_DEVICES[ts.device](hex);
      dev.group.position.set(sx + ts.offset[0], ts.offset[1], ts.offset[2]);
      scene.add(dev.group);
      collectMeshes(dev.group, ts.app);
      // glowing puck ring under the device
      const puck = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.12, 8, 44),
        new THREE.MeshBasicMaterial({ color: acc, transparent: true, opacity: 0.6 }));
      puck.rotation.x = Math.PI / 2; puck.position.set(sx + ts.offset[0], 0.12, ts.offset[2]); scene.add(puck);
      const spin = dev.group.userData.spin || 0;
      const tray = dev.group.userData.tray;
      devices.push({ group: dev.group, puck, tick(t) {
        if (spin) dev.group.rotation.y = Math.sin(t * 0.5) * 0.4;
        dev.group.position.y = (ts.offset[1] || 0) + Math.sin(t * 0.9 + ts.era) * 0.25;
        if (tray) tray.rotation.y = t * 0.4;
        puck.material.opacity = 0.4 + Math.sin(t * 2 + ts.era) * 0.2;
      } });
      lx = sx + ts.offset[0]; ly = (ts.offset[1] || 0) + (ts.labelY != null ? ts.labelY : 9.5); lz = ts.offset[2];
    } else {
      // hero-anchored: clicking the era's hero artifact opens the app
      collectMeshes(arts[ts.era].group, ts.app);
      const off = ts.labelOffset || [0, 12, 3];
      lx = sx + off[0]; ly = off[1]; lz = off[2];
    }

    const label = window.makeLabel(ts.label, hex);
    label.position.set(lx, ly, lz);
    label.userData.touchstone = ts.app;
    scene.add(label);
    clickTargets.push(label);
    labels.push({ sprite: label, era: ts.era, baseY: ly, app: ts.app });
  });

  // ── raycast picking (click an artifact → open its interactive) ──────────────
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let downXY = null, moved = false;
  function setNDC(e) { const r = renderer.domElement.getBoundingClientRect(); ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1; ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1; }
  function pick(e) { setNDC(e); ray.setFromCamera(ndc, camera); return ray.intersectObjects(clickTargets, false); }
  renderer.domElement.addEventListener('pointerdown', (e) => { downXY = [e.clientX, e.clientY]; moved = false; });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (downXY && (Math.abs(e.clientX - downXY[0]) > 5 || Math.abs(e.clientY - downXY[1]) > 5)) moved = true;
    if (window.OVERLAY && OVERLAY.isOpen()) { renderer.domElement.style.cursor = ''; return; }
    const hit = pick(e);
    renderer.domElement.style.cursor = (hit.length && hit[0].object.userData.touchstone) ? 'pointer' : 'grab';
  });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!moved && !(window.OVERLAY && OVERLAY.isOpen())) {
      const hit = pick(e);
      if (hit.length && hit[0].object.userData.touchstone) { window.OVERLAY && OVERLAY.open(hit[0].object.userData.touchstone); }
    }
    downXY = null;
  });

  // ── camera focus (fly toward an artifact when its app opens) ────────────────
  let focusActive = false, focusX = 0;
  window.__focusOn = (i) => { focusActive = true; focusX = i * SPACING; setTarget(i); controls.autoRotate = false; };
  window.__unfocus = () => { focusActive = false; controls.autoRotate = autoOn; };

  // ── timeline state ───────────────────────────────────────────────────────────
  let targetProgress = 0;          // where the user wants to be (0 .. N-1)
  const scrubber = document.getElementById('scrubber');
  const markers = [...document.querySelectorAll('.marker')];
  let activeIndex = -1;

  function setTarget(p) { targetProgress = clamp(p, 0, N - 1); }
  window.gotoEra = (i) => { setTarget(i); controls.autoRotate = autoOn; };

  scrubber.addEventListener('input', (e) => setTarget(parseFloat(e.target.value)));
  markers.forEach((m, i) => m.addEventListener('click', () => window.gotoEra(i)));
  addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setTarget(Math.round(targetProgress) + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setTarget(Math.round(targetProgress) - 1);
  });
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    setTarget(targetProgress + e.deltaY * 0.0016);
  }, { passive: false });

  // ── auto-orbit toggle ─────────────────────────────────────────────────────────
  let autoOn = true;
  const orbitBtn = document.getElementById('orbit-toggle');
  orbitBtn.addEventListener('click', () => {
    autoOn = !autoOn; controls.autoRotate = autoOn;
    orbitBtn.classList.toggle('off', !autoOn);
    orbitBtn.querySelector('span').textContent = autoOn ? 'ORBIT: AUTO' : 'ORBIT: MANUAL';
  });

  // ── HUD content swap ───────────────────────────────────────────────────────────
  const el = {
    title: document.getElementById('hud-title'),
    years: document.getElementById('hud-years'),
    tag: document.getElementById('hud-tag'),
    desc: document.getElementById('hud-desc'),
    list: document.getElementById('hud-list'),
    idx: document.getElementById('era-index'),
    progressFill: document.getElementById('progress-fill'),
  };
  function applyEra(i) {
    const era = ERAS[i];
    document.body.className = era.chrome;
    el.title.textContent = era.name;
    el.years.textContent = era.years;
    el.tag.textContent = era.tag;
    el.desc.textContent = era.desc;
    el.idx.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
    el.list.innerHTML = '';
    era.touchstones.forEach((b) => { const li = document.createElement('li'); li.textContent = b; el.list.appendChild(li); });
    markers.forEach((m, k) => m.classList.toggle('active', k === i));
  }

  // ── per-frame morph (continuous palette blend) ──────────────────────────────
  const root = document.documentElement.style;
  function morph(progress) {
    const f = clamp(Math.floor(progress), 0, N - 1);
    const c = Math.min(f + 1, N - 1);
    const a = progress - f;
    const A = ERAS[f].palette, B = ERAS[c].palette;

    const bg = lerpColor(A.bg, B.bg, a);
    scene.background.copy(bg); scene.fog.color.copy(bg);
    gmat.color.copy(lerpColor(A.grid, B.grid, a));
    const acc = lerpColor(A.accent, B.accent, a);
    const acc2 = lerpColor(A.accent2, B.accent2, a);
    accentLight.color.copy(acc); accentLight2.color.copy(acc2);

    root.setProperty('--accent', '#' + acc.getHexString());
    root.setProperty('--accent2', '#' + acc2.getHexString());
    root.setProperty('--key', '#' + lerpColor(A.key, B.key, a).getHexString());
    root.setProperty('--bg', '#' + bg.getHexString());

    const ai = Math.round(progress);
    if (ai !== activeIndex) { activeIndex = ai; applyEra(ai); }
    el.progressFill.style.width = (progress / (N - 1) * 100) + '%';
    if (window.AUDIO) window.AUDIO.setProgress(progress);
    // live year readout
    const yrEl = document.getElementById('cur-year');
    if (yrEl) {
      const f = clamp(Math.floor(progress), 0, N - 1), c2 = Math.min(f + 1, N - 1), a2 = progress - f;
      const y = Math.round(lerp(START_YEARS[f], START_YEARS[c2], a2));
      yrEl.textContent = y >= 2025 ? '2025' : y;
    }
  }

  // ── camera glide ───────────────────────────────────────────────────────────────
  const FOCUS_POS = new THREE.Vector3();
  function follow() {
    if (focusActive) {
      controls.target.x += (focusX - controls.target.x) * 0.12;
      controls.target.y += (7 - controls.target.y) * 0.1;
      FOCUS_POS.set(focusX + 3, 11, 31);
      camera.position.lerp(FOCUS_POS, 0.08);
      accentLight.position.x = focusX; accentLight2.position.x = focusX + 6;
      return;
    }
    if (Math.abs(controls.target.y - 6) > 0.01) controls.target.y += (6 - controls.target.y) * 0.1;
    const desiredX = targetProgress * SPACING;
    const dx = (desiredX - controls.target.x) * 0.08;
    controls.target.x += dx;
    camera.position.x += dx;
    accentLight.position.x = controls.target.x;
    accentLight2.position.x = controls.target.x + 6;
    if (Math.abs(parseFloat(scrubber.value) - targetProgress) > 0.001) scrubber.value = targetProgress;
  }

  // ── loop ─────────────────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let hintHidden = false;
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    follow();
    // pendulum auto-orbit: reverse sweep at each azimuth bound so the camera
    // only rocks left↔right instead of spinning a full circle
    if (autoOn && !focusActive) {
      const az = controls.getAzimuthalAngle();
      const spd = controls.autoRotateSpeed;
      if (az >= AZ_BOUND - 0.02 && spd > 0) controls.autoRotateSpeed = -Math.abs(spd);
      else if (az <= -AZ_BOUND + 0.02 && spd < 0) controls.autoRotateSpeed = Math.abs(spd);
    }
    controls.update();
    morph(controls.target.x / SPACING);

    // only tick the 2-3 nearest stations for performance
    const near = controls.target.x / SPACING;
    arts.forEach((a, i) => {
      const d = Math.abs(i - near);
      if (d < 1.8) a.tick(t);
      a.ring.material.opacity = 0.25 + Math.max(0, 0.5 - d) * 0.9 + Math.sin(t * 2 + i) * 0.05;
      a.ring.scale.setScalar(1 + (d < 0.6 ? Math.sin(t * 1.5) * 0.01 : 0));
    });
    stars.rotation.y = t * 0.005;

    // touchstone devices + affordance labels
    const overlayOpen = window.OVERLAY && OVERLAY.isOpen();
    devices.forEach((d) => d.tick(t));
    labels.forEach((L) => {
      const d = Math.abs(L.era - near);
      const vis = overlayOpen ? 0 : (d < 0.55 ? 1 : Math.max(0, 0.85 - (d - 0.55) * 1.2));
      L.sprite.material.opacity = vis * (0.78 + Math.sin(t * 3 + L.era) * 0.22);
      L.sprite.visible = vis > 0.02;
      L.sprite.position.y = L.baseY + Math.sin(t * 1.5 + L.era) * 0.45;
    });

    if (!hintHidden && (targetProgress > 0.05 || t > 6)) {
      hintHidden = true;
      const h = document.getElementById('hint'); if (h) h.classList.add('gone');
    }
    renderer.render(scene, camera);
  }

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // deterministic seek (snaps instantly + renders one frame) — used for deep-link & capture
  window.__seek = (progress) => {
    progress = clamp(progress, 0, N - 1);
    targetProgress = progress;
    const x = progress * SPACING;
    camera.position.x += (x - controls.target.x);
    controls.target.x = x;
    accentLight.position.x = x; accentLight2.position.x = x + 6;
    scrubber.value = progress;
    controls.update();
    morph(progress);
    const t = clock.getElapsedTime();
    arts.forEach((a, i) => { if (Math.abs(i - progress) < 1.8) a.tick(t); });
    renderer.render(scene, camera);
  };

  applyEra(0);
  morph(0);
  animate();
})();
