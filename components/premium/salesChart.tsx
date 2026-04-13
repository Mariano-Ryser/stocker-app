// components/premium/salesChart.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAllSales } from '../../hooks/useAllSales';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sale } from '../../types';
import styles from './SalesChart.module.css';
import { useAuth } from "../../components/auth/AuthProvider";
import SalesChartSkeleton from '../../components/skeletons/salesChartSkeleton';

interface SalesData {
  month: string; 
  sales: number;
  revenue: number;
}

interface SalesChartProps {
  sales?: Sale[];
  loading?: boolean;
}

type ViewMode = 'synoptic' | 'matrix' | 'trend';

export default function SalesChart({ 
  sales: propSales, 
  loading: propLoading 
}: SalesChartProps) {
  const { t } = useLanguage();
  // ✅ USAR EL NUEVO HOOK QUE TRAE TODAS LAS FACTURAS
  const { sales: allSales, loading: allSalesLoading, refreshSales: refreshAllSales } = useAllSales();
  const { company } = useAuth();
  
  const sales = propSales || allSales;
  const loading = propLoading !== undefined ? propLoading : allSalesLoading;
  const currencySymbol = company?.currency || 'EUR';
  
  const [viewMode, setViewMode] = useState<ViewMode>('synoptic');
  const [timeRange, setTimeRange] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageSale: 0,
    growth: 0
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const months = useMemo(() => [
    t('salesChart.months.jan'),
    t('salesChart.months.feb'),
    t('salesChart.months.mar'),
    t('salesChart.months.apr'),
    t('salesChart.months.may'),
    t('salesChart.months.jun'),
    t('salesChart.months.jul'),
    t('salesChart.months.aug'),
    t('salesChart.months.sep'),
    t('salesChart.months.oct'),
    t('salesChart.months.nov'),
    t('salesChart.months.dec')
  ], [t]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!lastUpdated && sales && sales.length > 0) {
      setLastUpdated(new Date());
    }
  }, [sales, lastUpdated]);

  // 🔥 Procesar datos - AHORA CON TODAS LAS FACTURAS
  useEffect(() => {
    if (!sales || loading) return;

    const processData = () => {
      // Filtrar solo ventas pagadas
      const paidSales = Array.isArray(sales) 
        ? sales.filter(sale => sale.status === 'paid')
        : [];
      
      // Filtrar por año seleccionado
      const filteredSales = paidSales.filter(sale => {
        const saleDate = new Date(sale.createdAt || sale.date || Date.now());
        if (timeRange === 'yearly') {
          return saleDate.getFullYear() === selectedYear;
        } else {
          return saleDate.getFullYear() === selectedYear && 
                 saleDate.getMonth() === selectedMonth;
        }
      });
      
      if (timeRange === 'yearly') {
        const monthlyData: { [key: number]: { sales: number, revenue: number } } = {};
        
        months.forEach((_, index) => {
          monthlyData[index] = { sales: 0, revenue: 0 };
        });

        filteredSales.forEach(sale => {
          const saleDate = new Date(sale.createdAt || sale.date || Date.now());
          const month = saleDate.getMonth();
          monthlyData[month].sales += 1;
          monthlyData[month].revenue += sale.total || 0;
        });

        const chartData = months.map((monthName, index) => ({
          month: monthName,
          sales: monthlyData[index].sales,
          revenue: monthlyData[index].revenue
        }));

        setSalesData(chartData);
      } else {
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const dailyData: SalesData[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
          const daySales = filteredSales.filter(sale => {
            const saleDate = new Date(sale.createdAt || sale.date || Date.now());
            return saleDate.getDate() === day;
          });

          const dayRevenue = daySales.reduce((sum, sale) => sum + (sale.total || 0), 0);

          dailyData.push({
            month: day.toString(),
            sales: daySales.length,
            revenue: dayRevenue
          });
        }

        setSalesData(dailyData);
      }

      const totalSalesFiltered = filteredSales.length;
      const totalRevenueFiltered = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const averageSale = totalSalesFiltered > 0 ? totalRevenueFiltered / totalSalesFiltered : 0;

      let growth = 0;
      if (timeRange === 'yearly') {
        const previousYearSales = paidSales.filter(sale => {
          const saleDate = new Date(sale.createdAt || sale.date || Date.now());
          return saleDate.getFullYear() === selectedYear - 1;
        }).length;
        
        growth = previousYearSales > 0 
          ? ((totalSalesFiltered - previousYearSales) / previousYearSales) * 100 
          : 0;
      }

      setTotalStats({
        totalSales: totalSalesFiltered,
        totalRevenue: totalRevenueFiltered,
        averageSale,
        growth
      });
    };

    processData();
  }, [sales, loading, timeRange, selectedYear, selectedMonth, months]);

  // 🔥 Botón manual de refresco
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllSales();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refrescando datos:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading && !isRefreshing) {
    return <SalesChartSkeleton />;
  }

  // const formatCurrency = (value: number) => {
  //   return `${currencySymbol} ${value.toLocaleString('de-DE', {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2
  //   })}`;
  // };

