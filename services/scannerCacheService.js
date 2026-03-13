// services/scannerCacheService.js - VERSIÓN COMPLETA
class ScannerCacheService {
  constructor() {
    this.DB_NAME = 'ScannerCache';
    this.STORE_NAME = 'products';
    this.DB_VERSION = 3; // ¡INCREMENTAR A 3 por el nuevo método!
    this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
    this.db = null;
    this.initPromise = null;
  }

  // Inicializar base de datos (una sola vez)
  async initDB() {
    if (this.db) return this.db;
    
    // Si ya estamos inicializando, esperar esa promesa
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        // console.log('✅ IndexedDB connected');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Eliminar store antigua si existe
        if (db.objectStoreNames.contains(this.STORE_NAME)) {
          db.deleteObjectStore(this.STORE_NAME);
        }
        
        // Crear nuevo store con índices
        const store = db.createObjectStore(this.STORE_NAME, { 
          keyPath: '_id' 
        });
        
        // Crear índices para búsqueda rápida
        store.createIndex('artikelName', 'artikelName', { unique: false });
        store.createIndex('artikelNumber', 'artikelNumber', { unique: true });
        store.createIndex('byTimestamp', 'cachedAt', { unique: false });
        
        // console.log('🆕 IndexedDB store created');
      };
    });

    return this.initPromise;
  }

  // Guardar productos en caché
  async cacheProducts(products) {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      
      const timestamp = Date.now();
      let count = 0;
      
      // Usar put en lugar de add para sobrescribir
      for (const product of products) {
        const productWithMeta = {
          ...product,
          cachedAt: timestamp,
          // Guardar solo lo necesario para escáner
          _id: product._id,
          artikelName: product.artikelName,
          artikelNumber: product.artikelNumber,
          price: product.price || 0,
          stock: product.stock || 0
        };
        
        await store.put(productWithMeta);
        count++;
      }
      
      // Eliminar timestamp anterior
      localStorage.removeItem('scanner_cache_timestamp');
      
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => {
          // console.log(`✅ Caché actualizado: ${count} productos`);
          resolve(count);
        };
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Error caching products:', error);
      return 0;
    }
  }

  // Obtener productos del caché
  async getCachedProducts(forceRefresh = false) {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      
      // Obtener todos los productos
      const products = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (products.length === 0) {
        return { products: [], fromCache: false };
      }
      
      // Verificar si algún producto está expirado
      const oldestCache = Math.min(...products.map(p => p.cachedAt || 0));
      const cacheAge = Date.now() - oldestCache;
      const isValid = cacheAge < this.CACHE_DURATION && !forceRefresh;
      
      if (!isValid && products.length > 0) {
        // console.log('🔄 Caché expirado, necesita recarga');
        return { products: [], fromCache: false };
      }
      
      // console.log(`📦 Usando caché: ${products.length} productos (${Math.round(cacheAge/1000/60)} minutos)`);
      return { products, fromCache: true };
      
    } catch (error) {
      console.error('Error getting cached products:', error);
      return { products: [], fromCache: false };
    }
  }

  // 🔥 NUEVO: Obtener productos instantáneamente (sin verificar expiración)
  async getCachedProductsInstant() {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      
      const products = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      return { products, fromCache: products.length > 0 };
    } catch (error) {
      return { products: [], fromCache: false };
    }
  }

  // Buscar producto por código de barras (¡búsqueda indexada!)
  async findProductByBarcode(barcode) {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const artikelNumberIndex = store.index('artikelNumber');
      
      // Búsqueda exacta por artikelNumber
      const product = await new Promise((resolve, reject) => {
        const request = artikelNumberIndex.get(barcode);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      return product || null;
      
    } catch (error) {
      console.error('Error searching product:', error);
      return null;
    }
  }

  // Buscar por nombre (índice de artikelName)
  async searchProductsByName(searchTerm) {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const nameIndex = store.index('artikelName');
      
      const range = IDBKeyRange.bound(
        searchTerm.toLowerCase(),
        searchTerm.toLowerCase() + '\uffff',
        false,
        false
      );
      
      const products = await new Promise((resolve, reject) => {
        const request = nameIndex.getAll(range);
        request.onsuccess = () => resolve(request.result.slice(0, 50));
        request.onerror = () => reject(request.error);
      });
      
      return products;
      
    } catch (error) {
      console.error('Error searching by name:', error);
      return [];
    }
  }

  // Limpiar caché antiguo
  async cleanOldCache() {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const timestampIndex = store.index('byTimestamp');
      
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const range = IDBKeyRange.upperBound(oneWeekAgo);
      
      const products = await new Promise((resolve, reject) => {
        const request = timestampIndex.getAll(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      for (const product of products) {
        store.delete(product._id);
      }
      
      // console.log(`🧹 Limpiados ${products.length} productos antiguos`);
      
    } catch (error) {
      console.error('Error cleaning cache:', error);
    }
  }

  // 🔥 NUEVO: Limpiar TODO el caché
  async clearCache() {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => {
          // console.log('🗑️ Caché de IndexedDB limpiado completamente');
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
      
      return true;
    } catch (error) {
      console.error('Error limpiando caché:', error);
      return false;
    }
  }

  // 🔥 NUEVO: Obtener producto por ID
  async getProductById(productId) {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      
      const product = await new Promise((resolve, reject) => {
        const request = store.get(productId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      return product || null;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }

  // Obtener estadísticas del caché
  async getCacheStats() {
    try {
      const db = await this.initDB();
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      
      const count = await new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      return { count };
      
    } catch (error) {
      return { count: 0 };
    }
  }
}

// Exportar singleton
export default new ScannerCacheService();