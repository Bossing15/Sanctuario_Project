// Run this in the browser console to force clear everything
(async function() {
  console.log('🧹 Starting force clear...');
  
  try {
    // Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Found ' + registrations.length + ' service workers');
      for (let registration of registrations) {
        const success = await registration.unregister();
        console.log('Unregistered:', success);
      }
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      console.log('Found ' + cacheNames.length + ' caches');
      for (let cacheName of cacheNames) {
        const success = await caches.delete(cacheName);
        console.log('Deleted cache:', cacheName, success);
      }
    }
    
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    console.log('✅ All cleared!');
    console.log('🔄 Reloading page...');
    
    // Reload
    setTimeout(() => {
      window.location.href = '/home';
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
