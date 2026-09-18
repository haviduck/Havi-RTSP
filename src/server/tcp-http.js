import net from "node:net";
import { isLoopback, normalizeAllow, splitTarget } from "./tcp-pipe.js";

// Same byte layer as Flask examples/flask/tcp.py. No RTSP knowledge.

export function createHttpTcpLayer(options = {}) {
  const sessions = new Map();
  const allow = normalizeAllow(options.allow);
  const fixed = options.target ? splitTarget(options.target) : null;
  const bindHost = options.bindHost;
  const requireAllow = options.requireAllow ?? (bindHost != null && !isLoopback(bindHost));
  const log = options.log || ((text) => process.stderr.write(`[havi-tcp] ${text}\n`));

  function handle(req, res, url) {
    if (url.pathname === "/tcp/open" && req.method === "POST") {
      open(req, res, url);
      return true;
    }
    if (url.pathname === "/tcp/read" && req.method === "GET") {
      read(req, res, url);
      return true;
    }
    if (url.pathname === "/tcp/write" && req.method === "POST") {
      write(req, res, url);
      return true;
    }
    if (url.pathname === "/tcp/close" && (req.method === "POST" || req.method === "DELETE")) {
      closeSession(url.searchParams.get("id"));
      res.writeHead(204);
      res.end();
      return true;
    }
    return false;
  }

  function open(_req, res, url) {
    const target = fixed || {
      host: url.searchParams.get("host"),
      port: Number(url.searchParams.get("port") || 554),
    };
    if (!target.host || !Number.isFinite(target.port) || !target.port) {
      fail(res, 400, "host and port required");
      return;
    }
    if (requireAllow && !allow && !fixed) {
      fail(res, 403, "allow list required when not bound to localhost");
      return;
    }
    if (allow && !allow.has(`${target.host}:${target.port}`)) {
      fail(res, 403, "target not allowed");
      return;
    }

    const tcp = net.connect({ host: target.host, port: target.port });
    tcp.setNoDelay(true);
    tcp.once("error", (err) => {
      if (!res.headersSent) fail(res, 502, err.code || err.message);
    });
    tcp.once("connect", () => {
      const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      sessions.set(id, tcp);
      tcp.once("close", () => sessions.delete(id));
      log(`open  ${target.host}:${target.port} http ${id}`);
      json(res, 200, { id });
    });
  }

  function read(req, res, url) {
    const id = url.searchParams.get("id");
    const tcp = sessions.get(id);
    if (!tcp) {
      fail(res, 404, "unknown session");
      return;
    }
    res.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    });
    tcp.on("data", (chunk) => {
      if (!res.write(chunk)) tcp.pause();
    });
    res.on("drain", () => tcp.resume());
    const done = () => {
      if (!res.writableEnded) res.end();
    };
    tcp.on("end", done);
    tcp.on("close", done);
    res.on("close", () => closeSession(id));
  }

  function write(req, res, url) {
    const id = url.searchParams.get("id");
    const tcp = sessions.get(id);
    if (!tcp) {
      fail(res, 404, "unknown session");
      return;
    }
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        if (chunks.length && !tcp.destroyed) tcp.write(Buffer.concat(chunks));
        res.writeHead(204);
        res.end();
      } catch (err) {
        fail(res, 502, err.message);
      }
    });
  }

  function closeSession(id) {
    const tcp = sessions.get(id);
    if (!tcp) return;
    sessions.delete(id);
    if (!tcp.destroyed) tcp.destroy();
    log(`close ${id}`);
  }

  return {
    handle,
    close() {
      for (const id of [...sessions.keys()]) closeSession(id);
    },
  };
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function fail(res, status, message) {
  json(res, status, { error: message });
}
