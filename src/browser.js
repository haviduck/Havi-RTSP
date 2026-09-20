// Browser entry. scripts/build-browser.mjs -> dist/havi-rtsp.browser.{js,mjs} (global HaviRtsp).
// Must not import node:* modules. Also runs under Deno as the TCP host (src/host/deno.js).
import { RtspPipeline } from "./stream/pipeline.js";
import { setDefaultTransport, getDefaultTransport } from "./transport/registry.js";
import { createBrowserConnect, inferPipe, GATEWAY_PIPE } from "./browser/connect.js";
import { defineHaviPlayer } from "./browser/element.js";
import { autoload } from "./browser/autoload.js";
import { isDenoHost, startDenoHost } from "./host/deno.js";
import { isWorkerScope, startWorkerHost } from "./browser/worker-host.js";

export const DEFAULT_PIPE = GATEWAY_PIPE;

let currentLayer = {};

export function configureLayer(options = {}) {
  currentLayer = options || {};
  setDefaultTransport(createBrowserConnect(currentLayer));
}

export function configurePipe(proxy) {
  configureLayer({ proxy: proxy || inferPipe() });
}

export function createPipeline(url, options = {}) {
  const connect = options.client?.connect || createBrowserConnect({
    ...currentLayer,
    proxy: options.proxy || currentLayer.proxy,
    base: options.base || currentLayer.base,
    preferHttp: options.preferHttp ?? currentLayer.preferHttp,
  });
  return new RtspPipeline(url, {
    ...options,
    client: { connect, ...(options.client || {}) },
  });
}

if (!getDefaultTransport()) configureLayer();
defineHaviPlayer();
autoload();

// HAVI_HOST_AUTOSTART: defined by scripts/build-browser.mjs (IIFE true, ESM false).
if (typeof HAVI_HOST_AUTOSTART !== "undefined" && HAVI_HOST_AUTOSTART && isDenoHost()) {
  startDenoHost();
}

// Loaded as `new Worker(bundleUrl)` by play({ worker: true }): host the pipeline off-thread.
if (isWorkerScope()) startWorkerHost();

export { RtspPipeline } from "./stream/pipeline.js";
export { RtspClient, normalizeRtspUrl } from "./rtsp/client.js";
export { normalizeStreamUrl, isHttpUrl } from "./stream/url.js";
export { createWebSocketTransport } from "./transport/websocket.js";
export { setDefaultTransport, getDefaultTransport } from "./transport/registry.js";
export { createBrowserPlayer } from "./browser/player.js";
export { play } from "./browser/play.js";
export { inferPipe, inferHttpBase, createBrowserConnect, GATEWAY_PIPE, STANDALONE_PIPE } from "./browser/connect.js";
export { createHttpTransport } from "./transport/http.js";
export { canDirectConnect, directConnect, directSocketsStatus, explainDirectSockets } from "./transport/direct.js";
export { isDenoHost, startDenoHost } from "./host/deno.js";
export { WorkerPipeline, canUseWorker, defaultWorkerUrl } from "./browser/worker-pipeline.js";
export { isWorkerScope, startWorkerHost } from "./browser/worker-host.js";
export { HaviPlayerElement } from "./browser/element.js";
export { parseSdp, pickVideoTrack, pickAudioTrack } from "./rtsp/sdp.js";
export { parseRtp } from "./rtp/packet.js";
export { Fmp4Muxer } from "./mux/fmp4.js";
export { AacFmp4Muxer } from "./mux/fmp4-audio.js";
export { Emitter } from "./util/emitter.js";
