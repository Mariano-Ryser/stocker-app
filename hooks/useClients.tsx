// hooks/useClients.js (CORREGIDO)
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { 
  getClients, 
  getClientsStats,
  createClientAPI,
  updateClientAPI,
  deleteClientAPI
} from '../services/clientService';
 
export function useClients() {
  const [clients, setClients] = useState([]);
  const [clientsStats, setClientsStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ← NUEVO: Para forzar refrescos
  
  const { isAuthenticated } = useAuth();

  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Obtener lista completa con estadísticas
  const fetchClients = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) {
      setClients([]);
      setClientsStats({ total: 0 });
      hasFetchedRef.current = false;
      return;
    }

    if (isFetchingRef.current && !forceRefresh) {
      console.log('Clients: Already fetching, skipping...');
      return;
    }

    if (hasFetchedRef.current && !forceRefresh) {
      console.log('Clients: Already fetched, skipping...');
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      console.log('Clients: Fetching data...');
      const data = await getClients();
      
      if (isMountedRef.current) {
        setClients(data.clients || data || []);
        setClientsStats(data.stats || { total: data.total || 0 });
        hasFetchedRef.current = true;
        
        // Incrementar refreshTrigger después de fetch exitoso
        if (forceRefresh) {
          setRefreshTrigger(prev => prev + 1);
        }
      }
      
      console.log('Clients: Fetch completed');
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
  }, [isAuthenticated]);

  // Función para refrescar manualmente
  const refreshClients = useCallback(() => {
    console.log('Clients: Manual refresh triggered');
    hasFetchedRef.current = false;
    fetchClients(true);
  }, [fetchClients]);

  // Función específica para obtener solo estadísticas
  const fetchClientsStats = useCallback(async () => {
    if (!isAuthenticated) {
      setClientsStats({ total: 0 });
      return;
    }

    try {
      console.log('Clients: Fetching stats only...');
      const data = await getClientsStats();
      
      if (isMountedRef.current) {
        setClientsStats(data.stats || { total: 0 });
      }
      
      console.log('Clients: Stats fetch completed');
    } catch (err) {
      console.error("Error fetching clients stats:", err);
    }
  }, [isAuthenticated]);

  // Ejecutar al iniciar
  useEffect(() => {
    isMountedRef.current = true;
    
    if (isAuthenticated && !hasFetchedRef.current && isMountedRef.current) {
      console.log('Clients: Initial fetch triggered');
      fetchClients();
    }
    
    return () => {
      isMountedRef.current = false;
      if (!isAuthenticated) {
        setClients([]);
        setClientsStats({ total: 0 });
        hasFetchedRef.current = false;
      }
    };
  }, [isAuthenticated, fetchClients]);

  /** CREAR CLIENTE */
  const createClient = async (client) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para crear clientes');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      const res = await createClientAPI(client);
      
      if (res.client) {
        setClients(prev => [...prev, res.client]);
        setClientsStats(prev => ({ 
          total: prev.total + 1 
        }));
        // Incrementar refreshTrigger para notificar a useInfiniteScroll
        setRefreshTrigger(prev => prev + 1);
      }
      
      return { 
        success: true, 
        client: res.client,
        ok: true 
      };
    } catch (err) {
      console.error('Error creating client:', err);
      setError(err.message);
      return { 
        success: false, 
        message: err.message,
        ok: false 
      };
    }
  };

  /** EDITAR CLIENTE */
  const editClient = async (id, clientData) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para editar clientes');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      const res = await updateClientAPI(id, clientData);
      
      if (res.client) {
        setClients(prev => prev.map(client => 
          client._id === id ? res.client : client
        ));
        // Incrementar refreshTrigger para notificar a useInfiniteScroll
        setRefreshTrigger(prev => prev + 1);
      }
      
      return { 
        success: true, 
        client: res.client,
        ok: true 
      };
    } catch (err) {
      console.error('Error updating client:', err);
      setError(err.message);
      return { 
        success: false, 
        message: err.message,
        ok: false 
      };
    }
  };

  // Función deleteClient
  const deleteClient = async (id) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar clientes');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      const res = await deleteClientAPI(id);
      
      setClients(prev => prev.filter(client => client._id !== id));
      setClientsStats(prev => ({ 
        total: Math.max(0, prev.total - 1) 
      }));
      // Incrementar refreshTrigger para notificar a useInfiniteScroll
      setRefreshTrigger(prev => prev + 1);
      
      return { 
        success: true,
        ok: true 
      };
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(err.message);
      return { 
        success: false, 
        message: err.message,
        ok: false 
      };
    }
  };

  /** Función para limpiar errores */
  const clearError = () => {
    setError(null);
  };

  return {
    clients,
    clientsStats,
    loading,
    error,
    refreshTrigger, // ← IMPORTANTE: Exportar refreshTrigger
    setError: clearError,
    fetchClients,
    refreshClients, // ← Exportar función de refresh
    fetchClientsStats,
    createClient,
    editClient,        
    deleteClient,
    isAuthenticated
  };
}