const CACHE_NAME = 'notizen-offline-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'icon-192.png',
  'icon-512.png'
];

// Installation: Dateien in den Cache laden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Wir verwenden cache.addAll, um alle wichtigen Dateien lokal zu speichern
      return cache.addAll(ASSETS);
    })
  );
  // Aktiviert den neuen Service Worker sofort
  self.skipWaiting();
});

// Aktivierung: Alten Cache löschen, wenn die Version geändert wurde
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Lösche alten Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Strategie: Network-First mit Fallback auf Cache
// Das stellt sicher, dass du immer die neueste Version hast, wenn du online bist
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
