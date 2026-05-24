/*
 * Audit refactor:
 * - Documented the module entrypoint for the splash startup graph.
 * - Kept startup order and public export unchanged.
 * - No gameplay or UI copy changed.
 */

import { initSplash } from "./modules/splash/splash.js";

/**
 * Starts the companion startup modules.
 * @returns {{removeSplash: Function}}
 */
export function initCompanionMain() {
  return initSplash();
}

initCompanionMain();
