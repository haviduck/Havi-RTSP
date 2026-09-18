import { Emitter } from "../util/emitter.js";

// HTTP TCP layer. Any host (Flask, Node, Go) that implements:
//   POST /tcp/open?host=&port=  -> { id }
//   GET  /tcp/read?id=          -> octet-stream
//   POST /tcp/write?id=         -> 204, raw body
//   POST /tcp/close?id=         -> 204

export function createHttpTransport({ base } = {}) {
  const root = resolveBase(base);
  if (!root) throw new Error("HTTP TCP layer needs a base URL");

  return async function httpConnect({ host, port }) {
    const opened = await fetch(`${root}/tcp/open?host=${encodeURIComponent(host)}&port=${Number(port) || 554}`, {
      method: "POST",
    });
    if (!opened.ok) {
      const err = new Error(`TCP layer open failed (${opened.status})`);
      err.status = opened.status;
      throw err;
    }
    const { id } = await opened.json();
    if (!id) throw new Error("TCP layer open returned no id");
    const transport = new HttpTransport(root, id);
    transport.startRead();
    return transport;
  };
}

function resolveBase(base) {
  if (base) return String(base).replace(/\/$/, "");
  if (typeof location !== "undefined" && /^https?:$/.test(location.protocol) && location.origin) {
    return location.origin;
  }
  return "";
}

class HttpTransport extends Emitter {
  constructor(root, id) {
    super();
    this.root = root;
    this.id = id;
    this.closed = false;
    this.abort = new AbortController();
    this.writes = Promise.resolve();
  }

  startRead() {
    fetch(`${this.root}/tcp/read?id=${encodeURIComponent(this.id)}`, { signal: this.abort.signal })
      .then(async (res) => {
        if (!res.ok || !res.body) {
          const err = new Error(`TCP layer read failed (${res.status})`);
          err.status = res.status;
          throw err;
        }
        const reader = res.body.getReader();
        while (!this.closed) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value?.length) this.emit("data", Buffer.from(value));
        }
      })
      .catch((err) => {
        if (this.closed || err.name === "AbortError") return;
        this.emit("error", err);
      })
      .finally(() => {
        if (!this.closed) this.emit("close");
      });
  }

  write(buf) {
    if (this.closed) throw new Error("TCP layer is closed");
    const bytes = typeof buf === "string" ? new TextEncoder().encode(buf) : buf;
    this.writes = this.writes.then(async () => {
      if (this.closed) return;
      const res = await fetch(`${this.root}/tcp/write?id=${encodeURIComponent(this.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: bytes,
      });
      if (!res.ok) throw new Error(`TCP layer write failed (${res.status})`);
    }).catch((err) => {
      if (!this.closed) this.emit("error", err);
    });
    return true;
  }

  destroy() {
    if (this.closed) return;
    this.closed = true;
    this.abort.abort();
    fetch(`${this.root}/tcp/close?id=${encodeURIComponent(this.id)}`, { method: "POST" }).catch(() => {});
  }
}
