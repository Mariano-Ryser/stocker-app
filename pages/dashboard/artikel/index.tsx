// pages/dashboard/admin/artikel/index.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useProduct } from '../../../hooks/useProducts';
import { ProductCreator } from '../../../components/dashboard/artikel/ProductCreator';
import { ProductEditor } from '../../../components/dashboard/artikel/ProductEditor';
import Pagination from '../../../components/shared/Pagination';
import { useLanguage } from '../../../contexts/LanguageContext';

import styles from './listProduct.module.css';

type ProductResult = {
  success: boolean;
  product?: any;
  error?: string;
  result?: any;
};

// ===== COMPONENTES INTERNOS (igual que antes) =====
const TableView = ({ products, currencySymbol, getStockStatus, getStockStatusText, onProductClick, t }) => (
  <table className={styles.productsTable}>
    <thead>
      <tr>
        <th className={`${styles.tableHeader} ${styles.colName}`}>{t('artikel.table.name')}</th>
        <th className={`${styles.tableHeader} ${styles.colLager}`}>{t('artikel.table.lagerplatz')}</th>
        <th className={`${styles.tableHeader} ${styles.colNumber}`}>{t('artikel.table.number')}</th>
        <th className={`${styles.tableHeader} ${styles.colPrice}`}>{t('artikel.table.price')}</th>
        <th className={`${styles.tableHeader} ${styles.colStock}`}>{t('artikel.table.stock')}</th>
      </tr>
    </thead>
    <tbody>
      {products.map((product: any) => (
        <tr 
          key={product._id} 
          className={styles.productRow}
          onClick={() => onProductClick(product)}
        >
          <td className={`${styles.tableCell} ${styles.productName}`}>
            {product.artikelName}
          </td>
          <td className={`${styles.tableCell} ${styles.productLager}`}>
            {product.lagerPlatz || '-'}
          </td>
          <td className={`${styles.tableCell} ${styles.productNumber}`}>
            {product.artikelNumber || '-'}
          </td>
          <td className={`${styles.tableCell} ${styles.productPrice}`}>
            {product.price ? `${currencySymbol} ${Number(product.price).toFixed(2)}` : '-'}
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
);

const GridView = ({ products, currencySymbol, getStockStatus, getStockStatusText, onProductClick, t }) => (
  <div className={styles.productGrid}>
    {products.map((product:any) => (
      <div
        key={product._id}
        className={styles.productCard}
        onClick={() => onProductClick(product)}
      >
        <div className={styles.cardImageWrapper}>
          {product.imagen ? (
            <img 
              src={product.imagen} 
              alt={product.artikelName}
              className={styles.cardImage}
              loading="lazy"
            />
          ) : (
            <div className={styles.cardPlaceholder}>
              <img
                src="/img/moving-box.png"
                alt="Placeholder"
                className={styles.placeholderImage}
                loading="lazy"
              />
            </div>
          )}
          
          <span className={`${styles.cardStockBadge} ${styles[getStockStatus(product)]}`}>
            {product.stock || 0} {product.stock === 1 ? t('artikel.card.unit') : t('artikel.card.units')}
          </span>
        </div>
        
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{product.artikelName}</h3>
          <div className={styles.cardDetails}>
            {product.lagerPlatz && (
              <p className={styles.cardLocation}>
                {t('artikel.card.location').replace('{location}', product.lagerPlatz)}
              </p>
            )}
            {product.artikelNumber && (
              <p className={styles.cardNumber}>
                {t('artikel.card.number').replace('{number}', product.artikelNumber)}
              </p>
            )}
          </div>
          <div className={styles.cardFooter}>
            {product.price ? (
              <span className={styles.cardPrice}>
                {currencySymbol} {Number(product.price).toFixed(2)}
              </span>
            ) : (
              <span className={styles.cardPrice}>-</span>
            )}
            <span className={`${styles.cardStockStatus} ${styles[getStockStatus(product)]}`}>
              {getStockStatusText(product)}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ExcelView = ({ products, currencySymbol, getStockStatus, getStockStatusText, onProductClick, t }) => {
  const productsWithTotal = useMemo(() => 
    products.map(product => ({
      ...product,
      totalValue: (product.stock || 0) * (product.price || 0)
    })), [products]
  );

  return (
    <div className={styles.excelView}>
      <table className={styles.excelTable}>
        <thead>
          <tr>
            <th className={styles.excelHeader}>{t('artikel.table.name')}</th>
            <th className={styles.excelHeader}>{t('artikel.table.lagerplatz')}</th>
            <th className={styles.excelHeader}>{t('artikel.table.number')}</th>
            <th className={styles.excelHeader}>{t('artikel.table.stock')}</th>
            <th className={styles.excelHeader}>{t('artikel.table.price')}</th>
            <th className={styles.excelHeader}>{t('artikel.excel.totalValue')}</th>
            <th className={styles.excelHeader}>{t('artikel.excel.status')}</th>
          </tr>
        </thead>
        <tbody>
          {productsWithTotal.map((product) => (
            <tr 
              key={product._id} 
              className={styles.excelRow}
              onClick={() => onProductClick(product)}
            >
              <td className={styles.excelCell}>
                <div className={styles.excelCellContent}>
                  {product.artikelName}
                </div>
              </td>
              <td className={styles.excelCell}>
                <span className={styles.excelLocation}>
                  {product.lagerPlatz || '-'}
                </span>
              </td>
              <td className={styles.excelCell}>
                <span className={styles.excelArtikelNumber}>
                  {product.artikelNumber || '-'}
                </span>
              </td>
              <td className={`${styles.excelCell} ${styles.excelStock}`}>
                <span className={`${styles.excelStockBadge} ${styles[getStockStatus(product)]}`}>
                  {product.stock || 0}
                </span>
              </td>
              <td className={`${styles.excelCell} ${styles.excelPrice}`}>
                {product.price ? (
                  <>
                    <span className={styles.excelCurrency}>{currencySymbol}</span>
                    {Number(product.price).toFixed(2)}
                  </>
                ) : '-'}
              </td>
              <td className={`${styles.excelCell} ${styles.excelTotal}`}>
                {product.totalValue > 0 ? (
                  <>
                    <span className={styles.excelCurrency}>{currencySymbol}</span>
                    {product.totalValue.toFixed(2)}
                  </>
                ) : '-'}
              </td>
              <td className={styles.excelCell}>
                <span className={`${styles.excelStatus} ${styles[getStockStatus(product)]}`}>
                  {getStockStatusText(product)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ViewToggle = ({ viewMode, setViewMode, loading, t }) => {
  const views = useMemo(() => [
    { mode: 'table', title: t('artikel.view.table'), path: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z' },
    { mode: 'grid', title: t('artikel.view.grid'), path: 'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z' },
    { mode: 'excel', title: t('artikel.view.excel'), path: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h5v2H7v-2z' }
  ], [t]);

  return (
    <div className={styles.viewToggle}>
      {views.map(({ mode, title, path }) => (
        <button
          key={mode}
          className={`${styles.viewButton} ${viewMode === mode ? styles.activeView : ''}`}
          onClick={() => setViewMode(mode)}
          title={title}
          disabled={loading}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d={path} />
          </svg>
        </button>
      ))}
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL MODIFICADO =====
export default function ListProduct() {
  const { t } = useLanguage();
  const { company, isAuthenticated, loading: authLoading } = useAuth();

  const currencySymbol = useMemo(() => company?.currency || 'USD', [company?.currency]);
  const [viewMode, setViewMode] = useState('excel');
  const [isInitialRender, setIsInitialRender] = useState(true);
  
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
    editingProduct,
    // 🔥 NUEVOS: Métodos de caché para renderizado instantáneo
    scannerProducts,
    scannerLoading,
    isCacheInitialized,
  } = useProduct();

  const [showModal, setShowModal] = useState(false);

  // 🔥 CLAVE: Usar productos del caché para renderizado instantáneo
  const displayProducts = useMemo(() => {
    // Si tenemos productos paginados y no estamos en carga inicial, usarlos
    if (products.length > 0 && !isInitialRender) {
      return products;
    }
    // Si no hay productos paginados pero hay caché, usar caché
    if (scannerProducts.length > 0 && isInitialRender) {
      return scannerProducts.slice(0, 30); // Mostrar primeros 30 del caché
    }
    return products;
  }, [products, scannerProducts, isInitialRender]);

  // 🔥 Efecto para manejar el renderizado inicial
  useEffect(() => {
    if (!isAuthenticated) return;

    // Después de 2 segundos, cambiar a renderizado normal
    const timer = setTimeout(() => {
      setIsInitialRender(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Mostrar loading solo en primera carga sin caché
  const showLoading = () => {
    if (authLoading) return true;
    if (!isAuthenticated) return false;
    // Solo mostrar loading si no hay caché y estamos cargando
    if (isInitialRender && !isCacheInitialized && productsLoading) return true;
    if (!isInitialRender && productsLoading && displayProducts.length === 0) return true;
    return false;
  };

  const getStockStatus = useCallback((product: any) => {
    const stock = product.stock || 0;
    const threshold = product.lowStockThreshold || 10;
    
    if (stock <= 0) return 'outOfStock';
    if (stock <= threshold) return 'lowStock';
    return 'inStock';
  }, []);

  const getStockStatusText = useCallback((product: any) => {
    const stock = product.stock || 0;
    const threshold = product.lowStockThreshold || 10;
    
    if (stock <= 0) return t('artikel.stock.outOfStock');
    if (stock <= threshold) return t('artikel.stock.lowStock');
    return t('artikel.stock.inStock');
  }, [t]);

  const handleSearchKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      confirmSearch();
      setIsInitialRender(false);
    }
  }, [confirmSearch]);

  const handleCreateSuccess = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleProductClick = useCallback((product) => {
    if (isAuthenticated) {
      setProductToEdit(product);
    }
  }, [isAuthenticated, setProductToEdit]);

  const handleUpdateProduct = useCallback(async (updatedProduct): Promise<ProductResult> => {
    const result = await updateProduct(updatedProduct._id, updatedProduct);
    if (result?.success) {
      setProductToEdit(null);
    }
    return result as ProductResult;
  }, [updateProduct]);

  const handleDeleteProductImage = useCallback(async (id): Promise<ProductResult> => {
    return await deleteProductImage(id) as ProductResult;
  }, [deleteProductImage]);

  const handleDeleteProduct = useCallback(async (id): Promise<ProductResult> => {
    const result = await deleteProduct(id);
    if (result?.success) {
      setProductToEdit(null);
    }
    return result as ProductResult;
  }, [deleteProduct]);

  const handleCreateProduct = useCallback(async (productData:any): Promise<ProductResult> => {
    const result = await createProduct(productData);
    if (result?.success) {
      setShowModal(false);
    }
    return result as ProductResult;
  }, [createProduct]);

  const activeFilterText = useMemo(() => {
    if (stockFilter === 'inStock') return t('artikel.filter.filterInStock');
    if (stockFilter === 'lowStock') return t('artikel.filter.filterLowStock');
    if (stockFilter === 'outOfStock') return t('artikel.filter.filterOutOfStock');
    return '';
  }, [stockFilter, t]);

  const sortText = useMemo(() => {
    if (sortOrder === 'asc') return t('artikel.filter.sortAscLabel');
    if (sortOrder === 'desc') return t('artikel.filter.sortDescLabel');
    return '';
  }, [sortOrder, t]);

  const resultsText = useMemo(() => {
    let text = t('artikel.search.results').replace('{count}', displayProducts.length);
    if (paginationInfo.total > 0) {
      text += ` ${t('artikel.search.resultsOf').replace('{total}', paginationInfo.total)}`;
    }
    if (activeSearch) {
      text += ` ${t('artikel.search.for').replace('{term}', activeSearch)}`;
    }
    return text;
  }, [displayProducts.length, paginationInfo.total, activeSearch, t]);

  const paginationText = useMemo(() => {
    let text = t('artikel.pagination.page')
      .replace('{current}', currentPage)
      .replace('{total}', totalPages);
    if (paginationInfo.total > 0) {
      text += ` ${t('artikel.pagination.total').replace('{total}', paginationInfo.total)}`;
    }
    return text;
  }, [currentPage, totalPages, paginationInfo.total, t]);

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>{t('artikel.loading.auth')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 🔥 Indicador de actualización en segundo plano (opcional) */}
      {/* {isInitialRender && isCacheInitialized && productsLoading && (
        <div className={styles.backgroundUpdate}>
          <span>🔄 Actualizando datos...</span>
        </div>
      )} */}

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('artikel.title')}</h1>
          <p className={styles.subtitle}>{t('artikel.subtitle')}</p>
        </div>
        
        <div className={styles.headerActions}>
          {isAuthenticated && (
            <>
              <ViewToggle 
                viewMode={viewMode} 
                setViewMode={setViewMode} 
                loading={productsLoading}
                t={t}
              />
              <button 
                onClick={() => setShowModal(true)} 
                className={styles.newBtn}
                disabled={productsLoading}
              >
                <span className={styles.plus}>+</span>
                {t('artikel.newArticle')}
              </button>
            </>
          )}
        </div>
      </header>

      <div className={styles.searchSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder={t('artikel.search.placeholder')}
              className={styles.searchInput}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              disabled={productsLoading}
            />
            
            <button 
              className={styles.searchButton}
              onClick={() => {
                confirmSearch();
                setIsInitialRender(false);
              }}
              disabled={productsLoading || !searchInput.trim()}
            >
              {t('artikel.search.button')}
            </button>
            
            {activeSearch && (
              <div className={styles.activeSearchIndicator}>
                <span>{t('artikel.search.activeSearch').replace('{term}', activeSearch)}</span>
                <button 
                  className={styles.clearSearch}
                  onClick={clearSearch}
                  disabled={productsLoading}
                  title={t('artikel.search.clear')}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterContainer}>
              <label htmlFor="stock-filter" className={styles.filterLabel}>
                {t('artikel.filter.stock')}
              </label>
              <select
                id="stock-filter"
                className={styles.filterSelect}
                value={stockFilter}
                onChange={(e) => {
                  setStock(e.target.value);
                  setIsInitialRender(false);
                }}
                disabled={productsLoading}
              >
                <option value="all">{t('artikel.filter.all')}</option>
                <option value="inStock">{t('artikel.filter.inStock')}</option>
                <option value="lowStock">{t('artikel.filter.lowStock')}</option>
                <option value="outOfStock">{t('artikel.filter.outOfStock')}</option>
              </select>
            </div>

            <div className={styles.filterContainer}>
              <label htmlFor="sort-order" className={styles.filterLabel}>
                {t('artikel.filter.sort')}
              </label>
              <select
                id="sort-order"
                className={styles.filterSelect}
                value={sortOrder}
                onChange={(e) => {
                  setSort(e.target.value);
                  setIsInitialRender(false);
                }}
                disabled={productsLoading}
              >
                <option value="none">{t('artikel.filter.sortNone')}</option>
                <option value="asc">{t('artikel.filter.sortAsc')}</option>
                <option value="desc">{t('artikel.filter.sortDesc')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.searchStats}>
          <span className={styles.resultsCount}>
            {resultsText}
          </span>
          <div className={styles.activeFilters}>
            {stockFilter !== 'all' && (
              <span className={styles.activeFilter}>
                {t('artikel.filter.activeFilter').replace('{filter}', activeFilterText)}
                <button 
                  className={styles.clearFilter}
                  onClick={() => setStock('all')}
                  disabled={productsLoading}
                  title={t('artikel.filter.clear')}
                >
                  ✕
                </button>
              </span>
            )}
            {sortOrder !== 'none' && (
              <span className={styles.activeFilter}>
                {t('artikel.filter.activeSort').replace('{sort}', sortText)}
                <button 
                  className={styles.clearFilter}
                  onClick={() => setSort('none')}
                  disabled={productsLoading}
                  title={t('artikel.filter.clear')}
                >
                  ✕
                </button>
              </span>
            )}
            {(activeSearch || stockFilter !== 'all' || sortOrder !== 'none') && (
              <button 
                className={styles.resetAllFilters}
                onClick={() => {
                  resetFilters();
                  setIsInitialRender(false);
                }}
                disabled={productsLoading}
              >
                {t('artikel.filter.resetAll')}
              </button>
            )}
          </div>
        </div>
      </div>
   
      <div className={styles.tableContainer}>
        {showLoading() ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            {t('artikel.loading.products')}
          </div>
        ) : !isAuthenticated ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔒</div>
            <h3 className={styles.emptyTitle}>{t('artikel.empty.restricted.title')}</h3>
            <p className={styles.emptyText}>{t('artikel.empty.restricted.text')}</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className={styles.emptyState}>
            {activeSearch || stockFilter !== 'all' || sortOrder !== 'none' ? (
              <>
                <div className={styles.emptyIcon}>🔍</div>
                <h3 className={styles.emptyTitle}>{t('artikel.empty.notFound.title')}</h3>
                <p className={styles.emptyText}>
                  {activeSearch && t('artikel.empty.notFound.text').replace('{term}', activeSearch)}
                  {activeSearch && (stockFilter !== 'all' || sortOrder !== 'none') && t('artikel.empty.notFound.textWithFilters')}
                </p>
                <button 
                  className={styles.clearSearchBtn}
                  onClick={() => {
                    resetFilters();
                    setIsInitialRender(false);
                  }}
                >
                  {t('artikel.empty.resetButton')}
                </button>
              </>
            ) : (
              <>
                <div className={styles.emptyIcon}>📦</div>
                <h3 className={styles.emptyTitle}>{t('artikel.empty.noProducts.title')}</h3>
                <p className={styles.emptyText}>{t('artikel.empty.noProducts.text')}</p>
              </>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'table' && (
              <TableView 
                products={displayProducts}
                currencySymbol={currencySymbol}
                getStockStatus={getStockStatus}
                getStockStatusText={getStockStatusText}
                onProductClick={handleProductClick}
                t={t}
              />
            )}

            {viewMode === 'grid' && (
              <GridView 
                products={displayProducts}
                currencySymbol={currencySymbol}
                getStockStatus={getStockStatus}
                getStockStatusText={getStockStatusText}
                onProductClick={handleProductClick}
                t={t}
              />
            )}

            {viewMode === 'excel' && (
              <ExcelView 
                products={displayProducts}
                currencySymbol={currencySymbol}
                getStockStatus={getStockStatus}
                getStockStatusText={getStockStatusText}
                onProductClick={handleProductClick}
                t={t}
              />
            )}

            {!isInitialRender && (
              <>
                <div className={styles.paginationWrapper}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    onNext={nextPage}
                    onPrev={prevPage}
                    loading={productsLoading}
                  />
                </div>

                <div className={styles.paginationInfo}>
                  {paginationText}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Product Editor Modal */}
      {editingProduct && isAuthenticated && (
        <ProductEditor
          product={editingProduct}
          loading={productsLoading}
          error={error}
          onClose={() => setProductToEdit(null)}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProductImage={handleDeleteProductImage}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {/* Product Creator Modal */}
      {showModal && isAuthenticated && (
        <ProductCreator
          loading={productsLoading}
          error={error}
          onClose={() => setShowModal(false)}
          onCreateProduct={handleCreateProduct}
        />
      )}

      <style jsx>{`
        .backgroundUpdate {
          position: fixed;
          top: 70px;
          right: 20px;
          background: #f0f7ff;
          border: 1px solid #7bb3e0;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 0.75rem;
          color: #1e4b7a;
          z-index: 100;
          animation: fadeOut 2s ease-in-out;
          pointer-events: none;
        }
        
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}