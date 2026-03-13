// frontend/components/adminDash/regnung/templates/InvoiceClassic2.jsx
import React from 'react';
import styles from '../templatesStyles/classic2.module.css';

export const InvoiceClassic2 = ({  
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

  // Función para obtener las partes de la dirección por separado
  const getAddressParts = (client) => {
    if (!client) return { streetLine: null, cityLine: null, country: null };
    
    // Si tiene address estructurado
    if (client.address) {
      // Calle + número
      const streetParts = [];
      if (client.address.street) streetParts.push(client.address.street);
      if (client.address.number) streetParts.push(client.address.number);
      if (client.address.complement) streetParts.push(client.address.complement);
      const streetLine = streetParts.length > 0 ? streetParts.join(' ') : null;
      
      // Código postal + ciudad
      const cityParts = [];
      if (client.address.postalCode) cityParts.push(client.address.postalCode);
      if (client.address.city) cityParts.push(client.address.city);
      const cityLine = cityParts.length > 0 ? cityParts.join(' ') : null;
      
      // País
      const country = client.address.country || null;
      
      return { streetLine, cityLine, country };
    }
    
    // Si tiene adresse plano (para compatibilidad)
    if (client.adresse) {
      const parts = client.adresse.split(',').map(p => p.trim());
      const streetLine = parts[0] || null;
      const cityLine = parts[1] || null;
      const country = parts[2] || null;
      
      return { streetLine, cityLine, country };
    }
    
    return { streetLine: null, cityLine: null, country: null };
  };

  // Función para obtener el nombre de la empresa
  const getCompanyName = (client) => {
    if (!client) return null;
    return client.company || 
           client.companyName || 
           client.businessName || 
           client.firma || 
           client.empresa || 
           null;
  };

  // Función para obtener el nombre completo
  const getFullName = (client) => {
    if (!client) return '';
    
    const name = client.name || '';
    const vorname = client.vorname || '';
    
    if (name && vorname) return `${name} ${vorname}`;
    if (name) return name;
    if (vorname) return vorname;
    
    return client.clientName || '';
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
        invoiceClassic2: 'invoice-classic2',
        header: 'header',
        companySection: 'company-section',
        logo: 'logo',
        companyDetails: 'company-details',
        companyName: 'company-name',
        invoiceInfo: 'invoice-info',
        invoiceTitle: 'invoice-title',
        invoiceNumber: 'invoice-number',
        divider: 'divider',
        clientBox: 'client-box',
        clientTitle: 'client-title',
        clientName: 'client-name',
        clientAddress: 'client-address',
        clientContact: 'client-contact',
        metaGrid: 'meta-grid',
        metaItem: 'meta-item',
        metaLabel: 'meta-label',
        metaValue: 'meta-value',
        table: 'table',
        textCenter: 'text-center',
        textRight: 'text-right',
        totals: 'totals',
        totalRow: 'total-row',
        final: 'final',
        footer: 'footer',
        bankSection: 'bank-section',
        bankTitle: 'bank-title',
        bankDetailsGrid: 'bank-details-grid',
        bankDetailRow: 'bank-detail-row',
        bankLabel: 'bank-label',
        bankValue: 'bank-value',
        ibanValue: 'iban-value',
        bankInfoLine: 'bank-info-line',
        ibanCompact: 'iban-compact',
        legalInfo: 'legal-info',
        thanks: 'thanks',
        page: 'page'
      };
      return classMap[element] || '';
    }
    return styles[element] || '';
  };

  // Obtener datos del cliente
  const client = safeSale.clientSnapshot || safeSale.client || {};
  
  // Extraer toda la información
  const fullName = getFullName(client);
  const companyName = getCompanyName(client);
  const email = client.email || client.mail || null;
  const phone = client.phone || client.tel || client.telefon || null;
  const addressParts = getAddressParts(client);

  return (
    <div className={getClassName('invoiceClassic2')}>
      {/* Header con logo y título */}
      <div className={getClassName('header')}>
        <div className={getClassName('companySection')}>
          {company.logo && (
            <img src={company.logo} alt={company.name} className={getClassName('logo')} />
          )}
          <div className={getClassName('companyDetails')}>
            <div className={getClassName('companyName')}>{company.name}</div>
            <div>{formatAddress(company.address)}</div>
            <div>Tel: {company.phone} | Email: {company.email}</div>
          </div>
        </div>
        <div className={getClassName('invoiceInfo')}>
          <div className={getClassName('invoiceTitle')}>{t('invoice.title')}</div>
          <div className={getClassName('invoiceNumber')}>{safeSale.invoiceNumber || safeSale.lieferschein || '–'}</div>
        </div>
      </div>

      <div className={getClassName('divider')} />

      {/* Información del cliente */}
      <div className={getClassName('clientBox')}>
        <div className={getClassName('clientTitle')}>{t('invoice.billTo')}</div>
        {companyName && <div className={getClassName('clientName')}>{companyName}</div>}
        {fullName && <div>{fullName}</div>}
        {addressParts.streetLine && <div className={getClassName('clientAddress')}>{addressParts.streetLine}</div>}
        {addressParts.cityLine && <div>{addressParts.cityLine}</div>}
        {addressParts.country && addressParts.country !== company.address?.country && (
          <div>{addressParts.country}</div>
        )}
        {(email || phone) && (
          <div className={getClassName('clientContact')}>
            {email && <div>Email: {email}</div>}
            {phone && <div>Tel: {phone}</div>}
          </div>
        )}
      </div>

      {/* Grid de metadatos */}
      <div className={getClassName('metaGrid')}>
        <div className={getClassName('metaItem')}>
          <span className={getClassName('metaLabel')}>{t('invoice.date')}</span>
          <span className={getClassName('metaValue')}>{formatDate(safeSale.createdAt)}</span>
        </div>
        <div className={getClassName('metaItem')}>
          <span className={getClassName('metaLabel')}>{t('invoice.dueDate')}</span>
          <span className={getClassName('metaValue')}>{formatDate(safeSale.createdAt, 30)}</span>
        </div>
        {safeSale.customerNumber && (
          <div className={getClassName('metaItem')}>
            <span className={getClassName('metaLabel')}>{t('invoice.customerNumber')}</span>
            <span className={getClassName('metaValue')}>{safeSale.customerNumber}</span>
          </div>
        )}
      </div>

      {/* Tabla de items */}
      <table className={getClassName('table')}>
        <thead>
          <tr>
            <th>{t('invoice.table.pos')}</th>
            <th>{t('invoice.table.item')}</th>
            <th className={getClassName('textCenter')}>{t('invoice.table.quantity')}</th>
            <th className={getClassName('textRight')}>{t('invoice.table.unitPrice')}</th>
            <th className={getClassName('textRight')}>{t('invoice.table.total')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const { lineTotal } = calculateLineTotals(item);
            return (
              <tr key={idx}>
                <td className={getClassName('textCenter')}>{idx + 1}</td>
                <td>{item.artikelName}</td>
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
        <div className={`${getClassName('totalRow')} ${getClassName('final')}`}>
          <span>{t('invoice.totals.total')}</span>
          <span>{formatCurrency(total)} {company.currency}</span>
        </div>
      </div>

      {/* Footer con datos bancarios - VERSIÓN MEJORADA (igual que Classic) */}
      <div className={getClassName('footer')}>
        {/* Línea de información bancaria en formato compacto pero legible */}
        <p className={getClassName('bankInfoLine')}>
    
          {company.bankDetails?.bankName && <span>{company.bankDetails.bankName}</span>}
          {company.bankDetails?.iban && (
            <span> | IBAN: <span className={getClassName('ibanCompact')}>
              {formatIBANForDisplay(company.bankDetails.iban)}
            </span></span>
          )}
          {company.bankDetails?.bic && <span> | BIC: {company.bankDetails.bic}</span>}
        </p>

        <p className={getClassName('thanks')}>{t('invoice.thanks')}</p>
        
        {/* Información legal */}
        <div className={getClassName('legalInfo')}>
          {company.taxId && <span>{t('invoice.taxId')}: {company.taxId} | </span>}
          {company.courtRegistration && <span>{company.courtRegistration}</span>}
        </div>
        
        {/* Número de página */}
        <div className={getClassName('page')}>1 / 1</div>
      </div>
    </div>
  );
};