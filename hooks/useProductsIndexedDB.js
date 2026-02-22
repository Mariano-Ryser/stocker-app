// hooks/useProduct.js - VERSIÓN REACTIVA SIN POLLING (CORREGIDA)
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import {
  getProducts,
  createProductAPI,
  updateProductAPI,
  deleteProductImageAPI,
  deleteProductAPI,
  refreshCache,
  getCacheStats
} from "../services/productService";
import { indexedDBService } from "../services/indexedDBService";

export const useProduct = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  
  const [editingProduct, setEditingProductState] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [syncStatus, setSyncStatus] = useState({ 
    pending: 0, 
    synced: true,
    lastSync: null 
  });
  
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const onlineStatusRef = useRef(navigator.onLine);
  const syncInProgressRef = useRef(false);

  // 🔹 Obtener productos (definir PRIMERO para que esté disponible)
  const fetchProducts = useCallback(async (forceRefresh = false, useCache = true) => {
    if (!isAuthenticated) {
      setProducts([]);
      setTotalProducts(0);
      setTotalInventoryValue(0);
      hasFetchedRef.current = false;
      return;
    }

    if (isFetchingRef.current && !forceRefresh) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📥 ${forceRefresh ? 'Forzando refresh' : 'Obteniendo'} productos...`);
      const data = await getProducts(useCache, forceRefresh);
      
      if (data && typeof data === 'object') {
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
        setTotalInventoryValue(data.totalInventoryValue || 0);
        
        setCacheInfo({
          fromCache: data.fromCache || false,
          isFallback: data.isFallback || false,
          cacheTimestamp: data.cacheTimestamp,
          total: data.products?.length || 0
        });
      }
      
      hasFetchedRef.current = true;
      console.log('✅ Productos cargados', data?.fromCache ? '(desde cache)' : '(desde API)');
      
    } catch (err) {
      console.error('❌ Error cargando productos:', err);
      setError(err.message);
      
      // Fallback a cache local
      try {
        const cachedProducts = await indexedDBService.getAllProducts();
        if (cachedProducts.length > 0) {
          console.log('📦 Usando cache como fallback total');
          setProducts(cachedProducts);
          setTotalProducts(cachedProducts.length);
          setCacheInfo({
            fromCache: true,
            isFallback: true,
            cacheTimestamp: Date.now(),
            total: cachedProducts.length
          });
        }
      } catch (cacheError) {
        console.error('Error cargando desde cache:', cacheError);
      }
      
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated]);

  // 🔹 Obtener contador de cambios pendientes (solo para UI)
  const updatePendingCount = useCallback(async () => {
    if (!isAuthenticated) return 0;
    
    try {
      const count = await indexedDBService.getPendingCount();
      setSyncStatus(prev => ({
        ...prev,
        pending: count,
        synced: count === 0
      }));
      return count;
    } catch (error) {
      console.warn('Error obteniendo contador pendiente:', error);
      return 0;
    }
  }, [isAuthenticated]);

  // 🔹 Forzar sincronización MANUAL (definir DESPUÉS de fetchProducts)
  const forceSync = useCallback(async () => {
    if (!isAuthenticated) {
      console.warn('⚠️  No autenticado, no se puede sincronizar');
      return { success: false, error: 'No autenticado' };
    }
    
    // Prevenir múltiples sincronizaciones simultáneas
    if (syncInProgressRef.current) {
      console.log('⏳ Sincronización ya en progreso, esperando...');
      return { success: false, error: 'Sincronización en progreso' };
    }
    
    syncInProgressRef.current = true;
    setLoading(true);
    console.log('🔄 Iniciando sincronización manual...');
    
    try {
      const result = await indexedDBService.processSyncQueue({
        updateProduct: updateProductAPI,
        deleteProduct: deleteProductAPI
      });
      
      console.log(`📊 Sincronización completada:`, result);
      
      // Actualizar productos si hubo cambios
      if (result.processed > 0) {
        await fetchProducts(false, true); // Recargar con cache
      }
      
      // Actualizar estado
      await updatePendingCount();
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date().toISOString()
      }));
      
      return result;
      
    } catch (error) {
      console.error('💥 Error en sincronización:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
      syncInProgressRef.current = false;
    }
  }, [isAuthenticated, fetchProducts, updatePendingCount]);

  // 🔹 Verificar cambios pendientes periódicamente (SOLO para UI, no acción)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Verificar cada 60 segundos solo para actualizar UI
    const interval = setInterval(() => {
      updatePendingCount();
    }, 60000);
    
    // Verificar inicialmente
    updatePendingCount();
    
    return () => clearInterval(interval);
  }, [isAuthenticated, updatePendingCount]);

  // 🔹 Detectar cambios en conexión a internet
  useEffect(() => {
    const handleOnline = async () => {
      console.log('✅ Conexión a internet recuperada');
      onlineStatusRef.current = true;
      
      // Actualizar contador
      const pendingCount = await updatePendingCount();
      
      // Solo sincronizar si hay cambios pendientes y no hay otra sincronización en curso
      if (pendingCount > 0 && !syncInProgressRef.current) {
        console.log(`🔄 Sincronizando ${pendingCount} cambios pendientes automáticamente...`);
        await forceSync();
      }
    };
    
    const handleOffline = () => {
      console.log('⚠️  Sin conexión a internet');
      onlineStatusRef.current = false;
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updatePendingCount, forceSync]);

  // 🔹 Crear producto
  async function createProduct(productData) {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para crear productos');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🆕 Creando producto...');
      
      if (!productData.artikelName || productData.artikelName.trim() === '') {
        throw new Error('Artikel Name ist erforderlich');
      }
      
      const productToCreate = {
        artikelName: productData.artikelName.trim(),
        lagerPlatz: productData.lagerPlatz || "",
        artikelNumber: productData.artikelNumber || "",
        description: productData.description || "",
        stock: productData.stock === '' ? 0 : Number(productData.stock || 0),
        price: productData.price === '' ? 0 : Number(productData.price || 0),
      };
      
      if (productData.imagen && productData.imagen instanceof File) {
        productToCreate.imagen = productData.imagen;
      }
      
      // SI ESTAMOS ONLINE
      if (navigator.onLine) {
        const created = await createProductAPI(productToCreate);
        
        if (created.product) {
          // Actualizar cache local
          await indexedDBService.updateProduct(created.product, false);
          
          // Actualizar estado local
          setProducts(prev => [...prev, created.product]);
          setRefreshTrigger(prev => prev + 1);
          
          console.log('✅ Producto creado exitosamente (online)');
          return { success: true, product: created.product };
        }
      } 
      // SI ESTAMOS OFFLINE
      else {
        console.log('📴 Modo offline: guardando en cola de sincronización');
        
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tempProduct = {
          ...productToCreate,
          _id: tempId,
          isTemp: true,
          createdAt: new Date().toISOString()
        };
        
        // Guardar en cache local
        await indexedDBService.updateProduct(tempProduct, false);
        
        // Agregar a cola de sincronización
        await indexedDBService.addToSyncQueue('create', tempId, tempProduct);
        
        // Actualizar estado local
        setProducts(prev => [...prev, tempProduct]);
        
        // Actualizar contador de pendientes
        await updatePendingCount();
        
        console.log('📦 Producto guardado localmente (offline)');
        return { 
          success: true, 
          product: tempProduct,
          offline: true 
        };
      }
      
    } catch (err) {
      console.error('❌ Error creando producto:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Actualizar producto
  async function updateProduct(productId, updatedProduct) {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para actualizar productos');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`✏️  Actualizando producto: ${updatedProduct.artikelName}`);
      
      // SI ESTAMOS ONLINE
      if (navigator.onLine) {
        const updated = await updateProductAPI(productId, updatedProduct);
        
        if (updated.product) {
          // Actualizar cache local
          await indexedDBService.updateProduct(updated.product, false);
          
          // Actualizar estado local
          setProducts(prev =>
            prev.map((p) => (p._id === updated.product._id ? updated.product : p))
          );
          
          console.log('✅ Producto actualizado exitosamente (online)');
          return { success: true, product: updated.product };
        }
      } 
      // SI ESTAMOS OFFLINE
      else {
        console.log('📴 Modo offline: guardando actualización en cola');
        
        // Guardar cambio optimista en cache
        await indexedDBService.updateProduct({
          ...updatedProduct,
          _id: productId
        }, true);
        
        // Agregar a cola de sincronización
        await indexedDBService.addToSyncQueue('update', productId, updatedProduct);
        
        // Actualizar UI optimísticamente
        setProducts(prev =>
          prev.map((p) => (p._id === productId ? { ...p, ...updatedProduct } : p))
        );
        
        // Actualizar contador
        await updatePendingCount();
        
        console.log('📦 Actualización guardada localmente (offline)');
        return { 
          success: true, 
          product: updatedProduct,
          offline: true 
        };
      }
      
    } catch (err) {
      console.error('❌ Error actualizando producto:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Eliminar producto
  async function deleteProduct(id) {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar productos');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🗑️  Eliminando producto: ${id}`);
      
      // SI ESTAMOS ONLINE
      if (navigator.onLine) {
        await deleteProductAPI(id);
        
        // Eliminar de cache local
        await indexedDBService.deleteProduct(id, false);
        
        // Actualizar estado local
        setProducts(prev => prev.filter((p) => p._id !== id));
        
        console.log('✅ Producto eliminado exitosamente (online)');
        return { success: true };
      } 
      // SI ESTAMOS OFFLINE
      else {
        console.log('📴 Modo offline: guardando eliminación en cola');
        
        const productToDelete = products.find(p => p._id === id);
        
        if (productToDelete) {
          // Eliminar optimista de cache
          await indexedDBService.deleteProduct(id, true);
          
          // Agregar a cola de sincronización
          await indexedDBService.addToSyncQueue('delete', id, productToDelete);
          
          // Actualizar UI optimísticamente
          setProducts(prev => prev.filter((p) => p._id !== id));
          
          // Actualizar contador
          await updatePendingCount();
          
          console.log('📦 Eliminación guardada localmente (offline)');
          return { 
            success: true,
            offline: true 
          };
        }
      }
      
    } catch (err) {
      console.error('❌ Error eliminando producto:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Eliminar imagen del producto
  async function deleteProductImage(id) {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar imágenes');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    try {
      const result = await deleteProductImageAPI(id);
      
      // Actualizar producto en cache local
      try {
        await indexedDBService.updateProduct({
          _id: id,
          imagen: "",
          publicId: ""
        }, false);
      } catch (cacheError) {
        console.warn('Error actualizando caché:', cacheError);
      }
      
      // Actualizar estado local
      setProducts(prev =>
        prev.map((p) =>
          p._id === id ? { ...p, imagen: "", publicId: "" } : p
        )
      );
      
      return { 
        success: true, 
        result 
      };
    } catch (err) {
      console.error('Error deleting product image:', err);
      setError(err.message);
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Inicialización
  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      console.log('🚀 Inicializando sistema de productos...');
      fetchProducts();
    }
    
    return () => {
      if (!isAuthenticated) {
        setProducts([]);
        setTotalProducts(0);
        setTotalInventoryValue(0);
        hasFetchedRef.current = false;
        setCacheInfo(null);
        setSyncStatus({ pending: 0, synced: true, lastSync: null });
      }
    };
  }, [isAuthenticated, fetchProducts]);

  // 🔹 Refrescar productos manualmente
  const refreshProducts = useCallback(() => {
    console.log('🔄 Forzando refresh de productos...');
    hasFetchedRef.current = false;
    fetchProducts(true);
    setRefreshTrigger(prev => prev + 1);
  }, [fetchProducts]);

  // 🔹 Setear producto para edición
  const setProductToEdit = (product) => {
    setEditingProductState({...product});
  };

  // 🔹 Limpiar error
  const clearError = () => {
    setError(null);
  };

  return {
    // Estado
    products,
    editingProduct,
    totalProducts,
    totalInventoryValue,
    loading,
    error,
    refreshTrigger,
    cacheInfo,
    syncStatus,
    
    // Funciones
    setError: clearError,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProductImage,
    deleteProduct,
    setProductToEdit,
    refreshProducts,
    forceSync, // ← Sincronización MANUAL
    updatePendingCount, // ← Actualizar contador
    isAuthenticated
  };
};