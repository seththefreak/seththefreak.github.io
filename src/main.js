/*
 * Responsibility: entrypoint that wires the current companion startup modules.
 * Exports: initCompanionMain.
 */

import { initSplash } from "./modules/splash/splash.js";

export function initCompanionMain() {
  return initSplash();
}

initCompanionMain();
