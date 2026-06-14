# ⚡️ LZ LAGER – Die Artikelsuchmaschine für Lager-Ninjas 🧠📦

## 🚀 Was ist LZ LAGER?

Im Labyrinth der Logistik, wo verlorene Artikel zu Legenden werden und Effizienz oft nur ein Gerücht ist, kommt **LZ LAGER** ins Spiel – ein blitzschnelles, präzises und skalierbares Tool zur Artikelsuche in komplexen Lagerumgebungen.

Keine Geisterpaletten mehr. Keine rätselhaften Regale. Nur Ergebnisse.**

 🧰 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) – Modular, modern und bereit für alles.
- **Backend**: [Node Js - Azure Functions](https://azure.microsoft.com/en-us/services/functions/) – Skalierbar, serverless und kampferprobt.
- **Datenbank**: [MongoDB](https://www.mongodb.com/) – NoSQL, weil Lagerlogik nicht relational ist.
- **Hosting**: Azure / Vercel (je nach Einsatzzweck)

## 🎯 Features

- 🔍 **Ultraschnelle Artikelsuche** – Keine Wartezeiten, kein Frust.
- 🤖 **Intelligente Filterlogik** – Nur relevante Resultate.
- 📦 **Lagerintegration** – Bereit für Scanner, Sensoren, APIs.
- 🧱 **Modular aufgebaut** – Leicht erweiterbar für neue Lagerzonen, neue Anforderungen.
- 🧠 **UX mit Gehirn** – Minimale kognitive Belastung, maximale Klarheit.
- 🧩 **Skalierbar & rückverfolgbar** – Von kleinen Regalen bis hin zu Mega-Hubs.

## 🛠️ Setup & Installation

.env-example -> NEXT_PUBLIC_BACKEND_URL=

```bash
https://github.com/Mariano-Ryser/LZ-Front.git
cd lz-lager
npm install
npm run dev


Konstruktive Kritik ist immer willkommen. =D

medida cel 380 x 700

° Mariano Ryser


# {{}}

/backend
├─.github
├─ config
│   ├─ azureStorage.js
│   └─ imageCompression.js
├─ db
│   └─ index.js //conexion a mongoDb
├─ middleware
│   ├─ auth.js
│   ├─ corsMiddleware.js
│   ├─ multer.product.js
│   ├─ multer.user.js
│   ├─ rateLimitMiddleware.js
│   └─ upload.js
├─ modules
│   ├─ client
│   │   ├─ client.controller.js
│   │   ├─ client.model.js
│   │   └─ client.routes.js
│   ├─ company
│   │   ├─ company.controller.js
│   │   ├─ company.model.js
│   │   └─ company.routes.js
│   ├─ product
│   │   ├─ product.controller.js
│   │   ├─ product.model.js
│   │   └─ product.routes.js
│   ├─ sale
│   │   ├─ sale.controller.js
│   │   ├─ sale.model.js
│   │   └─ sale.routes.js
│   ├─ stockMovement
│   │   ├─ stockMovement.controller.js
│   │   ├─ stockMovement.model.js
│   │   └─ stockMovement.routes.js
│   └─ user
│       ├─ user.controller.js
│       ├─ user.model.js
│       └─ user.routes.js
├─ node_modules
├─ public
│   └─ index.html
├─ services
│   └─ emailService.js
├─ .env
├─ .gitignore
├─ app.js
├─ package-lock.json
└─ package.json


/frontend
├─ .next
├─ node_modules
├─ components
│   ├─ auth
│   │   ├─ AuthProvider.js
│   │   ├─ ProtectedRoute.js
│   │   └─ withAdminAuth.js
│   ├─ dashboard
│   │   ├─ artikel
│   │   ├─ CEO
│   │   ├─ clients
│   │   ├─ headerAdmin
│   │   ├─ limitProduct
│   │   ├─ movements
│   │   ├─ regnung
│   │   ├─ scanner
│   │   ├─ settings
│   │   └─ sideBar
│   ├─ footer
│   │   ├─ Footer.module.css
│   │   └─ Footer.tsx
│   ├─ header
│   │   ├─ Header.module.css
│   │   └─ Header.tsx
│   ├─ homeComponents
│   │   ├─ CTASection.tsx
│   │   ├─ FeaturesSection.tsx
│   │   ├─ HomeHero.tsx
│   │   ├─ PricingSection.tsx
│   │   ├─ TechCarrousel.js
│   │   └─ TestimonialsSection.tsx
│   ├─ icons
│   │   └─ DashboardIcons.js
│   ├─ LanguageSelector
│   │   ├─ LenguageSelector.js
│   │   └─ LenguageSelector.module.css
│   ├─ medium
│   ├─ premium
│   │   ├─ PremiumFeatures.js
│   │   ├─ QuickStarts.module.css
│   │   ├─ QuickStarts.tsx
│   │   ├─ SalesChart.module.css
│   │   └─ salesChart.tsx
│   ├─ shared
│   │   ├─ LoadMoreTrigger.js
│   │   ├─ Pagination.module.css
│   │   ├─ Pagination.tsx
│   │   ├─ Toast.tsx
│   │   └─ Toast.module.css
│   ├─ skeletons
│   │   ├─ rechnungCreatorSkeleton.module.css
│   │   ├─ rechnungCreatorSkeleton.tsx
│   │   ├─ salesChartSkeleton.module.css
│   │   └─ salesChartSkeleton.tsx
│   ├─ ui
│   │   ├─ ExcelImportExport.js
│   │   ├─ ExcelTemplate.js
│   │   ├─ ExcelTemplate.module.css
│   │   ├─ ExportExcelButton.js
│   │   ├─ logo.tsx
│   │   ├─ LogoutButton.tsx
│   │   ├─ SplashScreen.module.css
│   │   └─ SplashScreen.tsx
│   ├─ Layout.js
│   └─ Skeleton.js
├─ contexts
│   ├─ DashboardContext.js
│   ├─ LanguageContext.js
│   └─ ToastContext.jsx
├─ hooks
│   ├─ bulkImportService.js
│   ├─ useAllSales.js
│   ├─ useApi.js
│   ├─ useBarcodeExporter.js
│   ├─ useCEOData.js
│   ├─ useClients.js
│   ├─ useClientsPaginated.js
│   ├─ useCompany.js
│   ├─ useCompanyCleanup.js
│   ├─ useInfiniteScroll.js
│   ├─ useProducts.js
│   ├─ useSales.js
│   ├─ useSalesForImport.js
│   ├─ useStockEntry.js
│   ├─ useStockMovements.js
│   ├─ useUserDetails.js
│   └─ useUser.js
├─ locales
│   ├─ de
│   │   ├─ artikel.js
│   │   ├─ homeHero.js
│   │   ├─ index.js
│   │   └─ etc....
│   ├─ en
│   │   ├─ artikel.js
│   │   ├─ homeHero.js
│   │   ├─ index.js
│   │   └─ etc...
│   └─ es
│       ├─ artikel.js
│       ├─ homeHero.js
│       ├─ index.js
│       └─ etc...
├─ pages
│   ├─ dashboard
│   │   ├─ artikel
│   │   │    ├─ listProduct.module.css
│   │   │    └─ index.tsx
│   │   ├─ CEO
│   │   │    ├─ ceoDashboard.module.css
│   │   │    └─ index.tsx
│   │   ├─ clients
│   │   │    ├─ clients.module.css
│   │   │    └─ index.tsx
│   │   ├─ code
│   │   │    ├─ code.module.css
│   │   │    └─ index.tsx
│   │   ├─ importExport
│   │   │    ├─ importExportPage.module.css
│   │   │    └─ index.tsx
│   │   ├─ importExport
│   │   │    ├─ register.module.css
│   │   │    └─ index.tsx
│   │   ├─ regnung
│   │   │    ├─ index.tsx
│   │   │    └─ SalesPage.module.css
│   │   ├─ salesChart
│   │   │    └─ index.tsx
│   │   ├─ scanner
│   │   │    ├─ index.tsx
│   │   │    └─ ScannerSalesPage.module.css
│   │   ├─ settings
│   │   │    ├─ index.js
│   │   │    └─ settings.module.css
│   │   ├─ stockMovements
│   │   │    ├─ index.js
│   │   │    └─ stockMovements.module.css
│   │   ├─ verkauftteArtikel
│   │   │    ├─ index.tsx
│   │   │    └─ verkaufteArtikel.module.css
│   │   ├─ wareneigang
│   │   │    ├─ index.tsx
│   │   │    └─ verkaufteArtikel.module.css
│   │   ├─ DashboardHome.module.css
│   │   └─ index.tsx
│   ├─ forgot-password
│   │   ├─ fortgor-password.module.css
│   │   └─ index.tsx
│   ├─ informativePages
│   │   ├─ privacyPage.js
│   │   ├─ privacyPage.module.css
│   │   ├─ termsPage.js
│   │   ├─ uberUns.module.css
│   │   └─ uberUns.tsx.js
│   ├─ login
│   │   ├─ index.tsx
│   │   └─ login.module.css
│   ├─ register
│   │   ├─ index.tsx
│   │   ├─ register.module.css
│   │   ├─ verify-email.module,css
│   │   └─ verify.email.tsx
│   ├─ reset-password
│   │   ├─ [token].tsx
│   │   └─ reset-password.module.css
│   ├─ _app.js
│   ├─ _document.js
│   └─ index.tsx
│
├─ public
│
├─ services
│    ├─ bulkImportService.js
│    ├─ bulkImportSalesService.js
│    ├─ bulkImportService.js
│    ├─ clientService.js
│    ├─ companyCleanupService.js
│    ├─ companyService.js
│    ├─ limitsService.js
│    ├─ productService.js
│    ├─ saleService.js
│    ├─ scannerCacheSercice.js
│    ├─ stockMovementService.js
│    └─ userService.js
├─ styles
│
├─ utils
│   ├─ countryConfig.js
│   ├─ formatters.js
│   └─ loader.js
├─ .env
├─ .env-example
├─ eslint.json
├─ .gitignore
├─ next-env.d.js
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ README.md
└─ styled-jsx.d.ts





