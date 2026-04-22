/*
 * Responsibility: create and update the splash DOM and injected styles.
 * Exports: createSplashView.
 */

function buildSplashStyles(timings) {
  return `
    #startupSplash {
      position: fixed;
      inset: 0;
      z-index: 3000;
      background: #0b0c10;
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
      color: rgba(255, 255, 255, 0.45);
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
