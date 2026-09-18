// Pipeline subscriber that writes media to a writable stream.
//
// Formats
//   mp4     fMP4 video only (init segment, then moof/mdat fragments). Content-Type video/mp4.
//   mjpeg   multipart/x-mixed-replace with one image/jpeg part per frame.
//   framed  [u32 BE length][kind u8][payload]. kind 0 = JSON control, 1 = video fMP4,
//           2 = audio fMP4, 3 = JPEG frame. Same payloads the WebSocket gateway sends.
//   auto    mp4 for h264/h265, mjpeg for jpeg. Decided when the first "info" arrives.
//
// Control messages (info, reconnect, error, ...) always go to `stderr` as JSON lines.
// The "info" line gains `contentType` and `format` so a host process can set HTTP headers.

const KIND = { control: 0, video: 1, audio: 2, jpeg: 3 };

export function contentTypeFor(info, { boundary = "havi" } = {}) {
  if (!info) return null;
  if (info.family === "jpeg") return `multipart/x-mixed-replace; boundary=${boundary}`;
  return `video/mp4; codecs="${info.codec}"`;
}

export function resolveFormat(format, info) {
  if (format !== "auto") return format;
  return info?.family === "jpeg" ? "mjpeg" : "mp4";
}

export function attachStdioSink(pipeline, options = {}) {
  const out = options.stdout || process.stdout;
  const err = options.stderr || process.stderr;
  const format = options.format || "auto";
  const boundary = options.boundary || "havi";
  const highWater = options.highWaterMark ?? 8 * 1024 * 1024;
  const onFatal = options.onFatal || (() => {});

  let mode = format === "auto" ? null : format;
  let needKeyframe = false;
  const stats = { written: 0, dropped: 0 };

  const control = (msg) => {
    const line = `${JSON.stringify(msg)}\n`;
    if (mode === "framed" || format === "framed") writeFramed(KIND.control, Buffer.from(line));
    err.write(line);
  };

  const writeFramed = (kind, data) => {
    const head = Buffer.alloc(5);
    head.writeUInt32BE(data.length + 1, 0);
    head[4] = kind;
    write(Buffer.concat([head, data]));
  };

  const write = (buf) => {
    stats.written += buf.length;
    out.write(buf);
  };

  const congested = () => out.writableLength > highWater;

  const send = (payload) => {
    if (!Buffer.isBuffer(payload)) {
      if (payload.type === "info") {
        const resolved = resolveFormat(format, payload);
        if (mode && mode !== "framed" && mode !== resolved) {
          control({ type: "error", message: `format ${mode} cannot carry ${payload.family}`, fatal: true });
          onFatal(new Error(`format ${mode} cannot carry ${payload.family}`));
          return;
        }
        mode = resolved;
        needKeyframe = true;
        control({ ...payload, contentType: contentTypeFor(payload, { boundary }), format: mode });
        return;
      }
      control(payload);
      return;
    }

    const kind = payload[0];
    const data = payload.subarray(1);
    if (!mode) return;

    if (mode === "framed") {
      if (kind === KIND.video && dropVideo(data)) return;
      writeFramed(kind, data);
      return;
    }
    if (mode === "mp4") {
      if (kind !== KIND.video) return;
      if (dropVideo(data)) return;
      write(data);
      return;
    }
    if (mode === "mjpeg") {
      if (kind !== KIND.jpeg) return;
      if (congested()) {
        stats.dropped += 1;
        return;
      }
      write(Buffer.from(`--${boundary}\r\nContent-Type: image/jpeg\r\nContent-Length: ${data.length}\r\n\r\n`));
      write(data);
      write(Buffer.from("\r\n"));
    }
  };

  // Backpressure: past highWater, drop fragments until the next keyframe. Init segments always pass.
  function dropVideo(data) {
    if (isInitSegment(data)) return false;
    const key = isKeyframeFragment(data);
    if (congested()) {
      needKeyframe = true;
      stats.dropped += 1;
      return true;
    }
    if (needKeyframe && !key) {
      stats.dropped += 1;
      return true;
    }
    needKeyframe = false;
    return false;
  }

  const unsubscribe = pipeline.subscribe(send);
  return {
    stats,
    detach: unsubscribe,
  };
}

function isInitSegment(buf) {
  return buf.length > 8 && buf.toString("latin1", 4, 8) === "ftyp";
}

function isKeyframeFragment(buf) {
  const trun = findBox(buf, "trun");
  if (!trun || trun.length < 8) return false;
  const flags = trun.readUInt32BE(0);
  return (flags & 0x01010000) !== 0x01010000;
}

function findBox(buf, name) {
  let o = 0;
  while (o + 8 <= buf.length) {
    const size = buf.readUInt32BE(o);
    if (size < 8) return null;
    const type = buf.toString("latin1", o + 4, o + 8);
    if (type === name) return buf.subarray(o + 8, o + size);
    if (type === "moof" || type === "traf") {
      o += 8;
      continue;
    }
    o += size;
  }
  return null;
}
