import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { createPipeline } from "../stream/factory.js";
import { normalizeStreamUrl } from "../stream/url.js";
import { attachTcpPipe, pipeTemplate } from "./tcp-pipe.js";
import { createHttpTcpLayer } from "./tcp-http.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../../public");
const DIST_DIR = path.resolve(__dirname, "../../dist");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".json": "application/json; charset=utf-8",
};

export function createGateway(options = {}) {
  const host = options.host || "127.0.0.1";
  const port = options.port || 8787;
  const defaultUrl = options.url || "rtsp://user:pass@camera:554/path";
  const tcpEnabled = options.tcp !== false;
  const tcpPath = options.tcpPath || "/tcp";
  const pipelines = new Map();

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/health") {
      json(res, 200, {
        ok: true,
        defaultUrl,
        viewers: [...pipelines.values()].reduce((n, p) => n + p.subscribers.size, 0),
        tcp: tcpEnabled ? { http: "/tcp/open", ws: `${tcpPath}?host={host}&port={port}` } : null,
      });
      return;
    }
    if (httpTcp?.handle(req, res, url)) return;
    serveStatic(res, url.pathname);
  });

  const tcpOpts = {
    bindHost: host,
    allow: options.tcpAllow,
    target: options.tcpTarget,
  };
  const httpTcp = tcpEnabled ? createHttpTcpLayer(tcpOpts) : null;
  const tcp = tcpEnabled
    ? attachTcpPipe(server, { path: tcpPath, noServer: true, ...tcpOpts })
    : null;

  const wss = new WebSocketServer({ noServer: true });
  server.on("upgrade", (req, socket, head) => {
    const pathname = new URL(req.url, "http://x").pathname;
    const target = pathname === "/ws" ? wss : pathname === tcpPath ? tcp?.wss : null;
    if (!target) {
      socket.destroy();
      return;
    }
    target.handleUpgrade(req, socket, head, (ws) => target.emit("connection", ws, req));
  });
  wss.on("connection", async (ws, req) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    let streamUrl = defaultUrl;
    try {
      if (reqUrl.searchParams.get("url")) {
        streamUrl = normalizeStreamUrl(reqUrl.searchParams.get("url"));
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", message: err.message }));
      ws.close();
      return;
    }

    const send = (payload) => {
      if (ws.readyState !== ws.OPEN) return;
      if (Buffer.isBuffer(payload)) ws.send(payload);
      else ws.send(JSON.stringify(payload));
    };

    let pipeline = pipelines.get(streamUrl);
    if (!pipeline) {
      pipeline = createPipeline(streamUrl);
      pipelines.set(streamUrl, pipeline);
      pipeline.start().catch((err) => {
        send({ type: "error", message: err.message, recoverable: true });
      });
    }

    const unsubscribe = pipeline.subscribe(send);
    ws.on("message", (data) => {
      if (String(data) === "ping") send({ type: "pong" });
    });
    ws.on("close", async () => {
      unsubscribe();
      if (pipeline.subscribers.size === 0) {
        pipelines.delete(streamUrl);
        await pipeline.stop();
      }
    });
  });

  return {
    host,
    port,
    defaultUrl,
    pipePath: tcp ? tcp.path : null,
    listen() {
      return new Promise((resolve) => {
        server.listen(port, host, () => resolve({
          host,
          port,
          url: `http://${host}:${port}/`,
          pipe: tcp ? pipeTemplate({ host, port, path: tcp.path }) : null,
          embed: `http://${host}:${port}/embed.html`,
        }));
      });
    },
    close() {
      return new Promise((resolve) => {
        httpTcp?.close();
        tcp?.close();
        wss.close();
        server.close(() => resolve());
      });
    },
  };
}

function serveStatic(res, pathname) {
  // /dist/* and /havi-rtsp.browser.js -> browser bundle.
  const fromDist = pathname.startsWith("/dist/")
    || pathname === "/havi-rtsp.browser.js"
    || pathname === "/havi-rtsp.browser.mjs";
  const root = fromDist ? DIST_DIR : PUBLIC_DIR;
  const rel = pathname === "/"
    ? "/index.html"
    : pathname.startsWith("/dist/")
      ? pathname.slice(5)
      : pathname;
  const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, "");
  const file = path.join(root, safe);
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}
