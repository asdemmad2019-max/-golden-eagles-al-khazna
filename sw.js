// Golden Eagles - PWA Service Worker
const CACHE = 'golden-eagles-v2';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './admin.html',
  './manifest-admin.json',
  './eagle.webp',
  './vault.webp',
  './favicon.png',
  './favicon.ico',
  './supabase-config.js',
  './supabase-sync.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.all(CORE.map((u) => c.add(u).catch(() => null))),
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for Supabase / API, Cache-first for static
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (url.includes('supabase.co') || url.includes('supabase')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (e.request.method === 'GET' && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(url.includes('admin') ? './admin.html' : './index.html'));
    })
  );
});
