// services/stockMovementService.js
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
// Función helper para construir la URL correcta
const getApiUrl = (path) => {
  // Eliminar /api del final si existe
  const base = API_BASE_URL.replace(/\/api$/, '');
  
  // Construir URL: base/api/v1 + path
  return `${base}${path}`;
};
// Crear movimiento de stock
export async function createStockMovement(movementData) {
  try {
    const API_URL = getApiUrl('/stock-movements');
    // console.log('📤 Enviando movimiento a:', API_URL);
    // console.log('📦 Datos:', movementData);
    
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(movementData)
    });

    // console.log('📥 Respuesta status:', res.status);

    // Intentar obtener el cuerpo de la respuesta
    let responseData;
    const contentType = res.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
      // console.log('📥 Respuesta data:', responseData);
    } else {
      const text = await res.text();
      // console.log('📥 Respuesta texto:', text);
      responseData = { message: text };
    }

    if (!res.ok) {
      if (res.status === 401) {
        // console.log('🔒 No autorizado, redirigiendo a login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      throw new Error(responseData.message || responseData.error || `Error ${res.status}: ${res.statusText}`);
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error en createStockMovement:', error);
    throw error;
  }
}

// Obtener movimientos con filtros
export async function getStockMovements(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const API_URL = `${getApiUrl('/stock-movements')}?${queryParams.toString()}`;
    // console.log('🔍 Fetching movimientos desde:', API_URL);
    
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });

    // console.log('📥 Respuesta status:', res.status);

    let responseData;
    const contentType = res.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
    } else {
      const text = await res.text();
      // console.log('📥 Respuesta texto:', text);
      responseData = { movements: [], pagination: { total: 0, pages: 1 } };
    }

    if (!res.ok) {
      if (res.status === 401) {
        // console.log('🔒 No autorizado, redirigiendo a login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      console.error('❌ Error en respuesta:', responseData);
      throw new Error(responseData.message || responseData.error || 'Error al obtener movimientos');
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error en getStockMovements:', error);
    throw error;
  }
}

// Obtener movimientos de un producto específico
export async function getProductMovements(productId) {
  try {
    const API_URL = getApiUrl(`/stock-movements/product/${productId}`);
    // console.log('🔍 Fetching movimientos del producto:', API_URL);
    
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener movimientos del producto');
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error en getProductMovements:', error);
    throw error;
  }
}

// Obtener resumen de movimientos
export async function getMovementsSummary(period = 'month') {
  try {
    const API_URL = getApiUrl(`/stock-movements/summary?period=${period}`);
    // console.log('📊 Fetching resumen:', API_URL);
    
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener resumen');
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Error en getMovementsSummary:', error);
    throw error;
  }
}

// Obtener movimientos de una venta específica (NUEVA FUNCIÓN)
// services/stockMovementService.js - Función getSaleMovements mejorada

export async function getSaleMovements(saleId) {
  try {
    const API_URL = getApiUrl(`/stock-movements/sale/${saleId}`);
    // console.log('🔍 Fetching movimientos de venta:', API_URL);
    // console.log('📤 Headers:', getAuthHeaders());
    
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });

    // console.log('📥 Respuesta status:', res.status);
    // console.log('📥 Respuesta status text:', res.statusText);
    // console.log('📥 Respuesta headers:', Object.fromEntries(res.headers));

    // Intentar obtener el cuerpo de la respuesta
    let responseData;
    const contentType = res.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
      // console.log('📥 Respuesta JSON:', responseData);
    } else {
      const text = await res.text();
      // console.log('📥 Respuesta texto:', text);
      responseData = { message: text };
    }

    if (!res.ok) {
      if (res.status === 401) {
        // console.log('🔒 No autorizado, redirigiendo a login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (res.status === 404) {
        // console.log('📭 Ruta no encontrada - Verifica que el backend tenga la ruta /api/v1/stock-movements/sale/:saleId');
        throw new Error('La ruta de movimientos de venta no existe en el backend');
      }
      
      if (res.status === 500) {
        // console.log('💥 Error interno del servidor');
        throw new Error('Error interno del servidor: ' + (responseData.message || 'Error 500'));
      }
      
      console.error('❌ Error en respuesta:', responseData);
      throw new Error(responseData.message || responseData.error || `Error ${res.status}: ${res.statusText}`);
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error en getSaleMovements:', error);
    throw error;
  }
}