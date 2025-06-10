import StoryApiService from '../services/StoryApiService.js';
import TokenService from '../services/TokenService.js';

const StoryModel = {
    _storiesCache: null,

    async fetchStories(forceRefresh = false) {
        if (!forceRefresh && this._storiesCache) {
            console.log("StoryModel: Mengembalikan cerita dari cache.");
            return this._storiesCache;
        }

        const token = TokenService.getToken();
        if (!token) {
            console.error("StoryModel: Token tidak ditemukan untuk fetchStories.");
            throw new Error("Sesi Anda telah berakhir atau Anda belum login. Silakan login kembali.");
        }
        try {
            const stories = await StoryApiService.getStories(token);
            console.log("StoryModel: Cerita berhasil diambil dari API", stories);
            this._storiesCache = stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return this._storiesCache;
        } catch (error) {
            console.error("StoryModel.fetchStories error:", error);
            this._storiesCache = null;
            throw error;
        }
    },

    async addNewStory(description, photoFile, lat, lon) {
        const token = TokenService.getToken();
        if (!token) {
            throw new Error("Sesi Anda telah berakhir. Silakan login kembali untuk menambah cerita.");
        }
        if (!description || !photoFile) {
            throw new Error("Deskripsi dan foto wajib diisi.");
        }
        if (!(photoFile instanceof File)) {
            throw new Error("Data foto tidak valid. Harus berupa File.");
        }

        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photoFile);
        
        if (lat !== null && lat !== undefined && lon !== null && lon !== undefined) {
            formData.append('lat', parseFloat(lat));
            formData.append('lon', parseFloat(lon));
        }
        
        try {
            const response = await StoryApiService.addStory(token, formData);
            console.log("StoryModel: Cerita berhasil ditambahkan", response);
            this._storiesCache = null; 
            return response;
        } catch (error) {
            console.error("StoryModel.addNewStory error:", error);
            throw error;
        }
    },

    async fetchStoryDetail(storyId) {
        const token = TokenService.getToken();
        if (!token) {
            throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
        }
        try {
            const story = await StoryApiService.getStoryDetail(token, storyId);
            return story;
        } catch (error) {
            console.error(`StoryModel.fetchStoryDetail (id: ${storyId}) error:`, error);
            throw error;
        }
    },

    clearStoriesCache() {
        this._storiesCache = null;
        console.log("StoryModel: Cache cerita dibersihkan.");
    }
};

export default StoryModel;
