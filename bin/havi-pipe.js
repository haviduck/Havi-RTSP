#!/usr/bin/env node
// Standalone TCP↔WebSocket layer. Same module the gateway mounts at /tcp.
//
//   node bin/havi-pipe.js [--host 127.0.0.1] [--port 8788] [--allow cam1:554,cam2:7542] [--target host:port]
//
// Client URL: ws://127.0.0.1:8788/?host=<camera>&port=<port>
import http from "node:http";
import { attachTcpPipe, pipeTemplate } from "../src/server/tcp-pipe.js";

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log("node bin/havi-pipe.js [--host 127.0.0.1] [--port 8788] [--allow host:port,...] [--target host:port]");
  process.exit(0);
}

const host = args.host || "127.0.0.1";
const port = Number(args.port || 8788);

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("havi-pipe\n");
});

attachTcpPipe(server, {
  path: null,
  bindHost: host,
  allow: args.allow,
  target: args.target,
});

server.listen(port, host, () => {
  const extra = [
    args.target ? `pinned to ${args.target}` : "",
    args.allow ? `allow=${args.allow}` : "",
  ].filter(Boolean).join(", ");
  process.stderr.write(`[havi-tcp] listening ${pipeTemplate({ host, port, path: "/" })}${extra ? ` (${extra})` : ""}\n`);
});

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    if (key === "--help" || key === "-h") out.help = true;
    else if (key.startsWith("--") && argv[i + 1] !== undefined && !String(argv[i + 1]).startsWith("--")) {
      out[key.slice(2)] = argv[++i];
    }
  }
  return out;
}
