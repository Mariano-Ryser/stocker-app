// pages/dashboard/admin/clients/index.tsx
import { useState, useRef, useCallback } from 'react';
import { useClientsPaginated } from '../../../hooks/useClientsPaginated';
import Pagination from '../../../components/shared/Pagination';
import ClientsCreator from '../../../components/dashboard/clients/ClientCreator';
import ClientEditor from '../../../components/dashboard/clients/ClientEditor';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './clients.module.css';

interface Client {
  _id: string;
  name?: string;
  vorname?: string;
  email?: string;
  adresse?: string;  
  phone?: string;
  company?: string;
  [key: string]: any;
}

export default function ClientsPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    clients,
    loading,
    loadingMore,
    error,
    searchTerm,
    setSearchTerm,
    pagination,
    goToPage,
    refresh,
    createClient,
    editClient,
    deleteClient
  } = useClientsPaginated(20);

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'excel' | 'cards'>('excel');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
  }, [setSearchTerm]);

  const handleClearSearch = useCallback(() => {
    setInputValue('');
    setSearchTerm('');
    inputRef.current?.focus();
  }, [setSearchTerm]);

  const handleEdit = useCallback((client: Client) => {
    if (isAuthenticated) setEditingClient(client);
  }, [isAuthenticated]);

  const handleDelete = useCallback(async (clientId: string) => {
    if (!isAuthenticated || !window.confirm(t('clients.actions.confirmDelete'))) return;

    setDeletingClientId(clientId);
    try {
      await deleteClient(clientId);
    } finally {
      setDeletingClientId(null);
    }
  }, [isAuthenticated, t, deleteClient]);

  const handleCreateSuccess = useCallback(() => {
    setShowModal(false);
    refresh();
  }, [refresh]);

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>{t('clients.loadingAuth')}</p>
      </div>
    );
  }

  const canDelete = user?.role === 'admin' || user?.role === 'ceo';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('clients.title')}</h1>
          <p className={styles.subtitle}>{t('clients.subtitle')}</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'cards' ? styles.activeView : ''}`}
              onClick={() => setViewMode('cards')}
              title={t('clients.view.cards')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h10v2H4v-2z"/>
              </svg>
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'excel' ? styles.activeView : ''}`}
              onClick={() => setViewMode('excel')}
              title={t('clients.view.excel')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h5v2H7v-2z"/>
              </svg>
            </button>
          </div>

          {isAuthenticated && (
            <button
              className={styles.newBtn}
              onClick={() => setShowModal(true)}
            >
              <span className={styles.plus}>+</span>
              {t('clients.newClient')}
            </button>
          )}
        </div>
      </header>

      {/* Buscador */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <input
            ref={inputRef}
            type="text"
            placeholder={t('clients.search.placeholder')}
            value={inputValue}
            onChange={handleInputChange}
            className={styles.searchInput}
          />

          {inputValue && (
            <button onClick={handleClearSearch}>✕</button>
          )}
        </div>

        <div className={styles.searchStats}>
          <span className={styles.resultsCount}>
            {loading ? t('clients.loadingShort') : (
              t('clients.search.results')
                .replace('{visible}', clients.length)
                .replace('{total}', pagination.total)
            )}
          </span>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={refresh}>{t('clients.loadMore')}</button>
        </div>
      )}

      <div className={styles.clientsList}>
        {loading && !loadingMore ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            {t('clients.loading')}
          </div>
        ) : !isAuthenticated ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔒</div>
            <h3 className={styles.emptyTitle}>{t('clients.empty.restricted.title')}</h3>
            <p className={styles.emptyText}>{t('clients.empty.restricted.text')}</p>
          </div>
        ) : clients.length === 0 ? (
          <div className={styles.emptyState}>
            {searchTerm ? (
              <>
                <div className={styles.emptyIcon}>🔍</div>
                <h3 className={styles.emptyTitle}>{t('clients.empty.notFound.title')}</h3>
                <p className={styles.emptyText}>
                  {t('clients.empty.notFound.text').replace('{search}', searchTerm)}
                </p>
                <button
                  className={styles.clearSearchBtn}
                  onClick={handleClearSearch}
                >
                  {t('clients.search.clear')}
                </button>
              </>
            ) : (
              <>
                <div className={styles.emptyIcon}>👥</div>
                <h3 className={styles.emptyTitle}>{t('clients.empty.noClients.title')}</h3>
                <p className={styles.emptyText}>{t('clients.empty.noClients.text')}</p>
              </>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'cards' && (
              <div className={styles.clientsGrid}>
                {clients.map(client => (
                  <div key={client._id} className={styles.clientCard}>
                    <div className={styles.clientInfo}>
                      <h3 className={styles.clientName}>{client.vorname} {client.name}</h3>
                      <div className={styles.clientDetails}>
                        {client.company && (
                          <div className={styles.detail}>
                            <span className={styles.label}>{t('clients.card.company')}</span>
                            <span className={styles.value}>{client.company}</span>
                          </div>
                        )}
                        <div className={styles.detail}>
                          <span className={styles.label}>{t('clients.card.email')}</span>
                          <span className={styles.value}>{client.email || '-'}</span>
                        </div>
                        <div className={styles.detail}>
                          <span className={styles.label}>{t('clients.card.phone')}</span>
                          <span className={styles.value}>{client.phone || '-'}</span>
                        </div>
                        {client.formattedAddress && (
                          <div className={styles.detail}>
                            <span className={styles.label}>{t('clients.card.address')}</span>
                            <span className={styles.value}>{client.formattedAddress}</span>
                          </div>
                        )}
                        {!client.formattedAddress && client.adresse && (
                          <div className={styles.detail}>
                            <span className={styles.label}>{t('clients.card.address')}</span>
                            <span className={styles.value}>{client.adresse}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.clientActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEdit(client)}
                        disabled={loading}
                      >
                        {t('clients.actions.edit')}
                      </button>
                      {canDelete && (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(client._id)}
                          disabled={loading || deletingClientId === client._id}
                        >
                          {deletingClientId === client._id
                            ? t('clients.actions.deleting')
                            : t('clients.actions.delete')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'excel' && (
              <div className={styles.excelView}>
                <table className={styles.excelTable}>
                  <thead>
                    <tr>
                      <th className={styles.excelHeader}>{t('clients.excel.name')}</th>
                      <th className={styles.excelHeader}>{t('clients.excel.vorname')}</th>
                      <th className={styles.excelHeader}>{t('clients.excel.company')}</th>
                      <th className={styles.excelHeader}>{t('clients.excel.email')}</th>
                      <th className={styles.excelHeader}>{t('clients.excel.phone')}</th>
                      <th className={styles.excelHeader}>{t('clients.excel.address')}</th>
                      <th className={styles.excelHeader}>{t('clients.excel.city')}</th>
                      <th className={styles.excelHeader}>{t('clients.excel.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client._id} className={styles.excelRow}>
                        <td className={styles.excelCell}>
                          <span className={styles.excelName}>{client.name || '-'}</span>
                        </td>
                        <td className={styles.excelCell}>
                          <span className={styles.excelVorname}>{client.vorname || '-'}</span>
                        </td>
                        <td className={styles.excelCell}>
                          <span className={styles.excelCompany}>{client.company || '-'}</span>
                        </td>
                        <td className={styles.excelCell}>
                          <span className={styles.excelEmail}>{client.email || '-'}</span>
                        </td>
                        <td className={styles.excelCell}>
                          <span className={styles.excelPhone}>{client.phone || '-'}</span>
                        </td>
                        <td className={styles.excelCell}>
                          <span className={styles.excelAddress}>
                            {client.address?.street || client.adresse || '-'}
                          </span>
                        </td>
                        <td className={styles.excelCell}>
                          <span className={styles.excelCity}>{client.address?.city || '-'}</span>
                        </td>
                        <td className={styles.excelCell}>
                          <div className={styles.excelActions}>
                            <button
                              className={styles.excelEditButton}
                              onClick={() => handleEdit(client)}
                              title={t('clients.actions.edit')}
                            >
                              ✎
                            </button>
                            {canDelete && (
                              <button
                                className={styles.excelDeleteButton}
                                onClick={() => handleDelete(client._id)}
                                disabled={deletingClientId === client._id}
                                title={t('clients.actions.delete')}
                              >
                                {deletingClientId === client._id ? '⏳' : '🗑️'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination.pages > 1 && (
              <>
                <Pagination
                  currentPage={pagination.current}
                  totalPages={pagination.pages}
                  onPageChange={goToPage}
                  loading={loadingMore}
                />
                <div className={styles.paginationInfo}>
                  {t('clients.pagination.showing', {
                    count: clients.length,
                    total: pagination.total
                  })}
                  {' · '}
                  {t('clients.pagination.pageInfo', {
                    current: pagination.current,
                    total: pagination.pages
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showModal && isAuthenticated && (
        <ClientsCreator
          onClose={() => setShowModal(false)}
          onCreated={handleCreateSuccess}
          createClient={createClient}
        />
      )}

      {editingClient && isAuthenticated && (
        <ClientEditor
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onUpdated={refresh}
          updateClient={editClient}
        />
      )}
    </div>
  );
}