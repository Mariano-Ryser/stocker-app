// hooks/useStockMovements.js - VERSIÓN CON CACHÉ EN MEMORIA
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { getStockMovements } from '../services/stockMovementService';

// 🔥 CACHÉ EN MEMORIA PARA MOVIMIENTOS DE STOCK
const movementsCache = new Map(); // key: companyId

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

  // 🔥 Estado para renderizado instantáneo
  const [isCacheReady, setIsCacheReady] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);

  const { isAuthenticated, user } = useAuth();
  const companyId = user?.companyId || null;
  const isFetchingRef = useRef(false);
  const initialLoadRef = useRef(false);

  // 🔥 Obtener caché de la empresa
  const getCompanyCache = useCallback(() => {
    if (!companyId) return null;
    
    if (!movementsCache.has(companyId)) {
      movementsCache.set(companyId, {
        movements: [],
        pagination: {},
        filtersKey: '',
        timestamp: null,
        initialized: false
      });
    }
    return movementsCache.get(companyId);
  }, [companyId]);

  // 🔥 Generar clave única para los filtros actuales
  const getFiltersKey = useCallback(() => {
    return JSON.stringify({
      type: filters.type,
      startDate: filters.startDate,
      endDate: filters.endDate,
      search: filters.search,
      page: filters.page
    });
  }, [filters.type, filters.startDate, filters.endDate, filters.search, filters.page]);

  // 🔥 Cargar desde caché inmediatamente
  const loadFromCache = useCallback(() => {
    const cache = getCompanyCache();
    const currentFiltersKey = getFiltersKey();
    
    if (cache && cache.initialized && cache.filtersKey === currentFiltersKey && cache.movements.length > 0) {
      // console.log('⚡ Cargando movimientos desde caché en memoria');
      setMovements(cache.movements);
      setPagination(cache.pagination);
      setIsCacheReady(true);
      return true;
    }
    return false;
  }, [getCompanyCache, getFiltersKey]);

  // 🔥 Guardar en caché
  const saveToCache = useCallback((movementsData, paginationData) => {
    const cache = getCompanyCache();
    const currentFiltersKey = getFiltersKey();
    
    if (cache) {
      cache.movements = movementsData;
      cache.pagination = paginationData;
      cache.filtersKey = currentFiltersKey;
      cache.timestamp = Date.now();
      cache.initialized = true;
    }
  }, [getCompanyCache, getFiltersKey]);

  // Función principal para obtener movimientos (con caché)
  const fetchMovements = useCallback(async (page = 1, isLoadMore = false, forceRefresh = false) => {
    if (!isAuthenticated) {
      setMovements([]);
      return;
    }

    // 🔥 Si no es forceRefresh y estamos en renderizado inicial, usar caché
    if (!forceRefresh && isInitialRender && !isLoadMore && loadFromCache()) {
      // Ya mostramos datos del caché, actualizar en segundo plano
      setTimeout(() => {
        fetchMovements(page, false, true);
      }, 100);
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

      const updatedPagination = {
        total: newPagination.total,
        pages: newPagination.pages,
        current: page,
        limit: pagination.limit,
        hasNext: newPagination.hasNext || page < newPagination.pages,
        hasPrev: newPagination.hasPrev || page > 1
      };

      if (isLoadMore) {
        setMovements(prev => {
          const merged = [...prev, ...newMovements];
          // 🔥 Guardar en caché también para loadMore
          if (page === 1) {
            saveToCache(merged, updatedPagination);
          }
          return merged;
        });
      } else {
        setMovements(newMovements);
        // 🔥 Guardar en caché solo si es página 1 y sin filtros complejos
        if (page === 1 && !filters.type && !filters.startDate && !filters.endDate && !filters.search) {
          saveToCache(newMovements, updatedPagination);
        }
      }

      setPagination(updatedPagination);
      setIsCacheReady(true);
      setIsInitialRender(false);

    } catch (err) {
      console.error('Error fetching movements:', err);
      setError(err.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
      initialLoadRef.current = true;
    }
  }, [isAuthenticated, filters, pagination.limit, loadFromCache, saveToCache, isInitialRender]);

  // Efecto para cargar datos iniciales con caché
  useEffect(() => {
    if (isAuthenticated && companyId) {
      // Intentar cargar desde caché primero
      const hasCache = loadFromCache();
      if (hasCache) {
        // Ya mostramos datos, actualizar en segundo plano
        setTimeout(() => {
          fetchMovements(1, false, true);
        }, 100);
      } else {
        fetchMovements(1, false, false);
      }
    }
  }, [isAuthenticated, companyId, fetchMovements, loadFromCache]);

  // Efecto para cuando cambian los filtros
  useEffect(() => {
    if (isAuthenticated && initialLoadRef.current) {
      // Resetear renderizado inicial cuando cambian filtros
      setIsInitialRender(false);
      fetchMovements(1, false);
    }
  }, [isAuthenticated, filters.type, filters.startDate, filters.endDate, filters.search]);

  // Función para cambiar página
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.pages) {
      setIsInitialRender(false);
      setFilters(prev => ({ ...prev, page }));
      fetchMovements(page, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.pages, fetchMovements]);

  // Función para siguiente página
  const nextPage = useCallback(() => {
    if (pagination.current < pagination.pages) {
      const next = pagination.current + 1;
      setIsInitialRender(false);
      setFilters(prev => ({ ...prev, page: next }));
      fetchMovements(next, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.current, pagination.pages, fetchMovements]);

  // Función para página anterior
  const prevPage = useCallback(() => {
    if (pagination.current > 1) {
      const prev = pagination.current - 1;
      setIsInitialRender(false);
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
    setIsInitialRender(false);
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  }, []);

  // Función para limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setIsInitialRender(false);
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
    setIsInitialRender(false);
    fetchMovements(1, false, true);
  }, [fetchMovements]);

  // 🔥 Limpiar caché de la empresa (útil al cerrar sesión)
  const clearCache = useCallback(() => {
    if (companyId) {
      movementsCache.delete(companyId);
    }
  }, [companyId]);

  // Función para cambiar límite por página
  const setLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  return {
    movements,
    loading,
    loadingMore,
    error,
    filters,
    updateFilter,
    clearFilters,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    loadMore,
    setLimit,
    refresh,
    clearCache,
    isCacheReady,
    isAuthenticated
  };
}