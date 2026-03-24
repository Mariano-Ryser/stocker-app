 import { useState, useMemo, useEffect } from "react";
import { useSales } from "../../../hooks/useSales";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { useAuth } from '../../../components/auth/AuthProvider';
import { useLanguage } from '../../../contexts/LanguageContext';
import LoadMoreTrigger from "../../../components/shared/LoadMoreTrigger";
import styles from "./verkaufteArtikel.module.css";

export default function VerkauftetArtikelPage() {
  const { t } = useLanguage();
  const { sales, loading, error, refreshSales } = useSales();
  const [productFilter, setProductFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [liefFilter, setLiefFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCancelled, setShowCancelled] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [viewMode, setViewMode] = useState('excel'); // 'table', 'excel', 'cards'

  const { company } = useAuth();
  const currencySymbol = company?.currency || 'USD';

  // Construimos array plano de items vendidos
  const soldItems = useMemo(() => {
    return sales
      .filter(sale => {
        if (sale.status === 'cancelled') return showCancelled;
        if (sale.status === 'pending') return showPending;
        return true;
      })
      .flatMap((sale) =>
        sale.items.map((item: any) => ({
          productName: item.product?.artikelName || item.artikelName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          clientName: sale.client?.name || sale.clientSnapshot?.name || t('verkaufteArtikel.client.unknown'),
          clientEmail: sale.client?.email || sale.clientSnapshot?.email || '-',
          lieferschein: sale.lieferschein,
          date: new Date(sale.createdAt),
          dateString: new Date(sale.createdAt).toLocaleDateString('de-DE'),
          dateTime: new Date(sale.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          saleId: sale._id,
          saleStatus: sale.status
        }))
      );
  }, [sales, showCancelled, showPending, t]);

  // Aplicar filtros
  const filteredItems = useMemo(() => {
    return soldItems.filter((item) => {
      const matchProduct = item.productName
        .toLowerCase()
        .includes(productFilter.toLowerCase());

      const matchClient = item.clientName
        .toLowerCase()
        .includes(clientFilter.toLowerCase());

      const matchLief = (item.lieferschein || "")
        .toString()
        .toLowerCase()
        .includes(liefFilter.toLowerCase());

      const itemDate = item.date;
      const fromOK = dateFrom ? itemDate >= new Date(dateFrom) : true;
      const toOK = dateTo ? itemDate <= new Date(dateTo + 'T23:59:59') : true;

      return matchProduct && matchClient && matchLief && fromOK && toOK;
    });
  }, [productFilter, clientFilter, liefFilter, dateFrom, dateTo, soldItems]);

  // Configuración de infinite scroll
  const infiniteScrollConfig = {
    initialCount: 20,
    loadMoreCount: 20,
    loadDelay: 100,
    rootMargin: '200px'
  };

  const {
    visibleItems: visibleSoldItems,
    loadingMore,
    loadMoreRef,
    hasMore
  } = useInfiniteScroll(filteredItems, infiniteScrollConfig);

  // Estadísticas
  const totalRevenue = filteredItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = new Set(filteredItems.map(item => item.productName)).size;

  // Función para refrescar datos
  const handleRefresh = async () => {
    await refreshSales();
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setProductFilter("");
    setClientFilter("");
    setLiefFilter("");
    setDateFrom("");
    setDateTo("");
    setShowCancelled(false);
    setShowPending(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { bg: "#d1fae5", color: "#065f46", text: t('verkaufteArtikel.status.paid') },
      cancelled: { bg: "#fee2e2", color: "#991b1b", text: t('verkaufteArtikel.status.cancelled') },
      pending: { bg: "#fff3cd", color: "#856404", text: t('verkaufteArtikel.status.pending') }
    };
    return badges[status] || { bg: "#f3f4f6", color: "#374151", text: status };
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>{t('verkaufteArtikel.title')}</h1>
          <p className={styles.pageSubtitle}>
            {t('verkaufteArtikel.subtitle')}
          </p>
        </div>
        
        <div className={styles.headerActions}>
          {/* Toggle de vista */}
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'table' ? styles.activeView : ''}`}
              onClick={() => setViewMode('table')}
              title={t('verkaufteArtikel.view.table')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/>
              </svg>
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'excel' ? styles.activeView : ''}`}
              onClick={() => setViewMode('excel')}
              title={t('verkaufteArtikel.view.excel')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h5v2H7v-2z"/>
              </svg>
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'cards' ? styles.activeView : ''}`}
              onClick={() => setViewMode('cards')}
              title={t('verkaufteArtikel.view.cards')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h10v2H4v-2z"/>
              </svg>
            </button>
          </div>

          {loading && (
            <div className={styles.loadingMessage}>
              🔄 {t('verkaufteArtikel.loadingData')}
            </div>
          )}
        </div>

        {error && (
          <div className={styles.errorMessage}>
            ❌ {t('verkaufteArtikel.error.general')}: {error}
            <button onClick={handleRefresh} className={styles.retryButton}>
              {t('verkaufteArtikel.actions.retry')}
            </button>
          </div>
        )}
      </header>

      {/* Panel de Estadísticas Minimalista */}
      <div className={styles.statsPanel}>
        <div className={`${styles.statCard} ${styles.revenueCard}`}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{totalRevenue.toFixed(2)}{currencySymbol}</div>
            <div className={styles.statLabel}>{t('verkaufteArtikel.stats.revenue')}</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.quantityCard}`}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{totalItems}</div>
            <div className={styles.statLabel}>{t('verkaufteArtikel.stats.units')}</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.productsCard}`}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{uniqueProducts}</div>
            <div className={styles.statLabel}>{t('verkaufteArtikel.stats.articles')}</div>
          </div>
        </div>
      </div>

      {/* Filtros Minimalistas */}
      <div className={styles.filtersSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputContainer}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder={t('verkaufteArtikel.filters.product')}
              className={styles.searchInput}
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              disabled={loading}
            />
            {productFilter && (
              <button 
                className={styles.clearButton}
                onClick={() => setProductFilter('')}
                disabled={loading}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className={styles.secondaryFilters}>
          <input
            type="text"
            placeholder={t('verkaufteArtikel.filters.client')}
            className={styles.filterInput}
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            placeholder={t('verkaufteArtikel.filters.lieferschein')}
            className={styles.filterInput}
            value={liefFilter}
            onChange={(e) => setLiefFilter(e.target.value)}
            disabled={loading}
          />
          <div className={styles.dateContainer}>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={styles.dateInput}
              placeholder={t('verkaufteArtikel.filters.dateFrom')}
              disabled={loading}
            />
            <span className={styles.dateSeparator}>{t('verkaufteArtikel.filters.dateSeparator')}</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={styles.dateInput}
              placeholder={t('verkaufteArtikel.filters.dateTo')}
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.filtersFooter}>
          <div className={styles.resultsInfo}>
            <span>
              {loading ? t('verkaufteArtikel.loadingShort') : (
                <>
                  <strong>{filteredItems.length}</strong> {t('verkaufteArtikel.stats.items')}
                </>
              )}
            </span>
          </div>
          
          {(productFilter || clientFilter || liefFilter || dateFrom || dateTo || showCancelled || showPending) && (
            <button 
              className={styles.clearFiltersButton}
              onClick={clearFilters}
              disabled={loading}
            >
              {t('verkaufteArtikel.actions.clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{t('verkaufteArtikel.loading')}</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>{t('verkaufteArtikel.error.title')}</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className={`${styles.retryButton} ${styles.large}`}>
            {t('verkaufteArtikel.actions.retry')}
          </button>
        </div>
      ) : (
        <>
          {/* Vista Tabla Original */}
          {viewMode === 'table' && (
            <div className={styles.tableContainer}>
              {filteredItems.length === 0 ? (
                <div className={styles.emptyState}>
                  {productFilter || clientFilter || liefFilter || dateFrom || dateTo || showCancelled || showPending ? (
                    <>
                      <div className={styles.emptyIcon}>🔍</div>
                      <h3>{t('verkaufteArtikel.empty.notFound.title')}</h3>
                      <p>{t('verkaufteArtikel.empty.notFound.text')}</p>
                      <button 
                        className={styles.clearFiltersButton}
                        onClick={clearFilters}
                      >
                        {t('verkaufteArtikel.actions.clearFilters')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyIcon}>📦</div>
                      <h3>{t('verkaufteArtikel.empty.noSales.title')}</h3>
                      <p>{t('verkaufteArtikel.empty.noSales.text')}</p>
                    </>
                  )}
                </div>
              ) : (
                <table className={styles.articlesTable}>
                  <thead>
                    <tr>
                      <th>{t('verkaufteArtikel.table.article')}</th>
                      <th>{t('verkaufteArtikel.table.quantity')}</th>
                      <th>{t('verkaufteArtikel.table.price')}</th>
                      <th>{t('verkaufteArtikel.table.total')}</th>
                      <th>{t('verkaufteArtikel.table.client')}</th>
                      <th>{t('verkaufteArtikel.table.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSoldItems.map((row, idx) => (
                      <tr key={`${row.saleId}-${idx}`} className={styles.tableRow}>
                        <td className={styles.productCell}>
                          <div className={styles.productName}>{row.productName}</div>
                          {row.lieferschein && (
                            <div className={styles.lieferscheinSubtitle}>
                              {t('verkaufteArtikel.table.lieferschein').replace('{number}', row.lieferschein)}
                            </div>
                          )}
                        </td>
                        <td className={styles.quantityCell}>
                          <span className={styles.quantityBadge}>{row.quantity}</span>
                        </td>
                        <td className={styles.priceCell}>{row.unitPrice.toFixed(2)} {currencySymbol}</td>
                        <td className={styles.totalCell}>
                          <span className={styles.totalAmount}>{row.lineTotal.toFixed(2)} {currencySymbol}</span>
                        </td>
                        <td className={styles.clientCell}>{row.clientName}</td>
                        <td className={styles.dateCell}>{row.dateString}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Vista Excel */}
          {viewMode === 'excel' && (
            <div className={styles.excelView}>
              {filteredItems.length === 0 ? (
                <div className={styles.emptyState}>
                  {productFilter || clientFilter || liefFilter || dateFrom || dateTo || showCancelled || showPending ? (
                    <>
                      <div className={styles.emptyIcon}>🔍</div>
                      <h3>{t('verkaufteArtikel.empty.notFound.title')}</h3>
                      <p>{t('verkaufteArtikel.empty.notFound.text')}</p>
                      <button 
                        className={styles.clearFiltersButton}
                        onClick={clearFilters}
                      >
                        {t('verkaufteArtikel.actions.clearFilters')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyIcon}>📦</div>
                      <h3>{t('verkaufteArtikel.empty.noSales.title')}</h3>
                      <p>{t('verkaufteArtikel.empty.noSales.text')}</p>
                    </>
                  )}
                </div>
              ) : (
                <table className={styles.excelTable}>
                  <thead>
                    <tr>
                      <th className={styles.excelHeader}>{t('verkaufteArtikel.excel.date')}</th>
                      <th className={styles.excelHeader}>{t('verkaufteArtikel.excel.time')}</th>
                      <th className={styles.excelHeader}>{t('verkaufteArtikel.excel.article')}</th>
                      <th className={styles.excelHeader}>{t('verkaufteArtikel.excel.quantity')}</th>
                      <th className={styles.excelHeader}>{t('verkaufteArtikel.excel.unitPrice')}</th>
                      <th className={styles.excelHeader}>{t('verkaufteArtikel.excel.total')}</th>
                      <th className={styles.excelHeader}>{t('verkaufteArtikel.excel.client')}</th>
                      <th className={styles.excelHeader}>{t('verkaufteArtikel.excel.email')}</th>
                      <th className={styles.excelHeader}>{t('verkaufteArtikel.excel.lieferschein')}</th>
                      <th className={styles.excelHeader}>{t('verkaufteArtikel.excel.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSoldItems.map((row, idx) => {
                      const status = getStatusBadge(row.saleStatus);
                      return (
                        <tr key={`${row.saleId}-${idx}`} className={styles.excelRow}>
                          <td className={styles.excelCell}>
                            <span className={styles.excelDate}>{row.dateString}</span>
                          </td>
                          <td className={styles.excelCell}>
                            <span className={styles.excelTime}>{row.dateTime}</span>
                          </td>
                          <td className={styles.excelCell}>
                            <span className={styles.excelProductName}>{row.productName}</span>
                          </td>
                          <td className={`${styles.excelCell} ${styles.excelNumber}`}>
                            <span className={styles.excelQuantity}>{row.quantity}</span>
                          </td>
                          <td className={`${styles.excelCell} ${styles.excelNumber}`}>
                            <span className={styles.excelUnitPrice}>{row.unitPrice.toFixed(2)}</span>
                          </td>
                          <td className={`${styles.excelCell} ${styles.excelNumber}`}>
                            <span className={styles.excelTotal}>{row.lineTotal.toFixed(2)} {currencySymbol}</span>
                          </td>
                          <td className={styles.excelCell}>
                            <span className={styles.excelClientName}>{row.clientName}</span>
                          </td>
                          <td className={styles.excelCell}>
                            <span className={styles.excelClientEmail}>{row.clientEmail}</span>
                          </td>
                          <td className={styles.excelCell}>
                            <span className={styles.excelLieferschein}>{row.lieferschein || '-'}</span>
                          </td>
                          <td className={styles.excelCell}>
                            <span 
                              className={styles.excelStatus}
                              style={{ 
                                backgroundColor: status.bg,
                                color: status.color
                              }}
                            >
                              {status.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Vista Mobile */}
          {viewMode === 'cards' && (
            <div className={styles.mobileView}>
              {filteredItems.length === 0 ? (
                <div className={`${styles.emptyState} ${styles.emptyStateMobile}`}>
                  {productFilter || clientFilter || liefFilter || dateFrom || dateTo || showCancelled || showPending ? (
                    <>
                      <div className={styles.emptyIcon}>🔍</div>
                      <h3>{t('verkaufteArtikel.empty.notFound.title')}</h3>
                      <p>{t('verkaufteArtikel.empty.notFound.text')}</p>
                      <button 
                        className={styles.clearFiltersButton}
                        onClick={clearFilters}
                      >
                        {t('verkaufteArtikel.actions.clearFilters')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyIcon}>📦</div>
                      <h3>{t('verkaufteArtikel.empty.noSales.title')}</h3>
                      <p>{t('verkaufteArtikel.empty.noSales.text')}</p>
                    </>
                  )}
                </div>
              ) : (
                visibleSoldItems.map((row, idx) => (
                  <div key={`${row.saleId}-${idx}`} className={styles.articleCard}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.productName}>{row.productName}</h3>
                      <span className={styles.quantityBadge}>{row.quantity}</span>
                    </div>
                    
                    <div className={styles.cardDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>{t('verkaufteArtikel.card.client')}</span>
                        <span className={styles.detailValue}>{row.clientName}</span>
                      </div>
                      {row.lieferschein && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>{t('verkaufteArtikel.card.lieferschein')}</span>
                          <span className={styles.detailValue}>{row.lieferschein}</span>
                        </div>
                      )}
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>{t('verkaufteArtikel.card.date')}</span>
                        <span className={styles.detailValue}>{row.dateString}</span>
                      </div>
                    </div>

                    <div className={styles.priceSection}>
                      <div className={styles.priceItem}>
                        <span className={styles.priceLabel}>{t('verkaufteArtikel.card.price')}</span>
                        <span className={styles.priceValue}>{row.unitPrice.toFixed(2)} {currencySymbol}</span>
                      </div>
                      <div className={`${styles.priceItem} ${styles.total}`}>
                        <span className={styles.priceLabel}>{t('verkaufteArtikel.card.total')}</span>
                        <span className={styles.priceValue}>{row.lineTotal.toFixed(2)} {currencySymbol}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Load More Trigger */}
          {hasMore && (
            <div className={styles.loadMoreSection}>
              <LoadMoreTrigger
                loadingMore={loadingMore}
                hasMore={hasMore}
                loadMoreRef={loadMoreRef}
                customMessage={t('verkaufteArtikel.actions.loadMore').replace('{remaining}', filteredItems.length - visibleSoldItems.length)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}