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

// GET sales con paginación y filtros
export async function getSales(params = {}) {
  try {
    // Construir query string
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
    
    const API_URL = `${API_BASE_URL}/sales?${queryParams.toString()}`;
    // console.log('Fetching sales from:', API_URL);
    
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
    
    return {
      sales: data.sales || [],
      pagination: data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
      },
      stats: data.stats || {
        paidCount: 0,
        cancelledCount: 0,
        pendingCount: 0,
        totalUmsatz: 0,
        durchschnitt: 0,
        totalAllSales: 0
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
    // console.log('Creating sale with data:', payload);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    // console.log('Sale creation response:', data);

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

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Error in createSaleAPI:', error);
    throw new Error('Error de conexión con el servidor');
  }
}

export async function updateSaleAPI(saleId, payload) {
  try {
    const API_URL = `${API_BASE_URL}/sales/${saleId}`;
    // console.log('📤 Updating sale:', saleId, payload);
    
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    
    // console.log('📥 Response status:', res.status);
    
    const data = await res.json();
    // console.log('📥 Response data:', data);
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      throw new Error(data.message || `Error ${res.status}`);
    }
    
    return {
      sale: data.sale || data,
      success: true
    };
  } catch (error) {
    console.error('❌ Error in updateSaleAPI:', error);
    throw error;
  }
}

export async function deleteSaleAPI(saleId) {
  try {
    const API_URL = `${API_BASE_URL}/sales/${saleId}`;
    // console.log('Deleting sale:', saleId);
    
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
// services/saleService.js
export async function getAllSalesAPI() {
  try {
    const API_URL = `${API_BASE_URL}/sales/all`;
    
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { ok: false, sales: [] };
      }
      
      throw new Error(`Error al obtener ventas: ${res.status}`);
    }
    
    const data = await res.json();
    return data;
    
  } catch (error) {
    console.error('Error in getAllSalesAPI:', error);
    return { ok: false, sales: [], error: error.message };
  }
}