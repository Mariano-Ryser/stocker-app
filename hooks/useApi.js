import { useAuth } from '../components/auth/AuthProvider';

export const useApi = () => {
  const { token } = useAuth();

  const getHeaders = () => {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  const fetchWithAuth = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers
      }
    });
    
    if (response.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return response;
  };

  return {
    fetchWithAuth,
    getHeaders
  };
};