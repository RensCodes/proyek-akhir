const CACHE_NAME = 'storyverse-app-v2'; // Naikkan versi jika ada perubahan besar
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    '/offline.html'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(APP_SHELL_URLS);
            })
            .then(() => {
                return self.skipWaiting();
            })
            .catch(error => {
                // 'error' digunakan di sini
                console.error('[SW] Precaching App Shell failed:', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    // Variabel 'error' sekarang digunakan untuk logging
                    console.log('[SW] Network request failed, serving offline fallback. Error:', error);
                    const cache = await caches.open(CACHE_NAME);
                    // Coba ambil dari cache dulu jika ada, sebelum ke halaman offline umum
                    const cachedResponse = await cache.match(event.request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    const offlinePage = await cache.match('/offline.html');
                    return offlinePage;
                }
            })()
        );
    } else if (APP_SHELL_URLS.includes(event.request.url) || ['style', 'script', 'font', 'image'].includes(event.request.destination)) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request).then((networkResponse) => {
                        return caches.open(CACHE_NAME).then((cache) => {
                            if (networkResponse && networkResponse.status === 200) {
                                cache.put(event.request, networkResponse.clone());
                            }
                            return networkResponse;
                        });
                    });
                })
        );
    }
});

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Notifikasi Baru';
    const options = {
        body: data.body || 'Anda memiliki pesan baru.',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-badge-72x72.png',
        image: data.image,
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
        },
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const notificationData = event.notification.data;
    if (notificationData && notificationData.url) {
        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url === notificationData.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow(notificationData.url);
                }
            })
        );
    }
});
