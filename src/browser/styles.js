export const HAVI_BASE_CSS = `
havi-player{display:block;position:relative;width:100%;background:#000;aspect-ratio:16/9}
havi-player video,havi-player canvas,havi-player img,.havi-canvas,.havi-img{display:block;width:100%;height:100%;object-fit:contain;background:#000}
havi-player video[hidden],havi-player canvas[hidden],havi-player img[hidden],.havi-canvas[hidden],.havi-img[hidden]{display:none}
`;

const STYLE_ID = "havi-rtsp-base";

export function ensureBaseStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = HAVI_BASE_CSS;
  document.head.appendChild(style);
}
