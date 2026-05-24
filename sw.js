/*
 * Audit refactor:
 * - Split cache flows into named helpers to make update behavior auditable.
 * - Bumped cache version for the ERA PDF compendium update and stale-cache purging.
 * - Added defensive request/response guards so failed or partial responses are not cached.
 * - Added newly referenced system modules to the app shell without changing game mechanics.
 */
const CACHE_VERSION = 'companion-v3.12.0';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const THIRD_PARTY_CACHE = `${CACHE_VERSION}-third-party`;
const THIRD_PARTY_ORIGINS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'unpkg.com'];
const FALLBACK_IMAGE = './assets/icons/verloren-mark.svg';
const FALLBACK_DOCUMENTS = ['./launcher.html', './index.html'];

const APP_SHELL = [
  "https://unpkg.com/react@18/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone/babel.min.js",
  "./",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/verloren-mark.svg",
  "./assets/screenshots/sheet-portrait.svg",
  "./assets/screenshots/sheet-wide.svg",
  "./assets/splash/splash_horizontal.png",
  "./assets/splash/splash_horizontal_2.png",
  "./assets/splash/splash_vertical.png",
  "./assets/splash/splash_vertical_2.png",
  "./css/abas_racas.css",
  "./css/another_setting.css",
  "./css/atributos.css",
  "./css/badge.css",
  "./css/bestiario.css",
  "./css/biblioteca.css",
  "./css/botao_save.css",
  "./css/compacto_expandido.css",
  "./css/decomposicao_base_bonus_raca.css",
  "./css/divisor_ornamentado.css",
  "./css/economia.css",
  "./css/editor.css",
  "./css/grafico_radial.css",
  "./css/grimorio_inventario.css",
  "./css/habilidades_raca_editor.css",
  "./css/import_export.css",
  "./css/import_preset.css",
  "./css/launcher.css",
  "./css/layout_main.css",
  "./css/listas_dinamicas.css",
  "./css/main_content.css",
  "./css/metaflora.css",
  "./css/modal.css",
  "./css/modo_leitura.css",
  "./css/modos.css",
  "./css/mundo.css",
  "./css/niveis.css",
  "./css/presets_racas.css",
  "./css/reset_base.css",
  "./css/responsividade.css",
  "./css/retrato.css",
  "./css/scrollbar_custom.css",
  "./css/select_raca_editor.css",
  "./css/settings.css",
  "./css/sidebar_editor.css",
  "./css/sistema.css",
  "./css/style.css",
  "./css/subatributos.css",
  "./css/subsec_mundo.css",
  "./css/subtabs_sistema.css",
  "./css/subtitulo_biblioteca.css",
  "./css/system_workbench.css",
  "./css/tabs.css",
  "./css/theme_data.css",
  "./css/themes.css",
  "./css/typography.css",
  "./css/tipo_toggle.css",
  "./css/toast.css",
  "./css/toggle_theme.css",
  "./css/views.css",
  "./core/companion-core.js",
  "./era/data.js",
  "./era/era-app.js",
  "./era/era-app-shell.js",
  "./era/era-app-state.js",
  "./era/era-combat-tracker-core.js",
  "./era/era-compendium-data.js",
  "./era/era-config.js",
  "./era/era-device.js",
  "./era/era-ficha-acervo.js",
  "./era/era-ficha-tab.js",
  "./era/era-ficha.js",
  "./era/era-profiles.js",
  "./era/era-reference.js",
  "./era/era-rolls-combate.js",
  "./era/era-rolls-dados.js",
  "./era/era-rolls.js",
  "./era/era-shared.js",
  "./era/index.html",
  "./era/style.css",
  "./icon-192.png",
  "./icon-512.png",
  "./index.html",
  "./js/app.js",
  "./js/browser-compat.js",
  "./js/data/equipment.js",
  "./js/data/grimorio.js",
  "./js/data/presets.js",
  "./js/data/races.js",
  "./js/data/world.js",
  "./js/launcher.js",
  "./js/pwa.js",
  "./js/splash.js",
  "./js/verloren/00-data-theme-portrait.js",
  "./js/verloren/10-navigation-editor-core.js",
  "./js/verloren/20-races-presets-import.js",
  "./js/verloren/30-export-economy-engine-radar.js",
  "./js/verloren/40-world-system-grimorio.js",
  "./js/verloren/50-ficha-views-bootstrap.js",
  "./launcher.html",
  "./manifest.json",
  "./src/config/splash-config.js",
  "./src/core/environment.js",
  "./src/main.js",
  "./src/modules/splash/splash.js",
  "./src/ui/splash-view.js",
  "./src/utils/random.js",
  "./src/utils/timing.js",
  "./systems/combat.js",
  "./systems/dice.js",
  "./systems/actions.js",
  "./systems/turn-economy.js",
  "./systems/turns.js",
  "./systems/verloren.js",
  "./splash_horizontal_2.png",
  "./splash_horizontal.png",
  "./splash_vertical_2.png",
  "./splash_vertical.png",
  "./ui/verloren-system-workbench.js",
  "./utils/common.js"
];

