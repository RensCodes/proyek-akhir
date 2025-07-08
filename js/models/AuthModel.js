import StoryApiService from '../services/StoryApiService.js';
import TokenService from '../services/TokenService.js';

const AuthModel = {
    async register(name, email, password) {
        if (!name || !email || !password) {
            throw new Error('Nama, email, dan password tidak boleh kosong.');
        }
        if (password.length < 8) {
            throw new Error('Password minimal harus 8 karakter.');
        }

        try {
            const response = await StoryApiService.register({ name, email, password });
            return response;
        } catch (error) {
            console.error('AuthModel.register error:', error);
            throw error;
        }
    },

    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email dan password tidak boleh kosong.');
        }

        try {
            const loginResult = await StoryApiService.login({ email, password });
            TokenService.saveToken(loginResult.token);
            TokenService.saveUserName(loginResult.name);
            return loginResult;
        } catch (error) {
            console.error('AuthModel.login error:', error);
            TokenService.removeToken();
            TokenService.removeUserName();
            throw error;
        }
    },

    logout() {
        TokenService.removeToken();
        TokenService.removeUserName();
        console.log('Pengguna berhasil logout dari AuthModel.');
    },

    isUserLoggedIn() {
        return TokenService.isLoggedIn();
    },

    getCurrentUserName() {
        return TokenService.getUserName();
    },

    getCurrentToken() {
        return TokenService.getToken();
    }
};
export default AuthModel;
