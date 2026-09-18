import { play } from "./play.js";

export function autoload() {
  if (typeof document === "undefined") return;
  const run = () => {
    document.querySelectorAll("[data-havi-src]").forEach((el) => {
      if (el.tagName === "HAVI-PLAYER") return;
      if (el.__haviHandle) return;
      const url = el.getAttribute("data-havi-src");
      if (!url) return;
      const target = el.tagName === "VIDEO" ? el : el.querySelector("video") || el;
      try {
        el.__haviHandle = play(target, url, {
          proxy: el.getAttribute("data-havi-pipe") || undefined,
          base: el.getAttribute("data-havi-base") || undefined,
        });
      } catch (err) {
        el.dispatchEvent(new CustomEvent("havi-status", { detail: { text: err.message, kind: "err" } }));
      }
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
