// SOLARA — Service Worker
// Caches the app shell for offline/fast load, always prefers fresh content.
//
// Not used inside the Android APK: that build serves the app from bundled assets
// on a different origin, where this scope doesn't exist. index.html skips
// registration when running natively.

// Bump this whenever the shell changes — activate() deletes every other cache,
// which is what evicts the pre-SOLARA assets from returning visitors.
const CACHE = 'solara-v11';
const SHELL = [
  '/',
  '/index.html',
  '/terms.html',
  '/privacy.html',
  '/copyright.html',
  '/referrals/',
  '/manifest.json',
  '/vendor/buffer.min.js',
  '/vendor/solana-web3.iife.min.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/solara-coin.png',
  '/assets/solara-wordmark-only.png',
  '/assets/solara-banner.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    // addAll() rejects the whole install if any single entry 404s, which would
    // leave the SW permanently uninstalled. Cache what we can and move on.
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
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
  const url = e.request.url;

  // Never cache chain or price data — a stale pool balance or ticket price is
  // worse than no answer. Straight to the network, no cache fallback.
  // workers.dev is the Cloudflare RPC proxy — it replaced the direct Helius
  // endpoint, so matching only helius-rpc.com would silently start caching
  // chain state again.
  if (url.includes('api.devnet.solana.com') ||
      url.includes('helius-rpc.com') ||
      url.includes('.workers.dev') ||
      url.includes('api.coingecko.com')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Shell: network first, fall back to cache when offline.
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Only cache successful same-origin GETs; caching opaque/error responses
        // poisons the shell.
        if (e.request.method === 'GET' && res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
