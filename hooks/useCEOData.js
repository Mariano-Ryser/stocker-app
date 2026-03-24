// hooks/useCEOData.js - VERSIÓN CORREGIDA
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';

export const useCEOData = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalCompanies: 0,
    totalProducts: 0,
    totalSales: 0,
    totalClients: 0,
    totalRevenue: 0,
    plans: { basic: 0, medium: 0, pro: 0 },
    roles: { ceo: 0, admin: 0, user: 0 }
  });

  const URI = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchUsers = useCallback(async () => {
    if (!token || user?.role !== 'ceo') return;

    setLoading(true);
    setError(null);

    try {
      console.log('📊 Cargando todos los usuarios del sistema...');
      
      // 1. Obtener TODOS los usuarios
      const usersRes = await fetch(`${URI}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!usersRes.ok) throw new Error('Error al obtener usuarios');
      const usersData = await usersRes.json();
      
      if (!usersData.ok) throw new Error(usersData.message);

      console.log(`📦 Total usuarios encontrados: ${usersData.users.length}`);

      // 2. Obtener todas las empresas únicas
      const companyIds = [...new Set(usersData.users.map(u => u.companyId).filter(Boolean))];
      console.log(`🏢 Empresas únicas: ${companyIds.length}`);
      
      // 3. Obtener datos de cada empresa y sus productos en paralelo
      const companiesMap = new Map();
      
      await Promise.all(companyIds.map(async (companyId) => {
        try {
          // Obtener datos de la empresa
          const companyRes = await fetch(`${URI}/company/${companyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          let companyData = { name: 'Sin empresa', maxUsers: 3, maxProducts: 100, usersCount: 0 };
          let productsCount = 0;
          
          if (companyRes.ok) {
            const data = await companyRes.json();
            const company = data.company || data;
            companyData = {
              _id: companyId,
              name: company?.name || 'Sin nombre',
              maxUsers: company?.maxUsers || 3,
              maxProducts: company?.maxProducts || 100,
              usersCount: company?.usersCount || 0
            };
          }
          
          // ✅ OBTENER EL CONTADOR DE PRODUCTOS DE LA EMPRESA
          try {
            const limitsRes = await fetch(`${URI}/company/${companyId}/limits`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (limitsRes.ok) {
              const limitsData = await limitsRes.json();
              if (limitsData.ok && limitsData.limits) {
                productsCount = limitsData.limits.current || 0;
              }
            }
          } catch (err) {
            console.warn(`Error obteniendo límites de empresa ${companyId}:`, err);
          }
          
          companiesMap.set(companyId, {
            ...companyData,
            productsCount: productsCount
          });
        } catch (err) {
          console.warn(`Error obteniendo empresa ${companyId}:`, err);
          companiesMap.set(companyId, {
            _id: companyId,
            name: 'Sin empresa',
            maxUsers: 3,
            maxProducts: 100,
            usersCount: 0,
            productsCount: 0
          });
        }
      }));

      // 4. Construir usuarios con datos de empresa y productos
      const usersWithCompany = usersData.users.map(userItem => {
        const company = companiesMap.get(userItem.companyId) || {
          name: 'Sin empresa',
          maxUsers: 3,
          maxProducts: 100,
          usersCount: 0,
          productsCount: 0
        };
        
        return {
          _id: userItem._id,
          name: userItem.name,
          email: userItem.email,
          role: userItem.role,
          plan: userItem.plan,
          isActive: userItem.isActive,
          createdAt: userItem.createdAt,
          updatedAt: userItem.updatedAt,
          companyId: userItem.companyId,
          company: {
            name: company.name,
            maxUsers: company.maxUsers,
            maxProducts: company.maxProducts,
            usersCount: company.usersCount,
            productsCount: company.productsCount
          },
          stats: {
            products: company.productsCount, // ✅ AHORA SÍ TIENE EL CONTADOR REAL
            sales: 0,
            clients: 0,
            revenue: 0
          }
        };
      });

      setUsers(usersWithCompany);

      // 5. Calcular estadísticas globales
      const uniqueCompanies = new Map();
      const globalStats = usersWithCompany.reduce((acc, userItem) => {
        // Contar usuarios
        acc.totalUsers++;
        if (userItem.isActive) acc.activeUsers++;
        else acc.inactiveUsers++;
        
        // Contar productos totales del sistema
        acc.totalProducts += userItem.stats?.products || 0;
        
        // Contar por plan
        if (userItem.plan) acc.plans[userItem.plan] = (acc.plans[userItem.plan] || 0) + 1;
        
        // Contar por rol
        if (userItem.role) acc.roles[userItem.role] = (acc.roles[userItem.role] || 0) + 1;
        
        // Contar empresas únicas
        if (userItem.companyId && !uniqueCompanies.has(userItem.companyId)) {
          uniqueCompanies.set(userItem.companyId, true);
        }
        
        return acc;
      }, {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalCompanies: 0,
        totalProducts: 0,
        totalSales: 0,
        totalClients: 0,
        totalRevenue: 0,
        plans: { basic: 0, medium: 0, pro: 0 },
        roles: { ceo: 0, admin: 0, user: 0 }
      });

      globalStats.totalCompanies = uniqueCompanies.size;
      setStats(globalStats);
      
      console.log(`✅ Cargados ${usersWithCompany.length} usuarios con sus contadores de productos`);

    } catch (err) {
      console.error('Error fetching CEO data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user, URI]);

  const updateUserInList = (userId, updates) => {
    setUsers(prev => prev.map(u => 
      u._id === userId ? { ...u, ...updates } : u
    ));
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await fetch(`${URI}/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await res.json();

      if (data.ok) {
        updateUserInList(userId, { isActive: !currentStatus });
        
        setStats(prev => ({
          ...prev,
          activeUsers: prev.activeUsers + (currentStatus ? -1 : 1),
          inactiveUsers: prev.inactiveUsers + (currentStatus ? 1 : -1)
        }));

        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const changeUserPlan = async (userId, newPlan) => {
    try {
      const res = await fetch(`${URI}/users/${userId}/plan`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: newPlan })
      });

      const data = await res.json();

      if (data.ok) {
        const oldPlan = users.find(u => u._id === userId)?.plan;
        updateUserInList(userId, { plan: newPlan });
        
        setStats(prev => {
          const newStats = { ...prev };
          if (oldPlan) newStats.plans[oldPlan]--;
          newStats.plans[newPlan]++;
          return newStats;
        });

        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ✅ Función para refrescar un usuario específico (después de cambios)
  const refreshUser = useCallback(async (userId, companyId) => {
    if (!token) return;
    
    try {
      // Obtener límites actualizados de la empresa
      const limitsRes = await fetch(`${URI}/company/${companyId}/limits`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      let productsCount = 0;
      if (limitsRes.ok) {
        const limitsData = await limitsRes.json();
        if (limitsData.ok && limitsData.limits) {
          productsCount = limitsData.limits.current || 0;
        }
      }
      
      // Actualizar usuario en la lista
      updateUserInList(userId, {
        stats: {
          ...users.find(u => u._id === userId)?.stats,
          products: productsCount
        },
        company: {
          ...users.find(u => u._id === userId)?.company,
          productsCount: productsCount
        }
      });
      
      // Actualizar estadísticas globales
      setStats(prev => ({
        ...prev,
        totalProducts: prev.totalProducts - (users.find(u => u._id === userId)?.stats?.products || 0) + productsCount
      }));
      
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  }, [token, URI, users]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    stats,
    toggleUserStatus,
    changeUserPlan,
    refresh: fetchUsers,
    refreshUser,
    updateUserInList
  };
};