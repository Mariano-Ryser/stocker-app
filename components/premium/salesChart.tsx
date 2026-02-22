// components/premium/salesChart.tsx
import { useState, useEffect } from 'react';
import { useSales } from '../../hooks/useSales';
import styles from './SalesChart.module.css';

// Importar tipos desde archivo compartido
import { Sale } from '../../types';

interface SalesData {
  month: string;
  sales: number;
  revenue: number;
}

interface SalesChartProps {
  sales?: Sale[];
  loading?: boolean;
}

export default function SalesChart({ 
  sales: propSales, 
  loading: propLoading 
}: SalesChartProps) {
  // Si NO se pasaron props, usar el hook
  const { sales: hookSales, loading: hookLoading } = useSales();
  
  // Usar props si existen, sino usar hook
  const sales = propSales || hookSales;
  const loading = propLoading !== undefined ? propLoading : hookLoading;
  
  const [timeRange, setTimeRange] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageSale: 0,
    growth: 0
  });

  // Nombres de meses en alemán
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // Selección de años para los últimos 5 años
  const currentYear = new Date().getFullYear();
  // Generar array de años
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!sales || loading) return;

    const processData = () => {
      const filteredSales = Array.isArray(sales) 
        ? sales.filter(sale => {
            const saleDate = new Date(sale.createdAt || sale.date || Date.now());
            if (timeRange === 'yearly') {
              return saleDate.getFullYear() === selectedYear;
            } else {
              return saleDate.getFullYear() === selectedYear && 
                     saleDate.getMonth() === selectedMonth;
            }
          })
        : [];

      const paidSales = filteredSales.filter(sale => sale.status === 'paid');
      
      if (timeRange === 'yearly') {
        // Datos anuales por mes
        const monthlyData: { [key: number]: { sales: number, revenue: number } } = {};
        
        // Inicializar todos los meses
        months.forEach((_, index) => {
          monthlyData[index] = { sales: 0, revenue: 0 };
        });

        // Agregar datos
        paidSales.forEach(sale => {
          const saleDate = new Date(sale.createdAt || sale.date || Date.now());
          const month = saleDate.getMonth();
          
          monthlyData[month].sales += 1;
          monthlyData[month].revenue += sale.total || 0;
        });

        // Convertir a array para el gráfico
        const chartData = months.map((monthName, index) => ({
          month: monthName.substring(0, 3),
          sales: monthlyData[index].sales,
          revenue: monthlyData[index].revenue
        }));

        setSalesData(chartData);
      } else {
        // Datos mensuales por día
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const dailyData: SalesData[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
          const daySales = paidSales.filter(sale => {
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

      // Calcular estadísticas totales
      const totalSales = paidSales.length;
      const totalRevenue = paidSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Calcular crecimiento (comparar con periodo anterior)
      let growth = 0;
      if (timeRange === 'yearly') {
        const previousYearSales = Array.isArray(sales)
          ? sales.filter(sale => {
              const saleDate = new Date(sale.createdAt || sale.date || Date.now());
              return saleDate.getFullYear() === selectedYear - 1 && 
                     sale.status === 'paid';
            }).length
          : 0;
        
        growth = previousYearSales > 0 
          ? ((totalSales - previousYearSales) / previousYearSales) * 100 
          : 0;
      }

      setTotalStats({
        totalSales,
        totalRevenue,
        averageSale,
        growth
      });
    };

    processData();
  }, [sales, loading, timeRange, selectedYear, selectedMonth]);

  // Encontrar el valor máximo para escalar las barras
  const maxRevenue = salesData.length > 0 
    ? Math.max(...salesData.map(item => item.revenue))
    : 100;

  const maxSales = salesData.length > 0
    ? Math.max(...salesData.map(item => item.sales))
    : 10;

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Lade Verkaufsstatistiken...</p>
      </div>
    );
  }

  return (
    <div className={styles.salesChartContainer}>
      {/* Header minimalista */}
      <div className={styles.chartHeader}>
        <div>
          <h2 className={styles.chartTitle}>Verkaufsstatistik</h2>
          <p className={styles.chartSubtitle}>Analytics Dashboard</p>
        </div>
        
        <div className={styles.controls}>
          {/* Selector de rango de tiempo */}
          <div className={styles.timeRangeSelector}>
            <button
              className={`${styles.timeButton} ${timeRange === 'yearly' ? styles.active : ''}`}
              onClick={() => setTimeRange('yearly')}
            >
              Jährlich
            </button>
            <button
              className={`${styles.timeButton} ${timeRange === 'monthly' ? styles.active : ''}`}
              onClick={() => setTimeRange('monthly')}
            >
              Monatlich
            </button>
          </div>

          {/* Selectores de año/mes */}
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

      {/* Estadísticas principales minimalistas */}
      <div className={styles.statsOverview}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Gesamtumsatz</div>
            <div className={styles.statValue}>
              {totalStats.totalRevenue.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR'
              })}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Verkäufe</div>
            <div className={styles.statValue}>
              {totalStats.totalSales}
              {totalStats.growth !== 0 && (
                <span className={`${styles.growth} ${totalStats.growth > 0 ? styles.positive : styles.negative}`}>
                  {totalStats.growth > 0 ? '↗' : '↘'} {Math.abs(totalStats.growth).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Ø pro Verkauf</div>
            <div className={styles.statValue}>
              {totalStats.averageSale.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico minimalista */}
      <div className={styles.chartWrapper}>
        <div className={styles.chartHeaderRow}>
          <div className={styles.chartPeriodTitle}>
            {timeRange === 'yearly' ? 'Umsatz nach Monat' : 'Umsatz nach Tag'}
          </div>
          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.revenueDot}`}></div>
              <span>Umsatz</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.salesDot}`}></div>
              <span>Verkäufe</span>
            </div>
          </div>
        </div>
        
        <div className={styles.chartArea}>
          {/* Barras de ingresos */}
          <div className={styles.barsContainer}>
            {salesData.map((item, index) => (
              <div key={index} className={styles.barGroup}>
                <div className={styles.barLabel}>{item.month}</div>
                <div className={styles.barWrapper}>
                  <div 
                    className={styles.revenueBar}
                    style={{
                      height: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 70 : 0}%`
                    }}
                    title={`Umsatz: ${item.revenue.toLocaleString('de-DE', {
                      style: 'currency',
                      currency: 'EUR'
                    })}`}
                  >
                    <span className={styles.barValue}>
                      {item.revenue > 1000 
                        ? `€${(item.revenue / 1000).toFixed(0)}k`
                        : `€${Math.round(item.revenue)}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Línea de ventas minimalista */}
          <div className={styles.lineContainer}>
            {salesData.map((item, index) => (
              <div 
                key={index}
                className={styles.linePoint}
                style={{
                  left: `${(index / (salesData.length - 1 || 1)) * 100}%`,
                  bottom: `${maxSales > 0 ? (item.sales / maxSales) * 70 : 0}%`
                }}
                title={`${item.sales} Verkäufe`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de datos detallados plegable */}
      <div className={styles.detailsSection}>
        <button 
          className={styles.detailsToggle}
          onClick={() => setShowDetails(!showDetails)}
          aria-expanded={showDetails}
        >
          <span>Detailierte Daten</span>
          <svg 
            className={`${styles.toggleIcon} ${showDetails ? styles.rotated : ''}`} 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {showDetails && (
          <div className={styles.detailsContent}>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>{timeRange === 'yearly' ? 'Monat' : 'Tag'}</th>
                    <th>Verkäufe</th>
                    <th>Umsatz</th>
                    <th>Durchschnitt</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.month}</td>
                      <td>{item.sales}</td>
                      <td>
                        {item.revenue.toLocaleString('de-DE', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </td>
                      <td>
                        {item.sales > 0
                          ? (item.revenue / item.sales).toLocaleString('de-DE', {
                              style: 'currency',
                              currency: 'EUR',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })
                          : '€0.00'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}