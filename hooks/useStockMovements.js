// hooks/useStockMovements.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { getStockMovements } from '../services/stockMovementService';

export function useStockMovements(initialLimit = 50) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    current: 1,
    limit: initialLimit,
    hasNext: false,
    hasPrev: false
  });

  const { isAuthenticated } = useAuth();
  const isFetchingRef = useRef(false);
  const initialLoadRef = useRef(false);

  // Función principal para obtener movimientos
  const fetchMovements = useCallback(async (page = 1, isLoadMore = false) => {
    if (!isAuthenticated) {
      setMovements([]);
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (isFetchingRef.current) return;

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    isFetchingRef.current = true;
    setError(null);

    try {
      const params = {
        page,
        limit: pagination.limit,
        movementType: filters.type,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search
      };

      const data = await getStockMovements(params);
      
      const newMovements = data.movements || [];
      const newPagination = data.pagination || {
        total: 0,
        pages: 1,
        page: 1,
        limit: pagination.limit,
        hasNext: false,
        hasPrev: false
      };

      if (isLoadMore) {
        setMovements(prev => [...prev, ...newMovements]);
      } else {
        setMovements(newMovements);
      }

      setPagination({
        total: newPagination.total,
        pages: newPagination.pages,
        current: page,
        limit: pagination.limit,
        hasNext: newPagination.hasNext || page < newPagination.pages,
        hasPrev: newPagination.hasPrev || page > 1
      });

    } catch (err) {
      console.error('Error fetching movements:', err);
      setError(err.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
      initialLoadRef.current = true;
    }
  }, [isAuthenticated, filters, pagination.limit]);

  // Efecto para cargar datos iniciales cuando cambian los filtros
  useEffect(() => {
    if (isAuthenticated) {
      fetchMovements(1, false);
    }
  }, [
    isAuthenticated, 
    filters.type, 
    filters.startDate, 
    filters.endDate, 
    filters.search
  ]);

  // Función para cambiar página
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.pages) {
      setFilters(prev => ({ ...prev, page }));
      fetchMovements(page, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.pages, fetchMovements]);

  // Función para siguiente página
  const nextPage = useCallback(() => {
    if (pagination.current < pagination.pages) {
      const next = pagination.current + 1;
      setFilters(prev => ({ ...prev, page: next }));
      fetchMovements(next, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.current, pagination.pages, fetchMovements]);

  // Función para página anterior
  const prevPage = useCallback(() => {
    if (pagination.current > 1) {
      const prev = pagination.current - 1;
      setFilters(prev => ({ ...prev, page: prev }));
      fetchMovements(prev, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.current, fetchMovements]);

  // Función para cargar más (infinite scroll)
  const loadMore = useCallback(() => {
    if (pagination.hasNext && !loadingMore && !loading) {
      const nextPage = pagination.current + 1;
      setFilters(prev => ({ ...prev, page: nextPage }));
      fetchMovements(nextPage, true);
    }
  }, [pagination.hasNext, pagination.current, loadingMore, loading, fetchMovements]);

  // Función para actualizar filtros
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Resetear a primera página al cambiar filtros
    }));
  }, []);

  // Función para limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setFilters({
      type: '',
      startDate: '',
      endDate: '',
      search: '',
      page: 1
    });
  }, []);

  // Función para refrescar manualmente
  const refresh = useCallback(() => {
    fetchMovements(1, false);
  }, [fetchMovements]);

  // Función para cambiar límite por página
  const setLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  return {
    // Datos
    movements,
    loading,
    loadingMore,
    error,
    
    // Filtros
    filters,
    updateFilter,
    clearFilters,
    
    // Paginación
    pagination,
    goToPage,
    nextPage,
    prevPage,
    loadMore,
    setLimit,
    
    // Acciones
    refresh,
    isAuthenticated
  };
}