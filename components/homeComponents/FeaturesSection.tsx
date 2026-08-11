import { BarChart, Zap, Play, Shield } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const features = [
  {
    icon: <BarChart size={28} />,
    gradient: "linear-gradient(135deg, #273ea5 0%, #727eeb 100%)",
    bgGradient: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
  },
  {
    icon: <Zap size={28} />,
    gradient: "linear-gradient(135deg, #c190c7 0%, #f5576c 100%)",
    bgGradient: "linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)"
  },
  {
    icon: <Play size={28} />,
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    bgGradient: "linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%)"
  },
  {
    icon: <Shield size={28} />,
    gradient: "linear-gradient(135deg, #1c9e48 0%, #1ed817 100%)",
    bgGradient: "linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%)"
  },
];

export default function FeaturesSection() {
  const { t } = useLanguage();
   
  return (
    <section className="features">
      <div className="container">
        <div className="header">
          {/* <span className="badge">{t("featuresSection.badge") || "Características"}</span> */}
          <h2>{t("featuresSection.heading")}</h2>
          {/* <p className="subtitle">{t("featuresSection.subtitle") || "Descubre todo lo que podemos ofrecerte"}</p> */}
        </div>
        
        <div className="grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="icon-wrapper" style={{ background: f.gradient }}>
                <div className="icon">{f.icon}</div>
              </div>
              <h3>{t(`featuresSection.title${i + 1}`)}</h3>
              <p>{t(`featuresSection.f${i + 1}`)}</p>
              <div className="card-shine"></div>
              <div className="card-border" style={{ background: f.gradient }}></div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .features {
          padding: 80px 20px;
          background: linear-gradient(180deg, #f8faff 0%, #ffffff 100%);
          position: relative;
          overflow: hidden;
        }

        .features::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 50%, rgba(102, 126, 234, 0.03) 0%, transparent 70%);
          pointer-events: none;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .header {
          text-align: center;
          margin-bottom: 60px;
        }

        .badge {
          display: inline-block;
          padding: 6px 20px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          color: #667eea;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 50px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 16px;
          border: 1px solid rgba(102, 126, 234, 0.15);
        }

        @keyframes fadeFeaturesIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shineEffect {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .features h2 {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 3.2rem;
          margin-bottom: 16px;
          color: #254470;
          font-stretch: expanded;
          letter-spacing: 0.05em;
          background: linear-gradient(120deg, #254470 30%, #4a8bc2 50%, #7bb3e0 60%, #254470 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 
            fadeFeaturesIn 0.8s ease-out forwards,
            shineEffect 4.5s ease-in-out 1.5s forwards;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #6b7280;
          max-width: 500px;
          margin: 0 auto;
          animation: fadeFeaturesIn 0.8s ease-out 0.3s both;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }

        .feature-card {
          background: white;
          padding: 40px 30px 35px;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          text-align: center;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.04);
          animation: fadeFeaturesIn 0.8s ease-out forwards;
          animation-delay: ${(i: number) => i * 0.1}s;
          opacity: 0;
        }

        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.5s; }
        .feature-card:nth-child(3) { animation-delay: 1.1s; }
        .feature-card:nth-child(4) { animation-delay: 1.7s; }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          border-color: transparent;
        }

        .card-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card:hover .card-border {
          opacity: 1;
        }

        .card-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transform: skewX(-25deg);
          transition: left 0.6s ease;
          pointer-events: none;
        }

        .feature-card:hover .card-shine {
          left: 150%;
        }

        .icon-wrapper {
          width: 70px;
          height: 70px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
        }

        .feature-card:hover .icon-wrapper {
          transform: scale(1.05) rotate(-3deg);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .icon {
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .feature-card h3 {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #1f2937;
          transition: color 0.3s ease;
        }

        .feature-card:hover h3 {
          color: #254470;
        }

        .feature-card p {
          font-size: 0.95rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .features {
            padding: 100px 40px;
          }

          .grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 25px;
          }

          .feature-card {
            padding: 35px 25px 30px;
          }
        }

        @media (max-width: 639px) {
          .features h2 {
            font-size: 2.4rem;
          }
          
          .feature-card {
            padding: 30px 20px 25px;
          }
        }
      `}</style>
    </section>
  );
}