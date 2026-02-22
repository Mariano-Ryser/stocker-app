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

## 🛠️ Add Language
If you wish , you will need to edit the following files. to add a new language

// backend/modules/user/user.model.js
language: {
  type: String,
  enum: [
    'en', 'de', 'es' ,etc... <- Add new
  ],
  default: 'en'
},
//frontend/contexts/LanguageContext.js
const languageOptions = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

add the .json files to frontend/locales
example = de.json
 "settings": {
    "title": "Einstellungen",
  },



```bash
https://github.com/Mariano-Ryser/LZ-Front.git
cd lz-lager
npm install
npm run dev


Konstruktive Kritik ist immer willkommen. =D

medida cel 380 x 700

° Mariano Ryser


# {{}}
# PreloadDashboard.jsx
Es un componente que renderiza las paginas apenas entras al Dashboard principal admindDash/index.js , el cual esta ahi mismo importado y utilizado con un useEffect.


/frontend
├─ .next
├─ node_modules
├─ components
│   ├─ auth
│   │   ├─ AuthProvider.js
│   │   ├─ ProtectedRoute.js
│   │   └─ withAdminAuth.js
│   ├─ dashboard
│   │   ├─ DashboardLayout.mocule.css
│   │   └─ DashboardLayout.js
│   ├─ header
│   │   ├─ Header.module.css
│   │   └─ Header.tsx
│   ├─ homeComponents
│   │   ├─ CTASection.tsx
│   │   ├─ FeaturesSection.tsx
│   │   ├─ Foter.tsx
│   │   ├─ HomeHero.tsx
│   │   ├─ ShowcaseSection.tsx.tsx
│   │   └─ TrustedBySection.tsx
│   ├─ icons
│   │   └─ DashboardIcons.js
│   ├─ medium
│   ├─ premium
│   │   ├─ PerformanceMetrics.module.css
│   │   ├─ PerformanceMetrics.tsx
│   │   ├─ PremiumFeatures.js
│   │   ├─ QuickStarts.module.css
│   │   ├─ QuickStarts.tsx
│   │   ├─ SalesChart.module.css
│   │   └─ salesChart.tsx
│   ├─ shared
│   │   └─ LoadMoreTrigger.js
│   ├─ ui
│   │   ├─ ExcelImportExport.js
│   │   ├─ ExcelTemplate.js
│   │   ├─ ExportExcelButton.js
│   │   └─ LogoutButton.tsx
│   ├─ Layout.js
│   ├─ MapaAlmacen.js
│   └─ Skeleton.js
│
├─ hooks
│   ├─ useApi.js
│   ├─ useClients.js
│   ├─ useInfiniteScroll.js
│   ├─ useProducts.js
│   ├─ useSale.js
│   └─ useUser.js
│       
├─ pages
│   ├─ adminDash
│   │   ├─ artikel
│   │   │    ├─ components
│   │   │    │    ├─ ProductCreator.module.css
│   │   │    │    ├─ ProductCreator.tsx
│   │   │    │    ├─ ProductEditor.module.css
│   │   │    │    └─ ProductEditor.tsx
│   │   │    ├─ index.module.css
│   │   │    └─ index.tsx
│   │   ├─ CEO
│   │   │    ├─ components
│   │   │    │    ├─ UserEditModal.module.css
│   │   │    │    └─ UserEditModal.tsx
│   │   │    ├─ ceoDashboard.module.css
│   │   │    └─ index.tsx
│   │   ├─ clients
│   │   │    ├─ components
│   │   │    │    ├─ ClientCreator.js
│   │   │    │    └─ ClientEditor.tsx
│   │   │    ├─ clients.module.css
│   │   │    └─ index.tsx
│   │   ├─ importExport
│   │   │    └─ index.tsx
│   │   ├─ regnung
│   │   │    ├─ components
│   │   │    │    ├─ Creator.module.css
│   │   │    │    ├─ RechnungCreator.js
│   │   │    │    ├─ RechnungPrint.js
│   │   │    │    ├─ RechnungUpdate.js
│   │   │    │    └─ Update.module.css
│   │   │    ├─ index.tsx
│   │   │    └─ SalesPage.module.css
│   │   ├─ scanner
│   │   │    ├─ index.tsx
│   │   │    └─ ScannerSalesPage.module.css
│   │   ├─ settings
│   │   │    ├─ components
│   │   │    │    └─ SettingsComponent.tsx
│   │   │    ├─ index.js
│   │   │    └─ settings.module.css
│   │   ├─ verkauftteArtikel
│   │   │    ├─ index.tsx
│   │   │    └─ verkaufteArtikel.module.css
│   │   ├─ DashboardHome.module.css
│   │   └─ index.tsx
│   ├─ api
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
│   │   └─ register.module.css
│   ├─ _app.js
│   ├─ _document.js
│   └─ index.tsx
│
├─ public
│
├─ services
│    ├─ bulkImportService.js
│    ├─ clientService.js
│    ├─ productService.js
│    ├─ saleService.js
│    └─ userService.js
├─ styles
│
├─ utils
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




