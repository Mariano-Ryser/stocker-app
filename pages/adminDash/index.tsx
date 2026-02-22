// pages/adminDash/index.tsx
import {preloadDashboardOnce} from '../../PreloadDashboard'
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import { useRouter } from "next/router";
import { useProduct } from "../../hooks/useProducts";
import { useClients } from "../../hooks/useClients";
import { useSales } from "../../hooks/useSales";
import { useDashboard } from "../../contexts/DashboardContext";
import LogoutButton from "../../components/ui/LogoutButton";
import QuickStats from "../../components/premium/QuickStats";
import PremiumSalesChart from '../../components/premium/salesChart';
import { IconBox, IconUsers, IconInvoice, IconChart } from '../../components/icons/DashboardIcons';
import styles from './DashboardHome.module.css';

// Importar tipos desde el archivo compartido
import { User, Sale } from '../../types';

export default function DashboardHome() {
  useEffect(()=>{
    preloadDashboardOnce()
  },[])

  const { user, isAuthenticated, loading: authLoading } = useAuth() as { 
    user: User | null; 
    isAuthenticated: boolean; 
    loading: boolean 
  };

  const router = useRouter();
  // Hook para manejo coordinado de refresh
  const { refreshAllData: coordinatedRefresh, isRefreshing } = useDashboard();

  // Inicializar hooks
  const {
    products,
    loading: productsLoading, 
    refreshProducts, 
    totalProducts, 
  } = useProduct();
  
  // Solo necesitamos stats de clientes, no la lista completa
  const { 
    clientsStats,
    loading: clientsLoading, 
    refreshClients,
  } = useClients();

  const { 
    sales,
    loading: salesLoading, 
    refreshSales, 
    salesStats,
  } = useSales();

  // Estado para estadísticas
  const [stats, setStats] = useState({
    produkte: 0,
    kunden: 0,
    verkäufe: 0,
    umsatz: 0,
    durchschnitt: 0,
    cancelledCount: 0,
    pendingCount: 0
  });

  // Estado para saber si es la carga inicial
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ✅ Función optimizada para refrescar todos los datos
  const handleRefreshAllData = useCallback(async () => {
    console.log("Dashboard: Manual refresh triggered");
    await coordinatedRefresh([refreshProducts, refreshClients, refreshSales]);
  }, [coordinatedRefresh, refreshProducts, refreshClients, refreshSales]);

  // ✅ Efecto para actualizar stats cuando TODOS los datos estén listos
  useEffect(() => {
    const allDataLoaded = !productsLoading && !clientsLoading && !salesLoading;
    const hasData = isAuthenticated && allDataLoaded;
    
    if (hasData) {
      console.log("Dashboard: All data loaded, updating stats");
      setStats({
        produkte: totalProducts || 0,
        kunden: clientsStats?.total || 0, // Usar stats del backend
        verkäufe: salesStats.paidCount || 0,
        umsatz: salesStats.totalUmsatz || 0,
        durchschnitt: salesStats.durchschnitt || 0,
        cancelledCount: salesStats.cancelledCount || 0,
        pendingCount: salesStats.pendingCount || 0
      });
      
      // Marcar que la carga inicial terminó
      if (isInitialLoad) {
        setIsInitialLoad(false);
        console.log("Dashboard: Initial load complete");
      }
    }
  }, [
    totalProducts, 
    clientsStats,
    salesStats, 
    isAuthenticated, 
    productsLoading, 
    clientsLoading, 
    salesLoading,
    isInitialLoad
  ]);

  // ✅ Efecto para redirección si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // ✅ Efecto para manejar eventos globales (broadcast)
  useEffect(() => {
    if (!isAuthenticated) return;

    let broadcastChannel: BroadcastChannel | null = null;
    
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('sales_updates');
      broadcastChannel.onmessage = (event) => {
        if (event.data === 'new_sale' || event.data === 'data_updated') {
          console.log("Dashboard: Broadcast received, refreshing data");
          handleRefreshAllData();
        }
      };
    }

    // Opcional: Refrescar al volver al dashboard
    const handleRouteChange = (url: string) => {
      if (url === '/adminDash' || url === '/') {
        console.log("Dashboard: Route changed to dashboard, refreshing");
        handleRefreshAllData();
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [isAuthenticated, router, handleRefreshAllData]);

  // ✅ Formatear datos para display
  const formatted = useMemo(() => {
    return {
      produkte: stats.produkte.toLocaleString("de-DE"),
      kunden: stats.kunden.toLocaleString("de-DE"),
      verkaeufe: stats.verkäufe.toLocaleString("de-DE"),
      umsatz: stats.umsatz.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
      durchschnitt: stats.durchschnitt.toLocaleString("de-DE", { style: "currency", currency: "EUR" }),
      cancelled: stats.cancelledCount.toLocaleString("de-DE"),
      pending: stats.pendingCount.toLocaleString("de-DE")
    };
  }, [stats]);

  // ✅ Loading state
  if (authLoading || (isInitialLoad && (productsLoading || clientsLoading || salesLoading))) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <p>Dashboard wird geladen...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const allLoading = isRefreshing || productsLoading || clientsLoading || salesLoading;
  const isPremiumUser = user.plan === 'premium' || user.plan === 'pro' || user.role === 'admin' || user.role === 'ceo';

  return (
    
      <div className={styles.dashboardContainer}>
        
        {/* Header Section */}
        {/* <header className={styles.headerSection}>
          <div className={styles.headerContent}>
            <h1 className={styles.welcomeTitle}>
             {t('index.welcome')} <span className={styles.highlight}>{user.name}</span>
            </h1>
             
            <p className={styles.welcomeSubtitle}>
              {user.company || "Management Dashboard"} &bull; Überblick
              <button 
                className={styles.refreshButton}
                onClick={handleRefreshAllData}
                disabled={allLoading}
                title="Daten aktualisieren"
              >
                {allLoading ? '⏳' : '🔄'} Aktualisieren
              </button>
            </p>
          </div>

          <button
            className={styles.ctaButton}
            onClick={() => router.push("/adminDash/regnung")}
            aria-label="Tagesbericht öffnen"
          >
            <IconChart className={styles.btnIcon} />
            Tagesbericht
          </button>
        </header>

        */}
        {/* Premium Analytics Section - Solo para usuarios premium */}

        {/* {isPremiumUser && (
          <section className={styles.premiumSection}>
            <div className={styles.premiumSectionHeader}>
              <h2 className={styles.premiumSectionTitle}>
                <span className={styles.premiumBadge}>PREMIUM</span>
                Analytics Dashboard
              </h2>
              <p className={styles.premiumSectionSubtitle}>
                Erweiterte Statistiken und Einblicke für Premium-Benutzer
              </p>
            </div>
            <PremiumSalesChart 
              sales={sales as Sale[]}
              loading={salesLoading}
            /> 
             <QuickStats 
              sales={sales as Sale[]}
              loading={salesLoading}
            />
          </section>
        )} */}

        {/* Main Layout Grid */}
        <div className={styles.mainLayout}>
          
          {/* Left Column - Quick Actions */}
          <div className={styles.leftColumn}>
            <section className={`${styles.card} ${styles.actionSection}`}>
              {/* <div className={styles.cardHeader}>
                <h2>settings</h2>
                <p>Häufig genutzte Funktiones</p>
              </div> */}

              <div className={styles.actionsGrid}>
                
                <button className={styles.actionItem} onClick={() => router.push("/adminDash/scanner")}>
                  <div className={styles.actionIconBox}>
                    <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none">
                      <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7M17 3H19C20.1046 3 21 3.89543 21 5V7M21 17V19C21 20.1046 20.1046 21 19 21H17M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.actionDetails}>
                    <strong>Scanner</strong>
                    <small>Barcode Scan</small>
                  </div>
                </button>

                <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/adminDash/artikel")}>
                  <div className={styles.actionIconBox}>
                    <svg viewBox="0 0 24 24" className={styles.svgIcon}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className={styles.actionDetails}>
                    <strong>Produkt </strong>
                    <small>Neu erfassen</small>
                  </div>
                </button>
 
                <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/adminDash/clients")}>
                  <div className={styles.actionIconBox}>
                    <IconUsers className={styles.svgIcon} />
                  </div>
                  <div className={styles.actionDetails}>
                    <strong>Kunden</strong>
                    <small>Verwalten</small>
                  </div>
                </button>

                <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/adminDash/regnung")}>
                  <div className={styles.actionIconBox}>
                    <IconInvoice className={styles.svgIcon} />
                  </div>
                  <div className={styles.actionDetails}>
                    <strong>Rechnung</strong>
                    <small>Verkauf</small>
                  </div>
                </button>
                
                

                {isPremiumUser && (
                  <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/adminDash/importExport")}>
                    <div className={styles.actionIconBox}>
                      <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 13H8" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 17H8" stroke="currentColor" strokeWidth="2"/>
                        <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className={styles.actionDetails}>
                      <strong>Import/Export</strong>
                      <small>Excel</small>
                    </div>
                  </button>
                )}

                <button className={styles.actionItem} onClick={() => router.push("/adminDash/verkaufteArtikel")}>
                  <div className={styles.actionIconBox}>
                    <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className={styles.actionDetails}>
                    <strong>Verkaufte Artikel</strong>
                    <small>Übersicht</small>
                  </div>
                </button>

               <button className={styles.actionItem} onClick={() => router.push("/adminDash/code")}>
  <div className={styles.actionIconBox}>
    <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Código de barras principal */}
      <rect x="4" y="6" width="2" height="15" fill="currentColor" rx="0.5" />
      <rect x="7" y="6" width="3" height="15" fill="currentColor" rx="0.5" />
      <rect x="11" y="6" width="1.5" height="15" fill="currentColor" rx="0.3" />
      <rect x="13.5" y="6" width="2.5" height="15" fill="currentColor" rx="0.5" />
      <rect x="17" y="6" width="1" height="15" fill="currentColor" rx="0.3" />
      <rect x="19" y="6" width="2" height="15" fill="currentColor" rx="0.5" />
      
   </svg>
  </div>
  <div className={styles.actionDetails}>
    <strong>Barcode Creator</strong>
    <small>codebar</small>
  </div>
</button>

                
              </div>
            </section>

            
          </div>

          {/* Right Column - Profile & Info */}
          <aside className={styles.sidebarColumn}>
            <div className={`${styles.card} ${styles.profileCard}`}>
              <div className={styles.profileHeader}>
                <div className={styles.avatar}>
                  <span>{user.name.charAt(0)}</span>
                </div>
                <div className={styles.profileText}>
                  <h3>{user.name}</h3>
                  <span className={`${styles.roleBadge} ${styles[user.plan]}`}>
                    {user.plan === "basic" ? "Basic" : // si es "basic", mostrar "Basic" los 2 puntos significan "si no"
                     user.plan === "medium" ? "Medium" :  // si es "medium", mostrar "Medium"
                     user.plan === "pro" ? "Pro" : "Basic"
                     }    

                  </span>
                </div>
              </div>

              <div className={styles.profileDetails}>
                <div className={styles.detailRow}>
                  <span>Email:</span>
                  <span className={styles.detailVal}>{user.email}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Datum:</span>
                  <span className={styles.detailVal}>{new Date().toLocaleDateString("de-DE")}</span>
                </div>
                <div className={styles.detailRow}>
                  <span>Verkäufe:</span>
                  <span className={styles.detailVal}>
                    {formatted.verkaeufe} bezahlt
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span>Benutzer-ID:</span>
                  <span className={styles.detailVal}>{user._id?.substring(0, 8)}...</span>
                </div>
              </div>

              <div className={styles.logoutWrapper}>
                <LogoutButton />
              </div>
            </div>

            {/* Recent Activity / Tips */}
            <div className={`${styles.card} ${styles.tipsCard}`}>
              <h3>💡 Tipps & Hinweise</h3>
              <ul className={styles.tipsList}>
                <li>Verwende den Scanner für schnelle Verkäufe</li>
                <li>Exportiere regelmäßig deine datos</li>
                <li>Überprüfe die Verkaufsstatistiken monatlich</li>
                {!isPremiumUser && (
                  <li>
                    <strong>Upgrade auf Premium</strong> für erweiterte Analytics
                    <button 
                      className={styles.upgradeButton}
                      onClick={() => router.push("/settings")}
                    >
                      Jetzt upgraden
                    </button>
                  </li>
                )}
              </ul>
            </div>
             {/* Stats Grid */}
        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.blue}`}>
              <IconBox className={styles.icon} />
            </div>
            <div className={styles.statInfo} onClick={() => router.push('./adminDash/artikel')}>
              <h3>Produkte</h3>
              <p className={styles.statValue}>{allLoading ? "..." : formatted.produkte}</p>
              <span className={styles.statLabel}>Im Inventar</span>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.purple}`}>
              <IconUsers className={styles.icon} />
            </div>
            <div className={styles.statInfo} onClick={() => router.push('./adminDash/clients')}>
              <h3>Kunden</h3>
              <p className={styles.statValue}>{allLoading ? "..." : formatted.kunden}</p>
              <span className={styles.statLabel}>Aktive Profile</span>
            </div>
          </article>

          <article className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${styles.orange}`}>
              <IconInvoice className={styles.icon} />
            </div>
            <div className={styles.statInfo} onClick={() => router.push('./adminDash/regnung')}>
              <h3>Verkäufe</h3>
              <p className={styles.statValue}>{allLoading ? "..." : formatted.verkaeufe}</p>
              <span className={styles.statLabel}>Bezahlte Verkäufe</span>
              <div className={styles.extraInfo}>
                {stats.pendingCount > 0 && (
                  <span className={styles.pendingInfo}>{formatted.pending} ausstehend</span>
                )}
                {stats.cancelledCount > 0 && (
                  <span className={styles.cancelledInfo}>{formatted.cancelled} storniert</span>
                )}
              </div>
            </div>
          </article>

          <article className={`${styles.statCard} ${styles.revenueCard}`}>
            <div className={`${styles.iconWrapper} ${styles.green}`}>
              <IconChart className={styles.icon} />
            </div>
            <div className={styles.statInfo} onClick={() => router.push('./adminDash/verkaufteArtikel')}>
              <h3>Umsatz</h3>
              <p className={`${styles.statValue} ${styles.money}`}>{allLoading ? "..." : formatted.umsatz}</p>
              <span className={styles.statLabel}>
                Ø {allLoading ? "..." : formatted.durchschnitt} / Verkauf
                <br/>
                <small className={styles.infoText}>Nur bezahlte Verkäufe</small>
              </span>
            </div>
          </article>
        </section>
        
          </aside>
        </div>
      </div>
  );
}