const CACHE_VERSION = "v4"; // Aumente sempre que fizer deploy
const CACHE_NAME = `supermarket-guide-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/vite.svg',
];

// INSTALL — Cacheia os arquivos e força atualização
self.addEventListener('install', (event) => {
  self.skipWaiting(); // força instalar imediatamente

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ACTIVATE — Remove caches antigos e assume controle imediato
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim(); // força assumir clientes abertos
});

// FETCH — Stale-While-Revalidate + fallback offline
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Evita problemas com requests externos (Google TTS, bandeiras, etc.)
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          // Cache apenas respostas válidas
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // fallback offline
          return cachedResponse;
        });

      // retorna cache ou rede
      return cachedResponse || fetchPromise;
    })
  );
});
