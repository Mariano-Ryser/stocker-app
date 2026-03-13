// pages/adminDash/CEO/index.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useCEOData } from '../../../hooks/useCEOData';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './ceoDashboard.module.css';

export default function CEODashboard() {
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { users, loading, error, stats, toggleUserStatus, changeUserPlan, refresh } = useCEOData();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [filterPlan, setFilterPlan] = useState('all'); // 'all', 'basic', 'medium', 'pro'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (user && user.role !== 'ceo') {
      router.push('/adminDash');
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>{t('ceo.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>{t('ceo.error.title')}</h2>
        <p>{error}</p>
        <button onClick={refresh} className={styles.retryButton}>
          {t('ceo.error.retry')}
        </button>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? user.isActive :
      filterStatus === 'inactive' ? !user.isActive : true;
    
    const matchesPlan = 
      filterPlan === 'all' ? true : user.plan === filterPlan;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleToggleStatus = async (userId, currentStatus) => {
    setActionLoading(true);
    const result = await toggleUserStatus(userId, currentStatus);
    if (!result.success) {
      alert(result.error || t('ceo.errors.statusChange'));
    }
    setActionLoading(false);
  };

  const handleChangePlan = async (userId, newPlan) => {
    setActionLoading(true);
    const result = await changeUserPlan(userId, newPlan);
    if (!result.success) {
      alert(result.error || t('ceo.errors.planChange'));
    }
    setActionLoading(false);
    setShowUserModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('ceo.title')}</h1>
          <p className={styles.subtitle}>{t('ceo.subtitle')}</p>
        </div>
        
        <button 
          onClick={refresh} 
          className={styles.refreshButton}
          disabled={loading}
        >
          <span className={styles.refreshIcon}>↻</span>
          {t('ceo.refresh')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t('ceo.stats.totalUsers')}</span>
            <span className={styles.statValue}>{stats.totalUsers}</span>
          </div>
          <div className={styles.statBreakdown}>
            <span className={styles.statActive}>✓ {stats.activeUsers}</span>
            <span className={styles.statInactive}>✗ {stats.inactiveUsers}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏢</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t('ceo.stats.totalCompanies')}</span>
            <span className={styles.statValue}>{stats.totalCompanies}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t('ceo.stats.totalProducts')}</span>
            <span className={styles.statValue}>{stats.totalProducts}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t('ceo.stats.totalSales')}</span>
            <span className={styles.statValue}>{stats.totalSales}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>👤</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t('ceo.stats.totalClients')}</span>
            <span className={styles.statValue}>{stats.totalClients}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>{t('ceo.stats.plans')}</span>
            <div className={styles.plansBreakdown}>
              <span className={styles.planBasic}>B: {stats.plans.basic}</span>
              <span className={styles.planMedium}>M: {stats.plans.medium}</span>
              <span className={styles.planPro}>P: {stats.plans.pro}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder={t('ceo.search.placeholder')}
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
            <option value="all">{t('ceo.filters.allStatus')}</option>
            <option value="active">{t('ceo.filters.active')}</option>
            <option value="inactive">{t('ceo.filters.inactive')}</option>
          </select>

          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">{t('ceo.filters.allPlans')}</option>
            <option value="basic">{t('ceo.filters.basic')}</option>
            <option value="medium">{t('ceo.filters.medium')}</option>
            <option value="pro">{t('ceo.filters.pro')}</option>
          </select>
        </div>

        <div className={styles.resultsCount}>
          {t('ceo.filters.results').replace('{count}', filteredUsers.length)}
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.tableContainer}>
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>{t('ceo.table.user')}</th>
              <th className={styles.tableHeader}>{t('ceo.table.company')}</th>
              <th className={styles.tableHeader}>{t('ceo.table.created')}</th>
              <th className={styles.tableHeader}>{t('ceo.table.stats')}</th>
              <th className={styles.tableHeader}>{t('ceo.table.plan')}</th>
              <th className={styles.tableHeader}>{t('ceo.table.status')}</th>
              <th className={styles.tableHeader}>{t('ceo.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className={styles.userRow}>
                <td className={styles.tableCell}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.userName}>{user.name}</div>
                      <div className={styles.userEmail}>{user.email}</div>
                      <div className={styles.userRole}>{user.role}</div>
                    </div>
                  </div>
                </td>

                <td className={styles.tableCell}>
                  <div className={styles.companyInfo}>
                    <div className={styles.companyName}>{user.company?.name || '-'}</div>
                    <div className={styles.companyLimit}>
                      {t('ceo.table.usersLimit').replace('{current}', user.company?.usersCount || 0).replace('{max}', user.company?.maxUsers || 3)}
                    </div>
                  </div>
                </td>

                <td className={styles.tableCell}>
                  <div className={styles.dateInfo}>
                    <div>{formatDate(user.createdAt)}</div>
                  </div>
                </td>

                <td className={styles.tableCell}>
                  <div className={styles.statsInfo}>
                    <div className={styles.statItem}>
                      <span className={styles.statItemLabel}>{t('ceo.table.products')}:</span>
                      <span className={styles.statItemValue}>{user.stats?.products || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statItemLabel}>{t('ceo.table.sales')}:</span>
                      <span className={styles.statItemValue}>{user.stats?.sales || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statItemLabel}>{t('ceo.table.clients')}:</span>
                      <span className={styles.statItemValue}>{user.stats?.clients || 0}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statItemLabel}>{t('ceo.table.revenue')}:</span>
                      <span className={styles.statItemValue}>{formatCurrency(user.stats?.salesTotal || 0)}</span>
                    </div>
                  </div>
                </td>

                <td className={styles.tableCell}>
                  <span className={`${styles.planBadge} ${styles[user.plan]}`}>
                    {user.plan?.toUpperCase() || 'BASIC'}
                  </span>
                </td>

                <td className={styles.tableCell}>
                  <span className={`${styles.statusBadge} ${user.isActive ? styles.statusActive : styles.statusInactive}`}>
                    {user.isActive ? t('ceo.status.active') : t('ceo.status.inactive')}
                  </span>
                </td>

                <td className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      className={styles.editButton}
                      disabled={actionLoading}
                      title={t('ceo.actions.edit')}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      className={`${styles.statusButton} ${user.isActive ? styles.deactivateButton : styles.activateButton}`}
                      disabled={actionLoading}
                      title={user.isActive ? t('ceo.actions.deactivate') : t('ceo.actions.activate')}
                    >
                      {user.isActive ? '🔴' : '🟢'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3>{t('ceo.empty.title')}</h3>
            <p>{t('ceo.empty.text')}</p>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className={styles.modalBackdrop} onClick={() => setShowUserModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('ceo.modal.title')}</h2>
              <button className={styles.closeBtn} onClick={() => setShowUserModal(false)}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalUserInfo}>
                <div className={styles.modalAvatar}>
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>
                  <p className={styles.modalCompany}>{selectedUser.company?.name}</p>
                </div>
              </div>

              <div className={styles.modalSection}>
                <h4>{t('ceo.modal.plan')}</h4>
                <div className={styles.planSelector}>
                  {['basic', 'medium', 'pro'].map((plan) => (
                    <button
                      key={plan}
                      className={`${styles.planOption} ${selectedUser.plan === plan ? styles.planSelected : ''}`}
                      onClick={() => handleChangePlan(selectedUser._id, plan)}
                      disabled={actionLoading}
                    >
                      {plan.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.modalSection}>
                <h4>{t('ceo.modal.details')}</h4>
                <div className={styles.modalDetails}>
                  <div className={styles.detailRow}>
                    <span>{t('ceo.modal.role')}:</span>
                    <span className={styles.detailValue}>{selectedUser.role}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>{t('ceo.modal.created')}:</span>
                    <span className={styles.detailValue}>{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>{t('ceo.modal.products')}:</span>
                    <span className={styles.detailValue}>{selectedUser.stats?.products}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>{t('ceo.modal.sales')}:</span>
                    <span className={styles.detailValue}>{selectedUser.stats?.sales}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>{t('ceo.modal.clients')}:</span>
                    <span className={styles.detailValue}>{selectedUser.stats?.clients}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>{t('ceo.modal.revenue')}:</span>
                    <span className={styles.detailValue}>{formatCurrency(selectedUser.stats?.salesTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCancelBtn}
                onClick={() => setShowUserModal(false)}
              >
                {t('ceo.modal.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}