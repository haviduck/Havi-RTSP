export function bindControls({ shell, video, onUserPlay, onUserPause, onUserStop }) {
  const playBtn = document.getElementById("ctrl-play");
  const playIcon = document.getElementById("icon-play");
  const pauseIcon = document.getElementById("icon-pause");
  const stopBtn = document.getElementById("ctrl-stop");
  const muteBtn = document.getElementById("ctrl-mute");
  const vol = document.getElementById("ctrl-vol");
  const fsBtn = document.getElementById("ctrl-fs");
  const time = document.getElementById("hud-time");
  const hudState = document.getElementById("hud-state");
  const warn = document.getElementById("compat-warn");
  const scrub = document.getElementById("scrub-live");

  playBtn.addEventListener("click", () => {
    onUserPlay?.();
  });

  stopBtn?.addEventListener("click", () => {
    onUserStop?.();
  });

  muteBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 0.8;
    vol.value = video.muted ? 0 : video.volume;
  });

  vol.addEventListener("input", () => {
    video.volume = Number(vol.value);
    video.muted = video.volume === 0;
  });

  fsBtn.addEventListener("click", async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shell.requestFullscreen();
  });

  video.addEventListener("play", () => setPaused(false));
  video.addEventListener("pause", () => setPaused(true));

  function setPaused(paused) {
    playIcon.hidden = !paused;
    pauseIcon.hidden = paused;
    shell.classList.toggle("is-paused", paused);
    shell.classList.toggle("is-playing", !paused);
  }

  return {
    setState(text) {
      hudState.textContent = text;
    },
    setCodec() {},
    setLatency(seconds) {
      if (scrub && seconds != null && !Number.isNaN(seconds)) {
        scrub.style.width = `${Math.max(6, Math.min(100, (0.35 / Math.max(seconds, 0.12)) * 100))}%`;
      }
    },
    setTime(seconds) {
      const t = Math.max(0, Math.floor(seconds || 0));
      const m = String(Math.floor(t / 60)).padStart(2, "0");
      const s = String(t % 60).padStart(2, "0");
      time.textContent = `${m}:${s}`;
    },
    setLive(live) {
      shell.classList.toggle("is-live", live);
      shell.classList.toggle("is-idle", !live);
    },
    setWarning(message) {
      warn.textContent = message || "";
      shell.classList.toggle("is-incompatible", Boolean(message));
    },
    setPaused,
  };
}
