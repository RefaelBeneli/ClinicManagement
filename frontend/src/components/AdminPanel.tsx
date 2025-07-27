import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AdminPanel.css';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  enabled: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  totalClients: number;
  totalMeetings: number;
  totalPersonalMeetings: number;
}

const AdminPanel: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'clients' | 'meetings'>('dashboard');

  // Use the same API URL logic as the main API service
  const apiUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
        ? 'https://web-production-9aa8.up.railway.app/api'
        : 'http://localhost:8085/api');
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  }, [apiUrl, token]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/users?page=0&size=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers()]);
      setLoading(false);
    };

    loadAdminData();
  }, [fetchStats, fetchUsers]);

  if (loading) {
    return <div className="admin-loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>🛡️ Admin Panel</h2>
        <p>System administration and management</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'tab-active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'users' ? 'tab-active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={activeTab === 'clients' ? 'tab-active' : ''}
          onClick={() => setActiveTab('clients')}
        >
          🧑‍⚕️ Clients
        </button>
        <button 
          className={activeTab === 'meetings' ? 'tab-active' : ''}
          onClick={() => setActiveTab('meetings')}
        >
          📅 Meetings
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard">
            <h3>System Statistics</h3>
            {stats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.totalClients}</div>
                  <div className="stat-label">Total Clients</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.totalMeetings}</div>
                  <div className="stat-label">Client Meetings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.totalPersonalMeetings}</div>
                  <div className="stat-label">Personal Meetings</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-users">
            <h3>User Management</h3>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.fullName}</td>
                      <td>
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.enabled ? 'enabled' : 'disabled'}`}>
                          {user.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="admin-clients">
            <h3>Client Management</h3>
            <p>Client management functionality coming soon...</p>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="admin-meetings">
            <h3>Meeting Management</h3>
            <p>Meeting management functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 