import Utils from '../utils.js';

const AuthView = {
    mainContent: null, 
    presenter: null,

    setPresenter(presenter) {
        this.presenter = presenter;
    },

    _getLoginFormHTML() {
        return `
            <section id="login-page" class="auth-page">
                <div class="auth-card">
                    <h1 class="auth-title">Login ke StoryVerse</h1>
                    <form id="loginForm" class="auth-form" novalidate>
                        <div class="form-group">
                            <label for="loginEmail" class="form-label">Email <span class="required-star">*</span></label>
                            <input type="email" id="loginEmail" name="email" required class="form-control" placeholder="email@example.com">
                        </div>
                        <div class="form-group">
                            <label for="loginPassword" class="form-label">Password <span class="required-star">*</span></label>
                            <input type="password" id="loginPassword" name="password" required class="form-control" placeholder="Masukkan password Anda">
                        </div>
                        <div id="loginError" class="form-error-message hidden"></div>
                        <div class="form-group">
                            <button type="submit" id="loginButton" class="btn btn-primary btn-block">
                                <span class="submit-text">Login</span>
                                <span class="loading-indicator hidden"><div class="spinner-inline"></div></span>
                            </button>
                        </div>
                    </form>
                    <p class="auth-switch-link">
                        Belum punya akun?
                        <a href="#register" id="navigateToRegister">Daftar di sini</a>
                    </p>
                </div>
            </section>
        `;
    },

    _getRegisterFormHTML() {
        return `
            <section id="register-page" class="auth-page">
                <div class="auth-card">
                    <h1 class="auth-title">Daftar Akun StoryVerse</h1>
                    <form id="registerForm" class="auth-form" novalidate>
                        <div class="form-group">
                            <label for="registerName" class="form-label">Nama Lengkap <span class="required-star">*</span></label>
                            <input type="text" id="registerName" name="name" required class="form-control" placeholder="Nama lengkap Anda">
                        </div>
                        <div class="form-group">
                            <label for="registerEmail" class="form-label">Email <span class="required-star">*</span></label>
                            <input type="email" id="registerEmail" name="email" required class="form-control" placeholder="email@example.com">
                        </div>
                        <div class="form-group">
                            <label for="registerPassword" class="form-label">Password <span class="required-star">*</span></label>
                            <input type="password" id="registerPassword" name="password" required minlength="8" class="form-control" placeholder="Minimal 8 karakter">
                        </div>
                        <div id="registerError" class="form-error-message hidden"></div>
                        <div class="form-group">
                            <button type="submit" id="registerButton" class="btn btn-primary btn-block">
                                <span class="submit-text">Daftar</span>
                                <span class="loading-indicator hidden"><div class="spinner-inline"></div></span>
                            </button>
                        </div>
                    </form>
                    <p class="auth-switch-link">
                        Sudah punya akun?
                        <a href="#login" id="navigateToLogin">Login di sini</a>
                    </p>
                </div>
            </section>
        `;
    },

    renderLoginForm() {
        if (!this.mainContent) {
            console.error("AuthView: mainContent element not found to render login form.");
            return;
        }
        this.mainContent.innerHTML = this._getLoginFormHTML();
        this._addLoginEventListeners();
    },

    renderRegisterForm() {
        if (!this.mainContent) {
            console.error("AuthView: mainContent element not found to render register form.");
            return;
        }
        this.mainContent.innerHTML = this._getRegisterFormHTML();
        this._addRegisterEventListeners();
    },

    _addLoginEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const navigateToRegisterLink = document.getElementById('navigateToRegister');

        if (loginForm) {
            loginForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (!this.presenter || typeof this.presenter.handleLogin !== 'function') {
                    console.error("AuthView: Presenter or handleLogin method not set for login form.");
                    return;
                }
                const email = loginForm.email.value;
                const password = loginForm.password.value;
                this.presenter.handleLogin(email, password);
            });
        }

        if (navigateToRegisterLink) {
            navigateToRegisterLink.addEventListener('click', (event) => {
                event.preventDefault();
                if (!this.presenter || typeof this.presenter.navigateToRegisterPage !== 'function') return;
                this.presenter.navigateToRegisterPage();
            });
        }
    },

    _addRegisterEventListeners() {
        const registerForm = document.getElementById('registerForm');
        const navigateToLoginLink = document.getElementById('navigateToLogin');

        if (registerForm) {
            registerForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (!this.presenter || typeof this.presenter.handleRegister !== 'function') {
                    console.error("AuthView: Presenter or handleRegister method not set for register form.");
                    return;
                }
                const name = registerForm.name.value;
                const email = registerForm.email.value;
                const password = registerForm.password.value;
                this.presenter.handleRegister(name, email, password);
            });
        }

        if (navigateToLoginLink) {
            navigateToLoginLink.addEventListener('click', (event) => {
                event.preventDefault();
                if (!this.presenter || typeof this.presenter.navigateToLoginPage !== 'function') return;
                this.presenter.navigateToLoginPage();
            });
        }
    },

    showLoading(formType) {
        const buttonId = formType === 'login' ? 'loginButton' : 'registerButton';
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            const submitTextEl = button.querySelector('.submit-text');
            const loadingIndicatorEl = button.querySelector('.loading-indicator');
            if(submitTextEl) submitTextEl.style.display = 'none'; 
            if(loadingIndicatorEl) loadingIndicatorEl.classList.remove('hidden');
        }
    },

    hideLoading(formType) {
        const buttonId = formType === 'login' ? 'loginButton' : 'registerButton';
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            const submitTextEl = button.querySelector('.submit-text');
            const loadingIndicatorEl = button.querySelector('.loading-indicator');
            if(submitTextEl) submitTextEl.style.display = 'inline';
            if(loadingIndicatorEl) loadingIndicatorEl.classList.add('hidden');
        }
    },

    displayError(formType, message) {
        const errorElementId = formType === 'login' ? 'loginError' : 'registerError';
        const errorElement = document.getElementById(errorElementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        } else { 
            Utils.showMessage('Error', message, true);
        }
    },

    clearError(formType) {
        const errorElementId = formType === 'login' ? 'loginError' : 'registerError';
        const errorElement = document.getElementById(errorElementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
        }
    },

    clearForms() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.reset();
        const registerForm = document.getElementById('registerForm');
        if (registerForm) registerForm.reset();
        this.clearError('login');
        this.clearError('register');
    },

    destroy() {
        if (this.mainContent) {
            this.mainContent.innerHTML = '';
        }
        console.log("AuthView dihancurkan.");
    }
};

export default AuthView;
