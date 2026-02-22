import { useAuth } from '../components/auth/AuthProvider';

export const useBulkImportSales = () => {
  const { user } = useAuth();

  const bulkImportSales = async (sales) => { // Cambiado de salesData a sales para ser consistente
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Nicht authentifiziert. Bitte erneut anmelden.');
      }

      console.log('Starting bulk import of', sales.length, 'sales');
      
      // VERIFICA QUE LA URL SEA CORRECTA
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const url = `${backendUrl}/sales/bulk`;
      
      console.log('Sending request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sales }) // Cambiado para ser consistente con productos
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

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

      console.log('Bulk import successful:', data);
      return data;

    } catch (error) {
      console.error('Bulk import error:', error);
      throw error;
    }
  };

  const validateSales = (sales) => { // Cambiado de salesData a sales
    const validationResults = {
      valid: [],
      invalid: [],
      errors: []
    };

    sales.forEach((sale, index) => {
      const errors = [];

      // Validaciones básicas para cada factura
      
      // Validar cliente
      const clientName = sale.clientSnapshot?.name || sale.clientName;
      if (!clientName || clientName.trim() === '') {
        errors.push('Kundenname ist erforderlich');
      }

      // Validar items
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach((item, itemIndex) => {
          if (!item.artikelName || item.artikelName.trim() === '') {
            errors.push(`Artikel ${itemIndex + 1}: Artikelname ist erforderlich`);
          }
          
          const quantity = Number(item.quantity);
          if (isNaN(quantity) || quantity <= 0) {
            errors.push(`Artikel ${itemIndex + 1}: Menge muss eine positive Zahl sein`);
          }
          
          const unitPrice = Number(item.unitPrice);
          if (isNaN(unitPrice) || unitPrice < 0) {
            errors.push(`Artikel ${itemIndex + 1}: Einzelpreis muss eine positive Zahl sein`);
          }
        });
      } else if (!sale.subtotal && !sale.total) {
        // Si no hay items, al menos debe haber subtotal o total
        errors.push('Mindestens ein Artikel oder Gesamtbetrag ist erforderlich');
      }

      // Validar montos numéricos
      if (sale.subtotal !== undefined && sale.subtotal !== null) {
        const subtotalNum = Number(sale.subtotal);
        if (isNaN(subtotalNum) || subtotalNum < 0) {
          errors.push('Subtotal muss eine positive Zahl sein');
        }
      }

      if (sale.tax !== undefined && sale.tax !== null) {
        const taxNum = Number(sale.tax);
        if (isNaN(taxNum) || taxNum < 0) {
          errors.push('MwSt muss eine positive Zahl sein');
        }
      }

      if (sale.total !== undefined && sale.total !== null) {
        const totalNum = Number(sale.total);
        if (isNaN(totalNum) || totalNum < 0) {
          errors.push('Total muss eine positive Zahl sein');
        }
      }

      // Validar status
      if (sale.status && !['pending', 'paid', 'cancelled'].includes(sale.status)) {
        errors.push('Status muss "pending", "paid" oder "cancelled" sein');
      }

      if (errors.length === 0) {
        // Preparar datos válidos para importación
        const validSale = {
          lieferschein: sale.lieferschein || `LS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          clientSnapshot: {
            name: sale.clientSnapshot?.name || sale.clientName || '',
            clientNumber: sale.clientSnapshot?.clientNumber || sale.clientNumber || ''
          },
          items: (sale.items || []).map(item => ({
            artikelName: item.artikelName || '',
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            lineTotal: Number(item.lineTotal) || (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
          })),
          subtotal: Number(sale.subtotal) || (sale.items || []).reduce((sum, item) => 
            sum + (Number(item.lineTotal) || (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)), 0),
          tax: Number(sale.tax) || 0,
          total: Number(sale.total) || 
            (Number(sale.subtotal) || (sale.items || []).reduce((sum, item) => 
              sum + (Number(item.lineTotal) || (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)), 0)) + 
            (Number(sale.tax) || 0),
          status: sale.status || 'paid'
        };

        validationResults.valid.push(validSale);
      } else {
        validationResults.invalid.push({
          index,
          sale,
          errors
        });
      }
    });

    console.log('Validation results for sales:', validationResults);
    return validationResults;
  };

  return {
    bulkImportSales,
    validateSales
  };
};