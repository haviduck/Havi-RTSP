// TCP byte host on Deno: `deno run --allow-net --allow-read dist/havi-rtsp.browser.js`.
// Routes match src/transport/websocket.js and src/transport/http.js. No RTSP here.
import { checkTarget, isLoopback, normalizeAllow, splitTarget, targetFromQuery } from "../util/target.js";
import { parseHostArgs, HOST_HELP } from "./args.js";
import { builtinPage } from "./page.js";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".gif": "image/gif",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".map": "application/json", ".webmanifest": "application/manifest+json",
};

export function isDenoHost() {
  return typeof globalThis.Deno?.serve === "function" && typeof document === "undefined";
}

export async function startDenoHost(argv = globalThis.Deno?.args || []) {
  const D = globalThis.Deno;
  if (!D) throw new Error("startDenoHost needs Deno");
  let opts;
  try {
    opts = parseHostArgs(argv);
  } catch (err) {
    console.error(err.message);
    console.error(HOST_HELP);
    D.exit(2);
  }
  if (opts.help) { console.log(HOST_HELP); return null; }

  const allow = normalizeAllow(opts.allow);
  const fixed = opts.target ? splitTarget(opts.target) : null;
  const requireAllow = !isLoopback(opts.host);
  const policy = { allow, fixed, requireAllow };
  const sessions = new Map();
  const log = (text) => console.error(`[havi-host] ${text}`);
  const selfBytes = await readSelf(D);

  async function dial(url) {
    const target = targetFromQuery(url, fixed);
    const reason = checkTarget(target, policy);
    if (reason) return { error: reason, status: reason === "host and port required" ? 400 : 403 };
    try {
      const conn = await D.connect({ hostname: target.host, port: target.port });
      try { conn.setNoDelay(true); } catch { /* not all conns */ }
      return { conn, target };
    } catch (err) {
      return { error: err.message, status: 502 };
    }
  }

  function handleWs(req, url) {
    const { socket, response } = D.upgradeWebSocket(req);
    socket.binaryType = "arraybuffer";
    // Queue client bytes until the camera dial completes.
    let writer = null;
    let finished = false;
    let done = () => { finished = true; };
    const pending = [];
    socket.onmessage = (e) => {
      const bytes = typeof e.data === "string" ? new TextEncoder().encode(e.data) : new Uint8Array(e.data);
      if (writer) writer.write(bytes).catch((err) => done(err.message));
      else pending.push(bytes);
    };
    socket.onclose = () => done("ws closed");
    socket.onerror = () => done("ws error");
    socket.onopen = async () => {
      const d = await dial(url);
      if (finished) { if (d.conn) try { d.conn.close(); } catch { /* closed */ } return; }
      if (d.error) { socket.close(1008, d.error); return; }
      const { conn, target } = d;
      log(`open  ${target.host}:${target.port} ws`);
      writer = conn.writable.getWriter();
      done = (why) => {
        if (finished) return;
        finished = true;
        writer.close().catch(() => {});
        try { conn.close(); } catch { /* closed */ }
        if (socket.readyState <= 1) socket.close();
        log(`close ${target.host}:${target.port} ${why}`);
      };
      for (const bytes of pending.splice(0)) writer.write(bytes).catch((err) => done(err.message));
      pump(conn.readable, (chunk) => { if (socket.readyState === 1) socket.send(chunk); }).then(() => done("tcp closed"), (err) => done(err.message));
    };
    return response;
  }

  async function handleHttpTcp(req, url) {
    const id = url.searchParams.get("id");
    if (url.pathname === "/tcp/open" && req.method === "POST") {
      const d = await dial(url);
      if (d.error) return json({ error: d.error }, d.status);
      const sid = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
      const s = { conn: d.conn, writer: d.conn.writable.getWriter(), target: d.target };
      sessions.set(sid, s);
      log(`open  ${d.target.host}:${d.target.port} http ${sid}`);
      return json({ id: sid });
    }
    const s = sessions.get(id);
    if (!s) return json({ error: "unknown session" }, 404);
    if (url.pathname === "/tcp/read" && req.method === "GET") {
      req.signal?.addEventListener("abort", () => closeSession(id, "read aborted"));
      const body = s.conn.readable.pipeThrough(new TransformStream({ flush: () => closeSession(id, "tcp closed") }));
      return new Response(body, { headers: { "content-type": "application/octet-stream", "cache-control": "no-store", "x-accel-buffering": "no" } });
    }
    if (url.pathname === "/tcp/write" && req.method === "POST") {
      const bytes = new Uint8Array(await req.arrayBuffer());
      try {
        if (bytes.length) await s.writer.write(bytes);
        return new Response(null, { status: 204 });
      } catch (err) {
        closeSession(id, err.message);
        return json({ error: err.message }, 502);
      }
    }
    if (url.pathname === "/tcp/close" && (req.method === "POST" || req.method === "DELETE")) {
      closeSession(id, "closed by client");
      return new Response(null, { status: 204 });
    }
    return json({ error: "not found" }, 404);
  }

  function closeSession(id, why) {
    const s = sessions.get(id);
    if (!s) return;
    sessions.delete(id);
    s.writer.close().catch(() => {});
    try { s.conn.close(); } catch { /* closed */ }
    log(`close ${s.target.host}:${s.target.port} ${why}`);
  }

  async function handleStatic(url) {
    if (url.pathname === "/havi-rtsp.browser.js" && selfBytes) {
      return new Response(selfBytes, { headers: { "content-type": TYPES[".js"], "cache-control": "no-store" } });
    }
    if (opts.root) {
      const rel = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/index.html";
      if (!rel.includes("..")) {
        const file = `${opts.root.replace(/[\\/]+$/, "")}${rel.split("/").join("/")}`;
        try {
          const bytes = await D.readFile(file);
          const ext = rel.slice(rel.lastIndexOf(".")).toLowerCase();
          return new Response(bytes, { headers: { "content-type": TYPES[ext] || "application/octet-stream" } });
        } catch { /* fall through */ }
      }
    }
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(builtinPage({ url: opts.url }), { headers: { "content-type": TYPES[".html"] } });
    }
    return new Response("not found", { status: 404 });
  }

  const server = D.serve({
    hostname: opts.host,
    port: opts.port,
    onListen: ({ hostname, port }) => {
      log(`listening http://${hostname}:${port}/  (ws pipe /tcp, http layer /tcp/open)`);
      if (requireAllow && !allow && !fixed) log("warning: bound off localhost without --allow or --target; camera opens will be refused");
    },
  }, async (req) => {
    const url = new URL(req.url);
    if (url.pathname === "/tcp" && req.headers.get("upgrade")?.toLowerCase() === "websocket") return handleWs(req, url);
    if (url.pathname.startsWith("/tcp/")) return handleHttpTcp(req, url);
    return handleStatic(url);
  });
  return server;
}

async function pump(readable, onChunk) {
  const reader = readable.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) return;
      if (value?.byteLength) onChunk(value);
    }
  } finally {
    reader.releaseLock();
  }
}

async function readSelf(D) {
  try {
    const main = D.mainModule || "";
    if (main.startsWith("file:")) return await D.readFile(new URL(main));
  } catch { /* compiled binary or no read permission */ }
  return null;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}
