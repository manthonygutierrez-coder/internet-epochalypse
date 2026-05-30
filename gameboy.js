// ── "CAPSUMON" — an original monster-catcher for the EPOCH-BUD handheld ──
//   Expanded loop: overworld → wild encounter → battle (FIGHT to weaken,
//   throw a CAPSULE, or RUN) → build out your DEX of six elemental capsumon.
(function () {
  const CSS = `
  .gb-app { position:absolute; inset:0; display:flex; gap:32px; align-items:center; justify-content:center;
    background:radial-gradient(circle at 50% 30%, #2a1450, #0b0820 70%); font-family:'Space Grotesk',sans-serif; padding:14px; }
  .gb-shell { width:min(336px,94vw); background:linear-gradient(160deg,#d7d3c8,#bdb9ad); border-radius:14px 14px 44px 14px;
    padding:18px 18px 22px; box-shadow:0 24px 60px rgba(0,0,0,.55), inset 0 2px 0 rgba(255,255,255,.6), inset 0 -3px 6px rgba(0,0,0,.25); }
  .gb-brand { display:flex; justify-content:space-between; align-items:center; font-size:9px; letter-spacing:.12em;
    color:#6a6760; font-weight:700; margin-bottom:7px; }
  .gb-brand .pwr { display:flex; align-items:center; gap:5px; }
  .gb-brand .pwr i { width:7px; height:7px; border-radius:50%; background:#e0473a; box-shadow:0 0 6px #ff5e3a; display:inline-block; }
  .gb-screenwrap { background:#5a5550; border-radius:10px 10px 24px 10px; padding:16px 22px; box-shadow:inset 0 2px 8px rgba(0,0,0,.5); }
  .gb-screenwrap .label { color:#8b86c8; font-size:8px; letter-spacing:.34em; text-align:center; margin-bottom:6px; font-weight:700; }
  .gb-canvas { display:block; width:100%; max-width:248px; aspect-ratio:160/144; margin:0 auto; image-rendering:pixelated; border-radius:3px; box-shadow:0 0 0 2px #0f380f; }
  .gb-logo { text-align:center; font-style:italic; font-weight:800; color:#3a3550; font-size:14px; margin-top:8px; letter-spacing:.04em; }
  .gb-logo b { color:#8b2a52; font-style:normal; }
  .gb-controls { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:14px; align-items:center; }
  .gb-dpad { position:relative; width:84px; height:84px; }
  .gb-dpad button { position:absolute; background:#2b2b2f; border:none; width:28px; height:28px; cursor:pointer; }
  .gb-dpad button:active { background:#444; }
  .gb-dpad .up { left:28px; top:0; border-radius:5px 5px 0 0; } .gb-dpad .down { left:28px; top:56px; border-radius:0 0 5px 5px; }
  .gb-dpad .left { left:0; top:28px; border-radius:5px 0 0 5px; } .gb-dpad .right { left:56px; top:28px; border-radius:0 5px 5px 0; }
  .gb-dpad .mid { left:28px; top:28px; width:28px; height:28px; background:#2b2b2f; }
  .gb-ab { display:flex; gap:14px; justify-content:flex-end; align-items:center; transform:rotate(-22deg); }
  .gb-ab button { width:38px; height:38px; border-radius:50%; border:none; background:#8b2a52; color:#fff; font-weight:800;
    cursor:pointer; box-shadow:0 3px 0 #5a1834; font-size:14px; }
  .gb-ab button:active { transform:translateY(2px); box-shadow:0 1px 0 #5a1834; }
  .gb-startsel { grid-column:1/3; display:flex; gap:18px; justify-content:center; margin-top:6px; }
  .gb-startsel button { background:#9a968c; border:none; color:#3a3550; font-size:8px; font-weight:700; letter-spacing:.1em;
    padding:5px 12px; border-radius:9px; cursor:pointer; transform:rotate(-22deg); box-shadow:0 2px 0 #6a6760; }
  /* annotated control guide that fills the empty overlay space beside the console */
  .gb-guide { width:236px; flex:none; color:#d8d3e8; }
  .gb-guide .gg-h { font-size:10px; letter-spacing:.36em; font-weight:800; color:#b9a7ff; margin-bottom:15px; }
  .gb-guide ul { list-style:none; display:flex; flex-direction:column; gap:14px; margin:0 0 18px; padding:0; }
  .gb-guide li { display:flex; align-items:center; }
  .gb-guide .gg-ico { flex:none; width:44px; height:34px; display:flex; align-items:center; justify-content:center; }
  .gb-guide .gg-ln { flex:none; width:20px; height:0; border-top:1.5px dashed #6f5da0; }
  .gb-guide .gg-tx { font-size:11px; line-height:1.22; color:#c6bee0; padding-left:9px; }
  .gb-guide .gg-tx b { display:block; font-size:10px; letter-spacing:.14em; color:#fff; font-weight:800; margin-bottom:1px; }
  .gb-guide .gg-obj { border:1px solid rgba(185,167,255,.32); border-radius:10px; padding:12px 13px; font-size:11px; line-height:1.45; color:#c6bee0; background:rgba(120,90,180,.13); }
  .gb-guide .gg-obj .ol { font-size:9px; letter-spacing:.28em; font-weight:800; color:#b9a7ff; display:block; margin-bottom:5px; }
  .gb-guide .gg-obj b { color:#fff; }
  @media (max-width:760px){ .gb-guide{ display:none; } .gb-app{ gap:0; } }
  `;
  function ensureCSS() { if (!document.getElementById('gb-css')) { const s = document.createElement('style'); s.id = 'gb-css'; s.textContent = CSS; document.head.appendChild(s); } }

  // 4-shade DMG palette
  const P = ['#9bbc0f', '#8bac0f', '#306230', '#0f380f'];

  // ── capsumon roster: type, sprite kind, catch rate, max HP ──
  const DEX = [
    { name: 'SPROUTLE', type: 'LEAF', kind: 'leaf',  rate: 0.50, hp: 18 },
    { name: 'EMBUR',    type: 'FIRE', kind: 'flame', rate: 0.42, hp: 20 },
    { name: 'ZAPNIB',   type: 'SPRK', kind: 'spark', rate: 0.40, hp: 16 },
    { name: 'GLOOPY',   type: 'BLOB', kind: 'blob',  rate: 0.60, hp: 22 },
    { name: 'FINWICK',  type: 'AQUA', kind: 'fish',  rate: 0.45, hp: 18 },
    { name: 'PEBBLO',   type: 'ROCK', kind: 'rock',  rate: 0.55, hp: 24 },
  ];
  const BYNAME = {}; DEX.forEach((d) => { BYNAME[d.name] = d; });

  // ── three biomes, each spanning two stitched-together screens ──
  const BIOMES = {
    MEADOW: { name: 'SUNNY MEADOW', tag: 'MEADOW',   pool: ['SPROUTLE', 'GLOOPY', 'ZAPNIB'],  enc: 0.40 },
    FOREST: { name: 'DEEPWOOD',     tag: 'DEEPWOOD', pool: ['SPROUTLE', 'FINWICK', 'GLOOPY'], enc: 0.46 },
    CAVE:   { name: 'CRAG CAVE',    tag: 'CRAGCAVE', pool: ['PEBBLO', 'EMBUR', 'ZAPNIB'],     enc: 0.52 },
  };
  // world grid of screens — 3 columns (one biome each) x 2 rows.
  // walk off a side edge → next biome; off top/bottom → the biome's other screen.
  const WORLD = [
    ['MEADOW', 'FOREST', 'CAVE'],
    ['MEADOW', 'FOREST', 'CAVE'],
  ];
  const WCOLS = WORLD[0].length, WROWS = WORLD.length;

  // ── buildings stamped into specific overworld screens (footprint + door tile) ──
  const STRUCTURES = {
    '0,0': [{ x: 6, y: 2, w: 3, h: 2, door: [7, 3], name: 'BUD STOP', interior: 'budstop' }],
    '0,1': [{ x: 6, y: 2, w: 3, h: 2, door: [7, 3], name: 'COTTAGE', interior: 'cottage' }],
  };
  // ── interiors: a small room with NPC trainers (some show their own capsumon) ──
  const INTERIORS = {
    budstop: {
      name: 'BUD STOP', floor: 'tile',
      npcs: [
        { x: 4, y: 2, kind: null, name: 'PROF', role: 'prof' },
        { x: 7, y: 4, kind: 'rock', name: 'RANGER', role: 'flavor',
          pages: [['RANGER:', '"CRAG CAVE hides the'], ['tough PEBBLO & EMBUR.', 'Bring a full party!"']] },
      ],
    },
    cottage: {
      name: 'COTTAGE', floor: 'wood',
      npcs: [
        { x: 3, y: 3, kind: 'blob', name: 'RILEY', role: 'flavor',
          pages: [['RILEY:', '"Meet my GLOOPY!'], ['"Fill the whole DEX', 'and PROF will flip!"']] },
        { x: 7, y: 5, kind: 'fish', name: 'MILO', role: 'flavor',
          pages: [['MILO:', '"FINWICK loves the'], ['DEEPWOOD ponds.', 'So calming..."']] },
      ],
    },
  };

  function build(root, api) {
    ensureCSS();
    const el = document.createElement('div'); el.className = 'gb-app';
    el.innerHTML = `
      <div class="gb-guide">
        <div class="gg-h">HOW TO PLAY</div>
        <ul>
          <li>
            <span class="gg-ico"><svg viewBox="0 0 34 34" width="38" height="34" fill="none" stroke="#cfc7e6" stroke-width="2"><path d="M13 4h8v9h9v8h-9v9h-8v-9H4v-8h9z" stroke-linejoin="round"/></svg></span>
            <span class="gg-ln"></span><span class="gg-tx"><b>D-PAD</b>walk &amp; explore</span>
          </li>
          <li>
            <span class="gg-ico"><svg viewBox="0 0 34 34" width="34" height="34"><circle cx="17" cy="17" r="13" fill="none" stroke="#cfc7e6" stroke-width="2"/><text x="17" y="22" text-anchor="middle" font-size="14" font-weight="800" fill="#cfc7e6" font-family="sans-serif">A</text></svg></span>
            <span class="gg-ln"></span><span class="gg-tx"><b>A &middot; CONFIRM</b>talk &middot; throw capsule</span>
          </li>
          <li>
            <span class="gg-ico"><svg viewBox="0 0 34 34" width="34" height="34"><circle cx="17" cy="17" r="13" fill="none" stroke="#cfc7e6" stroke-width="2"/><text x="17" y="22" text-anchor="middle" font-size="14" font-weight="800" fill="#cfc7e6" font-family="sans-serif">B</text></svg></span>
            <span class="gg-ln"></span><span class="gg-tx"><b>B &middot; BACK</b>cancel &middot; flee battle</span>
          </li>
          <li>
            <span class="gg-ico"><svg viewBox="0 0 44 22" width="44" height="22"><rect x="3" y="5" width="38" height="12" rx="6" fill="none" stroke="#cfc7e6" stroke-width="2"/><text x="22" y="15" text-anchor="middle" font-size="8" font-weight="800" fill="#cfc7e6" font-family="sans-serif" letter-spacing="1">START</text></svg></span>
            <span class="gg-ln"></span><span class="gg-tx"><b>START</b>open CAPSU-DEX</span>
          </li>
          <li>
            <span class="gg-ico"><svg viewBox="0 0 44 22" width="44" height="22"><rect x="3" y="5" width="38" height="12" rx="6" fill="none" stroke="#cfc7e6" stroke-width="2"/><text x="22" y="15" text-anchor="middle" font-size="7" font-weight="800" fill="#cfc7e6" font-family="sans-serif" letter-spacing="1">SELECT</text></svg></span>
            <span class="gg-ln"></span><span class="gg-tx"><b>SELECT</b>show objective</span>
          </li>
        </ul>
        <div class="gg-obj"><span class="ol">OBJECTIVE</span>Catch all <b>6 CAPSUMON</b> to fill the DEX. Walk tall grass for wild encounters, weaken them, then throw a capsule. Rest free at the <b>BUD STOP</b> and pop into buildings to meet trainers.</div>
      </div>
      <div class="gb-shell">
        <div class="gb-brand"><span>DOT MATRIX WITH STEREO SOUND</span><span class="pwr"><i></i>BATTERY</span></div>
        <div class="gb-screenwrap">
          <div class="label">CAPSUMON</div>
          <canvas class="gb-canvas" width="160" height="144"></canvas>
        </div>
        <div class="gb-logo"><b>EPOCH</b>-BUD<span style="font-size:8px">™</span></div>
        <div class="gb-controls">
          <div class="gb-dpad">
            <button class="up" data-k="up"></button><button class="left" data-k="left"></button>
            <div class="mid"></div><button class="right" data-k="right"></button><button class="down" data-k="down"></button>
          </div>
          <div class="gb-ab"><button data-k="b">B</button><button data-k="a">A</button></div>
          <div class="gb-startsel"><button data-k="select">SELECT</button><button data-k="start">START</button></div>
        </div>
      </div>`;
    root.appendChild(el);

    const cv = el.querySelector('.gb-canvas'); const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // ── multi-screen world state ──
    const screens = {};          // cache: 'col,row' -> generated 10x9 tile grid
    let wcol = 0, wrow = 0;       // which screen of the world we're on
    let px = 4, py = 4;           // player tile within the screen
    let lastBiome = WORLD[0][0];
    let banner = '', bannerT = 0;

    // deterministic per-screen generation: walkable border lanes on connected
    // edges (so transitions always line up) + scattered obstacles/encounter patches
    function genScreen(col, row) {
      const key = col + ',' + row;
      if (screens[key]) return screens[key];
      let s = (col * 73 + row * 131 + 17) >>> 0;
      const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
      const g = []; for (let y = 0; y < 9; y++) g.push(new Array(10).fill(0));
      const openL = col > 0, openR = col < WCOLS - 1, openU = row > 0, openD = row < WROWS - 1;
      // world-boundary walls only on edges with no neighbour
      for (let y = 0; y < 9; y++) { if (!openL) g[y][0] = 2; if (!openR) g[y][9] = 2; }
      for (let x = 0; x < 10; x++) { if (!openU) g[0][x] = 2; if (!openD) g[8][x] = 2; }
      // interior: obstacles + tall encounter patches
      for (let y = 1; y <= 7; y++) for (let x = 1; x <= 8; x++) {
        const r = rng();
        if (r < 0.16) g[y][x] = 2; else if (r < 0.52) g[y][x] = 1;
      }
      // carve a clear central cross corridor: a safe, encounter-free path that
      // links every connected edge (walk the path to avoid the tall grass)
      for (let x = 1; x <= 8; x++) g[4][x] = 0;
      for (let y = 1; y <= 7; y++) g[y][4] = 0;
      // stamp any buildings: footprint solid (2), door walkable (3), clear approach
      const ss = STRUCTURES[key];
      if (ss) ss.forEach((b) => {
        for (let yy = 0; yy < b.h; yy++) for (let xx = 0; xx < b.w; xx++) g[b.y + yy][b.x + xx] = 2;
        g[b.door[1]][b.door[0]] = 3;
        if (b.door[1] + 1 <= 8) g[b.door[1] + 1][b.door[0]] = 0;
      });
      screens[key] = g; return g;
    }
    function biomeHere() { return WORLD[wrow][wcol]; }
    function structAt(c, r, x, y) { const ss = STRUCTURES[c + ',' + r]; return ss && ss.find((b) => b.door[0] === x && b.door[1] === y); }

    const caught = {};           // name -> level
    let dexCount = 0, won = false;
    const buddy = { ...DEX[0], level: 5, max: 26, cur: 26 };  // your starter SPROUTLE
    let raf, anim = 0, blink = 0;
    let mode = 'title';          // title | world | indoor | dex | battle
    let titleT = 0, face = 'down';
    let indoor = null, indoorReturn = null, dexReturn = 'world';
    let dlg = null;              // {pages, i, then} — shared overworld/indoor dialog

    function setFace(dx, dy) { face = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down'; }
    function say(pages, then) { dlg = { pages, i: 0, then: then || null }; }
    function dlgAdvance() { if (!dlg) return; dlg.i++; if (dlg.i >= dlg.pages.length) { const t = dlg.then; dlg = null; if (t) t(); } }

    // battle scratch
    let bt = null;               // { foe, ehp, emax, sub, sel, t, msg, msgQ, throwT, result, shake }
    // dex view scroll
    let dexSel = 0;

    // ── low-level pixel helpers ──
    function clear(c) { ctx.fillStyle = c; ctx.fillRect(0, 0, 160, 144); }
    function pixFont(size) { ctx.font = 'bold ' + size + 'px monospace'; }

    function drawTile(biome, x, y, t) {
      const sx = x * 16, sy = y * 16;
      if (t === 3) t = 0;   // door cell renders as floor; the house sprite draws the door
      if (biome === 'MEADOW') {
        if (t === 2) { ctx.fillStyle = P[1]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[3]; ctx.beginPath(); ctx.arc(sx + 8, sy + 6, 7, 0, 7); ctx.fill(); ctx.fillStyle = P[2]; ctx.fillRect(sx + 7, sy + 11, 2, 5); }
        else if (t === 1) { ctx.fillStyle = P[2]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[1]; for (let i = 0; i < 6; i++) ctx.fillRect(sx + 2 + (i * 3) % 12, sy + 3 + ((i * 5) % 11), 2, 5); }
        else { ctx.fillStyle = P[1]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[0]; for (let i = 0; i < 3; i++) ctx.fillRect(sx + (i * 6) % 14, sy + (i * 9) % 13, 2, 2); }
      } else if (biome === 'FOREST') {
        if (t === 2) { ctx.fillStyle = P[2]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[3]; ctx.beginPath(); ctx.arc(sx + 8, sy + 7, 8, 0, 7); ctx.fill(); ctx.fillStyle = P[2]; ctx.beginPath(); ctx.arc(sx + 5, sy + 4, 2, 0, 7); ctx.fill(); }
        else if (t === 1) { ctx.fillStyle = P[2]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[3]; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(sx + 4 + i * 4, sy + 6 + (i % 2) * 4, 3, 0, 7); ctx.fill(); } }
        else { ctx.fillStyle = P[2]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[3]; for (let i = 0; i < 4; i++) ctx.fillRect(sx + (i * 5) % 14, sy + (i * 7) % 13, 2, 2); ctx.fillStyle = P[1]; ctx.fillRect(sx + (x * 7 + y * 3) % 13, sy + (y * 5) % 12, 2, 2); }
      } else { // CAVE
        if (t === 2) { ctx.fillStyle = P[2]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[3]; ctx.fillRect(sx + 1, sy + 1, 14, 14); ctx.fillStyle = P[2]; ctx.fillRect(sx + 2, sy + 2, 5, 4); ctx.fillRect(sx + 9, sy + 9, 5, 5); }
        else if (t === 1) { ctx.fillStyle = P[3]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[1]; ctx.beginPath(); ctx.moveTo(sx + 8, sy + 3); ctx.lineTo(sx + 11, sy + 11); ctx.lineTo(sx + 5, sy + 11); ctx.closePath(); ctx.fill(); ctx.fillStyle = P[0]; ctx.fillRect(sx + 7, sy + 5, 2, 3); }
        else { ctx.fillStyle = P[3]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[2]; for (let i = 0; i < 3; i++) ctx.fillRect(sx + (i * 6) % 14, sy + (i * 8) % 13, 3, 2); }
      }
    }
    function drawPlayer() {
      const sx = px * 16, sy = py * 16;
      ctx.fillStyle = P[0]; ctx.fillRect(sx + 3, sy + 1, 10, 14);  // light halo → reads on dark cave floor
      ctx.fillStyle = P[3]; ctx.fillRect(sx + 4, sy + 2, 8, 6);    // hat
      ctx.fillStyle = P[2]; ctx.fillRect(sx + 4, sy + 8, 8, 6);    // body
      ctx.fillStyle = P[0]; ctx.fillRect(sx + 6, sy + 4, 4, 2);    // face
    }
    function drawHouse(sx, sy, w, h, name) {
      ctx.fillStyle = P[2]; ctx.fillRect(sx, sy + 9, w, h - 9);                 // body
      ctx.strokeStyle = P[3]; ctx.lineWidth = 2; ctx.strokeRect(sx + 1, sy + 9, w - 2, h - 10);
      ctx.fillStyle = P[3]; ctx.beginPath(); ctx.moveTo(sx - 2, sy + 11); ctx.lineTo(sx + w / 2, sy - 2); ctx.lineTo(sx + w + 2, sy + 11); ctx.closePath(); ctx.fill(); // roof
      ctx.fillStyle = P[1]; ctx.fillRect(sx + 5, sy + 14, 6, 6); ctx.fillRect(sx + w - 11, sy + 14, 6, 6);   // windows
      ctx.fillStyle = P[3]; ctx.fillRect(sx + w / 2 - 6, sy + h - 13, 12, 13);  // door frame
      ctx.fillStyle = P[0]; ctx.fillRect(sx + w / 2 - 4, sy + h - 11, 8, 11);   // doorway
      ctx.fillStyle = P[3]; ctx.fillRect(sx + w / 2 + 1, sy + h - 6, 1, 2);     // knob
      pixFont(6); ctx.fillStyle = P[3]; ctx.textAlign = 'center'; ctx.fillText(name, sx + w / 2, sy - 4); ctx.textAlign = 'left';
    }
    function drawNPC(x, y, kind) {
      const sx = x * 16, sy = y * 16;
      ctx.fillStyle = P[3]; ctx.fillRect(sx + 4, sy + 7, 8, 7);    // body
      ctx.fillStyle = P[2]; ctx.fillRect(sx + 4, sy + 1, 8, 7);    // head
      ctx.fillStyle = P[0]; ctx.fillRect(sx + 6, sy + 4, 2, 2); ctx.fillRect(sx + 9, sy + 4, 2, 2); // eyes
      if (kind) drawCreature(kind, sx + 22, sy + 13, 0.34);        // their capsumon at their side
    }
    function drawIndoorTile(floor, x, y, t) {
      const sx = x * 16, sy = y * 16;
      if (t === 2) { ctx.fillStyle = P[3]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[2]; ctx.fillRect(sx, sy, 16, 4); }
      else if (t === 3) { ctx.fillStyle = P[1]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[3]; edgeTri(sx + 8, sy + 9, 'down', 4); ctx.fill(); }
      else if (floor === 'wood') { ctx.fillStyle = P[2]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[1]; ctx.fillRect(sx, sy + (x % 2 ? 2 : 9), 16, 1); }
      else { ctx.fillStyle = P[1]; ctx.fillRect(sx, sy, 16, 16); ctx.fillStyle = P[0]; ctx.fillRect(sx, sy, 16, 1); ctx.fillRect(sx, sy, 1, 16); }
    }
    function drawBanner(name) {
      ctx.fillStyle = P[3]; ctx.fillRect(0, 58, 160, 28);
      ctx.fillStyle = P[0]; ctx.fillRect(0, 58, 160, 2); ctx.fillRect(0, 84, 160, 2);
      ctx.fillStyle = P[0]; ctx.textAlign = 'center'; pixFont(12); ctx.fillText('\u2014 ' + name + ' \u2014', 80, 76); ctx.textAlign = 'left';
    }
    // flashing arrows hugging each edge that leads to more overworld
    function edgeTri(cx, cy, dir, s) {
      ctx.beginPath();
      if (dir === 'left') { ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s, cy - s); ctx.lineTo(cx + s, cy + s); }
      else if (dir === 'right') { ctx.moveTo(cx + s, cy); ctx.lineTo(cx - s, cy - s); ctx.lineTo(cx - s, cy + s); }
      else if (dir === 'up') { ctx.moveTo(cx, cy - s); ctx.lineTo(cx - s, cy + s); ctx.lineTo(cx + s, cy + s); }
      else { ctx.moveTo(cx, cy + s); ctx.lineTo(cx - s, cy - s); ctx.lineTo(cx + s, cy - s); }
      ctx.closePath();
    }
    function drawEdgeArrows() {
      if (Math.floor(anim / 16) % 2 !== 0) return;   // blink
      const s = 5; ctx.lineWidth = 2; ctx.strokeStyle = P[3]; ctx.fillStyle = P[0];
      const a = (cx, cy, dir) => { edgeTri(cx, cy, dir, s); ctx.fill(); ctx.stroke(); };
      if (wcol > 0) a(8, 72, 'left');
      if (wcol < WCOLS - 1) a(152, 72, 'right');
      if (wrow > 0) a(96, 9, 'up');
      if (wrow < WROWS - 1) a(80, 136, 'down');
    }

    function drawCreature(kind, cx, cy, s) {
      ctx.fillStyle = P[2]; ctx.beginPath(); ctx.ellipse(cx, cy, 14 * s, 12 * s, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = P[3]; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, cy, 14 * s, 12 * s, 0, 0, 7); ctx.stroke();
      // eyes
      ctx.fillStyle = P[3]; ctx.beginPath(); ctx.arc(cx - 5 * s, cy - 2 * s, 2.2 * s, 0, 7); ctx.arc(cx + 5 * s, cy - 2 * s, 2.2 * s, 0, 7); ctx.fill();
      ctx.fillStyle = P[0]; ctx.beginPath(); ctx.arc(cx - 5 * s + 0.7, cy - 2.6 * s, 0.9 * s, 0, 7); ctx.arc(cx + 5 * s + 0.7, cy - 2.6 * s, 0.9 * s, 0, 7); ctx.fill();
      ctx.fillStyle = P[3];
      if (kind === 'leaf') { ctx.beginPath(); ctx.moveTo(cx, cy - 12 * s); ctx.quadraticCurveTo(cx + 8 * s, cy - 22 * s, cx, cy - 26 * s); ctx.quadraticCurveTo(cx - 8 * s, cy - 22 * s, cx, cy - 12 * s); ctx.fill(); }
      else if (kind === 'spark') { ctx.beginPath(); ctx.moveTo(cx - 12 * s, cy - 10 * s); ctx.lineTo(cx - 18 * s, cy - 22 * s); ctx.lineTo(cx - 8 * s, cy - 14 * s); ctx.fill(); ctx.beginPath(); ctx.moveTo(cx + 12 * s, cy - 10 * s); ctx.lineTo(cx + 18 * s, cy - 22 * s); ctx.lineTo(cx + 8 * s, cy - 14 * s); ctx.fill(); }
      else if (kind === 'blob') { for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(cx + i * 8 * s, cy - 12 * s, 3 * s, 0, 7); ctx.fill(); } }
      else if (kind === 'fish') { ctx.beginPath(); ctx.moveTo(cx + 13 * s, cy); ctx.lineTo(cx + 24 * s, cy - 8 * s); ctx.lineTo(cx + 24 * s, cy + 8 * s); ctx.fill(); }
      else if (kind === 'flame') { for (let i = -1; i <= 1; i++) { const fx = cx + i * 7 * s; ctx.beginPath(); ctx.moveTo(fx - 3 * s, cy - 11 * s); ctx.quadraticCurveTo(fx, cy - 26 * s, fx + 3 * s, cy - 11 * s); ctx.fill(); } }
      else if (kind === 'rock') { ctx.beginPath(); ctx.moveTo(cx - 11 * s, cy - 9 * s); ctx.lineTo(cx - 5 * s, cy - 20 * s); ctx.lineTo(cx, cy - 12 * s); ctx.lineTo(cx + 5 * s, cy - 21 * s); ctx.lineTo(cx + 11 * s, cy - 9 * s); ctx.closePath(); ctx.fill(); }
      // mouth
      ctx.strokeStyle = P[3]; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy + 3 * s, 3 * s, 0.1, Math.PI - 0.1); ctx.stroke();
    }

    function textbox(lines) {
      ctx.fillStyle = P[0]; ctx.fillRect(6, 104, 148, 34);
      ctx.strokeStyle = P[3]; ctx.lineWidth = 2; ctx.strokeRect(7, 105, 146, 32);
      ctx.fillStyle = P[3]; pixFont(10);
      lines.forEach((l, i) => ctx.fillText(l, 14, 119 + i * 13));
    }

    function hpBox(x, y, name, lvl, cur, max) {
      ctx.fillStyle = P[0]; ctx.fillRect(x, y, 70, 26);
      ctx.strokeStyle = P[3]; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, 68, 24);
      ctx.fillStyle = P[3]; pixFont(8); ctx.fillText(name, x + 5, y + 11);
      ctx.fillText('L' + lvl, x + 54, y + 11);
      // HP track + fill
      ctx.fillStyle = P[1]; ctx.fillRect(x + 5, y + 16, 60, 5);
      ctx.fillStyle = P[3]; const w = Math.max(0, Math.round(60 * cur / max)); ctx.fillRect(x + 5, y + 16, w, 5);
      ctx.strokeRect(x + 5, y + 16, 60, 5);
    }

    function drawBall(x, y) {
      ctx.fillStyle = P[3]; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
      ctx.fillStyle = P[0]; ctx.beginPath(); ctx.arc(x, y - 1, 5, Math.PI, 0); ctx.fill();
      ctx.fillStyle = P[3]; ctx.fillRect(x - 6, y - 1, 12, 2); ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fillStyle = P[1]; ctx.fill();
    }

    // ════════ TITLE ════════
    function renderTitle() {
      clear(P[0]);
      // banner
      ctx.fillStyle = P[2]; ctx.fillRect(0, 30, 160, 44);
      ctx.fillStyle = P[3]; ctx.fillRect(0, 30, 160, 3); ctx.fillRect(0, 71, 160, 3);
      ctx.fillStyle = P[0]; ctx.textAlign = 'center'; pixFont(20); ctx.fillText('CAPSUMON', 80, 60);
      ctx.fillStyle = P[3]; pixFont(7); ctx.fillText('an EPOCH-BUD adventure', 80, 88);
      // a couple of mascot critters
      drawCreature('leaf', 44, 116, 0.7); drawCreature('flame', 116, 116, 0.7);
      if (Math.floor(titleT / 24) % 2 === 0) { pixFont(9); ctx.fillStyle = P[3]; ctx.fillText('PRESS START', 80, 138); }
      ctx.textAlign = 'left';
    }

    // ════════ OVERWORLD ════════
    function renderWorld() {
      const biome = biomeHere();
      const g = genScreen(wcol, wrow);
      for (let y = 0; y < 9; y++) for (let x = 0; x < 10; x++) drawTile(biome, x, y, g[y][x]);
      const ss = STRUCTURES[wcol + ',' + wrow];
      if (ss) ss.forEach((b) => drawHouse(b.x * 16, b.y * 16, b.w * 16, b.h * 16, b.name));
      drawPlayer();
      if (!dlg) drawEdgeArrows();
      // compact corner chip (biome + dex) — replaces the screen-eating textbox
      pixFont(7);
      const lbl = BIOMES[biome].tag, dx = dexCount + '/' + DEX.length;
      const lw = ctx.measureText(lbl).width;
      ctx.fillStyle = P[3]; ctx.fillRect(0, 0, lw + 32, 13);
      ctx.fillStyle = P[0]; ctx.fillText(lbl, 4, 9); ctx.fillText(dx, lw + 10, 9);
      if (bannerT > 0) { bannerT--; drawBanner(banner); }
      if (dlg) textbox(dlg.pages[dlg.i]);
    }

    // ════════ INDOOR (buildings) ════════
    function buildInterior(def) {
      const g = []; for (let y = 0; y < 9; y++) g.push(new Array(10).fill(0));
      for (let x = 0; x < 10; x++) { g[0][x] = 2; g[8][x] = 2; }
      for (let y = 0; y < 9; y++) { g[y][0] = 2; g[y][9] = 2; }
      g[8][4] = 3;   // exit mat
      return { grid: g, npcs: def.npcs, name: def.name, floor: def.floor };
    }
    function enterInterior(b) {
      indoor = buildInterior(INTERIORS[b.interior]);
      indoorReturn = { wcol, wrow, px: b.door[0], py: Math.min(8, b.door[1] + 1) };
      mode = 'indoor'; px = 4; py = 7; face = 'up'; window.AUDIO && AUDIO.sfx('select');
    }
    function exitInterior() {
      mode = 'world'; wcol = indoorReturn.wcol; wrow = indoorReturn.wrow;
      px = indoorReturn.px; py = indoorReturn.py; face = 'down'; indoor = null;
      window.AUDIO && AUDIO.sfx('back');
    }
    function renderIndoor() {
      for (let y = 0; y < 9; y++) for (let x = 0; x < 10; x++) drawIndoorTile(indoor.floor, x, y, indoor.grid[y][x]);
      indoor.npcs.forEach((n) => drawNPC(n.x, n.y, n.kind));
      drawPlayer();
      pixFont(7);
      ctx.fillStyle = P[3]; ctx.fillRect(0, 0, ctx.measureText(indoor.name).width + 8, 13);
      ctx.fillStyle = P[0]; ctx.fillText(indoor.name, 4, 9);
      if (dlg) textbox(dlg.pages[dlg.i]);
    }
    function talkProf() {
      buddy.cur = buddy.max;
      const left = DEX.length - dexCount;
      window.AUDIO && AUDIO.sfx('mail');
      if (dexCount >= DEX.length) say([['PROF:', '"You filled the DEX!"'], ['"A true CAPSU-CHAMP.', 'Legendary work!"'], ['Your CAPSUMON is', 'brimming with pep!']]);
      else say([['PROF:', '"Welcome to the BUD STOP!"'], ['Your CAPSUMON was', 'fully healed!'], ['"Catch all 6 CAPSUMON.', left + ' still out there!"']]);
    }
    function talkTo(npc) {
      if (npc.role === 'prof') talkProf();
      else { window.AUDIO && AUDIO.sfx('select'); say(npc.pages); }
    }
    function moveIndoor(dx, dy) {
      setFace(dx, dy);
      const nx = px + dx, ny = py + dy;
      if (nx < 0 || nx > 9 || ny < 0 || ny > 8) return;
      const t = indoor.grid[ny][nx];
      if (t === 2) return;
      if (indoor.npcs.some((n) => n.x === nx && n.y === ny)) return;
      if (t === 3) { exitInterior(); return; }
      px = nx; py = ny; window.AUDIO && AUDIO.sfx('click');
    }

    // ════════ BATTLE ════════
    const MENU = ['FIGHT', 'CAPSULE', 'RUN'];
    function startEncounter() {
      const pool = BIOMES[biomeHere()].pool;
      const foe = BYNAME[pool[Math.random() * pool.length | 0]];
      bt = { foe, emax: foe.hp, ehp: foe.hp, sub: 'menu', sel: 0, throwT: -1, result: '', shake: 0, msg: null, msgQ: [] };
      mode = 'battle';
      window.AUDIO && AUDIO.sfx('select');
    }
    function queue(lines, then) { bt.msgQ.push({ lines, then }); if (!bt.msg) advance(); }
    function advance() { const m = bt.msgQ.shift(); bt.msg = m ? { lines: m.lines, t: 0, then: m.then } : null; }
    function finishMsg() { const then = bt.msg.then; bt.msg = null; if (then) then(); if (bt && !bt.msg) advance(); }

    function renderBattle() {
      const sh = bt.shake > 0 ? (Math.random() * 2 - 1) * 2 : 0;
      ctx.save(); ctx.translate(sh, 0);
      // scene bands
      clear(P[0]);
      ctx.fillStyle = P[1]; ctx.fillRect(0, 64, 160, 80);
      ctx.fillStyle = P[2]; ctx.beginPath(); ctx.ellipse(112, 60, 34, 7, 0, 0, 7); ctx.fill();   // foe platform
      ctx.beginPath(); ctx.ellipse(44, 104, 34, 8, 0, 0, 7); ctx.fill();                          // buddy platform

      const bob = Math.sin(anim * 0.12) * 2;
      // foe sprite (hidden once captured)
      if (!(bt.result === 'caught' && bt.throwT >= 60)) {
        if (bt.throwT < 0 || bt.throwT >= 60) drawCreature(bt.foe.kind, 112, 46 + bob, 1.0);
      }
      // your buddy from behind (simple back blob)
      ctx.fillStyle = P[2]; ctx.beginPath(); ctx.ellipse(44, 96, 15, 11, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = P[3]; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = P[3]; ctx.fillRect(36, 86, 5, 4); ctx.fillRect(47, 86, 5, 4); // ears

      // capsule throw / wobble
      if (bt.throwT >= 0 && bt.throwT < 60) {
        if (bt.throwT < 18) { const p = bt.throwT / 18; drawBall(36 + 76 * p, 104 - Math.sin(p * Math.PI) * 64); }
        else { const w = Math.sin(bt.throwT * 0.5) * (bt.throwT < 54 ? 4 : 0); ctx.save(); ctx.translate(112, 52); ctx.rotate(w * 0.04); drawBall(0, 0); ctx.restore(); }
      }

      // HP boxes
      hpBox(6, 8, bt.foe.name, '?', bt.ehp, bt.emax);
      hpBox(84, 70, buddy.name, buddy.level, buddy.cur, buddy.max);
      ctx.restore();

      // bottom panel: message OR menu
      if (bt.msg) { textbox(bt.msg.lines); }
      else if (bt.sub === 'menu') {
        ctx.fillStyle = P[0]; ctx.fillRect(6, 104, 148, 34);
        ctx.strokeStyle = P[3]; ctx.lineWidth = 2; ctx.strokeRect(7, 105, 146, 32);
        ctx.fillStyle = P[3]; pixFont(10);
        MENU.forEach((m, i) => {
          const col = i % 2, rowi = i / 2 | 0;
          const x = 22 + col * 74, y = 120 + rowi * 14;
          if (i === bt.sel) ctx.fillText('\u25B6', x - 12, y);
          ctx.fillText(m, x, y);
        });
      }
    }

    function enemyTurn(then) {
      const dmg = 2 + (Math.random() * 3 | 0);
      buddy.cur = Math.max(0, buddy.cur - dmg); bt.shake = 8;
      window.AUDIO && AUDIO.sfx('error');
      queue(['wild ' + bt.foe.name, 'struck back!'], () => {
        if (buddy.cur <= 0) { queue([buddy.name + ' fainted!'], faint); }
        else if (then) then(); else bt.sub = 'menu';
      });
    }
    function faint() {
      buddy.cur = buddy.max;
      queue(['You rushed back to', 'the BUD STOP to rest...'], () => {
        mode = 'world'; bt = null; wcol = 0; wrow = 0; px = 7; py = 4; lastBiome = 'MEADOW';
      });
    }
    function doFight() {
      bt.sub = 'busy';
      const dmg = 3 + (Math.random() * 4 | 0) + (buddy.level / 5 | 0);
      bt.ehp = Math.max(1, bt.ehp - dmg);  // weaken, never KO → always catchable
      window.AUDIO && AUDIO.sfx('select'); bt.shake = 8;
      queue([buddy.name + ' used', 'TACKLE!'], () => {
        const lowtag = bt.ehp <= bt.emax * 0.35 ? ' looks weak!' : ' was hurt!';
        queue(['wild ' + bt.foe.name + lowtag], () => { enemyTurn(); });
      });
    }
    function doCapsule() {
      bt.sub = 'busy'; bt.throwT = 0; bt.result = '';
      window.AUDIO && AUDIO.sfx('click');
      queue(['You threw a', 'CAPSULE!'], () => {});
    }
    function resolveCapsule() {
      const weak = 1 - bt.ehp / bt.emax;                 // 0..1
      const prob = Math.min(0.95, bt.foe.rate * (0.7 + weak * 1.8));
      if (Math.random() < prob) {
        bt.result = 'caught';
        const lvl = 3 + (Math.random() * 6 | 0);
        if (!caught[bt.foe.name]) { caught[bt.foe.name] = lvl; dexCount++; }
        window.AUDIO && AUDIO.sfx('catch');
        queue(['Gotcha!', bt.foe.name + ' was caught!'], () => {
          queue([bt.foe.name + ' was', 'logged to the DEX!'], () => {
            if (dexCount >= DEX.length && !won) { won = true; window.AUDIO && AUDIO.sfx('mail'); queue(['DEX COMPLETE!', 'You are a CAPSU-CHAMP!'], () => { mode = 'world'; bt = null; }); }
            else { mode = 'world'; bt = null; }
          });
        });
      } else {
        bt.result = 'fled';
        window.AUDIO && AUDIO.sfx('error'); bt.shake = 8;
        queue(['Aww! it broke free!'], () => { bt.throwT = -1; enemyTurn(); });
      }
    }
    function doRun() {
      bt.sub = 'busy'; window.AUDIO && AUDIO.sfx('back');
      queue(['Got away safely!'], () => { mode = 'world'; bt = null; });
    }

    // ════════ DEX VIEW ════════
    function renderDex() {
      clear(P[0]);
      ctx.fillStyle = P[3]; ctx.fillRect(0, 0, 160, 16);
      ctx.fillStyle = P[0]; pixFont(9); ctx.fillText('CAPSU-DEX  ' + dexCount + '/' + DEX.length, 8, 11);
      DEX.forEach((c, i) => {
        const y = 26 + i * 17;
        const has = caught[c.name];
        if (i === dexSel) { ctx.fillStyle = P[2]; ctx.fillRect(4, y - 11, 152, 15); }
        ctx.fillStyle = P[3]; pixFont(9);
        ctx.fillText(String(i + 1).padStart(2, '0'), 8, y);
        if (has) { ctx.fillText(c.name, 30, y); pixFont(7); ctx.fillText('[' + c.type + ']', 98, y); ctx.fillText('Lv' + has, 134, y); }
        else { ctx.fillText('-------', 30, y); }
      });
      ctx.fillStyle = P[3]; pixFont(7); ctx.fillText('B / START : back', 8, 140);
    }

    // ════════ MAIN LOOP ════════
    function loop() {
      anim++; blink = anim % 80;
      if (mode === 'title') { titleT++; renderTitle(); }
      else if (mode === 'world') renderWorld();
      else if (mode === 'indoor') renderIndoor();
      else if (mode === 'dex') renderDex();
      else if (mode === 'battle') {
        if (bt.shake > 0) bt.shake--;
        if (bt.msg) { bt.msg.t++; if (bt.msg.t > 72) finishMsg(); }
        if (bt && mode === 'battle') {
          if (bt.throwT >= 0 && bt.throwT < 60 && !bt.msg) {
            bt.throwT++;
            if (bt.throwT === 18) window.AUDIO && AUDIO.sfx('pop');
            if (bt.throwT === 40 && !bt.result) resolveCapsule();
          }
          renderBattle();
        }
      }
      raf = requestAnimationFrame(loop);
    }

    // ════════ INPUT ════════
    function enterScreen(c, r, nx, ny) {
      const nb = WORLD[r][c];
      wcol = c; wrow = r; px = nx; py = ny; genScreen(c, r);
      window.AUDIO && AUDIO.sfx('select');
      if (nb !== lastBiome) { lastBiome = nb; banner = BIOMES[nb].name; bannerT = 44; }
    }
    function move(dx, dy) {
      if (mode !== 'world') return;
      setFace(dx, dy);
      const nx = px + dx, ny = py + dy;
      // walked off the screen edge → cross into the neighbouring screen
      if (nx < 0 || nx > 9 || ny < 0 || ny > 8) {
        const tc = wcol + (nx < 0 ? -1 : nx > 9 ? 1 : 0);
        const tr = wrow + (ny < 0 ? -1 : ny > 8 ? 1 : 0);
        if (tc >= 0 && tc < WCOLS && tr >= 0 && tr < WROWS) {
          enterScreen(tc, tr, nx < 0 ? 9 : nx > 9 ? 0 : px, ny < 0 ? 8 : ny > 8 ? 0 : py);
        }
        return;
      }
      const g = genScreen(wcol, wrow);
      const t = g[ny][nx];
      if (t === 2) return;
      px = nx; py = ny; window.AUDIO && AUDIO.sfx('click');
      if (t === 3) { const b = structAt(wcol, wrow, nx, ny); if (b) enterInterior(b); return; }
      if (t === 1 && Math.random() < BIOMES[biomeHere()].enc) startEncounter();
    }
    function press(k) {
      if (mode === 'title') { if (k === 'start' || k === 'a') { mode = 'world'; banner = BIOMES[biomeHere()].name; bannerT = 44; window.AUDIO && AUDIO.sfx('select'); } return; }
      if (dlg) { if (k === 'a' || k === 'b' || k === 'start') dlgAdvance(); return; }
      if (mode === 'dex') {
        if (k === 'up') { dexSel = (dexSel + DEX.length - 1) % DEX.length; window.AUDIO && AUDIO.sfx('click'); }
        else if (k === 'down') { dexSel = (dexSel + 1) % DEX.length; window.AUDIO && AUDIO.sfx('click'); }
        else if (k === 'b' || k === 'start') { mode = dexReturn; window.AUDIO && AUDIO.sfx('back'); }
        return;
      }
      if (mode === 'indoor') {
        if (k === 'up') moveIndoor(0, -1); else if (k === 'down') moveIndoor(0, 1);
        else if (k === 'left') moveIndoor(-1, 0); else if (k === 'right') moveIndoor(1, 0);
        else if (k === 'a') { const fd = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[face]; const n = indoor.npcs.find((m) => m.x === px + fd[0] && m.y === py + fd[1]); if (n) talkTo(n); }
        else if (k === 'start') { dexReturn = 'indoor'; mode = 'dex'; window.AUDIO && AUDIO.sfx('select'); }
        return;
      }
      if (mode === 'world') {
        if (k === 'up') move(0, -1); else if (k === 'down') move(0, 1);
        else if (k === 'left') move(-1, 0); else if (k === 'right') move(1, 0);
        else if (k === 'start') { dexReturn = 'world'; mode = 'dex'; window.AUDIO && AUDIO.sfx('select'); }
        else if (k === 'select') { const left = DEX.length - dexCount; window.AUDIO && AUDIO.sfx('click'); say([['OBJECTIVE', 'Catch all 6 CAPSUMON'], ['Caught ' + dexCount + '/' + DEX.length + '.' + (left ? ' ' + left + ' to go!' : ' DONE!'), 'Heal at the BUD STOP.']]); }
        return;
      }
      if (mode === 'battle') {
        if (bt.msg) { if (k === 'a' || k === 'b' || k === 'start') finishMsg(); return; }     // tap to advance dialog
        if (bt.sub !== 'menu') return;
        if (k === 'up' && bt.sel >= 2) bt.sel -= 2;
        else if (k === 'down' && bt.sel <= 0) bt.sel += 2;
        else if (k === 'left' && bt.sel % 2 === 1) bt.sel -= 1;
        else if (k === 'right' && bt.sel % 2 === 0 && bt.sel + 1 < MENU.length) bt.sel += 1;
        else if (k === 'a') { if (bt.sel === 0) doFight(); else if (bt.sel === 1) doCapsule(); else doRun(); }
        else return;
        if (k !== 'a') window.AUDIO && AUDIO.sfx('click');
      }
    }
    el.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => press(b.dataset.k)));
    const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', z: 'a', x: 'b', Enter: 'a', ' ': 'start' };
    function onKey(e) { const k = keyMap[e.key]; if (k) { e.preventDefault(); press(k); } }
    addEventListener('keydown', onKey);

    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener('keydown', onKey); };
  }

  window.INTERACTIVES['gameboy'] = { title: 'Capsumon', sub: 'CATCH \u2019EM', era: 1, build };
})();
