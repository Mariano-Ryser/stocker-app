// services/bulkImportService.js
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ✅ EXPORTAR ESTA FUNCIÓN
export async function bulkImportProducts(products) {
  try {
    const API_URL = `${API_BASE_URL}/products/bulk`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ products })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { success: false, error: 'No autorizado' };
      }
      
      if (res.status === 400 && data.limits) {
        throw {
          type: 'LIMIT_ERROR',
          message: data.message,
          limits: data.limits
        };
      }
      
      throw new Error(data.message || `Error ${res.status}`);
    }

    return {
      success: true,
      imported: data.imported || data.count || 0,
      total: data.total || products.length,
      errors: data.errors || [],
      message: data.message || 'Import completado',
      limits: data.limits
    };

  } catch (error) {
    console.error('Error in bulkImportProducts:', error);
    throw error;
  }
}

// ✅ EXPORTAR TAMBIÉN validateProducts
export function validateProducts(products) {
  const valid = [];
  const invalid = [];

  products.forEach((product, index) => {
    const errors = [];
    
    if (!product.artikelName || product.artikelName.trim() === '') {
      errors.push('Artikelname ist erforderlich');
    }
    
    if (errors.length === 0) {
      valid.push(product);
    } else {
      invalid.push({
        row: index + 2,
        index,
        errors,
        product
      });
    }
  });

  return { valid, invalid };
}

// ✅ HOOK para usar en componentes
export function useBulkImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const importProducts = async (products) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bulkImportProducts(products);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    bulkImportProducts: importProducts,
    validateProducts,
    loading,
    error
  };
}