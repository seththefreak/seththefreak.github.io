/* UnheaveN: ERA Companion — Service Worker v1.1
   Fix: GitHub Pages subdirectory scope + robust fetch fallback */
const STATIC_CACHE = 'unheaven-static-v2';
const DATA_CACHE   = 'unheaven-data-v2';

// Derive base path at runtime so this works both on localhost
// (scope = '/') and on GitHub Pages (scope = '/nome-do-repo/')
const BASE = self.registration.scope; // e.g. "https://user.github.io/repo/"

const STATIC_ASSETS = [
  BASE + 'index.html',
  BASE + 'style.css',
  BASE + 'app.js',
  BASE + 'data.js',
  BASE + 'manifest.json',
  BASE + 'icons/icon.svg',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Rajdhani:wght@400;500;600;700&family=Barlow:ital,wght@0,300;0,400;0,500;1,300&display=swap',
];

// ── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn('[SW] Install: some assets failed to cache:', err);
        // Don't block install on cache failures
        return self.skipWaiting();
      })
  );
});

// ── ACTIVATE ────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  const CURRENT = [STATIC_CACHE, DATA_CACHE];
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => !CURRENT.includes(n)).map(n => {
          console.log('[SW] Deleting old cache:', n);
          return caches.delete(n);
        })
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.protocol === 'chrome-extension:') return;

  // Google Fonts — stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(req).then(cached => {
          const fetchPromise = fetch(req).then(res => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Local assets — cache-first, network fallback, then offline shell
  const isLocal = req.url.startsWith(BASE) || url.origin === self.location.origin;
  if (isLocal) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;

        return fetch(req).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then(c => c.put(req, clone));
          }
          return res;
        }).catch(() => {
          // Offline fallback for navigation requests
          if (req.mode === 'navigate') {
            return caches.match(BASE + 'index.html')
              || caches.match('./index.html');
          }
          // Return empty response for other assets to avoid hard failure
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
    );
    return;
  }
});

// ── MESSAGES ────────────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))));
  }
});
