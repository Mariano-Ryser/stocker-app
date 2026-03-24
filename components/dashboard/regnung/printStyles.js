// frontend/components/dashboard/regnung/printStyles.js
export const printStyles = `
/* Estilos base para impresión */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: white;
  color: black;
  line-height: 1.4;
}

/* Invoice Classic Styles */
.invoice-classic {
  font-family: 'Times New Roman', Times, serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background: white;
  color: #000;
  font-size: 12px;
}

.invoice-classic .header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #000;
}

.invoice-classic .company-section h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 8px 0;
  text-transform: uppercase;
}

.invoice-classic .company-section p {
  margin: 3px 0;
  color: #333;
  font-size: 11px;
}

.invoice-classic .logo {
 max-width: 200px; 
  max-height: 100px;
  width: auto;
  height: auto;
  object-fit: contain;
  margin-bottom: 15px;
}


.invoice-classic .invoice-info {
  text-align: right;
}

.invoice-classic .invoice-info h2 {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.invoice-classic .divider {
  height: 1px;
  background: repeating-linear-gradient(to right, #000, #000 5px, transparent 5px, transparent 10px);
  margin: 20px 0;
}

.invoice-classic .client-box {
  margin-bottom: 25px;
  padding: 15px;
  background: #f9f9f9;
  border-left: 4px solid #000;
}

.invoice-classic .client-box h3 {
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 10px 0;
  text-transform: uppercase;
}

.invoice-classic .table {
  width: 100%;
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 11px;
}

.invoice-classic .table th {
  background: #f0f0f0;
  border: 1px solid #000;
  padding: 10px 8px;
  text-align: left;
  font-weight: bold;
  text-transform: uppercase;
}

.invoice-classic .table td {
  border: 1px solid #000;
  padding: 8px;
}

.invoice-classic .text-center {
  text-align: center;
}

.invoice-classic .text-right {
  text-align: right;
}

.invoice-classic .totals {
  margin-top: 25px;
  padding-top: 15px;
  border-top: 2px solid #000;
  width: 300px;
  margin-left: auto;
}

.invoice-classic .total-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed #ccc;
}

.invoice-classic .total-row.final {
  font-weight: bold;
  font-size: 14px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 2px solid #000;
  border-bottom: none;
}

.invoice-classic .footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ccc;
  text-align: center;
  font-size: 10px;
  color: #666;
}

// frontend/components/dashboard/regnung/printStyles.js
// Agrega esta sección después de los otros estilos de facturas

/* Invoice Classic2 Styles */
.invoice-classic2 {
  font-family: 'Times New Roman', Times, serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background: white;
  color: #000;
  font-size: 12px;
  line-height: 1.4;
}

.invoice-classic2 .header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.invoice-classic2 .company-section {
  flex: 1;
}

.invoice-classic2 .logo {
   max-width: 220px;  /* Aún más grande */
  max-height: 150px;
  width: auto;
  height: auto;
  object-fit: contain;
  margin-bottom: 15px;
}

.invoice-classic2 .company-details {
  font-size: 11px;
  color: #333;
  line-height: 1.4;
}

.invoice-classic2 .company-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
  color: #000;
}

.invoice-classic2 .invoice-info {
  text-align: right;
}

.invoice-classic2 .invoice-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
  text-transform: uppercase;
  color: #000;
}

.invoice-classic2 .invoice-number {
  font-size: 14px;
  color: #666;
}

.invoice-classic2 .divider {
  height: 2px;
  background: linear-gradient(to right, #000 0%, #000 50%, transparent 100%);
  margin: 20px 0;
}

.invoice-classic2 .client-box {
  margin-bottom: 25px;
  padding: 15px;
  background: #f9f9f9;
  border-left: 4px solid #000;
}

.invoice-classic2 .client-title {
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 10px;
}

.invoice-classic2 .client-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
}

.invoice-classic2 .client-address {
  margin: 5px 0;
}

.invoice-classic2 .client-contact {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
  font-size: 11px;
  color: #666;
}

.invoice-classic2 .meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 25px 0;
  padding: 15px;
  background: #fff;
  border: 1px solid #ddd;
}

.invoice-classic2 .meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.invoice-classic2 .meta-label {
  font-weight: bold;
  color: #666;
  font-size: 11px;
  text-transform: uppercase;
}

.invoice-classic2 .meta-value {
  color: #000;
  font-size: 12px;
}

.invoice-classic2 .table {
  width: 100%;
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 11px;
}

.invoice-classic2 .table th {
  background: #f0f0f0;
  border: 1px solid #000;
  padding: 10px 8px;
  text-align: left;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 10px;
}

.invoice-classic2 .table td {
  border: 1px solid #000;
  padding: 8px;
}

.invoice-classic2 .table tbody tr:last-child td {
  border-bottom: 1px solid #000;
}

.invoice-classic2 .text-center {
  text-align: center;
}

.invoice-classic2 .text-right {
  text-align: right;
}

.invoice-classic2 .totals {
  margin-top: 25px;
  width: 320px;
  margin-left: auto;
  border: 1px solid #000;
  padding: 15px;
  background: #fafafa;
}

.invoice-classic2 .total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dotted #ccc;
  font-size: 11px;
}

.invoice-classic2 .total-row:last-child {
  border-bottom: none;
}

.invoice-classic2 .total-row.final {
  font-weight: bold;
  font-size: 14px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid #000;
  border-bottom: none;
}

.invoice-classic2 .footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #ccc;
  text-align: center;
  font-size: 10px;
  color: #666;
  position: relative;
}

.invoice-classic2 .legal-info {
  margin-top: 10px;
  font-size: 8px;
  color: #999;
}

.invoice-classic2 .page {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 8px;
  color: #999;
}

/* ------------------------------- */
/* ------------------------------- */
/* ------------------------------- */


/* Invoice Modern Styles */
/* Invoice Modern Styles */
.invoice-modern {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 35px;
  background: white;
  color: #1e293b;
  font-size: 13px;
}

.invoice-modern .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.invoice-modern .logo {
  max-width: 220px;  /* Aún más grande */
  max-height: 150px;
  width: auto;
  height: auto;
  object-fit: contain;
  margin-bottom: 15px;
}

.invoice-modern .logo-placeholder {
  width: 50px;
  height: 50px;
  background: #f1f5f9;
  color: #3b82f6;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.invoice-modern .title-section {
  text-align: right;
}

.invoice-modern .invoice-title {
  font-size: 28px;
  font-weight: 500;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.invoice-modern .invoice-number {
  font-size: 13px;
  color: #64748b;
  font-weight: 400;
}

.invoice-modern .top-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  margin-bottom: 25px;
}

.invoice-modern .info-block {
  padding: 0;
}

.invoice-modern .info-label {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.invoice-modern .company-name,
.invoice-modern .client-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
}

.invoice-modern .info-value {
  font-size: 12px;
  color: #475569;
  margin: 3px 0;
  line-height: 1.4;
}

.invoice-modern .info-value strong {
  font-weight: 600;
  color: #0f172a;
}

.invoice-modern .status {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
}

.invoice-modern .status.paid {
  background: #e6f7e6;
  color: #2e7d32;
}

.invoice-modern .status.pending {
  background: #fff3e0;
  color: #b85c00;
}

.invoice-modern .status.cancelled {
  background: #fee9e9;
  color: #b71c1c;
}

.invoice-modern .divider {
  height: 1px;
  background: #e2e8f0;
  margin: 25px 0;
}

.invoice-modern .table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0 25px;
  font-size: 12px;
}

.invoice-modern .table th {
  text-align: left;
  padding: 10px 8px;
  font-weight: 500;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.invoice-modern .table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f1f5f9;
}

.invoice-modern .item-name {
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 2px;
}

.invoice-modern .item-desc {
  font-size: 10px;
  color: #94a3b8;
}

.invoice-modern .text-center {
  text-align: center;
}

.invoice-modern tr .text-right {
  text-align: right;
}

.invoice-modern .totals-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.invoice-modern .payment-info {
  padding-right: 20px;
}

.invoice-modern .payment-row {
  display: flex;
  justify-content: space-between;
  margin: 6px 0;
  font-size: 12px;
  color: #475569;
}

.invoice-modern .payment-row span:last-child {
  font-family: monospace;
  font-weight: 500;
  color: #0f172a;
}

.invoice-modern .total-row {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font-size: 12px;
  color: #475569;
}

.invoice-modern .total-row.grand-total {
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #e2e8f0;
}

/* Ticket Thermal Styles */
.ticket-thermal {
  font-family: 'Courier New', Courier, monospace;
  max-width: 300px;
  margin: 0 auto;
  padding: 15px;
  background: white;
  color: #000;
  font-size: 11px;
}

.ticket-thermal .ticket-header {
  text-align: center;
  margin-bottom: 15px;
}

.ticket-thermal .ticket-header h2 {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px 0;
  text-transform: uppercase;
}

.ticket-thermal .ticket-divider {
  font-family: monospace;
  font-size: 12px;
  margin: 8px 0;
  border-top: 1px dashed #000;
}

.ticket-thermal .ticket-row {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
  font-size: 10px;
}

.ticket-thermal .ticket-item {
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dotted #ccc;
}

.ticket-thermal .item-name-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.ticket-thermal .item-name {
  font-weight: bold;
}

.ticket-thermal .item-quantity {
  font-size: 9px;
  color: #666;
  display: flex;
  justify-content: space-between;
}

.ticket-thermal .total-line.grand-total {
  font-weight: bold;
  font-size: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 2px solid #000;
}

.ticket-thermal .ticket-footer {
  text-align: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #000;
}

.ticket-thermal .barcode {
  font-family: 'Courier New', monospace;
  font-size: 24px;
  letter-spacing: 2px;
  margin-top: 8px;
}

/* Invoice Letter Styles - CORREGIDO para que coincida EXACTAMENTE con letter.module.css */
.invoice-letter {
  font-family: 'Times New Roman', Times, serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 25px 30px;
  background: white;
  color: #000;
  font-size: 11pt;
  line-height: 1.4;
  position: relative;
}

.invoice-letter .header {
  position: relative;
  min-height: 140px;
  margin-bottom: 30px;
}

.invoice-letter .sender-info {
  position: absolute;
  top: 0;
  right: 0;
  text-align: right;
  max-width: 350px;
}

.invoice-letter .logo-container {
  margin-bottom: 10px;
  text-align: right;
}

.invoice-letter .logo {
  max-width: 180px;
  max-height: 90px;
  object-fit: contain;
}

.invoice-letter .company-details {
  font-size: 10pt;
  color: #333;
  line-height: 1.4;
}

.invoice-letter .company-details .company-name {
  font-weight: bold;
  font-size: 12pt;
  margin-bottom: 5px;
  color: #000;
}

.invoice-letter .recipient-window {
  position: absolute;
  top: 50px;
  left: 0;
  width: 260px;
  min-height: 100px;
}

.invoice-letter .recipient-address {
  font-size: 11pt;
  line-height: 1.4;
  padding: 5px 0;
}

.invoice-letter .recipient-address div {
  margin: 3px 0;
}

.invoice-letter .recipient-company {
  font-weight: bold;
  font-size: 12pt;
  margin-bottom: 5px;
}

/* Metadatos de la factura - EXACTAMENTE IGUAL que en letter.module.css */
.invoice-letter .invoice-meta {
  margin: 25px 0 15px 0;
  padding: 12px 0;
  font-size: 11pt;
  border-bottom: 1px solid #000;
}

.invoice-letter .metaRow {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin: 4px 0;
  max-width: 320px;
  margin-left: auto;
}

.invoice-letter .metaLabel {
  font-weight: bold;
  color: #333;
}

.invoice-letter .metaValue {
  color: #000;
}

/* Asunto */
.invoice-letter .subject {
  margin: 20px 0 25px 0;
  font-size: 12pt;
  padding: 5px 0;
  border-bottom: 1px solid #ccc;
}

/* Tabla */
.invoice-letter .table {
  width: 100%;
  border-collapse: collapse;
  margin: 25px 0;
  font-size: 11pt;
}

.invoice-letter .table th {
  background: #f5f5f5;
  border-bottom: 2px solid #000;
  border-top: 1px solid #000;
  padding: 10px 6px;
  text-align: left;
  font-weight: bold;
  font-size: 10pt;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.invoice-letter .table td {
  padding: 8px 6px;
  border-bottom: 1px solid #ddd;
}

.invoice-letter .table tbody tr:last-child td {
  border-bottom: 1px solid #000;
}

.invoice-letter .text-center {
  text-align: center;
}

.invoice-letter .text-right {
  text-align: right;
}

/* Sección de totales */
.invoice-letter .totals-section {
  margin-top: 25px;
  display: flex;
  justify-content: flex-end;
}

.invoice-letter .totals {
  width: 320px;
  border: 1px solid #000;
  padding: 18px;
  background: #fafafa;
}

.invoice-letter .total-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 11pt;
  border-bottom: 1px dotted #ccc;
}

.invoice-letter .total-row:last-child {
  border-bottom: none;
}

.invoice-letter .total-row.final {
  font-weight: bold;
  font-size: 12pt;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid #000;
  border-bottom: none;
}

/* Footer */
.invoice-letter .footer {
  margin-top: 45px;
  padding-top: 25px;
  border-top: 1px solid #333;
  font-size: 9pt;
  color: #666;
  text-align: center;
  position: relative;
}

.invoice-letter .payment-info {
  margin-bottom: 10px;
}

.invoice-letter .thanks {
  font-size: 10pt;
  color: #333;
  margin: 12px 0;
  font-style: italic;
}

.invoice-letter .legal-info {
  margin-top: 10px;
  font-size: 8pt;
  color: #999;
}

.invoice-letter .page {
  position: absolute;
  bottom: 0;
  right: 0;
  font-size: 8pt;
  color: #999;
}

/* Utilidades comunes */
.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.no-print {
  display: none;
}

@media print {
  body {
    padding: 10px;
  }
  
  .invoice-classic .table th,
  .invoice-classic .client-box,
  .invoice-modern .badge,
  .invoice-letter .table th,
  .invoice-letter .totals {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .invoice-letter .recipient-window {
    top: 45px;
    left: 0;
  }
}
`;