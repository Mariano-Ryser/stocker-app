import { useState, useEffect, useCallback } from 'react';
import { useProduct } from '../../../hooks/useProducts';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './LowStockAlert.module.css';

interface ProductWithStock {
  _id: string;
  artikelName: string;
  artikelNumber?: string;
  stock: number;
  lowStockThreshold?: number | null;
  price?: number;
  imagen?: string;
}

export const LowStockAlert = () => {
  const { t } = useLanguage();
  const { scannerProducts, scannerLoading, updateProductInCache } = useProduct();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<ProductWithStock[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalLowStock: 0,
    totalOutOfStock: 0
  });

  // Calcular productos con bajo stock (SOLO los que están bajo stock o agotados)
  useEffect(() => {
    if (!scannerProducts || scannerProducts.length === 0) {
      setLowStockProducts([]);
      setStats({ totalLowStock: 0, totalOutOfStock: 0 });
      return;
    }

    // Filtrar SOLO productos que tienen umbral personalizado Y stock <= ese umbral
    const productsWithThreshold = scannerProducts.filter((product: any) => 
      product.lowStockThreshold !== null && 
      product.lowStockThreshold !== undefined && 
      product.lowStockThreshold > 0
    );
    
    // SOLO los que están en bajo stock o agotados
    const lowStock = productsWithThreshold.filter((product: any) => {
      return product.stock <= product.lowStockThreshold;
    });
    
    const outOfStock = lowStock.filter(p => p.stock === 0);
    
    setStats({
      totalLowStock: lowStock.length,
      totalOutOfStock: outOfStock.length
    });
    
    // Ordenar por prioridad (agotados primero, luego stock ascendente)
    const sortedLowStock = [...lowStock].sort((a, b) => {
      if (a.stock === 0 && b.stock !== 0) return -1;
      if (a.stock !== 0 && b.stock === 0) return 1;
      return a.stock - b.stock;
    });

    setLowStockProducts(sortedLowStock);
    
  }, [scannerProducts]);

  // Función para refrescar
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await updateProductInCache(true);
    setIsRefreshing(false);
  };

  // Estado de carga
  if (scannerLoading) {
    return null;
  }

  // Verificar si hay productos con bajo stock
  const hasLowStockProducts = lowStockProducts.length > 0;

  // Si no hay productos con bajo stock, no mostramos nada
  if (!hasLowStockProducts) {
    return null;
  }

  // Función para obtener el estado del producto
  const getProductStatus = (product: any) => {
    const threshold = product.lowStockThreshold;
    const isOutOfStock = product.stock === 0;
    const percentage = (product.stock / threshold) * 100;
    
    if (isOutOfStock) {
      return {
        class: styles.critical,
        text: t('lowStockAlert.status.outOfStock'),
        icon: '🔴'
      };
    }
    if (percentage <= 30) {
      return {
        class: styles.critical,
        text: t('lowStockAlert.status.critical'),
        icon: '⚠️'
      };
    }
    if (percentage <= 60) {
      return {
        class: styles.warning,
        text: t('lowStockAlert.status.low'),
        icon: '⚠️'
      };
    }
    return {
      class: styles.warning,
      text: t('lowStockAlert.status.caution'),
      icon: '⚠️'
    };
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        className={styles.floatingButton}
        onClick={() => setIsModalOpen(true)}
        aria-label={t('lowStockAlert.button')}
      >
        <div className={styles.bellIcon}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.93 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span className={styles.badge}>{stats.totalLowStock}</span>
        </div>
      </button>

      {/* Modal estilo Excel */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {t('lowStockAlert.title')}
              </h2>
              <div className={styles.headerActions}>
                <button
                  className={styles.refreshButton}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  aria-label={t('lowStockAlert.refresh')}
                  title={t('lowStockAlert.refresh')}
                >
                  {isRefreshing ? '⟳' : '🔄'}
                </button>
                <button
                  className={styles.closeButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  ×
                </button>
              </div>
            </div>

            <div className={styles.modalBody}>
              {/* Info bar estilo Excel */}
              <div className={styles.infoBar}>
                <p className={styles.infoText}>
                  💡 {t('lowStockAlert.info')}
                </p>
              </div>

              {/* Stats bar estilo Excel */}
              <div className={styles.statsBar}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>{t('lowStockAlert.stats.withAlert')}</span>
                  <span className={`${styles.statValue} ${styles.warningValue}`}>
                    {stats.totalLowStock}
                  </span>
                </div>
                {stats.totalOutOfStock > 0 && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>{t('lowStockAlert.stats.outOfStock')}</span>
                    <span className={`${styles.statValue} ${styles.criticalValue}`}>
                      {stats.totalOutOfStock}
                    </span>
                  </div>
                )}
              </div>

              {/* Título de sección */}
              <div className={styles.sectionTitle}>
                <h3>{t('lowStockAlert.sectionTitle')}</h3>
              </div>

              {/* Tabla estilo Excel */}
              <div className={styles.productsList}>
                <div className={styles.listHeader}>
                  <span>{t('lowStockAlert.tableHeader.product')}</span>
                  <span>{t('lowStockAlert.tableHeader.stockThreshold')}</span>
                  <span>{t('lowStockAlert.tableHeader.status')}</span>
                </div>
                
                {lowStockProducts.map((product: any) => {
                  const threshold = product.lowStockThreshold;
                  const isOutOfStock = product.stock === 0;
                  const status = getProductStatus(product);
                  const percentage = (product.stock / threshold) * 100;
                  
                  return (
                    <div key={product._id} className={`${styles.productRow} ${status.class}`}>
                      {/* Columna Producto */}
                      <div className={styles.productInfo}>
                        {product.imagen && (
                          <img 
                            src={product.imagen} 
                            alt={product.artikelName}
                            className={styles.productImage}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className={styles.productDetails}>
                          <div className={styles.productName}>
                            {product.artikelName}
                            {isOutOfStock && (
                              <span className={styles.outOfStockBadge}>
                                {t('lowStockAlert.status.outOfStock')}
                              </span>
                            )}
                          </div>
                          {product.artikelNumber && (
                            <div className={styles.productSku}>
                              SKU: {product.artikelNumber}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Columna Stock / Umbral */}
                      <div className={styles.productStock}>
                        <div className={styles.stockInfo}>
                          <span className={`${styles.stockValue} ${status.class}`}>
                            {product.stock}
                          </span>
                          <span className={styles.stockDivider}>/</span>
                          <span className={styles.thresholdValue}>{threshold}</span>
                        </div>
                        {!isOutOfStock && (
                          <div className={styles.stockBar}>
                            <div 
                              className={`${styles.stockFill} ${status.class}`}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Columna Estado */}
                      <div className={styles.productStatus}>
                        <span className={`${styles.statusBadge} ${status.class}`}>
                          {status.icon} {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer estilo Excel */}
              <div className={styles.summary}>
                <div className={styles.summaryLeft}>
                  <p dangerouslySetInnerHTML={{
                    __html: t('lowStockAlert.summary.attention')
                      .replace('{count}', stats.totalLowStock.toString())
                      .replace('{plural}', stats.totalLowStock !== 1 ? 's' : '')
                      .replace('{pluralS}', stats.totalLowStock === 1 ? '' : 'n')
                  }} />
                  {stats.totalOutOfStock > 0 && (
                    <p className={styles.outOfStockNote} dangerouslySetInnerHTML={{
                      __html: t('lowStockAlert.summary.outOfStockNote')
                        .replace('{count}', stats.totalOutOfStock.toString())
                        .replace('{plural}', stats.totalOutOfStock !== 1 ? 's' : '')
                    }} />
                  )}
                </div>
                <button
                  className={styles.viewAllButton}
                  onClick={() => {
                    window.location.href = '/dashboard/artikel?filter=lowStock';
                    setIsModalOpen(false);
                  }}
                >
                  {t('lowStockAlert.actions.viewAll')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};