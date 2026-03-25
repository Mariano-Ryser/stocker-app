// frontend/components/dashboard/settings/EditCompanyComponent.js
import { useState, useEffect, useRef } from 'react';
import { useUsers } from '../../../hooks/useUsers';
import { useCompany } from '../../../hooks/useCompany';
import { useLanguage } from '../../../contexts/LanguageContext';
import { COUNTRY_CONFIG } from '../../../utils/countryConfig';
import styles from './EditCompany.module.css';

// Opciones de monedas
const CURRENCY_OPTIONS = [
  { value: 'EUR', label: 'settings.currencies.EUR' },
  { value: 'CHF', label: 'settings.currencies.CHF' },
  { value: 'USD', label: 'settings.currencies.USD' },
  { value: 'ARS', label: 'settings.currencies.ARS' },
];

// Opciones de zonas horarias
const TIMEZONE_OPTIONS = [
  { value: 'Europe/Zurich', label: 'settings.timezones.Europe/Zurich' },
  { value: 'Europe/Berlin', label: 'settings.timezones.Europe/Berlin' },
  { value: 'Europe/Madrid', label: 'settings.timezones.Europe/Madrid' },
  { value: 'Europe/London', label: 'settings.timezones.Europe/London' },
  { value: 'America/Argentina/Buenos_Aires', label: 'settings.timezones.America/Argentina/Buenos_Aires' },
];

// 🔥 MAPA DE PAÍSES A MONEDAS POR DEFECTO
const COUNTRY_TO_CURRENCY = {
  'DE': 'EUR',
  'ES': 'EUR',
  'FR': 'EUR',
  'IT': 'EUR',
  'AT': 'EUR',
  'CH': 'CHF',      // Suiza -> CHF
  'US': 'USD',
  'AR': 'ARS',
  'BR': 'BRL',
  'UK': 'GBP',
  'GB': 'GBP',
};

// 🔥 MAPA DE PAÍSES A ZONAS HORARIAS POR DEFECTO
const COUNTRY_TO_TIMEZONE = {
  'DE': 'Europe/Berlin',
  'ES': 'Europe/Madrid',
  'FR': 'Europe/Paris',
  'IT': 'Europe/Rome',
  'AT': 'Europe/Vienna',
  'CH': 'Europe/Zurich',
  'US': 'America/New_York',
  'AR': 'America/Argentina/Buenos_Aires',
  'BR': 'America/Sao_Paulo',
  'UK': 'Europe/London',
  'GB': 'Europe/London',
};

