/*
 * Audit refactor:
 * - Documented viewport helpers used by the splash flow.
 * - Kept orientation behavior and image-pool selection unchanged.
 * - Returned an explicit unbind function for cleanup callers.
 */

/**
 * Detects viewport orientation from current dimensions.
 * @param {Window} viewport
 * @returns {"landscape" | "portrait"}
 */
export function detectOrientation(viewport = window) {
  return viewport.innerWidth >= viewport.innerHeight ? "landscape" : "portrait";
}

/**
 * Selects the image pool for the current orientation.
 * @param {{landscape: string[], portrait: string[]}} imageVariants
 * @param {Window} viewport
 * @returns {string[]}
 */
export function getViewportPool(imageVariants, viewport = window) {
  const orientation = detectOrientation(viewport);
  return orientation === "landscape" ? imageVariants.landscape : imageVariants.portrait;
}

/**
 * Binds orientation changes and returns a cleanup function.
 * @param {Function} handler
 * @param {Window} target
 * @returns {Function}
 */
export function bindOrientationChange(handler, target = window) {
  target.addEventListener("orientationchange", handler);
  return function unbindOrientationChange() {
    target.removeEventListener("orientationchange", handler);
  };
}
