// utils/preloadDashboardSimple.js
let hasPreloaded = false;

export function preloadDashboardOnce() {
  if (typeof window === 'undefined' || hasPreloaded) return;
  
  hasPreloaded = true;
  
  const dashboardPages = [
    '/adminDash/artikel',
    '/adminDash/wareneigang',
    
    '/adminDash/stockMovements',
    '/adminDash/clients',
    '/adminDash/regnung',
    '/adminDash/scanner',
    '/adminDash/settings',
  ];
  
  console.log('🚀 ...');
  
  dashboardPages.forEach((page, index) => {
    setTimeout(() => {
      // Precargar con Next.js
      if (window.next && window.next.router) {
        window.next.router.prefetch(page);
      }
      // Hacer fetch para forzar compilación
      fetch(page, { method: 'HEAD' }).catch(() => {});
    }, index * 400); // 500ms entre cada página
  }

);
}