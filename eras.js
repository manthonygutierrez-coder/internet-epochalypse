// ───────────────────────────────────────────────────────────────────────────
//  INTERNET EPOCHALYPSE — era definitions
//  Each era carries: identity copy, a culture index, and a full palette that
//  drives both the 3D scene (fog/lights/grid/accents) and the HTML HUD reskin.
// ───────────────────────────────────────────────────────────────────────────
window.ERAS = [
  {
    id: 'dialup',
    chrome: 'era-dialup',
    name: 'Dial-Up Dawn',
    years: '1991 — 1996',
    tag: 'CONNECTING AT 14.4 KBPS',
    desc: 'A handshake of static and tone. The web arrives down the phone line — text on black, one page at a time. To be online is to occupy the family telephone and pray nobody picks up.',
    touchstones: ['AOL & "You\u2019ve Got Mail"', 'BBS boards & Usenet', 'The 56k modem screech', 'Web rings & guestbooks'],
    palette: {
      bg: '#05080a', fog: '#05080a',
      accent: '#3dff7a', accent2: '#ffb000',
      grid: '#0c2a18', gridSub: '#071510',
      key: '#dfffe6', mood: 'phosphor',
    },
  },
  {
    id: 'wildweb',
    chrome: 'era-wildweb',
    name: 'The Wild Web',
    years: '1996 — 2001',
    tag: 'UNDER CONSTRUCTION 🚧',
    desc: 'Everyone gets a homepage and nobody gets a designer. GeoCities, tiled backgrounds, marquee tags, hit counters and dancing GIFs. Maximal, chaotic, gloriously personal.',
    touchstones: ['GeoCities neighborhoods', 'Flash intros & MIDI loops', 'Animated GIF clutter', 'Comic Sans everything'],
    palette: {
      bg: '#0b0820', fog: '#0b0820',
      accent: '#ff2ec4', accent2: '#23e5ff',
      grid: '#34165e', gridSub: '#1a0c33',
      key: '#fff2a8', mood: 'neon',
    },
  },
  {
    id: 'web2',
    chrome: 'era-web2',
    name: 'Web 2.0',
    years: '2002 — 2009',
    tag: 'NOW WITH ROUNDED CORNERS™',
    desc: 'The web learns to shine. Glossy buttons, beveled badges, reflections and "beta" tags. MySpace Top 8, the blogosphere, and the first feeds that learn your name.',
    touchstones: ['MySpace Top 8', 'Glossy gradient buttons', 'RSS & the blogosphere', 'YouTube & the upload'],
    palette: {
      bg: '#08121f', fog: '#08121f',
      accent: '#3a8dff', accent2: '#46e0b0',
      grid: '#15324e', gridSub: '#0a1c2e',
      key: '#eaf4ff', mood: 'glossy',
    },
  },
  {
    id: 'feed',
    chrome: 'era-feed',
    name: 'The Feed',
    years: '2010 — 2015',
    tag: 'PULL TO REFRESH',
    desc: 'The web folds into the phone and the page becomes a column with no bottom. Flat design, the like button, the timeline — culture compressed into an infinite vertical scroll.',
    touchstones: ['The smartphone everywhere', 'Flat design & the grid', 'Infinite scroll feeds', 'The like & the retweet'],
    palette: {
      bg: '#0c0f15', fog: '#0c0f15',
      accent: '#2e9bff', accent2: '#ff4d4f',
      grid: '#1b2330', gridSub: '#0f141c',
      key: '#f2f5f8', mood: 'flat',
    },
  },
  {
    id: 'vertical',
    chrome: 'era-vertical',
    name: 'Vertical Maximalism',
    years: '2016 — 2021',
    tag: 'FOR YOU ▶',
    desc: 'Video turns sideways and the algorithm takes the wheel. Vaporwave, hyperpop and ironic nostalgia collide; memes mutate hourly. Attention is the only currency that clears.',
    touchstones: ['Vertical short-form video', 'Vaporwave & Y2K revival', 'Meme remix culture', 'The algorithmic For-You'],
    palette: {
      bg: '#120721', fog: '#120721',
      accent: '#ff2e93', accent2: '#16eaff',
      grid: '#3a1064', gridSub: '#1e0838',
      key: '#ffe6fb', mood: 'vapor',
    },
  },
  {
    id: 'synthetic',
    chrome: 'era-synthetic',
    name: 'The Synthetic Age',
    years: '2022 — NOW',
    tag: 'GENERATING…',
    desc: 'The web begins to dream. Images, voices and worlds bloom from prompts; the line between authored and generated dissolves. Culture is now co-authored with the machine.',
    touchstones: ['Generative image & text', 'Latent-space aesthetics', 'AI co-creation everywhere', 'The end of the single author'],
    palette: {
      bg: '#070d18', fog: '#070d18',
      accent: '#8f7bff', accent2: '#ff7ad1',
      grid: '#1a2444', gridSub: '#0c1326',
      key: '#eef0ff', mood: 'iridescent',
    },
  },
];

window.SPACING = 72;       // distance between era stations along +X
window.lerpColor = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t);
