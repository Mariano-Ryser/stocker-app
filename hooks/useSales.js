// hooks/useSales.js - VERSIÓN CORREGIDA (sin doble carga)
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { 
  getSales, 
  createSaleAPI, 
  updateSaleAPI,
  deleteSaleAPI 
} from '../services/saleService';

// 🔥 CACHÉ EN MEMORIA PARA FACTURAS
const salesCache = new Map(); // key: companyId

export function useSales() {
  const [sales, setSales] = useState([]);
  const [salesStats, setSalesStats] = useState({
    paidCount: 0,
    cancelledCount: 0,
    pendingCount: 0,
    totalUmsatz: 0,
    durchschnitt: 0,
    totalAllSales: 0
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  const [isCacheReady, setIsCacheReady] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const companyId = user?.companyId || null;
  const initialLoadDone = useRef(false); // 🔥 Prevenir carga múltiple
  
  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);

  // Resetear página cuando cambian filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, dateFrom, dateTo, statusFilter, sortField, sortDirection]);

  // 🔥 Obtener caché de la empresa
  const getCompanyCache = useCallback(() => {
    if (!companyId) return null;
    
    if (!salesCache.has(companyId)) {
      salesCache.set(companyId, {
        sales: [],
        stats: {},
        pagination: {},
        timestamp: null,
        initialized: false
      });
    }
    return salesCache.get(companyId);
  }, [companyId]);

  // 🔥 Cargar desde caché inmediatamente
  const loadFromCache = useCallback(() => {
    const cache = getCompanyCache();
    if (cache && cache.initialized && cache.sales.length > 0) {
      // Verificar si el caché es válido (menos de 5 minutos)
      const cacheAge = Date.now() - (cache.timestamp || 0);
      if (cacheAge < 5 * 60 * 1000) {
        setSales(cache.sales);
        setSalesStats(cache.stats);
        setTotalPages(cache.pagination.pages || 1);
        setTotalItems(cache.pagination.total || 0);
        setIsCacheReady(true);
        return true;
      }
    }
    return false;
  }, [getCompanyCache]);

  // 🔥 Guardar en caché
  const saveToCache = useCallback((salesData, statsData, paginationData) => {
    const cache = getCompanyCache();
    if (cache && !debouncedSearch && !dateFrom && !dateTo && !statusFilter) {
      cache.sales = salesData;
      cache.stats = statsData;
      cache.pagination = paginationData;
      cache.timestamp = Date.now();
      cache.initialized = true;
    }
  }, [getCompanyCache, debouncedSearch, dateFrom, dateTo, statusFilter]);

  // 🔥 Función principal para obtener ventas
  const fetchSales = useCallback(async (page = 1, isLoadMore = false, forceRefresh = false) => {
    if (!isAuthenticated) {
      setSales([]);
      setSalesStats({});
      return;
    }

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      const params = {
        page,
        limit: itemsPerPage,
        search: debouncedSearch,
        dateFrom,
        dateTo,
        status: statusFilter,
        sortField,
        sortDirection
      };
      
      const data = await getSales(params);
      
      const newSales = data.sales || [];
      const pagination = data.pagination || { pages: 1, total: 0 };
      const stats = data.stats || {};
      
      if (isLoadMore) {
        setSales(prev => [...prev, ...newSales]);
      } else {
        setSales(newSales);
        // Solo guardar en caché si es la página 1 y no hay filtros activos
        if (page === 1 && !debouncedSearch && !dateFrom && !dateTo && !statusFilter && 
            sortField === 'createdAt' && sortDirection === 'desc') {
          saveToCache(newSales, stats, pagination);
        }
      }
      
      setSalesStats(stats);
      setTotalPages(pagination.pages);
      setTotalItems(pagination.total);
      setHasMore(page < pagination.pages);
      setCurrentPage(page);
      setIsCacheReady(true);
      
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [isAuthenticated, itemsPerPage, debouncedSearch, dateFrom, dateTo, statusFilter, 
      sortField, sortDirection, saveToCache]);

  // 🔥 CARGA INICIAL ÚNICA - SIN DOBLE REFRESCO
  useEffect(() => {
    if (isAuthenticated && companyId && !initialLoadDone.current) {
      initialLoadDone.current = true;
      
      // Intentar cargar desde caché primero
      const hasCache = loadFromCache();
      
      if (hasCache) {
        // Si hay caché, ya mostramos datos, no hacemos fetch inmediato
        // Solo refrescamos después de 30 segundos (opcional)
        setTimeout(() => {
          if (!loading && !loadingMore) {
            fetchSales(1, false, true);
          }
        }, 30000);
      } else {
        // Sin caché, cargar normalmente
        fetchSales(1, false, false);
      }
    }
  }, [isAuthenticated, companyId, loadFromCache, fetchSales, loading, loadingMore]);

  // Cargar más (para infinite scroll)
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      fetchSales(currentPage + 1, true);
    }
  }, [hasMore, loadingMore, loading, currentPage, fetchSales]);

  // Cambiar página (para paginación tradicional)
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      fetchSales(page, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages, fetchSales]);

  // Función de refresh manual (solo cuando el usuario hace clic)
  const refreshSales = useCallback(() => {
    return fetchSales(1, false, true);
  }, [fetchSales]);

  // 🔥 createSale optimizada
  const createSale = async (payload) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Debe iniciar sesión' };
    }
    
    try {
      const res = await createSaleAPI(payload);

      if (!res.success) {
        return { 
          success: false, 
          message: res.message,
          type: res.type 
        };
      }

      const newSale = res.data?.sale || res.data;
      
      // Actualizar lista local INMEDIATAMENTE
      setSales(prev => [newSale, ...prev]);
      
      // Actualizar estadísticas localmente
      setSalesStats(prev => ({
        ...prev,
        totalAllSales: (prev.totalAllSales || 0) + 1,
        totalUmsatz: (prev.totalUmsatz || 0) + (newSale.total || 0)
      }));
      
      // Actualizar caché en memoria
      const cache = getCompanyCache();
      if (cache && cache.initialized) {
        cache.sales = [newSale, ...cache.sales];
        cache.stats.totalAllSales = (cache.stats.totalAllSales || 0) + 1;
        cache.stats.totalUmsatz = (cache.stats.totalUmsatz || 0) + (newSale.total || 0);
        cache.timestamp = Date.now(); // Actualizar timestamp
      }
      
      // Disparar eventos para actualizar stock en segundo plano
      setTimeout(() => {
        if (newSale.items && newSale.items.length > 0) {
          newSale.items.forEach(item => {
            window.dispatchEvent(new CustomEvent('stockUpdated', { 
              detail: { 
                productId: item.productId,
                quantitySold: item.quantity,
                timestamp: new Date().toISOString()
              } 
            }));
          });
        }
      }, 100);
      
      return { success: true, sale: newSale };
      
    } catch (err) {
      console.error('Error creating sale:', err);
      return { success: false, message: err.message };
    }
  };

  // updateSale optimizada
  const updateSale = async (id, payload) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para actualizar ventas');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      const res = await updateSaleAPI(id, payload);

      if (res.sale) {
        setSales(prev => prev.map(sale => 
          sale._id === id ? res.sale : sale
        ));
        
        const cache = getCompanyCache();
        if (cache && cache.initialized) {
          cache.sales = cache.sales.map(sale => 
            sale._id === id ? res.sale : sale
          );
          cache.timestamp = Date.now();
        }
      }
      
      return { success: true, sale: res.sale };
    } catch (err) {
      console.error('Error updating sale:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // deleteSale optimizada
  const deleteSale = async (id) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar ventas');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      await deleteSaleAPI(id);

      setSales(prev => prev.filter(sale => sale._id !== id));
      
      const cache = getCompanyCache();
      if (cache && cache.initialized) {
        cache.sales = cache.sales.filter(sale => sale._id !== id);
        cache.timestamp = Date.now();
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('');
    setSortField('createdAt');
    setSortDirection('desc');
  }, []);

  // Limpiar caché de la empresa
  const clearCache = useCallback(() => {
    if (companyId) {
      salesCache.delete(companyId);
    }
  }, [companyId]);

  return {
    sales,
    salesStats,
    loading,
    loadingMore,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasMore,
    goToPage,
    loadMore,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    clearFilters,
    fetchSales,
    refreshSales,
    createSale,
    updateSale,
    deleteSale,
    clearCache,
    isCacheReady,
    isAuthenticated
  };
}