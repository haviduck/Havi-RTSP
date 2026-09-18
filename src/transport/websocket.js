import { Emitter } from "../util/emitter.js";

// WebSocket to a TCP<->WS byte pipe (bin/havi-pipe.js, examples/pipe/pipe.py, websockify).
//
// `proxy`: template string with optional {host} {port} placeholders, or ({ host, port, url }) => string.
//   "ws://127.0.0.1:8788/?host={host}&port={port}"   per-camera pipe
//   "ws://127.0.0.1:8788/"                            fixed target
export function createWebSocketTransport({ proxy, WebSocketImpl } = {}) {
  if (!proxy) throw new Error("WebSocket transport needs a proxy URL");
  const WS = WebSocketImpl || globalThis.WebSocket;
  if (!WS) throw new Error("No WebSocket implementation available");

  return function wsConnect(target) {
    const url = typeof proxy === "function" ? proxy(target) : fillTemplate(proxy, target);
    return new Promise((resolve, reject) => {
      const ws = new WS(url);
      ws.binaryType = "arraybuffer";
      const transport = new WsTransport(ws);
      let opened = false;
      ws.onopen = () => {
        opened = true;
        resolve(transport);
      };
      ws.onerror = () => {
        const err = new Error(`WebSocket pipe failed (${url})`);
        if (!opened) reject(err);
        transport.emit("error", err);
      };
      ws.onclose = () => {
        if (!opened) reject(new Error(`WebSocket pipe closed before open (${url})`));
        transport.emit("close");
      };
      ws.onmessage = (event) => {
        const data = event.data;
        if (data instanceof ArrayBuffer) transport.emit("data", Buffer.from(data));
        else if (typeof data === "string") transport.emit("data", Buffer.from(data, "latin1"));
        else if (data?.arrayBuffer) data.arrayBuffer().then((ab) => transport.emit("data", Buffer.from(ab)));
      };
    });
  };
}

class WsTransport extends Emitter {
  constructor(ws) {
    super();
    this.ws = ws;
  }

  write(buf) {
    if (this.ws.readyState !== 1) throw new Error("WebSocket pipe not open");
    this.ws.send(buf);
  }

  destroy() {
    try {
      this.ws.close();
    } catch {
      // already closed
    }
  }
}

function fillTemplate(template, { host, port }) {
  return String(template)
    .replace("{host}", encodeURIComponent(host))
    .replace("{port}", String(port));
}
