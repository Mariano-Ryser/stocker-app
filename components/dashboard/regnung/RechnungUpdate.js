// frontend/components/dashboard/regnung/RechnungUpdate.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useSales } from "../../../hooks/useSales";
import { useClients } from "../../../hooks/useClients";
import { useProduct } from "../../../hooks/useProducts";
import { useLanguage } from "../../../contexts/LanguageContext";
import { COUNTRY_CONFIG } from '../../../utils/countryConfig';
import styles from './Update.module.css';

export default function RechnungUpdate({ sale, onClose, onSaved }) {
  const { t } = useLanguage();
  const { company, isAuthenticated } = useAuth();
  const { updateSale } = useSales();
  const { clients } = useClients();
  const { products, refreshProducts } = useProduct();
  const [editableSale, setEditableSale] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockErrors, setStockErrors] = useState({});
  const [originalItems, setOriginalItems] = useState([]);
  const [hasStockErrors, setHasStockErrors] = useState(false);
  
  // 🔥 Obtener configuración del país de facturación (de la empresa) - IGUAL QUE INVOICECLASSIC
  const countryCode = company?.invoiceSettings?.country || 'DE';
  const countryConfig = COUNTRY_CONFIG[countryCode] || COUNTRY_CONFIG.DE;
  
  // 🔥 Obtener el nombre del impuesto según el país - IGUAL QUE INVOICECLASSIC
  const taxName = countryConfig.taxName || 'MwSt';
  
  // 🔥 Obtener taxRate de la venta (solo lectura)
  const taxRate = sale?.taxRate || company?.invoiceSettings?.taxRate || 19;
  
  // 🔥 Función para formatear moneda (igual que en InvoiceClassic)
  const formatCurrency = (value) => {
    return value?.toFixed(2) || '0.00';
  };

  const currencySymbol = company?.currency || 'USD';

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
      
      refreshProducts();
    }
  }, [sale]);
