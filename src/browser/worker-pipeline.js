// Main-thread proxy for a pipeline that runs in a Worker (worker-host.js). Same surface the
// browser player needs from RtspPipeline: subscribe(send), start(), stop(), on("error").
// The worker script is this very bundle; its URL is captured from the <script> tag at load time.
import { Emitter } from "../util/emitter.js";

const SCRIPT_URL = (typeof document !== "undefined" && document.currentScript && document.currentScript.src)
  ? document.currentScript.src
  : null;

const STOP_ACK_TIMEOUT_MS = 800;

export function defaultWorkerUrl() {
  return SCRIPT_URL;
}

export function canUseWorker(workerUrl = SCRIPT_URL) {
  return typeof Worker === "function" && !!workerUrl;
}

export class WorkerPipeline extends Emitter {
  constructor(url, options = {}) {
    super();
    this.url = url;
    this.options = options;
    this.workerUrl = options.workerUrl || SCRIPT_URL;
    this.worker = null;
    this.subscribers = new Set();
    this.running = false;
    this.stats = { frames: 0, bytes: 0, startedAt: Date.now(), reconnects: 0 };
  }

  start() {
    if (this.running) return;
    if (!canUseWorker(this.workerUrl)) throw new Error("Web Workers are not available here");
    this.running = true;
    this.worker = new Worker(this.workerUrl);
    this.worker.onmessage = (event) => this.#onMessage(event.data || {});
    this.worker.onerror = (event) => {
      this.emit("error", new Error(event?.message || "RTSP worker failed"));
    };
    this.worker.postMessage({
      type: "start",
      url: this.url,
      base: this.options.base,
      proxy: this.options.proxy || this.options.pipe,
      preferHttp: this.options.preferHttp === true,
      timeoutMs: this.options.client?.timeoutMs,
    });
  }

  subscribe(send) {
    this.subscribers.add(send);
    return () => this.subscribers.delete(send);
  }

  stop() {
    this.running = false;
    for (const send of this.subscribers) {
      try { send({ type: "ended" }); } catch { /* ignore */ }
    }
    this.subscribers.clear();
    const worker = this.worker;
    this.worker = null;
    if (!worker) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => { clearTimeout(timer); worker.terminate(); resolve(); };
      const timer = setTimeout(done, STOP_ACK_TIMEOUT_MS);
      worker.onmessage = (event) => { if (event.data?.type === "stopped") done(); };
      try { worker.postMessage({ type: "stop" }); } catch { done(); }
    });
  }

  #onMessage(msg) {
    if (!this.running) return;
    if (msg.type === "bin") {
      const bytes = new Uint8Array(msg.buf);
      this.stats.bytes += bytes.length;
      this.#send(bytes);
    } else if (msg.type === "control") {
      if (msg.msg?.type === "reconnect") this.stats.reconnects += 1;
      this.#send(msg.msg);
    } else if (msg.type === "error") {
      this.emit("error", new Error(msg.message));
    }
  }

  #send(payload) {
    for (const send of this.subscribers) {
      try { send(payload); } catch { this.subscribers.delete(send); }
    }
  }
}
