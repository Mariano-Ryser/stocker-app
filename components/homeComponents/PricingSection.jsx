import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Router from 'next/router';
import { Check, Leaf, TreePine, Star } from 'lucide-react';

export default function PricingSection() {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState('month');

  const plans = [
    {
      id: 'starter',
      icon: <Leaf size={24} />,
      price: billingCycle === 'month' ? 0 : 0,
      priceId: { month: 'price_starter_month', year: 'price_starter_year' },
      features: ['pricing.starter.f1', 'pricing.starter.f2', 'pricing.starter.f3'],
      color: '#d4a373'
    },
    {
      id: 'basic',
      icon: <TreePine size={24} />,
      price: billingCycle === 'month' ? 39 : 374,
      priceId: { month: 'price_basic_month', year: 'price_basic_year' },
      features: ['pricing.basic.f1', 'pricing.basic.f2', 'pricing.basic.f3', 'pricing.basic.f4'],
      color: '#4caf50'
    },
    {
      id: 'pro',
      icon: <Star size={24} />,
      price: billingCycle === 'month' ? 59 : 566,
      priceId: { month: 'price_pro_month', year: 'price_pro_year' },
      features: ['pricing.pro.f1', 'pricing.pro.f2', 'pricing.pro.f3', 'pricing.pro.f4', 'pricing.pro.f5'],
      popular: true,
      color: '#d4a373'
    },
  ];

  const handleSubscribe = () => {
    Router.push('/register');
  };

  return (
    <section className="pricing">
      <div className="container">
        <div className="header">
          <h2>{t('pricing.title')}</h2>
        </div>

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
                <div className="plan-icon" style={{ background: `${plan.color}20`, color: plan.color }}>
                  {plan.icon}
                </div>
                <h3>{t(`pricing.${plan.id}.name`)}</h3>
                <p className="desc">{t(`pricing.${plan.id}.desc`)}</p>
                <div className="price">
                  <span className="amount" style={{ color: plan.color }}>
                    {plan.price === 0 ? '0' : plan.price}CHF
                  </span>
                  <span className="period">/{t('pricing.' + billingCycle)}</span>
                </div>

                <ul className="features">
                  {plan.features.map((feat, i) => (
                    <li key={i}>
                      <span className="check" style={{ color: plan.color }}>
                        <Check size={16} />
                      </span>
                      {t(feat)}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className={`btn ${plan.popular ? 'btn-primary' : ''}`}
                onClick={handleSubscribe}
                style={plan.popular ? {} : { borderColor: plan.color, color: plan.color }}
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
          background: linear-gradient(180deg, #0a0e27 0%, #1a1040 30%, #0d1233 70%, #0a0e27 100%);
          position: relative;
          overflow: hidden;
        }

        .pricing::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(circle at 30% 50%, rgba(212, 163, 115, 0.03) 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(76, 175, 80, 0.03) 0%, transparent 60%);
          pointer-events: none;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .header {
          text-align: center;
          margin-bottom: 60px;
        }

        @keyframes fadePricingIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shineEffect {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .pricing h2 {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 3.2rem;
          font-weight: 700;
          margin-bottom: 16px;
          font-stretch: expanded;
          letter-spacing: 0.05em;
          background: linear-gradient(120deg, #d4a373 30%, #4caf50 50%, #d4a373 60%, #4caf50 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 
            fadePricingIn 0.8s ease-out forwards,
            shineEffect 4.5s ease-in-out 1.5s forwards;
        }

        /* TOGGLE BUTTONS */
        .toggle {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 60px;
          animation: fadePricingIn 0.8s ease-out 0.3s both;
        }

        .toggle button {
          padding: 10px 32px;
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.5);
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .toggle button:hover {
          border-color: rgba(212, 163, 115, 0.3);
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.05);
        }

        .toggle button.active {
          background: linear-gradient(135deg, rgba(212, 163, 115, 0.15), rgba(76, 175, 80, 0.1));
          border-color: #4caf50;
          color: #4caf50;
          box-shadow: 0 4px 20px rgba(76, 175, 80, 0.1);
        }

        /* GRID - 3 COLUMNS */
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          max-width: 1100px;
          margin: 0 auto 60px auto;
          animation: fadePricingIn 0.8s ease-out 0.6s both;
        }

        /* CARDS */
        .card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          position: relative;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .card:hover {
          border-color: rgba(212, 163, 115, 0.2);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          transform: translateY(-6px);
          background: rgba(255, 255, 255, 0.05);
        }

        .card.popular {
          border: 2px solid rgba(76, 175, 80, 0.3);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 30px rgba(76, 175, 80, 0.1);
          transform: scale(1.02);
        }

        .card.popular:hover {
          transform: scale(1.02) translateY(-6px);
          border-color: rgba(76, 175, 80, 0.5);
          box-shadow: 0 20px 50px rgba(76, 175, 80, 0.15);
        }

        .badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #4caf50, #388e3c);
          color: #fff;
          font-size: 0.7rem;
          padding: 6px 20px;
          border-radius: 20px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
          z-index: 10;
          white-space: nowrap;
        }

        .card-content {
          padding: 32px 24px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .plan-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          transition: transform 0.3s ease;
        }

        .card:hover .plan-icon {
          transform: scale(1.05) rotate(-3deg);
        }

        h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 12px 0;
          text-align: center;
          color: #d4a373;
        }

        .desc {
          text-align: center;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .price {
          text-align: center;
          margin: 16px 0 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .amount {
          font-size: 2.8rem;
          font-weight: 800;
          color: #d4a373;
        }

        .period {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.3);
        }

        .features {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
          font-size: 0.9rem;
          flex: 1;
        }

        .features li {
          padding: 8px 0;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .check {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          font-weight: bold;
          font-size: 1.1rem;
        }

        /* BUTTONS */
        .btn {
          width: calc(100% - 48px);
          margin: 0 24px 24px 24px;
          padding: 14px;
          background: transparent;
          border: 2px solid #d4a373;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #d4a373;
          align-self: flex-end;
        }

        .btn:hover {
          background: rgba(212, 163, 115, 0.08);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(212, 163, 115, 0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, #4caf50, #388e3c);
          color: #fff;
          border: 2px solid #4caf50;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #43a047, #2e7d32);
          border-color: #43a047;
          box-shadow: 0 8px 25px rgba(76, 175, 80, 0.2);
        }

        /* TRIAL SECTION */
        .trial {
          text-align: center;
          padding: 48px;
          background: linear-gradient(135deg, rgba(212, 163, 115, 0.05), rgba(76, 175, 80, 0.05));
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          max-width: 800px;
          margin: 0 auto;
          animation: fadePricingIn 0.8s ease-out 0.9s both;
          transition: all 0.3s ease;
        }

        .trial:hover {
          border-color: rgba(212, 163, 115, 0.1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .trial p {
          margin: 0;
          color: rgba(255, 255, 255, 0.5);
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
          
          .pricing h2 {
            font-size: 2.4rem;
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
            transform: translateY(-6px);
          }
          
          .trial {
            padding: 32px 24px;
          }
          
          .trial p {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .pricing h2 {
            font-size: 2rem;
          }

          .card-content {
            padding: 24px 16px 16px;
          }
          
          .btn {
            width: calc(100% - 32px);
            margin: 0 16px 20px 16px;
            padding: 12px;
          }
          
          .amount {
            font-size: 2rem;
          }
          
          h3 {
            font-size: 1.2rem;
          }

          .plan-icon {
            width: 48px;
            height: 48px;
          }

          .plan-icon svg {
            width: 20px;
            height: 20px;
          }

          .toggle button {
            padding: 6px 18px;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 400px) {
          .pricing h2 {
            font-size: 1.6rem;
          }

          .features li {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </section>
  );
}