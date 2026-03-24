import styles from '../templatesStyles/classic.module.css'
import React from 'react';
import { COUNTRY_CONFIG } from '../../../../utils/countryConfig';

export const InvoiceClassic = ({  
  sale, 
  company, 
  formatAddress, 
  formatDate, 
  formatCurrency,
  calculateLineTotals,
  companyInfo,
  isPrintVersion = false,
  t
}) => {
  const safeSale = sale || {};
  const items = safeSale.items || [];
  const subtotal = safeSale.subtotal || 0;
  const total = safeSale.total || 0;
  const tax = safeSale.tax || 0;
  const discount = safeSale.discount || 0;
  

  // Obtener configuración del país de facturación (de la empresa)
  const countryCode = company?.invoiceSettings?.country || 'DE';
  const countryConfig = COUNTRY_CONFIG[countryCode] || COUNTRY_CONFIG.DE;
  
  // 🔥 Obtener el nombre del impuesto según el país
  const taxName = countryConfig.taxName || 'MwSt';
  
  // El taxRate puede venir de la venta o de la empresa
  const taxRate = safeSale.taxRate || company?.invoiceSettings?.taxRate || 19;

  // Función para obtener el pie de factura legal según el país
  const getLegalFooter = () => {
    if (!company?.taxInfo) return null;
    
    const footerLines = [];
    
    switch(countryCode) {
      case 'DE':
        if (company.taxInfo.steuernummer) {
          footerLines.push(`Steuernummer: ${company.taxInfo.steuernummer}`);
        }
        if (company.taxInfo.ustId) {
          footerLines.push(`USt-IdNr.: ${company.taxInfo.ustId}`);
        }
        if (company.taxInfo.companyRegister) {
          footerLines.push(`Handelsregister: ${company.taxInfo.companyRegister}`);
        }
        break;
        
      case 'CH':
        if (company.taxInfo.uid) {
          footerLines.push(`UID: ${company.taxInfo.uid}`);
        }
        if (company.taxInfo.vatNumber) {
          footerLines.push(`MWST-Nr.: ${company.taxInfo.vatNumber}`);
        }
        if (company.taxInfo.companyRegister) {
          footerLines.push(`Handelsregister: ${company.taxInfo.companyRegister}`);
        }
        break;
        
      case 'ES':
        if (company.taxInfo.nif) {
          footerLines.push(`NIF: ${company.taxInfo.nif}`);
        }
        break;
        
      case 'AR':
        if (company.taxInfo.cuit) {
          footerLines.push(`CUIT: ${company.taxInfo.cuit}`);
        }
        if (company.taxInfo.ingresosBrutos) {
          footerLines.push(`Ingresos Brutos: ${company.taxInfo.ingresosBrutos}`);
        }
        if (company.taxInfo.condicionIva) {
          const ivaText = {
            'responsableInscripto': 'Responsable Inscripto',
            'monotributo': 'Monotributista',
            'exento': 'Exento',
            'consumidorFinal': 'Consumidor Final'
          }[company.taxInfo.condicionIva] || company.taxInfo.condicionIva;
          footerLines.push(`Condición IVA: ${ivaText}`);
        }
        break;
        
      default:
        if (company.taxInfo.taxId) {
          footerLines.push(`${countryConfig.taxIdLabel}: ${company.taxInfo.taxId}`);
        }
        if (company.taxInfo.vatNumber) {
          footerLines.push(`${countryConfig.vatLabel || 'VAT'}: ${company.taxInfo.vatNumber}`);
        }
    }
    
    return footerLines;
  };

  // Función para obtener las partes de la dirección por separado
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
      if (client.address.state) cityParts.push(client.address.state);
      const cityLine = cityParts.length > 0 ? cityParts.join(' ') : null;
      
      const country = client.address.country || null;
      
      return { streetLine, cityLine, country };
    }
    
    if (client.adresse) {
      const parts = client.adresse.split(',').map(p => p.trim());
      const streetLine = parts[0] || null;
      const cityLine = parts[1] || null;
      const country = parts[2] || null;
      
      return { streetLine, cityLine, country };
    }
    
    return { streetLine: null, cityLine: null, country: null };
  };

  const getCompanyName = (client) => {
    if (!client) return null;
    return client.company || 
           client.companyName || 
           client.businessName || 
           client.firma || 
           client.empresa || 
           null;
  };

  const getFullName = (client) => {
    if (!client) return '';
    
    const name = client.name || '';
    const vorname = client.vorname || '';
    
    if (name && vorname) return `${name} ${vorname}`;
    if (name) return name;
    if (vorname) return vorname;
    
    return client.clientName || '';
  };

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
        bankRow: 'bank-row',
        legalInfo: 'legal-info'
      };
      return classMap[element] || '';
    }
    return styles[element] || '';
  };

  const client = safeSale.clientSnapshot || safeSale.client || {};
  const fullName = getFullName(client);
  const companyName = getCompanyName(client);
  const phone = getPhone(client);
  const addressParts = getAddressParts(client);

  const formatIBANForDisplay = (iban) => {
    if (!iban) return '';
    if (iban.includes(' ')) return iban;
    return iban.replace(/(.{4})/g, '$1 ').trim();
  };

  const legalFooter = getLegalFooter();

  return (
    <div className={getClassName('invoiceClassic')}>
      {/* Header */}
      <div className={getClassName('header')}>
        <div className={getClassName('companySection')}>
          {company.logo && (
            <img src={company.logo} alt={company.name} className={getClassName('logo')} />
          )}
          <h1>{company.name}</h1>
          <p>{formatAddress(company.address)}</p>
          {/* <p>Tel: {company.phone} | Email: {company.email}</p> */}
          {/* {company.website && <p>{company.name}</p>} */}
        </div>
        
        <div className={getClassName('invoiceInfo')}>
          <h3>{t('invoice.invoice')}</h3> 
          <p>{t('invoice.invoiceNumber')} {safeSale.lieferschein || '–'}</p>
          <p>{t('invoice.date')} {formatDate(safeSale.createdAt)}</p>
          <p>{t('invoice.dueDate')} {formatDate(safeSale.createdAt, 30)}</p>
        </div>
      </div>

      <div className={getClassName('divider')}></div>

      {/* Cliente */}
      <div className={getClassName('clientBox')}>
        <h3>{t('invoice.customerRecipient')}</h3>
        
        {companyName && <p><strong>{companyName}</strong></p>}
        {addressParts.country && <p>{addressParts.country}</p>}
        {addressParts.cityLine && <p>{addressParts.cityLine}</p>}
        {addressParts.streetLine && <p>{addressParts.streetLine}</p>}
        {fullName && <p>{fullName}</p>}
        {phone && <p>Tel: {phone}</p>}
        
        {/* {!fullName && !companyName && !phone && !addressParts.streetLine && (
          <p>–</p>
        )} */}
      </div>

      {/* Tabla */}
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
            {/* aqui mostramos el descuento */}
            <span>-{formatCurrency(discount)} {company.currency}</span> 
          </div>
        )}

        {/* 🔥 Usamos la traducción con taxName y taxRate */}
        <div className={getClassName('totalRow')}>
          <span>
               <span>{taxName} {taxRate.toFixed(1)}%</span>
          </span>
          <span>{formatCurrency(tax)} {company.currency}</span>
        </div>
        
        <div className={`${getClassName('totalRow')} ${getClassName('final')}`}>
          <span>{t('invoice.totals.total')}</span>
          <span>{formatCurrency(total)} {company.currency}</span>
        </div>
      </div>

      {/* Footer con datos bancarios y fiscales */}
      <div className={getClassName('footer')}>
        {/* Datos bancarios */}
        {company.bankDetails && (
          <div className={getClassName('bankSection')}>
            <p className={getClassName('bankInfoLine')}>
              {company.bankDetails.bankName && <span>{company.bankDetails.bankName}</span>}
              {company.bankDetails.accountHolder && (
                <span> | {company.bankDetails.accountHolder}</span>
              )}
              {company.bankDetails.iban && (
                <span> | IBAN: <span className={getClassName('ibanCompact')}>
                  {formatIBANForDisplay(company.bankDetails.iban)}
                </span></span>
              )}
              {company.bankDetails.bic && <span> | BIC: {company.bankDetails.bic}</span>}
            </p>
          </div>
        )}

        {/* Información fiscal legal según país */}
        {legalFooter && legalFooter.length > 0 && (
          <div className={getClassName('legalInfo')}>
            {legalFooter.map((line, idx) => (
              <p key={idx} className={getClassName('legalLine')}>{line}</p>
            ))}
          </div>
        )}

        <p className={getClassName('thanks')}>{t('invoice.thanks')}</p>
      </div>
    </div>
  );
};