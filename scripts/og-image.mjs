// Builds public/og-image.png — the link-preview card — by redrawing the hero
// as a static 1200x630 frame.
//
// Why redraw rather than screenshot: the hero's whole composition is SVG the
// site already owns (Sakura.jsx's canopy, blossom and petal shapes, the tokens'
// palette), so it can be re-emitted at og:image proportions without a headless
// browser in the toolchain. What it can't inherit is the entrance — the canopy
// draws itself in, the words rise — so everything here is drawn at its settled
// end state, which is what a visitor sees a second after arriving anyway.
//
// The shapes and numbers below are copied from their source of truth by hand
// (marked `src:` at each one). That's the cost of not booting a browser: this
// file has to be re-synced when the hero's own geometry changes. Run
// `npm run og` after any such change and commit the PNG it writes.
import { Resvg } from "@resvg/resvg-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "public", "og-image.png");
const FONT_CACHE = join(root, "node_modules", ".cache", "og-fonts");

const W = 1200;
const H = 630;

// src: src/styles/tokens.css
const CREAM = "#fdf7f6";
const BLUSH = "#fcf1f2";
const SAKURA = "#f0c2cd";
const SAKURA_MID = "#e29fb1";
const CHERRY = "#a8455f";
const SAKURA_DEEP = "#c2657f";
const BRANCH = "#9b7468";
const TAUPE = "#46383a";
const TAUPE_SOFT = "#7a6660";
const GOLD = "#b99a63";
const GOLD_LIGHT = "#ddc38f";
const WHITE = "#ffffff";

// src: src/components/Sakura.jsx — PETAL_PATH / PETAL_ANGLES / STAMEN_ANGLES.
const PETAL_PATH =
  "M20 19.6C15.4 17.6 12.7 14 12.9 9.8C13.1 5.6 14.6 3.4 16.4 3.6C17.9 3.8 19 5 20 6.4C21 5 22.1 3.8 23.6 3.6C25.4 3.4 26.9 5.6 27.1 9.8C27.3 14 24.6 17.6 20 19.6Z";
const PETAL_ANGLES = [0, 72, 144, 216, 288];
const STAMEN_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// src: src/styles/tokens.css --petal-texture, and the .petal-scatter__petal /
// .falling-petals__petal `border-radius: 100% 0 100% 0` those two share — the
// same lens, here in a 24-unit box tipped from (2,22) to (22,2).
const LEAF_PATH = "M2 22C2 10.9 10.9 2 22 2 22 13.1 13.1 22 2 22Z";

// src: src/components/Sakura.jsx — CANOPY_* tables and the three stroke paths.
const CANOPY_STEM = "M6 -10C60 34 40 96 108 140C168 178 150 246 224 288C280 318 270 380 340 412";
const CANOPY_BRANCH_A = "M108 140C150 118 206 108 258 128";
const CANOPY_BRANCH_B = "M224 288C260 300 300 296 336 274";
const CANOPY_BUDS = [
  { x: 95, y: 20, r: 3.4 },
  { x: 150, y: 165, r: 3 },
  { x: 215, y: 170, r: 2.6 },
  { x: 265, y: 210, r: 2.4 },
];
const CANOPY_BLOSSOMS = [
  { x: 30, y: 10, s: 0.85, r: -18 },
  { x: 75, y: 55, s: 1.05, r: 14 },
  { x: 130, y: 95, s: 0.7, r: -25 },
  { x: 165, y: 130, s: 0.9, r: 30 },
  { x: 190, y: 118, s: 0.6, r: -10 },
  { x: 235, y: 122, s: 0.75, r: 20 },
  { x: 195, y: 205, s: 0.95, r: -14 },
  { x: 250, y: 250, s: 0.65, r: 22 },
  { x: 285, y: 292, s: 0.55, r: -30 },
];

