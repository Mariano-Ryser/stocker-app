import { useState, useMemo, useEffect} from "react";
import { useSales } from "../../../hooks/useSales";
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll";
import LoadMoreTrigger from "../../../components/shared/LoadMoreTrigger";
import RechnungCreator from "../../../components/adminDash/regnung/RechnungCreator";
import RechnungPrint from "../../../components/adminDash/regnung/RechnungPrint";
import RechnungUpdate from "../../../components/adminDash/regnung/RechnungUpdate";
import { useAuth } from "../../../components/auth/AuthProvider";
import styles from "./SalesPage.module.css";

export default function SalesPage() {
  const {company, isAuthenticated, loading: authLoading } = useAuth();
    const currencySymbol = company?.currency || 'USD';
  const salesApi = useSales();
  const {
    sales,
    loading: salesLoading,
    error,
    refreshSales
  } = salesApi;
  
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
    }
  }, [authLoading, isAuthenticated]);

  const filtered = useMemo(() => {
    if (!isAuthenticated) return [];
    
    return sales
      .filter(s => {
        const clientName = s.clientSnapshot?.name || s.client?.name || "";
        const matchName = clientName.toLowerCase().includes(search.toLowerCase());
        const matchLieferschein = s.lieferschein?.toString().includes(search);
        const matchDate = dateFilter
          ? new Date(s.createdAt).toISOString().slice(0, 10) === dateFilter
          : true;
        const matchStatus = statusFilter ? s.status === statusFilter : true;
        return (matchName || matchLieferschein) && matchDate && matchStatus;
      })
      .sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortField) {
          case "total":
            aValue = a.total || 0;
            bValue = b.total || 0;
            break;
          case "clientName":
            aValue = (a.clientSnapshot?.name || a.client?.name || "").toLowerCase();
            bValue = (b.clientSnapshot?.name || b.client?.name || "").toLowerCase();
            break;
          case "createdAt":
          default:
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
        }

        if (sortDirection === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  }, [sales, search, dateFilter, statusFilter, sortField, sortDirection, isAuthenticated]);

  const handleSort = (field: string) => {
    if (!isAuthenticated) return;
    
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "⬆️" : "⬇️";
  };

  const infiniteScrollConfig = {
    initialCount: 20,
    loadMoreCount: 20,
    loadDelay: 100,
    rootMargin: '200px'
  };

  const {
    visibleItems: visibleSales,
    loadingMore,
    loadMoreRef,
    hasMore
  } = useInfiniteScroll(filtered, infiniteScrollConfig);

  const formatCurrency = (amount: number) => {
    return Number(amount || 0).toFixed(2);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "paid": "#e1f7d4ff",
      "cancelled": "#ffe6e9", 
      "pending": "#e3f7fc"
    };
    return colors[status] || "#f8f9fa";
  };

  const getStatusText = (status: string) => {
    const texts = {
      "paid": "Bezahlt",
      "cancelled": "Storniert",
      "pending": "Ausstehend"
    };
    return texts[status] || status;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleRefresh = async () => {
    if (isAuthenticated && refreshSales) {
      refreshSales();
    }
  };

  const handleCreateSuccess = () => {
    setOpenModal(false);
  };

  const handleUpdateSuccess = () => {
    setUpdateModalOpen(false);
    setSaleToEdit(null);
  }; 

  const handleUpdateClose = () => {
    setUpdateModalOpen(false);
    setSaleToEdit(null);
  };

  if (authLoading) {
    return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando autenticación...</p>
        </div>
    );
  }

  return (
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Rechnungen</h1>
            <p>Verwalten Sie Ihre Rechnungen und Verkäufe</p>
            
            {salesLoading && (
              <div className={styles.loadingMessage}>
                🔄 Lade Rechnungen...
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
          </div>
          
         {isAuthenticated && (
            <button 
              className={styles.createButton} 
              onClick={() => setOpenModal(true)}
              disabled={salesLoading}
            >
              <span>+</span>
              Neue Rechnung
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Kunde oder Rechnungsnummer suchen..."
              className={styles.searchInput}
              value={search}
              onChange={e => setSearch(e.target.value)}
              disabled={salesLoading}
            />
            {search && (
              <button 
                className={styles.clearButton}
                onClick={() => setSearch('')}
                disabled={salesLoading}
              >
                ✕
              </button>
            )}
          </div>
          
          <div className={styles.filterControls}>
            <input
              type="date"
              value={dateFilter}
              className={styles.filterInput}
              onChange={e => setDateFilter(e.target.value)}
              disabled={salesLoading}
            />
            <select
              className={styles.filterInput}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              disabled={salesLoading}
            >
              <option value="">Alle Status</option>
              <option value="paid">Bezahlt</option>
              <option value="pending">Ausstehend</option>
              <option value="cancelled">Storniert</option>
            </select>
            
            {/* 🎯 NUEVO: Filtro de ordenamiento */}
            <select
              className={styles.filterInput}
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field);
                setSortDirection(direction);
              }}
              disabled={salesLoading}
            >
              <option value="createdAt-desc">Neueste zuerst</option>
              <option value="createdAt-asc">Älteste zuerst</option>
              <option value="total-desc">Preis: Hoch zu Niedrig</option>
              <option value="total-asc">Preis: Niedrig zu Hoch</option>
              <option value="clientName-asc">Kunde: A-Z</option>
              <option value="clientName-desc">Kunde: Z-A</option>
            </select>
          </div>
          
          <div className={styles.resultsInfo}>
            <span>
              {salesLoading ? (
                "Lade..."
              ) : (
                <>
                  <strong>{visibleSales.length}</strong> von <strong>{filtered.length}</strong> Rechnungen
                  {hasMore && ` (${filtered.length - visibleSales.length} mehr verfügbar)`}
                </>
              )}
            </span>
            
            {/* 🎯 NUEVO: Filtros activos */}
            <div className={styles.activeFilters}>
              {(sortField !== "createdAt" || sortDirection !== "desc") && (
                <span className={styles.activeFilter}>
                  Sortierung: {
                    sortField === "total" 
                      ? `Preis ${sortDirection === "asc" ? "⬆️" : "⬇️"}`
                      : sortField === "clientName"
                      ? `Kunde ${sortDirection === "asc" ? "A-Z" : "Z-A"}`
                      : `Datum ${sortDirection === "asc" ? "⬆️" : "⬇️"}`
                  }
                  <button 
                    className={styles.clearFilter}
                    onClick={() => {
                      setSortField("createdAt");
                      setSortDirection("desc");
                    }}
                  >
                    ✕
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className={styles.activeFilter}>
                  Status: {getStatusText(statusFilter)}
                  <button 
                    className={styles.clearFilter}
                    onClick={() => setStatusFilter("")}
                  >
                    ✕
                  </button>
                </span>
              )}
              {dateFilter && (
                <span className={styles.activeFilter}>
                  Datum: {dateFilter}
                  <button 
                    className={styles.clearFilter}
                    onClick={() => setDateFilter("")}
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {salesLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Rechnungen werden geladen...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3>Fehler beim Laden der Rechnungen</h3>
            <p>{error}</p>
            <button onClick={handleRefresh} className={`${styles.retryButton} ${styles.retryButtonLarge}`}>
              Erneut versuchen
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className={styles.desktopTable}>
              {visibleSales.length === 0 ? (
                <div className={styles.emptyState}>
                  {search || dateFilter || statusFilter ? (
                    <>
                      <div className={styles.emptyIcon}>🔍</div>
                      <h3>Keine Rechnungen gefunden</h3>
                      <p>Keine Ergebnisse für Ihre Suchkriterien</p>
                      <button 
                        className={styles.clearFiltersButton}
                        onClick={() => {
                          setSearch('');
                          setDateFilter('');
                          setStatusFilter('');
                          setSortField('createdAt');
                          setSortDirection('desc');
                        }}
                      >
                        Alle Filter zurücksetzen
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyIcon}>🧾</div>
                      <h3>Keine Rechnungen vorhanden</h3>
                      <p>Erstellen Sie Ihre erste Rechnung</p>
                      <button 
                        className={`${styles.createButton} ${styles.createButtonOutline}`}
                        onClick={() => setOpenModal(true)}
                      >
                        Erste Rechnung erstellen
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <table className={styles.salesTable}>
                  <thead>
                    <tr>
                      <th 
                        className={`${styles.sortable} ${sortField === 'createdAt' ? styles.active : ''}`}
                        onClick={() => handleSort('createdAt')}
                      >
                        Datum {getSortIcon('createdAt')}
                      </th>
                      <th 
                        className={`${styles.sortable} ${sortField === 'clientName' ? styles.active : ''}`}
                        onClick={() => handleSort('clientName')}
                      >
                        Kunde {getSortIcon('clientName')}
                      </th>
                      <th>Lieferschein</th>
                      <th 
                        className={`${styles.sortable} ${sortField === 'total' ? styles.active : ''}`}
                        onClick={() => handleSort('total')}
                      >
                        Total {getSortIcon('total')}
                      </th>
                      <th>Status</th>
                      <th>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSales.map(s => (
                      <tr 
                        key={s._id} 
                        className={styles.tableRow}
                        onClick={() => setSelectedSale(s)}
                      >
                        <td>{formatDate(s.createdAt)}</td>
                        <td className={styles.clientName}>
                          {s.clientSnapshot?.name || s.client?.name || 'Unbekannt'}
                        </td>
                        <td>{s.lieferschein || '-'}</td>
                        <td className={styles.totalAmount}>{formatCurrency(s.total)} {currencySymbol}</td>
                        <td>
                          <span 
                            className={styles.statusTag}
                            style={{ backgroundColor: getStatusColor(s.status) }}
                          >
                            {getStatusText(s.status)}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.editButton}
                            onClick={(e) => {
                              setSaleToEdit(s);
                              setUpdateModalOpen(true);
                              e.stopPropagation();
                            }}
                          >
                            Bearbeiten
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Mobile Cards */}
            <div className={styles.mobileCards}>
              {visibleSales.length === 0 ? (
                <div className={`${styles.emptyState} ${styles.emptyStateMobile}`}>
                  {search || dateFilter || statusFilter ? (
                    <>
                      <div className={styles.emptyIcon}>🔍</div>
                      <h3>Keine Rechnungen gefunden</h3>
                      <p>Keine Ergebnisse für Ihre Suchkriterien</p>
                      <button 
                        className={styles.clearFiltersButton}
                        onClick={() => {
                          setSearch('');
                          setDateFilter('');
                          setStatusFilter('');
                          setSortField('createdAt');
                          setSortDirection('desc');
                        }}
                      >
                        Alle Filter zurücksetzen
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyIcon}>🧾</div>
                      <h3>Keine Rechnungen vorhanden</h3>
                      <p>Erstellen Sie Ihre erste Rechnung</p>
                      <button 
                        className={`${styles.createButton} ${styles.createButtonOutline}`}
                        onClick={() => setOpenModal(true)}
                      >
                        Erste Rechnung erstellen
                      </button>
                    </>
                  )}
                </div>
              ) : (
                visibleSales.map(s => (
                  <div 
                    key={s._id} 
                    className={styles.saleCard}
                    onClick={() => setSelectedSale(s)}
                    style={{ borderLeftColor: getStatusColor(s.status) }}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardClient}>
                        <h3>{s.clientSnapshot?.name || s.client?.name || 'Unbekannt'}</h3>
                        <span className={styles.cardDate}>{formatDate(s.createdAt)}</span>
                      </div>
                      <span 
                        className={`${styles.statusTag} ${styles.statusTagMobile}`}
                        style={{ backgroundColor: getStatusColor(s.status) }}
                      >
                        {getStatusText(s.status)}
                      </span>
                    </div>
                    
                    <div className={styles.cardDetails}>
                      <div className={styles.detailRow}>
                        <span>Lieferschein:</span>
                        <span>{s.lieferschein || '-'}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Total:</span>
                        <span className={styles.cardTotal}>{formatCurrency(s.total)} {currencySymbol}</span>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.editButton} ${styles.editButtonMobile}`}
                        onClick={(e) => {
                          setSaleToEdit(s);
                          setUpdateModalOpen(true);
                          e.stopPropagation();
                        }}
                      >
                        Bearbeiten
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Load More Trigger */}
            {hasMore && (
              <div className={styles.loadMoreSection}>
                <LoadMoreTrigger
                  loadingMore={loadingMore}
                  hasMore={hasMore}
                  loadMoreRef={loadMoreRef}
                  customMessage={`Mehr Rechnungen laden (${filtered.length - visibleSales.length} verfügbar)`}
                />
              </div>
            )}
          </>
        )}

        {/* Modals con verificación de autenticación */}
        {selectedSale && (
          <RechnungPrint
            sale={selectedSale}
            onClose={() => setSelectedSale(null)}
          />
        )}

        {openModal && isAuthenticated && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <button 
                className={styles.modalClose} 
                onClick={() => setOpenModal(false)}
              >
                ✖
              </button>
              <RechnungCreator 
                onDone={handleCreateSuccess}
                salesApi={salesApi}
              />
            </div>
          </div>
        )}

        {updateModalOpen && saleToEdit && isAuthenticated && (
          <RechnungUpdate
            sale={saleToEdit}
            onClose={handleUpdateClose}
            onSaved={handleUpdateSuccess}
          />
        )}
      </div>
  );
}