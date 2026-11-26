// Golden Eagles - PWA Service Worker
const CACHE = 'golden-eagles-v2-push-fix';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './eagle.webp',
  './vault.webp',
  './favicon.png',
  './favicon.ico',
  './supabase-config.js',
  './supabase-sync.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(CORE.map((u) => c.add(u)))).then(() => self.skipWaiting())
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
  // index.html دائماً من الشبكة - حتى ما يرجع النسخة القديمة اللي بيها unregister
  if (e.request.mode === 'navigate' || url.endsWith('/index.html') || url.endsWith('/')) {
    e.respondWith(fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put('./index.html', copy));
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
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
      }).catch(() => caches.match('./index.html'));
    })
  );
});


// ============ Push Notifications للزبون (نفس الأدمن) ============
self.addEventListener('push', function(event){
  var data = {};
  try{ data = event.data ? event.data.json() : {}; }catch(e){}
  var title = data.title || '🦅 النسور الذهبية';
  var options = {
    body: data.body || 'وصل تنبيه جديد - افتح التطبيق',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'ge-user-push',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: 'index.html' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list){
      for(var i=0;i<list.length;i++){
        if(list[i].url.indexOf('index.html') !== -1){ return list[i].focus(); }
      }
      return clients.openWindow('index.html');
    })
  );
});
