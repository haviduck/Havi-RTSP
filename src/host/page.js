// Built-in page served by the host when no --root is given.

export function builtinPage({ url = "" } = {}) {
  const preset = escapeAttr(url);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Havi-RTSP</title>
<style>
.havi-app{margin:0;background:#0b0d10;color:#e6e8eb;font:14px/1.4 system-ui,Segoe UI,Roboto,sans-serif}
.havi-app-layout{max-width:1100px;margin:0 auto;padding:20px;display:grid;gap:14px}
.havi-app-title{margin:0;font-size:20px;font-weight:600}
.havi-app-sub{margin:2px 0 0;color:#98a2ad;font-size:12px}
.havi-app-form{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:end}
.havi-app-field{display:grid;gap:4px;font-size:12px;color:#98a2ad}
.havi-app-field input{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #262b33;background:#12161b;color:#e6e8eb;font:inherit}
.havi-app-actions{display:flex;gap:8px}
.havi-app-btn{padding:9px 16px;border:1px solid #262b33;background:#171c22;color:#e6e8eb;font:inherit;cursor:pointer}
.havi-app-btn-primary{background:#2f6feb;border-color:#2f6feb;color:#fff}
.havi-app-stage{background:#000;aspect-ratio:16/9;display:grid}
.havi-app-stage havi-player,.havi-app-stage video,.havi-app-stage canvas,.havi-app-stage img{width:100%;height:100%;object-fit:contain;grid-area:1/1}
.havi-app-status{margin:0;color:#98a2ad}
.havi-app-status[data-kind="ok"]{color:#7bd88f}
.havi-app-status[data-kind="err"]{color:#ff8a80}
</style>
</head>
<body class="havi-app havi-app-page">
<main class="havi-app-layout">
  <header><h1 class="havi-app-title">Havi-RTSP</h1><p class="havi-app-sub">RTSP, depay and remux run in this page. This host only copies bytes.</p></header>
  <form class="havi-app-form" id="app-form">
    <label class="havi-app-field"><span>Camera</span>
      <input id="app-url" type="text" value="${preset}" placeholder="rtsp://user:pass@camera:554/path" autocomplete="off" spellcheck="false" /></label>
    <div class="havi-app-actions">
      <button type="submit" class="havi-app-btn havi-app-btn-primary">Play</button>
      <button type="button" class="havi-app-btn" id="app-stop">Stop</button>
    </div>
  </form>
  <section class="havi-app-stage"><havi-player id="app-player" muted controls></havi-player></section>
  <p class="havi-app-status" id="app-status">Idle. Paste a camera URL.</p>
</main>
<script src="/havi-rtsp.browser.js"></script>
<script>
(() => {
  const player = document.getElementById("app-player");
  const status = document.getElementById("app-status");
  const input = document.getElementById("app-url");
  player.addEventListener("havi-status", (e) => { status.textContent = e.detail.text; status.dataset.kind = e.detail.kind || ""; });
  document.getElementById("app-form").addEventListener("submit", (e) => { e.preventDefault(); player.src = input.value.trim(); });
  document.getElementById("app-stop").addEventListener("click", () => { player.src = ""; status.textContent = "Stopped."; });
  const q = new URLSearchParams(location.search).get("src");
  if (q) input.value = q;
  if (input.value) player.src = input.value;
})();
</script>
</body>
</html>`;
}

function escapeAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
