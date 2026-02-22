import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useSales } from "../../../hooks/useSales";
import { useClients } from "../../../hooks/useClients";
import { useProduct } from "../../../hooks/useProducts";
import styles from './Update.module.css';

export default function RechnungUpdate({ sale, onClose, onSaved }) {
  const { isAuthenticated } = useAuth();
  const { updateSale } = useSales();
  const { clients } = useClients();
  const { products, fetchProducts } = useProduct();
  const [editableSale, setEditableSale] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockErrors, setStockErrors] = useState({});
  const [originalItems, setOriginalItems] = useState([]);
  const [hasStockErrors, setHasStockErrors] = useState(false);

  useEffect(() => {
    if (sale) {
      const mappedItems = sale.items.map(i => ({
        productId: i.product?._id || i.product,
        artikelName: i.artikelName || i.product?.artikelName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        originalQuantity: i.quantity
      }));
      
      setEditableSale({
        ...sale,
        items: mappedItems
      });
      
      setOriginalItems(mappedItems);
      fetchProducts();
    }
  }, [sale]);

  // Validar stock cada vez que cambian los items
  useEffect(() => {
    if (editableSale && products.length > 0) {
      validateAllStock();
    }
  }, [editableSale?.items, products]);

  // Validar stock de todos los productos
  const validateAllStock = () => {
    if (!editableSale || !products.length) {
      setHasStockErrors(false);
      return true;
    }
    
    const errors = {};
    let hasErrors = false;
    
    const currentProductTotals = {};
    editableSale.items.forEach((item, index) => {
      if (item.productId) {
        if (!currentProductTotals[item.productId]) {
          currentProductTotals[item.productId] = {
            total: 0,
            lines: []
          };
        }
        currentProductTotals[item.productId].total += item.quantity;
        currentProductTotals[item.productId].lines.push(index);
      }
    });
    
    Object.keys(currentProductTotals).forEach(productId => {
      const product = products.find(p => p._id === productId);
      if (!product) return;
      
      const currentTotal = currentProductTotals[productId].total;
      const originalItemsForProduct = originalItems.filter(item => item.productId === productId);
      const originalTotal = originalItemsForProduct.reduce((sum, item) => sum + item.originalQuantity, 0);
      const netChange = currentTotal - originalTotal;
      
      if (netChange > 0 && product.stock < netChange) {
        currentProductTotals[productId].lines.forEach(lineIndex => {
          errors[lineIndex] = `Nicht genug Lagerbestand: ${product.stock} verfügbar, benötigt +${netChange} mehr`;
          hasErrors = true;
        });
      } else if (currentTotal > product.stock + originalTotal) {
        currentProductTotals[productId].lines.forEach(lineIndex => {
          errors[lineIndex] = `Nicht genug Lagerbestand: ${product.stock} verfügbar, benötigt ${currentTotal} (${originalTotal} original)`;
          hasErrors = true;
        });
      } else {
        currentProductTotals[productId].lines.forEach(lineIndex => {
          if (errors[lineIndex]) {
            delete errors[lineIndex];
          }
        });
      }
    });
    
    const currentProductIds = editableSale.items.map(item => item.productId).filter(id => id);
    const originalProductIds = originalItems.map(item => item.productId).filter(id => id);
    
    editableSale.items.forEach((item, index) => {
      if (!item.productId && errors[index]) {
        delete errors[index];
      }
    });
    
    setStockErrors(errors);
    setHasStockErrors(hasErrors);
    return !hasErrors;
  };

  const addLine = () => {
    setEditableSale(prev => ({
      ...prev,
      items: [...prev.items, { 
        productId: "", 
        artikelName: "", 
        quantity: 1, 
        unitPrice: 0,
        originalQuantity: 0
      }]
    }));
  };

  const removeLine = idx => {
    if (!editableSale || editableSale.items.length <= 1) {
      alert("Mindestens ein Artikel ist erforderlich");
      return;
    }
    
    setEditableSale(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
    
    setStockErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[idx];
      return newErrors;
    });
  };

  const updateLine = (idx, changes) => {
    setEditableSale(prev => ({
      ...prev,
      items: prev.items.map((item, i) => (i === idx ? { ...item, ...changes } : item))
    }));
  };

  const getStockInfo = (productId, lineIndex) => {
    if (!productId || !editableSale) return null;
    
    const product = products.find(p => p._id === productId);
    if (!product) return null;
    
    const currentTotal = editableSale.items.reduce((total, item) => {
      if (item.productId === productId) {
        return total + item.quantity;
      }
      return total;
    }, 0);
    
    const currentLine = editableSale.items[lineIndex];
    const currentLineQuantity = currentLine ? currentLine.quantity : 0;
    
    const originalItemsForProduct = originalItems.filter(item => item.productId === productId);
    const originalTotal = originalItemsForProduct.reduce((sum, item) => sum + item.originalQuantity, 0);
    
    const netChange = currentTotal - originalTotal;
    const hasError = stockErrors[lineIndex];
    const quantityInOtherLines = currentTotal - currentLineQuantity;
    
    return (
      <div className={styles.stockInfo}>
        <span className={`${styles.stockBadge} ${
          hasError ? styles.outOfStock : 
          currentTotal > product.stock ? styles.outOfStock : 
          product.stock - currentTotal < 10 ? styles.lowStock : 
          styles.inStock
        }`}>
          Lager: {product.stock} | In Rechnung: {currentTotal} ({netChange >= 0 ? '+' : ''}{netChange})
          {quantityInOtherLines > 0 && ` | Andere Zeilen: ${quantityInOtherLines}`}
        </span>
      </div>
    );
  };

  const handleSave = async () => {
    if (isSubmitting || !editableSale) return;
    
    setIsSubmitting(true);

    try {
      if (!editableSale.client?._id && !editableSale.clientSnapshot?._id) {
        alert("Bitte wählen Sie einen Kunden aus");
        setIsSubmitting(false);
        return;
      }

      if (editableSale.items.some(i => !i.productId)) {
        alert("Bitte wählen Sie alle Artikel aus");
        setIsSubmitting(false);
        return;
      }

      if (editableSale.items.some(i => i.quantity <= 0)) {
        alert("Die Menge muss größer als 0 sein");
        setIsSubmitting(false);
        return;
      }

      if (editableSale.items.some(i => i.unitPrice < 0)) {
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
      
      editableSale.items.forEach(item => {
        if (!item.productId) return;
        
        if (!groupedItems[item.productId]) {
          groupedItems[item.productId] = {
            productId: item.productId,
            quantity: 0,
            unitPrice: item.unitPrice
          };
        }
        
        groupedItems[item.productId].quantity += item.quantity;
      });

      const payload = {
        clientId: editableSale.client?._id || editableSale.clientSnapshot?._id,
        status: editableSale.status,
        items: Object.values(groupedItems).map(item => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
        tax: 10
      };
      
      console.log("Updating sale with payload:", payload);
      
      const res = await updateSale(editableSale._id, payload);
      if (res.success) {
        if (onSaved) onSaved();
      } else {
        alert("Fehler beim Speichern: " + (res.message || "Unbekannter Fehler"));
      }
    } catch (err) {
      console.error("Error updating sale:", err);
      alert("Fehler beim Speichern: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.modalBackdrop}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2>Acceso restringido</h2>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
          <div className={styles.modalBody}>
            <p>Debe iniciar sesión para editar facturas.</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    );
  }

  if (!editableSale) {
    return (
      <div className={styles.modalBackdrop}>
        <div className={`${styles.modal} ${styles.loadingModal}`}>
          <div className={styles.loadingSpinner}></div>
          <p>Lade Rechnungsdaten...</p>
        </div>
      </div>
    );
  }

  const subtotal = editableSale.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const taxAmount = Number((subtotal * 0.10).toFixed(2));
  const total = Number((subtotal + taxAmount).toFixed(2));

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>Rechnung bearbeiten</h2>
          <button 
            className={styles.closeBtn} 
            onClick={onClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Kunde & Status */}
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label>Kunde</label>
              <select
                value={editableSale.client?._id || editableSale.clientSnapshot?._id || ""}
                onChange={e => {
                  const c = clients.find(cl => cl._id === e.target.value);
                  setEditableSale(prev => ({ ...prev, client: c }));
                }}
                disabled={isSubmitting}
              >
                <option value="">-- Kunde auswählen --</option>
                {clients.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.vorname ? `(${c.vorname})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                value={editableSale.status}
                onChange={e => setEditableSale(prev => ({ ...prev, status: e.target.value }))}
                disabled={isSubmitting}
              >
                <option value="paid">Bezahlt</option>
                <option value="pending">Ausstehend</option>
                <option value="cancelled">Storniert</option>
              </select>
            </div>
          </div>

          {/* Artikel Table */}
          <div className={styles.tableSection}>
            <h3>Artikel ({editableSale.items.length})</h3>
            
            <div className={styles.tableContainer}>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Artikel</th>
                    <th>Menge</th>
                    <th>Einzelpreis (CHF)</th>
                    <th>Gesamt (CHF)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {editableSale.items.map((item, idx) => {
                    const stockInfo = getStockInfo(item.productId, idx);
                    const hasError = stockErrors[idx];
                    
                    return (
                      <tr key={idx} className={`${isSubmitting ? styles.rowDisabled : ""} ${hasError ? styles.rowError : ""}`}>
                        <td>
                          <select
                            value={item.productId || ""}
                            onChange={e => {
                              const p = products.find(pr => pr._id === e.target.value);
                              updateLine(idx, {
                                productId: p?._id || "",
                                artikelName: p?.artikelName || "",
                                unitPrice: p?.price || 0
                              });
                            }}
                            disabled={isSubmitting}
                            className={hasError ? styles.inputError : ""}
                          >
                            <option value="">-- Artikel auswählen --</option>
                            {products.map(p => (
                              <option key={p._id} value={p._id}>
                                {p.artikelName} (Lager: {p.stock})
                              </option>
                            ))}
                          </select>
                          {stockInfo}
                          {hasError && (
                            <div className={styles.stockError}>
                              ⚠️ {hasError}
                            </div>
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => {
                              const value = e.target.value;
                              if (value === '') {
                                updateLine(idx, { quantity: '' });
                              } else {
                                const numValue = Number(value);
                                if (numValue >= 1) {
                                  updateLine(idx, { quantity: numValue });
                                }
                              }
                            }}
                            onBlur={e => {
                              if (e.target.value === '' || e.target.value < 1) {
                                updateLine(idx, { quantity: 1 });
                              }
                            }}
                            disabled={isSubmitting}
                            className={hasError ? styles.inputError : ""}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={e => {
                              const value = Number(e.target.value);
                              if (value >= 0) {
                                updateLine(idx, { unitPrice: value });
                              }
                            }}
                            disabled={isSubmitting}
                          />
                        </td>
                        <td className={styles.totalColumn}>
                          {(item.quantity * item.unitPrice).toFixed(2)} CHF
                        </td>
                        <td className={styles.actionsColumn}>
                          <button 
                            onClick={() => removeLine(idx)}
                            disabled={editableSale.items.length <= 1 || isSubmitting}
                            className={styles.removeBtn}
                            title="Artikel entfernen"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button 
              className={styles.addBtn} 
              onClick={addLine}
              disabled={isSubmitting}
            >
              + Artikel hinzufügen
            </button>
          </div>

          {/* Totals */}
          <div className={styles.totalsSection}>
            <div className={styles.totalRow}>
              <span>Zwischensumme:</span>
              <span>{subtotal.toFixed(2)} CHF</span>
            </div>
            <div className={styles.totalRow}>
              <span>10% MwSt.:</span>
              <span>{taxAmount.toFixed(2)} CHF</span>
            </div>
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Gesamtsumme:</span>
              <span>{total.toFixed(2)} CHF</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <button 
            className={`${styles.btn} ${styles.btnCancel}`} 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Abbrechen
          </button>
          <button 
            className={`${styles.btn} ${styles.btnSave}`} 
            onClick={handleSave} 
            disabled={isSubmitting || hasStockErrors}
          >
            {isSubmitting ? (
              <>
                <div className={`${styles.loadingSpinner} ${styles.small}`}></div>
                Speichern...
              </>
            ) : (
              "Änderungen speichern"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}