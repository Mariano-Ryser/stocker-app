import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useClients } from "../../../hooks/useClients";
import { useProduct } from "../../../hooks/useProducts";
import styles from './Creator.module.css';

export default function RechnungCreator({ onDone, salesApi }) {
  if (!salesApi) {
    console.error("RechnungCreator renderizado sin salesApi");
    return null;
  } 
 
  const { createSale } = salesApi;

  const { isAuthenticated } = useAuth();
  const { clients } = useClients();
  const { products, fetchProducts } = useProduct();
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

  const autocompleteRefs = useRef([]);
  const clientAutocompleteRef = useRef(null);

  // Cargar productos solo una vez al montar
  useEffect(() => {
    if (isAuthenticated && products.length === 0) {
      console.log("RechnungCreator: Fetching products on mount");
      fetchProducts();
    }
  }, [isAuthenticated]);

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
            <h2>Acceso restringido</h2>
            <button className={styles.closeBtn} onClick={onDone}>×</button>
          </div>
          <div className={styles.modalBody}>
            <p>Debe iniciar sesión para crear facturas.</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onDone}>Cerrar</button>
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
    if (!query) return [];
    return clients.filter(c =>
      c.name?.toLowerCase().includes(query) ||
      c.vorname?.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query))
    ).slice(0, 8);
  };

  const filteredProducts = (index) => {
    const query = searches[index]?.toLowerCase() || "";
    if (!query) return [];
    return products.filter(p => 
      p.artikelName?.toLowerCase().includes(query)
    ).slice(0, 8);
  };

  const addLine = () => {
    setLines(prev => [...prev, { productId: "", quantity: 1, unitPrice: 0, stock: 0 }]);
    setSearches(prev => [...prev, ""]);
    setShowAutocomplete(prev => [...prev, false]);
    autocompleteRefs.current.push(null);
  };

  const removeLine = (i) => {
    if (lines.length <= 1) {
      alert("Mindestens ein Artikel ist erforderlich");
      return;
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
              errors[index] = `Nicht genug Lagerbestand für ${product.artikelName}: ${product.stock} verfügbar, ${requiredQuantity} benötigt`;
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
    if (!clientId) return ""; // ← CAMBIO IMPORTANTE: devolver vacío en lugar de "ClienteRandom"
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
    
    // Si el usuario borra todo el texto, usar ClienteRandom
    if (value === "") {
      setClientId(""); // Esto activará ClienteRandom en el backend
    } else {
      setShowClientAutocomplete(true);
    }
  };

  const subtotal = Number(lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0).toFixed(2));
  
  const TAX_RATE = 0.01;
  const taxAmount = Number((subtotal * 0.01).toFixed(2));
  const total = Number((subtotal + taxAmount).toFixed(2));

  const submit = async () => {
    if (isSubmitting || !isAuthenticated) return;
    
    setIsSubmitting(true);
    
    if (lines.some(l => !l.productId)) {
      alert("Bitte wählen Sie alle Artikel aus");
      setIsSubmitting(false);
      return;
    }

    if (lines.some(l => l.quantity <= 0)) {
      alert("Die Menge muss größer als 0 sein");
      setIsSubmitting(false);
      return;
    }

    if (lines.some(l => l.unitPrice < 0)) {
      alert("Der Preis darf nicht negativ sein");
      setIsSubmitting(false);
      return;
    }

    if (!validateAllStock()) {
      alert("Bitte korrigieren Sie die Lagerbestandsfehler");
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
    console.log("RechnungCreator: Submitting sale:", payload);
    console.log("ClientId enviado:", clientId, "¿Usará ClienteRandom?:", !clientId);

    try {
      const res = await createSale(payload);

      if (res.success && res.sale) {
        console.log("RechnungCreator: Sale created successfully");
        console.log("Cliente asignado:", res.sale.client);
        
        // Enviar notificación para Dashboard
        if (typeof BroadcastChannel !== 'undefined') {
          try {
            const channel = new BroadcastChannel('dashboard_updates');
            channel.postMessage({ type: 'new_sale', sale: res.sale });
            setTimeout(() => channel.close(), 100);
          } catch (err) {
            console.log('BroadcastChannel error:', err);
          }
        }
        
        onDone();
      } else {
        alert(res.message || "Fehler beim Erstellen der Rechnung");
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      alert("Fehler beim Erstellen der Rechnung: " + error.message);
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
          Lager: {product.stock} | Benötigt: {totalQuantityForProduct} | Verbleibend: {remainingStock}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Neue Rechnung</h2>
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
              <label>Kunde</label>
              <div ref={clientAutocompleteRef} className={styles.autocompleteWrapper}>
                <input
                  type="text"
                  placeholder="Random Kunden..."
                  value={clientSearch || getSelectedClientName()}
                  onChange={handleClientInputChange}
                  onFocus={() => setShowClientAutocomplete(true)}
                  disabled={isSubmitting}
                />
                {clientId && (
                  <button 
                    className={styles.clearClientBtn}
                    onClick={clearClientSelection}
                    title="Limpiar selección (usar ClienteRandom)"
                    disabled={isSubmitting}
                  >
                    ✕
                  </button>
                )}
                {showClientAutocomplete && (
                  <div className={styles.autocompleteDropdown}>
                    {/* Opción especial para usar ClienteRandom */}
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
                        Random Kunde
                      </span>
                      <span className={styles.clientNote}> </span>
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
                        <span className={styles.clientName}>
                          {c.vorname} {c.name}
                          {c.isRandomClient && <span className={styles.randomBadge}>🎯</span>}
                        </span>
                        {c.email && <span className={styles.email}>({c.email})</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {!clientId && clientSearch === "" && (
                <div className={styles.infoNote}>
                  <span className={styles.infoIcon}>💡</span>
                  Esta venta se asignará al cliente "ClienteRandom" único de la empresa
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="paid">Bezahlt</option>
                <option value="pending">Ausstehend</option>
                <option value="cancelled">Storniert</option>
              </select>
            </div>
          </div>

          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h3>Artikel ({lines.length})</h3>
            </div>
            
            <div className={styles.itemsContainer}>
              {lines.map((line, i) => {
                const matches = filteredProducts(i);
                const lineTotal = line.quantity && line.unitPrice ? (line.quantity * line.unitPrice).toFixed(2) : '0.00';
                const stockInfo = getStockInfo(line.productId, i);
                
                return (
                  <div key={i} className={`${styles.itemCard} ${
                    isSubmitting ? styles.rowDisabled : ""
                  } ${stockErrors[i] ? styles.rowError : ""}`}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemNumber}>Artikel {i + 1}</span>
                      <button 
                        onClick={() => removeLine(i)}
                        disabled={lines.length <= 1 || isSubmitting}
                        className={styles.removeBtn}
                        title="Artikel entfernen"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className={styles.itemContent}>
                      <div className={styles.formGroup}>
                        <label>Artikel</label>
                        <div className={styles.autocompleteWrapper} ref={el => autocompleteRefs.current[i] = el}>
                          <input
                            type="text"
                            placeholder="Artikel suchen..."
                            value={searches[i]}
                            onChange={e => {
                              const val = e.target.value;
                              setSearches(prev => prev.map((s, idx) => idx === i ? val : s));
                              updateLine(i, { productId: "" });
                              setShowAutocomplete(prev => prev.map((s, idx) => idx === i ? true : s));
                            }}
                            onFocus={() => setShowAutocomplete(prev => prev.map((s, idx) => idx === i ? true : s))}
                            disabled={isSubmitting}
                          />
                          {showAutocomplete[i] && matches.length > 0 && (
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
                                    <span className={styles.productPrice}>({p.price} CHF)</span>
                                    <span className={styles.productStock}>Lager: {p.stock}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
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
                          <label>Menge</label>
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
                          <label>Einzelpreis (CHF)</label>
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
                          <label>Gesamt (CHF)</label>
                          <div className={styles.totalDisplay}>{lineTotal} CHF</div>
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
              + Artikel hinzufügen
            </button>
          </div>

          <div className={styles.totalsSection}>
            <div className={styles.totalRow}>
              <span>Zwischensumme:</span>
              <span>{subtotal.toFixed(2)} CHF</span>
            </div>
            <div className={styles.totalRow}>
              <span>1% MwSt.:</span>
              <span>{taxAmount.toFixed(2)} CHF</span>
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Gesamtsumme:</span>
              <span>{total.toFixed(2)} CHF</span>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button 
            className={`${styles.btn} ${styles.btnCancel}`} 
            onClick={onDone}
            disabled={isSubmitting}
          >
            Abbrechen
          </button>
          <button 
            className={`${styles.btn} ${styles.btnSave}`} 
            onClick={submit} 
            disabled={isSubmitting || hasStockErrors}
          >
            {isSubmitting ? (
              <>
                <div className={`${styles.loadingSpinner} ${styles.small}`}></div>
                Speichern...
              </>
            ) : (
              "Rechnung Erstellen"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}