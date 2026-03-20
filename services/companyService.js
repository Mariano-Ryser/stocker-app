// services/companyService.js
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ✅ Actualizar límite de productos (solo CEO)
export async function updateProductLimitAPI(companyId, maxProducts, reason = '') {
  try {
    console.log('📤 Enviando actualización de límite:', { companyId, maxProducts });
    
    const res = await fetch(`${API_BASE_URL}/users/company/${companyId}/product-limit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ maxProducts, reason })
    });

    const data = await res.json();
    console.log('📥 Respuesta:', data);

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { success: false, error: 'No autorizado' };
      }
      
      if (res.status === 403) {
        return { success: false, error: 'No tienes permisos para realizar esta acción' };
      }
      
      return { success: false, error: data.message || `Error ${res.status}` };
    }

    // ✅ DESPUÉS DE ACTUALIZAR, DISPARAR EVENTO MÚLTIPLES VECES PARA ASEGURAR
    if (typeof window !== 'undefined') {
      console.log('🎯 Disparando eventos de refresh...');
      window.dispatchEvent(new CustomEvent('refreshProductLimits'));
      
      // Disparar también después de un pequeño delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshProductLimits'));
      }, 500);
      
      // Y otro más después de 1 segundo
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('refreshProductLimits'));
      }, 1000);
    }

    return {
      success: true,
      company: data.company,
      oldLimit: data.oldLimit,
      newLimit: data.newLimit,
      message: data.message
    };

  } catch (error) {
    console.error('Error updating product limit:', error);
    return { 
      success: false, 
      error: error.message || 'Error de conexión con el servidor'
    };
  }
}

// ✅ Obtener detalles de una empresa
export async function getCompanyByIdAPI(companyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/company/${companyId}`, {
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { success: false, error: 'No autorizado' };
      }
      
      return { success: false, error: data.message || `Error ${res.status}` };
    }

    return {
      success: true,
      company: data.company || data
    };

  } catch (error) {
    console.error('Error getting company:', error);
    return { 
      success: false, 
      error: error.message || 'Error de conexión con el servidor'
    };
  }
}