// pages/dashboard/admin/artikel/index.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useProduct } from '../../../hooks/useProducts';
import { ProductCreator } from '../../../components/adminDash/artikel/ProductCreator';
import { ProductEditor } from '../../../components/adminDash/artikel/ProductEditor';
import Pagination from '../../../components/shared/Pagination';
import { useLanguage } from '../../../contexts/LanguageContext';

import styles from './index.module.css';

export default function ListProduct() {
  const { t } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const {
    products,
    loading: productsLoading,
    error,
    currentPage,
    totalPages,
    paginationInfo,
    searchInput,
    activeSearch,
    stockFilter,
    sortOrder,
    setSearchInput,
    confirmSearch,
    setStock,
    setSort,
    resetFilters,
    clearSearch,
    goToPage,
    nextPage,
    prevPage,
    updateProduct,
    createProduct,
    deleteProductImage,
    deleteProduct,
    setProductToEdit,
    refreshProducts,
  } = useProduct();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Manejar tecla Enter en el input de búsqueda
  const handleSearchKeyPress = (e:any) => {
    if (e.key === 'Enter') {
      confirmSearch();
    }
  };

  const handleCreateSuccess = () => {
    setShowModal(false);
    refreshProducts();
  };

  const handleUpdateSuccess = () => {
    setEditingProduct(null);
  };

  const getStockStatus = (product) => {
    const stock = product.stock || 0;
    if (stock <= 0) return 'outOfStock';
    if (stock < 50) return 'lowStock';
    return 'inStock';
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando autenticación...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Artikelliste</h1>
          <p className={styles.subtitle}>Verwalten Sie Ihre Produktliste</p>
        </div>
        
        {isAuthenticated && (
          <button 
            onClick={() => setShowModal(true)} 
            className={styles.newBtn}
            disabled={productsLoading}
          >
            <span className={styles.plus}>+</span>
            Neuer Artikel
          </button>
        )}
      </header>

      <div className={styles.searchSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Name or number"
              className={styles.searchInput}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              disabled={productsLoading}
            />
            
            {/* Botón de búsqueda manual */}
            <button 
              className={styles.searchButton}
              onClick={confirmSearch}
              disabled={productsLoading || !searchInput.trim()}
            >
              Suchen
            </button>
            
            {/* Mostrar indicador de búsqueda activa */}
            {activeSearch && (
              <div className={styles.activeSearchIndicator}>
                <span>Aktive Suche: "{activeSearch}"</span>
                <button 
                  className={styles.clearSearch}
                  onClick={clearSearch}
                  disabled={productsLoading}
                  title="Suche löschen"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterContainer}>
              <label htmlFor="stock-filter" className={styles.filterLabel}>
                Bestandsfilter:
              </label>
              <select
                id="stock-filter"
                className={styles.filterSelect}
                value={stockFilter}
                onChange={(e) => setStock(e.target.value)}
                disabled={productsLoading}
              >
                <option value="all">Alle Artikel</option>
                <option value="inStock">Auf Lager (≥50)</option>
                <option value="lowStock">Wenig Bestand (1-49)</option>
                <option value="outOfStock">Nicht auf Lager (0)</option>
              </select>
            </div>

            <div className={styles.filterContainer}>
              <label htmlFor="sort-order" className={styles.filterLabel}>
                Sortieren:
              </label>
              <select
                id="sort-order"
                className={styles.filterSelect}
                value={sortOrder}
                onChange={(e) => setSort(e.target.value)}
                disabled={productsLoading}
              >
                <option value="none">Standard</option>
                <option value="asc">Bestand: Aufsteigend ⬆️ (niedrig → hoch)</option>
                <option value="desc">Bestand: Absteigend ⬇️ (hoch → niedrig)</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.searchStats}>
          <span className={styles.resultsCount}>
            {products.length} Artikel angezeigt
            {paginationInfo.total > 0 && ` von ${paginationInfo.total} insgesamt`}
            {activeSearch && ` für "${activeSearch}"`}
          </span>
          <div className={styles.activeFilters}>
            {stockFilter !== 'all' && (
              <span className={styles.activeFilter}>
                Filter: { 
                  stockFilter === 'inStock' ? 'Auf Lager' : 
                  stockFilter === 'lowStock' ? 'Wenig Bestand' : 
                  'Nicht auf Lager'
                }
                <button 
                  className={styles.clearFilter}
                  onClick={() => setStock('all')}
                  disabled={productsLoading}
                >
                  ✕
                </button>
              </span>
            )}
            {sortOrder !== 'none' && (
              <span className={styles.activeFilter}>
                Sortierung: { 
                  sortOrder === 'asc' ? 'Niedrig zu Hoch' : 
                  'Hoch zu Niedrig'
                }
                <button 
                  className={styles.clearFilter}
                  onClick={() => setSort('none')}
                  disabled={productsLoading}
                >
                  ✕
                </button>
              </span>
            )}
            {(activeSearch || stockFilter !== 'all' || sortOrder !== 'none') && (
              <button 
                className={styles.resetAllFilters}
                onClick={resetFilters}
                disabled={productsLoading}
              >
                Alle Filter zurücksetzen
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {productsLoading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            Laden...
          </div>
        ) : !isAuthenticated ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔒</div>
            <h3 className={styles.emptyTitle}>Acceso restringido</h3>
            <p className={styles.emptyText}>Debe iniciar sesión para ver los productos</p>
          </div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            {activeSearch || stockFilter !== 'all' || sortOrder !== 'none' ? (
              <>
                <div className={styles.emptyIcon}>🔍</div>
                <h3 className={styles.emptyTitle}>Keine Artikel gefunden</h3>
                <p className={styles.emptyText}>
                  {activeSearch && `Keine Ergebnisse für "${activeSearch}"`}
                  {activeSearch && (stockFilter !== 'all' || sortOrder !== 'none') && ' mit den ausgewählten Filtern'}
                </p>
                <button 
                  className={styles.clearSearchBtn}
                  onClick={resetFilters}
                >
                  Alle Filter zurücksetzen
                </button>
              </>
            ) : (
              <>
                <div className={styles.emptyIcon}>📦</div>
                <h3 className={styles.emptyTitle}>Keine Artikel vorhanden</h3>
                <p className={styles.emptyText}>Erstellen Sie Ihren ersten Artikel</p>
              </>
            )}
          </div>
        ) : (
          <>
            <table className={styles.productsTable}>
              <thead>
                <tr>
                  <th className={`${styles.tableHeader} ${styles.colName}`}>Artikelname</th>
                  <th className={`${styles.tableHeader} ${styles.colLager}`}>Nummer</th>
                  <th className={`${styles.tableHeader} ${styles.colPrice}`}>Preis (CHF)</th>
                  <th className={`${styles.tableHeader} ${styles.colStock}`}>
                    Bestand
                    {sortOrder !== 'none' && (
                      <span className={styles.sortIndicator}>
                        {sortOrder === 'asc' ? '⬆️' : '⬇️'}
                      </span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr 
                    key={product._id} 
                    className={styles.productRow}
                    onClick={() => {
                      if (isAuthenticated) {
                        setEditingProduct(product);
                        setProductToEdit(product);
                      }
                    }}
                    style={{ cursor: isAuthenticated ? 'pointer' : 'default' }}
                  >
                    <td className={`${styles.tableCell} ${styles.productName}`}>
                      {product.artikelName}
                    </td>
                    <td className={`${styles.tableCell} ${styles.productLager}`}>
                      {product.artikelNumber || '-'}
                    </td>
                    <td className={`${styles.tableCell} ${styles.productPrice}`}>
                      {product.price ? `CHF ${parseFloat(product.price).toFixed(2)}` : '-'}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.stockBadge} ${styles[getStockStatus(product)]}`}>
                        {product.stock || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              onNext={nextPage}
              onPrev={prevPage}
              loading={productsLoading}
            />

            {/* Info de paginación adicional */}
            <div className={styles.paginationInfo}>
              Seite {currentPage} von {totalPages} 
              {paginationInfo.total > 0 && ` (${paginationInfo.total} Artikel insgesamt)`}
            </div>
          </>
        )}
      </div>

      {editingProduct && isAuthenticated && (
        <ProductEditor
          product={editingProduct}
          loading={productsLoading}
          error={error}
          onClose={() => setEditingProduct(null)}
          onUpdateProduct={async (updatedProduct) => {
            const result = await updateProduct(updatedProduct._id, updatedProduct);
            if (result?.success) {
              setEditingProduct(null);
            }
            return result;
          }}
          onDeleteProductImage={deleteProductImage}
          onDeleteProduct={deleteProduct}
        />
      )}

      {showModal && isAuthenticated && (
        <ProductCreator
          loading={productsLoading}
          error={error}
          onClose={() => setShowModal(false)}
          onCreateProduct={async (productData) => {
            const result = await createProduct(productData);
            if (result?.success) {
              setShowModal(false);
            }
            return result;
          }}
        />
      )}
    </div>
  );
}