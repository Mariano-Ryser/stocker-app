// hooks/useCompanyCleanup.js
import { useState, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import * as cleanupService from '../services/companyCleanupService';

export function useCompanyCleanup() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const cleanupCompany = useCallback(async (companyId, options = {}) => {
    const {
      deleteProducts = true,
      deleteSales = true,
      deleteStockMovements = true, 
      deleteClients = true,
      deleteUsers = true,
      deleteCompany = true,
      exceptUserId = user?._id
    } = options;

    if (!companyId) {
      setError('ID de compañía requerido');
      return { success: false }; 
    }

    setLoading(true);
    setError(null);

    try {
      const results = {};

      // Ejecutar en orden específico para mantener integridad referencial
      if (deleteProducts) {
        results.products = await cleanupService.deleteCompanyProducts(companyId);
      }
      
      if (deleteSales) {
        results.sales = await cleanupService.deleteCompanySales(companyId);
      }
      
      if (deleteStockMovements) {
        results.stockMovements = await cleanupService.deleteCompanyStockMovements(companyId);
      }
      
      if (deleteClients) {
        results.clients = await cleanupService.deleteCompanyClients(companyId);
      }
      
      if (deleteUsers) {
        results.users = await cleanupService.deleteCompanyUsers(companyId, exceptUserId);
      }
      
      if (deleteCompany) {
        results.company = await cleanupService.deleteCompany(companyId);
      }

      setResults(results);
      return { success: true, results };
      
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Eliminar solo productos
  const cleanupProducts = useCallback(async (companyId) => {
    return cleanupCompany(companyId, {
      deleteSales: false,
      deleteStockMovements: false,
      deleteClients: false,
      deleteUsers: false,
      deleteCompany: false
    });
  }, [cleanupCompany]);

  // Eliminar solo ventas
  const cleanupSales = useCallback(async (companyId) => {
    return cleanupCompany(companyId, {
      deleteProducts: false,
      deleteStockMovements: false,
      deleteClients: false,
      deleteUsers: false,
      deleteCompany: false
    });
  }, [cleanupCompany]);

  // Eliminar solo clientes
  const cleanupClients = useCallback(async (companyId) => {
    return cleanupCompany(companyId, {
      deleteProducts: false,
      deleteSales: false,
      deleteStockMovements: false,
      deleteUsers: false,
      deleteCompany: false
    });
  }, [cleanupCompany]);

  return {
    loading,
    error,
    results,
    cleanupCompany,
    cleanupProducts,
    cleanupSales,
    cleanupClients,
    clearError: () => setError(null)
  };
}