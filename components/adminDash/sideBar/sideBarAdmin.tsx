import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./SideBarAdmin.module.css";
import { useState, useEffect } from "react";
import LogoutButton from "../../ui/LogoutButton";
import { useAuth } from "../../auth/AuthProvider";
import { useLanguage } from "../../../contexts/LanguageContext";
import HeaderAmind from '../headerAdmin/HeaderAdmin';
import {
  HomeIcon,
  ArticlesIcon,
  ClientsIcon,
  InvoicesIcon,
  ScannerIcon,
  SoldIcon,
  SettingsIcon,
  CEOIcon,
  CollapseIcon,
  ExpandIcon,
  LogoutIcon
} from './IconsHeaderAdmin';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, company, loading } = useAuth();
  const { t } = useLanguage();

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Si estamos en móvil, forzar sidebar no minimizado
      if (mobile) {
        setIsMinimized(false);
      }
    };

    // Verificar al montar
    checkMobile();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 🔐 Redirección si no hay sesión
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const toggleMinimize = () => {
    // Solo permitir minimizar en escritorio
    if (!isMobile) {
      setIsMinimized(!isMinimized);
    }
  };

  const handleBurgerClick = () => {
    setIsOpen(!isOpen);
    // No necesitamos cambiar isMinimized aquí porque el useEffect ya lo maneja
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  if (loading) return <div className="loading">{t("loading")}</div>;
  if (!user) return null;

  return (
    <div className={styles.container}>
      <HeaderAmind />
      
      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""} ${isMinimized ? styles.minimized : ""}`}>
        {/* Botón para colapsar/expandir - Solo visible en escritorio */}
        {!isMobile && (
          <button 
            className={styles.collapseButton}
            onClick={toggleMinimize}
            aria-label={isMinimized ? t("menu.expand") : t("menu.collapse")}
          >
            {isMinimized ? <ExpandIcon /> : <CollapseIcon />}
          </button>
        )}

        {/* Información del usuario (comentada por ahora) */}
        {/* <div className={styles.userInfo}>
          <div className={styles.userDetails}>
            {company?.logo ? (
              <img
                src={company.logo}
                alt={`Logo ${company.name}`}
                className={styles.userLogo}
              />
            ) : (
              <div className={styles.userLogoPlaceholder}>
                {company?.name ? company.name[0].toUpperCase() : "?"}
              </div>
            )}
            <p className={styles.userName}>{user.name}</p>
            <p className={styles.userRole}>
              {t(`roles.${user.role || user.plan || "basic"}`)}
            </p>
          </div>
        </div> */}

        <nav className="navbar">
          <ul>
            <li>
              <Link
                href="/adminDash"
                className={router.pathname === "/adminDash" ? styles.active : ""}
                onClick={handleLinkClick}
              >
                <HomeIcon />
                <span className={styles.linkText}>{t("menu.home")}</span>
              </Link>
            </li>
            <li>
              <Link
                href="/adminDash/artikel"
                className={router.pathname === "/adminDash/artikel" ? styles.active : ""}
                prefetch={true}
                onClick={handleLinkClick}
              >
                <ArticlesIcon />
                <span className={styles.linkText}>{t("menu.articles")}</span>
              </Link>
            </li>
            <li>
              <Link
                href="/adminDash/clients"
                className={router.pathname === "/adminDash/clients" ? styles.active : ""}
                prefetch={true}
                onClick={handleLinkClick}
              >
                <ClientsIcon />
                <span className={styles.linkText}>{t("menu.clients")}</span>
              </Link>
            </li>
            <li>
              <Link
                href="/adminDash/regnung"
                className={router.pathname === "/adminDash/regnung" ? styles.active : ""}
                prefetch={true}
                onClick={handleLinkClick}
              >
                <InvoicesIcon />
                <span className={styles.linkText}>{t("menu.invoices")}</span>
              </Link>
            </li>
            <li>
              <Link
                href="/adminDash/scanner"
                className={router.pathname === "/adminDash/scanner" ? styles.active : ""}
                prefetch={true}
                onClick={handleLinkClick}
              >
                <ScannerIcon />
                <span className={styles.linkText}>{t("menu.scanner")}</span>
              </Link>
            </li>
            <li>
              <Link
                href="/adminDash/verkaufteArtikel"
                className={router.pathname === "/adminDash/verkaufteArtikel" ? styles.active : ""}
                prefetch={true}
                onClick={handleLinkClick}
              >
                <SoldIcon />
                <span className={styles.linkText}>{t("menu.sold")}</span>
              </Link>
            </li>
            
            {/* Solo para admin y ceo */}
            {(user.role === "ceo" || user.role === "admin") && (
              <li>
                <Link
                  href="/adminDash/settings"
                  className={router.pathname === "/adminDash/settings" ? styles.active : ""}
                  onClick={handleLinkClick}
                >
                  <SettingsIcon />
                  <span className={styles.linkText}>{t("menu.settings")}</span>
                </Link>
              </li>
            )}
            
            {/* Solo para plan ceo o rol ceo */}
            {(user.plan === "ceo" || user.role === "ceo") && (
              <li>
                <Link
                  href="/adminDash/CEO"
                  className={router.pathname === "/adminDash/CEO" ? styles.active : ""}
                  onClick={handleLinkClick}
                >
                  <CEOIcon />
                  <span className={styles.linkText}>{t("menu.ceo")}</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className={styles.logoutContainer}>
          <div className={`${styles.logoutButton} ${isMinimized ? styles.minimizedLogout : ""}`}>
            <LogoutButton 
              icon={<LogoutIcon />}
              showText={!isMinimized}
              text={t("menu.logout")}
            />
          </div>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className={`${styles.content} ${isMinimized ? styles.minimized : styles.expanded}`}>
        {children}
      </main>

      {/* BURGER - Solo visible en móvil */}
      <button
        className={styles.burger}
        onClick={handleBurgerClick}
        aria-label={t("menu.open")}
      >
        ☰
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}