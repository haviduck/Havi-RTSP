// npm run build:browser -> dist/havi-rtsp.browser.js (IIFE, global HaviRtsp) + .mjs (ESM).
// Buffer comes from the `buffer` package via esbuild inject (scripts/buffer-shim.js).
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const common = {
  entryPoints: [path.join(root, "src/browser.js")],
  bundle: true,
  platform: "browser",
  target: ["es2020"],
  inject: [path.join(root, "scripts/buffer-shim.js")],
  sourcemap: true,
  legalComments: "none",
  logLevel: "info",
};

await build({ ...common, format: "iife", globalName: "HaviRtsp", define: { HAVI_HOST_AUTOSTART: "true" }, outfile: path.join(root, "dist/havi-rtsp.browser.js") });
await build({ ...common, format: "esm", define: { HAVI_HOST_AUTOSTART: "false" }, outfile: path.join(root, "dist/havi-rtsp.browser.mjs") });
