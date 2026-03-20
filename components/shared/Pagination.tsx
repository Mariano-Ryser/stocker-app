// components/shared/Pagination.js - VERSIÓN CON TYPES
import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onNext, 
  onPrev, 
  loading = false 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className={styles.pagination}>
      <button
        onClick={onPrev}
        disabled={currentPage === 1 || loading}
        className={styles.pageButton}
        aria-label="Página anterior"
      >
        ←
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange(page) : null}
          disabled={page === '...' || loading}
          className={`${styles.pageButton} ${page === currentPage ? styles.active : ''} ${page === '...' ? styles.dots : ''}`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={onNext}
        disabled={currentPage === totalPages || loading}
        className={styles.pageButton}
        aria-label="Página siguiente"
      >
        →
      </button>

      <span className={styles.pageInfo}>
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
};

export default Pagination;