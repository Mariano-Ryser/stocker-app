// hooks/useInfiniteScroll.js - VERSIÓN MEJORADA
import { useState, useEffect, useRef } from 'react';

export function useInfiniteScroll(items = [], options = {}, refreshTrigger = 0) {
  const {
    initialCount = 20,
    loadMoreCount = 20,
    loadDelay = 100,
    rootMargin = '200px'
  } = options;

  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);

  // Reset cuando cambian los items O cuando hay un refresh trigger
  useEffect(() => {
    setVisibleCount(initialCount);
  }, [items.length, initialCount, refreshTrigger]); // ← NUEVO: agregar refreshTrigger

  // Infinite scroll
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    
    if (!currentRef || visibleCount >= items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + loadMoreCount, items.length));
            setLoadingMore(false);
          }, loadDelay);
        }
      },
      { 
        rootMargin,
        threshold: 0.1
      }
    );

    observer.observe(currentRef);
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [visibleCount, items.length, loadingMore, loadMoreCount, loadDelay, rootMargin, loadMoreRef.current]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return {
    visibleItems,
    visibleCount,
    loadingMore,
    loadMoreRef,
    hasMore,
    totalItems: items.length
  };
}