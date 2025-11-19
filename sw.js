const CACHE_NAME = 'aow3-timers-v6'; // Updated to v6
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
  // New App Icon (Soldier)
  'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  // Global Background
  'https://images.unsplash.com/photo-1542256840-01c600e6f0f4?q=80&w=2600&auto=format&fit=crop',
  // New Tile Images (No Watermarks)
  'https://images.unsplash.com/photo-1618522827479-314cb1292d14?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519669556867-7d2c09149877?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550526279-453213997245?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599365867781-c0e79563190e?q=80&w=800&auto=format&fit=crop'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return response;
      });
    })
  );
});