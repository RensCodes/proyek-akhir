// File: views/HomeView.js
import Utils from '../utils.js';
import DbService from '../services/DbService.js';
import NotificationService from '../services/NotificationService.js';

const HomeView = {
  mainContent: null,
  presenter: null,
  _mapContainerId: 'home-map-display-container',

  setPresenter(presenter) {
    this.presenter = presenter;
  },

  renderLoading() {
    if (!this.mainContent) {
      console.error("HomeView: mainContent element not found.");
      return;
    }
    Utils.showLoadingSpinner(this.mainContent, "Memuat cerita Anda...");
  },

  renderStories(stories, loggedInUserName) {
    if (!this.mainContent) {
      console.error("HomeView: mainContent element not found.");
      return;
    }
    Utils.hideLoadingSpinner(this.mainContent);

    let storiesHTML = '';
    if (!stories || stories.length === 0) {
      storiesHTML = '<p class="empty-stories-message">Belum ada cerita untuk ditampilkan. <a href="#add-story" class="add-story-link-inline">Buat cerita pertama Anda!</a></p>';
    } else {
      stories.forEach(story => {
        const storyName = story.name || 'Cerita Tanpa Judul';
        const storyDesc = story.description || 'Tidak ada deskripsi.';
        const storyAuthor = story.name || 'Penulis Tidak Diketahui';
        const imageSrc = story.photoUrl || (story.photoBase64 ? `data:image/jpeg;base64,${story.photoBase64}` : 'https://placehold.co/600x400/e0e0e0/757575?text=Gambar+tidak+tersedia');

        storiesHTML += `
          <article class="story-card">
            <img 
              src="${imageSrc}" 
              alt="Foto untuk ${storyName}" 
              class="story-card-image" 
              data-story-id="${story.id}">
            <div class="story-card-content">
              <h3 class="story-card-title" data-story-id="${story.id}">${storyName}</h3>
              <p class="story-card-author">
                <i class="fas fa-user-circle"></i>${storyAuthor}
              </p>
              <p class="story-card-description">
                ${storyDesc.substring(0, 100)}${storyDesc.length > 100 ? '...' : ''}
              </p>
            </div>
            <div class="story-card-footer">
              <p class="story-card-date">
                <i class="fas fa-calendar-check"></i>
                ${Utils.formatDate(story.createdAt)}
              </p>
              ${(story.lat && story.lon) ? `
                <button class="btn btn-secondary btn-sm btn-block view-on-map-btn" 
                        data-lat="${story.lat}" data-lon="${story.lon}" data-title="${storyName}">
                  <i class="fas fa-map-marked-alt"></i>Lihat di Peta
                </button>
              ` : '<p class="no-location-text">Lokasi tidak tersedia</p>'}
              <button class="btn btn-outline-primary btn-sm save-story-btn" data-id="${story.id}">
                <i class="fas fa-save"></i> Simpan Story
              </button>
              <button class="btn btn-outline-primary btn-sm save-to-favorite-btn" data-story-id="${story.id}">
                <i class="fas fa-bookmark"></i> Simpan ke Favorit
              </button>
            </div>
          </article>
        `;
      });
    }

    const mapSectionHTML = `
      <section id="home-map-section" class="map-section-home">
        <h2 class="section-title">Peta Sebaran Cerita</h2>
        <div id="${this._mapContainerId}" class="map-display-container"></div>
      </section>
    `;

    this.mainContent.innerHTML = `
      <section class="page-section animate-fade-in">
        <div class="page-header">
          <h1 class="page-title">Selamat Datang, ${loggedInUserName || 'Pengguna'}!</h1>
          <a href="#add-story" id="navigateToAddStoryBtn" class="btn btn-success">
            <i class="fas fa-plus"></i>Buat Cerita Baru
          </a>
          <div class="notification-toggle-buttons" style="margin-top: 10px;">
            <button id="subscribeNotificationBtn" class="btn btn-success btn-sm">Aktifkan Notifikasi</button>
            <button id="unsubscribeNotificationBtn" class="btn btn-outline-danger btn-sm" style="display: none;">Matikan Notifikasi</button>
          </div>
        </div>
        <div class="story-card-grid">
          ${storiesHTML}
        </div>
        ${(stories && stories.filter(s => s.lat && s.lon).length > 0) ? mapSectionHTML : ''}
      </section>
    `;

    const storiesWithLocation = stories.filter(s => s.lat && s.lon);
    if (storiesWithLocation.length > 0 && this.presenter?._mapService?.initDisplayMap) {
      const mapContainerId = this.getMapContainerId();
      this.presenter._mapService.initDisplayMap(mapContainerId, storiesWithLocation);
    }

    this._addEventListeners();
    this._setupNotificationButtons();
    this._addSaveToFavoriteListeners(stories);
  },

  renderError(message) {
    if (!this.mainContent) return;
    Utils.hideLoadingSpinner(this.mainContent);
    this.mainContent.innerHTML = `<div class="error-message-container"><p class="error-message">${message}</p></div>`;
  },

  _addEventListeners() {
    if (!this.mainContent || !this.presenter) return;

    this.mainContent.querySelectorAll('.save-story-btn').forEach(button => {
      button.addEventListener('click', async (event) => {
        const storyId = event.currentTarget.dataset.id;
        const buttonEl = event.currentTarget;
        if (storyId && typeof this.presenter.handleSaveStory === 'function') {
          try {
            await this.presenter.handleSaveStory(storyId);
            buttonEl.innerHTML = '<i class="fas fa-check-circle"></i> Disimpan ✅';
            buttonEl.disabled = true;
            buttonEl.classList.remove('btn-outline-primary');
            buttonEl.classList.add('btn-success');
          } catch (error) {
            console.error("Gagal menyimpan cerita:", error);
            buttonEl.innerHTML = '<i class="fas fa-times-circle"></i> Gagal';
            setTimeout(() => {
              buttonEl.innerHTML = '<i class="fas fa-save"></i> Simpan Story';
            }, 2000);
          }
        }
      });
    });

    this.mainContent.querySelectorAll('.view-on-map-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const { lat, lon, title } = event.currentTarget.dataset;
        if (lat && lon && typeof this.presenter.handleViewOnMap === 'function') {
          this.presenter.handleViewOnMap({
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            title
          });
        }
      });
    });

    const navigateToAddStoryBtn = document.getElementById('navigateToAddStoryBtn');
    if (navigateToAddStoryBtn) {
      navigateToAddStoryBtn.addEventListener('click', (event) => {
        event.preventDefault();
        if (typeof this.presenter.navigateToAddStoryPage === 'function') {
          this.presenter.navigateToAddStoryPage();
        }
      });
    }

    this.mainContent.querySelectorAll('.story-card-image, .story-card-title').forEach(element => {
      element.addEventListener('click', (event) => {
        const storyId = event.currentTarget.dataset.storyId;
        if (storyId && typeof this.presenter.handleViewStoryDetail === 'function') {
          this.presenter.handleViewStoryDetail(storyId);
        }
      });
    });
  },

  async _setupNotificationButtons() {
    const subBtn = document.getElementById('subscribeNotificationBtn');
    const unsubBtn = document.getElementById('unsubscribeNotificationBtn');

    if (!subBtn || !unsubBtn) return;

    subBtn.addEventListener('click', async () => {
      try {
        await NotificationService.subscribeUser();
        subBtn.style.display = 'none';
        unsubBtn.style.display = 'inline-block';
        alert("Notifikasi diaktifkan!");
      } catch (err) {
        console.error(err);
        alert("Gagal mengaktifkan notifikasi.");
      }
    });

    unsubBtn.addEventListener('click', async () => {
      try {
        await NotificationService.unsubscribeUser();
        unsubBtn.style.display = 'none';
        subBtn.style.display = 'inline-block';
        alert("Notifikasi dimatikan.");
      } catch (err) {
        console.error(err);
        alert("Gagal mematikan notifikasi.");
      }
    });

    try {
      const subscribed = await NotificationService.isSubscribed();
      subBtn.style.display = subscribed ? 'none' : 'inline-block';
      unsubBtn.style.display = subscribed ? 'inline-block' : 'none';
    } catch (err) {
      console.error("Gagal memeriksa status notifikasi:", err);
    }
  },

  _addSaveToFavoriteListeners(stories) {
    const buttons = this.mainContent.querySelectorAll('.save-to-favorite-btn');
    buttons.forEach(button => {
      button.addEventListener('click', async () => {
        const id = button.dataset.storyId;
        const selectedStory = stories.find(s => s.id === id);
        if (selectedStory) {
          try {
            const storyToSave = {
              ...selectedStory,
              id: selectedStory.id || `saved-${Date.now()}`,
              createdAt: selectedStory.createdAt || new Date().toISOString(),
            };
            await DbService.saveStoryToSaved(storyToSave);
            button.innerHTML = '<i class="fas fa-check-circle"></i> Favorit ✅';
            button.disabled = true;
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-success');
          } catch (err) {
            console.error("Gagal simpan ke favorit:", err);
            alert("Gagal menyimpan ke favorit.");
          }
        }
      });
    });
  },

  getMapContainerId() {
    return this._mapContainerId;
  },

  destroy() {
    if (this.mainContent) this.mainContent.innerHTML = '';
    console.log("HomeView dihancurkan.");
  }
};

export default HomeView;
