# StoryVerse (Proyek Akhir) - Aplikasi Berbagi Cerita

**StoryVerse** adalah sebuah Progressive Web App (PWA) yang memungkinkan pengguna untuk berbagi cerita singkat beserta lokasi kejadiannya. Aplikasi ini dibangun sebagai Single-Page Application (SPA) dengan arsitektur Model-View-Presenter (MVP) dan dilengkapi dengan berbagai fitur modern seperti kemampuan offline, notifikasi, dan instalasi ke perangkat.

Proyek ini merupakan implementasi dari berbagai kriteria submission untuk kelas Dicoding, yang mencakup pengembangan web front-end tingkat lanjut.

---

## ✨ Fitur Utama

Aplikasi ini dilengkapi dengan serangkaian fitur untuk memberikan pengalaman pengguna yang kaya dan modern:

* **Autentikasi Pengguna**:
    * Fitur **Register** untuk pengguna baru.
    * Fitur **Login** untuk pengguna yang sudah ada.
    * Manajemen sesi pengguna menggunakan **JSON Web Token (JWT)**.

* **Beranda Cerita**:
    * Menampilkan daftar semua cerita dari pengguna lain setelah berhasil login.
    * Setiap kartu cerita menampilkan foto, judul, deskripsi, nama penulis, dan tanggal dibuat.
    * Dilengkapi dengan **peta interaktif (Leaflet.js)** yang menampilkan sebaran lokasi dari cerita-cerita yang ada.

* **Tambah Cerita Baru**:
    * Halaman khusus untuk membuat dan mengunggah cerita baru.
    * Menggunakan **kamera perangkat** untuk mengambil foto cerita secara langsung.
    * Fitur **pemilihan lokasi** dari peta interaktif untuk menandai di mana cerita terjadi.

* **Arsitektur Aplikasi**:
    * Dibangun sebagai **Single-Page Application (SPA)** untuk navigasi yang cepat tanpa refresh halaman.
    * Menerapkan pola arsitektur **Model-View-Presenter (MVP)** yang ketat untuk pemisahan logika yang bersih:
        * **Model**: Mengelola data dan logika bisnis (termasuk interaksi dengan API dan IndexedDB).
        * **View**: Bertanggung jawab untuk merender UI dan menangkap input pengguna.
        * **Presenter**: Bertindak sebagai jembatan, tanpa memiliki `import` dependensi (diinjeksi oleh Router).

* **Progressive Web App (PWA)**:
    * **Installable**: Aplikasi dapat dipasang ke *homescreen* di perangkat mobile maupun desktop.
    * **Kemampuan Offline**: Pengguna dapat membuka aplikasi dan melihat data cerita yang sudah pernah dimuat bahkan saat tidak ada koneksi internet.
    * **App Shell Caching**: Kerangka utama aplikasi (HTML, CSS, JS inti) di-cache menggunakan **Service Worker** untuk pemuatan yang instan.
    * **Halaman Fallback Offline**: Menampilkan halaman khusus jika pengguna offline dan mencoba mengakses konten yang tidak tersedia di cache.

* **Penyimpanan Offline dengan IndexedDB**:
    * Data cerita dari API disimpan di **IndexedDB** untuk memungkinkan akses luring.
    * Fitur **"Outbox"**: Cerita yang dibuat saat offline akan disimpan di IndexedDB dan akan otomatis diunggah saat koneksi internet kembali.

* **Push Notification**:
    * Aplikasi meminta izin untuk mengirim notifikasi.
    * Service Worker siap menerima dan menampilkan *push notification* dari server.

* **Pengalaman Pengguna Tambahan**:
    * **Desain Responsif**: Tampilan yang menyesuaikan dengan baik di perangkat mobile maupun desktop.
    * **Transisi Halaman Halus**: Menggunakan **View Transitions API** untuk animasi navigasi yang mulus.
    * **Aksesibilitas**: Dibangun dengan memperhatikan standar aksesibilitas (HTML semantik, label form, teks alternatif untuk gambar).
    * **Halaman Not Found**: Menampilkan halaman "404 Not Found" jika pengguna mengakses rute yang tidak dikenal.

---

## 🛠️ Teknologi yang Digunakan

* **Framework/Library Inti**:
    * **Vanilla JavaScript (ES6+ Modules)**: Logika aplikasi utama ditulis tanpa framework front-end.
    * **Vite**: Digunakan sebagai *development server* dan *module bundler* modern.

* **Peta & Lokasi**:
    * **Leaflet.js**: Library peta interaktif yang ringan dan open-source.
    * **OpenStreetMap**: Penyedia tile peta default.

* **Fitur PWA**:
    * **Service Worker API**: Untuk caching dan kemampuan offline.
    * **Web App Manifest**: Untuk membuat aplikasi *installable*.
    * **Push API**: Untuk push notification.
    * **IndexedDB API**: Untuk penyimpanan data di sisi klien.

* **Styling**:
    * **CSS Kustom**: Semua gaya ditulis secara manual dalam file CSS terpisah dengan pendekatan semantik.

* **Lainnya**:
    * **Font Awesome**: Untuk ikon.
    * **ESLint**: Untuk menjaga kualitas dan konsistensi kode (dikonfigurasi secara default oleh beberapa starter Vite).

---

## 🚀 Menjalankan Proyek Secara Lokal

Untuk menjalankan proyek ini di komputer lokal Anda, ikuti langkah-langkah berikut:

1.  **Clone Repository**
    ```bash
    git clone [https://github.com/](https://github.com/)<RensCodes>/<proyek-akhir>.git
    cd <proyek-akhir>
    ```

2.  **Install Dependensi**
    Pastikan Anda sudah memiliki Node.js dan npm terinstal. Jalankan perintah berikut di root folder proyek:
    ```bash
    npm install
    ```

3.  **Jalankan Server Pengembangan**
    Perintah ini akan memulai server Vite dan secara otomatis membuka aplikasi di browser Anda.
    ```bash
    npm run dev
    ```
    Aplikasi akan tersedia di `http://localhost:5173` (atau port lain jika 5173 sudah digunakan).

---

## 📜 Skrip yang Tersedia

Di dalam `package.json`, Anda akan menemukan beberapa skrip yang berguna:

* `npm run dev`: Menjalankan aplikasi dalam mode pengembangan dengan Hot Module Replacement (HMR).
* `npm run build`: Membuat versi produksi dari aplikasi di dalam folder `dist/`.
* `npm run preview`: Menjalankan server lokal untuk melihat hasil dari `npm run build`.

---

## 📁 Struktur Folder

Proyek ini diorganisir menggunakan pola arsitektur Model-View-Presenter (MVP):

