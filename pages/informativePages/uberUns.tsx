import Image from 'next/image';
import Head from 'next/head';
import styles from './uberUns.module.css';
import Footer from '../../components/footer/Footer';
import { useLanguage } from '../../contexts/LanguageContext';
import { useEffect, useRef, useState } from 'react';

const UberUns = () => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [stars, setStars] = useState<{ x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    if (heroRef.current) {
      heroRef.current.classList.add(styles.visible);
    }

    const newStars = Array.from({ length: 80 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 6,
      duration: 2 + Math.random() * 4
    }));
    setStars(newStars);
  }, []);

  const scrollToFooter = () => {
    document.getElementById('contacto')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const blurPlaceholder = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAADAAQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

  return (
    <>
      <Head>
        <title>{t('uns.title')}</title>
        <meta name="description" content={t('uns.description')} />
        <meta name="keywords" content={t('uns.keywords')} />
        <meta property="og:title" content={t('uns.ogTitle')} />
        <meta property="og:description" content={t('uns.ogDescription')} />
        <meta property="og:type" content="website" />
      </Head>

      {/* Fondo de estrellas global */}
      <div className={styles.starsBackground}>
        {stars.map((star, i) => (
          <div
            key={i}
            className={styles.star}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
      </div>

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
            quality={80}
            placeholder="blur"
            blurDataURL={blurPlaceholder}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroGlow} />
        </div>

        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>✦ StockerCloud</span>
          <h1>{t('uns.heroTitle')}</h1>
          <p>{t('uns.heroSubtitle')}</p>
          <div className={styles.heroLine} />
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <span className={styles.ctaIcon}>🌿</span>
          <h2>{t('uns.ctaTitle')}</h2>
          <p>{t('uns.ctaText')}</p>
          <button onClick={scrollToFooter} className={styles.ctaButton}>
            {t('uns.ctaButton')} ✦
          </button>
        </div>
      </section>

      {/* QUIÉNES SOMOS */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>🌱 Naturaleza</span>
          <h2>{t('uns.section1Title')}</h2>
          <div className={styles.sectionDivider} />
        </div>

        <div className={styles.sectionImageWrapper}>
          <div className={styles.sectionImage}>
            <Image
              src="/img/wharehouse.png"
              alt="Equipo trabajando"
              width={800}
              height={400}
              className={styles.responsiveImage}
              quality={80}
              loading="lazy"
              placeholder="blur"
              blurDataURL={blurPlaceholder}
            />
            <div className={styles.imageGlow} />
          </div>
        </div>

        <div className={styles.sectionText}>
          <p>{t('uns.section1Text1')}</p>
          <p>{t('uns.section1Text2')}</p>
        </div>
      </section>



      {/* PROFESIONALIDAD */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>🌳 Valores</span>
          <h2>{t('uns.section3Title')}</h2>
          <div className={styles.sectionDivider} />
        </div>

        <div className={styles.sectionImageWrapper}>
          <div className={styles.sectionImage}>
            <Image
              src="/img/stapler.webp"
              alt="Oficina moderna"
              width={800}
              height={400}
              className={styles.responsiveImage}
              quality={80}
              loading="lazy"
              placeholder="blur"
              blurDataURL={blurPlaceholder}
            />
            <div className={styles.imageGlow} />
          </div>
        </div>

        <div className={styles.sectionText}>
          <p>{t('uns.section3Text')}</p>
        </div>

        <ul className={styles.professionalList}>
          <li>
            <span className={styles.listIcon}>✦</span>
            {t('uns.professionalList1')}
          </li>
          <li>
            <span className={styles.listIcon}>✦</span>
            {t('uns.professionalList2')}
          </li>
          <li>
            <span className={styles.listIcon}>✦</span>
            {t('uns.professionalList3')}
          </li>
          <li>
            <span className={styles.listIcon}>✦</span>
            {t('uns.professionalList4')}
          </li>
          <li>
            <span className={styles.listIcon}>✦</span>
            {t('uns.professionalList5')}
          </li>
          <li>
            <span className={styles.listIcon}>✦</span>
            {t('uns.professionalList6')}
          </li>
        </ul>
      </section>

      {/* TEAM */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>🌟 Equipo</span>
          <h2>{t('uns.section4Title')}</h2>
          <p className={styles.subtitle}>{t('uns.section4Subtitle')}</p>
          <div className={styles.sectionDivider} />
        </div>

        <div className={styles.teamCard}>
          <div className={styles.profileImageContainer}>
            <div className={styles.profileGlow} />
            <Image
              src="/img/Mariano.webp"
              alt="Mariano Ryser"
              width={150}
              height={150}
              className={styles.profileImage}
              quality={80}
              loading="lazy"
              placeholder="blur"
              blurDataURL={blurPlaceholder}
            />
          </div>
          <h3>{t('uns.team.member1.name')}</h3>
          <span className={styles.teamRole}>{t('uns.team.member1.role')}</span>
          <p className={styles.teamBio}>{t('uns.team.member1.bio')}</p>
          <div className={styles.teamLine} />
        </div>
      </section>

      <Footer />
      <div id="contacto"></div>
    </>
  );
};

export default UberUns;