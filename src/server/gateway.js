import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { createPipeline } from "../stream/factory.js";
import { normalizeStreamUrl } from "../stream/url.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../../public");

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
  const pipelines = new Map();

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/health") {
      json(res, 200, { ok: true, defaultUrl, viewers: [...pipelines.values()].reduce((n, p) => n + p.subscribers.size, 0) });
      return;
    }
    serveStatic(res, url.pathname);
  });

  const wss = new WebSocketServer({ server, path: "/ws" });
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
    listen() {
      return new Promise((resolve) => {
        server.listen(port, host, () => resolve({ host, port, url: `http://${host}:${port}/` }));
      });
    },
    close() {
      return new Promise((resolve) => {
        wss.close();
        server.close(() => resolve());
      });
    },
  };
}

function serveStatic(res, pathname) {
  const rel = pathname === "/" ? "/index.html" : pathname;
  const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, "");
  const file = path.join(PUBLIC_DIR, safe);
  if (!file.startsWith(PUBLIC_DIR)) {
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
