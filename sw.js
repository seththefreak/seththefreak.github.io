// ============================================================
// VERLOREN RPG SHEETS — Service Worker v1.3.0
// Estratégia: Cache First para assets, Network First para HTML
// ============================================================

const CACHE_VERSION = 'verloren-v1.3.0';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const FONT_CACHE    = `${CACHE_VERSION}-fonts`;

// Assets que serão cacheados na instalação
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// URLs de fontes que terão cache separado
const FONT_ORIGINS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// ── INSTALL: pré-cacheia assets estáticos ──────────────────
self.addEventListener('install', event => {
  console.log('[SW] Instalando v1.3.0...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        // Adiciona individualmente para tolerar falhas parciais
        return Promise.all(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(e => console.warn(`[SW] Falha ao cachear ${url}:`, e))
          )
        );
      })
      .then(() => {
        console.log('[SW] Assets estáticos cacheados com sucesso.');
        return self.skipWaiting(); // ativa imediatamente
      })
      .catch(err => console.warn('[SW] Erro no cache inicial:', err))
  );
});

// ── ACTIVATE: remove caches antigos ───────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Ativando v1.3.0...');
  const validCaches = [STATIC_CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => !validCaches.includes(k))
          .map(k => {
            console.log('[SW] Removendo cache antigo:', k);
            return caches.delete(k);
          })
      ))
      .then(() => {
        console.log('[SW] Service Worker ativado e pronto.');
        return self.clients.claim();
      })
  );
});

// ── FETCH: estratégia por tipo de recurso ─────────────────
self.addEventListener('fetch', event => {
  const { request } = event;

  // Ignora requisições não-GET
  if (request.method !== 'GET') return;

  // Ignora extensões de navegador e esquemas não-http
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  // Fontes → Cache First (longa duração)
  if (FONT_ORIGINS.some(o => url.hostname.includes(o))) {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response && response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => new Response('', { status: 503, statusText: 'Offline' }));
        })
      )
    );
    return;
  }

  // HTML principal → Network First (sempre tenta versão mais nova)
  const isNavigate = request.mode === 'navigate'
    || url.pathname === '/'
    || url.pathname === '/index.html'
    || url.pathname.endsWith('.html');

  if (isNavigate) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(cached => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Demais assets → Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (!response || !response.ok) return response;
        const clone = response.clone();
        caches.open(STATIC_CACHE).then(c => c.put(request, clone));
        return response;
      }).catch(() => {
        if (request.destination === 'document') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});

// ── MENSAGENS: forçar atualização via postMessage ─────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    console.log('[SW] skipWaiting solicitado pelo cliente.');
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker v1.3.0 carregado.');
