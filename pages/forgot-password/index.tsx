import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./forgot-password.module.css";
import { useLanguage } from "../../contexts/LanguageContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { t} = useLanguage();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
 
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Se ha enviado un email con instrucciones para restablecer tu contraseña.");
      } else {
        setError(data.message || "Ocurrió un error. Por favor, intenta de nuevo.");
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError("Error de conexión con el servidor. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.logoSection}>
          <img 
            src="/img/logo80.webp" 
            alt="Alpina Logo" 
            className={styles.logo}
          />
          <h1 className={styles.title}>Alpina</h1>
        </div>

        <div className={styles.formContent}>
          <h2 className={styles.formTitle}>¿Olvidaste tu contraseña?</h2>
          <p className={styles.formSubtitle}>
            Ingresa tu dirección de email y te enviaremos instrucciones para restablecer tu contraseña.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.errorMessage}>
                <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className={styles.successMessage}>
                <svg className={styles.successIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                E-Mail Adresse *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                placeholder="ihre@email.de"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <button
              className={`${styles.submitButton} ${loading ? styles.loading : ""}`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.buttonSpinner}></span>
                  Wird gesendet...
                </>
              ) : (
                "Anweisungen senden"
              )}
            </button>
          </form>

          <div className={styles.links}>
            <Link href="/login" className={styles.backLink}>
              ← Zurück zum Login
            </Link>
            <Link href="/register" className={styles.registerLink}>
              Neues Konto erstellen
            </Link>
          </div>

          <div className={styles.supportSection}>
            <svg className={styles.supportIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p className={styles.supportText}>
              Benötigen Sie Hilfe?{" "}
              <a href="mailto:rysermariano@gmail.com" className={styles.supportLink}>
                rysermariano@gmail.com
              </a>
            </p>
          </div>

          <div className={styles.footer}>
            © {new Date().getFullYear()} Alpina. Alle Rechte vorbehalten.
          </div>
        </div>
      </div>
    </div>
  );
}