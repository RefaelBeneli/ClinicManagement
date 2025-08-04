import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clients, meetings, expenses, personalMeetings } from '../services/api';
import { Client, Meeting, PersonalMeeting, Expense, MeetingStatus, DashboardStats, ExpenseSummary } from '../types';
import SimpleChart from './SimpleChart';
import './EnhancedDashboard.css';

interface DashboardData {
  clients: Client[];
  meetings: Meeting[];
  personalMeetings: PersonalMeeting[];
  expenses: Expense[];
  stats: DashboardStats;
  expenseSummary: ExpenseSummary | null;
}

interface QuickMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
  description: string;
}

const EnhancedDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData>({
    clients: [],
    meetings: [],
    personalMeetings: [],
    expenses: [],
    stats: { meetingsToday: 0, unpaidSessions: 0, monthlyRevenue: 0 },
    expenseSummary: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'sessions' | 'clients'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month');

  // Modal states
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showScheduleMeetingModal, setShowScheduleMeetingModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsData, meetingsData, personalMeetingsData, expensesData, statsData] = await Promise.all([
        clients.getAll(),
        meetings.getAll(),
        personalMeetings.getAll(),
        expenses.getAll(),
        meetings.getDashboardStats()
      ]);

      let expenseSummaryData = null;
      try {
        expenseSummaryData = await expenses.getSummary();
      } catch (error) {
        console.warn('Could not fetch expense summary:', error);
      }

      setData({
        clients: clientsData,
        meetings: meetingsData,
        personalMeetings: personalMeetingsData,
        expenses: expensesData,
        stats: statsData,
        expenseSummary: expenseSummaryData
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate derived metrics
  const metrics = useMemo((): QuickMetric[] => {
    const totalRevenue = data.meetings.reduce((sum, m) => sum + m.price, 0);
    const paidRevenue = data.meetings.filter(m => m.isPaid).reduce((sum, m) => sum + m.price, 0);
    const completedMeetings = data.meetings.filter(m => m.status === 'COMPLETED').length;
    const activeClients = data.clients.filter(c => c.active).length;
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = paidRevenue - totalExpenses;

    return [
      {
        id: 'revenue',
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: 12.5,
        icon: '💰',
        color: 'primary',
        description: 'All time revenue'
      },
      {
        id: 'sessions',
        title: 'Sessions Today',
        value: data.stats.meetingsToday,
        change: 8.3,
        icon: '📅',
        color: 'success',
        description: 'Scheduled for today'
      },
      {
        id: 'clients',
        title: 'Active Clients',
        value: activeClients,
        change: 15.2,
        icon: '👥',
        color: 'info',
        description: 'Current active clients'
      },
      {
        id: 'profit',
        title: 'Net Profit',
        value: formatCurrency(netProfit),
        change: -5.1,
        icon: '💵',
        color: 'warning',
        description: 'Revenue minus expenses'
      }
    ];
  }, [data]);

  // Calculate chart data
  const chartData = useMemo(() => {
    const meetingStatusData = data.meetings.reduce((acc, meeting) => {
      acc[meeting.status] = (acc[meeting.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const revenueData = [
      { label: 'Paid', value: data.meetings.filter(m => m.isPaid).reduce((sum, m) => sum + m.price, 0), color: '#43e97b' },
      { label: 'Pending', value: data.meetings.filter(m => !m.isPaid).reduce((sum, m) => sum + m.price, 0), color: '#fa709a' }
    ];

    const clientGrowthData = [
      { label: 'This Month', value: data.clients.filter(c => {
        const createdAt = new Date(c.createdAt);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length, color: '#667eea' },
      { label: 'Last Month', value: Math.floor(data.clients.length * 0.8), color: '#764ba2' }
    ];

    return {
      meetingStatus: Object.entries(meetingStatusData).map(([status, count]) => ({
        label: status.replace('_', ' '),
        value: count,
        color: status === 'COMPLETED' ? '#43e97b' : 
               status === 'SCHEDULED' ? '#4facfe' : 
               status === 'CANCELLED' ? '#fa709a' : '#6c757d'
      })),
      revenue: revenueData,
      clientGrowth: clientGrowthData
    };
  }, [data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const handleLogout = () => {
    logout();
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-client':
        setShowAddClientModal(true);
        break;
      case 'schedule-meeting':
        setShowScheduleMeetingModal(true);
        break;
      case 'view-calendar':
        setShowCalendar(true);
        break;
      case 'analytics':
        setShowAnalytics(true);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="enhanced-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <h2>Loading your dashboard...</h2>
          <p>Preparing your practice overview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🏥 Clinic Dashboard</h1>
            <p className="header-subtitle">Welcome back, {user?.fullName}</p>
          </div>
          <div className="header-right">
            <div className="period-selector">
              <label>Time Period:</label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="period-select"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <span>👋</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          💰 Revenue
        </button>
        <button 
          className={`nav-tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          📅 Sessions
        </button>
        <button 
          className={`nav-tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          👥 Clients
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={fetchDashboardData}>Retry</button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            {/* Quick Metrics */}
            <div className="metrics-grid">
              {metrics.map((metric) => (
                <div key={metric.id} className={`metric-card metric-card--${metric.color}`}>
                  <div className="metric-header">
                    <div className="metric-icon">{metric.icon}</div>
                    <div className="metric-change">
                      <span className={`change-indicator ${getChangeColor(metric.change)}`}>
                        {formatPercentage(metric.change)}
                      </span>
                    </div>
                  </div>
                  <div className="metric-content">
                    <h3 className="metric-value">{metric.value}</h3>
                    <p className="metric-title">{metric.title}</p>
                    <p className="metric-description">{metric.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="charts-section">
              <div className="charts-grid">
                <div className="chart-container">
                  <SimpleChart
                    data={chartData.meetingStatus}
                    title="Session Status Distribution"
                    type="pie"
                    height={300}
                  />
                </div>
                <div className="chart-container">
                  <SimpleChart
                    data={chartData.revenue}
                    title="Revenue Breakdown"
                    type="pie"
                    height={300}
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h3>⚡ Quick Actions</h3>
              <div className="actions-grid">
                <button 
                  className="action-card"
                  onClick={() => handleQuickAction('add-client')}
                >
                  <div className="action-icon">👤</div>
                  <h4>Add Client</h4>
                  <p>Register a new client</p>
                </button>
                <button 
                  className="action-card"
                  onClick={() => handleQuickAction('schedule-meeting')}
                >
                  <div className="action-icon">📅</div>
                  <h4>Schedule Session</h4>
                  <p>Book a new appointment</p>
                </button>
                <button 
                  className="action-card"
                  onClick={() => handleQuickAction('view-calendar')}
                >
                  <div className="action-icon">📊</div>
                  <h4>View Calendar</h4>
                  <p>See all appointments</p>
                </button>
                <button 
                  className="action-card"
                  onClick={() => handleQuickAction('analytics')}
                >
                  <div className="action-icon">📈</div>
                  <h4>Analytics</h4>
                  <p>Detailed insights</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity-section">
              <h3>🕒 Recent Activity</h3>
              <div className="activity-list">
                {data.meetings.slice(0, 5).map((meeting) => (
                  <div key={meeting.id} className="activity-item">
                    <div className="activity-icon">📅</div>
                    <div className="activity-content">
                      <h4>Session with {meeting.client.fullName}</h4>
                      <p>{new Date(meeting.meetingDate).toLocaleDateString()} at {new Date(meeting.meetingDate).toLocaleTimeString()}</p>
                    </div>
                    <div className="activity-status">
                      <span className={`status-badge ${meeting.status.toLowerCase()}`}>
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="revenue-section">
            <div className="revenue-overview">
              <div className="revenue-summary">
                <h3>Revenue Summary</h3>
                <div className="revenue-metrics">
                  <div className="revenue-metric">
                    <span className="metric-label">Total Revenue</span>
                    <span className="metric-value">{formatCurrency(data.meetings.reduce((sum, m) => sum + m.price, 0))}</span>
                  </div>
                  <div className="revenue-metric">
                    <span className="metric-label">Paid Revenue</span>
                    <span className="metric-value">{formatCurrency(data.meetings.filter(m => m.isPaid).reduce((sum, m) => sum + m.price, 0))}</span>
                  </div>
                  <div className="revenue-metric">
                    <span className="metric-label">Collection Rate</span>
                    <span className="metric-value">
                      {data.meetings.length > 0 
                        ? Math.round((data.meetings.filter(m => m.isPaid).length / data.meetings.length) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="revenue-charts">
              <SimpleChart
                data={chartData.revenue}
                title="Revenue Distribution"
                type="pie"
                height={400}
              />
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="sessions-section">
            <div className="sessions-overview">
              <h3>Session Overview</h3>
              <div className="sessions-stats">
                <div className="session-stat">
                  <span className="stat-label">Total Sessions</span>
                  <span className="stat-value">{data.meetings.length}</span>
                </div>
                <div className="session-stat">
                  <span className="stat-label">Completed</span>
                  <span className="stat-value">{data.meetings.filter(m => m.status === 'COMPLETED').length}</span>
                </div>
                <div className="session-stat">
                  <span className="stat-label">Scheduled</span>
                  <span className="stat-value">{data.meetings.filter(m => m.status === 'SCHEDULED').length}</span>
                </div>
                <div className="session-stat">
                  <span className="stat-label">Today</span>
                  <span className="stat-value">{data.stats.meetingsToday}</span>
                </div>
              </div>
            </div>

            <div className="sessions-charts">
              <SimpleChart
                data={chartData.meetingStatus}
                title="Session Status Distribution"
                type="pie"
                height={400}
              />
            </div>

            <div className="sessions-list">
              <h3>Recent Sessions</h3>
              <div className="session-items">
                {data.meetings.slice(0, 10).map((meeting) => (
                  <div key={meeting.id} className="session-item">
                    <div className="session-info">
                      <h4>{meeting.client.fullName}</h4>
                      <p>{new Date(meeting.meetingDate).toLocaleDateString()} at {new Date(meeting.meetingDate).toLocaleTimeString()}</p>
                      <p>{meeting.duration} minutes - {formatCurrency(meeting.price)}</p>
                    </div>
                    <div className="session-status">
                      <span className={`status-badge ${meeting.status.toLowerCase()}`}>
                        {meeting.status}
                      </span>
                      {meeting.isPaid && <span className="paid-badge">✓ Paid</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="clients-section">
            <div className="clients-overview">
              <h3>Client Overview</h3>
              <div className="clients-stats">
                <div className="client-stat">
                  <span className="stat-label">Total Clients</span>
                  <span className="stat-value">{data.clients.length}</span>
                </div>
                <div className="client-stat">
                  <span className="stat-label">Active Clients</span>
                  <span className="stat-value">{data.clients.filter(c => c.active).length}</span>
                </div>
                <div className="client-stat">
                  <span className="stat-label">New This Month</span>
                  <span className="stat-value">
                    {data.clients.filter(c => {
                      const createdAt = new Date(c.createdAt);
                      const now = new Date();
                      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="clients-charts">
              <SimpleChart
                data={chartData.clientGrowth}
                title="Client Growth"
                type="bar"
                height={400}
              />
            </div>

            <div className="clients-list">
              <h3>Recent Clients</h3>
              <div className="client-items">
                {data.clients.slice(0, 10).map((client) => (
                  <div key={client.id} className="client-item">
                    <div className="client-info">
                      <h4>{client.fullName}</h4>
                      <p>{client.email || 'No email'}</p>
                      <p>Joined: {new Date(client.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="client-status">
                      <span className={`status-badge ${client.active ? 'active' : 'inactive'}`}>
                        {client.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals would be implemented here */}
      {showAddClientModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Client</h3>
              <button className="close-button" onClick={() => setShowAddClientModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Client form would go here...</p>
            </div>
          </div>
        </div>
      )}

      {showScheduleMeetingModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Schedule Meeting</h3>
              <button className="close-button" onClick={() => setShowScheduleMeetingModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Meeting form would go here...</p>
            </div>
          </div>
        </div>
      )}

      {showCalendar && (
        <div className="modal-overlay">
          <div className="modal calendar-modal">
            <div className="modal-header">
              <h3>Calendar View</h3>
              <button className="close-button" onClick={() => setShowCalendar(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Calendar component would go here...</p>
            </div>
          </div>
        </div>
      )}

      {showAnalytics && (
        <div className="modal-overlay">
          <div className="modal analytics-modal">
            <div className="modal-header">
              <h3>Analytics Dashboard</h3>
              <button className="close-button" onClick={() => setShowAnalytics(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Analytics component would go here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDashboard; 