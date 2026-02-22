// frontend/components/adminDash/settings/EditCompanyComponent.js
import { useState, useEffect } from 'react';
import { useUsers } from '../../../hooks/useUsers';
import { useCompany } from '../../../hooks/useCompany';
import styles from './EditCompany.module.css';

export default function EditCompanyComponent({ user, company, updateCompany: updateCompanyContext }) {
  const { uploadCompanyLogo, deleteCompanyLogo } = useUsers();
  const { updateCompanyData, loading: companyLoading, error: companyError } = useCompany();
  
  const [companyForm, setCompanyForm] = useState({
    name: company?.name || '',
    email: company?.email || '',
    phone: company?.phone || '',
    currency: company?.currency || 'EUR',
    timezone: company?.timezone || 'Europe/Berlin',
    // Campos de dirección separados
    street: company?.address?.street || '',
    number: company?.address?.number || '',
    complement: company?.address?.complement || '',
    postalCode: company?.address?.postalCode || '',
    city: company?.address?.city || '',
    state: company?.address?.state || '',
    country: company?.address?.country || '',
  });

  // Estados para el logo
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(company?.logo || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        currency: company.currency || 'EUR',
        timezone: company.timezone || 'Europe/Berlin',
        street: company.address?.street || '',
        number: company.address?.number || '',
        complement: company.address?.complement || '',
        postalCode: company.address?.postalCode || '',
        city: company.address?.city || '',
        state: company.address?.state || '',
        country: company.address?.country || '',
      });
      setLogoPreview(company.logo || '');
    }
  }, [company]);

  const validateCompanyForm = () => {
    const newErrors = {};
    
    if (!companyForm.name.trim()) newErrors.companyName = 'Firmenname ist erforderlich';
    if (companyForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyForm.email)) {
      newErrors.companyEmail = 'Ungültige E-Mail-Adresse';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    
    if (!validateCompanyForm()) return;
    
    try {
      setErrors({});
      setSuccessMessage('');
      
      // Construimos el objeto con la estructura correcta para el backend
      const dataToSend = {
        name: companyForm.name,
        email: companyForm.email,
        phone: companyForm.phone,
        currency: companyForm.currency,
        timezone: companyForm.timezone,
        // Enviamos la dirección como un objeto anidado
        address: {
          street: companyForm.street,
          number: companyForm.number,
          complement: companyForm.complement,
          postalCode: companyForm.postalCode,
          city: companyForm.city,
          state: companyForm.state,
          country: companyForm.country,
        }
      };
      
      const result = await updateCompanyData(dataToSend);
      
      if (result.success) {
        setSuccessMessage('✓ Unternehmensdaten erfolgreich aktualisiert');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setErrors({ company: companyError || 'Fehler beim Aktualisieren der Unternehmensdaten' });
      }
    } catch (error) {
      console.error('Error in handleUpdateCompany:', error);
      setErrors({ company: error.message });
    }
  };

  // Funciones para el manejo del logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, logo: 'Nur Bilddateien sind erlaubt (jpeg, jpg, png, gif, webp)' });
        return;
      }
      
      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, logo: 'Bild darf nicht größer als 5MB sein' });
        return;
      }
      
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrors({ ...errors, logo: '' });
    }
  };

  const handleUploadLogo = async () => {
    if (!user || (!user.id && !user._id)) {
      setErrors({ ...errors, logo: 'Benutzer nicht geladen. Bitte neu anmelden.' });
      return;
    }

    if (!logoFile) {
      setErrors({ ...errors, logo: 'Bitte wählen Sie ein Logo aus' });
      return;
    }

    try {
      setIsUploadingLogo(true);
      setErrors({ ...errors, logo: '' });
      
      const userId = user.id || user._id;
      const result = await uploadCompanyLogo(userId, logoFile, company, updateCompanyContext);

      if (result.success) {
        setSuccessMessage('✓ Logo erfolgreich hochgeladen');
        setShowSuccess(true);
        setLogoFile(null);
        
        // Limpiar el input file
        const fileInput = document.getElementById('logoInput');
        if (fileInput) fileInput.value = '';
        
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setErrors({ ...errors, logo: result.error || 'Fehler beim Hochladen' });
      }
    } catch (error) {
      setErrors({ ...errors, logo: error.message });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('Sind Sie sicher, dass Sie das Logo entfernen möchten?')) return;

    try {
      const result = await deleteCompanyLogo(user.companyId);

      if (result.success) {
        setSuccessMessage('✓ Logo erfolgreich entfernt');
        setShowSuccess(true);
        setLogoPreview('');
        setLogoFile(null);
        
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setErrors({ ...errors, logo: result.error || 'Fehler beim Entfernen' });
      }
    } catch (error) {
      setErrors({ ...errors, logo: error.message });
    }
  };

  // Función para formatear dirección completa (útil para mostrar en facturas)
  const getFormattedAddress = () => {
    const parts = [];
    if (companyForm.street) parts.push(companyForm.street);
    if (companyForm.number) parts.push(companyForm.number);
    if (companyForm.complement) parts.push(companyForm.complement);
    
    const streetLine = parts.join(' ');
    
    const cityLine = [];
    if (companyForm.postalCode) cityLine.push(companyForm.postalCode);
    if (companyForm.city) cityLine.push(companyForm.city);
    if (companyForm.state) cityLine.push(companyForm.state);
    
    return {
      streetLine,
      cityLine: cityLine.join(' '),
      country: companyForm.country,
      full: [streetLine, cityLine.join(' '), companyForm.country].filter(Boolean).join(', ')
    };
  };

  return (
    <div className={styles.companyContainer}>
      {/* Success Message Banner */}
      {showSuccess && (
        <div className={styles.successBanner}>
          <div className={styles.successBannerContent}>
            <svg className={styles.successIcon} width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.29 16.29L5.7 12.7C5.31 12.31 5.31 11.68 5.7 11.29C6.09 10.9 6.72 10.9 7.11 11.29L10 14.17L16.88 7.29C17.27 6.9 17.9 6.9 18.29 7.29C18.68 7.68 18.68 8.31 18.29 8.7L10.7 16.29C10.31 16.68 9.68 16.68 9.29 16.29Z" fill="white"/>
            </svg>
            <span className={styles.successText}>{successMessage}</span>
            <button 
              className={styles.closeSuccessBtn}
              onClick={() => setShowSuccess(false)}
              aria-label="Schließen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Logo de Empresa */}
      <div className={styles.logoSection}>
        <h4 className={styles.logoTitle}>Unternehmenslogo</h4>
        
        <div className={styles.logoContainer}>
          {logoPreview ? (
            <div className={styles.logoPreview}>
              <img 
                src={logoPreview} 
                alt="Unternehmenslogo" 
                className={styles.logoImage}
              />
              <div className={styles.logoActions}>
                <button
                  type="button"
                  className={styles.btnDanger}
                  onClick={handleDeleteLogo}
                  disabled={isUploadingLogo}
                >
                  Logo entfernen
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.logoPlaceholder}>
              <svg className={styles.logoIcon} width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" fill="currentColor"/>
              </svg>
              <p className={styles.logoPlaceholderText}>Kein Logo hochgeladen</p>
            </div>
          )}
          
          <div className={styles.logoUpload}>
            <label htmlFor="logoInput" className={styles.uploadLabel}>
              <input
                type="file"
                id="logoInput"
                accept="image/*"
                onChange={handleLogoChange}
                className={styles.fileInput}
                disabled={isUploadingLogo}
              />
              <span className={styles.uploadBtn}>
                <svg className={styles.uploadIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
                Logo auswählen
              </span>
            </label>
            
            {logoFile && (
              <div className={styles.selectedFile}>
                <span className={styles.fileName}>{logoFile.name}</span>
                <button
                  type="button"
                  className={styles.submitBtn}
                  onClick={handleUploadLogo}
                  disabled={isUploadingLogo}
                >
                  {isUploadingLogo ? (
                    <>
                      <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"/>
                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                      </svg>
                      Wird hochgeladen...
                    </>
                  ) : (
                    'Logo hochladen'
                  )}
                </button>
              </div> 
            )}
            
            {errors.logo && (
              <div className={styles.fieldError}>{errors.logo}</div>
            )}
            
            <p className={styles.uploadHelp}>
              Empfohlene Größe: 300×300px. Maximal 5MB. Unterstützte Formate: JPG, PNG, GIF, WebP.
            </p>
          </div>
        </div>
      </div> 

      {/* Unternehmensdaten Form */}
      <div className={styles.companyFormSection}>
        <h4 className={styles.companyFormTitle}>Unternehmensdaten</h4>
        
        {errors.company && (
          <div className={styles.formError}>
            <svg className={styles.errorIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
            </svg>
            {errors.company}
          </div>
        )}
        
        <form onSubmit={handleUpdateCompany} className={styles.companyForm}>
          {/* Datos básicos de la empresa */}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="companyName" className={styles.formLabel}>
                Firmenname *
              </label>
              <input
                type="text"
                id="companyName"
                value={companyForm.name}
                onChange={e => setCompanyForm({...companyForm, name: e.target.value})}
                className={`${styles.formInput} ${errors.companyName ? styles.inputError : ''}`}
                placeholder="Ihre Firma GmbH"
                disabled={companyLoading}
              />
              {errors.companyName && <div className={styles.fieldError}>{errors.companyName}</div>}
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="companyEmail" className={styles.formLabel}>
                E-Mail
              </label>
              <input
                type="email"
                id="companyEmail"
                value={companyForm.email}
                onChange={e => setCompanyForm({...companyForm, email: e.target.value})}
                className={`${styles.formInput} ${errors.companyEmail ? styles.inputError : ''}`}
                placeholder="info@firma.de"
                disabled={companyLoading}
              />
              {errors.companyEmail && <div className={styles.fieldError}>{errors.companyEmail}</div>}
            </div>
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="companyPhone" className={styles.formLabel}>
                Telefon
              </label>
              <input
                type="text"
                id="companyPhone"
                value={companyForm.phone}
                onChange={e => setCompanyForm({...companyForm, phone: e.target.value})}
                className={styles.formInput}
                placeholder="+49 123 456789"
                disabled={companyLoading}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="companyCurrency" className={styles.formLabel}>
                Währung
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="companyCurrency"
                  value={companyForm.currency}
                  onChange={e => setCompanyForm({...companyForm, currency: e.target.value})}
                  className={styles.formInput}
                  disabled={companyLoading}
                >
                  <option value="EUR">€ Euro</option>
                  <option value="CHF">CHF Schweizer Franken</option>
                  <option value="USD">$ US Dollar</option>
                  <option value="GBP">£ Britisches Pfund</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="companyTimezone" className={styles.formLabel}>
                Zeitzone
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="companyTimezone"
                  value={companyForm.timezone}
                  onChange={e => setCompanyForm({...companyForm, timezone: e.target.value})}
                  className={styles.formInput}
                  disabled={companyLoading}
                >
                  <option value="Europe/Berlin">Berlin (GMT+1)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                  <option value="Europe/Paris">Paris (GMT+1)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sección de dirección expandida */}
          <div className={styles.addressSection}>
            <h5 className={styles.addressSectionTitle}>Adresse</h5>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="street" className={styles.formLabel}>
                  Straße
                </label>
                <input
                  type="text"
                  id="street"
                  value={companyForm.street}
                  onChange={e => setCompanyForm({...companyForm, street: e.target.value})}
                  className={styles.formInput}
                  placeholder="Musterstraße"
                  disabled={companyLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="number" className={styles.formLabel}>
                  Hausnummer
                </label>
                <input
                  type="text"
                  id="number"
                  value={companyForm.number}
                  onChange={e => setCompanyForm({...companyForm, number: e.target.value})}
                  className={styles.formInput}
                  placeholder="123"
                  disabled={companyLoading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="complement" className={styles.formLabel}>
                Adresszusatz (optional)
              </label>
              <input
                type="text"
                id="complement"
                value={companyForm.complement}
                onChange={e => setCompanyForm({...companyForm, complement: e.target.value})}
                className={styles.formInput}
                placeholder="3. Stock, Gebäude B, etc."
                disabled={companyLoading}
              />
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="postalCode" className={styles.formLabel}>
                  Postleitzahl
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={companyForm.postalCode}
                  onChange={e => setCompanyForm({...companyForm, postalCode: e.target.value})}
                  className={styles.formInput}
                  placeholder="12345"
                  disabled={companyLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="city" className={styles.formLabel}>
                  Stadt
                </label>
                <input
                  type="text"
                  id="city"
                  value={companyForm.city}
                  onChange={e => setCompanyForm({...companyForm, city: e.target.value})}
                  className={styles.formInput}
                  placeholder="Berlin"
                  disabled={companyLoading}
                />
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="state" className={styles.formLabel}>
                  Bundesland (optional)
                </label>
                <input
                  type="text"
                  id="state"
                  value={companyForm.state}
                  onChange={e => setCompanyForm({...companyForm, state: e.target.value})}
                  className={styles.formInput}
                  placeholder="Berlin"
                  disabled={companyLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="country" className={styles.formLabel}>
                  Land
                </label>
                <input
                  type="text"
                  id="country"
                  value={companyForm.country}
                  onChange={e => setCompanyForm({...companyForm, country: e.target.value})}
                  className={styles.formInput}
                  placeholder="Deutschland"
                  disabled={companyLoading}
                />
              </div>
            </div>

            {/* Preview de cómo se verá la dirección formateada */}
            {Object.values(getFormattedAddress()).some(v => v) && (
              <div className={styles.addressPreview}>
                <span className={styles.addressPreviewLabel}>Adressvorschau:</span>
                <p className={styles.addressPreviewText}>{getFormattedAddress().full}</p>
              </div>
            )}
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={companyLoading}
            >
              {companyLoading ? (
                <>
                  <svg className={styles.spinner} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                  Wird gespeichert...
                </>
              ) : (
                'Unternehmensdaten speichern'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}