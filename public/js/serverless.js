// Classic script, not a module: module scripts are blocked on file://.
// rtsp:// -> HaviRtsp.play(). http(s) MJPEG -> <img>.
(function () {
  const $ = (id) => document.getElementById(id);
  const els = {
    form: $("sl-form"),
    url: $("sl-url"),
    pipe: $("sl-pipe"),
    advanced: $("sl-advanced"),
    stop: $("sl-stop"),
    video: $("sl-video"),
    canvas: $("sl-canvas"),
    img: $("sl-img"),
    status: $("sl-status"),
    codec: $("sl-codec"),
    size: $("sl-size"),
    rate: $("sl-rate"),
    audio: $("sl-audio"),
  };

  const params = new URLSearchParams(location.search);
  if (params.get("url")) els.url.value = params.get("url");
  if (params.get("pipe")) {
    els.pipe.value = params.get("pipe");
    if (els.advanced) els.advanced.open = true;
  }

  let handle = null;
  let lastBytes = 0;
  let lastTick = performance.now();

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    start(els.url.value.trim(), els.pipe.value.trim());
  });
  els.stop.addEventListener("click", () => stop("Stopped."));

  function start(url, pipe) {
    stop();
    if (!url) {
      setStatus("Enter a camera URL.", "warn");
      return;
    }
    try {
      handle = HaviRtsp.play(
        { video: els.video, canvas: els.canvas, img: els.img },
        url,
        {
          proxy: pipe || undefined,
          onStatus: setStatus,
          onInfo: (info) => {
            els.codec.textContent = info.codec || "—";
            els.size.textContent = info.width ? `${info.width}×${info.height}` : "—";
            els.audio.textContent = info.audio ? info.audio.codec || info.audio.sdpCodec : "none";
          },
        },
      );
    } catch (err) {
      setStatus(err.message, "err");
    }
  }

  function stop(message) {
    handle?.stop();
    handle = null;
    els.img.hidden = true;
    els.img.removeAttribute("src");
    els.video.hidden = false;
    els.canvas.hidden = true;
    els.codec.textContent = els.size.textContent = els.rate.textContent = els.audio.textContent = "—";
    if (message) setStatus(message, "");
  }

  function setStatus(text, kind) {
    els.status.textContent = text;
    els.status.className = `sl-status${kind ? ` is-${kind}` : ""}`;
  }

  setInterval(() => {
    const now = performance.now();
    const bytes = (handle?.player?.stats.bytes || 0) - lastBytes;
    const kbps = Math.round((bytes * 8) / ((now - lastTick) / 1000) / 1000);
    lastBytes = handle?.player?.stats.bytes || 0;
    lastTick = now;
    if (handle?.pipeline) els.rate.textContent = `${kbps} kb/s`;
  }, 1000);
})();
