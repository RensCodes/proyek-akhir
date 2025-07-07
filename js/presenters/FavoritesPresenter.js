// File: presenters/FavoritesPresenter.js
export default function createFavoritesPresenter(storyModel, authModel, favoritesView) {
  return {
    async showFavorites() {
      favoritesView.mainContent = document.getElementById('main-content');
      favoritesView.setPresenter(this);

      favoritesView.renderLoading();

       try {
    const favorites = await storyModel.getSavedStories();
    console.log('[FavoritesPresenter] favorites:', favorites);

    const userName = authModel.getCurrentUserName?.() || 'Pengguna';

    favoritesView.renderStories(Array.isArray(favorites) ? favorites : [], userName);
  } catch (error) {
    console.error('[FavoritesPresenter] Gagal memuat cerita favorit:', error);
    favoritesView.renderStories([], "Pengguna");
  }
}
  };
}
