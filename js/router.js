import Config from './config.js';
import Utils from './utils.js';

import AuthModel from './models/AuthModel.js';

const Router = {
    _routes: {},
    _currentPresenter: null,
    _mainContentElement: null,

    _authModel: AuthModel,
    _storyModel: null, 

    _authView: null, 
    _homeView: null,
    _addStoryView: null,
    _mapService: null,
    _cameraService: null,

    async init(mainContentElementId) {
        this._mainContentElement = document.getElementById(mainContentElementId);
        if (!this._mainContentElement) {
            console.error(`Router init: Elemen konten utama dengan ID '${mainContentElementId}' tidak ditemukan.`);
            return;
        }
        
        const { default: AuthViewModule } = await import('./views/AuthView.js');
        this._authView = AuthViewModule;
        this._authView.mainContent = this._mainContentElement;

        const { default: MapServiceModule } = await import('./services/MapService.js');
        this._mapService = MapServiceModule;
        const { default: CameraServiceModule } = await import('./services/CameraService.js');
        this._cameraService = CameraServiceModule;


        this._routes = {
            'login': async () => this._buildAuthPresenter('login'),
            'register': async () => this._buildAuthPresenter('register'),
            'home': async () => this._buildHomePresenter(),
            'add-story': async () => this._buildAddStoryPresenter(),
            'logout': () => this._handleLogoutRoute(),
        };

        window.addEventListener('hashchange', this._handleRouteChange.bind(this));
        this._handleRouteChange();
        this._setupGlobalNavLinks();
        this._updateNavbar();
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
        if (!this._authModel.isUserLoggedIn()) {
            this.navigateTo('login');
            return null;
        }
        if (!this._homeView) {
            const { default: HomeViewModule } = await import('./views/HomeView.js');
            this._homeView = HomeViewModule;
            this._homeView.mainContent = this._mainContentElement;
        }
        if (!this._storyModel) {
            const { default: StoryModelModule } = await import('./models/StoryModel.js');
            this._storyModel = StoryModelModule;
        }
        const { default: createHomePresenterFactory } = await import('./presenters/homePresenter.js');
        
        const presenter = createHomePresenterFactory(this._storyModel, this._authModel, this._homeView, this, this._mapService);
        await presenter.showStories();
        this._updateNavbar();
        return presenter;
    },

    async _buildAddStoryPresenter() {
        if (!this._authModel.isUserLoggedIn()) {
            this.navigateTo('login');
            return null;
        }
        if (!this._addStoryView) {
            const { default: AddStoryViewModule } = await import('./views/AddStoryView.js');
            this._addStoryView = AddStoryViewModule;
            this._addStoryView.mainContent = this._mainContentElement;
        }
         if (!this._storyModel) {
            const { default: StoryModelModule } = await import('./models/StoryModel.js');
            this._storyModel = StoryModelModule;
        }
        const { default: createAddStoryPresenterFactory } = await import('./presenters/AddStoryPresenter.js');
        
        const presenter = createAddStoryPresenterFactory(this._storyModel, this._addStoryView, this, this._mapService, this._cameraService, Utils);
        presenter.showAddStoryForm();
        this._updateNavbar();
        return presenter;
    },

    _handleLogoutRoute() {
        if (this._currentPresenter && typeof this._currentPresenter.destroy === 'function') {
            this._currentPresenter.destroy();
            this._currentPresenter = null;
        }
        this._authModel.logout();
        Utils.showMessage('Logout Berhasil', 'Anda telah berhasil keluar.');
        this.navigateTo('login');
        this._updateNavbar();
        return null;
    },

    async _handleRouteChange() {
        const hash = window.location.hash.slice(1) || (this._authModel.isUserLoggedIn() ? 'home' : 'login');
        let routeName = hash.split('/')[0];
        const routeParams = hash.split('/').slice(1);

        const protectedRoutes = ['home', 'add-story'];
        const authRoutes = ['login', 'register'];

        if (protectedRoutes.includes(routeName) && !this._authModel.isUserLoggedIn()) {
            this.navigateTo('login');
            return;
        }
        if (authRoutes.includes(routeName) && this._authModel.isUserLoggedIn()) {
            this.navigateTo('home');
            return;
        }

        if (!this._routes[routeName]) {
            routeName = this._authModel.isUserLoggedIn() ? 'home' : 'login';
        }
        
        if (this._currentPresenter && typeof this._currentPresenter.destroy === 'function') {
            this._currentPresenter.destroy();
            this._currentPresenter = null;
        }
        
        const createPresenterFunction = this._routes[routeName];

        if (typeof createPresenterFunction === 'function') {
            const performTransition = async () => {
                this._currentPresenter = await createPresenterFunction(routeParams);
            };

            if (document.startViewTransition) {
                document.startViewTransition(performTransition);
            } else {
                await performTransition();
            }

            this._updateActiveNavLink(routeName);
            if (this._mainContentElement && typeof this._mainContentElement.focus === 'function') {
                this._mainContentElement.focus();
            }
        } else {
            console.error(`Router: Tidak ada fungsi untuk membuat presenter untuk rute '${routeName}'`);
            if (this._mainContentElement) {
                this._mainContentElement.innerHTML = `<div class="error-page-container"><p class="error-message">Error: Halaman tidak ditemukan.</p></div>`;
            }
            this._updateActiveNavLink('');
        }
        this._updateNavbar();
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
                if (targetLink) {
                    event.preventDefault();
                    const route = targetLink.dataset.route;
                    if (route) this.navigateTo(route);
                }
            });
        }
    },

    _updateActiveNavLink(currentRoute) {
        document.querySelectorAll('#nav-links-container .nav-link').forEach(link => {
            const linkRoute = link.dataset.route;
            if (linkRoute === currentRoute) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    _updateNavbar() {
        const navLinksContainer = document.getElementById('nav-links-container');
        if (!navLinksContainer) return;

        const isLoggedIn = this._authModel.isUserLoggedIn();
        const userName = this._authModel.getCurrentUserName();
        let navHTML = '';

        if (isLoggedIn) {
            navHTML = `
                <li><a href="#home" class="nav-link" data-route="home"><i class="fas fa-home"></i>Beranda</a></li>
                <li><a href="#add-story" class="nav-link" data-route="add-story"><i class="fas fa-plus-circle"></i>Tambah Cerita</a></li>
                <li><a href="#logout" class="nav-link" data-route="logout"><i class="fas fa-sign-out-alt"></i>Logout (${userName || 'User'})</a></li>
            `;
        } else {
            navHTML = `
                <li><a href="#login" class="nav-link" data-route="login"><i class="fas fa-sign-in-alt"></i>Login</a></li>
                <li><a href="#register" class="nav-link" data-route="register"><i class="fas fa-user-plus"></i>Register</a></li>
            `;
        }
        navLinksContainer.innerHTML = navHTML;
        
        const currentHash = window.location.hash.slice(1) || (isLoggedIn ? 'home' : 'login');
        this._updateActiveNavLink(currentHash.split('/')[0]);
    }
};

export default Router;
