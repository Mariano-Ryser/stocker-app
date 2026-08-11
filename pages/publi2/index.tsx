import { useEffect, useState } from "react";
import { 
  Brain,
  Cpu,
  Database,
  Cloud,
  Shield,
  Rocket,
  Target,
  BarChart3,
  Users,
  Globe,
  Smartphone,
  Zap
} from "lucide-react";

export default function Publi2() {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const phrases = [
    "✨ StockerCloud",
    "🧠 Inteligencia Artificial",
    "⚡ Gestión Predictiva",
    "🛡️ Seguridad Avanzada",
    "☁️ Cloud Native",
    "🌐 Conecta tu Negocio",
    "📊 Big Data Integrado",
    "🚀 Escalabilidad Ilimitada",
    "🎯 Precisión y Control",
    "💡 Innovación Constante",
    "🔮 IA Predictiva",
    "🛡️ Protección de Datos",
    "🌍 Acceso Global",
    "📈 Análisis Inteligente"
  ];

  const cardData = [
    {
      icon: <Brain size={28} />,
      title: "🧠 IA Predictiva",
      description: "Anticipa la demanda y optimiza tu inventario con algoritmos de aprendizaje automático.",
      color: "#8B5CF6"
    },
    {
      icon: <Cpu size={28} />,
      title: "⚡ Procesamiento en Tiempo Real",
      description: "Análisis instantáneo de datos para tomar decisiones rápidas y precisas.",
      color: "#3B82F6"
    },
    {
      icon: <Database size={28} />,
      title: "📊 Big Data Integrado",
      description: "Centraliza todos tus datos en una plataforma escalable y segura.",
      color: "#10B981"
    },
    {
      icon: <Cloud size={28} />,
      title: "☁️ Cloud Native",
      description: "Accede a tu sistema desde cualquier lugar con nuestra infraestructura en la nube.",
      color: "#6366F1"
    },
    {
      icon: <Shield size={28} />,
      title: "🛡️ Seguridad Avanzada",
      description: "Protege tus datos con cifrado de última generación y autenticación biométrica.",
      color: "#EF4444"
    },
    {
      icon: <Rocket size={28} />,
      title: "🚀 Escalabilidad Ilimitada",
      description: "Crece sin límites con una arquitectura diseñada para negocios en expansión.",
      color: "#F59E0B"
    },
    {
      icon: <Target size={28} />,
      title: "🎯 Precisión Total",
      description: "Control absoluto de tu inventario con predicciones precisas al 98%.",
      color: "#EC4899"
    },
    {
      icon: <Users size={28} />,
      title: "👥 Equipos Conectados",
      description: "Trabaja en colaboración con tu equipo desde cualquier parte del mundo.",
      color: "#14B8A6"
    },
    {
      icon: <Globe size={28} />,
      title: "🌐 Conectividad Global",
      description: "Sincroniza tus operaciones a nivel internacional con nuestra red global.",
      color: "#8B5CF6"
    }
  ];

  // Animación del título
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentPhrase = phrases[currentIndex];
    
    if (!isDeleting) {
      if (displayText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, 80);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 40);
      } else {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <h1>
          <span className="typed-text">{displayText}</span>
          <span className="cursor">|</span>
        </h1>
        <p className="subtitle">
          La próxima generación de gestión de artículos
        </p>
      </div>

      {/* Grid de cartas */}
      <div className="cards-grid">
        {cardData.map((card, index) => (
          <div 
            key={index}
            className="feature-card"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              borderColor: `${card.color}40`
            }}
          >
            <div className="card-icon" style={{ background: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <div className="card-line" style={{ background: card.color }}></div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #020a01 0%, #23165c 30%, #071a08 70%, #0a0e27 100%);
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 6rem;
        }

        /* Header */
        .header {
          text-align: center;
          margin-bottom: 60px;
          width: 100%;
          max-width: 900px;
        }

        .badge {
          display: inline-block;
          padding: 8px 24px;
          background: rgba(37, 148, 141, 0.73);
          border: 1px solid rgba(78, 205, 196, 0.2);
          border-radius: 50px;
          font-size: 0.85rem;
          color: #4ECDC4;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 20px;
          animation: fadeInDown 0.6s ease;
        }

        h1 {
          font-size: 3.8rem;
          font-weight: 800;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          min-height: 80px;
          flex-wrap: wrap;
        }

        .typed-text {
          background: linear-gradient(135deg, #4ECDC4, #6C5CE7, #FF6B6B, #F59E0B);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 300% auto;
          animation: gradientMove 4s linear infinite;
        }

        @keyframes gradientMove {
          0% { background-position: 0% center; }
          100% { background-position: 300% center; }
        }

        .cursor {
          color: #4ECDC4;
          animation: blink 0.8s infinite;
          font-weight: 300;
          font-size: 3.8rem;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .subtitle {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 8px;
          font-weight: 300;
          letter-spacing: 1px;
        }

        /* Grid de cartas */
        .cards-grid {
          max-width: 1300px;
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 30px;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          opacity: 0;
          animation: cardAppear 0.6s ease forwards;
          cursor: pointer;
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .feature-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--card-color), transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .card-icon {
          transform: scale(1.1) rotate(-5deg);
        }

        .feature-card h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 10px;
          color: white;
        }

        .feature-card p {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          margin: 0;
        }

        .card-line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card:hover .card-line {
          opacity: 1;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          h1 {
            font-size: 3rem;
          }

          .cursor {
            font-size: 3rem;
          }
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 60px 16px 30px;
          }

          h1 {
            font-size: 2.2rem;
            min-height: 60px;
          }

          .cursor {
            font-size: 2.2rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .cards-grid {
            grid-template-columns: 1fr;
            max-width: 450px;
            gap: 20px;
          }

          .feature-card {
            padding: 24px;
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 1.6rem;
            min-height: 50px;
          }

          .cursor {
            font-size: 1.6rem;
          }

          .badge {
            font-size: 0.7rem;
            padding: 6px 16px;
          }

          .feature-card h3 {
            font-size: 1rem;
          }

          .feature-card p {
            font-size: 0.85rem;
          }

          .card-icon {
            width: 48px;
            height: 48px;
          }

          .card-icon svg {
            width: 22px;
            height: 22px;
          }
        }
      `}</style>
    </div>
  );
}