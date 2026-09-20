import { RtspPipeline } from "../stream/pipeline.js";
import { isHttpUrl } from "../stream/url.js";
import { normalizeRtspUrl } from "../rtsp/client.js";
import { createBrowserPlayer } from "./player.js";
import { createBrowserConnect } from "./connect.js";
import { ensureBaseStyles } from "./styles.js";
import { WorkerPipeline, canUseWorker } from "./worker-pipeline.js";

export function play(target, url, options = {}) {
  const els = resolveTarget(target, options);
  ensureBaseStyles();

  const handle = {
    player: null,
    pipeline: null,
    stop() {
      handle.player?.detach();
      const done = handle.pipeline?.stop() || Promise.resolve();
      handle.pipeline = null;
      if (els.img) {
        els.img.removeAttribute("src");
        els.img.hidden = true;
      }
      if (els.video) els.video.hidden = false;
      if (els.canvas) els.canvas.hidden = true;
      return done;
    },
  };

  const stream = String(url || "").trim();
  if (!stream) throw new Error("play() needs an RTSP or HTTP URL");

  if (isHttpUrl(stream)) {
    const img = els.img || ensureSibling(els.video, "img", "haviImg");
    els.img = img;
    if (els.video) els.video.hidden = true;
    if (els.canvas) els.canvas.hidden = true;
    img.hidden = false;
    img.alt = "";
    img.src = stream;
    options.onStatus?.("HTTP MJPEG via <img>.", "ok");
    options.onInfo?.({ family: "jpeg", codec: "mjpeg" });
    return handle;
  }

  normalizeRtspUrl(stream);

  const player = createBrowserPlayer({
    video: els.video,
    canvas: els.canvas,
    onStatus: options.onStatus || (() => {}),
    onInfo: options.onInfo || (() => {}),
  });
  const pipeline = createPipelineFor(stream, options);
  player.attach(pipeline);
  pipeline.on("error", (err) => options.onStatus?.(err.message, "err"));
  pipeline.start();
  handle.player = player;
  handle.pipeline = pipeline;
  return handle;
}

// options.worker: true  -> RTSP + depay + remux run in a dedicated Worker (this bundle loaded as
// the worker script; override with options.workerUrl). MSE stays on the main thread and receives
// transferred ArrayBuffers. Falls back to in-page when Workers are unavailable or a custom
// client.connect is supplied (a connect function cannot cross the thread boundary).
function createPipelineFor(stream, options) {
  const wantWorker = options.worker === true && !options.client?.connect;
  if (wantWorker && canUseWorker(options.workerUrl)) {
    return new WorkerPipeline(stream, options);
  }
  if (wantWorker) options.onStatus?.("Worker unavailable, running in page.", "warn");
  const connect = options.client?.connect || createBrowserConnect({
    proxy: options.proxy || options.pipe,
    base: options.base,
    preferHttp: options.preferHttp,
  });
  return new RtspPipeline(stream, {
    ...options,
    client: { connect, ...(options.client || {}) },
  });
}

export function resolveTarget(target, options = {}) {
  if (!target) throw new Error("play() needs a <video>, selector, or { video, canvas }");
  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el) throw new Error(`play() found no element for ${target}`);
    target = el;
  }
  if (target.tagName === "HAVI-PLAYER") {
    return { video: target.video, canvas: target.canvas, img: target.img };
  }
  if (typeof HTMLVideoElement !== "undefined" && target instanceof HTMLVideoElement) {
    return {
      video: target,
      canvas: options.canvas || ensureSibling(target, "canvas", "haviCanvas"),
      img: options.img || null,
    };
  }
  if (target.video) {
    return {
      video: target.video,
      canvas: target.canvas || options.canvas || ensureSibling(target.video, "canvas", "haviCanvas"),
      img: target.img || options.img || null,
    };
  }
  throw new Error("play() needs a <video> or { video, canvas }");
}

export function ensureSibling(anchor, tag, mark) {
  if (!anchor || !anchor.parentNode) {
    const el = document.createElement(tag);
    el.hidden = true;
    el.dataset[mark] = "1";
    el.className = tag === "canvas" ? "havi-canvas" : "havi-img";
    return el;
  }
  const next = anchor.nextElementSibling;
  if (next && next.dataset[mark] === "1") return next;
  const el = document.createElement(tag);
  el.hidden = true;
  el.dataset[mark] = "1";
  el.className = tag === "canvas" ? "havi-canvas" : "havi-img";
  anchor.insertAdjacentElement("afterend", el);
  return el;
}
