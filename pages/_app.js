import '../styles/globals.css'
import Head from 'next/head'
import Layout from '../components/Layout'
import SideBar from '../components/dashboard/sideBar/sideBarAdmin'
import { DashboardProvider } from '../contexts/DashboardContext'
import { AuthProvider } from '../components/auth/AuthProvider'
import { LanguageProvider } from '../contexts/LanguageContext'

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
        <meta name="keywords" content="
Stocker, Stocker SaaS, inventory management, stock control, inventory software, warehouse management, 
inventory tracking, business inventory, stock app, SaaS inventory, product management software, 
digital inventory management, inventory system, stock management software, small business inventory,
logistics software, stock control app, inventory control system, stock tracking, inventory planning,
warehouse inventory, inventory dashboard, stock monitoring, stock management tool, inventory optimization,

Bestandskontrolle, Inventarverwaltung, Software für Inventar, Lagerverwaltung, Bestandsmanagement, Lagersoftware, 
Lagerbestandskontrolle, Inventar-App, Lagerverwaltungssystem, SaaS Inventar, Produktverwaltung Software, Bestandsanalyse, 
Lageroptimierung, Lagerüberwachung, Inventarkontrolle, Bestandsplanung, Lagerberichte, Lagerdashboard, digitale Bestandsverwaltung, 

control de stock, gestión de inventarios, software de inventario, gestión de almacén, inventario, control de inventario, 
aplicación de inventario, software para empresas, gestión de productos, seguimiento de inventario, optimización de stock, 
informes de inventario, dashboard de inventario, gestión digital de inventario, sistema de inventario, herramienta de inventario
" />
        {/* Canonical URL */}
        <link rel="canonical" href={baseUrl} />
        <link rel="icon" href="/img/favicon.ico" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Stocker – Intelligent Inventory Management SaaS" />
        <meta property="og:description" content="Manage your inventory easily and quickly with Stocker. Real-time tracking, analytics, and optimization tools for your business." />
        <meta property="og:image" content={`${baseUrl}/img/logo80.webp`} />
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
        <meta name="twitter:image" content={`${baseUrl}/img/logo80.webp`} />
        
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
              // "sameAs": [
              //   "https://twitter.com/stockercloud",
              //   "https://www.linkedin.com/company/stocker"
              // ]
            })
          }}
        />
      </Head>
      
      <AuthProvider>
        <LanguageProvider>
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
        </LanguageProvider>
      </AuthProvider>
    </>
  )
}

export default MyApp