import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

export default function ExcelImportExport({ 
  data, 
  onImport, 
  filename = 'export',
  disabled = false,
  showImport = true,
  showExport = true 
}) {
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Mapeo de columnas - MISMA ESTRUCTURA PARA EXPORTAR E IMPORTAR
  const columnMapping = {
    // Export: [campo en Excel] → Import: [campo en la app]
    'Artikelnummer': 'artikelNumber',
    'Artikelname': 'artikelName', 
    'Lagerplatz': 'lagerPlatz',
    'Beschreibung': 'description',
    'Lagerbestand': 'stock',
    'Preis (CHF)': 'price',
    'Bild-URL': 'imagen',
    'Gelöscht': 'deleted'
  };

  // Columnas en el orden correcto
  const columns = [
    'Artikelnummer',
    'Artikelname', 
    'Lagerplatz',
    'Beschreibung',
    'Lagerbestand',
    'Preis (CHF)',
    'Bild-URL',
    'Gelöscht'
  ];

  // Exportar a Excel - SOLO COLUMNAS ESENCIALES
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert('Keine Daten zum Exportieren');
      return;
    }

    setLoading(true);

    try {
      // Transformar los datos para Excel - MISMA ESTRUCTURA
      const worksheetData = data.map(item => ({
        'Artikelnummer': item.artikelNumber || '',
        'Artikelname': item.artikelName || '',
        'Lagerplatz': item.lagerPlatz || '',
        'Beschreibung': item.description || '',
        'Lagerbestand': item.stock || 0,
        'Preis (CHF)': item.price || 0,
        'Bild-URL': item.imagen || '',
        'Gelöscht': item.deleted ? 'Ja' : 'Nein'
      }));

      // Crear libro de Excel
      const ws = XLSX.utils.json_to_sheet(worksheetData, { header: columns });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Produkte');

      // Autoajustar columnas
      const colWidths = columns.map(col => ({
        width: Math.max(
          col.length, // Ancho del encabezado
          ...worksheetData.map(row => String(row[col] || '').length) // Ancho del contenido
        )
      }));
      
      ws['!cols'] = colWidths.map(width => ({ 
        width: Math.min(width.width + 2, 50) // +2 para padding, max 50
      }));

      // Agregar hoja de instrucciones
      const instructions = [
        ['=== IMPORT ANLEITUNG ==='],
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
        ['Gelöscht: "Ja" oder "Nein" (standard: "Nein")'],
        [''],
        ['Tipps:'],
        ['• Erforderlich: Nur "Artikelname"'],
        ['• "Gelöscht" muss "Ja" oder "Nein" sein'],
        ['• Zahlen für Bestand und Preis bitte ohne Währungssymbol'],
        ['• Maximale Dateigröße: 10MB']
      ];
      
      const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
      XLSX.utils.book_append_sheet(wb, wsInstructions, 'Anleitung');

      // Descargar archivo
      const today = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `${filename}_${today}.xlsx`);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Fehler beim Export: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Importar desde Excel - MISMA ESTRUCTURA
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

        console.log('Raw Excel data:', jsonData);

        // Transformar usando el mapeo consistente
        const transformedData = jsonData.map((row, index) => {
          const product = {};
          
          // Mapear cada columna usando nuestro mapping
          Object.keys(columnMapping).forEach(excelKey => {
            const appKey = columnMapping[excelKey];
            
            // Manejar diferentes nombres posibles de columnas
            let value = row[excelKey];
            
            // Si no encuentra con el nombre exacto, buscar variaciones
            if (value === undefined) {
              const variations = getColumnVariations(excelKey);
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
                product[appKey] = convertToNumber(value);
                break;
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
        }).filter(item => {
          // Filtrar filas vacías o sin artículo
          return item.artikelName && item.artikelName.trim() !== '';
        });

        console.log('Transformed data:', transformedData);

        if (onImport && transformedData.length > 0) {
          onImport(transformedData);
        } else if (transformedData.length === 0) {
          alert('Keine gültigen Produktdaten im Excel-File gefunden. Bitte prüfen Sie das Format.');
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
  const getColumnVariations = (columnName) => {
    const variations = {
      'Artikelnummer': ['Artikelnr', 'Art.-Nr.', 'Artikel-Nr', 'Product No', 'Product Number'],
      'Artikelname': ['Name', 'Product Name', 'Produktname', 'Artikel'],
      'Lagerplatz': ['Lagerort', 'Storage', 'Storage Location', 'Lager'],
      'Beschreibung': ['Description', 'Desc', 'Produktbeschreibung'],
      'Lagerbestand': ['Stock', 'Bestand', 'Quantity', 'Menge'],
      'Preis (CHF)': ['Preis', 'Price', 'Cost', 'CHF', 'EUR'],
      'Bild-URL': ['Bild', 'Image', 'Foto', 'Picture', 'URL'],
      'Gelöscht': ['Deleted', 'Active', 'Status', 'Archived']
    };
    return variations[columnName] || [];
  };

  const convertToNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;
    
    // Remover símbolos de moneda y espacios
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
              Excel importieren
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
              Excel exportieren
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
          min-width: 200px;
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