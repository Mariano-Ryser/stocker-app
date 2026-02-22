// services/bulkImportService.js
import { useAuth } from '../components/auth/AuthProvider';

export const useBulkImport = () => {
  const { user } = useAuth();

  // Función genérica para importar cualquier tipo de dato
  const bulkImport = async (data, type) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nicht authentifiziert. Bitte erneut anmelden.');
      }

      console.log(`=== STARTING BULK IMPORT (${type}) ===`);
      console.log(`Number of ${type} to import:`, data.length);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const endpoint = type === 'sales' ? 'sales/bulk' : 'products/bulk';
      const url = `${backendUrl}/${endpoint}`;
      
      console.log('Sending request to:', url);
      
      const bodyKey = type === 'sales' ? 'sales' : 'products';
      const requestBody = { [bodyKey]: data };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);

      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 500));

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Parsed JSON result:', result);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`);
      }
      
      if (!response.ok) {
        console.error('Bulk import failed with status:', response.status);
        throw new Error(result.message || `Import fehlgeschlagen (${response.status})`);
      }

      console.log(`=== BULK IMPORT SUCCESSFUL (${type}) ===`);
      
      // MANEJO ESPECÍFICO PARA LA RESPUESTA DEL BACKEND
      let formattedResult;
      
      if (type === 'products') {
        // El backend de productos devuelve: { ok: true, imported: X, total: Y, message: "...", errors: [] }
        const importedCount = result.imported || result.success || 0;
        const totalCount = result.total || data.length;
        const failedCount = totalCount - importedCount;
        
        formattedResult = {
          success: importedCount,
          failed: failedCount,
          imported: importedCount, // Mantener compatibilidad
          total: totalCount,
          errors: result.errors || [],
          message: result.message || `${importedCount} Produkte erfolgreich importiert`,
          ok: result.ok || true
        };
      } else {
        // Para sales (si algún día lo implementas)
        formattedResult = {
          success: result.success || result.results?.success || 0,
          failed: result.failed || result.results?.failed || 0,
          errors: result.errors || result.results?.errors || [],
          message: result.message || 'Import completed',
          ...result
        };
      }
      
      console.log('Formatted result for frontend:', formattedResult);
      return formattedResult;

    } catch (error) {
      console.error(`=== BULK IMPORT ERROR (${type}) ===`);
      console.error('Error details:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Verbindungsfehler mit dem Server. Bitte überprüfen Sie Ihre Internetverbindung.');
      }
      
      throw error;
    }
  };

  // Validación de productos mejorada
  const validateProducts = (products) => {
    console.log('=== VALIDATING PRODUCTS ===');
    console.log('Input products count:', products.length);
    
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

    console.log('=== VALIDATION RESULTS ===');
    console.log('Valid products:', validationResults.valid.length);
    console.log('Invalid products:', validationResults.invalid.length);
    
    return validationResults;
  };

  // Validación de sales (mantener por si acaso)
  const validateSales = (sales) => {
    return {
      valid: [],
      invalid: [],
      errors: []
    };
  };

  // Métodos específicos para mantener compatibilidad
  const bulkImportProducts = (products) => bulkImport(products, 'products');
  const bulkImportSales = (sales) => {
    throw new Error('Import für Verkäufe ist nicht verfügbar');
  };

  return {
    bulkImport,
    bulkImportProducts,
    bulkImportSales,
    validateProducts,
    validateSales
  };
};