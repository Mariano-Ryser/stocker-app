import React, { useState, useEffect, useRef } from "react";
import Router from "next/router";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import LogoutButton from "../../ui/LogoutButton";
import styles from "./HeaderAdmin.module.css";
import LanguageSelector from '../../LanguageSelector/LanguageSelector';
import { useLanguage } from "../../../contexts/LanguageContext";

export default function Header() {
  const { t } = useLanguage();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const SCROLL_THRESHOLD = 100;

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      
      setScrolled(currentScrollY > 8);
      
      if (currentScrollY > lastScrollY && currentScrollY > SCROLL_THRESHOLD) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setHidden(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  // Cierra el menú si pasas a desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e:any) => {
      if (
        mobileOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileOpen]);

  const handleLogin = () => {
    setMobileOpen(false);
    setTimeout(() => Router.push("/login"), 100);
  };

  const handleLogoClick = () => {
    Router.push("/");
    setMobileOpen(false);
  };

  const toggleMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [];

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${hidden ? styles.hidden : ""}`}>
        <div className={styles.container}>
          {/* Logo */}
          <div className={styles.logo} onClick={handleLogoClick}>
            <div className={styles.logoIcon}>
              <img
                src="/img/logo80.webp" 
                alt="Logo"
                className={styles.logoImage}
              />
            </div>
          </div>

          {/* Desktop nav */}
          <nav className={styles.desktopNav}>
            {navItems.map((i) => (
              <a key={i.text} href={i.href}>
                {i.icon && <i.icon size={16} />}
                {i.text}
              </a>
            ))}
          </nav>
                 
          {/* Desktop actions */}
          {!isAuthenticated && (
            <div className={styles.desktopActions}>
              <button className={styles.btnText} onClick={() => Router.push("/login")}>
                {t("header.login")}
              </button>
            </div>
          )}
          
          <div>
            <LanguageSelector />
          </div>    
           
          {isAuthenticated && (
            <div className={styles.desktopActions}>
              <button className={styles.btnText} onClick={() => Router.push("/dashboard")}>
                {t("header.dashboard")}
              </button>
            </div>
          )}
                              
          {/* Mobile button */}
          <button
            ref={toggleRef}
            className={styles.mobileToggle}
            onClick={toggleMenu}
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU DROPDOWN */}
      <div 
        ref={menuRef}
        className={`${styles.mobileMenu} ${scrolled ? styles.scrolled : ""} ${mobileOpen ? styles.open : ""}`}
      >
        <nav className={styles.mobileNav}>
          {navItems.map((i) => (
            <a
              key={i.text}
              href={i.href}
              className={styles.mobileNavItem}
              onClick={() => setMobileOpen(false)}
            >
              {i.icon && <i.icon size={18} />}
              <span>{i.text}</span>
            </a>
          ))}

          {navItems.length > 0 && <div className={styles.mobileDivider}></div>}

          {!isAuthenticated && (
            <div className={styles.mobileActions}>
              <button 
                className={styles.mobileLoginBtn} 
                onClick={() => {
                  setMobileOpen(false);
                  setTimeout(() => Router.push("/login"), 0);
                }}
              >
                {t("header.login")}
              </button>
             
              <button 
                className={styles.mobileLoginBtn} 
                onClick={() => {
                  setMobileOpen(false);
                  setTimeout(() => Router.push("/register"), 0);
                }}
              >
                {t("header.register")}
              </button>
            </div>
          )}
          
          {isAuthenticated && (
            <div className={styles.mobileActions}>
              <button
                className={styles.mobileLoginBtn}
                onClick={() => {
                  setMobileOpen(false);
                  setTimeout(() => Router.push("/dashboard"), 100);
                }}
              >
                {t("header.dashboard")}
              </button>
              <LogoutButton />
            </div>
          )}
        </nav>
      </div>

      {/* Backdrop para cerrar al hacer clic fuera */}
      {mobileOpen && (
        <div 
          className={styles.menuBackdrop} 
          onClick={() => setMobileOpen(false)} 
        />
      )}
    </>
  );
}