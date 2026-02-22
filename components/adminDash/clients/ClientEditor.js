import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthProvider";
import styles from "./ClientEditor.module.css";

export default function ClientEditor({ client, onClose, onUpdated, updateClient }) {
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

  // Actualizar formulario cuando cambia el cliente
  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || "",
        vorname: client.vorname || "",
        email: client.email || "",
        adresse: client.adresse || "",
        phone: client.phone || ""
      });
    }
  }, [client]);

  // Si no está autenticado, mostrar mensaje de acceso restringido
  if (!isAuthenticated) {
    return (
      <div className={styles.backdrop}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Acceso restringido</h2>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
          <div className={styles.body}>
            <p>Debe iniciar sesión para editar clientes.</p>
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

  // Si no hay cliente, no renderizar nada
  if (!client) {
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para editar clientes');
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await updateClient(client._id, form);
      
      if (res.success) {
        onUpdated();
        onClose();
      } else {
        setError(res.message || "Fehler beim Aktualisieren des Kunden");
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
          <h2>Kunde bearbeiten</h2>
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
              <div className={styles.clientInfo}>
                <span className={styles.clientId}>ID: {client._id}</span>
              </div>
              
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
                  <div className={styles.errorText}>{error}</div>
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
              {loading ? (
                <span className={styles.loadingText}>
                  <span className={styles.spinner}></span>
                  Wird aktualisiert...
                </span>
              ) : "Änderungen speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}