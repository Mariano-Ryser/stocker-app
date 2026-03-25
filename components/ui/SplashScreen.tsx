// components/ui/SplashScreen.tsx
import { useEffect, useState } from 'react';
import styles from './SplashScreen.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number; // en milisegundos
}

export default function SplashScreen({ onComplete, duration = 1500 }: SplashScreenProps) {
    const { t } = useLanguage();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Esperamos a que termine la animación de fade out
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div className={`${styles.splashContainer} ${fadeOut ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        {/* Logo principal */}
       
      {/* Logo con barras de diferentes alturas */}
      <div className={styles.logoWrapper}>
        <svg className={styles.logo} viewBox="0 0 120 100" fill="none">
          {/* Definir gradientes */}
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
          </defs>
          
          {/* Línea 1 - Pequeña (35% de altura) */}
          <rect 
            x="15" 
            y="45" 
            width="22" 
            height="35" 
            rx="6" 
            fill="url(#grad1)" 
            className={styles.bar1}
          />
          
          {/* Línea 2 - Mediana (65% de altura) */}
          <rect 
            x="47" 
            y="25" 
            width="22" 
            height="55" 
            rx="6" 
            fill="url(#grad2)" 
            className={styles.bar2}
          />
          
          {/* Línea 3 - Grande (100% de altura) */}
          <rect 
            x="79" 
            y="10" 
            width="22" 
            height="70" 
            rx="6" 
            fill="url(#grad3)" 
            className={styles.bar3}
          />
          
          {/* Base común para las barras (efecto de suelo) */}
          <rect 
            x="15" 
            y="80" 
            width="86" 
            height="6" 
            rx="3" 
            fill="#94a3b8" 
            opacity="0.15"
          />
          
       
        </svg>
      </div>

        {/* Nombre de la empresa/App */}
        <h1 className={styles.appName}>Stocker</h1>
        
        {/* Texto de carga */}
        <div className={styles.loadingContainer}>
          <span className={styles.loadingText}>{t('splash.loading')}</span>
          <span className={styles.loadingDots}>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>

        {/* Barra de progreso opcional */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ animation: `fillProgress ${duration}ms linear` }} />
        </div>
      </div>
    </div>
  );
}