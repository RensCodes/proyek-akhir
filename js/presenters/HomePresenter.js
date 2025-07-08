// File: presenter/SavedStoriesPresenter.js

function createSavedStoriesPresenter(storyModel, savedStoriesView, router, utilsService) {
  const MAX_ITEMS_PER_LOAD = 6;

  let _offset = 0;
  let _allStories = [];

  const presenter = {
    _storyModel: storyModel,
    _view: savedStoriesView,
    _router: router,
    _utils: utilsService,

    async showSavedStories(initial = true) {
      this._view.renderLoading();
      try {
        if (initial) {
          _offset = 0;
          _allStories = await this._storyModel.getAllSavedStories(); // hanya dari saved-stories
          _allStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const storiesToShow = _allStories.slice(0, _offset + MAX_ITEMS_PER_LOAD);
        const hasMore = _allStories.length > storiesToShow.length;
        _offset = storiesToShow.length;

        this._view.renderSavedStories(storiesToShow, hasMore);
      } catch (error) {
        console.error("SavedStoriesPresenter.showSavedStories error:", error);
        this._view.renderError(error.message || "Gagal memuat cerita dari database lokal.");
      }
    },

    async handleDeleteStory(storyId) {
      try {
        await this._storyModel.deleteSavedStory(storyId);

        // Hapus dari cache internal agar tidak muncul lagi
        _allStories = _allStories.filter(story => story.id !== storyId);
        _offset = Math.min(_offset, _allStories.length);

        this._utils.showMessage("Sukses", "Cerita berhasil dihapus dari favorit.");
        this.showSavedStories(false); // tanpa reset ulang
      } catch (error) {
        console.error("handleDeleteStory error:", error);
        this._utils.showMessage("Error", "Gagal menghapus cerita dari favorit.", true);
      }
    },

    async handleDeleteAllStories() {
      try {
        await this._storyModel.clearAllSavedStories();
        _allStories = [];
        _offset = 0;
        this._utils.showMessage("Sukses", "Semua cerita favorit berhasil dihapus.");
        this.showSavedStories(false);
      } catch (error) {
        console.error("handleDeleteAllStories error:", error);
        this._utils.showMessage("Error", "Gagal menghapus semua cerita favorit.", true);
      }
    },

    loadMore() {
      this.showSavedStories(false);
    },

    destroy() {
      this._view?.destroy?.();
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
