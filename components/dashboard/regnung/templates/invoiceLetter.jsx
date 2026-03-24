// frontend/components/dashboard/regnung/templates/InvoiceLetter.jsx
import React from 'react';
import styles from '../templatesStyles/letter.module.css';

export const InvoiceLetter = ({  
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
          invoiceLetter: 'invoice-letter',
          header: 'header',
          senderInfo: 'sender-info',
          recipientWindow: 'recipient-window',
          recipientAddress: 'recipient-address',
          logoContainer: 'logo-container',
          logo: 'logo',
          companyDetails: 'company-details',
          invoiceMeta: 'invoice-meta',

          metaRow: 'metaRow',
          metaLabel: 'metaLabel',
          metaValue: 'metaValue',

          subject: 'subject',
          table: 'table',
          textCenter: 'text-center',
          textRight: 'text-right',
          totalsSection: 'totals-section',
          totals: 'totals',
          totalRow: 'total-row',
          final: 'final',
          footer: 'footer',
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
  const email = getEmail(client);
  const phone = getPhone(client);
  const addressParts = getAddressParts(client);

  return (
    <div className={getClassName('invoiceLetter')}>
      {/* Diseño de carta con ventana para dirección */}
      <div className={getClassName('header')}>
        {/* Información del remitente (arriba a la derecha) */}
        <div className={getClassName('senderInfo')}>
          <div className={getClassName('logoContainer')}>
            {company.logo && (
              <img src={company.logo} alt={company.name} className={getClassName('logo')} />
            )}
          </div>
          <div className={getClassName('companyDetails')}>
            <div className={getClassName('companyName')}>{company.name}</div>
            <div>{formatAddress(company.address)}</div>
            <div>Tel: {company.phone} | Email: {company.email}</div>
          </div>
        </div>

        {/* Área para la ventana del sobre - Dirección del destinatario */}
        <div className={getClassName('recipientWindow')}>
          <div className={getClassName('recipientAddress')}>
            {/* Empresa del destinatario (si existe) */}
            {companyName && (
              <div className={getClassName('recipientCompany')}>{companyName}</div>
            )}
            
            {/* Nombre completo del destinatario */}
            {fullName && <div>{fullName}</div>}
            
            {/* Calle + número */}
            {addressParts.streetLine && (
              <div>{addressParts.streetLine}</div>
            )}
            
            {/* Código postal + ciudad */}
            {addressParts.cityLine && (
              <div>{addressParts.cityLine}</div>
            )}
            
            {/* País (si existe y no es el país por defecto) */}
            {addressParts.country && addressParts.country !== company.address?.country && (
              <div>{addressParts.country}</div>
            )}
          </div>
        </div>
      </div>

      {/* Metadatos de la factura */}
      <div className={getClassName('invoiceMeta')}>
       <div className={getClassName('metaRow')}>
    <span className={getClassName('metaValue')}>{safeSale.lieferschein || '–'}</span>
    <span className={getClassName('metaLabel')}></span> {/* Vacío a la izquierda */}
  </div>
  <div className={getClassName('metaRow')}>
    <span className={getClassName('metaLabel')}>{t('invoice.date')}</span>
    <span className={getClassName('metaValue')}>{formatDate(safeSale.createdAt)}</span>
  </div>
        <div className={getClassName('metaRow')}>
          <span className={getClassName('metaLabel')}>{t('invoice.dueDate')}</span>
          <span className={getClassName('metaValue')}>{formatDate(safeSale.createdAt, 30)}</span>
        </div>
        {safeSale.customerNumber && (
          <div className={getClassName('metaRow')}>
            <span className={getClassName('metaLabel')}>{t('invoice.customerNumber')}:</span>
            <span className={getClassName('metaValue')}>{safeSale.customerNumber}</span>
          </div>
        )}
      </div>

      {/* Asunto de la factura */}
      <div className={getClassName('subject')}>
        {safeSale.lieferschein || ''}
      </div>

      {/* Tabla con estilo de carta */}
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
      <div className={getClassName('totalsSection')}>
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
      </div>

      {/* Información de pago y pie de página */}
      <div className={getClassName('footer')}>
        <p className={getClassName('paymentInfo')}>
          {t('invoice.footer.bankInfo').replace('{bank}', companyInfo.bank).replace('{iban}', companyInfo.iban)}
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