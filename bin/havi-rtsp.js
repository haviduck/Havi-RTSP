#!/usr/bin/env node
import { createGateway } from "../src/server/gateway.js";

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(`Havi-RTSP

  node bin/havi-rtsp.js --url rtsp://user:pass@host:port/path [--host 127.0.0.1] [--port 8787]
`);
  process.exit(0);
}

const gateway = createGateway({
  url: args.url || "rtsp://user:pass@camera:554/path",
  host: args.host || "127.0.0.1",
  port: Number(args.port || 8787),
});

const info = await gateway.listen();
console.log(`source  ${gateway.defaultUrl}`);
console.log(`demo    ${info.url}`);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === "--help" || key === "-h") out.help = true;
    else if (key.startsWith("--") && argv[i + 1]) out[key.slice(2)] = argv[++i];
  }
  return out;
}
