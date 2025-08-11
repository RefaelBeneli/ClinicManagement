import React from 'react';
import BaseCard from './BaseCard';
import { SystemHealth } from '../types';
import styles from './SystemHealthCard.module.css';

interface SystemHealthCardProps {
  loading?: boolean;
}

const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ loading = false }) => {
  // Mock system health data - this would come from API
  const systemHealth: SystemHealth = {
    status: 'good',
    uptime: '15 days, 3 hours',
    activeUsers: 24,
    systemLoad: 45,
    databaseStatus: 'connected'
  };

  const getStatusColor = (status: SystemHealth['status']) => {
    switch (status) {
      case 'good': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: SystemHealth['status']) => {
    switch (status) {
      case 'good': return '🟢';
      case 'warning': return '🟡';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  const content = (
    <div className={styles.systemHealthContent}>
      <div className={styles.statusRow}>
        <span className={styles.statusIcon}>{getStatusIcon(systemHealth.status)}</span>
        <span className={styles.statusText}>
          {systemHealth.status}
        </span>
      </div>
      
      <div className={styles.metricsGrid}>
        <div className={styles.metricItem}>
          <div className={styles.metricLabel}>Uptime</div>
          <div className={styles.metricValue}>{systemHealth.uptime}</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricLabel}>Active Users</div>
          <div className={styles.metricValue}>{systemHealth.activeUsers}</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricLabel}>System Load</div>
          <div className={styles.metricValue}>{systemHealth.systemLoad}%</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricLabel}>Database</div>
          <div className={`${styles.metricValue} ${systemHealth.databaseStatus === 'connected' ? styles.success : styles.error}`}>
            {systemHealth.databaseStatus === 'connected' ? '✓ Connected' : '✗ Disconnected'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <BaseCard
      id="system-health"
      title="System Health"
      content={content}
      status={systemHealth.status === 'good' ? 'normal' : 'warning'}
      priority="high"
      size="medium"
      loading={loading}
    />
  );
};

export default SystemHealthCard; 