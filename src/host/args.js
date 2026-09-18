export const HOST_DEFAULTS = { host: "127.0.0.1", port: 8787, root: "", allow: "", target: "", url: "" };

export function parseHostArgs(argv = []) {
  const out = { ...HOST_DEFAULTS, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") { out.help = true; continue; }
    if (!arg.startsWith("--")) continue;
    const eq = arg.indexOf("=");
    const key = eq > 0 ? arg.slice(2, eq) : arg.slice(2);
    const value = eq > 0 ? arg.slice(eq + 1) : argv[++i];
    if (!(key in HOST_DEFAULTS)) throw new Error(`unknown option --${key}`);
    out[key] = key === "port" ? Number(value) : String(value ?? "");
  }
  if (!Number.isFinite(out.port) || out.port <= 0) throw new Error("--port must be a number");
  return out;
}

export const HOST_HELP = `havi-rtsp host (same file as the browser script)

  deno run --allow-net --allow-read havi-rtsp.browser.js [options]

  --host 127.0.0.1     bind address (off-localhost needs --allow or --target)
  --port 8787          bind port
  --root ./public      serve this directory (default: built-in page)
  --allow host:port,…  camera targets the browser may open
  --target host:port   single fixed camera; browser cannot pick another
  --url rtsp://…       preset for the built-in page

  Routes: /tcp (WebSocket byte pipe), /tcp/open|read|write|close (HTTP byte layer), /havi-rtsp.browser.js (this file).
  No RTSP in this process. The page does RTSP, depay and remux.`;
