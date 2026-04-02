// components/homeComponents/PricingSection.jsx
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Router from 'next/router';

export default function PricingSection() {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState('month');

  const plans = [
    {
      id: 'starter',
      price: billingCycle === 'month' ? 0 : 0,
      priceId: { month: 'price_starter_month', year: 'price_starter_year' },
      features: ['pricing.starter.f1', 'pricing.starter.f2', 'pricing.starter.f3']
    },
    {
      id: 'basic',
      price: billingCycle === 'month' ? 39 : 374,
      priceId: { month: 'price_basic_month', year: 'price_basic_year' },
      features: ['pricing.basic.f1', 'pricing.basic.f2', 'pricing.basic.f3', 'pricing.basic.f4']
    },
    {
      id: 'pro',
      price: billingCycle === 'month' ? 59 : 566,
      priceId: { month: 'price_pro_month', year: 'price_pro_year' },
      features: ['pricing.pro.f1', 'pricing.pro.f2', 'pricing.pro.f3', 'pricing.pro.f4', 'pricing.pro.f5'],
      popular: true
    },
  ];

  // Todos los planes redirigen a /register
  const handleSubscribe = () => {
    Router.push('/register');
  };

  return (
    <section className="pricing">
      <div className="container">
        <h2>{t('pricing.title')}</h2>

        <div className="toggle">
          <button 
            className={billingCycle === 'month' ? 'active' : ''}
            onClick={() => setBillingCycle('month')}
          >
            {t('pricing.monthly')}
          </button>
          <button 
            className={billingCycle === 'year' ? 'active' : ''}
            onClick={() => setBillingCycle('year')}
          >
            {t('pricing.yearly')}
          </button>
        </div>

        <div className="grid">
          {plans.map((plan) => (
            <div key={plan.id} className={`card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <span className="badge">{t('pricing.popular')}</span>}
              
              <div className="card-content">
                <h3>{t(`pricing.${plan.id}.name`)}</h3>
                <p className="desc">{t(`pricing.${plan.id}.desc`)}</p>
                <div className="price">
                  <span className="amount">{plan.price}CHF</span>
                  <span className="period">/{t('pricing.' + billingCycle)}</span>
                </div>

                <ul className="features">
                  {plan.features.map((feat, i) => (
                    <li key={i}>
                      <span className="check">✓</span> {t(feat)}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className={`btn ${plan.popular ? 'btn-primary' : ''}`}
                onClick={handleSubscribe}
              >
                {plan.id === 'starter' ? t('pricing.subscribe') : t('pricing.subscribe')}
              </button>
            </div>
          ))}
        </div>

        <div className="trial">
          <p>{t('pricing.trial')}</p>
        </div>
      </div>

      <style jsx>{`
        .pricing {
          padding: 80px 20px;
          background: linear-gradient(180deg, #f9f9f9 0%, #f8fcff 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        h2 {
          text-align: center;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 3rem;
          color: #1a1a1a;
        }

        /* TOGGLE BUTTONS */
        .toggle {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 60px;
        }

        .toggle button {
          padding: 10px 32px;
          border: 1.5px solid #d1d9e6;
          background: #fff;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #2d3748;
          border-radius: 8px;
        }

        .toggle button:hover {
          border-color: #7bb3e0;
          background: #f0f7ff;
        }

        .toggle button.active {
          background: #7bb3e0;
          border-color: #7bb3e0;
          color: #fff;
        }

        /* GRID - 3 COLUMNS CENTRADAS */
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          max-width: 1100px;
          margin: 0 auto 60px auto;
        }

        /* CARDS */
        .card {
          background: #fff;
          border: 1px solid #e6edf4;
          border-radius: 16px;
          position: relative;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .card:hover {
          border-color: #7bb3e0;
          box-shadow: 0 12px 28px rgba(123, 179, 224, 0.15);
          transform: translateY(-4px);
        }

        .card.popular {
          border: 2px solid #7bb3e0;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(123, 179, 224, 0.2);
          transform: scale(1.02);
        }

        .card.popular:hover {
          transform: scale(1.02) translateY(-4px);
        }

        .badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #7bb3e0;
          color: #fff;
          font-size: 0.75rem;
          padding: 6px 20px;
          border-radius: 20px;
          font-weight: 600;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(123, 179, 224, 0.3);
          z-index: 10;
          white-space: nowrap;
        }

        .card-content {
          padding: 32px 24px 24px;
          flex: 1;
        }

        h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 12px 0;
          text-align: center;
          color: #1a202c;
        }

        .desc {
          text-align: center;
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .price {
          text-align: center;
          margin: 20px 0 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eef2f6;
        }

        .amount {
          font-size: 1,8rem;
          font-weight: 800;
          color: #47a2ed;
        }

        .period {
          font-size: 0.95rem;
          color: #64748b;
        }

        .features {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.9rem;
        }

        .features li {
          padding: 8px 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .check {
          color: #7bb3e0;
          font-weight: bold;
          font-size: 1.1rem;
          min-width: 20px;
        }

        /* BUTTONS */
        .btn {
          width: calc(100% - 48px);
          margin: 0 24px 28px 24px;
          padding: 14px;
          background: #fff;
          border: 2px solid #7bb3e0;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: #1e4b7a;
          align-self: flex-end;
        }

        .btn:hover {
          background: #e1f0fa;
          border-color: #5a9bcf;
          transform: translateY(-2px);
        }

        .btn-primary {
          background: #7bb3e0;
          color: #fff;
          border: 2px solid #7bb3e0;
        }

        .btn-primary:hover {
          background: #5a9bcf;
          border-color: #5a9bcf;
        }

        /* TRIAL SECTION */
        .trial {
          text-align: center;
          padding: 48px;
          background: linear-gradient(135deg, #e1f0fa 0%, #f0f7ff 100%);
          border-radius: 20px;
          max-width: 800px;
          margin: 0 auto;
        }

        .trial p {
          margin: 0;
          color: #1e4b7a;
          font-size: 1.15rem;
          font-weight: 500;
        }

        /* RESPONSIVE */
        @media (max-width: 968px) {
          .grid {
            gap: 20px;
          }
          
          .card-content {
            padding: 28px 20px 20px;
          }
          
          h3 {
            font-size: 1.3rem;
          }
          
          .amount {
            font-size: 2.4rem;
          }
        }

        @media (max-width: 768px) {
          .pricing {
            padding: 60px 16px;
          }
          
          h2 {
            font-size: 2rem;
            margin-bottom: 2rem;
          }
          
          .toggle {
            margin-bottom: 40px;
          }
          
          .toggle button {
            padding: 8px 24px;
            font-size: 0.9rem;
          }
          
          .grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            gap: 30px;
          }
          
          .card.popular {
            transform: scale(1);
          }
          
          .card.popular:hover {
            transform: translateY(-4px);
          }
          
          .trial {
            padding: 32px 24px;
          }
          
          .trial p {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .card-content {
            padding: 24px 16px 16px;
          }
          
          .btn {
            width: calc(100% - 32px);
            margin: 0 16px 24px 16px;
            padding: 12px;
          }
          
          .amount {
            font-size: 2rem;
          }
          
          h3 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </section>
  );
}