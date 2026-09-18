#!/usr/bin/env node
import { createGateway } from "../src/server/gateway.js";

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(`Havi-RTSP

  node bin/havi-rtsp.js --url rtsp://user:pass@host:port/path [--host 127.0.0.1] [--port 8787]
                        [--allow cam:554,cam2:7542] [--tcp-target host:port] [--no-tcp]
`);
  process.exit(0);
}

const gateway = createGateway({
  url: args.url || "rtsp://user:pass@camera:554/path",
  host: args.host || "127.0.0.1",
  port: Number(args.port || 8787),
  tcp: !args.noTcp,
  tcpAllow: args.allow,
  tcpTarget: args["tcp-target"],
});

const info = await gateway.listen();
console.log(`source  ${gateway.defaultUrl}`);
console.log(`demo    ${info.url}`);
if (info.pipe) console.log(`layer   ${info.pipe}`);
console.log(`embed   ${info.embed}`);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === "--help" || key === "-h") out.help = true;
    else if (key === "--no-tcp") out.noTcp = true;
    else if (key.startsWith("--") && argv[i + 1] !== undefined && !String(argv[i + 1]).startsWith("--")) {
      out[key.slice(2)] = argv[++i];
    }
  }
  return out;
}
