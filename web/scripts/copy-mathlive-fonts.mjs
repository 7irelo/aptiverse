// Copies MathLive's KaTeX font files from node_modules into public/
// so the browser can fetch them at /mathlive-fonts/*. Runs as a
// postinstall hook so contributors don't have to think about it.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const src = path.join(webRoot, "node_modules", "mathlive", "fonts");
const dst = path.join(webRoot, "public", "mathlive-fonts");

async function main() {
  try {
    await fs.access(src);
  } catch {
    return;
  }
  await fs.mkdir(dst, { recursive: true });
  const entries = await fs.readdir(src);
  let copied = 0;
  for (const name of entries) {
    if (!name.endsWith(".woff2") && !name.endsWith(".woff") && !name.endsWith(".ttf")) continue;
    await fs.copyFile(path.join(src, name), path.join(dst, name));
    copied++;
  }
  if (copied > 0) {
    console.log(`mathlive-fonts: copied ${copied} font file${copied === 1 ? "" : "s"} → public/mathlive-fonts/`);
  }
}

main().catch((err) => {
  console.warn("mathlive-fonts copy failed:", err.message);
});
