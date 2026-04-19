import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Unregister service worker - it's causing issues with payment routes
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Unregister all service workers
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister().catch((error) => {
          console.log('Failed to unregister SW:', error);
        });
      }
    });

    // Clear all caches
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName).catch(() => {});
        });
      });
    }
  });
} 