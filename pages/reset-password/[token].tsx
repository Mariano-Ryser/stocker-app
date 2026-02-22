import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./reset-password.module.css";
import { useLanguage } from '../../contexts/LanguageContext';
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const router = useRouter();
  const { token } = router.query;
  const {t} = useLanguage();
  

  
  // Verificar token al cargar la página
  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);
 
  const verifyToken = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/verify-reset-token/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTokenValid(true);
      } else {
        setError(data.message || "El enlace es inválido o ha expirado.");
        setTokenValid(false);
      }
    } catch (err: any) {
      setError("Error al verificar el enlace. Por favor, intenta de nuevo.");
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validaciones
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Contraseña restablecida correctamente.");
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/login");
        }, 3000);
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

  if (verifying) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.logoSection}>
            <img 
              src="/img/logo78.png" 
              alt="Alpina Logo" 
              className={styles.logo}
            />
            <h1 className={styles.title}>Alpina</h1>
          </div>

          <div className={styles.formContent}>
            <div className={styles.errorMessage}>
              <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error || "Enlace inválido o expirado"}
            </div>

            <div className={styles.links}>
              <Link href="/forgot-password" className={styles.actionLink}>
                Solicitar nuevo enlace
              </Link>
              <Link href="/login" className={styles.backLink}>
                ← Volver al Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.logoSection}>
          <img 
            src="/img/logo78.png" 
            alt="Alpina Logo" 
            className={styles.logo}
          />
          <h1 className={styles.title}>Alpina</h1>
        </div>

        <div className={styles.formContent}>
          <h2 className={styles.formTitle}>Nueva Contraseña</h2>
          <p className={styles.formSubtitle}>
            Ingresa tu nueva contraseña
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
              <label htmlFor="password" className={styles.inputLabel}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Neue Passwort *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="new-password"
                minLength={6}
              />
              <p className={styles.helperText}>Mindestens 6 Zeichen</p>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.inputLabel}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Passwort bestätigen *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.inputField}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="new-password"
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
                  Passwort wird zurückgesetzt...
                </>
              ) : (
                "Passwort zurücksetzen"
              )}
            </button>
          </form>

          <div className={styles.links}>
            <Link href="/login" className={styles.backLink}>
              ← Zurück zum Login
            </Link>
          </div>

          <div className={styles.footer}>
            © {new Date().getFullYear()} Alpina. Alle Rechte vorbehalten.
          </div>
        </div>
      </div>
    </div>
  );
}