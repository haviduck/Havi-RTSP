import { bindControls } from "./controls.js";
import { attachAmbient } from "./ambient.js";

const els = {
  page: document.querySelector(".player-page"),
  shell: document.getElementById("player-shell"),
  setupForm: document.getElementById("setup-form"),
  setupUrl: document.getElementById("setup-url"),
  sourceForm: document.getElementById("source-form"),
  url: document.getElementById("rtsp-url"),
  modal: document.getElementById("setup-modal"),
  launch: document.getElementById("launch-play"),
  video: document.getElementById("video"),
  canvas: document.getElementById("canvas"),
  status: document.getElementById("status"),
  codec: document.getElementById("stat-codec"),
  size: document.getElementById("stat-size"),
  fps: document.getElementById("stat-fps"),
  bitrate: document.getElementById("stat-bitrate"),
  latency: document.getElementById("stat-latency"),
  audio: document.getElementById("stat-audio"),
  mode: document.getElementById("stat-mode"),
  reconnects: document.getElementById("stat-reconnects"),
};

const hud = bindControls({
  shell: els.shell,
  video: els.video,
  onUserPlay: onHudPlay,
  onUserStop: () => stop("Stopped."),
});

const stage = document.getElementById("player-stage");
const ambient = document.getElementById("ambient");
if (stage && ambient) attachAmbient(els.video, ambient, stage);

const TARGET_LIVE = 0.28;
const MAX_LIVE = 1.15;

let wanted = false;
let socket = null;
let reconnectTimer = null;
let pingTimer = null;
let attempt = 0;
let mediaSource = null;
let sourceBuffer = null;
let audioSourceBuffer = null;
let objectUrl = null;
let videoQueue = [];
let audioQueue = [];
let decoder = null;
let playMode = "mse";
let streamInfo = null;
let bytesWindow = 0;
let framesWindow = 0;
let lastTick = Date.now();
let waitingKeyframe = false;
let jpegPaused = false;

const params = new URLSearchParams(location.search);
if (params.get("url")) {
  els.url.value = params.get("url");
  if (els.setupUrl) els.setupUrl.value = params.get("url");
}

els.launch?.addEventListener("click", () => openSetup());
els.setupForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const url = els.setupUrl.value.trim();
  els.url.value = url;
  closeSetup();
  start(url);
});
document.getElementById("setup-cancel")?.addEventListener("click", () => closeSetup());
els.modal?.querySelector("[data-close-modal]")?.addEventListener("click", () => closeSetup());
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && els.modal && !els.modal.hidden) closeSetup();
});
els.sourceForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  start(els.url.value.trim());
});
els.video.addEventListener("error", () => {
  const err = els.video.error;
  if (!streamInfo) return;
  tryWebCodecs(streamInfo).then((ok) => {
    if (!ok) incompatible(streamInfo, err?.message || `video error ${err?.code || ""}`.trim());
  });
});

function openSetup() {
  if (els.setupUrl) els.setupUrl.value = els.url.value;
  els.modal.hidden = false;
  els.setupUrl?.focus();
  els.setupUrl?.select();
}

function closeSetup() {
  if (els.modal) els.modal.hidden = true;
}

function setSession(open) {
  els.page.classList.toggle("is-session", open);
}

function onHudPlay() {
  if (!wanted) {
    if (els.url.value.trim()) start(els.url.value.trim());
    else openSetup();
    return;
  }
  if (playMode === "jpeg") {
    jpegPaused = !jpegPaused;
    hud.setPaused(jpegPaused);
    return;
  }
  if (els.video.paused) els.video.play().catch(() => {});
  else els.video.pause();
}

function start(rtspUrl) {
  wanted = true;
  attempt = 0;
  setSession(true);
  closeSetup();
  els.video.muted = false;
  els.video.volume = 0.8;
  connect(rtspUrl);
}

