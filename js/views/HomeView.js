import Utils from '../utils.js';

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

                storiesHTML += `
                    <article class="story-card">
                        <img src="${story.photoUrl}" alt="Foto untuk ${storyName}" 
                             class="story-card-image" 
                             data-story-id="${story.id}"
                             onerror="this.onerror=null;this.src='https://placehold.co/600x400/e0e0e0/757575?text=Gagal+Muat';">
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
                        </div>
                    </article>
                `;
            });
        }

        const mapSectionHTML = `
            <section id="home-map-section" class="map-section-home">
                <h2 class="section-title">Peta Sebaran Cerita</h2>
                <div id="${this._mapContainerId}" class="map-display-container">
                    </div>
            </section>
        `;

        this.mainContent.innerHTML = `
            <section class="page-section animate-fade-in">
                <div class="page-header">
                    <h1 class="page-title">Selamat Datang, ${loggedInUserName || 'Pengguna'}!</h1>
                    <a href="#add-story" id="navigateToAddStoryBtn" class="btn btn-success">
                        <i class="fas fa-plus"></i>Buat Cerita Baru
                    </a>
                </div>
                <div class="story-card-grid">
                    ${storiesHTML}
                </div>
                ${(stories && stories.filter(s => s.lat && s.lon).length > 0) ? mapSectionHTML : ''} 
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

        this.mainContent.querySelectorAll('.view-on-map-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                if (typeof this.presenter.handleViewOnMap === 'function') {
                    const lat = parseFloat(event.currentTarget.dataset.lat);
                    const lon = parseFloat(event.currentTarget.dataset.lon);
                    const title = event.currentTarget.dataset.title;
                    this.presenter.handleViewOnMap({ lat, lon, title });
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
                    console.log("Klik pada cerita ID:", storyId, "(Fitur detail belum diimplementasikan sepenuhnya di Presenter)");
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
