import React from "react";
import Router from "next/router";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./Footer.module.css";

export default function Footer() { 
  const { t } = useLanguage();

  // Definir las rutas SOLO para about, privacy e imprint
  const companyItems = [
    { key: "about", route: "/informativePages/uberUns" },
    { key: "privacy", route: "/informativePages/privacyPage" },
    { key: "imprint", route: "/informativePages/termsPage" }
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* BRAND */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <img
              src="/img/logo80.png"
              alt="Alpina logo"
              className={styles.logoImg}
            />
          </div>
          <p className={styles.brandDesc}>
            {t("footer.brandDesc")}
          </p>
        </div>

        {/* COMPANY - SOLO about, privacy, imprint */}
        <div className={styles.column}>
          <h3>{t("footer.company")}</h3>
          <ul>
            {companyItems.map((item, index) => (
              <li 
                key={index}
                onClick={() => Router.push(item.route)}
                className={styles.clickable}
              >
                {t(`footer.companyItems.${item.key}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* CONTACT */}
        <div className={`${styles.column} ${styles.contact}`}>
          <h3>{t("footer.contact")}</h3>

          <div className={styles.contactItem}>
            <Mail size={18} />
            <a href="mailto:rysermariano@gmail.com">
              rysermariano@gmail.com
            </a>
          </div>

          <div className={styles.contactItem}>
            <Phone size={18} />
            <a href="tel:+41788747974">+41 78 874 79 74</a>
          </div>

          <div className={styles.contactItem}>
            <MapPin size={18} />
            <span>{t("footer.country")}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className={styles.bottom}>
        <span>
          {t("footer.copyright").replace("{{year}}", new Date().getFullYear().toString())}
        </span>
      </div>
    </footer>
  );
}