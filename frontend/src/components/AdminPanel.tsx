import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserApprovalPanel from './UserApprovalPanel';
import UserEditModal from './UserEditModal';
import MeetingPanel from './MeetingPanel';
import ExpensePanel from './ExpensePanel';
import Calendar from './Calendar';
import SourceManagementTab from './SourceManagementTab';
import { userApproval, clients, meetings, expenses } from '../services/api';
import { Client, Meeting, Expense } from '../types';
import './AdminPanel.css';

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

const AdminPanel: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [clientList, setClientList] = useState<Client[]>([]);
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'clients' | 'meetings' | 'expenses' | 'calendar' | 'sources'>('dashboard');
  
  // User approval states
  const [showUserApprovalPanel, setShowUserApprovalPanel] = useState(false);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Panel states
  const [showMeetingPanel, setShowMeetingPanel] = useState(false);
  const [showExpensePanel, setShowExpensePanel] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalMeetings: 0,
    totalExpenses: 0,
    pendingApprovals: 0
  });

  // Use the same API URL logic as the main API service
  const apiUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
        ? 'https://web-production-9aa8.up.railway.app/api'
        : 'http://localhost:8085/api');
  }, []);

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
      const [usersResponse, clientsData, meetingsData, expensesData] = await Promise.all([
        fetch(`${apiUrl}/admin/users?page=0&size=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        clients.getAll(),
        meetings.getAll(),
        expenses.getAll()
      ]);

      const usersData = await usersResponse.json();
      
      setStats({
        totalUsers: usersData.totalElements || 0,
        totalClients: clientsData.length,
        totalMeetings: meetingsData.length,
        totalExpenses: expensesData.length,
        pendingApprovals: pendingUsersCount
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [apiUrl, token, pendingUsersCount]);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUsers(), 
        fetchClients(), 
        fetchMeetings(), 
        fetchExpenses(),
        fetchPendingUsersCount(),
        fetchStats()
      ]);
      setLoading(false);
    };

    loadAdminData();
  }, [fetchUsers, fetchClients, fetchMeetings, fetchExpenses, fetchPendingUsersCount, fetchStats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(), 
      fetchClients(), 
      fetchMeetings(), 
      fetchExpenses(),
      fetchPendingUsersCount(),
      fetchStats()
    ]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Admin Header with Logout */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h2>🛡️ Admin Panel</h2>
          <p>Welcome back, {user?.fullName || user?.username}!</p>
        </div>
        <div className="admin-header-right">
          <button className="btn-refresh" onClick={handleRefreshData}>
            🔄 Refresh
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
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
          👥 Users {pendingUsersCount > 0 && (<span className="badge">{pendingUsersCount}</span>)}
        </button>
        <button 
          className={activeTab === 'clients' ? 'tab-active' : ''}
          onClick={() => setActiveTab('clients')}
        >
          🧑‍⚕️ Clients ({stats.totalClients})
        </button>
        <button 
          className={activeTab === 'meetings' ? 'tab-active' : ''}
          onClick={() => setActiveTab('meetings')}
        >
          📅 Meetings ({stats.totalMeetings})
        </button>
        <button 
          className={activeTab === 'expenses' ? 'tab-active' : ''}
          onClick={() => setActiveTab('expenses')}
        >
          💰 Expenses ({stats.totalExpenses})
        </button>
        <button 
          className={activeTab === 'calendar' ? 'tab-active' : ''}
          onClick={() => setActiveTab('calendar')}
        >
          📆 Calendar
        </button>
        <button 
          className={activeTab === 'sources' ? 'tab-active' : ''}
          onClick={() => setActiveTab('sources')}
        >
          🏷️ Sources
        </button>
      </div>

      {/* Admin Content */}
      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard">
            <h3>📊 System Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h4>Total Users</h4>
                  <div className="stat-value">{stats.totalUsers}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🧑‍⚕️</div>
                <div className="stat-content">
                  <h4>Total Clients</h4>
                  <div className="stat-value">{stats.totalClients}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h4>Total Meetings</h4>
                  <div className="stat-value">{stats.totalMeetings}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h4>Total Expenses</h4>
                  <div className="stat-value">{stats.totalExpenses}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h4>Pending Approvals</h4>
                  <div className="stat-value">{stats.pendingApprovals}</div>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h4>🚀 Quick Actions</h4>
              <div className="action-buttons">
                <button onClick={() => setActiveTab('users')}>Manage Users</button>
                <button onClick={() => setShowMeetingPanel(true)}>Manage Meetings</button>
                <button onClick={() => setShowExpensePanel(true)}>Manage Expenses</button>
                <button onClick={() => setShowCalendar(true)}>View Calendar</button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
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
                            onClick={() => userApproval.approveUser(user.id, { userId: user.id }).then(fetchUsers)}
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
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
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
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="admin-meetings">
            <div className="section-header">
              <h3>📅 Meeting Management</h3>
              <p>Total Meetings: {stats.totalMeetings}</p>
            </div>
            <div className="meetings-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetingList.map((meeting) => (
                    <tr key={meeting.id}>
                      <td>{meeting.id}</td>
                      <td>{meeting.client.fullName}</td>
                      <td>{new Date(meeting.meetingDate).toLocaleString()}</td>
                      <td>{meeting.duration} min</td>
                      <td>₪{meeting.price}</td>
                      <td>
                        <span className={`status-badge ${meeting.status?.toLowerCase() || 'unknown'}`}>
                          {meeting.status || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className={`payment-badge ${meeting.isPaid ? 'paid' : 'unpaid'}`}>
                          {meeting.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
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
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="admin-expenses">
            <div className="section-header">
              <h3>💰 Expense Management</h3>
              <p>Total Expenses: {stats.totalExpenses}</p>
            </div>
            <div className="expenses-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseList.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.id}</td>
                      <td>{expense.description}</td>
                      <td>₪{expense.amount}</td>
                      <td>{expense.category.name}</td>
                      <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`payment-badge ${expense.isPaid ? 'paid' : 'unpaid'}`}>
                          {expense.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
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
        )}

        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <div className="admin-sources">
            <div className="section-header">
              <h3>🏷️ Meeting Sources</h3>
              <p>Manage meeting sources and their default values</p>
            </div>
            <SourceManagementTab />
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="admin-calendar">
            <div className="section-header">
              <h3>📆 Calendar View</h3>
              <p>All meetings and appointments</p>
            </div>
            <Calendar 
              meetings={meetingList} 
              onClose={() => setActiveTab('dashboard')}
            />
          </div>
        )}
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

      {showMeetingPanel && (
        <MeetingPanel 
          onClose={() => setShowMeetingPanel(false)}
          onRefresh={fetchMeetings}
        />
      )}

      {showExpensePanel && (
        <ExpensePanel 
          onClose={() => setShowExpensePanel(false)}
          onRefresh={fetchExpenses}
        />
      )}

      {showCalendar && (
        <div className="modal-overlay">
          <div className="modal calendar-modal">
            <div className="modal-header">
              <h3>📆 Calendar View</h3>
              <button className="close-button" onClick={() => setShowCalendar(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <Calendar 
                meetings={meetingList} 
                onClose={() => setShowCalendar(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 