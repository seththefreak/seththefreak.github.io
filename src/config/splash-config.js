/*
 * Responsibility: centralize splash timings, copy and image variants.
 * Exports: SPLASH_TIMINGS, SPLASH_IMAGES, SPLASH_TEXT.
 */

export const SPLASH_TIMINGS = Object.freeze({
  DURATION_MS: 4000,
  FADE_IN_MS: 420,
  FADE_OUT_MS: 500,
  SKIP_AFTER_MS: 1400,
  REMOVE_BUFFER_MS: 50,
});

const SPLASH_BASE_PATH = "assets/splash/";

export const SPLASH_IMAGES = Object.freeze({
  landscape: Object.freeze([
    SPLASH_BASE_PATH + "splash_horizontal.png",
    SPLASH_BASE_PATH + "splash_horizontal_2.png",
  ]),
  portrait: Object.freeze([
    SPLASH_BASE_PATH + "splash_vertical.png",
    SPLASH_BASE_PATH + "splash_vertical_2.png",
  ]),
});

export const SPLASH_TEXT = Object.freeze({
  ARIA_LABEL: "Unheaven: Verloren - carregando...",
  SKIP_HINT: "toque para continuar",
});
