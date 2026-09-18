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

// Order: Direct Sockets -> same-origin /tcp layer -> WS pipe -> local host on 8787.
export function createBrowserConnect(options = {}) {
  const proxy = options.proxy || options.pipe;
  const base = options.base || (!proxy ? inferHttpBase() : "");

  return async (target) => {
    if (canDirectConnect()) {
      try {
        return await directConnect(target);
      } catch (err) {
        if (!base && !proxy) throw err;
      }
    }
    if (base && !proxy) {
      try {
        return await createHttpTransport({ base })(target);
      } catch (err) {
        try {
          return await createWebSocketTransport({ proxy: inferPipe() })(target);
        } catch {
          throw err;
        }
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
