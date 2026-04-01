import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useClients } from "../../../hooks/useClients";
import { useProduct } from "../../../hooks/useProducts";
import { useLanguage } from "../../../contexts/LanguageContext";
import { COUNTRY_CONFIG } from '../../../utils/countryConfig';
import { useToast } from '../../../contexts/ToastContext';
import styles from './Creator.module.css';

export default function RechnungCreator({ onDone, salesApi }) {
  const { t } = useLanguage();
  const { showToast } = useToast();   

  if (!salesApi) {
    console.error("RechnungCreator renderizado sin salesApi");
    return null;
  }
  
  const { createSale } = salesApi;
  const { company, isAuthenticated } = useAuth();
  const { clients } = useClients();
  const { 
    products, 
    refreshProducts,
    updateProductInCache,
    fetchProductLimits,
    searchProductsInCache,
    loading: productsLoading,
    productLimits,
    limitWarning
  } = useProduct();
  
  // Estados principales
  const [clientId, setClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [showClientAutocomplete, setShowClientAutocomplete] = useState(false);
  const [status, setStatus] = useState("paid");
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Refs
  const clientAutocompleteRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Configuración de país y moneda
  const countryCode = company?.invoiceSettings?.country || 'DE';
  const countryConfig = COUNTRY_CONFIG[countryCode] || COUNTRY_CONFIG.DE;
  const taxName = countryConfig.taxName || 'MwSt';
  const taxRate = company?.invoiceSettings?.taxRate || 19;
  const currencySymbol = company?.currency || 'USD';
  
  // Formatear moneda
  const formatCurrency = (value) => {
    return value?.toFixed(2) || '0.00';
  };
  
  // Cargar productos al montar
  useEffect(() => {
    if (isAuthenticated && products.length === 0) {
      refreshProducts();
    }
    if (isAuthenticated && company?._id) {
      fetchProductLimits(true);
    }
  }, [isAuthenticated, refreshProducts, fetchProductLimits, company?._id]);
  
    // Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onDone();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isSubmitting, onDone]);
  
  // Filtrar productos localmente
  useEffect(() => {
    if (!productSearchTerm.trim()) {
      setFilteredProducts(products.slice(0, 30));
      return;
    }
    
    const term = productSearchTerm.toLowerCase();
    const filtered = products.filter(p => 
      p.artikelName?.toLowerCase().includes(term) ||
      p.artikelNumber?.toString().toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    ).slice(0, 50);
    
    setFilteredProducts(filtered);
  }, [productSearchTerm, products]);
  
  // Buscar productos con debounce
  const handleProductSearch = (value) => {
    setProductSearchTerm(value);
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (value.length >= 2) {
      setSearchTimeout(setTimeout(async () => {
        try {
          const results = await searchProductsInCache(value);
          setFilteredProducts(results.slice(0, 50));
        } catch (error) {
          console.error('Error en búsqueda:', error);
        }
      }, 300));
    }
  };
  
  // Agregar producto al carrito (solo si tiene stock > 0)
  const addToCart = (product) => {
    // Verificar si el producto tiene stock disponible
    if (product.stock <= 0) {
      showToast(t('rechnungForm.products.outOfStockMessage').replace('{name}', product.artikelName), 'warning');
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product._id);
      
      // Si ya existe en el carrito, verificar que no exceda el stock
      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > product.stock) {
          showToast(t('rechnungForm.products.exceedsStock').replace('{name}', product.artikelName).replace('{stock}', product.stock), 'warning');
          return prevCart;
        }
        return prevCart.map(item =>
          item.productId === product._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      return [...prevCart, {
        productId: product._id,
        productName: product.artikelName,
        productNumber: product.artikelNumber,
        quantity: 1,
        unitPrice: product.price || 0,
        stock: product.stock || 0,
        image: product.imagen
      }];
    });
  };
  
  // Actualizar cantidad en carrito
  const updateCartQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(index);
      return;
    }
    
    const item = cart[index];
    const product = products.find(p => p._id === item.productId);
    
    // Verificar que la nueva cantidad no exceda el stock
    if (product && newQuantity > product.stock) {
      showToast(t('rechnungForm.products.exceedsStock').replace('{name}', product.artikelName).replace('{stock}', product.stock), 'warning');
      return;
    }
    
    setCart(prevCart => prevCart.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  // Eliminar del carrito
  const removeFromCart = (index) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };
  
  // Actualiza clearCart
  const clearCart = () => {
    if (cart.length > 0 && confirm(t('rechnungForm.cart.clearConfirm'))) {
      setCart([]);
      showToast(t('rechnungForm.cart.clear'), 'info');
    }
  };
  
  // Calcular totales
  const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  
  // Filtrar clientes
  const filteredClients = () => {
    const query = clientSearch?.toLowerCase() || "";
    
    if (!query) {
      return clients.slice(0, 20);
    }
    
    return clients.filter(c =>
      c.name?.toLowerCase().includes(query) ||
      c.vorname?.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query))
    ).slice(0, 8);
  };
  
  const getSelectedClientName = () => {
    if (!clientId) return "";
    const client = clients.find(c => c._id === clientId);
    return client ? `${client.vorname} ${client.name}` : "";
  };
  
  const clearClientSelection = () => {
    setClientId("");
    setClientSearch("");
  };
  
  // También actualiza validateStock para usar toast
  const validateStock = () => {
    for (const item of cart) {
      const product = products.find(p => p._id === item.productId);
      if (product && product.stock < item.quantity) {
        showToast(t('rechnungForm.items.errors.stockItem')
          .replace('{name}', item.productName)
          .replace('{stock}', product.stock)
          .replace('{needed}', item.quantity), 'error');
        return false;
      }
    }
    return true;
  };
  
  const submit = async () => {
    if (isSubmitting || !isAuthenticated) return;
    
    if (cart.length === 0) {
      showToast(t('rechnungForm.messages.cartEmpty'), 'warning');
      return;
    }
    
    if (!validateStock()) return;
    
    setIsSubmitting(true);
    
    const payload = {
      clientId: clientId || null,
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      status,
      taxRate: Number(taxRate)
    };
    
    try {
      const res = await createSale(payload);
      
      if (res.success && res.sale) {
        const invoiceNumber = res.sale.lieferschein || res.sale.invoiceNumber || '';
        const successMessage = invoiceNumber 
          ? t('rechnungForm.toasts.invoiceCreated').replace('{number}', invoiceNumber)
          : t('rechnungForm.messages.createSuccessShort');
        
        showToast(successMessage, 'success', 4000);
        
        setIsSubmitting(false);
        onDone();
        
        setTimeout(() => {
          updateProductInCache(true).catch(console.warn);
          fetchProductLimits(true).catch(console.warn);
        }, 200);
        
      } else {
        showToast(res.message || t('rechnungForm.messages.createError'), 'error');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      showToast(t('rechnungForm.messages.createError') + ": " + error.message, 'error');
      setIsSubmitting(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className={styles.modalLarge}>
        <div className={styles.modalHeader}>
          <h2>{t('rechnungForm.restricted.title')}</h2>
          <button className={styles.closeBtn} onClick={onDone}>×</button>
        </div>
        <div className={styles.modalBody}>
          <p>{t('rechnungForm.restricted.message')}</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onDone}>
            {t('rechnungForm.restricted.close')}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalLarge}>
        <div className={styles.modalHeader}>
          <h2>{t('rechnungForm.creator.title')}</h2>
          <button 
            className={styles.closeBtn} 
            onClick={() => {
              if (!isSubmitting) {
                onDone();
              }
            }}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>
        
        <div className={styles.posContainer}>
          {/* Panel izquierdo - Lista de productos */}
          <div className={styles.productsPanel}>
            <div className={styles.searchSection}>
              <div className={styles.searchWrapper}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('rechnungForm.products.searchPlaceholder')}
                  value={productSearchTerm}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  className={styles.productSearchInput}
                />
              </div>
            </div>
            
            <div className={styles.productsGrid}>
              {productsLoading ? (
                <div className={styles.loadingProducts}>
                  <div className={styles.spinner}></div>
                  <p>{t('rechnungForm.common.loading')}</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className={styles.emptyProducts}>
                  <span className={styles.emptyIcon}>🔍</span>
                  <p>{productSearchTerm ? t('rechnungForm.products.noResults') : t('rechnungForm.products.empty')}</p>
                </div>
              ) : (
                filteredProducts.map(product => {
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <div 
                      key={product._id} 
                      className={`${styles.productCard} ${isOutOfStock ? styles.disabledProduct : ''}`}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                    >
                      {isOutOfStock && (
                        <div className={styles.outOfStockBadge}>
                          {t('rechnungForm.products.outOfStockBadge') || 'SIN STOCK'}
                        </div>
                      )}
                      <div className={styles.productImage}>
                        {product.imagen ? (
                          <img src={product.imagen} alt={product.artikelName} />
                        ) : (
                           (
                                      <div className={styles.cardPlaceholder}>
                                        <img
                                          src="/img/moving-box.png"
                                          alt="Placeholder"
                                          className={styles.placeholderImage}
                                          loading="lazy"
                                        />
                                      </div>
                                    )
                        )}
                      </div>
                      <div className={styles.productInfo}>
                        <h4 className={styles.productName}>{product.artikelName}</h4>
                        <p className={styles.productNumber}>{product.artikelNumber || '-'}</p>
                        <div className={styles.productFooter}>
                          <span className={styles.productPrice}>
                            {formatCurrency(product.price || 0)} {currencySymbol}
                          </span>
                          <span className={`${styles.productStock} ${isOutOfStock ? styles.outOfStock : product.stock < 10 ? styles.lowStock : ''}`}>
                            {product.stock || 0} {t('rechnungForm.products.units')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Panel derecho - Carrito */}
          <div className={styles.cartPanel}>
            {/* Cliente y estado */}
            <div className={styles.cartHeader}>
              <div className={styles.clientSection}>
                <label>{t('rechnungForm.client.label')}</label>
                <div ref={clientAutocompleteRef} className={styles.clientAutocomplete}>
                  <input
                    type="text"
                    placeholder={t('rechnungForm.client.placeholder')}
                    value={clientSearch || getSelectedClientName()}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setShowClientAutocomplete(true);
                    }}
                    onFocus={() => setShowClientAutocomplete(true)}
                    disabled={isSubmitting}
                  />
                  {clientId && (
                    <button 
                      className={styles.clearClientBtn}
                      onClick={clearClientSelection}
                      title={t('rechnungForm.client.clearTitle')}
                    >
                      ✕
                    </button>
                  )}
                  {showClientAutocomplete && (
                    <div className={styles.autocompleteDropdown}>
                      <div 
                        className={`${styles.autocompleteItem} ${!clientId ? styles.selected : ''}`}
                        onClick={() => {
                          setClientId("");
                          setClientSearch("");
                          setShowClientAutocomplete(false);
                        }}
                      >
                        <span className={styles.clientName}>
                          <span className={styles.randomClientIcon}>🎯</span>
                          {t('rechnungForm.client.random')}
                        </span>
                      </div>
                      <div className={styles.autocompleteSeparator}></div>
                      {filteredClients().length > 0 ? (
                        filteredClients().map(c => (
                          <div 
                            key={c._id} 
                            className={`${styles.autocompleteItem} ${clientId === c._id ? styles.selected : ''}`}
                            onClick={() => {
                              setClientId(c._id);
                              setClientSearch(`${c.vorname} ${c.name}`);
                              setShowClientAutocomplete(false);
                            }}
                          >
                            <span className={styles.clientName}>
                              {c.vorname} {c.name}
                            </span>
                            {c.email && <span className={styles.email}>({c.email})</span>}
                          </div>
                        ))
                      ) : (
                        <div className={styles.autocompleteEmpty}>
                          {t('rechnungForm.client.noClients')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.statusSection}>
                <label>{t('rechnungForm.status.label')}</label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="paid">{t('rechnungForm.status.paid')}</option>
                  <option value="pending">{t('rechnungForm.status.pending')}</option>
                  <option value="cancelled">{t('rechnungForm.status.cancelled')}</option>
                </select>
              </div>
            </div>
            
            {/* Lista de artículos en carrito */}
            <div className={styles.cartItems}>
              <div className={styles.cartItemsHeader}>
                <h3>{t('rechnungForm.cart.title')} ({cart.length} {t('rechnungForm.cart.items')})</h3>
                {cart.length > 0 && (
                  <button className={styles.clearCartBtn} onClick={clearCart}>
                    {t('rechnungForm.cart.clear')}
                  </button>
                )}
              </div>
              
              {cart.length === 0 ? (
                <div className={styles.emptyCart}>
                  <span className={styles.emptyCartIcon}>🛒</span>
                  <p>{t('rechnungForm.cart.empty')}</p>
                </div>
              ) : (
                <div className={styles.cartList}>
                  {cart.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className={styles.cartItem}>
                      <div className={styles.cartItemInfo}>
                        <div className={styles.cartItemImage}>
                          {item.image ? (
                            <img src={item.image} alt={item.productName} />
                          ) : (
                            <div className={styles.cartItemPlaceholder}>📦</div>
                          )}
                        </div>
                        <div className={styles.cartItemDetails}>
                          <h4 className={styles.cartItemName}>{item.productName}</h4>
                          <span className={styles.cartItemNumber}>{item.productNumber}</span>
                          <span className={styles.cartItemPrice}>
                            {formatCurrency(item.unitPrice)} {currencySymbol}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.cartItemControls}>
                        <div className={styles.quantityControl}>
                          <button 
                            onClick={() => updateCartQuantity(index, item.quantity - 1)}
                            disabled={isSubmitting}
                            className={styles.qtyBtn}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 1) {
                                updateCartQuantity(index, val);
                              }
                            }}
                            className={styles.qtyInput}
                          />
                          <button 
                            onClick={() => updateCartQuantity(index, item.quantity + 1)}
                            disabled={isSubmitting}
                            className={styles.qtyBtn}
                          >
                            +
                          </button>
                        </div>
                        <div className={styles.itemSubtotal}>
                          {formatCurrency(item.quantity * item.unitPrice)} {currencySymbol}
                        </div>
                        <button 
                          onClick={() => removeFromCart(index)}
                          className={styles.removeItemBtn}
                          title={t('rechnungForm.cart.remove')}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Totales */}
            <div className={styles.cartTotals}>
              <div className={styles.totalRow}>
                <span>{t('rechnungForm.totals.subtotal')}</span>
                <span>{formatCurrency(subtotal)} {currencySymbol}</span>
              </div>
              <div className={styles.totalRow}>
                <span>{taxName} {taxRate.toFixed(1)}%</span>
                <span>{formatCurrency(taxAmount)} {currencySymbol}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>{t('rechnungForm.totals.total')}</span>
                <span>{formatCurrency(total)} {currencySymbol}</span>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className={styles.cartActions}>
              <button 
                className={`${styles.btn} ${styles.btnCancel}`} 
                onClick={onDone}
                disabled={isSubmitting}
              >
                {t('rechnungForm.common.cancel')}
              </button>
              <button 
                className={`${styles.btn} ${styles.btnSave}`} 
                onClick={submit} 
                disabled={isSubmitting || cart.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.loadingSpinnerSmall}></div>
                    {t('rechnungForm.common.saving')}
                  </>
                ) : (
                  t('rechnungForm.creator.submit')
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div> 
  );
}