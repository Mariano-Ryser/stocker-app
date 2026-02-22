// hooks/useCompany.js
import { useState } from 'react';
import { updateCompanyAPI } from '../services/userService';
import { useAuth } from '../components/auth/AuthProvider';

export function useCompany() {
  const { company, updateCompany } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateCompanyData = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateCompanyAPI(data);
      
      if (res.ok) {
        updateCompany(res.company);
        return { success: true };
      } else {
        setError(res.message);
        return { 
          success: false, 
          error: res.message 
        };
      }
    } catch (err) {
      setError(err.message);
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setLoading(false);
    }
  };

  return { company, updateCompanyData, loading, error };
}