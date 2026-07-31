// hooks/useSales.js - VERSIÓN CORREGIDA
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { 
  getSales, 
  createSaleAPI, 
  updateSaleAPI,
  deleteSaleAPI 
} from '../services/saleService';

// 🔥 CACHÉ EN MEMORIA PARA FACTURAS
const salesCache = new Map();

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
  
  // 🔥 Estados de búsqueda - separados para mejor control
  const [searchInput, setSearchInput] = useState(''); // Lo que el usuario escribe
  const [searchTerm, setSearchTerm] = useState(''); // Término real usado en la API
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
  const initialLoadDone = useRef(false);
  const searchTimeout = useRef(null);
  const isFiltering = useRef(false);

  // 🔥 Debounce para búsqueda - VERSIÓN CORREGIDA
  useEffect(() => {
    // Limpiar timeout anterior
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Si el input está vacío, actualizar inmediatamente
    if (searchInput === '') {
      setSearchTerm('');
      setCurrentPage(1);
      return;
    }
    
    // Si no, esperar 500ms
    searchTimeout.current = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);
    
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchInput]);

  // 🔥 Resetear página cuando cambian otros filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [dateFrom, dateTo, statusFilter, sortField, sortDirection]);

  // 🔥 Obtener caché de la empresa - SOLO PARA BÚSQUEDA VACÍA
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

  // 🔥 Verificar si hay filtros activos (incluyendo búsqueda)
  const hasActiveFilters = useCallback(() => {
    return searchTerm !== '' || dateFrom !== '' || dateTo !== '' || statusFilter !== '' ||
           sortField !== 'createdAt' || sortDirection !== 'desc';
  }, [searchTerm, dateFrom, dateTo, statusFilter, sortField, sortDirection]);

  // 🔥 Cargar desde caché - SOLO cuando no hay filtros
  const loadFromCache = useCallback(() => {
    // Si hay filtros activos, NO usar caché
    if (hasActiveFilters()) {
      return false;
    }
    
    const cache = getCompanyCache();
    if (cache && cache.initialized && cache.sales.length > 0) {
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
  }, [getCompanyCache, hasActiveFilters]);

  // 🔥 Guardar en caché - SOLO cuando no hay filtros
  const saveToCache = useCallback((salesData, statsData, paginationData) => {
    // Solo guardar si NO hay filtros activos
    if (!hasActiveFilters()) {
      const cache = getCompanyCache();
      if (cache) {
        cache.sales = salesData;
        cache.stats = statsData;
        cache.pagination = paginationData;
        cache.timestamp = Date.now();
        cache.initialized = true;
      }
    }
  }, [getCompanyCache, hasActiveFilters]);

  // 🔥 Función principal para obtener ventas - ACTUALIZADA
  const fetchSales = useCallback(async (page = 1, isLoadMore = false, forceRefresh = false) => {
    if (!isAuthenticated) {
      setSales([]);
      setSalesStats({});
      return;
    }

    // Si hay filtros activos, siempre refrescar
    const shouldRefresh = forceRefresh || hasActiveFilters();

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
        search: searchTerm, // Usar searchTerm (el que tiene debounce)
        dateFrom,
        dateTo,
        status: statusFilter,
        sortField,
        sortDirection
      };
      
      // console.log('🔍 Fetching sales with params:', params);
      
      const data = await getSales(params);
      
      const newSales = data.sales || [];
      const pagination = data.pagination || { pages: 1, total: 0 };
      const stats = data.stats || {};
      
      if (isLoadMore) {
        setSales(prev => [...prev, ...newSales]);
      } else {
        setSales(newSales);
        // Guardar en caché SOLO si no hay filtros
        if (page === 1 && !hasActiveFilters()) {
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
  }, [isAuthenticated, itemsPerPage, searchTerm, dateFrom, dateTo, statusFilter, 
      sortField, sortDirection, saveToCache, hasActiveFilters]);

  // 🔥 CARGA INICIAL - MEJORADA
  useEffect(() => {
    if (isAuthenticated && companyId && !initialLoadDone.current) {
      initialLoadDone.current = true;
      
      // Solo cargar desde caché si no hay filtros
      const hasCache = loadFromCache();
      
      if (hasCache) {
        // Si hay caché, mostrar datos y refrescar en background después de 30s
        setTimeout(() => {
          if (!loading && !loadingMore && !hasActiveFilters()) {
            fetchSales(1, false, true);
          }
        }, 30000);
      } else {
        // Sin caché, cargar normalmente
        fetchSales(1, false, false);
      }
    }
  }, [isAuthenticated, companyId, loadFromCache, fetchSales, loading, loadingMore, hasActiveFilters]);

  // 🔥 Efecto para cuando cambia searchTerm
  useEffect(() => {
    if (initialLoadDone.current && isAuthenticated) {
      // Si hay término de búsqueda, siempre refrescar
      fetchSales(1, false, true);
    }
  }, [searchTerm]);

  // 🔥 Efecto para otros filtros
  useEffect(() => {
    if (initialLoadDone.current && isAuthenticated) {
      fetchSales(1, false, true);
    }
  }, [dateFrom, dateTo, statusFilter, sortField, sortDirection]);

  // Cargar más
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      fetchSales(currentPage + 1, true);
    }
  }, [hasMore, loadingMore, loading, currentPage, fetchSales]);

  // Cambiar página
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      fetchSales(page, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages, fetchSales]);

  // Refresh manual
  const refreshSales = useCallback(() => {
    return fetchSales(1, false, true);
  }, [fetchSales]);

  // 🔥 createSale - ACTUALIZADA
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
      
      // Actualizar lista local
      setSales(prev => [newSale, ...prev]);
      
      // Actualizar estadísticas
      setSalesStats(prev => ({
        ...prev,
        totalAllSales: (prev.totalAllSales || 0) + 1,
        totalUmsatz: (prev.totalUmsatz || 0) + (newSale.total || 0)
      }));
      
      // Actualizar caché SOLO si no hay filtros
      if (!hasActiveFilters()) {
        const cache = getCompanyCache();
        if (cache && cache.initialized) {
          cache.sales = [newSale, ...cache.sales];
          cache.stats.totalAllSales = (cache.stats.totalAllSales || 0) + 1;
          cache.stats.totalUmsatz = (cache.stats.totalUmsatz || 0) + (newSale.total || 0);
          cache.timestamp = Date.now();
        }
      }
      
      return { success: true, sale: newSale };
      
    } catch (err) {
      console.error('Error creating sale:', err);
      return { success: false, message: err.message };
    }
  };

  // updateSale - ACTUALIZADA
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
        
        // Actualizar caché SOLO si no hay filtros
        if (!hasActiveFilters()) {
          const cache = getCompanyCache();
          if (cache && cache.initialized) {
            cache.sales = cache.sales.map(sale => 
              sale._id === id ? res.sale : sale
            );
            cache.timestamp = Date.now();
          }
        }
      }
      
      return { success: true, sale: res.sale };
    } catch (err) {
      console.error('Error updating sale:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // deleteSale - ACTUALIZADA
  const deleteSale = async (id) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar ventas');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      await deleteSaleAPI(id);

      setSales(prev => prev.filter(sale => sale._id !== id));
      
      // Actualizar caché SOLO si no hay filtros
      if (!hasActiveFilters()) {
        const cache = getCompanyCache();
        if (cache && cache.initialized) {
          cache.sales = cache.sales.filter(sale => sale._id !== id);
          cache.timestamp = Date.now();
        }
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Limpiar filtros - ACTUALIZADA
  const clearFilters = useCallback(() => {
    setSearchInput('');
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('');
    setSortField('createdAt');
    setSortDirection('desc');
    setCurrentPage(1);
  }, []);

  // Limpiar caché
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
    search: searchInput, // EXPONER searchInput como 'search'
    setSearch: setSearchInput, // setSearch ahora actualiza searchInput
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