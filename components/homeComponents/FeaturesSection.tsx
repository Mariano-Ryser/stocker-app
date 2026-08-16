import { BarChart, Zap, Play, Shield, Package, ShoppingCart, Truck, Star, Leaf, TreePine, Mountain, Sprout } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const features = [
  {
    icon: <Package size={28} />,
    gradient: "linear-gradient(135deg, #d4a373 0%, #c4905a 100%)",
    bgGradient: "linear-gradient(135deg, rgba(212, 163, 115, 0.1) 0%, rgba(196, 144, 90, 0.1) 100%)",
    color: "#d4a373"
  },
  {
    icon: <ShoppingCart size={28} />,
    gradient: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
    bgGradient: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%)",
    color: "#4caf50"
  },
  {
    icon: <Truck size={28} />,
    gradient: "linear-gradient(135deg, #d4a373 0%, #a67b5b 100%)",
    bgGradient: "linear-gradient(135deg, rgba(212, 163, 115, 0.1) 0%, rgba(166, 123, 91, 0.1) 100%)",
    color: "#d4a373"
  },
  {
    icon: <Star size={28} />,
    gradient: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
    bgGradient: "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%)",
    color: "#4caf50"
  }
];

export default function FeaturesSection() {
  const { t } = useLanguage();
   
  return (
    <section className="features">
      <div className="container">
        <div className="header">
          <h2>{t("featuresSection.heading")}</h2>
        </div>
        
        <div className="grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="icon-wrapper" style={{ background: f.gradient }}>
                <div className="icon">{f.icon}</div>
              </div>
              <h3>{t(`featuresSection.title${i + 1}`)}</h3>
              <p>{t(`featuresSection.f${i + 1}`)}</p>
              <div className="card-shine"></div>
              <div className="card-border" style={{ background: f.gradient }}></div>
              <div className="card-glow" style={{ background: f.color }}></div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .features {
          padding: 80px 20px;
          background: linear-gradient(180deg, #0a0e27 0%, #1a1040 30%, #0d1233 70%, #0a0e27 100%);
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
          background: 
            radial-gradient(circle at 30% 50%, rgba(212, 163, 115, 0.03) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(76, 175, 80, 0.03) 0%, transparent 60%);
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
          font-stretch: expanded;
          letter-spacing: 0.05em;
          background: linear-gradient(120deg, #d4a373 30%, #4caf50 50%, #d4a373 60%, #4caf50 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 
            fadeFeaturesIn 0.8s ease-out forwards,
            shineEffect 4.5s ease-in-out 1.5s forwards;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          padding: 40px 30px 35px;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          text-align: center;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.05);
          animation: fadeFeaturesIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .feature-card:nth-child(1) { animation-delay: 0.1s; }
        .feature-card:nth-child(2) { animation-delay: 0.3s; }
        .feature-card:nth-child(3) { animation-delay: 0.5s; }
        .feature-card:nth-child(4) { animation-delay: 0.7s; }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
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
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
          transform: skewX(-25deg);
          transition: left 0.6s ease;
          pointer-events: none;
        }

        .feature-card:hover .card-shine {
          left: 150%;
        }

        .card-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          border-radius: 50%;
          opacity: 0;
          filter: blur(60px);
          transition: opacity 0.6s ease;
          pointer-events: none;
        }

        .feature-card:hover .card-glow {
          opacity: 0.08;
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
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .icon {
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .feature-card h3 {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #d4a373;
          transition: color 0.3s ease;
        }

        .feature-card:hover h3 {
          color: #4caf50;
        }

        .feature-card p {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.6);
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

          .feature-card h3 {
            font-size: 1.1rem;
          }

          .icon-wrapper {
            width: 60px;
            height: 60px;
          }

          .icon svg {
            width: 24px;
            height: 24px;
          }
        }

        @media (max-width: 400px) {
          .features h2 {
            font-size: 2rem;
          }

          .feature-card {
            padding: 24px 16px 20px;
          }

          .feature-card h3 {
            font-size: 1rem;
          }

          .feature-card p {
            font-size: 0.85rem;
          }

          .icon-wrapper {
            width: 50px;
            height: 50px;
          }

          .icon svg {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </section>
  );
} 