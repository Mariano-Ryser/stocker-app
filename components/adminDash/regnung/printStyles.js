/* frontend/components/adminDash/regnung/printStyles.js */
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
  max-width: 120px;
  max-height: 80px;
  margin-bottom: 10px;
  object-fit: contain;
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

/* Invoice Modern Styles */ /* Invoice Modern Styles */ /* Invoice Modern Styles */ /* Invoice Modern Styles */ /* Invoice Modern Styles */
/* Invoice Modern Styles */ /* Invoice Modern Styles */ /* Invoice Modern Styles */ /* Invoice Modern Styles */ /* Invoice Modern Styles */
/* Invoice Modern Styles */ /* Invoice Modern Styles */ /* Invoice Modern Styles */ /* Invoice Modern Styles */ /* Invoice Modern Styles */
/* Invoice Modern Minimal Styles */
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
max-width: 120px;
  max-height: 120px;
  object-fit: contain;
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

.invoice-modern .text-right {
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

/* Ticket Thermal Styles *//* Ticket Thermal Styles *//* Ticket Thermal Styles *//* Ticket Thermal Styles *//* Ticket Thermal Styles */
/* Ticket Thermal Styles *//* Ticket Thermal Styles *//* Ticket Thermal Styles *//* Ticket Thermal Styles *//* Ticket Thermal Styles */
/* Ticket Thermal Styles *//* Ticket Thermal Styles *//* Ticket Thermal Styles *//* Ticket Thermal Styles *//* Ticket Thermal Styles */
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
  .invoice-modern .badge {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}`;