import React from 'react';
import BaseCard from './BaseCard';
import styles from './PendingApprovalsCard.module.css';

interface PendingApprovalsCardProps {
  pendingCount: number;
  onViewAll: () => void;
  onQuickApprove: () => void;
  loading?: boolean;
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({
  pendingCount,
  onViewAll,
  onQuickApprove,
  loading = false
}) => {
  const content = (
    <div className={styles.pendingApprovalsContent}>
      <div className={styles.pendingCount}>
        <span className={styles.countNumber}>{pendingCount}</span>
        <span className={styles.countLabel}>
          {pendingCount === 1 ? 'User Waiting' : 'Users Waiting'}
        </span>
      </div>
      
      {pendingCount > 0 ? (
        <div className={styles.pendingDetails}>
          <p className={styles.description}>
            New registrations require your approval to access the system.
          </p>
          <div className={styles.urgencyIndicator}>
            <span className={styles.urgencyIcon}>⚠️</span>
            <span className={styles.urgencyText}>Action Required</span>
          </div>
        </div>
      ) : (
        <div className={styles.noApprovals}>
          <span className={styles.checkIcon}>✅</span>
          <p className={styles.description}>All users are approved</p>
        </div>
      )}
    </div>
  );

  const actions = pendingCount > 0 ? [
    {
      label: 'View All',
      action: 'view-all',
      variant: 'secondary' as const,
      icon: '👁️',
      onClick: onViewAll
    },
    {
      label: 'Quick Approve',
      action: 'quick-approve',
      variant: 'primary' as const,
      icon: '✅',
      onClick: onQuickApprove
    }
  ] : [
    {
      label: 'View Users',
      action: 'view-users',
      variant: 'secondary' as const,
      icon: '👥',
      onClick: onViewAll
    }
  ];

  return (
    <BaseCard
      id="pending-approvals"
      title="Pending Approvals"
      content={content}
      actions={actions}
      status={pendingCount > 0 ? 'warning' : 'normal'}
      priority="high"
      size="medium"
      loading={loading}
    />
  );
};

export default PendingApprovalsCard; 