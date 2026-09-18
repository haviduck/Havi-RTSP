// Node entry. Registers the TCP transport as default for RtspClient.
import { tcpConnect } from "./transport/tcp.js";
import { setDefaultTransport, getDefaultTransport } from "./transport/registry.js";

if (!getDefaultTransport()) setDefaultTransport(tcpConnect);

export { RtspClient, normalizeRtspUrl } from "./rtsp/client.js";
export { tcpConnect } from "./transport/tcp.js";
export { setDefaultTransport, getDefaultTransport } from "./transport/registry.js";
export { createWebSocketTransport } from "./transport/websocket.js";
export { Emitter } from "./util/emitter.js";
export { normalizeStreamUrl, isHttpUrl } from "./stream/url.js";
export { HttpMjpegClient } from "./http/client.js";
export { parseSdp, pickH264Video, pickVideoTrack, pickAudioTrack } from "./rtsp/sdp.js";
export { parseRtp } from "./rtp/packet.js";
export { createH264Depayloader } from "./rtp/h264.js";
export { createH265Depayloader } from "./rtp/h265.js";
export { createAacDepayloader } from "./rtp/aac.js";
export { createJpegDepayloader, jpegSize } from "./rtp/jpeg.js";
export { parseSps, buildAvcC } from "./mux/sps.js";
export { parseHevcSps, buildHvcC } from "./mux/hevc.js";
export { Fmp4Muxer } from "./mux/fmp4.js";
export { AacFmp4Muxer } from "./mux/fmp4-audio.js";
export { RtspPipeline } from "./stream/pipeline.js";
export { createPipeline } from "./stream/factory.js";
export { createGateway } from "./server/gateway.js";
export { attachTcpPipe, pipeTemplate } from "./server/tcp-pipe.js";
export { createHttpTcpLayer } from "./server/tcp-http.js";
export { attachStdioSink, contentTypeFor, resolveFormat } from "./sink/stdio.js";