/**
 * Returns whether the response can be stored without poisoning the cache.
 * Opaque responses are allowed for CDNs that serve CORS-compatible scripts/fonts.
 * @param {Response | undefined} response
 * @returns {boolean}
 */
function isCacheableResponse(response) {
  return !!response && (response.ok || response.type === 'opaque');
}

/**
 * Filters requests that CacheStorage cannot safely persist.
 * @param {Request} request
 * @returns {Request | null}
 */
function normalizeRequestForCache(request) {
  if (!request || request.method !== 'GET') return null;
  if (request.headers && request.headers.has('range')) return null;

  try {
    const url = new URL(request.url);
    return url.protocol === 'http:' || url.protocol === 'https:' ? request : null;
  } catch (error) {
    return null;
  }
}

/**
 * Checks third-party hosts exactly or by subdomain to avoid accidental matches.
 * @param {string} hostname
 * @returns {boolean}
 */
function isKnownThirdPartyHost(hostname) {
  return THIRD_PARTY_ORIGINS.some(origin => hostname === origin || hostname.endsWith(`.${origin}`));
}

/**
 * Finds the first available cached fallback from an ordered list.
 * @param {string[]} candidates
 * @returns {Promise<Response | undefined>}
 */
async function matchFirst(candidates) {
  for (const candidate of candidates) {
    const cached = await caches.match(candidate);
    if (cached) return cached;
  }
  return undefined;
}

/**
 * Stores a clone of the response when the request/response pair is valid.
 * @param {Request} request
 * @param {Response} response
 * @param {string} cacheName
 * @returns {Promise<Response>}
 */
async function storeInCache(request, response, cacheName) {
  const cacheRequest = normalizeRequestForCache(request);
  if (!cacheRequest || !isCacheableResponse(response)) return response;

  try {
    const cache = await caches.open(cacheName);
    await cache.put(cacheRequest, response.clone());
  } catch (error) {
    // Cache writes can fail for browser-managed requests; returning the network
    // response keeps the app usable and avoids production logging noise.
  }

  return response;
}

/**
 * Fetches a request and attempts to cache the successful response.
 * @param {Request} request
 * @param {string} cacheName
 * @returns {Promise<Response>}
 */
async function fetchAndCache(request, cacheName) {
  const response = await fetch(request);
  return storeInCache(request, response, cacheName);
}

/**
 * Caches the declared static shell while tolerating optional offline misses.
 * @returns {Promise<void>}
 */
async function precacheAppShell() {
  const cache = await caches.open(APP_SHELL_CACHE);
  await Promise.all(APP_SHELL.map(asset => cache.add(new Request(asset, { cache: 'reload' })).catch(() => null)));
}

/**
 * Deletes all caches that do not belong to the current version.
 * @returns {Promise<void>}
 */
async function deleteOldCaches() {
  const keep = [APP_SHELL_CACHE, RUNTIME_CACHE, THIRD_PARTY_CACHE];
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => !keep.includes(key)).map(key => caches.delete(key)));
}

/**
 * Serves navigation requests from network first, then cached pages.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function networkFirstDocument(request) {
  try {
    return await fetchAndCache(request, RUNTIME_CACHE);
  } catch (error) {
    return (await caches.match(request)) || (await matchFirst(FALLBACK_DOCUMENTS)) || Response.error();
  }
}

/**
 * Serves cached static assets immediately and refreshes them in the background.
 * @param {FetchEvent} event
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function staleWhileRevalidate(event, request) {
  const cached = await caches.match(request);
  if (cached) {
    event.waitUntil(fetchAndCache(request, RUNTIME_CACHE).catch(() => null));
    return cached;
  }

  try {
    return await fetchAndCache(request, RUNTIME_CACHE);
  } catch (error) {
    if (request.destination === 'image') {
      return (await caches.match(FALLBACK_IMAGE)) || Response.error();
    }
    if (request.destination === 'document') {
      return (await matchFirst(FALLBACK_DOCUMENTS)) || Response.error();
    }
    return Response.error();
  }
}

/**
 * Uses network-first caching for CDN assets with shell fallbacks when offline.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function thirdPartyFirst(request) {
  try {
    return await fetchAndCache(request, THIRD_PARTY_CACHE);
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.destination === 'image') {
      return (await caches.match(FALLBACK_IMAGE)) || Response.error();
    }
    if (request.destination === 'document') {
      return (await matchFirst(FALLBACK_DOCUMENTS)) || Response.error();
    }
    return Response.error();
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    await precacheAppShell();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await deleteOldCaches();
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  if (isKnownThirdPartyHost(url.hostname)) {
    event.respondWith(thirdPartyFirst(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstDocument(request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(staleWhileRevalidate(event, request));
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
