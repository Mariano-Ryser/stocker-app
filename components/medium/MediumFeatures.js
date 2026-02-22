import React from 'react';

const MediumFeatures = () => {
  return (
    <div className="medium-features">
      <div className="medium-header">
        <h2>🚀 Funciones Medium</h2>
        <span className="medium-badge">MEDIUM</span>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">📋</div>
          <h4>Reportes Básicos</h4>
          <p>Reportes semanales y mensuales</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📧</div>
          <h4>Email Automático</h4>
          <p>Recordatorios de facturación</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📱</div>
          <h4>App Móvil</h4>
          <p>Acceso básico desde móvil</p>
        </div>
      </div>
      
      <style jsx>{`
        .medium-features {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          border-radius: 12px;
          padding: 20px;
          color: white;
          margin: 20px 0;
          box-shadow: 0 8px 25px rgba(79, 172, 254, 0.3);
        }
        
        .medium-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .medium-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          backdrop-filter: blur(10px);
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
        
        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 16px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
        
        .feature-icon {
          font-size: 24px;
          margin-bottom: 12px;
        }
        
        .feature-card h4 {
          margin: 8px 0 4px 0;
          font-size: 15px;
        }
        
        .feature-card p {
          font-size: 12px;
          opacity: 0.9;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default MediumFeatures;