import { useClients } from '../../../hooks/useClients';
import { useState, useMemo, useEffect } from 'react';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import LoadMoreTrigger from '../../../components/shared/LoadMoreTrigger';
import ClientsCreator from '../../../components/adminDash/clients/ClientCreator';
import ClientEditor from '../../../components/adminDash/clients/ClientEditor';
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
  [key: string]: any;
}

export default function ClientsPage() {
  const { t } = useLanguage();
  const { user ,isAuthenticated, loading: authLoading } = useAuth();
  const { 
    clients, 
    loading: clientsLoading, 
    createClient, 
    editClient, 
    fetchClients, 
    refreshTrigger,
    deleteClient 
  } = useClients();
  
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
    }
  }, [authLoading, isAuthenticated]);

  const handleEdit = (client: Client) => {
    if (isAuthenticated) {
      setEditingClient(client);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!isAuthenticated || !window.confirm(t('clients.actions.confirmDelete'))) {
      return;
    }
    
    setDeletingClientId(clientId);
    try {
      await deleteClient(clientId);
      // El refresh se maneja automáticamente en el hook
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setDeletingClientId(null);
    }
  };

  const handleCloseEdit = () => {
    setEditingClient(null);
  };

  // Filtrar clientes basado en el término de búsqueda
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;

    const term = searchTerm.toLowerCase().trim();
    return clients.filter(client => 
      client.name?.toLowerCase().includes(term) ||
      client.vorname?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.adresse?.toLowerCase().includes(term) ||
      client.phone?.includes(term)
    );
  }, [clients, searchTerm]);

  // Usar el hook de infinite scroll
  const {
    visibleItems: visibleClients,
    loadingMore,
    loadMoreRef,
    hasMore
  } = useInfiniteScroll(filteredClients, {
    initialCount: 4,
    loadMoreCount: 3,
    loadDelay: 300,
    rootMargin: '100px'
  }, refreshTrigger);

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>{t('clients.loadingAuth')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('clients.title')}</h1>
          <p className={styles.subtitle}>{t('clients.subtitle')}</p>
        </div>
        {isAuthenticated && (
          <button 
            className={styles.newBtn} 
            onClick={() => setShowModal(true)}
            disabled={clientsLoading}
          >
            <span className={styles.plus}>+</span>
            {t('clients.newClient')}
          </button>
        )}
      </header>

      {/* Buscador */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder={t('clients.search.placeholder')}
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={clientsLoading}
          />
          {searchTerm && (
            <button 
              className={styles.clearSearch}
              onClick={() => setSearchTerm('')}
              disabled={clientsLoading}
            >
              ✕
            </button>
          )}
        </div>
        <div className={styles.searchStats}>
          <span className={styles.resultsCount}>
            {t('clients.search.results')
              .replace('{visible}', visibleClients.length)
              .replace('{total}', filteredClients.length)}
            {hasMore && t('clients.search.moreAvailable')
              .replace('{remaining}', filteredClients.length - visibleClients.length)}
          </span>
        </div>
      </div>

      <div className={styles.clientsList}>
        {clientsLoading ? (
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
        ) : visibleClients.length === 0 ? (
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
                  onClick={() => setSearchTerm('')}
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
            <div className={styles.clientsGrid}>
              {visibleClients.map(client => (
                <div key={client._id} className={styles.clientCard}>
                  <div className={styles.clientInfo}>
                    <h3 className={styles.clientName}>{client.vorname} {client.name}</h3>

                <div className={styles.clientDetails}>
                    {client.company && (
                      <div className={styles.detail}>
                        <span className={styles.label}>{t('clients.table.company')}</span>
                        <span className={styles.value}>{client.company}</span>
                      </div>
                    )}
                    
                    <div className={styles.detail}>
                      <span className={styles.label}>{t('clients.table.email')}</span>
                      <span className={styles.value}>{client.email || '-'}</span>
                    </div>
                    
                    <div className={styles.detail}>
                      <span className={styles.label}>{t('clients.table.phone')}</span>
                      <span className={styles.value}>{client.phone || '-'}</span>
                    </div>
                    
                    {/* Dirección formateada */}
                    {client.formattedAddress && (
                      <div className={styles.detail}>
                        <span className={styles.label}>{t('clients.table.address')}</span>
                        <span className={styles.value}>{client.formattedAddress}</span>
                      </div>
                    )}
                    
                    {/* Compatibilidad con campo antiguo */}
                    {!client.formattedAddress && client.adresse && (
                      <div className={styles.detail}>
                        <span className={styles.label}>{t('clients.table.address')}</span>
                        <span className={styles.value}>{client.adresse}</span>
                      </div>
                    )}
                  </div>
                </div>
                  
                  <button 
                    className={styles.editBtn}
                    onClick={() => handleEdit(client)}
                    disabled={clientsLoading}
                  >
                    {t('clients.actions.edit')}
                  </button>
                  
                  {isAuthenticated && (user.role === 'admin' || user.role === 'ceo') && (
                    <div className={styles.clientActions}>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(client._id)}
                        disabled={clientsLoading || deletingClientId === client._id}
                      >
                        {deletingClientId === client._id 
                          ? t('clients.actions.deleting') 
                          : t('clients.actions.delete')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Load More Trigger */}
            <LoadMoreTrigger
              loadingMore={loadingMore}
              hasMore={hasMore}
              loadMoreRef={loadMoreRef}
              customMessage={t('clients.loadMore')}
            />
          </>
        )}
      </div>

      {showModal && isAuthenticated && (
        <ClientsCreator
          onClose={() => setShowModal(false)}
          onCreated={fetchClients}
          createClient={createClient}
        />
      )}

      {editingClient && isAuthenticated && (
        <ClientEditor
          client={editingClient}
          onClose={handleCloseEdit}
          onUpdated={fetchClients}
          updateClient={editClient}
        />
      )}
    </div>
  );
}