import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

export default function ExcelImportExport({ 
  data, 
  onImport, 
  filename = 'export',
  disabled = false,
  showImport = true,
  showExport = true,
  type = 'products' // 'products' o 'sales'
}) {
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Configuración por tipo de datos
  const config = {
    products: {
      columnMapping: {
        'Artikelnummer': 'artikelNumber',
        'Artikelname': 'artikelName', 
        'Lagerplatz': 'lagerPlatz',
        'Beschreibung': 'description',
        'Lagerbestand': 'stock',
        'Preis (CHF)': 'price',
        'Bild-URL': 'imagen',
        'Gelöscht': 'deleted'
      },
      columns: [
        'Artikelnummer',
        'Artikelname', 
        'Lagerplatz',
        'Beschreibung',
        'Lagerbestand',
        'Preis (CHF)',
        'Bild-URL',
        'Gelöscht'
      ],
      title: 'Produkte',
      sheetName: 'Produkte'
    },
    sales: {
      columnMapping: {
        'Lieferschein Nr.': 'lieferschein',
        'Kunde': 'clientName',
        'Kunden Nr.': 'clientNumber',
        'Datum': 'date',
        'Artikelname': 'artikelName',
        'Menge': 'quantity',
        'Einzelpreis (CHF)': 'unitPrice',
        'Zeilen Total (CHF)': 'lineTotal',
        'Subtotal (CHF)': 'subtotal',
        'MwSt (CHF)': 'tax',
        'Total (CHF)': 'total',
        'Status': 'status'
      },
      columns: [
        'Lieferschein Nr.',
        'Kunde',
        'Kunden Nr.',
        'Datum',
        'Artikelname',
        'Menge',
        'Einzelpreis (CHF)',
        'Zeilen Total (CHF)',
        'Subtotal (CHF)',
        'MwSt (CHF)',
        'Total (CHF)',
        'Status'
      ],
      title: 'Facturas',
      sheetName: 'Facturas'
    }
  };

  const currentConfig = config[type] || config.products;

  // Exportar a Excel
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert(`Keine ${type === 'sales' ? 'Facturas' : 'Produkte'} zum Exportieren`);
      return;
    }

    setLoading(true);

    try {
      let worksheetData = [];

      if (type === 'products') {
        worksheetData = data.map(item => ({
          'Artikelnummer': item.artikelNumber || '',
          'Artikelname': item.artikelName || '',
          'Lagerplatz': item.lagerPlatz || '',
          'Beschreibung': item.description || '',
          'Lagerbestand': item.stock || 0,
          'Preis (CHF)': item.price || 0,
          'Bild-URL': item.imagen || '',
          'Gelöscht': item.deleted ? 'Ja' : 'Nein'
        }));
      } else if (type === 'sales') {
        worksheetData = data.map(sale => {
          // Para facturas con múltiples items, creamos una fila por item
          if (sale.items && sale.items.length > 0) {
            return sale.items.map((item, index) => ({
              'Lieferschein Nr.': sale.lieferschein || '',
              'Kunde': sale.clientSnapshot?.name || sale.client?.name || '',
              'Kunden Nr.': sale.clientSnapshot?.clientNumber || sale.client?.clientNumber || '',
              'Datum': sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('de-CH') : '',
              'Artikelname': item.artikelName || item.product?.artikelName || '',
              'Menge': item.quantity || 0,
              'Einzelpreis (CHF)': item.unitPrice || 0,
              'Zeilen Total (CHF)': item.lineTotal || 0,
              'Subtotal (CHF)': sale.subtotal || 0,
              'MwSt (CHF)': sale.tax || 0,
              'Total (CHF)': sale.total || 0,
              'Status': sale.status || 'paid'
            }));
          }
          return {
            'Lieferschein Nr.': sale.lieferschein || '',
            'Kunde': sale.clientSnapshot?.name || sale.client?.name || '',
            'Kunden Nr.': sale.clientSnapshot?.clientNumber || sale.client?.clientNumber || '',
            'Datum': sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('de-CH') : '',
            'Artikelname': '',
            'Menge': 0,
            'Einzelpreis (CHF)': 0,
            'Zeilen Total (CHF)': 0,
            'Subtotal (CHF)': sale.subtotal || 0,
            'MwSt (CHF)': sale.tax || 0,
            'Total (CHF)': sale.total || 0,
            'Status': sale.status || 'paid'
          };
        }).flat();
      }

      // Crear libro de Excel
      const ws = XLSX.utils.json_to_sheet(worksheetData, { header: currentConfig.columns });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, currentConfig.sheetName);

      // Autoajustar columnas
      const colWidths = currentConfig.columns.map(col => ({
        width: Math.max(
          col.length,
          ...worksheetData.map(row => String(row[col] || '').length)
        )
      }));
      
      ws['!cols'] = colWidths.map(width => ({ 
        width: Math.min(width.width + 2, 50)
      }));

      // Agregar hoja de instrucciones
      const instructions = type === 'products' ? [
        ['=== IMPORT ANLEITUNG FÜR PRODUKTE ==='],
        [''],
        ['WICHTIG: Verwenden Sie diese Vorlage für Import und Export'],
        [''],
        ['Spaltenbeschreibung:'],
        ['Artikelnummer: Eindeutige Nummer (optional)'],
        ['Artikelname: Name des Produkts (ERFORDERLICH)'],
        ['Lagerplatz: Lagerort (z.B. A-01)'],
        ['Beschreibung: Produktbeschreibung'],
        ['Lagerbestand: Anzahl auf Lager (Zahl)'],
        ['Preis (CHF): Preis in Schweizer Franken (Zahl)'],
        ['Bild-URL: Link zum Produktbild'],
        ['Gelöscht: "Ja" oder "Nein" (standard: "Nein")']
      ] : [
        ['=== IMPORT ANLEITUNG FÜR FACTURAS ==='],
        [''],
        ['WICHTIG: Exportierte Facturas können auch importiert werden'],
        [''],
        ['Spaltenbeschreibung:'],
        ['Lieferschein Nr.: Eindeutige Nummer (optional)'],
        ['Kunde: Name des Kunden'],
        ['Kunden Nr.: Kundennummer (optional)'],
        ['Datum: Verkaufsdatum (DD.MM.YYYY)'],
        ['Artikelname: Name des verkauften Artikels'],
        ['Menge: Verkaufte Anzahl (Zahl)'],
        ['Einzelpreis (CHF): Preis pro Einheit'],
        ['Zeilen Total (CHF): Menge × Einzelpreis'],
        ['Subtotal (CHF): Summe aller Zeilen'],
        ['MwSt (CHF): Mehrwertsteuer'],
        ['Total (CHF): Subtotal + MwSt'],
        ['Status: "pending", "paid" oder "cancelled"']
      ];
      
      const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
      XLSX.utils.book_append_sheet(wb, wsInstructions, 'Anleitung');

      // Descargar archivo
      const today = new Date().toISOString().split('T')[0];
      const typeLabel = type === 'sales' ? 'Facturas' : 'Produkte';
      XLSX.writeFile(wb, `${typeLabel}_${today}.xlsx`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Fehler beim Export: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Importar desde Excel
  const importFromExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        // console.log('Raw Excel data:', jsonData);

        let transformedData = [];

        if (type === 'products') {
          transformedData = jsonData.map((row, index) => {
            const product = {};
            
            Object.keys(currentConfig.columnMapping).forEach(excelKey => {
              const appKey = currentConfig.columnMapping[excelKey];
              let value = row[excelKey];
              
              if (value === undefined) {
                const variations = getProductColumnVariations(excelKey);
                for (const variation of variations) {
                  if (row[variation] !== undefined) {
                    value = row[variation];
                    break;
                  }
                }
              }

              // Convertir valores según el tipo
              switch (appKey) {
                case 'stock':
                case 'price':
                  product[appKey] = convertToNumber(value);
                  break;
                case 'deleted':
                  product[appKey] = convertToBoolean(value);
                  break;
                default:
                  product[appKey] = value || '';
              }
            });

            return product;
          }).filter(item => item.artikelName && item.artikelName.trim() !== '');
        } else if (type === 'sales') {
          // Agrupar facturas por Lieferschein Nr.
          const groupedSales = {};
          
          jsonData.forEach((row, index) => {
            const lieferschein = row['Lieferschein Nr.'] || row['Lieferscheinnummer'] || `TEMP_${index}`;
            
            if (!groupedSales[lieferschein]) {
              groupedSales[lieferschein] = {
                lieferschein,
                clientSnapshot: {
                  name: row['Kunde'] || '',
                  clientNumber: row['Kunden Nr.'] || ''
                },
                date: row['Datum'] || new Date().toISOString(),
                items: [],
                subtotal: convertToNumber(row['Subtotal (CHF)']) || 0,
                tax: convertToNumber(row['MwSt (CHF)']) || 0,
                total: convertToNumber(row['Total (CHF)']) || 0,
                status: row['Status'] || 'paid'
              };
            }
            
            // Agregar item si hay artículo
            if (row['Artikelname'] && row['Artikelname'].trim() !== '') {
              groupedSales[lieferschein].items.push({
                artikelName: row['Artikelname'],
                quantity: convertToNumber(row['Menge']),
                unitPrice: convertToNumber(row['Einzelpreis (CHF)']),
                lineTotal: convertToNumber(row['Zeilen Total (CHF)'])
              });
            }
          });
          
          transformedData = Object.values(groupedSales);
        }

        // console.log('Transformed data:', transformedData);

        if (onImport && transformedData.length > 0) {
          onImport(transformedData);
        } else if (transformedData.length === 0) {
          alert(`Keine gültigen ${type === 'sales' ? 'Facturas' : 'Produktdaten'} im Excel-File gefunden.`);
        }

      } catch (error) {
        console.error('Import error:', error);
        alert('Fehler beim Import: ' + error.message);
      } finally {
        setImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = (error) => {
      console.error('File reading error:', error);
      alert('Fehler beim Lesen der Datei');
      setImporting(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Funciones helper
  const getProductColumnVariations = (columnName) => {
    const variations = {
      'Artikelnummer': ['Artikelnr', 'Art.-Nr.', 'Artikel-Nr', 'Product No'],
      'Artikelname': ['Name', 'Product Name', 'Produktname'],
      'Lagerplatz': ['Lagerort', 'Storage', 'Lager'],
      'Beschreibung': ['Description', 'Desc'],
      'Lagerbestand': ['Stock', 'Bestand', 'Quantity'],
      'Preis (CHF)': ['Preis', 'Price', 'CHF'],
      'Bild-URL': ['Bild', 'Image', 'URL'],
      'Gelöscht': ['Deleted', 'Active', 'Status']
    };
    return variations[columnName] || [];
  };

  const convertToNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;
    
    const cleanValue = String(value).replace(/[^\d.,-]/g, '').replace(',', '.');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? 0 : num;
  };

  const convertToBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    
    const strValue = String(value).toLowerCase().trim();
    return ['ja', 'yes', 'true', '1', 'y', 'j'].includes(strValue);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const buttonText = type === 'sales' ? 'Facturas' : 'Produkte';

  return (
    <div className="excel-actions">
      <input
        type="file"
        ref={fileInputRef}
        onChange={importFromExcel}
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        disabled={importing}
      />
      
      {showImport && (
        <button 
          onClick={triggerFileInput}
          disabled={importing || disabled}
          className="action-button import"
        >
          {importing ? (
            <>
              <div className="button-spinner"></div>
              Importiere...
            </>
          ) : (
            <>
              <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                <path d="M17 8l-5-5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {buttonText} importieren
            </>
          )}
        </button>
      )}
      
      {showExport && (
        <button 
          onClick={exportToExcel} 
          disabled={disabled || loading || !data || data.length === 0}
          className="action-button export"
        >
          {loading ? (
            <>
              <div className="button-spinner"></div>
              Exportiere...
            </>
          ) : (
            <>
              <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {buttonText} exportieren
            </>
          )}
        </button>
      )}

      <style jsx>{`
        .excel-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
        }
        
        .action-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.75rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          border: 2px solid transparent;
          min-width: 220px;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .action-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        
        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
        
        .action-button.import {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
        }
        
        .action-button.import:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }
        
        .action-button.export {
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
          color: white;
        }
        
        .action-button.export:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669 0%, #065f46 100%);
        }
        
        .button-icon {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
        }
        
        .button-spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .excel-actions {
            flex-direction: column;
          }
          
          .action-button {
            width: 100%;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}