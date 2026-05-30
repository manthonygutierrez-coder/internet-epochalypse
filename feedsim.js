// ── "TIMELINE" — the early-2010s feed: pull-to-refresh, the like, infinite scroll ──
(function () {
  const CSS = `
  .tl-app { position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    background:radial-gradient(circle at 50% 25%, #14202e, #0a0f15 75%); font-family:-apple-system,'Segoe UI',Helvetica,sans-serif; padding:14px; }
  .tl-phone { width:min(320px,94vw); height:min(660px,88vh); background:#0c0f14; border-radius:34px; padding:10px;
    box-shadow:0 26px 70px rgba(0,0,0,.6), 0 0 0 2px #20242c, 0 0 0 8px #06080c; position:relative; }
  .tl-screen { position:absolute; inset:10px; border-radius:26px; overflow:hidden; background:#eef1f4; display:flex; flex-direction:column; }
  .tl-bar { flex:none; height:50px; background:#2e9bff; display:flex; align-items:center; justify-content:space-between; padding:0 16px;
    color:#fff; z-index:5; box-shadow:0 1px 0 rgba(0,0,0,.08); }
  .tl-bar .logo { font-weight:800; font-size:17px; letter-spacing:.2px; }
  .tl-bar .ic { font-size:16px; opacity:.92; }
  .tl-scroll { flex:1; overflow-y:auto; overflow-x:hidden; -webkit-overflow-scrolling:touch; position:relative; }
  .tl-refresh { height:0; overflow:hidden; display:flex; align-items:center; justify-content:center; color:#8b97a4; font-size:12px; font-weight:600;
    transition:height .25s; }
  .tl-refresh .spin { width:16px; height:16px; border:2px solid #c7d0d9; border-top-color:#2e9bff; border-radius:50%; margin-right:8px; }
  .tl-refresh.go .spin { animation:tlspin .7s linear infinite; }
  @keyframes tlspin { to { transform:rotate(360deg); } }
  .tl-card { background:#fff; margin:8px; border-radius:10px; box-shadow:0 1px 2px rgba(20,40,70,.12); overflow:hidden; }
  .tl-head { display:flex; align-items:center; gap:9px; padding:11px 12px 9px; }
  .tl-av { width:36px; height:36px; border-radius:50%; flex:none; }
  .tl-who { min-width:0; flex:1; }
  .tl-who b { display:block; font-size:13.5px; color:#1b2733; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .tl-who span { font-size:11px; color:#90a0ad; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; }
  .tl-cap { padding:0 12px 10px; font-size:13.5px; line-height:1.4; color:#243240; }
  .tl-photo { height:160px; position:relative; }
  .tl-photo .tag { position:absolute; left:10px; bottom:9px; color:#fff; font-size:34px; filter:drop-shadow(0 2px 6px rgba(0,0,0,.35)); }
  .tl-acts { display:flex; align-items:center; gap:20px; padding:9px 14px; border-top:1px solid #eef1f4; color:#8b97a4; font-size:13px; font-weight:600; }
  .tl-acts .a { display:flex; align-items:center; gap:6px; cursor:pointer; user-select:none; }
  .tl-acts .a .g { font-size:16px; transition:transform .15s; }
  .tl-acts .a.liked { color:#ff4d4f; }
  .tl-acts .a.rt { color:#46c46a; }
  .tl-acts .a:active .g { transform:scale(.8); }
  .tl-end { text-align:center; color:#9aa6b1; font-size:12px; padding:14px 0 22px; font-weight:600; }
  .tl-burst { position:absolute; z-index:40; pointer-events:none; color:#ff4d4f; font-size:46px; transform:translate(-50%,-50%); }
  .tl-tabs { flex:none; height:50px; background:#fff; border-top:1px solid #e2e7ec; display:flex; }
  .tl-tabs .t { flex:1; display:flex; align-items:center; justify-content:center; font-size:20px; color:#b6bec6; }
  .tl-tabs .t.on { color:#2e9bff; }
  .tl-help { position:absolute; bottom:-30px; left:0; right:0; text-align:center; color:#9fc4ea; font-size:11px; letter-spacing:.05em; }
  `;
  function ensureCSS() { if (!document.getElementById('tl-css')) { const s = document.createElement('style'); s.id = 'tl-css'; s.textContent = CSS; document.head.appendChild(s); } }

  const NAMES = ['jess_m', 'the_dave', 'photog.kate', 'nomad_sam', 'brunchbabe', 'mike.codes', 'wanderlust', 'retro_ron', 'citylights', 'plant.dad'];
  const CAPS = [
    'first post! 😎 #nofilter', 'brunch with the crew 🍳☕️', 'sunset never disappoints 🌅', 'new kicks who dis 👟',
    'throwback to summer ☀️ #tbt', 'coffee #2 of the day don\'t judge', 'finally framed this 🖼️', 'road trip!! 🚗💨',
    'caption this 😂', 'living my best life ✨', 'monday motivation 💪', 'puppy spam incoming 🐶',
  ];
  const PAIRS = [['#2e9bff', '#46c46a'], ['#ff9f1c', '#ff4d4f'], ['#7a5cff', '#2e9bff'], ['#ff4d4f', '#ff9f1c'],
                 ['#46c46a', '#16c0c8'], ['#ff5ec4', '#7a5cff'], ['#ffd400', '#ff9f1c'], ['#16c0c8', '#2e9bff']];
  const EMO = ['🌅', '🍕', '🐶', '🏔️', '🌮', '☕️', '🌊', '🚲', '🌸', '🍔', '🎸', '📸'];

  function build(root, api) {
    ensureCSS();
    const el = document.createElement('div'); el.className = 'tl-app';
    el.innerHTML = `
      <div class="tl-phone">
        <div class="tl-screen">
          <div class="tl-bar"><span class="logo">timeline</span><span class="ic">✉ &nbsp; ⚙</span></div>
          <div class="tl-scroll" id="tl-scroll">
            <div class="tl-refresh" id="tl-refresh"><span class="spin"></span><span id="tl-rtext">pull to refresh</span></div>
            <div id="tl-list"></div>
            <div class="tl-end">● you're all caught up ●</div>
          </div>
          <div class="tl-tabs"><span class="t on">⌂</span><span class="t">🔍</span><span class="t">✎</span><span class="t">🔔</span><span class="t">☰</span></div>
        </div>
      </div>
      <div class="tl-help">drag down at the top to refresh · double-tap a photo to ♥</div>`;
    root.appendChild(el);

    const scroll = el.querySelector('#tl-scroll');
    const list = el.querySelector('#tl-list');
    const refresh = el.querySelector('#tl-refresh');
    const rtext = el.querySelector('#tl-rtext');
    let seed = 7, count = 0;

    function fmt(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : '' + n; }
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

    function makeCard(prepend) {
      const i = count++;
      const name = NAMES[(rnd() * NAMES.length) | 0];
      const cap = CAPS[(rnd() * CAPS.length) | 0];
      const pair = PAIRS[(rnd() * PAIRS.length) | 0];
      const emo = EMO[(rnd() * EMO.length) | 0];
      const av = PAIRS[(rnd() * PAIRS.length) | 0];
      let likes = (rnd() * 900 | 0) + 12, rts = (rnd() * 60 | 0) + 1;
      const mins = (rnd() * 58 | 0) + 1;
      const c = document.createElement('div'); c.className = 'tl-card';
      c.innerHTML = `
        <div class="tl-head">
          <div class="tl-av" style="background:linear-gradient(135deg,${av[0]},${av[1]})"></div>
          <div class="tl-who"><b>${name}</b><span>${mins}m ago · 📍 nearby</span></div>
        </div>
        <div class="tl-cap">${cap}</div>
        <div class="tl-photo" style="background:linear-gradient(150deg,${pair[0]},${pair[1]})"><span class="tag">${emo}</span></div>
        <div class="tl-acts">
          <span class="a like"><span class="g">🤍</span><span class="n">${fmt(likes)}</span></span>
          <span class="a rt-btn"><span class="g">↺</span><span class="n">${fmt(rts)}</span></span>
          <span class="a"><span class="g">💬</span><span class="n">${(rnd()*40|0)+1}</span></span>
          <span class="a" style="margin-left:auto"><span class="g">↗</span></span>
        </div>`;
      let liked = false, rted = false;
      const likeBtn = c.querySelector('.like'), likeG = likeBtn.querySelector('.g'), likeN = likeBtn.querySelector('.n');
      function setLike(v, burstAt) {
        if (v === liked) { if (v) burst(burstAt); return; }
        liked = v; likeG.textContent = v ? '❤' : '🤍'; likeBtn.classList.toggle('liked', v);
        likes += v ? 1 : -1; likeN.textContent = fmt(likes);
        if (v) { window.AUDIO && AUDIO.sfx('heart'); burst(burstAt); } else window.AUDIO && AUDIO.sfx('back');
      }
      likeBtn.addEventListener('click', () => setLike(!liked));
      const rtBtn = c.querySelector('.rt-btn'), rtN = rtBtn.querySelector('.n');
      rtBtn.addEventListener('click', () => { rted = !rted; rtBtn.classList.toggle('rt', rted); rts += rted ? 1 : -1; rtN.textContent = fmt(rts); window.AUDIO && AUDIO.sfx(rted ? 'pop' : 'back'); });
      // double-tap photo to like
      const photo = c.querySelector('.tl-photo'); let last = 0;
      photo.addEventListener('click', (e) => { const now = Date.now(); if (now - last < 320) setLike(true, e); last = now; });

      if (prepend) list.insertBefore(c, list.firstChild); else list.appendChild(c);
    }
    function burst(e) {
      const pr = el.querySelector('.tl-phone').getBoundingClientRect();
      const b = document.createElement('div'); b.className = 'tl-burst'; b.textContent = '❤';
      const x = e && e.clientX ? e.clientX - pr.left : pr.width / 2;
      const y = e && e.clientY ? e.clientY - pr.top : pr.height / 2;
      b.style.left = x + 'px'; b.style.top = y + 'px';
      b.style.transition = 'transform .8s cubic-bezier(.2,1,.3,1), opacity .8s';
      b.style.transform = 'translate(-50%,-50%) scale(.4) rotate(-12deg)';
      el.querySelector('.tl-phone').appendChild(b);
      requestAnimationFrame(() => { b.style.transform = 'translate(-50%,-50%) scale(1.3) rotate(6deg) translateY(-30px)'; b.style.opacity = '0'; });
      setTimeout(() => b.remove(), 820);
    }

    // seed feed
    for (let i = 0; i < 5; i++) makeCard(false);

    // infinite scroll
    function onScroll() { if (scroll.scrollTop + scroll.clientHeight > scroll.scrollHeight - 240) { for (let i = 0; i < 2; i++) makeCard(false); } }
    scroll.addEventListener('scroll', onScroll, { passive: true });

    // pull to refresh
    let pulling = false, startY = 0, pull = 0, refreshing = false;
    function onDown(e) { if (refreshing || scroll.scrollTop > 2) return; pulling = true; startY = (e.touches ? e.touches[0].clientY : e.clientY); }
    function onMove(e) {
      if (!pulling) return;
      const y = (e.touches ? e.touches[0].clientY : e.clientY);
      pull = Math.max(0, y - startY);
      if (pull > 4) { if (e.cancelable) e.preventDefault(); }
      const h = Math.min(60, pull * 0.5);
      refresh.style.height = h + 'px';
      rtext.textContent = h >= 50 ? 'release to refresh' : 'pull to refresh';
    }
    function onUp() {
      if (!pulling) return; pulling = false;
      if (refresh.offsetHeight >= 50) {
        refreshing = true; refresh.classList.add('go'); refresh.style.height = '46px'; rtext.textContent = 'refreshing…';
        window.AUDIO && AUDIO.sfx('swipe');
        setTimeout(() => {
          for (let i = 0; i < 3; i++) makeCard(true);
          refresh.classList.remove('go'); refresh.style.height = '0px'; refreshing = false;
          scroll.scrollTop = 0; window.AUDIO && AUDIO.sfx('mail');
        }, 950);
      } else { refresh.style.height = '0px'; }
    }
    scroll.addEventListener('touchstart', onDown, { passive: true });
    scroll.addEventListener('touchmove', onMove, { passive: false });
    scroll.addEventListener('touchend', onUp);
    scroll.addEventListener('pointerdown', onDown);
    scroll.addEventListener('pointermove', onMove);
    scroll.addEventListener('pointerup', onUp);
    scroll.addEventListener('pointerleave', onUp);

    return () => {};
  }

  window.INTERACTIVES['feedsim'] = { title: 'Timeline', sub: 'PULL TO REFRESH', era: 3, build };
})();
