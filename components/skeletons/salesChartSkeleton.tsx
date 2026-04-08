// components/skeletons/SalesChartSkeleton.tsx
import styles from './salesChartSkeleton.module.css';

export default function SalesChartSkeleton() {
  return (
    <div className={styles.container}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonSubtitle}></div>
        </div>
        <div className={styles.controls}>
          <div className={styles.skeletonViewSelector}></div>
          <div className={styles.skeletonTimeSelector}></div>
          <div className={styles.skeletonSelectors}>
            <div className={styles.skeletonSelect}></div>
            <div className={styles.skeletonSelect}></div>
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className={styles.statsGrid}>
        <div className={styles.statCardSkeleton}>
          <div className={styles.skeletonStatLabel}></div>
          <div className={styles.skeletonStatValue}></div>
        </div>
        <div className={styles.statCardSkeleton}>
          <div className={styles.skeletonStatLabel}></div>
          <div className={styles.skeletonStatValue}></div>
        </div>
        <div className={styles.statCardSkeleton}>
          <div className={styles.skeletonStatLabel}></div>
          <div className={styles.skeletonStatValue}></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className={styles.tableSkeleton}>
        <div className={styles.tableHeaderSkeleton}>
          <div className={styles.skeletonTableTitle}></div>
          <div className={styles.skeletonTableSubtitle}></div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.skeletonTable}>
            <thead>
              <tr>
                <th><div className={styles.skeletonTh}></div></th>
                <th><div className={styles.skeletonTh}></div></th>
                <th><div className={styles.skeletonTh}></div></th>
                <th><div className={styles.skeletonTh}></div></th>
                <th><div className={styles.skeletonTh}></div></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, index) => (
                <tr key={index}>
                  <td><div className={styles.skeletonTd}></div></td>
                  <td><div className={styles.skeletonTd}></div></td>
                  <td><div className={styles.skeletonTd}></div></td>
                  <td><div className={styles.skeletonTd}></div></td>
                  <td>
                    <div className={styles.skeletonContributionBar}>
                      <div className={styles.skeletonContributionFill}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Skeleton */}
      <div className={styles.insightsSkeleton}>
        <div className={styles.skeletonInsightItem}></div>
        <div className={styles.skeletonInsightItem}></div>
      </div>
    </div>
  );
}