// components/shared/LoadMoreTrigger.js - VERSIÓN MEJORADA
import Loader from '../../utils/loader';

export default function LoadMoreTrigger({ loadingMore, hasMore, loadMoreRef, customMessage }) {
  if (!hasMore) return null;

  return (
    <div 
      ref={loadMoreRef} 
      className="load-more-trigger"
      style={{ 
        // ESTILOS MEJORADOS PARA DESKTOP
        padding: '40px 20px',
        textAlign: 'center',
        background: '#f8f9fa',
        border: '2px dashed #dee2e6',
        margin: '20px 0',
        borderRadius: '8px',
        minHeight: '60px', // ← MÁS ALTO PARA DESKTOP
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      {loadingMore ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Loader />
          <span>Lade mehr...</span>
        </div>
      ) : (
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#495057' }}>
          👇 {customMessage || 'Scroll down to load more'}
        </div>
      )}
    </div>
  );
}

