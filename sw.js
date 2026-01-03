const CACHE_NAME = 'notizen_offline-v9';
const ASSETS = [
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  return self.clients.claim();
});

// Die stabilste Strategie gegen den Refresh-Fehler
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Wenn im Cache, sofort diese Version liefern (kein Warten aufs Netz)
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // 2. Im Hintergrund neue Version in den Cache legen
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // Netzwerkfehler ignorieren, da wir ja den Cache haben
      });

      return cachedResponse || fetchPromise;
    })
  );
});
