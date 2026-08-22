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
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { loading: authLoading, register, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  useEffect(() => {
    const errors = {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordErrors(errors);
  }, [password]);
  
  if (authLoading) {
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
      const result = await register(email, password, name, company);
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
      <div className={styles.imageSection}>
        <div className={styles.imageContent}>
          <div className={styles.logoWrapper}>
            <img 
              src="/img/logo81.webp" 
              alt="Alpina Logo" 
              className={styles.companyLogo}
            />
            <div className={styles.logoGlow} />
          </div>
          <h1 className={styles.companyName}>{t('register.welcome')}</h1>
          <p className={styles.companySlogan}>{t('register.subtitle')}</p>
          {/* <div className={styles.companyFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>Registro seguro</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>Protección de datos</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>Acceso inmediato</span>
            </div>
          </div> */}
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <div className={styles.welcomeBadge}>✦ StockerCloud</div>
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

              {/* <div className={styles.inputGroup}>
                <label htmlFor="company" className={styles.inputLabel}>
                  <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                    <path d="M8 6h4v2H8V6zm0 4h4v2H8v-2zm0 4h4v2H8v-2z" />
                  </svg>
                  {t('register.company.label')}
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={styles.inputField}
                  placeholder={t('register.company.placeholder')}
                  disabled={loading}
                />
              </div> */}
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
                <div className={styles.passwordWrapper}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputFieldWithToggle}
                    placeholder={t('register.password.placeholder')}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.togglePasswordButton}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.inputLabel}>
                  <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  {t('register.confirmPassword.label')}
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.inputFieldWithToggle}
                    placeholder={t('register.confirmPassword.placeholder')}
                    required
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.togglePasswordButton}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className={styles.passwordHint}>
                  {confirmPassword && password !== confirmPassword ? (
                    <span className={styles.passwordMismatch}>✦ Las contraseñas no coinciden</span>
                  ) : confirmPassword && password === confirmPassword ? (
                    <span className={styles.passwordMatch}>✓ Contraseñas coinciden</span>
                  ) : (
                    t('register.confirmPassword.hint')
                  )}
                </div>
              </div>
            </div>

            <div className={styles.passwordRequirements}>
              <h4>🔐 {t('register.requirements.title')}</h4>
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
                <span className={styles.termsText}>
                  {t('register.termsSection.text')}
                </span>
                <span
                  className={styles.termsLink}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/informativePages/termsPage");
                  }}
                >
                  {t('register.termsSection.termsLabel')}
                </span>
                {t('register.termsSection.ylos')}
               
                <span
                  className={styles.termsLink}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/informativePages/privacyPage");
                  }}
                >
                  {t('register.termsSection.privacyLabel')}
                </span>
                {" ✦"}
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
                {t('register.loginSection.link')} ✦
              </span>
            </div>
          </form>

          <div className={styles.copyright}>
            {t('register.copyright').replace('{year}', new Date().getFullYear().toString())}
            <br />
            <span
              className={styles.link}
              onClick={() => router.push("/informativePages/privacyPage")}
            >
              {t('register.privacy')}
            </span>
            {" | "}
            <span
              className={styles.link}
              onClick={() => router.push("/informativePages/termsPage")}
            >
              {t('register.terms')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}