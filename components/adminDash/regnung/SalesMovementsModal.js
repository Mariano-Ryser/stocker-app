// components/adminDash/regnung/StockMovementsModal.js
import { useState, useEffect } from 'react';
import { getSaleMovements } from '../../../services/stockMovementService';
import styles from './StockMovementsModal.module.css';

export default function StockMovementsModal({ sale, onClose }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMovements();
  }, [sale._id]);

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
    return new Date(dateString).toLocaleDateString('de-DE', {
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
      'WAREHOUSE_OUT': 'Salida (Venta)',
      'RETURN': 'Devolución',
      'MANUAL_ADJUSTMENT': 'Ajuste manual'
    };
    return texts[type] || type;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Movimientos de Stock</h2>
          <button onClick={onClose} className={styles.closeButton}>✕</button>
        </div>

        <div className={styles.saleInfo}>
          <p><strong>Rechnung:</strong> {sale.lieferschein}</p>
          <p><strong>Kunde:</strong> {sale.clientSnapshot?.name || sale.client?.name}</p>
          <p><strong>Total:</strong> {sale.total?.toFixed(2)} CHF</p>
        </div>

        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Cargando movimientos...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              Error: {error}
            </div>
          )}

          {!loading && !error && movements.length === 0 && (
            <div className={styles.empty}>
              No hay movimientos de stock para esta venta
            </div>
          )}

          {!loading && movements.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement._id}>
                    <td className={styles.dateCell}>
                      {formatDate(movement.movementDate)}
                    </td>
                    <td className={styles.productCell}>
                      <strong>{movement.productSnapshot?.artikelName}</strong>
                      {movement.productSnapshot?.artikelNumber && (
                        <span className={styles.productNumber}>
                          #{movement.productSnapshot.artikelNumber}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.movementType} ${styles[movement.movementType]}`}>
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