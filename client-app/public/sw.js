// Minimal service worker - just skip waiting and don't cache anything
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Delete all caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Don't intercept any requests - let everything go through normally
self.addEventListener('fetch', (event) => {
  // Just pass through - don't cache anything
  event.respondWith(fetch(event.request));
});
