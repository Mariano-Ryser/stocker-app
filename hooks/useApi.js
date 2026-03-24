// hooks/useApi.js - VERSIÓN MEJORADA
import { useAuth } from '../components/auth/AuthProvider';
import { useCallback, useRef } from 'react';

export const useApi = () => {
  const { token, logout } = useAuth();
  const pendingRequests = useRef(0);
  const abortControllerRef = useRef(null);

  const getHeaders = useCallback(() => {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }, [token]);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    pendingRequests.current++;

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
        headers: {
          ...getHeaders(),
          ...options.headers
        }
      });
      
      if (response.status === 401) {
        logout(); // Usar logout del contexto en lugar de manipular localStorage
        window.location.href = '/login';
        return null;
      }
      
      // Rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 5;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return fetchWithAuth(url, options); // Reintentar
      }
      
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        // console.log('Request cancelled');
        return null;
      }
      throw error;
    } finally {
      pendingRequests.current--;
    }
  }, [getHeaders, logout]);

  return {
    fetchWithAuth,
    getHeaders,
    pendingRequests: () => pendingRequests.current
  };
};