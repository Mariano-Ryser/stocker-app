// hooks/useProduct.js - VERSIÓN CON CACHÉ EN MEMORIA + INDEXEDDB
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import scannerCache from '../services/scannerCacheService';

import { 
  getProductsPaginated,
  getAllProductsForScanner,
  createProductAPI,
  updateProductAPI,
  deleteProductImageAPI,
  deleteProductAPI,
} from "../services/productService";

// 🔥 CACHÉ EN MEMORIA GLOBAL (persiste entre renders)
let memoryCache = {
  products: [],
  timestamp: null,
  initialized: false
};

export const useProduct = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para productos del escáner
  const [scannerProducts, setScannerProducts] = useState(memoryCache.products || []); // ← ¡INICIALIZAR CON MEMORIA!
  const [scannerLoading, setScannerLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState({ count: memoryCache.products.length });
  const [isCacheInitialized, setIsCacheInitialized] = useState(memoryCache.initialized);
  
  const { isAuthenticated } = useAuth();
  
  // Referencia para evitar loops
  const initialLoadDone = useRef(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
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

  // 🔥 PASO 1: Mostrar caché en memoria INMEDIATAMENTE
  useEffect(() => {
    if (memoryCache.products.length > 0) {
      // console.log(`⚡ Caché en memoria: ${memoryCache.products.length} productos (instantáneo)`);
      setScannerProducts(memoryCache.products);
      setCacheStats({ count: memoryCache.products.length });
    }
  }, []);

  // 🔥 PASO 2: Inicializar IndexedDB en segundo plano
  useEffect(() => {
    const initializeCache = async () => {
      if (!isAuthenticated || isCacheInitialized) return;
      
      try {
        // Obtener estadísticas sin bloquear
        const stats = await scannerCache.getCacheStats();
        setCacheStats(stats);
        
        // Si no hay memoria pero hay IndexedDB, cargar de IndexedDB
        if (memoryCache.products.length === 0 && stats.count > 0) {
          const { products: cachedProducts } = await scannerCache.getCachedProductsInstant();
          if (cachedProducts.length > 0) {
            // console.log(`📦 Cargando desde IndexedDB: ${cachedProducts.length} productos`);
            setScannerProducts(cachedProducts);
            memoryCache = {
              products: cachedProducts,
              timestamp: Date.now(),
              initialized: true
            };
          }
        }
        
        memoryCache.initialized = true;
        setIsCacheInitialized(true);
      } catch (cacheErr) {
        console.warn('Error en inicialización de caché:', cacheErr);
        setIsCacheInitialized(true);
      }
    };
    
    initializeCache();
  }, [isAuthenticated, isCacheInitialized]);

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
      
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = err?.message || 'Error desconocido al cargar productos';
      setError(errorMessage);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated, buildQueryParams, currentPage, activeSearch]);

  // 🔥 VERSIÓN ULTRA RÁPIDA: Obtener productos para escáner
  const fetchAllProductsForScanner = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) {
      setScannerProducts([]);
      return [];
    }

    // 🚀 Si ya tenemos memoria y no es force refresh, usar memoria
    if (!forceRefresh && memoryCache.products.length > 0) {
      // console.log(`⚡ Usando memoria: ${memoryCache.products.length} productos`);
      setScannerProducts(memoryCache.products);
      
      // Actualizar en segundo plano si el caché es viejo (> 5 minutos)
      const cacheAge = Date.now() - (memoryCache.timestamp || 0);
      if (cacheAge > 5 * 60 * 1000 && !initialLoadDone.current) {
        initialLoadDone.current = true;
        
        // Cargar en segundo plano sin await
        setTimeout(() => {
          loadFromBackendInBackground();
        }, 100);
      }
      
      return memoryCache.products;
    }

    // Si no hay memoria o force refresh, cargar
    return loadFromBackend(forceRefresh);
  }, [isAuthenticated]);

  // Función para cargar del backend (bloqueante)
  const loadFromBackend = useCallback(async (forceRefresh) => {
    setScannerLoading(true);
    
    try {
      // Intentar de IndexedDB primero (si no es force refresh)
      if (!forceRefresh) {
        try {
          const { products: cachedProducts } = await scannerCache.getCachedProductsInstant();
          if (cachedProducts.length > 0) {
            // console.log(`📦 IndexedDB: ${cachedProducts.length} productos`);
            setScannerProducts(cachedProducts);
            
            // Actualizar memoria
            memoryCache = {
              products: cachedProducts,
              timestamp: Date.now(),
              initialized: true
            };
            
            // Cargar backend en segundo plano si es necesario
            const { fromCache } = await scannerCache.getCachedProducts();
            if (!fromCache) {
              loadFromBackendInBackground();
            }
            
            return cachedProducts;
          }
        } catch (cacheErr) {
          console.warn('Error leyendo IndexedDB:', cacheErr);
        }
      }

      // Si no hay nada, cargar del backend
      // console.log('🌐 Cargando desde backend...');
      const data = await getAllProductsForScanner();
      
     if (data?.products?.length > 0) {
  // console.log(`📦 Cargando ${data.products.length} productos desde backend`);
  setScannerProducts(data.products);
  
  // ACTUALIZAR: Asegurar que memoryCache se actualice correctamente
  memoryCache = {
    products: [...data.products], // Crear una copia para evitar referencias
    timestamp: Date.now(),
    initialized: true
  };
  
  // Guardar en IndexedDB en segundo plano
  scannerCache.cacheProducts(data.products).catch(console.warn);
  
  // Actualizar stats
  try {
    const stats = await scannerCache.getCacheStats();
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
    }
  }, []);

  // Función para cargar en segundo plano (no bloqueante)
  const loadFromBackendInBackground = useCallback(async () => {
    try {
      // console.log('🔄 Actualizando caché en segundo plano...');
      const data = await getAllProductsForScanner();
      
      if (data?.products?.length > 0) {
        // Actualizar UI
        setScannerProducts(data.products);
        
        // Actualizar memoria
        memoryCache = {
          products: data.products,
          timestamp: Date.now(),
          initialized: true
        };
        
        // Guardar en IndexedDB
        await scannerCache.cacheProducts(data.products);
        
        // console.log(`✅ Caché actualizado: ${data.products.length} productos`);
      }
    } catch (err) {
      console.warn('Error actualizando caché en segundo plano:', err);
    }
  }, []);

  // 🔥 Búsqueda instantánea (primero memoria, luego IndexedDB)
  const findProductInCache = useCallback(async (barcode) => {
    if (!barcode) return null;
    
    const searchTerm = barcode.toLowerCase().trim();
    
    // 1. Buscar en memoria PRIMERO (instantáneo)
    let product = memoryCache.products.find(p => 
      p.artikelNumber?.toString().toLowerCase() === searchTerm
    );
    
    // 2. Si no, buscar en IndexedDB (un poco más lento)
    if (!product) {
      try {
        product = await scannerCache.findProductByBarcode(searchTerm);
      } catch (error) {
        console.warn('Error en IndexedDB:', error);
      }
    }
    
    // 3. Último recurso: búsqueda parcial en memoria
    if (!product) {
      product = memoryCache.products.find(p => 
        p.artikelName?.toLowerCase().includes(searchTerm) ||
        p.artikelNumber?.toString().toLowerCase().includes(searchTerm)
      );
    }
    
    return product;
  }, []);

  // 🔥 Búsqueda por nombre (primero memoria, luego IndexedDB)
  const searchProductsInCache = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const term = searchTerm.toLowerCase();
    
    // 1. Resultados de memoria INMEDIATOS
    const memoryResults = memoryCache.products.filter(p => 
      p.artikelName?.toLowerCase().includes(term) ||
      p.artikelNumber?.toString().toLowerCase().includes(term)
    ).slice(0, 20);
    
    // 2. Buscar en IndexedDB en segundo plano para más resultados
    setTimeout(async () => {
      try {
        const cachedResults = await scannerCache.searchProductsByName(searchTerm);
        if (cachedResults.length > memoryResults.length) {
          // Si hay más resultados, actualizar
          const combined = [...cachedResults, ...memoryResults];
          const unique = Array.from(new Map(combined.map(p => [p._id, p])).values());
          setScannerProducts(unique); // Esto actualizará la UI si es necesario
        }
      } catch (error) {
        console.warn('Error en búsqueda IndexedDB:', error);
      }
    }, 50);
    
    return memoryResults;
  }, []);

  // Limpiar caché antiguo
  const cleanScannerCache = useCallback(async () => {
    try {
      await scannerCache.cleanOldCache();
      const stats = await scannerCache.getCacheStats();
      setCacheStats(stats);
      return true;
    } catch (error) {
      console.error('Error limpiando caché:', error);
      return false;
    }
  }, []);

  // Actualizar producto en caché