// src: src/components/Sakura.jsx — FALLEN_PETALS, as fractions of the band
// .hero__fallen carves out along the bottom edge (src/components/Hero.css).
const FALLEN_PETALS = [
  { top: 0.07, left: 0.03, size: 15, rot: -28, opacity: 0.5 },
  { top: 0.19, left: 0.93, size: 11, rot: 41, opacity: 0.42 },
  { top: 0.34, left: 0.01, size: 9, rot: 14, opacity: 0.34 },
  { top: 0.29, left: 0.96, size: 16, rot: -54, opacity: 0.46 },
  { top: 0.57, left: 0.05, size: 12, rot: 63, opacity: 0.4 },
  { top: 0.69, left: 0.9, size: 10, rot: -19, opacity: 0.33 },
  { top: 0.84, left: 0.02, size: 14, rot: 34, opacity: 0.44 },
  { top: 0.9, left: 0.95, size: 12, rot: -71, opacity: 0.38 },
  { top: 0.47, left: 0.97, size: 8, rot: 22, opacity: 0.3 },
  { top: 0.76, left: 0.07, size: 9, rot: -44, opacity: 0.32 },
];

// The falling layer is randomized per mount (FallingPetals seeds from
// Math.random), so there is no one true arrangement to copy — a fixed set
// standing in for one frame of it is as faithful as the source allows, and a
// preview card wants a stable image anyway. Placed clear of the copy column.
const AIRBORNE_PETALS = [
  { x: 96, y: 118, size: 13, rot: 34, opacity: 0.6 },
  { x: 168, y: 268, size: 10, rot: -52, opacity: 0.5 },
  { x: 258, y: 96, size: 15, rot: 18, opacity: 0.55 },
  { x: 214, y: 410, size: 11, rot: 74, opacity: 0.45 },
  { x: 934, y: 150, size: 12, rot: -36, opacity: 0.55 },
  { x: 1058, y: 300, size: 16, rot: 22, opacity: 0.6 },
  { x: 1004, y: 452, size: 10, rot: -64, opacity: 0.45 },
  { x: 872, y: 372, size: 9, rot: 48, opacity: 0.4 },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function blossom({
  x,
  y,
  scale = 1,
  rot = 0,
  fill = SAKURA_MID,
  center = GOLD,
  stamens = false,
  opacity = 1,
}) {
  // Same nesting as Blossom/HeroCanopy: the five petals composite as one group
  // so the overlaps don't darken into a pinwheel.
  const petals = PETAL_ANGLES.map(
    (a) => `<path d="${PETAL_PATH}" transform="rotate(${a} 20 20)"/>`
  ).join("");
  const crown = stamens
    ? STAMEN_ANGLES.map(
        (a) => `<circle cx="20" cy="15.2" r="1.15" fill="${center}" transform="rotate(${a} 20 20)"/>`
      ).join("")
    : "";
  return `<g transform="translate(${x - 20 * scale} ${y - 20 * scale}) scale(${scale}) rotate(${rot} 20 20)" opacity="${opacity}">
    <g fill="${fill}">${petals}</g>${crown}
    <circle cx="20" cy="20" r="${stamens ? 2 : 2.2}" fill="${center}"/>
  </g>`;
}

// One HeroCanopy instance. `flip` mirrors it against the right edge exactly as
// .hero-canopy--flip's scaleX(-1) does; the intrinsic 460x520 viewBox scales by
// width with height following, which is .hero-canopy svg's width:100%/height:auto.
function canopy({ width, opacity, flip }) {
  const k = width / 460;
  const place = flip ? `translate(${W} 0) scale(-1 1) scale(${k})` : `scale(${k})`;
  const strokes = [
    [CANOPY_STEM, 2.2],
    [CANOPY_BRANCH_A, 1.6],
    [CANOPY_BRANCH_B, 1.5],
  ]
    .map(([d, w]) => `<path d="${d}" stroke-width="${w}"/>`)
    .join("");
  return `<g transform="${place}" opacity="${opacity}">
    <g stroke="${BRANCH}" stroke-linecap="round" fill="none">${strokes}</g>
    ${CANOPY_BUDS.map((b) => `<circle cx="${b.x}" cy="${b.y}" r="${b.r}" fill="${SAKURA_MID}"/>`).join("")}
    ${CANOPY_BLOSSOMS.map((b) => blossom({ x: b.x, y: b.y, scale: b.s, rot: b.r })).join("")}
  </g>`;
}

function leaf({ x, y, size, rot, opacity, fill }) {
  const k = size / 24;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})" opacity="${opacity}"><path d="${LEAF_PATH}" fill="${fill}"/></g>`;
}

