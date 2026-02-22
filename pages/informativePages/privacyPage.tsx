import { useRouter } from "next/router";
import styles from './privacyPage.module.css';
import Footer from '../../components/footer/Footer';
import { useLanguage } from "../../contexts/LanguageContext";
import { useEffect } from "react";

export default function PrivacyPage() {
  const router = useRouter();
  const { t} = useLanguage();

  
  const currentDate = new Date().toLocaleDateString('de-DE', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.logoWatermark}>
          <img
            src="/img/logo78.png"
            alt="Alpina Logo"
            className={styles.watermarkLogo}
          />
        </div>
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <button 
            onClick={() => router.back()} 
            className={styles.backButton}
          >
            {t("privacy.backButton")}
          </button>
        </header>

        <main className={styles.main}>
          <div className={styles.headerSection}>
            <h1>{t("privacy.title")}</h1>
            <p className={styles.effectiveDate}>
              {t("privacy.effectiveDate").replace("{{date}}", currentDate)}
            </p>
            <p className={styles.intro}>
              {t("privacy.intro")}
            </p>
          </div>

          <div className={styles.sections}>
            {/* Sección 1: Verantwortlicher */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.responsible.title")}</h2>
              <p>{t("privacy.sections.responsible.text")}</p>
              <div className={styles.responsibleInfo}>
                <p><strong>{t("privacy.sections.responsible.company")}</strong></p>
                <p>{t("privacy.sections.responsible.address1")}</p>
                <p>{t("privacy.sections.responsible.address2")}</p>
                <p>{t("privacy.sections.responsible.address3")}</p>
                <p>{t("privacy.sections.responsible.email")}</p>
                <p>{t("privacy.sections.responsible.phone")}</p>
              </div>
            </section>

            {/* Sección 2: Grundsätze der Datenverarbeitung */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.principles.title")}</h2>
              <p>{t("privacy.sections.principles.text")}</p>
              <ul>
                <li>{t("privacy.sections.principles.items.lawfulness")}</li>
                <li>{t("privacy.sections.principles.items.goodFaith")}</li>
                <li>{t("privacy.sections.principles.items.purpose")}</li>
                <li>{t("privacy.sections.principles.items.minimization")}</li>
                <li>{t("privacy.sections.principles.items.storage")}</li>
                <li>{t("privacy.sections.principles.items.integrity")}</li>
              </ul>
            </section>

            {/* Sección 3: Arten der verarbeiteten Daten */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.dataTypes.title")}</h2>
              
              <h3>{t("privacy.sections.dataTypes.inventory.title")}</h3>
              <ul>
                <li>{t("privacy.sections.dataTypes.inventory.items.name")}</li>
                <li>{t("privacy.sections.dataTypes.inventory.items.email")}</li>
                <li>{t("privacy.sections.dataTypes.inventory.items.company")}</li>
                <li>{t("privacy.sections.dataTypes.inventory.items.position")}</li>
                <li>{t("privacy.sections.dataTypes.inventory.items.contact")}</li>
              </ul>

              <h3>{t("privacy.sections.dataTypes.usage.title")}</h3>
              <ul>
                <li>{t("privacy.sections.dataTypes.usage.items.ip")}</li>
                <li>{t("privacy.sections.dataTypes.usage.items.access")}</li>
                <li>{t("privacy.sections.dataTypes.usage.items.functions")}</li>
                <li>{t("privacy.sections.dataTypes.usage.items.device")}</li>
                <li>{t("privacy.sections.dataTypes.usage.items.browser")}</li>
              </ul>

              <h3>{t("privacy.sections.dataTypes.content.title")}</h3>
              <ul>
                <li>{t("privacy.sections.dataTypes.content.items.uploads")}</li>
                <li>{t("privacy.sections.dataTypes.content.items.analytics")}</li>
                <li>{t("privacy.sections.dataTypes.content.items.settings")}</li>
              </ul>
            </section>

            {/* Sección 4: Zwecke der Verarbeitung */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.purposes.title")}</h2>
              <ul>
                <li>{t("privacy.sections.purposes.items.platform")}</li>
                <li>{t("privacy.sections.purposes.items.authentication")}</li>
                <li>{t("privacy.sections.purposes.items.support")}</li>
                <li>{t("privacy.sections.purposes.items.billing")}</li>
                <li>{t("privacy.sections.purposes.items.improvement")}</li>
                <li>{t("privacy.sections.purposes.items.legal")}</li>
                <li>{t("privacy.sections.purposes.items.security")}</li>
              </ul>
            </section>

            {/* Sección 5: Rechtsgrundlagen der Verarbeitung */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.legalBasis.title")}</h2>
              <p>{t("privacy.sections.legalBasis.text")}</p>
              <ul>
                <li>{t("privacy.sections.legalBasis.items.consent")}</li>
                <li>{t("privacy.sections.legalBasis.items.contract")}</li>
                <li>{t("privacy.sections.legalBasis.items.legal")}</li>
                <li>{t("privacy.sections.legalBasis.items.interest")}</li>
              </ul>
            </section>

            {/* Sección 6: Datenweitergabe an Dritte */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.thirdParties.title")}</h2>
              <p>{t("privacy.sections.thirdParties.text")}</p>
              <ul>
                <li>{t("privacy.sections.thirdParties.items.hosting")}</li>
                <li>{t("privacy.sections.thirdParties.items.payment")}</li>
                <li>{t("privacy.sections.thirdParties.items.authorities")}</li>
                <li>{t("privacy.sections.thirdParties.items.business")}</li>
              </ul>
              <p>{t("privacy.sections.thirdParties.note")}</p>
            </section>

            {/* Sección 7: Internationale Datenübermittlungen */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.international.title")}</h2>
              <p>{t("privacy.sections.international.text")}</p>
              <ul>
                <li>{t("privacy.sections.international.items.adequacy")}</li>
                <li>{t("privacy.sections.international.items.guarantees")}</li>
                <li>{t("privacy.sections.international.items.consent")}</li>
              </ul>
            </section>

            {/* Sección 8: Datensicherheit */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.security.title")}</h2>
              <p>{t("privacy.sections.security.text")}</p>
              <ul>
                <li>{t("privacy.sections.security.items.encryption")}</li>
                <li>{t("privacy.sections.security.items.updates")}</li>
                <li>{t("privacy.sections.security.items.access")}</li>
                <li>{t("privacy.sections.security.items.audits")}</li>
                <li>{t("privacy.sections.security.items.backups")}</li>
              </ul>
              <p>{t("privacy.sections.security.note")}</p>
            </section>

            {/* Sección 9: Speicherdauer */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.storage.title")}</h2>
              <p>{t("privacy.sections.storage.text")}</p>
              <ul>
                <li>{t("privacy.sections.storage.items.account")}</li>
                <li>{t("privacy.sections.storage.items.usage")}</li>
                <li>{t("privacy.sections.storage.items.invoices")}</li>
                <li>{t("privacy.sections.storage.items.analytics")}</li>
              </ul>
            </section>

            {/* Sección 10: Ihre Rechte */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.rights.title")}</h2>
              <p>{t("privacy.sections.rights.text")}</p>
              <ul>
                <li>{t("privacy.sections.rights.items.information")}</li>
                <li>{t("privacy.sections.rights.items.correction")}</li>
                <li>{t("privacy.sections.rights.items.deletion")}</li>
                <li>{t("privacy.sections.rights.items.restriction")}</li>
                <li>{t("privacy.sections.rights.items.objection")}</li>
                <li>{t("privacy.sections.rights.items.portability")}</li>
                <li>{t("privacy.sections.rights.items.complaint")}</li>
              </ul>
            </section>

            {/* Sección 11: Cookies und Tracking */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.cookies.title")}</h2>
              <p>{t("privacy.sections.cookies.text")}</p>
              <table className={styles.cookiesTable}>
                <thead>
                  <tr>
                    <th>{t("privacy.sections.cookies.table.headers.type")}</th>
                    <th>{t("privacy.sections.cookies.table.headers.purpose")}</th>
                    <th>{t("privacy.sections.cookies.table.headers.duration")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{t("privacy.sections.cookies.table.rows.necessary.type")}</td>
                    <td>{t("privacy.sections.cookies.table.rows.necessary.purpose")}</td>
                    <td>{t("privacy.sections.cookies.table.rows.necessary.duration")}</td>
                  </tr>
                  <tr>
                    <td>{t("privacy.sections.cookies.table.rows.preference.type")}</td>
                    <td>{t("privacy.sections.cookies.table.rows.preference.purpose")}</td>
                    <td>{t("privacy.sections.cookies.table.rows.preference.duration")}</td>
                  </tr>
                  <tr>
                    <td>{t("privacy.sections.cookies.table.rows.statistics.type")}</td>
                    <td>{t("privacy.sections.cookies.table.rows.statistics.purpose")}</td>
                    <td>{t("privacy.sections.cookies.table.rows.statistics.duration")}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Sección 12: Kontaktaufnahme */}
            <section className={styles.section}>
              <h2>{t("privacy.sections.contact.title")}</h2>
              <p>{t("privacy.sections.contact.text")}</p>
              <div className={styles.contactInfo}>
                <p><strong>{t("privacy.sections.contact.officer.title")}</strong></p>
                <p>{t("privacy.sections.contact.officer.name")}</p>
                <p>{t("privacy.sections.contact.officer.email")}</p>
                <p>{t("privacy.sections.contact.officer.phone")}</p>
                <br />
                <p><strong>{t("privacy.sections.contact.authority.title")}</strong></p>
                <p>{t("privacy.sections.contact.authority.name")}</p>
                <p>{t("privacy.sections.contact.authority.address1")}</p>
                <p>{t("privacy.sections.contact.authority.address2")}</p>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}