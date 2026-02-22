// pages/verify-email.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from './verify-email.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { token } = router.query;
const {t} = useLanguage();


  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/verify-email`, {
          token
        });

        if (response.data.ok) {
          setStatus('success');
          setMessage('E-Mail erfolgreich verifiziert!');
          
          // Guardar token y usuario en localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Redirigir después de 2 segundos
          setTimeout(() => {
            router.push('/adminDash');
          }, 2000);
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verifizierung fehlgeschlagen');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'loading' && (
          <>
            <div className={styles.loader}></div>
            <h2>Überprüfe Verifizierungslink...</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className={styles.successIcon}>✓</div>
            <h2>Verifizierung erfolgreich!</h2>
            <p>{message}</p>
            <p>Sie werden in Kürze weitergeleitet...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className={styles.errorIcon}>✗</div>
            <h2>Verifizierung fehlgeschlagen</h2>
            <p>{message}</p>
            <button 
              className={styles.button}
              onClick={() => router.push('/login')}
            >
              Zum Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}