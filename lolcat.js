// ── "I CAN HAS MEMES?" — a rotoscopic slide projector beaming lolcat memes ──
(function () {
  const CSS = `
  .lol-app { position:absolute; inset:0; display:flex; flex-direction:column;
    background:radial-gradient(circle at 70% 20%, #16304e, #050d16 75%); font-family:'Lucida Grande',Helvetica,sans-serif; color:#dce8f7; }
  .lol-stage { flex:1; display:flex; align-items:center; gap:0; padding:18px 26px; min-height:0; }
  .lol-projector { position:relative; width:150px; flex:none; }
  .lol-tray { width:96px; height:96px; border-radius:50%; background:repeating-conic-gradient(#3a4250 0 30deg,#2a3038 30deg 60deg);
    margin:0 auto 8px; box-shadow:inset 0 0 0 6px #232830, 0 6px 14px rgba(0,0,0,.5); transition:transform .5s cubic-bezier(.2,1.4,.4,1); }
  .lol-body { width:130px; height:62px; border-radius:10px; margin:0 auto;
    background:linear-gradient(#454e5c,#2c333d); box-shadow:0 8px 18px rgba(0,0,0,.5), inset 0 2px 0 rgba(255,255,255,.2); position:relative; }
  .lol-lens { position:absolute; right:-14px; top:18px; width:28px; height:28px; border-radius:50%;
    background:radial-gradient(circle at 40% 35%, #cfe6ff, #2a4a6a); box-shadow:0 0 16px rgba(120,200,255,.6); }
  .lol-beam { position:absolute; left:128px; top:30px; width:0; height:0; z-index:0; pointer-events:none;
    border-top:120px solid transparent; border-bottom:120px solid transparent; border-left:240px solid rgba(180,220,255,.10);
    filter:blur(2px); animation:lolflick 2.6s infinite; }
  @keyframes lolflick { 0%,100%{opacity:.85;} 47%{opacity:.7;} 50%{opacity:1;} 73%{opacity:.78;} }
  .lol-screenwrap { flex:1; display:flex; align-items:center; justify-content:center; min-width:0; z-index:1; }
  .lol-screen { background:#0c0c0c; padding:12px; border-radius:3px; box-shadow:0 0 0 8px #f4f0e6, 0 0 0 10px #b9b2a0, 0 26px 50px rgba(0,0,0,.6); }
  .lol-canvas { display:block; width:min(46vh,420px); height:auto; aspect-ratio:4/3; border-radius:1px; }
  .lol-controls { flex:none; display:flex; gap:14px; align-items:center; flex-wrap:wrap; padding:14px 26px;
    border-top:1px solid rgba(255,255,255,.1); background:rgba(8,18,30,.6); }
  .lol-controls .grp { display:flex; flex-direction:column; gap:4px; }
  .lol-controls label { font-size:9px; letter-spacing:.16em; text-transform:uppercase; opacity:.6; }
  .lol-controls input[type=text]{ width:200px; background:#0e1a28; border:1px solid #2a4258; color:#eaf2fc; border-radius:6px;
    padding:8px 10px; font-family:inherit; font-size:13px; }
  .lol-controls input:focus{ outline:none; border-color:#46e0b0; }
  .lol-btn { cursor:pointer; border:none; border-radius:999px; padding:9px 15px; font-weight:700; font-size:12px; letter-spacing:.04em;
    background:linear-gradient(#5aa6ff,#2f7ff0); color:#fff; box-shadow:inset 0 1px 0 rgba(255,255,255,.5), 0 3px 8px rgba(0,0,0,.4); }
  .lol-btn:active { transform:translateY(1px); }
  .lol-btn.ghost { background:#1b2a3a; color:#cfe0f2; box-shadow:none; border:1px solid #2f4a64; }
  .lol-poses { display:flex; gap:6px; }
  .lol-poses button { width:34px; height:34px; border-radius:8px; border:1px solid #2f4a64; background:#0e1a28; cursor:pointer; font-size:18px; }
  .lol-poses button.on { border-color:#46e0b0; box-shadow:0 0 10px rgba(70,224,176,.5); }
  `;
  function ensureCSS() { if (!document.getElementById('lol-css')) { const s = document.createElement('style'); s.id = 'lol-css'; s.textContent = CSS; document.head.appendChild(s); } }

  // posterized projector palette (warm film)
  const FUR = ['#3a2c1e', '#6e5638', '#a98a5e', '#d8c39a'];
  const POSES = [
    { e: '🐱', top: 'I CAN HAS', bot: 'CHEEZBURGER?', draw: 'sit' },
    { e: '😺', top: 'INVISIBLE BIKE', bot: '', draw: 'invis' },
    { e: '🙀', top: 'CEILING CAT', bot: 'IS WATCHING U', draw: 'ceiling' },
    { e: '😼', top: 'MONORAIL CAT', bot: 'CHOO CHOO', draw: 'loaf' },
  ];
  const LOLZ = [
    ['I CAN HAS', 'CHEEZBURGER?'], ['IM IN UR FRIDGE', 'EATIN UR FOODZ'],
    ['DO NOT WANT', ''], ['OH HAI', 'I MADE U A COOKIE'], ['LONGCAT', 'IS LOOOONG'],
    ['HALP', 'IM TRAPPED'], ['SRSLY?', 'SRSLY.'], ['BUCKET', 'OF... WAT'],
  ];

  function build(root, api) {
    ensureCSS();
    const el = document.createElement('div'); el.className = 'lol-app';
    el.innerHTML = `
      <div class="lol-stage">
        <div class="lol-projector">
          <div class="lol-tray"></div>
          <div class="lol-body"><div class="lol-lens"></div></div>
        </div>
        <div class="lol-beam"></div>
        <div class="lol-screenwrap"><div class="lol-screen"><canvas class="lol-canvas" width="480" height="360"></canvas></div></div>
      </div>
      <div class="lol-controls">
        <div class="lol-poses"></div>
        <div class="grp"><label>top text</label><input type="text" id="lol-top" maxlength="22"></div>
        <div class="grp"><label>bottom text</label><input type="text" id="lol-bot" maxlength="22"></div>
        <button class="lol-btn ghost" id="lol-rand">🎲 I CAN HAS RANDOM</button>
        <button class="lol-btn ghost" id="lol-prev">◀</button>
        <button class="lol-btn" id="lol-next">ADVANCE ▶ <span style="opacity:.7">ka-chunk</span></button>
      </div>`;
    root.appendChild(el);

    const cv = el.querySelector('.lol-canvas'); const ctx = cv.getContext('2d');
    const topI = el.querySelector('#lol-top'), botI = el.querySelector('#lol-bot');
    const tray = el.querySelector('.lol-tray'), posesWrap = el.querySelector('.lol-poses');
    let idx = 0, trayRot = 0, anim = 0, raf;

    POSES.forEach((p, i) => { const b = document.createElement('button'); b.textContent = p.e; b.onclick = () => setSlide(i, true); posesWrap.appendChild(b); });
    function refreshPoses() { [...posesWrap.children].forEach((b, i) => b.classList.toggle('on', i === idx)); }

    function drawCat(pose) {
      const cx = 240, cy = 215;
      // background grade
      const g = ctx.createRadialGradient(cx, 160, 40, cx, 200, 320); g.addColorStop(0, '#d9cba6'); g.addColorStop(1, '#7c6a4a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 480, 360);
      ctx.save();
      // body
      const breathe = Math.sin(anim * 0.05) * 3;
      ctx.fillStyle = FUR[1];
      if (pose === 'loaf') { ctx.beginPath(); ctx.ellipse(cx, cy + 20, 120, 64, 0, 0, 7); ctx.fill(); }
      else { ctx.beginPath(); ctx.ellipse(cx, cy + 60 + breathe, 80, 84, 0, 0, 7); ctx.fill(); }
      // head
      ctx.fillStyle = FUR[2]; ctx.beginPath(); ctx.arc(cx, cy - 20 + breathe, 72, 0, 7); ctx.fill();
      // ears
      ctx.fillStyle = FUR[1];
      ctx.beginPath(); ctx.moveTo(cx - 64, cy - 60); ctx.lineTo(cx - 30, cy - 96); ctx.lineTo(cx - 18, cy - 56); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 64, cy - 60); ctx.lineTo(cx + 30, cy - 96); ctx.lineTo(cx + 18, cy - 56); ctx.fill();
      ctx.fillStyle = '#caa3a8';
      ctx.beginPath(); ctx.moveTo(cx - 52, cy - 64); ctx.lineTo(cx - 34, cy - 84); ctx.lineTo(cx - 28, cy - 60); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 52, cy - 64); ctx.lineTo(cx + 34, cy - 84); ctx.lineTo(cx + 28, cy - 60); ctx.fill();
      // eyes
      const wide = pose === 'ceiling' || pose === 'invis';
      ctx.fillStyle = FUR[3]; ctx.beginPath(); ctx.arc(cx - 26, cy - 26 + breathe, wide ? 22 : 18, 0, 7); ctx.arc(cx + 26, cy - 26 + breathe, wide ? 22 : 18, 0, 7); ctx.fill();
      ctx.fillStyle = FUR[0]; const pup = wide ? 9 : 13;
      ctx.beginPath(); ctx.arc(cx - 26, cy - 26 + breathe, pup, 0, 7); ctx.arc(cx + 26, cy - 26 + breathe, pup, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx - 30, cy - 30 + breathe, 3, 0, 7); ctx.arc(cx + 22, cy - 30 + breathe, 3, 0, 7); ctx.fill();
      // nose + mouth
      ctx.fillStyle = '#b5727f'; ctx.beginPath(); ctx.moveTo(cx, cy - 2 + breathe); ctx.lineTo(cx - 7, cy - 9 + breathe); ctx.lineTo(cx + 7, cy - 9 + breathe); ctx.fill();
      ctx.strokeStyle = FUR[0]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy - 2 + breathe); ctx.lineTo(cx, cy + 6 + breathe);
      ctx.arc(cx - 9, cy + 6 + breathe, 9, 0, Math.PI); ctx.moveTo(cx, cy + 6 + breathe); ctx.arc(cx + 9, cy + 6 + breathe, 9, 0, Math.PI); ctx.stroke();
      // whiskers
      ctx.lineWidth = 1.5;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(cx - 14, cy + 2 + i * 8 + breathe); ctx.lineTo(cx - 90, cy - 6 + i * 16 + breathe); ctx.moveTo(cx + 14, cy + 2 + i * 8 + breathe); ctx.lineTo(cx + 90, cy - 6 + i * 16 + breathe); ctx.stroke(); }
      if (pose === 'invis') { ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(cx - 70, cy + 120, 38, 0, 7); ctx.arc(cx + 70, cy + 120, 38, 0, 7); ctx.moveTo(cx - 70, cy + 82); ctx.lineTo(cx + 70, cy + 82); ctx.stroke(); }
      ctx.restore();
    }

    function rotoscope() {
      // scanlines + grain + warm vignette + dust flicker
      const id = ctx.getImageData(0, 0, 480, 360); const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        // posterize to 4 bands
        d[i] = Math.round(d[i] / 64) * 64; d[i + 1] = Math.round(d[i + 1] / 64) * 64; d[i + 2] = Math.round(d[i + 2] / 64) * 64;
        if (Math.random() < 0.02) { const n = (Math.random() - 0.5) * 80; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      }
      ctx.putImageData(id, 0, 0);
      ctx.fillStyle = 'rgba(0,0,0,0.10)'; for (let y = 0; y < 360; y += 3) ctx.fillRect(0, y, 480, 1);
      const v = ctx.createRadialGradient(240, 180, 120, 240, 180, 320); v.addColorStop(0, 'rgba(255,240,200,0)'); v.addColorStop(1, 'rgba(20,8,0,.55)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, 480, 360);
      if (Math.random() < 0.06) { ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(0, 0, 480, 360); }
    }

    function caption() {
      const top = (topI.value || '').toUpperCase(), bot = (botI.value || '').toUpperCase();
      ctx.font = '900 42px Impact, "Arial Black", sans-serif'; ctx.textAlign = 'center';
      ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = '#000'; ctx.fillStyle = '#fff';
      if (top) { ctx.strokeText(top, 240, 54); ctx.fillText(top, 240, 54); }
      if (bot) { ctx.strokeText(bot, 240, 336); ctx.fillText(bot, 240, 336); }
      ctx.textAlign = 'left';
    }

    function frame() { anim++; drawCat(POSES[idx].draw); rotoscope(); caption(); raf = requestAnimationFrame(frame); }

    function setSlide(i, advance) {
      idx = (i + POSES.length) % POSES.length;
      topI.value = POSES[idx].top; botI.value = POSES[idx].bot;
      if (advance) { trayRot += 90; tray.style.transform = 'rotate(' + trayRot + 'deg)'; window.AUDIO && AUDIO.sfx('shutter'); }
      refreshPoses();
    }

    el.querySelector('#lol-next').onclick = () => setSlide(idx + 1, true);
    el.querySelector('#lol-prev').onclick = () => setSlide(idx - 1, true);
    el.querySelector('#lol-rand').onclick = () => { const l = LOLZ[Math.random() * LOLZ.length | 0]; topI.value = l[0]; botI.value = l[1]; window.AUDIO && AUDIO.sfx('click'); };

    setSlide(0, false); frame();
    return () => cancelAnimationFrame(raf);
  }

  window.INTERACTIVES['lolcat'] = { title: 'I Can Has Memes?', sub: 'LOLCAT PROJECTOR', era: 2, build };
})();
