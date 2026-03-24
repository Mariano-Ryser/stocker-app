// components/homeComponents/TestimonialsSection.tsx
import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
}

export default function TestimonialsSection() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Testimonios por idioma
  const testimonials: Record<string, Testimonial[]> = {
    de: [
      {
        id: 1,
        name: "Michael Schmidt",
        role: "Geschäftsführer",
        company: "Schmidt Logistik GmbH",
        avatar: "/avatars/michael.jpg",
        rating: 5,
        text: "Seit wir Stocker nutzen, haben wir unseren Lagerbestand um 40% optimiert. Die intuitive Bedienung und die Echtzeit-Übersicht sind ein Gamechanger für unser Team."
      },
      {
        id: 2,
        name: "Sarah Weber",
        role: "Einkaufsleiterin",
        company: "Weber Electronics",
        avatar: "/avatars/sarah.jpg",
        rating: 5,
        text: "Endlich eine Lösung, die wirklich alle unsere Bedürfnisse abdeckt. Von der Bestandsverwaltung bis zur Rechnungsstellung - alles läuft reibungslos."
      },
      {
        id: 3,
        name: "Thomas Bauer",
        role: "IT-Leiter",
        company: "Bauer & Partner",
        avatar: "/avatars/thomas.jpg",
        rating: 5,
        text: "Die API-Integration war nahtlos. Unser Team konnte innerhalb von 2 Tagen produktiv arbeiten. Absolut empfehlenswert!"
      },
      {
        id: 4,
        name: "Julia Fischer",
        role: "CEO",
        company: "Fischer Solutions",
        avatar: "/avatars/julia.jpg",
        rating: 4,
        text: "Hervorragendes Preis-Leistungs-Verhältnis. Die Reporting-Funktionen haben unsere Entscheidungsfindung revolutioniert."
      }
    ],
    es: [
      {
        id: 1,
        name: "Carlos Rodríguez",
        role: "Director General",
        company: "Rodríguez Logística SL",
        avatar: "/avatars/carlos.jpg",
        rating: 5,
        text: "Desde que usamos Stocker, hemos optimizado nuestro inventario en un 40%. La interfaz intuitiva y la vista en tiempo real son un cambio radical para nuestro equipo."
      },
      {
        id: 2,
        name: "Ana Martínez",
        role: "Directora de Compras",
        company: "Martínez Electrónica",
        avatar: "/avatars/ana.jpg",
        rating: 5,
        text: "Por fin una solución que cubre todas nuestras necesidades. Desde gestión de stock hasta facturación, todo funciona a la perfección."
      },
      {
        id: 3,
        name: "David López",
        role: "Director de IT",
        company: "López & Asociados",
        avatar: "/avatars/david.jpg",
        rating: 5,
        text: "La integración con la API fue perfecta. Nuestro equipo pudo trabajar productivamente en 2 días. ¡Absolutamente recomendable!"
      },
      {
        id: 4,
        name: "Laura Sánchez",
        role: "CEO",
        company: "Sánchez Solutions",
        avatar: "/avatars/laura.jpg",
        rating: 4,
        text: "Excelente relación calidad-precio. Las funciones de informes han revolucionado nuestra toma de decisiones."
      }
    ],
    en: [
      {
        id: 1,
        name: "Michael Schmidt",
        role: "Managing Director",
        company: "Schmidt Logistics GmbH",
        avatar: "/avatars/michael.jpg",
        rating: 5,
        text: "Since using Stocker, we've optimized our inventory by 40%. The intuitive interface and real-time overview are a game-changer for our team."
      },
      {
        id: 2,
        name: "Sarah Weber",
        role: "Purchasing Manager",
        company: "Weber Electronics",
        avatar: "/avatars/sarah.jpg",
        rating: 5,
        text: "Finally a solution that truly covers all our needs. From inventory management to invoicing - everything runs smoothly."
      },
      {
        id: 3,
        name: "Thomas Bauer",
        role: "IT Director",
        company: "Bauer & Partners",
        avatar: "/avatars/thomas.jpg",
        rating: 5,
        text: "The API integration was seamless. Our team was productive within 2 days. Absolutely recommended!"
      },
      {
        id: 4,
        name: "Julia Fischer",
        role: "CEO",
        company: "Fischer Solutions",
        avatar: "/avatars/julia.jpg",
        rating: 4,
        text: "Excellent value for money. The reporting features have revolutionized our decision-making process."
      }
    ]
  };

  const currentTestimonials = testimonials[t.language] || testimonials.en;
  const currentTestimonial = currentTestimonials[currentIndex];

  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % currentTestimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + currentTestimonials.length) % currentTestimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToTestimonial = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={18}
        className={i < rating ? 'star-filled' : 'star-empty'}
        fill={i < rating ? '#f59e0b' : 'none'}
      />
    ));
  };

  return (
    <section className="testimonials">
      <div className="container">
        <div className="header">
          <span className="badge">
            {/* {t('testimonials.badge') } */}
            Testimonios
            </span>
          <h2>
            {/* {t('testimonials.title')} */}
            Lo que dicen nuestros clientes</h2>
          <p className="subtitle">
            {/* {t('testimonials.subtitle')} */}
            Más de 500 empresas confían en Stocker para gestionar su inventario
          </p>
        </div>

        <div className="carousel-container">
          <button
            className="nav-button prev"
            onClick={prevTestimonial}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="testimonial-card">
            <div className={`card-content ${isAnimating ? 'fade-out' : 'fade-in'}`}>
              <div className="quote-icon">“</div>
              <p className="testimonial-text">{currentTestimonial.text}</p>
              
              <div className="rating">
                {renderStars(currentTestimonial.rating)}
              </div>

              <div className="author">
                <div className="avatar-placeholder">
                  {currentTestimonial.name.charAt(0)}
                </div>
                <div className="author-info">
                  <h4>{currentTestimonial.name}</h4>
                  <p>{currentTestimonial.role}</p>
                  <span>{currentTestimonial.company}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            className="nav-button next"
            onClick={nextTestimonial}
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="dots">
          {currentTestimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToTestimonial(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <div className="stats">
          <div className="stat">
            <div className="stat-value">500+</div>
            <div className="stat-label">Clientes Activos</div>
          </div>
          <div className="stat">
            <div className="stat-value">98%</div>
            <div className="stat-label">
                {/* {t('testimonials.stats.satisfaction')} */}
                Satisfacción
                </div>
          </div>
          <div className="stat">
            <div className="stat-value">24/7</div>
            <div className="stat-label">
                {/* {t('testimonials.stats.support')} */}
                Soporte</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .testimonials {
          padding: 80px 20px;
          background: linear-gradient(135deg, #f8fcff 0%, #ffffff 100%);
          position: relative;
          overflow: hidden;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 48px;
        }

        .badge {
          display: inline-block;
          padding: 6px 16px;
          background: #e1f0fa;
          color: #1e4b7a;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        h2 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #4a5568;
          max-width: 600px;
          margin: 0 auto;
        }

        .carousel-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 32px;
        }

        .nav-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: white;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: #1f2937;
        }

        .nav-button:hover {
          background: #f3f4f6;
          border-color: #7bb3e0;
          transform: scale(1.05);
        }

        .testimonial-card {
          flex: 1;
          max-width: 800px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
          padding: 48px;
          position: relative;
          transition: all 0.3s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
        }

        .card-content {
          transition: opacity 0.3s ease;
        }

        .card-content.fade-out {
          opacity: 0;
          transform: translateX(20px);
        }

        .card-content.fade-in {
          opacity: 1;
          transform: translateX(0);
        }

        .quote-icon {
          font-size: 4rem;
          color: #7bb3e0;
          font-family: Georgia, serif;
          line-height: 1;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .testimonial-text {
          font-size: 1.2rem;
          line-height: 1.6;
          color: #1f2937;
          margin-bottom: 24px;
          font-style: italic;
        }

        .rating {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
        }

        .rating :global(.star-filled) {
          color: #f59e0b;
        }

        .rating :global(.star-empty) {
          color: #d1d5db;
        }

        .author {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .avatar-placeholder {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7bb3e0, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .author-info h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .author-info p {
          font-size: 0.85rem;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .author-info span {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .dots {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 32px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #d1d5db;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot.active {
          width: 28px;
          border-radius: 12px;
          background: #7bb3e0;
        }

        .stats {
          display: flex;
          justify-content: center;
          gap: 64px;
          margin-top: 64px;
          padding-top: 48px;
          border-top: 1px solid #e5e7eb;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1e4b7a;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .testimonials {
            padding: 60px 16px;
          }

          h2 {
            font-size: 1.6rem;
          }

          .subtitle {
            font-size: 0.95rem;
          }

          .testimonial-card {
            padding: 32px 24px;
          }

          .testimonial-text {
            font-size: 1rem;
          }

          .nav-button {
            width: 36px;
            height: 36px;
          }

          .stats {
            gap: 32px;
            flex-wrap: wrap;
          }

          .stat-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}