function connect(rtspUrl) {
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  teardownSocket();
  setStatus("Connecting to gateway…", "warn");
  hud.setState("Connecting");
  hud.setWarning("");

  const wsUrl = new URL("/ws", location.href);
  wsUrl.protocol = location.protocol === "https:" ? "wss:" : "ws:";
  if (rtspUrl) wsUrl.searchParams.set("url", rtspUrl);

  socket = new WebSocket(wsUrl);
  socket.binaryType = "arraybuffer";
  socket.onopen = () => {
    attempt = 0;
    setStatus("RTSP handshake in progress…", "warn");
    hud.setState("Handshake");
    pingTimer = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) socket.send("ping");
    }, 20000);
  };
  socket.onerror = () => setStatus("WebSocket failed. Is the gateway running?", "err");
  socket.onclose = () => {
    if (wanted) scheduleReconnect("socket closed");
  };
  socket.onmessage = (event) => {
    if (typeof event.data === "string") {
      onControl(JSON.parse(event.data));
      return;
    }
    onMedia(event.data);
  };
}

function scheduleReconnect(reason) {
  if (!wanted || reconnectTimer) return;
  attempt += 1;
  const delay = Math.min(12000, 600 * 2 ** (attempt - 1));
  const text = `Reconnect ${attempt} in ${(delay / 1000).toFixed(1)}s (${reason})`;
  setStatus(text, "warn");
  hud.setState(text);
  hud.setLive(false);
  reconnectTimer = setTimeout(() => connect(els.url.value.trim()), delay);
}

function onControl(msg) {
  if (msg.type === "info") {
    if (playMode === "jpeg" && streamInfo?.family === "jpeg" && msg.family === "jpeg") {
      streamInfo = msg;
      els.codec.textContent = msg.codec;
      if (msg.width) els.size.textContent = `${msg.width}×${msg.height}`;
      return;
    }
    streamInfo = msg;
    els.codec.textContent = msg.codec;
    els.size.textContent = msg.width ? `${msg.width}×${msg.height}` : "—";
    if (els.audio) els.audio.textContent = audioLabel(msg);
    if (els.reconnects) els.reconnects.textContent = String(msg.reconnects ?? 0);
    setStatus(`Got ${msg.codec}${msg.width ? ` ${msg.width}×${msg.height}` : ""}. Trying decode…`, "warn");
    hud.setState("Opening decoder");
    setupPlayback(msg);
    return;
  }
  if (msg.type === "reconnect") {
    waitingKeyframe = true;
    const text = `Upstream retry ${msg.attempt} in ${(msg.delayMs / 1000).toFixed(1)}s`;
    setStatus(`${text}. ${msg.message || ""}`.trim(), "warn");
    hud.setState(text);
    hud.setLive(false);
    if (els.reconnects) els.reconnects.textContent = String(msg.attempt ?? 0);
    return;
  }
  if (msg.type === "connecting") {
    setStatus("RTSP connecting…", "warn");
    hud.setState("RTSP connecting");
    return;
  }
  if (msg.type === "unsupported") {
    incompatible({ codec: msg.sdpCodec, family: "unknown" }, msg.reason);
    return;
  }
  if (msg.type === "error") {
    setStatus(msg.message, "err");
    hud.setState("Error");
    return;
  }
  if (msg.type === "ended") {
    setStatus("Stream ended.", "warn");
    hud.setState("Ended");
  }
}

async function setupPlayback(info) {
  teardownMedia();
  if (info.family === "jpeg") {
    playMode = "jpeg";
    jpegPaused = false;
    els.video.classList.add("is-off");
    els.canvas.classList.add("is-on");
    hud.setPaused(false);
    setStatus("JPEG/MJPEG — drawing frames.", "ok");
    return;
  }
  const mimes = mimeCandidates(info.codec);
  for (const mime of mimes) {
    try {
      const audioMime = info.audio?.family === "aac" ? 'audio/mp4; codecs="mp4a.40.2"' : null;
      await openMse(mime, audioMime);
      playMode = "mse";
      waitingKeyframe = true;
      return;
    } catch {
      // next mime / WebCodecs
    }
  }
  const ok = await tryWebCodecs(info);
  if (!ok) incompatible(info, "MSE and WebCodecs both refused this bitstream after the stream was already opened.");
}

