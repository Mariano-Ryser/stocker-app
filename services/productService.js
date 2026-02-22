// services/productService.js
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

// 🔹 NUEVA: Obtener productos con paginación y filtros
export async function getProductsPaginated(queryParams) {
  try {
    const API_URL = `${API_BASE_URL}/products/paginated?${queryParams.toString()}`;
    console.log('Fetching paginated products from:', API_URL);
    
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
    
    console.log('Products fetched successfully:', {
      count: data.products?.length,
      pagination: data.pagination,
      totalInventoryValue: data.totalInventoryValue
    });

    return data; // Ahora esperamos { products, pagination, totalInventoryValue }
  } catch (error) {
    console.error('Error in getProductsPaginated:', error);
    throw new Error(`Network error: ${error.message}`);
  }
}

// 🔹 Mantener la función original para compatibilidad (opcional)
export async function getProducts() {
  try {
    const API_URL = `${API_BASE_URL}/products`;
    console.log('Fetching all products from:', API_URL);
    
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

// 🔹 Crear producto (maneja imagen opcional)
export async function createProductAPI(product) {
  try {
    const API_URL = `${API_BASE_URL}/products`;
    console.log('Creating product with data:', product);
    
    const formData = new FormData();

    formData.append('artikelName', product.artikelName || '');
    formData.append('lagerPlatz', product.lagerPlatz || '');
    formData.append('artikelNumber', product.artikelNumber || '');
    formData.append('description', product.description || '');
    formData.append('stock', product.stock ? Number(product.stock) : 0);
    formData.append('price', product.price ? Number(product.price) : 0);
    
    if (product.imagen && product.imagen instanceof File) {
      console.log('Adding image file:', product.imagen.name);
      formData.append('imagen', product.imagen);
    }

    const headers = getAuthHeadersForFormData();

    const res = await fetch(API_URL, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      throw new Error(`Error al crear producto: ${res.status}`);
    }
    
    const result = await res.json();
    console.log('Product created successfully:', result);
    return result;
    
  } catch (error) {
    console.error('Error in createProductAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

// 🔹 Actualizar producto
export async function updateProductAPI(id, updatedData) {
  try {
    const API_URL = `${API_BASE_URL}/products/${id}`;
    console.log('Updating product:', id, updatedData);
    
    const formData = new FormData();

    for (const key in updatedData) {
      if (updatedData[key] !== undefined && updatedData[key] !== null) {
        if (key === 'imagen' && updatedData[key] instanceof File) {
          formData.append(key, updatedData[key]);
        } else {
          formData.append(key, updatedData[key]);
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
    
    if (!res.ok) {
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