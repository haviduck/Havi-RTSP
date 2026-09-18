import { EventEmitter } from "node:events";
import { Fmp4Muxer } from "../mux/fmp4.js";
import { AacFmp4Muxer } from "../mux/fmp4-audio.js";
import { RtspClient } from "../rtsp/client.js";
import { pickAudioTrack } from "../rtsp/sdp.js";
import { HttpMjpegClient } from "../http/client.js";
import { isHttpUrl } from "./url.js";
import { backoffMs, sleep } from "./backoff.js";

export class RtspPipeline extends EventEmitter {
  constructor(url) {
    super();
    this.url = url;
    this.client = null;
    this.muxer = null;
    this.audioMuxer = null;
    this.init = null;
    this.audioInit = null;
    this.info = null;
    this.subscribers = new Set();
    this.needKeyframe = new Set();
    this.running = false;
    this.loop = null;
    this.stats = { frames: 0, bytes: 0, startedAt: Date.now(), reconnects: 0 };
  }

  async start() {
    if (this.running) return;
    this.running = true;
    this.loop = this.#run();
    this.loop.catch((err) => this.emit("error", err));
  }

  subscribe(send) {
    this.subscribers.add(send);
    this.needKeyframe.add(send);
    if (this.info) send({ type: "info", ...this.info });
    if (this.init) this.#emit(send, this.init, { kind: 1 });
    if (this.audioInit) this.#emit(send, this.audioInit, { kind: 2 });
    return () => {
      this.subscribers.delete(send);
      this.needKeyframe.delete(send);
    };
  }

  async stop() {
    this.running = false;
    for (const send of this.subscribers) {
      try { send({ type: "ended" }); } catch { /* ignore */ }
    }
    this.subscribers.clear();
    await this.client?.close();
    this.client = null;
  }

