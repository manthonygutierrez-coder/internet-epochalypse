// ───────────────────────────────────────────────────────────────────────────
//  Touchstones — the clickable entry points into the interactive apps.
//  • Config of which app sits at which era + how it's anchored.
//  • Builders for the extra physical devices (Game Boy, Tamagotchi, projector).
//  • A floating "▶ LABEL" billboard sprite used as the glowing affordance.
//  app.js places these, tags their meshes, and raycasts clicks.
// ───────────────────────────────────────────────────────────────────────────
(function () {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);

  // mode 'hero'  → click the era's existing hero artifact
  // mode 'build' → spawn a dedicated device at offset and click that
  window.TOUCHSTONES = [
    { era: 0, app: 'dialup-sim', label: 'DIAL IN', mode: 'hero', labelOffset: [0, 11, 3] },
    { era: 1, app: 'gameboy',    label: 'PLAY CAPSUMON',         mode: 'build', device: 'gameboy',  offset: [0, 0, 9] },
    { era: 2, app: 'lolcat',     label: 'I CAN HAS MEMES?',      mode: 'build', device: 'projector', offset: [13, 0, 6] },
    { era: 2, app: 'myspace',    label: 'CUSTOMIZE MY PAGE',     mode: 'hero', labelOffset: [-5, 14, 2] },
    { era: 3, app: 'feedsim',    label: 'PULL TO REFRESH',       mode: 'hero', labelOffset: [0, 14, 3] },
    { era: 4, app: 'foryou',     label: 'OPEN FOR YOU',          mode: 'hero', labelOffset: [0, 14, 3] },
    { era: 5, app: 'synth',      label: 'GENERATE',              mode: 'hero', labelOffset: [9, 13, 1] },
  ];

  // ── billboard label sprite ("▶ TEXT" tag that always faces camera) ─────────
  window.makeLabel = function (text, hex) {
    const pad = 22, fs = 24;          // Game-Boy-style pixel font
    const FONT = '400 ' + fs + 'px "Press Start 2P", "VT323", monospace';
    const ink = '#05080a';            // text/icon = background color
    const cv = document.createElement('canvas'); const ctx = cv.getContext('2d');
    const H = 0.82;                   // ~half the previous on-screen height

    function render() {
      ctx.font = FONT;
      const str = '\u25B6  ' + text;
      const tw = ctx.measureText(str).width;
      cv.width = Math.ceil(tw + pad * 2); cv.height = Math.ceil(fs + pad * 1.3);
      ctx.font = FONT;
      ctx.clearRect(0, 0, cv.width, cv.height);
      const r = cv.height * 0.14;      // 14% rounded corners
      ctx.fillStyle = hex;             // fill with the (former border) accent, no border
      ctx.beginPath();
      ctx.moveTo(r, 0); ctx.arcTo(cv.width, 0, cv.width, cv.height, r); ctx.arcTo(cv.width, cv.height, 0, cv.height, r);
      ctx.arcTo(0, cv.height, 0, 0, r); ctx.arcTo(0, 0, cv.width, 0, r); ctx.closePath(); ctx.fill();
      ctx.fillStyle = ink; ctx.textBaseline = 'middle';
      ctx.fillText(str, pad, cv.height / 2 + 1);
    }
    render();
    const tex = new THREE.CanvasTexture(cv); tex.minFilter = THREE.LinearFilter;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    const rescale = () => spr.scale.set((cv.width / cv.height) * H, H, 1);
    rescale();
    spr.renderOrder = 999;
    // redraw once the pixel font loads (metrics change) so the tag re-fits
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { render(); rescale(); tex.needsUpdate = true; });
    return spr;
  };

  // ── physical devices ────────────────────────────────────────────────────────
  function gameboy(hex) {
    const g = new THREE.Group();
    const shell = std({ color: 0xcfcabb, roughness: 0.7 });
    const body = box(4.6, 7.2, 1.1, shell); body.position.y = 5; g.add(body);
    const screen = box(3.4, 3, 0.2, std({ color: 0x6a7a18, emissive: 0x3a4a08, emissiveIntensity: 0.6, roughness: 0.4 }));
    screen.position.set(0, 6.3, 0.6); g.add(screen);
    const dark = std({ color: 0x2a2a30, roughness: 0.6 });
    const dpad = box(1.2, 1.2, 0.3, dark); dpad.position.set(-1.2, 3.6, 0.6); g.add(dpad);
    [[1.2, 4], [2, 3.3]].forEach((p) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 14), std({ color: 0x8b2a52 })); b.rotation.x = Math.PI / 2; b.position.set(p[0], p[1], 0.6); g.add(b); });
    g.userData.spin = 0.4;
    return { group: g, screen };
  }
  function projector(hex) {
    const g = new THREE.Group();
    const metal = std({ color: 0x3a4250, roughness: 0.4, metalness: 0.6 });
    const body = box(5, 3, 7, metal); body.position.y = 3; g.add(body);
    const tray = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.5, 24), std({ color: 0x2a3038, roughness: 0.5 }));
    tray.position.set(0, 4.8, -0.5); g.add(tray);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 1.4, 20), std({ color: 0xbfe0ff, emissive: 0x2a4a6a, emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.8 }));
    lens.rotation.x = Math.PI / 2; lens.position.set(0, 3, 4); g.add(lens);
    // light cone
    const cone = new THREE.Mesh(new THREE.ConeGeometry(5, 14, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.05, side: THREE.DoubleSide }));
    cone.rotation.x = -Math.PI / 2; cone.position.set(0, 3, 12); g.add(cone);
    g.userData.tray = tray;
    return { group: g, screen: lens };
  }

  window.TOUCHSTONE_DEVICES = { gameboy, projector };
})();
