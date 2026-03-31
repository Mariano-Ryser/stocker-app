import '../styles/globals.css'
import Head from 'next/head'
import Layout from '../components/Layout'
import SideBar from '../components/dashboard/sideBar/sideBarAdmin'
import { DashboardProvider } from '../contexts/DashboardContext'
import { AuthProvider } from '../components/auth/AuthProvider'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ToastProvider } from '../contexts/ToastContext' // ✅ Agregar import

function MyApp({ Component, pageProps, router }) {
  const isDashboard = router.pathname.startsWith("/dashboard");
  const baseUrl = "https://www.stockercloud.com";

  return (
    <>
      <Head>
        <title>Stocker | Intelligent Inventory Management SaaS</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="Stocker is your SaaS for easy and fast inventory management. Track stock, manage products, and optimize your warehouse with real-time analytics. Try Stocker today." />
        <meta name="robots" content="index, follow" />
              
        {/* Canonical URL */}
        <link rel="canonical" href={baseUrl} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/img/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/img/logo80.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/img/logo80.png" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Stocker – Intelligent Inventory Management SaaS" />
        <meta property="og:description" content="Manage your inventory easily and quickly with Stocker. Real-time tracking, analytics, and optimization tools for your business." />
        <meta property="og:image" content={`${baseUrl}/img/logo80.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Stocker - Inventory Management Dashboard" />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Stocker" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Stocker – Intelligent Inventory Management SaaS" />
        <meta name="twitter:description" content="Manage your inventory easily and quickly with Stocker. Real-time tracking, analytics, and optimization tools." />
        <meta name="twitter:image" content={`${baseUrl}/img/logo80.png`} />
        
          <link rel="alternate" href="https://www.stockercloud.com/de" hreflang="de" />
          <link rel="alternate" href="https://www.stockercloud.com/es" hreflang="es" />
          <link rel="alternate" href="https://www.stockercloud.com" hreflang="en" />


        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Stocker",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "SaaS for easy and fast inventory management with real-time tracking and analytics",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "156"
              },
              "url": baseUrl,
              "sameAs": [
              "https://twitter.com/stockercloud",
             "https://www.linkedin.com/company/stocker"
               ]
            })
          }}
        />
      </Head>
      
      {/* ✅ Envolver toda la aplicación con ToastProvider */}
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider> {/* ✅ ToastProvider envuelve todo */}
            {isDashboard ? (
              <DashboardProvider>
                <SideBar>
                  <Component {...pageProps} />
                </SideBar>
              </DashboardProvider>
            ) : (
              <Layout>
                <Component {...pageProps} />
              </Layout>
            )}
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </>
  )
}

export default MyApp