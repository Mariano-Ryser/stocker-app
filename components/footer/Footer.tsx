// components/layout/Footer.tsx
import React, { memo, useCallback } from "react";
import { useRouter } from "next/router";
import { Mail, Phone, MapPin, Globe, Github, Twitter, Linkedin, ArrowUp } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./Footer.module.css";

interface FooterLink {
  key: string;
  route: string;
}

interface SocialLink {
  icon: React.ReactNode;
  url: string;
  label: string;
}

const Footer = memo(() => {
  const router = useRouter();
  const { t } = useLanguage();

  const companyItems: FooterLink[] = [
    { key: "about", route: "/informativePages/uberUns" },
    { key: "privacy", route: "/informativePages/privacyPage" },
    { key: "imprint", route: "/informativePages/termsPage" },
  ];

  // ✅ Social links con iconos blancos
  const socialLinks: SocialLink[] = [
    { 
      icon: <Github size={18} className={styles.iconWhite} />, 
      url: "https://github.com", 
      label: "GitHub" 
    },
    { 
      icon: <Twitter size={18} className={styles.iconWhite} />, 
      url: "https://twitter.com", 
      label: "Twitter" 
    },
    { 
      icon: <Linkedin size={18} className={styles.iconWhite} />, 
      url: "https://linkedin.com", 
      label: "LinkedIn" 
    },
  ];

  const handleNavigation = useCallback((route: string) => {
    router.push(route);
  }, [router]);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        {/* BRAND */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <img
              src="/img/logo80.png"
              alt="Stocker - Gestión de inventario"
              className={styles.logoImg}
              width={160}
              height={120}
              loading="lazy"
            />
          </div>
          <p className={styles.brandDesc}>
            {t("footer.brandDesc")}
          </p>
          
          {/* Social Links */}
          <div className={styles.socialLinks}>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={social.label}
                title={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* COMPANY LINKS */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>{t("footer.company")}</h3>
          <ul className={styles.linkList}>
            {companyItems.map((item) => (
              <li key={item.key}>
                <button
                  className={styles.linkButton}
                  onClick={() => handleNavigation(item.route)}
                  aria-label={t(`footer.companyItems.${item.key}`)}
                >
                  {t(`footer.companyItems.${item.key}`)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* CONTACT */}
        <div className={`${styles.column} ${styles.contact}`}>
          <h3 className={styles.columnTitle}>{t("footer.contact")}</h3>

          <div className={styles.contactItem}>
            <Mail size={18} className={styles.iconWhite} />
            <a 
              href="mailto:rysermariano@gmail.com"
              className={styles.contactLink}
              aria-label="Enviar email"
            >
              rysermariano@gmail.com
            </a>
          </div>

          <div className={styles.contactItem}>
            <Phone size={18} className={styles.iconWhite} />
            <a 
              href="tel:+41788747974"
              className={styles.contactLink}
              aria-label="Llamar por teléfono"
            >
              +41 78 874 79 74
            </a>
          </div>

          <div className={styles.contactItem}>
            <MapPin size={18} className={styles.iconWhite} />
            <span className={styles.contactText}>
              {t("footer.country")}
            </span>
          </div>

          {/* <div className={styles.contactItem}>
            <Globe size={18} className={styles.iconWhite} />
            <span className={styles.contactText}>
              {t("footer.language") || "Español"}
            </span>
          </div> */}
        </div>
      </div>

      {/* BOTTOM */}
      <div className={styles.bottom}>
        <div className={styles.bottomContent}>
          <span className={styles.copyright}>
            {t("footer.copyright").replace("{{year}}", currentYear.toString())}
          </span>
          
          <div className={styles.bottomLinks}>
            <button
              className={styles.bottomLink}
              onClick={() => handleNavigation("/informativePages/privacyPage")}
            >
              {t("footer.companyItems.privacy")}
            </button>
            <span className={styles.bottomDivider}>|</span>
            <button
              className={styles.bottomLink}
              onClick={() => handleNavigation("/informativePages/termsPage")}
            >
              {t("footer.companyItems.imprint")}
            </button>
          </div>

          {/* Scroll to top button */}
          <button
            className={styles.scrollTop}
            onClick={handleScrollToTop}
            aria-label="Volver arriba"
            title="Volver arriba"
          >
            <ArrowUp size={18} className={styles.iconWhite} />
          </button>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;