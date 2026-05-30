// ───────────────────────────────────────────────────────────────────────────
//  Hero artifacts. Each builder returns { group, tick(t) }. The group is the
//  3D object placed at an era station; tick(t) advances its screen + motion.
// ───────────────────────────────────────────────────────────────────────────
(function () {
  const screenMat = (tex) =>
    new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  const std = (o) => new THREE.MeshStandardMaterial(o);

  function screenPlane(tex, w, h) {
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), screenMat(tex));
  }
  function box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }

  // 1 ── DIAL-UP : beige CRT + modem + handset ────────────────────────────────
  function dialup() {
    const g = new THREE.Group();
    const scr = window.SCREENS.dialup();
    const beige = std({ color: 0xcabf9e, roughness: 0.85, metalness: 0.05 });
    const dark = std({ color: 0x2a2620, roughness: 0.6 });

    const body = box(7, 6, 6.5, beige); body.position.y = 4.2; g.add(body);
    const bezel = box(6, 4.7, 0.4, dark); bezel.position.set(0, 4.4, 3.3); g.add(bezel);
    const screen = screenPlane(scr.texture, 5, 3.8); screen.position.set(0, 4.4, 3.54); g.add(screen);
    const neck = box(2.4, 1.2, 2.4, beige); neck.position.y = 0.9; g.add(neck);
    const stand = box(5.5, 0.6, 5, beige); stand.position.y = 0.3; g.add(stand);
    // power led
    const led = box(0.25, 0.25, 0.1, std({ color: 0x33ff66, emissive: 0x33ff66, emissiveIntensity: 1 }));
    led.position.set(2.4, 1.6, 3.3); g.add(led);

    // modem with blinking LEDs
    const modem = box(5, 0.8, 3, std({ color: 0x3a3530, roughness: 0.7 }));
    modem.position.set(-7, 0.4, 1); g.add(modem);
    const leds = [];
    for (let i = 0; i < 4; i++) {
      const l = box(0.3, 0.3, 0.12, std({ color: 0xff5e3a, emissive: 0xff5e3a, emissiveIntensity: 1 }));
      l.position.set(-8.6 + i * 0.6, 0.85, 2.45); g.add(l); leds.push(l);
    }
    // telephone handset (two ear/mouth caps + bar) on a base
    const phoneBase = box(4, 0.8, 2.6, beige); phoneBase.position.set(7.5, 0.4, 1); g.add(phoneBase);
    const handset = new THREE.Group(); handset.position.set(7.5, 1.3, 1);
    const bar = box(3.2, 0.7, 0.7, dark); handset.add(bar);
    [-1.7, 1.7].forEach((x) => { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.8, 18), dark); cap.rotation.x = Math.PI / 2; cap.position.set(x, -0.1, 0); handset.add(cap); });
    handset.rotation.z = 0.08; g.add(handset);

    return {
      group: g,
      tick(t) {
        scr.update(t);
        g.position.y = Math.sin(t * 0.8) * 0.15;
        leds.forEach((l, i) => { l.material.emissiveIntensity = (Math.floor(t * 6 + i) % 2) ? 1.4 : 0.1; });
        led.material.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.2;
      },
    };
  }

  // 2 ── WILD WEB : chaotic stack of browser windows ──────────────────────────
  function wildweb() {
    const g = new THREE.Group();
    const wins = [];
    const titleCols = [0x008080, 0x000080, 0x800080, 0x808000];
    for (let i = 0; i < 5; i++) {
      const scr = window.SCREENS.wildweb();
      const w = new THREE.Group();
      const frame = box(7.2, 6.6, 0.5, std({ color: 0xdedede, roughness: 0.5 }));
      w.add(frame);
      const titleBar = box(7.2, 0.9, 0.55, std({ color: titleCols[i % 4], emissive: titleCols[i % 4], emissiveIntensity: 0.25 }));
      titleBar.position.set(0, 3.1, 0.03); w.add(titleBar);
      // window control squares
      for (let b = 0; b < 3; b++) { const cb = box(0.45, 0.45, 0.1, std({ color: 0xcfcfcf })); cb.position.set(2.6 + b * 0.55, 3.1, 0.32); w.add(cb); }
      const screen = screenPlane(scr.texture, 6.4, 5.0); screen.position.set(0, -0.3, 0.3); w.add(screen);
      w.position.set((i - 2) * 2.6 + (Math.random() - 0.5) * 2, 4 + i * 1.4 + Math.random() * 1.5, (i - 2) * 1.8);
      w.rotation.set((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.18);
      w.userData = { scr, baseY: w.position.y, ph: Math.random() * 6, rot: w.rotation.y };
      g.add(w); wins.push(w);
    }
    return {
      group: g,
      tick(t) {
        wins.forEach((w, i) => {
          w.userData.scr.update(t + i);
          w.position.y = w.userData.baseY + Math.sin(t * 1.2 + w.userData.ph) * 0.4;
          w.rotation.y = w.userData.rot + Math.sin(t * 0.6 + w.userData.ph) * 0.12;
        });
      },
    };
  }

  // 3 ── WEB 2.0 : glossy card + reflective pills + star badge ─────────────────
  function web2() {
    const g = new THREE.Group();
    const scr = window.SCREENS.web2();
    const gloss = std({ color: 0x2f7ff0, roughness: 0.08, metalness: 0.9 });
    const card = box(8, 9, 0.6, std({ color: 0xffffff, roughness: 0.15, metalness: 0.3 }));
    card.position.y = 6.5; g.add(card);
    const screen = screenPlane(scr.texture, 7.4, 8.4); screen.position.set(0, 6.5, 0.33); g.add(screen);

    const pills = [];
    for (let i = 0; i < 3; i++) {
      const pill = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 3.2, 20), gloss);
      pill.rotation.z = Math.PI / 2;
      pill.position.set(i % 2 ? 6.4 : -6.4, 5 + i * 2.4, 1.5);
      pill.userData = { ph: i }; g.add(pill); pills.push(pill);
    }
    // star badge (extruded star)
    const starShape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.7 : 1.7, a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      i ? starShape.lineTo(x, y) : starShape.moveTo(x, y);
    }
    const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.4, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12 }),
      std({ color: 0xffcf3a, roughness: 0.1, metalness: 0.9, emissive: 0x6b4a00, emissiveIntensity: 0.4 }));
    star.position.set(5.5, 11.5, 1); g.add(star);

    return {
      group: g,
      tick(t) {
        scr.update(t);
        g.rotation.y = Math.sin(t * 0.4) * 0.12;
        pills.forEach((p) => { p.position.y += Math.sin(t * 1.5 + p.userData.ph) * 0.01; });
        star.rotation.z = t * 0.8;
      },
    };
  }

  // 4 ── THE FEED : smartphone + floating cards ───────────────────────────────
  function feed() {
    const g = new THREE.Group();
    const scr = window.SCREENS.feed();
    const phone = new THREE.Group(); phone.position.y = 7;
    const shell = box(5, 10, 0.6, std({ color: 0x14181f, roughness: 0.35, metalness: 0.7 }));
    phone.add(shell);
    const screen = screenPlane(scr.texture, 4.5, 9); screen.position.z = 0.33; phone.add(screen);
    g.add(phone);
    const cards = [];
    for (let i = 0; i < 4; i++) {
      const c = box(3.4, 2.2, 0.2, std({ color: 0xffffff, roughness: 0.4, emissive: 0x16324d, emissiveIntensity: 0.15 }));
      c.position.set(i % 2 ? 5.5 : -5.5, 4 + i * 2.4, -1 - (i % 2));
      c.userData = { ph: i * 1.3 }; g.add(c); cards.push(c);
    }
    return {
      group: g,
      tick(t) {
        scr.update(t);
        phone.rotation.y = Math.sin(t * 0.5) * 0.25;
        phone.position.y = 7 + Math.sin(t * 0.9) * 0.2;
        cards.forEach((c) => { c.position.y += Math.sin(t + c.userData.ph) * 0.008; c.rotation.z = Math.sin(t * 0.6 + c.userData.ph) * 0.06; });
      },
    };
  }

  // 5 ── VERTICAL : portrait video phone + chrome bust + rising hearts ────────
  function vertical() {
    const g = new THREE.Group();
    const scr = window.SCREENS.vertical();
    const phone = new THREE.Group(); phone.position.set(0, 7, 0); phone.rotation.z = -0.06;
    const shell = box(5.4, 10.4, 0.6, std({ color: 0x0c0c14, roughness: 0.3, metalness: 0.6 }));
    phone.add(shell);
    const screen = screenPlane(scr.texture, 4.9, 9.4); screen.position.z = 0.33; phone.add(screen);
    g.add(phone);

    // chrome bust: column + sphere head + shoulders
    const chrome = std({ color: 0xe6ecf5, roughness: 0.14, metalness: 0.95, emissive: 0x1a1e30, emissiveIntensity: 0.25, envMapIntensity: 1.3 });
    const bust = new THREE.Group(); bust.position.set(-9, 0, -1);
    const plinth = box(3, 1.2, 3, std({ color: 0xff2e93, roughness: 0.4, metalness: 0.3 })); plinth.position.y = 0.6; bust.add(plinth);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.8, 3.4, 20), chrome); torso.position.y = 3; bust.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(1.3, 24, 24), chrome); head.position.y = 5.6; bust.add(head);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.8, 8), chrome); nose.rotation.x = Math.PI / 2; nose.position.set(0, 5.5, 1.25); bust.add(nose);
    g.add(bust);

    // rising hearts (points-ish small planes)
    const hearts = [];
    for (let i = 0; i < 14; i++) {
      const h = new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), new THREE.MeshBasicMaterial({ color: 0xff2e6b, transparent: true }));
      h.position.set(3 + Math.random() * 2, Math.random() * 10, 1.5);
      h.userData = { sp: 0.5 + Math.random(), x: h.position.x }; g.add(h); hearts.push(h);
    }
    return {
      group: g,
      tick(t) {
        scr.update(t);
        phone.position.y = 7 + Math.sin(t * 0.9) * 0.2;
        bust.rotation.y = t * 0.3;
        hearts.forEach((h) => {
          h.position.y += h.userData.sp * 0.06;
          h.position.x = h.userData.x + Math.sin(t * 2 + h.userData.sp * 5) * 0.5;
          if (h.position.y > 12) h.position.y = -1;
          h.material.opacity = Math.max(0, 1 - h.position.y / 12);
        });
      },
    };
  }

  // 6 ── SYNTHETIC : morphing neural bloom + particle cloud + panel ───────────
  function synthetic() {
    const g = new THREE.Group();
    const scr = window.SCREENS.synthetic();
    const geo = new THREE.IcosahedronGeometry(4, 5);
    geo.userData.base = geo.attributes.position.array.slice();
    const bloom = new THREE.Mesh(geo, std({ color: 0x8f7bff, roughness: 0.25, metalness: 0.6, emissive: 0x4b2e8f, emissiveIntensity: 0.6, flatShading: true }));
    bloom.position.y = 7; g.add(bloom);

    // orbiting particle cloud
    const pc = 600, pos = new Float32Array(pc * 3);
    for (let i = 0; i < pc; i++) {
      const r = 6 + Math.random() * 4, a = Math.random() * 6.28, b = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = Math.sin(b) * Math.cos(a) * r;
      pos[i * 3 + 1] = 7 + Math.cos(b) * r;
      pos[i * 3 + 2] = Math.sin(b) * Math.sin(a) * r;
    }
    const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(pgeo, new THREE.PointsMaterial({ color: 0xff7ad1, size: 0.12, transparent: true, opacity: 0.8 }));
    g.add(pts);

    // floating prompt panel
    const panel = screenPlane(scr.texture, 7, 7); panel.position.set(9, 7, 0); panel.rotation.y = -0.5; g.add(panel);

    const base = geo.userData.base, p = geo.attributes.position;
    return {
      group: g,
      tick(t) {
        scr.update(t);
        for (let i = 0; i < p.count; i++) {
          const ix = i * 3, x = base[ix], y = base[ix + 1], z = base[ix + 2];
          const n = Math.sin(x * 1.2 + t * 1.5) * Math.cos(y * 1.2 + t) * Math.sin(z * 1.2 + t * 0.7);
          const s = 1 + n * 0.18;
          p.array[ix] = x * s; p.array[ix + 1] = y * s; p.array[ix + 2] = z * s;
        }
        p.needsUpdate = true; geo.computeVertexNormals();
        bloom.rotation.y = t * 0.3; bloom.rotation.x = t * 0.12;
        const c = window.lerpColor('#8f7bff', '#ff7ad1', (Math.sin(t * 0.5) + 1) / 2);
        bloom.material.color.copy(c); bloom.material.emissive.copy(c).multiplyScalar(0.4);
        pts.rotation.y = -t * 0.15;
      },
    };
  }

  window.ARTIFACTS = { dialup, wildweb, web2, feed, vertical, synthetic };
})();
