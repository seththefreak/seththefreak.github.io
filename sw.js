// UnheaveN: ERA — Companion · sw.js
// Service Worker — cache-first com fallback de rede.

const CACHE_NAME = "era-companion-v1";

// Assets locais cacheados no install (garantia de offline imediato após 1º load)
const LOCAL_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/data.js",
  "/app.js",
  "/manifest.json",
];

// ── Install ──────────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(LOCAL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
// Estratégia: cache-first para assets locais, network-first para CDN.

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Apenas GET
  if (event.request.method !== "GET") return;

  // Assets do mesmo origin → cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // CDN (unpkg, cdnjs, etc.) → network-first, fallback para cache
  if (url.hostname.includes("unpkg.com") || url.hostname.includes("cdnjs.com")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
