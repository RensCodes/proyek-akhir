// service-worker.js

const CACHE_NAME = 'storyverse-app-v1'; // Ubah versi jika ada update besar pada aset
const APP_SHELL_URLS = [
    '/', // Alias untuk index.html
    '/index.html',
    '/css/style.css',
    // Aset JavaScript inti (Vite akan menghasilkan nama file dengan hash saat build, jadi ini lebih kompleks)
    // Untuk Vite, kita biasanya membiarkan Vite/plugin PWA menangani precaching aset yang di-bundle.
    // Namun, untuk App Shell manual, kita bisa daftarkan file utama.
    // Perhatikan: path ke file JS yang di-bundle Vite bisa berubah.
    // Ini adalah contoh sederhana. Plugin PWA seperti vite-plugin-pwa lebih disarankan untuk ini.
    // '/js/app.js', // Mungkin perlu disesuaikan berdasarkan output build Vite
    // '/js/router.js',
    // '/js/utils.js',
    // '/js/config.js',
    // '/js/services/TokenService.js',
    // '/js/models/AuthModel.js',
    // '/js/views/AuthView.js',
    // '/js/presenters/AuthPresenter.js',
    // '/js/services/StoryApiService.js', // Mungkin tidak di-cache di app shell jika butuh data dinamis

    // Ikon dan font jika tidak dari CDN dan ingin di-cache sebagai bagian dari shell
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    '/offline.html' // Halaman fallback offline
];

// Instalasi Service Worker: Cache App Shell
self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching App Shell:', APP_SHELL_URLS);
                return cache.addAll(APP_SHELL_URLS);
            })
            .then(() => {
                console.log('[SW] App Shell precached successfully');
                return self.skipWaiting(); // Aktifkan SW baru segera
            })
            .catch(error => {
                console.error('[SW] Precaching App Shell failed:', error);
            })
    );
});

// Aktivasi Service Worker: Hapus cache lama
self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`[SW] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Ambil kontrol halaman yang terbuka segera
    );
});

// Fetch Event: Sajikan dari Cache, fallback ke Network, lalu ke halaman offline
self.addEventListener('fetch', (event) => {
    // Kita hanya akan menangani permintaan GET navigasi untuk offline fallback sederhana
    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    // Coba ambil dari network dulu (Network First)
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    // Jika network gagal, coba ambil dari cache
                    console.log('[SW] Network request failed, trying cache for:', event.request.url);
                    const cache = await caches.open(CACHE_NAME);
                    const cachedResponse = await cache.match(event.request);
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Jika tidak ada di cache, tampilkan halaman offline fallback
                    console.log('[SW] Not found in cache, serving offline page for:', event.request.url);
                    const offlinePage = await cache.match('/offline.html');
                    return offlinePage;
                }
            })()
        );
    } else if (APP_SHELL_URLS.includes(event.request.url) || event.request.destination === 'style' || event.request.destination === 'script' || event.request.destination === 'font' || event.request.destination === 'image') {
        // Untuk aset App Shell dan aset statis lainnya (CSS, JS, font, image), gunakan Cache First
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request).then((networkResponse) => {
                        // Tambahkan ke cache jika berhasil diambil dari network
                        return caches.open(CACHE_NAME).then((cache) => {
                            // Periksa apakah response valid sebelum caching
                            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                                cache.put(event.request, networkResponse.clone());
                            } else if (networkResponse && networkResponse.type === 'opaque') { 
                                // Opaque responses (misalnya dari CDN tanpa CORS) bisa di-cache tapi hati-hati
                                cache.put(event.request, networkResponse.clone());
                            }
                            return networkResponse;
                        });
                    });
                })
        );
    }
    // Untuk permintaan API (misalnya ke story-api.dicoding.dev), jangan cache di sini.
    // Itu akan ditangani oleh IndexedDB atau strategi cache API khusus jika diperlukan.
});


// --- Push Notification Handling ---
self.addEventListener('push', (event) => {
    console.log('[SW] Push Received.');
    console.log(`[SW] Push had this data: "${event.data ? event.data.text() : 'no data'}"`);

    const data = event.data ? event.data.json() : {}; // Asumsikan server mengirim JSON

    const title = data.title || 'Notifikasi Baru';
    const options = {
        body: data.body || 'Anda memiliki pesan baru.',
        icon: data.icon || '/icons/icon-192x192.png', // Ikon default
        badge: data.badge || '/icons/icon-badge-72x72.png', // Ikon kecil untuk status bar (buat sendiri)
        image: data.image, // URL gambar besar di notifikasi
        vibrate: [100, 50, 100], // Pola getar
        data: { // Data tambahan yang bisa diakses saat notifikasi diklik
            url: data.url || '/', // URL yang akan dibuka saat notifikasi diklik
        },
        // actions: [ // Contoh tombol aksi
        //   { action: 'explore', title: 'Lihat Sekarang', icon: '/icons/action-explore.png' },
        //   { action: 'close', title: 'Tutup', icon: '/icons/action-close.png' },
        // ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click Received.');
    event.notification.close(); // Tutup notifikasi

    const notificationData = event.notification.data;

    // Jika ada URL di data notifikasi, buka URL tersebut
    if (notificationData && notificationData.url) {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                // Jika ada window aplikasi yang sudah terbuka, fokus ke sana
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    // Cek apakah URL sudah terbuka atau buka URL baru di tab yang ada
                    if (client.url === notificationData.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Jika tidak ada window yang cocok, buka tab baru
                if (clients.openWindow) {
                    return clients.openWindow(notificationData.url);
                }
            })
        );
    }
    // Handle action buttons jika ada
    // if (event.action === 'explore') {
    //   console.log('Explore action clicked');
    //   // Lakukan sesuatu
    // } else if (event.action === 'close') {
    //   console.log('Close action clicked');
    // } else {
    //   console.log('Notification clicked (no specific action)');
    // }
});
