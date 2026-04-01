import { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getSaleMovements } from '../../../services/stockMovementService';
import styles from './StockMovementsModal.module.css';

export default function StockMovementsModal({ sale, onClose }) {
  const { t, language } = useLanguage();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMovements();
  }, [sale._id]);
  
  // ✅ Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [loading, onClose]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await getSaleMovements(sale._id);
      setMovements(data.movements || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const localeMap = {
      'de': 'de-DE',
      'es': 'es-ES',
      'en': 'en-US'
    };
    const locale = localeMap[language] || 'de-DE';
    
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementIcon = (type) => {
    const icons = {
      'WAREHOUSE_OUT': '➖',
      'RETURN': '🔄',
      'MANUAL_ADJUSTMENT': '✏️'
    };
    return icons[type] || '📦';
  };

  const getMovementText = (type) => {
    const texts = {
      'WAREHOUSE_OUT': t('sales.modalMovements.types.WAREHOUSE_OUT'),
      'RETURN': t('sales.modalMovements.types.RETURN'),
      'MANUAL_ADJUSTMENT': t('sales.modalMovements.types.MANUAL_ADJUSTMENT')
    };
    return texts[type] || type;
  };

  const getMovementClass = (type) => {
    const classes = {
      'WAREHOUSE_OUT': styles.warehouseOut,
      'RETURN': styles.return,
      'MANUAL_ADJUSTMENT': styles.manualAdjustment
    };
    return classes[type] || '';
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{t('sales.modalMovements.title')}</h2>
          <button 
            onClick={onClose} 
            className={styles.closeButton}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className={styles.saleInfo}>
          <p>
            <strong>{t('sales.modalMovements.invoiceNumber')}:</strong> {sale.lieferschein || sale.invoiceNumber}
          </p>
          <p>
            <strong>{t('sales.modalMovements.customer')}:</strong> {sale.clientSnapshot?.name || sale.client?.name || t('sales.client.unknown')}
          </p>
          <p>
            <strong>{t('sales.modalMovements.total')}:</strong> {sale.total?.toFixed(2)} CHF
          </p>
        </div>

        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>{t('sales.modalMovements.loading')}</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {t('sales.modalMovements.error')}: {error}
            </div>
          )}

          {!loading && !error && movements.length === 0 && (
            <div className={styles.empty}>
              {t('sales.modalMovements.noMovements')}
            </div>
          )}

          {!loading && movements.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sales.modalMovements.table.date')}</th>
                  <th>{t('sales.modalMovements.table.product')}</th>
                  <th>{t('sales.modalMovements.table.type')}</th>
                  <th>{t('sales.modalMovements.table.quantity')}</th>
                  <th>{t('sales.modalMovements.table.stock')}</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement._id}>
                    <td className={styles.dateCell}>
                      {formatDate(movement.movementDate)}
                    </td>
                    <td className={styles.productCell}>
                      <strong>{movement.productSnapshot?.artikelName || '-'}</strong>
                      {movement.productSnapshot?.artikelNumber && (
                        <span className={styles.productNumber}>
                          #{movement.productSnapshot.artikelNumber}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.movementType} ${getMovementClass(movement.movementType)}`}>
                        {getMovementIcon(movement.movementType)} {getMovementText(movement.movementType)}
                      </span>
                    </td>
                    <td className={styles.quantityCell}>
                      <span className={movement.movementType === 'WAREHOUSE_OUT' ? styles.negative : styles.positive}>
                        {movement.movementType === 'WAREHOUSE_OUT' ? '-' : '+'}
                        {movement.quantity}
                      </span>
                    </td>
                    <td className={styles.stockCell}>
                      {movement.previousStock} → {movement.newStock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}