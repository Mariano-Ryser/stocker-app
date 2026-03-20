// components/CEO/UserDetailModal/UserDetailModal.jsx
import { useState, useEffect } from 'react';
import { useUserDetails } from '../../../hooks/useUserDetails';
import { useCompanyCleanup } from '../../../hooks/useCompanyCleanup';
import { useProduct } from '../../../hooks/useProducts'; // ✅ IMPORTAR useProduct
import styles from './UserDetailModal.module.css';

export default function UserDetailModal({ 
  userData,
  onClose, 
  onPlanChange,
  actionLoading,
  onUserDeleted,
  onProductLimitChange
}) { 
  const { userDetails, loading, error, fetchUserDetails, clearUserDetails } = useUserDetails();
  const { loading: cleanupLoading, cleanupCompany, cleanupProducts, cleanupSales, cleanupClients } = useCompanyCleanup();
  // ✅ Obtener productLimits del hook
  const { productLimits, fetchProductLimits } = useProduct();
  
  const [changingPlan, setChangingPlan] = useState(false);
  const [changingProductLimit, setChangingProductLimit] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteOptions, setDeleteOptions] = useState({
    products: true,
    sales: true,
    clients: true,
    company: true
  });
  const [newProductLimit, setNewProductLimit] = useState(userData?.company?.maxProducts || 100);
  const [localUserData, setLocalUserData] = useState(userData);

  useEffect(() => {
    setLocalUserData(userData);
  }, [userData]);

  useEffect(() => {
    if (userData?._id && userData?.companyId) {
      fetchUserDetails(userData._id, userData.companyId);
      // ✅ También cargar límites de productos
      fetchProductLimits();
      setNewProductLimit(userData?.company?.maxProducts || currentMaxProducts);
    }
    return () => clearUserDetails();
  }, [userData?._id, userData?.companyId, userData?.company?.maxProducts, fetchUserDetails, fetchProductLimits, clearUserDetails]);

  const handlePlanChange = async (newPlan) => {
    setChangingPlan(true);
    try {
      await onPlanChange(userData._id, newPlan);
      await fetchUserDetails(userData._id, userData.companyId);
      await fetchProductLimits(); // ✅ Actualizar límites después de cambiar plan
    } finally {
      setChangingPlan(false);
    }
  };

  const handleProductLimitChange = async () => {
    if (!window.confirm(`¿Estás seguro de cambiar el límite de productos de ${localUserData.company?.maxProducts || 100} a ${newProductLimit}?`)) {
      return;
    }

    setChangingProductLimit(true);
    try {
      const result = await onProductLimitChange(userData.companyId, newProductLimit);
      if (result && result.success) {
        // Disparar evento para actualizar límites en toda la app
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('refreshProductLimits'));
        }
        
        // Actualizar estado local
        setLocalUserData(prev => ({
          ...prev,
          company: {
            ...prev.company,
            maxProducts: newProductLimit
          }
        }));
        
        // Recargar estadísticas y límites
        await fetchUserDetails(userData._id, userData.companyId);
        await fetchProductLimits(); // ✅ Forzar actualización de límites
        
        alert('✅ Límite de productos actualizado correctamente');
      } else {
        alert('❌ Error al actualizar el límite: ' + (result?.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error updating product limit:', error);
      alert('❌ Error al actualizar el límite: ' + error.message);
    } finally {
      setChangingProductLimit(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!window.confirm('¿Estás SEGURO de eliminar TODA la empresa? Esta acción NO se puede deshacer.')) {
      return;
    }

    const result = await cleanupCompany(userData.companyId, {
      deleteProducts: deleteOptions.products,
      deleteSales: deleteOptions.sales,
      deleteClients: deleteOptions.clients,
      deleteCompany: deleteOptions.company,
      exceptUserId: userData._id
    });

    if (result.success) {
      alert('✅ Datos Eliminados correctamente');
      if (onUserDeleted) {
        onUserDeleted(userData._id);
      }
      onClose();
    } else {
      alert('❌ Error al eliminar: ' + result.error);
    }
  };

  const handlePartialDelete = async (type) => {
    let result;
    let message;

    switch(type) {
      case 'products':
        result = await cleanupProducts(userData.companyId);
        message = 'productos';
        break;
      case 'sales':
        result = await cleanupSales(userData.companyId);
        message = 'ventas';
        break;
      case 'clients':
        result = await cleanupClients(userData.companyId);
        message = 'clientes';
        break;
      default:
        return;
    }

    if (result.success) {
      alert(`✅ ${message} eliminados correctamente`);
      await fetchUserDetails(userData._id, userData.companyId);
      await fetchProductLimits(); // ✅ Actualizar límites después de eliminar
    } else {
      alert(`❌ Error al eliminar ${message}: ` + result.error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPlanName = (plan) => {
    const plans = {
      basic: 'Básico',
      medium: 'Medio',
      pro: 'Profesional'
    };
    return plans[plan] || plan;
  };

  const getRoleName = (role) => {
    const roles = {
      ceo: 'CEO',
      admin: 'Administrador',
      user: 'Usuario'
    };
    return roles[role] || role;
  };

  // ✅ COMBINAR DATOS: userDetails tiene stats, productLimits tiene límite actualizado
  const stats = userDetails?.stats || userData.stats || {
    products: 0,
    sales: 0,
    clients: 0,
    revenue: 0
  };

  const products = userDetails?.products || [];
  const isLoading = loading || cleanupLoading || actionLoading || changingPlan || changingProductLimit;

  // ✅ Usar productLimits.max para el límite, localUserData para otros datos
  const displayData = localUserData || userData;
  const currentMaxProducts = productLimits?.max || displayData.company?.maxProducts || 100;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Detalles del Usuario</h2>
          <button className={styles.closeButton} onClick={onClose} disabled={isLoading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {/* Información básica */}
          <div className={styles.userInfoCard}>
            <div className={styles.userAvatar}>
              {displayData.name?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <h3 className={styles.userName}>{displayData.name}</h3>
              <p className={styles.userEmail}>{displayData.email}</p>
              <div className={styles.userBadges}>
                <span className={`${styles.badge} ${styles[`badge${displayData.plan}`]}`}>
                  {getPlanName(displayData.plan)}
                </span>
                <span className={`${styles.badge} ${styles.badgeRole}`}>
                  {getRoleName(displayData.role)}
                </span>
                <span className={`${styles.badge} ${displayData.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                  {displayData.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Empresa */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Empresa</h4>
            <div className={styles.companyCard}>
              <div className={styles.companyIcon}>🏢</div>
              <div className={styles.companyInfo}>
                <p className={styles.companyName}>
                  {displayData.company?.name || 'Sin nombre'}
                </p>
                {displayData.companyId && (
                  <p className={styles.companyId}>
                    ID: {displayData.companyId}
                  </p>
                )}
                <div className={styles.companyStats}>
                  <span className={styles.companyStat}>
                    <span className={styles.statLabel}>Usuarios:</span>
                    <span className={styles.statValue}>
                      {displayData.company?.usersCount || 0}/{displayData.company?.maxUsers || 3}
                    </span>
                  </span>
                  <span className={styles.companyStat}>
                    <span className={styles.statLabel}>Límite productos:</span>
                    <span className={styles.statValue}>
                      {currentMaxProducts}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selector de plan */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Cambiar Plan</h4>
            <div className={styles.planGrid}>
              {[
                { id: 'basic', name: 'Básico', price: '29€', products: 100, users: 3 },
                { id: 'medium', name: 'Medio', price: '59€', products: 500, users: 10 },
                { id: 'pro', name: 'Profesional', price: '99€', products: 2000, users: 30 }
              ].map((plan) => (
                <button
                  key={plan.id}
                  className={`${styles.planCard} ${displayData.plan === plan.id ? styles.planSelected : ''}`}
                  onClick={() => handlePlanChange(plan.id)}
                  disabled={actionLoading || changingPlan || displayData.plan === plan.id}
                >
                  <div className={styles.planHeader}>
                    <h5 className={styles.planName}>{plan.name}</h5>
                    <span className={styles.planPrice}>{plan.price}</span>
                  </div>
                  <div className={styles.planFeatures}>
                    <div className={styles.planFeature}>
                      <span className={styles.featureIcon}>📦</span>
                      <span>Hasta {plan.products} productos</span>
                    </div>
                    <div className={styles.planFeature}>
                      <span className={styles.featureIcon}>👥</span>
                      <span>Hasta {plan.users} usuarios</span>
                    </div>
                  </div>
                  {displayData.plan === plan.id && (
                    <span className={styles.currentPlan}>Plan actual</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* SECCIÓN: Límite de productos manual */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Límite de Productos</h4>
            <div className={styles.limitCard}>
              <div className={styles.limitIcon}>📊</div>
              <div className={styles.limitInfo}>
                <div className={styles.limitCurrent}>
                  <span className={styles.limitLabel}>Uso actual:</span>
                  <span className={styles.limitValue}>{stats.products} / {currentMaxProducts}</span>
                  <span className={styles.limitPercentage}>
                    ({Math.round((stats.products / currentMaxProducts) * 100)}%)
                  </span>
                </div>
                
                <div className={styles.limitProgressBar}>
                  <div 
                    className={styles.limitProgressFill}
                    style={{ 
                      width: `${Math.min(100, (stats.products / currentMaxProducts) * 100)}%`,
                      backgroundColor: (stats.products / currentMaxProducts) >= 0.9 ? '#ef4444' : 
                                     (stats.products / currentMaxProducts) >= 0.75 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>

                <div className={styles.limitEdit}>
                  <div className={styles.limitInputGroup}>
                    <label htmlFor="productLimit" className={styles.limitInputLabel}>
                      Nuevo límite:
                    </label>
                    <input
                      id="productLimit"
                      type="number"
                      min="1"
                      max="10000"
                      value={newProductLimit}
                      onChange={(e) => setNewProductLimit(parseInt(e.target.value) || currentMaxProducts)}
                      className={styles.limitInput}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    className={styles.limitButton}
                    onClick={handleProductLimitChange}
                    disabled={isLoading || newProductLimit === currentMaxProducts}
                  >
                    {changingProductLimit ? 'Actualizando...' : 'Actualizar Límite'}
                  </button>
                </div>

                <p className={styles.limitNote}>
                  <span className={styles.noteIcon}>ℹ️</span>
                  Este límite afecta a todos los usuarios de la empresa. 
                  {newProductLimit < stats.products && (
                    <span className={styles.limitWarning}> ⚠️ El nuevo límite es menor que los productos actuales</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas de la COMPAÑÍA */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Estadísticas de la Empresa</h4>
            {loading && (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Cargando estadísticas...</p>
              </div>
            )}
            
            {error && (
              <div className={styles.errorState}>
                <div className={styles.errorIcon}>⚠️</div>
                <p className={styles.errorText}>{error}</p>
                <button 
                  className={styles.retryButton}
                  onClick={() => fetchUserDetails(userData._id, userData.companyId)}
                >
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>📦</div>
                    <div className={styles.statContent}>
                      <span className={styles.statLabel}>Total Productos</span>
                      <span className={styles.statNumber}>{stats.products}</span>
                      {stats.products > 0 && (
                        <button 
                          className={styles.deleteStatButton}
                          onClick={() => handlePartialDelete('products')}
                          disabled={isLoading}
                          title="Eliminar todos los productos"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div className={styles.statContent}>
                      <span className={styles.statLabel}>Total Ventas</span>
                      <span className={styles.statNumber}>{stats.sales}</span>
                      {stats.sales > 0 && (
                        <button 
                          className={styles.deleteStatButton}
                          onClick={() => handlePartialDelete('sales')}
                          disabled={isLoading}
                          title="Eliminar todas las ventas"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statContent}>
                      <span className={styles.statLabel}>Total Clientes</span>
                      <span className={styles.statNumber}>{stats.clients}</span>
                      {stats.clients > 0 && (
                        <button 
                          className={styles.deleteStatButton}
                          onClick={() => handlePartialDelete('clients')}
                          disabled={isLoading}
                          title="Eliminar todos los clientes"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>💶</div>
                    <div className={styles.statContent}>
                      <span className={styles.statLabel}>Ingresos Totales</span>
                      <span className={styles.statNumber}>{formatCurrency(stats.revenue)}</span>
                    </div>
                  </div>
                </div>

                {/* Botón de eliminar empresa completa */}
                <div className={styles.deleteCompanySection}>
                  <button 
                    className={styles.deleteCompanyButton}
                    onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                    disabled={isLoading}
                  >
                    🚨 Eliminar Empresa Completa
                  </button>

                  {showDeleteConfirm && (
                    <div className={styles.deleteConfirm}>
                      <p className={styles.deleteWarning}>
                        ⚠️ Esta acción eliminará TODOS los datos de la empresa y NO se puede deshacer
                      </p>
                      
                      <div className={styles.deleteOptions}>
                        <label className={styles.deleteOption}>
                          <input
                            type="checkbox"
                            checked={deleteOptions.products}
                            onChange={(e) => setDeleteOptions({...deleteOptions, products: e.target.checked})}
                          />
                          <span>Productos ({stats.products})</span>
                        </label>
                        
                        <label className={styles.deleteOption}>
                          <input
                            type="checkbox"
                            checked={deleteOptions.sales}
                            onChange={(e) => setDeleteOptions({...deleteOptions, sales: e.target.checked})}
                          />
                          <span>Ventas ({stats.sales})</span>
                        </label>
                        
                        <label className={styles.deleteOption}>
                          <input
                            type="checkbox"
                            checked={deleteOptions.clients}
                            onChange={(e) => setDeleteOptions({...deleteOptions, clients: e.target.checked})}
                          />
                          <span>Clientes ({stats.clients})</span>
                        </label>
                        
                        <label className={styles.deleteOption}>
                          <input
                            type="checkbox"
                            checked={deleteOptions.company}
                            onChange={(e) => setDeleteOptions({...deleteOptions, company: e.target.checked})}
                          />
                          <span>Empresa (eliminará todos los usuarios)</span>
                        </label>
                      </div>

                      <div className={styles.deleteActions}>
                        <button 
                          className={styles.cancelDelete}
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isLoading}
                        >
                          Cancelar
                        </button>
                        <button 
                          className={styles.confirmDelete}
                          onClick={handleDeleteCompany}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Eliminando...' : 'Confirmar Eliminación'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Lista de Productos de la COMPAÑÍA */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4 className={styles.sectionTitle}>Productos de la Empresa</h4>
              <button 
                className={styles.toggleButton}
                onClick={() => setShowProducts(!showProducts)}
                disabled={loading}
              >
                {showProducts ? 'Ocultar' : 'Ver'} productos ({stats.products})
              </button>
            </div>
            
            {showProducts && (
              <>
                {loading && (
                  <div className={styles.productsLoading}>
                    <div className={styles.spinnerSmall}></div>
                    <p>Cargando productos...</p>
                  </div>
                )}
                
                {!loading && products.length === 0 && (
                  <p className={styles.emptyText}>No hay productos en esta empresa</p>
                )}
                
                {!loading && products.length > 0 && (
                  <div className={styles.productsList}>
                    <table className={styles.productsTable}>
                      <thead>
                        <tr>
                          <th>Artículo</th>
                          <th>Número</th>
                          <th>Stock</th>
                          <th>Precio</th>
                          <th>Ubicación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => (
                          <tr key={product._id}>
                            <td>{product.artikelName}</td>
                            <td>{product.artikelNumber || '-'}</td>
                            <td>{product.stock}</td>
                            <td>{formatCurrency(product.price)}</td>
                            <td>{product.lagerPlatz || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Información adicional */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Información adicional</h4>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>ID de usuario:</span>
                <span className={styles.infoValue}>{displayData._id}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>ID de empresa:</span>
                <span className={styles.infoValue}>{displayData.companyId}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Fecha de registro:</span>
                <span className={styles.infoValue}>{formatDate(displayData.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            disabled={isLoading}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}