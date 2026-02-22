import React from 'react';

const PremiumFeatures = () => {
  return (
    <div className="premium-features">
      <div className="premium-header">
        <h2>🌟 Funciones Premium</h2>
        <span className="premium-badge">PREMIUM</span>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h4>Reportes Avanzados</h4>
          <p>Análisis detallado de ventas y tendencias</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h4>Automatización AI</h4>
          <p>Predicción de inventario inteligente</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📈</div>
          <h4>Dashboard Avanzado</h4>
          <p>Métricas en tiempo real y KPI personalizados</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🔔</div>
          <h4>Alertas Pro</h4>
          <p>Notificaciones inteligentes de stock bajo</p>
        </div>
      </div>
      
      <style jsx>{`
        .premium-features {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 24px;
          color: white;
          margin: 20px 0;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }
        
        .premium-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .premium-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          backdrop-filter: blur(10px);
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 16px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
          transition: transform 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.15);
        }
        
        .feature-icon {
          font-size: 28px;
          margin-bottom: 12px;
        }
        
        .feature-card h4 {
          margin: 8px 0 4px 0;
          font-size: 16px;
        }
        
        .feature-card p {
          font-size: 12px;
          opacity: 0.9;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumFeatures;