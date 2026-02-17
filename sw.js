// ============================================================
// VERLOREN RPG SHEETS — Service Worker v1.2.0
// Estratégia: Cache First para assets, Network First para HTML
// ============================================================

const CACHE_VERSION = 'verloren-v1.2.2';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const FONT_CACHE    = `${CACHE_VERSION}-fonts`;

// Assets que serão cacheados na instalação
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// URLs de fontes que terão cache separado
const FONT_ORIGINS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// ── INSTALL: pré-cacheia assets estáticos ──────────────────
self.addEventListener('install', event => {
  console.log('[SW] Instalando v1.2.2...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Erro ao adicionar alguns assets ao cache:', err);
          // Tenta adicionar individualmente
          return Promise.all(
            STATIC_ASSETS.map(url => 
              cache.add(url).catch(e => console.warn(`[SW] Falha ao cachear ${url}:`, e))
            )
          );
        });
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
  console.log('[SW] Ativando v1.2.2...');
  const validCaches = [STATIC_CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !validCaches.includes(k)).map(k => {
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
  // Ignora requisições não-GET e extensões
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;
  if (event.request.url.startsWith('about:')) return;

  const url = new URL(event.request.url);

  // Fontes → Cache First (longa duração)
  if (FONT_ORIGINS.some(o => url.hostname.includes(o))) {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) {
            console.log('[SW] Fonte em cache:', url.pathname);
            return cached;
          }
          return fetch(event.request).then(response => {
            if (response && response.ok) {
              console.log('[SW] Cacheando fonte:', url.pathname);
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(err => {
            console.warn('[SW] Erro ao buscar fonte:', err);
            return new Response('', { status: 503 });
          });
        })
      )
    );
    return;
  }

  // HTML principal → Network First (sempre tenta versão mais nova)
  if (event.request.mode === 'navigate' || 
      url.pathname === '/' || 
      url.pathname === '/index.html' ||
      url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            console.log('[SW] HTML atualizado via rede');
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(c => c.put(event.request, clone));
          }
          return response;
        })
        .catch(err => {
          console.log('[SW] Rede falhou, usando cache para HTML');
          return caches.match(event.request).then(cached => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Demais assets → Cache First
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        console.log('[SW] Asset em cache:', url.pathname);
        return cached;
      }
      
      return fetch(event.request).then(response => {
        if (!response || !response.ok) return response;
        
        // Só cacheia respostas OK
        const clone = response.clone();
        caches.open(STATIC_CACHE).then(c => {
          console.log('[SW] Cacheando asset:', url.pathname);
          c.put(event.request, clone);
        });
        return response;
      }).catch(err => {
        console.warn('[SW] Erro ao buscar:', url.pathname, err);
        // Fallback para HTML se for navegação
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
        return new Response('', { status: 503 });
      });
    })
  );
});

// ── MENSAGENS: forçar atualização via postMessage ─────────
self.addEventListener('message', event => {
  console.log('[SW] Mensagem recebida:', event.data);
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker carregado.');
