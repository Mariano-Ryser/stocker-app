import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';

export function useSalesForImport() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const fetchSales = useCallback(async () => {
    if (!isAuthenticated) {
      setSales([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const API_URL = `${API_BASE_URL}/sales`;
      console.log('Fetching sales for import/export from:', API_URL);
      
      const res = await fetch(API_URL, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al obtener ventas: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Extraer solo las ventas, no las estadísticas
      const salesData = data.sales || data || [];
      setSales(salesData);
      
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, API_BASE_URL]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSales();
    }
  }, [isAuthenticated, fetchSales]);

  const refreshSales = useCallback(() => {
    fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    error,
    refreshSales
  };
}