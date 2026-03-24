const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Función helper para obtener headers con token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper para FormData (sin Content-Type)
const getAuthHeadersForFormData = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// 🔹 Obtener TODOS los productos para el escáner (sin paginación)
export async function getAllProductsForScanner() {
  try {
    const API_URL = `${API_BASE_URL}/products/scanner`;
    
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
      throw new Error(`Error al obtener productos para escáner: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getAllProductsForScanner:', error);
    throw new Error(`Network error: ${error.message}`);
  }
}

// 🔹 Obtener productos con paginación y filtros
export async function getProductsPaginated(queryParams) {
  try {
    const API_URL = `${API_BASE_URL}/products/paginated?${queryParams.toString()}`;
    
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
      throw new Error(`Error al obtener productos: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getProductsPaginated:', error);
    throw new Error(`Network error: ${error.message}`);
  }
}

// 🔹 Mantener la función original para compatibilidad (opcional)
export async function getProducts() {
  try {
    const API_URL = `${API_BASE_URL}/products`;
    
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
      throw new Error(`Error al obtener productos: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    return {
      products: data.products || [],
      total: data.total || 0,
      totalInventoryValue: data.totalInventoryValue || 0
    };
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw new Error(`Network error: ${error.message}`);
  }
}

// 🔹 Crear producto (con lowStockThreshold)
export async function createProductAPI(productData) {
  try {
    const API_URL = `${API_BASE_URL}/products`;

    // Si hay imagen, usar FormData
    if (productData.imagen && productData.imagen instanceof File) {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key === 'imagen' && productData[key] instanceof File) {
          formData.append('imagen', productData[key]);
        } else if (key !== 'imagen') {
          // Asegurar que lowStockThreshold se envía correctamente
          if (key === 'lowStockThreshold') {
            const value = productData[key];
            if (value !== null && value !== undefined && value !== '') {
              formData.append(key, value.toString());
            }
          } else {
            formData.append(key, productData[key]);
          }
        }
      });

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.limits) {
          throw {
            type: 'LIMIT_ERROR',
            message: data.message,
            limits: data.limits
          };
        }
        throw new Error(data.message || `Error ${res.status}`);
      }

      return data;
    }

    // Sin imagen (JSON normal)
    const productToSend = {
      ...productData,
      lowStockThreshold: productData.lowStockThreshold === '' || productData.lowStockThreshold === null 
        ? null 
        : Number(productData.lowStockThreshold)
    };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(productToSend)
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 400 && data.limits) {
        throw {
          type: 'LIMIT_ERROR',
          message: data.message,
          limits: data.limits
        };
      }
      throw new Error(data.message || `Error ${res.status}`);
    }

    return data;

  } catch (error) {
    console.error('Error in createProductAPI:', error);
    throw error;
  }
}

// 🔹 Bulk import
export async function bulkImportAPI(products) {
  try {
    const API_URL = `${API_BASE_URL}/products/bulk`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ products })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 400 && data.limits) {
        throw {
          type: 'LIMIT_ERROR',
          message: data.message,
          limits: data.limits
        };
      }
      throw new Error(data.message || `Error ${res.status}`);
    }

    return data;

  } catch (error) {
    console.error('Error in bulkImportAPI:', error);
    throw error;
  }
}

// 🔹 Actualizar producto (con lowStockThreshold)
export async function updateProductAPI(id, updatedData) {
  try {
    const API_URL = `${API_BASE_URL}/products/${id}`;
    
    const formData = new FormData();

    for (const key in updatedData) {
      if (updatedData[key] !== undefined && updatedData[key] !== null) {
        if (key === 'imagen' && updatedData[key] instanceof File) {
          formData.append(key, updatedData[key]);
        } else {
          // Asegurar que lowStockThreshold se envía correctamente
          if (key === 'lowStockThreshold') {
            const value = updatedData[key];
            if (value !== null && value !== undefined && value !== '') {
              formData.append(key, value.toString());
            } else {
              formData.append(key, '');
            }
          } else {
            formData.append(key, updatedData[key]);
          }
        }
      }
    }

    const headers = getAuthHeadersForFormData();

    const res = await fetch(API_URL, {
      method: "PUT",
      headers: headers,
      body: formData,
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
      throw new Error(`Error al actualizar producto: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in updateProductAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

// 🔹 Eliminar producto
export async function deleteProductAPI(id) {
  try {
    const API_URL = `${API_BASE_URL}/products/${id}`;
    const res = await fetch(API_URL, { 
      method: "DELETE",
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      throw new Error(`Error al eliminar producto: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in deleteProductAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

// 🔹 Eliminar solo la imagen del producto
export async function deleteProductImageAPI(id) {
  try {
    const API_URL = `${API_BASE_URL}/products/${id}/image`;
    const res = await fetch(API_URL, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    if (!res.ok){
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      throw new Error(`Error al eliminar la imagen: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in deleteProductImageAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}