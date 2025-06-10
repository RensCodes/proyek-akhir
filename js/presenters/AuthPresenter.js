function createAuthPresenter(authModel, authView, router) {
    const presenter = {
        _authModel: authModel,
        _authView: authView,
        _router: router,

        async handleLogin(email, password) {
            this._authView.clearError('login');
            if (!email || !password) {
                this._authView.displayError('login', 'Email dan password tidak boleh kosong.');
                return;
            }

            this._authView.showLoading('login');
            try {
                const loginResult = await this._authModel.login(email, password);
                this._authView.hideLoading('login');
                console.log(`AuthPresenter: Login berhasil untuk ${loginResult.name}`);
                this._router.navigateTo('home');
            } catch (error) {
                this._authView.hideLoading('login');
                this._authView.displayError('login', error.message || 'Login gagal. Periksa kembali kredensial Anda.');
                console.error('AuthPresenter.handleLogin error:', error);
            }
        },

        async handleRegister(name, email, password) {
            this._authView.clearError('register');
            if (!name || !email || !password) {
                this._authView.displayError('register', 'Nama, email, dan password tidak boleh kosong.');
                return;
            }

            this._authView.showLoading('register');
            try {
                const response = await this._authModel.register(name, email, password);
                this._authView.hideLoading('register');
                console.log(`AuthPresenter: Registrasi berhasil - ${response.message}`);
                this._authView.displayError('register', 'Registrasi berhasil! Silakan login.');
            } catch (error) {
                this._authView.hideLoading('register');
                this._authView.displayError('register', error.message || 'Registrasi gagal. Coba lagi.');
                console.error('AuthPresenter.handleRegister error:', error);
            }
        },

        navigateToLoginPage() {
            this._router.navigateTo('login');
        },

        navigateToRegisterPage() {
            this._router.navigateTo('register');
        },

        showLoginPage() {
            this._authView.clearForms();
            this._authView.renderLoginForm();
        },

        showRegisterPage() {
            this._authView.clearForms();
            this._authView.renderRegisterForm();
        },
        
        destroy() {
            if (this._authView && typeof this._authView.destroy === 'function') {
                this._authView.destroy();
            }
            this._authModel = null;
            this._authView = null;
            this._router = null;
            console.log("AuthPresenter instance (dari factory) dihancurkan.");
        }
    };

    authView.setPresenter(presenter);
    return presenter;
}

export default createAuthPresenter;
