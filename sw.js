const CACHE_NAME = 'aow3-radar-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/ico.jpeg',
  '/33Notext.png',
  '/img2War.png',
  '/2soldier.png',
  '/tank.png',
  '/404.html'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
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

self.addEventListener('fetch', (evt) => {
  const req = evt.request;

  if (isNavigationRequest(req)) {
    evt.respondWith(
      fetch(req)
        .then(networkRes => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('/index.html', clone));
            return networkRes;
          }
          return caches.match('/index.html') || caches.match('/404.html') || networkRes;
        })
        .catch(() => caches.match('/index.html') || caches.match('/404.html'))
    );
    return;
  }

  
  evt.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(networkRes => {
        if (!networkRes || networkRes.status !== 200) return networkRes;
        const copy = networkRes.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return networkRes;
      }).catch(() => {
        
        if (req.destination === 'image') return caches.match('/ico.jpeg');
        return caches.match('/index.html');
      });
    })
  );
});
