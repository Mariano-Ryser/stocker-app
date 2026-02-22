// frontend/components/adminDash/regnung/templates/InvoiceClassic.jsx
import styles from '../templatesStyles/classic.module.css'
import React from 'react';

export const InvoiceClassic = ({ 
  sale, 
  company, 
  formatAddress, 
  formatDate, 
  formatCurrency,
  calculateLineTotals,
  companyInfo,
  taxRate,
  isPrintVersion = false  // ← Nuevo prop para detectar si es versión de impresión
}) => {
  const safeSale = sale || {};
  const items = safeSale.items || [];
  const subtotal = safeSale.subtotal || 0;
  const total = safeSale.total || 0;
  const tax = safeSale.tax || 0;
  const discount = safeSale.discount || 0;

  // Seleccionamos las clases según si es versión de impresión o no
  const getClassName = (element) => {
    if (isPrintVersion) {
      // Para impresión: usamos clases planas
      const classMap = {
        invoiceClassic: 'invoice-classic',
        header: 'header',
        companySection: 'company-section',
        logo: 'logo',
        invoiceInfo: 'invoice-info',
        divider: 'divider',
        clientBox: 'client-box',
        table: 'table',
        textCenter: 'text-center',
        textRight: 'text-right',
        totals: 'totals',
        totalRow: 'total-row',
        final: 'final',
        footer: 'footer'
      };
      return classMap[element] || '';
    }
    // Para vista previa: usamos CSS modules
    return styles[element] || '';
  };

  return (
    <div className={getClassName('invoiceClassic')}>
      {/* Header con borde clásico */}
      <div className={getClassName('header')}>
        <div className={getClassName('companySection')}>
          {company.logo && (
            <img src={company.logo} alt={company.name} className={getClassName('logo')} />
          )}
          <h1>{company.name}</h1>
          <p>{formatAddress(company.address)}</p>
          <p>Tel: {company.phone} | Email: {company.email}</p>
        </div>
        
        <div className={getClassName('invoiceInfo')}>
          <h2>RECHNUNG</h2>
          <p>Nr: {safeSale.lieferschein || '–'}</p>
          <p>Datum: {formatDate(safeSale.createdAt)}</p>
          <p>Fällig: {formatDate(safeSale.createdAt, 30)}</p>
        </div>
      </div>

      {/* Línea decorativa */}
      <div className={getClassName('divider')}></div>

      {/* Cliente */}
      <div className={getClassName('clientBox')}>
        <h3>Rechnungsempfänger</h3>
        <p><strong>{safeSale.clientSnapshot?.name} {safeSale.clientSnapshot?.vorname}</strong></p>
        <p>{safeSale.clientSnapshot?.email}</p>
        {/* <p>{safeSale.clientSnapshot?.address}</p> */}
      </div>

      {/* Tabla con estilo clásico */}
      <table className={getClassName('table')}>
        <thead>
          <tr>
            <th>Pos.</th>
            <th>Artikel</th>
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
                <td>{item.artikelName}</td>
                <td>{item.description || '-'}</td>
                <td className={getClassName('textCenter')}>{item.quantity}</td>
                <td className={getClassName('textRight')}>
                  {formatCurrency(item.unitPrice)} {company.currency}
                </td>
                <td className={getClassName('textRight')}>
                  {formatCurrency(lineTotal)} {company.currency}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totales */}
      <div className={getClassName('totals')}>
        <div className={getClassName('totalRow')}>
          <span>Zwischensumme:</span>
          <span>{formatCurrency(subtotal)} {company.currency}</span>
        </div>
        {discount > 0 && (
          <div className={getClassName('totalRow')}>
            <span>Rabatt:</span>
            <span>-{formatCurrency(discount)} {company.currency}</span>
          </div>
        )}
        <div className={getClassName('totalRow')}>
          <span>MWSt ({(taxRate * 100).toFixed(1)}%):</span>
          <span>{formatCurrency(tax)} {company.currency}</span>
        </div>
        <div className={`${getClassName('totalRow')} ${getClassName('final')}`}>
          <span>Gesamtbetrag:</span>
          <span>{formatCurrency(total)} {company.currency}</span>
        </div>
      </div>

      {/* Footer */}
      <div className={getClassName('footer')}>
        <p>Bank: {companyInfo.bank} | IBAN: {companyInfo.iban}</p>
        <p>Vielen Dank für Ihren Auftrag!</p>
      </div>
    </div>
  );
};