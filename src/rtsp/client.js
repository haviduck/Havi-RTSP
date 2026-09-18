import { EventEmitter } from "node:events";
import net from "node:net";
import { URL } from "node:url";
import { parseRtp } from "../rtp/packet.js";
import { createH264Depayloader, isIdr } from "../rtp/h264.js";
import { createH265Depayloader, isHevcKeyframe } from "../rtp/h265.js";
import { pickVideoTrack, pickAudioTrack, parseSdp, resolveControlUrl } from "./sdp.js";
import { createJpegDepayloader } from "../rtp/jpeg.js";
import { authorize, credentialsFromUrl } from "./auth.js";
import { buildRequest, parseRtspMessage, sessionId, sessionTimeoutMs } from "./protocol.js";

const USER_AGENT = "Havi-RTSP/1.0";

export class RtspClient extends EventEmitter {
  constructor(url, options = {}) {
    super();
    this.url = normalizeRtspUrl(url);
    this.options = options;
    this.credentials = credentialsFromUrl(this.url);
    this.digestNc = 1;
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.cseq = 1;
    this.pending = new Map();
    this.session = null;
    this.track = null;
    this.audioTrack = null;
    this.audioChannel = null;
    this.audioDepay = null;
    this.sdp = null;
    this.closed = false;
    this.keepAlive = null;
    this.depay = null;
    this.jpegDepay = null;
    this.accessUnit = null;
    this.sniffed = 0;
    this.authHeader = null;
  }

  async play() {
    const parsed = new URL(this.url);
    const port = Number(parsed.port) || 554;
    await this.#connect(parsed.hostname, port);
    await this.request("OPTIONS", this.url);
    const describe = await this.request("DESCRIBE", this.url, {
      Accept: "application/sdp",
    });
    this.sdp = parseSdp(describe.body);
    this.track = pickVideoTrack(this.sdp);
    if (!this.track) {
      throw new Error("RTSP DESCRIBE succeeded but SDP has no video track.");
    }
    this.#installDepay(this.track.family, this.track.donl);
    const contentBase = describe.headers["content-base"] || this.url;
    const controlUrl = resolveControlUrl(contentBase, this.url, this.track.control);
    const setup = await this.request("SETUP", controlUrl, {
      Transport: "RTP/AVP/TCP;unicast;interleaved=0-1",
    });
    this.session = sessionId(setup.headers.session);
    if (!this.session) throw new Error("RTSP SETUP did not return a session");
    this.audioTrack = pickAudioTrack(this.sdp);
    if (this.audioTrack?.family === "aac") {
      try {
        const audioUrl = resolveControlUrl(contentBase, this.url, this.audioTrack.control);
        await this.request("SETUP", audioUrl, {
          Transport: "RTP/AVP/TCP;unicast;interleaved=2-3",
          Session: this.session,
        });
        this.audioChannel = 2;
        this.audioDepay = createAacDepayloader(this.audioTrack);
      } catch {
        this.audioTrack = null;
        this.audioChannel = null;
        this.audioDepay = null;
      }
    } else {
      this.audioTrack = null;
    }
    const playUrl = (contentBase || this.url).replace(/\/?$/, "/");
    await this.request("PLAY", playUrl, {
      Session: this.session,
      Range: "npt=0.000-",
    });
    this.#startKeepAlive(sessionTimeoutMs(setup.headers.session));
    this.emit("ready", {
      url: this.url,
      track: this.track,
      sdp: this.sdp,
    });
  }

  async close() {
    if (this.closed) return;
    this.closed = true;
    if (this.keepAlive) clearInterval(this.keepAlive);
    try {
      if (this.socket && this.session) {
        await this.request("TEARDOWN", this.url, { Session: this.session });
      }
    } catch {
      // already gone
    }
    this.socket?.destroy();
    this.emit("close");
  }

  async request(method, uri, headers = {}) {
    const msg = await this.#rawRequest(method, uri, headers);
    if (msg.status === 401) {
      const header = msg.headers["www-authenticate"];
      this.authHeader = authorize({
        method,
        uri,
        header,
        credentials: this.credentials,
        nc: this.digestNc++,
      });
      if (!this.authHeader) {
        throw new Error("Camera returned 401. Put credentials in the URL: rtsp://user:pass@host/path");
      }
      const retry = await this.#rawRequest(method, uri, headers);
      if (retry.status >= 200 && retry.status < 300) return retry;
      throw new Error(`${retry.statusLine}\n${retry.body}`);
    }
    if (msg.status >= 200 && msg.status < 300) return msg;
    throw new Error(`${msg.statusLine}\n${msg.body}`);
  }

