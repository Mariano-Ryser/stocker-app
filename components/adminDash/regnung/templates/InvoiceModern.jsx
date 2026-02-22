// frontend/components/adminDash/regnung/templates/InvoiceModern.jsx
import styles from '../templatesStyles/modern.module.css'
import React from 'react';

export const InvoiceModern = ({ 
  sale, 
  company, 
  formatAddress, 
  formatDate, 
  formatCurrency,
  calculateLineTotals,
  companyInfo,
  taxRate,
  isPrintVersion = false
}) => {
  const safeSale = sale || {};
  const items = safeSale.items || [];
  const subtotal = safeSale.subtotal || 0;
  const total = safeSale.total || 0;
  const tax = safeSale.tax || 0;
  const discount = safeSale.discount || 0;

  const getClassName = (element) => {
    if (isPrintVersion) {
      const classMap = {
        invoiceModern: 'invoice-modern',
        header: 'header',
        logo: 'logo',
        logoPlaceholder: 'logo-placeholder',
        titleSection: 'title-section',
        invoiceTitle: 'invoice-title',
        invoiceNumber: 'invoice-number',
        topInfoGrid: 'top-info-grid',
        infoBlock: 'info-block',
        infoLabel: 'info-label',
        infoValue: 'info-value',
        companyName: 'company-name',
        clientName: 'client-name',
        table: 'table',
        textCenter: 'text-center',
        textRight: 'text-right',
        itemName: 'item-name',
        itemDesc: 'item-desc',
        totalsSection: 'totals-section',
        totalRow: 'total-row',
        grandTotal: 'grand-total',
        paymentInfo: 'payment-info',
        paymentRow: 'payment-row',
        divider: 'divider'
      };
      return classMap[element] || '';
    }
    return styles[element] || '';
  };

  return (
    <div className={getClassName('invoiceModern')}>
      {/* Header superior con logo y título */}
      <div className={getClassName('header')}>
        {company.logo ? (
          <img src={company.logo} alt={company.name} className={getClassName('logo')} />
        ) : (
          <div className={getClassName('logoPlaceholder')}>
            {company.name?.[0] || 'C'}
          </div>
        )}
        <div className={getClassName('titleSection')}>
          <h1 className={getClassName('invoiceTitle')}>RECHNUNG</h1>
          <div className={getClassName('invoiceNumber')}>{safeSale.lieferschein || 'NEW'}</div>
        </div>
      </div>

      {/* Grid superior con todos los datos importantes */}
      <div className={getClassName('topInfoGrid')}>
        {/* Datos de la empresa */}
        <div className={getClassName('infoBlock')}>
          <div className={getClassName('infoLabel')}>Verkäufer</div>
          <div className={getClassName('companyName')}>{company.name}</div>
          <div className={getClassName('infoValue')}>{formatAddress(company.address)}</div>
          <div className={getClassName('infoValue')}>Tel: {company.phone}</div>
          <div className={getClassName('infoValue')}>{company.email}</div>
        </div>

        {/* Datos del cliente */}
        <div className={getClassName('infoBlock')}>
          <div className={getClassName('infoLabel')}>Kunde</div>
          <div className={getClassName('clientName')}>{safeSale.clientSnapshot?.name || '–'}</div>
          <div className={getClassName('infoValue')}>{safeSale.clientSnapshot?.address || '–'}</div>
          <div className={getClassName('infoValue')}>{safeSale.clientSnapshot?.email}</div>
        </div>

        {/* Datos de la factura */}
        <div className={getClassName('infoBlock')}>
          <div className={getClassName('infoLabel')}>Rechnungsdetails</div>
          <div className={getClassName('infoValue')}>
            <span>Datum: </span>
            <strong>{formatDate(safeSale.createdAt)}</strong>
          </div>
          <div className={getClassName('infoValue')}>
            <span>Fällig: </span>
            <strong>{formatDate(safeSale.createdAt, 30)}</strong>
          </div>
          <div className={getClassName('infoValue')}>
            <span>Status: </span>
            <span className={`${getClassName('status')} ${safeSale.status || 'pending'}`}>
              {safeSale.status === 'paid' ? 'Bezahlt' : 
               safeSale.status === 'cancelled' ? 'Storniert' : 'Ausstehend'}
            </span>
          </div>
        </div>
      </div>

      <div className={getClassName('divider')}></div>

      {/* Tabla de artículos */}
      <table className={getClassName('table')}>
        <thead>
          <tr>
            <th>Artikel</th>
            <th className={getClassName('textCenter')}>Menge</th>
            <th className={getClassName('textRight')}>Preis</th>
            <th className={getClassName('textRight')}>Gesamt</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const { lineTotal } = calculateLineTotals(item);
            return (
              <tr key={idx}>
                <td>
                  <div className={getClassName('itemName')}>{item.artikelName}</div>
                  {item.description && (
                    <div className={getClassName('itemDesc')}>{item.description}</div>
                  )}
                </td>
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

      {/* Totales e información de pago */}
      <div className={getClassName('totalsSection')}>
        <div className={getClassName('paymentInfo')}>
          <div className={getClassName('infoLabel')}>Zahlungsinformation</div>
          <div className={getClassName('paymentRow')}>
            <span>Bank:</span>
            <span>{companyInfo.bank}</span>
          </div>
          <div className={getClassName('paymentRow')}>
            <span>IBAN:</span>
            <span>{companyInfo.iban}</span>
          </div>
        </div>

        <div>
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
          <div className={`${getClassName('totalRow')} ${getClassName('grandTotal')}`}>
            <span>Gesamtbetrag:</span>
            <span>{formatCurrency(total)} {company.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};