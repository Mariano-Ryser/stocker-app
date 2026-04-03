// pages/dashboard/index.tsx (versión mejorada)
import {preloadDashboardOnce} from '../../PreloadDashboard'
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import { useRouter } from "next/router";
import { useProduct } from "../../hooks/useProducts";
import { useClients } from "../../hooks/useClients";
import { useSales } from "../../hooks/useSales";
import { useDashboard } from "../../contexts/DashboardContext";
import { useLanguage } from "../../contexts/LanguageContext"; 
import LogoutButton from "../../components/ui/LogoutButton";
import QuickStats from "../../components/premium/QuickStats";
import SalesChart from '../../components/premium/salesChart';
import SplashScreen from '../../components/ui/SplashScreen';

import {
  GoodsInIcon,
   IconBox, 
   IconUsers,
    IconInvoice, 
    IconChart  } from '../../components/icons/DashboardIcons';
    
import styles from './DashboardHome.module.css';

// Importar tipos desde el archivo compartido
import { User, Sale } from '../../types';

export default function DashboardHome() {
  const { t } = useLanguage(); 
  const [showSplash, setShowSplash] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar si es móvil para ajustes adicionales
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    preloadDashboardOnce();
  }, []);

  const { user, isAuthenticated, loading: authLoading } = useAuth() as { 
    user: User | null; 
    isAuthenticated: boolean; 
    loading: boolean 
  };

  const router = useRouter();
  const { refreshAllData: coordinatedRefresh, isRefreshing } = useDashboard();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const hasShownSplash = sessionStorage.getItem('splashShown');
      
      if (!hasShownSplash) {
        setShowSplash(true);
        sessionStorage.setItem('splashShown', 'true');
      }
    }
  }, [isAuthenticated, authLoading]);

  const {
    loading: productsLoading, 
    refreshProducts, 
    totalProducts, 
  } = useProduct();
  
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

  const [stats, setStats] = useState({
    produkte: 0,
    kunden: 0,
    verkäufe: 0,
    umsatz: 0,
    durchschnitt: 0,
    cancelledCount: 0,
    pendingCount: 0
  });

  const handleRefreshAllData = useCallback(async () => {
    await coordinatedRefresh([refreshProducts, refreshClients, refreshSales]);
  }, [coordinatedRefresh, refreshProducts, refreshClients, refreshSales]);

  useEffect(() => {
    const allDataLoaded = !productsLoading && !clientsLoading && !salesLoading;
    const hasData = isAuthenticated && allDataLoaded;
    
    if (hasData) {
      setStats({
        produkte: totalProducts || 0,
        kunden: clientsStats?.total || 0,
        verkäufe: salesStats.paidCount || 0,
        umsatz: salesStats.totalUmsatz || 0,
        durchschnitt: salesStats.durchschnitt || 0,
        cancelledCount: salesStats.cancelledCount || 0,
        pendingCount: salesStats.pendingCount || 0
      });
    }
  }, [
    totalProducts, 
    clientsStats,
    salesStats, 
    isAuthenticated, 
    productsLoading, 
    clientsLoading, 
    salesLoading
  ]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let broadcastChannel: BroadcastChannel | null = null;
    
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('sales_updates');
      broadcastChannel.onmessage = (event) => {
        if (event.data === 'new_sale' || event.data === 'data_updated') {
          handleRefreshAllData();
        }
      };
    }

    const handleRouteChange = (url: string) => {
      if (url === '/dashboard' || url === '/') {
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

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} duration={1300} />;
  }

  if (authLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner}></div>
        <p>{t('index.loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const allLoading = isRefreshing || productsLoading || clientsLoading || salesLoading;
  const isPremiumUser = user.plan === 'pro';

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.mainLayout}>
        {/* Left Column - Quick Actions */}
        <div className={styles.leftColumn}>
          <section className={`${styles.card} ${styles.actionSection}`}>
            <div className={styles.cardHeader}>
              <h2>{t('index.quickActions')}</h2>
              <p>{t('index.quickActionsDesc')}</p>
            </div>

            <div className={styles.actionsGrid}>
              <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/dashboard/scanner")}>
                <div className={styles.actionIconBox}>
                  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none">
                    <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7M17 3H19C20.1046 3 21 3.89543 21 5V7M21 17V19C21 20.1046 20.1046 21 19 21H17M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.actionDetails}>
                  <strong>{t('index.actions.scanner')}</strong>
                  <small>{t('index.actions.scannerDesc')}</small>
                </div>
              </button>

              <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/dashboard/artikel")}>
                <div className={styles.actionIconBox}>
                  <svg viewBox="0 0 24 24" className={styles.svgIcon}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div className={styles.actionDetails}>
                  <strong>{t('index.actions.product')}</strong>
                  <small>{t('index.actions.productDesc')}</small>
                </div>
              </button>

              <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/dashboard/clients")}>
                <div className={styles.actionIconBox}>
                  <IconUsers className={styles.svgIcon} />
                </div>
                <div className={styles.actionDetails}>
                  <strong>{t('index.actions.customers')}</strong>
                  <small>{t('index.actions.customersDesc')}</small>
                </div>
              </button>

              <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/dashboard/regnung")}>
                <div className={styles.actionIconBox}>
                  <IconInvoice className={styles.svgIcon} />
                </div>
                <div className={styles.actionDetails}>
                  <strong>{t('index.actions.invoice')}</strong>
                  <small>{t('index.actions.invoiceDesc')}</small>
                </div>
              </button>
              
              {isPremiumUser && (
                <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/dashboard/importExport")}>
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
                    <strong>{t('index.actions.importExport')}</strong>
                    <small>{t('index.actions.importExportDesc')}</small>
                  </div>
                </button>
              )}

              <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/dashboard/verkaufteArtikel")}>
                <div className={styles.actionIconBox}>
                  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.actionDetails}>
                  <strong>{t('index.actions.soldItems')}</strong>
                  <small>{t('index.actions.soldItemsDesc')}</small>
                </div>
              </button>

              <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/dashboard/code")}>
                <div className={styles.actionIconBox}>
                  <svg className={styles.svgIcon} viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="6" width="2" height="15" fill="currentColor" rx="0.5" />
                    <rect x="7" y="6" width="3" height="15" fill="currentColor" rx="0.5" />
                    <rect x="11" y="6" width="1.5" height="15" fill="currentColor" rx="0.3" />
                    <rect x="13.5" y="6" width="2.5" height="15" fill="currentColor" rx="0.5" />
                    <rect x="17" y="6" width="1" height="15" fill="currentColor" rx="0.3" />
                    <rect x="19" y="6" width="2" height="15" fill="currentColor" rx="0.5" />
                  </svg>
                </div>
                <div className={styles.actionDetails}>
                  <strong>{t('index.actions.barcode')}</strong>
                  <small>{t('index.actions.barcodeDesc')}</small>
                </div>
              </button>

              <button className={`${styles.actionItem} ${styles.highlightAction}`} onClick={() => router.push("/dashboard/wareneigang")}>
                <div className={styles.actionIconBox}>
                  <GoodsInIcon />
                </div>
                <div className={styles.actionDetails}>
                  <strong>{t('index.actions.goodsIn')}</strong>
                  <small>{t('index.actions.goodsInDesc')}</small>
                </div>
              </button>
            </div>
          </section>
          
        {isPremiumUser && (
            <SalesChart /> 
          )} 
          
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
                  {user.plan === "basic" ? "Basic" : 
                   user.plan === "medium" ? "Medium" :  
                   user.plan === "pro" ? "Pro" : "Basic"} 
                </span>
              </div>
            </div>

            <div className={styles.profileDetails}>
              <div className={styles.detailRow}>
                <span>{t('index.profile.email')}</span>
                <span className={styles.detailVal}>{user.email}</span>
              </div>
              <div className={styles.detailRow}>
                <span>{t('index.profile.date')}</span>
                <span className={styles.detailVal}>{new Date().toLocaleDateString("de-DE")}</span>
              </div>
            
            </div>

            <div className={styles.logoutWrapper}>
              <LogoutButton />
            </div>
          </div>
 
          {/* Recent Activity / Tips */}
         {/* <div className={`${styles.card} ${styles.tipsCard}`}>
            <h3>{t('index.tips.title')}</h3>
            <ul className={styles.tipsList}>
              <li>{t('index.tips.tip1')}</li>
              <li>{t('index.tips.tip2')}</li>
              <li>{t('index.tips.tip3')}</li>
              {!isPremiumUser && (
                <li>
                  <strong>{t('index.tips.upgrade')}</strong> {t('index.tips.upgradeDesc')}
                  <button 
                    className={styles.upgradeButton}
                    onClick={() => router.push("/settings")}
                  >
                    {t('index.tips.upgradeButton')}
                  </button>
                </li>
              )}
            </ul>
          </div> */}

          {/* Stats Grid */}
          {/* <section className={styles.statsGrid}>
            <article className={styles.statCard}>
              <div className={`${styles.iconWrapper} ${styles.blue}`}>
                <IconBox className={styles.icon} />
              </div>
              <div className={styles.statInfo} onClick={() => router.push('./dashboard/artikel')}>
                <h3>{t('index.stats.products')}</h3>
                <p className={styles.statValue}>{allLoading ? "..." : formatted.produkte}</p>
                <span className={styles.statLabel}>{t('index.stats.productsDesc')}</span>
              </div>
            </article>

            <article className={styles.statCard}>
              <div className={`${styles.iconWrapper} ${styles.purple}`}>
                <IconUsers className={styles.icon} />
              </div>
              <div className={styles.statInfo} onClick={() => router.push('./dashboard/clients')}>
                <h3>{t('index.stats.customers')}</h3>
                <p className={styles.statValue}>{allLoading ? "..." : formatted.kunden}</p>
                <span className={styles.statLabel}>{t('index.stats.customersDesc')}</span>
              </div>
            </article>

            <article className={styles.statCard}>
              <div className={`${styles.iconWrapper} ${styles.orange}`}>
                <IconInvoice className={styles.icon} />
              </div>
              <div className={styles.statInfo} onClick={() => router.push('./dashboard/regnung')}>
                <h3>{t('index.stats.sales')}</h3>
                <p className={styles.statValue}>{allLoading ? "..." : formatted.verkaeufe}</p>
                <span className={styles.statLabel}>{t('index.stats.salesDesc')}</span>
                <div className={styles.extraInfo}>
                  {stats.pendingCount > 0 && (
                    <span className={styles.pendingInfo}>{formatted.pending} {t('index.stats.pending')}</span>
                  )}
                  {stats.cancelledCount > 0 && (
                    <span className={styles.cancelledInfo}>{formatted.cancelled} {t('index.stats.cancelled')}</span>
                  )}
                </div>
              </div>
            </article>

             <article className={`${styles.statCard} ${styles.revenueCard}`}>
              <div className={`${styles.iconWrapper} ${styles.green}`}>
                <IconChart className={styles.icon} />
              </div>
              <div className={styles.statInfo} onClick={() => router.push('./dashboard/verkaufteArtikel')}>
                <h3>{t('index.stats.revenue')}</h3>
                <p className={`${styles.statValue} ${styles.money}`}>{allLoading ? "..." : formatted.umsatz}</p>
                <span className={styles.statLabel}>
                  {t('index.stats.revenueDesc').replace('{amount}', allLoading ? "..." : formatted.durchschnitt)}
                  <br/>
                  <small className={styles.infoText}>{t('index.stats.revenueNote')}</small>
                </span>
              </div>
            </article> 
          </section> */}
        </aside>
      </div>
    </div>
  );
}