export default function EditCompanyComponent({ user, company, updateCompany: updateCompanyContext }) {
  const { t } = useLanguage();
  const { uploadCompanyLogo, deleteCompanyLogo } = useUsers();
  const { updateCompanyData, loading: companyLoading, error: companyError } = useCompany();
  
  // Opciones de países
  const COUNTRY_OPTIONS = Object.entries(COUNTRY_CONFIG).map(([code, config]) => ({
    value: code,
    label: t(`settings.countries.${code}`) || config.name
  }));
  
  // Estado inicial basado en company
  const getInitialFormState = () => ({
    // Datos básicos
    name: company?.name || '',
    legalName: company?.legalName || '',
    email: company?.email || '',
    phone: company?.phone || '',
    website: company?.website || '',
    currency: company?.currency || 'EUR',
    timezone: company?.timezone || 'Europe/Berlin',
    
    // Configuración de país e IVA
    invoiceCountry: company?.invoiceSettings?.country || 'DE',
    taxRate: company?.invoiceSettings?.taxRate || 19,
    
    // Dirección - campos comunes
    street: company?.address?.street || '',
    number: company?.address?.number || '',
    complement: company?.address?.complement || '',
    floor: company?.address?.floor || '',
    apartment: company?.address?.apartment || '',
    postalCode: company?.address?.postalCode || '',
    city: company?.address?.city || '',
    province: company?.address?.province || '',
    state: company?.address?.state || '',
    country: company?.address?.country || '',
    
    // Información fiscal
    taxId: company?.taxInfo?.taxId || '',
    nif: company?.taxInfo?.nif || '',
    cuit: company?.taxInfo?.cuit || '',
    ingresosBrutos: company?.taxInfo?.ingresosBrutos || '',
    condicionIva: company?.taxInfo?.condicionIva || '',
    steuernummer: company?.taxInfo?.steuernummer || '',
    ustId: company?.taxInfo?.ustId || '',
    uid: company?.taxInfo?.uid || '',
    vatNumber: company?.taxInfo?.vatNumber || '',
    companyRegister: company?.taxInfo?.companyRegister || '',
    
    // Datos bancarios
    bankName: company?.bankDetails?.bankName || '',
    iban: company?.bankDetails?.iban || '',
    bic: company?.bankDetails?.bic || '',
    accountHolder: company?.bankDetails?.accountHolder || '',
    bankCurrency: company?.bankDetails?.currency || '',
    cbu: company?.bankDetails?.cbu || '',
    alias: company?.bankDetails?.alias || '',
  });
 
  // Estados principales
  const [companyForm, setCompanyForm] = useState(getInitialFormState());
  const [originalForm, setOriginalForm] = useState(getInitialFormState());
  const [countryConfig, setCountryConfig] = useState(COUNTRY_CONFIG[companyForm.invoiceCountry] || COUNTRY_CONFIG.DE);
  
  // Estados para el logo
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(company?.logo || '');
  const [originalLogo, setOriginalLogo] = useState(company?.logo || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Estados para UI
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const successTimeoutRef = useRef(null);

  // 🔥 FUNCIÓN MEJORADA: Actualizar configuración cuando cambia el país
  useEffect(() => {
    const newConfig = COUNTRY_CONFIG[companyForm.invoiceCountry] || COUNTRY_CONFIG.DE;
    setCountryConfig(newConfig);
    
    // Actualizar taxRate al valor por defecto del país
    // Actualizar currency según el país
    // Actualizar timezone según el país
    setCompanyForm(prev => {
      const updates = {
        taxRate: newConfig.taxRate
      };
      
      // 🔥 Actualizar moneda según el país
      const defaultCurrency = COUNTRY_TO_CURRENCY[companyForm.invoiceCountry];
      if (defaultCurrency) {
        updates.currency = defaultCurrency;
      }
      
      // 🔥 Actualizar zona horaria según el país
      const defaultTimezone = COUNTRY_TO_TIMEZONE[companyForm.invoiceCountry];
      if (defaultTimezone) {
        updates.timezone = defaultTimezone;
      }
      
      console.log(`🌍 País cambiado a ${companyForm.invoiceCountry}:`, {
        taxRate: updates.taxRate,
        currency: updates.currency,
        timezone: updates.timezone
      });
      
      return { ...prev, ...updates };
    });
  }, [companyForm.invoiceCountry]);

  // Actualizar cuando cambia company
  useEffect(() => {
    if (company) {
      const newFormState = getInitialFormState();
      setCompanyForm(newFormState);
      setOriginalForm(newFormState);
      setLogoPreview(company.logo || '');
      setOriginalLogo(company.logo || '');
    }
  }, [company]);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  // Función para formatear IBAN
  const formatIBAN = (value) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const groups = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      groups.push(cleaned.substr(i, 4));
    }
    return groups.join(' ');
  };

  const handleIBANChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatIBAN(rawValue);
    setCompanyForm({...companyForm, iban: formattedValue});
  };

  // Formatear CUIT argentino
  const formatCUIT = (value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 10) return `${cleaned.slice(0,2)}-${cleaned.slice(2)}`;
    return `${cleaned.slice(0,2)}-${cleaned.slice(2,10)}-${cleaned.slice(10,11)}`;
  };

  // Formatear alias CBU
  const formatAlias = (value) => {
    return value.toUpperCase().replace(/[^A-Za-z0-9.]/g, '');
  };

  // Formatear CBU
  const formatCBU = (value) => {
    return value.replace(/[^0-9]/g, '');
  };

  // Verificar si hay cambios
  const hasChanges = () => {
    return JSON.stringify(companyForm) !== JSON.stringify(originalForm);
  };

  const showSuccessMessage = (message) => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    
    setSuccessMessage(message);
    setShowSuccess(true);
    
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccess(false);
      successTimeoutRef.current = null;
    }, 3000);
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    console.log('🔥 FORM SUBMITTED!');
    
    try {
      setErrors({});
      
      // Construir objeto address según país
      const address = {
        street: companyForm.street,
        number: companyForm.number,
        complement: companyForm.complement,
        floor: companyForm.floor,
        apartment: companyForm.apartment,
        postalCode: companyForm.postalCode,
        city: companyForm.city,
        country: companyForm.country
      };
      
      // Añadir campos específicos según país
      if (companyForm.invoiceCountry === 'ES') {
        address.province = companyForm.province;
      } else {
        address.state = companyForm.state;
      }
      
      // Construir objeto taxInfo según país
      const taxInfo = {
        taxId: companyForm.taxId,
        vatNumber: companyForm.vatNumber
      };
      
      if (companyForm.invoiceCountry === 'ES') {
        taxInfo.nif = companyForm.nif;
      } else if (companyForm.invoiceCountry === 'AR') {
        taxInfo.cuit = companyForm.cuit;
        taxInfo.ingresosBrutos = companyForm.ingresosBrutos;
        taxInfo.condicionIva = companyForm.condicionIva;
      } else if (companyForm.invoiceCountry === 'DE') {
        taxInfo.steuernummer = companyForm.steuernummer;
        taxInfo.ustId = companyForm.ustId;
        taxInfo.companyRegister = companyForm.companyRegister;
      } else if (companyForm.invoiceCountry === 'CH') {
        taxInfo.uid = companyForm.uid;
        taxInfo.vatNumber = companyForm.vatNumber;
        taxInfo.companyRegister = companyForm.companyRegister;
      }
      
      // Construir bankDetails
      const bankDetails = {
        bankName: companyForm.bankName,
        accountHolder: companyForm.accountHolder,
        currency: companyForm.bankCurrency
      };
      
      if (companyForm.invoiceCountry === 'AR') {
        if (companyForm.cbu) bankDetails.cbu = companyForm.cbu.replace(/\s/g, '');
        if (companyForm.alias) bankDetails.alias = companyForm.alias;
      } else {
        if (companyForm.iban) bankDetails.iban = companyForm.iban.replace(/\s/g, '').toUpperCase();
        if (companyForm.bic) bankDetails.bic = companyForm.bic.toUpperCase();
      }
      
      const dataToSend = {
        name: companyForm.name,
        legalName: companyForm.legalName,
        email: companyForm.email,
        phone: companyForm.phone,
        website: companyForm.website,
        currency: companyForm.currency,
        timezone: companyForm.timezone,
        
        invoiceSettings: {
          country: companyForm.invoiceCountry,
          taxRate: Number(companyForm.taxRate)
        },
        
        address,
        taxInfo,
        bankDetails
      };
      
      console.log('📤 Enviando datos:', JSON.stringify(dataToSend, null, 2));
      
      const result = await updateCompanyData(dataToSend);
      console.log('📥 Resultado:', result);
      
      if (result.success) {
        setOriginalForm(companyForm);
        showSuccessMessage(t('settings.company.messages.dataUpdated'));
      } else {
        setErrors({ company: result.error || 'Error al guardar' });
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
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) {
      setErrors({ logo: t('settings.company.logo.noFileSelected') });
      return;
    }

    setIsUploadingLogo(true);
    setErrors({});

    try {
      const companyId = company?._id || company?.id;
      
      if (!companyId) {
        throw new Error('No se encontró el ID de la compañía');
      }

      const result = await uploadCompanyLogo(companyId, logoFile, company, updateCompanyContext);
      
      if (result.success || result.ok) {
        setLogoFile(null);
        setOriginalLogo(logoPreview);
        showSuccessMessage(t('settings.company.messages.logoUploaded'));
      } else {
        setErrors({ logo: result.error || t('settings.company.logo.uploadError') });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setErrors({ logo: error.message || t('settings.company.logo.uploadError') });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDeleteLogo = async () => {
    setIsUploadingLogo(true);
    setErrors({});

    try {
      const companyId = company?._id || company?.id;
      
      if (!companyId) {
        throw new Error('No se encontró el ID de la compañía');
      }

      const result = await deleteCompanyLogo(companyId);
      
      if (result.success || result.ok) {
        setLogoPreview('');
        setOriginalLogo('');
        setLogoFile(null);
        setShowDeleteConfirm(false);
        showSuccessMessage(t('settings.company.messages.logoRemoved'));
      } else {
        setErrors({ logo: result.error || t('settings.company.logo.deleteError') });
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      setErrors({ logo: error.message || t('settings.company.logo.deleteError') });
      setShowDeleteConfirm(false);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Renderizar campos de dirección según país
  const renderAddressFields = () => {
    const fields = [];
    
    fields.push(
      <div key="street" className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="street" className={styles.formLabel}>
            {t('settings.company.data.address.street')}
          </label>
          <input
            type="text"
            id="street"
            value={companyForm.street}
            onChange={e => setCompanyForm({...companyForm, street: e.target.value})}
            className={styles.formInput}
            placeholder={t('settings.company.data.address.streetPlaceholder')}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="number" className={styles.formLabel}>
            {t('settings.company.data.address.number')}
          </label>
          <input
            type="text"
            id="number"
            value={companyForm.number}
            onChange={e => setCompanyForm({...companyForm, number: e.target.value})}
            className={styles.formInput}
            placeholder={t('settings.company.data.address.numberPlaceholder')}
          />
        </div>
      </div>
    );
    
    fields.push(
      <div key="postalCode" className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="postalCode" className={styles.formLabel}>
            {t('settings.company.data.address.zipCode')}
          </label>
          <input
            type="text"
            id="postalCode"
            value={companyForm.postalCode}
            onChange={e => setCompanyForm({...companyForm, postalCode: e.target.value})}
            className={styles.formInput}
            placeholder={t('settings.company.data.address.zipCodePlaceholder')}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="city" className={styles.formLabel}>
            {t('settings.company.data.address.city')}
          </label>
          <input
            type="text"
            id="city"
            value={companyForm.city}
            onChange={e => setCompanyForm({...companyForm, city: e.target.value})}
            className={styles.formInput}
            placeholder={t('settings.company.data.address.cityPlaceholder')}
          />
        </div>
      </div>
    );
    
    fields.push(
      <div key="state" className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="state" className={styles.formLabel}>
            {t('settings.company.data.address.state')}
          </label>
          <input
            type="text"
            id="state"
            value={companyForm.state}
            onChange={e => setCompanyForm({...companyForm, state: e.target.value})}
            className={styles.formInput}
            placeholder={t('settings.company.data.address.statePlaceholder')}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="country" className={styles.formLabel}>
            {t('settings.company.data.address.country')}
          </label>
          <input
            type="text"
            id="country"
            value={companyForm.country}
            onChange={e => setCompanyForm({...companyForm, country: e.target.value})}
            className={styles.formInput}
            placeholder={t('settings.company.data.address.countryPlaceholder')}
          />
        </div>
      </div>
    );
    
    return fields;
  };

  // Renderizar campos fiscales según país
  const renderTaxFields = () => {
    const fields = [];
    
    fields.push(
      <div key="taxId" className={styles.formGroup}>
        <label htmlFor="taxId" className={styles.formLabel}>
          Tax ID
        </label>
        <input
          type="text"
          id="taxId"
          value={companyForm.taxId}
          onChange={e => setCompanyForm({...companyForm, taxId: e.target.value})}
          className={styles.formInput}
        />
      </div>
    );
    
    // Campos específicos para Suiza
    if (companyForm.invoiceCountry === 'CH') {
      fields.push(
        <div key="uid" className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="uid" className={styles.formLabel}>
              UID (Unternehmens-Identifikationsnummer)
            </label>
            <input
              type="text"
              id="uid"
              value={companyForm.uid}
              onChange={e => setCompanyForm({...companyForm, uid: e.target.value})}
              className={styles.formInput}
              placeholder="CHE-123.456.789"
            />
            <p className={styles.helpText}>
              (UID)
            </p>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="companyRegister" className={styles.formLabel}>
              
            </label>
            <input
              type="text"
              id="companyRegister"
              value={companyForm.companyRegister}
              onChange={e => setCompanyForm({...companyForm, companyRegister: e.target.value})}
              className={styles.formInput}
              placeholder="CH-123.456.789"
            />
          </div>
        </div>
      );
    }
    
    return fields;
  };

  // Renderizar campos bancarios según país
  const renderBankFields = () => {
    const fields = [];
    
    fields.push(
      <div key="bankName" className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="bankName" className={styles.formLabel}>
            {t('settings.company.data.bank.bankName')}
          </label>
          <input
            type="text"
            id="bankName"
            value={companyForm.bankName}
            onChange={e => setCompanyForm({...companyForm, bankName: e.target.value})}
            className={styles.formInput}
            placeholder={t('settings.company.data.bank.bankNamePlaceholder')}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="accountHolder" className={styles.formLabel}>
            {t('settings.company.data.bank.accountHolder')}
          </label>
          <input
            type="text"
            id="accountHolder"
            value={companyForm.accountHolder}
            onChange={e => setCompanyForm({...companyForm, accountHolder: e.target.value})}
            className={styles.formInput}
            placeholder={t('settings.company.data.bank.accountHolderPlaceholder')}
          />
        </div>
      </div>
    );
    
    if (companyForm.invoiceCountry === 'AR') {
      fields.push(
        <div key="cbu" className={styles.formGroup}>
          <label htmlFor="cbu" className={styles.formLabel}>
            CBU
          </label>
          <input
            type="text"
            id="cbu"
            value={companyForm.cbu}
            onChange={e => setCompanyForm({...companyForm, cbu: formatCBU(e.target.value)})}
            className={styles.formInput}
            placeholder="00000000000000000000"
            maxLength="22"
          />
        </div>
      );
      
      fields.push(
        <div key="alias" className={styles.formGroup}>
          <label htmlFor="alias" className={styles.formLabel}>
            Alias CBU
          </label>
          <input
            type="text"
            id="alias"
            value={companyForm.alias}
            onChange={e => setCompanyForm({...companyForm, alias: formatAlias(e.target.value)})}
            className={styles.formInput}
            placeholder="PALABRA.PALABRA.PALABRA"
          />
        </div>
      );
    } else {
      fields.push(
        <div key="iban" className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="iban" className={styles.formLabel}>
              IBAN
            </label>
            <input
              type="text"
              id="iban"
              value={companyForm.iban}
              onChange={handleIBANChange}
              className={styles.formInput}
              placeholder={t('settings.company.data.bank.ibanPlaceholder')}
              maxLength="42"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="bic" className={styles.formLabel}>
              BIC/SWIFT
            </label>
            <input
              type="text"
              id="bic"
              value={companyForm.bic}
              onChange={e => setCompanyForm({...companyForm, bic: e.target.value.toUpperCase()})}
              className={styles.formInput}
              placeholder={t('settings.company.data.bank.bicPlaceholder')}
              maxLength="11"
            />
          </div>
        </div>
      );
    }
    
    fields.push(
      <div key="bankCurrency" className={styles.formGroup}>
        <label htmlFor="bankCurrency" className={styles.formLabel}>
          {t('settings.company.data.bank.currency')}
        </label>
        <div className={styles.selectWrapper}>
          <select
            id="bankCurrency"
            value={companyForm.bankCurrency}
            onChange={e => setCompanyForm({...companyForm, bankCurrency: e.target.value})}
            className={styles.formInput}
          >
            <option value="">{t('settings.company.data.bank.selectCurrency')}</option>
            {CURRENCY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
    
    return fields;
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
        <h4 className={styles.logoTitle}>{t('settings.company.logo.title')}</h4>
        
        <div className={styles.logoContainer}>
          {logoPreview ? (
            <div className={styles.logoPreview}>
              <img 
                src={logoPreview} 
                alt={t('settings.company.logo.title')} 
                className={styles.logoImage}
              />
              <div className={styles.logoActions}>
                <button
                  type="button"
                  className={styles.btnDanger}
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isUploadingLogo}
                >
                  {t('settings.company.logo.remove')}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.logoPlaceholder}>
              <svg className={styles.logoIcon} width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" fill="currentColor"/>
              </svg>
              <p className={styles.logoPlaceholderText}>{t('settings.company.logo.noLogo')}</p>
            </div>
          )}
          
          {/* Modal de confirmación para eliminar logo */}
          {showDeleteConfirm && (
            <div className={styles.confirmModal}>
              <div className={styles.confirmModalContent}>
                <p>{t('settings.company.logo.confirmDelete')}</p>
                <div className={styles.confirmActions}>
                  <button 
                    className={styles.confirmCancel}
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    {t('common.cancel')}
                  </button>
                  <button 
                    className={styles.confirmDelete}
                    onClick={handleDeleteLogo}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
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
                {t('settings.company.logo.select')}
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
                      {t('settings.company.logo.uploading')}
                    </>
                  ) : (
                    t('settings.company.logo.upload')
                  )}
                </button>
              </div> 
            )}
            
            {errors.logo && (
              <div className={styles.fieldError}>{errors.logo}</div>
            )}
            
            <p className={styles.uploadHelp}>
              {t('settings.company.logo.help')}
            </p>
          </div>
        </div>
      </div> 

      {/* Formulario principal */}
      <div className={styles.companyFormSection}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.companyFormTitle}>{t('settings.company.data.title')}</h4>
          {hasChanges() && !companyLoading && (
            <span className={styles.unsavedBadge}>{t('settings.company.data.unsaved')}</span>
          )}
        </div>
        
        {errors.company && (
          <div className={styles.formError}>
            <svg className={styles.errorIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
            </svg>
            {errors.company}
          </div>
        )}
        
        <form onSubmit={handleUpdateCompany} className={styles.companyForm}>
          {/* País selector */}
          <div className={styles.formGroup}>
            <label htmlFor="invoiceCountry" className={styles.formLabel}>
              {t('settings.company.data.countryLabel')} *
            </label> 
            <div className={styles.selectWrapper}>
              <select
                id="invoiceCountry"
                value={companyForm.invoiceCountry}
                onChange={e => setCompanyForm({...companyForm, invoiceCountry: e.target.value})}
                className={styles.formInput}
                disabled={companyLoading}
              >
                {COUNTRY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <p className={styles.helpText}>
              {t('settings.company.data.countryHelp', { country: countryConfig.name })}
            </p>
          </div>

          {/* 🔥 NUEVO: Indicador visual de cambios automáticos */}
          <div className={styles.autoUpdateNotice}>
            <span>
              <strong> {countryConfig.taxName} ({companyForm.taxRate}%)</strong>, 
              <strong> {CURRENCY_OPTIONS.find(c => c.value === companyForm.currency)?.label.split('.').pop() || companyForm.currency}</strong> 
             
            </span>
          </div>

          {/* Campo para porcentaje de IVA */}
          <div className={styles.formGroup}>
            <label htmlFor="taxRate" className={styles.formLabel}>
              {t('settings.company.data.taxRateLabel') || 'IVA / MwSt / VAT (%)'}
            </label>
            <div className={styles.taxRateInput}>
              <input
                type="number"
                id="taxRate"
                min="0"
                max="100"
                step="0.1"
                value={companyForm.taxRate}
                onChange={e => setCompanyForm({...companyForm, taxRate: Number(e.target.value)})}
                className={styles.formInput}
                disabled={companyLoading}
              />
              <span className={styles.taxRateSymbol}>%</span>
            </div>
            <p className={styles.helpText}>
              {t('settings.company.data.taxRateHelp') || `Porcentaje de ${countryConfig.taxName || 'impuesto'} para este país`}
            </p>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('general')}
            >
              {t('settings.company.tabs.general')}
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'tax' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('tax')}
            >
              {t('settings.company.tabs.tax')}
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'bank' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('bank')}
            >
              {t('settings.company.tabs.bank')}
            </button>
          </div>

          {/* Tab: General */}
          {activeTab === 'general' && (
            <div className={styles.tabContent}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="companyName" className={styles.formLabel}>
                    {t('settings.company.data.nameLabel')} *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    value={companyForm.name}
                    onChange={e => setCompanyForm({...companyForm, name: e.target.value})}
                    className={`${styles.formInput}`}
                    placeholder={t('settings.company.data.namePlaceholder')}
                    disabled={companyLoading}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="legalName" className={styles.formLabel}>
                    {t('settings.company.data.legalName')}
                  </label>
                  <input
                    type="text"
                    id="legalName"
                    value={companyForm.legalName}
                    onChange={e => setCompanyForm({...companyForm, legalName: e.target.value})}
                    className={styles.formInput}
                    placeholder={t('settings.company.data.legalNamePlaceholder')}
                    disabled={companyLoading}
                  />
                </div>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="companyEmail" className={styles.formLabel}>
                    {t('settings.company.data.emailLabel')}
                  </label>
                  <input
                    type="email"
                    id="companyEmail"
                    value={companyForm.email}
                    onChange={e => setCompanyForm({...companyForm, email: e.target.value})}
                    className={`${styles.formInput}`}
                    placeholder={t('settings.company.data.emailPlaceholder')}
                    disabled={companyLoading}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="companyPhone" className={styles.formLabel}>
                    {t('settings.company.data.phoneLabel')}
                  </label>
                  <input
                    type="text"
                    id="companyPhone"
                    value={companyForm.phone}
                    onChange={e => setCompanyForm({...companyForm, phone: e.target.value})}
                    className={styles.formInput}
                    placeholder={t('settings.company.data.phonePlaceholder')}
                    disabled={companyLoading}
                  />
                </div>
              </div>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="website" className={styles.formLabel}>
                    {t('settings.company.data.website')}
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={companyForm.website}
                    onChange={e => setCompanyForm({...companyForm, website: e.target.value})}
                    className={styles.formInput}
                    placeholder={t('settings.company.data.websitePlaceholder')}
                    disabled={companyLoading}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="companyCurrency" className={styles.formLabel}>
                    {t('settings.company.data.currencyLabel')}
                  </label>
                  <div className={styles.selectWrapper}>
                    <select
                      id="companyCurrency"
                      value={companyForm.currency}
                      onChange={e => setCompanyForm({...companyForm, currency: e.target.value})}
                      className={styles.formInput}
                      disabled={companyLoading}
                    >
                      {CURRENCY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {t(option.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* {COUNTRY_TO_CURRENCY[companyForm.invoiceCountry] && (
                    <p className={styles.autoHint}>
                      {countryConfig.name}: {COUNTRY_TO_CURRENCY[companyForm.invoiceCountry]}
                    </p>
                  )} */}
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="timezone" className={styles.formLabel}>
                  {t('settings.company.data.timezoneLabel')}
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    id="timezone"
                    value={companyForm.timezone}
                    onChange={e => setCompanyForm({...companyForm, timezone: e.target.value})}
                    className={styles.formInput}
                    disabled={companyLoading}
                  >
                    {TIMEZONE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {t(option.label)}
                      </option>
                    ))}
                  </select>
                </div>
                {/* {COUNTRY_TO_TIMEZONE[companyForm.invoiceCountry] && (
                  <p className={styles.autoHint}>
                   {countryConfig.name}: {COUNTRY_TO_TIMEZONE[companyForm.invoiceCountry].split('/').pop()}
                  </p>
                )} */}
              </div>

              {/* Dirección dinámica según país */}
              <div className={styles.addressSection}>
                <h5 className={styles.addressSectionTitle}>
                  {t('settings.company.data.address.title')}
                </h5>
                {renderAddressFields()}
              </div>
            </div>
          )}

          {/* Tab: Tax Info */}
          {activeTab === 'tax' && (
            <div className={styles.tabContent}>
              <div className={styles.taxSection}>
                <h5 className={styles.taxSectionTitle}>
                  {t('settings.company.data.tax.title')} 
                </h5>
                <p className={styles.taxHelp}>
                  {t('settings.company.data.tax.help')}
                </p>
                {renderTaxFields()}
              </div>
            </div>
          )}

          {/* Tab: Bank Details */}
          {activeTab === 'bank' && (
            <div className={styles.tabContent}>
              <div className={styles.bankSection}>
                <h5 className={styles.bankSectionTitle}>
                  {t('settings.company.data.bank.title')}
                </h5>
                {renderBankFields()}
              </div>
            </div>
          )}
          
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
                  {t('settings.company.data.saving')}
                </>
              ) : (
                t('settings.company.data.submit')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}