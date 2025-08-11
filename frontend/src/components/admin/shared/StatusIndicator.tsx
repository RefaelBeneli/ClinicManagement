import React from 'react';
import styles from './StatusIndicator.module.css';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusIndicatorProps {
  status: StatusType;
  text?: string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  text,
  size = 'medium',
  showIcon = true,
  className = ''
}) => {
  const getStatusIcon = () => {
    if (!showIcon) return null;
    
    switch (status) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      case 'info':
        return 'ℹ';
      case 'neutral':
        return '•';
      default:
        return '•';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return styles.success;
      case 'warning':
        return styles.warning;
      case 'error':
        return styles.error;
      case 'info':
        return styles.info;
      case 'neutral':
        return styles.neutral;
      default:
        return styles.neutral;
    }
  };

  return (
    <div className={`${styles.statusIndicator} ${styles[size]} ${getStatusColor()} ${className}`}>
      {showIcon && (
        <span className={styles.statusIcon}>
          {getStatusIcon()}
        </span>
      )}
      {text && (
        <span className={styles.statusText}>
          {text}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator; 