import { play } from "./play.js";
import { ensureBaseStyles } from "./styles.js";

const BaseElement = typeof HTMLElement === "function" ? HTMLElement : class {};

export class HaviPlayerElement extends BaseElement {
  static get observedAttributes() {
    return ["src", "pipe", "base", "muted", "controls"];
  }

  constructor() {
    super();
    this.video = document.createElement("video");
    this.canvas = document.createElement("canvas");
    this.img = document.createElement("img");
    this.video.playsInline = true;
    this.video.autoplay = true;
    this.video.muted = true;
    this.canvas.hidden = true;
    this.img.hidden = true;
    this.img.alt = "";
    this._handle = null;
    this._gen = 0;
  }

  connectedCallback() {
    ensureBaseStyles();
    if (!this.video.parentNode) this.append(this.video, this.canvas, this.img);
    this.#syncMediaAttrs();
    if (this.getAttribute("src")) this.#start();
  }

  disconnectedCallback() {
    this._gen += 1;
    this._handle?.stop();
    this._handle = null;
  }

  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    if (name === "src" || name === "pipe" || name === "base") this.#start();
    else this.#syncMediaAttrs();
  }

  get src() {
    return this.getAttribute("src") || "";
  }

  set src(value) {
    if (value) this.setAttribute("src", value);
    else this.removeAttribute("src");
  }

  #syncMediaAttrs() {
    this.video.muted = this.getAttribute("muted") !== "false";
    this.video.controls = this.hasAttribute("controls");
  }

  #start() {
    const url = this.getAttribute("src");
    const gen = ++this._gen;
    this._handle?.stop();
    this._handle = null;
    if (!url) return;
    try {
      this._handle = play(
        { video: this.video, canvas: this.canvas, img: this.img },
        url,
        {
          proxy: this.getAttribute("pipe") || undefined,
          base: this.getAttribute("base") || undefined,
          onStatus: (text, kind) => {
            if (gen !== this._gen) return;
            this.dispatchEvent(new CustomEvent("havi-status", { detail: { text, kind } }));
          },
          onInfo: (info) => {
            if (gen !== this._gen) return;
            this.dispatchEvent(new CustomEvent("havi-info", { detail: info }));
          },
        },
      );
    } catch (err) {
      this.dispatchEvent(new CustomEvent("havi-status", { detail: { text: err.message, kind: "err" } }));
    }
  }
}

export function defineHaviPlayer() {
  if (typeof customElements === "undefined") return;
  if (!customElements.get("havi-player")) customElements.define("havi-player", HaviPlayerElement);
}
