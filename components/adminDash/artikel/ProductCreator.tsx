// ProductCreator.tsx - VERSIÓN CORREGIDA
import { useState, useEffect } from "react";
import { useAuth } from '../../auth/AuthProvider';
import styles from './ProductCreator.module.css';
import { Currency } from "lucide-react";

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
    imagen: File | null;
  }) => Promise<{ success: boolean; product?: any; error?: string }>;
}

export const ProductCreator: React.FC<ProductCreatorProps> = ({
  loading,
  error,
  onClose,
  onCreateProduct
}) => {
  const { isAuthenticated, company} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
const currencySymbol = company?.currency || 'USD';
  // Estado local del formulario
  const [formData, setFormData] = useState({
    artikelName: "",
    lagerPlatz: "",
    artikelNumber: "",
    description: "",
    stock: 0,
    price: 0,
    imagen: null as File | null,
  
  });

  if (!isAuthenticated) {
    return (
      <div className={styles.modalBackdrop}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Acceso restringido</h2>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <div className={styles.modalBody}>
            <p>Debe iniciar sesión para crear productos.</p>
          </div>
          <div className={styles.modalFooter}>
            <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose}>
              Cerrar
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
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "number") {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value === "" ? "" : value
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberBlur = (e: React.FocusEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value;
    
    let finalValue = value;
    
    if (value === '' || value === '.') {
      finalValue = "0";
    } else if (value.endsWith('.')) {
      finalValue = value + '00';
    }
    
    if (finalValue !== value) {
      setFormData(prev => ({ ...prev, [fieldName]: finalValue }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || !isAuthenticated) return;
    
    setIsSubmitting(true);
    try { 
      const result = await onCreateProduct(formData);
      if (result?.success) {
        // Resetear formulario
        setFormData({
          artikelName: "",
          lagerPlatz: "",
          artikelNumber: "",
          description: "",
          stock: 0,
          price: 0,
          imagen: null,
        });
        setImagePreview(null);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Neuer Artikel</h2>
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
            <div className={styles.formSection}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Artikel Name *</label>
                <input
                  type="text"
                  name="artikelName"
                  value={formData.artikelName}
                  placeholder="Artikel Name eingeben"
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Lagerplatz</label>
                  <input
                    type="text"
                    name="lagerPlatz"
                    value={formData.lagerPlatz}
                    placeholder="A-12"
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Artikelnummer</label>
                  <input
                    type="text"
                    name="artikelNumber"
                    value={formData.artikelNumber}
                    placeholder="345-AB"
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bestand</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleNumberChange}
                    onBlur={(e) => handleNumberBlur(e, 'stock')}
                    disabled={isSubmitting}
                    min="0"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Preis {currencySymbol}</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleNumberChange}
                    onBlur={(e) => handleNumberBlur(e, 'price')}
                    disabled={isSubmitting}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Beschreibung</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Produktbeschreibung..."
                  disabled={isSubmitting}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Bild</label>
                <div className={styles.fileUploadSection}>
                  <label className={styles.fileLabel}>
                    <span>📷 Bild auswählen</span>
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
                        alt="Vorschau" 
                        className={styles.previewImage}
                      />
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  <div className={styles.errorIcon}>⚠️</div>
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button 
              type="button"
              className={`${styles.btn} ${styles.btnCancel}`}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Abbrechen
            </button>
            <button 
              className={`${styles.btn} ${styles.btnSave}`}
              type="submit"
              disabled={isSubmitting || !formData.artikelName.trim() || loading}
            >
              {isSubmitting ? (
                <>
                  <div className={`${styles.loadingSpinner} ${styles.spinnerSmall}`}></div>
                  Erstellen...
                </>
              ) : (
                "Artikel Erstellen"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};