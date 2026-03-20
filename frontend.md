 /frontend
├─ .next
├─ node_modules
├─ components
│   ├─ dashboard
│   │   ├─ artikel
│   │   │   ├─ ProductCreator.module.css
│   │   │   ├─ ProductCreator.tsx
│   │   │   ├─ ProductEditor.module.css
│   │   │   └─ ProductEditor.tsx
│   │   │    
│   │   ├─ clients
│   │   │   ├─ ClientCreator.js
│   │   │   ├─ ClientCreator.module.css
│   │   │   ├─ ClientEditor.js
│   │   │   └─ ClientEditor.module.css
│   │   │   
│   │   ├─ headerAdmin
│   │   │   ├─ HeaderAdmin.module.css
│   │   │   └─ HeaderAdmin.tsx
│   │   ├─ regnung
│   │   │   ├─ Creator.module.css
│   │   │   ├─ RechnungCreator.js
│   │   │   ├─ RechnungPrint.jsx
│   │   │   ├─ RechnungUpdate.js
│   │   │   └─ Update.module.css
│   │   ├─ sideBar
│   │   │   ├─ IconsHeaderAdmin.tsx
│   │   │   ├─ SideBarAdmin.module.css
│   │   │   └─ sideBarAdmin.tsx
│   │   └─ MapaAlmacen.js
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
│   ├─ useCompany.js
│   ├─ useInfiniteScroll.js
│   ├─ useProducts.js
│   ├─ useSale.js
│   ├─ useStockEntry.js
│   └─ useUser.js
├─ pages
│   ├─ dashboard
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

