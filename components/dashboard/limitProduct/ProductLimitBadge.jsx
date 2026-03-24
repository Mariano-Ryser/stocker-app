// ../components/dashboard/limitProduct/ProductLimitBadge
import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

const ProductLimitBadge = ({ limits, compact = false }) => {
  const { t } = useLanguage();
  
  if (!limits || limits.max === 0) return null;

  const { current, max, percentage } = limits;
  
  const getStatusColor = () => {
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  const getIcon = () => {
    if (percentage >= 90) return <AlertCircle className="icon" />;
    if (percentage >= 75) return <AlertTriangle className="icon" />;
    return <CheckCircle className="icon" />;
  };

  const status = getStatusColor();

  // Función para reemplazar variables en el texto
  const replaceVariables = (text, variables) => {
    let result = text;
    Object.keys(variables).forEach(key => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    });
    return result;
  };

  // Obtener el mensaje según el porcentaje
  const getMessage = () => {
    let messageKey;
    if (percentage >= 90) {
      messageKey = 'productLimitBadge.criticalMessage';
    } else if (percentage >= 75) {
      messageKey = 'productLimitBadge.warningMessage';
    } else {
      messageKey = 'productLimitBadge.normalMessage';
      const message = t(messageKey);
      return replaceVariables(message, { available: max - current });
    }
    
    return t(messageKey);
  };

  // Obtener el texto de estadísticas con variables reemplazadas
  const getStatsText = () => {
    const statsText = t('productLimitBadge.stats');
    return replaceVariables(statsText, { current, max, percentage });
  };

  if (compact) {
    return (
      <div className={`badge compact ${status}`}>
        {getIcon()}
        <span className="counter">{current}/{max}</span>
        
        <style jsx>{`
          .badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            gap: 0.25rem;
            border: 1px solid transparent;
          }
          
          .badge.normal {
            background-color: #f0fdf4;
            color: #166534;
            border-color: #bbf7d0;
          }
          
          .badge.warning {
            background-color: #fef9c3;
            color: #854d0e;
            border-color: #fde047;
          }
          
          .badge.critical {
            background-color: #fee2e2;
            color: #991b1b;
            border-color: #fecaca;
          }
          
          .badge :global(.icon) {
            width: 1rem;
            height: 1rem;
          }
          
          .badge.normal :global(.icon) { color: #16a34a; }
          .badge.warning :global(.icon) { color: #ca8a04; }
          .badge.critical :global(.icon) { color: #dc2626; }
          
          .counter {
            margin-left: 0.25rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`container ${status}`}>
      <div className="header">
        <div className="title">
          {getIcon()}
          <span>{t('productLimitBadge.title')}</span>
        </div>
        <span className="stats">
          {getStatsText()}
        </span>
      </div>
      
      {/* Barra de progreso */}
      <div className="progress-bar">
        <div 
          className={`progress-fill ${status}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <p className="message">
        {getMessage()}
      </p>

      <style jsx>{`
        .container {
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid;
        }
        
        .container.normal {
          background-color: #f0fdf4;
          border-color: #bbf7d0;
        }
        
        .container.warning {
          background-color: #fef9c3;
          border-color: #fde047;
        }
        
        .container.critical {
          background-color: #fee2e2;
          border-color: #fecaca;
        }
        
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        
        .title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        
        .title :global(.icon) {
          width: 1.25rem;
          height: 1.25rem;
        }
        
        .container.normal .title :global(.icon) { color: #16a34a; }
        .container.warning .title :global(.icon) { color: #ca8a04; }
        .container.critical .title :global(.icon) { color: #dc2626; }
        
        .stats {
          font-size: 0.875rem;
        }
        
        .container.normal .stats { color: #166534; }
        .container.warning .stats { color: #854d0e; }
        .container.critical .stats { color: #991b1b; }
        
        .progress-bar {
          height: 0.5rem;
          background-color: #e5e7eb;
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        
        .progress-fill.normal { background-color: #22c55e; }
        .progress-fill.warning { background-color: #eab308; }
        .progress-fill.critical { background-color: #ef4444; }
        
        .message {
          font-size: 0.875rem;
          margin: 0;
        }
        
        .container.normal .message { color: #166534; }
        .container.warning .message { color: #854d0e; }
        .container.critical .message { color: #991b1b; }
      `}</style>
    </div>
  );
};

export default ProductLimitBadge;