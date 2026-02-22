// components/premium/QuickStats.tsx
import { useState, useEffect } from 'react';
import { useSales } from '../../hooks/useSales';
import styles from './QuickStats.module.css';

// Importar tipos desde archivo compartido
import { Sale } from '../../types';

interface QuickStatsProps {
  compact?: boolean;
  sales?: Sale[];
  loading?: boolean;
}

export default function QuickStats({ 
  compact = false,
  sales: propSales,
  loading: propLoading 
}: QuickStatsProps) {
  // Si NO se pasaron props, usar el hook
  const { sales: hookSales } = useSales();
  
  // Usar props si existen, sino usar hook
  const sales = propSales || hookSales;
  const loading = propLoading !== undefined ? propLoading : false;
  
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todaySales: 0,
    weekRevenue: 0,
    weekSales: 0,
    avgOrderValue: 0,
    yesterdayComparison: 0
  });

  useEffect(() => {
    if (!sales || loading) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Filtrar ventas
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt || sale.date || Date.now());
      return saleDate >= today && sale.status === 'paid';
    });

    const yesterdaySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt || sale.date || Date.now());
      return saleDate >= yesterday && saleDate < today && sale.status === 'paid';
    });

    const weekSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt || sale.date || Date.now());
      return saleDate >= lastWeek && sale.status === 'paid';
    });

    // Calcular valores
    const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const weekRevenue = weekSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    
    // Comparación con ayer
    const yesterdayComparison = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 
      : 0;

    // Valor promedio del pedido (de todas las ventas pagadas)
    const paidSales = sales.filter(s => s.status === 'paid');
    const avgOrderValue = paidSales.length > 0 
      ? paidSales.reduce((sum, sale) => sum + (sale.total || 0), 0) / paidSales.length
      : 0;

    setStats({
      todayRevenue,
      todaySales: todaySales.length,
      weekRevenue,
      weekSales: weekSales.length,
      avgOrderValue,
      yesterdayComparison
    });
  }, [sales, loading]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Lade Statistiken...</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={styles.quickStatsCompact}>
        <h3 className={styles.title}>Heute</h3>
        <div className={styles.compactGrid}>
          <div className={styles.compactStat}>
            <div className={styles.compactLabel}>Umsatz</div>
            <div className={styles.compactValue}>{formatCurrency(stats.todayRevenue)}</div>
            {stats.yesterdayComparison !== 0 && (
              <div className={`${styles.compactChange} ${stats.yesterdayComparison > 0 ? styles.positive : styles.negative}`}>
                {stats.yesterdayComparison > 0 ? '↗' : '↘'} {Math.abs(stats.yesterdayComparison).toFixed(1)}%
              </div>
            )}
          </div>
          
          <div className={styles.compactStat}>
            <div className={styles.compactLabel}>Verkäufe</div>
            <div className={styles.compactValue}>{stats.todaySales}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.quickStats}>
      <div className={styles.header}>
        <h3 className={styles.title}>Tägliche Übersicht</h3>
        <div className={styles.timeIndicator}>
          {new Date().toLocaleDateString('de-DE', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          })}
        </div>
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statLabel}>Heutiger Umsatz</div>
          </div>
          <div className={styles.statValue}>{formatCurrency(stats.todayRevenue)}</div>
          {stats.yesterdayComparison !== 0 && (
            <div className={`${styles.comparison} ${stats.yesterdayComparison > 0 ? styles.positive : styles.negative}`}>
              {stats.yesterdayComparison > 0 ? 'Höher' : 'Niedriger'} als gestern
              <span className={styles.comparisonPercent}>
                {stats.yesterdayComparison > 0 ? '↑' : '↓'} {Math.abs(stats.yesterdayComparison).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statLabel}>Verkäufe heute</div>
          </div>
          <div className={styles.statValue}>{stats.todaySales}</div>
          <div className={styles.statSubtext}>
            Ø {formatCurrency(stats.avgOrderValue)} pro Verkauf
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statLabel}>Diese Woche</div>
          </div>
          <div className={styles.statValue}>{formatCurrency(stats.weekRevenue)}</div>
          <div className={styles.statSubtext}>
            {stats.weekSales} Verkäufe insgesamt
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statLabel}>Performance</div>
          </div>
          <div className={styles.statValue}>
            {stats.yesterdayComparison > 0 ? '+' : ''}{stats.yesterdayComparison.toFixed(1)}%
          </div>
          <div className={styles.statSubtext}>
            {stats.yesterdayComparison > 0 ? 'Wachstum' : 'Rückgang'} vs. gestern
          </div>
        </div>
      </div>
    </div>
  );
}