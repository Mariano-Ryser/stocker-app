// index.tsx - VERSIÓN CON MAGIA DE AGUA Y ESTRELLAS
import { useEffect, useState } from 'react';
import { preloadPublicPagesOnce } from '../PreloadPublicPages';
import HomeHero from '../components/homeComponents/HomeHero';
import FeaturesSection from '../components/homeComponents/FeaturesSection';
import CTASection from '../components/homeComponents/CTASection';
import Footer from '../components/footer/Footer';
import TechCarrousel from '../components/homeComponents/TechCarrousel';
import PricingSection from '../components/homeComponents/PricingSection';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  useEffect(() => {
    preloadPublicPagesOnce();
  }, []);

  const { t } = useLanguage();

  return (
    <>
      <HomeHero />
      <FeaturesSection />
      <PricingSection />
      <TechCarrousel />
      <CTASection />

      {/* Sección About con temática agua y estrellas */}
      <section className="about-page">
        {/* Fondo de estrellas y ondas */}
        <div className="about-background">
          <div className="stars-layer">
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="star-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${1 + Math.random() * 4}px`,
                  height: `${1 + Math.random() * 4}px`,
                  animationDelay: `${Math.random() * 6}s`,
                  animationDuration: `${2 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
          
          {/* Ondas de agua SVG */}
          <div className="water-waves">
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path
                fill="rgba(30, 144, 255, 0.03)"
                d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,176C672,160,768,160,864,176C960,192,1056,224,1152,224C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
              <path
                fill="rgba(0, 191, 255, 0.02)"
                d="M0,224L48,208C96,192,192,160,288,160C384,160,480,192,576,208C672,224,768,224,864,208C960,192,1056,160,1152,160C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
              <path
                fill="rgba(64, 224, 208, 0.015)"
                d="M0,256L48,240C96,224,192,192,288,192C384,192,480,224,576,240C672,256,768,256,864,240C960,224,1056,192,1152,192C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </svg>
          </div>

          {/* Partículas de agua flotantes */}
          <div className="water-particles">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="water-drop"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 8}s`,
                  animationDuration: `${6 + Math.random() * 6}s`,
                  width: `${2 + Math.random() * 6}px`,
                  height: `${2 + Math.random() * 6}px`
                }}
              />
            ))}
          </div>
        </div>

        <div className="container">
          {/* Badge decorativo */}
          <div className="about-badge">
            <span className="badge-icon">✦</span>
            <span className="badge-text">StockerCloud</span>
            <span className="badge-icon">✦</span>
          </div>

          <h2 className="about-title">{t('home.title') || "Warum Stocker"}</h2>
          
          <div className="about-content">
            <p className="about-text">
              {t('home.p') || `In einer zunehmend datengetriebenen Welt ist es entscheidend, 
              über die richtigen Werkzeuge zu verfügen, um Daten sicher, schnell und effizient zu nutzen. 
              Stocker bietet eine benutzerfreundliche und leistungsstarke Plattform, die Unternehmen dabei 
              unterstützt, Daten in wertvolle Erkenntnisse zu verwandeln. Mit höchsten Sicherheitsstandards, 
              schnellen Analyseprozessen sowie voller Transparenz über Warenflüsse und Geschäftskennzahlen 
              ermöglicht Stocker fundierte Entscheidungen auf Basis verlässlicher Daten. So behalten Sie 
              jederzeit den Überblick über Ihr Unternehmen und schaffen die Grundlage für nachhaltiges 
              Wachstum und langfristigen Erfolg.`}
            </p>
          </div>

          {/* Carrusel de características rápidas */}
          <div className="quick-features">
            <div className="quick-item">
              <span className="quick-icon">🔒</span>
              <span className="quick-text">Sicherheit</span>
            </div>
            <div className="quick-item">
              <span className="quick-icon">⚡</span>
              <span className="quick-text">Schnell</span>
            </div>
            <div className="quick-item">
              <span className="quick-icon">📊</span>
              <span className="quick-text">Transparent</span>
            </div>
            <div className="quick-item">
              <span className="quick-icon">🌊</span>
              <span className="quick-text">Effizient</span>
            </div>
            <div className="quick-item">
              <span className="quick-icon">✨</span>
              <span className="quick-text">Innovativ</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        body {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #040e52;
        }
        /* ===== ABOUT SECTION ===== */
        .about-page {
          position: relative;
          padding: 80px 24px 100px;
          background: linear-gradient(180deg, #0a0e27 0%, #0d1b3e 30%, #0a1628 70%, #060d1a 100%);
          overflow: hidden;
          border-top: 1px solid rgba(30, 144, 255, 0.05);
          border-bottom: 1px solid rgba(30, 144, 255, 0.05);
        }

        /* Fondo de estrellas */
        .about-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .stars-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .star-particle {
          position: absolute;
          background: radial-gradient(circle, rgba(100, 200, 255, 0.8), rgba(50, 150, 255, 0.2));
          border-radius: 50%;
          opacity: 0;
          animation: twinkleStar ease-in-out infinite;
          box-shadow: 0 0 15px rgba(100, 200, 255, 0.2);
        }

        @keyframes twinkleStar {
          0%, 100% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Ondas de agua */
        .water-waves {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 150px;
          pointer-events: none;
        }

        .water-waves svg {
          width: 100%;
          height: 100%;
        }

        /* Partículas de agua */
        .water-particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .water-drop {
          position: absolute;
          border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;
          background: radial-gradient(circle at 30% 30%, rgba(100, 200, 255, 0.15), rgba(30, 144, 255, 0.02));
          animation: floatDrop ease-in-out infinite;
          opacity: 0.4;
          border: 1px solid rgba(100, 200, 255, 0.02);
        }

        @keyframes floatDrop {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.5);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-80px) rotate(180deg) scale(1);
            opacity: 0.6;
          }
          100% {
            transform: translateY(0) rotate(360deg) scale(0.5);
            opacity: 0.1;
          }
        }

        /* Contenedor */
        .container {
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* Badge */
        .about-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
          animation: fadeInUp 1s ease 0.3s both;
        }

        .badge-icon {
          color: rgba(100, 200, 255, 0.3);
          font-size: 0.8rem;
          animation: pulseIcon 2s ease-in-out infinite;
        }

        .badge-text {
          font-size: 0.75rem;
          color: rgba(100, 200, 255, 0.3);
          letter-spacing: 3px;
          text-transform: uppercase;
          font-weight: 300;
        }

        @keyframes pulseIcon {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }

        /* Título */
        .about-title {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 3.5rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 30px;
          line-height: 1.2;
          background: linear-gradient(135deg, #4FC3F7 0%, #1E88E5 30%, #00BCD4 60%, #4FC3F7 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: gradientShine 4s ease-in-out infinite, fadeInUp 1s ease 0.6s both;
        }

        @keyframes gradientShine {
          0% { background-position: 0% center; }
          100% { background-position: 300% center; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Contenido */
        .about-content {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(100, 200, 255, 0.05);
          border-radius: 24px;
          padding: 40px 45px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: fadeInUp 1s ease 0.9s both;
          position: relative;
          overflow: hidden;
        }

        .about-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #4FC3F7, #00BCD4, #4FC3F7, transparent);
          opacity: 0.6;
        }

        .about-text {
          font-size: 1.15rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          text-align: justify;
          font-weight: 300;
        }

        .about-text::first-letter {
          font-size: 2.2rem;
          color: #4FC3F7;
          font-weight: 700;
          float: left;
          margin-right: 6px;
          line-height: 1.2;
          text-shadow: 0 0 30px rgba(79, 195, 247, 0.2);
        }

        /* Quick Features */
        .quick-features {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 32px;
          flex-wrap: wrap;
          animation: fadeInUp 1s ease 1.2s both;
        }

        .quick-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(100, 200, 255, 0.05);
          border-radius: 50px;
          transition: all 0.3s ease;
          cursor: default;
        }

        .quick-item:hover {
          background: rgba(79, 195, 247, 0.05);
          border-color: rgba(79, 195, 247, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(79, 195, 247, 0.05);
        }

        .quick-icon {
          font-size: 1rem;
        }

        .quick-text {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.4);
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .quick-item:hover .quick-text {
          color: rgba(255, 255, 255, 0.7);
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .about-page {
            padding: 60px 16px 80px;
          }

          .about-title {
            font-size: 2.5rem;
          }

          .about-content {
            padding: 30px 25px;
            border-radius: 18px;
          }

          .about-text {
            font-size: 1rem;
            line-height: 1.7;
          }

          .about-text::first-letter {
            font-size: 1.8rem;
          }

          .quick-features {
            gap: 12px;
          }

          .quick-item {
            padding: 6px 14px;
          }

          .quick-text {
            font-size: 0.7rem;
          }

          .water-waves {
            height: 100px;
          }
        }

        @media (max-width: 480px) {
          .about-page {
            padding: 40px 12px 60px;
          }

          .about-title {
            font-size: 1.8rem;
          }

          .about-content {
            padding: 24px 18px;
            border-radius: 14px;
          }

          .about-text {
            font-size: 0.9rem;
            line-height: 1.6;
          }

          .about-text::first-letter {
            font-size: 1.5rem;
          }

          .quick-features {
            gap: 8px;
          }

          .quick-item {
            padding: 4px 12px;
          }

          .quick-text {
            font-size: 0.65rem;
          }

          .badge-text {
            font-size: 0.6rem;
            letter-spacing: 2px;
          }

          .water-waves {
            height: 60px;
          }
        }
      `}</style>
    </>
  );
}