  #rawRequest(method, uri, headers = {}) {
    const cseq = this.cseq++;
    const extra = { CSeq: cseq, "User-Agent": USER_AGENT, ...headers };
    if (this.authHeader) extra.Authorization = this.authHeader;
    if (this.session && !extra.Session && method !== "SETUP") extra.Session = this.session;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(cseq);
        reject(new Error(`RTSP ${method} timed out`));
      }, this.options.timeoutMs || 8000);
      this.pending.set(cseq, {
        resolve: (msg) => {
          clearTimeout(timer);
          resolve(msg);
        },
        reject: (err) => {
          clearTimeout(timer);
          reject(err);
        },
      });
      try {
        this.socket.write(buildRequest(method, uri, extra));
      } catch (err) {
        this.pending.delete(cseq);
        clearTimeout(timer);
        reject(err);
      }
    });
  }

  #connect(host, port) {
    return new Promise((resolve, reject) => {
      const socket = net.connect({ host, port }, () => resolve());
      socket.setNoDelay(true);
      socket.on("data", (chunk) => this.#onData(chunk));
      socket.on("error", (err) => {
        reject(err);
        this.emit("error", err);
      });
      socket.on("close", () => {
        if (!this.closed) this.emit("error", new Error("RTSP socket closed"));
      });
      this.socket = socket;
    });
  }

  #startKeepAlive(intervalMs) {
    this.keepAlive = setInterval(() => {
      this.request("GET_PARAMETER", this.url, { Session: this.session })
        .catch(() => this.request("OPTIONS", this.url).catch(() => {}));
    }, intervalMs);
    this.keepAlive.unref?.();
  }

  #installDepay(family, donl = false) {
    this.jpegDepay = null;
    if (family === "h265") this.depay = createH265Depayloader({ donl });
    else if (family === "h264") this.depay = createH264Depayloader();
    else if (family === "jpeg") {
      this.depay = null;
      this.jpegDepay = createJpegDepayloader();
    } else this.depay = null;
  }

  #onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (this.buffer.length) {
      const msg = parseRtspMessage(this.buffer);
      if (!msg || msg.need) break;
      this.buffer = this.buffer.subarray(msg.consumed);
      if (msg.interleaved) {
        this.#onRtp(msg.channel, msg.packet);
        continue;
      }
      const cseq = Number(msg.headers.cseq || 0);
      const pending = this.pending.get(cseq);
      if (!pending) continue;
      this.pending.delete(cseq);
      pending.resolve(msg);
    }
  }

  #onRtp(channel, packet) {
    if (this.audioDepay && channel === this.audioChannel) {
      this.#onAudioRtp(packet);
      return;
    }
    if (channel !== 0) return;
    const rtp = parseRtp(packet);
    if (!rtp || !this.track || rtp.payloadType !== this.track.payloadType) return;

    if (this.jpegDepay) {
      const frame = this.jpegDepay(rtp);
      if (frame) this.emit("jpeg-frame", { timestamp: rtp.timestamp, ...frame });
      return;
    }

    if (!this.depay) {
      let family = rtp.payloadType === 26 ? "jpeg" : sniffFamily(rtp.payload);
      this.sniffed++;
      if (family !== "unknown") {
        this.track.family = family;
        this.#installDepay(family, this.track.donl);
        this.emit("sniffed", { family, sdpCodec: this.track.sdpCodec });
        if (this.jpegDepay) {
          const frame = this.jpegDepay(rtp);
          if (frame) this.emit("jpeg-frame", { timestamp: rtp.timestamp, ...frame });
          return;
        }
      } else if (this.sniffed >= 24) {
        this.emit("unsupported", {
          sdpCodec: this.track.sdpCodec,
          payloadType: this.track.payloadType,
          reason: `PLAY succeeded, but RTP payload is not H.264, H.265, or JPEG (SDP codec ${this.track.sdpCodec}).`,
        });
        return;
      } else {
        return;
      }
    }

    const nals = this.depay(rtp.payload);
    if (!nals.length && !rtp.marker) return;
    this.#pushNals(rtp, nals);
    if (rtp.marker) this.#flushAccessUnit();
  }

  #onAudioRtp(packet) {
    const rtp = parseRtp(packet);
    if (!rtp || !this.audioTrack || rtp.payloadType !== this.audioTrack.payloadType) return;
    const aus = this.audioDepay(rtp.payload);
    for (const data of aus) {
      if (data.length) this.emit("audio-au", { timestamp: rtp.timestamp, data });
    }
  }

  #pushNals(rtp, nals) {
    if (this.accessUnit && this.accessUnit.timestamp !== rtp.timestamp) {
      this.#flushAccessUnit();
    }
    if (!this.accessUnit) {
      this.accessUnit = { timestamp: rtp.timestamp, nals: [], keyframe: false };
    }
    const keyOf = this.track.family === "h265" ? isHevcKeyframe : isIdr;
    for (const nal of nals) {
      this.accessUnit.nals.push(nal);
      if (keyOf(nal)) this.accessUnit.keyframe = true;
    }
  }

  #flushAccessUnit() {
    const unit = this.accessUnit;
    this.accessUnit = null;
    if (!unit || !unit.nals.length) return;
    this.emit("access-unit", unit);
  }
}

function sniffFamily(payload) {
  if (!payload.length) return "unknown";
  if (payload[0] === 0xff && payload[1] === 0xd8) return "jpeg";
  const h264 = payload[0] & 0x1f;
  if (h264 === 7 || h264 === 8 || h264 === 5 || h264 === 1 || h264 === 28 || h264 === 24) return "h264";
  if (payload.length >= 2) {
    const h265 = (payload[0] >> 1) & 0x3f;
    if (h265 === 32 || h265 === 33 || h265 === 34 || h265 === 19 || h265 === 20 || h265 === 49 || h265 === 48) {
      return "h265";
    }
  }
  return "unknown";
}

export function normalizeRtspUrl(url) {
  const value = String(url || "").trim();
  if (!/^rtsp:\/\//i.test(value)) {
    throw new Error("URL must start with rtsp://");
  }
  return value;
}
