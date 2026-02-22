// components/withAuth.js
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from './AuthProvider';

export default function withAuth(WrappedComponent) {
  return function ProtectedRoute(props) {
    const { isAuthenticated } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
      if (isAuthenticated === false) { // ⬅️ Solo redirigir si es `false`
        router.push('/adminDash');
      }
    }, [isAuthenticated]);

    if (isAuthenticated === null) return <p>Cargando...</p>; // ⬅️ Evita parpadeos

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
}

