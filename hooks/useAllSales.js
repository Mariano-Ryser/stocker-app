// hooks/useAllSales.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { getAllSalesAPI } from '../services/saleService';

export function useAllSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth(); 
  const companyId = user?.companyId;

  const fetchAllSales = useCallback(async () => {
    if (!isAuthenticated || !companyId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar a una API que traiga TODAS las facturas sin paginación
      const data = await getAllSalesAPI();
      
      if (data.ok && data.sales) {
        setSales(data.sales);
      } else {
        setSales([]);
      }
    } catch (err) {
      console.error('Error fetching all sales:', err);
      setError(err.message);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, companyId]);

  useEffect(() => {
    fetchAllSales();
  }, [fetchAllSales]);

  return {
    sales,
    loading,
    error,
    refreshSales: fetchAllSales
  };
}