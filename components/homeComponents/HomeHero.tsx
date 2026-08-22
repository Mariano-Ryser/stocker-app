import Image from 'next/image';
import Router from 'next/router';
import { useAuth } from '../../components/auth/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HomeHero() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const loginUrl = isAuthenticated ? '/dashboard' : '/login';

  return (
    <section className="hero">
      <div className="container">
        <div className="content">
          <h1 className="hero-title">{t('homeHero.title')}</h1>
          <p className="subtitle">{t('homeHero.subtitle')}</p>
 
          <div className="actions">
            <button
              className="btn primary"
              onClick={() => Router.push(loginUrl)}
            >
              {isAuthenticated ? t('homeHero.b1a') : t('homeHero.b1')}
            </button>

            <button
              className="btn secondary"
              onClick={() => Router.push('/informativePages/uberUns')}
            >
              {t('homeHero.b2')}
            </button>
          </div>
        </div>
        
        <div className="image-wrapper">
          <div className="image-container">
            <Image
              src="/img/heroo23.png" 
              alt="Stocker Dashboard"
              width={760}
              height={500}
              priority
              className="hero-image"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .hero {
          background: linear-gradient(
            180deg,
            #0a0e27 0%,
            #1a1040 30%,
            #0d1233 70%,
            #0a0e27 100%
          );
          padding: 17rem 1rem 8rem;
          overflow: hidden;
          position: relative;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(ellipse at 20% 80%, rgba(76, 175, 80, 0.05) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(212, 163, 115, 0.04) 0%, transparent 50%);
          pointer-events: none;
        }

        .container {
          max-width: 1580px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        /* CONTENT */
        .content {
          display: flex;
          flex-direction: column;
        }

        /* TÍTULO - Color madera */
        .hero-title {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 3.2rem;
          font-weight: 800;
          line-height: 1.2;
          margin: 0 0 16px 0;
          color: #d4a373;
          text-shadow: 0 0 40px rgba(212, 163, 115, 0.05);
          animation: fadeIn 1s ease;
        }

        /* SUBTITLE */
        .subtitle {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.6);
          max-width: 720px;
          line-height: 1.6;
          margin: 0 0 32px 0;
          animation: fadeIn 1s ease 0.3s both;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          animation: fadeIn 1s ease 0.6s both;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          letter-spacing: 0.2px;
        }

        /* PRIMARY - Verde naturaleza */
        .btn.primary {
          background: linear-gradient(135deg, #4caf50, #388e3c);
          color: white;
          border: 1px solid rgba(76, 175, 80, 0.3);
          box-shadow: 0 4px 20px rgba(76, 175, 80, 0.15);
        }

        .btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(76, 175, 80, 0.25);
          border-color: rgba(76, 175, 80, 0.5);
        }

        /* SECONDARY - Madera */
        .btn.secondary {
          background: rgba(212, 163, 115, 0.05);
          color: #d4a373;
          border: 1px solid rgba(212, 163, 115, 0.15);
        }

        .btn.secondary:hover {
          border-color: rgba(212, 163, 115, 0.3);
          color: #d4a373;
          background: rgba(212, 163, 115, 0.08);
          transform: translateY(-2px);
        }

        .btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.35);
        }

        /* IMAGE */
        .image-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .image-container {
          width: 100%;
          max-width: 760px;
          position: relative;
          animation: imageFadeIn 1.2s ease 0.5s both;
        }
        
        @keyframes imageFadeIn {
          from {
            opacity: 0;
            transform: translateX(60px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        .hero-image {
          width: 100%;
          height: auto;
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(212, 163, 115, 0.05);
          object-fit: contain;
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .hero-title {
            font-size: 2.8rem;
          }
        }

        @media (max-width: 898px) {
          .container {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .content {
            align-items: center;
            text-align: center;
          }

          .hero-title {
            font-size: 2.6rem;
            text-align: center;
          }

          .subtitle {
            text-align: center;
            margin-left: auto;
            margin-right: auto;
          }

          .actions {
            justify-content: center;
          }

          .image-wrapper {
            padding: 0 20px;
          }

          .image-container {
            max-width: 100%;
          }
        }

        @media (max-width: 600px) {
          .hero {
            padding: 10rem 0 4rem;
          }

          .container {
            padding: 0 16px;
            gap: 24px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 1rem;
          }

          .actions {
            flex-direction: column;
            width: 100%;
          }

          .actions button {
            width: 100%;
          }

          .btn {
            padding: 12px 20px;
            font-size: 0.9rem;
          }

          .image-wrapper {
            padding: 0;
          }

          .hero-image {
            border-radius: 12px;
          }
        }

        @media (max-width: 400px) {
          .hero {
            padding: 7.6rem 0 3rem;
          }

          .hero-title {
            font-size: 1.6rem;
          }

          .subtitle {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
}