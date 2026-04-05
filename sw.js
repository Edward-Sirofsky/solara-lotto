// Solana Lotto — Service Worker
// Caches the shell for offline/fast load, always fetches fresh content

const CACHE = 'solana-lotto-v1';
const SHELL = [
  '/solana-lotto/',
  '/solana-lotto/index.html',
  '/solana-lotto/manifest.json',
  '/solana-lotto/icons/icon-192.png',
  '/solana-lotto/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first for API calls (prices), cache fallback for shell
  if (e.request.url.includes('jup.ag') || e.request.url.includes('solscan')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
