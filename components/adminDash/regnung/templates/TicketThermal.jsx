// frontend/components/adminDash/regnung/templates/TicketThermal.jsx
import styles from '../templatesStyles/ticket.module.css'
import React from 'react';

export const TicketThermal = ({ 
  sale, 
  company, 
  formatAddress, 
  formatDate, 
  formatCurrency,
  calculateLineTotals,
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
        ticketThermal: 'ticket-thermal',
        ticketHeader: 'ticket-header',
        ticketAddress: 'ticket-address',
        ticketContact: 'ticket-contact',
        ticketDivider: 'ticket-divider',
        ticketInfo: 'ticket-info',
        ticketRow: 'ticket-row',
        ticketItems: 'ticket-items',
        ticketItem: 'ticket-item',
        itemNameLine: 'item-name-line',
        itemName: 'item-name',
        itemPrice: 'item-price',
        itemQuantity: 'item-quantity',
        itemTotal: 'item-total',
        ticketTotals: 'ticket-totals',
        totalLine: 'total-line',
        grandTotal: 'grand-total',
        ticketFooter: 'ticket-footer',
        barcode: 'barcode'
      };
      return classMap[element] || '';
    }
    return styles[element] || '';
  };

  return (
    <div className={getClassName('ticketThermal')}>
      {/* Header del ticket */}
      <div className={getClassName('ticketHeader')}>
        <h2>{company.name}</h2>
        <div className={getClassName('ticketAddress')}>
          {formatAddress(company.address)}
        </div>
        <div className={getClassName('ticketContact')}>
          Tel: {company.phone}
        </div>
        <div className={getClassName('ticketDivider')}>----------------------</div>
      </div>

      {/* Información del ticket */}
      <div className={getClassName('ticketInfo')}>
        <div className={getClassName('ticketRow')}>
          <span>Ticket #:</span>
          <span>{safeSale.lieferschein || 'N/A'}</span>
        </div>
        <div className={getClassName('ticketRow')}>
          <span>Datum:</span>
          <span>{formatDate(safeSale.createdAt)}</span>
        </div>
        <div className={getClassName('ticketRow')}>
          <span>Kunde:</span>
          <span>{safeSale.clientSnapshot?.name || 'Bar'}</span>
        </div>
        <div className={getClassName('ticketDivider')}>----------------------</div>
      </div>

      {/* Items */}
      <div className={getClassName('ticketItems')}>
        {items.map((item, idx) => (
          <div key={idx} className={getClassName('ticketItem')}>
            <div className={getClassName('itemNameLine')}>
              <span className={getClassName('itemName')}>{item.artikelName}</span>
              <span className={getClassName('itemPrice')}>
                {formatCurrency(item.unitPrice)} €
              </span>
            </div>
            <div className={getClassName('itemQuantity')}>
              {item.quantity} x {formatCurrency(item.unitPrice)} €
              <span className={getClassName('itemTotal')}>
                = {formatCurrency(item.quantity * item.unitPrice)} €
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={getClassName('ticketDivider')}>======================</div>

      {/* Totales */}
      <div className={getClassName('ticketTotals')}>
        <div className={getClassName('totalLine')}>
          <span>Zwischensumme:</span>
          <span>{formatCurrency(subtotal)} €</span>
        </div>
        {discount > 0 && (
          <div className={getClassName('totalLine')}>
            <span>Rabatt:</span>
            <span>-{formatCurrency(discount)} €</span>
          </div>
        )}
        <div className={getClassName('totalLine')}>
          <span>MWSt ({(taxRate * 100).toFixed(1)}%):</span>
          <span>{formatCurrency(tax)} €</span>
        </div>
        <div className={`${getClassName('totalLine')} ${getClassName('grandTotal')}`}>
          <span>GESAMT:</span>
          <span>{formatCurrency(total)} €</span>
        </div>
      </div>

      <div className={getClassName('ticketDivider')}>======================</div>

      {/* Footer */}
      <div className={getClassName('ticketFooter')}>
        <p>Vielen Dank für Ihren Einkauf!</p>
        <div className={getClassName('barcode')}>||||||||||||||||||||</div>
      </div>
    </div>
  );
};