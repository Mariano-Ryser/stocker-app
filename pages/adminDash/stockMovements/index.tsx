import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { getStockMovements } from '../../../services/stockMovementService';
import { useLanguage } from '../../../contexts/LanguageContext'; // 👈 IMPORTAR
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import styles from './StockMovements.module.css';

export default function StockMovements() {
  const { t } = useLanguage(); // 👈 USAR EL HOOK
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    current: 1
  });

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

  useEffect(() => {
    if (isAuthenticated) loadMovements();
  }, [isAuthenticated, filters]);

  const loadMovements = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getStockMovements({
        page: filters.page,
        limit: 50,
        movementType: filters.type,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search
      });

      setMovements(data.movements || []);
      setPagination({
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 1,
        current: filters.page
      });
    } catch (err: any) {
      setError(err.message || t('stockMovements.error'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: de });
    } catch {
      return '-';
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      startDate: '',
      endDate: '',
      search: '',
      page: 1
    });
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
        <h1 className={styles.title}>{t('stockMovements.title')}</h1>
        <p className={styles.subtitle}>{t('stockMovements.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
        >
          <option value="">{t('stockMovements.filters.allTypes')}</option>
          {Object.entries(movementTypes).map(([key, val]: any) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
          placeholder={t('stockMovements.filters.startDate')}
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
          placeholder={t('stockMovements.filters.endDate')}
        />

        <input
          type="text"
          placeholder={t('stockMovements.filters.search')}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
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
          <button onClick={loadMovements}>{t('stockMovements.refresh')}</button>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        {loading ? (
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

            {pagination.pages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  ←
                </button>
                <span>
                  {t('stockMovements.pagination.page')
                    .replace('{current}', filters.page)
                    .replace('{total}', pagination.pages)}
                </span>
                <button
                  disabled={filters.page === pagination.pages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}