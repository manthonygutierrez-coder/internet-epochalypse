// ── Dial-Up connection simulator: dial → 56k handshake → "You've Got Mail" ──
(function () {
  const CSS = `
  .dialup-app { position:absolute; inset:0; background:#04140a; color:#7dffa6; font-family:'VT323',monospace;
    display:flex; flex-direction:column; overflow:hidden; }
  .dialup-app::after { content:''; position:absolute; inset:0; pointer-events:none; z-index:5;
    background:repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 2px, transparent 2px 4px);
    box-shadow:inset 0 0 140px rgba(0,0,0,.7); }
  .dialup-app .crt { flex:1; padding:34px 40px; font-size:24px; line-height:1.34; white-space:pre-wrap;
    text-shadow:0 0 7px #3dff7a; overflow:hidden; }
  .dialup-app .crt b { color:#eafff0; }
  .dialup-app .cur { display:inline-block; width:12px; height:20px; background:#7dffa6; box-shadow:0 0 7px #3dff7a;
    vertical-align:-3px; animation:dublink 1s steps(1) infinite; }
  @keyframes dublink { 50% { opacity:0; } }
  .dialup-app .bar { flex:none; display:flex; gap:12px; align-items:center; padding:16px 22px;
    border-top:1px solid #18613a; background:#06180d; z-index:6; }
  .dialup-app .keypad { display:grid; grid-template-columns:repeat(3,38px); gap:5px; }
  .dialup-app .keypad button, .dialup-app .act { font-family:'VT323',monospace; font-size:20px; cursor:pointer;
    background:#0a2616; color:#7dffa6; border:1px solid #1c7045; padding:7px 0; border-radius:3px; transition:.12s; }
  .dialup-app .keypad button:hover, .dialup-app .act:hover { background:#124a2c; box-shadow:0 0 12px rgba(61,255,122,.4); }
  .dialup-app .num { flex:1; font-size:26px; letter-spacing:3px; color:#eafff0; min-width:0; text-shadow:0 0 8px #3dff7a; }
  .dialup-app .act { padding: 9px 18px; font-size: 18px; letter-spacing: 2px; white-space: nowrap; }
  .dialup-app .act.go { border-color:#3dff7a; color:#04140a; background:#3dff7a; font-weight:bold; }
  .dialup-app .act:disabled { opacity:.35; cursor:default; }
  .dialup-app .mail { display:flex; flex-direction:column; gap:9px; margin-top:8px; }
  .dialup-app .mail .row { cursor:pointer; padding:5px 10px; border:1px solid #18613a; display:flex; gap:14px;
    background:#06190e; transition:.12s; }
  .dialup-app .mail .row:hover { background:#0e3a22; }
  .dialup-app .mail .row.unread b { color:#fff84d; text-shadow:0 0 8px #ffb000; }
  .dialup-app .yellow { color:#ffd84d; text-shadow:0 0 8px #ffb000; }
  `;
  function ensureCSS() { if (!document.getElementById('dialup-css')) { const s = document.createElement('style'); s.id = 'dialup-css'; s.textContent = CSS; document.head.appendChild(s); } }

  const MAILS = [
    { from: 'AOL Member Services', subj: 'Welcome to America Online!', body: 'Welcome aboard! You now have 1,000 FREE hours*.\n\n(*to be used within your first 30 days. Long-distance charges may apply. Please do not tie up the family phone line.)' },
    { from: 'webmaster@geocities', subj: 'your guestbook has a new entry!!', body: 'someone signed your guestbook:\n\n"kewl site!!! check out MY page, its under construction ~ <blink>BRB</blink>"\n\n— a fellow netizen' },
    { from: 'mom', subj: 'are you online again??', body: 'Honey I need to use the phone. Please log off.\n\nLove, Mom\n\nP.S. how do i forward this' },
  ];

  function build(root, api) {
    ensureCSS();
    const el = document.createElement('div'); el.className = 'dialup-app';
    const crt = document.createElement('div'); crt.className = 'crt';
    const bar = document.createElement('div'); bar.className = 'bar';
    el.append(crt, bar); root.appendChild(el);

    let dialed = '555-0199', state = 'idle', timers = [];
    const t = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

    function setBarDial() {
      bar.innerHTML = '';
      const pad = document.createElement('div'); pad.className = 'keypad';
      ['1','2','3','4','5','6','7','8','9','*','0','#'].forEach((k) => {
        const b = document.createElement('button'); b.textContent = k;
        b.onclick = () => { if (dialed.length < 12) { dialed += k; numEl.textContent = dialed; window.AUDIO && AUDIO.sfx('click'); } };
        pad.appendChild(b);
      });
      const numEl = document.createElement('div'); numEl.className = 'num'; numEl.textContent = dialed;
      const clr = document.createElement('button'); clr.className = 'act'; clr.textContent = 'CLR'; clr.onclick = () => { dialed = ''; numEl.textContent = '_'; window.AUDIO && AUDIO.sfx('back'); };
      const go = document.createElement('button'); go.className = 'act go'; go.textContent = '▶ DIAL'; go.onclick = connect;
      bar.append(pad, numEl, clr, go);
    }

    function typeLines(lines, done, speed) {
      let i = 0; crt.innerHTML = '';
      (function next() {
        if (i >= lines.length) { done && done(); return; }
        const div = document.createElement('div'); div.innerHTML = lines[i]; crt.appendChild(div); i++;
        t(next, speed || 90);
      })();
    }

    function connect() {
      if (state !== 'idle') return; state = 'dialing'; setBarBusy();
      window.AUDIO && AUDIO.sfx('dial');
      const seq = [
        'AOL Dialer 9.0',
        'Dialing <b>' + dialed + '</b> ...',
        '',
      ];
      typeLines(seq, () => {
        t(() => { window.AUDIO && AUDIO.sfx('handshake'); }, 100);
        const hs = ['<span class="yellow">CONNECT 14400</span>', '~~ negotiating ~~ kssshhhh ~~ BWAAAAANG', 'handshake .... <b>OK</b>', 'verifying screen name ....', ''];
        t(() => appendLines(hs, () => t(connected, 700)), 1900);
      }, 280);
    }

    function appendLines(lines, done) {
      let i = 0;
      (function next() { if (i >= lines.length) { done && done(); return; } const d = document.createElement('div'); d.innerHTML = lines[i]; crt.appendChild(d); crt.scrollTop = crt.scrollHeight; i++; t(next, 360); })();
    }

    function setBarBusy() { bar.innerHTML = '<div class="num" style="text-align:center">··· establishing connection ···</div>'; }

    function connected() {
      state = 'online'; window.AUDIO && AUDIO.sfx('mail');
      crt.innerHTML = '';
      const head = document.createElement('div');
      head.innerHTML = '<b>Welcome!</b>  You\'ve got <span class="yellow">3 new messages</span>.\n<span style="opacity:.6">▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔</span>';
      crt.appendChild(head);
      const mailWrap = document.createElement('div'); mailWrap.className = 'mail'; crt.appendChild(mailWrap);
      MAILS.forEach((m, i) => {
        const row = document.createElement('div'); row.className = 'mail-row row unread';
        row.innerHTML = `<span style="opacity:.6">✉</span><b>${m.from}</b><span style="opacity:.8">— ${m.subj}</span>`;
        row.onclick = () => openMail(m, row);
        mailWrap.appendChild(row);
      });
      const hint = document.createElement('div'); hint.style.marginTop = '14px'; hint.style.opacity = '.6';
      hint.innerHTML = 'click a message to read · type <b>/bye</b> to hang up';
      crt.appendChild(hint);
      bar.innerHTML = '';
      const status = document.createElement('div'); status.className = 'num'; status.innerHTML = '● <span class="yellow">ONLINE</span>  14.4kbps  00:01';
      const off = document.createElement('button'); off.className = 'act'; off.textContent = 'HANG UP';
      off.onclick = () => { window.AUDIO && AUDIO.sfx('back'); api.close(); };
      bar.append(status, off);
      let sec = 1; t(function tk(){ sec++; status.innerHTML = '● <span class="yellow">ONLINE</span>  14.4kbps  ' + String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0'); t(tk, 1000); }, 1000);
    }

    function openMail(m, row) {
      window.AUDIO && AUDIO.sfx('select'); row.classList.remove('unread');
      crt.innerHTML = '';
      const v = document.createElement('div');
      v.innerHTML = `<b>From:</b> ${m.from}\n<b>Subj:</b> <span class="yellow">${m.subj}</span>\n<span style="opacity:.5">▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔</span>\n\n${m.body}\n`;
      crt.appendChild(v);
      bar.innerHTML = '';
      const back = document.createElement('button'); back.className = 'act'; back.textContent = '◀ INBOX'; back.onclick = () => { window.AUDIO && AUDIO.sfx('back'); connected(); };
      bar.append(back);
    }

    crt.innerHTML = 'AOL  for  Windows  3.1\n\nThe internet is just a phone call away.\nEnter a number and press DIAL.\n\n<span class="cur"></span>';
    setBarDial();

    return () => timers.forEach(clearTimeout);
  }

  window.INTERACTIVES['dialup-sim'] = { title: 'Connect to AOL', sub: '14.4 KBPS', era: 0, build };
})();
