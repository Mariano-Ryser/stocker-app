// services/clientService.js
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Función helper para obtener headers con token
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

//  GET all clients 🔴 del usuario actual
export async function getClients() {
  try {
    const API_URL = `${API_BASE_URL}/clients`;
    // console.log('Fetching clients');
    
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
      return { ok: false, message: `Error al obtener clientes: ${res.status}` };
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getClients:', error);
    return { ok: false, message: error.message };
  }
}
//  Get ClientsStats🔴
export async function getClientsStats() {
  try {
    const API_URL = `${API_BASE_URL}/clients/stats`;
    // console.log('Fetching clients stats');
    
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
    return data;
  } catch (error) {
    console.error('Error in getClientsStats:', error);
    return { ok: false, message: error.message };
  }
}

// CREATE client - 🔴 CORREGIDO: NO lanzar errores, devolver objeto con error
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
      
      // ✅ Devolver el errorCode y el mensaje
      return { 
        ok: false, 
        errorCode: responseData.errorCode || 'UNKNOWN_ERROR',  // <--- NUEVO
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

// UPDATE client - 🔴 CORREGIDO con errorCode
export async function updateClientAPI(id, client) {
  try {
    const API_URL = `${API_BASE_URL}/clients/${id}`;
    // console.log('Updating client:', id, client);
    
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
      
      // ✅ Devolver errorCode y message
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

// DELETE client - 🔴 CORREGIDO: NO lanzar errores
export async function deleteClientAPI(id) {
  try {
    const API_URL = `${API_BASE_URL}/clients/${id}`;
    // console.log('Deleting client:', id);
    
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