// File: views/SavedStoriesView.js
import Utils from '../utils.js';

const SavedStoriesView = {
  mainContent: null,
  presenter: null,

  setPresenter(presenter) {
    this.presenter = presenter;
  },

  renderLoading() {
    if (!this.mainContent) return;
    Utils.showLoadingSpinner(this.mainContent, "Memuat cerita favorit...");
  },

  renderSavedStories(stories, hasMore = false) {
    console.log("[SavedStoriesView] renderSavedStories dipanggil dengan", stories.length, "cerita");
    if (!this.mainContent) return;
    Utils.hideLoadingSpinner(this.mainContent);

    this.mainContent.innerHTML = `
      <section class="page-section animate-fade-in">
        <div class="page-header">
          <h1 class="page-title">Cerita Favorit Anda</h1>
          <button id="deleteAllStoriesBtn" class="btn btn-danger">
            <i class="fas fa-exclamation-triangle"></i> Hapus Semua Tersimpan
          </button>
        </div>
        <div id="saved-story-container" class="story-card-grid"></div>
        <div id="loadMoreContainer" style="text-align: center; margin-top: 20px;"></div>
      </section>
    `;

    const container = document.getElementById('saved-story-container');

    if (!stories || stories.length === 0) {
      container.innerHTML = '<p class="empty-stories-message">Belum ada cerita yang disimpan sebagai favorit.</p>';
    } else {
      container.innerHTML = '';
      for (const story of stories) {
        const storyName = story.name || 'Cerita Tanpa Judul';
        const storyDesc = story.description || 'Tidak ada deskripsi.';
        const storyAuthor = story.name || 'Anonim';

        const storyImage = story.photoBase64
          ? `data:image/jpeg;base64,${story.photoBase64}`
          : story.photoUrl || 'https://placehold.co/600x400/e0e0e0/757575?text=Gagal+Muat';

        const card = document.createElement('article');
        card.className = 'story-card saved-story-card';
        card.innerHTML = `
          <img src="${storyImage}" alt="Foto untuk ${storyName}" 
               class="story-card-image"
               onerror="this.onerror=null;this.src='https://placehold.co/600x400/e0e0e0/757575?text=Gagal+Muat';">
          <div class="story-card-content">
              <h3 class="story-card-title">${storyName}</h3>
              <p class="story-card-author"><i class="fas fa-user-circle"></i> ${storyAuthor}</p>
              <p class="story-card-description">${storyDesc.substring(0, 100)}${storyDesc.length > 100 ? '...' : ''}</p>
          </div>
          <div class="story-card-footer">
              <p class="story-card-date"><i class="fas fa-calendar-check"></i> Disimpan: ${Utils.formatDate(story.createdAt)}</p>
              <button class="btn btn-danger btn-sm btn-block delete-story-btn" data-story-id="${story.id}">
                  <i class="fas fa-trash-alt"></i> Hapus dari Tersimpan
              </button>
          </div>
        `;
        container.appendChild(card);
      }
    }

    const loadMoreEl = document.getElementById('loadMoreContainer');
    loadMoreEl.innerHTML = hasMore
      ? `<button id="loadMoreBtn" class="btn btn-secondary">Lihat Lebih Banyak</button>`
      : '';

    const loadBtn = document.getElementById('loadMoreBtn');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => {
        this.presenter.loadMore();
      });
    }

    this._addGlobalEventListeners();
    this._addStoryDeleteListeners();
  },

  renderError(message) {
    if (!this.mainContent) return;
    Utils.hideLoadingSpinner(this.mainContent);
    this.mainContent.innerHTML = `<div class="error-message-container"><p class="error-message">${message}</p></div>`;
  },

  _addStoryDeleteListeners() {
    const deleteButtons = this.mainContent.querySelectorAll('.delete-story-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const storyId = btn.dataset.storyId;
        if (storyId && confirm(`Hapus cerita ini dari favorit Anda?`)) {
          this.presenter.handleDeleteStory(storyId);
        }
      });
    });
  },

  _addGlobalEventListeners() {
    const deleteAllButton = document.getElementById('deleteAllStoriesBtn');
    if (deleteAllButton) {
      deleteAllButton.addEventListener('click', () => {
        if (confirm('Ini akan menghapus SEMUA cerita dari daftar favorit Anda. Lanjutkan?')) {
          this.presenter.handleDeleteAllStories();
        }
      });
    }
  },

  destroy() {
    if (this.mainContent) this.mainContent.innerHTML = '';
    console.log("SavedStoriesView dihancurkan.");
  }
};

export default SavedStoriesView;
