// Consumer for the chunked response from examples/flask/app.py.
// video/mp4 -> MediaSource. multipart/x-mixed-replace -> <img>.

const els = {
  form: document.getElementById("form"),
  url: document.getElementById("url"),
  video: document.getElementById("video"),
  image: document.getElementById("image"),
  status: document.getElementById("status"),
};

const TARGET_LIVE = 0.4;
const MAX_LIVE = 1.5;

let abort = null;
let sourceBuffer = null;
let queue = [];

const params = new URLSearchParams(location.search);
if (params.get("url")) els.url.value = params.get("url");

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  start(els.url.value.trim());
});

async function start(streamUrl) {
  stop();
  if (!streamUrl) return;
  const endpoint = `/stream?url=${encodeURIComponent(streamUrl)}`;
  setStatus("Opening…");

  abort = new AbortController();
  let response;
  try {
    response = await fetch(endpoint, { signal: abort.signal });
  } catch (err) {
    setStatus(`Fetch failed: ${err.message}`);
    return;
  }
  if (!response.ok) {
    setStatus(`Server said ${response.status}.`);
    return;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.startsWith("multipart/")) {
    // <img> renders multipart JPEG natively; the fetch is no longer needed.
    abort.abort();
    abort = null;
    els.image.src = endpoint;
    els.image.classList.add("is-on");
    setStatus(`MJPEG (${contentType}).`);
    return;
  }

  if (!("MediaSource" in window) || !MediaSource.isTypeSupported(contentType)) {
    abort.abort();
    setStatus(`This browser cannot play ${contentType}.`);
    return;
  }

  await openMse(contentType);
  els.video.classList.add("is-on");
  setStatus(`Playing ${contentType}.`);
  pump(response.body.getReader());
}

function openMse(mime) {
  return new Promise((resolve, reject) => {
    const mediaSource = new MediaSource();
    els.video.src = URL.createObjectURL(mediaSource);
    mediaSource.addEventListener("sourceopen", () => {
      try {
        sourceBuffer = mediaSource.addSourceBuffer(mime);
        try { sourceBuffer.mode = "sequence"; } catch { /* Safari */ }
        sourceBuffer.addEventListener("updateend", flush);
        resolve();
      } catch (err) {
        reject(err);
      }
    }, { once: true });
  });
}

async function pump(reader) {
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      queue.push(value);
      flush();
      if (els.video.paused) els.video.play().catch(() => {});
    }
    setStatus("Stream ended.");
  } catch (err) {
    if (err.name !== "AbortError") setStatus(`Read failed: ${err.message}`);
  }
}

function flush() {
  if (!sourceBuffer || sourceBuffer.updating || !queue.length) return;
  const chunk = queue.shift();
  try {
    sourceBuffer.appendBuffer(chunk);
  } catch (err) {
    setStatus(`Append failed: ${err.message}`);
    return;
  }
  trim();
}

function trim() {
  const ranges = sourceBuffer?.buffered;
  if (!ranges || !ranges.length || sourceBuffer.updating) return;
  const end = ranges.end(ranges.length - 1);
  if (end - ranges.start(0) > 6) {
    try { sourceBuffer.remove(0, end - 3); } catch { /* ignore */ }
  }
}

function stop() {
  if (abort) abort.abort();
  abort = null;
  queue = [];
  sourceBuffer = null;
  els.image.classList.remove("is-on");
  els.image.removeAttribute("src");
  els.video.classList.remove("is-on");
  els.video.removeAttribute("src");
  els.video.load();
}

function setStatus(text) {
  els.status.textContent = text;
}

setInterval(() => {
  const v = els.video;
  if (!sourceBuffer || v.paused || !v.buffered.length) return;
  const end = v.buffered.end(v.buffered.length - 1);
  const latency = end - v.currentTime;
  if (latency > MAX_LIVE) v.currentTime = Math.max(0, end - TARGET_LIVE);
  v.playbackRate = latency > 0.8 ? 1.05 : 1;
}, 500);
