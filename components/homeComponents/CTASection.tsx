import Router from "next/router";
import {useLanguage} from '../../contexts/LanguageContext';
import { useEffect } from "react";
export default function CTASection() {
  const { t } = useLanguage();
  return (
    <section className="cta">
      <div className="container">
        <h2>{t("CTASection.title")}</h2>
        <p>
          {t("CTASection.p")}
        </p>
        {/* <div className="buttons">
           <button className="secondary" onClick={() => Router.push("/login")}>
            {t("CTASection.login")}
          </button> 
           <button className="secondary" onClick={() => Router.push("/")}>
            {t("CTASection.testen")}
          </button> 
        </div> */}

      </div>

      <style jsx>{`
        .cta {
          padding: 80px 24px;
          background: white;
          text-align: center;
          margin: 80px auto;
          max-width: 960px;
          transition: transform 0.3s ease;
        }
        .cta h2 {
          font-size: 2.25rem;
          margin-bottom: 20px;
          font-weight: 700;
          line-height: 1.2;
        }
        .cta p {
          font-size: 1.125rem;
          margin-bottom: 30px;
          line-height: 1.6;
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
        }
        .buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .buttons button {
          font-size: 1rem;
          padding: 14px 32px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .buttons .primary {
          border: solid 1px black;
          color: white;
          border: 1px solid var(--primary);
       }
        .buttons .primary:hover {
          opacity: 0.95;
        }
       .secondary {
          background: transparent;
          border: 1px solid #e5e7eb;
          color: var(--dark);
        }
        .secondary:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        @media (max-width: 640px) {
            .cta {
          padding: 0px 5px;
          background: white;
          text-align: center;
          margin: 70px auto;
          max-width: 960px;
          transition: transform 0.3s ease;
        }
          .cta h2 {
            font-size: 1.7rem;
          }
             .cta p {
          font-size: 0.9rem;
          margin-bottom: 20px;
          line-height: 1.6;
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
        }
          .buttons {

            flex-direction: column;
            gap: 14px;
          }
        }
      `}</style>
    </section>
  );
}
