/*
 * Audit refactor:
 * - Kept splash DOM creation isolated from the startup orchestrator.
 * - Moved injected splash colors into CSS variables for theme consistency.
 * - Added JSDoc for the generated view API.
 */

/**
 * Builds the minimal splash CSS injected at startup.
 * @param {{FADE_IN_MS?: number, FADE_OUT_MS?: number}} timings
 * @returns {string}
 */
function buildSplashStyles(timings) {
  return `
    #startupSplash {
      --splash-bg: #0b0c10;
      --splash-hint-rgb: 255 255 255;
      position: fixed;
      inset: 0;
      z-index: 3000;
      background: var(--splash-bg);
      opacity: 0;
      transform: scale(1.02);
      transition: opacity ${timings.FADE_IN_MS}ms ease, transform ${timings.FADE_IN_MS}ms ease;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }
    #startupSplash.ready {
      opacity: 1;
      transform: scale(1);
    }
    #startupSplash.hide {
      opacity: 0;
      transform: scale(1.015);
      pointer-events: none;
      transition: opacity ${timings.FADE_OUT_MS}ms ease, transform ${timings.FADE_OUT_MS}ms ease;
    }
    #startupSplash img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }
    #splash-skip-hint {
      position: absolute;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%);
      color: rgb(var(--splash-hint-rgb) / 0.45);
      font: 500 11px "IBM Plex Mono", monospace, sans-serif;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.5s ease;
      white-space: nowrap;
    }
    #splash-skip-hint.visible {
      opacity: 1;
    }
  `;
}

/**
 * Creates the splash DOM nodes and returns imperative lifecycle hooks.
 * @param {object} options
 * @returns {{root: HTMLElement, image: HTMLImageElement, hint: HTMLElement, styleTag: HTMLStyleElement, injectStyles: Function, mount: Function, show: Function, hide: Function, setImage: Function, showSkipHint: Function, remove: Function}}
 */
export function createSplashView(options) {
  const config = options || {};
  const documentRef = config.documentRef || document;
  const splash = documentRef.createElement("div");
  const image = documentRef.createElement("img");
  const hint = documentRef.createElement("div");
  const styleTag = documentRef.createElement("style");

  splash.id = "startupSplash";
  splash.setAttribute("role", "img");
  splash.setAttribute("aria-label", config.ariaLabel || "");

  image.src = config.imageSrc || "";
  image.alt = "";
  image.draggable = false;

  hint.id = "splash-skip-hint";
  hint.textContent = config.skipHint || "";

  splash.appendChild(image);
  splash.appendChild(hint);

  styleTag.textContent = buildSplashStyles(config.timings || {});

  return {
    root: splash,
    image,
    hint,
    styleTag,
    injectStyles() {
      documentRef.head.appendChild(styleTag);
    },
    mount() {
      documentRef.body.appendChild(splash);
    },
    show() {
      splash.classList.add("ready");
    },
    hide() {
      splash.classList.add("hide");
    },
    setImage(nextImageSrc) {
      image.src = nextImageSrc || "";
    },
    showSkipHint() {
      hint.classList.add("visible");
    },
    remove() {
      splash.remove();
    },
  };
}
