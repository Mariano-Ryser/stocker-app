// components/homeComponents/PricingSection.jsx
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../components/auth/AuthProvider';
import Router from 'next/router';

export default function PricingSection() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState('month');

  const plans = [
    {
      id: 'starter',
      price: billingCycle === 'month' ? 29 : 278,
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
    {
      id: 'enterprise',
         price: billingCycle === 'month' ? 89 : 854,
      priceId: { month: 'price_enterprise_month', year: 'price_enterprise_year' },
      features: ['pricing.enterprise.f1', 'pricing.enterprise.f2', 'pricing.enterprise.f3', 'pricing.enterprise.f4', 'pricing.enterprise.f5',
        //  'pricing.enterprise.f6'
        ]
    }
  ];

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('selectedPlan', JSON.stringify({
        priceId: plan.priceId[billingCycle],
        price: plan.price
      }));
      Router.push('/login?redirect=checkout');
      return;
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId[billingCycle],
          userId: isAuthenticated.userId
        })
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <section className="pricing">
      <div className="container">
        <h2>{t('pricing.title')}</h2>
        {/* <p className="subtitle">{t('pricing.subtitle')}</p> */}

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
            {/* <span className="save">-20%</span> */}
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
                  <span className="amount">{plan.price}€</span>
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

              {/* <button 
                className={`btn ${plan.popular ? 'btn-primary' : ''}`}
               onClick={() => handleSubscribe(plan)}
              >
                {t('pricing.subscribe')}
              </button> */}
            </div>
          ))}
        </div>

        <div className="trial">
          <p>{t('pricing.trial')}</p>
          {/* <button className="trial-btn" onClick={() => Router.push('/register')}>
            {t('pricing.trialBtn')} →
          </button> */}
        </div>
      </div>

      <style jsx>{`
        .pricing {
          padding: 60px 20px;
          background: linear-gradient(180deg, #f9f9f9 0%,  #f8fcff 100%);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        h2 {
          text-align: center;
          font-size: 2rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 5rem;
          color: #1a1a1a;
        }
        .subtitle {
          text-align: center;
          color: #4a5568;
          margin-bottom: 32px;
          font-size: 1.1rem;
        }
        .toggle {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 48px;
        }
        .toggle button {
          padding: 8px 24px;
          border: 1px solid #d1d9e6;
          background: #fff;
          font-size: 0.95rem;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          color: #2d3748;
        }
        .toggle button:hover {
          border-color: #7bb3e0;
          background: #f0f7ff;
        }
        .toggle button.active {
          background: #e1f0fa;
          border-color: #7bb3e0;
          color: #1e4b7a;
          font-weight: 500;
        }
        .save {
          position: absolute;
          top: -20px;
          right: -5px;
          background: #7bb3e0;
          color: #fff;
          font-size: 0.65rem;
          padding: 2px 8px;
          font-weight: 600;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 48px;
        }
        .card {
          background: #fff;
          border: 1px solid #e6edf4;
          position: relative;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(123, 179, 224, 0.05);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .card:hover {
          border-color: #7bb3e0;
          box-shadow: 0 8px 20px rgba(123, 179, 224, 0.15);
          transform: translateY(-2px);
        }
        .card.popular {
          border: 2px solid #7bb3e0;
          background: #ffffff;
          box-shadow: 0 8px 24px rgba(123, 179, 224, 0.2);
        }
        .badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #7bb3e0;
          color: #fff;
          font-size: 0.7rem;
          padding: 4px 16px;
          font-weight: 600;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 8px rgba(123, 179, 224, 0.3);
          z-index: 10;
        }
        .card-content {
          padding: 28px 20px 16px;
          flex: 1;
        }
        h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 12px 0;
          text-align: center;
          color: #1a202c;
        }
        .desc {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 8px;
}
        .price {
          text-align: center;
          margin: 16px 0 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eef2f6;
        }
        .amount {
          font-size: 2.3rem;
          font-weight: 700;
          color: #1e4b7a;
        }
        .period {
          font-size: 0.9rem;
          color: #64748b;
        }
        .features {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.9rem;
        }
        .features li {
          padding: 6px 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .check {
          color: #7bb3e0;
          font-weight: bold;
          font-size: 1.1rem;
        }
        .btn {
          width: calc(100% - 40px);
          margin: 0 20px 24px 20px;
          padding: 12px;
          background: #fff;
          border: 1.5px solid #7bb3e0;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #1e4b7a;
          align-self: flex-end;
        }
        .btn:hover {
          background: #e1f0fa;
          border-color: #5a9bcf;
        }
        .btn-primary {
          background: #7bb3e0;
          color: #fff;
          border: 1.5px solid #7bb3e0;
        }
        .btn-primary:hover {
          background: #5a9bcf;
          border-color: #5a9bcf;
        }
        .trial {
          text-align: center;
          padding: 40px;
          background: #e1f0fa;
        }
        .trial p {
          margin-bottom: 20px;
          color: #1e4b7a;
          font-size: 1.1rem;
        }
        .trial-btn {
          background: none;
          border: none;
          font-size: 1.1rem;
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid #7bb3e0;
          padding-bottom: 4px;
          color: #1e4b7a;
          transition: all 0.2s;
        }
        .trial-btn:hover {
          border-bottom-color: #1e4b7a;
          transform: translateX(4px);
        }
        @media (max-width: 900px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .pricing {
            padding: 40px 16px;
          }
        }
        @media (max-width: 600px) {
          .grid {
            grid-template-columns: 1fr;
            max-width: 320px;
            margin-left: auto;
            margin-right: auto;
          }
          h2 {
            font-size: 1.6rem;
          }
          .subtitle {
            font-size: 1rem;
          }
          .amount {
            font-size: 2rem;
          }
          .trial {
            padding: 30px 20px;
          }
          .card-content {
            padding: 28px 16px 12px;
          }
          .btn {
            width: calc(100% - 32px);
            margin: 0 16px 20px 16px;
          }
        }
      `}</style>
    </section>
  );
}