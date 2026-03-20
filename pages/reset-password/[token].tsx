// pages/reset-password/[token].tsx (o pages/reset-password/index.tsx si usas query)
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
  
  // Estados para validación de contraseña en tiempo real
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  const router = useRouter();
  const { token } = router.query;
  const { t } = useLanguage();
  
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
        setError(data.message || t('resetPassword.messages.invalidToken'));
        setTokenValid(false);
      }
    } catch (err: any) {
      setError(t('resetPassword.messages.verificationError'));
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const validateForm = () => {
    if (password.length < 6) {
      setError(t('resetPassword.messages.passwordMinLength'));
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setError(t('resetPassword.messages.passwordUpperCase'));
      return false;
    }

    if (!/\d/.test(password)) {
      setError(t('resetPassword.messages.passwordNumber'));
      return false;
    }

    if (password !== confirmPassword) {
      setError(t('resetPassword.messages.passwordMismatch'));
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
        setSuccess(t('resetPassword.messages.success'));
        
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.message || t('resetPassword.messages.error'));
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(t('resetPassword.messages.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>{t('resetPassword.verifying')}</p>
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
              src="/img/logo80.webp" 
              alt="Alpina Logo" 
              className={styles.logo}
            />
            <h1 className={styles.title}>{t('resetPassword.title')}</h1>
          </div>

          <div className={styles.formContent}>
            <div className={styles.errorMessage}>
              <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error || t('resetPassword.messages.invalidToken')}
            </div>

            <div className={styles.links}>
              <Link href="/forgot-password" className={styles.actionLink}>
                {t('resetPassword.links.newLink')}
              </Link>
              <Link href="/login" className={styles.backLink}>
                {t('resetPassword.links.backToLogin')}
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
            src="/img/logo80.webp" 
            alt="Alpina Logo" 
            className={styles.logo}
          />
          <h1 className={styles.title}>{t('resetPassword.title')}</h1>
        </div>

        <div className={styles.formContent}>
          <h2 className={styles.formTitle}>{t('resetPassword.heading')}</h2>
          <p className={styles.formSubtitle}>{t('resetPassword.subtitle')}</p>

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
                {t('resetPassword.password.label')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${styles.inputField} ${password && !passwordErrors.minLength ? styles.inputError : ''}`}
                placeholder={t('resetPassword.password.placeholder')}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <div className={styles.passwordRequirements}>
              <h4>{t('resetPassword.requirements.title')}</h4>
              <ul>
                <li className={passwordErrors.minLength ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.minLength ? "✓" : "○"}
                  </span>
                  {t('resetPassword.requirements.minLength')}
                </li>
                <li className={passwordErrors.hasUpperCase ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.hasUpperCase ? "✓" : "○"}
                  </span>
                  {t('resetPassword.requirements.upperCase')}
                </li>
                <li className={passwordErrors.hasNumber ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.hasNumber ? "✓" : "○"}
                  </span>
                  {t('resetPassword.requirements.number')}
                </li>
                <li className={passwordErrors.hasSpecialChar ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.hasSpecialChar ? "✓" : "○"}
                  </span>
                  {t('resetPassword.requirements.specialChar')}
                </li>
              </ul>
              
              <div className={styles.passwordStrength}>
                <div className={styles.strengthLabel}>
                  {t('resetPassword.strength.label')}
                  <span className={
                    password.length === 0 ? styles.strengthNone :
                    password.length < 6 ? styles.strengthWeak :
                    !passwordErrors.hasUpperCase || !passwordErrors.hasNumber ? styles.strengthMedium :
                    styles.strengthStrong
                  }>
                    {password.length === 0 ? t('resetPassword.strength.none') :
                     password.length < 6 ? t('resetPassword.strength.weak') :
                     !passwordErrors.hasUpperCase || !passwordErrors.hasNumber ? t('resetPassword.strength.medium') :
                     t('resetPassword.strength.strong')}
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

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.inputLabel}>
                <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {t('resetPassword.confirmPassword.label')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${styles.inputField} ${confirmPassword && password !== confirmPassword ? styles.inputError : ''}`}
                placeholder={t('resetPassword.confirmPassword.placeholder')}
                required
                disabled={loading}
                autoComplete="new-password"
              />
              {confirmPassword && password !== confirmPassword && (
                <div className={styles.fieldError}>{t('resetPassword.messages.passwordMismatch')}</div>
              )}
            </div>

            <button
              className={`${styles.submitButton} ${loading ? styles.loading : ""}`}
              type="submit"
              disabled={loading || !passwordErrors.minLength || !passwordErrors.hasUpperCase || !passwordErrors.hasNumber || password !== confirmPassword}
            >
              {loading ? (
                <>
                  <span className={styles.buttonSpinner}></span>
                  {t('resetPassword.button.resetting')}
                </>
              ) : (
                t('resetPassword.button.reset')
              )}
            </button>
          </form>

          <div className={styles.links}>
            <Link href="/login" className={styles.backLink}>
              {t('resetPassword.links.backToLogin')}
            </Link>
          </div>

          <div className={styles.footer}>
            {t('resetPassword.footer').replace('{year}', new Date().getFullYear().toString())}
          </div>
        </div>
      </div>
    </div>
  );
}