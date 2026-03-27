// hooks/useProducts.js - VERSIÓN COMPLETA CON EVENTOS DE ACTUALIZACIÓN
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import scannerCache from '../services/scannerCacheService';
import { getProductLimits } from "../services/limitsService";
import { bulkImportProducts } from "../services/bulkImportService"; 

import { 
  getProductsPaginated,
  getAllProductsForScanner,
  createProductAPI,
  updateProductAPI,
  deleteProductImageAPI,
  deleteProductAPI,
} from "../services/productService";

// 🔥 CACHÉ EN MEMORIA POR EMPRESA
const memoryCaches = new Map(); // key: companyId

export const useProduct = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para productos del escáner
  const [scannerProducts, setScannerProducts] = useState([]);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState({ count: 0 });
  const [isCacheInitialized, setIsCacheInitialized] = useState(false);
  
  // ✅ ESTADOS PARA LÍMITES
  const [productLimits, setProductLimits] = useState({
    max: 0,
    current: 0,
    remaining: 0,
    percentage: 0
  });
  const [limitWarning, setLimitWarning] = useState(null);
  
  const { isAuthenticated, user } = useAuth();
  const companyId = user?.companyId || null;
  
  // Referencias
  const initialLoadDone = useRef(false);
  const prevCompanyIdRef = useRef(null);
  const dataFetchedRef = useRef(false);
  const fetchLimitsTimeoutRef = useRef(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1
  });
  
  // Estados para búsqueda y filtros
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('none');
  
  const [editingProduct, setEditingProductState] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isFetchingRef = useRef(false);

  // Obtener o crear caché para esta empresa
  const getCompanyMemoryCache = useCallback(() => {
    if (!companyId) return { products: [], timestamp: null, initialized: false };
    
    if (!memoryCaches.has(companyId)) {
      memoryCaches.set(companyId, {
        products: [],
        timestamp: null,
        initialized: false,
        companyId: companyId
      });
    }
    return memoryCaches.get(companyId);
  }, [companyId]);

  // ✅ NUEVA FUNCIÓN: Limpiar productos específicos del caché
  const clearProductsFromCache = useCallback(async (productIds) => {
    if (!companyId || !productIds || productIds.length === 0) return false;
    
    // console.log(`🧹 Limpiando ${productIds.length} productos del caché para empresa ${companyId}`);
    
    try {
      // 1. Limpiar caché en memoria
      const companyCache = getCompanyMemoryCache();
      if (companyCache.products.length > 0) {
        const filteredProducts = companyCache.products.filter(
          p => !productIds.includes(p._id)
        );
        companyCache.products = filteredProducts;
        // console.log(`📦 Caché en memoria: ${filteredProducts.length} productos restantes`);
      }
      
      // 2. Limpiar caché en IndexedDB
      await scannerCache.removeProductsFromCache(productIds, companyId);
      
      // 3. Actualizar scannerProducts en estado
      setScannerProducts(prevProducts => 
        prevProducts.filter(p => !productIds.includes(p._id))
      );
      
      // 4. Actualizar estadísticas de caché
      const stats = await scannerCache.getCacheStats(companyId);
      setCacheStats(stats);
      
      // console.log('✅ Productos eliminados del caché correctamente');+
      return true;
    } catch (error) {
      console.error('Error limpiando productos del caché:', error);
      return false;
    }
  }, [companyId, getCompanyMemoryCache]);

  // ✅ NUEVA FUNCIÓN: Limpiar todo el caché de la empresa
  const clearCompanyCache = useCallback(async () => {
    if (!companyId) return false;
    
    // console.log(`🧹 Limpiando todo el caché de empresa ${companyId}`);
    
    try {
      // 1. Limpiar caché en memoria
      const companyCache = getCompanyMemoryCache();
      companyCache.products = [];
      companyCache.timestamp = null;
      companyCache.initialized = false;
      
      // 2. Limpiar caché en IndexedDB
      await scannerCache.clearCompanyCache(companyId);
      
      // 3. Limpiar estado local
      setScannerProducts([]);
      setCacheStats({ count: 0 });
      setIsCacheInitialized(false);
      dataFetchedRef.current = false;
      
      // console.log('✅ Caché completo limpiado');
      return true;
    } catch (error) {
      console.error('Error limpiando caché completo:', error);
      return false;
    }
  }, [companyId, getCompanyMemoryCache]);

  // ✅ PRIMERO: Declarar updateProductInCache
  const updateProductInCache = useCallback(async (forceRefresh = true) => {
    if (!companyId) return false;
    
    // console.log(`🔄 Forzando actualización de caché para empresa ${companyId}...`);
    
    const companyCache = getCompanyMemoryCache();
    
    // Limpiar memoria caché de esta empresa
    companyCache.products = [];
    companyCache.timestamp = null;
    companyCache.initialized = false;
    
    // Limpiar estado local
    setScannerProducts([]);
    
    // Forzar recarga desde backend
    const result = await loadFromBackend(true);
    
    // console.log(`✅ Caché actualizado: ${result.length} productos para empresa ${companyId}`);
    return true;
  }, [companyId, getCompanyMemoryCache]);

  // ✅ SEGUNDO: Declarar loadFromBackend
  const loadFromBackend = useCallback(async (forceRefresh) => {
    if (!companyId) return [];
    
    setScannerLoading(true);
    
    try {
      // console.log(`🌐 Cargando desde backend para empresa ${companyId}...`);
      const data = await getAllProductsForScanner();
      
      if (data?.products?.length > 0) {
        // console.log(`📦 Cargando ${data.products.length} productos desde backend para empresa ${companyId}`);
        
        const companyCache = getCompanyMemoryCache();
        
        // Actualizar UI
        setScannerProducts(data.products);
        
        // Actualizar caché de memoria
        companyCache.products = [...data.products];
        companyCache.timestamp = Date.now();
        companyCache.initialized = true;
        
        // Guardar en IndexedDB
        scannerCache.cacheProducts(data.products, companyId).catch(console.warn);
        
        // Actualizar stats
        try {
          const stats = await scannerCache.getCacheStats(companyId);
          setCacheStats(stats);
        } catch (statsErr) {
          console.warn('Error obteniendo stats:', statsErr);
        }
        
        return data.products;
      }
      
      return [];
      
    } catch (err) {
      console.error('Error:', err);
      return [];
    } finally {
      setScannerLoading(false);
      dataFetchedRef.current = true;
    }
  }, [companyId, getCompanyMemoryCache]);

  // ✅ TERCERO: Declarar fetchProductLimits
  const fetchProductLimits = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !companyId) {
      // console.log('⏭️ No se pueden cargar límites: no autenticado o sin companyId');
      return;
    }
    
    // console.log(`📊 Cargando límites para empresa ${companyId}...`);
    
    try {
      const limits = await getProductLimits({ noCache: forceRefresh });
      
      if (limits) {
        // console.log('✅ Límites recibidos:', limits);
        
        const currentCount = totalProducts > 0 ? totalProducts : limits.current || 0;
        
        const updatedLimits = {
          max: limits.max,
          current: currentCount,
          remaining: limits.max - currentCount,
          percentage: Math.round((currentCount / limits.max) * 100)
        };
        
        // console.log('📊 Límites actualizados:', updatedLimits);
        setProductLimits(updatedLimits);
        
        if (updatedLimits.percentage >= 90) {
          setLimitWarning({
            type: 'CRITICAL',
            message: `⚠️ Estás usando el ${updatedLimits.percentage}% de tu límite (${updatedLimits.current}/${updatedLimits.max}).`
          });
        } else if (updatedLimits.percentage >= 75) {
          setLimitWarning({
            type: 'WARNING',
            message: `ℹ️ Has usado el ${updatedLimits.percentage}% de tu límite (${updatedLimits.current}/${updatedLimits.max}).`
          });
        } else {
          setLimitWarning(null);
        }
      }
    } catch (err) {
      console.error('Error fetching limits:', err);
    }
  }, [isAuthenticated, companyId, totalProducts]);

  // ✅ CUARTO: Declarar bulkImport
  const bulkImport = useCallback(async (productsArray) => {
    if (!isAuthenticated || !companyId) {
      setError('Debe iniciar sesión para importar productos');
      return { 
        success: false, 
        error: 'No autenticado',
        imported: 0,
        total: productsArray?.length || 0
      };
    }
    
    if (!productsArray || productsArray.length === 0) {
      setError('No hay productos para importar');
      return { 
        success: false, 
        error: 'Lista vacía',
        imported: 0,
        total: 0
      };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await bulkImportProducts(productsArray);
      
      setRefreshTrigger(prev => prev + 1);
      await fetchProductLimits(true);
      await updateProductInCache(true);
      
      return result;
    } catch (err) {
      console.error('Error in bulk import:', err);
      
      setError(err.message || 'Error en importación masiva');
      return { 
        success: false, 
        error: err.message,
        imported: 0,
        total: productsArray.length
      };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, companyId, fetchProductLimits, updateProductInCache]);

  // 🔥 DETECTAR CAMBIO DE EMPRESA
  useEffect(() => {
    const handleCompanyChange = async () => {
      // console.log('🔍 useEffect ejecutado - companyId:', companyId);
      // console.log('🔍 prevCompanyIdRef.current:', prevCompanyIdRef.current);
      
      if (prevCompanyIdRef.current && prevCompanyIdRef.current !== companyId) {
        // console.log(`🏢 EMPRESA CAMBIADA DETECTADA: ${prevCompanyIdRef.current} -> ${companyId}`);
        
        if (prevCompanyIdRef.current) {
          // console.log(`🧹 Intentando limpiar caché de empresa: ${prevCompanyIdRef.current}`);
          const result = await scannerCache.clearCompanyCache(prevCompanyIdRef.current);
          // console.log('🧹 Resultado de limpieza:', result);
        }
        
        setScannerProducts([]);
        setCacheStats({ count: 0 });
        setIsCacheInitialized(false);
        dataFetchedRef.current = false;
        initialLoadDone.current = false;
        
        const oldCache = memoryCaches.get(prevCompanyIdRef.current);
        if (oldCache) {
          oldCache.products = [];
          oldCache.timestamp = null;
          oldCache.initialized = false;
          // console.log('🧹 Memoria caché limpiada para empresa:', prevCompanyIdRef.current);
        }
      }
      
      prevCompanyIdRef.current = companyId;
    };
    
    if (companyId) {
      handleCompanyChange();
    } else {
      // console.log('⚠️ No hay companyId todavía');
    }
  }, [companyId]);

  // 🔥 CARGA INICIAL
  useEffect(() => {
    if (!isAuthenticated || !companyId) return;
    
    if (dataFetchedRef.current) return;
    
    const loadInitialData = async () => {
      // console.log(`🚀 Carga inicial para empresa: ${companyId}`);
      
      const companyCache = getCompanyMemoryCache();
      
      if (companyCache.products.length > 0) {
        console.log(`⚡ Usando caché en memoria: ${companyCache.products.length} productos`);
        setScannerProducts(companyCache.products);
        setCacheStats({ count: companyCache.products.length });
        setIsCacheInitialized(true);
        dataFetchedRef.current = true;
        return;
      }
      
      try {
        const stats = await scannerCache.getCacheStats(companyId);
        if (stats.count > 0) {
          console.log(`📦 Cargando desde IndexedDB: ${stats.count} productos`);
          const { products: cachedProducts } = await scannerCache.getCachedProductsInstant(companyId);
          if (cachedProducts.length > 0) {
            setScannerProducts(cachedProducts);
            companyCache.products = cachedProducts;
            companyCache.timestamp = Date.now();
            companyCache.initialized = true;
            setCacheStats(stats);
            setIsCacheInitialized(true);
            dataFetchedRef.current = true;
            
            setTimeout(() => loadFromBackend(true), 100);
            return;
          }
        }
      } catch (cacheErr) {
        console.warn('Error con IndexedDB:', cacheErr);
      }
      
      await loadFromBackend(true);
    };
    
    loadInitialData();
  }, [isAuthenticated, companyId, getCompanyMemoryCache, loadFromBackend]);

  // ✅ EFECTOS PARA LÍMITES
  useEffect(() => {
    if (isAuthenticated && companyId) {
      fetchProductLimits(true);
    }
  }, [isAuthenticated, companyId]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchProductLimits(true);
    }
  }, [refreshTrigger]);

  // ✅ ESCUCHAR EVENTOS DE LIMPIEZA DE CACHÉ Y ACTUALIZACIÓN
  useEffect(() => {
    if (!isAuthenticated || !companyId) return;
    
    const handleClearProductsFromCache = async (event) => {
      const { productIds } = event.detail || {};
      if (productIds && productIds.length > 0) {
        console.log('🧹 Evento clearProductsFromCache recibido:', productIds);
        await clearProductsFromCache(productIds);
      }
    };
    
    const handleClearCompanyCache = async (event) => {
      const { companyId: targetCompanyId } = event.detail || {};
      if (targetCompanyId === companyId) {
        console.log('🧹 Evento clearCompanyCache recibido para empresa:', companyId);
        await clearCompanyCache();
        await loadFromBackend(true);
      }
    };
    
    const handleRefreshScannerProducts = async () => {
      console.log('🔄 Evento refreshScannerProducts recibido');
      await updateProductInCache(true);
    };
    
    const handleRefreshLimits = (event) => {
      // console.log('🔄 Evento refreshProductLimits recibido', event);
      
      if (fetchLimitsTimeoutRef.current) {
        clearTimeout(fetchLimitsTimeoutRef.current);
      }
      
      fetchLimitsTimeoutRef.current = setTimeout(() => {
        // console.log('🔄 Ejecutando fetchProductLimits forzado...');
        fetchProductLimits(true);
        fetchLimitsTimeoutRef.current = null;
      }, 100);
    };
    
    // ✅ NUEVOS EVENTOS PARA ACTUALIZACIÓN DE STOCK Y PRODUCTOS
    const handleStockUpdated = async (event) => {
      // console.log('📦 Evento stockUpdated recibido:', event.detail);
      await updateProductInCache(true);
    };
    
    const handleProductUpdated = async (event) => {
      // console.log('✏️ Evento productUpdated recibido:', event.detail);
      await updateProductInCache(true);
      // setRefreshTrigger(prev => prev + 1);
    };
    
    const handleProductCreated = async (event) => {
      // console.log('✨ Evento productCreated recibido:', event.detail);
      await updateProductInCache(true);
      // setRefreshTrigger(prev => prev + 1);
    };
    
    const handleProductDeleted = async (event) => {
      // console.log('🗑️ Evento productDeleted recibido:', event.detail);
      await updateProductInCache(true);
      // setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('clearProductsFromCache', handleClearProductsFromCache);
    window.addEventListener('clearCompanyCache', handleClearCompanyCache);
    window.addEventListener('refreshScannerProducts', handleRefreshScannerProducts);
    window.addEventListener('refreshProductLimits', handleRefreshLimits);
    window.addEventListener('stockUpdated', handleStockUpdated);
    window.addEventListener('productUpdated', handleProductUpdated);
    window.addEventListener('productCreated', handleProductCreated);
    window.addEventListener('productDeleted', handleProductDeleted);
    
    return () => {
      window.removeEventListener('clearProductsFromCache', handleClearProductsFromCache);
      window.removeEventListener('clearCompanyCache', handleClearCompanyCache);
      window.removeEventListener('refreshScannerProducts', handleRefreshScannerProducts);
      window.removeEventListener('refreshProductLimits', handleRefreshLimits);
      window.removeEventListener('stockUpdated', handleStockUpdated);
      window.removeEventListener('productUpdated', handleProductUpdated);
      window.removeEventListener('productCreated', handleProductCreated);
      window.removeEventListener('productDeleted', handleProductDeleted);
      if (fetchLimitsTimeoutRef.current) {
        clearTimeout(fetchLimitsTimeoutRef.current);
      }
    };
  }, [isAuthenticated, companyId, clearProductsFromCache, clearCompanyCache, loadFromBackend, updateProductInCache, fetchProductLimits]);

  useEffect(() => {
    if (user?.companyId) {
      fetchProductLimits(true);
    }
  }, [user?.companyId]);

  // 🔥 VERSIÓN ULTRA RÁPIDA: Obtener productos para escáner
  const fetchAllProductsForScanner = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated || !companyId) {
      setScannerProducts([]);
      return [];
    }

    const companyCache = getCompanyMemoryCache();

    if (!forceRefresh && companyCache.products.length > 0) {
      // console.log(`⚡ Usando memoria para empresa ${companyId}: ${companyCache.products.length} productos`);
      setScannerProducts(companyCache.products);
      
      const cacheAge = Date.now() - (companyCache.timestamp || 0);
      if (cacheAge > 5 * 60 * 1000) {
        setTimeout(() => loadFromBackend(true), 100);
      }
       
      return companyCache.products;
    }

    return loadFromBackend(forceRefresh);
  }, [isAuthenticated, companyId, getCompanyMemoryCache, loadFromBackend]);

  // Función para construir query params
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', itemsPerPage);
    
    if (activeSearch) {
      params.append('search', activeSearch);
      params.append('searchType', 'contains');
    }
    
    if (stockFilter !== 'all') {
      params.append('stockFilter', stockFilter);
    }
    
    if (sortOrder !== 'none') {
      params.append('sortBy', 'stock');
      params.append('sortOrder', sortOrder);
    }
    
    return params;
  }, [currentPage, itemsPerPage, activeSearch, stockFilter, sortOrder]);

  // Función para obtener productos paginados
  const fetchProductsPaginated = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) {
      setProducts([]);
      setTotalProducts(0);
      setTotalInventoryValue(0);
      return;
    }

    if (isFetchingRef.current && !forceRefresh) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const params = buildQueryParams();
      
      const data = await getProductsPaginated(params);
      
      setProducts(data.products || []);
      setTotalProducts(data.pagination?.total || 0);
      setTotalInventoryValue(data.totalInventoryValue || 0);
      setPaginationInfo(data.pagination || {
        total: 0,
        page: currentPage,
        limit: itemsPerPage,
        pages: 1
      });
      setTotalPages(data.pagination?.pages || 1);
      
      if (data.pagination?.total !== undefined) {
        await fetchProductLimits(true);
      }
      
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = err?.message || 'Error desconocido al cargar productos';
      setError(errorMessage);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated, buildQueryParams, fetchProductLimits]);

  // Cargar productos paginados
  useEffect(() => {
    if (isAuthenticated) {
      fetchProductsPaginated();
    }
  }, [isAuthenticated, currentPage, activeSearch, stockFilter, sortOrder, refreshTrigger]);

  // 🔥 Búsqueda instantánea
  const findProductInCache = useCallback(async (barcode) => {
    if (!barcode || !companyId) return null;
    
    const companyCache = getCompanyMemoryCache();
    const searchTerm = barcode.toLowerCase().trim();
    
    let product = companyCache.products.find(p => 
      p.artikelNumber?.toString().toLowerCase() === searchTerm
    );
    
    if (!product) {
      try {
        product = await scannerCache.findProductByBarcode(searchTerm, companyId);
      } catch (error) {
        console.warn('Error en IndexedDB:', error);
      }
    }
    
    return product;
  }, [companyId, getCompanyMemoryCache]);

  // 🔥 Búsqueda por nombre
  const searchProductsInCache = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2 || !companyId) return [];
    
    const companyCache = getCompanyMemoryCache();
    const term = searchTerm.toLowerCase();
    
    return companyCache.products.filter(p => 
      p.artikelName?.toLowerCase().includes(term) ||
      p.artikelNumber?.toString().toLowerCase().includes(term)
    ).slice(0, 20);
  }, [companyId, getCompanyMemoryCache]);

  // Limpiar caché antiguo
  const cleanScannerCache = useCallback(async () => {
    if (!companyId) return false;
    
    try {
      await scannerCache.cleanOldCache(companyId);
      const stats = await scannerCache.getCacheStats(companyId);
      setCacheStats(stats);
      return true;
    } catch (error) {
      console.error('Error limpiando caché:', error);
      return false;
    }
  }, [companyId]);

  // ✅ Crear producto
