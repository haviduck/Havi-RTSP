#!/usr/bin/env node
// stdout: media. stderr: JSON control lines. Formats in src/sink/stdio.js.
import { createPipeline } from "../src/stream/factory.js";
import { normalizeStreamUrl } from "../src/stream/url.js";
import { attachStdioSink } from "../src/sink/stdio.js";

const args = parseArgs(process.argv.slice(2));
if (args.help || !args.url) {
  console.error(`Havi-RTSP remux (stdio)

  node bin/havi-remux.js --url rtsp://user:pass@host:port/path [options] > out.mp4

  --format auto|mp4|mjpeg|framed   auto = mp4 for h264/h265, mjpeg for jpeg (default auto)
  --boundary <str>                 multipart boundary for mjpeg (default havi)
  --duration <sec>                 stop after N seconds
  --timeout <sec>                  exit 2 if no "info" arrives within N seconds
  --quiet                          no control JSON on stderr (framed still carries it)

  stdout: media.  stderr: one JSON object per line ({"type":"info",...,"contentType":"..."}).
`);
  process.exit(args.help ? 0 : 1);
}

let url;
try {
  url = normalizeStreamUrl(args.url);
} catch (err) {
  console.error(JSON.stringify({ type: "error", message: err.message, fatal: true }));
  process.exit(1);
}

const pipeline = createPipeline(url);
let exiting = false;

const sink = attachStdioSink(pipeline, {
  format: args.format || "auto",
  boundary: args.boundary,
  stderr: args.quiet ? { write() {} } : process.stderr,
  onFatal: () => shutdown(3),
});

let infoTimer = null;
if (args.timeout) {
  infoTimer = setTimeout(() => {
    process.stderr.write(`${JSON.stringify({ type: "error", message: `no stream info within ${args.timeout}s`, fatal: true })}\n`);
    shutdown(2);
  }, Number(args.timeout) * 1000);
  pipeline.once("info", () => clearTimeout(infoTimer));
}

if (args.duration) setTimeout(() => shutdown(0), Number(args.duration) * 1000);

process.stdout.on("error", () => shutdown(0));
process.stdout.on("close", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
pipeline.on("error", (err) => {
  process.stderr.write(`${JSON.stringify({ type: "error", message: err.message })}\n`);
});

pipeline.start();

async function shutdown(code) {
  if (exiting) return;
  exiting = true;
  clearTimeout(infoTimer);
  sink.detach();
  try {
    await pipeline.stop();
  } catch {
    // ignore
  }
  process.stdout.end(() => process.exit(code));
  setTimeout(() => process.exit(code), 1500).unref();
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === "--help" || key === "-h") out.help = true;
    else if (key === "--quiet") out.quiet = true;
    else if (key.startsWith("--") && argv[i + 1] !== undefined) out[key.slice(2)] = argv[++i];
  }
  return out;
}
