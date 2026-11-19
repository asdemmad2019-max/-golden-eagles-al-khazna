// Golden Eagles - PWA Service Worker v15 - network-first for HTML, cache-first for assets
const CACHE = 'golden-eagles-v15';
const ASSETS = ['./manifest.json','./icon-192.png','./icon-512.png','./eagle.webp','./vault.webp','./favicon.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(()=>{})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : null)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Always fresh HTML - never serve stale index
  if (url.pathname.endsWith('.html') || url.pathname.endsWith('/') || e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(()=>{});
    return res;
  }).catch(() => hit)));
});