function mimeCandidates(codec) {
  const list = [`video/mp4; codecs="${codec}"`];
  if (codec.startsWith("hvc1.")) list.push(`video/mp4; codecs="${codec.replace("hvc1.", "hev1.")}"`);
  if (codec.startsWith("hev1.")) list.push(`video/mp4; codecs="${codec.replace("hev1.", "hvc1.")}"`);
  return list;
}

function openMse(mime, audioMime) {
  return new Promise((resolve, reject) => {
    mediaSource = new MediaSource();
    objectUrl = URL.createObjectURL(mediaSource);
    els.video.src = objectUrl;
    els.video.classList.remove("is-off");
    const timer = setTimeout(() => reject(new Error("MSE sourceopen timeout")), 2500);
    mediaSource.addEventListener("sourceopen", () => {
      try {
        sourceBuffer = mediaSource.addSourceBuffer(mime);
        try {
          sourceBuffer.mode = "sequence";
        } catch {
          // Safari may reject sequence mode; segments still work with tfdt
        }
        sourceBuffer.addEventListener("updateend", flushQueue);
        sourceBuffer.addEventListener("error", () => reject(new Error("SourceBuffer error")));
        if (audioMime) {
          try {
            audioSourceBuffer = mediaSource.addSourceBuffer(audioMime);
            try { audioSourceBuffer.mode = "sequence"; } catch { /* ignore */ }
            audioSourceBuffer.addEventListener("updateend", flushQueue);
          } catch {
            audioSourceBuffer = null;
          }
        }
        clearTimeout(timer);
        resolve();
        flushQueue();
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    }, { once: true });
  });
}

async function tryWebCodecs(info) {
  if (!window.VideoDecoder) return false;
  const description = info.description ? Uint8Array.from(atob(info.description), (c) => c.charCodeAt(0)) : undefined;
  const config = { codec: info.codec, codedWidth: info.width, codedHeight: info.height, description };
  try {
    const probe = await VideoDecoder.isConfigSupported(config);
    if (!probe.supported) {
      const alt = { ...config, codec: info.codec.replace("hvc1.", "hev1.") };
      const probe2 = await VideoDecoder.isConfigSupported(alt);
      if (!probe2.supported) return false;
      config.codec = alt.codec;
    }
  } catch {
    return false;
  }

  teardownMedia({ keepVideo: true });
  els.video.classList.add("is-off");
  els.canvas.classList.add("is-on");
  const ctx = els.canvas.getContext("2d");
  decoder = new VideoDecoder({
    output: (frame) => {
      els.canvas.width = frame.displayWidth;
      els.canvas.height = frame.displayHeight;
      ctx.drawImage(frame, 0, 0);
      frame.close();
      markPlaying();
    },
    error: (err) => incompatible(info, err.message),
  });
  decoder.configure(config);
  playMode = "webcodecs";
  waitingKeyframe = true;
  setStatus(`Playing via WebCodecs (${config.codec}).`, "ok");
  return true;
}

function onMedia(buffer) {
  const bytes = new Uint8Array(buffer);
  let kind = 1;
  let payload = bytes;
  if (bytes[0] === 1 || bytes[0] === 2 || bytes[0] === 3) {
    kind = bytes[0];
    payload = bytes.subarray(1);
  }
  const chunk = payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength);
  bytesWindow += chunk.byteLength;
  framesWindow += kind === 2 ? 0 : 1;
  if (kind === 3) {
    onJpeg(chunk);
    return;
  }
  if (playMode === "webcodecs") {
    if (kind === 1) decodeFragment(chunk);
    return;
  }
  if (kind === 2) audioQueue.push(chunk);
  else videoQueue.push(chunk);
  if (videoQueue.length > 48) videoQueue = videoQueue.filter(isInitSegment).concat(videoQueue.slice(-10));
  if (audioQueue.length > 64) audioQueue = audioQueue.filter(isInitSegment).concat(audioQueue.slice(-16));
  flushQueue();
  maybePlay();
}

