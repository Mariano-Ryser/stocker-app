import { useState } from 'react';

type Escritura = {
  id: number;
  titulo: string;
  textoCorto: string;
  textoCompleto: string;
};

const escriturasData: Escritura[] = [
  {
    id: 1,
    titulo: "El Viaje del Alma",
    textoCorto: "De la oscuridad a la luz, la naturaleza te espera.",
    textoCompleto: `La adrenalina, hay que dejarla de lado, puede enfermarte.
    
El viaje oscuro, la música excéntrica, el juego virtual.
La Naturaleza llama, hay que volver a Nuestra tierra.

Autonomía Infinita.

No hay camino más verdadero que el que te lleva a ti mismo.
La tierra susurra, el viento canta, el fuego purifica, el agua fluye.
Todo está en ti, todo te espera.

Vuelve al origen, vuelve a tu esencia.
La libertad no se encuentra afuera, se despierta adentro.

Eres naturaleza, eres infinito, eres el viaje y el destino.
Suelta la prisa, abraza el instante, escucha el silencio.

Autonomía Infinita.`,
  },
];

const Escritura = () => {
  const [selectedEscritura, setSelectedEscritura] = useState<Escritura | null>(null);

  return (
    <>
      <style jsx>{`
        /* Dark Mode con madera y naturaleza */
        .wood-bg {
          background: #0d0d0d;
          background-image: 
            radial-gradient(ellipse at 50% 0%, #1a2e1a 0%, #0a0f0a 70%),
            repeating-linear-gradient(45deg, rgba(139, 90, 43, 0.05) 0px, rgba(139, 90, 43, 0.05) 2px, transparent 2px, transparent 6px);
          min-height: 100vh;
          padding: 3rem 1.5rem;
          font-family: 'Georgia', 'Times New Roman', serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        /* Efecto de luz natural */
        .wood-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(ellipse at 20% 80%, rgba(34, 139, 34, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(139, 69, 19, 0.06) 0%, transparent 50%);
          pointer-events: none;
        }

        .title {
          text-align: center;
          font-size: 3.5rem;
          font-weight: bold;
          color: #d4a373;
          text-shadow: 
            0 0 20px rgba(139, 90, 43, 0.3),
            0 0 60px rgba(34, 139, 34, 0.1),
            2px 2px 4px rgba(0,0,0,0.8);
          margin-bottom: 0.5rem;
          letter-spacing: 4px;
          position: relative;
          z-index: 1;
        }

        .title span {
          color: #4caf50;
          text-shadow: 0 0 30px rgba(76, 175, 80, 0.2);
        }

        .subtitle {
          text-align: center;
          font-size: 1.2rem;
          color: rgba(212, 163, 115, 0.6);
          font-style: italic;
          letter-spacing: 2px;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }

        .divider {
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #4caf50, #d4a373, transparent);
          margin: 0 auto 3rem;
          position: relative;
          z-index: 1;
        }

        /* Card Principal */
        .main-card {
          background: rgba(20, 20, 15, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 163, 115, 0.15);
          border-radius: 30px;
          max-width: 750px;
          width: 100%;
          padding: 3rem 3.5rem;
          box-shadow: 
            0 30px 80px rgba(0, 0, 0, 0.8),
            inset 0 1px 0 rgba(212, 163, 115, 0.1),
            0 0 40px rgba(34, 139, 34, 0.05);
          transition: all 0.4s ease;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }

        .main-card:hover {
          transform: translateY(-5px);
          border-color: rgba(212, 163, 115, 0.3);
          box-shadow: 
            0 40px 100px rgba(0, 0, 0, 0.9),
            inset 0 1px 0 rgba(212, 163, 115, 0.2),
            0 0 60px rgba(34, 139, 34, 0.08);
        }

        /* Borde decorativo superior */
        .main-card::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 20%;
          right: 20%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #4caf50, #d4a373, #4caf50, transparent);
          opacity: 0.5;
          border-radius: 50%;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 1.5rem;
          padding-bottom: 1.2rem;
          border-bottom: 1px solid rgba(212, 163, 115, 0.08);
        }

        .card-icon {
          font-size: 2rem;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        .card-header h2 {
          font-size: 2rem;
          font-weight: bold;
          color: #d4a373;
          text-shadow: 0 0 20px rgba(139, 90, 43, 0.2);
          margin: 0;
          letter-spacing: 1px;
        }

        .card-header h2 span {
          color: #4caf50;
        }

        .card-subtitle {
          font-size: 1.1rem;
          color: rgba(212, 163, 115, 0.5);
          font-style: italic;
          margin-bottom: 1.8rem;
          line-height: 1.6;
          padding-left: 4px;
          border-left: 3px solid rgba(76, 175, 80, 0.3);
          padding-left: 16px;
        }

        .card-preview {
          font-size: 0.95rem;
          color: rgba(212, 163, 115, 0.4);
          line-height: 1.8;
          margin-bottom: 1.5rem;
          font-style: italic;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: rgba(212, 163, 115, 0.25);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(212, 163, 115, 0.05);
        }

        .card-hint span {
          color: #4caf50;
          animation: blink 2s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.92);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 2rem;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: rgba(20, 20, 15, 0.95);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(212, 163, 115, 0.15);
          border-radius: 30px;
          max-width: 700px;
          width: 100%;
          max-height: 85vh;
          overflow-y: auto;
          padding: 3rem 3.5rem;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.9), 0 0 80px rgba(34, 139, 34, 0.05);
          animation: slideUp 0.4s ease;
          position: relative;
        }

        @keyframes slideUp {
          from { transform: translateY(40px) scale(0.98); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }

        .modal-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #4caf50, #d4a373, #4caf50, transparent);
          opacity: 0.4;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(212, 163, 115, 0.06);
        }

        .modal-header h2 {
          font-size: 2.4rem;
          font-weight: bold;
          color: #d4a373;
          text-shadow: 0 0 30px rgba(139, 90, 43, 0.1);
          margin: 0;
          letter-spacing: 2px;
        }

        .modal-header h2 span {
          color: #4caf50;
        }

        .modal-close {
          background: rgba(212, 163, 115, 0.05);
          border: 1px solid rgba(212, 163, 115, 0.1);
          color: rgba(212, 163, 115, 0.4);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          font-size: 1.4rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-close:hover {
          background: rgba(76, 175, 80, 0.1);
          border-color: rgba(76, 175, 80, 0.2);
          color: #4caf50;
          transform: rotate(90deg);
        }

        .modal-body {
          font-size: 1.15rem;
          color: rgba(212, 163, 115, 0.8);
          line-height: 2;
          white-space: pre-wrap;
          font-family: 'Georgia', 'Times New Roman', serif;
          letter-spacing: 0.3px;
        }

        .modal-body .highlight {
          color: #4caf50;
          font-weight: bold;
          text-shadow: 0 0 30px rgba(76, 175, 80, 0.1);
        }

        .modal-footer {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(212, 163, 115, 0.06);
          display: flex;
          justify-content: flex-end;
        }

        .modal-footer button {
          background: transparent;
          border: 1px solid rgba(212, 163, 115, 0.15);
          color: rgba(212, 163, 115, 0.4);
          font-size: 0.85rem;
          padding: 0.7rem 2rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: 'Georgia', serif;
        }

        .modal-footer button:hover {
          background: rgba(76, 175, 80, 0.05);
          border-color: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        /* Scroll personalizado */
        .modal-content::-webkit-scrollbar {
          width: 6px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: rgba(212, 163, 115, 0.2);
          border-radius: 10px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 163, 115, 0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .title {
            font-size: 2.5rem;
          }

          .main-card {
            padding: 2rem 1.8rem;
          }

          .modal-content {
            padding: 2rem 1.8rem;
          }

          .card-header h2 {
            font-size: 1.6rem;
          }

          .modal-header h2 {
            font-size: 1.8rem;
          }

          .modal-body {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .wood-bg {
            padding: 2rem 1rem;
          }

          .title {
            font-size: 2rem;
          }

          .subtitle {
            font-size: 0.95rem;
          }

          .main-card {
            padding: 1.5rem 1.2rem;
          }

          .modal-content {
            padding: 1.5rem 1.2rem;
          }

          .card-header h2 {
            font-size: 1.3rem;
          }

          .modal-header h2 {
            font-size: 1.5rem;
          }

          .modal-body {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="wood-bg">
        <h1 className="title">🌿 <span>El</span> Viaje <span>del</span> Alma</h1>
        <p className="subtitle">— De la oscuridad a la luz, la naturaleza te espera —</p>
        <div className="divider" />

        <div 
          className="main-card" 
          onClick={() => setSelectedEscritura(escriturasData[0])}
          role="button"
          tabIndex={0}
        >
          <div className="card-header">
            <span className="card-icon">🌱</span>
            <h2>El <span>Viaje</span> del Alma</h2>
          </div>

          <div className="card-subtitle">
            "De la oscuridad a la luz, la naturaleza te espera."
          </div>

          <div className="card-preview">
            La adrenalina, hay que dejarla de lado, puede enfermarte.
            El viaje oscuro, la música excéntrica, el juego virtual...
          </div>

          <div className="card-hint">
            <span>✦</span> Toca para leer el texto completo <span>✦</span>
          </div>
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span style={{ 
            color: 'rgba(212, 163, 115, 0.12)', 
            fontSize: '0.8rem', 
            letterSpacing: '4px',
            textTransform: 'uppercase'
          }}>
            Autonomía Infinita
          </span>
        </div>
      </div>

      {/* Modal */}
      {selectedEscritura && (
        <div className="modal-overlay" onClick={() => setSelectedEscritura(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🌿 <span>El</span> Viaje <span>del</span> Alma</h2>
              <button className="modal-close" onClick={() => setSelectedEscritura(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {selectedEscritura.textoCompleto}
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedEscritura(null)}>
                ✦ Cerrar ✦
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Escritura;