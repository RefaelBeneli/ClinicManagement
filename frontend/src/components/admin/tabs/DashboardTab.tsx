import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../../services/adminApi';
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
  
  // Prevent duplicate API calls in React StrictMode
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchDashboardStats();
      fetchRecentActivity();
    }
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminApi.getDashboardStats();
      
      const statsData = response.data || {};
      
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalClients: statsData.totalClients || 0,
        totalSessions: statsData.totalSessions || 0,
        totalExpenses: statsData.totalExpenses || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({
        totalUsers: 0,
        totalClients: 0,
        totalSessions: 0,
        totalExpenses: 0
      });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await adminApi.getRecentActivity();
      
      const activityData = response.data || [];
      
      // Ensure all activity items have required properties
      const sanitizedActivityData = activityData.map((activity: any, index: number) => ({
        id: activity.id || `temp-${index}`,
        action: activity.action || 'Updated',
        userName: activity.userName || 'Unknown User',
        entity: activity.entity || 'item',
        entityId: activity.entityId || 'N/A',
        timestamp: activity.timestamp || new Date().toISOString()
      }));
      
      setRecentActivity(sanitizedActivityData);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  };

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
            <div key={activity.id || Math.random()} className="activity-item">
              <div className="activity-icon">
                {activity.action === 'Created' && '➕'}
                {activity.action === 'Updated' && '✏️'}
                {activity.action === 'Deleted' && '🗑️'}
                {!activity.action && '📝'}
              </div>
              <div className="activity-content">
                <div className="activity-text">
                  <strong>{activity.userName || 'Unknown User'}</strong> {activity.action?.toLowerCase() || 'performed action on'} {activity.entity || 'item'} #{activity.entityId || 'N/A'}
                </div>
                <div className="activity-time">
                  {activity.timestamp ? formatTimestamp(activity.timestamp) : 'Unknown time'}
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