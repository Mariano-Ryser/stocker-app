import { useState, useEffect } from "react";

export default function MapaAlmacen({ ubicacionActiva, setUbicacionActiva, onSeleccionUbicacion }) {
  const [pisoActivo, setPisoActivo] = useState(1);

  // 🔹 Ubicaciones con piso incluido
  const ubicaciones = [
      // Piso EG
    { id: "10A-A01021",piso: -1, top: "0%", left: "0%" },
    { id: "10A-A01031",piso: -1, top: "0%", left: "5.5%" },
    { id: "10A-A01041",piso: -1, top: "0%", left: "11%" },
    { id: "10A-A01051",piso: -1, top: "0%", left: "16.5%" },
    { id: "10B-A01021",piso: -1, top: "0%", left: "22%" },
    { id: "10B-A01031",piso: -1, top: "0%", left: "27.5%" },
    { id: "10B-A01041",piso: -1, top: "0%", left: "33%" },
        // Piso EG
    { id: "10A-A01021",piso: 0, top: "0%", left: "0%" },
    { id: "10A-A01031",piso: 0, top: "0%", left: "5.5%" },
    { id: "10A-A01041",piso: 0, top: "0%", left: "11%" },
    { id: "10A-A01051",piso: 0, top: "0%", left: "16.5%" },
    { id: "10B-A01021",piso: 0, top: "0%", left: "22%" },
    { id: "10B-A01031",piso: 0, top: "0%", left: "27.5%" },
    { id: "10B-A01041",piso: 0, top: "0%", left: "33%" },

    // Piso 1
    { id: "10A-A01021",piso: 1, top: "0%", left: "0%" },
    { id: "10A-A01031",piso: 1, top: "0%", left: "5.5%" },
    { id: "10A-A01041",piso: 1, top: "0%", left: "11%" },
    { id: "10A-A01051",piso: 1, top: "0%", left: "16.5%" },
    { id: "10B-A01021",piso: 1, top: "0%", left: "22%" },
    { id: "10B-A01031",piso: 1, top: "0%", left: "27.5%" },
    { id: "10B-A01041",piso: 1, top: "0%", left: "33%" },

    { id: "10A-A01021",piso: 1, top: "10%", left: "0%" },
    { id: "10A-A01081",piso: 1, top: "10%", left: "5.5%" },
    { id: "10A-A01041",piso: 1, top: "10%", left: "11%" },
    { id: "10A-A01051",piso: 1, top: "10%", left: "16.5%" },
    { id: "10B-A01021",piso: 1, top: "10%", left: "22%" },
    { id: "10B-A01031",piso: 1, top: "10%", left: "27.5%" },
    { id: "10B-A01041",piso: 1, top: "10%", left: "33%" },

    { id: "10A-A01021",piso: 1, top: "15%", left: "0%" },
    { id: "10A-A01091",piso: 1, top: "15%", left: "5.5%" },
    { id: "10A-A01041",piso: 1, top: "15%", left: "11%" },
    { id: "10A-A01051",piso: 1, top: "15%", left: "16.5%" },
    { id: "10B-A01021",piso: 1, top: "15%", left: "22%" },
    { id: "10B-A01031",piso: 1, top: "15%", left: "27.5%" },
    { id: "10B-A01041",piso: 1, top: "15%", left: "33%" },

    { id: "10A-A01021",piso: 1, top: "25%", left: "0%" },
    { id: "10A-A01091",piso: 1, top: "25%", left: "5.5%" },
    { id: "10A-A01041",piso: 1, top: "25%", left: "11%" },
    { id: "10A-A01051",piso: 1, top: "25%", left: "16.5%" },
    { id: "10B-A01021",piso: 1, top: "25%", left: "22%" },
    { id: "10B-A01031",piso: 1, top: "25%", left: "27.5%" },
    { id: "10B-A01041",piso: 1, top: "25%", left: "33%" },

    // 🔹 Ejemplo del otro lado (derecha)
    { id: "20A-A01029",piso: 1, top: "0%", right: "0%" },
    { id: "20A-A01032",piso: 1, top: "0%", right: "5.5%" },
    { id: "20A-A01041",piso: 1, top: "0%", right: "11%" },
    { id: "20A-A01051",piso: 1, top: "0%", right: "16.5%" },
    { id: "20B-A01021",piso: 1, top: "0%", right: "22%" },
    { id: "20B-A01031",piso: 1, top: "0%", right: "27.5%" },
    { id: "20B-A01041",piso: 1, top: "0%", right: "33%" },
  
    { id: "30A-A01021",piso: 1,  top: "10%", right: "0%" },
    { id: "30A-A01031",piso: 1,  top: "10%", right: "5.5%" },
    { id: "30A-A01041",piso: 1,  top: "10%", right: "11%" },
    { id: "30A-A01051",piso: 1,  top: "10%", right: "16.5%" },
    { id: "30B-A01021",piso: 1,  top: "10%", right: "22%" },
    { id: "30B-A01031",piso: 1,  top: "10%", right: "27.5%" },
    { id: "30B-A01041",piso: 1,  top: "10%", right: "33%" },

    { id: "30A-A02021",piso: 1, top: "15%", right: "0%" },
    { id: "30A-A02031",piso: 1, top: "15%", right: "5.5%" },
    { id: "30A-A02041",piso: 1, top: "15%", right: "11%" },
    { id: "30A-A02051",piso: 1, top: "15%", right: "16.5%" },
    { id: "30B-A02021",piso: 1, top: "15%", right: "22%" },
    { id: "30B-A02031",piso: 1, top: "15%", right: "27.5%" },
    { id: "30B-A02041",piso: 1, top: "15%", right: "33%" },

    // Piso 3
    { id: "20B-A01021", piso: 3, top: "0%", right: "0%" },
    { id: "20A-A01021", piso: 3, top: "0%", right: "5.5%" },
    { id: "20A-A01021", piso: 3, top: "0%", right: "5.5%" },
    { id: "20C-A01041", piso: 3, top: "0%", right: "11%" },
    { id: "20C-A01041", piso: 3, top: "0%", right: "11%" },
  ];

 const pisos = [...new Set(ubicaciones.map(u => u.piso))]; // lista de pisos únicos

  // 🔹 Cambiar piso automáticamente al seleccionar una ubicación
  useEffect(() => {
    if (ubicacionActiva) {
      const ubicacion = ubicaciones.find(u => u.id === ubicacionActiva);
      if (ubicacion) setPisoActivo(ubicacion.piso);
    }
  }, [ubicacionActiva]);


  return (
    <div className="mapa-container">
      <div className="selector-pisos">
        {pisos.map(p => (
          <button
            key={p}
            className={pisoActivo === p ? "activo" : ""}
            onClick={() => setPisoActivo(p)}
          >
            Stock {p}
          </button>
        ))}
      </div>

      <div className="mapa">
        {ubicaciones
          .filter(u => u.piso === pisoActivo)
          .map(u => (
            <div
              key={`${u.id}-${u.top}-${u.left || u.right}`}
              className={`estante ${ubicacionActiva === u.id ? "activo" : ""}`}
              style={{
                top: u.top,
                left: u.left,
                right: u.right,
              }}
              onClick={() => {
                setUbicacionActiva(u.id);
                onSeleccionUbicacion?.(u.id);
              }}
            >
              <p>
                {/* {u.id} */}
              </p>
            </div>
          ))}
      </div>

      <style jsx>{`
        .selector-pisos {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .selector-pisos button {
          margin: 0.25rem;
          padding: 0.5rem 1rem;
          border: 1px solid #888;
          border-radius: 0.5rem;
          cursor: pointer;
          background: #eee;
          transition: 0.2s;
          font-size: clamp(0.8rem, 2vw, 1rem);
        }

        .selector-pisos button.activo {
          background: #707070ff;
          color: white;
          font-weight: bold;
        }

        .mapa-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          aspect-ratio: 1 / 2;
          position: relative;
          height: 80vh;
          margin-top: 5rem;
        }

        .mapa {
          position: relative;
          width: 100%;
          height: 100%;
          border: 1px solid #ccc;
          background: #fafafa;
        }

        .estante {
          position: absolute;
          width: 5.5%;
          height: 5.1%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #999999ff;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .estante p {
          font-family: "Courier New", Courier, monospace;
          font-size: clamp(0.6rem, 0.9vw, 1rem);
          margin: 0;
          pointer-events: none;
          text-align: center;
        }

        .estante:hover {
  background: #858585ff;
  transform: scale(1.02);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

        .activo {
          background: #25d631ff !important;
          color: black !important;
          font-weight: bold;
        }

        @media (max-width: 600px) {
          .mapa-container {
            height: 60vh;
          }
        }
      `}</style>
    </div>
  );
}