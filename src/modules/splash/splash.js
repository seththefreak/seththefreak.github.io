/*
 * Responsibility: orchestrate splash lifecycle while keeping timing and environment explicit.
 * Exports: initSplash.
 */

import { SPLASH_IMAGES, SPLASH_TEXT, SPLASH_TIMINGS } from "../../config/splash-config.js";
import { bindOrientationChange, getViewportPool } from "../../core/environment.js";
import { createSplashView } from "../../ui/splash-view.js";
import { selectRandomVariant } from "../../utils/random.js";
import { createTimerBag } from "../../utils/timing.js";

function pickImage(random) {
  const pool = getViewportPool(SPLASH_IMAGES, window);
  return selectRandomVariant(pool, random);
}

export function initSplash(options) {
  const config = options || {};
  const timers = createTimerBag();
  const view = createSplashView({
    imageSrc: pickImage(config.random),
    ariaLabel: SPLASH_TEXT.ARIA_LABEL,
    skipHint: SPLASH_TEXT.SKIP_HINT,
    timings: SPLASH_TIMINGS,
  });
  let removed = false;
  let canSkip = false;

  view.injectStyles();

  function removeSplash() {
    if (removed) return;
    removed = true;
    timers.cancelAll();
    view.hide();
    timers.schedule(function detachSplash() {
      view.remove();
    }, SPLASH_TIMINGS.FADE_OUT_MS + SPLASH_TIMINGS.REMOVE_BUFFER_MS);
  }

  document.addEventListener("DOMContentLoaded", function onDomReady() {
    view.mount();
    window.requestAnimationFrame(function showSplash() {
      view.show();
    });
  }, { once: true });

  window.addEventListener("load", function onWindowLoad() {
    timers.schedule(function showHint() {
      view.showSkipHint();
    }, SPLASH_TIMINGS.SKIP_AFTER_MS);

    timers.schedule(removeSplash, SPLASH_TIMINGS.DURATION_MS);

    timers.schedule(function unlockSkip() {
      canSkip = true;
    }, SPLASH_TIMINGS.SKIP_AFTER_MS);

    view.root.addEventListener("click", function onSplashClick() {
      if (!canSkip) return;
      removeSplash();
    });
  }, { once: true });

  bindOrientationChange(function onOrientationChange() {
    if (removed) return;
    view.setImage(pickImage(config.random));
  });

  return {
    removeSplash,
  };
}
