// components/ui/ExcelTemplate.jsx
import * as XLSX from 'xlsx';
import styles from './ExcelTemplate.module.css';

export default function ExcelTemplateButton({ type = 'products' }) {
  const config = {
    products: {
      data: [
        {
          'Artikelnummer': 'ART-001',
          'Artikelname': 'Beispiel Produkt 1',
          'Lagerplatz': 'A-01',
          'Beschreibung': 'Beschreibung des Produkts',
          'Lagerbestand': 100,
          'Preis (CHF)': 19.99,
          'Bild-URL': 'https://example.com/bild.jpg',
        },
        {
          'Artikelnummer': 'ART-002',
          'Artikelname': 'Beispiel Produkt 2',
          'Lagerplatz': 'B-02',
          'Beschreibung': 'Weitere Beschreibung',
          'Lagerbestand': 50,
          'Preis (CHF)': 29.99,
          'Bild-URL': '',
        }
      ],
      instructions: [
        ['INSTRUKTIONEN FÜR DEN IMPORT VON PRODUKTEN'],
        [''],
        ['1. Füllen Sie diese Vorlage mit Ihren Produktdaten aus'],
        ['2. Erforderliche Felder: Artikelname'],
        ['3. Optionale Felder: Alle anderen'],
        ['4. Zahlen für Lagerbestand und Preis können direkt eingegeben werden'],
        ['5. "Gelöscht" muss "Ja" oder "Nein" sein'],
        ['6. Speichern Sie die Datei als .xlsx oder .xls'],
        ['7. Verwenden Sie die Import-Funktion in der App'],
        [''],
        ['WICHTIG:'],
        ['- Löschen Sie nicht die Kopfzeile'],
        ['- Verwenden Sie das gleiche Spaltenformat'],
        ['- Maximale Dateigröße: 10MB'],
        ['- Maximale Zeilen: 10.000']
      ],
      filename: 'Produkt_Import_Vorlage.xlsx',
      title: 'Produkte'
    },
    sales: {
      data: [
        {
          'Lieferschein Nr.': 'LS-2023-001',
          'Kunde': 'Beispiel GmbH',
          'Kunden Nr.': 'K-001',
          'Datum': '01.01.2023',
          'Artikelname': 'Produkt A',
          'Menge': 5,
          'Einzelpreis (CHF)': 19.99,
          'Zeilen Total (CHF)': 99.95,
          'Subtotal (CHF)': 99.95,
          'MwSt (CHF)': 7.20,
          'Total (CHF)': 107.15,
          'Status': 'paid'
        },
        {
          'Lieferschein Nr.': 'LS-2023-001',
          'Kunde': 'Beispiel GmbH',
          'Kunden Nr.': 'K-001',
          'Datum': '01.01.2023',
          'Artikelname': 'Produkt B',
          'Menge': 3,
          'Einzelpreis (CHF)': 29.50,
          'Zeilen Total (CHF)': 88.50,
          'Subtotal (CHF)': 188.45,
          'MwSt (CHF)': 13.57,
          'Total (CHF)': 202.02,
          'Status': 'paid'
        }
      ],
      instructions: [
        ['INSTRUKTIONEN FÜR DEN EXPORT VON FACTURAS'],
        [''],
        ['1. Dies ist eine Exportvorlage für Facturas'],
        ['2. Wichtig: Gleicher Lieferschein = gleiche Factura'],
        ['3. Eine Factura kann mehrere Artikel enthalten'],
        ['4. Felder:'],
        ['   - Lieferschein Nr.: Eindeutige Nummer pro Factura'],
        ['   - Kunde: Name des Kunden'],
        ['   - Artikelname: Name des Artikels (pro Zeile)'],
        ['   - Menge, Einzelpreis: Zahlen'],
        ['   - Status: "pending", "paid" oder "cancelled"'],
        ['5. Summen (Subtotal, MwSt, Total) werden berechnet'],
        [''],
        ['TIPP: Exportieren Sie zuerst bestehende Facturas um das Format zu sehen']
      ],
      filename: 'Factura_Export_Vorlage.xlsx',
      title: 'Facturas'
    }
  };

  const currentConfig = config[type] || config.products;

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(currentConfig.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentConfig.title);
    
    const ws2 = XLSX.utils.aoa_to_sheet(currentConfig.instructions);
    XLSX.utils.book_append_sheet(wb, ws2, 'Anleitung');
    
    XLSX.writeFile(wb, currentConfig.filename);
  };

  return (
    <button 
      onClick={downloadTemplate} 
      className={styles.templateButton}
      aria-label={`${type === 'sales' ? 'Factura' : 'Produkt'} Vorlage herunterladen`}
    >
      <span className={styles.templateIcon}>
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <span className={styles.templateText}>
        {type === 'sales' ? 'Factura Vorlage' : 'Produkt Vorlage'} herunterladen
      </span>
      <span className={styles.templateBadge}>XLSX</span>
    </button>
  );
}