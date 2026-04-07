// Script to clear service worker and caches
// Add this to your index.html temporarily or run in console

(function() {
  console.log('🧹 Starting cache cleanup...');
  
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister().then(function(success) {
          console.log('✓ Service worker unregistered:', success);
        });
      }
    });
  }
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('🗑️ Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('✓ All caches cleared!');
      console.log('🔄 Reloading page...');
      setTimeout(function() {
        window.location.reload(true);
      }, 1000);
    });
  }
})();