async function createProduct(productData) {
  if (!isAuthenticated || !companyId) {
    setError('Debe iniciar sesión para crear productos');
    return { success: false, error: 'No autenticado' };
  }
  
  if (productLimits.remaining <= 0) {
    setError(`❌ Límite de artículos alcanzado (${productLimits.max})`);
    return { 
      success: false, 
      error: 'Límite alcanzado',
      limitError: true,
      limits: productLimits
    };
  }
  
  setLoading(true);
  setError(null);
  
  try {
    const productToCreate = {
      artikelName: productData.artikelName.trim(),
      lagerPlatz: productData.lagerPlatz || "",
      artikelNumber: productData.artikelNumber || "",
      description: productData.description || "",
      stock: productData.stock === '' ? 0 : Number(productData.stock || 0),
      price: productData.price === '' ? 0 : Number(productData.price || 0),
      lowStockThreshold: productData.lowStockThreshold !== undefined ? productData.lowStockThreshold : null
    };
    
    if (productData.imagen && productData.imagen instanceof File) {
      productToCreate.imagen = productData.imagen;
    }
    
    const created = await createProductAPI(productToCreate);
    
    // ✅ ELIMINAR ESTE setRefreshTrigger
    // setRefreshTrigger(prev => prev + 1); // ❌ ELIMINAR
    
    const storedProducts = localStorage.getItem('currentProducts');
    const currentProducts = storedProducts ? JSON.parse(storedProducts) : [];
    currentProducts.push(created.product || created);
    localStorage.setItem('currentProducts', JSON.stringify(currentProducts));
    
    // ✅ Actualizar caché
    await updateProductInCache(true);
    await fetchProductLimits(true);
    
    // ✅ DISPARAR EVENTO DE PRODUCTO CREADO (este hará el refresh)
    window.dispatchEvent(new CustomEvent('productCreated', { 
      detail: { 
        product: created?.product || created 
      } 
    }));
    
    return { 
      success: true, 
      product: created?.product || created,
      limits: created.limits
    };
    
  } catch (err) {
    console.error('Error creating product:', err);
    
    if (err.type === 'LIMIT_ERROR') {
      setError(err.message);
      setProductLimits(err.limits);
      return { 
        success: false, 
        error: err.message,
        limitError: true,
        limits: err.limits
      };
    }
    
    const errorMessage = err?.message || 'Unbekannter Fehler';
    setError(errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  } finally {
    setLoading(false);
  }
}

  // ✅ Actualizar producto
  async function updateProduct(productId, updatedProduct) {
    if (!isAuthenticated || !companyId) {
      setError('Debe iniciar sesión para actualizar productos');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updated = await updateProductAPI(productId, updatedProduct);
      
      setRefreshTrigger(prev => prev + 1);
      await updateProductInCache(true);
      
      // ✅ DISPARAR EVENTO DE PRODUCTO ACTUALIZADO
      window.dispatchEvent(new CustomEvent('productUpdated', { 
        detail: { 
          productId: productId,
          product: updated?.product || updated 
        } 
      }));
      
      return { 
        success: true, 
        product: updated?.product || updated 
      };
    } catch (err) {
      console.error('Error updating product:', err);
      const errorMessage = err?.message || 'Error al actualizar producto';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }

  // ✅ Eliminar imagen
  async function deleteProductImage(id) {
    if (!isAuthenticated || !companyId) {
      setError('Debe iniciar sesión para eliminar imágenes');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteProductImageAPI(id);
      setRefreshTrigger(prev => prev + 1);
      await updateProductInCache(true);
      
      // ✅ DISPARAR EVENTO DE PRODUCTO ACTUALIZADO (imagen eliminada)
      window.dispatchEvent(new CustomEvent('productUpdated', { 
        detail: { 
          productId: id,
          updatedField: 'image' 
        } 
      }));
      
      return { success: true, result };
    } catch (err) {
      console.error('Error deleting product image:', err);
      const errorMessage = err?.message || 'Error al eliminar imagen';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }

  // ✅ Eliminar producto
  async function deleteProduct(id) {
    if (!isAuthenticated || !companyId) {
      setError('Debe iniciar sesión para eliminar productos');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteProductAPI(id);
      
      // ✅ LIMPIAR ESTE PRODUCTO DEL CACHÉ
      await clearProductsFromCache([id]);
      
      const storedProducts = localStorage.getItem('currentProducts');
      if (storedProducts) {
        const currentProducts = JSON.parse(storedProducts);
        const updatedProducts = currentProducts.filter(p => p._id !== id);
        localStorage.setItem('currentProducts', JSON.stringify(updatedProducts));
      }
      
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        setRefreshTrigger(prev => prev + 1);
      }
      
      await fetchProductLimits(true);
      
      // ✅ DISPARAR EVENTO DE PRODUCTO ELIMINADO
      window.dispatchEvent(new CustomEvent('productDeleted', { 
        detail: { 
          productId: id 
        } 
      }));
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      const errorMessage = err?.message || 'Error al eliminar producto';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }

  // ✅ Eliminar múltiples productos
  async function deleteMultipleProducts(productIds) {
    if (!isAuthenticated || !companyId) {
      setError('Debe iniciar sesión para eliminar productos');
      return { success: false, error: 'No autenticado' };
    }
    
    if (!productIds || productIds.length === 0) {
      return { success: false, error: 'No hay productos para eliminar' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await Promise.allSettled(
        productIds.map(id => deleteProductAPI(id))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      // ✅ LIMPIAR TODOS LOS PRODUCTOS ELIMINADOS DEL CACHÉ
      await clearProductsFromCache(productIds);
      
      const storedProducts = localStorage.getItem('currentProducts');
      if (storedProducts) {
        const currentProducts = JSON.parse(storedProducts);
        const updatedProducts = currentProducts.filter(p => !productIds.includes(p._id));
        localStorage.setItem('currentProducts', JSON.stringify(updatedProducts));
      }
      
      if (products.length === productIds.length && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        setRefreshTrigger(prev => prev + 1);
      }
      
      await fetchProductLimits(true);
      
      // ✅ DISPARAR EVENTO DE PRODUCTOS ELIMINADOS
      productIds.forEach(id => {
        window.dispatchEvent(new CustomEvent('productDeleted', { 
          detail: { 
            productId: id 
          } 
        }));
      });
      
      return { 
        success: true, 
        deleted: successful,
        failed: failed
      };
    } catch (err) {
      console.error('Error deleting multiple products:', err);
      const errorMessage = err?.message || 'Error al eliminar productos';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }

  // ✅ Setear producto para edición
  const setProductToEdit = (product) => {
    setEditingProductState(product ? {...product} : null);
  };

  // ✅ Funciones para cambiar página
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const confirmSearch = () => {
    setActiveSearch(searchInput);
    setCurrentPage(1);
  };

  const setStock = (filter) => {
    setStockFilter(filter);
    setCurrentPage(1);
  };

  const setSort = (order) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchInput('');
    setActiveSearch('');
    setStockFilter('all');
    setSortOrder('none');
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  const refreshProducts = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    if (companyId) {
      updateProductInCache(true);
    }
  }, [companyId, updateProductInCache]);

  const clearError = () => {
    setError(null);
  };

  const forceRefreshLimits = useCallback(() => {
    // console.log('🔄 Forzando actualización de límites...');
    fetchProductLimits(true);
  }, [fetchProductLimits]);

  return {
    // Limpieza
    clearProductsFromCache,
    clearCompanyCache,
    
    // Productos paginados
    products,
    editingProduct,
    totalProducts,
    totalInventoryValue,
    loading,
    error,
    
    // Productos para escáner
    scannerProducts,
    scannerLoading,
    cacheStats,
    isCacheInitialized,
    
    // Métodos para escáner
    fetchAllProductsForScanner,
    findProductInCache,
    searchProductsInCache,
    cleanScannerCache,
    updateProductInCache,
    
    // ✅ Límites
    productLimits,
    limitWarning,
    fetchProductLimits,
    forceRefreshLimits,
    bulkImport,
    
    // Paginación
    currentPage,
    totalPages,
    itemsPerPage,
    paginationInfo,
    goToPage,
    nextPage,
    prevPage,
    
    // Filtros y búsqueda
    searchInput,
    activeSearch,
    stockFilter,
    sortOrder,
    setSearchInput,
    confirmSearch,
    setStock,
    setSort,
    resetFilters,
    clearSearch,
    
    // Acciones
    createProduct,
    updateProduct,
    deleteProductImage,
    deleteProduct,
    deleteMultipleProducts,
    setProductToEdit,
    refreshProducts,
    clearError,
    isAuthenticated,
    companyId
  };
};