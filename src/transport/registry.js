// Transport contract used by RtspClient:
//   connect({ host, port, url }) -> Promise<Transport>
//   Transport: write(Buffer), destroy(), on("data" | "error" | "close", fn)
// Node registers tcp.js (src/index.js, src/stream/factory.js). Browser registers websocket.js (src/browser.js).

let defaultConnect = null;

export function setDefaultTransport(connect) {
  defaultConnect = connect;
}

export function getDefaultTransport() {
  return defaultConnect;
}
