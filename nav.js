// ───────────────────────────────────────────────────────────────────────────
//  Navigation: sound toggle, zoom-out "jump through time" map, key hints.
// ───────────────────────────────────────────────────────────────────────────
(function () {
  const ERAS = window.ERAS;
  const soundBtn = document.getElementById('sound-toggle');
  const mapBtn = document.getElementById('map-toggle');
  const mapView = document.getElementById('mapview');
  const mapClose = document.getElementById('map-close');
  const mapGrid = document.getElementById('map-grid');

  // ── sound ───────────────────────────────────────────────────────────────────
  function syncSound() {
    const on = window.AUDIO && AUDIO.isStarted() && !AUDIO.isMuted();
    soundBtn.classList.toggle('off', !on);
    soundBtn.querySelector('span').textContent = 'SOUND: ' + (on ? 'ON' : 'OFF');
  }
  soundBtn.addEventListener('click', () => {
    if (!window.AUDIO) return;
    if (!AUDIO.isStarted()) AUDIO.unlock(); else AUDIO.toggleMute();
    syncSound();
  });
  setInterval(syncSound, 800);

  // ── map view ─────────────────────────────────────────────────────────────────
  const appsByEra = {};
  (window.TOUCHSTONES || []).forEach((t) => {
    (appsByEra[t.era] = appsByEra[t.era] || []).push((window.INTERACTIVES[t.app] && window.INTERACTIVES[t.app].title) || t.label);
  });

  ERAS.forEach((era, i) => {
    const card = document.createElement('div'); card.className = 'map-card';
    const acc = era.palette.accent, bg = era.palette.bg;
    card.style.background = `linear-gradient(150deg, ${acc}, ${bg} 78%)`;
    card.style.setProperty('--ca', acc);
    const apps = appsByEra[i] || [];
    card.innerHTML = `
      <span class="mc-n">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <div class="mc-yr">${era.years}</div>
        <div class="mc-name">${era.name}</div>
      </div>
      <div class="mc-apps">${apps.length ? apps.map((a) => `<span class="mc-chip">▶ ${a}</span>`).join('') : '<span class="mc-chip" style="opacity:.6">explore</span>'}</div>`;
    card.addEventListener('click', () => { window.AUDIO && AUDIO.sfx('select'); window.gotoEra(i); closeMap(); });
    mapGrid.appendChild(card);
  });

  function openMap() { mapView.classList.add('open'); window.AUDIO && AUDIO.sfx('click'); }
  function closeMap() { mapView.classList.remove('open'); window.AUDIO && AUDIO.sfx('back'); }
  mapBtn.addEventListener('click', () => mapView.classList.contains('open') ? closeMap() : openMap());
  mapClose.addEventListener('click', closeMap);

  // ── mobile HUD expand/collapse: gives the era card real, tappable content ──
  const hud = document.querySelector('.hud');
  const cue = document.getElementById('hud-expand');
  if (hud && cue) {
    cue.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = hud.classList.toggle('expanded');
      cue.querySelector('span').textContent = open ? 'LESS' : 'MORE';
      window.AUDIO && AUDIO.sfx('click');
    });
  }
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mapView.classList.contains('open')) closeMap();
    if (e.key === 'm' || e.key === 'M') { if (!(window.OVERLAY && OVERLAY.isOpen())) (mapView.classList.contains('open') ? closeMap() : openMap()); }
  });

  syncSound();
})();
