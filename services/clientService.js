// services/clientService.js - VERSIÓN CORREGIDA
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// 🔥 FUNCIÓN CORREGIDA: Obtener clientes con paginación
export async function getClientsPaginated(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    
    const API_URL = `${API_BASE_URL}/clients/paginated?${queryParams.toString()}`;
    // console.log('Fetching paginated clients:', API_URL);
    
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { ok: false, clients: [], pagination: { total: 0, pages: 1 } };
      }
      
      const errorText = await res.text();
      console.error('Error response:', errorText);
      return { ok: false, clients: [], pagination: { total: 0, pages: 1 } };
    }
    
    const data = await res.json();
    
    // ✅ SIEMPRE devolver con ok: true y los datos
    return { 
      ok: true, 
      clients: data.clients || [], 
      pagination: data.pagination || { total: 0, pages: 1 } 
    };
  } catch (error) {
    console.error('Error in getClientsPaginated:', error);
    return { ok: false, clients: [], pagination: { total: 0, pages: 1 } };
  }
}

// Las demás funciones se mantienen igual
export async function getClients() {
  try {
    const API_URL = `${API_BASE_URL}/clients`;
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { ok: false, message: 'Sesión expirada' };
      }
      return { ok: false, message: `Error al obtener clientes: ${res.status}` };
    }
    
    const data = await res.json();
    return { ok: true, clients: data.clients || [], stats: data.stats || { total: 0 } };
  } catch (error) {
    console.error('Error in getClients:', error);
    return { ok: false, message: error.message };
  }
}

export async function getClientsStats() {
  try {
    const API_URL = `${API_BASE_URL}/clients/stats`;
    
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { ok: false, message: 'Sesión expirada' };
      }
      
      const errorText = await res.text();
      console.error('Error response:', errorText);
      return { ok: false, message: `Error al obtener estadísticas: ${res.status}` };
    }
    
    const data = await res.json();
    return { ok: true, stats: data.stats || { total: 0 } };
  } catch (error) {
    console.error('Error in getClientsStats:', error);
    return { ok: false, message: error.message };
  }
}

export async function createClientAPI(client) {
  try {
    const API_URL = `${API_BASE_URL}/clients`;
    
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(client)
    });
    
    const responseData = await res.json();
    
    if (!res.ok) {
      console.error('Error response:', responseData);
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { ok: false, message: 'Sesión expirada' };
      }
      
      return { 
        ok: false, 
        errorCode: responseData.errorCode || 'UNKNOWN_ERROR',
        message: responseData.message || `Error ${res.status}` 
      };
    }
    
    return { ok: true, client: responseData.client };
  } catch (error) {
    console.error('Error in createClientAPI:', error);
    return { 
      ok: false, 
      errorCode: 'NETWORK_ERROR',
      message: error.message || 'Error de conexión' 
    };
  }
}

export async function updateClientAPI(id, client) {
  try {
    const API_URL = `${API_BASE_URL}/clients/${id}`;
    
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(client)
    });
    
    const responseData = await res.json();
    
    if (!res.ok) {
      console.error('Error response:', responseData);
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { ok: false, message: 'Sesión expirada' };
      }
      
      return { 
        ok: false, 
        errorCode: responseData.errorCode || 'UNKNOWN_ERROR',
        message: responseData.message || `Error ${res.status}` 
      };
    }
    
    return { ok: true, client: responseData.client };
  } catch (error) {
    console.error('Error in updateClientAPI:', error);
    return { 
      ok: false, 
      errorCode: 'NETWORK_ERROR',
      message: error.message || 'Error de conexión' 
    };
  }
}

export async function deleteClientAPI(id) {
  try {
    const API_URL = `${API_BASE_URL}/clients/${id}`;
    
    const res = await fetch(API_URL, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { ok: false, message: 'Sesión expirada' };
      }
      
      const errorText = await res.text();
      console.error('Error response:', errorText);
      return { ok: false, message: `Error al eliminar cliente: ${res.status}` };
    }
    
    return { ok: true };
  } catch (error) {
    console.error('Error in deleteClientAPI:', error);
    return { ok: false, message: error.message };
  }
}