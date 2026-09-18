(function () {
  const form = document.getElementById("form");
  const url = document.getElementById("url");
  const status = document.getElementById("status");
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const img = document.getElementById("image");
  let handle = null;

  const params = new URLSearchParams(location.search);
  if (params.get("url")) url.value = params.get("url");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handle?.stop();
    const stream = url.value.trim();
    if (!stream) {
      setStatus("Enter an RTSP URL.", "warn");
      return;
    }
    try {
      handle = HaviRtsp.play({ video, canvas, img }, stream, { onStatus: setStatus });
    } catch (err) {
      setStatus(err.message, "err");
    }
  });

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = `havi-status${kind ? ` is-${kind}` : ""}`;
  }
})();
