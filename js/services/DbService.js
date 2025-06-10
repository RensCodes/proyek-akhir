// File: js/services/DbService.js
const DB_NAME = 'storyverse-db';
const DB_VERSION = 1;
const STORY_STORE_NAME = 'stories'; 
const OUTBOX_STORE_NAME = 'outbox-stories'; 

const DbService = {
    _db: null,

    async _openDb() {
        if (this._db) {
            return this._db;
        }
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('[DB] Error opening IndexedDB:', event.target.error);
                reject(new Error('Gagal membuka database IndexedDB.'));
            };

            request.onsuccess = (event) => {
                console.log('[DB] IndexedDB opened successfully.');
                this._db = event.target.result;
                resolve(this._db);
            };

            request.onupgradeneeded = (event) => {
                console.log('[DB] Upgrading IndexedDB...');
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORY_STORE_NAME)) {
                    db.createObjectStore(STORY_STORE_NAME, { keyPath: 'id' }); 
                    console.log(`[DB] Object store '${STORY_STORE_NAME}' created.`);
                }
                if (!db.objectStoreNames.contains(OUTBOX_STORE_NAME)) {
                    db.createObjectStore(OUTBOX_STORE_NAME, { autoIncrement: true, keyPath: 'tempId' });
                    console.log(`[DB] Object store '${OUTBOX_STORE_NAME}' created.`);
                }
            };
        });
    },

    async getAllStories() {
        const db = await this._openDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORY_STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORY_STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                console.log('[DB] Berhasil mengambil semua cerita dari IndexedDB:', request.result);
                resolve(request.result || []); 
            };
            request.onerror = (event) => {
                console.error('[DB] Error mengambil cerita dari IndexedDB:', event.target.error);
                reject(new Error('Gagal mengambil cerita dari database.'));
            };
        });
    },

    async putStories(stories) { 
        if (!stories || stories.length === 0) return Promise.resolve();
        const db = await this._openDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORY_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORY_STORE_NAME);
            
            let completedOperations = 0;
            stories.forEach(story => {
                if (!story || typeof story.id === 'undefined') {
                    console.warn('[DB] Cerita tanpa ID valid dilewati:', story);
                    completedOperations++; 
                    if (completedOperations === stories.length) {
                        resolve();
                    }
                    return;
                }
                const request = store.put(story);
                request.onsuccess = () => {
                    completedOperations++;
                    if (completedOperations === stories.length) {
                        console.log('[DB] Semua cerita berhasil disimpan/diperbarui di IndexedDB.');
                        resolve();
                    }
                };
                request.onerror = (event) => {
                    completedOperations++; 
                    console.error(`[DB] Error menyimpan cerita ID ${story.id} ke IndexedDB:`, event.target.error);
                    if (completedOperations === stories.length) {
                        console.warn('[DB] Beberapa cerita mungkin gagal disimpan.');
                        resolve(); 
                    }
                };
            });

            transaction.oncomplete = () => {
            };
            transaction.onerror = (event) => {
                console.error('[DB] Error transaksi saat menyimpan cerita:', event.target.error);
                reject(new Error('Gagal menyimpan cerita ke database.'));
            };
        });
    },
    
    async getStoryById(id) {
        const db = await this._openDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORY_STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORY_STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                console.error(`[DB] Error mengambil cerita ID ${id}:`, event.target.error);
                reject(new Error('Gagal mengambil cerita dari database.'));
            };
        });
    },

    async deleteStory(id) {
        const db = await this._openDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORY_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORY_STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log(`[DB] Cerita ID ${id} berhasil dihapus dari IndexedDB.`);
                resolve();
            };
            request.onerror = (event) => {
                console.error(`[DB] Error menghapus cerita ID ${id}:`, event.target.error);
                reject(new Error('Gagal menghapus cerita dari database.'));
            };
        });
    },

    async addStoryToOutbox(storyData) { 
        const db = await this._openDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(OUTBOX_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(OUTBOX_STORE_NAME);

            const dataToStore = { ...storyData };
            if (!dataToStore.tempId) { 
                dataToStore.tempId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            }

            const request = store.add(dataToStore);

            request.onsuccess = (event) => {
                console.log('[DB] Cerita berhasil ditambahkan ke outbox IndexedDB:', event.target.result, dataToStore);
                resolve(event.target.result); 
            };
            request.onerror = (event) => {
                console.error('[DB] Error menambahkan cerita ke outbox:', event.target.error);
                reject(new Error('Gagal menyimpan cerita ke outbox.'));
            };
        });
    },

    async getAllOutboxStories() {
        const db = await this._openDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(OUTBOX_STORE_NAME, 'readonly');
            const store = transaction.objectStore(OUTBOX_STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                console.log('[DB] Berhasil mengambil semua cerita dari outbox IndexedDB:', request.result);
                resolve(request.result || []);
            };
            request.onerror = (event) => {
                console.error('[DB] Error mengambil cerita dari outbox:', event.target.error);
                reject(new Error('Gagal mengambil cerita dari outbox.'));
            };
        });
    },

    async deleteStoryFromOutbox(tempId) {
        const db = await this._openDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(OUTBOX_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(OUTBOX_STORE_NAME);
            const request = store.delete(tempId);

            request.onsuccess = () => {
                console.log(`[DB] Cerita dengan tempId ${tempId} berhasil dihapus dari outbox.`);
                resolve();
            };
            request.onerror = (event) => {
                console.error(`[DB] Error menghapus cerita dari outbox (tempId: ${tempId}):`, event.target.error);
                reject(new Error('Gagal menghapus cerita dari outbox.'));
            };
        });
    }
};

export default DbService;
