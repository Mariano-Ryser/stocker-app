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
  isPrintVersion = false,
  t
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

  const client = safeSale.clientSnapshot || safeSale.client;

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
        <div className={getClassName('ticketDivider')}>{t('invoice.ticket.divider')}</div>
      </div>

      {/* Información del ticket */}
      <div className={getClassName('ticketInfo')}>
        <div className={getClassName('ticketRow')}>
          <span>{t('invoice.ticket.ticketNumber')}</span>
          <span>{safeSale.lieferschein || 'N/A'}</span>
        </div>
        <div className={getClassName('ticketRow')}>
          <span>{t('invoice.ticket.date')}</span>
          <span>{formatDate(safeSale.createdAt)}</span>
        </div>
        <div className={getClassName('ticketRow')}>
          <span>{t('invoice.ticket.customer')}</span>
          <span>{client?.name || client?.vorname || t('invoice.customerDirect')}</span>
        </div>
        <div className={getClassName('ticketDivider')}>{t('invoice.ticket.divider')}</div>
      </div>

      {/* Items */}
      <div className={getClassName('ticketItems')}>
        {items.map((item, idx) => (
          <div key={idx} className={getClassName('ticketItem')}>
            <div className={getClassName('itemNameLine')}>
              <span className={getClassName('itemName')}>{item.artikelName}</span>
              <span className={getClassName('itemPrice')}>
                {formatCurrency(item.unitPrice)} {company.currency}
              </span>
            </div>
            <div className={getClassName('itemQuantity')}>
              {item.quantity} x {formatCurrency(item.unitPrice)} {company.currency}
              <span className={getClassName('itemTotal')}>
                = {formatCurrency(item.quantity * item.unitPrice)} {company.currency}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={getClassName('ticketDivider')}>{t('invoice.ticket.doubleDivider')}</div>

      {/* Totales */}
      <div className={getClassName('ticketTotals')}>
        <div className={getClassName('totalLine')}>
          <span>{t('invoice.totals.subtotal')}</span>
          <span>{formatCurrency(subtotal)} {company.currency}</span>
        </div>
        {discount > 0 && (
          <div className={getClassName('totalLine')}>
            <span>{t('invoice.totals.discount')}</span>
            <span>-{formatCurrency(discount)} {company.currency}</span>
          </div>
        )}
        <div className={getClassName('totalLine')}>
          <span>{t('invoice.totals.tax').replace('{rate}', (taxRate * 100).toFixed(1))}</span>
          <span>{formatCurrency(tax)} {company.currency}</span>
        </div>
        <div className={`${getClassName('totalLine')} ${getClassName('grandTotal')}`}>
          <span>{t('invoice.totals.total')}</span>
          <span>{formatCurrency(total)} {company.currency}</span>
        </div>
      </div>

      <div className={getClassName('ticketDivider')}>{t('invoice.ticket.doubleDivider')}</div>

      {/* Footer */}
      <div className={getClassName('ticketFooter')}>
        <p>{t('invoice.thanksTicket')}</p>
        <div className={getClassName('barcode')}>|||||</div>
      </div>
    </div>
  );
};