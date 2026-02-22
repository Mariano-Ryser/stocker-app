// services/productService.js (MODIFICADO)
import { indexedDBService } from './indexedDBService';

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

// 🔹 Obtener todos los productos con estrategia de caché
export async function getProducts(useCache = true, forceRefresh = false) {
  try {
    // Si no hay usuario autenticado, retornar array vacío
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      console.log('No hay token, retornando array vacío');
      return { products: [], total: 0, totalInventoryValue: 0 };
    }

    // Verificar si podemos usar el caché
    if (useCache && !forceRefresh && typeof window !== 'undefined') {
      try {
        // Verificar si el caché está fresco (menos de 5 minutos)
        const cacheStatus = await indexedDBService.isCacheFresh(5);
        
        if (cacheStatus.isFresh && cacheStatus.hasData) {
          console.log('Usando caché fresco...');
          const cachedProducts = await indexedDBService.getAllProducts();
          
          // Verificar si hay productos en caché
          if (cachedProducts && cachedProducts.length > 0) {
            console.log(`Usando ${cachedProducts.length} productos del caché`);
            return {
              products: cachedProducts,
              total: cachedProducts.length,
              totalInventoryValue: cachedProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0),
              fromCache: true,
              cacheTimestamp: cacheStatus.latestTimestamp
            };
          }
        }
      } catch (cacheError) {
        console.warn('Error accediendo al caché, procediendo con fetch normal:', cacheError);
        // Continuar con fetch normal si hay error en cache
      }
    }

    // Si no hay caché fresco o forceRefresh=true, hacer fetch a la API
    console.log('Fetching productos desde la API...');
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
      
      // Si hay error en la API, intentar usar caché como fallback
      if (useCache) {
        try {
          console.log('API falló, intentando usar caché como fallback...');
          const cachedProducts = await indexedDBService.getAllProducts();
          if (cachedProducts.length > 0) {
            console.log(`Usando ${cachedProducts.length} productos del caché (fallback)`);
            return {
              products: cachedProducts,
              total: cachedProducts.length,
              totalInventoryValue: cachedProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0),
              fromCache: true,
              isFallback: true
            };
          }
        } catch (fallbackError) {
          console.error('Error en fallback de caché:', fallbackError);
        }
      }
      
      throw new Error(`Error al obtener productos: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    // Guardar en caché para uso futuro
    if (useCache && typeof window !== 'undefined' && data.products) {
      try {
        console.log(`Guardando ${data.products.length} productos en caché...`);
        await indexedDBService.saveProducts(data.products);
        console.log('Productos guardados en caché exitosamente');
      } catch (cacheSaveError) {
        console.warn('Error guardando en caché:', cacheSaveError);
        // No fallar si no se puede guardar en caché
      }
    }
    
    console.log('Products fetched successfully from API');
    return {
      products: data.products || [],
      total: data.total || 0,
      totalInventoryValue: data.totalInventoryValue || 0,
      fromCache: false
    };

  } catch (error) {
    console.error('Error in getProducts:', error);
    throw new Error(`Network error: ${error.message}`);
  }
}

// 🔹 Crear producto (y actualizar caché)
export async function createProductAPI(product) {
  try {
    const API_URL = `${API_BASE_URL}/products`;
    console.log('Creating product with data:', product);
    
    const formData = new FormData();

    // Agregar campos obligatorios y opcionales
    formData.append('artikelName', product.artikelName || '');
    formData.append('lagerPlatz', product.lagerPlatz || '');
    formData.append('artikelNumber', product.artikelNumber || '');
    formData.append('description', product.description || '');
    formData.append('stock', product.stock ? Number(product.stock) : 0);
    formData.append('price', product.price ? Number(product.price) : 0);
    
    // Solo agregar imagen si es un File válido
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
    
    // Actualizar caché local si existe
    if (result.product && typeof window !== 'undefined') {
      try {
        await indexedDBService.updateProduct(result.product);
      } catch (cacheError) {
        console.warn('Error actualizando caché:', cacheError);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Error in createProductAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

// 🔹 Actualizar producto (y actualizar caché)
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
    
    const result = await res.json();
    
    // Actualizar caché local si existe
    if (result.product && typeof window !== 'undefined') {
      try {
        await indexedDBService.updateProduct(result.product);
      } catch (cacheError) {
        console.warn('Error actualizando caché:', cacheError);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in updateProductAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

// 🔹 Eliminar producto (y del caché)
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
    
    const result = await res.json();
    
    // Eliminar del caché local si existe
    if (typeof window !== 'undefined') {
      try {
        await indexedDBService.deleteProduct(id);
      } catch (cacheError) {
        console.warn('Error eliminando del caché:', cacheError);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in deleteProductAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}

// Helper para FormData (sin Content-Type)
const getAuthHeadersForFormData = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Función para forzar refresh del caché
export async function refreshCache(force = false) {
  if (typeof window === 'undefined') return { success: false, message: 'No en browser' };
  
  try {
    if (force) {
      await indexedDBService.clearCache();
    }
    
    const data = await getProducts(true, true); // forceRefresh = true
    return {
      success: true,
      fromCache: data.fromCache || false,
      count: data.total || 0
    };
  } catch (error) {
    console.error('Error refreshing cache:', error);
    return { success: false, error: error.message };
  }
}

// Obtener estadísticas del caché
export async function getCacheStats() {
  if (typeof window === 'undefined') return null;
  
  try {
    return await indexedDBService.getCacheStats();
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
}