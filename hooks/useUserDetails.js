// hooks/useUserDetails.js - VERSIÓN POR COMPAÑÍA
import { useState, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';

export const useUserDetails = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const URI = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchUserDetails = useCallback(async (userId, companyId) => {
    if (!token || !userId || !companyId) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Cargando estadísticas para compañía: ${companyId}`);

      // Hacer todas las llamadas en paralelo usando companyId
      const [productsRes, salesRes, clientsRes] = await Promise.all([
        fetch(`${URI}/products/company/${companyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${URI}/sales/company/${companyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${URI}/clients/company/${companyId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [productsData, salesData, clientsData] = await Promise.all([
        productsRes.ok ? productsRes.json() : { products: [], count: 0 },
        salesRes.ok ? salesRes.json() : { sales: [], count: 0, totalAmount: 0 },
        clientsRes.ok ? clientsRes.json() : { clients: [], count: 0 }
      ]);

      // console.log('📦 Productos de la compañía:', productsData.count);
      // console.log('💰 Ventas de la compañía:', salesData.count);
      // console.log('👥 Clientes de la compañía:', clientsData.count);

      const stats = {
        products: productsData.count || 0,
        sales: salesData.count || 0,
        clients: clientsData.count || 0,
        revenue: salesData.totalAmount || 0
      };

      // Guardamos también los productos si los necesitas mostrar
      const products = productsData.products || [];

      setUserDetails({ 
        stats,
        products // Para mostrar la lista de productos
      });

    } catch (err) {
      console.error('Error fetching company stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, URI]);

  const clearUserDetails = useCallback(() => {
    setUserDetails(null);
    setError(null);
  }, []);

  return {
    userDetails,
    loading,
    error,
    fetchUserDetails,
    clearUserDetails
  };
};