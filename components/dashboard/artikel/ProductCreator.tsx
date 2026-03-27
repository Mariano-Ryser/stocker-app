// ProductCreator.tsx - VERSIÓN CORREGIDA
import { useState, useEffect } from "react";
import { useAuth } from '../../auth/AuthProvider';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useProduct } from '../../../hooks/useProducts';
import ProductLimitBadge from '../limitProduct/ProductLimitBadge';
import styles from './ProductCreator.module.css';

interface ProductCreatorProps {
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onCreateProduct: (productData: {
    artikelName: string;
    lagerPlatz: string;
    artikelNumber: string;
    description: string;
    stock: number | string;
    price: number | string;
    lowStockThreshold?: number | string;
    imagen: File | null;
  }) => Promise<{ success: boolean; product?: any; error?: string; limitError?: boolean; limits?: any }>;
}

export const ProductCreator: React.FC<ProductCreatorProps> = ({
  loading,
  error,
  onClose,
  onCreateProduct
}) => {
  const { t } = useLanguage();
  const { isAuthenticated, company } = useAuth();
  const { productLimits, fetchProductLimits, products } = useProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [limitsLoading, setLimitsLoading] = useState(true); // ✅ NUEVO: estado de carga de límites
  
  useEffect(() => {
    const loadLimits = async () => {
      setLimitsLoading(true);
      await fetchProductLimits();
      setLimitsLoading(false);
    };
    
    loadLimits();
  }, [fetchProductLimits, products?.length]);
  
  const currencySymbol = company?.currency || 'USD';
  const globalThreshold = parseInt(localStorage.getItem('lowStockThreshold') || '10');
  
  const [formData, setFormData] = useState({
    artikelName: "",
    lagerPlatz: "",
    artikelNumber: "",
    description: "",
    stock: "",
    price: "",
    lowStockThreshold: "",
    imagen: null as File | null,
  });

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
              {t('artikel.creator.buttons.cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imagen: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
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
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || !isAuthenticated) return;
    
    if (!formData.artikelName.trim()) {
      setLocalError(t('artikel.creator.messages.validation.nameRequired'));
      return;
    }

    // ✅ Esperar a que los límites estén cargados antes de validar
    if (!limitsLoading && productLimits.remaining <= 0) {
      setLocalError(
        `❌ Límite de artículos alcanzado (${productLimits.current}/${productLimits.max}). ` +
        `Elimina algunos productos o actualiza tu plan para seguir creando.`
      );
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    
    try {
      const productToSend = {
        ...formData,
        stock: formData.stock === '' ? 0 : Number(formData.stock),
        price: formData.price === '' ? 0 : Number(formData.price),
        lowStockThreshold: formData.lowStockThreshold === '' ? null : Number(formData.lowStockThreshold)
      };
      
      console.log('📝 Enviando producto:', productToSend);
      
      const result = await onCreateProduct(productToSend);
      
      console.log('📥 Resultado de creación:', result);
      
      if (result) {
        if (result.success === true) {
          console.log('✅ Producto creado exitosamente:', result.product);
          
          window.dispatchEvent(new CustomEvent('productCreated', { 
            detail: { 
              product: result.product 
            } 
          }));
          
          setFormData({
            artikelName: "",
            lagerPlatz: "",
            artikelNumber: "",
            description: "",
            stock: "",
            price: "",
            lowStockThreshold: "",
            imagen: null,
          });
          setImagePreview(null);
          onClose();
        } 
        else if (result.product) {
          console.log('✅ Producto creado (formato antiguo):', result.product);
          
          window.dispatchEvent(new CustomEvent('productCreated', { 
            detail: { 
              product: result.product 
            } 
          }));
          
          setFormData({
            artikelName: "",
            lagerPlatz: "",
            artikelNumber: "",
            description: "",
            stock: "",
            price: "",
            lowStockThreshold: "",
            imagen: null,
          });
          setImagePreview(null);
          onClose();
        }
        else if (result.limitError) {
          setLocalError(result.error);
        }
        else {
          console.error('❌ Error al crear producto:', result.error || 'Error desconocido');
          setLocalError(result.error || t('artikel.creator.messages.error'));
        }
      } else {
        console.error('❌ Resultado vacío de onCreateProduct');
        setLocalError(t('artikel.creator.messages.error'));
      }
    } catch (err) {
      console.error('❌ Excepción en handleSubmit:', err);
      setLocalError(err instanceof Error ? err.message : t('artikel.creator.messages.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  // ✅ CALCULAR SI EL BOTÓN DEBE ESTAR DESHABILITADO
  // Si los límites están cargando, no deshabilitar por límites (aún no sabemos)
  const isLimitReached = !limitsLoading && productLimits.remaining <= 0;
  
  const isSubmitDisabled = isSubmitting || 
                          !formData.artikelName.trim() || 
                          (isLimitReached); // ✅ Solo deshabilitar si límites cargados Y alcanzados

  // ✅ TEXTO DEL BOTÓN
  const getButtonText = () => {
    if (isSubmitting) {
      return (
        <>
          <div className={`${styles.loadingSpinner} ${styles.spinnerSmall}`}></div>
          {t('artikel.creator.buttons.creating')}
        </>
      );
    }
    
    if (limitsLoading) {
      return t('artikel.creator.buttons.loading'); // "Cargando..."
    }
    
    if (isLimitReached) {
      return t('artikel.creator.buttons.limitReached'); // "Límite alcanzado"
    }
    
    return t('artikel.creator.buttons.create'); // "Crear artículo"
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{t('artikel.creator.title')}</h2>
          <button 
            className={styles.closeBtn} 
            onClick={onClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.modalBody}>
            {!limitsLoading && productLimits.max > 0 && (
              <div className={styles.limitSection}>
                <ProductLimitBadge limits={productLimits} />
              </div>
            )}
            
            {limitsLoading && (
              <div className={styles.limitSection}>
                <div className={styles.loadingLimits}>
                  <div className={styles.spinnerSmall}></div>
                  <span>Cargando límites...</span>
                </div>
              </div>
            )}
            
            {displayError && (
              <div className={`${styles.errorMessage} ${displayError.includes('Límite') ? styles.limitError : ''}`}>
                <div className={styles.errorIcon}>⚠️</div>
                {displayError}
              </div>
            )}

            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('artikel.creator.form.artikelName')}
                </label>
                <input
                  type="text"
                  name="artikelName"
                  value={formData.artikelName}
                  placeholder={t('artikel.creator.form.artikelNamePlaceholder')}
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
                    value={formData.lagerPlatz}
                    placeholder={t('artikel.creator.form.lagerPlatzPlaceholder')}
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
                    value={formData.artikelNumber}
                    placeholder={t('artikel.creator.form.artikelNumberPlaceholder')}
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
                    value={formData.stock}
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
                    value={formData.price}
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
                  value={formData.lowStockThreshold}
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
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder={t('artikel.creator.form.descriptionPlaceholder')}
                  disabled={isSubmitting}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('artikel.creator.form.image')}
                </label>
                <div className={styles.fileUploadSection}>
                  <label className={styles.fileLabel}>
                    <span>{t('artikel.creator.form.imageSelect')}</span>
                    <input
                      type="file"
                      name="imagen"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={styles.fileInput}
                      disabled={isSubmitting}
                    />
                  </label>
                  
                  {imagePreview && (
                    <div className={styles.imagePreview}>
                      <img 
                        src={imagePreview} 
                        alt={t('artikel.creator.form.imagePreview')} 
                        className={styles.previewImage}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button 
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('artikel.creator.buttons.cancel')}
            </button>
            <button 
              className={`${styles.btn} ${styles.btnSave} ${isSubmitDisabled ? styles.disabled : ''}`}
              type="submit"
              disabled={isSubmitDisabled}
            >
              {getButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};