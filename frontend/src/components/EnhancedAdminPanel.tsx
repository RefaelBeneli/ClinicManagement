import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar, { AdminSection } from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import UserApprovalPanel from './UserApprovalPanel';
import UserEditModal from './UserEditModal';
import MeetingPanel from './MeetingPanel';
import ExpensePanel from './ExpensePanel';
import PersonalMeetingPanel from './PersonalMeetingPanel';
import Calendar from './Calendar';
import SourceManagementTab from './SourceManagementTab';
import AnalyticsPanel from './AnalyticsPanel';
import { userApproval, clients, meetings, expenses, personalMeetings } from '../services/api';
import { Client, Meeting, Expense, PersonalMeeting } from '../types';
import './EnhancedAdminPanel.css';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  enabled: boolean;
  approvalStatus: string;
  createdAt: string;
}

const EnhancedAdminPanel: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [clientList, setClientList] = useState<Client[]>([]);
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const [personalMeetingList, setPersonalMeetingList] = useState<PersonalMeeting[]>([]);
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation states
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Modal and panel states
  const [showUserApprovalPanel, setShowUserApprovalPanel] = useState(false);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalMeetings: 0,
    totalPersonalMeetings: 0,
    totalExpenses: 0,
    pendingApprovals: 0
  });

  // API URL configuration
  const apiUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
        ? 'https://web-production-9aa8.up.railway.app/api'
        : 'http://localhost:8085/api');
  }, []);

  // Data fetching functions
  const fetchPendingUsersCount = useCallback(async () => {
    try {
      const count = await userApproval.getPendingCount();
      setPendingUsersCount(count.count);
    } catch (error) {
      console.error('Failed to fetch pending users count:', error);
      setPendingUsersCount(0);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/users?page=0&size=100`, {
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

  const fetchClients = useCallback(async () => {
    try {
      const clientsData = await clients.getAll();
      setClientList(clientsData);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  }, []);

  const fetchMeetings = useCallback(async () => {
    try {
      const meetingsData = await meetings.getAll();
      setMeetingList(meetingsData);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    }
  }, []);

  const fetchPersonalMeetings = useCallback(async () => {
    try {
      const personalMeetingsData = await personalMeetings.getAll();
      setPersonalMeetingList(personalMeetingsData);
    } catch (error) {
      console.error('Failed to fetch personal meetings:', error);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const expensesData = await expenses.getAll();
      setExpenseList(expensesData);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [usersResponse, clientsData, meetingsData, personalMeetingsData, expensesData] = await Promise.all([
        fetch(`${apiUrl}/admin/users?page=0&size=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        clients.getAll(),
        meetings.getAll(),
        personalMeetings.getAll(),
        expenses.getAll()
      ]);

      const usersData = await usersResponse.json();
      
      setStats({
        totalUsers: usersData.totalElements || 0,
        totalClients: clientsData.length,
        totalMeetings: meetingsData.length,
        totalPersonalMeetings: personalMeetingsData.length,
        totalExpenses: expensesData.length,
        pendingApprovals: pendingUsersCount
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [apiUrl, token, pendingUsersCount]);

  // Load all admin data
  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(), 
        fetchClients(), 
        fetchMeetings(), 
        fetchPersonalMeetings(),
        fetchExpenses(),
        fetchPendingUsersCount()
      ]);
      await fetchStats();
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchClients, fetchMeetings, fetchPersonalMeetings, fetchExpenses, fetchPendingUsersCount, fetchStats]);

  // Initialize data on mount
  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Event handlers
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'users':
        setActiveSection('users');
        break;
      case 'clients':
        setActiveSection('clients');
        break;
      case 'sessions':
        setActiveSection('sessions');
        break;
      case 'personal-meetings':
        setActiveSection('personal-meetings');
        break;
      case 'expenses':
        setActiveSection('expenses');
        break;
      case 'analytics':
        setActiveSection('analytics');
        break;
      case 'settings':
        setActiveSection('settings');
        break;
      default:
        setActiveSection('dashboard');
    }
  };

  const handleRefresh = async () => {
    await loadAdminData();
  };

  // Render content based on active section
  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <AdminDashboard
            stats={stats}
            onQuickAction={handleQuickAction}
            onRefresh={handleRefresh}
          />
        );

      case 'users':
        return (
          <div className="admin-users">
            <div className="section-header">
              <h3>👥 User Management</h3>
              <button 
                className="btn-primary"
                onClick={() => setShowUserApprovalPanel(true)}
              >
                Review Pending Users ({pendingUsersCount})
              </button>
            </div>
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
                    <th>Approval</th>
                    <th>Actions</th>
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
                        <span className={`role-badge ${user.role?.toLowerCase() || 'unknown'}`}>
                          {user.role || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.enabled ? 'enabled' : 'disabled'}`}>
                          {user.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <span className={`approval-badge ${user.approvalStatus?.toLowerCase() || 'unknown'}`}>
                          {user.approvalStatus || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => setEditingUserId(user.id)}
                        >
                          Edit
                        </button>
                        {user.approvalStatus === 'PENDING' && (
                          <button 
                            className="btn-small btn-approve"
                            onClick={() => userApproval.approveUser(user.id, { approvalStatus: 'APPROVED' }).then(fetchUsers)}
                          >
                            Approve
                          </button>
                        )}
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'clients':
        return (
          <div className="admin-clients">
            <div className="section-header">
              <h3>🧑‍⚕️ Client Management</h3>
              <p>Total Clients: {stats.totalClients}</p>
            </div>
            <div className="clients-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clientList.map((client) => (
                    <tr key={client.id}>
                      <td>{client.id}</td>
                      <td>{client.fullName}</td>
                      <td>{client.email || 'N/A'}</td>
                      <td>{client.phone || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${client.active ? 'enabled' : 'disabled'}`}>
                          {client.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-small">View</button>
                        <button className="btn-small">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'sessions':
        return (
          <MeetingPanel 
            onClose={() => setActiveSection('dashboard')}
            onRefresh={fetchMeetings}
          />
        );

      case 'personal-meetings':
        return (
          <PersonalMeetingPanel 
            onClose={() => setActiveSection('dashboard')}
            onRefresh={fetchPersonalMeetings}
          />
        );

      case 'expenses':
        return (
          <ExpensePanel 
            onClose={() => setActiveSection('dashboard')}
            onRefresh={fetchExpenses}
          />
        );

      case 'sources':
        return (
          <div className="admin-sources">
            <div className="section-header">
              <h3>🏷️ Meeting Sources</h3>
              <p>Manage meeting sources and their default values</p>
            </div>
            <SourceManagementTab />
          </div>
        );

      case 'calendar':
        return (
          <div className="admin-calendar">
            <div className="section-header">
              <h3>📆 Calendar View</h3>
              <p>All meetings and appointments</p>
            </div>
            <Calendar 
              meetings={meetingList} 
              onClose={() => setActiveSection('dashboard')}
            />
          </div>
        );

      case 'analytics':
        return (
          <div className="admin-analytics">
            <div className="section-header">
              <h3>📊 Analytics & Reports</h3>
              <p>System insights and performance metrics</p>
            </div>
            <AnalyticsPanel />
          </div>
        );

      case 'expense-categories':
        return (
          <div className="admin-expense-categories">
            <div className="section-header">
              <h3>🏷️ Expense Categories</h3>
              <p>Manage expense categories and settings</p>
            </div>
            <div className="coming-soon">
              <h4>🚧 Coming Soon</h4>
              <p>Expense category management will be available in the next update.</p>
            </div>
          </div>
        );

      case 'payment-types':
        return (
          <div className="admin-payment-types">
            <div className="section-header">
              <h3>💳 Payment Types</h3>
              <p>Configure payment methods and settings</p>
            </div>
            <div className="coming-soon">
              <h4>🚧 Coming Soon</h4>
              <p>Payment type management will be available in the next update.</p>
            </div>
          </div>
        );

      case 'meeting-types':
        return (
          <div className="admin-meeting-types">
            <div className="section-header">
              <h3>📋 Meeting Types</h3>
              <p>Manage personal meeting types and configurations</p>
            </div>
            <div className="coming-soon">
              <h4>🚧 Coming Soon</h4>
              <p>Meeting type management will be available in the next update.</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="admin-settings">
            <div className="section-header">
              <h3>⚙️ System Settings</h3>
              <p>Global system configuration and preferences</p>
            </div>
            <div className="coming-soon">
              <h4>🚧 Coming Soon</h4>
              <p>System settings will be available in the next update.</p>
            </div>
          </div>
        );

      default:
        return (
          <AdminDashboard
            stats={stats}
            onQuickAction={handleQuickAction}
            onRefresh={handleRefresh}
          />
        );
    }
  };

  return (
    <div className="enhanced-admin-panel">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        pendingUsersCount={pendingUsersCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div className={`admin-main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Bar */}
        <div className="admin-top-bar">
          <div className="breadcrumb">
            <span>Admin Panel</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace('-', ' ')}
            </span>
          </div>
          <div className="top-bar-actions">
            <span className="user-info">Welcome, {user?.fullName || user?.username}!</span>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-content-wrapper">
          {renderMainContent()}
        </div>
      </div>

      {/* Modals */}
      {showUserApprovalPanel && (
        <UserApprovalPanel 
          onClose={() => {
            setShowUserApprovalPanel(false);
            fetchPendingUsersCount();
            fetchUsers();
          }}
        />
      )}
      
      {editingUserId && (
        <UserEditModal 
          userId={editingUserId} 
          onClose={() => setEditingUserId(null)} 
          onSaved={fetchUsers} 
        />
      )}
    </div>
  );
};

export default EnhancedAdminPanel; 