useEffect(() => {
  const handleEscape = (event) => {
    if (event.key === 'Escape' && !isSubmitting) { // Cambia 'isSubmitting' por tu estado de carga
      onClose(); // Cambia 'onClose' por la función que cierra tu modal
    }
  };
  
  window.addEventListener('keydown', handleEscape);
  
  return () => {
    window.removeEventListener('keydown', handleEscape);
  };
}, [isSubmitting, onClose]);

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
          errors[lineIndex] = t('rechnungForm.items.stock.error')
            .replace('{message}', `${product.stock} ${t('rechnungForm.items.stock.available')}, +${netChange} ${t('rechnungForm.items.stock.needed')}`);
          hasErrors = true;
        });
      } else if (currentTotal > product.stock + originalTotal) {
        currentProductTotals[productId].lines.forEach(lineIndex => {
          errors[lineIndex] = t('rechnungForm.items.stock.error')
            .replace('{message}', `${product.stock} ${t('rechnungForm.items.stock.available')}, ${currentTotal} ${t('rechnungForm.items.stock.needed')} (${originalTotal} original)`);
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
      alert(t('rechnungForm.items.errors.minOneItem'));
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
          {t('rechnungForm.items.stock.label')
            .replace('{stock}', product.stock)
            .replace('{needed}', currentTotal)
            .replace('{remaining}', product.stock - currentTotal)}
          {netChange !== 0 && ` (${netChange >= 0 ? '+' : ''}${netChange})`}
          {quantityInOtherLines > 0 && ` | ${t('rechnungForm.items.stock.otherLines').replace('{count}', quantityInOtherLines)}`}
        </span>
      </div>
    );
  };

  const handleSave = async () => {
    if (isSubmitting || !editableSale) return;
    
    setIsSubmitting(true);

    try {
      if (!editableSale.client?._id && !editableSale.clientSnapshot?._id) {
        alert(t('rechnungForm.client.selectRequired'));
        setIsSubmitting(false);
        return;
      }

      if (editableSale.items.some(i => !i.productId)) {
        alert(t('rechnungForm.items.errors.selectAll'));
        setIsSubmitting(false);
        return;
      }

      if (editableSale.items.some(i => i.quantity <= 0)) {
        alert(t('rechnungForm.items.errors.quantityPositive'));
        setIsSubmitting(false);
        return;
      }

      if (editableSale.items.some(i => i.unitPrice < 0)) {
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
        taxRate: Number(taxRate) // Enviar taxRate existente (no editable)
      };
      
      const res = await updateSale(editableSale._id, payload);
      if (res.success) {
        if (onSaved) onSaved();
      } else {
        alert(t('rechnungForm.messages.updateError') + ": " + (res.message || t('rechnungForm.common.error')));
      }
    } catch (err) {
      console.error("Error updating sale:", err);
      alert(t('rechnungForm.messages.updateError') + ": " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.modalBackdrop}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2>{t('rechnungForm.restricted.title')}</h2>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
          <div className={styles.modalBody}>
            <p>{t('rechnungForm.restricted.message')}</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>
              {t('rechnungForm.restricted.close')}
            </button>
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
          <p>{t('rechnungForm.editor.loadingData')}</p>
        </div>
      </div>
    );
  }

  const subtotal = editableSale.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const discount = editableSale.discount || 0;
  const taxableAmount = subtotal - discount;
  const taxAmount = Number((taxableAmount * (taxRate / 100)).toFixed(2));
  const total = Number((taxableAmount + taxAmount).toFixed(2));

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>{t('rechnungForm.editor.title')}</h2>
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
              <label>{t('rechnungForm.client.label')}</label>
              <select
                value={editableSale.client?._id || editableSale.clientSnapshot?._id || ""}
                onChange={e => {
                  const c = clients.find(cl => cl._id === e.target.value);
                  setEditableSale(prev => ({ ...prev, client: c }));
                }}
                disabled={isSubmitting}
              >
                {/* <option value="">-- {t('rechnungForm.client.select')} --</option> */}
                {clients.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.vorname ? `(${c.vorname})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>{t('rechnungForm.status.label')}</label>
              <select
                value={editableSale.status}
                onChange={e => setEditableSale(prev => ({ ...prev, status: e.target.value }))}
                disabled={isSubmitting}
              >
                <option value="paid">{t('rechnungForm.status.paid')}</option>
                <option value="pending">{t('rechnungForm.status.pending')}</option>
                <option value="cancelled">{t('rechnungForm.status.cancelled')}</option>
              </select>
            </div>
          </div>

          {/* Artikel Table */}
          <div className={styles.tableSection}>
            <h3>{t('rechnungForm.items.title').replace('{count}', editableSale.items.length)}</h3>
            
            <div className={styles.tableContainer}>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>{t('rechnungForm.items.fields.article')}</th>
                    <th>{t('rechnungForm.items.fields.quantity')}</th>
                    <th>{t('rechnungForm.items.fields.unitPrice')} {currencySymbol}</th>
                    <th>{t('rechnungForm.items.fields.total')}{currencySymbol}</th>
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
                            <option value="">-- {t('rechnungForm.items.searchPlaceholder')} --</option> 
                            {products.map(p => (
                              <option key={p._id} value={p._id}>
                                {p.artikelName} ({t('rechnungForm.items.stock.badge.inStock')}: {p.stock})
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
                          {formatCurrency(item.quantity * item.unitPrice)} {currencySymbol}
                        </td>
                        <td className={styles.actionsColumn}>
                          <button 
                            onClick={() => removeLine(idx)}
                            disabled={editableSale.items.length <= 1 || isSubmitting}
                            className={styles.removeBtn}
                            title={t('rechnungForm.items.removeTitle')}
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
              {t('rechnungForm.items.add')}
            </button>
          </div>

          {/* 🔥 SECCIÓN DE TOTALES - IGUAL QUE INVOICECLASSIC */}
          <div className={styles.totalsSection}>
            <div className={styles.totalRow}>
              <span>{t('rechnungForm.totals.subtotal')}</span>
              <span>{formatCurrency(subtotal)} {currencySymbol}</span>
            </div>
            
            {discount > 0 && (
              <div className={styles.totalRow}>
                <span>{t('rechnungForm.totals.discount')}</span>
                <span>-{formatCurrency(discount)} {currencySymbol}</span>
              </div>
            )}
            
            <div className={styles.totalRow}>
              <span>{taxName} {taxRate.toFixed(1)}%</span>
              <span>{formatCurrency(taxAmount)} {currencySymbol}</span>
            </div>
            
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>{t('rechnungForm.totals.total')}</span>
              <span>{formatCurrency(total)} {currencySymbol}</span>
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
            {t('rechnungForm.common.cancel')}
          </button>
          <button 
            className={`${styles.btn} ${styles.btnSave}`} 
            onClick={handleSave} 
            disabled={isSubmitting || hasStockErrors}
          >
            {isSubmitting ? (
              <>
                <div className={`${styles.loadingSpinner} ${styles.small}`}></div>
                {t('rechnungForm.common.saving')}
              </>
            ) : (
              t('rechnungForm.editor.submit')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}