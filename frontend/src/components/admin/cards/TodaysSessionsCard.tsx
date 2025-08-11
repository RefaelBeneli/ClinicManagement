import React from 'react';
import BaseCard from './BaseCard';
import { TodaySession } from '../types';
import styles from './TodaysSessionsCard.module.css';

interface TodaysSessionsCardProps {
  loading?: boolean;
}

const TodaysSessionsCard: React.FC<TodaysSessionsCardProps> = ({ loading = false }) => {
  // Mock today's sessions data - this would come from API
  const todaySessions: TodaySession[] = [
    { id: 1, clientName: 'Sarah Johnson', time: '09:00', type: 'Therapy', status: 'completed' },
    { id: 2, clientName: 'Michael Brown', time: '10:30', type: 'Consultation', status: 'in-progress' },
    { id: 3, clientName: 'Emma Wilson', time: '14:00', type: 'Follow-up', status: 'scheduled' },
    { id: 4, clientName: 'David Lee', time: '15:30', type: 'Therapy', status: 'scheduled' }
  ];

  const getStatusColor = (status: TodaySession['status']) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#06b6d4';
      case 'scheduled': return '#64748b';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: TodaySession['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'scheduled': return '📅';
      case 'cancelled': return '❌';
      default: return '📅';
    }
  };

  const content = (
    <div className={styles.sessionsContent}>
      <div className={styles.sessionsHeader}>
        <div className={styles.sessionsCount}>
          {todaySessions.length}
        </div>
        <div className={styles.sessionsLabel}>
          Sessions Today
        </div>
      </div>
      
      <div className={styles.sessionsList}>
        {todaySessions.slice(0, 3).map(session => (
          <div key={session.id} className={styles.sessionItem}>
            <div className={styles.sessionInfo}>
              <div className={styles.sessionTime}>
                {session.time} • {session.type}
              </div>
              <div className={styles.sessionClient}>
                {session.clientName}
              </div>
            </div>
            <div className={`${styles.sessionStatus} ${styles[session.status]}`}>
              {getStatusIcon(session.status)} {session.status}
            </div>
          </div>
        ))}
      </div>
      
      {todaySessions.length > 3 && (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: '#64748b',
          fontStyle: 'italic'
        }}>
          +{todaySessions.length - 3} more sessions
        </div>
      )}
    </div>
  );

  const actions = [
    {
      label: 'View All',
      action: 'view-all',
      variant: 'secondary' as const,
      icon: '📅',
      onClick: () => console.log('View all sessions')
    }
  ];

  return (
    <BaseCard
      id="todays-sessions"
      title="Today's Sessions"
      content={content}
      actions={actions}
      status="normal"
      priority="high"
      size="medium"
      loading={loading}
    />
  );
};

export default TodaysSessionsCard; 