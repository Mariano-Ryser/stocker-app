// frontend/components/adminDash/regnung/RechnungCreator.jsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useClients } from "../../../hooks/useClients";
import { useProduct } from "../../../hooks/useProducts";
import { useLanguage } from "../../../contexts/LanguageContext";
import styles from './Creator.module.css';

export default function RechnungCreator({ onDone, salesApi }) {
  const { t } = useLanguage();
  
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
    searchProductsInCache, // 👈 IMPORTANTE: usar la función de caché
    loading: productsLoading
  } = useProduct();
  
  const [clientId, setClientId] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [showClientAutocomplete, setShowClientAutocomplete] = useState(false);
  const [status, setStatus] = useState("paid");
  const [lines, setLines] = useState([{ productId: "", quantity: 1, unitPrice: 0, stock: 0 }]);
  const [searches, setSearches] = useState([""]);
  const [showAutocomplete, setShowAutocomplete] = useState([false]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockErrors, setStockErrors] = useState({});
  const [hasStockErrors, setHasStockErrors] = useState(false);
  const [searchTimeouts, setSearchTimeouts] = useState({});
  const [searchResults, setSearchResults] = useState({}); // 👈 Resultados por línea
  const [isSearching, setIsSearching] = useState({}); // 👈 Estado de búsqueda por línea
  
  const currencySymbol = company?.currency || 'USD';
  const autocompleteRefs = useRef([]);
  const clientAutocompleteRef = useRef(null);

  // Cargar productos solo una vez al montar
  useEffect(() => {
    if (isAuthenticated && products.length === 0) {
      // console.log("RechnungCreator: Fetching products on mount");
      refreshProducts();
    }
  }, [isAuthenticated, refreshProducts, products.length]);

  // Validar stock cuando cambian las líneas
  useEffect(() => {
    if (lines.length > 0 && products.length > 0) {
      validateAllStock();
    }
  }, [lines, products]);

  if (!isAuthenticated) {
    return (
      <div className={styles.modalBackdrop}>
        <div className={styles.modal}>
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
      </div>
    );
  }

  // Cerrar autocompletes al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showClientAutocomplete && clientAutocompleteRef.current &&
          !clientAutocompleteRef.current.contains(event.target)) {
        setShowClientAutocomplete(false);
      }

      showAutocomplete.forEach((isOpen, index) => {
        if (isOpen && autocompleteRefs.current[index] &&
            !autocompleteRefs.current[index].contains(event.target)) {
          setShowAutocomplete(prev => prev.map((s, idx) => idx === index ? false : s));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showAutocomplete, showClientAutocomplete]);

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

  // 🔥 BÚSQUEDA RÁPIDA - similar al Scanner
  const handleProductSearch = async (index, value) => {
    setSearches(prev => prev.map((s, idx) => idx === index ? value : s));
    updateLine(index, { productId: "" });
    setShowAutocomplete(prev => prev.map((s, idx) => idx === index ? true : s));
    
    if (value.length >= 2) {
      // Cancelar timeout anterior
      if (searchTimeouts[index]) {
        clearTimeout(searchTimeouts[index]);
      }
      
      // Mostrar resultados inmediatos de memoria mientras llega la búsqueda
      const immediateResults = products.filter(p => {
        const name = p.artikelName?.toLowerCase() || "";
        const description = p.description?.toLowerCase() || "";
        const artikelNumber = p.artikelNumber?.toString().toLowerCase() || "";
        const searchTerm = value.toLowerCase();
        
        return name.includes(searchTerm) || 
               description.includes(searchTerm) || 
               artikelNumber.includes(searchTerm);
      }).slice(0, 8);
      
      setSearchResults(prev => ({
        ...prev,
        [index]: immediateResults
      }));
      
      setIsSearching(prev => ({
        ...prev,
        [index]: true
      }));
      
      const timeout = setTimeout(async () => {
        try {
          // console.log(`🔍 Buscando: "${value}" en caché...`);
          
          // 🔥 Usar la función optimizada del hook (IndexedDB)
          const cachedResults = await searchProductsInCache(value);
          
          setSearchResults(prev => ({
            ...prev,
            [index]: cachedResults.slice(0, 8) // Mostrar máximo 8 resultados
          }));
          
        } catch (error) {
          console.error('Error en búsqueda:', error);
        } finally {
          setIsSearching(prev => ({
            ...prev,
            [index]: false
          }));
          
          setSearchTimeouts(prev => {
            const newTimeouts = { ...prev };
            delete newTimeouts[index];
            return newTimeouts;
          });
        }
      }, 300); // 300ms debounce
      
      setSearchTimeouts(prev => ({
        ...prev,
        [index]: timeout
      }));
    } else {
      // Si menos de 2 caracteres, mostrar productos recientes
      const recentResults = products.slice(0, 5);
      setSearchResults(prev => ({
        ...prev,
        [index]: recentResults
      }));
    }
  };

  const filteredProducts = (index) => {
    // Usar resultados de búsqueda si existen
    if (searchResults[index]) {
      return searchResults[index];
    }
    
    // Fallback: filtrado en memoria
    const query = searches[index]?.toLowerCase() || "";
    
    if (!query) {
      return products.slice(0, 5);
    }
    
    return products.filter(p => {
      const name = p.artikelName?.toLowerCase() || "";
      const description = p.description?.toLowerCase() || "";
      const artikelNumber = p.artikelNumber?.toString().toLowerCase() || "";
      
      return name.includes(query) || 
             description.includes(query) || 
             artikelNumber.includes(query);
    }).slice(0, 8);
  };

  const addLine = () => {
    setLines(prev => [...prev, { productId: "", quantity: 1, unitPrice: 0, stock: 0 }]);
    setSearches(prev => [...prev, ""]);
    setShowAutocomplete(prev => [...prev, false]);
    setSearchResults(prev => ({ ...prev, [lines.length]: [] }));
    setIsSearching(prev => ({ ...prev, [lines.length]: false }));
    autocompleteRefs.current.push(null);
  };

  const removeLine = (i) => {
    if (lines.length <= 1) {
      alert(t('rechnungForm.items.errors.minOneItem'));
      return;
    }
    
    if (searchTimeouts[i]) {
      clearTimeout(searchTimeouts[i]);
    }
    
    setLines(prev => prev.filter((_, idx) => idx !== i));
    setSearches(prev => prev.filter((_, idx) => idx !== i));
    setShowAutocomplete(prev => prev.filter((_, idx) => idx !== i));
    autocompleteRefs.current = autocompleteRefs.current.filter((_, idx) => idx !== i);
    
    setStockErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[i];
      return newErrors;
    });
    
    setSearchTimeouts(prev => {
      const newTimeouts = { ...prev };
      delete newTimeouts[i];
      return newTimeouts;
    });

    setSearchResults(prev => {
      const newResults = { ...prev };
      delete newResults[i];
      return newResults;
    });

    setIsSearching(prev => {
      const newSearching = { ...prev };
      delete newSearching[i];
      return newSearching;
    });
  };

  const updateLine = (i, changes) => {
    const newLines = lines.map((l, idx) => 
      idx === i ? { ...l, ...changes } : l
    );
    setLines(newLines);
    
    if (changes.productId) {
      const product = products.find(p => p._id === changes.productId);
      if (product) {
        setSearches(prev => prev.map((s, idx) => 
          idx === i ? product.artikelName : s
        ));
        setShowAutocomplete(prev => prev.map((s, idx) => 
          idx === i ? false : s
        ));
        // Limpiar resultados de búsqueda para esta línea
        setSearchResults(prev => {
          const newResults = { ...prev };
          delete newResults[i];
          return newResults;
        });
      }
    }
  };

  const validateAllStock = () => {
    const errors = {};
    let hasErrors = false;
    
    const productQuantities = {};
    
    lines.forEach((line, index) => {
      if (line.productId) {
        if (!productQuantities[line.productId]) {
          productQuantities[line.productId] = 0;
        }
        productQuantities[line.productId] += line.quantity;
      }
    });
    
    Object.keys(productQuantities).forEach(productId => {
      const product = products.find(p => p._id === productId);
      if (product) {
        const requiredQuantity = productQuantities[productId];
        
        if (product.stock < requiredQuantity) {
          lines.forEach((line, index) => {
            if (line.productId === productId) {
              errors[index] = t('rechnungForm.items.stock.error')
                .replace('{message}', `${product.artikelName}: ${product.stock} ${t('rechnungForm.items.stock.available')}, ${requiredQuantity} ${t('rechnungForm.items.stock.needed')}`);
              hasErrors = true;
            }
          });
        } else {
          lines.forEach((line, index) => {
            if (line.productId === productId && errors[index]) {
              delete errors[index];
            }
          });
        }
      }
    });
    
    lines.forEach((line, index) => {
      if (!line.productId && errors[index]) {
        delete errors[index];
      }
    });
    
    setStockErrors(errors);
    setHasStockErrors(hasErrors);
    return !hasErrors;
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

  const handleClientInputChange = (e) => {
    const value = e.target.value;
    setClientSearch(value);
    
    if (value !== "") {
      setShowClientAutocomplete(true);
    } else {
      setShowClientAutocomplete(true);
    }
  };

  const handleClientFocus = () => {
    setShowClientAutocomplete(true);
  };

  const subtotal = Number(lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0).toFixed(2));
  
  const TAX_RATE = 0.01;
  const taxAmount = Number((subtotal * 0.01).toFixed(2));
  const total = Number((subtotal + taxAmount).toFixed(2));

  const submit = async () => {
    if (isSubmitting || !isAuthenticated) return;
    
    setIsSubmitting(true);
    
    if (lines.some(l => !l.productId)) {
      alert(t('rechnungForm.items.errors.selectAll'));
      setIsSubmitting(false);
      return;
    }

    if (lines.some(l => l.quantity <= 0)) {
      alert(t('rechnungForm.items.errors.quantityPositive'));
      setIsSubmitting(false);
      return;
    }

    if (lines.some(l => l.unitPrice < 0)) {
      alert(t('rechnungForm.items.errors.priceNegative'));
      setIsSubmitting(false);
      return;
    }

    if (!validateAllStock()) {
      alert(t('rechnungForm.items.errors.stock'));
      setIsSubmitting(false);
      return;
    }

    const groupedItems = {};
    
    lines.forEach(line => {
      if (!line.productId) return;
      
      if (!groupedItems[line.productId]) {
        groupedItems[line.productId] = {
          productId: line.productId,
          quantity: 0,
          unitPrice: line.unitPrice
        };
      }
      
      groupedItems[line.productId].quantity += line.quantity;
    });

    const payload = {
      clientId: clientId || null,
      items: Object.values(groupedItems).map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice)
      })),
      status
    };
    
    // console.log("RechnungCreator: Submitting sale:", payload);

    try {
      const res = await createSale(payload);

      if (res.success && res.sale) {
        // console.log("RechnungCreator: Sale created successfully");
        
        if (typeof BroadcastChannel !== 'undefined') {
          try {
            const channel = new BroadcastChannel('dashboard_updates');
            channel.postMessage({ type: 'new_sale', sale: res.sale });
            setTimeout(() => channel.close(), 100);
          } catch (err) {
            // console.log('BroadcastChannel error:', err);
          }
        }
        
        onDone();
      } else {
        alert(res.message || t('rechnungForm.messages.createError'));
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      alert(t('rechnungForm.messages.createError') + ": " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockInfo = (productId, lineIndex) => {
    if (!productId) return null;
    
    const product = products.find(p => p._id === productId);
    if (!product) return null;
    
    const totalQuantityForProduct = lines.reduce((total, l) => {
      if (l.productId === productId) {
        return total + l.quantity;
      }
      return total;
    }, 0);
    
    const remainingStock = product.stock - totalQuantityForProduct;
    const hasError = stockErrors[lineIndex];
    
    return (
      <div className={styles.stockInfo}>
        <span className={`${styles.stockBadge} ${
          hasError ? styles.outOfStock : 
          remainingStock < 0 ? styles.outOfStock : 
          remainingStock < 10 ? styles.lowStock : 
          styles.inStock
        }`}>
          {t('rechnungForm.items.stock.label')
            .replace('{stock}', product.stock)
            .replace('{needed}', totalQuantityForProduct)
            .replace('{remaining}', remainingStock)}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{t('rechnungForm.creator.title')}</h2>
          <button 
            className={styles.closeBtn} 
            onClick={onDone}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label>{t('rechnungForm.client.label')}</label>
              <div ref={clientAutocompleteRef} className={styles.autocompleteWrapper}>
                <input
                  type="text"
                  placeholder={t('rechnungForm.client.placeholder')}
                  value={clientSearch || getSelectedClientName()}
                  onChange={handleClientInputChange}
                  onFocus={handleClientFocus}
                  disabled={isSubmitting}
                />
                {clientId && (
                  <button 
                    className={styles.clearClientBtn}
                    onClick={clearClientSelection}
                    title={t('rechnungForm.client.clearTitle')}
                    disabled={isSubmitting}
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
                            {c.isRandomClient && <span className={styles.randomBadge}>{t('rechnungForm.client.randomBadge')}</span>}
                          </span>
                          {c.email && <span className={styles.email}>({c.email})</span>}
                        </div>
                      ))
                    ) : (
                      <div className={styles.autocompleteEmpty}>
                        {t('rechnungForm.client.noClients')}
                      </div>
                    )}
                    
                    {!clientSearch && clients.length > 20 && (
                      <div className={styles.autocompleteMore}>
                        {t('rechnungForm.client.moreClients').replace('{count}', clients.length - 20)}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {!clientId && clientSearch === "" && (
                <div className={styles.infoNote}>
                  <span className={styles.infoIcon}>💡</span>
                  {t('rechnungForm.client.info')}
                </div>
              )}
              {showClientAutocomplete && !clientSearch && (
                <div className={styles.clientCount}>
                  {t('rechnungForm.client.clientCount')
                    .replace('{count}', clients.length)
                    .replace('{plural}', clients.length !== 1 ? 's' : '')}
                  {clients.length > 20 && ` ${t('rechnungForm.client.showingFirst').replace('{count}', 20)}`}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
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

          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h3>{t('rechnungForm.items.title').replace('{count}', lines.length)}</h3>
            </div>
            
            <div className={styles.itemsContainer}>
              {lines.map((line, i) => {
                const matches = filteredProducts(i);
                const lineTotal = line.quantity && line.unitPrice ? (line.quantity * line.unitPrice).toFixed(2) : '0.00';
                const stockInfo = getStockInfo(line.productId, i);
                const isSearchingLine = isSearching[i];
                
                return (
                  <div key={i} className={`${styles.itemCard} ${
                    isSubmitting ? styles.rowDisabled : ""
                  } ${stockErrors[i] ? styles.rowError : ""}`}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemNumber}>
                        {t('rechnungForm.items.item').replace('{number}', i + 1)}
                      </span>
                      <button 
                        onClick={() => removeLine(i)}
                        disabled={lines.length <= 1 || isSubmitting}
                        className={styles.removeBtn}
                        title={t('rechnungForm.items.removeTitle')}
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className={styles.itemContent}>
                      <div className={styles.formGroup}>
                        <label>{t('rechnungForm.items.fields.article')}</label>
                        <div className={styles.autocompleteWrapper} ref={el => autocompleteRefs.current[i] = el}>
                          <input
                            type="text"
                            placeholder={t('rechnungForm.items.searchPlaceholder')}
                            value={searches[i]}
                            onChange={e => handleProductSearch(i, e.target.value)}
                            onFocus={() => setShowAutocomplete(prev => prev.map((s, idx) => idx === i ? true : s))}
                            disabled={isSubmitting}
                          />
                          
                          {showAutocomplete[i] && (
                            <>
                              {isSearchingLine && (
                                <div className={styles.autocompleteLoading}>
                                  <div className={styles.spinnerSmall}></div>
                                  <span>{t('rechnungForm.items.searching')}</span>
                                </div>
                              )}
                              
                              {!isSearchingLine && matches.length > 0 && (
                                <div className={styles.autocompleteDropdown}>
                                  {matches.map(p => (
                                    <div 
                                      key={p._id}
                                      className={styles.autocompleteItem}
                                      onClick={() => {
                                        updateLine(i, { 
                                          productId: p._id, 
                                          unitPrice: p.price,
                                          stock: p.stock 
                                        });
                                      }}
                                    >
                                      <div className={styles.productName}>{p.artikelName}</div>
                                      <div className={styles.productDetails}>
                                        <span className={styles.productPrice}>{p.price} {currencySymbol}</span>
                                        <span className={styles.productStock}>
                                          {t('rechnungForm.items.stock.badge.inStock')}: {p.stock}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {!isSearchingLine && searches[i].length >= 2 && matches.length === 0 && !productsLoading && (
                                <div className={styles.autocompleteEmpty}>
                                  {t('rechnungForm.items.noResults').replace('{search}', searches[i])}
                                </div>
                              )}
                              
                              {!isSearchingLine && searches[i].length < 2 && (
                                <div className={styles.autocompleteHint}>
                                  {t('rechnungForm.items.minChars')}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        {stockInfo}
                        
                        {stockErrors[i] && (
                          <div className={styles.stockError}>
                            ⚠️ {stockErrors[i]}
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.itemDetails}>
                        <div className={styles.formGroup}>
                          <label>{t('rechnungForm.items.fields.quantity')}</label>
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '') {
                                updateLine(i, { quantity: '' });
                              } else {
                                const numValue = Number(value);
                                if (numValue >= 1) {
                                  updateLine(i, { quantity: numValue });
                                }
                              }
                            }}
                            onBlur={e => {
                              if (e.target.value === '') {
                                updateLine(i, { quantity: 1 });
                              }
                            }}
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div className={styles.formGroup}>
                          <label>{t('rechnungForm.items.fields.unitPrice')} {currencySymbol}</label> 
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '') {
                                updateLine(i, { unitPrice: '' });
                              } else {
                                const numValue = Number(value);
                                if (numValue >= 0) {
                                  updateLine(i, { unitPrice: numValue });
                                }
                              }
                            }}
                            onBlur={e => {
                              if (e.target.value === '') {
                                updateLine(i, { unitPrice: 0 });
                              }
                            }}
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div className={`${styles.formGroup} ${styles.totalGroup}`}>
                          <label>{t('rechnungForm.items.fields.total')}</label>
                          <div className={styles.totalDisplay}>{lineTotal} {currencySymbol}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              className={styles.addBtn} 
              onClick={addLine}
              disabled={isSubmitting}
            >
              {t('rechnungForm.items.add')}
            </button>
          </div>

          <div className={styles.totalsSection}>
            <div className={styles.totalRow}>
              <span>{t('rechnungForm.totals.subtotal')}</span>
              <span>{subtotal.toFixed(2)} {currencySymbol}</span>
            </div>
            <div className={styles.totalRow}>
              <span>{t('rechnungForm.totals.tax')}</span>
              <span>{taxAmount.toFixed(2)} {currencySymbol} </span>
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>{t('rechnungForm.totals.total')}</span>
              <span>{total.toFixed(2)} {currencySymbol}</span>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
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
            disabled={isSubmitting || hasStockErrors}
          >
            {isSubmitting ? (
              <>
                <div className={`${styles.loadingSpinner} ${styles.small}`}></div>
                {t('rechnungForm.common.saving')}
              </>
            ) : (
              t('rechnungForm.creator.submit')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}