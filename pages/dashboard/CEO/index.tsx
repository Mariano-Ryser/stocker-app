// pages/dashboard/CEO/index.jsx - CON VISTA EXCEL
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useCEOData } from '../../../hooks/useCEOData';
import { updateProductLimitAPI } from '../../../services/companyService';
import UserDetailModal from '../../../components/dashboard/CEO/UserDetailModal';
import styles from './ceoDashboard.module.css';

export default function CEODashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { users, loading, error, stats, toggleUserStatus, changeUserPlan, refresh, refreshUser } = useCEOData();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPlan, setFilterPlan] = useState('todos');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('excel');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user && user.role !== 'ceo') {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const getPlanName = (plan:any) => {
    const plans = {
      basic: 'Básico',
      medium: 'Medio',
      pro: 'Profesional'
    };
    return plans[plan] || plan;
  };

  const getRoleName = (role:any) => {
    const roles = {
      ceo: 'CEO',
      admin: 'Admin',
      user: 'Usuario'
    };
    return roles[role] || role;
  };

  // Manejar cambio de límite de productos
  const handleProductLimitChange = async (companyId:any, newLimit:any) => {
    setActionLoading(true);
    try {
      const result = await updateProductLimitAPI(companyId, newLimit);
      
      if (result.success) {
        // Disparar evento para actualizar límites en toda la app
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('refreshProductLimits'));
        }
        
        // ✅ REFRESCAR EL USUARIO ESPECÍFICO EN LUGAR DE TODOS
        if (selectedUserData) {
          await refreshUser(selectedUserData._id, companyId);
        }
        
        // Actualizar los datos locales del usuario seleccionado
        if (selectedUserData && selectedUserData.companyId === companyId) {
          setSelectedUserData(prev => ({
            ...prev,
            company: {
              ...prev.company,
              maxProducts: newLimit
            },
            stats: {
              ...prev.stats,
              products: prev.stats?.products || 0
            }
          }));
        }
        
        return { success: true };
      } else {
        alert(result.error || 'Error al actualizar el límite');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error updating product limit:', error);
      alert('Error al actualizar el límite: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando panel de control...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Error al cargar los datos</h2>
        <p>{error}</p>
        <button onClick={refresh} className={styles.retryButton}>
          Reintentar
        </button>
      </div>
    );
  }

  const filteredUsers = users.filter(userItem => {
    const matchesSearch = 
      userItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'todos' ? true :
      filterStatus === 'activos' ? userItem.isActive :
      filterStatus === 'inactivos' ? !userItem.isActive : true;
    
    const matchesPlan = 
      filterPlan === 'todos' ? true : userItem.plan === filterPlan;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleToggleStatus = async (userId, currentStatus) => {
    setActionLoading(true);
    const result = await toggleUserStatus(userId, currentStatus);
    if (!result.success) {
      alert(result.error || 'Error al cambiar el estado del usuario');
    }
    setActionLoading(false);
  };

  const handleChangePlan = async (userId, newPlan) => {
    setActionLoading(true);
    const result = await changeUserPlan(userId, newPlan);
    if (!result.success) {
      alert(result.error || 'Error al cambiar el plan');
    }
    setActionLoading(false);
    setShowUserModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const openUserModal = (userData) => {
    setSelectedUserId(userData._id);
    setSelectedUserData(userData);
    setShowUserModal(true);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Panel de Control CEO</h1>
          <p className={styles.subtitle}>Gestión completa de usuarios y empresas</p>
        </div>
        
        <div className={styles.headerActions}>
          {/* Toggle de vista */}
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'table' ? styles.activeView : ''}`}
              onClick={() => setViewMode('table')}
              title="Vista Tabla"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/>
              </svg>
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'excel' ? styles.activeView : ''}`}
              onClick={() => setViewMode('excel')}
              title="Vista Excel"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h5v2H7v-2z"/>
              </svg>
            </button>
          </div>

          <button 
            onClick={refresh} 
            className={styles.refreshButton}
            disabled={loading}
          >
            <span className={styles.refreshIcon}>↻</span>
            Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Usuarios</span>
            <span className={styles.statValue}>{stats.totalUsers}</span>
          </div>
          <div className={styles.statBreakdown}>
            <span className={styles.statActive}>✓ {stats.activeUsers}</span>
            <span className={styles.statInactive}>✗ {stats.inactiveUsers}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Planes</span>
            <div className={styles.plansBreakdown}>
              <span className={styles.planBasic}>B: {stats.plans.basic}</span>
              <span className={styles.planMedium}>M: {stats.plans.medium}</span>
              <span className={styles.planPro}>P: {stats.plans.pro}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtersSection}>
        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre, email o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="todos">Todos los estados</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>

          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="todos">Todos los planes</option>
            <option value="basic">Básico</option>
            <option value="medium">Medio</option>
            <option value="pro">Profesional</option>
          </select>
        </div>

        <div className={styles.resultsCount}>
          {filteredUsers.length} {filteredUsers.length === 1 ? 'resultado' : 'resultados'}
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className={styles.tableContainer}>
        {filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>No se encontraron usuarios</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <>
            {/* Vista Tabla Original */}
            {viewMode === 'table' && (
              <table className={styles.usersTable}>
                <thead>
                  <tr>
                    <th className={styles.tableHeader}>Usuario</th>
                    <th className={styles.tableHeader}>Empresa</th>
                    <th className={styles.tableHeader}>Registro</th>
                    <th className={styles.tableHeader}>Plan</th>
                    <th className={styles.tableHeader}>Estado</th>
                    <th className={styles.tableHeader}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem._id} className={styles.userRow}>
                      <td className={styles.tableCell}>
                        <div className={styles.userInfo}>
                          <div className={styles.userAvatar}>
                            {userItem.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.userName}>{userItem.name}</div>
                            <div className={styles.userEmail}>{userItem.email}</div>
                            <div className={styles.userRole}>{getRoleName(userItem.role)}</div>
                          </div>
                        </div>
                      </td>

                      <td className={styles.tableCell}>
                        <div className={styles.companyInfo}>
                          <div className={styles.companyName}>{userItem.company?.name || 'Sin empresa'}</div>
                          <div className={styles.companyLimit}>
                            Usuarios: {userItem.company?.usersCount || 0}/{userItem.company?.maxUsers || 3}
                          </div>
                          <div className={styles.companyProductLimit}>
                            Productos: {userItem.stats?.products || 0}/{userItem.company?.maxProducts || 100}
                          </div>
                        </div>
                      </td>

                      <td className={styles.tableCell}>
                        <div className={styles.dateInfo}>
                          <div>{formatDate(userItem.createdAt)}</div>
                        </div>
                      </td>

                      <td className={styles.tableCell}>
                        <span className={`${styles.planBadge} ${styles[userItem.plan]}`}>
                          {getPlanName(userItem.plan)}
                        </span>
                      </td>

                      <td className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${userItem.isActive ? styles.statusActive : styles.statusInactive}`}>
                          {userItem.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      <td className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => openUserModal(userItem)}
                            className={styles.editButton}
                            disabled={actionLoading}
                            title="Editar usuario"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleToggleStatus(userItem._id, userItem.isActive)}
                            className={`${styles.statusButton} ${userItem.isActive ? styles.deactivateButton : styles.activateButton}`}
                            disabled={actionLoading}
                            title={userItem.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {userItem.isActive ? '🔴' : '🟢'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Vista Excel */}
            {viewMode === 'excel' && (
              <div className={styles.excelView}>
                <table className={styles.excelTable}>
                  <thead>
                    <tr>
                      <th className={styles.excelHeader}>Usuario</th>
                      <th className={styles.excelHeader}>Email</th>
                      <th className={styles.excelHeader}>Rol</th>
                      <th className={styles.excelHeader}>Empresa</th>
                      <th className={styles.excelHeader}>Usuarios</th>
                      <th className={styles.excelHeader}>Productos</th>
                      <th className={styles.excelHeader}>Plan</th>
                      <th className={styles.excelHeader}>Estado</th>
                      <th className={styles.excelHeader}>Registro</th>
                      <th className={styles.excelHeader}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userItem) => (
                      <tr key={userItem._id} className={styles.excelRow}>
                        <td className={styles.excelCell}>
                          <span className={styles.excelUserName}>{userItem.name}</span>
                        </td>
                        
                        <td className={styles.excelCell}>
                          <span className={styles.excelUserEmail}>{userItem.email}</span>
                        </td>
                        
                        <td className={styles.excelCell}>
                          <span className={styles.excelUserRole}>{getRoleName(userItem.role)}</span>
                        </td>
                        
                        <td className={styles.excelCell}>
                          <span className={styles.excelCompanyName}>
                            {userItem.company?.name || 'Sin empresa'}
                          </span>
                        </td>
                        
                        <td className={`${styles.excelCell} ${styles.excelNumber}`}>
                          <span className={styles.excelUserCount}>
                            {userItem.company?.usersCount || 0}/{userItem.company?.maxUsers || 3}
                          </span>
                        </td>
                        
                        <td className={`${styles.excelCell} ${styles.excelNumber}`}>
                          <span className={styles.excelProductCount}>
                            {userItem.stats?.products || 0}/{userItem.company?.maxProducts || 100}
                          </span>
                        </td>
                        
                        <td className={styles.excelCell}>
                          <span className={`${styles.excelPlanBadge} ${styles[`excelPlan${userItem.plan}`]}`}>
                            {getPlanName(userItem.plan)}
                          </span>
                        </td>
                        
                        <td className={styles.excelCell}>
                          <span className={`${styles.excelStatusBadge} ${userItem.isActive ? styles.excelStatusActive : styles.excelStatusInactive}`}>
                            {userItem.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        
                        <td className={styles.excelCell}>
                          <span className={styles.excelDate}>{formatDate(userItem.createdAt)}</span>
                        </td>
                        
                        <td className={styles.excelCell}>
                          <div className={styles.excelActions}>
                            <button
                              onClick={() => openUserModal(userItem)}
                              className={styles.excelEditButton}
                              disabled={actionLoading}
                              title="Editar usuario"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleToggleStatus(userItem._id, userItem.isActive)}
                              className={`${styles.excelStatusButton} ${userItem.isActive ? styles.excelDeactivate : styles.excelActivate}`}
                              disabled={actionLoading}
                              title={userItem.isActive ? 'Desactivar usuario' : 'Activar usuario'}
                            >
                              {userItem.isActive ? '🔴' : '🟢'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de usuario */}
      {showUserModal && selectedUserData && (
        <UserDetailModal
          userData={selectedUserData}
          onClose={() => setShowUserModal(false)}
          onPlanChange={handleChangePlan}
          onProductLimitChange={handleProductLimitChange}
          actionLoading={actionLoading}
          onUserDeleted={(userId:any) => {
            console.log('Usuario eliminado:', userId);
            refresh();
            setShowUserModal(false);
          }}
        />
      )}
    </div>
  );
}