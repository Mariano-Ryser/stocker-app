import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useLanguage } from '../../contexts/LanguageContext';

interface LogoutButtonProps {
  icon?: React.ReactNode;
  showText?: boolean;
  text?: string;
  className?: string;
}

export default function LogoutButton({ 
  icon, 
  showText = true, 
  text,
  className = ""
}: LogoutButtonProps) {
  const { isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  
  const handleLogout = () => {
    if (window.confirm(t('logout.confirm') || '¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const buttonText = text || t('menu.logout') || 'Cerrar Sesión';

  return (
    <button 
      onClick={handleLogout} 
      className={`logout-btn ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: showText ? 'flex-start' : 'center',
        gap: showText ? '0.5rem' : '0',
        background: '#ff6b6b',
        color: 'white',
        border: 'none',
        padding: showText ? '0.75rem 1rem' : '0.75rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
        width: '100%',
        minHeight: '40px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#ff5252';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#ff6b6b';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {showText && <span>{buttonText}</span>}
      
      {/* Estilos adicionales para modo responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          .logout-btn {
            padding: 0.75rem;
            justify-content: center;
          }
        }
      `}</style>
    </button>
  );
}