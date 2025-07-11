import Config from '../config.js';

const StoryApiService = {
    async register(userData) {
        const response = await fetch(`${Config.API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(userData),
        });
        const responseJson = await response.json();
        if (response.status >= 400 || responseJson.error) {
            throw new Error(responseJson.message || 'Gagal melakukan registrasi');
        }
        return responseJson;
    },

    async login(credentials) {
        const response = await fetch(`${Config.API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(credentials),
        });
        const responseJson = await response.json();
        if (response.status >= 400 || responseJson.error) {
            throw new Error(responseJson.message || 'Gagal melakukan login');
        }
        return responseJson.loginResult;
    },

    async getStories(token) {
  if (!token) return Promise.reject(new Error('Token tidak tersedia untuk mengambil cerita.'));

  const response = await fetch(`${Config.API_BASE_URL}/stories`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const contentType = response.headers.get('Content-Type');
  const text = await response.text();

  if (!response.ok) {
    let errorMessage = `Gagal mengambil cerita (${response.status})`;
    try {
      const errData = JSON.parse(text);
      errorMessage = errData.message || errorMessage;
    } catch (e) {
    }
    throw new Error(errorMessage);
  }

  if (!text || !contentType?.includes('application/json')) {
    throw new Error('Response kosong atau bukan JSON.');
  }

  const data = JSON.parse(text);
  return data.listStory || [];
},

    async addStory(token, storyFormData) {
        if (!token) return Promise.reject(new Error('Token tidak tersedia untuk menambah cerita.'));
        const response = await fetch(`${Config.API_BASE_URL}/stories`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, },
            body: storyFormData,
        });
        const responseJson = await response.json();
        if (response.status >= 400 || responseJson.error) {
            throw new Error(responseJson.message || 'Gagal menambah cerita baru');
        }
        return responseJson;
    },

    async getStoryDetail(token, storyId) {
        if (!token) return Promise.reject(new Error('Token tidak tersedia.'));
        const response = await fetch(`${Config.API_BASE_URL}/stories/${storyId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, },
        });
        const responseJson = await response.json();
        if (response.status >= 400 || responseJson.error) {
            throw new Error(responseJson.message || 'Gagal mengambil detail cerita');
        }
        return responseJson.story;
    }
};

export default StoryApiService;
