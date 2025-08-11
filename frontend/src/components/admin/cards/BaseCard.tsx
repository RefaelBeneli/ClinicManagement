import React from 'react';
import { AdminCard } from '../types';
import styles from './BaseCard.module.css';

interface BaseCardProps extends AdminCard {
  onClick?: () => void;
  loading?: boolean;
}

const BaseCard: React.FC<BaseCardProps> = ({
  title,
  content,
  actions = [],
  status = 'normal',
  size = 'medium',
  onClick,
  loading = false
}) => {
  const handleCardClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: any) => {
    e.stopPropagation();
    if (!loading && action.onClick) {
      action.onClick();
    }
  };

  return (
    <div 
      className={`
        ${styles.baseCard} 
        ${styles[size]} 
        ${styles[status]} 
        ${onClick ? styles.clickable : ''} 
        ${loading ? styles.loading : ''}
      `}
      onClick={handleCardClick}
    >
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
      
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {status !== 'normal' && (
          <div className={`${styles.statusIndicator} ${styles[status]}`}>
            <span className={styles.statusDot}></span>
          </div>
        )}
      </div>
      
      <div className={styles.cardContent}>
        {content}
      </div>
      
      {actions.length > 0 && (
        <div className={styles.cardActions}>
          {actions.map((action, index) => (
            <button
              key={index}
              className={`${styles.cardAction} ${styles[action.variant]}`}
              onClick={(e) => handleActionClick(e, action)}
              disabled={loading}
            >
              {action.icon && <span className={styles.actionIcon}>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BaseCard; 