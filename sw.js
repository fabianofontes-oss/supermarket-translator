const CACHE_NAME = 'supermarket-guide-v5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/vite.svg',
  '/manifest.json'
];

// INSTALL — Cacheia os arquivos estáticos essenciais imediatamente
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força o SW a assumir o controle imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ACTIVATE — Limpa caches antigos para evitar conflitos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim()) // Garante controle sobre abas abertas
  );
});

// FETCH — Estratégia: Stale-While-Revalidate com Fallback para SPA
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Ignorar requisições que não são HTTP (ex: chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // 2. Ignorar recursos externos (Google Fonts, Analytics, TTS, Bandeiras)
  // Deixamos o navegador lidar com o cache nativo dessas requisições ou falhar silenciosamente
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Busca na rede para atualizar o cache em segundo plano (Stale-While-Revalidate)
      const fetchPromise = fetch(request).then((networkResponse) => {
        // Só cacheia se a resposta for válida e do mesmo domínio
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se a rede falhar e não tivermos cache...
        // Se for uma navegação (HTML), retorna o index.html (Fallback para SPA)
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });

      // Retorna o cache se existir, senão espera a rede
      return cachedResponse || fetchPromise;
    })
  );
});