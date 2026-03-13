import { useState, useRef, useEffect } from 'react';
import styles from './TicketPrinter.module.css';

const TicketPrinter = ({ sale, company, onPrintComplete }) => {
  const [showTicket, setShowTicket] = useState(false);
  const [printStatus, setPrintStatus] = useState('idle'); // 'idle', 'printing', 'success', 'error'
  const ticketRef = useRef(null);
  const previewTicketRef = useRef(null);

  // Asegurar que el ref está disponible
  useEffect(() => {
    // console.log('TicketRef montado:', ticketRef.current);
  }, []);

  // Formatear fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Formatear dirección
  const formatAddress = (address) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.number) parts.push(address.number);
      if (address.complement) parts.push(address.complement);
      if (address.postalCode) parts.push(address.postalCode);
      if (address.city) parts.push(address.city);
      return parts.join(' ');
    }
    return '';
  };

  // Obtener nombre del producto
  const getProductName = (item) => {
    if (item.artikelName) return item.artikelName;
    if (item.productSnapshot?.artikelName) return item.productSnapshot.artikelName;
    if (item.productSnapshot?.name) return item.productSnapshot.name;
    return 'Artikel';
  };

  // Función para generar el HTML del ticket
  const generateTicketHTML = () => {
    const currencySymbol = company?.currency || 'CHF';
    const companyName = company?.name || company?.businessName || 'KIOSK';
    const companyAddress = formatAddress(company?.address);
    const companyPhone = company?.phone || company?.telephone || '';
    const companyEmail = company?.email || '';
    const companyVat = company?.vatNumber || company?.taxNumber || '';

    // Calcular totales
    const subtotal = sale?.subtotal || sale?.items?.reduce((sum, item) => 
      sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0) || 0;
    const taxAmount = sale?.taxAmount || subtotal * 0.10;
    const total = sale?.total || subtotal + taxAmount;

    return `
      <div class="ticket">
        <!-- Cabecera con logo -->
        <div class="header">
          <div class="logo">🛒</div>
          <div class="company-name">${companyName}</div>
          ${companyAddress ? `<div class="company-info">${companyAddress}</div>` : ''}
          ${companyPhone ? `<div class="company-info">Tel: ${companyPhone}</div>` : ''}
          ${companyEmail ? `<div class="company-info">${companyEmail}</div>` : ''}
          ${companyVat ? `<div class="company-info">UID: ${companyVat}</div>` : ''}
          
          <div class="receipt-info">
            <div class="receipt-row">
              <span>Rechnungsnummer:</span>
              <span class="receipt-number">${sale?.lieferschein || '000000'}</span>
            </div>
            <div class="receipt-row">
              <span>Datum:</span>
              <span>${formatDate(sale?.createdAt || new Date())}</span>
            </div>
            <div class="receipt-row">
              <span>Kassierer:</span>
              <span>${sale?.cashierName || 'System'}</span>
            </div>
          </div>
        </div>

        <!-- Lista de artículos -->
        <div class="items-table">
          <div class="items-header">
            <span class="col-product">Artikel</span>
            <span class="col-qty">Menge</span>
            <span class="col-price">Preis</span>
            <span class="col-total">Total</span>
          </div>
          
          ${sale?.items && sale.items.length > 0 ? 
            sale.items.map((item, index) => `
              <div key="${index}" class="item-row">
                <span class="col-product">${getProductName(item)}</span>
                <span class="col-qty">${item.quantity || 0}</span>
                <span class="col-price">${(item.unitPrice || 0).toFixed(2)}</span>
                <span class="col-total">
                  ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                </span>
              </div>
            `).join('') 
            : `
              <div class="item-row">
                <span class="col-product">Keine Artikel</span>
              </div>
            `
          }
        </div>

        <!-- Totales -->
        <div class="totals">
          <div class="total-row">
            <span>Zwischensumme:</span>
            <span>${subtotal.toFixed(2)} ${currencySymbol}</span>
          </div>
          <div class="total-row">
            <span>MwSt. 10%:</span>
            <span>${taxAmount.toFixed(2)} ${currencySymbol}</span>
          </div>
          <div class="total-row grand-total">
            <span>GESAMTBETRAG:</span>
            <span>${total.toFixed(2)} ${currencySymbol}</span>
          </div>
        </div>

        <!-- Información de pago -->
        <div class="payment-info">
          <div class="payment-title">ZAHLUNGSINFORMATIONEN</div>
          <div class="payment-detail">
            <span>Zahlungsmethode:</span>
            <span class="payment-method-badge">
              ${sale?.paymentMethod === 'cash' ? 'BARZAHLUNG' : 
                sale?.paymentMethod === 'card' ? 'KARTENZAHLUNG' : '---'}
            </span>
          </div>
          
          ${sale?.paymentMethod === 'cash' ? `
            <div class="payment-detail">
              <span>Erhaltener Betrag:</span>
              <span>${(sale?.amountReceived || 0).toFixed(2)} ${currencySymbol}</span>
            </div>
            <div class="payment-detail">
              <span>Rückgeld:</span>
              <span>${(sale?.change || 0).toFixed(2)} ${currencySymbol}</span>
            </div>
          ` : ''}
          
          ${sale?.paymentMethod === 'card' ? `
            <div class="payment-detail">
              <span>Kartenterminal:</span>
              <span>Genehmigt</span>
            </div>
          ` : ''}
          
          <div class="payment-detail">
            <span>Status:</span>
            <span style="color: #4CAF50; font-weight: bold;">BEZAHLT</span>
          </div>
        </div>

        <!-- Cliente -->
        ${sale?.clientSnapshot ? `
          <div class="client-info">
            <div class="payment-title">KUNDENINFORMATIONEN</div>
            <div class="payment-detail">
              <span>Name:</span>
              <span>
                ${sale.clientSnapshot.vorname || ''} ${sale.clientSnapshot.name || ''}
                ${sale.meta?.hasRandomClient ? ' (Gast)' : ''}
              </span>
            </div>
            ${sale.clientSnapshot.email ? `
              <div class="payment-detail">
                <span>Email:</span>
                <span>${sale.clientSnapshot.email}</span>
              </div>
            ` : ''}
            ${sale.clientSnapshot.telefon ? `
              <div class="payment-detail">
                <span>Telefon:</span>
                <span>${sale.clientSnapshot.telefon}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <div class="thank-you">VIELEN DANK FÜR IHREN EINKAUF!</div>
          
         <div class="barcode">
           |||||||||||||||||
         </div>
          
          <div class="legal-info">
            <div>${new Date().toLocaleDateString('de-CH')} ${new Date().toLocaleTimeString('de-CH')}</div>
            <div>Rechnungsnummer: ${sale?.lieferschein || '000000'}</div>
            <div>UID: ${companyVat || 'CHE-123.456.789'}</div>
            <div>Alle Preise inkl. MwSt.</div>
          </div>
          
          <div class="signature-line">
            Empfangsbestätigung
          </div>
        </div>
      </div>
    `;
  };

  // Función para imprimir
  const handlePrint = () => {
    setPrintStatus('printing');
    
    try {
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('Bitte Pop-ups erlauben für Drucken');
        setPrintStatus('error');
        return;
      }

      // Generar el HTML del ticket directamente
      const ticketHTML = generateTicketHTML();
      
      // Crear el documento HTML para impresión
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ticket - ${sale?.lieferschein || ''}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              font-family: 'Segoe UI', 'Courier New', monospace;
              font-size: 11px;
              line-height: 1.3;
              width: 72mm;
              margin: 0 auto;
              padding: 2mm;
              background: white;
              color: #000;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            .ticket {
              width: 100%;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 2px solid #000;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
              margin-bottom: 5px;
            }
            .company-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .company-info {
              font-size: 9px;
              color: #333;
              margin: 2px 0;
            }
            .receipt-info {
              margin: 10px 0;
              padding: 5px;
              background: #f5f5f5;
              border-radius: 3px;
            }
            .receipt-row {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              margin: 2px 0;
            }
            .receipt-number {
              font-size: 14px;
              font-weight: bold;
              color: #000;
            }
            .items-table {
              width: 100%;
              margin: 10px 0;
            }
            .items-header {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              font-size: 10px;
              padding: 5px 0;
              border-bottom: 1px solid #000;
              background: #f0f0f0;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              padding: 4px 0;
              border-bottom: 1px dotted #ccc;
            }
            .col-product {
              width: 45%;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            .col-qty {
              width: 15%;
              text-align: center;
            }
            .col-price {
              width: 20%;
              text-align: right;
            }
            .col-total {
              width: 20%;
              text-align: right;
            }
            .totals {
              margin: 15px 0;
              padding: 10px 0;
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              margin: 3px 0;
            }
            .grand-total {
              font-size: 14px;
              font-weight: bold;
              margin-top: 8px;
              padding-top: 8px;
              border-top: 2px solid #000;
            }
            .payment-info {
              margin: 10px 0;
              padding: 10px;
              background: #f9f9f9;
              border-radius: 5px;
            }
            .payment-title {
              font-weight: bold;
              font-size: 11px;
              margin-bottom: 5px;
              color: #333;
            }
            .payment-detail {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              margin: 3px 0;
            }
            .payment-method-badge {
              display: inline-block;
              padding: 3px 8px;
              background: #e0e0e0;
              border-radius: 3px;
              font-weight: bold;
              font-size: 10px;
            }
            .client-info {
              margin: 10px 0;
              padding: 8px;
              background: #f0f0f0;
              border-radius: 3px;
              font-size: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 2px solid #000;
            }
            .thank-you {
              font-size: 14px;
              font-weight: bold;
              margin: 10px 0;
              color: #000;
            }
            .legal-info {
              font-size: 7px;
              color: #666;
              margin: 5px 0;
            }
            .barcode {
              margin: 10px 0;
              font-family: 'Libre Barcode 39', 'Courier New', monospace;
              font-size: 24px;
            }
            .signature-line {
              margin-top: 20px;
              border-top: 1px solid #000;
              width: 50%;
              margin-left: auto;
              margin-right: auto;
              font-size: 8px;
              text-align: center;
              padding-top: 3px;
            }
          </style>
        </head>
        <body>
          ${ticketHTML}
          <script>
            window.onload = function() { 
              setTimeout(function() { 
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 200);
            };
          <\/script>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      
      setPrintStatus('success');
      
      // Llamar al callback si existe
      if (onPrintComplete) {
        onPrintComplete();
      }

      // Resetear estado después de 2 segundos
      setTimeout(() => setPrintStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Error al imprimir:', error);
      setPrintStatus('error');
      setTimeout(() => setPrintStatus('idle'), 3000);
    }
  };

  // Función para previsualizar el ticket
  const handlePreview = () => {
    setShowTicket(!showTicket);
  };

  // Valores por defecto
  const currencySymbol = company?.currency || 'CHF';
  const companyName = company?.name || company?.businessName || 'KIOSK';
  const companyAddress = formatAddress(company?.address);
  const companyPhone = company?.phone || company?.telephone || '';
  const companyEmail = company?.email || '';
  const companyVat = company?.vatNumber || company?.taxNumber || '';

  return (
    <div className={styles.container}>
      {/* Barra de herramientas */}
      <div className={styles.toolbar}>
        <button 
          onClick={handlePreview}
          className={`${styles.toolbarButton} ${styles.previewButton}`}
          title="Vorschau anzeigen"
        >
          <span className={styles.buttonIcon}>👁️</span>
          {showTicket ? 'Vorschau ausblenden' : 'Ticket Vorschau'}
        </button>
        
        <button 
          onClick={handlePrint}
          className={`${styles.toolbarButton} ${styles.printButton}`}
          disabled={printStatus !== 'idle'}
          title="Ticket drucken"
        >
          <span className={styles.buttonIcon}>
            {printStatus === 'printing' ? '⏳' : 
             printStatus === 'success' ? '✅' : 
             printStatus === 'error' ? '❌' : '🖨️'}
          </span>
          {printStatus === 'printing' ? 'Drucken...' : 
           printStatus === 'success' ? 'Gedruckt!' : 
           printStatus === 'error' ? 'Fehler!' : 'Ticket drucken'}
        </button>
      </div>

      {/* Vista previa del ticket */}
      {showTicket && (
        <div className={styles.previewContainer}>
          <div className={styles.previewHeader}>
            <h3>Ticket Vorschau</h3>
            <span className={styles.previewSize}>80mm x auto</span>
          </div>
          <div className={styles.previewContent}>
            <div className={styles.ticketPreview}>
              {/* Usamos un div normal sin ref para la vista previa */}
              <div dangerouslySetInnerHTML={{ __html: generateTicketHTML() }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketPrinter;