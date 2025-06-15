const CACHE_VERSION = 'v2';
const CACHE_NAME = `storyverse-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/proyek-akhir/offline.html';

const APP_SHELL = [
  '/proyek-akhir/',
  '/proyek-akhir/index.html',
  '/proyek-akhir/css/style.css',
  '/proyek-akhir/manifest.json',
  '/proyek-akhir/offline.html',
  '/proyek-akhir/icons/icon-192x192.png',
  '/proyek-akhir/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Error during install:', err))
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(res => {
        return caches.open(CACHE_NAME).then(cache => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        });
      });
    }).catch(() => undefined)
  );
});

self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || 'Notifikasi Baru';
  const options = {
    body: data.body || 'Anda menerima pesan baru.',
    icon: '/proyek-akhir/icons/icon-192x192.png',
    badge: '/proyek-akhir/icons/icon-192x192.png',
    data: { url: data.url || '/proyek-akhir/' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification?.data?.url || '/proyek-akhir/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow ? self.clients.openWindow(urlToOpen) : null;
    }).catch(err => {
      console.error('[SW] Error in notification click handler:', err);
    })
  );
});
