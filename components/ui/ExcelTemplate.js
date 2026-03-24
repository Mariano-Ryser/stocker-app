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
          'Article Number': 'ART-001',
          'Article Name': 'Example Product 1',
          'Storage Location': 'A-01',
          'Description': 'Product description',
          'Stock': 100,
          'Price': 19.99,
        },
        {
          'Article Number': 'ART-002',
          'Article Name': 'Example Product 2',
          'Storage Location': 'B-02',
          'Description': 'Another description',
          'Stock': 50,
          'Price': 29.99,
        }
      ],
      instructions: [
        ['INSTRUCTIONS FOR PRODUCT IMPORT'],
        [''],
        ['1. Fill this template with your product data'],
        ['2. Required fields: Article Name'],
        ['3. Optional fields: All others'],
        ['4. Numbers for Stock and Price can be entered directly'],
        ['5. Save the file as .xlsx or .xls'],
        ['6. Use the import function in the app'],
        [''],
        ['IMPORTANT:'],
        ['- Do not delete the header row'],
        ['- Use the same column format'],
        ['- Maximum file size: 10MB'],
        ['- Maximum rows: 10,000']
      ],
      filename: 'Product_Import_Template.xlsx',
      title: 'Products'
    },
    sales: {
      data: [
        {
          'Delivery Note No.': 'DN-2023-001',
          'Customer': 'Example GmbH',
          'Customer No.': 'C-001',
          'Date': '01.01.2023',
          'Article Name': 'Product A',
          'Quantity': 5,
          'Unit Price': 19.99,
          'Line Total': 99.95,
          'Subtotal': 99.95,
          'Tax': 7.20,
          'Total': 107.15,
          'Status': 'paid'
        },
        {
          'Delivery Note No.': 'DN-2023-001',
          'Customer': 'Example GmbH',
          'Customer No.': 'C-001',
          'Date': '01.01.2023',
          'Article Name': 'Product B',
          'Quantity': 3,
          'Unit Price': 29.50,
          'Line Total': 88.50,
          'Subtotal': 188.45,
          'Tax': 13.57,
          'Total': 202.02,
          'Status': 'paid'
        }
      ],
      instructions: [
        ['INSTRUCTIONS FOR INVOICE EXPORT'],
        [''],
        ['1. This is an export template for invoices'],
        ['2. Important: Same delivery note = same invoice'],
        ['3. One invoice can contain multiple items'],
        ['4. Fields:'],
        ['   - Delivery Note No.: Unique number per invoice'],
        ['   - Customer: Customer name'],
        ['   - Article Name: Product name (per row)'],
        ['   - Quantity, Unit Price: Numbers'],
        ['   - Status: "pending", "paid" or "cancelled"'],
        ['5. Totals (Subtotal, Tax, Total) are calculated'],
        [''],
        ['TIP: Export existing invoices first to see the format']
      ],
      filename: 'Invoice_Export_Template.xlsx',
      title: 'Invoices'
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