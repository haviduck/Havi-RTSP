export function attachAmbient(video, canvas, stage) {
  const ctx = canvas.getContext("2d", { alpha: true });
  let timer = 0;

  function source() {
    const overlay = document.getElementById("canvas");
    if (overlay?.classList.contains("is-on") && overlay.width) return overlay;
    return video;
  }

  function paint() {
    const src = source();
    const w = src.videoWidth || src.width;
    const h = src.videoHeight || src.height;
    if (!w || !h) return;
    if (canvas.width !== 64) {
      canvas.width = 64;
      canvas.height = 36;
    }
    try {
      ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
    } catch {
      return;
    }
    stage.classList.toggle("is-live", Boolean(w));
  }

  timer = setInterval(paint, 90);
  return () => clearInterval(timer);
}
