// ScannerSalesPage.js - VERSIÓN COMPLETA CON FOCO CORREGIDO
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useProduct } from '../../../hooks/useProducts';
import { useClients } from '../../../hooks/useClients';
import { useSales } from '../../../hooks/useSales';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './ScannerSalesPage.module.css'; 
import TicketPrinter from '../../../components/adminDash/scanner/TicketPrinter';

export default function ScannerSalesPage() {
  const { t } = useLanguage();
  const { company, isAuthenticated, loading: authLoading } = useAuth();
  
  const { 
    scannerProducts, 
    scannerLoading,
    cacheStats,
    updateProductInCache,
    fetchAllProductsForScanner,
    findProductInCache,
    searchProductsInCache
  } = useProduct();
  
  const { clients } = useClients();
  const { createSale } = useSales();
  
  const [hasInitialData, setHasInitialData] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientAutocomplete, setShowClientAutocomplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [scanMode, setScanMode] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const scannerInputRef = useRef(null);
  const clientAutocompleteRef = useRef(null);
  
  const currencySymbol = company?.currency || 'USD';

  const [lowStockAlert, setLowStockAlert] = useState({
    show: false,
    productName: '',
    available: 0,
    requested: 0
  });

  const [cashPayment, setCashPayment] = useState({
    show: false,
    amountReceived: '',
    change: 0,
    method: 'cash'
  });

  const [showManualSearch, setShowManualSearch] = useState(false);
  const [manualSearchTerm, setManualSearchTerm] = useState('');
  const [manualSearchResults, setManualSearchResults] = useState([]);
  const [isSearchingManual, setIsSearchingManual] = useState(false);

  const subtotal = scannedItems.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice), 0
  );
  const taxAmount = subtotal * 0.10;
  const total = subtotal + taxAmount;

  // 🔥 EFECTO PRINCIPAL: Carga instantánea
  useEffect(() => {
    if (isAuthenticated && !hasInitialData) {
      console.log('⚡ Iniciando carga instantánea...');
      
      if (scannerProducts.length > 0) {
        setHasInitialData(true);
      }
      
      const loadInBackground = async () => {
        await fetchAllProductsForScanner();
        setHasInitialData(true);
      };
      
      loadInBackground();
    }
  }, [isAuthenticated, hasInitialData, scannerProducts.length, fetchAllProductsForScanner]);

  useEffect(() => {
    if (scannerProducts.length > 0 && !hasInitialData) {
      setHasInitialData(true);
    }
  }, [scannerProducts, hasInitialData]);

  // 🔥 EFECTO PARA ENFOCAR EL INPUT INICIALMENTE
  useEffect(() => {
    if (scanMode && scannerInputRef.current && !cashPayment.show && !showManualSearch && hasInitialData) {
      scannerInputRef.current.focus();
    }
  }, [scanMode, cashPayment.show, showManualSearch, hasInitialData]);

  // 🔥 NUEVO EFECTO: Mantener foco después de cada escaneo
  useEffect(() => {
    if (scanMode && scannerInputRef.current && !cashPayment.show && !showManualSearch && hasInitialData) {
      setTimeout(() => {
        scannerInputRef.current?.focus();
      }, 10);
    }
  }, [barcodeInput, isSearching, scanMode, cashPayment.show, showManualSearch, hasInitialData]);

  // 🔥 NUEVO EFECTO: Forzar foco cuando se cierra el modal de pago
  useEffect(() => {
    if (!cashPayment.show && scanMode && scannerInputRef.current && !showManualSearch) {
      setTimeout(() => {
        scannerInputRef.current?.focus();
      }, 50);
    }
  }, [cashPayment.show]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showClientAutocomplete && clientAutocompleteRef.current &&
          !clientAutocompleteRef.current.contains(event.target)) {
        setShowClientAutocomplete(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showClientAutocomplete]);

  // 🔥 Búsqueda instantánea por código de barras
  const findProductByBarcode = useCallback(async (barcode) => {
    if (!barcode) return null;
    
    const searchTerm = barcode.toLowerCase().trim();
    
    let product = scannerProducts.find(p => 
      p.artikelNumber?.toString().toLowerCase() === searchTerm
    );
    
    if (!product) {
      product = await findProductInCache(searchTerm);
    }
    
    if (!product) {
      product = scannerProducts.find(p => 
        p.artikelName?.toLowerCase().includes(searchTerm) ||
        p.artikelNumber?.toString().toLowerCase().includes(searchTerm)
      );
    }
    
    return product;
  }, [findProductInCache, scannerProducts]);

  // 🔥 Búsqueda manual con debounce
  const handleManualSearch = useCallback(async () => {
    if (!manualSearchTerm.trim() || manualSearchTerm.length < 2) {
      setManualSearchResults([]);
      return;
    }

    setIsSearchingManual(true);
    
    try {
      const term = manualSearchTerm.toLowerCase();
      const memoryResults = scannerProducts.filter(p => 
        p.artikelName?.toLowerCase().includes(term) ||
        p.artikelNumber?.toString().toLowerCase().includes(term)
      ).slice(0, 20);
      
      setManualSearchResults(memoryResults);
      
      const cachedResults = await searchProductsInCache(manualSearchTerm);
      
      if (cachedResults.length > 0) {
        const combined = [...cachedResults, ...memoryResults];
        const unique = Array.from(new Map(combined.map(p => [p._id, p])).values());
        setManualSearchResults(unique.slice(0, 20));
      }
      
    } catch (error) {
      console.error('Error en búsqueda manual:', error);
    } finally {
      setIsSearchingManual(false);
    }
  }, [manualSearchTerm, scannerProducts, searchProductsInCache]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showManualSearch && manualSearchTerm.length >= 2) {
        handleManualSearch();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [manualSearchTerm, showManualSearch, handleManualSearch]);

  const checkStockBeforeAdd = (product, quantityToAdd = 1) => {
    const existingItem = scannedItems.find(item => item.productId === product._id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalQuantityNeeded = currentQuantity + quantityToAdd;
    
    if (product.stock < totalQuantityNeeded) {
      setLowStockAlert({
        show: true,
        productName: product.artikelName,
        available: product.stock,
        requested: totalQuantityNeeded
      });
      
      setTimeout(() => {
        setLowStockAlert(prev => ({ ...prev, show: false }));
      }, 5000);
      
      return false;
    }
    
    return true;
  };

  const addProductToSale = (product, quantity = 1) => {
    if (!checkStockBeforeAdd(product, quantity)) return false;
    
    const existingIndex = scannedItems.findIndex(item => 
      item.productId === product._id
    );
    
    if (existingIndex >= 0) {
      setScannedItems(prev => prev.map((item, idx) => 
        idx === existingIndex 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      ));
    } else {
      setScannedItems(prev => [...prev, {
        productId: product._id,
        artikelName: product.artikelName,
        quantity,
        unitPrice: product.price || 0,
        stock: product.stock || 0
      }]);
    }
    
    setLastScanned({
      product,
      timestamp: new Date(),
      success: true,
      message: t('scanner.scanner.feedback.added')
        .replace('{quantity}', quantity)
        .replace('{name}', product.artikelName)
    });
    
    return true;
  };

  // 🔥 NUEVA FUNCIÓN: Recuperar foco si se pierde accidentalmente
  const handleInputBlur = () => {
    if (scanMode && !cashPayment.show && !showManualSearch && hasInitialData) {
      setTimeout(() => {
        scannerInputRef.current?.focus();
      }, 10);
    }
  };

  // 🔥 Manejar escaneo con respuesta inmediata (MODIFICADO)
  const handleBarcodeScan = async (e) => {
    e.preventDefault();
    
    if (!barcodeInput.trim()) {
      scannerInputRef.current?.focus();
      return;
    }
    
    if (scannerLoading && scannerProducts.length === 0) {
      setLastScanned({
        product: null,
        timestamp: new Date(),
        success: false,
        message: t('scanner.loading.products')
      });
      scannerInputRef.current?.focus();
      return;
    }

    setIsSearching(true);
    
    try {
      const product = await findProductByBarcode(barcodeInput.trim());
      
      if (product) {
        addProductToSale(product, 1);
        setBarcodeInput('');
      } else {
        setLastScanned({
          product: null,
          timestamp: new Date(),
          success: false,
          message: t('scanner.scanner.feedback.notFound')
            .replace('{barcode}', barcodeInput)
        });
        
        setTimeout(() => {
          setLastScanned(null);
          scannerInputRef.current?.focus();
        }, 3000);
      }
    } catch (error) {
      console.error('Error en escaneo:', error);
      setLastScanned({
        product: null,
        timestamp: new Date(),
        success: false,
        message: t('scanner.scanner.feedback.searchError')
      });
      scannerInputRef.current?.focus();
    } finally {
      setIsSearching(false);
    }
  };

  const filteredClients = () => {
    const query = clientSearch?.toLowerCase() || '';
    if (!query) return [];
    return clients.filter(c =>
      c.name?.toLowerCase().includes(query) ||
      c.vorname?.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query))
    ).slice(0, 8);
  };

  const clearClientSelection = () => {
    setClientId('');
    setClientSearch('');
    setShowClientAutocomplete(false);
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      setScannedItems(prev => prev.filter((_, i) => i !== index));
      return;
    }
    
    const item = scannedItems[index];
    const product = scannerProducts.find(p => p._id === item.productId);
    
    if (product && newQuantity > product.stock) {
      setLowStockAlert({
        show: true,
        productName: product.artikelName,
        available: product.stock,
        requested: newQuantity
      });
      return;
    }
    
    setScannedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    ));
  };

  const updatePrice = (index, newPrice) => {
    setScannedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, unitPrice: newPrice } : item
    ));
  };

  const removeItem = (index) => {
    setScannedItems(prev => prev.filter((_, i) => i !== index));
  };

  const validateStockBeforeFinish = () => {
    for (const item of scannedItems) {
      const product = scannerProducts.find(p => p._id === item.productId);
      if (!product) continue;
      
      if (product.stock < item.quantity) {
        setLowStockAlert({
          show: true,
          productName: product.artikelName,
          available: product.stock,
          requested: item.quantity
        });
        return false;
      }
    }
    return true;
  };

  const handleNumberClick = (number) => {
    setCashPayment(prev => {
      const currentAmount = prev.amountReceived || '';
      const newAmount = currentAmount + number;
      const received = parseFloat(newAmount) || 0;
      const change = Math.max(0, received - total);
      
      return {
        ...prev,
        amountReceived: newAmount,
        change: parseFloat(change.toFixed(2))
      };
    });
  };

  const handleDecimalClick = () => {
    const currentAmount = cashPayment.amountReceived || '';
    if (!currentAmount.includes('.')) {
      const newAmount = currentAmount === '' ? '0.' : currentAmount + '.';
      setCashPayment(prev => ({
        ...prev,
        amountReceived: newAmount
      }));
    }
  };

  const handleClearClick = () => {
    setCashPayment({
      show: true,
      amountReceived: '',
      change: 0,
      method: cashPayment.method
    });
  };

  const handleBackspaceClick = () => {
    setCashPayment(prev => {
      const newAmount = prev.amountReceived.slice(0, -1);
      const received = parseFloat(newAmount) || 0;
      const change = Math.max(0, received - total);
      
      return {
        ...prev,
        amountReceived: newAmount,
        change: parseFloat(change.toFixed(2))
      };
    });
  };

  useEffect(() => {
    if (cashPayment.show && cashPayment.amountReceived) {
      const received = parseFloat(cashPayment.amountReceived) || 0;
      const change = Math.max(0, received - total);
      setCashPayment(prev => ({
        ...prev,
        change: parseFloat(change.toFixed(2))
      }));
    }
  }, [cashPayment.amountReceived, total]);

  const handleQuickCashClick = (amount) => {
    const currentAmount = cashPayment.amountReceived || '';
    const newAmount = parseFloat(currentAmount) || 0;
    const totalAmount = newAmount + amount;
    
    setCashPayment(prev => {
      const change = Math.max(0, totalAmount - total);
      return {
        ...prev,
        amountReceived: totalAmount.toString(),
        change: parseFloat(change.toFixed(2))
      };
    });
  };

  const handleFinishSaleWithPayment = async () => {
    if (isSubmitting || scannedItems.length === 0) return;
    
    if (!validateStockBeforeFinish()) return;

    if (cashPayment.method === 'cash') {
      const received = parseFloat(cashPayment.amountReceived) || 0;
      if (received < total) {
        alert(t('scanner.alerts.insufficientAmount')
          .replace('{total}', total.toFixed(2))
          .replace('{symbol}', currencySymbol));
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        clientId: clientId || null,
        items: scannedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        tax: 10,
        status: 'paid',
        paymentMethod: cashPayment.method,
        amountReceived: cashPayment.method === 'cash' ? parseFloat(cashPayment.amountReceived) : total,
        change: cashPayment.method === 'cash' ? cashPayment.change : 0
      };
      
      const result = await createSale(payload);
      
      if (result.success && result.sale) {
        setCurrentReceipt(result.sale);
        setShowReceipt(true);
        
        updateProductInCache(true).catch(err => 
            console.warn('Error actualizando caché:', err)
          );

        setCashPayment({
          show: false,
          amountReceived: '',
          change: 0,
          method: 'cash'
        });
        
        setTimeout(() => {
          setScannedItems([]);
          setClientId('');
          setClientSearch('');
          setShowReceipt(false);
          setCurrentReceipt(null);
          setIsSubmitting(false);
        }, 5000);
      } else {
        if (result.type === 'BUSINESS_ERROR' || result.message.includes('Stock')) {
          const productMatch = result.message.match(/für (.+?) verfügbar/);
          const stockMatch = result.message.match(/(\d+) verfügbar/);
          const neededMatch = result.message.match(/(\d+) benötigt/);
          
          if (productMatch && stockMatch && neededMatch) {
            setLowStockAlert({
              show: true,
              productName: productMatch[1],
              available: parseInt(stockMatch[1]),
              requested: parseInt(neededMatch[1])
            });
          } else {
            alert(result.message || t('scanner.alerts.stockError'));
          }
        } else {
          alert(result.message || t('scanner.alerts.saleError'));
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error finishing sale:', error);
      alert(t('scanner.alerts.saleError') + ': ' + error.message);
      setIsSubmitting(false);
    }
  };

  const handleFinishSale = () => {
    if (scannedItems.length === 0) {
      alert(t('scanner.alerts.noItems'));
      return;
    }

    if (!validateStockBeforeFinish()) return;

    setCashPayment({
      show: true,
      amountReceived: '',
      change: 0,
      method: 'cash'
    });
  };

  const handleCancelSale = () => {
    if (scannedItems.length === 0) {
      setScannedItems([]);
      return;
    }
    
    if (confirm(t('scanner.alerts.confirmCancel'))) {
      setScannedItems([]);
      setClientId('');
      setClientSearch('');
      setCashPayment({
        show: false,
        amountReceived: '',
        change: 0,
        method: 'cash'
      });
      setShowManualSearch(false);
      setManualSearchTerm('');
    }
  };

  const handleManualAdd = () => {
    setShowManualSearch(true);
    setManualSearchTerm('');
    setManualSearchResults([]);
  };

  const handleSelectManualProduct = (product) => {
    addProductToSale(product, 1);
    setShowManualSearch(false);
    setManualSearchTerm('');
    setManualSearchResults([]);
  };

  const closePaymentModal = () => {
    setCashPayment(prev => ({
      ...prev,
      show: false,
      amountReceived: '',
      change: 0
    }));
  };

  const handleCashInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFinishSaleWithPayment();
    }
  };

  const handleRefreshCache = async () => {
    await updateProductInCache(true);
  };

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>{t('scanner.loading.app')}</p>
      </div>
    );
  }

  if (scannerProducts.length === 0 && scannerLoading && !hasInitialData) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>{t('scanner.loading.cache')}</p>
        <p className={styles.loadingHint}>{t('scanner.loading.cacheHint')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {lowStockAlert.show && (
        <div className={styles.lowStockAlert}>
          <div className={styles.alertContent}>
            <div className={styles.alertIcon}>⚠️</div>
            <div className={styles.alertText}>
              <h3>{t('scanner.alerts.lowStock.title')}</h3>
              <p dangerouslySetInnerHTML={{
                __html: t('scanner.alerts.lowStock.text')
                  .replace('{name}', lowStockAlert.productName)
                  .replace('{available}', lowStockAlert.available)
              }} />
              <p className={styles.alertDetail}>
                {t('scanner.alerts.lowStock.detail')
                  .replace('{requested}', lowStockAlert.requested)}
              </p>
            </div>
            <button 
              className={styles.closeAlert}
              onClick={() => setLowStockAlert(prev => ({ ...prev, show: false }))}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1>{t('scanner.header.title')}</h1>
          <p>{t('scanner.header.subtitle')}</p>
          <div className={styles.productInfo}>
            <span className={styles.productCount}>
              {t('scanner.header.productsAvailable').replace('{count}', scannerProducts.length)}
              {scannerLoading && (
                <span className={styles.loadingBadge}>
                  <span className={styles.smallSpinner}></span>
                  {t('scanner.header.updating')}
                </span>
              )}
              {cacheStats.count > 0 && !scannerLoading && (
                <span className={styles.cacheInfo}>
                  {t('scanner.header.indexedDB').replace('{count}', cacheStats.count)}
                </span>
              )}
            </span>
            <button 
              onClick={handleRefreshCache}
              className={styles.refreshCacheButton}
              disabled={scannerLoading}
              title={t('scanner.cache.refresh')}
            >
              {scannerLoading ? '🔄' : '↻'}
            </button>
          </div>
        </div>
        
        <div className={styles.headerControls}>
          <button 
            className={`${styles.modeToggle} ${scanMode ? styles.active : ''}`}
            onClick={() => setScanMode(!scanMode)}
          >
            {scanMode ? t('scanner.header.scanMode') : t('scanner.header.editMode')}
          </button>
          
          <div className={styles.headerTotals}>
            <span className={styles.headerTotalLabel}>{t('scanner.header.total')}</span>
            <span className={styles.headerTotalAmount}>{total.toFixed(2)} {currencySymbol}</span>
          </div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.leftPanel}>
          <div className={styles.scannerSection}>
            <div className={styles.sectionHeader}>
              <h2>{t('scanner.scanner.title')}</h2>
              <span className={styles.scanCount}>
                {t('scanner.scanner.itemsCount').replace('{count}', scannedItems.length)}
              </span>
            </div>
            
            <form onSubmit={handleBarcodeScan} className={styles.scannerForm}>
              <div className={styles.scannerInputGroup}>
                <input
                  ref={scannerInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onBlur={handleInputBlur}
                  placeholder={t('scanner.scanner.placeholder')}
                  className={styles.scannerInput}
                  disabled={!scanMode || cashPayment.show || showManualSearch || isSearching}
                  autoFocus={hasInitialData}
                />
                <button 
                  type="submit" 
                  className={styles.scanButton}
                  disabled={!barcodeInput.trim() || !scanMode || cashPayment.show || isSearching}
                >
                  {isSearching ? (
                    <div className={styles.buttonSpinner}></div>
                  ) : (
                    t('scanner.scanner.button')
                  )}
                </button>
              </div>
            </form>
            
            {lastScanned && (
              <div className={`${styles.scanFeedback} ${
                lastScanned.success ? styles.success : styles.error
              }`}>
                <span className={styles.feedbackIcon}>
                  {lastScanned.success ? '✓' : '✗'}
                </span>
                <span className={styles.feedbackText}>{lastScanned.message}</span>
              </div>
            )}
            
            <button 
              className={styles.manualAddButton}
              onClick={handleManualAdd}
              disabled={isSubmitting || cashPayment.show || showManualSearch}
            >
              <span className={styles.manualAddIcon}>+</span>
              {t('scanner.scanner.manualAdd')}
            </button>
          </div>

          {showManualSearch && (
            <div className={styles.manualSearchSection}>
              <div className={styles.manualSearchHeader}>
                <h3>{t('scanner.manualSearch.title')}</h3>
                <button 
                  className={styles.closeManualSearch}
                  onClick={() => {
                    setShowManualSearch(false);
                    setManualSearchTerm('');
                    setManualSearchResults([]);
                  }}
                >
                  ✕
                </button>
              </div>
              
              <input
                type="text"
                value={manualSearchTerm}
                onChange={(e) => setManualSearchTerm(e.target.value)}
                placeholder={t('scanner.manualSearch.placeholder')}
                className={styles.manualSearchInput}
                autoFocus
              />
              
              {isSearchingManual && (
                <div className={styles.manualSearchLoading}>
                  <div className={styles.spinnerSmall}></div>
                  <span>{t('scanner.manualSearch.searching')}</span>
                </div>
              )}
              
              {manualSearchResults.length > 0 ? (
                <div className={styles.manualSearchResults}>
                  {manualSearchResults.map(product => (
                    <div 
                      key={product._id}
                      className={styles.manualSearchResultItem}
                      onClick={() => handleSelectManualProduct(product)}
                    >
                      <div className={styles.resultItemMain}>
                        <span className={styles.resultItemName}>{product.artikelName}</span>
                        <span className={styles.resultItemNumber}>
                          {t('scanner.manualSearch.articleNumber').replace('{number}', product.artikelNumber || '-')}
                        </span>
                      </div>
                      <div className={styles.resultItemDetails}>
                        <span className={styles.resultItemPrice}>
                          {product.price?.toFixed(2)} {currencySymbol}
                        </span>
                        <span className={`${styles.resultItemStock} ${
                          product.stock > 0 ? styles.inStock : styles.outOfStock
                        }`}>
                          {product.stock > 0 
                            ? t('scanner.manualSearch.available').replace('{stock}', product.stock)
                            : t('scanner.manualSearch.outOfStock')
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : manualSearchTerm.length >= 2 && !isSearchingManual && (
                <div className={styles.noResults}>
                  {t('scanner.manualSearch.noResults')}
                </div>
              )}
              
              {manualSearchTerm.length < 2 && manualSearchTerm.length > 0 && (
                <div className={styles.minCharsHint}>
                  {t('scanner.manualSearch.minChars')}
                </div>
              )}
            </div>
          )}

          <div className={styles.clientSection}>
            <h2>{t('scanner.client.title')}</h2>
            
            <div ref={clientAutocompleteRef} className={styles.clientAutocomplete}>
              <div className={styles.clientInputWrapper}>
                <input
                  type="text"
                  placeholder={t('scanner.client.placeholder')}
                  value={clientSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setClientSearch(value);
                    if (value === '') {
                      setClientId('');
                    } else {
                      setShowClientAutocomplete(true);
                    }
                  }}
                  onFocus={() => setShowClientAutocomplete(true)}
                  className={styles.clientInput}
                  disabled={isSubmitting || cashPayment.show}
                />
                {clientId && (
                  <button 
                    className={styles.clearClientButton}
                    onClick={clearClientSelection}
                    title={t('scanner.client.clear')}
                    disabled={isSubmitting || cashPayment.show}
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {showClientAutocomplete && (
                <div className={styles.autocompleteDropdown}>
                  <div 
                    className={`${styles.autocompleteItem} ${!clientId ? styles.selected : ''}`}
                    onClick={() => {
                      setClientId('');
                      setClientSearch('');
                      setShowClientAutocomplete(false);
                    }}
                  >
                    <div className={styles.autocompleteItemContent}>
                      <span className={styles.clientName}>
                        <span className={styles.randomClientIconSmall}>🎯</span>
                        {t('scanner.client.randomClient')}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.autocompleteSeparator}></div>
                  
                  {filteredClients().map(c => (
                    <div 
                      key={c._id} 
                      className={`${styles.autocompleteItem} ${clientId === c._id ? styles.selected : ''}`}
                      onClick={() => {
                        setClientId(c._id);
                        setClientSearch(`${c.vorname} ${c.name}`);
                        setShowClientAutocomplete(false);
                      }}
                    >
                      <div className={styles.autocompleteItemContent}>
                        <span className={styles.clientName}>
                          {c.vorname} {c.name}
                          {c.isRandomClient && (
                            <span className={styles.randomClientBadge}>🎯</span>
                          )}
                        </span>
                        {c.email && <span className={styles.email}>{c.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.totalsCard}>
            <div className={styles.totalsGrid}>
              <div className={styles.totalRow}>
                <span>{t('scanner.totals.subtotal')}</span>
                <span>{subtotal.toFixed(2)} {currencySymbol}</span>
              </div>
              <div className={styles.totalRow}>
                <span>{t('scanner.totals.tax')}</span>
                <span>{taxAmount.toFixed(2)} {currencySymbol}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>{t('scanner.totals.total')}</span>
                <span>{total.toFixed(2)} {currencySymbol}</span>
              </div>
            </div>
            
            <div className={styles.actionButtons}>
              <button 
                className={styles.cancelButton}
                onClick={handleCancelSale}
                disabled={scannedItems.length === 0 || isSubmitting || cashPayment.show}
              >
                {t('scanner.totals.cancel')}
              </button>
              <button 
                className={styles.finishButton}
                onClick={handleFinishSale}
                disabled={scannedItems.length === 0 || isSubmitting || cashPayment.show}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    {t('scanner.totals.processing')}
                  </>
                ) : (
                  t('scanner.totals.checkout')
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.itemsHeader}>
            <div className={styles.itemsHeaderInfo}>
              <h2>{t('scanner.items.title')}</h2>
              <span className={styles.itemsCount}>
                {t('scanner.items.count').replace('{count}', scannedItems.length)}
              </span>
            </div>
            <div className={styles.itemsTotal}>
              {total.toFixed(2)} {currencySymbol}
            </div>
          </div>
          
          {scannedItems.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <div className={styles.emptyText}>
                <h3>{t('scanner.items.empty.title')}</h3>
                <p>{t('scanner.items.empty.text')}</p>
              </div>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {scannedItems.map((item, index) => {
                const product = scannerProducts.find(p => p._id === item.productId);
                const isLowStock = product && item.quantity > product.stock;
                
                return (
                  <div 
                    key={index} 
                    className={`${styles.itemCard} ${isLowStock ? styles.itemLowStock : ''}`}
                  >
                    <div className={styles.itemMain}>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemHeader}>
                          <h4>{item.artikelName}</h4>
                          <button 
                            className={styles.removeItemButton}
                            onClick={() => removeItem(index)}
                            disabled={isSubmitting || cashPayment.show}
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className={styles.itemMeta}>
                          <span className={styles.itemNumber}>
                            {t('scanner.items.articleNumber').replace('{number}', product?.artikelNumber || '-')}
                          </span>
                          <span className={`${styles.itemStock} ${
                            isLowStock ? styles.stockWarning : styles.stockGood
                          }`}>
                            {t('scanner.items.available').replace('{stock}', product?.stock || 0)}
                            {isLowStock && (
                              <span className={styles.stockWarningIcon}>⚠️</span>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.itemControls}>
                        <div className={styles.quantityControl}>
                          <div className={styles.controlLabel}>{t('scanner.items.quantity')}</div>
                          <div className={styles.quantityInputGroup}>
                            <button 
                              className={styles.quantityButton}
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isSubmitting || cashPayment.show}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                              className={`${styles.quantityInput} ${isLowStock ? styles.inputWarning : ''}`}
                              disabled={isSubmitting || cashPayment.show}
                            />
                            <button 
                              className={styles.quantityButton}
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              disabled={isSubmitting || cashPayment.show}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        
                        <div className={styles.priceControl}>
                          <div className={styles.controlLabel}>
                            {t('scanner.items.unitPrice').replace('{symbol}', currencySymbol)}
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                            className={styles.priceInput}
                            disabled={isSubmitting || cashPayment.show}
                          />
                        </div>
                        
                        <div className={styles.lineTotal}>
                          <div className={styles.controlLabel}>{t('scanner.items.total')}</div>
                          <div className={styles.lineTotalAmount}>
                            {(item.quantity * item.unitPrice).toFixed(2)} {currencySymbol}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isLowStock && (
                      <div className={styles.stockWarningBanner}>
                        <span className={styles.warningIcon}>⚠️</span>
                        {t('scanner.items.lowStock').replace('{stock}', product.stock)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {cashPayment.show && (
        <div className={styles.paymentModal}>
          <div className={styles.paymentContent}>
            <div className={styles.paymentHeader}>
              <h2>{t('scanner.payment.title')}</h2>
              <button 
                className={styles.closePayment}
                onClick={closePaymentModal}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.paymentBody}>
              <div className={styles.paymentTotalSection}>
                <div className={styles.paymentTotalLabel}>{t('scanner.payment.due')}</div>
                <div className={styles.paymentTotalAmount}>{total.toFixed(2)} {currencySymbol}</div>
              </div>
              
              <div className={styles.paymentMethodSection}>
                <div className={styles.paymentMethodButtons}>
                  <button
                    className={`${styles.paymentMethodButton} ${cashPayment.method === 'cash' ? styles.active : ''}`}
                    onClick={() => setCashPayment(prev => ({ ...prev, method: 'cash' }))}
                  >
                    {t('scanner.payment.cash')}
                  </button>
                  <button
                    className={`${styles.paymentMethodButton} ${cashPayment.method === 'card' ? styles.active : ''}`}
                    onClick={() => setCashPayment(prev => ({ ...prev, method: 'card' }))}
                  >
                    {t('scanner.payment.card')}
                  </button>
                </div>
              </div>
              
              {cashPayment.method === 'cash' && (
                <>
                  <div className={styles.cashInputSection}>
                    <div className={styles.cashInputLabel}>{t('scanner.payment.received')}</div>
                    <div className={styles.cashInputDisplay}>
                      <input
                        ref={input => input && input.focus()}
                        type="text"
                        value={cashPayment.amountReceived}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = value.split('.');
                          let finalValue = value;
                          if (parts.length > 1) {
                            finalValue = parts[0] + '.' + parts[1].slice(0, 2);
                          }
                          
                          setCashPayment(prev => {
                            const received = parseFloat(finalValue) || 0;
                            const change = Math.max(0, received - total);
                            return {
                              ...prev,
                              amountReceived: finalValue,
                              change: parseFloat(change.toFixed(2))
                            };
                          });
                        }}
                        onKeyPress={handleCashInputKeyPress}
                        className={styles.cashInput}
                        placeholder="0.00"
                        autoFocus
                      />
                      <span className={styles.currencySymbol}>{currencySymbol}</span>
                    </div>
                  </div>
                  
                  <div className={styles.changeSection}>
                    <div className={styles.changeLabel}>{t('scanner.payment.change')}</div>
                    <div className={`${styles.changeAmount} ${cashPayment.change > 0 ? styles.positiveChange : ''}`}>
                      {cashPayment.change > 0 ? cashPayment.change.toFixed(2) : '0.00'} {currencySymbol}
                    </div>
                  </div>
                  
                  <div className={styles.numpad}>
                    <div className={styles.numpadRow}>
                      <button className={styles.numpadKey} onClick={() => handleNumberClick('7')}>7</button>
                      <button className={styles.numpadKey} onClick={() => handleNumberClick('8')}>8</button>
                      <button className={styles.numpadKey} onClick={() => handleNumberClick('9')}>9</button>
                      <button className={`${styles.numpadKey} ${styles.numpadClear}`} onClick={handleClearClick}>
                        C
                      </button>
                    </div>
                    <div className={styles.numpadRow}>
                      <button className={styles.numpadKey} onClick={() => handleNumberClick('4')}>4</button>
                      <button className={styles.numpadKey} onClick={() => handleNumberClick('5')}>5</button>
                      <button className={styles.numpadKey} onClick={() => handleNumberClick('6')}>6</button>
                      <button className={`${styles.numpadKey} ${styles.numpadSpecial}`} onClick={handleBackspaceClick}>
                        ⌫
                      </button>
                    </div>
                    <div className={styles.numpadRow}>
                      <button className={styles.numpadKey} onClick={() => handleNumberClick('1')}>1</button>
                      <button className={styles.numpadKey} onClick={() => handleNumberClick('2')}>2</button>
                      <button className={styles.numpadKey} onClick={() => handleNumberClick('3')}>3</button>
                      <button className={`${styles.numpadKey} ${styles.numpadSpecial}`} onClick={handleDecimalClick}>
                        .
                      </button>
                    </div>
                    <div className={styles.numpadRow}>
                      <button className={styles.numpadKey} onClick={() => handleNumberClick('0')}>0</button>
                      <button className={`${styles.numpadKey} ${styles.numpadSpecial}`} onClick={() => handleNumberClick('00')}>
                        00
                      </button>
                      <button 
                        className={`${styles.numpadKey} ${styles.numpadEnter}`}
                        onClick={handleFinishSaleWithPayment}
                        disabled={isSubmitting || (parseFloat(cashPayment.amountReceived) || 0) < total}
                      >
                        {isSubmitting ? (
                          <div className={styles.loadingSpinner}></div>
                        ) : (
                          'ENTER'
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.quickCashButtons}>
                    <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(5)}>
                      {t('scanner.payment.quickCash.5').replace('{symbol}', currencySymbol)}
                    </button>
                    <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(10)}>
                      {t('scanner.payment.quickCash.10').replace('{symbol}', currencySymbol)}
                    </button>
                    <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(20)}>
                      {t('scanner.payment.quickCash.20').replace('{symbol}', currencySymbol)}
                    </button>
                    <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(50)}>
                      {t('scanner.payment.quickCash.50').replace('{symbol}', currencySymbol)}
                    </button>
                    <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(100)}>
                      {t('scanner.payment.quickCash.100').replace('{symbol}', currencySymbol)}
                    </button>
                    <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(200)}>
                      {t('scanner.payment.quickCash.200').replace('{symbol}', currencySymbol)}
                    </button>
                  </div>
                </>
              )}
              
              {cashPayment.method === 'card' && (
                <div className={styles.cardPaymentSection}>
                  <div className={styles.cardPaymentInfo}>
                    <div className={styles.cardIcon}>💳</div>
                    <p>{t('scanner.payment.cardPayment.processing')}</p>
                    <p className={styles.cardTotal}>
                      {t('scanner.payment.cardPayment.amount')
                        .replace('{amount}', total.toFixed(2))
                        .replace('{symbol}', currencySymbol)}
                    </p>
                  </div>
                  <button 
                    className={styles.cardPaymentButton}
                    onClick={handleFinishSaleWithPayment}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className={styles.loadingSpinner}></div>
                        {t('scanner.payment.processing')}
                      </>
                    ) : (
                      t('scanner.payment.cardPayment.confirm')
                    )}
                  </button>
                  <button 
                    className={styles.backToCashButton}
                    onClick={() => setCashPayment(prev => ({ ...prev, method: 'cash' }))}
                  >
                    {t('scanner.payment.cardPayment.backToCash')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showReceipt && currentReceipt && (
        <div className={styles.receiptModal}>
          <div className={styles.receiptContent}>
            <div className={styles.receiptHeader}>
              <h2>{t('scanner.receipt.success')}</h2>
              <button 
                className={styles.closeReceipt}
                onClick={() => setShowReceipt(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.receiptBody}>
              <div className={styles.receiptSuccessIcon}>🎉</div>
              
              <TicketPrinter 
                sale={currentReceipt}
                company={company}
                onPrintComplete={() => console.log('Druck abgeschlossen')}
              />
              
              <div className={styles.receiptActions}>
                <button 
                  className={styles.newSaleButton}
                  onClick={() => {
                    setShowReceipt(false);
                    setScannedItems([]);
                    setClientId('');
                    setClientSearch('');
                  }}
                >
                  {t('scanner.receipt.newSale')}
                </button>
              </div>
              
              <p className={styles.autoResetNote}>
                {t('scanner.receipt.autoReset')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}