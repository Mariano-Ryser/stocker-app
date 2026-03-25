// components/ui/ExcelTemplate.jsx
import * as XLSX from 'xlsx';
import styles from './ExcelTemplate.module.css';
import { useAuth } from '../auth/AuthProvider';

export default function ExcelTemplateButton({ type = 'products' }) {
  const { company } = useAuth();
  const currencySymbol = company?.currency || 'USD';

  const config = {
    products: {
  data: [
    {
      'Artikelnummer': 'ART-001',
      'Artikelname': 'Beispielprodukt 1',
      'Lagerplatz': 'A-01',
      'Beschreibung': 'Produktbeschreibung',
      'Bestand': 100,
      'Preis': 19.99,
    },
    {
      'Artikelnummer': 'ART-002',
      'Artikelname': 'Beispielprodukt 2',
      'Lagerplatz': 'B-02',
      'Beschreibung': 'Weitere Beschreibung',
      'Bestand': 50,
      'Preis': 29.99,
    }
  ],
  instructions: [
    ['ANLEITUNG FÜR DEN PRODUKTIMPORT'],
    [''],
    ['1. Füllen Sie diese Vorlage mit Ihren Produktdaten aus'],
    ['2. Pflichtfeld: Artikelname'],
    ['3. Optionale Felder: Alle anderen'],
    ['4. Zahlen für Bestand und Preis können direkt eingegeben werden'],
    ['5. Speichern Sie die Datei als .xlsx oder .xls'],
    ['6. Verwenden Sie die Importfunktion in der App'],
    [''],
    ['WICHTIG:'],
    ['- Löschen Sie nicht die Kopfzeile'],
    ['- Verwenden Sie das gleiche Spaltenformat'],
    ['- Maximale Dateigröße: 10MB'],
    ['- Maximale Anzahl Zeilen: 10.000']
  ],
  filename: 'Produkt_Import_Vorlage.xlsx',
  title: 'Produkte'
},
   sales: {
  data: [
    {
      'Lieferscheinnummer': 'LS-2023-001',
      'Kunde': 'Beispiel GmbH',
      'Kundennummer': 'K-001',
      'Datum': '01.01.2023',
      'Artikelname': 'Produkt A',
      'Menge': 5,
      'Einzelpreis': 19.99,
      'Positionsbetrag': 99.95,
      'Zwischensumme': 99.95,
      'Steuer': 7.20,
      'Gesamtbetrag': 107.15,
      'Status': 'bezahlt'
    },
    {
      'Lieferscheinnummer': 'LS-2023-001',
      'Kunde': 'Beispiel GmbH',
      'Kundennummer': 'K-001',
      'Datum': '01.01.2023',
      'Artikelname': 'Produkt B',
      'Menge': 3,
      'Einzelpreis': 29.50,
      'Positionsbetrag': 88.50,
      'Zwischensumme': 188.45,
      'Steuer': 13.57,
      'Gesamtbetrag': 202.02,
      'Status': 'bezahlt'
    }
  ],
  instructions: [
    ['ANLEITUNG FÜR DEN RECHNUNGSEXPORT'],
    [''],
    ['1. Dies ist eine Exportvorlage für Rechnungen'],
    ['2. Wichtig: Gleiche Lieferscheinnummer = gleiche Rechnung'],
    ['3. Eine Rechnung kann mehrere Positionen enthalten'],
    ['4. Felder:'],
    ['   - Lieferscheinnummer: Eindeutige Nummer pro Rechnung'],
    ['   - Kunde: Name des Kunden'],
    ['   - Artikelname: Produktname (pro Zeile)'],
    ['   - Menge, Einzelpreis: Zahlenwerte'],
    ['   - Status: "offen", "bezahlt" oder "storniert"'],
    ['5. Summen (Zwischensumme, Steuer, Gesamtbetrag) werden berechnet'],
    [''],
    ['TIPP: Exportieren Sie zuerst bestehende Rechnungen, um das Format zu sehen']
  ],
  filename: 'Rechnung_Export_Vorlage.xlsx',
  title: 'Rechnungen'
}
  };

  const currentConfig = config[type] || config.products;

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(currentConfig.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, currentConfig.title);
    
    const ws2 = XLSX.utils.aoa_to_sheet(currentConfig.instructions);
    XLSX.utils.book_append_sheet(wb, ws2, 'Instructions');
    
    XLSX.writeFile(wb, currentConfig.filename);
  };

  return (
    <button 
      onClick={downloadTemplate} 
      className={styles.templateButton}
      aria-label={`Download ${type === 'sales' ? 'invoice' : 'product'} template`}
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
        Download {type === 'sales' ? 'Invoice' : 'Product'} Template
      </span>
      <span className={styles.templateBadge}>XLSX</span>
    </button>
  );
}