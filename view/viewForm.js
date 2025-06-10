import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


export const renderForm = (onSubmit) => {
    document.body.innerHTML = `
      <a href="#main" class="skip-link">Lewati ke konten utama</a>
      <header><h1>StoryMap</h1><nav><a href="#/">Beranda</a> | <a href="#/add">Tambah Cerita</a></nav></header>
      <main id="main">
        <form id="storyForm">
          <label for="name">Nama:</label>
          <input type="text" id="name" required />
          
          <label for="description">Deskripsi:</label>
          <textarea id="description" required></textarea>
  
          <label for="photo">Foto (ambil kamera):</label>
          <input type="file" accept="image/*" capture="environment" id="photo" required />
  
          <p>Klik pada peta untuk memilih lokasi:</p>
          <div id="map" style="height: 250px; margin-bottom: 1rem;"></div>
          <input type="hidden" id="lat" />
          <input type="hidden" id="lon" />
  
          <button type="submit">Kirim Cerita</button>
        </form>
      </main>
      <footer><p>&copy; 2025 StoryMap</p></footer>
    `;
  
    const map = L.map('map').setView([-6.2, 106.8], 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
    let marker;
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      document.getElementById('lat').value = lat;
      document.getElementById('lon').value = lng;
  
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
    });
  
    document.getElementById('storyForm').addEventListener('submit', onSubmit);
  };
  
  