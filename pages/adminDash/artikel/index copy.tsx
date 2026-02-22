import { useState, useEffect } from 'react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useProduct } from '../../../hooks/useProducts';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import LoadMoreTrigger from '../../../components/shared/LoadMoreTrigger';
import { ProductCreator } from '../../../components/adminDash/artikel/ProductCreator';
import { ProductEditor } from '../../../components/adminDash/artikel/ProductEditor'
import { useLanguage } from '../../../contexts/LanguageContext';

import styles from './index.module.css';

export default function ListProduct() {
 const { t } = useLanguage();

  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    product, 
    products,
    loading: productsLoading,
    error,
    refreshTrigger,
    refreshTriggerIncrement,
    updateProduct,
    handleChange,
    createProduct,
    deleteProductImage,
    deleteProduct,
    setProductToEdit,
    refreshProducts,
  } = useProduct();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('none');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      // Ya manejado por el DashboardLayout
    }
  }, [authLoading, isAuthenticated]);

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

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = `${p.artikelName || ''} ${p.artikelNumber || ''} ${p.lagerPlatz || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const stockStatus = getStockStatus(p);
      const matchesStock = stockFilter === 'all' || stockStatus === stockFilter.replace('-', '');
      
      return matchesSearch && matchesStock;
    })
    .sort((a, b) => {
      if (sortOrder === 'none') return 0;
      
      const stockA = a.stock || 0;
      const stockB = b.stock || 0;
      
      if (sortOrder === 'asc') return stockA - stockB;
      if (sortOrder === 'desc') return stockB - stockA;
      
      return 0;
    });

  const {
    visibleItems: visibleProducts,
    loadingMore,
    loadMoreRef,
    hasMore
  } = useInfiniteScroll(filteredProducts, {
    initialCount: 20,
    loadMoreCount: 20,
    loadDelay: 100,
  }, refreshTrigger);

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
                placeholder="Artikel suchen... (Name, Nummer, Lagerplatz)"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={productsLoading}
              />
              {searchTerm && (
                <button 
                  className={styles.clearSearch}
                  onClick={() => setSearchTerm('')}
                  disabled={productsLoading}
                >
                  ✕
                </button>
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
                  onChange={(e) => setStockFilter(e.target.value)}
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
                  onChange={(e) => setSortOrder(e.target.value)}
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
              {visibleProducts.length} von {filteredProducts.length} Artikeln angezeigt
              {hasMore && ` (${filteredProducts.length - visibleProducts.length} mehr verfügbar)`}
            </span>
            <div className={styles.activeFilters}>
              {stockFilter !== 'all' && (
                <span className={styles.activeFilter}>
                  Filter: { 
                    stockFilter === 'in-stock' ? 'Auf Lager' : 
                    stockFilter === 'low-stock' ? 'Wenig Bestand' : 
                    'Nicht auf Lager'
                  }
                  <button 
                    className={styles.clearFilter}
                    onClick={() => setStockFilter('all')}
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
                    onClick={() => setSortOrder('none')}
                    disabled={productsLoading}
                  >
                    ✕
                  </button>
                </span>
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
          ) : visibleProducts.length === 0 ? (
            <div className={styles.emptyState}>
              {searchTerm || stockFilter !== 'all' || sortOrder !== 'none' ? (
                <>
                  <div className={styles.emptyIcon}>🔍</div>
                  <h3 className={styles.emptyTitle}>Keine Artikel gefunden</h3>
                  <p className={styles.emptyText}>
                    {searchTerm && (stockFilter !== 'all' || sortOrder !== 'none')
                      ? `Keine Ergebnisse für "${searchTerm}" mit den ausgewählten Filtern`
                      : searchTerm 
                      ? `Keine Ergebnisse für "${searchTerm}"`
                      : 'Keine Artikel mit den ausgewählten Filtern'
                    }
                  </p>
                  <div className={styles.emptyActions}>
                    {searchTerm && (
                      <button 
                        className={styles.clearSearchBtn}
                        onClick={() => setSearchTerm('')}
                      >
                        Suche zurücksetzen
                      </button>
                    )}
                    {(stockFilter !== 'all' || sortOrder !== 'none') && (
                      <button 
                        className={styles.clearSearchBtn}
                        onClick={() => {
                          setStockFilter('all');
                          setSortOrder('none');
                        }}
                      >
                        Alle Filter zurücksetzen
                      </button>
                    )}
                  </div>
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
                    <th className={`${styles.tableHeader} ${styles.colLager}`}>Lagerplatz</th>
                    <th className={`${styles.tableHeader} ${styles.colPrice}`}>Preis (CHF)</th>
                    <th className={`${styles.tableHeader} ${styles.colStock}`}>
                      Bestand
                      {sortOrder !== 'none' && (
                        <span className={styles.sortIndicator}>
                          {sortOrder === 'asc' ? ' ⬆️' : ' ⬇️'}
                        </span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product) => (
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
                        {product.lagerPlatz || '-'}
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

              <LoadMoreTrigger
                loadingMore={loadingMore}
                hasMore={hasMore}
                loadMoreRef={loadMoreRef}
                customMessage="Mehr Artikel laden"
              />
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
        // Opcional: hacer refresh si es necesario
        // refreshProducts();
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
      // Aquí llamas a tu función createProduct del hook
      const result = await createProduct(productData);
      if (result?.success) {
        refreshProducts(); // Forzar refresh
      }
      return result;
    }}
  />
)}
      </div>
  );
}