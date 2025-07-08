function createHomePresenter(storyModel, authModel, homeView, router, mapService) {
  const presenter = {
    _storyModel: storyModel,
    _authModel: authModel,
    _homeView: homeView,
    _router: router,
    _mapService: mapService,

    async showStories() {
      this._homeView.renderLoading();

      let stories = [];
      let fromOffline = false;

      try {
        const forceRefresh = window._storyDataDirty || false;
        stories = await this._storyModel.fetchStories(forceRefresh);
        window._storyDataDirty = false;
      } catch (error) {
        console.warn("Gagal fetch online, mencoba offline DB:", error);
        try {
          stories = await this._storyModel.getAllStoriesFromDb();
          fromOffline = true;
        } catch (offlineError) {
          console.error("Gagal ambil dari IndexedDB:", offlineError);
          this._homeView.renderError("Gagal memuat cerita, dan tidak ada data offline.");
          return;
        }
      }

      const userName = this._authModel.getCurrentUserName?.() || 'Pengguna';
      const safeStories = Array.isArray(stories) ? stories : [];

      this._homeView.renderStories(safeStories, userName);

      const mapContainerId = this._homeView.getMapContainerId?.();
      const storiesWithLocation = safeStories.filter(s => s.lat && s.lon);
      const mapEl = document.getElementById(mapContainerId);

      if (mapEl) {
        if (storiesWithLocation.length > 0) {
          this._mapService.initDisplayMap(mapContainerId, storiesWithLocation);
        } else {
          mapEl.innerHTML = '<p class="no-map-data-message">Peta akan muncul di sini jika ada cerita dengan data lokasi.</p>';
        }
      }

      if (fromOffline) {
        console.warn('[HomePresenter] Cerita ditampilkan dari cache offline.');
      }
    },

    async handleDeleteStory(storyId) {
      try {
        await this._storyModel.deleteStoryFromDb(storyId);
        window._storyDataDirty = true;
        await this.showStories();
      } catch (error) {
        console.error("Gagal menghapus cerita dari beranda:", error);
        alert("Gagal menghapus cerita dari beranda.");
      }
    },

    handleViewOnMap({ lat, lon, title }) {
      console.log(`HomePresenter: Menampilkan lokasi untuk ${title} di peta: ${lat}, ${lon}`);
      if (this._mapService?.panToLocation) {
        this._mapService.panToLocation(lat, lon);
        const mapElement = document.getElementById(this._homeView.getMapContainerId());
        mapElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },

    navigateToAddStoryPage() {
      this._router.navigateTo('add-story');
    },

    async handleSaveStory(storyId) {
      try {
        const isAlreadySaved = await import('../services/DbService.js').then(mod => mod.default.isStorySaved(storyId));
        if (isAlreadySaved) {
          alert('Cerita ini sudah tersimpan sebelumnya.');
          return;
        }

        const story = this._storyModel._storiesCache?.find(s => s.id === storyId);
        if (!story) {
          alert('Cerita tidak ditemukan atau belum dimuat.');
          return;
        }

        await import('../services/DbService.js').then(mod => mod.default.saveStoryToSaved(story));
        alert('Cerita berhasil disimpan ke daftar tersimpan.');
      } catch (error) {
        console.error('Gagal menyimpan cerita:', error);
        alert('Terjadi kesalahan saat menyimpan cerita.');
      }
    },

    destroy() {
      this._homeView?.destroy?.();
      this._mapService?.destroyDisplayMap?.();
      this._storyModel = null;
      this._authModel = null;
      this._homeView = null;
      this._router = null;
      this._mapService = null;
      console.log("HomePresenter instance dihancurkan.");
    }
  };

  homeView.setPresenter(presenter);
  return presenter;
}

export default createHomePresenter;
