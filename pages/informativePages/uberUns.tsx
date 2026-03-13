import Image from 'next/image';
import Head from 'next/head';
import styles from './uberUns.module.css';
import Footer from '../../components/footer/Footer';
import { useLanguage } from '../../contexts/LanguageContext';
import { useEffect, useRef } from 'react';

const UberUns = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (heroRef.current) {
      heroRef.current.classList.add(styles.visible);
    }
  }, []);

  const scrollToFooter = () => {
    document.getElementById('contacto')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  
  return (
    <>
      <Head>
        <title>{t('uns.title')}</title>
        <meta name="description" content={t('uns.description')} />
        <meta name="keywords" content={t('uns.keywords')} />

        {/* Open Graph */}
        <meta property="og:title" content={t('uns.ogTitle')} />
        <meta property="og:description" content={t('uns.ogDescription')} />
        <meta property="og:type" content="website" />
      </Head>

      {/* HERO */}
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.heroImageContainer}>
          <Image
            src="/img/alpinaYo.webp" 
            alt="Professional team"
            fill
            priority
            className={styles.heroImage}
            sizes="100vw"
            quality={90}
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.heroContent}>
          <h1>{t('uns.heroTitle')}</h1>
          <p>{t('uns.heroSubtitle')}</p>
          <button onClick={scrollToFooter} className={styles.ctaButton}>
            {t('uns.ctaButton')}
          </button>
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section className={styles.section}>
        <h2>{t('uns.section1Title')}</h2>
        
        {/* PRIMERA IMAGEN AGREGADA */}
        <div className={styles.sectionImage}>
          <Image
            src="/img/stapler.webp" 
            alt="Equipo trabajando"
            width={800}
            height={400}
            className={styles.responsiveImage}
          />
        </div>
        
        <p>{t('uns.section1Text1')}</p>
        <p>{t('uns.section1Text2')}</p>
      </section>

      {/* SERVICIOS */}
      <section className={styles.sectionAlt}>
        <h2>{t('uns.section2Title')}</h2>

        <div className={styles.servicesGrid}>
          <div className={styles.serviceCard}>
            <h3>{t('uns.services.development.title')}</h3>
            <p>{t('uns.services.development.text')}</p>
          </div>

          <div className={styles.serviceCard}>
            <h3>{t('uns.services.maintenance.title')}</h3>
            <p>{t('uns.services.maintenance.text')}</p>
          </div>

          <div className={styles.serviceCard}>
            <h3>{t('uns.services.consulting.title')}</h3>
            <p>{t('uns.services.consulting.text')}</p>
          </div>
        </div>
      </section>

      {/* PROFESIONALIDAD */}
      <section className={styles.section}>
        <h2>{t('uns.section3Title')}</h2>
        
        {/* SEGUNDA IMAGEN AGREGADA */}
        <div className={styles.sectionImage}>
          <Image
            src="/img/alpinaYo.webp" /* CAMBIA ESTA RUTA */
            alt="Oficina moderna"
            width={800}
            height={400}
            className={styles.responsiveImage}
          />
        </div>
        
        <p>{t('uns.section3Text')}</p>

        <ul className={styles.professionalList}>
          <li>{t('uns.professionalList1')}</li>
          <li>{t('uns.professionalList2')}</li>
          <li>{t('uns.professionalList3')}</li>
          <li>{t('uns.professionalList4')}</li>
          <li>{t('uns.professionalList5')}</li>
          <li>{t('uns.professionalList6')}</li>
        </ul>
      </section>

      {/* TEAM */}
      <section className={styles.sectionAlt}>
        <h2>{t('uns.section4Title')}</h2>
        <p className={styles.subtitle}>{t('uns.section4Subtitle')}</p>

        <div className={styles.teamCard}>
          <div className={styles.profileImageContainer}>
            <Image
              src="/img/Mariano.webp" 
              alt="Mariano Ryser"
              width={150}
              height={150}
              className={styles.profileImage}
            />
          </div>
          <h3>{t('uns.team.member1.name')}</h3>
          <span>{t('uns.team.member1.role')}</span>
          <p>{t('uns.team.member1.bio')}</p>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>{t('uns.ctaTitle')}</h2>
        <p>{t('uns.ctaText')}</p>

        <button onClick={scrollToFooter} className={styles.ctaButton}>
          {t('uns.ctaButton')}
        </button>
      </section>

      <Footer />
      <div id="contacto"></div>
    </>
  );
};

export default UberUns;