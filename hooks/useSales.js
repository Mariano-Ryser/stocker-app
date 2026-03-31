// hooks/useSales.js - VERSIÓN CON PAGINACIÓN
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { 
  getSales, 
  createSaleAPI, 
  updateSaleAPI,
  deleteSaleAPI 
} from '../services/saleService';

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
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  const [hasMore, setHasMore] = useState(false);
  
  // Estados de filtros
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
  
  const { isAuthenticated } = useAuth();
  
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

  // Función principal para obtener ventas
  const fetchSales = useCallback(async (page = 1, isLoadMore = false) => {
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
      }
      
      setSalesStats(stats);
      setTotalPages(pagination.pages);
      setTotalItems(pagination.total);
      setHasMore(page < pagination.pages);
      setCurrentPage(page);
      
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [isAuthenticated, itemsPerPage, debouncedSearch, dateFrom, dateTo, statusFilter, sortField, sortDirection]);

  // Cargar primera página
  useEffect(() => {
    if (isAuthenticated) {
      fetchSales(1, false);
    }
  }, [isAuthenticated, fetchSales]);

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

  // Función de refresh manual
  const refreshSales = useCallback(() => {
    fetchSales(1, false);
  }, [fetchSales]);




  // Función createSale optimizada
 // Función createSale optimizada - SIN REFRESH BLOQUEANTE
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
    
    // 🔥 OPTIMIZACIÓN: Actualizar la lista local INMEDIATAMENTE
    // Esto hace que la UI se actualice sin esperar una nueva petición
    setSales(prev => [newSale, ...prev]);
    
    // Actualizar estadísticas localmente (opcional)
    setSalesStats(prev => ({
      ...prev,
      totalAllSales: (prev.totalAllSales || 0) + 1,
      totalUmsatz: (prev.totalUmsatz || 0) + (newSale.total || 0)
    }));
    
    // 🔥 NO hacer fetchSales aquí - eso es lo que causa lentitud
    // En lugar de eso, actualizar el caché de productos en segundo plano sin esperar
    setTimeout(() => {
      // Disparar eventos para actualizar stock en segundo plano
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
    
    return { 
      success: true, 
      sale: newSale 
    };
    
  } catch (err) {
    console.error('Error creating sale:', err);
    return { 
      success: false, 
      message: err.message 
    };
  }
};



  // Función updateSale optimizada
  const updateSale = async (id, payload) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para actualizar ventas');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      const res = await updateSaleAPI(id, payload);

      if (res.sale) {
        // Actualizar en la lista local
        setSales(prev => prev.map(sale => 
          sale._id === id ? res.sale : sale
        ));
      }
      
      return { 
        success: true, 
        sale: res.sale 
      };
    } catch (err) {
      console.error('Error updating sale:', err);
      setError(err.message);
      return { 
        success: false, 
        message: err.message 
      };
    }
  };

  // Función deleteSale optimizada
  const deleteSale = async (id) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar ventas');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      await deleteSaleAPI(id);

      // Eliminar de la lista local
      setSales(prev => prev.filter(sale => sale._id !== id));
      
      // Refrescar estadísticas
      await fetchSales(currentPage, false);
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError(err.message);
      return { 
        success: false, 
        message: err.message 
      };
    }
  };

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('');
    setSortField('createdAt');
    setSortDirection('desc');
  }, []);

  return {
    // Datos
    sales,
    salesStats,
    
    // Estados
    loading,
    loadingMore,
    error,
    
    // Paginación
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasMore,
    goToPage,
    loadMore,
    
    // Filtros
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
    
    // Acciones
    fetchSales,
    refreshSales,
    createSale,
    updateSale,
    deleteSale,
    isAuthenticated
  };
}