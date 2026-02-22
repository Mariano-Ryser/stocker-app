import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { useProduct } from '../../../hooks/useProducts';
import { useClients } from '../../../hooks/useClients';
import { useSales } from '../../../hooks/useSales';
import styles from './ScannerSalesPage.module.css'; 

export default function ScannerSalesPage() {
  const {company, isAuthenticated, loading: authLoading } = useAuth();
  const { products } = useProduct();
  const { clients } = useClients();
  const { createSale } = useSales();
  
  // Estado para la venta actual
  const [scannedItems, setScannedItems] = useState([]);
  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientAutocomplete, setShowClientAutocomplete] = useState(false);
  const [status, setStatus] = useState('paid');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  
  // Para el escáner
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [scanMode, setScanMode] = useState(true);
  const scannerInputRef = useRef(null);
  const clientAutocompleteRef = useRef(null);
  
  // {currencySymbol} 
const currencySymbol = company?.currency || 'USD';

  // Estado para alerta de stock insuficiente
  const [lowStockAlert, setLowStockAlert] = useState({
    show: false,
    productName: '',
    available: 0,
    requested: 0
  });

  // Estado para el pago en efectivo
  const [cashPayment, setCashPayment] = useState({
    show: false,
    amountReceived: '',
    change: 0,
    method: 'cash' // 'cash' o 'card'
  });

  // Calcular totales
  const subtotal = scannedItems.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice), 0
  );
  const taxAmount = subtotal * 0.10;
  const total = subtotal + taxAmount;

  // Enfocar el input del escáner automáticamente
  useEffect(() => {
    if (scanMode && scannerInputRef.current) {
      scannerInputRef.current.focus();
    }
  }, [scanMode]);

  // Cerrar autocompletados al hacer click fuera
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

  // Buscar producto por código de barras
  const findProductByBarcode = (barcode) => {
    return products.find(p => 
      p.artikelNumber?.toString() === barcode.toString() ||
      p.artikelName?.toLowerCase().includes(barcode.toLowerCase())
    );
  };

  // Función para verificar stock antes de agregar
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
      
      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        setLowStockAlert(prev => ({ ...prev, show: false }));
      }, 5000);
      
      return false;
    }
    
    return true;
  };

  // Manejar escaneo de código de barras
  const handleBarcodeScan = (e) => {
    e.preventDefault();
    
    if (!barcodeInput.trim()) return;
    
    const product = findProductByBarcode(barcodeInput.trim());
    
    if (product) {
      // Verificar stock antes de agregar
      if (!checkStockBeforeAdd(product, 1)) {
        // Mostrar feedback de error
        setLastScanned({
          product: null,
          timestamp: new Date(),
          success: false,
          message: `Stock unzureichend für ${product.artikelName}`
        });
        setTimeout(() => {
          setBarcodeInput('');
          if (scannerInputRef.current) {
            scannerInputRef.current.focus();
          }
        }, 100);
        return;
      }
      
      // Verificar si el producto ya está en la lista
      const existingIndex = scannedItems.findIndex(item => 
        item.productId === product._id
      );
      
      if (existingIndex >= 0) {
        // Incrementar cantidad si ya existe
        setScannedItems(prev => prev.map((item, idx) => 
          idx === existingIndex 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        ));
      } else {
        // Agregar nuevo producto
        setScannedItems(prev => [...prev, {
          productId: product._id,
          artikelName: product.artikelName,
          quantity: 1,
          unitPrice: product.price || 0,
          stock: product.stock || 0
        }]);
      }
      
      setLastScanned({
        product,
        timestamp: new Date(),
        success: true
      });
      
      // Limpiar el input después de 1 segundo
      setTimeout(() => {
        setBarcodeInput('');
        if (scannerInputRef.current) {
          scannerInputRef.current.focus();
        }
      }, 100);
    } else {
      setLastScanned({
        product: null,
        timestamp: new Date(),
        success: false,
        message: `Produkt nicht gefunden: ${barcodeInput}`
      });
      
      setTimeout(() => setLastScanned(null), 3000);
    }
  };

  // Filtrar clientes para autocompletado
  const filteredClients = () => {
    const query = clientSearch?.toLowerCase() || '';
    if (!query) return [];
    return clients.filter(c =>
      c.name?.toLowerCase().includes(query) ||
      c.vorname?.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query))
    ).slice(0, 8);
  };

  // Función para limpiar selección de cliente
  const clearClientSelection = () => {
    setClientId('');
    setClientSearch('');
    setShowClientAutocomplete(false);
  };

  // Manejar cambio de cantidad
  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      // Eliminar si la cantidad es 0
      setScannedItems(prev => prev.filter((_, i) => i !== index));
      return;
    }
    
    const item = scannedItems[index];
    const product = products.find(p => p._id === item.productId);
    
    if (product && newQuantity > product.stock) {
      // Mostrar alerta de stock insuficiente
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

  // Manejar cambio de precio
  const updatePrice = (index, newPrice) => {
    setScannedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, unitPrice: newPrice } : item
    ));
  };

  // Eliminar ítem
  const removeItem = (index) => {
    setScannedItems(prev => prev.filter((_, i) => i !== index));
  };

  // Verificar stock antes de finalizar venta
  const validateStockBeforeFinish = () => {
    for (const item of scannedItems) {
      const product = products.find(p => p._id === item.productId);
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

  // Funciones para el teclado numérico de pago - REPARADAS
  const handleNumberClick = (number) => {
    setCashPayment(prev => {
      const currentAmount = prev.amountReceived || '';
      const newAmount = currentAmount + number;
      
      // Calcular cambio inmediatamente
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
    
    // Solo permitir un punto decimal
    if (!currentAmount.includes('.')) {
      // Si no hay números antes del punto, agregar "0."
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

  // Calcular cambio automáticamente cuando cambia amountReceived o total
  useEffect(() => {
    if (cashPayment.show && cashPayment.amountReceived) {
      const received = parseFloat(cashPayment.amountReceived) || 0;
      const change = Math.max(0, received - total);
      setCashPayment(prev => ({
        ...prev,
        change: parseFloat(change.toFixed(2))
      }));
    }
  }, [cashPayment.amountReceived, total, cashPayment.show]);

  // Botones rápidos - REPARADOS
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

  // Finalizar venta con pago - REPARADA
  const handleFinishSaleWithPayment = async () => {
    if (isSubmitting || scannedItems.length === 0) return;
    
    // Verificar stock antes de proceder
    if (!validateStockBeforeFinish()) {
      return;
    }

    // Si es pago en efectivo, verificar que se haya recibido suficiente
    if (cashPayment.method === 'cash') {
      const received = parseFloat(cashPayment.amountReceived) || 0;
      if (received < total) {
        alert(`Unzureichender Betrag erhalten. Total: ${total.toFixed(2)} ${currencySymbol} , Erhalten: ${received.toFixed(2)} ${currencySymbol}`);
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
        status: 'paid', // Siempre marcado como pagado cuando se usa este modal
        paymentMethod: cashPayment.method,
        amountReceived: cashPayment.method === 'cash' ? parseFloat(cashPayment.amountReceived) : total,
        change: cashPayment.method === 'cash' ? cashPayment.change : 0
      };
      
      console.log('Sending payload:', payload);
      
      const result = await createSale(payload);
      
      console.log('Result from createSale:', result);
      
      if (result.success && result.sale) {
        // Mostrar recibo con la venta creada
        setCurrentReceipt(result.sale);
        setShowReceipt(true);
        
        // Cerrar modal de pago
        setCashPayment({
          show: false,
          amountReceived: '',
          change: 0,
          method: 'cash'
        });
        
        // Resetear para nueva venta después de 5 segundos
        setTimeout(() => {
          setScannedItems([]);
          setClientId('');
          setClientSearch('');
          setShowReceipt(false);
          setCurrentReceipt(null);
          setScanMode(true);
          setIsSubmitting(false);
        }, 5000);
      } else {
        // Manejar error de stock desde el backend
        if (result.type === 'BUSINESS_ERROR' || result.message.includes('Stock')) {
          // Extraer información del error
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
            alert(result.message || 'Stock unzureichend');
          }
        } else if (result.type === 'UNAUTHORIZED') {
          alert('Sitzung abgelaufen. Bitte neu anmelden.');
        } else {
          alert(result.message || 'Fehler beim Erstellen der Rechnung');
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error finishing sale:', error);
      alert('Fehler beim Erstellen der Rechnung: ' + error.message);
      setIsSubmitting(false);
    }
  };

  // Finalizar venta - SIMPLIFICADA para kiosko
const handleFinishSale = () => {
  if (scannedItems.length === 0) {
    alert('Bitte fügen Sie zuerst Artikel hinzu');
    return;
  }

  if (!validateStockBeforeFinish()) {
    return;
  }

  setCashPayment({
    show: true,
    amountReceived: '',   // 👈 VACÍO
    change: 0,            // 👈 Rückgeld en 0
    method: 'cash'
  });
};
  // Cancelar venta actual
  const handleCancelSale = () => {
    if (scannedItems.length === 0) {
      setScannedItems([]);
      return;
    }
    
    if (confirm('Möchten Sie den aktuellen Verkauf wirklich abbrechen?')) {
      setScannedItems([]);
      setClientId('');
      setClientSearch('');
      setCashPayment({
        show: false,
        amountReceived: '',
        change: 0,
        method: 'cash'
      });
      setScanMode(true);
    }
  };

  // Función para agregar producto manualmente
  const handleManualAdd = () => {
    const searchTerm = prompt('Produktnamen oder Artikelnummer eingeben:');
    if (searchTerm) {
      const product = products.find(p => 
        p.artikelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.artikelNumber?.toString().includes(searchTerm)
      );
      
      if (product) {
        // Verificar stock antes de agregar
        if (!checkStockBeforeAdd(product, 1)) {
          alert(`Stock unzureichend für ${product.artikelName}`);
          return;
        }
        
        const existingIndex = scannedItems.findIndex(item => 
          item.productId === product._id
        );
        
        if (existingIndex >= 0) {
          updateQuantity(existingIndex, scannedItems[existingIndex].quantity + 1);
        } else {
          setScannedItems(prev => [...prev, {
            productId: product._id,
            artikelName: product.artikelName,
            quantity: 1,
            unitPrice: product.price || 0,
            stock: product.stock || 0
          }]);
        }
      } else {
        alert('Produkt nicht gefunden');
      }
    }
  };

  // Cerrar modal de pago
  const closePaymentModal = () => {
    setCashPayment(prev => ({
      ...prev,
      show: false,
      amountReceived: '',
      change: 0
    }));
  };

  // Función para manejar Enter en el input de efectivo
  const handleCashInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFinishSaleWithPayment();
    }
  };

  if (authLoading) {
    return (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Lade Scanner-Verkauf...</p>
        </div>
    );
  }

  return (
      <div className={styles.container}>
        {/* Alert de stock insuficiente */}
        {lowStockAlert.show && (
          <div className={styles.lowStockAlert}>
            <div className={styles.alertContent}>
              <div className={styles.alertIcon}>⚠️</div>
              <div className={styles.alertText}>
                <h3>Stock unzureichend!</h3>
                <p>
                  Für <strong>{lowStockAlert.productName}</strong> sind nur 
                  <strong> {lowStockAlert.available} Einheiten</strong> verfügbar.
                </p>
                <p className={styles.alertDetail}>
                  Sie benötigen {lowStockAlert.requested} Einheiten.
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

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h1>Kiosk-Verkauf</h1>
            <p>Schnelles Scannen und Bezahlen für Kiosk</p>
          </div>
          
          <div className={styles.headerControls}>
            <button 
              className={`${styles.modeToggle} ${scanMode ? styles.active : ''}`}
              onClick={() => setScanMode(!scanMode)}
            >
              {scanMode ? '🔍 Scan-Modus' : '✏️ Bearbeiten-Modus'}
            </button>
            
            <div className={styles.headerTotals}>
              <span className={styles.headerTotalLabel}>Gesamt:</span>
              <span className={styles.headerTotalAmount}>{total.toFixed(2)} {currencySymbol}</span>
            </div>
          </div>
        </div>

        <div className={styles.mainLayout}>
          {/* Panel izquierdo: Escáner y cliente */}
          <div className={styles.leftPanel}>
            {/* Escáner */}
            <div className={styles.scannerSection}>
              <div className={styles.sectionHeader}>
                <h2>Barcode-Scanner</h2>
                <span className={styles.scanCount}>
                  {scannedItems.length} Artikel
                </span>
              </div>
              
              <form onSubmit={handleBarcodeScan} className={styles.scannerForm}>
                <div className={styles.scannerInputGroup}>
                  <input
                    ref={scannerInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Barcode scannen oder Artikelnummer eingeben..."
                    className={styles.scannerInput}
                    disabled={!scanMode}
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    className={styles.scanButton}
                    disabled={!barcodeInput.trim() || !scanMode}
                  >
                    Hinzufügen
                  </button>
                </div>
              </form>
              
              {lastScanned && (
                <div className={`${styles.scanFeedback} ${
                  lastScanned.success ? styles.success : styles.error
                }`}>
                  {lastScanned.success ? (
                    <>
                      <span className={styles.feedbackIcon}>✓</span>
                      <span className={styles.feedbackText}>
                        <strong>{lastScanned.product.artikelName}</strong> hinzugefügt
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={styles.feedbackIcon}>✗</span>
                      <span className={styles.feedbackText}>{lastScanned.message}</span>
                    </>
                  )}
                </div>
              )}
              
              <button 
                className={styles.manualAddButton}
                onClick={handleManualAdd}
                disabled={isSubmitting}
              >
                <span className={styles.manualAddIcon}>+</span>
                Produkt manuell hinzufügen
              </button>
            </div>

            {/* Cliente */}
            <div className={styles.clientSection}>
              <h2>Kunde</h2>
              
              <div ref={clientAutocompleteRef} className={styles.clientAutocomplete}>
                <div className={styles.clientInputWrapper}>
                  <input
                    type="text"
                    placeholder="Kunde suchen..."
                    value={clientSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setClientSearch(value);
                      if (value === '') {
                        setClientId(''); // Usar ClienteRandom si está vacío
                      } else {
                        setShowClientAutocomplete(true);
                      }
                    }}
                    onFocus={() => setShowClientAutocomplete(true)}
                    className={styles.clientInput}
                    disabled={isSubmitting}
                  />
                  {clientId && (
                    <button 
                      className={styles.clearClientButton}
                      onClick={clearClientSelection}
                      title="Löschen"
                      disabled={isSubmitting}
                      aria-label="Client löschen"
                    >
                      ✕
                    </button>
                  )}
                </div>
                
                {showClientAutocomplete && (
                  <div className={styles.autocompleteDropdown}>
                    {/* Opción para usar ClienteRandom */}
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
                          ClienteRandom
                        </span>
                      </div>
                    </div>
                    
                    {/* Separador */}
                    <div className={styles.autocompleteSeparator}></div>
                    
                    {/* Lista de clientes existentes */}
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
              
              {/* Status - Simplificado para kiosko */}
              <div className={styles.statusSelect}>
                <label>Status:</label>
                <div className={styles.statusDisplay}>
                  <span className={styles.statusPaid}>Bezahlt</span>
                </div>
              </div>
            </div>

            {/* Totales */}
            <div className={styles.totalsCard}>
              <div className={styles.totalsGrid}>
                <div className={styles.totalRow}>
                  <span>Zwischensumme:</span>
                  <span>{subtotal.toFixed(2)} {currencySymbol}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>10% MwSt.:</span>
                  <span>{taxAmount.toFixed(2)} {currencySymbol}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Gesamtsumme:</span>
                  <span>{total.toFixed(2)} {currencySymbol}</span>
                </div>
              </div>
              
              <div className={styles.actionButtons}>
                <button 
                  className={styles.cancelButton}
                  onClick={handleCancelSale}
                  disabled={scannedItems.length === 0 || isSubmitting}
                >
                  Verkauf abbrechen
                </button>
                <button 
                  className={styles.finishButton}
                  onClick={handleFinishSale}
                  disabled={scannedItems.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      Wird bearbeitet...
                    </>
                  ) : (
                    'Zur Kasse'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Panel derecho: Lista de productos escaneados */}
          <div className={styles.rightPanel}>
            <div className={styles.itemsHeader}>
              <div className={styles.itemsHeaderInfo}>
                <h2>Gescannte Artikel</h2>
                <span className={styles.itemsCount}>
                  {scannedItems.length} Artikel
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
                  <h3>Keine Artikel gescannt</h3>
                  <p>Scannen Sie Artikel, um sie hier anzuzeigen</p>
                </div>
              </div>
            ) : (
              <div className={styles.itemsList}>
                {scannedItems.map((item, index) => {
                  const product = products.find(p => p._id === item.productId);
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
                              disabled={isSubmitting}
                              aria-label="Artikel entfernen"
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className={styles.itemMeta}>
                            <span className={styles.itemNumber}>
                              Art.-Nr: {product?.artikelNumber || '-'}
                            </span>
                            <span className={`${styles.itemStock} ${
                              isLowStock ? styles.stockWarning : styles.stockGood
                            }`}>
                              {product?.stock || 0} verfügbar
                              {isLowStock && (
                                <span className={styles.stockWarningIcon}>⚠️</span>
                              )}
                            </span>
                          </div>
                        </div>
                        
                        <div className={styles.itemControls}>
                          <div className={styles.quantityControl}>
                            <div className={styles.controlLabel}>Menge</div>
                            <div className={styles.quantityInputGroup}>
                              <button 
                                className={styles.quantityButton}
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isSubmitting}
                                aria-label="Menge reduzieren"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                                className={`${styles.quantityInput} ${isLowStock ? styles.inputWarning : ''}`}
                                disabled={isSubmitting}
                                aria-label="Anzahl"
                              />
                              <button 
                                className={styles.quantityButton}
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                disabled={isSubmitting}
                                aria-label="Menge erhöhen"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          <div className={styles.priceControl}>
                            <div className={styles.controlLabel}>Einzelpreis {currencySymbol}</div>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updatePrice(index, parseFloat(e.target.value) || 0)}
                              className={styles.priceInput}
                              disabled={isSubmitting}
                              aria-label="Preis"
                            />
                          </div>
                          
                          <div className={styles.lineTotal}>
                            <div className={styles.controlLabel}>Gesamt</div>
                            <div className={styles.lineTotalAmount}>
                              {(item.quantity * item.unitPrice).toFixed(2)} {currencySymbol}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isLowStock && (
                        <div className={styles.stockWarningBanner}>
                          <span className={styles.warningIcon}>⚠️</span>
                          Stock unzureichend! Nur {product.stock} Einheiten verfügbar
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal de pago en efectivo */}
        {cashPayment.show && (
          <div className={styles.paymentModal}>
            <div className={styles.paymentContent}>
              <div className={styles.paymentHeader}>
                <h2>Kassieren</h2>
                <button 
                  className={styles.closePayment}
                  onClick={closePaymentModal}
                  aria-label="Schließen"
                >
                  ✕
                </button>
              </div>
              
              <div className={styles.paymentBody}>
                {/* Total a pagar - GRANDE Y CLARO */}
                <div className={styles.paymentTotalSection}>
                  <div className={styles.paymentTotalLabel}>ZU ZAHLEN:</div>
                  <div className={styles.paymentTotalAmount}>{total.toFixed(2)} {currencySymbol}F</div>
                </div>
                
                {/* Método de pago simplificado */}
                <div className={styles.paymentMethodSection}>
                  <div className={styles.paymentMethodButtons}>
                    <button
                      className={`${styles.paymentMethodButton} ${cashPayment.method === 'cash' ? styles.active : ''}`}
                      onClick={() => setCashPayment(prev => ({ ...prev, method: 'cash' }))}
                    >
                      💵 BARZAHLUNG
                    </button>
                    <button
                      className={`${styles.paymentMethodButton} ${cashPayment.method === 'card' ? styles.active : ''}`}
                      onClick={() => setCashPayment(prev => ({ ...prev, method: 'card' }))}
                    >
                      💳 KARTE
                    </button>
                  </div>
                </div>
                
                {/* Si es efectivo, mostrar entrada de dinero */}
                {cashPayment.method === 'cash' && (
                  <>
                    <div className={styles.cashInputSection}>
                      <div className={styles.cashInputLabel}>ERHALTEN:</div>
                      <div className={styles.cashInputDisplay}>
                        <input
                          ref={input => input && input.focus()}
                          type="text"
                          value={cashPayment.amountReceived}
                          onChange={(e) => {
                            // Solo permitir números y punto decimal
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            // Limitar a 2 decimales
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
                    
                    {/* Cambio a devolver - MUY VISIBLE */}
                    <div className={styles.changeSection}>
                      <div className={styles.changeLabel}>RÜCKGELD:</div>
                      <div className={`${styles.changeAmount} ${cashPayment.change > 0 ? styles.positiveChange : ''}`}>
                        {cashPayment.change > 0 ? cashPayment.change.toFixed(2) : '0.00'} {currencySymbol}
                      </div>
                    </div>
                    
                    {/* Teclado numérico - REPARADO */}
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
                          disabled={isSubmitting || (cashPayment.method === 'cash' && (parseFloat(cashPayment.amountReceived) || 0) < total)}
                        >
                          {isSubmitting ? (
                            <div className={styles.loadingSpinner}></div>
                          ) : (
                            'ENTER'
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Botones rápidos de billetes comunes - REPARADOS */}
                    <div className={styles.quickCashButtons}>
                      <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(5)}>
                        5 {currencySymbol}
                      </button>
                      <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(10)}>
                        10 {currencySymbol}
                      </button>
                      <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(20)}>
                        20 {currencySymbol}
                      </button>
                      <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(50)}>
                        50 {currencySymbol}
                      </button>
                      <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(100)}>
                        100 {currencySymbol}
                      </button>
                      <button className={styles.quickCashButton} onClick={() => handleQuickCashClick(200)}>
                        200 {currencySymbol}
                      </button>
                    </div>
                  </>
                )}
                
                {/* Si es tarjeta, mostrar botón simple */}
                {cashPayment.method === 'card' && (
                  <div className={styles.cardPaymentSection}>
                    <div className={styles.cardPaymentInfo}>
                      <div className={styles.cardIcon}>💳</div>
                      <p>Kartenzahlung wird verarbeitet...</p>
                      <p className={styles.cardTotal}>Betrag: {total.toFixed(2)} {currencySymbol}</p>
                    </div>
                    <button 
                      className={styles.cardPaymentButton}
                      onClick={handleFinishSaleWithPayment}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className={styles.loadingSpinner}></div>
                          Wird verarbeitet...
                        </>
                      ) : (
                        'Kartenzahlung bestätigen'
                      )}
                    </button>
                    <button 
                      className={styles.backToCashButton}
                      onClick={() => setCashPayment(prev => ({ ...prev, method: 'cash' }))}
                    >
                      Zurück zu Barzahlung
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de recibo */}
        {showReceipt && currentReceipt && (
          <div className={styles.receiptModal}>
            <div className={styles.receiptContent}>
              <div className={styles.receiptHeader}>
                <h2>✅ VERKAUF ERFOLGREICH!</h2>
                <button 
                  className={styles.closeReceipt}
                  onClick={() => setShowReceipt(false)}
                  aria-label="Schließen"
                >
                  ✕
                </button>
              </div>
              
              <div className={styles.receiptBody}>
                <div className={styles.receiptSuccessIcon}>🎉</div>
                <div className={styles.receiptDetails}>
                  <p className={styles.receiptNumber}>Rechnung <strong>{currentReceipt.lieferschein}</strong></p>
                  <p className={styles.receiptTotal}>Gesamtbetrag: <strong>{currentReceipt.total?.toFixed(2)} {currencySymbol}</strong></p>
                  <p className={styles.receiptMethod}>Zahlungsmethode: <strong>
                    {currentReceipt.paymentMethod === 'cash' ? 'Barzahlung' : 'Kartenzahlung'}
                  </strong></p>
                  {currentReceipt.paymentMethod === 'cash' && (
                    <>
                      <p className={styles.receiptReceived}>Erhalten: <strong>{currentReceipt.amountReceived?.toFixed(2)} {currencySymbol}</strong></p>
                      <p className={styles.receiptChange}>Rückgeld: <strong>{currentReceipt.change?.toFixed(2)} {currencySymbol}</strong></p>
                    </>
                  )}
                  <p className={styles.receiptClient}>Kunde: <strong>
                    {currentReceipt.clientSnapshot?.vorname} {currentReceipt.clientSnapshot?.name}
                    {currentReceipt.meta?.hasRandomClient && (
                      <span className={styles.randomClientTag}> 🎯</span>
                    )}
                  </strong></p>
                  <p className={styles.receiptTime}>Zeit: <strong>{new Date().toLocaleTimeString('de-CH')}</strong></p>
                </div>
                
                <div className={styles.receiptActions}>
                  <button 
                    className={styles.printButton}
                    onClick={() => window.print()}
                  >
                    <span className={styles.printIcon}>🖨️</span>
                    Drucken
                  </button>
                  <button 
                    className={styles.newSaleButton}
                    onClick={() => {
                      setShowReceipt(false);
                      setScannedItems([]);
                      setClientId('');
                      setClientSearch('');
                      setScanMode(true);
                    }}
                  >
                    Neue Verkauf starten
                  </button>
                </div>
                
                <p className={styles.autoResetNote}>
                  Automatische Rückstellung in 5 Sekunden...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}