import React from 'react';
import BaseCard from './BaseCard';
import StatusIndicator from '../shared/StatusIndicator';
import styles from './RecentActivityCard.module.css';

interface RecentActivity {
  id: string;
  type: 'user' | 'session' | 'client' | 'expense' | 'system';
  action: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  user?: string;
}

interface RecentActivityCardProps {
  loading?: boolean;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ loading = false }) => {
  // Mock recent activity data - this would come from API
  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'user',
      action: 'User Registration',
      description: 'New therapist account created',
      timestamp: '2 minutes ago',
      status: 'completed',
      user: 'Dr. Sarah Johnson'
    },
    {
      id: '2',
      type: 'session',
      action: 'Session Scheduled',
      description: 'Therapy session booked for tomorrow',
      timestamp: '15 minutes ago',
      status: 'completed',
      user: 'Michael Brown'
    },
    {
      id: '3',
      type: 'expense',
      action: 'Expense Added',
      description: 'Office supplies purchase recorded',
      timestamp: '1 hour ago',
      status: 'pending',
      user: 'Admin'
    },
    {
      id: '4',
      type: 'client',
      action: 'Client Updated',
      description: 'Contact information modified',
      timestamp: '2 hours ago',
      status: 'completed',
      user: 'Emma Wilson'
    }
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user': return '👤';
      case 'session': return '📅';
      case 'client': return '🧑‍⚕️';
      case 'expense': return '💰';
      case 'system': return '⚙️';
      default: return '📝';
    }
  };

  const getStatusType = (status: RecentActivity['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'neutral';
    }
  };

  const content = (
    <div className={styles.recentActivityContent}>
      <div className={styles.activitiesList}>
        {recentActivities.map((activity) => (
          <div key={activity.id} className={styles.activityItem}>
            <div className={styles.activityIcon}>
              {getActivityIcon(activity.type)}
            </div>
            <div className={styles.activityDetails}>
              <div className={styles.activityHeader}>
                <span className={styles.activityAction}>{activity.action}</span>
                <StatusIndicator
                  status={getStatusType(activity.status)}
                  size="small"
                  showIcon={false}
                />
              </div>
              <div className={styles.activityDescription}>
                {activity.description}
              </div>
              <div className={styles.activityMeta}>
                <span className={styles.activityUser}>{activity.user}</span>
                <span className={styles.activityTime}>{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const actions = [
    {
      label: 'View All',
      action: 'view-all',
      variant: 'secondary' as const,
      icon: '📋',
      onClick: () => console.log('View all activities')
    }
  ];

  return (
    <BaseCard
      id="recent-activity"
      title="Recent Activity"
      content={content}
      actions={actions}
      status="normal"
      priority="medium"
      size="medium"
      loading={loading}
    />
  );
};

export default RecentActivityCard; 