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

  // Función para obtener el email
  const getEmail = (client) => {
    if (!client) return null;
    return client.email || client.mail || null;
  };

  // Función para obtener el teléfono
  const getPhone = (client) => {
    if (!client) return null;
    return client.phone || client.tel || client.telefon || null;
  };

  const getClassName = (element) => {
    if (isPrintVersion) {
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
        footer: 'footer',
        bankDetails: 'bank-details',
        bankRow: 'bank-row'
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
  const email = getEmail(client);
  const phone = getPhone(client);
  const addressParts = getAddressParts(client);

  // Función para formatear IBAN para mostrar (con espacios cada 4 caracteres)
  const formatIBANForDisplay = (iban) => {
    if (!iban) return '';
    // Si ya viene formateado, lo dejamos igual
    if (iban.includes(' ')) return iban;
    // Si no, lo formateamos en grupos de 4
    return iban.replace(/(.{4})/g, '$1 ').trim();
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
          <h2>{t('invoice.invoice')}</h2>
          <p>{t('invoice.invoiceNumber')} {safeSale.lieferschein || '–'}</p>
          <p>{t('invoice.date')} {formatDate(safeSale.createdAt)}</p>
          <p>{t('invoice.dueDate')} {formatDate(safeSale.createdAt, 30)}</p>
        </div>
      </div>

      {/* Línea decorativa */}
      <div className={getClassName('divider')}></div>

      {/* Cliente - Con dirección por partes */}
      <div className={getClassName('clientBox')}>
        <h3>{t('invoice.customerRecipient')}</h3>
        
        {/* Empresa (si existe) - PRIMERO */}
        {companyName && (
          <p><strong>{companyName}</strong></p>
        )}
        
        {/* Calle + número (si existe) */}
        {addressParts.streetLine && (
          <p>{addressParts.streetLine}</p>
        )}
        
        {/* Código postal + ciudad (si existe) */}
        {addressParts.cityLine && (
          <p>{addressParts.cityLine}</p>
        )}
        
        {/* País (si existe) */}
        {addressParts.country && (
          <p>{addressParts.country}</p>
        )}
        
        {/* Nombre completo - DESPUÉS de la dirección */}
        {fullName && <p><strong>{fullName}</strong></p>}
        
        {/* Teléfono (si existe) */}
        {phone && <p>Tel: {phone}</p>}
        
        {/* Email (si existe) - OPCIONAL */}
        {/* {email && <p>Email: {email}</p>} */}
        
        {/* Si no hay ningún dato, mostrar mensaje por defecto */}
        {!fullName && !companyName && !phone && !addressParts.streetLine && (
          <p>–</p>
        )}
      </div>

      {/* Tabla con estilo clásico */}
      <table className={getClassName('table')}>
        <thead>
          <tr>
            <th>{t('invoice.table.pos')}</th>
            <th>{t('invoice.table.item')}</th>
            <th>{t('invoice.table.quantity')}</th>
            <th>{t('invoice.table.unitPrice')}</th>
            <th>{t('invoice.table.total')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const { lineTotal } = calculateLineTotals(item);
            return (
              <tr key={idx}>
                <td>{idx + 1}</td>
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

      {/* Footer con datos bancarios - VERSIÓN CORREGIDA */}
      <div className={getClassName('footer')}>
   

  <p className={getClassName('bankInfoLine')}>

      {company.bankDetails.bankName && <span>{company.bankDetails.bankName}</span>}
      {company.bankDetails.iban && (
        <span> | IBAN: <span className={getClassName('ibanCompact')}>{formatIBANForDisplay(company.bankDetails.iban)}</span></span>
      )}
      {company.bankDetails.bic && <span> | BIC: {company.bankDetails.bic}</span>}
    </p>

        <p className={getClassName('thanks')}>{t('invoice.thanks')}</p>
      </div>
    </div>
  );
};