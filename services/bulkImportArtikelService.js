import { useAuth } from '../components/auth/AuthProvider';

export const useBulkImport = () => {
  const { user } = useAuth(); 

  const bulkImportProducts = async (products) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nicht authentifiziert. Bitte erneut anmelden.');
      }

      // console.log('Starting bulk import of', products.length, 'products');
      
      // VERIFICA QUE LA URL SEA CORRECTA
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const url = `${backendUrl}/products/bulk`;
      
      // console.log('Sending request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ products })
      });

      // console.log('Response status:', response.status);
      // console.log('Response headers:', response.headers);

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server returned non-JSON: ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Bulk import failed:', data);
        throw new Error(data.message || `Import fehlgeschlagen (${response.status})`);
      }

      // console.log('Bulk import successful:', data);
      return data;

    } catch (error) {
      console.error('Bulk import error:', error);
      throw error;
    }
  };

  const validateProducts = (products) => {
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

      if (product.stock !== undefined && product.stock !== null) {
        const stockNum = Number(product.stock);
        if (isNaN(stockNum) || stockNum < 0) {
          errors.push('Lagerbestand muss eine positive Zahl sein');
        }
      }

      if (product.price !== undefined && product.price !== null) {
        const priceNum = Number(product.price);
        if (isNaN(priceNum) || priceNum < 0) {
          errors.push('Preis muss eine positive Zahl sein');
        }
      }

      if (errors.length === 0) {
        validationResults.valid.push({
          ...product,
          stock: product.stock !== undefined ? Number(product.stock) || 0 : 0,
          price: product.price !== undefined ? Number(product.price) || 0 : 0,
          deleted: product.deleted === true || product.deleted === 'true' || false
        });
      } else {
        validationResults.invalid.push({
          index,
          product,
          errors
        });
      }
    });

    // console.log('Validation results:', validationResults);
    return validationResults;
  };

  return {
    bulkImportProducts,
    validateProducts
  };
};