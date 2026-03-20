// hooks/useCEOData.js - VERSIÓN SIMPLIFICADA
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
      console.log('📊 Cargando usuarios...');
      
      // 1. Obtener todos los usuarios
      const usersRes = await fetch(`${URI}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!usersRes.ok) throw new Error('Error al obtener usuarios');
      const usersData = await usersRes.json();
      
      if (!usersData.ok) throw new Error(usersData.message);

      console.log(`📦 Total usuarios: ${usersData.users.length}`);

      // 2. Obtener todas las empresas en una sola llamada (paralelo)
      const companiesMap = new Map();
      const companyIds = [...new Set(usersData.users.map(u => u.companyId).filter(Boolean))];
      
      await Promise.all(companyIds.map(async (companyId) => {
        try {
          const companyRes = await fetch(`${URI}/company/${companyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (companyRes.ok) {
            const companyData = await companyRes.json();
            const company = companyData.company || companyData;
            companiesMap.set(companyId, {
              name: company?.name || 'Sin nombre',
              maxUsers: company?.maxUsers || 3,
              usersCount: company?.usersCount || 0
            });
          }
        } catch (err) {
          console.warn(`Error obteniendo empresa ${companyId}:`, err);
        }
      }));

      // 3. Construir usuarios con datos de empresa
      const usersWithCompany = usersData.users.map(userItem => ({
        _id: userItem._id,
        name: userItem.name,
        email: userItem.email,
        role: userItem.role,
        plan: userItem.plan,
        isActive: userItem.isActive,
        createdAt: userItem.createdAt,
        updatedAt: userItem.updatedAt,
        companyId: userItem.companyId,
        company: companiesMap.get(userItem.companyId) || {
          name: 'Sin empresa',
          maxUsers: 3,
          usersCount: 0
        },
        // Inicializamos stats vacías (se cargarán bajo demanda en el modal)
        stats: {
          products: 0,
          sales: 0,
          clients: 0,
          revenue: 0
        }
      }));

      setUsers(usersWithCompany);

      // 4. Calcular estadísticas básicas (sin productos/ventas globales)
      const globalStats = usersWithCompany.reduce((acc, userItem) => {
        acc.totalUsers++;
        if (userItem.isActive) acc.activeUsers++;
        else acc.inactiveUsers++;
        
        if (userItem.plan) acc.plans[userItem.plan] = (acc.plans[userItem.plan] || 0) + 1;
        if (userItem.role) acc.roles[userItem.role] = (acc.roles[userItem.role] || 0) + 1;
        
        return acc;
      }, {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalCompanies: companiesMap.size,
        totalProducts: 0,
        totalSales: 0,
        totalClients: 0,
        totalRevenue: 0,
        plans: { basic: 0, medium: 0, pro: 0 },
        roles: { ceo: 0, admin: 0, user: 0 }
      });

      setStats(globalStats);
      console.log(`✅ Cargados ${usersWithCompany.length} usuarios`);

    } catch (err) {
      console.error('Error fetching CEO data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user, URI]);

  // Funciones para actualizar usuario en la lista local
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
    updateUserInList
  };
};