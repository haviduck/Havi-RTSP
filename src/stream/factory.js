// Node factory: TCP transport + HTTP MJPEG client. Browser equivalent is src/browser.js.
import { RtspPipeline } from "./pipeline.js";
import { HttpMjpegClient } from "../http/client.js";
import { tcpConnect } from "../transport/tcp.js";
import { setDefaultTransport, getDefaultTransport } from "../transport/registry.js";

if (!getDefaultTransport()) setDefaultTransport(tcpConnect);

export function createPipeline(url, options = {}) {
  return new RtspPipeline(url, {
    createHttpClient: (u) => new HttpMjpegClient(u),
    ...options,
    client: { connect: tcpConnect, ...(options.client || {}) },
  });
}
