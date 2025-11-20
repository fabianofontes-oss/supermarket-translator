const CACHE_NAME = 'supermarket-guide-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/vite.svg'
];

// Install event - cache core static assets
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Stale-While-Revalidate strategy
self.addEventListener('fetch', (e) => {
  // Skip cross-origin requests (like Google TTS or flags) from caching to avoid opaque response issues initially
  if (!e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Return cached response if available
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Update cache with new response
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, responseToCache);
            });
        }
        return networkResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});