const updateProductInCache = useCallback(async (forceRefresh = true) => {
  // console.log('🔄 Forzando actualización de caché de productos...');
  
  // Limpiar memoria caché primero
  memoryCache = {
    products: [],
    timestamp: null,
    initialized: false
  };
  
  // Limpiar estado local
  setScannerProducts([]);
  
  // Forzar recarga desde backend
  const result = await loadFromBackend(true);
  
  // console.log(`✅ Caché actualizado: ${result.length} productos`);
  return true;
}, [loadFromBackend]);

  // Cargar productos paginados
  useEffect(() => {
    if (isAuthenticated) {
      fetchProductsPaginated();
    }
  }, [isAuthenticated, currentPage, activeSearch, stockFilter, sortOrder, refreshTrigger, fetchProductsPaginated]);

  // ✅ Crear producto
  async function createProduct(productData) {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para crear productos');
      return { success: false, error: 'No autenticado' };
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
      };
      
      if (productData.imagen && productData.imagen instanceof File) {
        productToCreate.imagen = productData.imagen;
      }
      
      const created = await createProductAPI(productToCreate);
      
      setCurrentPage(1);
      setRefreshTrigger(prev => prev + 1);
      
      // Actualizar caché en segundo plano
      loadFromBackendInBackground();
      
      return { 
        success: true, 
        product: created?.product || created 
      };
      
    } catch (err) {
      console.error('Error creating product:', err);
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
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para actualizar productos');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updated = await updateProductAPI(productId, updatedProduct);
      
      setRefreshTrigger(prev => prev + 1);
      
      // Actualizar caché en segundo plano
      loadFromBackendInBackground();
      
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
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar imágenes');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteProductImageAPI(id);
      setRefreshTrigger(prev => prev + 1);
      
      // Actualizar caché en segundo plano
      loadFromBackendInBackground();
      
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
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar productos');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteProductAPI(id);
      
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        setRefreshTrigger(prev => prev + 1);
      }
      
      // Actualizar caché en segundo plano
      loadFromBackendInBackground();
      
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
    loadFromBackendInBackground();
  }, [loadFromBackendInBackground]);

  const clearError = () => {
    setError(null);
  };

  return {
    // Productos paginados
    products,
    editingProduct,
    totalProducts,
    totalInventoryValue,
    loading,
    error,
    
    // Productos para escáner (¡SIEMPRE LISTOS!)
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
    setProductToEdit,
    refreshProducts,
    clearError,
    isAuthenticated
  };
};