import Image from 'next/image';
import Router from 'next/router';
import { useAuth } from '../../components/auth/AuthProvider';
import { useEffect } from 'react';
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
          <p>{t('homeHero.subtitle')}</p>
 
          <div className="actions">
            <button
              className="btn secondary"
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
        <div className="image">
          <Image
            src="/img/heroo23.png" 
            alt="Stocker Dashboard"
            width={760}
            height={30}
            priority
          />
        </div>
      </div>
      
      <style jsx>{`
        .hero {
          margin-top:6rem;
          background: linear-gradient(
            180deg,
            #ffffff 0%,
            var(--light) 100%
          );
          padding: 8rem 1rem 8rem;
          overflow: hidden;
        }

        .hero-title {
          animation: fadeTitleIn 3s ease-in-out;
        }
        
        @keyframes fadeTitleIn { 
          from {
            opacity: 0; 
            transform: translateY(20px);  
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .container {
          max-width: 1580px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: center;
        }

        /* CONTENT */
        .content h1 {
          font-size: 2.8rem;
          line-height: 1.2;
          margin-bottom: 20px;
          color: var(--dark);
        }

        .content h1 span {
          color: var(--primary);
        }

        .content p {
          font-size: 1.15rem;
          color: var(--gray);
          max-width: 720px;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 26px;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          border: 1px solid transparent;
          letter-spacing: 0.2px;
        }

        /* SECONDARY */
        .btn.secondary {
          background: #fff;
          color: var(--dark);
          border: 1px solid #e5e7eb;
        }

        .btn.secondary:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: #f9fafb;
        }

        /* FOCUS */
        .btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.35);
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

        /* IMAGE */
        .image {
          display: flex;
          justify-content: center;
          order: 1;
          animation: fadeIn 2s ease-in-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0; 
            transform: translateX(60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .image :global(img) {
          box-shadow: 0 20px 50px rgba(53, 53, 53, 0.16);
          max-width: 100%;
          height: auto;
        }

        /* RESPONSIVE */
        @media (min-width: 898px) {
          .container {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .image {
            order: 0;
          }
          
          .content h1 {
            font-size: 3rem;
          }
          
          .content p {
            font-size: 1.1rem;
          }
        }

        @media (min-width: 1024px) {
          .content h1 {
            font-size: 3.4rem;
          }
        }

        @media (max-width: 787px) {
          .hero {
            padding: 6rem 0 6rem;
          }
          
          .container {
            gap: 32px;
            padding: 0;
          }
          
          .content {
            padding: 0 24px;
          }
          
          .content h1 {
            font-size: 2.4rem;
            text-align: center;
          }
          
          .content p {
            font-size: 1.1rem;
            text-align: center;
          }
          
          .actions {
            justify-content: center;
          }
          
          .image {
            margin-top: 20px;
            width: 100%;
          }
          
          .image :global(img) {
            width: 100%;
            max-width: none;
            height: auto;
            border-radius: 0;
          }
        }

        @media (max-width: 480px) {
          .hero {
             margin-top:0rem;
            padding: 6rem 0 4rem;
          }
          
          .content {
            padding: 0 24px;
          }
          
          .content h1 {
            font-size: 2rem;
          }
          
          .content p {
            font-size: 1.1rem;
            text-align: center;
          }
          
          .actions {
            flex-direction: column;
            width: 100%;
          }
          
          .actions button {
            width: 100%;
          }
          
          .image {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
          }
          
          .image :global(img) {
            width: 100%;
            max-width: none;
          }
        }

        /* ===== DARK MODE ===== */
        @media (prefers-color-scheme: dark) {
          .hero {
            background: linear-gradient(
              180deg,
              #0f172a 0%,
              #1e293b 100%
            );
          }

          .content h1 {
            color: #f1f5f9;
          }

          .content h1 span {
            color: #60a5fa;
          }

          .content p {
            color: #94a3b8;
          }

          .btn.secondary {
            background: #1e293b;
            color: #e2e8f0;
            border-color: #475569;
          }

          .btn.secondary:hover {
            border-color: #60a5fa;
            color: #60a5fa;
            background: rgba(59, 130, 246, 0.1);
          }

          .image :global(img) {
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          }
        }
      `}</style>
    </section>
  );
}