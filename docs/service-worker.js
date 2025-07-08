// File: service-worker.js
const CACHE_VERSION = 'v9';
const CACHE_NAME = `storyverse-cache-${CACHE_VERSION}`;

const APP_SHELL = [
  '/proyek-akhir/',
  '/proyek-akhir/index.html',
  '/proyek-akhir/css/style.css',
  '/proyek-akhir/manifest.json',
  '/proyek-akhir/icons/icon-192x192.png',
  '/proyek-akhir/icons/icon-512x512.png',
  '/proyek-akhir/js/main.js',
  '/proyek-akhir/js/router.js',
  '/proyek-akhir/js/HomePresenter.js',
];

// Fungsi fallback saat benar-benar offline dan index.html tidak tersedia
function offlineFallback() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Offline</title>
    </head>
    <body>
      <h1>Anda sedang offline</h1>
      <p>Halaman tidak tersedia.</p>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Instalasi: cache asset utama
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Error during install:', err))
  );
});

// Aktivasi: hapus cache lama
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch handler
self.addEventListener('fetch', event => {
  const req = event.request;

  // Untuk permintaan navigasi halaman (misalnya buka langsung ke /beranda)
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          const networkRes = await fetch(req);
          return networkRes;
        } catch (error) {
          console.warn('[SW] Offline, fallback ke cache:', error);
          return (await cache.match('/proyek-akhir/index.html')) || offlineFallback();
        }
      })()
    );
    return;
  }

  // Untuk asset lainnya (css, js, gambar, dll)
  event.respondWith(
    fetch(req)
      .then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        return res;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match(req) || new Response('', { status: 200 });
      })
  );
});

// Push notification
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || 'Notifikasi Baru';
  const options = {
    body: data.options.body || 'Anda menerima pesan baru.',
    icon: '/proyek-akhir/icons/icon-192x192.png',
    badge: '/proyek-akhir/icons/icon-192x192.png',
    data: { url: data.url || '/proyek-akhir/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Klik notifikasi
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
    })
  );
});
