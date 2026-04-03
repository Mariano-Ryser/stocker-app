// hooks/useClients.js - VERSIÓN CON CACHÉ EN MEMORIA
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { 
  getClients, 
  getClientsStats,
  createClientAPI,
  updateClientAPI,
  deleteClientAPI
} from '../services/clientService';

// 🔥 CACHÉ EN MEMORIA PARA CLIENTES
const clientsCache = new Map(); // key: companyId

export function useClients() {
  const [clients, setClients] = useState([]);
  const [clientsStats, setClientsStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // 🔥 Nuevo estado para renderizado instantáneo
  const [isCacheReady, setIsCacheReady] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  const { isAuthenticated, user } = useAuth();
  const companyId = user?.companyId || null;

  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const isMountedRef = useRef(true);

  // 🔥 Obtener caché de la empresa
  const getCompanyCache = useCallback(() => {
    if (!companyId) return null;
    
    if (!clientsCache.has(companyId)) {
      clientsCache.set(companyId, {
        clients: [],
        stats: { total: 0 },
        timestamp: null,
        initialized: false
      });
    }
    return clientsCache.get(companyId);
  }, [companyId]);

  // 🔥 Cargar desde caché inmediatamente
  const loadFromCache = useCallback(() => {
    const cache = getCompanyCache();
    if (cache && cache.initialized && cache.clients.length > 0) {
      // console.log('⚡ Cargando clientes desde caché en memoria');
      setClients(cache.clients);
      setClientsStats(cache.stats);
      setIsCacheReady(true);
      return true;
    }
    return false;
  }, [getCompanyCache]);

  // 🔥 Guardar en caché
  const saveToCache = useCallback((clientsData, statsData) => {
    const cache = getCompanyCache();
    if (cache) {
      cache.clients = clientsData;
      cache.stats = statsData;
      cache.timestamp = Date.now();
      cache.initialized = true;
    }
  }, [getCompanyCache]);

  // 🔥 Limpiar caché (útil al cerrar sesión o forzar refresh)
  const clearCache = useCallback(() => {
    if (companyId) {
      clientsCache.delete(companyId);
    }
    setIsCacheReady(false);
    setIsInitialRender(true);
  }, [companyId]);

  // Obtener lista completa con estadísticas (con caché)
  const fetchClients = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) {
      setClients([]);
      setClientsStats({ total: 0 });
      hasFetchedRef.current = false;
      setIsCacheReady(false);
      return;
    }

    // 🔥 Si no es forceRefresh y estamos en renderizado inicial, usar caché
    if (!forceRefresh && isInitialRender && loadFromCache()) {
      // Ya mostramos datos del caché, actualizar en segundo plano
      setTimeout(() => {
        fetchClients(true);
      }, 100);
      return;
    }

    if (isFetchingRef.current && !forceRefresh) {
      return;
    }

    if (hasFetchedRef.current && !forceRefresh) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const data = await getClients();
      
      if (data.ok === false) {
        setError(data.message);
        return;
      }
      
      if (isMountedRef.current) {
        const clientsData = data.clients || data || [];
        const statsData = data.stats || { total: data.total || 0 };
        
        setClients(clientsData);
        setClientsStats(statsData);
        hasFetchedRef.current = true;
        
        // 🔥 Guardar en caché
        saveToCache(clientsData, statsData);
        setIsCacheReady(true);
        setIsInitialRender(false);
        
        if (forceRefresh) {
          setRefreshTrigger(prev => prev + 1);
        }
      }
      
      // console.log('Clients: Fetch completed');
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
        hasFetchedRef.current = false;
      }
      console.error("Error fetching clients:", err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }
  }, [isAuthenticated, isInitialRender, loadFromCache, saveToCache]);

  // Función para refrescar manualmente
  const refreshClients = useCallback(() => {
    // console.log('Clients: Manual refresh triggered');
    hasFetchedRef.current = false;
    setIsInitialRender(false);
    fetchClients(true);
  }, [fetchClients]);

  // Función específica para obtener solo estadísticas
  const fetchClientsStats = useCallback(async () => {
    if (!isAuthenticated) {
      setClientsStats({ total: 0 });
      return;
    }

    try {
      const data = await getClientsStats();
      
      if (data.ok === false) {
        console.error('Error fetching stats:', data.message);
        return;
      }
      
      if (isMountedRef.current) {
        const statsData = data.stats || { total: 0 };
        setClientsStats(statsData);
        
        // 🔥 Actualizar estadísticas en caché también
        const cache = getCompanyCache();
        if (cache && cache.initialized) {
          cache.stats = statsData;
        }
      }
    } catch (err) {
      console.error("Error fetching clients stats:", err);
    }
  }, [isAuthenticated, getCompanyCache]);

  // Ejecutar al iniciar - con caché
  useEffect(() => {
    isMountedRef.current = true;
    
    if (isAuthenticated && companyId) {
      // Intentar cargar desde caché primero
      const hasCache = loadFromCache();
      if (hasCache) {
        // Ya mostramos datos, actualizar en segundo plano
        setTimeout(() => {
          fetchClients(true);
        }, 100);
      } else {
        fetchClients();
      }
    }
    
    return () => {
      isMountedRef.current = false;
      if (!isAuthenticated) {
        setClients([]);
        setClientsStats({ total: 0 });
        hasFetchedRef.current = false;
        setIsCacheReady(false);
        setIsInitialRender(true);
      }
    };
  }, [isAuthenticated, companyId, fetchClients, loadFromCache]);

  /** CREAR CLIENTE - CON ACTUALIZACIÓN DE CACHÉ */
  const createClient = async (client: any) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para crear clientes');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      const res = await createClientAPI(client);
      
      if (res.ok) {
        if (res.client) {
          // 🔥 Actualizar estado local inmediatamente
          setClients(prev => [res.client, ...prev]);
          setClientsStats(prev => ({ 
            total: prev.total + 1 
          }));
          
          // 🔥 Actualizar caché
          const cache = getCompanyCache();
          if (cache && cache.initialized) {
            cache.clients = [res.client, ...cache.clients];
            cache.stats = { total: cache.stats.total + 1 };
          }
          
          setRefreshTrigger(prev => prev + 1);
        }
        
        return { success: true, client: res.client };
      } else {
        return { 
          success: false, 
          errorCode: res.errorCode,
          message: res.message 
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

  /** EDITAR CLIENTE - CON ACTUALIZACIÓN DE CACHÉ */
  const editClient = async (id: any, clientData: any) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para editar clientes');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      const res = await updateClientAPI(id, clientData);
      
      if (res.ok) {
        if (res.client) {
          // 🔥 Actualizar estado local inmediatamente
          setClients(prev => prev.map(client => 
            client._id === id ? res.client : client
          ));
          
          // 🔥 Actualizar caché
          const cache = getCompanyCache();
          if (cache && cache.initialized) {
            cache.clients = cache.clients.map(client => 
              client._id === id ? res.client : client
            );
          }
          
          setRefreshTrigger(prev => prev + 1);
        }
        
        return { success: true, client: res.client };
      } else {
        return { 
          success: false, 
          errorCode: res.errorCode,
          message: res.message 
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

  /** ELIMINAR CLIENTE - CON ACTUALIZACIÓN DE CACHÉ */
  const deleteClient = async (id: any) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar clientes');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      const res = await deleteClientAPI(id);
      
      if (res.ok) {
        // 🔥 Actualizar estado local inmediatamente
        setClients(prev => prev.filter(client => client._id !== id));
        setClientsStats(prev => ({ 
          total: Math.max(0, prev.total - 1) 
        }));
        
        // 🔥 Actualizar caché
        const cache = getCompanyCache();
        if (cache && cache.initialized) {
          cache.clients = cache.clients.filter(client => client._id !== id);
          cache.stats = { total: Math.max(0, cache.stats.total - 1) };
        }
        
        setRefreshTrigger(prev => prev + 1);
        
        return { success: true };
      } else {
        setError(res.message);
        return { success: false, message: res.message };
      }
    } catch (err) {
      console.error('Error inesperado deleting client:', err);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  /** Función para limpiar errores */
  const clearError = () => {
    setError(null);
  };

  return {
    // Datos
    clients,
    clientsStats,
    loading,
    error,
    refreshTrigger,
    
    // 🔥 Nuevos estados de caché
    isCacheReady,
    isInitialRender,
    
    // Acciones
    setError: clearError,
    fetchClients,
    refreshClients,
    fetchClientsStats,
    createClient,
    editClient,        
    deleteClient,
    clearCache, // 🔥 Nueva función para limpiar caché
    isAuthenticated
  };
}