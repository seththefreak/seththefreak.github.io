const CACHE_NAME = "unheaven-final";

self.addEventListener("install", e => {
 self.skipWaiting();
 e.waitUntil(
  caches.open(CACHE_NAME).then(cache => cache.addAll(["/","/index.html"]))
 );
});

self.addEventListener("activate", e => {
 e.waitUntil(
  caches.keys().then(keys =>
   Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
  )
 );
 self.clients.claim();
});

self.addEventListener("fetch", e => {
 e.respondWith(
  caches.match(e.request).then(res => res || fetch(e.request))
 );
});
