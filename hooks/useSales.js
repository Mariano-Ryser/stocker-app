// hooks/useSales.js
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
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  
  // Use refs para controlar estado sin causar re-renders
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // ✅ FUNCIÓN ÚNICA para fetch (elimina la lógica de paginación)
  const fetchSales = useCallback(async (forceRefresh = false) => {
    // Si no está autenticado, limpiar
    if (!isAuthenticated) {
      setSales([]);
      setSalesStats({});
      hasFetchedRef.current = false;
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (isFetchingRef.current && !forceRefresh) {
      // console.log('Sales: Already fetching, skipping...');
      return;
    }

    // Si ya fetchamos y no es force refresh, skip
    if (hasFetchedRef.current && !forceRefresh) {
      // console.log('Sales: Already fetched, skipping...');
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // console.log('Sales: Fetching data...');
      const data = await getSales(); // ✅ Esto ya devuelve {sales, stats}
      
      const newSales = data.sales || [];
      const newStats = data.stats || {};

      setSales(newSales);
      setSalesStats(newStats);
      hasFetchedRef.current = true;
      
      // console.log('Sales: Fetch completed');
      
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err.message);
      hasFetchedRef.current = false;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated]);

  // ✅ SOLO fetch cuando isAuthenticated cambia (montaje)
  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      // console.log('Sales: Initial fetch triggered');
      fetchSales();
    }
    
    // Cleanup cuando se desmonta o desautentica
    return () => {
      if (!isAuthenticated) {
        setSales([]);
        setSalesStats({});
        hasFetchedRef.current = false;
      }
    };
  }, [isAuthenticated, fetchSales]);

  // ✅ Función de refresh manual
  const refreshSales = useCallback(() => {
    // console.log('Sales: Manual refresh triggered');
    hasFetchedRef.current = false;
    fetchSales(true);
  }, [fetchSales]);

  // ✅ Función createSale optimizada
  const createSale = async (payload) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Debe iniciar sesión' };
    }
    
    try {
      // console.log('Creating sale...');
      const res = await createSaleAPI(payload);
      
      // console.log('API Response:', res);

      // Si hay error
      if (!res.success) {
        return { 
          success: false, 
          message: res.message,
          type: res.type 
        };
      }

      // Si es éxito, actualizar estado local
      const saleData = res.data;
      
      if (saleData?.sale) {
        // Añadir nueva venta al principio
        setSales(prev => [saleData.sale, ...prev]);
        
        // Actualizar stats si es venta pagada
        if (saleData.sale.status === 'paid') {
          setSalesStats(prev => ({
            ...prev,
            paidCount: prev.paidCount + 1,
            totalUmsatz: prev.totalUmsatz + (saleData.sale.total || 0),
            totalAllSales: prev.totalAllSales + 1
          }));
        }
      }
      
      return { 
        success: true, 
        sale: saleData?.sale || saleData 
      };
      
    } catch (err) {
      console.error('Error creating sale:', err);
      return { 
        success: false, 
        message: err.message 
      };
    }
  };

  // ✅ Función updateSale optimizada
const updateSale = async (id, payload) => {
  if (!isAuthenticated) {
    setError('Debe iniciar sesión para actualizar ventas');
    return { success: false, message: 'No autenticado' };
  }
  
  try {
    // console.log('Updating sale...');
    const res = await updateSaleAPI(id, payload);

    // Actualizar lista local si tenemos respuesta
    if (res.sale) {
      setSales(prev => prev.map(sale => 
        sale._id === id ? res.sale : sale
      ));
      // console.log('✅ Venta actualizada en estado local:', res.sale);
    } else {
      // console.log('⚠️ No se recibió sale en la respuesta');
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

  // ✅ Función deleteSale optimizada
  const deleteSale = async (id) => {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar ventas');
      return { success: false, message: 'No autenticado' };
    }
    
    try {
      // console.log('Deleting sale...');
      await deleteSaleAPI(id);

      // Eliminar de la lista local
      const saleToDelete = sales.find(s => s._id === id);
      
      setSales(prev => prev.filter(sale => sale._id !== id));
      
      // Si era una venta pagada, actualizar stats
      if (saleToDelete?.status === 'paid') {
        setSalesStats(prev => ({
          ...prev,
          paidCount: Math.max(0, prev.paidCount - 1),
          totalUmsatz: Math.max(0, prev.totalUmsatz - (saleToDelete.total || 0))
        }));
      }
      
      return { 
        success: true 
      };
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError(err.message);
      return { 
        success: false, 
        message: err.message 
      };
    }
  };

  return {
    sales,
    salesStats,
    loading,
    error,
    fetchSales, // Exportar para coordinación
    refreshSales,
    createSale,
    updateSale,
    deleteSale,
    isAuthenticated
  };
}