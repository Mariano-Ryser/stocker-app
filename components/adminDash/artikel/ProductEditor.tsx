// ProductEditor.tsx - VERSIÓN CORREGIDA
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthProvider';
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
  const { company, isAuthenticated } = useAuth();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [localProduct, setLocalProduct] = useState<Product>(() => ({
    _id: product._id || '',
    artikelName: product.artikelName || '',
    lagerPlatz: product.lagerPlatz || '',
    artikelNumber: product.artikelNumber || '',
    description: product.description || '',
    stock: product.stock || 0,
    price: product.price || 0,
    imagen: product.imagen || '',
    publicId: product.publicId || ''
  }));
  
const currencySymbol = company?.currency || 'USD';


  const svgRef = useRef(null);
  const [valor, setValor] = useState(localProduct.artikelNumber);

 useEffect(() => {
    if (svgRef.current && valor) {
      JsBarcode(svgRef.current, valor, {
        format: "CODE128",   // también EAN13, UPC, etc.
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
  try {
    // Convertir valores si son string
    const stockValue = typeof localProduct.stock === 'string' 
      ? (localProduct.stock === '' ? 0 : Number(localProduct.stock))
      : localProduct.stock || 0;
    
    const priceValue = typeof localProduct.price === 'string'
      ? (localProduct.price === '' ? 0 : Number(localProduct.price))
      : localProduct.price || 0;

    const productToUpdate = {
      ...localProduct,
      stock: stockValue,
      price: priceValue,
    };
    
    // console.log('ProductEditor: Updating product', productToUpdate);
    
    const result = await onUpdateProduct(productToUpdate);
    
    if (result?.success) {
      // console.log('ProductEditor: Update successful');
      onClose();
    } else {
      // console.log('ProductEditor: Update failed', result?.error);
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const handleDeleteImage = async () => {
    if (!isAuthenticated || !localProduct._id) return;
    
    if (confirm("Möchten Sie das Bild wirklich löschen?")) {
      setIsSubmitting(true);
      try {
        const result = await onDeleteProductImage(localProduct._id);
        if (result?.success) {
          setLocalProduct(prev => ({ 
            ...prev, 
            imagen: "", 
            publicId: "" 
          }));
          setImagePreview(null);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteProduct = async () => {
    if (!isAuthenticated || !localProduct._id) return;
    
    setIsSubmitting(true);
    try {
      const result = await onDeleteProduct(localProduct._id);
      if (result?.success) {
        setShowDeleteConfirm(false);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.modalBackdrop}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Acceso restringido</h2>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
          <div className={styles.modalBody}>
            <p>Debe iniciar sesión para editar productos.</p>
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

  return (
    <>
      <div className={styles.modalBackdrop}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Artikel bearbeiten</h2>
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

            <form onSubmit={handleUpdate} className={styles.formSection}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Artikel Name *</label>
                <input
                  type="text"
                  name="artikelName"
                  placeholder="Artikel Name"
                  value={localProduct.artikelName}
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
                    placeholder="Lagerplatz"
                    value={localProduct.lagerPlatz}
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
                    placeholder="Artikelnummer"
                    value={localProduct.artikelNumber}
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
                    value={localProduct.stock}
                    onChange={handleNumberChange}
                    onBlur={handleNumberBlur}
                    disabled={isSubmitting}
                    min="0"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Preis ({currencySymbol})</label>
                  <input
                    type="number"
                    name="price"
                    value={localProduct.price}
                    onChange={handleNumberChange}
                    onBlur={handleNumberBlur}
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
                  placeholder="Beschreibung"
                  value={localProduct.description}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  rows={3}
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Bild ändern</label>
                <div className={styles.fileUploadSection}>
                  <label className={styles.fileLabel}>
                    <span>📷 Neues Bild auswählen</span>
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
                      🗑️ Bild löschen
                    </button>
                  )}
               {/* Codigo de barras  */}
                <svg ref={svgRef} />

                </div>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  <div className={styles.errorIcon}>⚠️</div>
                  {error}
                </div>
              )}
            </form>
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
                    Speichern...
                  </>
                ) : (
                  "Änderungen speichern"
                )}
              </button>
              
              <button 
                type="button"
                className={`${styles.btn} ${styles.btnDelete}`}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting}
              >
                Artikel löschen
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className={`${styles.modalBackdrop} ${styles.confirmModal}`}>
          <div className={`${styles.modal} ${styles.confirmDialog}`}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalSubtitle}>Artikel löschen</h3>
            </div>
            <div className={`${styles.modalBody} ${styles.confirmBody}`}>
              <p>Sind Sie sicher, dass Sie diesen Artikel löschen möchten?</p>
              <p className={styles.warningText}>Diese Aktion kann nicht rückgängig gemacht werden.</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                type="button"
                className={`${styles.btn} ${styles.btnCancel}`}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
              >
                Abbrechen
              </button>
              <button 
                type="button"
                className={`${styles.btn} ${styles.btnDelete}`}
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
              >
                Löschen bestätigen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductEditor;