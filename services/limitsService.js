// services/limitsService.js
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Obtener límites de productos - con opción para evitar caché
export async function getProductLimits(options = {}) {
  try {
    // console.log('🔍 Intentando obtener límites del backend...');
    
    // ✅ AÑADIR TIMESTAMP PARA EVITAR CACHÉ DEL NAVEGADOR
    const cacheBuster = options.noCache ? `&_=${Date.now()}` : '';
    const url = `${API_BASE_URL}/products/limits?t=${cacheBuster}`;
    // console.log('📡 URL:', url);
    
    const res = await fetch(url, {
      headers: getAuthHeaders(),
      cache: options.noCache ? 'no-store' : 'default'
    });

    // console.log('📥 Respuesta status:', res.status);

    if (!res.ok) {
      if (res.status === 401) {
        // console.log('🔒 No autorizado');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return null;
      }
      
      // Si es 404, el endpoint no existe - USAR CONTEO LOCAL
      if (res.status === 404) {
        console.warn('⚠️ Endpoint de límites no encontrado (404). Usando valores por defecto.');
        
        // Obtener productos del localStorage o de la sesión actual
        const storedProducts = localStorage.getItem('currentProducts');
        const currentCount = storedProducts ? JSON.parse(storedProducts).length : 0;
        
        // console.log('📦 Usando localStorage - currentCount:', currentCount);
        
        return {
          max: 100,
          current: currentCount,
          remaining: 100 - currentCount,
          percentage: Math.round((currentCount / 100) * 100)
        };
      }
      
      throw new Error(`Error ${res.status}`);
    }

    const data = await res.json();
    // console.log('✅ Datos recibidos:', data);
    
    const limits = data.limits || data;
    
    // Si el backend no envía current, calcularlo
    if (limits.current === undefined) {
      const storedProducts = localStorage.getItem('currentProducts');
      const currentCount = storedProducts ? JSON.parse(storedProducts).length : 0;
      limits.current = currentCount;
      limits.remaining = limits.max - currentCount;
      limits.percentage = Math.round((currentCount / limits.max) * 100);
    }
    
    // console.log('📊 Límites finales:', limits);
    return limits;
    
  } catch (error) {
    console.error('❌ Error getting product limits:', error);
    
    // Fallback: usar datos locales
    const storedProducts = localStorage.getItem('currentProducts');
    const currentCount = storedProducts ? JSON.parse(storedProducts).length : 0;
    
    // console.log('📦 Usando localStorage (fallback) - currentCount:', currentCount);
    
    return {
      max: 100,
      current: currentCount,
      remaining: 100 - currentCount,
      percentage: Math.round((currentCount / 100) * 100)
    };
  }
}