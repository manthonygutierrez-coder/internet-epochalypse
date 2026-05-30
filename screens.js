// ───────────────────────────────────────────────────────────────────────────
//  Live screen textures. Each builder returns { texture, update(t) } where the
//  canvas is redrawn over time so the era's hero device shows moving content.
// ───────────────────────────────────────────────────────────────────────────
(function () {
  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return { c, ctx: c.getContext('2d'), tex };
  }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 1 ── DIAL-UP : phosphor terminal / AOL ────────────────────────────────────
  function dialup() {
    const { c, ctx, tex } = makeCanvas(512, 384);
    const lines = [
      'WELCOME TO AMERICA ONLINE',
      '> dialing 555-0199 ...',
      '> CONNECT 14400  NO CARRIER? no.',
      '> handshake OK',
      '',
      'YOU HAVE MAIL.',
      '',
      'main menu:',
      ' [1] chat rooms',
      ' [2] the web ( beta )',
      ' [3] download center',
      '',
      'a:\\> _',
    ];
    return {
      texture: tex,
      update(t) {
        ctx.fillStyle = '#04140a';
        ctx.fillRect(0, 0, 512, 384);
        ctx.font = '17px "VT323", "Courier New", monospace';
        ctx.fillStyle = '#3dff7a';
        ctx.shadowColor = '#3dff7a'; ctx.shadowBlur = 8;
        lines.forEach((l, i) => ctx.fillText(l, 22, 40 + i * 25));
        // blinking block cursor
        if (Math.floor(t * 2) % 2 === 0) {
          ctx.fillRect(22 + ctx.measureText('a:\\> ').width, 40 + 12 * 25 - 14, 11, 18);
        }
        ctx.shadowBlur = 0;
        // scanlines
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        for (let y = 0; y < 384; y += 4) ctx.fillRect(0, y, 512, 2);
        tex.needsUpdate = true;
      },
    };
  }

  // 2 ── WILD WEB : GeoCities homepage chaos ──────────────────────────────────
  function wildweb() {
    const { c, ctx, tex } = makeCanvas(512, 512);
    return {
      texture: tex,
      update(t) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 512, 512);
        // tiled starfield bg
        for (let i = 0; i < 60; i++) {
          ctx.fillStyle = ['#1a004d', '#330066', '#000033'][i % 3];
          ctx.fillRect((i * 73) % 512, (i * 131) % 512, 40, 40);
        }
        // rainbow WordArt title
        const title = 'WELCOME 2 MY HOMEPAGE!!!';
        ctx.font = 'bold 30px "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        const cols = ['#ff0000', '#ff8800', '#ffee00', '#00cc33', '#0066ff', '#cc00ff'];
        for (let i = 0; i < title.length; i++) {
          ctx.fillStyle = cols[i % cols.length];
          const bob = Math.sin(t * 4 + i) * 3;
          ctx.fillText(title[i], 30 + i * 18, 60 + bob);
        }
        ctx.textAlign = 'left';
        // marquee
        const mx = 512 - ((t * 90) % 760);
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 22px "Comic Sans MS", cursive';
        ctx.fillText('★ sign my guestbook ★ best viewed in NETSCAPE ★', mx, 120);
        // under construction bar
        ctx.fillStyle = '#ffcc00';
        for (let x = 0; x < 512; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x + 20, 150);
          ctx.lineTo(x + 40, 180); ctx.lineTo(x + 20, 180); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = '#000'; ctx.font = 'bold 22px Arial';
        ctx.fillText('🚧 UNDER CONSTRUCTION 🚧', 70, 174);
        // hit counter
        ctx.fillStyle = '#111'; ctx.fillRect(150, 220, 212, 50);
        ctx.fillStyle = '#00ff44'; ctx.font = 'bold 34px "Courier New"';
        const hits = String(1337 + Math.floor(t * 3)).padStart(6, '0');
        ctx.fillText(hits, 168, 256);
        ctx.fillStyle = '#fff'; ctx.font = '14px Arial';
        ctx.fillText('you are visitor #', 168, 290);
        // dancing baby + flame divider
        ctx.font = '40px serif'; ctx.fillText('👶  🔥  💿  📟  👾', 100, 360);
        // links
        ctx.fillStyle = '#ffff00'; ctx.font = 'underline 20px "Comic Sans MS"';
        ctx.fillText('• my cool links', 60, 410);
        ctx.fillText('• cheat codes', 60, 440);
        ctx.fillText('• about me!!1', 60, 470);
        tex.needsUpdate = true;
      },
    };
  }

  // 3 ── WEB 2.0 : glossy social profile ──────────────────────────────────────
  function web2() {
    const { c, ctx, tex } = makeCanvas(512, 512);
    return {
      texture: tex,
      update(t) {
        ctx.fillStyle = '#eef3fb'; ctx.fillRect(0, 0, 512, 512);
        // glossy header bar w/ gradient + reflection
        let g = ctx.createLinearGradient(0, 0, 0, 90);
        g.addColorStop(0, '#5aa6ff'); g.addColorStop(0.5, '#2f7ff0'); g.addColorStop(0.51, '#2266d8'); g.addColorStop(1, '#2f7ff0');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 90);
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(0, 0, 512, 28);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 30px "Lucida Grande", Helvetica, Arial';
        ctx.fillText('my_space', 24, 56);
        ctx.font = 'italic 16px Helvetica'; ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText('beta', 196, 44);
        // avatar
        ctx.fillStyle = '#fff'; rr(ctx, 28, 116, 130, 130, 10); ctx.fill();
        ctx.fillStyle = '#cdd8ea'; rr(ctx, 36, 124, 114, 114, 8); ctx.fill();
        ctx.fillStyle = '#9fb0cc'; ctx.beginPath(); ctx.arc(93, 168, 30, 0, 7); ctx.fill();
        ctx.fillRect(63, 196, 60, 42);
        // online pill
        ctx.fillStyle = '#3fbf57'; rr(ctx, 180, 120, 150, 30, 15); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Helvetica'; ctx.fillText('● ONLINE NOW', 196, 141);
        // glossy buttons
        ['Add Friend', 'Send Message'].forEach((label, i) => {
          let bg = ctx.createLinearGradient(0, 0, 0, 38);
          bg.addColorStop(0, '#7fd1ff'); bg.addColorStop(0.5, '#39a7f5'); bg.addColorStop(0.51, '#1f8ae0'); bg.addColorStop(1, '#4cb4f7');
          ctx.fillStyle = bg; rr(ctx, 180, 168 + i * 48, 200, 38, 19); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.4)'; rr(ctx, 188, 172 + i * 48, 184, 13, 7); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = 'bold 17px Helvetica'; ctx.fillText(label, 222, 192 + i * 48);
        });
        // Top 8 grid
        ctx.fillStyle = '#2f6fd0'; ctx.font = 'bold 20px Helvetica'; ctx.fillText('Top 8 Friends', 28, 296);
        for (let i = 0; i < 8; i++) {
          const x = 28 + (i % 4) * 120, y = 312 + Math.floor(i / 4) * 96;
          const hov = (Math.floor(t) % 8) === i;
          ctx.fillStyle = hov ? '#ffd34d' : '#fff'; rr(ctx, x, y, 104, 80, 8); ctx.fill();
          ctx.fillStyle = '#b9c6dc'; rr(ctx, x + 8, y + 8, 88, 50, 6); ctx.fill();
          ctx.fillStyle = '#2f6fd0'; ctx.font = '13px Helvetica'; ctx.fillText('friend_' + (i + 1), x + 10, y + 74);
        }
        tex.needsUpdate = true;
      },
    };
  }

  // 4 ── THE FEED : flat infinite scroll ──────────────────────────────────────
  function feed() {
    const { c, ctx, tex } = makeCanvas(384, 720);
    return {
      texture: tex,
      update(t) {
        ctx.fillStyle = '#f3f5f7'; ctx.fillRect(0, 0, 384, 720);
        // status + app bar
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 384, 96);
        ctx.fillStyle = '#111'; ctx.font = 'bold 22px Helvetica'; ctx.fillText('Feed', 24, 64);
        ctx.fillStyle = '#888'; ctx.font = '15px Helvetica'; ctx.textAlign = 'right'; ctx.fillText('9:41', 360, 30); ctx.textAlign = 'left';
        // scrolling cards
        const scroll = (t * 70) % 220;
        for (let i = -1; i < 5; i++) {
          const y = 110 + i * 220 - scroll;
          ctx.fillStyle = '#fff'; rr(ctx, 16, y, 352, 200, 12); ctx.fill();
          ctx.fillStyle = ['#2e9bff', '#ff4d4f', '#46c46a', '#ff9f1c'][(i + 1) % 4];
          ctx.beginPath(); ctx.arc(48, y + 36, 18, 0, 7); ctx.fill();
          ctx.fillStyle = '#222'; ctx.font = 'bold 15px Helvetica'; ctx.fillText('@user_' + ((i + 9) % 50), 78, y + 32);
          ctx.fillStyle = '#9aa3ad'; ctx.font = '13px Helvetica'; ctx.fillText(((i + 2) * 3) + 'm', 78, y + 50);
          ctx.fillStyle = '#e9edf1'; rr(ctx, 24, y + 64, 336, 86, 8); ctx.fill();
          // action row
          ctx.font = '20px Helvetica';
          ctx.fillStyle = (Math.floor(t) % 5) === ((i + 1) % 5) ? '#ff4d4f' : '#c2c9d1';
          ctx.fillText('♥', 30, y + 184);
          ctx.fillStyle = '#c2c9d1'; ctx.fillText('💬   ↗', 70, y + 184);
        }
        // mask header again (cards scroll under it)
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 384, 96);
        ctx.fillStyle = '#111'; ctx.font = 'bold 22px Helvetica'; ctx.fillText('Feed', 24, 64);
        // tab bar
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 656, 384, 64);
        ctx.fillStyle = '#e6eaee'; ctx.fillRect(0, 656, 384, 1);
        ['⌂', '🔍', '＋', '♥', '◔'].forEach((g, i) => {
          ctx.fillStyle = i === 0 ? '#2e9bff' : '#b6bec6'; ctx.font = '22px Helvetica';
          ctx.fillText(g, 34 + i * 72, 698);
        });
        tex.needsUpdate = true;
      },
    };
  }

  // 5 ── VERTICAL : algorithmic short-form video ──────────────────────────────
  function vertical() {
    const { c, ctx, tex } = makeCanvas(384, 720);
    return {
      texture: tex,
      update(t) {
        // shifting vaporwave gradient
        const g = ctx.createLinearGradient(0, 0, 384, 720);
        const a = (Math.sin(t * 0.6) + 1) / 2;
        g.addColorStop(0, window.lerpColor('#ff2e93', '#7a2bff', a).getStyle());
        g.addColorStop(0.5, window.lerpColor('#7a2bff', '#16eaff', a).getStyle());
        g.addColorStop(1, window.lerpColor('#16eaff', '#ff2e93', a).getStyle());
        ctx.fillStyle = g; ctx.fillRect(0, 0, 384, 720);
        // perspective sun
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(192, 250, 110, 0, 7); ctx.fill();
        // perspective grid floor
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
        const off = (t * 60) % 60;
        for (let i = 0; i < 12; i++) {
          const y = 430 + i * 24 + off;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(384, y); ctx.stroke();
        }
        for (let i = -6; i <= 6; i++) {
          ctx.beginPath(); ctx.moveTo(192 + i * 16, 430); ctx.lineTo(192 + i * 120, 720); ctx.stroke();
        }
        // caption
        ctx.fillStyle = '#fff'; ctx.shadowColor = '#000'; ctx.shadowBlur = 6;
        ctx.font = 'bold 22px "Arial Black", Impact, sans-serif';
        ctx.fillText('wait for it…', 24, 600);
        ctx.font = '15px Helvetica'; ctx.fillText('@core.aesthetic · ♫ original audio', 24, 628);
        ctx.shadowBlur = 0;
        // right action rail
        const acts = ['♥', '💬', '↗', '⊕'];
        const counts = ['2.4M', '88K', '120K', ''];
        acts.forEach((gph, i) => {
          ctx.fillStyle = i === 0 ? '#ff2e6b' : '#fff'; ctx.font = '26px Helvetica'; ctx.textAlign = 'center';
          const pulse = i === 0 ? 1 + Math.sin(t * 6) * 0.08 : 1;
          ctx.save(); ctx.translate(348, 470 + i * 58); ctx.scale(pulse, pulse); ctx.fillText(gph, 0, 0); ctx.restore();
          ctx.font = '12px Helvetica'; ctx.fillText(counts[i], 348, 490 + i * 58);
          ctx.textAlign = 'left';
        });
        // progress
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, 712, 384, 8);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 712, ((t * 80) % 384), 8);
        tex.needsUpdate = true;
      },
    };
  }

  // 6 ── SYNTHETIC : generative latent space ──────────────────────────────────
  function synthetic() {
    const { c, ctx, tex } = makeCanvas(512, 512);
    const N = 90, pts = [];
    for (let i = 0; i < N; i++) pts.push({ x: Math.random() * 512, y: Math.random() * 512, p: Math.random() * 6.28 });
    return {
      texture: tex,
      update(t) {
        ctx.fillStyle = '#070d18'; ctx.fillRect(0, 0, 512, 512);
        // diffusing latent blobs
        for (let i = 0; i < N; i++) {
          const p = pts[i];
          const x = p.x + Math.sin(t * 0.7 + p.p) * 40;
          const y = p.y + Math.cos(t * 0.6 + p.p * 1.3) * 40;
          const r = 30 + Math.sin(t + p.p) * 20;
          const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
          const col = window.lerpColor('#8f7bff', '#ff7ad1', (Math.sin(p.p + t * 0.3) + 1) / 2).getStyle();
          grd.addColorStop(0, col.replace(')', ', 0.5)').replace('rgb', 'rgba'));
          grd.addColorStop(1, 'rgba(7,13,24,0)');
          ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
        }
        // prompt bar
        ctx.fillStyle = 'rgba(10,16,30,0.85)'; rr(ctx, 40, 410, 432, 64, 16); ctx.fill();
        ctx.strokeStyle = '#8f7bff'; ctx.lineWidth = 1.5; rr(ctx, 40, 410, 432, 64, 16); ctx.stroke();
        ctx.fillStyle = '#cfd2ff'; ctx.font = '18px "Space Grotesk", system-ui, sans-serif';
        const full = 'a cathedral made of light, 8k, ✨';
        const shown = full.slice(0, Math.floor((t * 6) % (full.length + 8)));
        ctx.fillText('▸ ' + shown + (Math.floor(t * 2) % 2 ? '▌' : ''), 60, 450);
        // generating shimmer
        ctx.fillStyle = '#8f7bff'; ctx.font = 'bold 16px "Space Grotesk", system-ui';
        ctx.fillText('GENERATING ' + (10 + Math.floor((t * 9) % 90)) + '%', 60, 360);
        tex.needsUpdate = true;
      },
    };
  }

  window.SCREENS = { dialup, wildweb, web2, feed, vertical, synthetic };
})();
