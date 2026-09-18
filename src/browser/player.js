// Pipeline subscriber for the browser. MSE for fMP4 (kind 1 video, 2 audio), canvas for JPEG (kind 3).
// Objects are control messages.

const TARGET_LIVE = 0.3;
const MAX_LIVE = 1.2;

export function createBrowserPlayer({ video, canvas, onStatus = () => {}, onInfo = () => {} }) {
  let mediaSource = null;
  let sourceBuffer = null;
  let audioSourceBuffer = null;
  let objectUrl = null;
  let videoQueue = [];
  let audioQueue = [];
  let mode = null;
  let info = null;
  let unsubscribe = null;
  let stats = { frames: 0, bytes: 0 };
  const canvasCtx = canvas ? canvas.getContext("2d") : null;

  const clock = setInterval(catchUp, 400);

  function attach(pipeline) {
    detach();
    unsubscribe = pipeline.subscribe(onPayload);
  }

  function detach() {
    unsubscribe?.();
    unsubscribe = null;
    teardownMedia();
    info = null;
    mode = null;
  }

  function destroy() {
    detach();
    clearInterval(clock);
  }

  function onPayload(payload) {
    if (!(payload instanceof Uint8Array)) {
      onControl(payload);
      return;
    }
    const kind = payload[0];
    const data = payload.subarray(1);
    stats.bytes += data.length;
    if (kind === 3) {
      drawJpeg(data);
      return;
    }
    if (mode !== "mse") return;
    if (kind === 2) audioQueue.push(data);
    else {
      stats.frames += 1;
      videoQueue.push(data);
    }
    if (videoQueue.length > 48) videoQueue = videoQueue.filter(isInitSegment).concat(videoQueue.slice(-10));
    if (audioQueue.length > 64) audioQueue = audioQueue.filter(isInitSegment).concat(audioQueue.slice(-16));
    flush();
    maybePlay();
  }

  function onControl(msg) {
    if (msg.type === "info") {
      info = msg;
      onInfo(msg);
      if (msg.family === "jpeg") {
        if (mode !== "jpeg") {
          teardownMedia();
          mode = "jpeg";
          if (video) video.hidden = true;
          if (canvas) canvas.hidden = false;
          onStatus("JPEG. Drawing frames.", "ok");
        }
        return;
      }
      // Start queueing now: the init segment arrives before sourceopen resolves.
      teardownMedia();
      mode = "mse";
      if (video) video.hidden = false;
      if (canvas) canvas.hidden = true;
      openMse(msg).catch((err) => onStatus(`Cannot play ${msg.codec}: ${err.message}`, "err"));
      return;
    }
    if (msg.type === "connecting") onStatus("RTSP connecting…", "warn");
    else if (msg.type === "reconnect") onStatus(`Retry ${msg.attempt} in ${(msg.delayMs / 1000).toFixed(1)}s. ${msg.message || ""}`.trim(), "warn");
    else if (msg.type === "unsupported") onStatus(msg.reason, "err");
    else if (msg.type === "error") onStatus(msg.message, "err");
    else if (msg.type === "ended") onStatus("Stream ended.", "warn");
  }

  async function openMse(streamInfo) {
    if (!video) throw new Error("no <video> element");
    const audioMime = streamInfo.audio?.family === "aac" ? 'audio/mp4; codecs="mp4a.40.2"' : null;
    let lastErr = null;
    for (const mime of mimeCandidates(streamInfo.codec)) {
      if (!MediaSource.isTypeSupported(mime)) {
        lastErr = new Error(`${mime} not supported`);
        continue;
      }
      try {
        await openSourceBuffers(mime, audioMime);
        flush();
        onStatus(`Playing ${streamInfo.codec}${streamInfo.width ? ` ${streamInfo.width}×${streamInfo.height}` : ""}.`, "ok");
        return;
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("MSE refused every mime");
  }

  function openSourceBuffers(mime, audioMime) {
    return new Promise((resolve, reject) => {
      mediaSource = new MediaSource();
      objectUrl = URL.createObjectURL(mediaSource);
      video.src = objectUrl;
      const timer = setTimeout(() => reject(new Error("MSE sourceopen timeout")), 15000);
      mediaSource.addEventListener("sourceopen", () => {
        try {
          sourceBuffer = mediaSource.addSourceBuffer(mime);
          try { sourceBuffer.mode = "sequence"; } catch { /* Safari */ }
          sourceBuffer.addEventListener("updateend", flush);
          if (audioMime && MediaSource.isTypeSupported(audioMime)) {
            try {
              audioSourceBuffer = mediaSource.addSourceBuffer(audioMime);
              try { audioSourceBuffer.mode = "sequence"; } catch { /* ignore */ }
              audioSourceBuffer.addEventListener("updateend", flush);
            } catch {
              audioSourceBuffer = null;
            }
          }
          clearTimeout(timer);
          resolve();
        } catch (err) {
          clearTimeout(timer);
          reject(err);
        }
      }, { once: true });
    });
  }

  function flush() {
    flushOne(sourceBuffer, videoQueue);
    flushOne(audioSourceBuffer, audioQueue);
  }

  function flushOne(sb, queue) {
    if (!sb || sb.updating || !queue.length) return;
    const chunk = queue.shift();
    try {
      sb.appendBuffer(chunk);
    } catch (err) {
      if (err.name === "QuotaExceededError") {
        trim(sb, true);
        queue.unshift(chunk);
        return;
      }
      onStatus(`Append failed: ${err.message}`, "err");
    }
    trim(sb, false);
  }

  function trim(sb, aggressive) {
    if (!sb || sb.updating) return;
    const ranges = sb.buffered;
    if (!ranges.length) return;
    const end = ranges.end(ranges.length - 1);
    const keep = aggressive ? 1.2 : 3.5;
    if (end - ranges.start(0) > keep + 1) {
      try { sb.remove(0, end - keep); } catch { /* ignore */ }
    }
  }

  function catchUp() {
    if (mode !== "mse" || !video || video.paused || !video.buffered.length) return;
    const end = video.buffered.end(video.buffered.length - 1);
    const latency = end - video.currentTime;
    if (latency > MAX_LIVE) {
      video.currentTime = Math.max(0, end - TARGET_LIVE);
      video.playbackRate = 1;
    } else {
      video.playbackRate = latency > 0.7 ? 1.06 : 1;
    }
  }

  async function maybePlay() {
    if (!video || !video.paused) return;
    try {
      await video.play();
    } catch {
      video.muted = true;
      video.play().catch(() => onStatus("Autoplay blocked. Press play.", "warn"));
    }
  }

  function drawJpeg(data) {
    if (!canvas || mode !== "jpeg") return;
    stats.frames += 1;
    const blob = new Blob([data], { type: "image/jpeg" });
    createImageBitmap(blob).then((bmp) => {
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      canvasCtx.drawImage(bmp, 0, 0);
      bmp.close();
    }).catch(() => {});
  }

  function teardownMedia() {
    videoQueue = [];
    audioQueue = [];
    sourceBuffer = null;
    audioSourceBuffer = null;
    if (mediaSource && mediaSource.readyState === "open") {
      try { mediaSource.endOfStream(); } catch { /* ignore */ }
    }
    mediaSource = null;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    if (video) {
      video.removeAttribute("src");
      video.load();
    }
  }

  return {
    attach,
    detach,
    destroy,
    get info() { return info; },
    get mode() { return mode; },
    get stats() { return stats; },
  };
}

function mimeCandidates(codec) {
  const list = [`video/mp4; codecs="${codec}"`];
  if (codec.startsWith("hvc1.")) list.push(`video/mp4; codecs="${codec.replace("hvc1.", "hev1.")}"`);
  if (codec.startsWith("hev1.")) list.push(`video/mp4; codecs="${codec.replace("hev1.", "hvc1.")}"`);
  return list;
}

function isInitSegment(bytes) {
  return bytes.length > 8 && String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) === "ftyp";
}
