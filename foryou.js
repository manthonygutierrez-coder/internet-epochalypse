// ── "FOR YOU" — endless vertical feed with TikTok-style transitions ──
(function () {
  const CSS = `
  .fy-app { position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
    background:radial-gradient(circle at 50% 30%,#2a0a3e,#0a0418 75%); font-family:'Archivo','Arial Black',sans-serif; }
  .fy-phone { width:300px; height:min(640px,86vh); background:#000; border-radius:36px; padding:9px;
    box-shadow:0 26px 70px rgba(0,0,0,.6), 0 0 0 2px #2a2a32, 0 0 0 8px #0c0c12; position:relative; }
  .fy-viewport { position:absolute; inset:9px; border-radius:28px; overflow:hidden; background:#000; }
  .fy-notch { position:absolute; top:9px; left:50%; transform:translateX(-50%); width:96px; height:22px; background:#000; border-radius:0 0 14px 14px; z-index:30; }
  .fy-item { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end;
    overflow:hidden; will-change:transform,opacity,filter; }
  .fy-item .bigtext { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; flex-direction:column;
    text-align:center; padding:0 26px; }
  .fy-item .bigtext .emoji { font-size:78px; filter:drop-shadow(0 6px 18px rgba(0,0,0,.5)); animation:fybob 2.4s ease-in-out infinite; }
  @keyframes fybob { 50%{ transform:translateY(-10px) rotate(-4deg);} }
  .fy-item .bigtext .punch { font-size:30px; font-weight:900; color:#fff; text-shadow:0 3px 14px rgba(0,0,0,.6); line-height:1.05; margin-top:14px; letter-spacing:-.5px; }
  .fy-tabs { position:absolute; top:34px; left:0; right:0; display:flex; gap:18px; justify-content:center; z-index:20;
    font-size:13px; font-weight:800; color:rgba(255,255,255,.55); }
  .fy-tabs .on { color:#fff; } .fy-tabs .on::after { content:''; display:block; height:3px; background:#fff; border-radius:2px; margin-top:4px; }
  .fy-meta { position:relative; z-index:10; padding:0 64px 18px 16px; color:#fff; }
  .fy-meta .user { font-weight:800; font-size:15px; text-shadow:0 1px 6px rgba(0,0,0,.6); }
  .fy-meta .cap { font-size:13px; font-weight:500; line-height:1.35; margin-top:5px; text-shadow:0 1px 6px rgba(0,0,0,.6); }
  .fy-meta .song { font-size:11px; margin-top:7px; display:flex; align-items:center; gap:6px; opacity:.9; }
  .fy-meta .song .disc { display:inline-block; animation:fyspin 3s linear infinite; }
  @keyframes fyspin { to { transform:rotate(360deg);} }
  .fy-rail { position:absolute; right:10px; bottom:74px; z-index:15; display:flex; flex-direction:column; gap:18px; align-items:center; }
  .fy-rail .btn { display:flex; flex-direction:column; align-items:center; gap:3px; color:#fff; cursor:pointer; }
  .fy-rail .btn .ic { font-size:28px; filter:drop-shadow(0 2px 4px rgba(0,0,0,.5)); transition:transform .15s; }
  .fy-rail .btn .ic.liked { color:#ff2e6b; }
  .fy-rail .btn:active .ic { transform:scale(.8); }
  .fy-rail .btn span { font-size:11px; font-weight:700; }
  .fy-prog { position:absolute; bottom:0; left:0; height:3px; background:#fff; z-index:25; }
  .fy-heart { position:absolute; z-index:40; pointer-events:none; color:#ff2e6b; font-size:40px; transform:translate(-50%,-50%); }
  .fy-dope { position:absolute; top:9px; right:14px; z-index:31; display:flex; flex-direction:column; align-items:flex-end; gap:3px; }
  .fy-dope .lbl { font-size:8px; letter-spacing:.1em; color:rgba(255,255,255,.7); font-weight:700; }
  .fy-dope .bar { width:70px; height:5px; border-radius:3px; background:rgba(255,255,255,.25); overflow:hidden; }
  .fy-dope .bar i { display:block; height:100%; width:0%; background:linear-gradient(90deg,#16eaff,#ff2e93); transition:width .3s; }
  .fy-hint { position:absolute; bottom:116px; left:0; right:0; text-align:center; color:rgba(255,255,255,.85); font-size:11px; z-index:14;
    text-shadow:0 1px 6px rgba(0,0,0,.6); animation:fyup 1.8s ease-in-out infinite; }
  @keyframes fyup { 50%{ transform:translateY(-7px); opacity:.5;} }
  .fy-help { position:absolute; bottom:-30px; left:0; right:0; text-align:center; color:#cbb4e8; font-size:11px; letter-spacing:.06em; }
  `;
  function ensureCSS() { if (!document.getElementById('fy-css')) { const s = document.createElement('style'); s.id = 'fy-css'; s.textContent = CSS; document.head.appendChild(s); } }

  const POSTS = [
    { e: '🌴', punch: 'WAIT FOR IT…', user: '@core.aesthetic', cap: 'POV: it\'s 3am and the algorithm knows', song: 'original audio', bg: ['#ff2e93', '#7a2bff'] },
    { e: '🛼', punch: 'this trend again??', user: '@y2k.revival', cap: 'rating early-2000s nostalgia 💅 #fyp', song: 'sped up remix', bg: ['#16eaff', '#0066ff'] },
    { e: '🍜', punch: 'TELL ME WHY', user: '@2am.thoughts', cap: 'the internet was a mistake (affectionate)', song: 'lofi beats', bg: ['#ff7a00', '#ff2e6b'] },
    { e: '🐈', punch: 'he do be like that', user: '@catcontent.24_7', cap: 'every. single. day. 😹', song: 'meow remix', bg: ['#46e0b0', '#16eaff'] },
    { e: '💅', punch: 'and that\'s on PERIODT', user: '@main.character', cap: 'romanticize ur commute bestie ✨', song: 'hyperpop unreleased', bg: ['#b388ff', '#ff79c6'] },
    { e: '🛸', punch: 'they\'re NOT ready', user: '@late.capitalism', cap: 'explaining the lore to my followers', song: 'phonk', bg: ['#7a2bff', '#120721'] },
    { e: '🧋', punch: 'unproblematic queen', user: '@boba.daily', cap: 'this changed my brain chemistry fr', song: 'aesthetic audio', bg: ['#ff9ee0', '#ffd400'] },
    { e: '🎮', punch: 'no thoughts head empty', user: '@touch.grass', cap: 'me at 4am scrolling instead of sleeping', song: 'nightcore', bg: ['#2e9bff', '#7a2bff'] },
    { e: '🌀', punch: 'the algorithm wins', user: '@for.you.page', cap: 'you\'ve scrolled this far. it owns you now 😈', song: 'glitchcore', bg: ['#ff2e6b', '#16eaff'] },
  ];
  const TRANS = ['push', 'zoom', 'glitch', 'spin', 'flip'];

  function build(root, api) {
    ensureCSS();
    const el = document.createElement('div'); el.className = 'fy-app';
    el.innerHTML = `
      <div class="fy-phone">
        <div class="fy-notch"></div>
        <div class="fy-dope"><span class="lbl">DOPAMINE</span><div class="bar"><i id="fy-dopebar"></i></div></div>
        <div class="fy-viewport" id="fy-vp">
          <div class="fy-tabs"><span>Following</span><span class="on">For You</span></div>
          <div class="fy-prog" id="fy-prog"></div>
        </div>
      </div>
      <div class="fy-help">swipe / scroll / ↑ ↓ to feed the machine · double-tap to ♥</div>`;
    root.appendChild(el);
    const vp = el.querySelector('#fy-vp'); const prog = el.querySelector('#fy-prog'); const dopebar = el.querySelector('#fy-dopebar');
    let idx = 0, busy = false, dopamine = 12, progT = 0, raf, liked = {}, counts = {};

    function makeItem(i) {
      const p = POSTS[i % POSTS.length];
      const d = document.createElement('div'); d.className = 'fy-item';
      d.style.background = `linear-gradient(160deg, ${p.bg[0]}, ${p.bg[1]})`;
      const seed = 240 + i * 137;
      counts[i] = counts[i] || { like: (seed % 900) + 100, com: (seed % 90) + 9, share: (seed % 50) + 4 };
      const c = counts[i];
      d.innerHTML = `
        <div class="bigtext"><div class="emoji">${p.e}</div><div class="punch">${p.punch}</div></div>
        <div class="fy-rail">
          <div class="btn" data-act="like"><span class="ic ${liked[i] ? 'liked' : ''}">${liked[i] ? '❤' : '🤍'}</span><span>${fmt(c.like + (liked[i] ? 1 : 0))}</span></div>
          <div class="btn" data-act="com"><span class="ic">💬</span><span>${fmt(c.com)}</span></div>
          <div class="btn" data-act="share"><span class="ic">↗</span><span>${fmt(c.share)}</span></div>
          <div class="btn"><span class="ic" style="animation:fyspin 3s linear infinite">💿</span></div>
        </div>
        <div class="fy-meta">
          <div class="user">${p.user}</div>
          <div class="cap">${p.cap}</div>
          <div class="song"><span class="disc">♫</span> ${p.song} · ${p.user.replace('@','')}</div>
        </div>
        ${i === 0 ? '<div class="fy-hint">▲ swipe up for next</div>' : ''}`;
      // interactions
      d.querySelectorAll('.btn[data-act]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); doAct(b.dataset.act, i, d); }));
      let lastTap = 0;
      d.addEventListener('click', (e) => { const now = Date.now(); if (now - lastTap < 320) { likeAt(i, d, e.clientX, e.clientY); } lastTap = now; });
      return d;
    }
    function fmt(n) { return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : '' + n; }

    function doAct(act, i, node) {
      if (act === 'like') likeAt(i, node);
      else { window.AUDIO && AUDIO.sfx('pop'); bump(4); }
    }
    function likeAt(i, node, x, y) {
      if (!liked[i]) { liked[i] = true; window.AUDIO && AUDIO.sfx('heart'); bump(10); refreshLike(node, i); }
      // floating heart burst
      const vpr = vp.getBoundingClientRect();
      const hx = x != null ? x - vpr.left : vpr.width / 2, hy = y != null ? y - vpr.top : vpr.height / 2;
      const h = document.createElement('div'); h.className = 'fy-heart'; h.textContent = '❤';
      h.style.left = hx + 'px'; h.style.top = hy + 'px'; h.style.transition = 'transform .9s cubic-bezier(.2,1,.3,1), opacity .9s';
      h.style.transform = `translate(-50%,-50%) rotate(${(Math.random()*30-15)}deg) scale(.4)`; vp.appendChild(h);
      requestAnimationFrame(() => { h.style.transform += ' translateY(-120px) scale(1.4)'; h.style.opacity = '0'; });
      setTimeout(() => h.remove(), 920);
    }
    function refreshLike(node, i) { const ic = node.querySelector('[data-act="like"] .ic'); const ct = node.querySelector('[data-act="like"] span:last-child');
      if (ic) { ic.textContent = '❤'; ic.classList.add('liked'); } if (ct) ct.textContent = fmt(counts[i].like + 1); }
    function bump(v) { dopamine = Math.min(100, dopamine + v); }

    let cur = makeItem(0); vp.insertBefore(cur, prog);
    function go(dir) {
      if (busy) return; busy = true; progT = 0;
      const ni = Math.max(0, idx + dir);
      const next = makeItem(ni);
      const style = TRANS[ni % TRANS.length];
      next.style.zIndex = 2; vp.insertBefore(next, prog);
      window.AUDIO && AUDIO.sfx('swipe'); bump(6);
      // set incoming start state by transition style
      const dy = dir > 0 ? 100 : -100;
      if (style === 'push') next.style.transform = `translateY(${dy}%)`;
      else if (style === 'zoom') { next.style.transform = 'scale(1.6)'; next.style.filter = 'blur(12px)'; next.style.opacity = '0'; }
      else if (style === 'glitch') { next.style.transform = `translateY(${dy*0.4}%)`; next.style.opacity = '0'; next.style.filter = 'hue-rotate(90deg) saturate(2)'; }
      else if (style === 'spin') { next.style.transform = `translateY(${dy}%) rotate(${dir>0?12:-12}deg) scale(.7)`; next.style.opacity = '0'; }
      else if (style === 'flip') { next.style.transform = `perspective(600px) rotateX(${dir>0?-80:80}deg)`; next.style.transformOrigin = dir>0?'top':'bottom'; next.style.opacity = '0'; }
      // animate
      requestAnimationFrame(() => {
        const T = 'transform .5s cubic-bezier(.16,1,.3,1), opacity .45s, filter .5s';
        next.style.transition = T; cur.style.transition = T;
        next.style.transform = 'none'; next.style.opacity = '1'; next.style.filter = 'none';
        if (style === 'push' || style === 'spin' || style === 'flip') cur.style.transform = `translateY(${-dy}%)` ;
        else { cur.style.opacity = '0'; cur.style.transform = 'scale(.85)'; }
      });
      const old = cur; cur = next; idx = ni;
      setTimeout(() => { old.remove(); busy = false; }, 540);
    }

    // input: wheel, drag, keys
    let acc = 0; function onWheel(e) { e.preventDefault(); acc += e.deltaY; if (Math.abs(acc) > 60) { go(acc > 0 ? 1 : -1); acc = 0; } }
    vp.addEventListener('wheel', onWheel, { passive: false });
    let sy = null; function onDown(e) { sy = (e.touches ? e.touches[0].clientY : e.clientY); }
    function onUp(e) { if (sy == null) return; const ey = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY); const dd = sy - ey; if (Math.abs(dd) > 45) go(dd > 0 ? 1 : -1); sy = null; }
    vp.addEventListener('pointerdown', onDown); vp.addEventListener('pointerup', onUp);
    vp.addEventListener('touchstart', onDown, { passive: true }); vp.addEventListener('touchend', onUp);
    function onKey(e) { if (e.key === 'ArrowUp') { e.preventDefault(); go(-1); } if (e.key === 'ArrowDown') { e.preventDefault(); go(1); } }
    addEventListener('keydown', onKey);

    // autoplay progress + dopamine drain
    function loop() {
      progT += 0.6; if (progT >= 100) { progT = 0; go(1); }
      prog.style.width = progT + '%';
      dopamine = Math.max(0, dopamine - 0.08); dopebar.style.width = dopamine + '%';
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => { cancelAnimationFrame(raf); vp.removeEventListener('wheel', onWheel); removeEventListener('keydown', onKey); };
  }

  window.INTERACTIVES['foryou'] = { title: 'For You', sub: 'INFINITE FEED', era: 4, build };
})();
