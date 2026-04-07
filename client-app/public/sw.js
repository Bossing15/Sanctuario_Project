const CACHE_NAME = 'sanctuario-v3';
const urlsToCache = [
  '/manifest.json',
  '/main_icon.jpg',
  '/Sanctuario_Logo_Good.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

// Fetch event - network first for API calls, HTML, CSS, and JS
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isStaticAsset = event.request.destination === 'style' || 
                        event.request.destination === 'script' ||
                        url.pathname.endsWith('.css') ||
                        url.pathname.endsWith('.js');
  
  // Always fetch fresh for API calls, HTML pages, CSS, and JS
  if (url.pathname.startsWith('/api/') || 
      event.request.destination === 'document' ||
      url.pathname.includes('/payment') ||
      isStaticAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache only if network fails
          return caches.match(event.request);
        })
    );
  } else {
    // For images and other assets, use cache first
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});