  async #run() {
    let attempt = 0;
    while (this.running) {
      try {
        this.#sendAll({ type: "connecting", attempt, url: this.url });
        await this.#session();
        attempt = 0;
        if (!this.running) break;
        this.stats.reconnects += 1;
        const delay = backoffMs(1, { base: 800 });
        this.#sendAll({ type: "reconnect", attempt: 1, delayMs: delay, message: "RTSP session ended" });
        await sleep(delay);
      } catch (err) {
        if (!this.running) break;
        attempt += 1;
        this.stats.reconnects += 1;
        const delay = backoffMs(attempt);
        this.#sendAll({
          type: "reconnect",
          attempt,
          delayMs: delay,
          message: err.message,
        });
        await sleep(delay);
      }
    }
  }

  #session() {
    if (isHttpUrl(this.url)) return this.#httpSession();
    return this.#rtspSession();
  }

  #httpSession() {
    return new Promise((resolve, reject) => {
      const client = new HttpMjpegClient(this.url);
      this.client = client;
      this.muxer = null;
      this.audioMuxer = null;
      this.init = null;
      this.audioInit = null;
      this.info = null;
      let settled = false;

      const finish = (err) => {
        if (settled) return;
        settled = true;
        client.close().catch(() => {});
        this.client = null;
        if (!this.running || !err) resolve();
        else reject(err);
      };

      client.on("ready", ({ track }) => {
        this.#publishJpeg(track);
      });
      client.on("jpeg-frame", (frame) => {
        try {
          this.#onJpeg(frame);
        } catch (err) {
          finish(err);
        }
      });
      client.on("error", (err) => finish(err));
      client.on("close", () => finish());
      client.play().catch((err) => finish(err));
    });
  }

  #rtspSession() {
    return new Promise((resolve, reject) => {
      const client = new RtspClient(this.url);
      this.client = client;
      this.muxer = null;
      this.audioMuxer = null;
      this.init = null;
      this.audioInit = null;
      this.info = null;
      let settled = false;

      const finish = (err) => {
        if (settled) return;
        settled = true;
        client.close().catch(() => {});
        this.client = null;
        if (!this.running || !err) resolve();
        else reject(err);
      };

      client.on("unsupported", (detail) => {
        this.#sendAll({ type: "unsupported", afterAttempt: true, ...detail });
      });

      client.on("ready", ({ track }) => {
        this.#bootMuxer(track);
      });

      client.on("sniffed", ({ family, sdpCodec }) => {
        this.#sendAll({ type: "sniffed", family, sdpCodec });
      });

      client.on("access-unit", (unit) => {
        try {
          this.#onUnit(unit, client.track);
        } catch (err) {
          finish(err);
        }
      });

      client.on("audio-au", (unit) => {
        try {
          this.#onAudio(unit.data);
        } catch (err) {
          finish(err);
        }
      });

      client.on("jpeg-frame", (frame) => {
        try {
          this.#onJpeg(frame);
        } catch (err) {
          finish(err);
        }
      });

      client.on("error", (err) => finish(err));
      client.on("close", () => finish());
      client.play().catch((err) => finish(err));
    });
  }

  #bootMuxer(track) {
    if (track.family === "jpeg") {
      this.#publishJpeg(track);
      return;
    }
    if (track.family === "unknown") return;
    if (track.family === "h264" && !(track.sps && track.pps)) return;
    if (track.family === "h265" && !(track.sps && track.pps)) return;
    this.muxer = new Fmp4Muxer({
      family: track.family,
      vps: track.vps,
      sps: track.sps,
      pps: track.pps,
      timescale: track.clockRate || 90000,
    });
    if (!this.muxer.ready) return;
    this.#publishInit(track);
  }

  #ensureAudio() {
    if (this.audioMuxer) {
      return this.info?.audio || {
        codec: this.audioMuxer.codec,
        family: "aac",
      };
    }
    const real = pickAudioTrack(this.client?.sdp);
    if (real?.family !== "aac" || !this.client?.audioDepay) return null;
    this.audioMuxer = new AacFmp4Muxer({
      sampleRate: real.clockRate || 44100,
      channels: real.channels || 1,
      asc: parseAsc(real.config),
    });
    this.audioInit = this.audioMuxer.initSegment();
    return {
      codec: this.audioMuxer.codec,
      family: "aac",
      sdpCodec: real.sdpCodec,
      clockRate: real.clockRate,
      channels: real.channels || 1,
    };
  }

  #publishInit(track) {
    this.init = this.muxer.initSegment();
    const audio = this.#ensureAudio();
    this.info = {
      url: this.url,
      codec: this.muxer.info.codec,
      family: this.muxer.info.family || track.family,
      sdpCodec: track.sdpCodec,
      width: this.muxer.info.width,
      height: this.muxer.info.height,
      clockRate: track.clockRate || this.muxer.timescale,
      description: this.muxer.decoderConfig.toString("base64"),
      audio,
      reconnects: this.stats.reconnects,
    };
    this.emit("info", this.info);
    this.#sendAll({ type: "info", ...this.info });
    this.#sendAll(this.init);
    if (this.audioInit) this.#sendAll(this.audioInit, { audio: true });
    for (const send of this.subscribers) this.needKeyframe.add(send);
  }

  #publishJpeg(track, frame) {
    const width = frame?.width || this.info?.width || 0;
    const height = frame?.height || this.info?.height || 0;
    this.info = {
      url: this.url,
      codec: String(track?.sdpCodec || "JPEG").toLowerCase(),
      family: "jpeg",
      sdpCodec: track?.sdpCodec || "JPEG",
      width,
      height,
      clockRate: track?.clockRate || 90000,
      audio: this.#ensureAudio(),
      reconnects: this.stats.reconnects,
    };
    this.emit("info", this.info);
    this.#sendAll({ type: "info", ...this.info });
  }

  #onJpeg(frame) {
    if (!frame?.data?.length) return;
    if (!this.info || this.info.family !== "jpeg") {
      this.#publishJpeg(this.client?.track, frame);
    } else if (!this.info.width && frame.width) {
      this.info.width = frame.width;
      this.info.height = frame.height;
      this.#sendAll({ type: "info", ...this.info });
    }
    this.stats.frames += 1;
    this.stats.bytes += frame.data.length;
    this.#sendAll(frame.data, { media: true, keyframe: true, jpeg: true });
  }

  #onUnit(unit, track) {
    if (!this.muxer) {
      this.muxer = new Fmp4Muxer({
        family: track?.family || "h264",
        vps: track?.vps,
        sps: track?.sps,
        pps: track?.pps,
        timescale: track?.clockRate || 90000,
      });
      if (!this.muxer.updateParameterSets(unit.nals) || !this.muxer.ready) return;
      this.#publishInit(track || { sdpCodec: this.muxer.info.codec, family: this.muxer.info.family });
    } else if (this.muxer.updateParameterSets(unit.nals) && this.muxer.ready) {
      this.#publishInit(track || { sdpCodec: this.info?.sdpCodec, family: this.muxer.info.family });
    }

    const fragment = this.muxer.mediaFragment(unit);
    if (!fragment) return;
    this.stats.frames += 1;
    this.stats.bytes += fragment.length;
    this.#sendAll(fragment, { media: true, keyframe: unit.keyframe });
  }

  #onAudio(data) {
    if (!this.audioMuxer) return;
    const fragment = this.audioMuxer.mediaFragment(data);
    if (!fragment) return;
    this.stats.bytes += fragment.length;
    this.#sendAll(fragment, { media: true, audio: true, keyframe: true });
  }

  #sendAll(payload, { media = false, keyframe = false, audio = false, jpeg = false } = {}) {
    const kind = Buffer.isBuffer(payload) ? (jpeg ? 3 : audio ? 2 : 1) : 0;
    for (const send of this.subscribers) {
      if (media && !audio && !jpeg && this.needKeyframe.has(send) && !keyframe) continue;
      try {
        this.#emit(send, payload, { kind });
        if (media && keyframe && !audio) this.needKeyframe.delete(send);
      } catch {
        this.subscribers.delete(send);
        this.needKeyframe.delete(send);
      }
    }
  }

  #emit(send, payload, { kind = 0 } = {}) {
    if (Buffer.isBuffer(payload) && kind) {
      send(Buffer.concat([Buffer.from([kind]), payload]));
      return;
    }
    send(payload);
  }
}

function parseAsc(hex) {
  if (!hex) return null;
  try {
    return Buffer.from(String(hex).replace(/\s+/g, ""), "hex");
  } catch {
    return null;
  }
}
