// Service Worker لوحة الأدمن - يستقبل Push Notifications حتى لو التطبيق مسكر
self.addEventListener('push', function(event){
  var data = {};
  try{ data = event.data ? event.data.json() : {}; }catch(e){}
  var title = data.title || '🦅 النسور الذهبية - تنبيه جديد';
  var options = {
    body: data.body || 'وصل تنبيه جديد - افتح لوحة الأدمن',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'ge-admin-push',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { tab: data.tab || 'overview', url: 'admin.html' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', function(event){
  event.notification.close();
  var tab = (event.notification.data && event.notification.data.tab) || 'overview';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list){
      for(var i=0;i<list.length;i++){
        if(list[i].url.indexOf('admin.html') !== -1){ return list[i].focus(); }
      }
      return clients.openWindow('admin.html');
    })
  );
});
