// File: models/StoryModel.js
import DbService from '../services/DbService.js';
import StoryApiService from '../services/StoryApiService.js';
import TokenService from '../services/TokenService.js';

const StoryModel = {
  _storiesCache: null,

  async fetchStories(forceRefresh = false) {
    if (!forceRefresh && this._storiesCache) return this._storiesCache;

    const token = TokenService.getToken();
    const isOnline = navigator.onLine;

    try {
      let stories = [];

      if (isOnline && token) {
        try {
          stories = await StoryApiService.getStories(token);
          await DbService.putStories(stories);

          const deletedIds = await DbService.getDeletedStoryIds();
          stories = stories.filter(s => !deletedIds.includes(s.id));
        } catch (apiError) {
          console.warn('[StoryModel] Gagal fetch dari API, fallback ke IndexedDB:', apiError);
          stories = await this.getAllStoriesFromDb();
        }
      } else {
        stories = await this.getAllStoriesFromDb();
      }

      this._storiesCache = stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return this._storiesCache;
    } catch (error) {
      console.warn('[StoryModel] catch besar, fallback final ke cache:', error);
      const cachedStories = await this.getAllStoriesFromDb();
      if (cachedStories?.length > 0) {
        this._storiesCache = cachedStories;
        return cachedStories;
      }
      throw new Error('Gagal mengambil cerita dan tidak ada data offline tersedia.');
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
      const base64Full = await this._toBase64(photoFile);
      const photoBase64 = base64Full.split(',')[1];

      const offlineStory = {
        description,
        photoBase64,
        lat,
        lon,
        timestamp: Date.now()
      };

      await DbService.addStoryToOutbox(offlineStory);
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
        const blob = await this._base64ToBlob(`data:image/jpeg;base64,${item.photoBase64}`, 'image/jpeg');
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

  async getAllStoriesFromDb() {
    const all = await DbService.getAllStories();
    const saved = await DbService.getAllSavedStories();
    const outbox = await DbService.getAllOutboxStories();
    const deletedIds = await DbService.getDeletedStoryIds();

    const savedMap = new Map(saved.map(s => [s.id, s]));

    const enriched = all.map(story => {
      const savedVersion = savedMap.get(story.id);
      return {
        ...story,
        photoBase64: story.photoBase64 || savedVersion?.photoBase64 || null,
      };
    });

    const outboxFormatted = outbox.map(item => ({
      id: item.tempId,
      description: item.description,
      photoBase64: item.photoBase64,
      lat: item.lat,
      lon: item.lon,
      createdAt: new Date(item.timestamp).toISOString(),
      name: 'Anda (Offline)'
    }));

    const combined = [...enriched, ...outboxFormatted].filter(s => !deletedIds.includes(s.id));

    console.log('[StoryModel] Final stories for view (with base64 fallback):', combined);
    return combined;
  },

  async deleteStoryFromDb(id) {
    await DbService.deleteStory(id);
    await DbService.deleteStoryFromOutbox(id);
    await DbService.markStoryAsDeleted(id);

    if (this._storiesCache) {
      this._storiesCache = this._storiesCache.filter(s => s.id !== id);
    }
  },

  async clearAllStoriesFromDb() {
    await DbService.clearAllStories();
    this._storiesCache = null;
  },

  clearStoriesCache() {
    this._storiesCache = null;
  },

  async fetchStoryDetail(storyId) {
    const token = TokenService.getToken();
    if (!token) throw new Error("Silakan login kembali.");
    return await StoryApiService.getStoryDetail(token, storyId);
  },

  async saveStoryToDb(story) {
    if (!story?.id) throw new Error('Cerita tidak valid.');
    await DbService.putStories([story]);
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
  },

  async getAllSavedStories() {
    return await DbService.getAllSavedStories();
  },

  async getSavedStories() {
    return await this.getAllSavedStories();
  },

  async deleteSavedStory(id) {
    return await DbService.deleteSavedStory(id);
  },

  async clearAllSavedStories() {
    return await DbService.clearSavedStories();
  },

  async isStorySaved(id) {
    return await DbService.isStorySaved(id);
  },

  async deleteFavoriteStory(id) {
    return await this.deleteSavedStory(id);
  },

  async clearFavoriteStories() {
    return await this.clearAllSavedStories();
  }
};

export default StoryModel;
