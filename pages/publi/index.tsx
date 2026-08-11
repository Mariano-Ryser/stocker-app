import { useEffect, useState, useRef } from "react";
import { 
  Camera, 
  Video, 
  Sparkles, 
  TrendingUp, 
  Share2,
  Package,
  ShoppingCart,
  Truck,
  Star,
  Zap
} from "lucide-react";

export default function PubliIndex() {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Estado para los textos de las tarjetas
  const [cardTexts, setCardTexts] = useState([
    { title: "", description: "", titleComplete: false, descComplete: false },
    { title: "", description: "", titleComplete: false, descComplete: false },
    { title: "", description: "", titleComplete: false, descComplete: false },
    { title: "", description: "", titleComplete: false, descComplete: false },
    { title: "", description: "", titleComplete: false, descComplete: false }
  ]);

  const cardIndexRef = useRef(0);
  const isTitleRef = useRef(true);

  const phrases = [
    "StockerCloud",
    "Sistema de gestión",
    "Para artículos",
    "Inteligente y rápido"
  ];

  // Datos de las tarjetas con los textos a animar
  const cardData = [
    {
      icon: <Package size={28} />,
      title: "¿Qué es StockerCloud?",
      description: "Sistema inteligente de gestión de artículos que optimiza tu inventario en tiempo real.",
      animation: "slideRight"
    },
    {
      icon: <ShoppingCart size={28} />,
      title: "Gestión de inventario",
      description: "Controla tus existencias, recibe alertas y mantén tu stock siempre actualizado.",
      animation: "slideLeft"
    },
    {
      icon: <Truck size={28} />,
      title: "Logística eficiente",
      description: "Optimiza tus envíos y seguimiento de productos con nuestra plataforma integrada.",
      animation: "scale"
    },
    {
      icon: <Star size={28} />,
      title: "Análisis inteligente",
      description: "Obtén reportes detallados y predicciones para tomar mejores decisiones de negocio.",
      animation: "flip"
    },
    {
      icon: <Zap size={28} />,
      title: "Integración fácil",
      description: "Conecta con tus sistemas actuales y comienza a gestionar en minutos.",
      animation: "bounce"
    }
  ];

  // Animación del título principal
  useEffect(() => {
    let timeout;
    const currentPhrase = phrases[currentIndex];
    
    if (!isDeleting) {
      if (displayText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, 100);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentIndex]);

  // Animación de los textos de las tarjetas
  useEffect(() => {
    let timeout;
    let shouldContinue = false;

    // Revisar si hay alguna tarjeta que todavía necesite animación
    const hasPending = cardTexts.some(
      (card, idx) => !card.titleComplete || !card.descComplete
    );

    if (!hasPending) return;

    // Encontrar la primera tarjeta que no esté completa
    let targetIndex = -1;
    let isTitle = true;

    for (let i = 0; i < cardTexts.length; i++) {
      if (!cardTexts[i].titleComplete) {
        targetIndex = i;
        isTitle = true;
        break;
      } else if (!cardTexts[i].descComplete) {
        targetIndex = i;
        isTitle = false;
        break;
      }
    }

    if (targetIndex === -1) return;

    const targetCard = cardData[targetIndex];
    const currentText = isTitle ? cardTexts[targetIndex].title : cardTexts[targetIndex].description;
    const targetText = isTitle ? targetCard.title : targetCard.description;

    if (currentText.length < targetText.length) {
      timeout = setTimeout(() => {
        const newCardTexts = [...cardTexts];
        if (isTitle) {
          newCardTexts[targetIndex].title = targetText.slice(0, currentText.length + 1);
        } else {
          newCardTexts[targetIndex].description = targetText.slice(0, currentText.length + 1);
        }
        setCardTexts(newCardTexts);
      }, 30);
    } else {
      // Marcar como completado
      timeout = setTimeout(() => {
        const newCardTexts = [...cardTexts];
        if (isTitle) {
          newCardTexts[targetIndex].titleComplete = true;
        } else {
          newCardTexts[targetIndex].descComplete = true;
        }
        setCardTexts(newCardTexts);
      }, 300);
    }

    return () => clearTimeout(timeout);
  }, [cardTexts, cardData]);

  return (
    <div className="page-container">
      {/* Título animado */}
      <div className="header">
        <h1>
          <span className="cursor">|</span>
          <span className="typed-text">{displayText}</span>
        </h1>
        <p className="subtitle">Sistema de gestión de artículos inteligente</p>
      </div>

      {/* Tarjetas verticales */}
      <div className="cards-container">
        {cardData.map((card, index) => (
          <div 
            key={index} 
            className={`feature-card animation-${card.animation}`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div className="card-content">
              <div className="card-icon">{card.icon}</div>
              <div className="card-text">
                <h3>
                  {cardTexts[index].title}
                  {!cardTexts[index].titleComplete && <span className="cursor-small">|</span>}
                </h3>
                <p>
                  {cardTexts[index].description}
                  {!cardTexts[index].descComplete && <span className="cursor-small">|</span>}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f4e 50%, #0d1233 100%);
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 60px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 6rem;
        }

        /* Header */
        .header {
          text-align: center;
          margin-bottom: 50px;
          max-width: 800px;
        }

        h1 {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          min-height: 80px;
        }

        .cursor {
          color: #4ECDC4;
          animation: blink 0.8s infinite;
          font-weight: 300;
          font-size: 3.5rem;
        }

        .cursor-small {
          color: #4ECDC4;
          animation: blink 0.8s infinite;
          font-weight: 300;
          font-size: 1.2rem;
          margin-left: 2px;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .typed-text {
          background: linear-gradient(135deg, #4ECDC4, #6C5CE7, #FF6B6B);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: shineText 3s linear infinite;
        }

        @keyframes shineText {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        .subtitle {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 8px;
        }

        /* Cards Container - Vertical */
        .cards-container {
          max-width: 800px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Feature Card - Base */
        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 28px 32px;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          opacity: 0;
        }

        /* Animaciones diferentes para cada tarjeta */
        .feature-card.animation-slideRight {
          animation: slideRight 0.6s ease forwards;
        }

        .feature-card.animation-slideLeft {
          animation: slideLeft 0.6s ease forwards;
        }

        .feature-card.animation-scale {
          animation: scaleIn 0.6s ease forwards;
        }

        .feature-card.animation-flip {
          animation: flipIn 0.6s ease forwards;
        }

        .feature-card.animation-bounce {
          animation: bounceIn 0.6s ease forwards;
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes flipIn {
          from {
            opacity: 0;
            transform: rotateX(90deg);
          }
          to {
            opacity: 1;
            transform: rotateX(0deg);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateX(8px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, #4ECDC4, #6C5CE7, #FF6B6B);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .card-content {
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }

        .card-icon {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: rgba(78, 205, 196, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4ECDC4;
          transition: all 0.3s ease;
        }

        .feature-card:hover .card-icon {
          transform: scale(1.05) rotate(-3deg);
          background: rgba(78, 205, 196, 0.2);
        }

        .card-text {
          flex: 1;
        }

        .feature-card h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: white;
          letter-spacing: -0.02em;
          min-height: 32px;
        }

        .feature-card p {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          margin: 0;
          min-height: 24px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-container {
            padding: 40px 16px;
          }

          h1 {
            font-size: 2.5rem;
            min-height: 60px;
          }

          .cursor {
            font-size: 2.5rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .feature-card {
            padding: 20px 24px;
          }

          .card-content {
            gap: 16px;
          }

          .card-icon {
            width: 44px;
            height: 44px;
          }

          .feature-card h3 {
            font-size: 1.1rem;
          }

          .feature-card p {
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 1.8rem;
            min-height: 50px;
          }

          .cursor {
            font-size: 1.8rem;
          }

          .feature-card {
            padding: 16px 18px;
          }

          .card-content {
            gap: 12px;
          }

          .card-icon {
            width: 38px;
            height: 38px;
          }

          .card-icon svg {
            width: 20px;
            height: 20px;
          }

          .feature-card h3 {
            font-size: 1rem;
          }

          .feature-card p {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}