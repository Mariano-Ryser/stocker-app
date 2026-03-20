// hooks/useClientsPaginated.js - VERSIÓN CORREGIDA
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { 
  getClientsPaginated,
  createClientAPI,
  updateClientAPI,
  deleteClientAPI
} from '../services/clientService';

export function useClientsPaginated(initialLimit = 50) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: initialLimit
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

  const { isAuthenticated, user } = useAuth();
  const isFetchingRef = useRef(false);
  const initialLoadRef = useRef(false);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  // Función principal para obtener clientes
  const fetchClients = useCallback(async (page = 1, isLoadMore = false) => {
    if (!isAuthenticated) {
      setClients([]);
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
        search: debouncedSearch
      };

      const res = await getClientsPaginated(params);
      
      // ✅ Verificar que la respuesta es exitosa
      if (res && res.ok) {
        const newClients = res.clients || [];
        const newPagination = res.pagination || {
          total: 0,
          pages: 1,
          page: 1,
          limit: pagination.limit,
          hasNext: false,
          hasPrev: false
        };

        if (isLoadMore) {
          setClients(prev => [...prev, ...newClients]);
        } else {
          setClients(newClients);
        }

        setPagination({
          total: newPagination.total,
          pages: newPagination.pages,
          current: page,
          limit: pagination.limit,
          hasNext: newPagination.hasNext || page < newPagination.pages,
          hasPrev: newPagination.hasPrev || page > 1
        });
      } else {
        // Si hay error en la respuesta
        setError(res?.message || 'Error al cargar clientes');
      }

    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
      initialLoadRef.current = true;
    }
  }, [isAuthenticated, debouncedSearch, pagination.limit]);

  // Efecto para cargar datos iniciales cuando cambian los filtros
  useEffect(() => {
    if (isAuthenticated) {
      fetchClients(filters.page, false);
    }
  }, [isAuthenticated, filters.page, debouncedSearch, fetchClients]);

  // Función para cambiar página
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.pages) {
      setFilters(prev => ({ ...prev, page }));
      fetchClients(page, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.pages, fetchClients]);

  // Función para siguiente página
  const nextPage = useCallback(() => {
    if (pagination.current < pagination.pages) {
      const next = pagination.current + 1;
      setFilters(prev => ({ ...prev, page: next }));
      fetchClients(next, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.current, pagination.pages, fetchClients]);

  // Función para página anterior
  const prevPage = useCallback(() => {
    if (pagination.current > 1) {
      const prev = pagination.current - 1;
      setFilters(prev => ({ ...prev, page: prev }));
      fetchClients(prev, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pagination.current, fetchClients]);

  // Función para cargar más (infinite scroll)
  const loadMore = useCallback(() => {
    if (pagination.hasNext && !loadingMore && !loading) {
      const nextPage = pagination.current + 1;
      setFilters(prev => ({ ...prev, page: nextPage }));
      fetchClients(nextPage, true);
    }
  }, [pagination.hasNext, pagination.current, loadingMore, loading, fetchClients]);

  // Función para refrescar manualmente
  const refresh = useCallback(() => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchClients(1, false);
  }, [fetchClients]);

  // Función para cambiar límite por página
  const setLimit = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  // Crear cliente
  const createClient = async (clientData) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para crear clientes');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      const res = await createClientAPI(clientData);
      
      if (res && res.ok) {
        // Refrescar la primera página para ver el nuevo cliente
        await fetchClients(1, false);
        return { success: true, client: res.client };
      } else {
        return { 
          success: false, 
          errorCode: res?.errorCode,
          message: res?.message || 'Error al crear cliente'
        };
      }
      
    } catch (err) {
      console.error('Error inesperado:', err);
      return { 
        success: false, 
        errorCode: 'UNEXPECTED_ERROR',
        message: err.message 
      };
    }
  };

  // Editar cliente
  const editClient = async (id, clientData) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para editar clientes');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      const res = await updateClientAPI(id, clientData);
      
      if (res && res.ok) {
        // Actualizar en la lista local
        setClients(prev => prev.map(client => 
          client._id === id ? res.client : client
        ));
        
        return { success: true, client: res.client };
      } else {
        return { 
          success: false, 
          errorCode: res?.errorCode,
          message: res?.message || 'Error al editar cliente'
        };
      }
    } catch (err) {
      console.error('Error inesperado updating client:', err);
      return { 
        success: false, 
        errorCode: 'UNEXPECTED_ERROR',
        message: err.message 
      };
    }
  };

  // Eliminar cliente
  const deleteClient = async (id) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar clientes');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      const res = await deleteClientAPI(id);
      
      if (res && res.ok) {
        // Eliminar de la lista local
        setClients(prev => prev.filter(client => client._id !== id));
        return { success: true };
      } else {
        setError(res?.message || 'Error al eliminar cliente');
        return { success: false, message: res?.message };
      }
    } catch (err) {
      console.error('Error inesperado deleting client:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  return {
    // Datos
    clients,
    loading,
    loadingMore,
    error,
    
    // Búsqueda
    searchTerm,
    setSearchTerm,
    
    // Paginación
    pagination,
    goToPage,
    nextPage,
    prevPage,
    loadMore,
    setLimit,
    
    // Acciones
    refresh,
    createClient,
    editClient,
    deleteClient,
    isAuthenticated,
    user
  };
}