import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../components/auth/AuthProvider";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./login.module.css";
 
export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState("");

  const router = useRouter();
  const auth = useAuth();
  const {t} = useLanguage();


  useEffect(() => {
    if (!auth.loading && auth.user) {
      router.push("/adminDash");
    }
  }, [auth.user, router]);

  if (auth.loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Laden...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await auth.login(email, password);
      if (result.success) {
        setSuccess("Anmeldung erfolgreich! Weiterleitung...");
        setTimeout(() => {
          router.push("/adminDash");
        }, 1500);
      } else {
        setError(result.error || "Ungültige Anmeldedaten");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Verbindungsfehler mit dem Server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Sección izquierda: Imagen corporativa */}
      <div className={styles.imageSection}>
        <div className={styles.imageContent}>
          <img 
            src="/img/logo80.webp" 
            alt="Alpina Logo" 
            className={styles.companyLogo}
          />
          <h1 className={styles.companyName}>Willkommen bei Alpina</h1>
          <p className={styles.companySlogan}>
            Greifen Sie auf Ihr Dashboard zu und verwalten Sie Ihre Unternehmensdaten
          </p>
          <div className={styles.companyFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Echtzeit-Dashboard-Kontrolle</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Sichere Authentifizierung</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Prioritärer Kundensupport</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Datenverschlüsselung nach Industriestandard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección derecha: Formulario de login */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.welcomeTitle}>Anmelden</h2>
            <p className={styles.welcomeSubtitle}>
              Melden Sie sich mit Ihren Zugangsdaten an
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {error && (
              <div className={styles.errorMessage}>
                <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p>{t("login.error")}</p>
                


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
                autoComplete="username"
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.inputLabel}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Passwort *
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
                autoComplete="current-password"
              />
            </div>

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className={styles.rememberCheckbox}
                />
                Angemeldet bleiben
              </label>
              <span
                className={styles.forgotLink}
                onClick={() => router.push("/forgot-password")}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push("/forgot-password");
                }}
                role="link"
              >
                Passwort vergessen?
              </span>
            </div>

            <button
              className={`${styles.submitButton} ${loading ? styles.loading : ""}`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.buttonSpinner}></span>
                  Wird angemeldet...
                </>
              ) : (
                "Anmelden"
              )}
            </button>

            <div className={styles.divider}>
              <span><svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg></span>
            </div>

            {/* <button
              type="button"
              className={styles.googleButton}
              onClick={() => {}}
              disabled={loading}
            >
              
              Mit Google anmelden
            </button> */}

            <div className={styles.registerPrompt}>
              <span>Sie haben noch kein Konto? </span>
              <span
                className={styles.registerLink}
                onClick={() => router.push("/register")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push("/register");
                }}
                tabIndex={0}
                role="link"
              >
                Jetzt registrieren
              </span>
            </div>
{/* 
            <div className={styles.supportInfo}>
              <svg className={styles.supportIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Benötigen Sie Hilfe?{" "}
              <a href="mailto:rysermariano@gmail.com" className={styles.supportLink}>
                rysermariano@gmail.com
              </a>
            </div> */}
          </form>

          <div className={styles.copyright}>
            © {new Date().getFullYear()} Alpina. Alle Rechte vorbehalten.
            <br />
           <span
        className={styles.link}
        onClick={() => router.push("/informativePages/privacyPage")}
        style={{ cursor: "pointer" }}
      >
        Datenschutz
      </span>
      {" | "}
      <span
        className={styles.link}
        onClick={() => router.push("/informativePages/termsPage")}
        style={{ cursor: "pointer" }}
      >
        Nutzungsbedingungen
      </span>
          </div>
        </div>
      </div>
    </div>
  );
}