function buildSvg() {
  // src: src/components/Hero.css .hero — the blush pool over cream, at the
  // same 62%/55% extent centred 50%/40%.
  const wash = `<radialGradient id="wash" cx="0.5" cy="0.4" r="0.5">
      <stop offset="0" stop-color="${BLUSH}"/>
      <stop offset="0.48" stop-color="${BLUSH}" stop-opacity="0.5"/>
      <stop offset="0.78" stop-color="${BLUSH}" stop-opacity="0"/>
    </radialGradient>`;

  // src: src/styles/tokens.css --petal-texture — the same six-petal 320px tile
  // at the same 0.11 alpha, tiled here instead of via background-image.
  const texture = `<pattern id="texture" width="320" height="320" patternUnits="userSpaceOnUse">
      <g fill="#e0a0b2" fill-opacity="0.11">
        <path d="${LEAF_PATH}" transform="translate(24 40) rotate(15) scale(0.7)"/>
        <path d="${LEAF_PATH}" transform="translate(210 26) rotate(-42) scale(0.5)"/>
        <path d="${LEAF_PATH}" transform="translate(130 140) rotate(68) scale(0.85)"/>
        <path d="${LEAF_PATH}" transform="translate(280 200) rotate(124) scale(0.58)"/>
        <path d="${LEAF_PATH}" transform="translate(58 236) rotate(-68) scale(0.68)"/>
        <path d="${LEAF_PATH}" transform="translate(196 290) rotate(28) scale(0.46)"/>
      </g>
    </pattern>`;

  // Copy column, centred, laid out top-down the way .hero__copy stacks in a
  // viewport. Sizes are the hero's own at a ~1200px-wide viewport (title 7vw),
  // nudged only where a 630px-tall crop reads differently from a full screen:
  // the body runs a step larger, since a preview card is looked at small.
  const cx = W / 2;
  const markY = 142;
  const titleSize = 82;
  const titleLead = 90;
  const line1 = "Florecé en tu";
  const line2Italic = "mejor versión";
  const bodySize = 21;
  const bodyLead = 32;
  const bodyLines = [
    "Cabello, uñas, piel y maquillaje, con",
    "profesionales de confianza. Mirá el trabajo,",
    "elegí tu horario y reservá en minutos.",
  ];

  const titleY1 = markY + 44 + titleLead * 0.78;
  const titleY2 = titleY1 + titleLead;
  const bodyY = titleY2 + 62;
  const ctaCy = bodyY + (bodyLines.length - 1) * bodyLead + 74;

  // src: .hero__mark-row — two 40px gold-light rules with the 40px blossom
  // between them, on the mark's own resting -8deg tilt.
  const markRow = `<g>
    <rect x="${cx - 100}" y="${markY - 0.5}" width="40" height="1" fill="${GOLD_LIGHT}"/>
    <rect x="${cx + 60}" y="${markY - 0.5}" width="40" height="1" fill="${GOLD_LIGHT}"/>
    ${blossom({ x: cx, y: markY, scale: 1, rot: -8, fill: SAKURA_DEEP, center: GOLD, stamens: true, opacity: 0.92 })}
  </g>`;

  // src: .hero__title / .hero__title em — display serif, with the emphasis
  // phrase in the Caslon italic in cherry and the tail period back in the
  // display face.
  const title = `<text x="${cx}" y="${titleY1}" text-anchor="middle" font-family="Libre Caslon Display" font-size="${titleSize}" fill="${TAUPE}">${esc(line1)}</text>
    <text x="${cx}" y="${titleY2}" text-anchor="middle" font-size="${titleSize}"><tspan font-family="Libre Caslon Text" font-style="italic" fill="${CHERRY}">${esc(line2Italic)}</tspan><tspan font-family="Libre Caslon Display" fill="${TAUPE}">.</tspan></text>`;

  const body = bodyLines
    .map(
      (l, i) =>
        `<text x="${cx}" y="${bodyY + i * bodyLead}" text-anchor="middle" font-family="Work Sans" font-size="${bodySize}" fill="${TAUPE_SOFT}">${esc(l)}</text>`
    )
    .join("");

  // src: .hero__cta — cherry pill, white label, 1rem/1.7rem padding at the
  // 999px radius, with the arrowRight icon (src/components/Icon.jsx) at its
  // 1.75 stroke. There is no text shaper here to measure the label with, so
  // the pill's width is set by eye against the rendered PNG.
  const ctaLabel = "Reservar mi turno";
  const ctaFont = 19;
  const ctaW = 258;
  const ctaH = 60;
  const ctaX = cx - ctaW / 2;
  const iconSize = 20;
  const iconX = ctaX + ctaW - 30 - iconSize;
  const cta = `<g>
    <rect x="${ctaX}" y="${ctaCy - ctaH / 2}" width="${ctaW}" height="${ctaH}" rx="${ctaH / 2}" fill="${CHERRY}"/>
    <text x="${ctaX + 30}" y="${ctaCy + ctaFont * 0.35}" font-family="Work Sans" font-size="${ctaFont}" fill="${WHITE}">${esc(ctaLabel)}</text>
    <g transform="translate(${iconX} ${ctaCy - iconSize / 2}) scale(${iconSize / 24})" fill="none" stroke="${WHITE}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </g>
  </g>`;

  // src: .hero__fallen — inset auto 2% 5% 2%, height 24%.
  const bandX = W * 0.02;
  const bandW = W * 0.96;
  const bandH = H * 0.24;
  const bandY = H - H * 0.05 - bandH;
  const fallen = FALLEN_PETALS.map((p) =>
    leaf({
      x: bandX + p.left * bandW,
      y: bandY + p.top * bandH,
      size: p.size,
      rot: p.rot,
      opacity: p.opacity,
      fill: SAKURA_MID,
    })
  ).join("");

  const airborne = AIRBORNE_PETALS.map((p) =>
    leaf({ x: p.x, y: p.y, size: p.size, rot: p.rot, opacity: p.opacity, fill: SAKURA })
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${wash}${texture}</defs>
  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <rect width="${W}" height="${H}" fill="url(#wash)"/>
  <rect width="${W}" height="${H}" fill="url(#texture)"/>
  ${canopy({ width: 272, opacity: 0.42, flip: false })}
  ${canopy({ width: 424, opacity: 0.66, flip: true })}
  ${airborne}
  ${fallen}
  ${markRow}
  ${title}
  ${body}
  ${cta}
</svg>`;
}

// resvg does not resolve @font-face or Google's webfont CSS, so the three faces
// the hero uses are fetched as static TTFs and cached under node_modules.
// Nothing font-related is committed — only the PNG they produce.
const FONTS = {
  "LibreCaslonDisplay-Regular.ttf":
    "https://raw.githubusercontent.com/google/fonts/main/ofl/librecaslondisplay/LibreCaslonDisplay-Regular.ttf",
  "LibreCaslonText-Italic.ttf":
    "https://raw.githubusercontent.com/google/fonts/main/ofl/librecaslontext/LibreCaslonText-Italic%5Bwght%5D.ttf",
  "WorkSans.ttf": "https://raw.githubusercontent.com/google/fonts/main/ofl/worksans/WorkSans%5Bwght%5D.ttf",
};

async function fonts() {
  await mkdir(FONT_CACHE, { recursive: true });
  const paths = [];
  for (const [name, url] of Object.entries(FONTS)) {
    const file = join(FONT_CACHE, name);
    try {
      await readFile(file);
    } catch {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${name}: ${res.status} from ${url}`);
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
      console.log(`fetched ${name}`);
    }
    paths.push(file);
  }
  return paths;
}

const fontFiles = await fonts();
const png = new Resvg(buildSvg(), {
  fitTo: { mode: "width", value: W },
  font: { loadSystemFonts: false, fontFiles, defaultFontFamily: "Work Sans" },
})
  .render()
  .asPng();
await writeFile(OUT, png);
console.log(`wrote public/og-image.png (${W}x${H}, ${(png.length / 1024).toFixed(0)} KB)`);
