// frontend/components/adminDash/regnung/templates/InvoiceTemplate.jsx
import React from 'react';

// Componente base que define la interfaz común para todas las plantillas
const InvoiceTemplate = ({ 
  sale, 
  company, 
  formatAddress, 
  formatDate, 
  formatCurrency,
  calculateLineTotals,
  companyInfo,
  taxRate,
  children 
}) => {
  const safeSale = sale || {};
  const items = safeSale.items || [];
  const subtotal = safeSale.subtotal || 0;
  const total = safeSale.total || 0;
  const tax = safeSale.tax || 0;
  const discount = safeSale.discount || 0;

  return (
    <div className="invoice-content">
      {/* Header con logo y datos de empresa */}
      <div className="invoice-header">
        <div className="company-info">
          {company.logo && (
            <img 
              src={company.logo} 
              alt={company.name} 
              className="company-logo"
            />
          )}
          <h1 className="company-name">{company.name}</h1>
          <div className="company-address">
            {formatAddress(company.address)}
          </div>
          <div className="company-contact">
            Tel: {company.phone} | Email: {company.email}
          </div>
        </div>
        
        <div className="invoice-meta">
          <h2 className="invoice-title">RECHNUNG</h2>
          <div className="invoice-number">Nr. {safeSale.lieferschein || '–'}</div>
          <div className="invoice-date">
            Datum: {formatDate(safeSale.createdAt)}
          </div>
          <div className="invoice-due">
            Fällig: {formatDate(safeSale.dueDate || safeSale.createdAt)}
          </div>
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="client-info">
        <h3>Rechnungsempfänger</h3>
        <div className="client-details">
          <div>{safeSale.clientSnapshot?.name}</div>
          <div>{safeSale.clientSnapshot?.email}</div>
          <div>{safeSale.clientSnapshot?.address}</div>
        </div>
      </div>

      {/* Tabla de items */}
      <table className="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Beschreibung</th>
            <th>Menge</th>
            <th>Einzelpreis</th>
            <th>Gesamt</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const { lineTotal } = calculateLineTotals(item);
            return (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  <div className="item-name">{item.artikelName}</div>
                  {item.description && (
                    <div className="item-description">{item.description}</div>
                  )}
                </td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">
                  {formatCurrency(item.unitPrice)} {company.currency}
                </td>
                <td className="text-right">
                  {formatCurrency(lineTotal)} {company.currency}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totales */}
      <div className="totals">
        <div className="total-row">
          <span>Zwischensumme:</span>
          <span>{formatCurrency(subtotal)} {company.currency}</span>
        </div>
        {discount > 0 && (
          <div className="total-row discount">
            <span>Rabatt:</span>
            <span>-{formatCurrency(discount)} {company.currency}</span>
          </div>
        )}
        <div className="total-row">
          <span>MWSt ({(taxRate * 100).toFixed(1)}%):</span>
          <span>{formatCurrency(tax)} {company.currency}</span>
        </div>
        <div className="total-row final">
          <span>Gesamtbetrag:</span>
          <span>{formatCurrency(total)} {company.currency}</span>
        </div>
      </div>

      {/* Información de pago */}
      <div className="payment-info">
        <h3>Zahlungsinformation</h3>
        <div className="payment-details">
          <div>Bank: {companyInfo.bank}</div>
          <div>IBAN: {companyInfo.iban}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="invoice-footer">
        <p>Vielen Dank für Ihren Auftrag!</p>
        <p>Diese Rechnung ist ohne Unterschrift gültig.</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;