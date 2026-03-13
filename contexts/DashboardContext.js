// contexts/DashboardContext.js
import { createContext, useContext, useCallback, useMemo, useState } from 'react';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Coordinar refresh de todos los datos
  const refreshAllData = useCallback(async (refreshFunctions = []) => {
    if (isRefreshing) {
      // console.log('Already refreshing, skipping...');
      return;
    }

    setIsRefreshing(true);
    try {
      // console.log('Coordinated refresh started');
      await Promise.all(refreshFunctions.map(fn => fn?.()));
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error in coordinated refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const value = useMemo(() => ({
    isRefreshing,
    lastRefresh,
    refreshAllData
  }), [isRefreshing, lastRefresh, refreshAllData]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};