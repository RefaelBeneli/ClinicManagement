import React from 'react';
import BaseCard from './BaseCard';
import styles from './QuickActionsCard.module.css';

interface QuickActionsCardProps {
  onQuickAction: (action: string, entityType: string, data?: any) => void;
  loading?: boolean;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ 
  onQuickAction, 
  loading = false 
}) => {
  const quickActions = [
    {
      label: 'Add User',
      icon: '👤',
      action: 'create',
      entityType: 'user',
      color: '#2563eb'
    },
    {
      label: 'Add Client',
      icon: '🧑‍⚕️',
      action: 'create',
      entityType: 'client',
      color: '#059669'
    },
    {
      label: 'Schedule Session',
      icon: '📅',
      action: 'create',
      entityType: 'session',
      color: '#7c3aed'
    },
    {
      label: 'Add Expense',
      icon: '💰',
      action: 'create',
      entityType: 'expense',
      color: '#dc2626'
    }
  ];

  const handleActionClick = (actionItem: typeof quickActions[0]) => {
    onQuickAction(actionItem.action, actionItem.entityType);
  };

  const content = (
    <div>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '0.5rem',
        fontSize: '0.875rem',
        color: '#64748b'
      }}>
        Common administrative tasks
      </div>
      
      <div className={styles.quickActionsContent}>
        {quickActions.map((actionItem, index) => (
          <button
            key={index}
            onClick={() => handleActionClick(actionItem)}
            disabled={loading}
            className={styles.quickActionButton}
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            <span className={styles.quickActionIcon}>
              {actionItem.icon}
            </span>
            <span className={styles.quickActionLabel}>
              {actionItem.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <BaseCard
      id="quick-actions"
      title="Quick Actions"
      content={content}
      status="normal"
      priority="high"
      size="medium"
      loading={loading}
    />
  );
};

export default QuickActionsCard; 