const formatCurrency = (value: number) => {
  // Manejar valores nulos o indefinidos
  if (value === null || value === undefined || isNaN(value)) {
    return `${currencySymbol} 0.00`;
  }
  
  // Separar parte entera y decimal
  const roundedValue = Math.round(value * 100) / 100;
  const [integerPart, decimalPart] = roundedValue.toFixed(2).split('.');
  
  // Agregar separador de miles (apóstrofe) cada 3 dígitos
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  
  // Unir con punto decimal
  const formattedValue = `${formattedInteger}.${decimalPart}`;
  
  return `${currencySymbol} ${formattedValue}`;
};

  return (
    <div className={styles.container}>
      {/* 🔥 Barra de refresco */}
      <div className={styles.refreshBar}>
        {isRefreshing && (
          <div className={styles.refreshingIndicator}>
            <div className={styles.smallSpinner}></div>
          </div>
        )}
        {lastUpdated && !isRefreshing && (
          <div className={styles.lastUpdated}>
            {/* Última actualización: {lastUpdated.toLocaleTimeString()} */}
          </div>
        )}
        <button 
          className={styles.refreshButton} 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          title={t('salesChart.refreshTooltip') || 'Actualizar datos'}
        >
          🔄
        </button>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{t('salesChart.title')}</h2>
          <p className={styles.subtitle}>{t('salesChart.subtitle')}</p>
        </div>
        
        <div className={styles.controls}>
          {/* View Mode Selector */}
          <div className={styles.viewSelector}>
            <button
              className={`${styles.viewButton} ${viewMode === 'synoptic' ? styles.activeView : ''}`}
              onClick={() => setViewMode('synoptic')}
              title={t('salesChart.views.synoptic')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              {t('salesChart.views.synoptic')}
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'matrix' ? styles.activeView : ''}`}
              onClick={() => setViewMode('matrix')}
              title={t('salesChart.views.matrix')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
              </svg>
              {t('salesChart.views.matrix')}
            </button>
          </div>

          {/* Time Controls */}
          <div className={styles.timeRangeSelector}>
            <button
              className={`${styles.timeButton} ${timeRange === 'yearly' ? styles.activeTime : ''}`}
              onClick={() => setTimeRange('yearly')}
            >
              {t('salesChart.timeRange.yearly')}
            </button>
            <button
              className={`${styles.timeButton} ${timeRange === 'monthly' ? styles.activeTime : ''}`}
              onClick={() => setTimeRange('monthly')}
            >
              {t('salesChart.timeRange.monthly')}
            </button>
          </div>

          <div className={styles.selectors}>
            <select 
              className={styles.select}
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {timeRange === 'monthly' && (
              <select
                className={styles.select}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('salesChart.stats.totalRevenue')}</div>
          <div className={styles.statValue}>
            {formatCurrency(totalStats.totalRevenue)}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('salesChart.stats.totalSales')}</div>
          <div className={styles.statValue}>
            {totalStats.totalSales}
            {totalStats.growth !== 0 && (
              <span className={`${styles.growth} ${totalStats.growth > 0 ? styles.positiveGrowth : styles.negativeGrowth}`}>
                {totalStats.growth > 0 ? '↑' : '↓'} {Math.abs(totalStats.growth).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('salesChart.stats.averagePerSale')}</div>
          <div className={styles.statValue}>
            {formatCurrency(totalStats.averageSale)}
          </div>
        </div>
      </div>

      {/* Synoptic View */}
      {viewMode === 'synoptic' && (
        <div className={styles.synopticView}>
          <div className={styles.tableHeader}>
            <div className={styles.tableTitle}>
              {timeRange === 'yearly' ? t('salesChart.table.month') : t('salesChart.table.day')} Performance
            </div>
            <div className={styles.tableSubtitle}>
              Sales & Revenue Analysis
            </div>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.synopticTable}>
              <thead>
                <tr>
                  <th>{timeRange === 'yearly' ? t('salesChart.table.month') : t('salesChart.table.day')}</th>
                  <th>{t('salesChart.table.unitsSold')}</th>
                  <th>{t('salesChart.table.revenue')}</th>
                  <th>{t('salesChart.table.avgSale')}</th>
                  <th>{t('salesChart.table.contribution')}</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((item, index) => {
                  const contribution = totalStats.totalRevenue > 0 
                    ? (item.revenue / totalStats.totalRevenue) * 100 
                    : 0;
                  
                  return (
                    <tr key={index} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                      <td className={styles.monthCell}><strong>{item.month}</strong></td>
                      <td>{item.sales}</td>
                      <td>{formatCurrency(item.revenue)}</td>
                      <td>
                        {item.sales > 0
                          ? formatCurrency(item.revenue / item.sales)
                          : formatCurrency(0)
                        }
                      </td>
                      <td>
                        <div className={styles.contributionBar}>
                          <div className={styles.contributionFill} style={{ width: `${contribution}%` }} />
                          <span className={styles.contributionText}>
                            {contribution.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className={styles.tableFooter}>
                  <td><strong>{t('salesChart.table.total')}</strong></td>
                  <td><strong>{totalStats.totalSales}</strong></td>
                  <td><strong>{formatCurrency(totalStats.totalRevenue)}</strong></td>
                  <td><strong>{formatCurrency(totalStats.averageSale)}</strong></td>
                  <td><strong>100%</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Matrix View */}
      {viewMode === 'matrix' && (
        <div className={styles.matrixView}>
          <div className={styles.matrixHeader}>
            <div className={styles.tableTitle}>{t('salesChart.matrix.title')}</div>
            <div className={styles.tableSubtitle}>{t('salesChart.matrix.subtitle')}</div>
          </div>
          <div className={styles.matrixGrid}>
            {salesData.map((item, index) => {
              const avgRevenue = totalStats.totalRevenue / salesData.length;
              const avgSales = totalStats.totalSales / salesData.length;
              const isHighRevenue = item.revenue >= avgRevenue;
              const isHighSales = item.sales >= avgSales;
              
              let quadrant = '';
              let quadrantClass = '';
              if (isHighRevenue && isHighSales) {
                quadrant = t('salesChart.matrix.starPerformer');
                quadrantClass = styles.StarPerformer;
              } else if (isHighRevenue && !isHighSales) {
                quadrant = t('salesChart.matrix.highValue');
                quadrantClass = styles.HighValue;
              } else if (!isHighRevenue && isHighSales) {
                quadrant = t('salesChart.matrix.volumeDriver');
                quadrantClass = styles.VolumeDriver;
              } else {
                quadrant = t('salesChart.matrix.needsReview');
                quadrantClass = styles.NeedsReview;
              }
              
              return (
                <div key={index} className={`${styles.matrixCard} ${quadrantClass}`}>
                  <div className={styles.matrixPeriod}>{item.month}</div>
                  <div className={styles.matrixMetrics}>
                    <div className={styles.matrixMetric}>
                      <span className={styles.metricLabel}>{t('salesChart.trend.revenue')}</span>
                      <span className={styles.metricValue}>{formatCurrency(item.revenue)}</span>
                    </div>
                    <div className={styles.matrixMetric}>
                      <span className={styles.metricLabel}>{t('salesChart.trend.sales')}</span>
                      <span className={styles.metricValue}>{item.sales}</span>
                    </div>
                    <div className={styles.matrixMetric}>
                      <span className={styles.metricLabel}>{t('salesChart.table.avgSale')}</span>
                      <span className={styles.metricValue}>
                        {item.sales > 0 ? formatCurrency(item.revenue / item.sales) : formatCurrency(0)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.matrixQuadrant}>{quadrant}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className={styles.insights}>
        <div className={styles.insightItem}>
          <span className={styles.insightLabel}>{t('salesChart.insights.bestPeriod')}</span>
          <span className={styles.insightValue}>
            {salesData.reduce((best, current) => 
              current.revenue > best.revenue ? current : best, salesData[0]
            )?.month}
          </span>
        </div>
        <div className={styles.insightItem}>
          <span className={styles.insightLabel}>{t('salesChart.insights.peakSales')}</span>
          <span className={styles.insightValue}>
            {salesData.reduce((peak, current) => 
              current.sales > peak.sales ? current : peak, salesData[0]
            )?.month} ({Math.max(...salesData.map(d => d.sales))} units)
          </span>
        </div>
      </div>

      <style jsx>{`
        .refreshBar {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .refreshButton {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 8px;
          transition: all 0.2s;
          background: #f3f4f6;
        }
        
        .refreshButton:hover {
          background: #e5e7eb;
          transform: scale(1.05);
        }
        
        .refreshButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .refreshingIndicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: #6b7280;
        }
        
        .smallSpinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        .lastUpdated {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}