import { jpegSize } from "../rtp/jpeg.js";

const SOI = Buffer.from([0xff, 0xd8]);
const EOI = Buffer.from([0xff, 0xd9]);

export function parseBoundary(contentType) {
  const match = String(contentType || "").match(/boundary=(?:"([^"]+)"|([^\s;]+))/i);
  if (!match) return null;
  return String(match[1] || match[2] || "").replace(/^--/, "");
}

export class MjpegParser {
  constructor({ boundary } = {}) {
    this.boundary = boundary ? Buffer.from(`--${boundary}`) : null;
    this.buf = Buffer.alloc(0);
  }

  push(chunk) {
    this.buf = Buffer.concat([this.buf, chunk]);
    if (this.buf.length > 8 * 1024 * 1024) this.buf = this.buf.subarray(this.buf.length - 512 * 1024);
    const frames = [];
    for (;;) {
      const frame = this.#take();
      if (!frame) break;
      frames.push(frame);
    }
    return frames;
  }

  #take() {
    const header = this.#partHeader();
    if (header && header.length != null) {
      if (this.buf.length < header.bodyAt + header.length) return null;
      const body = this.buf.subarray(header.bodyAt, header.bodyAt + header.length);
      this.buf = this.buf.subarray(header.bodyAt + header.length);
      return jpegFrom(body);
    }
    const soi = this.buf.indexOf(SOI);
    if (soi < 0) {
      if (this.buf.length > 1) this.buf = this.buf.subarray(-1);
      return null;
    }
    const eoi = this.buf.indexOf(EOI, soi + 2);
    if (eoi < 0) {
      if (soi > 0) this.buf = this.buf.subarray(soi);
      return null;
    }
    const data = Buffer.from(this.buf.subarray(soi, eoi + 2));
    this.buf = this.buf.subarray(eoi + 2);
    return data;
  }

  #partHeader() {
    const crlf = this.buf.indexOf("\r\n\r\n");
    const lf = crlf === -1 ? this.buf.indexOf("\n\n") : -1;
    if (crlf < 0 && lf < 0) return null;
    const at = crlf >= 0 ? crlf : lf;
    const sep = crlf >= 0 ? 4 : 2;
    const text = this.buf.subarray(0, at).toString("latin1");
    const match = /content-length:\s*(\d+)/i.exec(text);
    if (!match) return null;
    return { bodyAt: at + sep, length: Number(match[1]) };
  }
}

function jpegFrom(body) {
  const soi = body.indexOf(SOI);
  if (soi < 0) return null;
  const eoi = body.indexOf(EOI, soi + 2);
  const slice = eoi >= 0 ? body.subarray(soi, eoi + 2) : body.subarray(soi);
  return Buffer.from(slice);
}

export function frameFromJpeg(data) {
  if (!data?.length) return null;
  const size = jpegSize(data);
  return { data, width: size.width, height: size.height };
}
