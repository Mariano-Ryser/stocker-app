// services/saleService.js
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

// GET all sales del usuario actual
export async function getSales() {
  try {
    const API_URL = `${API_BASE_URL}/sales`;
    console.log('Fetching sales from:', API_URL);
    
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
      throw new Error(`Error al obtener ventas: ${res.status}`);
    }
    
    const data = await res.json();
    // console.log('Sales fetched with stats:', data); 

    // return data;
        return {
      sales: data.sales || [],
      total: data.total || 0,
      stats: data.stats || {
        paidCount: 0,
        cancelledCount: 0,
        pendingCount: 0,
        totalUmsatz: 0,
        durchschnitt: 0
      }
    };

 
  } catch (error) {
    console.error('Error in getSales:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

export async function createSaleAPI(payload) {
  try {
    const API_URL = `${API_BASE_URL}/sales`;
    console.log('Creating sale with data:', payload);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Sale creation response:', data);

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { success: false, type: 'UNAUTHORIZED' };
      }
      
      return {
        success: false,
        type: 'BUSINESS_ERROR',
        message: data.message || `Error ${res.status}`
      };
    }

    // ✅ Éxito
    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Error in createSaleAPI:', error);
    throw new Error('Error de conexión mit dem Server');
  }
}

// UPDATE sale
export async function updateSaleAPI(saleId, payload) {
  try {
    const API_URL = `${API_BASE_URL}/sales/${saleId}`;
    console.log('Updating sale:', saleId, payload);
    
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
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
    console.error('Error in updateSaleAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

// DELETE sale
export async function deleteSaleAPI(saleId) {
  try {
    const API_URL = `${API_BASE_URL}/sales/${saleId}`;
    console.log('Deleting sale:', saleId);
    
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
      
      throw new Error(`Error al eliminar venta: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in deleteSaleAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}