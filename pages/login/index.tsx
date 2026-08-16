// pages/login/index.tsx
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
  const { t } = useLanguage();

  useEffect(() => {
    if (!auth.loading && auth.user) {
      router.push("/dashboard");
    }
  }, [auth.user, router]);

  if (auth.loading) {
    return (
      <div className={styles.loadingContainer}> 
        <div className={styles.loader}></div>
        <p>{t('login.loading')}</p>
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
        setSuccess(t('login.success'));
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(result.error || t('login.errors.invalidCredentials'));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t('login.errors.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Sección izquierda: Imagen corporativa */}
      <div className={styles.imageSection}>
        <div className={styles.imageContent}>
          <div className={styles.logoWrapper}>
            <img 
              src="/img/logo80.webp" 
              alt="Alpina Logo" 
              className={styles.companyLogo}
            />
            <div className={styles.logoGlow} />
          </div>
          <h1 className={styles.companyName}>{t('login.welcome')}</h1>
          <p className={styles.companySlogan}>{t('login.subtitle')}</p>
          <div className={styles.companyFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>{t('login.features.dashboard')}</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>{t('login.features.security')}</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>{t('login.features.support')}</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>{t('login.features.encryption')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección derecha: Formulario de login */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <div className={styles.welcomeBadge}>✦ StockerCloud</div>
            <h2 className={styles.welcomeTitle}>{t('login.title')}</h2>
            <p className={styles.welcomeSubtitle}>{t('login.subtitle2')}</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {error && (
              <div className={styles.errorMessage}>
                <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
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
                {t('login.email.label')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                placeholder={t('login.email.placeholder')}
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
                {t('login.password.label')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                placeholder={t('login.password.placeholder')}
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
                {t('login.rememberMe')}
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
                {t('login.forgotPassword')}
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
                  {t('login.button.loggingIn')}
                </>
              ) : (
                t('login.button.login')
              )}
            </button>

            <div className={styles.registerPrompt}>
              <span>{t('login.register.prompt')} </span>
              <span
                className={styles.registerLink}
                onClick={() => router.push("/register")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push("/register");
                }}
                tabIndex={0}
                role="link"
              >
                {t('login.register.link')}
              </span>
            </div> 
          </form>

          <div className={styles.copyright}>
            {t('login.copyright').replace('{year}', new Date().getFullYear().toString())}
            <br />
            <span
              className={styles.link}
              onClick={() => router.push("/informativePages/privacyPage")}
              style={{ cursor: "pointer" }}
            >
              {t('login.privacy')}
            </span>
            {" | "}
            <span
              className={styles.link}
              onClick={() => router.push("/informativePages/termsPage")}
              style={{ cursor: "pointer" }}
            >
              {t('login.terms')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}