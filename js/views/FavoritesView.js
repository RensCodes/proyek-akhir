// File: views/FavoritesView.js
import Utils from '../utils.js';

const FavoritesView = {
  mainContent: null,
  presenter: null,

  setPresenter(presenter) {
    this.presenter = presenter;
  },

  renderLoading() {
    if (!this.mainContent) return;
    Utils.showLoadingSpinner(this.mainContent, "Memuat cerita favorit...");
  },

  renderStories(stories, userName = "Pengguna") {
    if (!this.mainContent) return;

    // Pastikan spinner disembunyikan di awal
    Utils.hideLoadingSpinner(this.mainContent);

    if (!stories || stories.length === 0) {
      this.mainContent.innerHTML = `
        <section class="page-section animate-fade-in">
          <h2>Halo, ${userName}!</h2>
          <p>Kamu belum menyimpan cerita apa pun ke favorit.</p>
        </section>
      `;
      return;
    }

    this.mainContent.innerHTML = `
      <section class="page-section animate-fade-in">
        <h2>Halo, ${userName}!</h2>
        <p>Berikut daftar cerita favorit kamu:</p>
        <div class="story-list">
          ${stories.map(Utils.renderStoryCard).join('')}
        </div>
      </section>
    `;
  }
};

export default FavoritesView;
