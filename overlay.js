// ───────────────────────────────────────────────────────────────────────────
//  Overlay framework — hosts the full-screen, era-skinned interactive apps.
//  Apps register into window.INTERACTIVES[id] = { title, era, build(root, api) }
//  build() may return a cleanup fn. api = { close() }.
//  Opening an app ducks the audio + flies the 3D camera into the artifact.
// ───────────────────────────────────────────────────────────────────────────
(function () {
  window.INTERACTIVES = window.INTERACTIVES || {};

  // shared chrome CSS (injected once) — uses the live era-* tokens for skinning
  const css = `
  #overlay { position: fixed; inset: 0; z-index: 60; display: none; align-items: center; justify-content: center; }
  #overlay.open { display: flex; }
  #overlay .ov-backdrop { position: absolute; inset: 0; background: color-mix(in srgb, var(--bg) 78%, transparent);
    backdrop-filter: blur(7px) saturate(1.1); -webkit-backdrop-filter: blur(7px) saturate(1.1); opacity: 0; transition: opacity .5s; }
  #overlay.open .ov-backdrop { opacity: 1; }
  #overlay .ov-stage {
    position: relative; z-index: 1; width: min(1080px, 94vw); height: min(740px, 90vh);
    display: flex; flex-direction: column; transform: scale(.82) translateY(26px); opacity: 0;
    transition: transform .55s cubic-bezier(.16,1,.3,1), opacity .45s;
    background: var(--panel-bg); border: var(--panel-border); border-radius: var(--panel-radius);
    box-shadow: var(--panel-shadow); overflow: hidden;
  }
  #overlay.open .ov-stage { transform: scale(1) translateY(0); opacity: 1; }
  #overlay .ov-bar {
    flex: none; display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 13px 18px; border-bottom: 1px solid color-mix(in srgb, var(--key) 14%, transparent);
    background: color-mix(in srgb, var(--bg) 40%, transparent);
  }
  #overlay .ov-title { display: flex; align-items: center; gap: 11px; min-width: 0; }
  #overlay .ov-title .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 10px var(--accent); flex: none; }
  #overlay .ov-title b { font: 700 .82rem/1 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase; color: var(--key); white-space: nowrap; }
  #overlay .ov-title span { font: 500 .68rem/1 'Space Grotesk', sans-serif; letter-spacing: .12em; color: var(--accent); opacity: .85; white-space: nowrap; }
  #overlay .ov-title span#ov-sub:not(:empty) { margin-left: 4px; }
  #overlay .ov-title span#ov-sub:not(:empty)::before { content: '·'; opacity: .55; margin-right: 9px; }
  #overlay .ov-close {
    flex: none; cursor: pointer; display: flex; align-items: center; gap: 8px;
    font: 700 .64rem/1 'Space Grotesk', sans-serif; letter-spacing: .14em; text-transform: uppercase;
    color: var(--key); background: color-mix(in srgb, var(--key) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--key) 22%, transparent); border-radius: 999px; padding: 9px 14px;
    transition: border-color .2s, background .2s, color .2s;
  }
  #overlay .ov-close:hover { border-color: var(--accent); color: var(--accent); }
  #overlay .ov-close kbd { font: inherit; opacity: .6; }
  #overlay .ov-body { position: relative; flex: 1; min-height: 0; overflow: hidden; }
  #overlay .ov-body > .app-root { position: absolute; inset: 0; }
  @media (max-width: 720px){ #overlay .ov-stage { width: 96vw; height: 92vh; } #overlay .ov-title span { display:none; } }
  `;
  const st = document.createElement('style'); st.id = 'ov-style'; st.textContent = css; document.head.appendChild(st);

  // DOM
  const ov = document.createElement('div'); ov.id = 'overlay'; ov.className = 'interactive';
  ov.innerHTML = `
    <div class="ov-backdrop"></div>
    <div class="ov-stage" role="dialog" aria-modal="true">
      <div class="ov-bar">
        <div class="ov-title"><span class="dot"></span><b id="ov-title">—</b><span id="ov-sub"></span></div>
        <button class="ov-close" id="ov-close"><kbd>ESC</kbd> ✕ EXIT</button>
      </div>
      <div class="ov-body"><div class="app-root" id="ov-root"></div></div>
    </div>`;
  document.body.appendChild(ov);

  const root = ov.querySelector('#ov-root');
  const titleEl = ov.querySelector('#ov-title');
  const subEl = ov.querySelector('#ov-sub');
  let cleanup = null, openId = null;

  const api = { close };

  function open(id) {
    const app = window.INTERACTIVES[id];
    if (!app || openId) return;
    openId = id;
    if (window.AUDIO) window.AUDIO.duck(true);
    if (window.__focusOn) window.__focusOn(app.era);
    titleEl.textContent = app.title;
    subEl.textContent = app.sub || '';
    // mount after a beat so the camera fly reads first
    setTimeout(() => {
      root.innerHTML = '';
      try { cleanup = app.build(root, api) || null; } catch (e) { console.error('app build failed', id, e); }
      ov.classList.add('open');
    }, 360);
  }

  function close() {
    if (!openId) return;
    ov.classList.remove('open');
    if (window.AUDIO) window.AUDIO.duck(false);
    if (window.__unfocus) window.__unfocus();
    const finish = () => { try { cleanup && cleanup(); } catch (e) {} cleanup = null; root.innerHTML = ''; openId = null; };
    setTimeout(finish, 480);
  }

  ov.querySelector('#ov-close').addEventListener('click', close);
  ov.querySelector('.ov-backdrop').addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && openId) close(); });

  window.OVERLAY = { open, close, isOpen: () => !!openId };
})();