function onJpeg(buffer) {
  if (jpegPaused || playMode !== "jpeg") return;
  const blob = new Blob([buffer], { type: "image/jpeg" });
  createImageBitmap(blob).then((bmp) => {
    els.canvas.width = bmp.width;
    els.canvas.height = bmp.height;
    els.canvas.getContext("2d").drawImage(bmp, 0, 0);
    bmp.close();
    if (!els.size.textContent || els.size.textContent === "—") {
      els.size.textContent = `${els.canvas.width}×${els.canvas.height}`;
    }
    markPlaying();
  }).catch(() => {});
}

function flushQueue() {
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
      waitingKeyframe = true;
      trimBuffer(sb, true);
      queue.unshift(chunk);
      return;
    }
    if (streamInfo) {
      tryWebCodecs(streamInfo).then((ok) => {
        if (!ok) incompatible(streamInfo, err.message);
      });
    } else {
      setStatus(err.message, "err");
    }
  }
  trimBuffer(sb, false);
}

function trimBuffer(sb, aggressive) {
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
  if (playMode === "jpeg") {
    els.latency.textContent = "—";
    return;
  }
  if (playMode !== "mse" || !els.video.buffered.length || els.video.paused) return;
  const end = els.video.buffered.end(els.video.buffered.length - 1);
  const latency = end - els.video.currentTime;
  els.latency.textContent = `${latency.toFixed(2)}s`;
  hud.setLatency(latency);
  hud.setTime(els.video.currentTime);
  if (latency > MAX_LIVE) {
    els.video.currentTime = Math.max(0, end - TARGET_LIVE);
    els.video.playbackRate = 1;
  } else if (latency > 0.7) {
    els.video.playbackRate = 1.06;
  } else {
    els.video.playbackRate = 1;
  }
}

async function maybePlay() {
  if (!els.video.paused) {
    markPlaying();
    return;
  }
  try {
    await els.video.play();
    markPlaying();
  } catch {
    els.video.muted = true;
    try {
      await els.video.play();
      markPlaying();
      setStatus("Playing muted — unmute in the control bar to hear audio.", "warn");
    } catch {
      setStatus("Autoplay blocked — use the control bar play button.", "warn");
      hud.setState("Tap play");
    }
  }
}

function markPlaying() {
  els.page.classList.add("is-live");
  hud.setLive(true);
  hud.setState("Live");
  hud.setWarning("");
  stage?.classList.add("is-live");
  if (els.mode) els.mode.textContent = playMode;
  setStatus("Playing.", "ok");
}

function decodeFragment(buffer) {
  if (!decoder || decoder.state !== "configured") return;
  const mdat = findBox(buffer, "mdat");
  if (!mdat) return;
  const key = isKeyframeFragment(buffer);
  if (waitingKeyframe && !key) return;
  waitingKeyframe = false;
  const data = avccToAnnexB(mdat);
  decoder.decode(new EncodedVideoChunk({
    type: key ? "key" : "delta",
    timestamp: Math.floor(performance.now() * 1000),
    data,
  }));
}

function isInitSegment(buffer) {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer);
  return bytes.length > 8 && String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]) === "ftyp";
}

function isKeyframeFragment(buffer) {
  const trun = findBox(buffer, "trun");
  if (!trun || trun.byteLength < 24) return false;
  const flags = new DataView(trun).getUint32(16);
  return (flags & 0x01010000) !== 0x01010000;
}

