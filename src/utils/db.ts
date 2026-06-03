class IndexedDBHelper {
  private dbName = 'MoneySaverDB';
  private storeName = 'keyvalue';
  private version = 1;

  private getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Lỗi khi mở database IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result !== undefined ? (request.result as T) : defaultValue);
        };

        request.onerror = () => {
          console.error(`Lỗi khi đọc key ${key} từ IndexedDB, sử dụng giá trị mặc định.`);
          resolve(defaultValue);
        };
      });
    } catch (e) {
      console.error(`Không kết nối được IndexedDB để đọc key ${key}:`, e);
      return defaultValue;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error(`Lỗi khi ghi key ${key} vào IndexedDB:`, request.error);
          reject(request.error);
        };
      });
    } catch (e) {
      console.error(`Không kết nối được IndexedDB để ghi key ${key}:`, e);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error(`Lỗi khi xóa key ${key} từ IndexedDB:`, request.error);
          reject(request.error);
        };
      });
    } catch (e) {
      console.error(`Không kết nối được IndexedDB để xóa key ${key}:`, e);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Lỗi khi dọn dẹp IndexedDB:', request.error);
          reject(request.error);
        };
      });
    } catch (e) {
      console.error('Không kết nối được IndexedDB để dọn dẹp:', e);
    }
  }
  async exportAll(): Promise<Record<string, any>> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();
        const requestKeys = store.getAllKeys();

        request.onsuccess = () => {
          requestKeys.onsuccess = () => {
            const values = request.result;
            const keys = requestKeys.result as string[];
            const data: Record<string, any> = {};
            keys.forEach((k, i) => {
              data[k] = values[i];
            });
            resolve(data);
          };
          requestKeys.onerror = () => reject(requestKeys.error);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.error('Lỗi khi export toàn bộ dữ liệu IndexedDB:', e);
      return {};
    }
  }

  async importAll(data: Record<string, any>): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);

        Object.keys(data).forEach(key => {
          store.put(data[key], key);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (e) {
      console.error('Lỗi khi import dữ liệu vào IndexedDB:', e);
    }
  }
}
export const db = new IndexedDBHelper();
