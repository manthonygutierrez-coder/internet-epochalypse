// ── "LATENT" — fake prompt → image generator that diffuses pics from noise ──
(function () {
  const CSS = `
  .syn-app { position:absolute; inset:0; display:flex; flex-direction:column; color:#eef0ff;
    background:radial-gradient(circle at 30% 10%,#1a2348,#070d18 75%); font-family:'Space Grotesk',sans-serif; }
  .syn-head { flex:none; padding:18px 24px 6px; }
  .syn-head h2 { font-size:15px; font-weight:500; letter-spacing:-.01em; }
  .syn-head h2 .b { background:linear-gradient(90deg,#8f7bff,#ff7ad1); -webkit-background-clip:text; background-clip:text; color:transparent; font-weight:700; }
  .syn-head p { font-size:12px; opacity:.55; margin-top:2px; }
  .syn-grid { flex:1; display:flex; flex-wrap:wrap; gap:16px; justify-content:center; align-content:center; padding:14px 24px; min-height:0; }
  .syn-tile { position:relative; aspect-ratio:1; height:calc(50% - 8px); flex:0 0 auto; border-radius:16px; overflow:hidden; background:#0b1224;
    border:1px solid rgba(143,123,255,.25); box-shadow:0 14px 40px rgba(0,0,0,.4); }
  .syn-tile canvas { width:100%; height:100%; display:block; }
  .syn-tile .pct { position:absolute; top:10px; left:12px; font-size:11px; font-weight:700; letter-spacing:.08em;
    color:#cfd2ff; text-shadow:0 1px 4px #000; }
  .syn-tile .pct.done { color:#7affc0; }
  .syn-tile .steps { position:absolute; bottom:10px; left:12px; right:12px; height:3px; border-radius:2px; background:rgba(255,255,255,.15); overflow:hidden; }
  .syn-tile .steps i { display:block; height:100%; width:0%; background:linear-gradient(90deg,#8f7bff,#ff7ad1); }
  .syn-tile .save { position:absolute; bottom:8px; right:8px; opacity:0; transition:.2s; cursor:pointer;
    background:rgba(10,16,30,.7); border:1px solid rgba(143,123,255,.4); border-radius:8px; padding:4px 9px; font-size:10px; font-weight:700; color:#cfd2ff; }
  .syn-tile.ready .save { opacity:1; }
  .syn-bar { flex:none; padding:14px 24px 18px; }
  .syn-chips { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:11px; }
  .syn-chips button { cursor:pointer; font-size:11px; border-radius:999px; padding:6px 12px; color:#cfd2ff;
    background:rgba(143,123,255,.1); border:1px solid rgba(143,123,255,.3); }
  .syn-chips button:hover { border-color:#8f7bff; color:#fff; }
  .syn-input { display:flex; gap:10px; }
  .syn-input .field { flex:1; display:flex; align-items:center; gap:10px; background:rgba(10,16,30,.7);
    border:1px solid rgba(143,123,255,.4); border-radius:14px; padding:4px 6px 4px 16px; }
  .syn-input .field::before { content:'▸'; color:#8f7bff; }
  .syn-input input { flex:1; background:none; border:none; color:#eef0ff; font-family:inherit; font-size:14px; padding:10px 0; }
  .syn-input input:focus { outline:none; }
  .syn-go { cursor:pointer; border:none; border-radius:12px; padding:0 22px; font-weight:700; font-size:13px; color:#0a0f1e;
    background:linear-gradient(90deg,#8f7bff,#ff7ad1); box-shadow:0 6px 20px rgba(143,123,255,.4); letter-spacing:.02em; }
  .syn-go:active { transform:translateY(1px); }
  .syn-go:disabled { opacity:.5; cursor:default; }
  `;
  function ensureCSS() { if (!document.getElementById('syn-css')) { const s = document.createElement('style'); s.id = 'syn-css'; s.textContent = CSS; document.head.appendChild(s); } }

  const PROMPTS = ['a cathedral made of light', 'vaporwave city at dusk', 'an astronaut koi fish, 8k', 'bioluminescent forest', 'liquid chrome flower', 'a lonely lighthouse on mars', 'crystalline jellyfish nebula'];
  // map keywords → palettes/shapes for the "rendered" target
  function paletteFor(prompt) {
    const p = prompt.toLowerCase();
    if (/cathedral|light|holy|gold/.test(p)) return { bg: ['#3a2a6a', '#0a0820'], glow: '#ffd98f', accent: '#fff', shape: 'arch' };
    if (/vaporwave|city|dusk|neon|retro/.test(p)) return { bg: ['#ff2e93', '#1a0838'], glow: '#16eaff', accent: '#ffd400', shape: 'grid' };
    if (/koi|fish|astronaut|space|ocean|sea/.test(p)) return { bg: ['#0a2a4a', '#06121f'], glow: '#46e0b0', accent: '#ff7a3a', shape: 'orbit' };
    if (/forest|bio|lumin|green|nature/.test(p)) return { bg: ['#06281f', '#04100c'], glow: '#7affc0', accent: '#b388ff', shape: 'spores' };
    if (/chrome|liquid|metal|flower/.test(p)) return { bg: ['#2a3050', '#0a0d1a'], glow: '#cfe0ff', accent: '#ff7ad1', shape: 'bloom' };
    if (/mars|lighthouse|red|desert/.test(p)) return { bg: ['#5a1a0a', '#1a0604'], glow: '#ffb000', accent: '#46e0b0', shape: 'tower' };
    return { bg: ['#3a1d6e', '#0a0420'], glow: '#b388ff', accent: '#8be9fd', shape: 'nebula' };
  }

  function build(root, api) {
    ensureCSS();
    const el = document.createElement('div'); el.className = 'syn-app';
    el.innerHTML = `
      <div class="syn-head"><h2>Type a prompt. Watch it <span class="b">diffuse from noise.</span></h2>
        <p>Four variations denoise in parallel — exactly like the real thing, only honest about being fake.</p></div>
      <div class="syn-grid" id="syn-grid"></div>
      <div class="syn-bar">
        <div class="syn-chips" id="syn-chips"></div>
        <div class="syn-input">
          <div class="field"><input id="syn-prompt" value="a cathedral made of light" maxlength="60"></div>
          <button class="syn-go" id="syn-go">✦ GENERATE</button>
        </div>
      </div>`;
    root.appendChild(el);

    const grid = el.querySelector('#syn-grid'); const promptI = el.querySelector('#syn-prompt'); const go = el.querySelector('#syn-go');
    const chips = el.querySelector('#syn-chips');
    PROMPTS.slice(0, 5).forEach((p) => { const b = document.createElement('button'); b.textContent = p; b.onclick = () => { promptI.value = p; generate(); }; chips.appendChild(b); });

    const tiles = [];
    for (let i = 0; i < 4; i++) {
      const t = document.createElement('div'); t.className = 'syn-tile';
      t.innerHTML = `<canvas width="300" height="300"></canvas><div class="pct">0%</div><div class="steps"><i></i></div><button class="save">↓ SAVE</button>`;
      grid.appendChild(t);
      tiles.push({ el: t, cv: t.querySelector('canvas'), pct: t.querySelector('.pct'), bar: t.querySelector('.steps i'), save: t.querySelector('.save') });
      t.querySelector('.save').onclick = () => { window.AUDIO && AUDIO.sfx('click'); t.querySelector('.save').textContent = '✓ SAVED'; };
    }

    let raf, generating = false;

    // render the "target" image for a prompt+seed onto an offscreen canvas
    function renderTarget(prompt, seed) {
      const pal = paletteFor(prompt); const oc = document.createElement('canvas'); oc.width = oc.height = 300; const x = oc.getContext('2d');
      let s = seed; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      const g = x.createLinearGradient(0, 0, 300, 300); g.addColorStop(0, pal.bg[0]); g.addColorStop(1, pal.bg[1]);
      x.fillStyle = g; x.fillRect(0, 0, 300, 300);
      // glow field
      for (let i = 0; i < 5; i++) { const gx = rnd() * 300, gy = rnd() * 300, r = 60 + rnd() * 120; const rg = x.createRadialGradient(gx, gy, 0, gx, gy, r);
        rg.addColorStop(0, pal.glow + '88'); rg.addColorStop(1, 'transparent'); x.fillStyle = rg; x.beginPath(); x.arc(gx, gy, r, 0, 7); x.fill(); }
      x.save();
      if (pal.shape === 'arch') { x.fillStyle = pal.glow; for (let i = 0; i < 4; i++) { const ax = 60 + i * 60; x.globalAlpha = .5 - i * .08; x.beginPath(); x.moveTo(ax, 280); x.lineTo(ax, 140); x.arc(ax + 30, 140, 30, Math.PI, 0); x.lineTo(ax + 60, 280); x.fill(); } }
      else if (pal.shape === 'grid') { x.strokeStyle = pal.glow; x.lineWidth = 1.5; x.globalAlpha = .7; for (let i = 0; i < 14; i++) { const y = 170 + i * (i * 1.2); x.beginPath(); x.moveTo(0, y); x.lineTo(300, y); x.stroke(); } for (let i = -6; i <= 6; i++) { x.beginPath(); x.moveTo(150 + i * 10, 170); x.lineTo(150 + i * 90, 300); x.stroke(); } x.globalAlpha = 1; x.fillStyle = pal.accent; x.beginPath(); x.arc(150, 130, 50, 0, 7); x.fill(); }
      else if (pal.shape === 'orbit') { x.fillStyle = pal.accent; x.beginPath(); x.ellipse(150, 150, 46, 28, rnd(), 0, 7); x.fill(); x.strokeStyle = pal.glow; x.lineWidth = 3; for (let i = 0; i < 3; i++) { x.globalAlpha = .6; x.beginPath(); x.ellipse(150, 150, 70 + i * 26, 34 + i * 12, i * .7, 0, 7); x.stroke(); } }
      else if (pal.shape === 'tower') { x.fillStyle = pal.accent; x.fillRect(132, 120, 36, 160); x.beginPath(); x.moveTo(126, 120); x.lineTo(174, 120); x.lineTo(150, 80); x.fill(); x.fillStyle = pal.glow; x.beginPath(); x.arc(150, 120, 16, 0, 7); x.fill(); }
      else { x.fillStyle = pal.accent; for (let i = 0; i < 22; i++) { x.globalAlpha = .4 + rnd() * .5; const r = 6 + rnd() * 34; x.beginPath(); x.arc(rnd() * 300, rnd() * 300, r, 0, 7); x.fill(); } }
      x.restore();
      return oc;
    }

    function generate() {
      if (generating) return; generating = true; go.disabled = true; window.AUDIO && AUDIO.sfx('gen');
      const prompt = promptI.value || 'an image';
      const jobs = tiles.map((tile, i) => {
        const target = renderTarget(prompt, (Date.now() % 99999) + i * 7919);
        tile.el.classList.remove('ready'); tile.save.textContent = '↓ SAVE';
        return { tile, target, prog: 0, speed: 0.6 + Math.random() * 0.5 + i * 0.05 };
      });
      cancelAnimationFrame(raf);
      (function step() {
        let allDone = true;
        jobs.forEach((j) => {
          if (j.prog < 100) { allDone = false; j.prog = Math.min(100, j.prog + j.speed); }
          const ctx = j.tile.cv.getContext('2d'); const p = j.prog / 100;
          // draw denoising: target gets sharper + noise overlay fades
          ctx.save();
          const blur = (1 - p) * 14; ctx.filter = 'blur(' + blur.toFixed(1) + 'px)';
          ctx.drawImage(j.target, 0, 0, 300, 300); ctx.filter = 'none';
          // noise overlay (decreasing)
          if (p < 1) {
            const n = ctx.getImageData(0, 0, 300, 300); const d = n.data; const amt = (1 - p) * 255;
            for (let k = 0; k < d.length; k += 4) { if (Math.random() < (1 - p) * 0.8) { const v = (Math.random() - 0.5) * amt; d[k] += v; d[k+1] += v; d[k+2] += v; } }
            ctx.putImageData(n, 0, 0);
          }
          ctx.restore();
          j.tile.pct.textContent = Math.round(j.prog) + '%'; j.tile.bar.style.width = j.prog + '%';
          if (j.prog >= 100) { j.tile.pct.textContent = '✓ DONE'; j.tile.pct.classList.add('done'); j.tile.el.classList.add('ready'); }
        });
        if (!allDone) raf = requestAnimationFrame(step);
        else { generating = false; go.disabled = false; window.AUDIO && AUDIO.sfx('mail'); }
      })();
    }
    go.onclick = generate;
    promptI.addEventListener('keydown', (e) => { if (e.key === 'Enter') generate(); });

    generate();
    return () => cancelAnimationFrame(raf);
  }

  window.INTERACTIVES['synth'] = { title: 'Latent', sub: 'IMAGE GENERATOR', era: 5, build };
})();
