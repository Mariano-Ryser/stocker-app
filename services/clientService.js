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

// GET all clients del usuario actual
export async function getClients() {
  try {
    const API_URL = `${API_BASE_URL}/clients`;
    console.log('Fetching clients',);
    
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
      
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Error al obtener clientes: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Clients fetched with stats:', data);
    return data;
  } catch (error) {
    console.error('Error in getClients:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

export async function getClientsStats() {
  try {
    const API_URL = `${API_BASE_URL}/clients/stats`;
    console.log('Fetching clients stats');
    
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
      
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Error al obtener estadísticas: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Clients stats fetched:', data);
    return data;
  } catch (error) {
    console.error('Error in getClientsStats:', error);
    throw new Error(`Error: ${error.message}`);
  }
}


// CREATE client
export async function createClientAPI(client) {
  try {
    const API_URL = `${API_BASE_URL}/clients`;
    console.log('Creating client with data:', client);
    
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(client)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      let errorMessage = `Error ${res.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON, usar el texto
      }
      
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in createClientAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

// UPDATE client
export async function updateClientAPI(id, client) {
  try {
    const API_URL = `${API_BASE_URL}/clients/${id}`;
    console.log('Updating client:', id, client);
    
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(client)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      let errorMessage = `Error ${res.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON, usar el texto
      }
      
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in updateClientAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

// DELETE client
export async function deleteClientAPI(id) {
  try {
    const API_URL = `${API_BASE_URL}/clients/${id}`;
    console.log('Deleting client:', id);
    
    const res = await fetch(API_URL, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      throw new Error(`Error al eliminar cliente: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in deleteClientAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}