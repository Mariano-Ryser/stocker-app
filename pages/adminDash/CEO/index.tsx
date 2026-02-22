import {useEffect} from 'react'
import { useRouter } from "next/router";
import { useAuth } from "../../../components/auth/AuthProvider";
import styles from "./EjemploPage.module.css"
// import { useLanguage } from '../../../contexts/LanguageContext';
import { User} from '../../../types';
export default function Component() {
  const {  user, isAuthenticated, loading: authLoading } = useAuth() as { 
    user: User | null; 
    isAuthenticated: boolean; 
    loading: boolean 
  };
// const { t, loadModule, language, isChanging} = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

    // useEffect(() => {
    //  loadModule('componentName');
    // }, [language, isChanging, loadModule]);


  return (
      <>
      {/* <h2>{t("componentName.title")}</h2>
      <p>{t("componentName.p")}</p> */}
      <div className={styles.container}>
        <h1 className={styles.title}>Admin Dashboard - CEO</h1>
        <p className={styles.description}>
          Welcome, {user?.name}! This is the CEO dashboard. Here you can manage company-wide settings, view high-level analytics, and oversee all operations.
        </p>
          <p>Where you can see all the users and their roles in the company. </p>
      </div>
      
      </>
  );
}
