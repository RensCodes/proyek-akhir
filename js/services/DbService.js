const DB_NAME = 'storyverse-db';
const DB_VERSION = 12;

const STORIES_CACHE_NAME = 'stories_cache';
const OUTBOX_STORE_NAME = 'outbox-stories';
const DELETED_STORE_NAME = 'deleted-story-ids';
const SAVED_STORE_NAME = 'saved-stories';

const DbService = {
  _db: null,

  async _openDb() {
    if (this._db) return this._db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => {
        console.error('[DB] Error opening DB:', event.target.error);
        reject(new Error('Gagal membuka IndexedDB'));
      };

      request.onsuccess = (event) => {
        this._db = event.target.result;
        resolve(this._db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORIES_CACHE_NAME)) {
          db.createObjectStore(STORIES_CACHE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(OUTBOX_STORE_NAME)) {
          db.createObjectStore(OUTBOX_STORE_NAME, { keyPath: 'tempId', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(DELETED_STORE_NAME)) {
          db.createObjectStore(DELETED_STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(SAVED_STORE_NAME)) {
          db.createObjectStore(SAVED_STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  },

  // ========== OFFLINE CACHE (stories_cache) ==========
  async putStories(stories) {
    if (!Array.isArray(stories) || stories.length === 0) return;

    const db = await this._openDb();
    const tx = db.transaction(STORIES_CACHE_NAME, 'readwrite');
    const store = tx.objectStore(STORIES_CACHE_NAME);

    await Promise.all(stories.map(story => {
      if (!story?.id) return Promise.resolve();
      return new Promise((resolve) => {
        const req = store.put(story);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    }));
  },

  async getAllStories() {
    const db = await this._openDb();
    const tx = db.transaction(STORIES_CACHE_NAME, 'readonly');
    const store = tx.objectStore(STORIES_CACHE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async deleteStory(id) {
    const db = await this._openDb();
    const tx = db.transaction(STORIES_CACHE_NAME, 'readwrite');
    const store = tx.objectStore(STORIES_CACHE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async clearAllStories() {
    const db = await this._openDb();
    const tx = db.transaction(STORIES_CACHE_NAME, 'readwrite');
    const store = tx.objectStore(STORIES_CACHE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });
  },

  // ========== DELETED ==========
  async markStoryAsDeleted(id) {
    if (!id) return;
    const db = await this._openDb();
    const tx = db.transaction(DELETED_STORE_NAME, 'readwrite');
    const store = tx.objectStore(DELETED_STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.put({ id });
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async getDeletedStoryIds() {
    const db = await this._openDb();
    const tx = db.transaction(DELETED_STORE_NAME, 'readonly');
    const store = tx.objectStore(DELETED_STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const ids = (req.result || []).map(entry => entry.id).filter(Boolean);
        resolve(ids);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  },

  // ========== OUTBOX ==========
  async addStoryToOutbox(storyData) {
    const db = await this._openDb();
    const tx = db.transaction(OUTBOX_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE_NAME);
    return new Promise((resolve, reject) => {
      const data = {
        ...storyData,
        tempId: storyData.tempId || `temp-${Date.now()}-${Math.random()}`
      };
      const req = store.put(data);
      req.onsuccess = () => resolve(data.tempId);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async getAllOutboxStories() {
    const db = await this._openDb();
    const tx = db.transaction(OUTBOX_STORE_NAME, 'readonly');
    const store = tx.objectStore(OUTBOX_STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async deleteStoryFromOutbox(tempId) {
    const db = await this._openDb();
    const tx = db.transaction(OUTBOX_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OUTBOX_STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.delete(tempId);
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });
  },

  // ========== SAVED STORIES ==========
  async saveStoryToSaved(story) {
    const db = await this._openDb();
    const tx = db.transaction(SAVED_STORE_NAME, 'readwrite');
    const store = tx.objectStore(SAVED_STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.put(story);
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async getAllSavedStories() {
    const db = await this._openDb();
    const tx = db.transaction(SAVED_STORE_NAME, 'readonly');
    const store = tx.objectStore(SAVED_STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async deleteSavedStory(id) {
    const db = await this._openDb();
    const tx = db.transaction(SAVED_STORE_NAME, 'readwrite');
    const store = tx.objectStore(SAVED_STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });
  },

  async isStorySaved(id) {
    const db = await this._openDb();
    const tx = db.transaction(SAVED_STORE_NAME, 'readonly');
    const store = tx.objectStore(SAVED_STORE_NAME);
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  },


async clearSavedStories() {
  const db = await this._openDb();
  const tx = db.transaction(SAVED_STORE_NAME, 'readwrite');
  const store = tx.objectStore(SAVED_STORE_NAME);
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e.target.error);
  });
}
};

export default DbService;
