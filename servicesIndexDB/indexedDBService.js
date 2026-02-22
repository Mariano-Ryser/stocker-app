// services/indexedDBService.js

// Configuración de la base de datos
const DB_NAME = 'productCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'products';

class IndexedDBService {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  // Inicializar la base de datos
  init() {
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = (event) => {
        console.error('Error al abrir IndexedDB:', event.target.error);
        reject(event.target.error);
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB inicializada correctamente');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Crear el object store si no existe
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: '_id' });
          
          // Crear índices para búsquedas rápidas
          store.createIndex('artikelName', 'artikelName', { unique: false });
          store.createIndex('artikelNumber', 'artikelNumber', { unique: false });
          store.createIndex('lagerPlatz', 'lagerPlatz', { unique: false });
          store.createIndex('lastUpdated', 'lastUpdated', { unique: false });
          
          console.log('Object store creado:', STORE_NAME);
        }
      };
    });
    
    return this.initPromise;
  }

  // Guardar productos en cache
  async saveProducts(products) {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Limpiar la store existente primero
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          console.log(`Guardando ${products.length} productos en cache...`);
          
          // Agregar timestamp de actualización
          const timestamp = Date.now();
          const productsWithTimestamp = products.map(product => ({
            ...product,
            lastUpdated: timestamp,
            cachedAt: new Date().toISOString()
          }));
          
          // Guardar cada producto
          let completed = 0;
          
          productsWithTimestamp.forEach(product => {
            const request = store.put(product);
            
            request.onsuccess = () => {
              completed++;
              if (completed === products.length) {
                console.log('Todos los productos guardados en cache');
                resolve({
                  success: true,
                  count: products.length,
                  timestamp
                });
              }
            };
            
            request.onerror = (event) => {
              console.error('Error al guardar producto:', event.target.error);
              reject(event.target.error);
            };
          });
        };
        
        clearRequest.onerror = (event) => {
          console.error('Error al limpiar cache:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en saveProducts:', error);
      throw error;
    }
  }

  // Obtener todos los productos del cache
  async getAllProducts() {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = (event) => {
          const products = event.target.result;
          console.log(`Obtenidos ${products.length} productos del cache`);
          resolve(products);
        };
        
        request.onerror = (event) => {
          console.error('Error al obtener productos del cache:', event.target.error);
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en getAllProducts:', error);
      throw error;
    }
  }

  // Obtener producto por ID
  async getProductById(id) {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en getProductById:', error);
      throw error;
    }
  }

  // Actualizar un producto específico en cache
  async updateProduct(product) {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const productToSave = {
          ...product,
          lastUpdated: Date.now()
        };
        
        const request = store.put(productToSave);
        
        request.onsuccess = () => {
          console.log('Producto actualizado en cache:', product._id);
          resolve({ success: true });
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en updateProduct:', error);
      throw error;
    }
  }

  // Eliminar un producto del cache
  async deleteProduct(id) {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => {
          console.log('Producto eliminado del cache:', id);
          resolve({ success: true });
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      throw error;
    }
  }

  // Verificar si el cache está actualizado (menos de 5 minutos)
  async isCacheFresh(minutes = 5) {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('lastUpdated');
        
        // Obtener el último timestamp
        const request = index.openCursor(null, 'prev');
        let latestTimestamp = 0;
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            latestTimestamp = cursor.value.lastUpdated || 0;
          }
          
          const now = Date.now();
          const minutesSinceUpdate = (now - latestTimestamp) / (1000 * 60);
          
          resolve({
            isFresh: minutesSinceUpdate < minutes,
            minutesSinceUpdate,
            latestTimestamp,
            hasData: latestTimestamp > 0
          });
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en isCacheFresh:', error);
      return { isFresh: false, hasData: false };
    }
  }

  // Limpiar cache viejo (más de 1 día)
  async clearOldCache(days = 1) {
    try {
      await this.init();
      
      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('lastUpdated');
        
        const request = index.openCursor();
        let deletedCount = 0;
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const product = cursor.value;
            if (product.lastUpdated < cutoffTime) {
              cursor.delete();
              deletedCount++;
              cursor.continue();
            } else {
              cursor.continue();
            }
          } else {
            console.log(`Cache limpiado: ${deletedCount} productos antiguos eliminados`);
            resolve({ deletedCount });
          }
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en clearOldCache:', error);
      throw error;
    }
  }

  // Obtener estadísticas del cache
  async getCacheStats() {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const countRequest = store.count();
        
        countRequest.onsuccess = async () => {
          const count = countRequest.result;
          
          const stats = {
            totalProducts: count,
            cacheSize: await this.estimateSize(),
            lastUpdate: await this.getLastUpdateTime()
          };
          
          resolve(stats);
        };
        
        countRequest.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en getCacheStats:', error);
      throw error;
    }
  }

  // Estimar tamaño del cache
  async estimateSize() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return 'N/A';
    }
    
    try {
      const estimate = await navigator.storage.estimate();
      const usageMB = (estimate.usage / (1024 * 1024)).toFixed(2);
      const quotaMB = (estimate.quota / (1024 * 1024)).toFixed(2);
      
      return {
        usageMB,
        quotaMB,
        percentage: ((estimate.usage / estimate.quota) * 100).toFixed(1)
      };
    } catch (error) {
      console.error('Error estimando tamaño:', error);
      return 'Error';
    }
  }

  // Obtener hora de última actualización
  async getLastUpdateTime() {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('lastUpdated');
        
        const request = index.openCursor(null, 'prev');
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            resolve({
              timestamp: cursor.value.lastUpdated,
              date: new Date(cursor.value.lastUpdated).toLocaleString()
            });
          } else {
            resolve(null);
          }
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en getLastUpdateTime:', error);
      return null;
    }
  }

  // Vaciar completamente el cache
  async clearCache() {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        
        request.onsuccess = () => {
          console.log('Cache completamente limpiado');
          resolve({ success: true });
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en clearCache:', error);
      throw error;
    }
  }
}

// Exportar una instancia singleton
export const indexedDBService = new IndexedDBService();