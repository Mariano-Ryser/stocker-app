import { useState, useMemo, useEffect } from "react";
import { useSales } from "../../../hooks/useSales";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import { useAuth } from '../../../components/auth/AuthProvider';
import LoadMoreTrigger from "../../../components/shared/LoadMoreTrigger";
import styles from "./verkaufteArtikel.module.css";

export default function VerkauftetArtikelPage() {
  const { sales, loading, error, refreshSales } = useSales();
  const [productFilter, setProductFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [liefFilter, setLiefFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCancelled, setShowCancelled] = useState(false);
  const [showPending, setShowPending] = useState(false);

  // {currencySymbol}
  const {company } = useAuth();
  const currencySymbol = company?.currency || 'USD';
  // Construimos array plano de items vendidos - EXCLUYENDO CANCELADAS y PENDING por defecto
  const soldItems = useMemo(() => {
    return sales
      .filter(sale => {
        if (sale.status === 'cancelled') return showCancelled;
        if (sale.status === 'pending') return showPending;
        return true;
      })
      .flatMap((sale) =>
        sale.items.map((item:any) => ({
          productName: item.product?.artikelName || item.artikelName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          clientName: sale.client?.name || sale.clientSnapshot?.name || "Kunde unbekannt",
          lieferschein: sale.lieferschein,
          date: new Date(sale.createdAt),
          dateString: new Date(sale.createdAt).toLocaleDateString('de-DE'),
          saleId: sale._id,
          saleStatus: sale.status
        }))
      );
  }, [sales, showCancelled, showPending]);

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

  // ⚡ ESTADÍSTICAS
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

  return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Verkaufte Artikel</h1>
            <p className={styles.pageSubtitle}>
              Übersicht aller verkauften Artikel
            </p>
          </div>
          
          {loading && (
            <div className={styles.loadingMessage}>
              🔄 Lade Verkaufsdaten...
            </div>
          )}
          {error && (
            <div className={styles.errorMessage}>
              ❌ Fehler: {error}
              <button onClick={handleRefresh} className={styles.retryButton}>
                Erneut versuchen
              </button>
            </div>
          )}
        </header>

        {/* Panel de Estadísticas Minimalista */}
        <div className={styles.statsPanel}>
          <div className={`${styles.statCard} ${styles.revenueCard}`}>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{totalRevenue.toFixed(2)}{currencySymbol}</div>
              <div className={styles.statLabel}>Umsatz</div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.quantityCard}`}>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{totalItems}</div>
              <div className={styles.statLabel}>Einheiten</div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.productsCard}`}>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{uniqueProducts}</div>
              <div className={styles.statLabel}>Artikel</div>
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
                placeholder="Artikel suchen..."
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
              placeholder="Kunde"
              className={styles.filterInput}
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Lieferschein"
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
                placeholder="Von"
                disabled={loading}
              />
              <span className={styles.dateSeparator}>—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={styles.dateInput}
                placeholder="Bis"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.filtersFooter}>
            <div className={styles.resultsInfo}>
              <span>
                {loading ? "Lade..." : (
                  <>
                    <strong>{filteredItems.length}</strong> Artikel
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
                Filter zurücksetzen
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Verkaufte Artikel werden geladen...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3>Fehler beim Laden der Artikel</h3>
            <p>{error}</p>
            <button onClick={handleRefresh} className={`${styles.retryButton} ${styles.large}`}>
              Erneut versuchen
            </button>
          </div>
        ) : (
          <>
            {/* Vista Desktop - Tabla Minimalista */}
            <div className={styles.tableContainer}>
              {filteredItems.length === 0 ? (
                <div className={styles.emptyState}>
                  {productFilter || clientFilter || liefFilter || dateFrom || dateTo || showCancelled || showPending ? (
                    <>
                      <div className={styles.emptyIcon}>🔍</div>
                      <h3>Keine Artikel gefunden</h3>
                      <p>Keine Ergebnisse für Ihre Suchkriterien</p>
                      <button 
                        className={styles.clearFiltersButton}
                        onClick={clearFilters}
                      >
                        Filter zurücksetzen
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyIcon}>📦</div>
                      <h3>Keine verkauften Artikel</h3>
                      <p>Es wurden noch keine Artikel verkauft</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <table className={styles.articlesTable}>
                    <thead>
                      <tr>
                        <th>Artikel</th>
                        <th>Menge</th>
                        <th>Preis</th>
                        <th>Gesamt</th>
                        <th>Kunde</th>
                        <th>Datum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleSoldItems.map((row, idx) => (
                        <tr key={`${row.saleId}-${idx}`} className={styles.tableRow}>
                          <td className={styles.productCell}>
                            <div className={styles.productName}>{row.productName}</div>
                            {row.lieferschein && (
                              <div className={styles.lieferscheinSubtitle}>
                                Lieferschein: {row.lieferschein}
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
                  
                  {/* Vista Mobile - Más minimalista */}
                  <div className={styles.mobileView}>
                    {visibleSoldItems.map((row, idx) => (
                      <div key={`${row.saleId}-${idx}`} className={styles.articleCard}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.productName}>{row.productName}</h3>
                          <span className={styles.quantityBadge}>{row.quantity}</span>
                        </div>
                        
                        <div className={styles.cardDetails}>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Kunde:</span>
                            <span className={styles.detailValue}>{row.clientName}</span>
                          </div>
                          {row.lieferschein && (
                            <div className={styles.detailRow}>
                              <span className={styles.detailLabel}>Lieferschein:</span>
                              <span className={styles.detailValue}>{row.lieferschein}</span>
                            </div>
                          )}
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Datum:</span>
                            <span className={styles.detailValue}>{row.dateString}</span>
                          </div>
                        </div>

                        <div className={styles.priceSection}>
                          <div className={styles.priceItem}>
                            <span className={styles.priceLabel}>Preis:</span>
                            <span className={styles.priceValue}>{row.unitPrice.toFixed(2)} {currencySymbol}</span>
                          </div>
                          <div className={`${styles.priceItem} ${styles.total}`}>
                            <span className={styles.priceLabel}>Gesamt:</span>
                            <span className={styles.priceValue}>{row.lineTotal.toFixed(2)} {currencySymbol}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Load More Trigger */}
            {hasMore && (
              <div className={styles.loadMoreSection}>
                <LoadMoreTrigger
                  loadingMore={loadingMore}
                  hasMore={hasMore}
                  loadMoreRef={loadMoreRef}
                  customMessage={`Mehr laden (${filteredItems.length - visibleSoldItems.length})`}
                />
              </div>
            )}
          </>
        )}
      </div>
  );
}