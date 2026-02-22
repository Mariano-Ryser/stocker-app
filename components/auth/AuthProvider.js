import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ===============================
  // Inicializar desde localStorage
  // ===============================
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedCompany = localStorage.getItem('company');

        if (storedToken) {
          setToken(storedToken);
        }

        if (storedUser && storedUser !== 'undefined') {
          setUser(JSON.parse(storedUser));
        }

        if (storedCompany && storedCompany !== 'undefined') {
          setCompany(JSON.parse(storedCompany));
        }

      } catch (error) {
        console.error('Error loading auth state:', error);

        // Limpieza por si quedó basura guardada
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ===============================
  // Sincronizar entre pestañas
  // ===============================
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedCompany = localStorage.getItem('company');

        if (storedUser && storedUser !== 'undefined') {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }

        if (storedCompany && storedCompany !== 'undefined') {
          setCompany(JSON.parse(storedCompany));
        } else {
          setCompany(null);
        }

      } catch (err) {
        console.error("Error al sincronizar usuario por storage", err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ===============================
  // Actualizar usuario
  // ===============================
  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
    window.dispatchEvent(new Event('storage'));
  };

  // ===============================
  // Actualizar empresa
  // ===============================
  const updateCompany = (newCompanyData) => {
    setCompany(newCompanyData);
    localStorage.setItem('company', JSON.stringify(newCompanyData));
    window.dispatchEvent(new Event('storage'));
  };

  // ===============================
  // Login
  // ===============================
  const login = async (email, password) => {
    try {
      const URI = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${URI}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } 
      catch { return { success: false, error: 'Respuesta inválida del servidor' }; }

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.company) {
          localStorage.setItem('company', JSON.stringify(data.company));
          setCompany(data.company);
        } else {
          localStorage.removeItem('company');
          setCompany(null);
        }

        setToken(data.token);
        setUser(data.user);

        window.dispatchEvent(new Event('storage'));
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Error en login' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión: ' + error.message };
    }
  };

  // ===============================
  // Register
  // ===============================
  const register = async (email, password, name, company) => {
    try {
      const URI = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${URI}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, company })
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } 
      catch { return { success: false, error: 'Respuesta inválida del servidor' }; }

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.company) {
          localStorage.setItem('company', JSON.stringify(data.company));
          setCompany(data.company);
        }

        setToken(data.token);
        setUser(data.user);

        window.dispatchEvent(new Event('storage'));
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Error en registro' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión: ' + error.message };
    }
  };

  // ===============================
  // Logout
  // ===============================
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    setToken(null);
    setUser(null);
    setCompany(null);
    router.push('/login');
  };

  const value = {
    user,
    company,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateCompany,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
