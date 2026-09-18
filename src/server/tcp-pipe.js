import net from "node:net";
import { WebSocketServer } from "ws";
import { splitTarget, isLoopback, normalizeAllow } from "../util/target.js";

// Byte-only TCP↔WebSocket relay. No RTSP knowledge.
// Browser talks WebSocket; this side dials the camera.

export function attachTcpPipe(server, options = {}) {
  const path = options.path === undefined ? "/tcp" : options.path;
  const allow = normalizeAllow(options.allow);
  const fixed = options.target ? splitTarget(options.target) : null;
  const bindHost = options.bindHost;
  const requireAllow = options.requireAllow ?? (bindHost != null && !isLoopback(bindHost));
  const log = options.log || defaultLog;

  // noServer: caller routes upgrades (needed when the http server hosts more than one WebSocketServer).
  const wssOpts = options.noServer ? { noServer: true } : { server };
  if (path && !options.noServer) wssOpts.path = path;
  const wss = new WebSocketServer(wssOpts);
  let active = 0;

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url, "http://x");
    const target = fixed || {
      host: url.searchParams.get("host"),
      port: Number(url.searchParams.get("port") || 554),
    };
    if (!target.host || !Number.isFinite(target.port) || !target.port) {
      ws.close(1008, "host and port required");
      return;
    }
    if (requireAllow && !allow && !fixed) {
      ws.close(1008, "allow list required when not bound to localhost");
      return;
    }
    if (allow && !allow.has(`${target.host}:${target.port}`)) {
      ws.close(1008, "target not allowed");
      return;
    }

    const tcp = net.connect({ host: target.host, port: target.port });
    tcp.setNoDelay(true);
    active += 1;
    log(`open  ${target.host}:${target.port} (${active} active)`);

    tcp.on("data", (chunk) => {
      if (ws.readyState === ws.OPEN) ws.send(chunk);
    });
    ws.on("message", (data) => {
      if (!tcp.destroyed) tcp.write(Buffer.isBuffer(data) ? data : Buffer.from(data));
    });

    let finished = false;
    const done = (why) => {
      if (finished) return;
      finished = true;
      if (!tcp.destroyed) tcp.destroy();
      if (ws.readyState === ws.OPEN || ws.readyState === ws.CONNECTING) ws.close();
      active = Math.max(0, active - 1);
      log(`close ${target.host}:${target.port} ${why} (${active} active)`);
    };
    tcp.on("error", (err) => done(err.code || err.message));
    tcp.on("close", () => done("tcp closed"));
    ws.on("close", () => done("ws closed"));
    ws.on("error", () => done("ws error"));
  });

  return {
    path: path || "/",
    wss,
    close() {
      return new Promise((resolve) => wss.close(() => resolve()));
    },
  };
}

export function pipeTemplate({ host = "127.0.0.1", port = 8787, path = "/tcp", secure = false } = {}) {
  const scheme = secure ? "wss" : "ws";
  const suffix = path && path !== "/" ? path : "/";
  return `${scheme}://${host}:${port}${suffix}?host={host}&port={port}`;
}

export { splitTarget, isLoopback, normalizeAllow } from "../util/target.js";

function defaultLog(text) {
  process.stderr.write(`[havi-tcp] ${text}\n`);
}
