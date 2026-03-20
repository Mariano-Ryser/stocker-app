// pages/register/index.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../components/auth/AuthProvider";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./register.module.css";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const { t } = useLanguage();
  
  // Estados para validación de contraseña en tiempo real
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  const router = useRouter();
  const auth = useAuth();
  
  // Validación en tiempo real de la contraseña
  useEffect(() => {
    const errors = {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordErrors(errors);
  }, [password]);
  
  if (auth.loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>{t('register.loading')}</p>
      </div>
    );
  }

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError(t('register.errors.passwordMismatch'));
      return false;
    }
    
    if (password.length < 6) {
      setError(t('register.errors.passwordMinLength'));
      return false;
    }
    
    if (!/[A-Z]/.test(password)) {
      setError(t('register.errors.passwordUpperCase'));
      return false;
    }
    
    if (!/\d/.test(password)) {
      setError(t('register.errors.passwordNumber'));
      return false;
    }
    
    if (!termsAccepted) {
      setError(t('register.errors.termsRequired'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      const result = await auth.register(email, password, name, company);
      if (result.success) {
        setSuccess(t('register.success'));
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(result.error || t('register.errors.registrationFailed'));
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || t('register.errors.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Sección izquierda: Imagen corporativa */}
      <div className={styles.imageSection}>
        <div className={styles.imageOverlay}></div>
        <div className={styles.imageContent}>
          <img 
            src="/img/logo80.webp" 
            alt="Alpina Logo" 
            className={styles.companyLogo}
          />
          <h1 className={styles.companyName}>{t('register.welcome')}</h1>
          <p className={styles.companySlogan}>{t('register.subtitle')}</p>
        </div>
      </div>

      {/* Sección derecha: Formulario de registro */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.welcomeTitle}>{t('register.title')}</h2>
            <p className={styles.welcomeSubtitle}>{t('register.formTitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.registerForm}>
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

            <div className={styles.twoColumn}>
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.inputLabel}>
                  <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {t('register.name.label')}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.inputField}
                  placeholder={t('register.name.placeholder')}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {t('register.email.label')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                placeholder={t('register.email.placeholder')}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.twoColumn}>
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.inputLabel}>
                  <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  {t('register.password.label')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.inputField}
                  placeholder={t('register.password.placeholder')}
                  required
                  disabled={loading}
                />
                <div className={styles.passwordHint}>
                  {t('register.password.hint')}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.inputLabel}>
                  <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  {t('register.confirmPassword.label')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.inputField}
                  placeholder={t('register.confirmPassword.placeholder')}
                  required
                  disabled={loading}
                />
                <div className={styles.passwordHint}>
                  {confirmPassword && password !== confirmPassword ? (
                    <span className={styles.passwordMismatch}>{t('register.confirmPassword.mismatch')}</span>
                  ) : confirmPassword && password === confirmPassword ? (
                    <span className={styles.passwordMatch}>{t('register.confirmPassword.match')}</span>
                  ) : (
                    t('register.confirmPassword.hint')
                  )}
                </div>
              </div>
            </div>

            <div className={styles.passwordRequirements}>
              <h4>{t('register.requirements.title')}</h4>
              <ul>
                <li className={passwordErrors.minLength ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.minLength ? "✓" : "○"}
                  </span>
                  {t('register.requirements.minLength')}
                </li>
                <li className={passwordErrors.hasUpperCase ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.hasUpperCase ? "✓" : "○"}
                  </span>
                  {t('register.requirements.upperCase')}
                </li>
                <li className={passwordErrors.hasNumber ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.hasNumber ? "✓" : "○"}
                  </span>
                  {t('register.requirements.number')}
                </li>
                <li className={passwordErrors.hasSpecialChar ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.hasSpecialChar ? "✓" : "○"}
                  </span>
                  {t('register.requirements.specialChar')}
                </li>
              </ul>
              
              <div className={styles.passwordStrength}>
                <div className={styles.strengthLabel}>
                  {t('register.strength.label')}
                  <span className={
                    password.length === 0 ? styles.strengthNone :
                    password.length < 6 ? styles.strengthWeak :
                    !passwordErrors.hasUpperCase || !passwordErrors.hasNumber ? styles.strengthMedium :
                    styles.strengthStrong
                  }>
                    {password.length === 0 ? t('register.strength.none') :
                     password.length < 6 ? t('register.strength.weak') :
                     !passwordErrors.hasUpperCase || !passwordErrors.hasNumber ? t('register.strength.medium') :
                     t('register.strength.strong')}
                  </span>
                </div>
                <div className={styles.strengthMeter}>
                  <div 
                    className={`${styles.strengthBar} ${
                      password.length === 0 ? styles.strengthNone :
                      password.length < 6 ? styles.strengthWeak :
                      !passwordErrors.hasUpperCase || !passwordErrors.hasNumber ? styles.strengthMedium :
                      styles.strengthStrong
                    }`}
                    style={{
                      width: password.length === 0 ? '0%' :
                            password.length < 6 ? '33%' :
                            !passwordErrors.hasUpperCase || !passwordErrors.hasNumber ? '66%' :
                            '100%'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={styles.termsAgreement}>
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                disabled={loading}
                className={styles.termsCheckbox}
              />
              <label htmlFor="terms" className={styles.termsLabel}>
                {/* CORREGIDO: Usar termsSection en lugar de terms */}
                {t('register.termsSection.text')
                  .replace('{termsLink}', '')
                  .replace('{privacyLink}', '')}
                <span
                  className={styles.termsLink}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/informativePages/termsPage");
                  }}
                >
                  {t('register.termsSection.termsLabel')}
                </span>
                {" und der "}
                <span
                  className={styles.termsLink}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/informativePages/privacyPage");
                  }}
                >
                  {t('register.termsSection.privacyLabel')}
                </span>
                {" *"}
              </label>
            </div>

            <button
              className={`${styles.submitButton} ${loading ? styles.loading : ""}`}
              type="submit"
              disabled={loading || !passwordErrors.minLength || !passwordErrors.hasUpperCase || !passwordErrors.hasNumber}
            >
              {loading ? (
                <>
                  <span className={styles.buttonSpinner}></span>
                  {t('register.button.registering')}
                </>
              ) : (
                t('register.button.register')
              )}
            </button>

            <div className={styles.divider}>
              <span>oder</span>
            </div>

            <button
              type="button"
              className={styles.googleButton}
              onClick={() => {}}
              disabled={loading}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {/* {t('register.google')} */}
            </button>

            <div className={styles.loginLink}>
              {t('register.loginSection.prompt')}{" "}
              <span
                onClick={() => router.push("/login")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push("/login");
                }}
                tabIndex={0}
                role="link"
              >
                {t('register.loginSection.link')}
              </span>
            </div>
          </form>

          <div className={styles.copyright}>
            {t('register.copyright').replace('{year}', new Date().getFullYear().toString())}
            <br />
            <span className={styles.terms}>
              {/* CORREGIDO: Usar los strings directamente */}
              <a href="/privacy">{t('register.privacy')}</a> | <a href="/terms"> {t('register.terms')} </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}