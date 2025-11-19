const CACHE_NAME = 'aow3-timers-v5'; // Updated to v5
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
  // App Icon
  'https://cdn-icons-png.flaticon.com/512/2061/2061961.png',
  // Background Image
  'https://images.unsplash.com/photo-1542256840-01c600e6f0f4?q=80&w=2600&auto=format&fit=crop',
  // Card Images (Pre-caching these so they work offline immediately)
  'https://image.pollinations.ai/prompt/Sci-fi%20blitz%20soldier%20firing%20rifle%20explosions%20golden%20light%20art%20of%20war%203?width=400&height=400&seed=10',
  'https://image.pollinations.ai/prompt/futuristic%20stadium%20arena%20blue%20neon%20lights%20crowd%20esports%20art%20of%20war%203?width=400&height=400&seed=20',
  'https://image.pollinations.ai/prompt/two%20sci-fi%20soldiers%20back%20to%20back%20red%20laser%20urban%20combat%20art%20of%20war%203?width=400&height=400&seed=30',
  'https://image.pollinations.ai/prompt/column%20of%20tanks%20and%20jets%20green%20hud%20desert%20storm%20art%20of%20war%203?width=400&height=400&seed=40'
];

// 1. Install Event: Caches all static assets immediately
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activate Event: Cleans up old caches (v4, v3, etc.)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 3. Fetch Event: Network First, but save to Cache for next time
// This ensures that if an image wasn't in ASSETS, it gets saved anyway.
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // If found in cache, return it (Offline mode!)
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from internet
      return fetch(e.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
          return response;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });

        return response;
      });
    })
  );
});