function findBox(buffer, name) {
  const buf = buffer instanceof ArrayBuffer ? buffer : buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const view = new DataView(buf);
  let o = 0;
  while (o + 8 <= buf.byteLength) {
    const size = view.getUint32(o);
    if (size < 8) break;
    const type = String.fromCharCode(view.getUint8(o + 4), view.getUint8(o + 5), view.getUint8(o + 6), view.getUint8(o + 7));
    if (type === name) return buf.slice(o + 8, o + size);
    if (type === "moof" || type === "traf") {
      o += 8;
      continue;
    }
    o += size;
  }
  return null;
}

function avccToAnnexB(mdat) {
  const view = new DataView(mdat);
  const parts = [];
  let o = 0;
  while (o + 4 <= mdat.byteLength) {
    const n = view.getUint32(o);
    o += 4;
    parts.push(new Uint8Array([0, 0, 0, 1]));
    parts.push(new Uint8Array(mdat, o, n));
    o += n;
  }
  const total = parts.reduce((n, p) => n + p.byteLength, 0);
  const out = new Uint8Array(total);
  let w = 0;
  for (const p of parts) {
    out.set(p, w);
    w += p.byteLength;
  }
  return out;
}

function incompatible(info, detail) {
  const codec = info?.codec || info?.sdpCodec || "unknown";
  const family = info?.family || "";
  const hint = family === "h265"
    ? " This is HEVC. Edge/Safari often work; Chrome on Windows usually needs the HEVC Video Extension."
    : " The camera codec is not something this browser could decode after a real attempt.";
  const message = `Stream opened as ${codec}, then playback failed: ${detail}.${hint}`;
  hud.setWarning(message);
  hud.setLive(false);
  hud.setState("Incompatible");
  setStatus(message, "err");
}

function teardownSocket() {
  if (pingTimer) clearInterval(pingTimer);
  pingTimer = null;
  if (socket) {
    socket.onclose = null;
    socket.close();
    socket = null;
  }
}

function teardownMedia({ keepVideo = false } = {}) {
  videoQueue = [];
  audioQueue = [];
  sourceBuffer = null;
  audioSourceBuffer = null;
  jpegPaused = false;
  if (decoder) {
    try { decoder.close(); } catch { /* ignore */ }
    decoder = null;
  }
  if (mediaSource && mediaSource.readyState === "open") {
    try { mediaSource.endOfStream(); } catch { /* ignore */ }
  }
  mediaSource = null;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  els.canvas.classList.remove("is-on");
  if (!keepVideo) {
    els.video.classList.remove("is-off");
    els.video.removeAttribute("src");
    els.video.load();
  }
  els.page.classList.remove("is-live");
  hud.setLive(false);
  stage?.classList.remove("is-live");
}

function stop(message) {
  wanted = false;
  clearTimeout(reconnectTimer);
  reconnectTimer = null;
  teardownSocket();
  teardownMedia();
  streamInfo = null;
  setSession(false);
  if (els.audio) els.audio.textContent = "—";
  if (els.mode) els.mode.textContent = "—";
  if (message) setStatus(message, "");
  hud.setState("Idle");
  hud.setWarning("");
}

function audioLabel(info) {
  const audio = info?.audio;
  if (!audio) return "none";
  const name = audio.codec || audio.sdpCodec || "audio";
  if (audio.family === "legacy") return `${name} — not browser-playable without transcode`;
  return name;
}

function setStatus(text, kind) {
  els.status.textContent = text;
  els.status.className = `ui-status${kind ? ` is-${kind}` : ""}`;
}

setInterval(() => {
  const now = Date.now();
  const dt = (now - lastTick) / 1000;
  els.fps.textContent = `${Math.round(framesWindow / dt)} fps`;
  els.bitrate.textContent = `${Math.round((bytesWindow * 8) / dt / 1000)} kb/s`;
  framesWindow = 0;
  bytesWindow = 0;
  lastTick = now;
  catchUp();
}, 400);
