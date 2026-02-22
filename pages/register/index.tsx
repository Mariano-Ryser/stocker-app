import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../components/auth/AuthProvider";
import styles from "./register.module.css";
// import { useLanguage } from '../../contexts/LanguageContext';

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
  
  // Estados para validación de contraseña en tiempo real
  const [passwordErrors, setPasswordErrors] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  const router = useRouter();
  const auth = useAuth();
    // const {t, loadModule} = useLanguage();
    
    // useEffect(() => { 
    //   loadModule('register');
    // }, [loadModule]);
    
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
        <p>Laden...</p>
      </div>
    );
  } 

  const validateForm = () => {
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return false;
    }
    
    // Validar longitud mínima
    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein");
      return false;
    }
    
    // Validar letra mayúscula
    if (!/[A-Z]/.test(password)) {
      setError("Passwort muss mindestens einen Großbuchstaben enthalten");
      return false;
    }
    
    // Validar número
    if (!/\d/.test(password)) {
      setError("Passwort muss mindestens eine Zahl enthalten");
      return false;
    }
    
    // Validar términos
    if (!termsAccepted) {
      setError("Bitte akzeptieren Sie die Nutzungsbedingungen");
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
      const result = await auth.register(email, password, name);
      if (result.success) {
        setSuccess("Registrierung erfolgreich! Weiterleitung...");
        setTimeout(() => {
          router.push("/adminDash");
        }, 1500);
      } else {
        setError(result.error || "Fehler bei der Registrierung");
        console.log(error)
      }
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || "Verbindungsfehler mit dem Server");
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
            src="/img/logo78.png" 
            alt="Alpina Logo" 
            className={styles.companyLogo}
          />
          <h1 className={styles.companyName}>Werden Sie Teil von Alpina</h1>
          <p className={styles.companySlogan}>
            Schließen Sie sich unserer Community erfolgreicher Unternehmen an
          </p>
          {/* <div className={styles.companyFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Vollständige Dashboard-Kontrolle</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Echtzeit-Analytics</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Prioritärer Support</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Sichere Datenverschlüsselung</span>
            </div>
          </div> */}
          {/* <div className={styles.testimonial}>
            <p className={styles.testimonialText}>
              "Die Plattform hat unsere Geschäftsprozesse revolutioniert."
            </p>
            <p className={styles.testimonialAuthor}>— Max Müller, CEO TechGmbH</p>
          </div> */}
        </div>
      </div>

      {/* Sección derecha: Formulario de registro */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.welcomeTitle}>Neues Konto erstellen</h2>
            <p className={styles.welcomeSubtitle}>
              Registrieren Sie sich für den Zugang zur Alpina Plattform
            </p>
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
                  Vollständiger Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.inputField}
                  placeholder="Max Mustermann"
                  required
                  disabled={loading}
                />
              </div>

              {/* <div className={styles.inputGroup}>
                <label htmlFor="company" className={styles.inputLabel}>
                  <svg className={styles.inputIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                  Unternehmen
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={styles.inputField}
                  placeholder="Ihr Unternehmen (optional)"
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
                Geschäfts-E-Mail *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                placeholder="ihre@unternehmen.de"
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
                />
                <div className={styles.passwordHint}>
                  Wird beim Tippen validiert
                </div>
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
                />
                <div className={styles.passwordHint}>
                  {confirmPassword && password !== confirmPassword ? (
                    <span className={styles.passwordMismatch}>Passwörter stimmen nicht überein</span>
                  ) : confirmPassword && password === confirmPassword ? (
                    <span className={styles.passwordMatch}>✓ Passwörter stimmen überein</span>
                  ) : (
                    "Muss mit Passwort übereinstimmen"
                  )}
                </div>
              </div>
            </div>

            <div className={styles.passwordRequirements}>
              <h4>Passwortanforderungen:</h4>
              <ul>
                <li className={passwordErrors.minLength ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.minLength ? "✓" : "○"}
                  </span>
                  Mindestens 6 Zeichen
                </li>
                <li className={passwordErrors.hasUpperCase ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.hasUpperCase ? "✓" : "○"}
                  </span>
                  Mindestens ein Großbuchstabe (A-Z)
                </li>
                <li className={passwordErrors.hasNumber ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.hasNumber ? "✓" : "○"}
                  </span>
                  Mindestens eine Zahl (0-9)
                </li>
                <li className={passwordErrors.hasSpecialChar ? styles.requirementMet : styles.requirementNotMet}>
                  <span className={styles.requirementIcon}>
                    {passwordErrors.hasSpecialChar ? "✓" : "○"}
                  </span>
                  Optional: Sonderzeichen (!@#$%^&*)
                </li>
              </ul>
              
              <div className={styles.passwordStrength}>
                <div className={styles.strengthLabel}>
                  Passwortstärke:
                  <span className={
                    password.length === 0 ? styles.strengthNone :
                    password.length < 6 ? styles.strengthWeak :
                    !passwordErrors.hasUpperCase || !passwordErrors.hasNumber ? styles.strengthMedium :
                    styles.strengthStrong
                  }>
                    {password.length === 0 ? " Keine Eingabe" :
                     password.length < 6 ? " Schwach" :
                     !passwordErrors.hasUpperCase || !passwordErrors.hasNumber ? " Mittel" :
                     " Stark"}
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
                Ich stimme den{" "}
                <span
                  className={styles.termsLink}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/informativePages/termsPage");
                  }}
                >
                  Nutzungsbedingungen
                </span>{" "}
                und der{" "}
                <span
                  className={styles.termsLink}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/informativePages/privacyPage");
                  }}
                >
                  Datenschutzerklärung
                </span>{" "}
                zu *
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
                  Wird registriert...
                </>
              ) : (
                "Konto erstellen"
              )}
            </button>

            <div className={styles.divider}>
              <span> <svg className={styles.googleIcon} viewBox="0 0 24 24">
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
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button> */}

            <div className={styles.loginLink}>
              Bereits ein Konto?{" "}
              <span
                onClick={() => router.push("/login")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push("/login");
                }}
                tabIndex={0}
                role="link"
              >
                Zur Anmeldung
              </span>
            </div>

            <div className={styles.supportInfo}>
              <svg className={styles.supportIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Benötigen Sie Hilfe?{" "}
              <a href="mailto:support@alpina.de" className={styles.supportLink}>
                support@alpina.de
              </a>
            </div>
          </form>

          <div className={styles.copyright}>
            © {new Date().getFullYear()} Alpina. Alle Rechte vorbehalten.
            <br />
            <span className={styles.terms}>
              <a href="/privacy">Datenschutz</a> | <a href="/terms">Nutzungsbedingungen</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}