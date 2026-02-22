// services/indexedDBService.js - VERSIÓN REACTIVA COMPLETA
const DB_NAME = 'productCacheDB';
const DB_VERSION = 3; // Incrementar versión
const STORE_NAME = 'products';
const SYNC_STORE = 'syncQueue';

class IndexedDBService {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

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
        
        // Crear store de productos
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: '_id' });
          store.createIndex('artikelName', 'artikelName', { unique: false });
          store.createIndex('lastUpdated', 'lastUpdated', { unique: false });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
        
        // Crear store de cola de sincronización
        if (!db.objectStoreNames.contains(SYNC_STORE)) {
          const syncStore = db.createObjectStore(SYNC_STORE, { 
            keyPath: 'id',
            autoIncrement: true 
          });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('productId', 'productId', { unique: false });
        }
      };
    });
    
    return this.initPromise;
  }

  // 🔹 Verificar si hay cambios pendientes
  async hasPendingChanges() {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([SYNC_STORE], 'readonly');
        const store = transaction.objectStore(SYNC_STORE);
        const index = store.index('status');
        const countRequest = index.count('pending');
        
        countRequest.onsuccess = () => {
          resolve(countRequest.result > 0);
        };
        
        countRequest.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en hasPendingChanges:', error);
      return false;
    }
  }

  // 🔹 Obtener contador de cambios pendientes
  async getPendingCount() {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([SYNC_STORE], 'readonly');
        const store = transaction.objectStore(SYNC_STORE);
        const index = store.index('status');
        const countRequest = index.count('pending');
        
        countRequest.onsuccess = () => {
          resolve(countRequest.result);
        };
        
        countRequest.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en getPendingCount:', error);
      return 0;
    }
  }

  // 🔹 Guardar productos en cache
  async saveProducts(products) {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          console.log(`Guardando ${products.length} productos en cache...`);
          
          const timestamp = Date.now();
          const productsWithSync = products.map(product => ({
            ...product,
            lastUpdated: timestamp,
            cachedAt: new Date().toISOString(),
            syncStatus: 'synced'
          }));
          
          let completed = 0;
          let errors = 0;
          
          productsWithSync.forEach(product => {
            const request = store.put(product);
            
            request.onsuccess = () => {
              completed++;
              if (completed + errors === products.length) {
                if (errors > 0) {
                  reject(new Error(`${errors} productos fallaron al guardar`));
                } else {
                  console.log('Productos guardados exitosamente');
                  resolve({
                    success: true,
                    count: completed,
                    timestamp
                  });
                }
              }
            };
            
            request.onerror = () => {
              errors++;
              completed++;
              console.error(`Error guardando producto ${product._id}`);
              if (completed + errors === products.length && errors > 0) {
                reject(new Error(`${errors} productos fallaron al guardar`));
              }
            };
          });
        };
        
        clearRequest.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en saveProducts:', error);
      throw error;
    }
  }

  // 🔹 Obtener todos los productos del cache
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
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en getAllProducts:', error);
      throw error;
    }
  }

  // 🔹 Actualizar producto en cache
  async updateProduct(product, optimistic = true) {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const productToSave = {
          ...product,
          lastUpdated: Date.now(),
          syncStatus: optimistic ? 'pending' : 'synced'
        };
        
        const request = store.put(productToSave);
        
        request.onsuccess = () => {
          console.log('Producto actualizado en cache:', product._id);
          resolve({ success: true, product: productToSave });
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

  // 🔹 Eliminar producto del cache
  async deleteProduct(id, optimistic = true) {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const getRequest = store.get(id);
        
        getRequest.onsuccess = async () => {
          const product = getRequest.result;
          
          const deleteRequest = store.delete(id);
          
          deleteRequest.onsuccess = async () => {
            console.log('Producto eliminado del cache:', id);
            resolve({ success: true });
          };
          
          deleteRequest.onerror = (event) => {
            reject(event.target.error);
          };
        };
        
        getRequest.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      throw error;
    }
  }

  // 🔹 Agregar operación a la cola de sincronización
  async addToSyncQueue(type, productId, data) {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([SYNC_STORE], 'readwrite');
        const store = transaction.objectStore(SYNC_STORE);
        
        const syncItem = {
          type,
          productId,
          data,
          status: 'pending',
          timestamp: Date.now(),
          attempts: 0,
          lastAttempt: null
        };
        
        const request = store.add(syncItem);
        
        request.onsuccess = () => {
          console.log(`📝 Operación ${type} agregada a cola: ${productId}`);
          resolve({ success: true, id: request.result });
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en addToSyncQueue:', error);
      throw error;
    }
  }

  // 🔹 Procesar cola de sincronización (SOLO CUANDO SE LLAMA)
  async processSyncQueue(apiCallbacks) {
    try {
      await this.init();
      
      console.log('🔄 Iniciando procesamiento de cola de sincronización...');
      
      // 1. Obtener items pendientes
      const pendingItems = await new Promise((resolve, reject) => {
        const transaction = this.db.transaction([SYNC_STORE], 'readonly');
        const store = transaction.objectStore(SYNC_STORE);
        const index = store.index('status');
        const request = index.getAll('pending');
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (event) => reject(event.target.error);
      });
      
      if (pendingItems.length === 0) {
        console.log('✅ No hay cambios pendientes para sincronizar');
        return { success: true, processed: 0, failed: 0 };
      }
      
      console.log(`📦 ${pendingItems.length} cambios pendientes encontrados`);
      
      let processed = 0;
      let failed = 0;
      
      // 2. Procesar cada item secuencialmente
      for (const item of pendingItems) {
        try {
          console.log(`🔧 Procesando: ${item.type} - ${item.productId}`);
          
          let apiSuccess = false;
          
          // Ejecutar operación en API
          try {
            if (item.type === 'update' && apiCallbacks.updateProduct) {
              await apiCallbacks.updateProduct(item.productId, item.data);
              apiSuccess = true;
            } else if (item.type === 'delete' && apiCallbacks.deleteProduct) {
              await apiCallbacks.deleteProduct(item.productId);
              apiSuccess = true;
            }
          } catch (apiError) {
            console.error(`❌ Error API para ${item.productId}:`, apiError.message);
            apiSuccess = false;
          }
          
          // 3. Actualizar o eliminar item según resultado
          if (apiSuccess) {
            // ELIMINAR item de la cola (ya sincronizado)
            await new Promise((resolve, reject) => {
              const transaction = this.db.transaction([SYNC_STORE], 'readwrite');
              const store = transaction.objectStore(SYNC_STORE);
              const deleteRequest = store.delete(item.id);
              
              deleteRequest.onsuccess = () => {
                console.log(`✅ Sincronizado y eliminado de cola: ${item.productId}`);
                processed++;
                resolve();
              };
              
              deleteRequest.onerror = (event) => {
                console.error('Error eliminando item:', event.target.error);
                // Si no se puede eliminar, al menos marcarlo como synced
                item.status = 'synced';
                store.put(item).onsuccess = () => {
                  processed++;
                  resolve();
                };
              };
            });
          } else {
            // Actualizar item con más intentos
            item.attempts = (item.attempts || 0) + 1;
            item.lastAttempt = Date.now();
            item.lastError = 'Error en API';
            
            if (item.attempts >= 3) {
              item.status = 'failed';
              console.warn(`⚠️  Cambio fallido después de ${item.attempts} intentos: ${item.productId}`);
            }
            
            await new Promise((resolve, reject) => {
              const transaction = this.db.transaction([SYNC_STORE], 'readwrite');
              const store = transaction.objectStore(SYNC_STORE);
              const updateRequest = store.put(item);
              
              updateRequest.onsuccess = () => resolve();
              updateRequest.onerror = (event) => reject(event.target.error);
            });
            
            failed++;
          }
          
        } catch (itemError) {
          console.error(`💥 Error procesando item ${item.id}:`, itemError);
          failed++;
        }
      }
      
      console.log(`📊 Resultado: ${processed} sincronizados, ${failed} fallidos`);
      return { 
        success: true, 
        processed, 
        failed,
        total: pendingItems.length
      };
      
    } catch (error) {
      console.error('💥 Error crítico en processSyncQueue:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔹 Verificar si el cache está fresco (menos de 5 minutos)
  async isCacheFresh(minutes = 5) {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('lastUpdated');
        
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

  // 🔹 Limpiar items fallidos antiguos
  async cleanupFailedItems(days = 7) {
    try {
      await this.init();
      
      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
      
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([SYNC_STORE], 'readwrite');
        const store = transaction.objectStore(SYNC_STORE);
        const index = store.index('lastAttempt');
        
        let deleted = 0;
        const request = index.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const item = cursor.value;
            
            if (item.status === 'failed' && item.lastAttempt < cutoffTime) {
              cursor.delete();
              deleted++;
            }
            
            cursor.continue();
          } else {
            if (deleted > 0) {
              console.log(`🧹 Limpiados ${deleted} items fallidos antiguos`);
            }
            resolve({ deleted });
          }
        };
        
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    } catch (error) {
      console.error('Error en cleanupFailedItems:', error);
      return { deleted: 0 };
    }
  }

  // 🔹 Obtener estadísticas del cache
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

  // 🔹 Estimar tamaño del cache
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

  // 🔹 Obtener hora de última actualización
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

  // 🔹 Vaciar completamente el cache
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

export const indexedDBService = new IndexedDBService();