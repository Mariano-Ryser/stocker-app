// frontend/components/dashboard/regnung/RechnungPrint.jsx
import React, { useState, useRef } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { InvoiceClassic } from "./templates/InvoiceClassic";
import { InvoiceClassic2 } from "./templates/InvoiceClassic2";
import { InvoiceModern } from "./templates/InvoiceModern";
import { InvoiceLetter } from "./templates/invoiceLetter";
import { TicketThermal } from "./templates/TicketThermal";
import styles from "./RechnungPrint.module.css";
import { printStyles } from './printStyles';
import ReactDOMServer from 'react-dom/server';
import { useLanguage } from "../../../contexts/LanguageContext";

// Configuración de plantillas disponibles
const TEMPLATES = {
  classic: { 
    name: 'Klassisch', 
    component: InvoiceClassic,
    icon: '📄',
    type: 'invoice',
    styleClass: 'invoice-classic'
  },
   classic2: { 
    name: 'Klassisch-2', 
    component: InvoiceClassic2,
    icon: '📄',
    type: 'invoice',
    styleClass: 'invoice-classic2'
  },
  modern: { 
    name: 'Modern', 
    component: InvoiceModern,
    icon: '📄',
    type: 'invoice',
    styleClass: 'invoice-modern'
  },
    letter: { // <-- NUEVA PLANTILLA
    name: 'Brief', 
    component: InvoiceLetter,
    icon: '✉️',
    type: 'invoice',
    styleClass: 'invoice-letter'
  },
  ticket: { 
    name: 'Ticket', 
    component: TicketThermal,
    icon: '🧾',
    type: 'ticket',
    styleClass: 'invoice-ticket'
  }
};

export default function RechnungPrint({ sale, onClose }) {
  const { user, company } = useAuth();
  const { t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const printRef = useRef();

  // Datos seguros
  const safeSale = sale || {};
  const safeCompany = company || {
    name: '',
    logo: '',
    phone: '',
    email: '',
    currency: 'EUR',
    address: { street: '', number: '', postalCode: '', city: '', country: '' }
  };

  const taxRate = (safeSale.subtotal || 0) > 0 
    ? (safeSale.tax || 0) / (safeSale.subtotal || 0) 
    : 0.08;

  const companyInfo = {
    iban: "CH93 0076 2011 6238 5295 7",
    bank: "Mustermann Bank AG"
  };

  // Utilidades comunes
  const formatAddress = (address) => {
    if (!address) return '';
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.number) parts.push(address.number);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.city) parts.push(address.city);
    return parts.join(' ');
  };

  const formatDate = (dateString, addDays = 0) => {
    if (!dateString) return '–';
    const date = new Date(dateString);
    if (addDays) date.setDate(date.getDate() + addDays);
    return date.toLocaleDateString("de-DE", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toFixed(2);
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

    const template = TEMPLATES[selectedTemplate];
    const TemplateComponent = template.component;

    // Renderizamos el componente a HTML con isPrintVersion=true
    const printHTML = ReactDOMServer.renderToString(
      <TemplateComponent
        sale={safeSale}
        company={safeCompany}
        formatAddress={formatAddress}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        calculateLineTotals={calculateLineTotals}
        companyInfo={companyInfo}
        taxRate={taxRate}
        isPrintVersion={true}
        t={t}
      />
    );

    const newWin = window.open("", "_blank");
    newWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${template.name} - ${safeSale.lieferschein || t('invoice.title')}</title>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Times+New+Roman&display=swap" rel="stylesheet">
          <style>
            ${printStyles}
            
            @media print {
              body {
                padding: 15px;
                margin: 0;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          ${printHTML}
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    newWin.document.close();
  };

  const TemplateSelector = () => (
    <div className={styles.templateSelector}>
      <button 
        className={styles.selectorToggle}
        onClick={() => setShowTemplateSelector(!showTemplateSelector)}
      >
        <span>{TEMPLATES[selectedTemplate].icon}</span>
        <span>{TEMPLATES[selectedTemplate].name}</span>
        <span className={styles.arrow}>▼</span>
      </button>
      
      {showTemplateSelector && (
        <div className={styles.templateDropdown}>
          <div className={styles.templateGroup}>
            <h4>{t('invoice.title')}</h4>
            {Object.entries(TEMPLATES)
              .filter(([_, tpl]) => tpl.type === 'invoice')
              .map(([key, template]) => (
                <button
                  key={key}
                  className={`${styles.templateOption} ${selectedTemplate === key ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedTemplate(key);
                    setShowTemplateSelector(false);
                  }}
                >
                  <span>{template.icon}</span>
                  <span>{template.name}</span>
                </button>
              ))}
          </div>
          <div className={styles.templateGroup}>
            <h4>{t('invoice.ticket.title') || 'Tickets'}</h4>
            {Object.entries(TEMPLATES)
              .filter(([_, tpl]) => tpl.type === 'ticket')
              .map(([key, template]) => (
                <button
                  key={key}
                  className={`${styles.templateOption} ${selectedTemplate === key ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedTemplate(key);
                    setShowTemplateSelector(false);
                  }}
                >
                  <span>{template.icon}</span>
                  <span>{template.name}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  // Obtener el componente de la plantilla seleccionada para la vista previa
  const PreviewComponent = TEMPLATES[selectedTemplate].component;

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.modal} ${styles.compact}`}>
        {/* Header del modal */}
        <div className={styles.modalHeader}>
          <TemplateSelector />
          <button className={styles.closeBtn} onClick={onClose}>✖</button>
        </div>

        {/* Vista previa con estilos module */}
        <div ref={printRef} className={styles.printContent}>
          <PreviewComponent
            sale={safeSale}
            company={safeCompany}
            formatAddress={formatAddress}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
            calculateLineTotals={calculateLineTotals}
            companyInfo={companyInfo}
            taxRate={taxRate}
            isPrintVersion={false}
            t={t}
          />
        </div>

        {/* Botones de acción */}
        <div className={styles.modalFooter}>
          <button 
            className={`${styles.printBtn} no-print`} 
            onClick={handlePrint}
          >
            🖨️ {t('invoice.actions.print') || 'Drucken'} ({TEMPLATES[selectedTemplate].name})
          </button>
        </div>
      </div>
    </div>
  );
}