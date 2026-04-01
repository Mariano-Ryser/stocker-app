import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './ProductEditor.module.css';
import JsBarcode from "jsbarcode";

interface Product {
  _id: string;
  artikelName?: string;
  lagerPlatz?: string;
  artikelNumber?: string;
  description?: string;
  stock?: number;
  price?: number;
  lowStockThreshold?: number | null;
  imagen?: string | File;
  publicId?: string;
}

interface ProductEditorProps {
  product: Product;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onUpdateProduct: (updatedProduct: Product) => Promise<{ 
    success: boolean; 
    product?: Product; 
    error?: string 
  }>;
  onDeleteProductImage: (id: string) => Promise<{ 
    success: boolean; 
    error?: string 
  }>;
  onDeleteProduct: (id: string) => Promise<{ 
    success: boolean; 
    error?: string 
  }>;
}

export const ProductEditor = ({
  product,
  loading,
  error,
  onClose,
  onUpdateProduct,
  onDeleteProductImage,
  onDeleteProduct
}: ProductEditorProps) => {
  const { t } = useLanguage();
  const { company, isAuthenticated } = useAuth();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localProduct, setLocalProduct] = useState<Product>(() => ({
    _id: product._id || '',
    artikelName: product.artikelName || '',
    lagerPlatz: product.lagerPlatz || '',
    artikelNumber: product.artikelNumber || '',
    description: product.description || '',
    stock: product.stock || 0,
    price: product.price || 0,
    lowStockThreshold: product.lowStockThreshold || null,
    imagen: product.imagen || '',
    publicId: product.publicId || ''
  }));
  
  const currencySymbol = company?.currency || 'USD';
  const globalThreshold = parseInt(localStorage.getItem('lowStockThreshold') || '10');
  const svgRef = useRef<SVGSVGElement>(null);
  const [valor, setValor] = useState(localProduct.artikelNumber);

  // ✅ Cerrar modal con tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting && !showDeleteConfirm) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isSubmitting, showDeleteConfirm, onClose]);

  useEffect(() => {
    if (svgRef.current && valor) {
      JsBarcode(svgRef.current, valor, {
        format: "CODE128",
        lineColor: "#000000",
        width: 2,
        height: 80,
        displayValue: true,
      });
    }
  }, [valor]);

  // Actualizar cuando cambie el producto desde fuera
  useEffect(() => {
    if (product) {
      setLocalProduct({
        _id: product._id || '',
        artikelName: product.artikelName || '',
        lagerPlatz: product.lagerPlatz || '',
        artikelNumber: product.artikelNumber || '',
        description: product.description || '',
        stock: product.stock || 0,
        price: product.price || 0,
        lowStockThreshold: product.lowStockThreshold || null,
        imagen: product.imagen || '',
        publicId: product.publicId || ''
      });
    }
  }, [product]);

  // Actualizar imagePreview cuando cambie la imagen
  useEffect(() => {
    if (localProduct.imagen) {
      if (typeof localProduct.imagen === 'string') {
        setImagePreview(localProduct.imagen);
      } else if (localProduct.imagen instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(localProduct.imagen);
      }
    } else {
      setImagePreview(null);
    }
  }, [localProduct.imagen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setLocalProduct(prev => ({
        ...prev,
        [name]: value === '' ? '' : value
      }));
    } else {
      setLocalProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalProduct(prev => ({
        ...prev,
        imagen: file
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setLocalProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let finalValue = value;
    
    if (value === '' || value === '.') {
      finalValue = "0";
    } else if (value.endsWith('.')) {
      finalValue = value + '00';
    }
    
    if (finalValue !== value) {
      setLocalProduct(prev => ({
        ...prev,
        [name]: finalValue
      }));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !isAuthenticated) return;

    setIsSubmitting(true);
    setLocalError(null);
    
    try {
      // Validación básica
      if (!localProduct.artikelName?.trim()) {
        setLocalError(t('artikel.creator.messages.validation.nameRequired'));
        setIsSubmitting(false);
        return;
      }

      // Convertir valores si son string
      const stockValue = typeof localProduct.stock === 'string' 
        ? (localProduct.stock === '' ? 0 : Number(localProduct.stock))
        : localProduct.stock || 0;
      
      const priceValue = typeof localProduct.price === 'string'
        ? (localProduct.price === '' ? 0 : Number(localProduct.price))
        : localProduct.price || 0;

      const lowStockThresholdValue = typeof localProduct.lowStockThreshold === 'string'
        ? (localProduct.lowStockThreshold === '' ? null : Number(localProduct.lowStockThreshold))
        : localProduct.lowStockThreshold;

      const productToUpdate = {
        ...localProduct,
        stock: stockValue,
        price: priceValue,
        lowStockThreshold: lowStockThresholdValue
      };
      
      console.log('📝 ProductEditor: Actualizando producto', productToUpdate);
      
      const result = await onUpdateProduct(productToUpdate);
      
      console.log('📥 ProductEditor: Resultado de actualización', result);
      
      if (result) {
        if (result.success === true) {
          console.log('✅ ProductEditor: Actualización exitosa');
          
          // ✅ DISPARAR EVENTO DE STOCK ACTUALIZADO
          window.dispatchEvent(new CustomEvent('stockUpdated', { 
            detail: { 
              productId: localProduct._id,
              newStock: stockValue,
              oldStock: localProduct.stock,
              lowStockThreshold: lowStockThresholdValue
            } 
          }));
          
          onClose();
        } else if (result.product) {
          console.log('✅ ProductEditor: Actualización exitosa (formato antiguo)');
          onClose();
        } else {
          console.error('❌ ProductEditor: Error en actualización', result.error);
          setLocalError(result.error || t('artikel.editor.messages.error'));
        }
      } else {
        console.error('❌ ProductEditor: Resultado vacío');
        setLocalError(t('artikel.editor.messages.error'));
      }
    } catch (err) {
      console.error('❌ ProductEditor: Excepción en actualización', err);
      setLocalError(err instanceof Error ? err.message : t('artikel.editor.messages.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!isAuthenticated || !localProduct._id) return;
    
    if (confirm(t('artikel.editor.messages.deleteImageConfirm'))) {
      setIsSubmitting(true);
      setLocalError(null);
      try {
        const result = await onDeleteProductImage(localProduct._id);
        if (result?.success) {
          setLocalProduct(prev => ({ 
            ...prev, 
            imagen: "", 
            publicId: "" 
          }));
          setImagePreview(null);
        } else {
          setLocalError(result?.error || t('artikel.editor.messages.error'));
        }
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : t('artikel.editor.messages.error'));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteProduct = async () => {
    if (!isAuthenticated || !localProduct._id) return;
    
    setIsSubmitting(true);
    setLocalError(null);
    try {
      const result = await onDeleteProduct(localProduct._id);
      if (result?.success) {
        setShowDeleteConfirm(false);
        onClose();
      } else {
        setLocalError(result?.error || t('artikel.editor.messages.error'));
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t('artikel.editor.messages.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.modalBackdrop}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{t('artikel.empty.restricted.title')}</h2>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <div className={styles.modalBody}>
            <p>{t('artikel.empty.restricted.text')}</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>
              {t('artikel.editor.buttons.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayError = localError || error;

  return (
    <>
      <div className={styles.modalBackdrop}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{t('artikel.editor.title')}</h2>
            <button 
              className={styles.closeBtn} 
              onClick={onClose}
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          <div className={styles.modalBody}>
            {imagePreview && (
              <div className={styles.imageSection}>
                <img 
                  src={imagePreview} 
                  alt={localProduct.artikelName} 
                  className={styles.productImage}
                />
              </div>
            )}

            {displayError && (
              <div className={styles.errorMessage}>
                <div className={styles.errorIcon}>⚠️</div>
                {displayError}
              </div>
            )}

            <form onSubmit={handleUpdate} className={styles.formSection}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('artikel.creator.form.artikelName')}
                </label>
                <input
                  type="text"
                  name="artikelName"
                  placeholder={t('artikel.creator.form.artikelNamePlaceholder')}
                  value={localProduct.artikelName}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('artikel.creator.form.lagerPlatz')}
                  </label>
                  <input
                    type="text"
                    name="lagerPlatz"
                    placeholder={t('artikel.creator.form.lagerPlatzPlaceholder')}
                    value={localProduct.lagerPlatz}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('artikel.creator.form.artikelNumber')}
                  </label>
                  <input
                    type="text"
                    name="artikelNumber"
                    placeholder={t('artikel.creator.form.artikelNumberPlaceholder')}
                    value={localProduct.artikelNumber}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('artikel.creator.form.bestand')}
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={localProduct.stock}
                    onChange={handleNumberChange}
                    onBlur={handleNumberBlur}
                    disabled={isSubmitting}
                    min="0"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('artikel.creator.form.price')} ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={localProduct.price}
                    onChange={handleNumberChange}
                    onBlur={handleNumberBlur}
                    disabled={isSubmitting}
                    min="0"
                    step="0.01"
                    placeholder={t('artikel.creator.form.pricePlaceholder')}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('artikel.creator.form.lowStockThreshold')}
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={localProduct.lowStockThreshold === null ? '' : localProduct.lowStockThreshold}
                  onChange={handleNumberChange}
                  onBlur={handleNumberBlur}
                  disabled={isSubmitting}
                  min="0"
                  max="1000"
                  placeholder={t('artikel.creator.form.lowStockThresholdPlaceholder', { threshold: globalThreshold })}
                  className={styles.formInput}
                />
                <small className={styles.helperText}>
                  {t('artikel.creator.form.lowStockThresholdHelper')}
                </small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('artikel.creator.form.description')}
                </label>
                <textarea
                  name="description"
                  placeholder={t('artikel.creator.form.descriptionPlaceholder')}
                  value={localProduct.description}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  rows={3}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('artikel.creator.form.image')}
                </label>
                <div className={styles.fileUploadSection}>
                  <label className={styles.fileLabel}>
                    <span>{t('artikel.creator.form.imageChange')}</span>
                    <input 
                      type="file" 
                      name="imagen" 
                      onChange={handleImageChange}
                      accept="image/*"
                      className={styles.fileInput}
                      disabled={isSubmitting}
                    />
                  </label>
                  
                  {localProduct.imagen && (
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnDeleteImage}`}
                      onClick={handleDeleteImage}
                      disabled={isSubmitting}
                    >
                      {t('artikel.editor.buttons.deleteImage')}
                    </button>
                  )}
                  
                  {localProduct.artikelNumber && (
                    <div className={styles.barcodeSection}>
                      <label className={styles.formLabel}>
                        {t('artikel.editor.barcode')}
                      </label>
                      <svg ref={svgRef} className={styles.barcode} />
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className={styles.modalFooter}>
            <button 
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('artikel.editor.buttons.cancel')}
            </button>
            <div className={styles.actionButtons}>
              <button 
                type="button"
                className={`${styles.btn} ${styles.btnUpdate}`}
                onClick={handleUpdate}
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <div className={`${styles.loadingSpinner} ${styles.spinnerSmall}`}></div>
                    {t('artikel.editor.buttons.saving')}
                  </>
                ) : (
                  t('artikel.editor.buttons.save')
                )}
              </button>
              
              <button 
                type="button"
                className={`${styles.btn} ${styles.btnDelete}`}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting}
              >
                {t('artikel.editor.buttons.delete')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className={`${styles.modalBackdrop} ${styles.confirmModal}`}>
          <div className={`${styles.modal} ${styles.confirmDialog}`}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalSubtitle}>{t('artikel.editor.buttons.deleteConfirm')}</h3>
            </div>
            <div className={`${styles.modalBody} ${styles.confirmBody}`}>
              <p>{t('artikel.editor.messages.deleteConfirm')}</p>
              <p className={styles.warningText}>{t('artikel.editor.messages.deleteWarning')}</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                type="button"
                className={`${styles.btn} ${styles.btnCancel}`}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
              >
                {t('artikel.editor.buttons.cancel')}
              </button>
              <button 
                type="button"
                className={`${styles.btn} ${styles.btnDelete}`}
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
              >
                {t('artikel.editor.buttons.deleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductEditor;