// pages/dashboard/wareneingang/index.tsx - VERSIÓN COMPLETA Y CORREGIDA CON TRADUCCIONES
import { useState } from 'react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useStockEntry } from '../../../hooks/useStockEntry';
import { useLanguage } from '../../../contexts/LanguageContext';

import styles from './Wareneingang.module.css';

export default function Wareneingang() {
  const { t } = useLanguage();
  const { isAuthenticated, loading: authLoading, company } = useAuth();
  const {
    products,
    loading,
    searchLoading,
    error,
    success,
    searchProducts,
    registerWarehouseEntry,
    clearMessages,
    clearSearch,
  } = useStockEntry();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const currencySymbol = company?.currency || 'USD';

  // Manejar búsqueda
  const handleSearch = (e:any) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchProducts(searchTerm);
    }
  };

  // Seleccionar producto
  const handleSelectProduct = (product:any) => {
    setSelectedProduct(product);
    setQuantity('');
    setNotes('');
    setSupplierName('');
    setReferenceNumber('');
    setExpirationDate('');
    setBatchNumber('');
    clearMessages();
  };

  // Procesar ingreso de stock
  const handleSubmit = async (e:any) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    const result = await registerWarehouseEntry({
      productId: selectedProduct._id,
      quantity: parseInt(quantity),
      notes,
      supplier: supplierName ? { name: supplierName } : null,
      referenceNumber: referenceNumber,
      expirationDate: expirationDate || null,
      batchNumber: batchNumber || null
    });

    if (result.success) {
      setShowSuccess(true);
      // Opcional: resetear formulario después de éxito
      setQuantity('');
      setNotes('');
      setSupplierName('');
      setReferenceNumber('');
      setExpirationDate('');
      setBatchNumber('');
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  // Formatear moneda
  const formatPrice = (price:any) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currencySymbol
    }).format(price || 0);
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>{t('wareneingang.loading')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('wareneingang.title')}</h1>
        <p className={styles.subtitle}>
          {t('wareneingang.subtitle')}
        </p>
      </header>

      <div className={styles.content}>
        {/* Panel izquierdo - Búsqueda y lista de productos */}
        <div className={styles.leftPanel}>
          <div className={styles.searchSection}>
            <h2 className={styles.sectionTitle}>{t('wareneingang.search.title')}</h2>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder={t('wareneingang.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                disabled={searchLoading}
              />
              <button 
                type="submit" 
                className={styles.searchButton}
                disabled={searchLoading || !searchTerm.trim()}
              >
                {searchLoading ? t('wareneingang.search.searching') : t('wareneingang.search.button')}
              </button>
            </form>

            {error && (
              <div className={styles.errorMessage}>
                {t('wareneingang.form.error').replace('{message}', error)}
              </div>
            )}

            {/* Resultados de búsqueda */}
            <div className={styles.resultsList}>
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product._id}
                    className={`${styles.productCard} ${
                      selectedProduct?._id === product._id ? styles.selected : ''
                    }`}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{product.artikelName}</h3>
                      {product.artikelNumber && (
                        <span className={styles.productNumber}>
                          {t('wareneingang.product.number').replace('{number}', product.artikelNumber)}
                        </span>
                      )}
                      <div className={styles.productMeta}>
                        <span className={`${styles.stockBadge} ${
                          product.stock > 0 ? styles.inStock : styles.outOfStock
                        }`}>
                          {t('wareneingang.stock.badge').replace('{stock}', product.stock || 0)}
                        </span>
                        {product.price > 0 && (
                          <span className={styles.productPrice}>
                            {t('wareneingang.product.price').replace('{price}', formatPrice(product.price))}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.selectIndicator}>
                      {selectedProduct?._id === product._id && t('wareneingang.product.selectIndicator')}
                    </div>
                  </div>
                ))
              ) : searchTerm && !searchLoading && (
                <div className={styles.emptyResults}>
                  <p>{t('wareneingang.search.noResults')}</p>
                  <button 
                    onClick={clearSearch}
                    className={styles.clearSearchBtn}
                  >
                    {t('wareneingang.search.clearSearch')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario de ingreso */}
        <div className={styles.rightPanel}>
          {selectedProduct ? (
            <div className={styles.entryForm}>
              <h2 className={styles.sectionTitle}>
                {t('wareneingang.form.title')}
              </h2>
              
              <div className={styles.selectedProductInfo}>
                <h3>{t('wareneingang.form.selectedProduct.title').replace('{name}', selectedProduct.artikelName)}</h3>
                {selectedProduct.artikelNumber && (
                  <p>{t('wareneingang.form.selectedProduct.number').replace('{number}', selectedProduct.artikelNumber)}</p>
                )}
                <p className={styles.currentStock}>
                  {t('wareneingang.form.selectedProduct.currentStock')
                    .replace('{stock}', selectedProduct.stock || 0)
                    .replace('<strong>', '<strong>')
                    .replace('</strong>', '</strong>')}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Cantidad */}
                <div className={styles.formGroup}>
                  <label htmlFor="quantity" className={styles.label}>
                    {t('wareneingang.form.fields.quantity.label')}
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={styles.input}
                    required
                    placeholder={t('wareneingang.form.fields.quantity.placeholder')}
                    autoFocus
                  />
                </div>

                {/* Proveedor */}
                <div className={styles.formGroup}>
                  <label htmlFor="supplier" className={styles.label}>
                    {t('wareneingang.form.fields.supplier.label')}
                  </label>
                  <input
                    type="text"
                    id="supplier"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className={styles.input}
                    placeholder={t('wareneingang.form.fields.supplier.placeholder')}
                  />
                </div>

                {/* Referencia/Número de factura */}
                <div className={styles.formGroup}>
                  <label htmlFor="reference" className={styles.label}>
                    {t('wareneingang.form.fields.reference.label')}
                  </label>
                  <input
                    type="text"
                    id="reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className={styles.input}
                    placeholder={t('wareneingang.form.fields.reference.placeholder')}
                  />
                </div>

                {/* Para productos perecederos */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="expiration" className={styles.label}>
                      {t('wareneingang.form.fields.expiration.label')}
                    </label>
                    <input
                      type="date"
                      id="expiration"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="batch" className={styles.label}>
                      {t('wareneingang.form.fields.batch.label')}
                    </label>
                    <input
                      type="text"
                      id="batch"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      className={styles.input}
                      placeholder={t('wareneingang.form.fields.batch.placeholder')}
                    />
                  </div>
                </div>

                {/* Notas */}
                <div className={styles.formGroup}>
                  <label htmlFor="notes" className={styles.label}>
                    {t('wareneingang.form.fields.notes.label')}
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={styles.textarea}
                    placeholder={t('wareneingang.form.fields.notes.placeholder')}
                  />
                </div>

              {quantity && (
                <div className={styles.preview}>
                  <p>{t('wareneingang.form.preview.text')}</p>
                  <p className={styles.newStock}>
                    {t('wareneingang.form.preview.newStock')
                      .replace('{current}', selectedProduct.stock || 0)
                      .replace('{add}', parseInt(quantity) || 0)
                      .replace('{total}', (selectedProduct.stock || 0) + (parseInt(quantity) || 0))
                      .replace('<strong>', '<strong>')
                      .replace('</strong>', '</strong>')}
                  </p>
                </div>
              )}

                {success && (
                  <div className={styles.successMessage}>
                    {t('wareneingang.form.success').replace('{message}', success)}
                  </div>
                )}

                {error && (
                  <div className={styles.errorMessage}>
                    {t('wareneingang.form.error').replace('{message}', error)}
                  </div>
                )}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className={styles.cancelButton}
                  >
                    {t('wareneingang.form.actions.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !quantity || parseInt(quantity) <= 0}
                    className={styles.submitButton}
                  >
                    {loading ? t('wareneingang.form.actions.submitting') : t('wareneingang.form.actions.submit')}
                  </button>
                </div>
              </form>

              {showSuccess && (
                <div className={styles.successOverlay}>
                  <div className={styles.successAnimation}>
                    ✓
                  </div>
                  <p>{t('wareneingang.form.successMessage')}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>{t('wareneingang.emptyState.icon')}</div>
              <h3>{t('wareneingang.emptyState.title')}</h3>
              <p>{t('wareneingang.emptyState.text')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}