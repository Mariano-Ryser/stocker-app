import { useAuth } from "../../auth/AuthProvider";
import React, { useRef } from "react";

export default function RechnungPrint({ sale, onClose }) {
  const { user, company } = useAuth();
  const safeSale = sale || {};
  const items = safeSale.items || [];
  const subtotal = safeSale.subtotal || 0;
  const total = safeSale.total || 0;
  const tax = safeSale.tax || 0;
  const discount = safeSale.discount || 0;
  
  // Valores por defecto seguros para company y address
  const safeCompany = company || {
    name: '',
    logo: '',
    phone: '',
    email: '',
    currency: 'EUR',
    address: {
      street: '',
      number: '',
      postalCode: '',
      city: '',
      country: ''
    }
  };

  // Asegurar que address existe aunque company exista pero no tenga address
  const safeAddress = safeCompany.address || {
    street: '',
    number: '',
    postalCode: '',
    city: '',
    country: ''
  };
 
  const taxRate = subtotal > 0 ? tax / subtotal : 0.08;

  const printRef = useRef();

  const companyInfo = {
    iban: "CH93 0076 2011 6238 5295 7",
    bank: "Mustermann Bank AG"
  };

  const calculateLineTotals = (item) => {
    const quantity = item?.quantity || 0;
    const unitPrice = item?.unitPrice || 0;
    const lineTotal = quantity * unitPrice;
    const lineTax = lineTotal * taxRate;
    return { lineTotal, lineTax };
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;

    const printContent = printRef.current.innerHTML;
    
    const newWin = window.open("", "_blank");
    newWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rechnung ${safeSale.lieferschein || ""}</title>
          <meta charset="UTF-8">
         
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Inter', sans-serif;
              padding: 15px;
              color: #1a1a1a;
              background: #ffffff;
              line-height: 1.3;
              font-size: 12px;
            }

            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
            }

            /* Header Compacto */
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #e5e5e5;
            }

            .company-info h1 {
              font-size: 18px;
              font-weight: 600;
              color: #000;
              margin-bottom: 2px;
              margin-left: 13px;
            }

            .company-details {
              font-size: 10px;
              color: #666;
              line-height: 1.2;
            }
               .company-logo { 
          max-width: 120px;
        }

            .invoice-meta {
              text-align: right;
            }

            .invoice-title {
              font-size: 16px;
              font-weight: 600;
              color: #000;
              margin-bottom: 4px;
            }

            .invoice-number {
              font-size: 11px;
              color: #666;
            }

            /* Secciones Compactas */
            .details-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }

            .client-info, .invoice-details {
              padding: 12px;
              background: #f9f9f9;
              border-radius: 4px;
              border-left: 2px solid #ddd;
            }

            .section-title {
              font-size: 11px;
              font-weight: 600;
              color: #000;
              margin-bottom: 8px;
              text-transform: uppercase;
            }

            .info-grid {
              display: grid;
              gap: 4px;
            }

            .info-item {
              display: flex;
              justify-content: space-between;
            }

            .info-label {
              font-weight: 500;
              color: #666;
              font-size: 10px;
            }

            .info-value {
              font-weight: 400;
              color: #000;
              font-size: 10px;
            }

            /* Tabla Compacta */
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              font-size: 10px;
              background: white;
            }

            .items-table th {
              background: #f5f5f5;
              color: #000;
              padding: 8px 6px;
              text-align: left;
              font-weight: 600;
              border: 1px solid #ddd;
            }

            .items-table td {
              padding: 6px;
              border: 1px solid #ddd;
              font-size: 10px;
            }

            .text-right {
              text-align: right;
            }

            .text-center {
              text-align: center;
            }

            /* Totals Compactos */
            .totals-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 15px;
            }

            .payment-info {
              padding: 12px;
              background: #f0f8ff;
              border-radius: 4px;
              border: 1px solid #d0e8ff;
            }

            .payment-info h3 {
              font-size: 11px;
              color: #0066cc;
              margin-bottom: 8px;
            }

            .totals-box {
              padding: 12px;
              background: #f9f9f9;
              border-radius: 4px;
              border: 1px solid #ddd;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              font-size: 10px;
            }

            .total-row.final {
              font-weight: 600;
              border-top: 1px solid #000;
              padding-top: 6px;
              margin-top: 4px;
              font-size: 11px;
            }

            /* Footer Compacto */
            .invoice-footer {
              margin-top: 15px;
              padding-top: 12px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 9px;
            }

            .footer-note {
              background: #f5f5f5;
              padding: 8px;
              border-radius: 3px;
              margin-top: 8px;
              font-style: italic;
            }

            /* Utilidades */
            .badge {
              display: inline-block;
              padding: 2px 6px;
              background: #f0f0f0;
              color: #666;
              border-radius: 3px;
              font-size: 9px;
              font-weight: 500;
            }

            /* Print Optimizations */
            @media print {
              body {
                padding: 10px;
                margin: 0;
              }
              
              .invoice-container {
                max-width: 100%;
              }
              
              .no-print {
                display: none !important;
              }

              @page {
                margin: 0.5cm;
              }
            }

            @media (max-width: 600px) {
              .details-section,
              .totals-section {
                grid-template-columns: 1fr;
                gap: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    newWin.document.close();
    
    setTimeout(() => {
      newWin.focus();
      newWin.print();
    }, 300);
  };

   return (
    <div className="modal-backdrop">
      <div className="modal compact">
        <button className="close-btn no-print" onClick={onClose}>✖</button>

        <div ref={printRef} className="print-content">
          {/* Header Compacto */}
          <div className="invoice-header">
            <div className="company-info">
              {safeCompany.logo ? (
                <img
                  className="company-logo"
                  src={safeCompany.logo}
                  alt={`Logo ${safeCompany.name || ""}`}
                />
              ) : (
                <div className="company-logo-placeholder">
                  {safeCompany.name ? safeCompany.name[0].toUpperCase() : ""}
                </div>
              )}
              <h1 className="company-name">{safeCompany.name || "Company Name"}</h1>
              <div className="company-details">
                {/* Dirección con validación segura */}
                <div>
                  Adresse: {
                    [
                      safeAddress.street,
                      safeAddress.number,
                      safeAddress.postalCode,
                      safeAddress.city
                    ].filter(Boolean).join(' ') || '----'
                  }
                </div>
                
                <div>
                  Tel: {safeCompany.phone || '–'} | Email: {safeCompany.email || '–'}
                </div>
              </div>
            </div>
            
            <div className="invoice-meta">
              <div className="invoice-title">RECHNUNG</div>
              <div className="invoice-number">Nr. {safeSale.lieferschein || "–"}</div>
              <div style={{ marginTop: '4px' }}>
                <span className={`badge ${safeSale.status || 'pending'}`}>
                  {safeSale.status === 'paid' ? 'Bezahlt' : 
                   safeSale.status === 'cancelled' ? 'Storniert' : 'Ausstehend'}
                </span>
              </div>
            </div>
          </div>

          {/* Client & Details Compactos */}
          <div className="details-section">
            <div className="client-info">
              <h3 className="section-title">Rechnungsempfänger</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{safeSale.clientSnapshot?.name || "–"}</span>
                </div>
                {safeSale.clientSnapshot?.email && (
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{safeSale.clientSnapshot.email}</span>
                  </div>
                )}
                {safeSale.clientSnapshot?.address && (
                  <div className="info-item">
                    <span className="info-label">Adresse:</span>
                    <span className="info-value">{safeSale.clientSnapshot.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="invoice-details">
              <h3 className="section-title">Rechnungsdetails</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Datum:</span>
                  <span className="info-value">
                    {safeSale.createdAt ? new Date(safeSale.createdAt).toLocaleDateString("de-DE") : "–"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fällig:</span>
                  <span className="info-value">
                    {safeSale.createdAt ? 
                      new Date(new Date(safeSale.createdAt).setDate(new Date(safeSale.createdAt).getDate() + 30))
                        .toLocaleDateString("de-DE") : "–"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla Compacta */}
          <table className="items-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '45%' }}>Beschreibung</th>
                <th style={{ width: '10%' }} className="text-center">Menge</th>
                <th style={{ width: '15%' }} className="text-right">Preis</th>
                <th style={{ width: '15%' }} className="text-right">Gesamt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const { lineTotal } = calculateLineTotals(item);
                return (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div>
                        <strong>{item?.artikelName || "Artikel"}</strong>
                        {item?.description && (
                          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center">{item?.quantity || 0}</td>
                    <td className="text-right">{(item?.unitPrice || 0).toFixed(2)} {safeCompany.currency}</td>
                    <td className="text-right">{lineTotal.toFixed(2)} {safeCompany.currency}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals Compactos */}
          <div className="totals-section">
            <div className="payment-info">
              <h3>Zahlungsinformation</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Bank:</span>
                  <span className="info-value">{companyInfo.bank}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">IBAN:</span>
                  <span className="info-value">{companyInfo.iban}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Zahlbar bis:</span>
                  <span className="info-value">
                    {safeSale.createdAt ? 
                      new Date(new Date(safeSale.createdAt).setDate(new Date(safeSale.createdAt).getDate() + 30))
                        .toLocaleDateString("de-DE") : "–"}
                  </span>
                </div>
              </div>
            </div>

            <div className="totals-box">
              <div className="total-row">
                <span>Zwischensumme:</span>
                <span>{subtotal.toFixed(2)} {safeCompany.currency}</span>
              </div>
              {discount > 0 && (
                <div className="total-row">
                  <span>Rabatt:</span>
                  <span>-{discount.toFixed(2)} {safeCompany.currency}</span>
                </div>
              )}
              <div className="total-row">
                <span>MWSt ({(taxRate * 100).toFixed(1)}%):</span>
                <span>{tax.toFixed(2)} {safeCompany.currency}</span>
              </div>
              <div className="total-row final">
                <span>Gesamtbetrag:</span>
                <span>{total.toFixed(2)} {safeCompany.currency}</span>
              </div>
            </div>
          </div>

          {/* Footer Compacto */}
          <div className="invoice-footer">
            <div className="footer-note">
              <p>Vielen Dank für Ihren Auftrag! Bitte überweisen Sie den Betrag innerhalb von 30 Tagen.</p>
              <p style={{ marginTop: '4px' }}>Diese Rechnung ist ohne Unterschrift gültig.</p>
            </div>
          </div>
        </div>

        <button className="print-btn no-print" onClick={handlePrint}>
          🖨️ Drucken
        </button>
      </div>

      {/* ✅ CSS COMPACTO */}
      <style jsx>{`
        .company-logo { 
          max-width: 120px;
          margin-bottom: 0px;
        }
        .company-name {
          margin-top: 0;
          font-size: 25px;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 15px;
          z-index: 10000;
        }

        .modal.compact {
          background: #ffffff;
          width: 850px;
          max-width: 95vw;
          max-height: 95vh;
          overflow-y: auto;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          position: relative;
        }

        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #666;
          color: white;
          border: none;
          font-size: 14px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .print-btn {
          display: block;
          margin: 20px auto 0;
          padding: 10px 25px;
          background: #333;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }

        .print-btn:hover {
          background: #555;
        }

        .no-print {
          /* Oculto al imprimir */
        }

        @media (max-width: 768px) {
          .modal.compact {
            padding: 15px;
            font-size: 11px;
          }
          
          .print-btn {
            width: 100%;
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}