/* Service worker: รับ push จาก FCM แล้วแสดง notification
   ไม่ใช้ Firebase SDK ในไฟล์นี้ จึงไม่ต้องใส่ config ซ้ำ */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let p = {};
  try { p = e.data ? e.data.json() : {}; }
  catch (err) { p = { data: { title: 'IV Load Alert', body: e.data ? e.data.text() : '' } }; }
  const d = p.data || p.notification || p;
  const id = d.id || '';
  const title = d.title || '⏰ IV ครบเวลา';
  const opts = {
    body: d.body || '',
    // tag ไม่ซ้ำทุกครั้ง → iPhone ถือเป็นแจ้งเตือนใหม่และมีเสียงทุกรอบ
    tag: 'ivl-' + (id || 'general') + '-' + Date.now(),
    requireInteraction: true,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [400, 150, 400, 150, 400],
    data: { id: id },
    actions: id ? [{ action: 'check', title: '✓ Check แล้ว' }] : []
  };
  e.waitUntil((async () => {
    // ลบแจ้งเตือนเก่าของเคสเดียวกัน ให้เหลืออันล่าสุดอันเดียว ไม่กองเต็มจอ
    if (id) {
      const old = await self.registration.getNotifications();
      old.forEach(n => { if (n.data && n.data.id === id) n.close(); });
    }
    await self.registration.showNotification(title, opts);
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const id = (e.notification.data && e.notification.data.id) || '';
  const type = e.action === 'check' && id ? 'check' : 'focus';
  const base = self.registration.scope;
  const url = id ? base + '?' + type + '=' + encodeURIComponent(id) : base;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of wins) {
      if (c.url.startsWith(base)) {
        if (id) c.postMessage({ type: type, id: id });
        return c.focus();
      }
    }
    return self.clients.openWindow(url);
  })());
});
