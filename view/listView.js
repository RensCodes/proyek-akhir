import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


export const renderList = (stories) => {
    document.body.innerHTML = `
      <a href="#main" class="skip-link">Lewati ke konten utama</a>
      <header><h1>StoryMap</h1><nav><a href="#/">Beranda</a> | <a href="#/add">Tambah Cerita</a></nav></header>
      <main id="main"></main>
      <footer><p>&copy; 2025 StoryMap</p></footer>
    `;
  
    const main = document.querySelector('main');
  
    stories.forEach((story) => {
      const el = document.createElement('article');
      el.classList.add('card');
      el.innerHTML = `
        <img src="${story.photoUrl}" alt="Gambar ${story.name}" />
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <div id="map-${story.id}" style="height: 180px;"></div>
      `;
      main.appendChild(el);
  
      const map = L.map(`map-${story.id}`).setView([story.lat, story.lon], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      L.marker([story.lat, story.lon]).addTo(map)
        .bindPopup(story.name)
        .openPopup();
    });
  };
  
  
