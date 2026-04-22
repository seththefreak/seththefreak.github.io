/*
 * Responsibility: expose viewport and device helpers used by the splash flow.
 * Exports: detectOrientation, getViewportPool, bindOrientationChange.
 */

export function detectOrientation(viewport = window) {
  return viewport.innerWidth >= viewport.innerHeight ? "landscape" : "portrait";
}

export function getViewportPool(imageVariants, viewport = window) {
  const orientation = detectOrientation(viewport);
  return orientation === "landscape" ? imageVariants.landscape : imageVariants.portrait;
}

export function bindOrientationChange(handler, target = window) {
  target.addEventListener("orientationchange", handler);
  return function unbindOrientationChange() {
    target.removeEventListener("orientationchange", handler);
  };
}
