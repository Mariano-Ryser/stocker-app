import { useState, useEffect } from "react";
import { useSales } from "../../../hooks/useSales";
import Pagination from "../../../components/shared/Pagination";
import RechnungCreator from "../../../components/dashboard/regnung/RechnungCreator";
import RechnungPrint from "../../../components/dashboard/regnung/RechnungPrint";
import RechnungUpdate from "../../../components/dashboard/regnung/RechnungUpdate";
import StockMovementsModal from "../../../components/dashboard/regnung/SalesMovementsModal";
import { useAuth } from "../../../components/auth/AuthProvider"; 
import { useLanguage } from "../../../contexts/LanguageContext";
import styles from "./SalesPage.module.css";

export default function SalesPage() {
  const { t } = useLanguage();
  const { company, isAuthenticated, loading: authLoading } = useAuth();
  const currencySymbol = company?.currency || 'USD';
  
  const {
    sales,
    salesStats,
    loading,
    loadingMore,
    error,
    currentPage,
    totalPages,
    totalItems,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    clearFilters,
    goToPage,
    refreshSales,
    createSale,
    updateSale,
    isAuthenticated: hookAuth
  } = useSales();
  
  const [openModal, setOpenModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState(null);
  const [saleForMovements, setSaleForMovements] = useState(null);
  const [viewMode, setViewMode] = useState('excel'); // 'table', 'excel', 'cards'

  const formatCurrency = (amount) => {
    return Number(amount || 0).toFixed(2);
  };

  const getStatusColor = (status) => {
    const colors = {
      "paid": "#d1fae5",
      "cancelled": "#fee2e2",
      "pending": "#fff3cd"
    };
    return colors[status] || "#f8f9fa";
  };

  const getStatusText = (status) => {
    const texts = {
      "paid": t('sales.status.paid'),
      "cancelled": t('sales.status.cancelled'),
      "pending": t('sales.status.pending')
    };
    return texts[status] || status;
  };

  const getStatusBadge = (status) => {
    const badges = {
      "paid": { bg: "#d1fae5", color: "#065f46", text: getStatusText(status) },
      "cancelled": { bg: "#fee2e2", color: "#991b1b", text: getStatusText(status) },
      "pending": { bg: "#fff3cd", color: "#856404", text: getStatusText(status) }
    };
    return badges[status] || { bg: "#f3f4f6", color: "#374151", text: status };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCreateSuccess = () => {
    setOpenModal(false);
    refreshSales();
  };

  const handleUpdateSuccess = () => {
    setUpdateModalOpen(false);
    setSaleToEdit(null);
    refreshSales();
  };

  const handleUpdateClose = () => {
    setUpdateModalOpen(false);
    setSaleToEdit(null);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "⬆️" : "⬇️";
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>{t('sales.loading.auth')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('sales.title')}</h1>
          <p>{t('sales.subtitle')}</p>
          
          {loading && !loadingMore && (
            <div className={styles.loadingMessage}>
              🔄 {t('sales.loading.invoices')}
            </div>
          )}
          {error && (
            <div className={styles.errorMessage}>
              ❌ {t('sales.error.general')}: {error}
              <button onClick={refreshSales} className={styles.retryButton}>
                {t('sales.actions.retry')}
              </button>
            </div>
          )}
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'table' ? styles.activeView : ''}`}
              onClick={() => setViewMode('table')}
              title={t('sales.view.table')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/>
              </svg>
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'excel' ? styles.activeView : ''}`}
              onClick={() => setViewMode('excel')}
              title={t('sales.view.excel')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h5v2H7v-2z"/>
              </svg>
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'cards' ? styles.activeView : ''}`}
              onClick={() => setViewMode('cards')}
              title={t('sales.view.cards')}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h10v2H4v-2z"/>
              </svg>
            </button>
          </div>

          <button 
            className={styles.createButton} 
            onClick={() => setOpenModal(true)}
            disabled={loading}
          >
            <span>+</span>
            {t('sales.actions.new')}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder={t('sales.search.placeholder')}
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button 
              className={styles.clearButton}
              onClick={() => setSearch('')}
              disabled={loading}
              title={t('sales.search.clear')}
            >
              ✕
            </button>
          )}
        </div>
        
        <div className={styles.filterControls}>
          <input
            type="date"
            value={dateFrom}
            className={styles.filterInput}
            onChange={e => setDateFrom(e.target.value)}
            disabled={loading}
            placeholder={t('sales.filter.dateFrom')}
          />
          <input
            type="date"
            value={dateTo}
            className={styles.filterInput}
            onChange={e => setDateTo(e.target.value)}
            disabled={loading}
            placeholder={t('sales.filter.dateTo')}
          />
          <select
            className={styles.filterInput}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            disabled={loading}
          >
            <option value="">{t('sales.filter.allStatus')}</option>
            <option value="paid">{t('sales.status.paid')}</option>
            <option value="pending">{t('sales.status.pending')}</option>
            <option value="cancelled">{t('sales.status.cancelled')}</option>
          </select>
          
          <select
            className={styles.filterInput}
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortField(field);
              setSortDirection(direction);
            }}
            disabled={loading}
          >
            <option value="createdAt-desc">{t('sales.sort.newest')}</option>
            <option value="createdAt-asc">{t('sales.sort.oldest')}</option>
            <option value="total-desc">{t('sales.sort.priceHigh')}</option>
            <option value="total-asc">{t('sales.sort.priceLow')}</option>
            <option value="clientName-asc">{t('sales.sort.clientAZ')}</option>
            <option value="clientName-desc">{t('sales.sort.clientZA')}</option>
          </select>
        </div>
        
        <div className={styles.resultsInfo}>
          <span>
            {loading ? (
              t('sales.loading.short')
            ) : (
              t('sales.search.results')
                .replace('{visible}', sales.length)
                .replace('{total}', totalItems)
            )}
          </span>
          
          <div className={styles.activeFilters}>
            {(sortField !== "createdAt" || sortDirection !== "desc") && (
              <span className={styles.activeFilter}>
                {t('sales.filter.sortBy')}: {
                  sortField === "total" 
                    ? `${t('sales.sort.price')} ${sortDirection === "asc" ? "⬆️" : "⬇️"}`
                    : sortField === "clientName"
                    ? `${t('sales.sort.client')} ${sortDirection === "asc" ? "A-Z" : "Z-A"}`
                    : `${t('sales.sort.date')} ${sortDirection === "asc" ? "⬆️" : "⬇️"}`
                }
                <button 
                  className={styles.clearFilter}
                  onClick={() => {
                    setSortField("createdAt");
                    setSortDirection("desc");
                  }}
                  title={t('sales.filter.clear')}
                >
                  ✕
                </button>
              </span>
            )}
            {statusFilter && (
              <span className={styles.activeFilter}>
                {t('sales.filter.status')}: {getStatusText(statusFilter)}
                <button 
                  className={styles.clearFilter}
                  onClick={() => setStatusFilter("")}
                  title={t('sales.filter.clear')}
                >
                  ✕
                </button>
              </span>
            )}
            {(dateFrom || dateTo) && (
              <span className={styles.activeFilter}>
                {t('sales.filter.dateRange')}: {dateFrom || '...'} - {dateTo || '...'}
                <button 
                  className={styles.clearFilter}
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  title={t('sales.filter.clear')}
                >
                  ✕
                </button>
              </span>
            )}
            {(search || statusFilter || dateFrom || dateTo || sortField !== "createdAt" || sortDirection !== "desc") && (
              <button 
                className={styles.clearFiltersButton}
                onClick={clearFilters}
              >
                {t('sales.actions.resetFilters')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading && !loadingMore ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>{t('sales.loading.invoices')}</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>{t('sales.error.title')}</h3>
          <p>{error}</p>
          <button onClick={refreshSales} className={`${styles.retryButton} ${styles.retryButtonLarge}`}>
            {t('sales.actions.retry')}
          </button>
        </div>
      ) : (
        <>
          {/* Vista Tabla */}
          {viewMode === 'table' && (
            <div className={styles.desktopTable}>
              {sales.length === 0 ? (
                <div className={styles.emptyState}>
                  {search || statusFilter || dateFrom || dateTo ? (
                    <>
                      <div className={styles.emptyIcon}>🔍</div>
                      <h3>{t('sales.empty.notFound.title')}</h3>
                      <p>{t('sales.empty.notFound.text')}</p>
                      <button 
                        className={styles.clearFiltersButton}
                        onClick={clearFilters}
                      >
                        {t('sales.actions.resetFilters')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyIcon}>🧾</div>
                      <h3>{t('sales.empty.noInvoices.title')}</h3>
                      <p>{t('sales.empty.noInvoices.text')}</p>
                      <button 
                        className={`${styles.createButton} ${styles.createButtonOutline}`}
                        onClick={() => setOpenModal(true)}
                      >
                        {t('sales.actions.createFirst')}
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
                        {t('sales.table.date')} {getSortIcon('createdAt')}
                      </th>
                      <th 
                        className={`${styles.sortable} ${sortField === 'clientName' ? styles.active : ''}`}
                        onClick={() => handleSort('clientName')}
                      >
                        {t('sales.table.client')} {getSortIcon('clientName')}
                      </th>
                      <th>{t('sales.table.invoiceNumber')}</th>
                      <th 
                        className={`${styles.sortable} ${sortField === 'total' ? styles.active : ''}`}
                        onClick={() => handleSort('total')}
                      >
                        {t('sales.table.total')} {getSortIcon('total')}
                      </th>
                      <th>{t('sales.table.status')}</th>
                      <th>{t('sales.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(s => (
                      <tr 
                        key={s._id} 
                        className={styles.tableRow}
                        onClick={() => setSelectedSale(s)}
                      >
                        <td>{formatDate(s.createdAt)}</td>
                        <td className={styles.clientName}>
                          {s.clientSnapshot?.name || s.client?.name || t('sales.client.unknown')}
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
                          <div className={styles.actionButtons}>
                            <button
                              className={styles.stockButton}
                              onClick={(e) => {
                                setSaleForMovements(s);
                                e.stopPropagation();
                              }}
                              title={t('sales.actions.stock')}
                            >
                              📦
                            </button>
                            <button
                              className={styles.editButton}
                              onClick={(e) => {
                                setSaleToEdit(s);
                                setUpdateModalOpen(true);
                                e.stopPropagation();
                              }}
                              title={t('sales.buttons.edit')}
                            >
                              ✎
                            </button>
                          </div>
                        </td>
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
              {sales.length === 0 ? (
                <div className={styles.emptyState}>
                  {search || statusFilter || dateFrom || dateTo ? (
                    <>
                      <div className={styles.emptyIcon}>🔍</div>
                      <h3>{t('sales.empty.notFound.title')}</h3>
                      <p>{t('sales.empty.notFound.text')}</p>
                      <button 
                        className={styles.clearFiltersButton}
                        onClick={clearFilters}
                      >
                        {t('sales.actions.resetFilters')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyIcon}>🧾</div>
                      <h3>{t('sales.empty.noInvoices.title')}</h3>
                      <p>{t('sales.empty.noInvoices.text')}</p>
                      <button 
                        className={`${styles.createButton} ${styles.createButtonOutline}`}
                        onClick={() => setOpenModal(true)}
                      >
                        {t('sales.actions.createFirst')}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <table className={styles.excelTable}>
                  <thead>
                    <tr>
                      <th className={styles.excelHeader}>{t('sales.excel.date')}</th>
                      <th className={styles.excelHeader}>{t('sales.excel.time')}</th>
                      <th className={styles.excelHeader}>{t('sales.excel.client')}</th>
                      <th className={styles.excelHeader}>{t('sales.excel.invoiceNumber')}</th>
                      <th className={styles.excelHeader}>{t('sales.excel.subtotal')}</th>
                      <th className={styles.excelHeader}>{t('sales.excel.tax')}</th>
                      <th className={styles.excelHeader}>{t('sales.excel.total')}</th>
                      <th className={styles.excelHeader}>{t('sales.excel.status')}</th>
                      <th className={styles.excelHeader}>{t('sales.excel.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(s => {
                      const status = getStatusBadge(s.status);
                      const date = new Date(s.createdAt);
                      const fecha = formatDate(s.createdAt);
                      const hora = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <tr 
                          key={s._id} 
                          className={styles.excelRow}
                          onClick={() => setSelectedSale(s)}
                        >
                          <td className={styles.excelCell}>
                            <span className={styles.excelDate}>{fecha}</span>
                          </td>
                          
                          <td className={styles.excelCell}>
                            <span className={styles.excelTime}>{hora}</span>
                          </td>
                          
                          <td className={styles.excelCell}>
                            <span className={styles.excelClient}>
                              {s.clientSnapshot?.name || s.client?.name || t('sales.client.unknown')}
                            </span>
                            {s.clientSnapshot?.email && (
                              <span className={styles.excelClientEmail}>
                                {s.clientSnapshot.email}
                              </span>
                            )}
                          </td>
                          
                          <td className={styles.excelCell}>
                            <span className={styles.excelInvoiceNumber}>
                              {s.lieferschein || '-'}
                            </span>
                          </td>
                          
                          <td className={`${styles.excelCell} ${styles.excelNumber}`}>
                            <span className={styles.excelSubtotal}>
                              {formatCurrency(s.subtotal || 0)} {currencySymbol}
                            </span>
                          </td>
                          
                          <td className={`${styles.excelCell} ${styles.excelNumber}`}>
                            <span className={styles.excelTax}>
                              {formatCurrency(s.tax || 0)} {currencySymbol}
                            </span>
                            <span className={styles.excelTaxRate}>
                              ({s.taxRate || 19}%)
                            </span>
                          </td>
                          
                          <td className={`${styles.excelCell} ${styles.excelNumber}`}>
                            <span className={styles.excelTotal}>
                              {formatCurrency(s.total || 0)} {currencySymbol}
                            </span>
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
                          
                          <td className={styles.excelCell}>
                            <div className={styles.excelActions}>
                              <button
                                className={styles.excelStockButton}
                                onClick={(e) => {
                                  setSaleForMovements(s);
                                  e.stopPropagation();
                                }}
                                title={t('sales.actions.stock')}
                              >
                                📦
                              </button>
                              <button
                                className={styles.excelEditButton}
                                onClick={(e) => {
                                  setSaleToEdit(s);
                                  setUpdateModalOpen(true);
                                  e.stopPropagation();
                                }}
                                title={t('sales.buttons.edit')}
                              >
                                ✎
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Vista Tarjetas (Mobile) */}
          {viewMode === 'cards' && (
            <div className={styles.mobileCards}>
              {sales.length === 0 ? (
                <div className={`${styles.emptyState} ${styles.emptyStateMobile}`}>
                  {search || statusFilter || dateFrom || dateTo ? (
                    <>
                      <div className={styles.emptyIcon}>🔍</div>
                      <h3>{t('sales.empty.notFound.title')}</h3>
                      <p>{t('sales.empty.notFound.text')}</p>
                      <button 
                        className={styles.clearFiltersButton}
                        onClick={clearFilters}
                      >
                        {t('sales.actions.resetFilters')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.emptyIcon}>🧾</div>
                      <h3>{t('sales.empty.noInvoices.title')}</h3>
                      <p>{t('sales.empty.noInvoices.text')}</p>
                      <button 
                        className={`${styles.createButton} ${styles.createButtonOutline}`}
                        onClick={() => setOpenModal(true)}
                      >
                        {t('sales.actions.createFirst')}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                sales.map(s => (
                  <div 
                    key={s._id} 
                    className={styles.saleCard}
                    onClick={() => setSelectedSale(s)}
                    style={{ borderLeftColor: getStatusColor(s.status) }}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.cardClient}>
                        <h3>{s.clientSnapshot?.name || s.client?.name || t('sales.client.unknown')}</h3>
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
                        <span>{t('sales.table.invoiceNumber')}:</span>
                        <span>{s.lieferschein || '-'}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span>{t('sales.table.total')}:</span>
                        <span className={styles.cardTotal}>{formatCurrency(s.total)} {currencySymbol}</span>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={`${styles.stockButton} ${styles.stockButtonMobile}`}
                        onClick={(e) => {
                          setSaleForMovements(s);
                          e.stopPropagation();
                        }}
                      >
                        📦 {t('sales.buttons.stock')}
                      </button>
                      <button
                        className={`${styles.editButton} ${styles.editButtonMobile}`}
                        onClick={(e) => {
                          setSaleToEdit(s);
                          setUpdateModalOpen(true);
                          e.stopPropagation();
                        }}
                      >
                        {t('sales.buttons.edit')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                onNext={() => goToPage(currentPage + 1)}
                onPrev={() => goToPage(currentPage - 1)}
                loading={loadingMore}
              />
              <div className={styles.paginationInfo}>
                {t('sales.pagination.showing', {
                  count: sales.length,
                  total: totalItems
                })}
                {' · '}
                {t('sales.pagination.pageInfo', {
                  current: currentPage,
                  total: totalPages
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Modals */}
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
              salesApi={{ createSale }}
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

      {saleForMovements && (
        <StockMovementsModal
          sale={saleForMovements}
          onClose={() => setSaleForMovements(null)}
        />
      )}
    </div>
  );
}