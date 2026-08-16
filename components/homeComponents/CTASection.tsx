import Router from "next/router";
import { useLanguage } from '../../contexts/LanguageContext';
import { useEffect, useState } from "react";

export default function CTASection() {
  const { t } = useLanguage();
  const [stars, setStars] = useState<{ x: number; y: number; size: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Generar estrellas aleatorias
    const newStars = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 15,
      duration: 15 + Math.random() * 3
    }));
    setStars(newStars);
  }, []);

  return (
    <section className="cta">
      {/* Montañas SVG de fondo */}
      <div className="mountains">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            fill="rgba(76, 175, 80, 0.04)" 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <path 
            fill="rgba(212, 163, 115, 0.03)" 
            d="M0,192L48,176C96,160,192,128,288,128C384,128,480,160,576,176C672,192,768,192,864,176C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <path 
            fill="rgba(76, 175, 80, 0.02)" 
            d="M0,256L48,240C96,224,192,192,288,192C384,192,480,224,576,240C672,256,768,256,864,240C960,224,1056,192,1152,192C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Estrellas */}
      <div className="stars-container">
        {stars.map((star, i) => (
          <div
            key={i}
            className="star"
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

      <div className="container">
        <div className="content">
          <div className="badge">🌿 StockerCloud</div>
          <h2>{t("CTASection.title") || "Übernehmen Sie noch heute die Kontrolle über Ihren Lagerbestand"}</h2>
          <p>
            {t("CTASection.p") || "In weniger als 10 Minuten haben Sie Ihren gesamten Lagerbestand organisiert und fehlerfrei."}
          </p>

          {/* <div className="buttons">
            <button
              className="btn primary"
              onClick={() => Router.push("/register")}
            >
              {t("CTASection.button") || "Jetzt starten →"}
            </button>
            <button
              className="btn secondary"
              onClick={() => Router.push("/informativePages/uberUns")}
            >
              {t("CTASection.button2") || "Mehr erfahren"}
            </button>
          </div> */}
        </div>
      </div>

      <style jsx>{`
        .cta {
          padding: 80px 24px;
          background: linear-gradient(180deg, #0a0e27 0%, #1a1040 30%, #0d1233 70%, #0a0e27 100%);
          text-align: center;
          position: relative;
          overflow: hidden;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        /* Montañas */
        .mountains {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 200px;
          pointer-events: none;
          z-index: 0;
        }

        .mountains svg {
          width: 100%;
          height: 100%;
        }

        /* Estrellas */
        .stars-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0;
          animation: twinkle ease-in-out infinite;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .container {
          max-width: 960px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .content {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          padding: 60px 50px;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }

        .content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #d4a373, #4caf50, #d4a373, transparent);
          opacity: 0.5;
        }

        .badge {
          display: inline-block;
          padding: 6px 20px;
          background: linear-gradient(135deg, rgba(212, 163, 115, 0.1), rgba(76, 175, 80, 0.1));
          border: 1px solid rgba(212, 163, 115, 0.1);
          border-radius: 50px;
          font-size: 0.75rem;
          color: #d4a373;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .cta h2 {
          font-size: 2.8rem;
          font-weight: 800;
          margin-bottom: 16px;
          line-height: 1.2;
          color: #d4a373;
          text-shadow: 0 0 40px rgba(212, 163, 115, 0.05);
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .cta p {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 32px;
          line-height: 1.7;
          max-width: 720px;
          margin-left: auto;
          margin-right: auto;
        }

        .buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn {
          font-size: 1rem;
          padding: 14px 32px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: none;
          letter-spacing: 0.3px;
        }

        .btn.primary {
          background: linear-gradient(135deg, #4caf50, #388e3c);
          color: white;
          border: 1px solid rgba(76, 175, 80, 0.3);
          box-shadow: 0 4px 20px rgba(76, 175, 80, 0.15);
        }

        .btn.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 35px rgba(76, 175, 80, 0.25);
          border-color: rgba(76, 175, 80, 0.5);
        }

        .btn.secondary {
          background: rgba(212, 163, 115, 0.05);
          border: 1px solid rgba(212, 163, 115, 0.15);
          color: #d4a373;
        }

        .btn.secondary:hover {
          transform: translateY(-3px);
          border-color: rgba(212, 163, 115, 0.3);
          background: rgba(212, 163, 115, 0.08);
          box-shadow: 0 8px 25px rgba(212, 163, 115, 0.05);
        }

        .btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.35);
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .cta {
            padding: 60px 16px;
            min-height: 400px;
          }

          .content {
            padding: 40px 30px;
            border-radius: 20px;
          }

          .cta h2 {
            font-size: 2rem;
          }

          .cta p {
            font-size: 1rem;
          }

          .mountains {
            height: 120px;
          }
        }

        @media (max-width: 640px) {
          .cta {
            padding: 40px 12px;
            min-height: 350px;
          }

          .content {
            padding: 30px 20px;
            border-radius: 16px;
          }

          .cta h2 {
            font-size: 1.6rem;
          }

          .cta p {
            font-size: 0.9rem;
            margin-bottom: 24px;
          }

          .buttons {
            flex-direction: column;
            gap: 12px;
            width: 100%;
          }

          .btn {
            width: 100%;
            padding: 12px 24px;
            font-size: 0.9rem;
          }

          .badge {
            font-size: 0.65rem;
            padding: 4px 14px;
          }

          .mountains {
            height: 80px;
          }
        }

        @media (max-width: 400px) {
          .cta h2 {
            font-size: 1.3rem;
          }

          .content {
            padding: 24px 16px;
          }

          .cta p {
            font-size: 0.85rem;
          }

          .btn {
            font-size: 0.85rem;
            padding: 10px 20px;
          }
        }
      `}</style>
    </section>
  );
}