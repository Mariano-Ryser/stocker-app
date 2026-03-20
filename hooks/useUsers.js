// /frontend/hooks/useUsers.js - CORREGIDO
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { 
  getUsers, 
  updateUserAPI,
  deleteUserAPI,
  changeUserPlanAPI,
  changeUserRoleAPI,
  toggleUserStatusAPI,
  updatePlanAPI,
  createCompanyUserAPI,
  getCompanyUsersAPI,
  updateCompany,    // <- AQUI 
  uploadCompanyLogoAPI,
  deleteCompanyLogoAPI
} from '../services/userService';
 
export function useUsers() { 
  const [users, setUsers] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [userLimits, setUserLimits] = useState({ 
    maxUsers: 3, 
    createdUsers: 0, 
    remaining: 3 
  }); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

const { 
  user: currentUser, 
  isAuthenticated, 
  updateUser: updateAuthUser,
  updateCompany 
} = useAuth();

  // Verificar si el usuario actual tiene permisos de admin/ceo
  const hasAdminPermissions = useCallback(() => {
    if (!currentUser) return false;
    return currentUser.role === 'ceo' || currentUser.role === 'admin';
  }, [currentUser]);

  // Obtener lista completa de usuarios (solo admin/ceo)
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated || !hasAdminPermissions()) {
      setUsers([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data.users || data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, hasAdminPermissions]);

  // Obtener usuarios de la misma empresa
const fetchCompanyUsers = useCallback(async () => {
  if (!isAuthenticated) {
    setCompanyUsers([]);
    return;
  }
  
  setLoading(true);
  setError(null);
  try {
    const data = await getCompanyUsersAPI();
    
    // ✅ SI ES 404, la empresa fue eliminada - redirigir al login
    if (data && data.status === 404) {
      console.log('🏢 Empresa no encontrada - cerrando sesión');
      
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir al login después de un pequeño delay
      setTimeout(() => {
        window.location.href = '/login?reason=company_deleted';
      }, 1000);
      
      return;
    }
    
    if (data && data.ok === false) {
      setError(data.message);
      return;
    }
    
    if (data && data.ok === true) {
      setCompanyUsers(data.users || []);
      setUserLimits(data.userLimits || { 
        maxUsers: 3, 
        createdUsers: 0, 
        remaining: 3,
        canCreateMore: true
      });
    }
  } catch (err) {
    setError(err.message);
    console.error('Error fetching company users:', err);
  } finally {
    setLoading(false);
  }
}, [isAuthenticated]);

  // Ejecutar al iniciar y cuando refreshTrigger cambia
  useEffect(() => { 
    if (isAuthenticated) {
      if (hasAdminPermissions()) {
        fetchUsers(); 
      }
      fetchCompanyUsers();
    }
  }, [refreshTrigger, isAuthenticated, hasAdminPermissions, fetchUsers, fetchCompanyUsers]);

 /** ACTUALIZAR USUARIO - Versión simplificada */
const updateUser = async (id, userData) => {
  if (!isAuthenticated) {
    setError('No autenticado');
    return { success: false, error: 'No autenticado' };
  }
  
 // ⚠️ VERIFICACIÓN CRÍTICA: El ID no puede ser undefined
    if (!id || id === 'undefined' || id === undefined) {
      console.error('❌ ID inválido recibido:', id);
      setError('ID de usuario inválido');
      return { success: false, error: 'ID de usuario inválido' };
    }

 // Verificar permisos - comparar tanto _id como id
    const currentUserId = currentUser.id || currentUser._id;
    const canUpdate = currentUserId === id || hasAdminPermissions();

  if (!canUpdate) {
    setError('No tienes permisos para actualizar este usuario');
    return { success: false, error: 'Permisos insuficientes' };
  }
  
  setLoading(true);
  try {
     // console.log('🔄 Enviando actualización para ID:', id, 'Datos:', userData);
    const res = await updateUserAPI(id, userData);

      if (!res || !res.user) {
        throw new Error('No se recibió información del usuario actualizado');
      }
          // Normalizar IDs para comparaciones
      const updatedUserId = res.user._id || res.user.id;

   // Actualizar la lista de usuarios si es admin/ceo
      if (hasAdminPermissions() && res.user) {
        setUsers(prev => prev.map(user => {
          const userId = user._id || user.id;
          return userId === updatedUserId ? { ...user, ...res.user } : user;
        }));
      }
    
       // Actualizar usuarios de empresa
      if (res.user) {
        setCompanyUsers(prev => prev.map(user => {
          const userId = user._id || user.id;
          return userId === updatedUserId ? { ...user, ...res.user } : user;
        }));
      }
    
 // Actualizar contexto global si es el usuario actual
      if (currentUserId === id) {
        // console.log('✅ Actualizando usuario en contexto:', res.user);
        updateAuthUser({
          ...currentUser,
          ...res.user,
          // Asegurar que siempre tengamos language
          language: res.user.language || currentUser.language || 'de'
        });
      }
      
      setRefreshTrigger(prev => prev + 1);
    
    return { 
      success: true, 
      user: res.user,
      ok: true 
    };
  } catch (err) {
    console.error('Error updating user:', err);
    setError(err.message);
    return { 
      success: false, 
      error: err.message,
      ok: false 
    };
  } finally {
    setLoading(false);
  }
};

  /** CREAR USUARIO EN LA MISMA EMPRESA */
const createCompanyUser = async (userData) => {
  if (!isAuthenticated) {
    return { 
      success: false, 
      error: 'No autenticado',
      message: 'No autenticado'
    };
  }
  
  setLoading(true);
  setError(null); // Limpiar errores anteriores
  
  try {
    const res = await createCompanyUserAPI(userData);
    
    // SIEMPRE retorna un objeto, nunca lanza error
    if (res.ok && res.user) {
      // Actualizar lista de usuarios de empresa
      setCompanyUsers(prev => [...prev, res.user]);
      
      // Actualizar límites
      if (res.userLimits) {
        setUserLimits(res.userLimits);
      }
      
      setRefreshTrigger(prev => prev + 1);
      
      return { 
        success: true, 
        user: res.user,
        message: res.message,
        ok: true 
      };
    } else {
      // Si no es ok, retornamos el error sin lanzar excepción
      return { 
        success: false, 
        error: res.message,
        message: res.message,
        ok: false 
      };
    }
    
  } catch (err) {
    // Este bloque solo se ejecutará si hay un error inesperado
    console.error('Error inesperado en createCompanyUser:', err);
    return { 
      success: false, 
      error: err.message || 'Error inesperado',
      message: err.message || 'Error inesperado',
      ok: false 
    };
  } finally {
    setLoading(false);
  }
};

/** SUBIR LOGO DE EMPRESA */
const uploadCompanyLogo = async (id, file, company, updateCompany) => {
  if (!isAuthenticated) {
    setError('No autenticado');
    return { success: false, error: 'No autenticado' };
  }

  const canUpload = currentUser.id === id || hasAdminPermissions();
  if (!canUpload) {
    setError('No tienes permisos para subir el logo');
    return { success: false, error: 'Permisos insuficientes' };
  }

  if (!file) {
    setError('No se seleccionó ningún archivo');
    return { success: false, error: 'Archivo vacío' };
  }

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append('logo', file);

    // Preview inmediato
    if (updateCompany && company) {
      const previewURL = URL.createObjectURL(file);
      updateCompany({ ...company, logo: previewURL });
    }

    const res = await uploadCompanyLogoAPI(id, formData);

    if (res.company && updateCompany) {
      // Actualización final con la info real
      updateCompany(res.company);
    }

    setRefreshTrigger(prev => prev + 1);

    return { success: true, company: res.company, ok: true };
  } catch (err) {
    console.error('Error subiendo logo:', err);
    setError(err.message);
    return { success: false, error: err.message, ok: false };
  } finally {
    setLoading(false);
  }
};
const deleteCompanyUser = async (userId) => {
  if (!isAuthenticated || !hasAdminPermissions()) {
    setError('No tienes permisos para eliminar usuarios');
    return { success: false, error: 'Permisos insuficientes' };
  }
  
  // No permitir eliminarse a sí mismo
  const currentUserId = currentUser.id || currentUser._id;
  if (currentUserId === userId) {
    setError('No puedes eliminarte a ti mismo');
    return { success: false, error: 'No puedes eliminarte a ti mismo' };
  }
  
  setLoading(true);
  try {
    const res = await deleteUserAPI(userId);
    
    if (res && res.ok) {
      // Eliminar de la lista local
      setCompanyUsers(prev => prev.filter(user => user._id !== userId));
      setRefreshTrigger(prev => prev + 1);
      
      return { success: true };
    } else {
      setError(res?.message || 'Error al eliminar usuario');
      return { success: false, error: res?.message };
    }
  } catch (err) {
    console.error('Error eliminando usuario:', err);
    setError(err.message);
    return { success: false, error: err.message };
  } finally {
    setLoading(false);
  }
};
/** ELIMINAR LOGO DE EMPRESA */
const deleteCompanyLogo = async (id) => {
  if (!isAuthenticated) {
    setError('No autenticado');
    return { success: false, error: 'No autenticado' };
  }

  const canDelete = currentUser.id === id || hasAdminPermissions();
  if (!canDelete) {
    setError('No tienes permisos para eliminar el logo');
    return { success: false, error: 'Permisos insuficientes' };
  }

  setLoading(true);
  try {
    const res = await deleteCompanyLogoAPI(id);

    if (res.company) {
      // Actualizar contexto global
      updateCompany(res.company); // Esto actualizará automáticamente el sidebar
    }

    setRefreshTrigger(prev => prev + 1);

    return { success: true, company: res.company, ok: true };
  } catch (err) {
    console.error('Error eliminando logo:', err);
    setError(err.message);
    return { success: false, error: err.message, ok: false };
  } finally {
    setLoading(false);
  }
};

  /** ACTIVAR/DESACTIVAR USUARIO */
  const toggleUserStatus = async (id, isActive) => {
    if (!isAuthenticated || !hasAdminPermissions()) {
      setError('No tienes permisos para cambiar estado');
      return { success: false, error: 'Permisos insuficientes' };
    }
    
    // No permitir desactivarse a sí mismo
    if (currentUser.id === id && !isActive) {
      setError('No puedes desactivarte a ti mismo');
      return { success: false, error: 'No puedes desactivarte a ti mismo' };
    }
    
    setLoading(true);
    try {
      const res = await toggleUserStatusAPI(id, isActive);
      
      if (res.user) {
        // Actualizar ambas listas
         setUsers(prev => prev.map(user => {
            const userId = user._id || user.id;
            return userId === id ? { ...user, isActive: res.user.isActive } : user;
          }));
          setCompanyUsers(prev => prev.map(user => {
            const userId = user._id || user.id;
            return userId === id ? { ...user, isActive: res.user.isActive } : user;
          }));
        }
      
      setRefreshTrigger(prev => prev + 1);
      
      return { 
        success: true, 
        user: res.user,
        ok: true 
      };
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.message);
      return { 
        success: false, 
        error: err.message,
        ok: false 
      };
    } finally {
      setLoading(false);
    }
  };

  /** Función para limpiar errores */
  const clearError = () => {
    setError(null);
  };

  /** Buscar usuario por ID */
  const getUserById = (id) => {
    return users.find(user => user._id === id) || 
           companyUsers.find(user => user._id === id);
  };

  /** Filtrar usuarios por rol o plan */
  const filterUsers = (criteria) => {
    const source = criteria.companyOnly ? companyUsers : users;
    
    return source.filter(user => {
      let matches = true;
      
      if (criteria.role && user.role !== criteria.role) matches = false;
      if (criteria.plan && user.plan !== criteria.plan) matches = false;
      if (criteria.isActive !== undefined && user.isActive !== criteria.isActive) matches = false;
      if (criteria.searchTerm) {
        const searchLower = criteria.searchTerm.toLowerCase();
        matches = matches && (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.company.toLowerCase().includes(searchLower)
        );
      }
      
      return matches;
    });
  };

  /** Función para forzar refresh manual */
  const refreshUsers = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    // Estados
   users,
    companyUsers,
    userLimits,
    loading,
    error,
    
    // Funciones
    clearError,
    fetchUsers,
    fetchCompanyUsers,
    updateUser,
    createCompanyUser,
    deleteUser: deleteUserAPI, // Nota: esta función no está implementada en el hook
    changeUserPlan: changeUserPlanAPI, // Nota: esta función no está implementada en el hook
    changeUserRole: changeUserRoleAPI, // Nota: esta función no está implementada en el hook
    toggleUserStatus,
    uploadCompanyLogo,
    deleteCompanyLogo,
    getUserById,
    filterUsers,
    refreshUsers,
    refreshTrigger,
    deleteCompanyUser,


    // Propiedades
    isAuthenticated,
    hasAdminPermissions,
    currentUser
  };
}