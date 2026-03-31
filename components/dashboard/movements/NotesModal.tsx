import { useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import styles from './NotesModal.module.css';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: string;
  articleName?: string;
  movementDate?: string;
  movementType?: string;
}

export default function NotesModal({
  isOpen,
  onClose,
  note,
  articleName,
  movementDate,
  movementType
}: NotesModalProps) {
  const { t } = useLanguage();

  // Cerrar modal con la tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <span className={styles.noteIcon}>📝</span>
            {t('stockMovements.notesModal.title')}
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Información del movimiento */}
          {(articleName || movementDate || movementType) && (
            <div className={styles.movementInfo}>
              {articleName && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>{t('stockMovements.notesModal.article')}:</span>
                  <span className={styles.infoValue}>{articleName}</span>
                </div>
              )}
              {movementDate && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>{t('stockMovements.notesModal.date')}:</span>
                  <span className={styles.infoValue}>{movementDate}</span>
                </div>
              )}
              {movementType && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>{t('stockMovements.notesModal.type')}:</span>
                  <span className={styles.infoValue}>{movementType}</span>
                </div>
              )}
            </div>
          )}

          {/* Contenido de la nota */}
          <div className={styles.noteContent}>
            <div className={styles.noteLabel}>{t('stockMovements.notesModal.note')}:</div>
            <div className={styles.noteText}>
              {note || t('stockMovements.notesModal.noNote')}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeBtn} onClick={onClose}>
            {t('stockMovements.notesModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
}