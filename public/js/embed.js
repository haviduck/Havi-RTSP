// Classic script so file:// works. The library is the player; this file is only the form.
(function () {
  const player = document.getElementById("player");
  const form = document.getElementById("form");
  const url = document.getElementById("url");
  const status = document.getElementById("status");
  const snippet = document.getElementById("snippet");

  const params = new URLSearchParams(location.search);
  if (params.get("url")) url.value = params.get("url");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const stream = url.value.trim();
    if (!stream) {
      setStatus("Enter an RTSP URL.", "warn");
      return;
    }
    player.src = stream;
    snippet.hidden = false;
    snippet.textContent = [
      '<script src="/havi-rtsp.browser.js"><\/script>',
      `<havi-player src="${stream}" muted controls></havi-player>`,
    ].join("\n");
  });

  player.addEventListener("havi-status", (event) => {
    setStatus(event.detail.text, event.detail.kind);
  });
  player.addEventListener("havi-info", (event) => {
    const info = event.detail;
    const size = info.width ? ` ${info.width}×${info.height}` : "";
    setStatus(`Playing ${info.codec || info.family}${size}.`, "ok");
  });

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = `emb-status${kind ? ` is-${kind}` : ""}`;
  }
})();
