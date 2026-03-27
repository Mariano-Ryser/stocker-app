// index.tsx - VERSIÓN CORREGIDA
import { useEffect, useState } from 'react';
import { preloadPublicPagesOnce }  from '../PreloadPublicPages';
import HomeHero from '../components/homeComponents/HomeHero';
import FeaturesSection from '../components/homeComponents/FeaturesSection';
import CTASection from '../components/homeComponents/CTASection';
import Footer from '../components/footer/Footer';
import TechCarrousel from '../components/homeComponents/TechCarrousel'
import TestimonialsSection from '../components/homeComponents/TestimonialsSection';
import PricingSection from '../components/homeComponents/PricingSection';
import FAQSection from '../components/homeComponents/FAQSection';
import { useLanguage } from '../contexts/LanguageContext';


export default function Home() {
  useEffect(()=>{
    preloadPublicPagesOnce()},
    [])
  const { t } = useLanguage();
  return ( 
    <>  
      <HomeHero />
      <FeaturesSection /> 
     {/* <TestimonialsSection />  */}
      <PricingSection /> 
      <TechCarrousel />
      <CTASection />
     {/* <FAQSection />  */}
     <div className="about-page">
        <div className="container">
          <h2>{t('home.title')}</h2>
          <p>{t('home.p')}</p>
        </div>
      </div>
      <Footer />
      <style jsx>{`
        .privacy-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -2;
          overflow: hidden;
        }
         .logo-watermark {
           position: absolute;
          top: 56%;
          left: 80%;
          transform: translate(-50%, -50%);
          opacity: 10%;
          width: 400px;
          height: 400px;
          z-index: -2;
          mask-image: linear-gradient(black 60% , transparent);
        }
        .watermark-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: grayscale(0%);
        }
        .about-page {
          padding: 2rem;
          background-color: #f9f9f9;
        }
        .about-page .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .about-page h1 {
          font-size: 3.5rem;
          margin-bottom: 20px;
          text-align: center;
        }
        .about-page h2 {
          font-size: 2rem;
          margin-top: 40px;
          margin-bottom: 20px;
        }
        .about-page p {
          font-size: 1.3rem;
          line-height: 1.6; 
          margin-bottom: 20px;
        }
        .about-page ul {
          list-style-type: disc;
          padding-left: 20px;
        } 
        .about-page ul li {
          margin-bottom: 10px;
          font-size: 1.1rem;
        }
        @media (max-width: 768px) {
          .about-page {
            padding: 20px 0;
          } 
          .container h2 {  
            font-size: 1rem;
          }
         .container p {  
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  )
}