import { BarChart, Zap, Play, Shield } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useEffect } from "react";

const features = [ 
  {
    icon: <BarChart size={28} />,
  },
  {
    icon: <Zap size={28} />,
 },
  {
    icon: <Play size={28} />,
 },
  {
    icon: <Shield size={28} />,
 },
];

export default function FeaturesSection() {
  const { t } = useLanguage();
   
  return (
    <section className="features">
      <div className="container">
        <h2>{t("featuresSection.heading")}</h2>
        <div className="grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="icon">{f.icon}</div>
              <h3>{t(`featuresSection.title${i + 1}`)}</h3>
              <p>{t(`featuresSection.f${i + 1}`)}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .features {
          padding: 20px 16px; /* más padding lateral */
          background: #f9f9f9;
          animation: fadeFeaturesIn 1s ease-in-out;
        }
        @keyframes fadeFeaturesIn {
          from {
            opacity: 0;
            transform: translateY(122px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }


        .features h2 {
          text-align: center;
          font-size: 2.2rem;
          margin-bottom: 50px;
          color: #1f2937;
        }

        .container {
          max-width: 1000px; /* ancho más contenido */
          margin: 1rem auto 4rem auto;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }

        .feature-card {
          background: white;
          padding: 28px;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
          text-align: center;
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-6px);
        }

        .icon {
          margin-bottom: 16px;
          color: #2563eb;
        }

        .feature-card h3 {
          font-size: 1.2rem;
          margin-bottom: 12px;
          color: #1f2937;
        }

        .feature-card p {
          font-size: 0.95rem;
          color: #6b7280;
          line-height: 1.5;
        }

        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </section>
  );
}
