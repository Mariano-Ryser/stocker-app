// frontend/pages/dashboard/settings/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useUsers } from '../../../hooks/useUsers';
import { useCompany } from '../../../hooks/useCompany';
import styles from './settings.module.css';
import { useLanguage } from '../../../contexts/LanguageContext';
import EditCompanyComponent from '../../../components/dashboard/settings/EditCompanyComponent';

export default function Settings() {
  const { user, isAuthenticated, updateUser, updateCompany, company } = useAuth();
  const { t, languageOptions } = useLanguage();
  const router = useRouter();

  // Usar el hook de usuarios
  const {
    companyUsers,
    userLimits,
    loading: usersLoading,
    error: hookError,
    clearError,
    updateUser: updateUserHook,
    createCompanyUser,
    toggleUserStatus,
    deleteCompanyUser,
  } = useUsers();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
   
  const [editFormData, setEditFormData] = useState({
    name: user?.name || '',
    company: company?.name || '',
    language: user?.language || 'de',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('company');
  const [viewMode, setViewMode] = useState('excel'); // 'cards' o 'excel'
  const [deletingUserId, setDeletingUserId] = useState(null);

  const loading = usersLoading;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setEditFormData(prev => ({
        ...prev,
        name: user.name || '',
        language: user.language || 'de'
      }));
    }
  }, [user]);

  useEffect(() => {
    if (company) {
      setEditFormData(prev => ({
        ...prev,
        company: company.name || ''
      }));
    }
  }, [company]);

  // Mostrar errores del hook
  useEffect(() => {
    if (hookError) {
      setErrors({ general: hookError });
    }
  }, [hookError]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = t('settings.users.create.errors.nameRequired');
    if (!formData.email.trim()) {
      newErrors.email = t('settings.users.create.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('settings.users.create.errors.emailInvalid');
    }
    if (!formData.password) newErrors.password = t('settings.users.create.errors.passwordRequired');
    else if (formData.password.length < 6) newErrors.password = t('settings.users.create.errors.passwordMin');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setErrors({});
      setSuccess('');
      
      const result = await createCompanyUser(formData);
      
      if (result.success) {
        setSuccess(t('settings.alerts.success'));
        setFormData({ name: '', email: '', password: '' });
        clearError();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        if (result.message === 'El usuario ya existe' || 
            result.message?.toLowerCase().includes('ya existe')) {
          setErrors({ 
            create: t('settings.users.create.errors.userExists'),
            email: t('settings.users.create.errors.emailTaken')
          });
        } else if (result.message?.includes('Límite') || 
                   result.message?.includes('limit')) {
          setErrors({ create: t('settings.users.create.errors.limitReached') });
        } else {
          setErrors({ create: t('settings.users.create.errors.createFailed') });
        }
      }
    } catch (error) {
      console.error('Error in handleCreateUser:', error);
      setErrors({ create: t('settings.users.create.errors.unexpected') });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setErrors({});
      
      if (!user || (!user.id && !user._id)) {
        setErrors({ update: t('settings.profile.form.errors.userNotLoaded') });
        return;
      }
      
      const userId = user.id || user._id;
      const updateData = { ...editFormData };
      
      if (!updateData.password) {
        delete updateData.password;
      }
      
      if (user.role === 'admin' || user.role === 'ceo') {
        if (company && company.name !== editFormData.company) {
          updateCompany({ ...company, name: editFormData.company });
        }
      } else {
        delete updateData.company;
      }
      
      const result = await updateUserHook(userId, updateData);
      
      if (result.success) {
        setSuccess(t('settings.alerts.success'));
        updateUser(result.user);
        clearError();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setErrors({ update: result.error || t('settings.profile.form.errors.updateFailed') });
      }
    } catch (error) {
      console.error('Error en handleUpdateProfile:', error);
      setErrors({ update: error.message });
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    const action = isActive ? t('settings.users.list.actions.activate') : t('settings.users.list.actions.deactivate');
    if (!confirm(t('settings.users.list.actions.confirm').replace('{action}', action))) return;
    
    try {
      const result = await toggleUserStatus(userId, isActive);
      
      if (result.success) {
        setSuccess(t('settings.alerts.success'));
        clearError();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setErrors({ toggle: result.error });
      }
    } catch (error) {
      setErrors({ toggle: error.message });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`¿Estás SEGURO de eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    
    setDeletingUserId(userId);
    try {
      const result = await deleteCompanyUser(userId);
      
      if (result.success) {
        setSuccess(`Usuario "${userName}" eliminado correctamente`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setErrors({ delete: result.error || 'Error al eliminar usuario' });
      }
    } catch (error) {
      setErrors({ delete: error.message });
    } finally {
      setDeletingUserId(null);
    }
  };

  if (!isAuthenticated || !user) return null;
const currentUserId = user._id || user.id;
  return (
    <div className={styles.container}>
      <div className={styles.header}> 
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className={styles.successAlert}>
          <svg className={styles.alertIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/>
          </svg>
          {success}
        </div>
      )}

      {errors.general && (
        <div className={styles.errorAlert}>
          <svg className={styles.alertIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
          </svg>
          {errors.general}
        </div>
      )}

    {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'company' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('company')}
          >
            <svg className={styles.tabIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
            </svg>
            {t('settings.tabs.users')}
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg className={styles.tabIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
            {t('settings.tabs.profile')}
          </button>
        </div>
      </div>

       {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'company' ? (
          /* Company Users Tab */
          <div className={styles.companySection}>
            {/* Limits Card */}
            <div className={styles.limitsCard}>
              <div className={styles.cardHeader}>
                <h3>{t('settings.users.limits.title')}</h3>
                {user.role === 'ceo' && (
                  <span className={styles.adminBadge}>CEO</span> 
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.limitsGrid}>
                  <div className={styles.limitItem}>
                    <div className={styles.limitLabel}>{t('settings.users.limits.max')}</div>
                    <div className={styles.limitValue}>{userLimits.maxUsers || 3}</div>
                  </div>
                  <div className={styles.limitItem}>
                    <div className={styles.limitLabel}>{t('settings.users.limits.created')}</div>
                    <div className={styles.limitValue}>{userLimits.createdUsers || 0}</div>
                  </div>
                  <div className={styles.limitItem}>
                    <div className={styles.limitLabel}>{t('settings.users.limits.available')}</div>
                    <div className={`${styles.limitValue} ${userLimits.remaining <= 0 ? styles.limitReached : ''}`}>
                      {userLimits.remaining || 3}
                    </div>
                  </div>
                </div>
                <div className={styles.limitHelp}>
                  <p className={styles.helpText}>
                    {t('settings.users.limits.help')}
                  </p>
                  {user.role === 'ceo' && (
                    <p className={styles.adminText}>
                      <strong>{t('settings.users.limits.ceoHelp')}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Create User Card */}
            <div className={styles.createUserCard}>
              <div className={styles.cardHeader}>
                <h3>{t('settings.users.create.title')}</h3>
              </div>
              <div className={styles.cardBody}>
                {(userLimits.remaining <= 0 || !userLimits.canCreateMore) ? (
                  <div className={styles.warningBox}>
                    <svg className={styles.warningIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" fill="currentColor"/>
                    </svg>
                    <div className={styles.warningContent}>
                      <p className={styles.warningTitle}>{t('settings.users.limits.reached')}</p>
                      <p>
                        {userLimits.remaining === 0 
                          ? t('settings.users.create.errors.limitReached')
                          : t('settings.users.limits.reached')}
                      </p>
                      {user.role === 'ceo' && (
                        <p className={styles.upgradeText}>
                          {t('settings.users.limits.ceoHelp')}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreateUser} className={styles.userForm}>
                    {errors.create && (
                      <div className={styles.formError}>
                        <svg className={styles.errorIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                        </svg>
                        {errors.create}
                      </div>
                    )}
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="name" className={styles.formLabel}>
                        {t('settings.users.create.nameLabel')}
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                        placeholder={t('settings.users.create.namePlaceholder')}
                        disabled={loading}
                      />
                      {errors.name && <div className={styles.fieldError}>{errors.name}</div>}
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>
                        {t('settings.users.create.emailLabel')}
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                        placeholder={t('settings.users.create.emailPlaceholder')}
                        disabled={loading}
                      />
                      {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label htmlFor="password" className={styles.formLabel}>
                        {t('settings.users.create.passwordLabel')}
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
                        placeholder={t('settings.users.create.passwordPlaceholder')}
                        disabled={loading}
                      />
                      {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
                    </div>
                    
                    <button 
                      type="submit" 
                      className={styles.submitBtn}
                      disabled={loading || userLimits.remaining <= 0}
                    >
                      {loading ? (
                        <>
                          <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"/>
                            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                          </svg>
                          {t('settings.users.create.submitting')}
                        </>
                      ) : (
                        t('settings.users.create.submit')
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Users List - VISTA EXCEL */}
            <div className={styles.usersListCard}>
              <div className={styles.cardHeader}>
                <div className={styles.headerContent}>
                  <h3>{t('settings.users.list.title')}</h3>
                  <span className={styles.usersCount}>{companyUsers.length}</span>
                </div>
                {/* Toggle de vista (opcional) */}
                <div className={styles.viewToggle}>
                  <button
                    className={`${styles.viewButton} ${viewMode === 'cards' ? styles.activeView : ''}`}
                    onClick={() => setViewMode('cards')}
                    title="Vista Tarjetas"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/>
                    </svg>
                  </button>
                  <button
                    className={`${styles.viewButton} ${viewMode === 'excel' ? styles.activeView : ''}`}
                    onClick={() => setViewMode('excel')}
                    title="Vista Excel"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h5v2H7v-2z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className={styles.cardBody}>
                {loading && !companyUsers.length ? (
                  <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>{t('settings.users.list.loading')}</p>
                  </div>
                ) : companyUsers.length === 0 ? (
                  <div className={styles.emptyState}>
                    <svg className={styles.emptyIcon} width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11.75C8.31 11.75 7.75 12.31 7.75 13C7.75 13.69 8.31 14.25 9 14.25C9.69 14.25 10.25 13.69 10.25 13C10.25 12.31 9.69 11.75 9 11.75ZM15 11.75C14.31 11.75 13.75 12.31 13.75 13C13.75 13.69 14.31 14.25 15 14.25C15.69 14.25 16.25 13.69 16.25 13C16.25 12.31 15.69 11.75 15 11.75ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                    </svg>
                    <h4>{t('settings.users.list.empty.title')}</h4>
                    <p>{t('settings.users.list.empty.text')}</p>
                  </div>
                ) : (
                  <>
                    {/* Vista Excel */}
                    {viewMode === 'excel' && (
                      <div className={styles.excelView}>
                        <table className={styles.excelTable}>
                          <thead>
                            <tr>
                              <th className={styles.excelHeader}>{t('settings.users.list.table.user')}</th>
                              <th className={styles.excelHeader}>Email</th>
                              <th className={styles.excelHeader}>{t('settings.users.list.table.role')}</th>
                              <th className={styles.excelHeader}>{t('settings.users.list.table.status')}</th>
                              <th className={styles.excelHeader}>{t('settings.users.list.table.actions')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {companyUsers.map((companyUser) => (
                              <tr key={companyUser._id} className={styles.excelRow}>
                                <td className={styles.excelCell}>
                                  <div className={styles.excelUserInfo}>
                                    <div className={styles.excelAvatar}>
                                      {companyUser.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className={styles.excelUserName}>
                                      {companyUser.name || 'Unbekannt'}
                                      {companyUser._id === currentUserId && (
                                        <span className={styles.excelCurrentUser}></span>
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td className={styles.excelCell}>
                                  <span className={styles.excelEmail}>
                                    {companyUser.email || t('settings.users.list.noEmail')}
                                  </span>
                                </td>
                                <td className={styles.excelCell}>
                                  <span className={`${styles.excelRoleBadge} ${styles[`role${companyUser.role?.charAt(0)?.toUpperCase() + companyUser.role?.slice(1) || 'User'}`]}`}>
                                    {companyUser.role === 'ceo' ? t('settings.users.list.roles.ceo') : 
                                     companyUser.role === 'admin' ? t('settings.users.list.roles.admin') : 
                                     t('settings.users.list.roles.user')}
                                  </span>
                                </td>
                                <td className={styles.excelCell}>
                                  <span className={`${styles.excelStatusBadge} ${companyUser.isActive ? styles.excelActive : styles.excelInactive}`}>
                                    {companyUser.isActive ? t('settings.users.list.status.active') : t('settings.users.list.status.inactive')}
                                  </span>
                                </td>
                                <td className={styles.excelCell}>
                                  <div className={styles.excelActions}>
                                    {companyUser._id !== currentUserId && (
                                      <>
                                        <button
                                          className={`${styles.excelActionBtn} ${companyUser.isActive ? styles.excelDeactivate : styles.excelActivate}`}
                                          onClick={() => handleToggleUserStatus(companyUser._id, !companyUser.isActive)}
                                          disabled={loading}
                                          title={companyUser.isActive ? t('settings.users.list.actions.deactivateTitle') : t('settings.users.list.actions.activateTitle')}
                                        >
                                          {companyUser.isActive ? '🔴' : '🟢'}
                                        </button>
                                        <button
                                          className={styles.excelDeleteBtn}
                                          onClick={() => handleDeleteUser(companyUser._id, companyUser.name)}
                                          disabled={loading || deletingUserId === companyUser._id}
                                          title="Eliminar usuario"
                                        >
                                          {deletingUserId === companyUser._id ? '⏳' : '🗑️'}
                                        </button>
                                      </>
                                    )}
                                    {companyUser._id === currentUserId && (
                                      <span className={styles.excelCurrentUserLabel}>Tú</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Vista Tarjetas (original) */}
                    {viewMode === 'cards' && (
                      <div className={styles.usersTable}>
                        <div className={styles.tableHeader}>
                          <div className={styles.tableCell}>{t('settings.users.list.table.user')}</div>
                          <div className={styles.tableCell}>{t('settings.users.list.table.role')}</div>
                          <div className={styles.tableCell}>{t('settings.users.list.table.status')}</div>
                          <div className={styles.tableCell}>{t('settings.users.list.table.actions')}</div>
                        </div>
                        
                        <div className={styles.tableBody}>
                          {companyUsers.map((companyUser) => (
                            <div key={companyUser._id} className={styles.tableRow}>
                              <div className={styles.tableCell}>
                                <div className={styles.userInfo}>
                                  <div className={styles.userAvatar}>
                                    {companyUser.name?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                  <div className={styles.userDetails}>
                                    <div className={styles.userName}>
                                      {companyUser.name || 'Unbekannt'}
                                      {companyUser._id === currentUserId && (
                                        <span className={styles.currentUserBadge}>{t('settings.users.list.status.you')}</span>
                                      )}
                                    </div>
                                    <div className={styles.userEmail}>
                                      {companyUser.email || t('settings.users.list.noEmail')}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className={styles.tableCell}>
                                <span className={`${styles.roleBadge} ${styles[`role${companyUser.role?.charAt(0)?.toUpperCase() + companyUser.role?.slice(1) || 'User'}`]}`}>
                                  {companyUser.role === 'ceo' ? t('settings.users.list.roles.ceo') : 
                                   companyUser.role === 'admin' ? t('settings.users.list.roles.admin') : 
                                   t('settings.users.list.roles.user')}
                                </span>
                              </div>
                              <div className={styles.tableCell}>
                                <div className={`${styles.statusIndicator} ${companyUser.isActive ? styles.active : styles.inactive}`}>
                                  <div className={styles.statusDot}></div>
                                  {companyUser.isActive ? t('settings.users.list.status.active') : t('settings.users.list.status.inactive')}
                                </div>
                              </div>
                              <div className={styles.tableCell}>
                                {companyUser._id !== currentUserId && (
                                  <div className={styles.actionButtons}>
                                    <button
                                      className={`${styles.actionBtn} ${companyUser.isActive ? styles.btnDanger : styles.btnSuccess}`}
                                      onClick={() => handleToggleUserStatus(companyUser._id, !companyUser.isActive)}
                                      disabled={loading}
                                      title={companyUser.isActive ? t('settings.users.list.actions.deactivateTitle') : t('settings.users.list.actions.activateTitle')}
                                    >
                                      {companyUser.isActive ? t('settings.users.list.actions.deactivate') : t('settings.users.list.actions.activate')}
                                    </button>
                                    <button
                                      className={styles.deleteBtn}
                                      onClick={() => handleDeleteUser(companyUser._id, companyUser.name)}
                                      disabled={loading || deletingUserId === companyUser._id}
                                      title="Eliminar usuario"
                                    >
                                      {deletingUserId === companyUser._id ? '...' : '🗑️'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Profile Tab */
          <div className={styles.profileSection}>
            <div className={styles.profileCard}>
              <div className={styles.cardHeader}>
                <h3>{t('settings.profile.title')}</h3>
                <span className={`${styles.roleBadge} ${styles[`role${user.role?.charAt(0)?.toUpperCase() + user.role?.slice(1) || 'User'}`]}`}>
                  {user.role === 'ceo' ? t('settings.users.list.roles.ceo') : 
                   user.role === 'admin' ? t('settings.users.list.roles.admin') : 
                   t('settings.users.list.roles.user')}
                </span>
              </div>
              <div className={styles.cardBody}>
                <form onSubmit={handleUpdateProfile} className={styles.profileForm}>
                  {errors.update && (
                    <div className={styles.formError}>
                      <svg className={styles.errorIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                      </svg>
                      {errors.update}
                    </div>
                  )}
                  
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="editName" className={styles.formLabel}>
                        {t('settings.profile.form.nameLabel')}
                      </label>
                      <input
                        type="text"
                        id="editName"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                        className={styles.formInput}
                        disabled={loading}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="editLanguage" className={styles.formLabel}>
                        {t('settings.profile.form.languageLabel')}
                      </label>
                      <div className={styles.languageSelectWrapper}>
                        <select
                          id="editLanguage"
                          value={editFormData.language}
                          onChange={(e) => setEditFormData({...editFormData, language: e.target.value})}
                          className={styles.formInput}
                          disabled={loading}
                        >
                          {languageOptions && languageOptions.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.flag} {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.formActions}>
                    <button 
                      type="submit" 
                      className={styles.submitBtn}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"/>
                            <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                          </svg>
                          {t('settings.profile.form.saving')}
                        </>
                      ) : (
                        t('settings.profile.form.submit')
                      )}
                    </button>
                  </div>
                </form>

                {/* Konto Informationen */}
                <div className={styles.accountInfo}>
                  <h4 className={styles.infoTitle}>{t('settings.profile.account.title')}</h4>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>{t('settings.profile.account.memberSince')}</span>
                      <span className={styles.infoValue}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : t('settings.profile.account.unknown')}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>{t('settings.profile.account.companyId')}</span>
                      <span className={styles.infoValue}>
                        {user.companyId || t('settings.profile.account.noId')}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>{t('settings.profile.account.role')}</span>
                      <span className={styles.infoValue}>
                        {user.role === 'ceo' ? t('settings.users.list.roles.ceo') : 
                         user.role === 'admin' ? t('settings.users.list.roles.admin') : 
                         t('settings.users.list.roles.user')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Settings */}
            {(user.role === 'admin' || user.role === 'ceo') && (
              <div className={styles.companySettingsSection}>
                <EditCompanyComponent 
                  user={user} 
                  company={company} 
                  updateCompany={updateCompany}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}