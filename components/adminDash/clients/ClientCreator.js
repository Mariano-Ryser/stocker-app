import { useState } from "react";
import { useAuth } from "../../../components/auth/AuthProvider";
import styles from "./ClientCreator.module.css";

export default function ClientsCreator({ onClose, onCreated, createClient }) {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ 
    name: "", 
    vorname: "", 
    email: "", 
    adresse: "", 
    phone: "" 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthenticated) {
    return (
      <div className={styles.backdrop}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Acceso restringido</h2>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
          <div className={styles.body}>
            <p>Debe iniciar sesión para crear clientes.</p>
          </div>
          <div className={styles.footer}>
            <button className={`${styles.btn} ${styles.cancel}`} onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para crear clientes');
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await createClient(form);
      
      if (res.success) {
        onCreated();
        onClose();
        setForm({ name: "", vorname: "", email: "", adresse: "", phone: "" });
      } else {
        setError(res.message || "Fehler beim Erstellen des Kunden");
      }
    } catch (err) {
      setError(err.message || "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Neuer Kunde</h2>
          <button 
            className={styles.closeBtn} 
            onClick={onClose} 
            disabled={loading}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.body}>
            <div className={styles.formSection}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="vorname">Vorname *</label>
                  <input
                    id="vorname"
                    name="vorname"
                    value={form.vorname}
                    onChange={handleChange}
                    placeholder="Vorname"
                    required
                    disabled={loading}
                    autoComplete="given-name"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name *</label>
                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Name"
                    required
                    disabled={loading}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="adresse">Adresse</label>
                <input
                  id="adresse"
                  name="adresse"
                  value={form.adresse}
                  onChange={handleChange}
                  placeholder="Adresse"
                  disabled={loading}
                  autoComplete="street-address"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone">Telefon</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Telefon"
                  disabled={loading}
                  autoComplete="tel"
                />
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
              Abbrechen
            </button>
            <button 
              type="submit" 
              className={`${styles.btn} ${styles.save}`} 
              disabled={loading || !form.name.trim() || !form.vorname.trim()}
            >
              {loading ? "Wird erstellt..." : "Kunde erstellen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}