import React, { useState, useEffect } from 'react';
import './DashboardTab.css';

interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalSessions: number;
  totalExpenses: number;
}

interface RecentActivity {
  id: number;
  action: string;
  entity: string;
  entityId: number;
  timestamp: string;
  userId: number;
  userName: string;
}

const DashboardTab: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalClients: 0,
    totalSessions: 0,
    totalExpenses: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    // fetchDashboardStats();
    // fetchRecentActivity();
    
    // Mock data for now
    setTimeout(() => {
      setStats({
        totalUsers: 12,
        totalClients: 15,
        totalSessions: 12,
        totalExpenses: 12
      });
      
      setRecentActivity([
        {
          id: 1,
          action: 'Created',
          entity: 'Client',
          entityId: 123,
          timestamp: '2025-01-15T10:30:00Z',
          userId: 1,
          userName: 'Admin User'
        },
        {
          id: 2,
          action: 'Updated',
          entity: 'Session',
          entityId: 456,
          timestamp: '2025-01-15T09:15:00Z',
          userId: 1,
          userName: 'Admin User'
        },
        {
          id: 3,
          action: 'Deleted',
          entity: 'Expense',
          entityId: 789,
          timestamp: '2025-01-15T08:45:00Z',
          userId: 1,
          userName: 'Admin User'
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-tab">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalClients}</div>
            <div className="stat-label">Total Clients</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSessions}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalExpenses}</div>
            <div className="stat-label">Total Expenses</div>
          </div>
        </div>
      </div>
      
      <div className="recent-activity-section">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {activity.action === 'Created' && '➕'}
                {activity.action === 'Updated' && '✏️'}
                {activity.action === 'Deleted' && '🗑️'}
              </div>
              <div className="activity-content">
                <div className="activity-text">
                  <strong>{activity.userName}</strong> {activity.action.toLowerCase()} {activity.entity} #{activity.entityId}
                </div>
                <div className="activity-time">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab; 