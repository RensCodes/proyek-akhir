const TOKEN_KEY = 'storyAppToken';
const USER_NAME_KEY = 'storyAppUserName';

const TokenService = {
    saveToken(token) { localStorage.setItem(TOKEN_KEY, token); },
    getToken() { return localStorage.getItem(TOKEN_KEY); },
    removeToken() { localStorage.removeItem(TOKEN_KEY); },
    saveUserName(name) { localStorage.setItem(USER_NAME_KEY, name); },
    getUserName() { return localStorage.getItem(USER_NAME_KEY); },
    removeUserName() { localStorage.removeItem(USER_NAME_KEY); },
    isLoggedIn() { return !!this.getToken(); }
};

export default TokenService;
