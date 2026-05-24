/*
 * Audit refactor:
 * - Documented splash lifecycle orchestration.
 * - Unbound orientation listeners when the splash is removed to avoid stale handlers.
 * - Preserved image pools, copy, and timing values.
 */

import { SPLASH_IMAGES, SPLASH_TEXT, SPLASH_TIMINGS } from "../../config/splash-config.js";
import { bindOrientationChange, getViewportPool } from "../../core/environment.js";
import { createSplashView } from "../../ui/splash-view.js";
import { selectRandomVariant } from "../../utils/random.js";
import { createTimerBag } from "../../utils/timing.js";

/**
 * Chooses a splash image from the pool that matches current orientation.
 * @param {Function=} random
 * @returns {string}
 */
function pickImage(random) {
  const pool = getViewportPool(SPLASH_IMAGES, window);
  return selectRandomVariant(pool, random);
}

/**
 * Initializes and schedules the startup splash lifecycle.
 * @param {{random?: Function}=} options
 * @returns {{removeSplash: Function}}
 */
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
  let unbindOrientation = null;

  view.injectStyles();

  /**
   * Hides and detaches the splash once all timers/listeners are cleaned up.
   * @returns {void}
   */
  function removeSplash() {
    if (removed) return;
    removed = true;
    timers.cancelAll();
    if (typeof unbindOrientation === "function") {
      unbindOrientation();
      unbindOrientation = null;
    }
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

  unbindOrientation = bindOrientationChange(function onOrientationChange() {
    if (removed) return;
    view.setImage(pickImage(config.random));
  });

  return {
    removeSplash,
  };
}
