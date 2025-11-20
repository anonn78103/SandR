const CACHE_NAME = 'aow3-radar-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.svg',
  './2soldier.png',
  './33Notext.png',
  './img2War.png',
  './tank.png',
  './404.html'
];

self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

self.addEventListener('fetch', evt => {
  const req = evt.request;

  if (isNavigationRequest(req)) {
    evt.respondWith(
      fetch(req).then(networkRes => {
        if (networkRes && networkRes.status === 200) {
          return networkRes;
        }
        if (networkRes && networkRes.status === 404) {
          return caches.match('./404.html') || new Response('Not Found', { status: 404 });
        }
        return networkRes;
      }).catch(() => {
        return caches.match('./index.html');
      })
    );
    return;
  }

  evt.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(networkRes => {
        if (!networkRes || networkRes.status !== 200) return networkRes;
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then(cache => {
          try { cache.put(req, copy); } catch (e) {}
        });
        return networkRes;
      }).catch(() => {
        if (req.destination === 'image') return caches.match('./icon-192.png');
        return caches.match('./index.html');
      });
    })
  );
});
