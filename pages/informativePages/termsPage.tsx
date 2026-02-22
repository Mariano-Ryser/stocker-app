import { useRouter } from "next/router";
import Footer from "../../components/footer/Footer";
import { useLanguage } from "../../contexts/LanguageContext";
import styles from "./TermsPage.module.css";
import { useEffect } from "react";

/**
 * Helper SSR-safe:
 * garantiza siempre un array
 */
const asArray = (value) => {
  if (Array.isArray(value)) return value;
  return [];
};

export default function TermsPage() {
  const router = useRouter();
  const { t} = useLanguage();

  const formatDate = () =>
    new Date().toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className={styles.termsContainer}>
      {/* Background / watermark */}
      <div className={styles.termsBackground}>
        <div className={styles.logoWatermark}>
          <img
            src="/img/logo78.png"
            alt="Alpina Logo"
            className={styles.watermarkLogo}
          />
        </div>
      </div>

      <div className={styles.termsContent}>
        {/* Header */}
        <header className={styles.termsHeader}>
          <button
            onClick={() => router.back()}
            className={styles.backButton}
          >
            {t("terms.backButton")}
          </button>
        </header>

        <main className={styles.termsMain}>
          {/* Title */}
          <div className={styles.termsHeaderSection}>
            <h1>{t("terms.title")}</h1>
            <p className={styles.effectiveDate}>
              {t("terms.effectiveDate").replace(
                "{{date}}",
                formatDate()
              )}
            </p>
          </div>

          <div className={styles.termsSections}>
            {/* 1. Scope */}
            <section className={styles.termsSection}>
              <h2>{t("terms.sections.scope.title")}</h2>
              {asArray(
                t("terms.sections.scope.paragraphs", {
                  returnObjects: true,
                })
              ).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </section>

            {/* 2. Description */}
            <section className={styles.termsSection}>
              <h2>{t("terms.sections.description.title")}</h2>
              <p>{t("terms.sections.description.intro")}</p>

              <ul>
                {asArray(
                  t("terms.sections.description.items", {
                    returnObjects: true,
                  })
                ).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <p>{t("terms.sections.description.outro")}</p>
            </section>

            {/* 3. Registration */}
            <section className={styles.termsSection}>
              <h2>{t("terms.sections.registration.title")}</h2>
              {asArray(
                t("terms.sections.registration.paragraphs", {
                  returnObjects: true,
                })
              ).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </section>

            {/* 4. Termination */}
            <section className={styles.termsSection}>
              <h2>{t("terms.sections.termination.title")}</h2>

              {asArray(
                t("terms.sections.termination.paragraphs", {
                  returnObjects: true,
                })
              ).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}

              <ul>
                {asArray(
                  t("terms.sections.termination.items", {
                    returnObjects: true,
                  })
                ).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <p>{t("terms.sections.termination.outro")}</p>
            </section>

            {/* 5. Payment */}
            <section className={styles.termsSection}>
              <h2>{t("terms.sections.payment.title")}</h2>
              {asArray(
                t("terms.sections.payment.paragraphs", {
                  returnObjects: true,
                })
              ).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </section>

            {/* 6. Privacy */}
            <section className={styles.termsSection}>
              <h2>{t("terms.sections.privacy.title")}</h2>
              {asArray(
                t("terms.sections.privacy.paragraphs", {
                  returnObjects: true,
                })
              ).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </section>

            {/* 7. Warranty */}
            <section className={styles.termsSection}>
              <h2>{t("terms.sections.warranty.title")}</h2>
              {asArray(
                t("terms.sections.warranty.paragraphs", {
                  returnObjects: true,
                })
              ).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </section>

            {/* 8. Intellectual Property */}
            <section className={styles.termsSection}>
              <h2>{t("terms.sections.intellectual.title")}</h2>
              {asArray(
                t("terms.sections.intellectual.paragraphs", {
                  returnObjects: true,
                })
              ).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </section>

            {/* 9. Final */}
            <section className={styles.termsSection}>
              <h2>{t("terms.sections.final.title")}</h2>
              {asArray(
                t("terms.sections.final.paragraphs", {
                  returnObjects: true,
                })
              ).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </section>

            {/* Contact */}
            <section className={styles.contactSection}>
              <h2>{t("terms.contact.title")}</h2>
              <p>{t("terms.contact.company")}</p>

              {asArray(
                t("terms.contact.address", {
                  returnObjects: true,
                })
              ).map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}

              <p>Email: {t("terms.contact.email")}</p>
              <p>Tel: {t("terms.contact.phone")}</p>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
