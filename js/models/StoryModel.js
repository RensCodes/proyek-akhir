import DbService from '../services/DbService.js';
import StoryApiService from '../services/StoryApiService.js';
import TokenService from '../services/TokenService.js';

const StoryModel = {
  _storiesCache: null,

  async fetchStories(forceRefresh = false) {
    if (!forceRefresh && this._storiesCache) return this._storiesCache;

    const token = TokenService.getToken();
    if (!token) throw new Error("Token tidak ditemukan. Silakan login kembali.");

    try {
      const stories = await StoryApiService.getStories(token);
      this._storiesCache = stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Simpan ke IndexedDB untuk saved stories
      await DbService.putStories(this._storiesCache);

      return this._storiesCache;
    } catch (error) {
      this._storiesCache = null;
      throw error;
    }
  },

  async addNewStory(description, photoFile, lat, lon) {
    const token = TokenService.getToken();
    if (!token) throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
    if (!description || !photoFile) throw new Error("Deskripsi dan foto wajib diisi.");

    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photoFile);
    if (lat != null && lon != null) {
      formData.append('lat', parseFloat(lat));
      formData.append('lon', parseFloat(lon));
    }

    try {
      const response = await StoryApiService.addStory(token, formData);
      this._storiesCache = null;
      return response;
    } catch (error) {
      console.warn("Gagal unggah ke server, menyimpan ke outbox.", error);

      const photoBase64 = await this._toBase64(photoFile);

      await DbService.addStoryToOutbox({
        description,
        photoBase64,
        lat,
        lon,
        timestamp: Date.now()
      });

      throw new Error("Cerita gagal diunggah, disimpan ke outbox offline.");
    }
  },

  async syncOutboxStories() {
    const token = TokenService.getToken();
    if (!token) return { synced: 0 };

    const outboxItems = await DbService.getAllOutboxStories();
    if (!outboxItems.length) return { synced: 0 };

    let synced = 0;

    for (const item of outboxItems) {
      try {
        const blob = await this._base64ToBlob(item.photoBase64, 'image/jpeg');
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('description', item.description);
        formData.append('photo', file);
        if (item.lat && item.lon) {
          formData.append('lat', parseFloat(item.lat));
          formData.append('lon', parseFloat(item.lon));
        }

        await StoryApiService.addStory(token, formData);
        await DbService.deleteStoryFromOutbox(item.tempId);
        synced++;
      } catch (err) {
        console.error("Gagal sync outbox:", err);
      }
    }

    this._storiesCache = null;
    return { synced };
  },

  async fetchStoryDetail(storyId) {
    const token = TokenService.getToken();
    if (!token) throw new Error("Silakan login kembali.");

    return await StoryApiService.getStoryDetail(token, storyId);
  },

  async getAllStoriesFromDb() {
    return await DbService.getAllStories();
  },

  async deleteStoryFromDb(id) {
    await DbService.deleteStory(id);
  },

  async clearStoriesCacheFromDb() {
    await DbService.clearAllStories();
  },

  clearStoriesCache() {
    this._storiesCache = null;
  },

  async _toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async _base64ToBlob(base64, type = 'image/jpeg') {
    const res = await fetch(base64);
    return await res.blob();
  }
};

export default StoryModel;
