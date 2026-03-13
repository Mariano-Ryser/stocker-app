// hooks/useCEOData.js - CORREGIDO

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
    plans: {
      basic: 0,
      medium: 0,
      pro: 0
    },
    roles: {
      ceo: 0,
      admin: 0,
      user: 0
    }
  });

  const URI = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchAllUsersWithStats = useCallback(async () => {
    if (!token || user?.role !== 'ceo') return;

    setLoading(true);
    setError(null);

    try {
      // Obtener todos los usuarios
      const usersRes = await fetch(`${URI}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!usersRes.ok) throw new Error('Error al obtener usuarios');
      const usersData = await usersRes.json();
      
      if (!usersData.ok) throw new Error(usersData.message);

      console.log('📊 Usuarios obtenidos:', usersData.users.length);

      // Para cada usuario, obtener sus estadísticas
      const usersWithStats = await Promise.all(
        usersData.users.map(async (userItem) => {
          try {
            // Obtener productos del usuario
            const productsRes = await fetch(`${URI}/products/user/${userItem._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const productsData = await productsRes.json();

            // Obtener ventas del usuario
            const salesRes = await fetch(`${URI}/sales/user/${userItem._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const salesData = await salesRes.json();

            // Obtener clientes del usuario
            const clientsRes = await fetch(`${URI}/clients/user/${userItem._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const clientsData = await clientsRes.json();

            // 🔥 CORREGIDO: Usar userItem.companyId (NO userItem._id)
            let companyData = { 
              company: { 
                name: 'Sin empresa', 
                maxUsers: 3, 
                usersCount: 0 
              } 
            };
            
            if (userItem.companyId) {
              console.log(`🔍 Buscando empresa ${userItem.companyId} para usuario ${userItem._id}`);
              
              const companyRes = await fetch(`${URI}/company/${userItem.companyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (companyRes.ok) {
                companyData = await companyRes.json();
                console.log(`✅ Empresa encontrada: ${companyData.company?.name}`);
              } else {
                console.warn(`❌ No se pudo obtener empresa ${userItem.companyId} para usuario ${userItem._id}`);
              }
            } else {
              console.warn(`⚠️ Usuario ${userItem._id} no tiene companyId`);
            }

            return {
              ...userItem,
              stats: {
                products: productsData.products?.length || 0,
                sales: salesData.sales?.length || 0,
                clients: clientsData.clients?.length || 0,
                salesTotal: salesData.sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
              },
              company: companyData.company || { 
                name: 'Sin empresa', 
                maxUsers: 3,
                usersCount: 0 
              }
            };
          } catch (err) {
            console.error(`Error obteniendo stats para usuario ${userItem._id}:`, err);
            return {
              ...userItem,
              stats: { products: 0, sales: 0, clients: 0, salesTotal: 0 },
              company: { name: 'Error cargando', maxUsers: 3, usersCount: 0 }
            };
          }
        })
      );

      setUsers(usersWithStats);

      // Calcular estadísticas globales
      const globalStats = usersWithStats.reduce((acc, userItem) => {
        acc.totalUsers++;
        if (userItem.isActive) acc.activeUsers++;
        else acc.inactiveUsers++;
        
        if (userItem.plan) acc.plans[userItem.plan] = (acc.plans[userItem.plan] || 0) + 1;
        if (userItem.role) acc.roles[userItem.role] = (acc.roles[userItem.role] || 0) + 1;
        
        acc.totalProducts += userItem.stats?.products || 0;
        acc.totalSales += userItem.stats?.sales || 0;
        acc.totalClients += userItem.stats?.clients || 0;
        
        return acc;
      }, {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalCompanies: new Set(usersWithStats.map(u => u.companyId).filter(Boolean)).size,
        totalProducts: 0,
        totalSales: 0,
        totalClients: 0,
        plans: { basic: 0, medium: 0, pro: 0 },
        roles: { ceo: 0, admin: 0, user: 0 }
      });

      setStats(globalStats);
      console.log('📈 Estadísticas calculadas:', globalStats);

    } catch (err) {
      console.error('Error fetching CEO data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, user, URI]);

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
        setUsers(prev => prev.map(u => 
          u._id === userId ? { ...u, isActive: !currentStatus } : u
        ));
        
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
        setUsers(prev => prev.map(u => 
          u._id === userId ? { ...u, plan: newPlan } : u
        ));
        
        setStats(prev => {
          const oldPlan = users.find(u => u._id === userId)?.plan;
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
    fetchAllUsersWithStats();
  }, [fetchAllUsersWithStats]);

  return {
    users,
    loading,
    error,
    stats,
    toggleUserStatus,
    changeUserPlan,
    refresh: fetchAllUsersWithStats
  };
};