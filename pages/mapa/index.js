import { useState } from 'react';
import { useProduct } from '../../hooks/useProducts';
import Map from '../../components/dashboard/MapaAlmacen';

export function Mapa() {
  const { products, loading, error } = useProduct();
  const [ubicacionActiva, setUbicacionActiva] = useState(null);
  const [articulosUbicacion, setArticulosUbicacion] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);

  const handleSeleccionUbicacion = (idUbicacion) => {
    setUbicacionActiva(idUbicacion);
    const articulos = products.filter((p) => p.lagerPlatz === idUbicacion);
    setArticulosUbicacion(articulos);
    setModalAbierto(true);
  };

  return (
    <div>
      {loading && <p>Cargando artículos...</p>}
      {error && <p>Error al cargar productos.</p>}
      <Map
        ubicacionActiva={ubicacionActiva}
        setUbicacionActiva={setUbicacionActiva}
        onSeleccionUbicacion={handleSeleccionUbicacion}
      />
      
      {/* Modal con artículos de la ubicación */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="cerrar" onClick={() => setModalAbierto(false)}>
              ×
            </button>
            <h3>Lagerplatz {ubicacionActiva}</h3>
            {articulosUbicacion.length > 0 ? (
              <ul>
                {articulosUbicacion.map((a, i) => (
                  <li key={i}>
                    <strong>{a.artikelNumber}</strong> - {a.artikelName}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay artículos en esta ubicación.</p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
          padding: 10px;
          background: rgba(0, 0, 0, 0.4);
        }
        .modal {
          background: white;
          border-radius: 8px;
          padding: 20px;
          max-width: 600px;
          width: 90%;
          position: relative;
        }
        .modal .cerrar {
          position: absolute;
          top: 10px;
          right: 15px;
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default Mapa;