import { Emitter } from "../util/emitter.js";

// Direct Sockets (TCPSocket). Present only in browser contexts that grant it; a normal tab does not.

export function directSocketsStatus() {
  const g = globalThis;
  const fp = typeof document !== "undefined" ? document.featurePolicy || document.permissionsPolicy : null;
  let policy = null;
  if (fp && typeof fp.allowsFeature === "function") {
    try { policy = fp.allowsFeature("direct-sockets"); } catch { policy = null; }
  }
  return {
    tcp: typeof g.TCPSocket === "function",
    udp: typeof g.UDPSocket === "function",
    crossOriginIsolated: Boolean(g.crossOriginIsolated),
    policy,
    origin: typeof location !== "undefined" ? location.origin : "",
  };
}

export function canDirectConnect() {
  return typeof globalThis.TCPSocket === "function";
}

export function explainDirectSockets() {
  if (canDirectConnect()) return "Direct Sockets available.";
  return "This page has no raw TCP. Serve it from a host with a /tcp layer, or run the local host (deno run --allow-net --allow-read havi-rtsp.browser.js).";
}

export async function directConnect({ host, port }) {
  const TCPSocket = globalThis.TCPSocket;
  if (!TCPSocket) throw new Error(explainDirectSockets());
  let socket;
  try {
    socket = new TCPSocket(String(host), Number(port), { noDelay: true });
  } catch (err) {
    throw wrapError(err, host, port);
  }
  let opened;
  try {
    opened = await socket.opened;
  } catch (err) {
    throw wrapError(err, host, port);
  }
  return new DirectTransport(socket, opened);
}

function wrapError(err, host, port) {
  const base = `${host}:${port}`;
  if (err?.name === "NotAllowedError") return new Error(`Direct Sockets blocked for ${base}: ${err.message}`);
  if (err?.name === "NetworkError") return new Error(`TCP connect to ${base} failed: ${err.message}`);
  return err instanceof Error ? err : new Error(String(err));
}

class DirectTransport extends Emitter {
  constructor(socket, opened) {
    super();
    this.socket = socket;
    this.remoteAddress = opened.remoteAddress;
    this.remotePort = opened.remotePort;
    this.writer = opened.writable.getWriter();
    this.reader = opened.readable.getReader();
    this.closed = false;
    this.#read();
    socket.closed.then(() => this.#finish(), (err) => this.#finish(err));
  }

  write(buf) {
    if (this.closed) return Promise.resolve();
    const bytes = typeof buf === "string" ? new TextEncoder().encode(buf) : toBytes(buf);
    return this.writer.write(bytes).catch((err) => {
      if (!this.closed) this.emit("error", err);
    });
  }

  destroy() {
    if (this.closed) return;
    this.writer.close().catch(() => {});
    this.reader.cancel().catch(() => {});
    this.socket.close().catch(() => {});
    this.#finish();
  }

  async #read() {
    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value && value.byteLength) this.emit("data", Buffer.from(value.buffer, value.byteOffset, value.byteLength));
      }
      this.#finish();
    } catch (err) {
      this.#finish(err);
    }
  }

  #finish(err) {
    if (this.closed) return;
    this.closed = true;
    if (err && err.name !== "AbortError") this.emit("error", err);
    this.emit("close");
  }
}

function toBytes(buf) {
  if (buf instanceof Uint8Array) return buf;
  if (ArrayBuffer.isView(buf)) return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  if (buf instanceof ArrayBuffer) return new Uint8Array(buf);
  return new Uint8Array(buf);
}
