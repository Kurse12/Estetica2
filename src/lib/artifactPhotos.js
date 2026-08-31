// ARTIFACT-ONLY. Not part of the shipping site.
//
// Published Artifacts run under a CSP that blocks images from every host, so
// the real Unsplash photography cannot load there. Rather than ship a preview
// full of broken frames, this module draws stand-ins from the brand's own
// vocabulary — the same five-petal path, the same rose ramp — so the layout,
// rhythm, and identity read correctly and nothing pretends to be a photograph.
//
// `npm run build:artifact` swaps data.js and Hero.jsx onto these; the normal
// build is untouched.

const PETAL_D =
  "M20 19.6C15.4 17.6 12.7 14 12.9 9.8C13.1 5.6 14.6 3.4 16.4 3.6C17.9 3.8 19 5 20 6.4C21 5 22.1 3.8 23.6 3.6C25.4 3.4 26.9 5.6 27.1 9.8C27.3 14 24.6 17.6 20 19.6Z";

// Deterministic per-seed noise: the same photo id must draw the same panel on
// every build, or the carousel reshuffles its colours on each reload.
function rng(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function blossom(cx, cy, scale, rot, fill, opacity = 1, centre = "#b99a63") {
  const petals = [0, 72, 144, 216, 288]
    .map((a) => `<path d="${PETAL_D}" transform="rotate(${a} 20 20)"/>`)
    .join("");
  return (
    `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${scale}) translate(-20 -20)" opacity="${opacity}">` +
    `<g fill="${fill}">${petals}</g>` +
    `<circle cx="20" cy="20" r="2.2" fill="${centre}"/>` +
    `</g>`
  );
}

function encode(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// The rose ramp, verbatim from tokens.css — this file cannot read CSS custom
// properties, so the values are duplicated rather than approximated.
const ROSE = ["#fae6ea", "#f0c2cd", "#e29fb1", "#c2657f", "#a8455f"];

// ---------------------------------------------------------------------------
// Hero: an illustrated bough instead of the photograph. Branches sweep in from
// the right against the same sky-to-cream wash the original photo carried, so
// the headline's scrim still has something to sit on.
// ---------------------------------------------------------------------------
export function heroPhoto() {
  const r = rng("hero");
  const W = 1600;
  const H = 1000;

  let boughs = "";
  let flowers = "";

  // Three boughs at different depths — the far one thin and pale, the near one
  // heavy and dark, so the canopy has front-to-back order rather than reading
  // as one flat spray.
  const depths = [
    { y: -40, w: 3, tone: "#c2a79d", op: 0.5, n: 16, size: 0.62 },
    { y: 90, w: 5, tone: "#9b7468", op: 0.72, n: 20, size: 0.95 },
    { y: 250, w: 7, tone: "#8a6154", op: 0.85, n: 22, size: 1.35 },
    { y: 520, w: 4, tone: "#a1806f", op: 0.6, n: 18, size: 1.05 },
  ];

  depths.forEach((d) => {
    const y0 = d.y;
    boughs +=
      `<path d="M${W + 40} ${y0} C ${W - 320} ${y0 + 60}, ${W - 520} ${y0 + 180}, ${W - 900} ${y0 + 150}` +
      ` S ${W - 1300} ${y0 + 80}, ${-40} ${y0 + 210}" ` +
      `stroke="${d.tone}" stroke-width="${d.w}" stroke-linecap="round" fill="none" opacity="${d.op}"/>`;

    // Twigs lifting off the main line, each ending in a cluster.
    for (let i = 0; i < 5; i++) {
      const tx = W - 200 - i * 260 - r() * 90;
      const ty = y0 + 120 + r() * 90;
      boughs +=
        `<path d="M${tx} ${ty} C ${tx - 40} ${ty - 50}, ${tx - 90} ${ty - 70}, ${tx - 150} ${ty - 60}" ` +
        `stroke="${d.tone}" stroke-width="${Math.max(1.4, d.w - 3)}" stroke-linecap="round" fill="none" opacity="${d.op * 0.8}"/>`;
    }

    for (let i = 0; i < d.n; i++) {
      // Weighted right: the copy sits at the left, so the canopy thins out
      // before it reaches the headline.
      const t = r() ** 0.55;
      const cx = W - t * (W + 60);
      const cy = y0 + 40 + r() * 340;
      const shade = r();
      const fill = shade > 0.82 ? ROSE[2] : shade > 0.4 ? ROSE[1] : ROSE[0];
      flowers += blossom(cx, cy, d.size * (0.7 + r() * 0.7), r() * 360, fill, 0.92);
    }
  });

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs><linearGradient id="sky" x1="0" y1="0" x2="1" y2="0.6">` +
    `<stop offset="0" stop-color="#fdf7f6"/><stop offset="0.45" stop-color="#f3e7ea"/>` +
    `<stop offset="0.78" stop-color="#c6d8e8"/><stop offset="1" stop-color="#7ea8c9"/>` +
    `</linearGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>` +
    boughs +
    flowers +
    `</svg>`;
  return encode(svg);
}

// ---------------------------------------------------------------------------
// Portfolio: an abstract panel per work. Each takes its ground from a different
// step of the rose ramp so the carousel has real tonal variety as it turns.
// ---------------------------------------------------------------------------
export function workPhoto(seed) {
  const r = rng(seed);
  const S = 720;
  // Deep grounds, not tints, and deeper than they need to look on their own.
  // The carousel dims and desaturates each panel by its depth in the ring
  // (`brightness(1 - t*0.35) saturate(1 - t*0.5)` in Carousel3D) — a treatment
  // that reads as depth on photographs but washes flat colour out to near-grey.
  // These have to survive that filter, and sit against the dome's own pale rose.
  const grounds = [
    { g: ["#c2657f", "#8f3450"], petal: "#fae6ea" },
    { g: ["#8f9e7b", "#5d6b4c"], petal: "#f2f6ec" },
    { g: ["#c9a86a", "#96773f"], petal: "#fdf6e8" },
    { g: ["#d0748c", "#a8455f"], petal: "#fff2f5" },
    { g: ["#9e8880", "#6b5852"], petal: "#f6ecea" },
    { g: ["#dd93a6", "#b45570"], petal: "#fff6f8" },
  ];
  const pick = grounds[Math.floor(r() * grounds.length)];
  const g = pick.g;

  let flowers = "";
  const n = 3 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    flowers += blossom(
      90 + r() * (S - 180),
      90 + r() * (S - 180),
      1.6 + r() * 2.4,
      r() * 360,
      pick.petal,
      0.16 + r() * 0.12,
      pick.petal
    );
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0.7" y2="1">` +
    `<stop offset="0" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/>` +
    `</linearGradient></defs>` +
    `<rect width="${S}" height="${S}" fill="url(#g)"/>` +
    flowers +
    // One sharp blossom at full strength, so each panel has a focal point
    // instead of dissolving into an even wash.
    blossom(S * (0.3 + r() * 0.4), S * (0.3 + r() * 0.4), 2.6, r() * 360, pick.petal, 0.85) +
    `</svg>`;
  return encode(svg);
}

// ---------------------------------------------------------------------------
// Professionals: initials in the display serif on a blush ground. An abstract
// panel in a portrait frame reads as a failed image; a monogram reads as a
// deliberate stand-in for a person whose photo has not been taken yet.
// ---------------------------------------------------------------------------
export function portraitPhoto(name) {
  const r = rng(name);
  const S = 560;
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("");

  let flowers = "";
  for (let i = 0; i < 4; i++) {
    flowers += blossom(
      60 + r() * (S - 120),
      60 + r() * (S - 120),
      2 + r() * 2.6,
      r() * 360,
      ROSE[2],
      0.14 + r() * 0.1
    );
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">` +
    `<defs><linearGradient id="p" x1="0.2" y1="0" x2="0.8" y2="1">` +
    `<stop offset="0" stop-color="#fbf0f1"/><stop offset="1" stop-color="#eed3d9"/>` +
    `</linearGradient></defs>` +
    `<rect width="${S}" height="${S}" fill="url(#p)"/>` +
    flowers +
    `<text x="${S / 2}" y="${S / 2 + 4}" text-anchor="middle" dominant-baseline="middle" ` +
    `font-family="Libre Caslon Display, Georgia, serif" font-size="150" fill="#c2657f" opacity="0.75">${initials}</text>` +
    `<text x="${S / 2}" y="${S - 74}" text-anchor="middle" ` +
    `font-family="Work Sans, Segoe UI, sans-serif" font-size="21" letter-spacing="5" fill="#a8968f">FOTO PENDIENTE</text>` +
    `</svg>`;
  return encode(svg);
}
