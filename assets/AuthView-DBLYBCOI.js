import{U as o}from"./index-CiRWjb8D.js";const l={mainContent:null,presenter:null,setPresenter(e){this.presenter=e},_getLoginFormHTML(){return`
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
        `},_getRegisterFormHTML(){return`
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
        `},renderLoginForm(){if(!this.mainContent){console.error("AuthView: mainContent element not found to render login form.");return}this.mainContent.innerHTML=this._getLoginFormHTML(),this._addLoginEventListeners()},renderRegisterForm(){if(!this.mainContent){console.error("AuthView: mainContent element not found to render register form.");return}this.mainContent.innerHTML=this._getRegisterFormHTML(),this._addRegisterEventListeners()},_addLoginEventListeners(){const e=document.getElementById("loginForm"),r=document.getElementById("navigateToRegister");e&&e.addEventListener("submit",t=>{if(t.preventDefault(),!this.presenter||typeof this.presenter.handleLogin!="function"){console.error("AuthView: Presenter or handleLogin method not set for login form.");return}const n=e.email.value,i=e.password.value;this.presenter.handleLogin(n,i)}),r&&r.addEventListener("click",t=>{t.preventDefault(),!(!this.presenter||typeof this.presenter.navigateToRegisterPage!="function")&&this.presenter.navigateToRegisterPage()})},_addRegisterEventListeners(){const e=document.getElementById("registerForm"),r=document.getElementById("navigateToLogin");e&&e.addEventListener("submit",t=>{if(t.preventDefault(),!this.presenter||typeof this.presenter.handleRegister!="function"){console.error("AuthView: Presenter or handleRegister method not set for register form.");return}const n=e.name.value,i=e.email.value,s=e.password.value;this.presenter.handleRegister(n,i,s)}),r&&r.addEventListener("click",t=>{t.preventDefault(),!(!this.presenter||typeof this.presenter.navigateToLoginPage!="function")&&this.presenter.navigateToLoginPage()})},showLoading(e){const r=e==="login"?"loginButton":"registerButton",t=document.getElementById(r);if(t){t.disabled=!0;const n=t.querySelector(".submit-text"),i=t.querySelector(".loading-indicator");n&&(n.style.display="none"),i&&i.classList.remove("hidden")}},hideLoading(e){const r=e==="login"?"loginButton":"registerButton",t=document.getElementById(r);if(t){t.disabled=!1;const n=t.querySelector(".submit-text"),i=t.querySelector(".loading-indicator");n&&(n.style.display="inline"),i&&i.classList.add("hidden")}},displayError(e,r){const t=e==="login"?"loginError":"registerError",n=document.getElementById(t);n?(n.textContent=r,n.classList.remove("hidden")):o.showMessage("Error",r,!0)},clearError(e){const r=e==="login"?"loginError":"registerError",t=document.getElementById(r);t&&(t.textContent="",t.classList.add("hidden"))},clearForms(){const e=document.getElementById("loginForm");e&&e.reset();const r=document.getElementById("registerForm");r&&r.reset(),this.clearError("login"),this.clearError("register")},destroy(){this.mainContent&&(this.mainContent.innerHTML=""),console.log("AuthView dihancurkan.")}};export{l as default};
