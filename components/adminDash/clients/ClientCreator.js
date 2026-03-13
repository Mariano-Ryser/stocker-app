import { useState } from "react";
import { useAuth } from "../../../components/auth/AuthProvider";
import { useLanguage } from "../../../contexts/LanguageContext";
import styles from "./ClientCreator.module.css";


// Mapa de códigos de error a claves de traducción
const ERROR_CODE_MAP = {
  'EMAIL_ALREADY_EXISTS': 'clientForm.errors.emailExists',
  'REQUIRED_FIELDS_MISSING': 'clientForm.errors.requiredFields',
  'SERVER_ERROR': 'clientForm.errors.serverError',
  'NETWORK_ERROR': 'clientForm.errors.networkError',
  'UNKNOWN_ERROR': 'clientForm.errors.unknown',
  'UNEXPECTED_ERROR': 'clientForm.errors.unknown'
};

export default function ClientsCreator({ onClose, onCreated, createClient }) {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ 
    name: "", 
    vorname: "", 
    company: "",
    email: "", 
    phone: "",
    address: {
      street: "",
      number: "",
      complement: "",
      postalCode: "",
      city: "",
      state: "",
      country: ""
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthenticated) {
    return (
      <div className={styles.backdrop}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>{t('clientForm.restricted.title')}</h2>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
          <div className={styles.body}>
            <p>{t('clientForm.restricted.message')}</p>
          </div>
          <div className={styles.footer}>
            <button className={`${styles.btn} ${styles.cancel}`} onClick={onClose}>
              {t('clientForm.restricted.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Manejar campos anidados de address
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError(t('clientForm.restricted.message'));
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // Construir objeto para enviar al backend
      const clientData = {
        name: form.name,
        vorname: form.vorname,
        company: form.company || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: {
          street: form.address.street || undefined,
          number: form.address.number || undefined,
          complement: form.address.complement || undefined,
          postalCode: form.address.postalCode || undefined,
          city: form.address.city || undefined,
          state: form.address.state || undefined,
          country: form.address.country || 'Deutschland'
        }
      };
      
      const res = await createClient(clientData);
      
      if (res.success) {
        onCreated();
        onClose();
      } else {
          const errorKey = ERROR_CODE_MAP[res.errorCode] || 'clientForm.errors.unknown';
        setError(t(errorKey));
      }
    } catch (err) {
      setError(t('clientForm.errors.unknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{t('clientForm.creator.title')}</h2>
          <button 
            className={styles.closeBtn} 
            onClick={onClose} 
            disabled={loading}
            aria-label={t('clientForm.restricted.close')}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.body}>
            <div className={styles.formSection}>
              {/* Datos personales */}
              <h3 className={styles.sectionTitle}>Persönliche Daten</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="vorname">{t('clientForm.fields.firstName.label')}</label>
                  <input
                    id="vorname"
                    name="vorname"
                    value={form.vorname}
                    onChange={handleChange}
                    placeholder={t('clientForm.fields.firstName.placeholder')}
                    required
                    disabled={loading}
                    autoComplete="given-name"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="name">{t('clientForm.fields.lastName.label')}</label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t('clientForm.fields.lastName.placeholder')}
                    required
                    disabled={loading}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="company">{t('clientForm.address.company')}</label>
                <input
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder={t('clientForm.address.companyPlaceholder')}
                  disabled={loading}
                  autoComplete="organization"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">{t('clientForm.fields.email.label')}</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t('clientForm.fields.email.placeholder')}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="phone">{t('clientForm.fields.phone.label')}</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder={t('clientForm.fields.phone.placeholder')}
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Sección de dirección */}
              <h3 className={styles.sectionTitle}>{t('clientForm.address.title')}</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="address.street">{t('clientForm.address.street')}</label>
                  <input
                    id="address.street"
                    name="address.street"
                    value={form.address.street}
                    onChange={handleChange}
                    placeholder={t('clientForm.address.streetPlaceholder')}
                    disabled={loading}
                    autoComplete="address-line1"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="address.number">{t('clientForm.address.number')}</label>
                  <input
                    id="address.number"
                    name="address.number"
                    value={form.address.number}
                    onChange={handleChange}
                    placeholder={t('clientForm.address.numberPlaceholder')}
                    disabled={loading}
                    autoComplete="address-line2"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address.complement">{t('clientForm.address.complement')}</label>
                <input
                  id="address.complement"
                  name="address.complement"
                  value={form.address.complement}
                  onChange={handleChange}
                  placeholder={t('clientForm.address.complementPlaceholder')}
                  disabled={loading}
                  autoComplete="address-line3"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="address.postalCode">{t('clientForm.address.postalCode')}</label>
                  <input
                    id="address.postalCode"
                    name="address.postalCode"
                    value={form.address.postalCode}
                    onChange={handleChange}
                    placeholder={t('clientForm.address.postalCodePlaceholder')}
                    disabled={loading}
                    autoComplete="postal-code"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="address.city">{t('clientForm.address.city')}</label>
                  <input
                    id="address.city"
                    name="address.city"
                    value={form.address.city}
                    onChange={handleChange}
                    placeholder={t('clientForm.address.cityPlaceholder')}
                    disabled={loading}
                    autoComplete="address-level2"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="address.state">{t('clientForm.address.state')}</label>
                  <input
                    id="address.state"
                    name="address.state"
                    value={form.address.state}
                    onChange={handleChange}
                    placeholder={t('clientForm.address.statePlaceholder')}
                    disabled={loading}
                    autoComplete="address-level1"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="address.country">{t('clientForm.address.country')}</label>
                  <input
                    id="address.country"
                    name="address.country"
                    value={form.address.country}
                    onChange={handleChange}
                    placeholder={t('clientForm.address.countryPlaceholder')}
                    disabled={loading}
                    autoComplete="country"
                  />
                </div>
              </div>

              {error && (
                <div className={styles.errorMessage} role="alert">
                  <div className={styles.errorIcon}>⚠️</div>
                  {error}
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.footer}>
            <button 
              type="button" 
              className={`${styles.btn} ${styles.cancel}`} 
              onClick={onClose} 
              disabled={loading}
            >
              {t('clientForm.buttons.cancel')}
            </button>
            <button 
              type="submit" 
              className={`${styles.btn} ${styles.save}`} 
              disabled={loading || !form.name.trim() || !form.vorname.trim()}
            >
              {loading ? t('clientForm.buttons.creating') : t('clientForm.buttons.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}