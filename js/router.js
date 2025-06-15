
import Utils from './utils.js';
import AuthModel from './models/AuthModel.js';

const Router = {
    _routes: {}, _currentPresenter: null, _mainContentElement: null,
    _authModel: AuthModel, _storyModel: null, _authView: null, _homeView: null,
    _addStoryView: null, _savedStoriesView: null,
    _mapService: null, _cameraService: null,

    async init(mainContentElementId) {
        this._mainContentElement = document.getElementById(mainContentElementId);
        if (!this._mainContentElement) { console.error(`Router init: Elemen konten utama '${mainContentElementId}' tidak ditemukan.`); return; }
        
        const { default: AuthViewModule } = await import('./views/AuthView.js');
        this._authView = AuthViewModule;
        this._authView.mainContent = this._mainContentElement;

        this._routes = {
            'login': () => this._buildAuthPresenter('login'),
            'register': () => this._buildAuthPresenter('register'),
            'home': () => this._buildHomePresenter(),
            'add-story': () => this._buildAddStoryPresenter(),
            'saved-stories': () => this._buildSavedStoriesPresenter(),
            'logout': () => this._handleLogoutRoute(),
        };

        window.addEventListener('hashchange', () => this._handleRouteChange());
        this._handleRouteChange();
        this._setupGlobalNavLinks();
        this._updateNavbar();
        
        window.addEventListener('online', () => this._trySyncOutbox());
        if (navigator.onLine) this._trySyncOutbox();
    },

    async _loadStoryModel() {
        if (!this._storyModel) {
            const { default: StoryModelModule } = await import('./models/StoryModel.js');
            this._storyModel = StoryModelModule;

        }
    },
    async _loadServices() {
        if (!this._mapService) {
            const { default: MapServiceModule } = await import('./services/MapService.js');
            this._mapService = MapServiceModule;
        }
        if (!this._cameraService) {
            const { default: CameraServiceModule } = await import('./services/CameraService.js');
            this._cameraService = CameraServiceModule;
        }
    },

    async _buildAuthPresenter(pageType = 'login') {
        const { default: createAuthPresenterFactory } = await import('./presenters/AuthPresenter.js');
        const presenter = createAuthPresenterFactory(this._authModel, this._authView, this);
        if (pageType === 'login') {
            presenter.showLoginPage();
        } else {
            presenter.showRegisterPage();
        }
        return presenter;
    },

    async _buildHomePresenter() {
        if (!this._authModel.isUserLoggedIn()) { this.navigateTo('login'); return null; }
        await this._loadStoryModel();
        await this._loadServices();
        if (!this._homeView) {
            const { default: HomeViewModule } = await import('./views/HomeView.js');
            this._homeView = HomeViewModule;
            this._homeView.mainContent = this._mainContentElement;
        }
        const { default: createHomePresenterFactory } = await import('./presenters/HomePresenter.js');
        
        const presenter = createHomePresenterFactory(this._storyModel, this._authModel, this._homeView, this, this._mapService);
        await presenter.showStories();
        return presenter;
    },

    async _buildAddStoryPresenter() {
        if (!this._authModel.isUserLoggedIn()) { this.navigateTo('login'); return null; }
        await this._loadStoryModel();
        await this._loadServices();
        if (!this._addStoryView) {
            const { default: AddStoryViewModule } = await import('./views/AddStoryView.js');
            this._addStoryView = AddStoryViewModule;
            this._addStoryView.mainContent = this._mainContentElement;
        }
        const { default: createAddStoryPresenterFactory } = await import('./presenters/AddStoryPresenter.js');
        
        const presenter = createAddStoryPresenterFactory(this._storyModel, this._addStoryView, this, this._mapService, this._cameraService, Utils);
        presenter.showAddStoryForm();
        return presenter;
    },

    async _buildSavedStoriesPresenter() {
        if (!this._authModel.isUserLoggedIn()) { this.navigateTo('login'); return null; }
        await this._loadStoryModel();
        if (!this._savedStoriesView) {
            const { default: SavedStoriesViewModule } = await import('./views/SavedStoriesView.js');
            this._savedStoriesView = SavedStoriesViewModule;
            this._savedStoriesView.mainContent = this._mainContentElement;
        }
        const { default: createSavedStoriesPresenterFactory } = await import('./presenters/SavedStoriesPresenter.js');
        const presenter = createSavedStoriesPresenterFactory(this._storyModel, this._savedStoriesView, this, Utils);
        await presenter.showSavedStories();
        return presenter;
    },

    _buildNotFoundPresenter() {
        if (this._mainContentElement) {
            this._mainContentElement.innerHTML = `<section class="error-page-container"><h1 class="error-title-404">404</h1><h2 class="section-title">Halaman Tidak Ditemukan</h2><p class="error-message">Maaf, halaman yang Anda cari tidak ada.</p><a href="#" class="btn btn-primary back-to-home-btn" data-route="home">Kembali ke Beranda</a></section>`;
            const backButton = this._mainContentElement.querySelector('.back-to-home-btn');
            if (backButton) backButton.addEventListener('click', (e) => { e.preventDefault(); this.navigateTo('home'); });
        }
        return { destroy: () => console.log("NotFoundPresenter destroyed.") };
    },

    _handleLogoutRoute() {
        if (this._currentPresenter?.destroy) this._currentPresenter.destroy();
        this._currentPresenter = null;
        this._authModel.logout();
        Utils.showMessage('Logout Berhasil', 'Anda telah berhasil keluar.');
        this.navigateTo('login');
        return null;
    },

    async _handleRouteChange() {
        const hash = window.location.hash.slice(1) || (this._authModel.isUserLoggedIn() ? 'home' : 'login');
        let routeName = hash.split('/')[0];
        const routeParams = hash.split('/').slice(1);
        const protectedRoutes = ['home', 'add-story', 'saved-stories'];
        const authRoutes = ['login', 'register'];
        if (protectedRoutes.includes(routeName) && !this._authModel.isUserLoggedIn()) { this.navigateTo('login'); return; }
        if (authRoutes.includes(routeName) && this._authModel.isUserLoggedIn()) { this.navigateTo('home'); return; }

        if (this._currentPresenter?.destroy) this._currentPresenter.destroy();
        this._currentPresenter = null;
        
        const createPresenterFunction = this._routes[routeName];
        const performTransition = async () => {
            if (typeof createPresenterFunction === 'function') {
                this._currentPresenter = await createPresenterFunction(routeParams);
            } else {
                this._currentPresenter = this._buildNotFoundPresenter();
                this._updateActiveNavLink('');
            }
        };

        if (document.startViewTransition) await document.startViewTransition(performTransition);
        else await performTransition();

        this._updateNavbar();
        if (this._mainContentElement?.focus) this._mainContentElement.focus();
    },

    navigateTo(routeName) {
        const currentBaseRoute = window.location.hash.slice(1).split('/')[0];
        if (currentBaseRoute !== routeName || window.location.hash.slice(1) !== routeName) {
            window.location.hash = routeName;
        } else {
            this._handleRouteChange();
        }
    },
    
    _setupGlobalNavLinks() {
        const headerNav = document.querySelector('#app-header .nav-container');
        if (headerNav) {
            headerNav.addEventListener('click', (event) => {
                const targetLink = event.target.closest('a[data-route]');
                if (targetLink) { event.preventDefault(); this.navigateTo(targetLink.dataset.route); }
            });
        }
    },

    _updateActiveNavLink(currentRoute) {
        document.querySelectorAll('#nav-links-container .nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.route === currentRoute);
        });
    },

    _updateNavbar() {
        const navLinksContainer = document.getElementById('nav-links-container');
        if (!navLinksContainer) return;
        const isLoggedIn = this._authModel.isUserLoggedIn();
        const userName = this._authModel.getCurrentUserName();
        let navHTML = '';
        if (isLoggedIn) {
            navHTML = `<li><a href="#home" class="nav-link" data-route="home"><i class="fas fa-home"></i> Beranda</a></li><li><a href="#add-story" class="nav-link" data-route="add-story"><i class="fas fa-plus-circle"></i> Tambah</a></li><li><a href="#saved-stories" class="nav-link" data-route="saved-stories"><i class="fas fa-save"></i> Tersimpan</a></li><li><a href="#logout" class="nav-link" data-route="logout"><i class="fas fa-sign-out-alt"></i> Logout (${userName || 'User'})</a></li>`;
        } else {
            navHTML = `<li><a href="#login" class="nav-link" data-route="login"><i class="fas fa-sign-in-alt"></i> Login</a></li><li><a href="#register" class="nav-link" data-route="register"><i class="fas fa-user-plus"></i> Register</a></li>`;
        }
        navLinksContainer.innerHTML = navHTML;
        const currentHash = window.location.hash.slice(1) || (isLoggedIn ? 'home' : 'login');
        this._updateActiveNavLink(currentHash.split('/')[0]);
    },
    
    async _trySyncOutbox() {
        if (!this._authModel.isUserLoggedIn() || !navigator.onLine) return;
        console.log("Router: Mencoba sinkronisasi outbox...");
        await this._loadStoryModel();
        try {
            const result = await this._storyModel.syncOutboxStories();
            if (result.synced > 0) {
                Utils.showMessage("Sinkronisasi Selesai", `${result.synced} cerita dari outbox berhasil diunggah.`);
                if (window.location.hash.includes('home')) this.navigateTo('home');
            }
        } catch(e) { console.error("Router: Gagal menjalankan sinkronisasi outbox otomatis:", e); }
    }
};

export default Router;
