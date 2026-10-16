// =====================================================================
// Ad export: renders every unit at /ads/units/<slug> and writes a PNG.
//
//   node scripts/export-ads.mjs                      all units
//   node scripts/export-ads.mjs --only uni-          slug substring filter
//   node scripts/export-ads.mjs --base http://host   different dev server
//   node scripts/export-ads.mjs --out ../somewhere   different output dir
//
// Output lands in web/marketing/ad-exports/ (gitignored). Nothing generated
// is committed: these are build artefacts of the code in
// src/app/(marketing)/ads/units, and that code is the source of truth.
//
// Determinism is the whole job here, so the script:
//   - sizes the viewport to the exact artboard, then clips to it, so a
//     stray scrollbar or a body margin cannot shave the edge
//   - captures at deviceScaleFactor 2, giving a real 2160x2700 file for a
//     1080x1350 unit, which is what platforms want to downscale from
//   - waits for document.fonts.ready before shooting, because the brand
//     face loads from a remote stylesheet and a capture taken mid-swap
//     silently ships Roboto metrics under a Frygia layout
//   - waits for the data-ad-ready marker the capture page sets, so a slug
//     that no longer resolves fails loudly instead of writing a blank
//   - disables animations, since several depictions share components with
//     the animated scene player
// =====================================================================

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(HERE, "..");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const BASE = (arg("base", process.env.ADS_BASE_URL ?? "http://localhost:3000")).replace(/\/$/, "");
const OUT_DIR = path.resolve(WEB_ROOT, arg("out", "marketing/ad-exports"));
const ONLY = arg("only", null);
const SCALE = Number(arg("scale", "2"));

// The unit list lives in TypeScript that this plain-node script cannot
// import. Rather than duplicate it by hand and let the two drift, the slugs
// and sizes are read straight out of units.tsx.
function readUnits() {
  const src = readFileSync(
    path.join(WEB_ROOT, "src/app/(marketing)/ads/units/units.tsx"),
    "utf8",
  );
  const units = [];
  const re =
    /slug:\s*"([^"]+)"\s*,\s*width:\s*(\d+)\s*,\s*height:\s*(\d+)\s*,\s*scheme:\s*"(\w+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    units.push({ slug: m[1], width: Number(m[2]), height: Number(m[3]), scheme: m[4] });
  }
  return units;
}

async function main() {
  const all = readUnits();
  if (all.length === 0) {
    console.error("No units parsed out of units.tsx. Did the AD_UNITS shape change?");
    process.exit(1);
  }

  const units = ONLY ? all.filter((u) => u.slug.includes(ONLY)) : all;
  if (units.length === 0) {
    console.error(`No unit slug contains "${ONLY}". Known slugs:\n  ${all.map((u) => u.slug).join("\n  ")}`);
    process.exit(1);
  }

  // Fail early and clearly if the dev server is not up, rather than writing
  // eleven screenshots of a connection error.
  try {
    const res = await fetch(`${BASE}/ads/units`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(`Cannot reach ${BASE}/ads/units (${err.message}).`);
    console.error("Start the dev server first, or pass --base http://your-host.");
    process.exit(1);
  }

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  // Three ways to get a Chromium, tried in order of how faithful they are to
  // what CI would use. The bundled headless shell is the default; the full
  // bundled build is the same engine with a real browser process; a locally
  // installed Chrome is the last resort for a machine where
  // `npx playwright install` has not run or could not finish. All three are
  // the same rendering engine, so the PNGs come out identical.
  const launchers = [
    ["bundled headless shell", () => chromium.launch()],
    ["bundled chromium", () => chromium.launch({ channel: "chromium" })],
    ["installed Chrome", () => chromium.launch({ channel: "chrome" })],
  ];
  let browser;
  for (const [label, launch] of launchers) {
    try {
      browser = await launch();
      if (label !== "bundled headless shell") console.warn(`Using ${label}.`);
      break;
    } catch (err) {
      if (!/Executable doesn't exist|Chromium distribution|not found/i.test(String(err?.message))) {
        throw err;
      }
    }
  }
  if (!browser) {
    console.error("No Chromium available. Run: npx playwright install chromium");
    process.exit(1);
  }
  const results = [];

  for (const unit of units) {
    const context = await browser.newContext({
      viewport: { width: unit.width, height: unit.height },
      deviceScaleFactor: SCALE,
      // Ad creative commits to a scheme in code. Forcing light here stops a
      // dark-mode host machine from tinting anything the theme did not pin.
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    const url = `${BASE}/ads/units/${unit.slug}`;
    await page.goto(url, { waitUntil: "networkidle" });

    // The capture page sets this only once a real unit resolved.
    await page.waitForSelector(`body[data-ad-ready="${unit.slug}"]`, { timeout: 20000 });
    await page.waitForSelector("[data-ad-artboard]", { timeout: 20000 });

    await page.addStyleTag({
      content: `*, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      /* The dev server paints its build indicator in the bottom-left corner,
         which is inside the artboard on every portrait unit. Production
         builds do not have it, but the export shoots a dev server. */
      nextjs-portal,
      [data-nextjs-toast],
      [data-nextjs-dev-tools-button],
      #__next-build-watcher { display: none !important; }`,
    });

    await page.evaluate(async () => {
      await document.fonts.ready;
      // Two frames after fonts settle: one for the relayout, one to paint it.
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });

    const buffer = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: unit.width, height: unit.height },
    });

    const file = path.join(OUT_DIR, `${unit.slug}.png`);
    await writeFile(file, buffer);
    results.push({ file, unit, bytes: buffer.length });
    console.log(
      `  ${unit.slug}.png  ${unit.width}x${unit.height} @${SCALE}x  ${(buffer.length / 1024).toFixed(0)} KB`,
    );

    await context.close();
  }

  await browser.close();
  console.log(`\n${results.length} PNG${results.length === 1 ? "" : "s"} written to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
