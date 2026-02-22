import { useEffect, useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import styles from './Kontakt.module.css';
import Footer from '../../components/footer/Footer';
import { useLanguage } from '../../contexts/LanguageContext';

const Kontakt = () => {
  const {t, loadModule} = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    privacyAccepted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

 useEffect(() => {  
    loadModule('kontakt');
  }, [loadModule]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        privacyAccepted: false
      });
      
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <>
      <Head>
        <p>{t('kontakt.title')}</p>
        <title>Kontakt | SaaS-Lösungen für Ihr Unternehmen</title>
        <meta name="description" content="Kontaktieren Sie uns für eine unverbindliche Beratung zu Ihrem SaaS-Projekt. Professionelle Lösungen für Ihre digitale Transformation." />
        <meta name="keywords" content="Kontakt, SaaS, Softwareentwicklung, Beratung, Support" />
        <meta property="og:title" content="Kontakt | Professionelle SaaS-Beratung" />
        <meta property="og:description" content="Kontaktieren Sie unser Expertenteam für individuelle Lösungen." />
        <meta property="og:image" content="/img/kontakt-hero.jpg" />
      </Head>

      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroImageContainer}>
            <div className={styles.imageWrapper}>
              <Image
                src="/img/kontakt-hero.jpg"
                alt="Kontaktbereich"
                fill
                sizes="100vw"
                className={styles.heroImage}
                priority
                quality={90}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTU1NSIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxNTU1IDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmMWYxIi8+PC9zdmc+"
              />
            </div>
            <div className={styles.heroOverlay}>
              <h1 className={styles.heroTitle}>Kontakt</h1>
              <p className={styles.heroSubtitle}>Wir freuen uns auf Ihr Projekt</p>
            </div>
          </div>
        </section>

        {/* Contact Grid */}
        <section className={styles.contentSection}>
          <div className={styles.contactGrid}>
            {/* Contact Info */}
            <div className={styles.contactInfo}>
              <h2 className={styles.sectionTitle}>Direkter Kontakt</h2>
              
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>📞</div>
                <div>
                  <h3 className={styles.contactTitle}>Telefon</h3>
                  <a href="tel:+491234567890" className={styles.contactLink}>
                    +49 123 4567890
                  </a>
                  <p className={styles.contactHours}>Mo-Fr: 9:00-18:00</p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>✉️</div>
                <div>
                  <h3 className={styles.contactTitle}>E-Mail</h3>
                  <a href="mailto:kontakt@ihrefirma.de" className={styles.contactLink}>
                    kontakt@ihrefirma.de
                  </a>
                  <p className={styles.contactHours}>Antwort in 24h</p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>📍</div>
                <div>
                  <h3 className={styles.contactTitle}>Standort</h3>
                  <p className={styles.contactText}>
                    Musterstraße 123<br />
                    10115 Berlin<br />
                    Deutschland
                  </p>
                </div>
              </div>

              <div className={styles.emergencyContact}>
                <div className={styles.emergencyIcon}>🚨</div>
                <div>
                  <h3 className={styles.emergencyTitle}>Notfall-Support</h3>
                  <a href="tel:+491701234567" className={styles.emergencyLink}>
                    +49 170 1234567
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className={styles.contactFormContainer}>
              <h2 className={styles.sectionTitle}>Nachricht senden</h2>
              
              {submitStatus === 'success' && (
                <div className={styles.successMessage}>
                  ✅ Vielen Dank! Wir melden uns bald.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className={styles.errorMessage}>
                  ❌ Bitte versuchen Sie es erneut.
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.formLabel}>
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                      placeholder="Ihr Name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.formLabel}>
                      E-Mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={styles.formInput}
                      required
                      placeholder="ihre@email.de"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject" className={styles.formLabel}>
                    Betreff
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="">Bitte wählen</option>
                    <option value="beratung">Beratung</option>
                    <option value="angebot">Angebot</option>
                    <option value="support">Support</option>
                    <option value="sonstiges">Sonstiges</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.formLabel}>
                    Nachricht
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={styles.formTextarea}
                    required
                    rows={6}
                    placeholder="Ihre Nachricht..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="privacyAccepted"
                      checked={formData.privacyAccepted}
                      onChange={handleInputChange}
                      className={styles.checkboxInput}
                      required
                    />
                    <span>
                      Ich akzeptiere die <a href="/datenschutz" className={styles.privacyLink}>Datenschutzerklärung</a>
                    </span>
                  </label>
                </div>

                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2 className={styles.faqTitle}>Häufige Fragen</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3>Wie schnell antworten Sie?</h3>
              <p>Innerhalb von 24 Stunden während der Geschäftszeiten.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Gibt es eine Erstberatung?</h3>
              <p>Ja, kostenlose 30-minütige Erstberatung.</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Welche Zeitzone?</h3>
              <p>MEZ (Mitteleuropäische Zeit).</p>
            </div>
            <div className={styles.faqItem}>
              <h3>Notfallkontakt?</h3>
              <p>24/7 Notfall-Support für Bestandskunden.</p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Kontakt;