// Runs INSIDE a dedicated Worker when the bundle is loaded as a worker script.
// Hosts the RtspPipeline (RTSP client, RTP depay, fMP4 remux) off the page's main thread and
// streams its payloads to the page. Protocol (see worker-pipeline.js for the main-thread side):
//   page -> worker : { type: "start", url, base, proxy, preferHttp, timeoutMs } | { type: "stop" }
//   worker -> page : { type: "bin", buf: ArrayBuffer }   kind-prefixed media/init bytes, transferred
//                    { type: "control", msg }             connecting / info / reconnect / ...
//                    { type: "error", message }           pipeline error
//                    { type: "stopped" }                  ack for "stop"
import { RtspPipeline } from "../stream/pipeline.js";
import { createBrowserConnect } from "./connect.js";

export function isWorkerScope() {
  return typeof WorkerGlobalScope !== "undefined"
    && typeof self !== "undefined"
    && self instanceof WorkerGlobalScope
    && typeof document === "undefined";
}

export function startWorkerHost(scope = self) {
  let pipeline = null;

  scope.onmessage = async (event) => {
    const msg = event.data || {};
    if (msg.type === "start") {
      await stopPipeline();
      const connect = createBrowserConnect({ base: msg.base, proxy: msg.proxy, preferHttp: msg.preferHttp });
      pipeline = new RtspPipeline(msg.url, { client: { connect, timeoutMs: msg.timeoutMs } });
      pipeline.subscribe(forward);
      pipeline.on("error", (err) => scope.postMessage({ type: "error", message: err?.message || String(err) }));
      pipeline.start();
    } else if (msg.type === "stop") {
      await stopPipeline();
      scope.postMessage({ type: "stopped" });
    }
  };

  async function stopPipeline() {
    const current = pipeline;
    pipeline = null;
    if (current) await current.stop().catch(() => {});
  }

  function forward(payload) {
    if (payload instanceof Uint8Array) {
      // Transfer, never copy twice: pooled Buffers share an ArrayBuffer, so slice those out first.
      const whole = payload.byteOffset === 0 && payload.byteLength === payload.buffer.byteLength;
      const buf = whole ? payload.buffer : payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength);
      scope.postMessage({ type: "bin", buf }, [buf]);
      return;
    }
    scope.postMessage({ type: "control", msg: payload });
  }
}
