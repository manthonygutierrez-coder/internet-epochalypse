// ───────────────────────────────────────────────────────────────────────────
//  INTERNET EPOCHALYPSE — generative era audio (Web Audio API, no asset files)
//  • Each era is a small synth ensemble whose bus gain tracks how close the
//    timeline is to that era → auto-crossfade as you travel.
//  • A low reverberant DRONE swells in the in-between transitional zones as one
//    era's bed fades out and the next fades in.
//  • A constant DIGITAL FLUTTER of tiny granular blips runs throughout.
//  • One global mute. Audio unlocks on the first user gesture.
// ───────────────────────────────────────────────────────────────────────────
(function () {
  let ctx = null, ready = false, muted = false, started = false;
  let master, dry, wet, conv, droneBus, flutterBus;
  const eras = [];                 // [{ bus, level, voices, pattern, lastEnter }]
  let progress = 0, prevNearest = -1;
  const A4 = 440;
  const note = (semisFromA4) => A4 * Math.pow(2, semisFromA4 / 12);

  // ── tiny reverb impulse ────────────────────────────────────────────────────
  function makeImpulse(seconds, decay) {
    const rate = ctx.sampleRate, len = rate * seconds;
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  // ── one-shot enveloped voice ────────────────────────────────────────────────
  function blip(dest, freq, t, dur, type, peak, glideTo) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noiseBurst(dest, t, dur, peak, freq, q) {
    const len = ctx.sampleRate * dur, b = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1800; f.Q.value = q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + dur);
  }

  // ── continuous detuned pad bus (for ambient era beds) ───────────────────────
  function padBus(dest, freqs, type, detune, lfoRate) {
    const bus = ctx.createGain(); bus.gain.value = 1; bus.connect(dest);
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
      o.detune.value = (i % 2 ? 1 : -1) * detune;
      const g = ctx.createGain(); g.gain.value = 0.16 / freqs.length;
      const lfo = ctx.createOscillator(); lfo.frequency.value = lfoRate * (0.6 + i * 0.2);
      const lg = ctx.createGain(); lg.gain.value = 0.08 / freqs.length;
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(bus); o.start(); lfo.start();
    });
    return bus;
  }

  // ── build the whole graph ───────────────────────────────────────────────────
  function build() {
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    dry = ctx.createGain(); dry.gain.value = 0.85; dry.connect(master);
    wet = ctx.createGain(); wet.gain.value = 0.55; wet.connect(master);
    conv = ctx.createConvolver(); conv.buffer = makeImpulse(3.2, 2.6); conv.connect(wet);

    const toMix = (n, wetAmt) => { n.connect(dry); const w = ctx.createGain(); w.gain.value = wetAmt; n.connect(w); w.connect(conv); };

    // transitional drone — low, heavily reverberant, gain driven by transition amount
    droneBus = ctx.createGain(); droneBus.gain.value = 0;
    const dpad = padBus(droneBus, [note(-33), note(-29), note(-21)], 'sine', 4, 0.07);
    dpad.gain.value = 1.0; toMix(droneBus, 0.9);

    // digital flutter — quiet granular blips throughout
    flutterBus = ctx.createGain(); flutterBus.gain.value = 0.5; toMix(flutterBus, 0.4);

    // ── era beds ──────────────────────────────────────────────────────────────
    // 0 DIAL-UP : phosphor hum + occasional FSK chirp pair
    {
      const bus = ctx.createGain(); bus.gain.value = 0; toMix(bus, 0.25);
      const hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 60;
      const hg = ctx.createGain(); hg.gain.value = 0.06; hum.connect(hg); hg.connect(bus); hum.start();
      const hiss = ctx.createGain(); hiss.gain.value = 0.012;
      const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource(); ns.buffer = nb; ns.loop = true;
      const nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 5200;
      ns.connect(nf); nf.connect(hiss); hiss.connect(bus); ns.start();
      eras.push({ bus, onEnter(t) { for (let k = 0; k < 6; k++) blip(bus, 1200 + Math.random() * 1400, t + k * 0.09, 0.07, 'square', 0.05); },
        pattern(step, t) { if (step % 16 === 0) blip(bus, 980, t, 0.05, 'square', 0.04, 1500); } });
    }
    // 1 WILD WEB : cheesy major-key chiptune arp (square)
    {
      const bus = ctx.createGain(); bus.gain.value = 0; toMix(bus, 0.3);
      const arp = [0, 4, 7, 12, 7, 4, 16, 12]; // C E G C ...
      const bassPat = [0, 0, 7, 5];
      eras.push({ bus,
        pattern(step, t) {
          blip(bus, note(arp[step % arp.length] - 9), t, 0.13, 'square', 0.085);          // melody
          if (step % 4 === 0) blip(bus, note(bassPat[(step / 4) % 4 | 0] - 21), t, 0.22, 'triangle', 0.12); // bass
          if (step % 8 === 4) noiseBurst(bus, t, 0.05, 0.05, 4000, 2);                      // hat
        } });
    }
    // 2 WEB 2.0 : warm pad + glassy bell plinks
    {
      const bus = ctx.createGain(); bus.gain.value = 0; toMix(bus, 0.45);
      padBus(bus, [note(-9), note(-2), note(3), note(7)], 'triangle', 6, 0.09);
      eras.push({ bus,
        pattern(step, t) { if (step % 8 === 0) blip(bus, note([7, 12, 14, 19][(step / 8) % 4 | 0]), t, 0.6, 'sine', 0.09); } });
    }
    // 3 THE FEED : soft sine pad + notification ding
    {
      const bus = ctx.createGain(); bus.gain.value = 0; toMix(bus, 0.5);
      padBus(bus, [note(-12), note(-5), note(0)], 'sine', 4, 0.05);
      eras.push({ bus,
        pattern(step, t) { if (step % 32 === 0) { blip(bus, note(16), t, 0.18, 'sine', 0.1); blip(bus, note(21), t + 0.12, 0.3, 'sine', 0.09); } } });
    }
    // 4 VERTICAL : pulsing hyperpop bass + saw stabs
    {
      const bus = ctx.createGain(); bus.gain.value = 0; toMix(bus, 0.32);
      eras.push({ bus,
        pattern(step, t) {
          if (step % 2 === 0) blip(bus, note(-21), t, 0.16, 'sine', 0.16);                 // kick-ish bass
          const stab = [0, 3, 7, 10, 12][step % 5];
          if (step % 4 === 2) blip(bus, note(stab + 3), t, 0.12, 'sawtooth', 0.07, note(stab - 9));
          if (step % 8 === 6) noiseBurst(bus, t, 0.04, 0.06, 6000, 3);
        } });
    }
    // 5 SYNTHETIC : iridescent shimmer pad + sparkle grains
    {
      const bus = ctx.createGain(); bus.gain.value = 0; toMix(bus, 0.7);
      padBus(bus, [note(-2), note(2), note(5), note(9), note(14)], 'sine', 9, 0.04);
      eras.push({ bus,
        pattern(step, t) { if (Math.random() < 0.3) blip(bus, note(19 + (Math.random() * 12 | 0)), t, 0.4, 'sine', 0.045); } });
    }
  }

  // ── musical scheduler ────────────────────────────────────────────────────────
  let nextStep = 0, step = 0;
  const STEP_DUR = 0.15;
  function scheduler() {
    if (!ready) return;
    const ahead = ctx.currentTime + 0.12;
    while (nextStep < ahead) {
      eras.forEach((e) => { if (e.level > 0.04 && e.pattern) e.pattern(step, nextStep); });
      step++; nextStep += STEP_DUR;
    }
  }

  // ── flutter scheduler (random, throughout) ───────────────────────────────────
  function flutterTick() {
    if (!ready) return;
    const t = ctx.currentTime + 0.02;
    const f = 1400 + Math.random() * 5200;
    blip(flutterBus, f, t, 0.018 + Math.random() * 0.03, Math.random() < 0.5 ? 'square' : 'sine', 0.02 + Math.random() * 0.025);
    if (Math.random() < 0.3) noiseBurst(flutterBus, t, 0.012, 0.015, f, 6);
    setTimeout(flutterTick, 180 + Math.random() * 900);
  }

  // ── proximity crossfade, called each frame with timeline progress ────────────
  function curve(d) { d = Math.abs(d); return d >= 1 ? 0 : Math.pow(1 - d, 1.6); } // per-era triangular-ish
  function applyMix() {
    if (!ready) return;
    const now = ctx.currentTime, T = 0.18;
    let nearestLevel = 0;
    eras.forEach((e, i) => {
      const lvl = curve(progress - i) * 0.9;
      e.level = lvl; nearestLevel = Math.max(nearestLevel, lvl);
      e.bus.gain.setTargetAtTime(lvl, now, T);
    });
    // drone fills the gaps: loud mid-transition, silent on an era
    const frac = Math.abs(progress - Math.round(progress));     // 0 at era, 0.5 between
    const drone = Math.pow(Math.min(1, frac * 2), 1.2) * 0.85;
    droneBus.gain.setTargetAtTime(drone, now, 0.25);
    // entry one-shots (e.g. modem handshake) when arriving on an era
    const near = Math.round(progress);
    if (near !== prevNearest && frac < 0.12) {
      prevNearest = near;
      const e = eras[near]; if (e && e.onEnter) e.onEnter(now + 0.05);
    }
  }

  // ── public API ────────────────────────────────────────────────────────────────
  function ensure() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    build();
    setInterval(scheduler, 25);
    flutterTick();
    ready = true;
  }
  function unlock() {
    ensure();
    if (ctx.state === 'suspended') ctx.resume();
    if (!started) { started = true; master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.4); applyMix(); }
  }

  // ── UI sound cues for the interactive apps (route through master+reverb) ────
  function sfx(name) {
    if (!ready) { ensure(); if (ctx.state === 'suspended') ctx.resume(); if (!started) unlock(); }
    if (!ready) return;
    const t = ctx.currentTime + 0.01, b = dry;
    switch (name) {
      case 'click': blip(b, 880, t, 0.05, 'square', 0.12); break;
      case 'pop': blip(b, 520, t, 0.08, 'sine', 0.16, 1040); break;
      case 'back': blip(b, 660, t, 0.06, 'square', 0.1, 360); break;
      case 'select': blip(b, 740, t, 0.05, 'square', 0.12); blip(b, 1100, t + 0.05, 0.07, 'square', 0.12); break;
      case 'error': blip(b, 200, t, 0.18, 'sawtooth', 0.14, 120); break;
      case 'dial': { const dtmf = [697, 770, 852, 941]; for (let i = 0; i < 4; i++) { blip(b, dtmf[i % 4], t + i * 0.14, 0.1, 'sine', 0.1); blip(b, 1209 + i * 130, t + i * 0.14, 0.1, 'sine', 0.08); } break; }
      case 'handshake': {
        noiseBurst(b, t, 0.5, 0.1, 1800, 0.8);
        for (let k = 0; k < 9; k++) blip(b, 900 + Math.random() * 1700, t + 0.4 + k * 0.16, 0.13, 'square', 0.07, 600 + Math.random() * 2200);
        noiseBurst(b, t + 1.9, 1.1, 0.12, 2400, 0.6);
        break;
      }
      case 'mail': blip(b, note(7), t, 0.18, 'sine', 0.14); blip(b, note(12), t + 0.14, 0.18, 'sine', 0.14); blip(b, note(16), t + 0.28, 0.5, 'sine', 0.14); break;
      case 'shutter': noiseBurst(b, t, 0.04, 0.18, 3000, 1); noiseBurst(b, t + 0.05, 0.05, 0.12, 1500, 1); break;
      case 'gen': for (let k = 0; k < 8; k++) blip(b, note(12 + k * 2), t + k * 0.05, 0.3, 'sine', 0.05); break;
      case 'catch': blip(b, note(0), t, 0.1, 'square', 0.12, note(12)); blip(b, note(7), t + 0.1, 0.1, 'square', 0.12, note(19)); blip(b, note(12), t + 0.2, 0.3, 'square', 0.12); break;
      case 'heart': blip(b, note(16), t, 0.07, 'sine', 0.12, note(21)); break;
      case 'swipe': noiseBurst(b, t, 0.12, 0.06, 2200, 0.7); break;
      case 'feed': blip(b, note(9), t, 0.12, 'triangle', 0.12); blip(b, note(2), t + 0.1, 0.2, 'triangle', 0.1); break;
    }
  }

  window.AUDIO = {
    setProgress(p) { progress = p; applyMix(); },
    sfx,
    toggleMute() {
      muted = !muted;
      if (ctx && started) master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.25);
      else if (!muted) unlock();
      return muted;
    },
    isMuted() { return muted; },
    isStarted() { return started; },
    // duck the era beds while an interactive overlay is focused
    duck(on) { if (ctx && started) master.gain.setTargetAtTime((muted ? 0 : (on ? 0.4 : 0.9)), ctx.currentTime, 0.3); },
    unlock,
  };

  // unlock on first gesture
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) =>
    addEventListener(ev, function once() { unlock(); }, { once: true, passive: true }));
})();
