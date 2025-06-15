
import Utils from '../utils.js';

const SavedStoriesView = {
    mainContent: null,
    presenter: null,

    setPresenter(presenter) {
        this.presenter = presenter;
    },

    renderLoading() {
        if (!this.mainContent) return;
        Utils.showLoadingSpinner(this.mainContent, "Memuat cerita tersimpan...");
    },

    renderSavedStories(stories) {
        if (!this.mainContent) return;
        Utils.hideLoadingSpinner(this.mainContent);

        let storiesHTML = '';
        if (!stories || stories.length === 0) {
            storiesHTML = '<p class="empty-stories-message">Tidak ada cerita yang tersimpan di database lokal (IndexedDB).</p>';
        } else {
            stories.forEach(story => {
                const storyName = story.name || 'Cerita Tanpa Judul';
                const storyDesc = story.description || 'Tidak ada deskripsi.';
                const storyAuthor = story.name || 'Penulis Tidak Diketahui';

                storiesHTML += `
                    <article class="story-card saved-story-card">
                        <img src="${story.photoUrl}" alt="Foto untuk ${storyName}" 
                             class="story-card-image"
                             onerror="this.onerror=null;this.src='https://placehold.co/600x400/e0e0e0/757575?text=Gagal+Muat';">
                        <div class="story-card-content">
                            <h3 class="story-card-title">${storyName}</h3>
                            <p class="story-card-author"><i class="fas fa-user-circle"></i>${storyAuthor}</p>
                            <p class="story-card-description">${storyDesc.substring(0, 100)}${storyDesc.length > 100 ? '...' : ''}</p>
                        </div>
                        <div class="story-card-footer">
                            <p class="story-card-date"><i class="fas fa-calendar-check"></i>Disimpan: ${Utils.formatDate(story.createdAt)}</p>
                            
                            <!-- TOMBOL HAPUS UNTUK SETIAP CERITA -->
                            <button class="btn btn-danger btn-sm btn-block delete-story-btn" data-story-id="${story.id}">
                                <i class="fas fa-trash-alt"></i> Hapus dari Database
                            </button>
                        </div>
                    </article>
                `;
            });
        }

        this.mainContent.innerHTML = `
            <section class="page-section animate-fade-in">
                <div class="page-header">
                    <h1 class="page-title">Cerita Tersimpan</h1>
                    
                    <!-- TOMBOL HAPUS SEMUA CERITA -->
                    <button id="deleteAllStoriesBtn" class="btn btn-danger">
                        <i class="fas fa-exclamation-triangle"></i> Hapus Semua Data
                    </button>
                </div>
                <div class="story-card-grid">
                    ${storiesHTML}
                </div>
            </section>
        `;
        this._addEventListeners();
    },

    renderError(message) {
        if (!this.mainContent) return;
        Utils.hideLoadingSpinner(this.mainContent);
        this.mainContent.innerHTML = `<div class="error-message-container"><p class="error-message">${message}</p></div>`;
    },

    _addEventListeners() {
        if (!this.mainContent || !this.presenter) return;

        this.mainContent.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('.delete-story-btn');
            if (deleteButton) {
                const storyId = deleteButton.dataset.storyId;
                if (storyId && confirm(`Apakah Anda yakin ingin menghapus cerita ini?`)) {
                    this.presenter.handleDeleteStory(storyId);
                }
            }
        });

        const deleteAllButton = document.getElementById('deleteAllStoriesBtn');
        if (deleteAllButton) {
            deleteAllButton.addEventListener('click', () => {
                if (confirm('PERINGATAN: Tindakan ini akan menghapus SEMUA cerita yang tersimpan. Apakah Anda yakin?')) {
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
