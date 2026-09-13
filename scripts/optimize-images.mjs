// One-off image optimization pass, run manually with `node scripts/optimize-images.mjs`.
// Not wired into the build: these are committed as regular assets afterward,
// same as every other file in src/assets.
//
// Fixes what Lighthouse's mobile "Improve image delivery" audit flagged
// (~936 KiB wasted): the portfolio grid was shipping full-resolution source
// photos (up to 1200px wide) to tiles that render at 320-536 CSS px on
// mobile, and Booking's professional avatar was reusing the same ~730px
// card photo for a 56x56 CSS px thumbnail.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ASSETS_DIR = new URL("../src/assets/", import.meta.url);

function p(url) {
  return fileURLToPath(url);
}

// Portfolio grid: 3 columns capped at 1300px total width, so the widest a
// tile ever gets is a 2-column "wide" tile (~858 CSS px); most tiles sit
// around 320-420 CSS px. 960w covers the wide desktop case at ~1.1x, 480w
// covers mobile/narrow tiles at ~1.5x — comfortably sharp on retina without
// re-shipping the original's excess resolution.
const PORTFOLIO = [
  "ritual-de-lavado",
  "peinado-con-bucles",
  "balayage",
  "brushing-profesional",
  "manicura-de-precision",
  "esmaltado-de-temporada",
  "esmaltado-natural",
  "facial-hidratante",
  "maquillaje-social",
  "maquillaje-editorial",
];

// Professional card photos: displayed at ~493-666 CSS px in Professionals.jsx,
// which the source files already roughly match — recompressed in place only,
// no resize.
const PROFESSIONALS = ["camila-reyes", "valentina-ortiz", "sofia-aguirre", "marcela-duarte"];

// Reads the source fully into memory first rather than handing sharp the
// path, and only then writes the result — sharp keeps its own handle on a
// path input until libvips' worker thread finishes with it, which raced with
// writing the *same* path right back (sporadic Windows EPERM/UNKNOWN) when
// source and destination are the same file.
async function resizeTo(srcUrl, destUrl, targetWidth, quality) {
  const input = await readFile(p(srcUrl));
  const originalWidth = (await sharp(input).metadata()).width;
  const width = Math.min(targetWidth, originalWidth);
  const buffer = await sharp(input).resize({ width }).webp({ quality }).toBuffer();
  await writeFile(p(destUrl), buffer);
}

async function recompress(srcUrl, destUrl, quality) {
  const input = await readFile(p(srcUrl));
  const buffer = await sharp(input).webp({ quality }).toBuffer();
  await writeFile(p(destUrl), buffer);
}

async function run() {
  for (const name of PORTFOLIO) {
    const src = new URL(`${name}.webp`, ASSETS_DIR);
    const dest480 = new URL(`${name}-480.webp`, ASSETS_DIR);

    await resizeTo(src, dest480, 480, 74);
    // Overwrite the original filename with the capped/recompressed 960w
    // version so every existing `import ... from "./assets/<name>.webp"`
    // keeps working unchanged — it just resolves to a much smaller file now.
    await resizeTo(src, src, 960, 76);

    console.log(`portfolio: ${name}`);
  }

  for (const name of PROFESSIONALS) {
    const src = new URL(`${name}.webp`, ASSETS_DIR);
    const destThumb = new URL(`${name}-thumb.webp`, ASSETS_DIR);

    // 56 CSS px avatar at up to 3x DPR = ~168px; 200px keeps headroom.
    await resizeTo(src, destThumb, 200, 75);
    // Recompress the full card photo in place — no resize, dimensions
    // already suit the ~493-666 CSS px display size.
    await recompress(src, src, 82);

    console.log(`professional: ${name}`);
  }
}

run();
