// services/scannerCacheService.js - VERSIÓN CORREGIDA
class ScannerCacheService {
  constructor() {
    this.dbName = 'scannerCache';
    this.dbVersion = 4; // Aumentar versión para forzar recreación
    this.db = null;
    this.initPromise = null;
  }

  async getDB() {
    if (this.db) return this.db;
    
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('Error opening IndexedDB');
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Eliminar store anterior para recrear con nuevos índices
        if (db.objectStoreNames.contains('products')) {
          db.deleteObjectStore('products');
        }
        
        // Crear store con todos los campos necesarios
        const store = db.createObjectStore('products', { keyPath: 'id' });
        store.createIndex('companyId', 'companyId', { unique: false });
        store.createIndex('artikelNumber', 'artikelNumber', { unique: false });
        store.createIndex('artikelName', 'artikelName', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        
        // console.log('📦 IndexedDB actualizado a versión 4');
      };
    });
    
    return this.initPromise;
  }

  async cacheProducts(products, companyId) {
    try {
      if (!companyId) {
        console.warn('⚠️ cacheProducts: companyId no proporcionado');
        return { success: false, error: 'companyId requerido' };
      }

      const db = await this.getDB();
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      
      const timestamp = Date.now();
      const stringCompanyId = String(companyId);
      
      // Limpiar productos antiguos
      // console.log(`🧹 Limpiando caché para empresa ${stringCompanyId}...`);
      
      const index = store.index('companyId');
      const range = IDBKeyRange.only(stringCompanyId);
      
      const keys = await new Promise((resolve, reject) => {
        const request = index.getAllKeys(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      // console.log(`📊 Eliminando ${keys.length} productos antiguos`);
      
      keys.forEach(key => {
        store.delete(key);
      });
      
      // Guardar nuevos productos con TODOS los campos
      // console.log(`💾 Guardando ${products.length} productos nuevos...`);
      
      for (const product of products) {
        const productId = product._id || `temp_${Date.now()}_${Math.random()}`;
        
        // Asegurar que lowStockThreshold existe
        const productToCache = {
          ...product,
          lowStockThreshold: product.lowStockThreshold !== undefined ? product.lowStockThreshold : null
        };
        
        store.put({
          id: `${stringCompanyId}_${productId}`,
          companyId: stringCompanyId,
          product: productToCache, // Guardar producto completo
          artikelNumber: product.artikelNumber || '',
          artikelName: product.artikelName || '',
          timestamp: timestamp
        });
      }
      
      await tx.complete;
      
      // console.log(`✅ Caché actualizado: ${products.length} productos para empresa ${companyId}`);
      // console.log(`   - Ejemplo: ${products[0]?.artikelName} tiene lowStockThreshold: ${products[0]?.lowStockThreshold}`);
      
      return { success: true, count: products.length, deleted: keys.length };
      
    } catch (error) {
      console.error('❌ Error caching products:', error);
      return { success: false, error };
    }
  }

  async getCachedProductsInstant(companyId) {
    try {
      if (!companyId) return { products: [], fromCache: false };

      const db = await this.getDB();
      const tx = db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const index = store.index('companyId');
      
      const stringCompanyId = String(companyId);
      const range = IDBKeyRange.only(stringCompanyId);
      
      const items = await new Promise((resolve, reject) => {
        const request = index.getAll(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const products = items.map(item => {
        // Verificar que lowStockThreshold está presente
        if (item.product.lowStockThreshold === undefined) {
          console.warn(`⚠️ Producto ${item.product.artikelName} no tiene lowStockThreshold, asignando null`);
          item.product.lowStockThreshold = null;
        }
        return item.product;
      });
      
      // Log para depuración
      const withThreshold = products.filter(p => p.lowStockThreshold > 0);
      // console.log(`📦 Caché cargado: ${products.length} productos, ${withThreshold.length} con umbral`);
      
      return {
        products: products,
        fromCache: true
      };
    } catch (error) {
      console.warn('Error getting cached products:', error);
      return { products: [], fromCache: false };
    }
  }

  // Resto de métodos igual...
  async clearAllCache() {
    try {
      const db = await this.getDB();
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      
      await store.clear();
      await tx.complete;
      
      // console.log('🧹 Caché de IndexedDB limpiado completamente');
      return { success: true };
    } catch (error) {
      console.error('Error limpiando caché:', error);
      return { success: false };
    }
  }

  async clearCompanyCache(companyId) {
    try {
      if (!companyId) return { success: false };

      const db = await this.getDB();
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      const index = store.index('companyId');
      
      const range = IDBKeyRange.only(String(companyId));
      
      const keys = await new Promise((resolve, reject) => {
        const request = index.getAllKeys(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      keys.forEach(key => {
        store.delete(key);
      });
      
      await tx.complete;
      // console.log(`🧹 Caché de empresa ${companyId} limpiado (${keys.length} registros)`);
      return { success: true, deletedCount: keys.length };
    } catch (error) {
      console.error('Error limpiando caché de empresa:', error);
      return { success: false };
    }
  }

  async removeProductsFromCache(productIds, companyId) {
    if (!productIds || productIds.length === 0 || !companyId) return false;
    
    try {
      const db = await this.getDB();
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      const index = store.index('companyId');
      
      const range = IDBKeyRange.only(String(companyId));
      const items = await new Promise((resolve, reject) => {
        const request = index.getAll(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const productsToKeep = items.filter(item => !productIds.includes(item.product._id));
      
      const keys = await new Promise((resolve, reject) => {
        const request = index.getAllKeys(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      keys.forEach(key => {
        store.delete(key);
      });
      
      for (const item of productsToKeep) {
        store.put(item);
      }
      
      await tx.complete;
      
      // console.log(`✅ Eliminados ${productIds.length} productos del caché`);
      return true;
    } catch (error) {
      console.error('Error removing products from cache:', error);
      return false;
    }
  }

  async findProductByBarcode(barcode, companyId) {
    try {
      if (!barcode || !companyId) return null;

      const db = await this.getDB();
      const tx = db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      
      const index = store.index('artikelNumber');
      const range = IDBKeyRange.only(String(barcode));
      
      const items = await new Promise((resolve, reject) => {
        const request = index.getAll(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const companyItem = items.find(item => item.companyId === String(companyId));
      
      return companyItem ? companyItem.product : null;
    } catch (error) {
      console.warn('Error finding product by barcode:', error);
      return null;
    }
  }

  async searchProductsByName(searchTerm, companyId) {
    try {
      if (!searchTerm || !companyId) return [];

      const term = searchTerm.toLowerCase();
      const db = await this.getDB();
      const tx = db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const index = store.index('companyId');
      
      const range = IDBKeyRange.only(String(companyId));
      
      const items = await new Promise((resolve, reject) => {
        const request = index.getAll(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      return items
        .filter(item => 
          item.product.artikelName?.toLowerCase().includes(term) ||
          item.product.artikelNumber?.toString().toLowerCase().includes(term)
        )
        .map(item => item.product)
        .slice(0, 50);
    } catch (error) {
      console.warn('Error searching products:', error);
      return [];
    }
  }

  async getCacheStats(companyId) {
    try {
      if (!companyId) return { count: 0 };

      const db = await this.getDB();
      const tx = db.transaction('products', 'readonly');
      const store = tx.objectStore('products');
      const index = store.index('companyId');
      
      const range = IDBKeyRange.only(String(companyId));
      
      const count = await new Promise((resolve, reject) => {
        const request = index.count(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      return { count };
    } catch (error) {
      console.warn('Error getting cache stats:', error);
      return { count: 0 };
    }
  }

  async cleanOldCache(companyId) {
    try {
      if (!companyId) return { success: false };

      const db = await this.getDB();
      const tx = db.transaction('products', 'readwrite');
      const store = tx.objectStore('products');
      const index = store.index('companyId');
      
      const range = IDBKeyRange.only(String(companyId));
      
      const items = await new Promise((resolve, reject) => {
        const request = index.getAll(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const oldTimestamp = Date.now() - (24 * 60 * 60 * 1000);
      let deletedCount = 0;
      
      items.forEach(item => {
        if (item.timestamp < oldTimestamp) {
          store.delete(item.id);
          deletedCount++;
        }
      });
      
      await tx.complete;
      
      return { success: true, deletedCount };
    } catch (error) {
      console.error('Error cleaning old cache:', error);
      return { success: false };
    }
  }
}

export default new ScannerCacheService();