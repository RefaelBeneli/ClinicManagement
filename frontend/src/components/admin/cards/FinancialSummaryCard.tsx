import React from 'react';
import BaseCard from './BaseCard';
import styles from './FinancialSummaryCard.module.css';

interface FinancialMetric {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

interface FinancialSummaryCardProps {
  loading?: boolean;
}

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({ loading = false }) => {
  // Mock financial data - this would come from API
  const financialMetrics: FinancialMetric[] = [
    {
      label: 'Monthly Revenue',
      value: '$24,500',
      change: '+12.5%',
      changeType: 'positive',
      icon: '💰'
    },
    {
      label: 'Pending Payments',
      value: '$3,200',
      change: '+5.2%',
      changeType: 'positive',
      icon: '⏳'
    },
    {
      label: 'Expenses',
      value: '$8,750',
      change: '-2.1%',
      changeType: 'negative',
      icon: '💸'
    },
    {
      label: 'Net Profit',
      value: '$15,750',
      change: '+18.3%',
      changeType: 'positive',
      icon: '📈'
    }
  ];

  const getChangeColor = (changeType: FinancialMetric['changeType']) => {
    switch (changeType) {
      case 'positive':
        return styles.positive;
      case 'negative':
        return styles.negative;
      case 'neutral':
        return styles.neutral;
      default:
        return styles.neutral;
    }
  };

  const content = (
    <div className={styles.financialContent}>
      <div className={styles.metricsGrid}>
        {financialMetrics.map((metric, index) => (
          <div key={index} className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>{metric.icon}</span>
              <span className={styles.metricLabel}>{metric.label}</span>
            </div>
            <div className={styles.metricValue}>{metric.value}</div>
            <div className={`${styles.metricChange} ${getChangeColor(metric.changeType)}`}>
              {metric.change}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.summaryFooter}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total Clients:</span>
          <span className={styles.summaryValue}>156</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Active Sessions:</span>
          <span className={styles.summaryValue}>89</span>
        </div>
      </div>
    </div>
  );

  const actions = [
    {
      label: 'View Details',
      action: 'view-details',
      variant: 'secondary' as const,
      icon: '📊',
      onClick: () => console.log('View financial details')
    },
    {
      label: 'Export Report',
      action: 'export-report',
      variant: 'secondary' as const,
      icon: '📥',
      onClick: () => console.log('Export financial report')
    }
  ];

  return (
    <BaseCard
      id="financial-summary"
      title="Financial Summary"
      content={content}
      actions={actions}
      status="normal"
      priority="medium"
      size="large"
      loading={loading}
    />
  );
};

export default FinancialSummaryCard; 