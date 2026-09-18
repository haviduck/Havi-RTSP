import { EventEmitter } from "node:events";
import http from "node:http";
import https from "node:https";
import { MjpegParser, parseBoundary, frameFromJpeg } from "./mjpeg.js";

const USER_AGENT = "Havi-RTSP/1.0";

export class HttpMjpegClient extends EventEmitter {
  constructor(url) {
    super();
    this.url = String(url).trim();
    this.closed = false;
    this.req = null;
    this.res = null;
    this.track = { family: "jpeg", sdpCodec: "MJPEG", clockRate: 0 };
  }

  async play() {
    await this.#get(this.url, 0);
  }

  async close() {
    this.closed = true;
    this.req?.destroy();
    this.res?.destroy();
    this.req = null;
    this.res = null;
  }

  #get(url, redirects) {
    return new Promise((resolve, reject) => {
      if (this.closed) {
        resolve();
        return;
      }
      let parsed;
      try {
        parsed = new URL(url);
      } catch (err) {
        reject(err);
        return;
      }
      const lib = parsed.protocol === "https:" ? https : http;
      const req = lib.get(parsed, {
        headers: {
          Accept: "multipart/x-mixed-replace, image/jpeg, */*",
          "User-Agent": USER_AGENT,
        },
      }, (res) => {
        if (this.closed) {
          res.destroy();
          resolve();
          return;
        }
        const status = res.statusCode || 0;
        if (status >= 300 && status < 400 && res.headers.location && redirects < 3) {
          res.resume();
          this.#get(new URL(res.headers.location, parsed).toString(), redirects + 1).then(resolve, reject);
          return;
        }
        if (status !== 200) {
          res.resume();
          reject(new Error(`HTTP ${status} for MJPEG URL`));
          return;
        }
        const contentType = res.headers["content-type"] || "";
        if (!/multipart\/x-mixed-replace|image\/jpeg|mjpeg/i.test(contentType) && !/\.mjpg(\?|$)/i.test(parsed.pathname)) {
          res.resume();
          reject(new Error(`Not an MJPEG stream (${contentType || "no content-type"})`));
          return;
        }
        this.res = res;
        const parser = new MjpegParser({ boundary: parseBoundary(contentType) });
        this.emit("ready", { url: this.url, track: this.track });
        resolve();
        res.on("data", (chunk) => {
          if (this.closed) return;
          for (const data of parser.push(chunk)) {
            const frame = frameFromJpeg(data);
            if (frame) this.emit("jpeg-frame", frame);
          }
        });
        res.on("end", () => {
          if (!this.closed) this.emit("close");
        });
        res.on("error", (err) => {
          if (!this.closed) this.emit("error", err);
        });
      });
      this.req = req;
      req.on("error", (err) => {
        if (this.closed) resolve();
        else reject(err);
      });
    });
  }
}
