import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useStockMovements } from '../../../hooks/useStockMovements';
import Pagination from '../../../components/shared/Pagination';
import { useLanguage } from '../../../contexts/LanguageContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import styles from './StockMovements.module.css';

export default function StockMovements() {
  const { t } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState('excel'); // 'table' o 'excel'

  const {
    movements,
    loading,
    loadingMore,
    error,
    filters,
    updateFilter,
    clearFilters,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    refresh
  } = useStockMovements(50); // 50 items por página

  // Movimientos tipificados con traducciones
  const movementTypes: any = {
    WAREHOUSE_IN: { 
      label: t('stockMovements.movementTypes.WAREHOUSE_IN.label'), 
      color: '#059669', 
      bg: '#d1fae5', 
      icon: t('stockMovements.movementTypes.WAREHOUSE_IN.icon') 
    },
    WAREHOUSE_OUT: { 
      label: t('stockMovements.movementTypes.WAREHOUSE_OUT.label'), 
      color: '#b91c1c', 
      bg: '#fee2e2', 
      icon: t('stockMovements.movementTypes.WAREHOUSE_OUT.icon') 
    },
    MANUAL_ADJUSTMENT: { 
      label: t('stockMovements.movementTypes.MANUAL_ADJUSTMENT.label'), 
      color: '#b45309', 
      bg: '#ffedd5', 
      icon: t('stockMovements.movementTypes.MANUAL_ADJUSTMENT.icon') 
    },
    RETURN: { 
      label: t('stockMovements.movementTypes.RETURN.label'), 
      color: '#6d28d9', 
      bg: '#ede9fe', 
      icon: t('stockMovements.movementTypes.RETURN.icon') 
    },
    DAMAGED: { 
      label: t('stockMovements.movementTypes.DAMAGED.label'), 
      color: '#374151', 
      bg: '#f3f4f6', 
      icon: t('stockMovements.movementTypes.DAMAGED.icon') 
    },
    INITIAL_STOCK: { 
      label: t('stockMovements.movementTypes.INITIAL_STOCK.label'), 
      color: '#1e40af', 
      bg: '#dbeafe', 
      icon: t('stockMovements.movementTypes.INITIAL_STOCK.icon') 
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: de });
    } catch {
      return '-';
    }
  };

  if (authLoading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
        <p>{t('stockMovements.loadingAuth')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('stockMovements.title')}</h1>
          <p className={styles.subtitle}>{t('stockMovements.subtitle')}</p>
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
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={filters.type}
          onChange={(e) => updateFilter('type', e.target.value)}
        >
          <option value="">{t('stockMovements.filters.allTypes')}</option>
          {Object.entries(movementTypes).map(([key, val]: any) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => updateFilter('startDate', e.target.value)}
          placeholder={t('stockMovements.filters.startDate')}
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => updateFilter('endDate', e.target.value)}
          placeholder={t('stockMovements.filters.endDate')}
        />

        <input
          type="text"
          placeholder={t('stockMovements.filters.search')}
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />

        {(filters.type || filters.startDate || filters.endDate || filters.search) && (
          <button onClick={clearFilters} className={styles.clearBtn}>
            {t('stockMovements.filters.clear')}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={refresh}>{t('stockMovements.refresh')}</button>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        {loading && !loadingMore ? (
          <div className={styles.center}>
            <div className={styles.spinner} />
            <p>{t('stockMovements.loading')}</p>
          </div>
        ) : movements.length === 0 ? (
          <div className={styles.center}>
            <h3>{t('stockMovements.noMovements')}</h3>
          </div>
        ) : (
          <>
            {/* Vista Tabla Original */}
            {viewMode === 'table' && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t('stockMovements.table.date')}</th>
                    <th>{t('stockMovements.table.article')}</th>
                    <th>{t('stockMovements.table.type')}</th>
                    <th>{t('stockMovements.table.quantity')}</th>
                    <th>{t('stockMovements.table.stock')}</th>
                    <th>{t('stockMovements.table.user')}</th>
                    <th>{t('stockMovements.table.reference')}</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => {
                    const type = movementTypes[m.movementType] || movementTypes.MANUAL_ADJUSTMENT;
                    const positive = ['WAREHOUSE_IN', 'RETURN', 'INITIAL_STOCK'].includes(m.movementType);

                    return (
                      <tr key={m._id} className={styles.row}>
                        <td>{formatDate(m.movementDate)}</td>

                        <td>
                          <div className={styles.productName}>
                            {m.productSnapshot?.artikelName || '-'}
                          </div>
                          <div className={styles.productSku}>
                            {m.productSnapshot?.artikelNumber}
                          </div>
                        </td>

                        <td>
                          <span
                            className={styles.typeBadge}
                            style={{ background: type.bg, color: type.color }}
                          >
                            {type.icon} {type.label}
                          </span>
                        </td>

                        <td className={styles.quantity}>
                          <span className={positive ? styles.positive : styles.negative}>
                            {positive ? '+' : '-'}{m.quantity}
                          </span>
                        </td>

                        <td className={styles.stock}>
                          <span className={styles.stockOld}>{m.previousStock}</span>
                          <span className={styles.stockArrow}> → </span>
                          <span className={styles.stockNew}>{m.newStock}</span>
                        </td>

                        <td>{m.createdBy?.userName || '-'}</td>

                        <td className={styles.ref}>
                          {m.reference?.number && (
                            <span className={styles.refNumber}>{m.reference.number}</span>
                          )}
                          {m.notes && <span title={m.notes}>📝</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Vista Excel */}
            {viewMode === 'excel' && (
              <div className={styles.excelView}>
                <table className={styles.excelTable}>
                  <thead>
                    <tr>
                      <th className={styles.excelHeader}>Fecha</th>
                      <th className={styles.excelHeader}>Artículo</th>
                      <th className={styles.excelHeader}>N° Artículo</th>
                      <th className={styles.excelHeader}>Tipo</th>
                      <th className={styles.excelHeader}>Cantidad</th>
                      <th className={styles.excelHeader}>Stock Anterior</th>
                      <th className={styles.excelHeader}>Stock Nuevo</th>
                      <th className={styles.excelHeader}>Usuario</th>
                      <th className={styles.excelHeader}>Referencia</th>
                      <th className={styles.excelHeader}>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m) => {
                      const type = movementTypes[m.movementType] || movementTypes.MANUAL_ADJUSTMENT;
                      const positive = ['WAREHOUSE_IN', 'RETURN', 'INITIAL_STOCK'].includes(m.movementType);

                      return (
                        <tr key={m._id} className={styles.excelRow}>
                          <td className={styles.excelCell}>
                            <span className={styles.excelDate}>
                              {formatDate(m.movementDate)}
                            </span>
                          </td>
                          
                          <td className={styles.excelCell}>
                            <span className={styles.excelArtikelName}>
                              {m.productSnapshot?.artikelName || '-'}
                            </span>
                          </td>
                          
                          <td className={styles.excelCell}>
                            <span className={styles.excelArtikelNumber}>
                              {m.productSnapshot?.artikelNumber || '-'}
                            </span>
                          </td>
                          
                          <td className={styles.excelCell}>
                            <span
                              className={styles.excelTypeBadge}
                              style={{ background: type.bg, color: type.color }}
                            >
                              {type.icon} {type.label}
                            </span>
                          </td>
                          
                          <td className={`${styles.excelCell} ${styles.excelQuantity}`}>
                            <span className={positive ? styles.excelPositive : styles.excelNegative}>
                              {positive ? '+' : '-'}{m.quantity}
                            </span>
                          </td>
                          
                          <td className={`${styles.excelCell} ${styles.excelStock}`}>
                            <span className={styles.excelStockValue}>{m.previousStock}</span>
                          </td>
                          
                          <td className={`${styles.excelCell} ${styles.excelStock}`}>
                            <span className={styles.excelStockValue}>{m.newStock}</span>
                          </td>
                          
                          <td className={styles.excelCell}>
                            <span className={styles.excelUser}>
                              {m.createdBy?.userName || '-'}
                            </span>
                          </td>
                          
                          <td className={styles.excelCell}>
                            {m.reference?.number && (
                              <span className={styles.excelReference}>
                                {m.reference.number}
                              </span>
                            )}
                          </td>
                          
                          <td className={styles.excelCell}>
                            {m.notes && (
                              <span className={styles.excelNotes} title={m.notes}>
                                📝
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {pagination.pages > 1 && (
              <Pagination
                currentPage={pagination.current}
                totalPages={pagination.pages}
                onPageChange={goToPage}
                loading={loadingMore}
              />
            )}

            {/* Info de paginación */}
            <div className={styles.paginationInfo}>
              Mostrando {movements.length} de {pagination.total} movimientos
              {pagination.pages > 1 && ` · Página ${pagination.current} de ${pagination.pages}`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}