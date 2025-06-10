function createHomePresenter(storyModel, authModel, homeView, router, mapService) {
    const presenter = {
        _storyModel: storyModel,
        _authModel: authModel,
        _homeView: homeView,
        _router: router,
        _mapService: mapService,

        async showStories() {
            this._homeView.renderLoading();
            try {
                const stories = await this._storyModel.fetchStories();
                const userName = this._authModel.getCurrentUserName();
                this._homeView.renderStories(stories, userName);
                
                const mapContainerId = this._homeView.getMapContainerId();
                const storiesWithLocation = stories.filter(s => s.lat && s.lon);
                if (document.getElementById(mapContainerId) && storiesWithLocation.length > 0) {
                    this._mapService.initDisplayMap(mapContainerId, storiesWithLocation);
                } else if (document.getElementById(mapContainerId)) {
                    const mapEl = document.getElementById(mapContainerId);
                    if(mapEl) mapEl.innerHTML = '<p class="no-map-data-message">Peta akan muncul di sini jika ada cerita dengan data lokasi.</p>';
                }

            } catch (error) {
                console.error("HomePresenter.showStories error:", error);
                this._homeView.renderError(error.message || "Gagal memuat cerita. Coba lagi nanti.");
                if (error.message.toLowerCase().includes("token") || error.message.toLowerCase().includes("sesi") || error.status === 401) {
                    this._authModel.logout();
                    this._router.navigateTo('login');
                }
            }
        },

        handleViewOnMap({ lat, lon, title }) {
            console.log(`HomePresenter: Menampilkan lokasi untuk ${title} di peta: ${lat}, ${lon}`);
            if (this._mapService && typeof this._mapService.panToLocation === 'function') {
                this._mapService.panToLocation(lat, lon);
                const mapElement = document.getElementById(this._homeView.getMapContainerId());
                if (mapElement) {
                    mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                console.warn("MapService atau panToLocation tidak tersedia di HomePresenter.");
            }
        },
        
        navigateToAddStoryPage() {
            this._router.navigateTo('add-story');
        },

        destroy() {
            if (this._homeView && typeof this._homeView.destroy === 'function') {
                this._homeView.destroy();
            }
            if (this._mapService && typeof this._mapService.destroyDisplayMap === 'function') {
                this._mapService.destroyDisplayMap();
            }
            this._storyModel = null;
            this._authModel = null;
            this._homeView = null;
            this._router = null;
            this._mapService = null;
            console.log("HomePresenter instance (dari factory) dihancurkan.");
        }
    };
    homeView.setPresenter(presenter);
    return presenter;
}

export default createHomePresenter;
