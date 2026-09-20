import { createWebSocketTransport } from "../transport/websocket.js";
import { createHttpTransport } from "../transport/http.js";
import { canDirectConnect, directConnect, explainDirectSockets } from "../transport/direct.js";

export const GATEWAY_PIPE = "ws://127.0.0.1:8787/tcp?host={host}&port={port}";
export const STANDALONE_PIPE = "ws://127.0.0.1:8788/?host={host}&port={port}";

export function inferPipe() {
  if (typeof location !== "undefined" && /^https?:$/.test(location.protocol) && location.host) {
    const scheme = location.protocol === "https:" ? "wss:" : "ws:";
    return `${scheme}//${location.host}/tcp?host={host}&port={port}`;
  }
  return GATEWAY_PIPE;
}

export function inferHttpBase() {
  if (typeof location !== "undefined" && /^https?:$/.test(location.protocol) && location.origin) {
    return location.origin;
  }
  return "";
}

// The WS pipe that lives next to an HTTP /tcp layer: "http(s)://host/prefix" -> "ws(s)://host/prefix/tcp?...".
export function pipeFromBase(base) {
  const trimmed = String(base || "").replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(trimmed)) return "";
  return `${trimmed.replace(/^http/i, "ws")}/tcp?host={host}&port={port}`;
}

// Order: Direct Sockets -> WS pipe next to the base -> HTTP /tcp layer at the base -> WS pipe on the
// page host -> local host on 8787.
//
// WS before HTTP on purpose: the HTTP contract holds one long-lived GET /tcp/read per player, and a
// browser caps HTTP/1.1 at 6 connections per origin. A page with several players plus EventSource
// streams exhausts that pool and the last player's /tcp/open never gets through ("OPTIONS timed out").
// A WebSocket is outside that cap. Hosts without a WS route (the Flask example) refuse the upgrade
// at once and we fall through to HTTP. `preferHttp: true` restores the HTTP-first order.
export function createBrowserConnect(options = {}) {
  const proxy = options.proxy || options.pipe;
  const base = options.base || (!proxy ? inferHttpBase() : "");
  const preferHttp = options.preferHttp === true;

  return async (target) => {
    if (canDirectConnect()) {
      try {
        return await directConnect(target);
      } catch (err) {
        if (!base && !proxy) throw err;
      }
    }
    if (base && !proxy) {
      const basePipe = pipeFromBase(base);
      if (basePipe && !preferHttp) {
        try {
          return await createWebSocketTransport({ proxy: basePipe })(target);
        } catch {
          // no WS route at this base; the HTTP layer below is the contract every host has
        }
      }
      try {
        return await createHttpTransport({ base })(target);
      } catch (err) {
        const fallbacks = [];
        if (basePipe && preferHttp) fallbacks.push(basePipe);
        const pagePipe = inferPipe();
        if (pagePipe !== basePipe) fallbacks.push(pagePipe);
        for (const pipe of fallbacks) {
          try {
            return await createWebSocketTransport({ proxy: pipe })(target);
          } catch {
            // try the next one
          }
        }
        throw err;
      }
    }
    if (proxy) return createWebSocketTransport({ proxy })(target);
    try {
      return await createWebSocketTransport({ proxy: GATEWAY_PIPE })(target);
    } catch (err) {
      throw new Error(`${explainDirectSockets()} No local host at ${GATEWAY_PIPE.split("?")[0]}. ${err.message}`);
    }
  };
}
