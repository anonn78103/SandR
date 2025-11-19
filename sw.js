const CACHE_NAME = 'aow3-timers-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap',
  // Note: We are caching the app shell. 
  // External AI images might not cache perfectly offline due to dynamic URLs, 
  // but the core timer functionality will work.
];

// Install Event - Cache Assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});
