function createSavedStoriesPresenter(storyModel, savedStoriesView, router, utilsService) {
    const presenter = {
        _storyModel: storyModel,
        _view: savedStoriesView,
        _router: router,
        _utils: utilsService,

        async showSavedStories() {
            this._view.renderLoading();
            try {
                const stories = await this._storyModel.getAllStoriesFromDb(); // Perbaikan typo di sini
                this._view.renderSavedStories(stories);
            } catch (error) {
                console.error("SavedStoriesPresenter.showSavedStories error:", error);
                this._view.renderError(error.message || "Gagal memuat cerita dari database lokal.");
            }
        },

        async handleDeleteStory(storyId) {
            try {
                await this._storyModel.deleteStoryFromDb(storyId);
                this._utils.showMessage("Sukses", "Cerita berhasil dihapus dari database.");
                await this.showSavedStories(); 
            } catch (error) {
                this._utils.showMessage("Error", "Gagal menghapus cerita dari database.", true);
            }
        },
        
        async handleDeleteAllStories() {
            try {
                await this._storyModel.clearStoriesCache();
                this._utils.showMessage("Sukses", "Semua cerita tersimpan berhasil dihapus.");
                await this.showSavedStories();
            } catch (error) {
                this._utils.showMessage("Error", "Gagal menghapus semua cerita dari database.", true);
            }
        },

        destroy() {
            if (this._view && typeof this._view.destroy === 'function') {
                this._view.destroy();
            }
            this._storyModel = null;
            this._view = null;
            this._router = null;
            this._utils = null;
            console.log("SavedStoriesPresenter instance dihancurkan.");
        }
    };
    savedStoriesView.setPresenter(presenter);
    return presenter;
}

export default createSavedStoriesPresenter;
