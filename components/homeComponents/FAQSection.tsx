// components/homeComponents/FAQSection.tsx
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQSection() {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = useState<number[]>([0]);

  // FAQs por idioma
  const faqs: Record<string, FAQItem[]> = {
    de: [
      {
        id: 0,
        question: "Wie funktioniert die Lagerverwaltung mit Stocker?",
        answer: "Stocker bietet eine intuitive Plattform zur Echtzeit-Bestandsverwaltung. Sie können Artikel hinzufügen, bearbeiten, löschen und deren Bestand verfolgen. Das System aktualisiert automatisch den Lagerbestand bei Verkäufen, Einkäufen oder Anpassungen. Mit unserem Barcode-Scanner können Sie Artikel schnell erfassen und suchen."
      },
      {
        id: 1,
        question: "Ist Stocker für kleine Unternehmen geeignet?",
        answer: "Ja, absolut! Stocker wurde speziell für KMUs entwickelt. Unser Basistarif ist ideal für kleine Unternehmen, die mit bis zu 100 Artikeln arbeiten. Mit dem Wachstum Ihres Unternehmens können Sie jederzeit zu einem größeren Tarif upgraden."
      },
      {
        id: 2,
        question: "Kann ich Stocker mit meiner bestehenden Software integrieren?",
        answer: "Ja, Stocker bietet eine umfassende REST-API, die eine nahtlose Integration mit Ihren bestehenden Systemen ermöglicht. Egal ob Buchhaltungssoftware, E-Commerce-Plattform oder ERP - unsere API macht es möglich."
      },
      {
        id: 3,
        question: "Wie sicher sind meine Daten?",
        answer: "Datensicherheit hat bei Stocker höchste Priorität. Wir verwenden 256-Bit-Verschlüsselung für alle Datenübertragungen, hosten auf deutschen Servern und erfüllen die strengen DSGVO-Anforderungen. Ihre Daten werden regelmäßig gesichert und sind nur für autorisierte Benutzer zugänglich."
      },
      {
        id: 4,
        question: "Kann ich Stocker kostenlos testen?",
        answer: "Ja, wir bieten eine 14-tägige kostenlose Testphase ohne Kreditkartenpflicht. Sie können alle Funktionen in vollem Umfang testen und entscheiden dann, ob Stocker die richtige Lösung für Ihr Unternehmen ist."
      },
      {
        id: 5,
        question: "Welche Zahlungsmethoden werden akzeptiert?",
        answer: "Wir akzeptieren alle gängigen Zahlungsmethoden: Kreditkarte (Visa, Mastercard), PayPal, SEPA-Lastschrift und Rechnung für Jahresabonnements. Alle Zahlungen werden über einen sicheren, zertifizierten Zahlungsanbieter abgewickelt."
      }
    ],
    es: [
      {
        id: 0,
        question: "¿Cómo funciona la gestión de inventario con Stocker?",
        answer: "Stocker ofrece una plataforma intuitiva para la gestión de inventario en tiempo real. Puedes añadir, editar, eliminar artículos y hacer seguimiento de su stock. El sistema actualiza automáticamente el inventario con ventas, compras o ajustes. Con nuestro escáner de códigos de barras puedes registrar y buscar artículos rápidamente."
      },
      {
        id: 1,
        question: "¿Stocker es adecuado para pequeñas empresas?",
        answer: "¡Absolutamente! Stocker fue diseñado específicamente para PYMES. Nuestro plan básico es ideal para pequeñas empresas que trabajan con hasta 100 artículos. A medida que tu empresa crece, puedes actualizar a un plan superior en cualquier momento."
      },
      {
        id: 2,
        question: "¿Puedo integrar Stocker con mi software existente?",
        answer: "Sí, Stocker ofrece una API REST completa que permite una integración perfecta con tus sistemas existentes. Ya sea software de contabilidad, plataforma de comercio electrónico o ERP - nuestra API lo hace posible."
      },
      {
        id: 3,
        question: "¿Qué tan seguros están mis datos?",
        answer: "La seguridad de los datos es nuestra máxima prioridad. Utilizamos cifrado de 256 bits para todas las transmisiones de datos, alojamos en servidores en Alemania y cumplimos con los estrictos requisitos del RGPD. Tus datos se respaldan regularmente y solo son accesibles para usuarios autorizados."
      },
      {
        id: 4,
        question: "¿Puedo probar Stocker gratis?",
        answer: "Sí, ofrecemos un período de prueba gratuito de 14 días sin necesidad de tarjeta de crédito. Puedes probar todas las funciones en su totalidad y luego decidir si Stocker es la solución adecuada para tu empresa."
      },
      {
        id: 5,
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos todos los métodos de pago comunes: tarjeta de crédito (Visa, Mastercard), PayPal, débito SEPA y factura para suscripciones anuales. Todos los pagos se procesan a través de un proveedor de pagos seguro y certificado."
      }
    ],
    en: [
      {
        id: 0,
        question: "How does inventory management work with Stocker?",
        answer: "Stocker provides an intuitive platform for real-time inventory management. You can add, edit, delete items and track their stock. The system automatically updates inventory with sales, purchases, or adjustments. Our barcode scanner lets you quickly register and search for items."
      },
      {
        id: 1,
        question: "Is Stocker suitable for small businesses?",
        answer: "Absolutely! Stocker was specifically designed for SMEs. Our basic plan is ideal for small businesses working with up to 100 items. As your business grows, you can upgrade to a larger plan at any time."
      },
      {
        id: 2,
        question: "Can I integrate Stocker with my existing software?",
        answer: "Yes, Stocker offers a comprehensive REST API that allows seamless integration with your existing systems. Whether accounting software, e-commerce platform, or ERP - our API makes it possible."
      },
      {
        id: 3,
        question: "How secure is my data?",
        answer: "Data security is our top priority. We use 256-bit encryption for all data transmissions, host on German servers, and comply with strict GDPR requirements. Your data is regularly backed up and only accessible to authorized users."
      },
      {
        id: 4,
        question: "Can I try Stocker for free?",
        answer: "Yes, we offer a 14-day free trial with no credit card required. You can test all features in full and then decide if Stocker is the right solution for your business."
      },
      {
        id: 5,
        question: "What payment methods do you accept?",
        answer: "We accept all common payment methods: credit card (Visa, Mastercard), PayPal, SEPA direct debit, and invoice for annual subscriptions. All payments are processed through a secure, certified payment provider."
      }
    ]
  };

  const currentFaqs = faqs[t.language] || faqs.en;

  const toggleItem = (id: number) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="faq">
      <div className="container">
        <div className="header">
          <span className="badge">{t('faq.badge') || 'FAQ'}</span>
          <h2>{t('faq.title') || 'Häufig gestellte Fragen'}</h2>
          <p className="subtitle">
            {t('faq.subtitle') || 'Antworten auf die wichtigsten Fragen zu Stocker'}
          </p>
        </div>

        <div className="faq-grid">
          {currentFaqs.map((faq) => (
            <div
              key={faq.id}
              className={`faq-item ${openItems.includes(faq.id) ? 'open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => toggleItem(faq.id)}
                aria-expanded={openItems.includes(faq.id)}
              >
                <HelpCircle size={20} className="question-icon" />
                <span>{faq.question}</span>
                {openItems.includes(faq.id) ? (
                  <ChevronUp size={20} className="chevron" />
                ) : (
                  <ChevronDown size={20} className="chevron" />
                )}
              </button>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="contact-cta">
          <p>{t('faq.contactText') || 'Haben Sie weitere Fragen?'}</p>
          <button
            className="contact-btn"
            onClick={() => window.location.href = '/kontakt'}
          >
            {t('faq.contactBtn') || 'Kontakt aufnehmen'} →
          </button>
        </div>
      </div>

      <style jsx>{`
        .faq {
          padding: 80px 20px;
          background: #ffffff;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 48px;
        }

        .badge {
          display: inline-block;
          padding: 6px 16px;
          background: #e1f0fa;
          color: #1e4b7a;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 16px;
        }

        h2 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 16px;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #4a5568;
          max-width: 600px;
          margin: 0 auto;
        }

        .faq-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 48px;
        }

        .faq-item {
          background: #f9fafb;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
        }

        .faq-item:hover {
          border-color: #7bb3e0;
        }

        .faq-item.open {
          background: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
        }

        .faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 24px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font-size: 1rem;
          font-weight: 500;
          color: #1f2937;
          transition: all 0.2s ease;
        }

        .faq-question:hover {
          background: #f3f4f6;
        }

        .question-icon {
          color: #7bb3e0;
          flex-shrink: 0;
        }

        .faq-question span {
          flex: 1;
        }

        .chevron {
          color: #9ca3af;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out;
          padding: 0 24px;
        }

        .faq-item.open .faq-answer {
          max-height: 300px;
          padding: 0 24px 20px 24px;
        }

        .faq-answer p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #4b5563;
          margin: 0;
        }

        .contact-cta {
          text-align: center;
          padding: 32px;
          background: linear-gradient(135deg, #f8fcff 0%, #ffffff 100%);
          border-radius: 24px;
          border: 1px solid #e5e7eb;
        }

        .contact-cta p {
          font-size: 1.1rem;
          color: #1f2937;
          margin-bottom: 20px;
        }

        .contact-btn {
          background: transparent;
          border: 1px solid #7bb3e0;
          padding: 12px 28px;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #1e4b7a;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .contact-btn:hover {
          background: #7bb3e0;
          color: white;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .faq {
            padding: 60px 16px;
          }

          h2 {
            font-size: 1.6rem;
          }

          .subtitle {
            font-size: 0.95rem;
          }

          .faq-question {
            padding: 16px 20px;
            font-size: 0.95rem;
          }

          .faq-item.open .faq-answer {
            padding: 0 20px 16px 20px;
          }

          .faq-answer p {
            font-size: 0.9rem;
          }

          .contact-cta {
            padding: 24px;
          }

          .contact-cta p {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </section>
  );
}