// frontend/components/dashboard/regnung/templates/InvoiceModern.jsx
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
  isPrintVersion = false,
  t
}) => {
  const safeSale = sale || {};
  const items = safeSale.items || [];
  const subtotal = safeSale.subtotal || 0;
  const total = safeSale.total || 0;
  const tax = safeSale.tax || 0;
  const discount = safeSale.discount || 0;

  // Función para obtener las partes de la dirección
  const getAddressParts = (client) => {
    if (!client) return { streetLine: null, cityLine: null, country: null };
    
    if (client.address) {
      const streetParts = [];
      if (client.address.street) streetParts.push(client.address.street);
      if (client.address.number) streetParts.push(client.address.number);
      if (client.address.complement) streetParts.push(client.address.complement);
      const streetLine = streetParts.length > 0 ? streetParts.join(' ') : null;
      
      const cityParts = [];
      if (client.address.postalCode) cityParts.push(client.address.postalCode);
      if (client.address.city) cityParts.push(client.address.city);
      const cityLine = cityParts.length > 0 ? cityParts.join(' ') : null;
      
      const country = client.address.country || null;
      
      return { streetLine, cityLine, country };
    }
    
    return { streetLine: null, cityLine: null, country: null };
  };

  const getCompanyName = (client) => {
    return client?.company || client?.companyName || null;
  };

  const getFullName = (client) => {
    if (!client) return '';
    const name = client.name || '';
    const vorname = client.vorname || '';
    return name && vorname ? `${name} ${vorname}` : name || vorname || '';
  };

  const getPhone = (client) => {
    return client?.phone || client?.tel || null;
  };

  // Función para formatear IBAN para mostrar (con espacios cada 4 caracteres)
  const formatIBANForDisplay = (iban) => {
    if (!iban) return '';
    // Si ya viene formateado, lo dejamos igual
    if (iban.includes(' ')) return iban;
    // Si no, lo formateamos en grupos de 4
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

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
        bankDetails: 'bank-details',
        bankRow: 'bank-row',
        bankLabel: 'bank-label',
        bankValue: 'bank-value',
        ibanValue: 'iban-value',
        divider: 'divider'
      };
      return classMap[element] || '';
    }
    return styles[element] || '';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'paid': t('invoice.status.paid'),
      'cancelled': t('invoice.status.cancelled'),
      'pending': t('invoice.status.pending')
    };
    return statusMap[status] || status;
  };

  const client = safeSale.clientSnapshot || safeSale.client || {};
  const fullName = getFullName(client);
  const companyName = getCompanyName(client);
  const phone = getPhone(client);
  const addressParts = getAddressParts(client);

  return (
    <div className={getClassName('invoiceModern')}>
      {/* Header estilo carta minimalista */}
      <div className={getClassName('header')} style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '30px'
      }}>
        {/* Remitente en línea pequeña */}
        <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.4' }}>
          <div>{company.name}</div>
          <div>{formatAddress(company.address)}</div>
          <div>Tel: {company.phone} | {company.email}</div>
        </div>

        {/* Logo y título */}
        <div style={{ textAlign: 'right' }}>
          {company.logo ? (
            <img src={company.logo} alt={company.name} className={getClassName('logo')} />
          ) : (
            <div className={getClassName('logoPlaceholder')}>
              {company.name?.[0] || 'C'}
            </div>
          )}
          <div className={getClassName('titleSection')}>
            {/* TITUTLO */}
            <h1 className={getClassName('invoiceTitle')}>
              {/* {t('invoice.invoice')} */}
              {company.name}
              </h1>
            <div className={getClassName('invoiceNumber')}>
              <strong>{safeSale.lieferschein || 'NEW'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Grid con destinatario y datos de factura */}
      <div className={getClassName('topInfoGrid')} style={{ marginBottom: '30px' }}>
        {/* Destinatario - ocupa 2 columnas */}
        <div className={getClassName('infoBlock')} style={{ gridColumn: 'span 2' }}>
          <div className={getClassName('infoLabel')}>{t('invoice.customerRecipient')}</div>
          
          {companyName && <div className={getClassName('companyName')}><strong>{companyName}</strong></div>}
          {fullName && <div className={getClassName('infoValue')}>{fullName}</div>}
          {addressParts.streetLine && <div className={getClassName('infoValue')}>{addressParts.streetLine}</div>}
          {addressParts.cityLine && <div className={getClassName('infoValue')}>{addressParts.cityLine}</div>}
          {addressParts.country && <div className={getClassName('infoValue')}>{addressParts.country}</div>}
          {phone && <div className={getClassName('infoValue')}>Tel: {phone}</div>}
        </div>

        {/* Datos de factura */}
        <div className={getClassName('infoBlock')}>
          <div className={getClassName('infoLabel')}>{t('invoice.invoiceDetails')}</div>
          <div className={getClassName('infoValue')}>
            <span>{t('invoice.date')} </span>
            <strong>{formatDate(safeSale.createdAt)}</strong>
          </div>
          <div className={getClassName('infoValue')}>
            <span>{t('invoice.dueDate')} </span>
            <strong>{formatDate(safeSale.createdAt, 30)}</strong>
          </div>
          <div className={getClassName('infoValue')}>
            <span>{t('invoice.status.label')} </span>
            <span className={`${getClassName('status')} ${safeSale.status || 'pending'}`}>
              {getStatusText(safeSale.status)}
            </span>
          </div>
        </div>
      </div>

      <div className={getClassName('divider')}></div>

      {/* Tabla de artículos */}
      <table className={getClassName('table')}>
        <thead>
          <tr>
            <th>{t('invoice.table.item')}</th>
            <th className={getClassName('textRight')}>{t('invoice.table.quantity')}</th>
            <th className={getClassName('textRight')}>{t('invoice.table.unitPrice')}</th>
            <th className={getClassName('textRight')}>{t('invoice.table.total')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const { lineTotal } = calculateLineTotals(item);
            return (
              <tr key={idx}>
                <td>
                  <div className={getClassName('itemName')}>{item.artikelName}</div>
                  {item.description && <div className={getClassName('itemDesc')}>{item.description}</div>}
                </td>
                <td className={getClassName('textRight')}>{item.quantity}</td>
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

      {/* Totales e información de pago - VERSIÓN ACTUALIZADA con bankDetails */}
      <div className={getClassName('totalsSection')}>
        <div className={getClassName('paymentInfo')}>
          <div className={getClassName('infoLabel')}>{t('invoice.paymentInfo')}</div>
          
          {/* Usar bankDetails en lugar de companyInfo */}
          {company.bankDetails && (
            <>
              {company.bankDetails.accountHolder && (
                <div className={getClassName('paymentRow')}>
                  <span>{t('invoice.footer.accountHolder')}:</span>
                  <span className={getClassName('bankValue')}>{company.bankDetails.accountHolder}</span>
                </div>
              )}
              
              {company.bankDetails.bankName && (
                <div className={getClassName('paymentRow')}>
                  <span>{t('invoice.footer.bankName')}:</span>
                  <span className={getClassName('bankValue')}>{company.bankDetails.bankName}</span>
                </div>
              )}
              
              {company.bankDetails.iban && (
                <div className={getClassName('paymentRow')}>
                  <span>IBAN:</span>
                  <span className={`${getClassName('bankValue')} ${getClassName('ibanValue')}`}>
                    {formatIBANForDisplay(company.bankDetails.iban)}
                  </span>
                </div>
              )}
              
              {company.bankDetails.bic && (
                <div className={getClassName('paymentRow')}>
                  <span>BIC/SWIFT:</span>
                  <span className={getClassName('bankValue')}>{company.bankDetails.bic}</span>
                </div>
              )}
              
              {company.bankDetails.currency && (
                <div className={getClassName('paymentRow')}>
                  <span>{t('invoice.footer.currency')}:</span>
                  <span className={getClassName('bankValue')}>{company.bankDetails.currency}</span>
                </div>
              )}
            </>
          )}

          {/* Fallback a companyInfo si no hay bankDetails (para compatibilidad) */}
          {!company.bankDetails && companyInfo && (
            <>
              {companyInfo.bank && (
                <div className={getClassName('paymentRow')}>
                  <span>{t('invoice.bank')}</span>
                  <span>{companyInfo.bank}</span>
                </div>
              )}
              {companyInfo.iban && (
                <div className={getClassName('paymentRow')}>
                  <span>{t('invoice.iban')}</span>
                  <span className={getClassName('ibanValue')}>{formatIBANForDisplay(companyInfo.iban)}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div>
          <div className={getClassName('totalRow')}>
            <span>{t('invoice.totals.subtotal')}</span>
            <span>{formatCurrency(subtotal)} {company.currency}</span>
          </div>
          {discount > 0 && (
            <div className={getClassName('totalRow')}>
              <span>{t('invoice.totals.discount')}</span>
              <span>-{formatCurrency(discount)} {company.currency}</span>
            </div>
          )}
          <div className={getClassName('totalRow')}>
            <span>{t('invoice.totals.tax').replace('{rate}', (taxRate * 100).toFixed(1))}</span>
            <span>{formatCurrency(tax)} {company.currency}</span>
          </div>
          <div className={`${getClassName('totalRow')} ${getClassName('grandTotal')}`}>
            <span>{t('invoice.totals.total')}</span>
            <span>{formatCurrency(total)} {company.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};