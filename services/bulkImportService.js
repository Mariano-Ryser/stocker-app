// services/bulkImportService.js
import { useAuth } from '../components/auth/AuthProvider';

// ✅ FUNCIONES INDEPENDIENTES (sin hook)
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Función de validación de productos - EXPORTADA DIRECTAMENTE
export function validateProducts(products) {
  const validationResults = {
    valid: [],
    invalid: [],
    errors: []
  };

  products.forEach((product, index) => {
    const errors = [];

    // Validaciones básicas
    if (!product.artikelName || product.artikelName.trim() === '') {
      errors.push('Artikelname ist erforderlich');
    }

    // Convertir y validar stock
    if (product.stock !== undefined && product.stock !== null) {
      const stockNum = Number(product.stock);
      if (isNaN(stockNum)) {
        errors.push('Lagerbestand muss eine Zahl sein');
      } else if (stockNum < 0) {
        errors.push('Lagerbestand darf nicht negativ sein');
      }
    }

    // Convertir y validar precio
    if (product.price !== undefined && product.price !== null) {
      const priceNum = Number(product.price);
      if (isNaN(priceNum)) {
        errors.push('Preis muss eine Zahl sein');
      } else if (priceNum < 0) {
        errors.push('Preis darf nicht negativ sein');
      }
    }

    if (errors.length === 0) {
      // Preparar producto válido para importación
      const validProduct = {
        ...product,
        stock: product.stock !== undefined && product.stock !== null ? 
               Number(product.stock) : 0,
        price: product.price !== undefined && product.price !== null ? 
               Number(product.price) : 0,
        deleted: product.deleted === true || 
                product.deleted === 'true' || 
                String(product.deleted).toLowerCase() === 'ja' || 
                false
      };
      
      validationResults.valid.push(validProduct);
    } else {
      validationResults.invalid.push({
        index: index + 1,
        row: index + 2,
        product,
        errors
      });
    }
  });

  return validationResults;
}

// ✅ Función independiente para importar productos
export async function bulkImportProducts(products) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Nicht authentifiziert. Bitte erneut anmelden.');
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const url = `${backendUrl}/products/bulk`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ products })
    });

    const responseText = await response.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`);
    }
    
    if (!response.ok) {
      if (response.status === 400 && result.limits) {
        // Error de límite
        return {
          success: false,
          type: 'LIMIT_ERROR',
          message: result.message,
          limits: result.limits,
          imported: 0,
          total: products.length
        };
      }
      throw new Error(result.message || `Import fehlgeschlagen (${response.status})`);
    }

    // Formatear resultado
    const importedCount = result.imported || result.success || 0;
    const totalCount = result.total || products.length;
    const failedCount = totalCount - importedCount;
    
    return {
      success: true,
      imported: importedCount,
      success: importedCount,
      failed: failedCount,
      total: totalCount,
      errors: result.errors || [],
      message: result.message || `${importedCount} Produkte erfolgreich importiert`,
      limits: result.limits
    };

  } catch (error) {
    console.error('=== BULK IMPORT ERROR ===');
    console.error('Error details:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Verbindungsfehler mit dem Server. Bitte überprüfen Sie Ihre Internetverbindung.');
    }
    
    throw error;
  }
}

// ✅ HOOK para componentes que necesiten estado (opcional)
export const useBulkImport = () => {
  const { user } = useAuth();
 
  // Función genérica para importar cualquier tipo de dato
  const bulkImport = async (data, type) => {
    if (type === 'products') {
      return bulkImportProducts(data);
    }
    throw new Error('Import für diesen Typ nicht verfügbar');
  };

  return {
    bulkImport,
    bulkImportProducts,
    validateProducts,
    validateSales: (sales) => ({ valid: [], invalid: [], errors: [] })
  };
};