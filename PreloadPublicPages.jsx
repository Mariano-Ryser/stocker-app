// utils/preloadDashboardSimple.js
let hasPreloaded = false;

export function preloadPublicPagesOnce() {
  if (typeof window === 'undefined' || hasPreloaded) return;
  
  hasPreloaded = true;
  
  const dashboardPages = [
    '/informativePages/uberUns',
    '/login',
    '/register',
    // '/informativePages/termsPage',
    // '/informativePages/privacyPage',
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
    }, index * 300); // 500ms entre cada página
  }
);
}