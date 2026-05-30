// ── "MAKE-A-SPACE" — build-your-own MySpace profile (Top 8 + glittery CSS) ──
(function () {
  const CSS = `
  .ms-app { position:absolute; inset:0; display:grid; grid-template-columns:236px 1fr; background:#1a2a44;
    font-family:Tahoma,'Lucida Grande',sans-serif; color:#eaf2ff; }
  .ms-panel { background:#0e1a2e; border-right:1px solid #24405f; padding:14px; overflow:auto; }
  .ms-panel h3 { font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:#5aa6ff; margin:14px 0 7px; }
  .ms-panel h3:first-child { margin-top:0; }
  .ms-field { margin-bottom:8px; }
  .ms-field label { display:block; font-size:10px; opacity:.6; margin-bottom:3px; }
  .ms-field input, .ms-field textarea { width:100%; background:#0a1424; border:1px solid #2a4868; color:#eaf2ff;
    border-radius:5px; padding:6px 8px; font-family:inherit; font-size:12px; }
  .ms-field textarea { resize:none; height:46px; }
  .ms-themes { display:grid; grid-template-columns:repeat(2,1fr); gap:6px; }
  .ms-themes button { cursor:pointer; border:2px solid transparent; border-radius:6px; padding:8px 4px; font-size:10px; font-weight:700;
    color:#fff; text-shadow:0 1px 2px #000; }
  .ms-themes button.on { border-color:#fff; box-shadow:0 0 10px rgba(255,255,255,.5); }
  .ms-top8 { display:grid; grid-template-columns:1fr 1fr; gap:5px; }
  .ms-top8 input { font-size:11px; padding:4px 6px; }
  .ms-toggle { display:flex; align-items:center; gap:7px; font-size:11px; margin-bottom:6px; cursor:pointer; }
  /* preview */
  .ms-preview { overflow:auto; position:relative; }
  .ms-pv { min-height:100%; padding:18px; }
  .ms-pv-card { max-width:620px; margin:0 auto; background:#fff; color:#000; border:1px solid #99a; }
  .ms-pv-head { padding:10px 14px; font-weight:700; font-size:20px; border-bottom:2px solid; }
  .ms-pv-cols { display:grid; grid-template-columns:170px 1fr; gap:12px; padding:14px; }
  .ms-pic { width:160px; height:160px; border:1px solid #888; background:#dde6f0; display:flex; align-items:center; justify-content:center; font-size:54px; }
  .ms-contact { margin-top:8px; border:1px solid #ccc; }
  .ms-contact .t { font-weight:700; padding:4px 8px; color:#fff; font-size:11px; }
  .ms-contact .b { display:grid; grid-template-columns:1fr 1fr; gap:4px; padding:8px; font-size:11px; }
  .ms-blurb h4 { font-size:13px; border-bottom:1px solid; padding-bottom:3px; margin:0 0 6px; }
  .ms-blurb p { font-size:12px; line-height:1.5; margin:0 0 12px; }
  .ms-glitter { font-weight:800; font-size:22px; }
  .ms-top8grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:6px; }
  .ms-friend { text-align:center; font-size:10px; }
  .ms-friend .av { height:60px; border:1px solid #aaa; background:#cdd8ea; display:flex; align-items:center; justify-content:center; font-size:24px; }
  .ms-spark { position:absolute; width:10px; height:10px; pointer-events:none; z-index:9; transform:translate(-50%,-50%); }
  .ms-jam { display:inline-flex; align-items:center; gap:6px; cursor:pointer; border:none; border-radius:4px; padding:5px 10px; font-size:11px; font-weight:700; color:#fff; }
  `;
  function ensureCSS() { if (!document.getElementById('ms-css')) { const s = document.createElement('style'); s.id = 'ms-css'; s.textContent = CSS; document.head.appendChild(s); } }

  const THEMES = {
    sparkle: { name: '✨ Sparkle', bg: 'repeating-linear-gradient(45deg,#ff9ee0 0 14px,#ffd6f3 14px 28px)', card: '#fff', head: '#ff2e93', link: '#d6008c', text: '#3a0030', font: "'Comic Sans MS',cursive", glitter: ['#ff2e93', '#ffd400', '#16eaff'] },
    emo: { name: '🖤 Emo', bg: 'radial-gradient(circle at 50% 0,#2a0d2e,#050007)', card: '#120015', head: '#ff0044', link: '#ff5e8a', text: '#e7c6ff', font: 'Verdana,sans-serif', glitter: ['#ff0044', '#9b30ff', '#ffffff'] },
    matrix: { name: '💚 Matrix', bg: '#000', card: '#021006', head: '#00ff66', link: '#5dff9b', text: '#9dffc0', font: "'Courier New',monospace", glitter: ['#00ff66', '#9dffc0', '#ffffff'] },
    galaxy: { name: '🌌 Galaxy', bg: 'radial-gradient(circle at 30% 20%,#3a1d6e,#0a0420 70%)', card: '#160a33', head: '#b388ff', link: '#8be9fd', text: '#e6dcff', font: 'Georgia,serif', glitter: ['#b388ff', '#8be9fd', '#ff79c6'] },
    y2k: { name: '🦋 Y2K', bg: 'linear-gradient(135deg,#7fdfff,#c8a8ff,#ffb3e6)', card: '#fff', head: '#0066ff', link: '#0066ff', text: '#102040', font: 'Tahoma,sans-serif', glitter: ['#00ccff', '#ff66cc', '#ffcc00'] },
    fire: { name: '🔥 Inferno', bg: 'linear-gradient(#1a0500,#3a0a00)', card: '#1c0700', head: '#ff7a00', link: '#ffb000', text: '#ffd9a8', font: "'Impact',sans-serif", glitter: ['#ff7a00', '#ffd400', '#ff2e00'] },
  };

  function build(root, api) {
    ensureCSS();
    const el = document.createElement('div'); el.className = 'ms-app';
    el.innerHTML = `
      <div class="ms-panel">
        <h3>Theme</h3>
        <div class="ms-themes" id="ms-themes"></div>
        <h3>Identity</h3>
        <div class="ms-field"><label>display name</label><input id="ms-name" value="xX_dial_up_dreamer_Xx" maxlength="28"></div>
        <div class="ms-field"><label>mood</label><input id="ms-mood" value="✨ vibin ✨" maxlength="22"></div>
        <div class="ms-field"><label>headline (glitter)</label><input id="ms-head" value="welcome 2 my page!!1" maxlength="30"></div>
        <div class="ms-field"><label>about me</label><textarea id="ms-about" maxlength="180">hi im online ALL the time lol. add me!! music is my life &amp; so r my friendz &lt;3 no drama plz</textarea></div>
        <h3>Extras</h3>
        <label class="ms-toggle"><input type="checkbox" id="ms-spark" checked> sparkle cursor trail</label>
        <label class="ms-toggle"><input type="checkbox" id="ms-blink" checked> blinking glitter headline</label>
        <button class="ms-jam" id="ms-jam" style="background:#2f7ff0">▶ play my jam</button>
        <h3>Top 8 Friends</h3>
        <div class="ms-top8" id="ms-top8"></div>
      </div>
      <div class="ms-preview" id="ms-preview">
        <div class="ms-pv" id="ms-pv"></div>
      </div>`;
    root.appendChild(el);

    const themesWrap = el.querySelector('#ms-themes');
    let theme = 'sparkle', glitterPhase = 0, raf, jamOn = false;
    const top8 = ['tom', 'bestie4lyf', 'ur_crush', 'band_acct', 'cousin_jay', 'lol_random', 'photographer', 'the_squad'];

    Object.keys(THEMES).forEach((k) => {
      const t = THEMES[k]; const b = document.createElement('button'); b.textContent = t.name;
      b.style.background = t.bg.includes('gradient') || t.bg.includes('repeating') ? t.bg : t.bg;
      b.onclick = () => { theme = k; window.AUDIO && AUDIO.sfx('select'); syncThemeBtns(); render(); };
      b.dataset.k = k; themesWrap.appendChild(b);
    });
    function syncThemeBtns() { [...themesWrap.children].forEach((b) => b.classList.toggle('on', b.dataset.k === theme)); }

    const t8wrap = el.querySelector('#ms-top8');
    top8.forEach((n, i) => { const inp = document.createElement('input'); inp.value = n; inp.maxLength = 16;
      inp.oninput = () => { top8[i] = inp.value; render(); }; t8wrap.appendChild(inp); });

    const pv = el.querySelector('#ms-pv'), preview = el.querySelector('#ms-preview');
    const $ = (id) => el.querySelector(id);
    ['#ms-name', '#ms-mood', '#ms-head', '#ms-about'].forEach((id) => $(id).addEventListener('input', render));
    $('#ms-blink').addEventListener('change', render);

    function render() {
      const t = THEMES[theme];
      const name = $('#ms-name').value, mood = $('#ms-mood').value, head = $('#ms-head').value, about = $('#ms-about').value;
      preview.style.background = t.bg;
      const av = ['😎', '🎸', '💀', '🦋', '⭐', '👽', '📷', '🐱'];
      pv.innerHTML = `
        <div class="ms-pv-card" style="background:${t.card};font-family:${t.font};color:${t.text}">
          <div class="ms-pv-head" style="color:${t.head};border-color:${t.head}">${esc(name)}
            <div style="font-size:12px;font-weight:400;color:${t.text}">"${esc(mood)}" &nbsp;·&nbsp; <span style="color:${t.link}">● online now</span></div></div>
          <div style="text-align:center;padding:8px 0 0"><span class="ms-glitter" id="ms-glit" style="font-family:${t.font}">${esc(head)}</span></div>
          <div class="ms-pv-cols">
            <div>
              <div class="ms-pic">📷</div>
              <div class="ms-contact"><div class="t" style="background:${t.head}">Contacting ${esc(name).slice(0,10)}</div>
                <div class="b" style="color:${t.link}">▸ Add Friend<br>▸ Send Message<br>▸ Add to Group<br>▸ Block User<br>▸ Add to Faves<br>▸ Rank User</div></div>
            </div>
            <div class="ms-blurb">
              <h4 style="color:${t.head};border-color:${t.head}">About Me</h4>
              <p>${esc(about)}</p>
              <h4 style="color:${t.head};border-color:${t.head}">${esc(name).slice(0,12)}'s Top 8</h4>
              <div class="ms-top8grid">
                ${top8.map((f, i) => `<div class="ms-friend"><div class="av">${av[i % av.length]}</div><span style="color:${t.link}">${esc(f)}</span></div>`).join('')}
              </div>
            </div>
          </div>
        </div>`;
      syncThemeBtns();
    }
    function esc(s) { return (s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])); }

    // glitter headline
    function glitLoop() {
      glitterPhase++;
      const g = el.querySelector('#ms-glit'); const t = THEMES[theme];
      if (g) {
        if ($('#ms-blink').checked) { g.style.color = t.glitter[Math.floor(glitterPhase / 8) % t.glitter.length]; g.style.textShadow = '0 0 8px ' + t.glitter[Math.floor(glitterPhase / 5) % t.glitter.length]; }
        else { g.style.color = t.head; g.style.textShadow = 'none'; }
      }
      raf = requestAnimationFrame(glitLoop);
    }

    // sparkle cursor trail (inside preview)
    function onMove(e) {
      if (!$('#ms-spark').checked) return;
      if (Math.random() > 0.5) return;
      const r = preview.getBoundingClientRect();
      const s = document.createElement('div'); s.className = 'ms-spark';
      s.textContent = ['✦', '✧', '⋆', '✨', '⭐'][Math.random() * 5 | 0];
      s.style.left = (e.clientX - r.left + preview.scrollLeft) + 'px'; s.style.top = (e.clientY - r.top + preview.scrollTop) + 'px';
      s.style.color = THEMES[theme].glitter[Math.random() * 3 | 0]; s.style.fontSize = (8 + Math.random() * 10) + 'px';
      s.style.transition = 'transform .8s, opacity .8s'; preview.appendChild(s);
      requestAnimationFrame(() => { s.style.transform = 'translate(-50%,-50%) translateY(20px) scale(0)'; s.style.opacity = '0'; });
      setTimeout(() => s.remove(), 820);
    }
    preview.addEventListener('mousemove', onMove);

    $('#ms-jam').onclick = () => {
      jamOn = !jamOn; $('#ms-jam').innerHTML = jamOn ? '♫ now playing: ur fav jam' : '▶ play my jam';
      $('#ms-jam').style.background = jamOn ? THEMES[theme].head : '#2f7ff0';
      if (jamOn && window.AUDIO) { ['pop', 'click', 'pop', 'select'].forEach((c, i) => setTimeout(() => AUDIO.sfx(c), i * 130)); }
    };

    theme = 'sparkle'; render(); glitLoop();
    return () => { cancelAnimationFrame(raf); preview.removeEventListener('mousemove', onMove); };
  }

  window.INTERACTIVES['myspace'] = { title: 'Make-A-Space', sub: 'PROFILE BUILDER', era: 2, build };
})();
