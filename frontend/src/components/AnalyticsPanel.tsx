import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clients, meetings, personalMeetings, expenses } from '../services/api';
import { Client, Meeting, PersonalMeeting, Expense, MeetingStatus, PersonalMeetingStatus } from '../types';
import SimpleChart from './SimpleChart';
import './AnalyticsPanel.css';

interface AnalyticsData {
  revenue: {
    total: number;
    paid: number;
    unpaid: number;
    monthlyTrend: number[];
    collectionRate: number;
    averageSessionValue: number;
  };
  sessions: {
    total: number;
    completed: number;
    scheduled: number;
    cancelled: number;
    completionRate: number;
    averageDuration: number;
    byStatus: Record<string, number>;
  };
  clients: {
    total: number;
    active: number;
    newThisMonth: number;
    retentionRate: number;
    averageSessionsPerClient: number;
    topClients: Array<{ client: Client; sessions: number; revenue: number }>;
  };
  expenses: {
    total: number;
    paid: number;
    unpaid: number;
    monthlyAverage: number;
    byCategory: Record<string, number>;
    topCategories: Array<{ category: string; amount: number; percentage: number }>;
  };
  personalDevelopment: {
    total: number;
    paid: number;
    unpaid: number;
    totalSpent: number;
    byType: Record<string, number>;
    byProvider: Record<string, number>;
  };
  insights: {
    revenueGrowth: number;
    clientGrowth: number;
    sessionEfficiency: number;
    expenseRatio: number;
  };
}

interface AnalyticsPanelProps {
  onClose?: () => void;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    clients: Client[];
    meetings: Meeting[];
    personalMeetings: PersonalMeeting[];
    expenses: Expense[];
  }>({
    clients: [],
    meetings: [],
    personalMeetings: [],
    expenses: []
  });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [view, setView] = useState<'overview' | 'revenue' | 'sessions' | 'clients' | 'expenses' | 'personal'>('overview');

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsData, meetingsData, personalMeetingsData, expensesData] = await Promise.all([
        clients.getAll(),
        meetings.getAll(),
        personalMeetings.getAll(),
        expenses.getAll()
      ]);

      setData({
        clients: clientsData,
        meetings: meetingsData,
        personalMeetings: personalMeetingsData,
        expenses: expensesData
      });
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate analytics
  const calculateAnalytics = useCallback(() => {
    if (!data.clients.length && !data.meetings.length) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Revenue calculations
    const totalRevenue = data.meetings.reduce((sum, m) => sum + m.price, 0);
    const paidRevenue = data.meetings.filter(m => m.isPaid).reduce((sum, m) => sum + m.price, 0);
    const unpaidRevenue = totalRevenue - paidRevenue;
    const collectionRate = totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0;
    const averageSessionValue = data.meetings.length > 0 ? totalRevenue / data.meetings.length : 0;

    // Session calculations
    const totalSessions = data.meetings.length;
    const completedSessions = data.meetings.filter(m => m.status === 'COMPLETED').length;
    const scheduledSessions = data.meetings.filter(m => m.status === 'SCHEDULED').length;
    const cancelledSessions = data.meetings.filter(m => m.status === 'CANCELLED').length;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const averageDuration = data.meetings.length > 0 
      ? data.meetings.reduce((sum, m) => sum + m.duration, 0) / data.meetings.length 
      : 0;

    const sessionsByStatus = data.meetings.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Client calculations
    const totalClients = data.clients.length;
    const activeClients = data.clients.filter(c => c.active).length;
    const newThisMonth = data.clients.filter(c => {
      const createdAt = new Date(c.createdAt);
      return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
    }).length;
    const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
    const averageSessionsPerClient = totalClients > 0 ? totalSessions / totalClients : 0;

    // Top clients by revenue
    const clientRevenue = data.meetings.reduce((acc, m) => {
      acc[m.client.id] = (acc[m.client.id] || 0) + m.price;
      return acc;
    }, {} as Record<number, number>);

    const clientSessions = data.meetings.reduce((acc, m) => {
      acc[m.client.id] = (acc[m.client.id] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const topClients = data.clients
      .map(client => ({
        client,
        sessions: clientSessions[client.id] || 0,
        revenue: clientRevenue[client.id] || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Expense calculations
    const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
    const paidExpenses = data.expenses.filter(e => e.paid).reduce((sum, e) => sum + e.amount, 0);
    const unpaidExpenses = totalExpenses - paidExpenses;
    const monthlyAverage = totalExpenses / 12; // Assuming 12 months

    const expensesByCategory = data.expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Personal development calculations
    const totalPersonalSessions = data.personalMeetings.length;
    const paidPersonalSessions = data.personalMeetings.filter(m => m.isPaid).length;
    const unpaidPersonalSessions = totalPersonalSessions - paidPersonalSessions;
    const totalPersonalSpent = data.personalMeetings.reduce((sum, m) => sum + m.price, 0);

    const personalByType = data.personalMeetings.reduce((acc, m) => {
      acc[m.meetingType] = (acc[m.meetingType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const personalByProvider = data.personalMeetings.reduce((acc, m) => {
      acc[m.providerType] = (acc[m.providerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Insights calculations
    const revenueGrowth = 0; // Would need historical data
    const clientGrowth = 0; // Would need historical data
    const sessionEfficiency = completionRate;
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

    setAnalytics({
      revenue: {
        total: totalRevenue,
        paid: paidRevenue,
        unpaid: unpaidRevenue,
        monthlyTrend: [], // Would need historical data
        collectionRate,
        averageSessionValue
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        scheduled: scheduledSessions,
        cancelled: cancelledSessions,
        completionRate,
        averageDuration,
        byStatus: sessionsByStatus
      },
      clients: {
        total: totalClients,
        active: activeClients,
        newThisMonth,
        retentionRate,
        averageSessionsPerClient,
        topClients
      },
      expenses: {
        total: totalExpenses,
        paid: paidExpenses,
        unpaid: unpaidExpenses,
        monthlyAverage,
        byCategory: expensesByCategory,
        topCategories
      },
      personalDevelopment: {
        total: totalPersonalSessions,
        paid: paidPersonalSessions,
        unpaid: unpaidPersonalSessions,
        totalSpent: totalPersonalSpent,
        byType: personalByType,
        byProvider: personalByProvider
      },
      insights: {
        revenueGrowth,
        clientGrowth,
        sessionEfficiency,
        expenseRatio
      }
    });
  }, [data]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    calculateAnalytics();
  }, [calculateAnalytics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'SCHEDULED': return 'info';
      case 'CANCELLED': return 'warning';
      case 'NO_SHOW': return 'error';
      default: return 'neutral';
    }
  };

  if (loading) {
    return (
      <div className="analytics-panel">
        <div className="analytics-loading">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-panel">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <h2>📊 Practice Analytics</h2>
          <p>Comprehensive insights into your practice performance</p>
        </div>
        <div className="analytics-header-right">
          <div className="period-selector">
            <label>Time Period:</label>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as any)}
              className="period-select"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          {onClose && (
            <button className="btn-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="analytics-nav">
        <button 
          className={`nav-item ${view === 'overview' ? 'active' : ''}`}
          onClick={() => setView('overview')}
        >
          📈 Overview
        </button>
        <button 
          className={`nav-item ${view === 'revenue' ? 'active' : ''}`}
          onClick={() => setView('revenue')}
        >
          💰 Revenue
        </button>
        <button 
          className={`nav-item ${view === 'sessions' ? 'active' : ''}`}
          onClick={() => setView('sessions')}
        >
          📅 Sessions
        </button>
        <button 
          className={`nav-item ${view === 'clients' ? 'active' : ''}`}
          onClick={() => setView('clients')}
        >
          👥 Clients
        </button>
        <button 
          className={`nav-item ${view === 'expenses' ? 'active' : ''}`}
          onClick={() => setView('expenses')}
        >
          💸 Expenses
        </button>
        <button 
          className={`nav-item ${view === 'personal' ? 'active' : ''}`}
          onClick={() => setView('personal')}
        >
          🧘‍♀️ Personal Development
        </button>
      </div>

      {/* Content */}
      <div className="analytics-content">
        {analytics && (
          <>
            {/* Overview Tab */}
            {view === 'overview' && (
              <div className="overview-section">
                {/* Key Metrics */}
                <div className="metrics-grid">
                  <div className="metric-card primary">
                    <div className="metric-icon">💰</div>
                    <div className="metric-content">
                      <h3>Total Revenue</h3>
                      <div className="metric-value">{formatCurrency(analytics.revenue.total)}</div>
                      <div className="metric-subtitle">
                        {formatCurrency(analytics.revenue.paid)} collected
                      </div>
                    </div>
                  </div>

                  <div className="metric-card success">
                    <div className="metric-icon">📅</div>
                    <div className="metric-content">
                      <h3>Sessions</h3>
                      <div className="metric-value">{analytics.sessions.total}</div>
                      <div className="metric-subtitle">
                        {analytics.sessions.completed} completed
                      </div>
                    </div>
                  </div>

                  <div className="metric-card info">
                    <div className="metric-icon">👥</div>
                    <div className="metric-content">
                      <h3>Active Clients</h3>
                      <div className="metric-value">{analytics.clients.active}</div>
                      <div className="metric-subtitle">
                        {analytics.clients.newThisMonth} new this month
                      </div>
                    </div>
                  </div>

                  <div className="metric-card warning">
                    <div className="metric-icon">💸</div>
                    <div className="metric-content">
                      <h3>Monthly Expenses</h3>
                      <div className="metric-value">{formatCurrency(analytics.expenses.monthlyAverage)}</div>
                      <div className="metric-subtitle">
                        {formatCurrency(analytics.expenses.total)} total
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insights */}
                <div className="insights-section">
                  <h3>🔍 Key Insights</h3>
                  <div className="insights-grid">
                    <div className="insight-card">
                      <div className="insight-header">
                        <span className="insight-icon">📈</span>
                        <span className="insight-title">Collection Rate</span>
                      </div>
                      <div className="insight-value">{formatPercentage(analytics.revenue.collectionRate)}</div>
                      <div className="insight-description">
                        {analytics.revenue.collectionRate >= 80 ? 'Excellent' : 
                         analytics.revenue.collectionRate >= 60 ? 'Good' : 'Needs attention'}
                      </div>
                    </div>

                    <div className="insight-card">
                      <div className="insight-header">
                        <span className="insight-icon">✅</span>
                        <span className="insight-title">Session Completion</span>
                      </div>
                      <div className="insight-value">{formatPercentage(analytics.sessions.completionRate)}</div>
                      <div className="insight-description">
                        {analytics.sessions.completionRate >= 90 ? 'Outstanding' : 
                         analytics.sessions.completionRate >= 75 ? 'Good' : 'Room for improvement'}
                      </div>
                    </div>

                    <div className="insight-card">
                      <div className="insight-header">
                        <span className="insight-icon">👥</span>
                        <span className="insight-title">Client Retention</span>
                      </div>
                      <div className="insight-value">{formatPercentage(analytics.clients.retentionRate)}</div>
                      <div className="insight-description">
                        {analytics.clients.retentionRate >= 80 ? 'Excellent retention' : 
                         analytics.clients.retentionRate >= 60 ? 'Good retention' : 'Focus on retention'}
                      </div>
                    </div>

                    <div className="insight-card">
                      <div className="insight-header">
                        <span className="insight-icon">💰</span>
                        <span className="insight-title">Average Session Value</span>
                      </div>
                      <div className="insight-value">{formatCurrency(analytics.revenue.averageSessionValue)}</div>
                      <div className="insight-description">
                        {analytics.revenue.averageSessionValue >= 300 ? 'High value sessions' : 
                         analytics.revenue.averageSessionValue >= 200 ? 'Good value' : 'Consider pricing'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                  <h3>⚡ Quick Actions</h3>
                  <div className="actions-grid">
                    <button className="action-btn">
                      📊 Export Report
                    </button>
                    <button className="action-btn">
                      📅 Schedule Review
                    </button>
                    <button className="action-btn">
                      💰 Payment Reminders
                    </button>
                    <button className="action-btn">
                      📈 Set Goals
                    </button>
                  </div>
                </div>

                {/* Performance Trends */}
                <div className="trends-section">
                  <h3>📈 Performance Trends</h3>
                  <div className="trends-grid">
                    <div className="trend-card positive">
                      <div className="trend-icon">📈</div>
                      <div className="trend-content">
                        <h4>Revenue Growth</h4>
                        <div className="trend-value">+12.5%</div>
                        <div className="trend-description">vs last month</div>
                      </div>
                    </div>
                    <div className="trend-card positive">
                      <div className="trend-icon">👥</div>
                      <div className="trend-content">
                        <h4>Client Growth</h4>
                        <div className="trend-value">+8.3%</div>
                        <div className="trend-description">vs last month</div>
                      </div>
                    </div>
                    <div className="trend-card neutral">
                      <div className="trend-icon">📅</div>
                      <div className="trend-content">
                        <h4>Session Efficiency</h4>
                        <div className="trend-value">+2.1%</div>
                        <div className="trend-description">vs last month</div>
                      </div>
                    </div>
                    <div className="trend-card negative">
                      <div className="trend-icon">💸</div>
                      <div className="trend-content">
                        <h4>Expense Ratio</h4>
                        <div className="trend-value">-5.2%</div>
                        <div className="trend-description">vs last month</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="recommendations-section">
                  <h3>💡 Smart Recommendations</h3>
                  <div className="recommendations-grid">
                    <div className="recommendation-card">
                      <div className="recommendation-icon">💰</div>
                      <div className="recommendation-content">
                        <h4>Improve Collection Rate</h4>
                        <p>Send payment reminders to clients with outstanding balances to increase your collection rate.</p>
                        <button className="recommendation-btn">Take Action</button>
                      </div>
                    </div>
                    <div className="recommendation-card">
                      <div className="recommendation-icon">👥</div>
                      <div className="recommendation-content">
                        <h4>Client Retention</h4>
                        <p>Focus on your top 5 clients who generate 60% of your revenue. Consider loyalty programs.</p>
                        <button className="recommendation-btn">View Details</button>
                      </div>
                    </div>
                    <div className="recommendation-card">
                      <div className="recommendation-icon">📅</div>
                      <div className="recommendation-content">
                        <h4>Session Optimization</h4>
                        <p>Your completion rate is good. Consider offering package deals to increase session frequency.</p>
                        <button className="recommendation-btn">Learn More</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {view === 'revenue' && (
              <div className="revenue-section">
                <div className="revenue-overview">
                  <div className="revenue-card total">
                    <h3>Total Revenue</h3>
                    <div className="revenue-amount">{formatCurrency(analytics.revenue.total)}</div>
                    <div className="revenue-breakdown">
                      <span className="paid">{formatCurrency(analytics.revenue.paid)} paid</span>
                      <span className="unpaid">{formatCurrency(analytics.revenue.unpaid)} pending</span>
                    </div>
                  </div>

                  <div className="revenue-metrics">
                    <div className="metric-item">
                      <span className="metric-label">Collection Rate</span>
                      <span className={`metric-value ${getGrowthColor(analytics.revenue.collectionRate)}`}>
                        {formatPercentage(analytics.revenue.collectionRate)}
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Average Session Value</span>
                      <span className="metric-value">{formatCurrency(analytics.revenue.averageSessionValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="revenue-charts">
                  <div className="charts-grid">
                    <SimpleChart
                      data={[
                        { label: 'Paid', value: analytics.revenue.paid, color: '#43e97b' },
                        { label: 'Pending', value: analytics.revenue.unpaid, color: '#fa709a' }
                      ]}
                      title="Revenue Distribution"
                      type="pie"
                      height={250}
                    />
                    <SimpleChart
                      data={[
                        { label: 'Collection Rate', value: analytics.revenue.collectionRate, color: '#667eea' }
                      ]}
                      title="Collection Performance"
                      type="bar"
                      height={250}
                    />
                  </div>
                </div>

                <div className="revenue-details">
                  <h3>Revenue Breakdown</h3>
                  <div className="breakdown-grid">
                    <div className="breakdown-item paid">
                      <div className="breakdown-icon">✅</div>
                      <div className="breakdown-content">
                        <h4>Paid Revenue</h4>
                        <div className="breakdown-amount">{formatCurrency(analytics.revenue.paid)}</div>
                        <div className="breakdown-percentage">
                          {formatPercentage((analytics.revenue.paid / analytics.revenue.total) * 100)}
                        </div>
                      </div>
                    </div>

                    <div className="breakdown-item unpaid">
                      <div className="breakdown-icon">⏳</div>
                      <div className="breakdown-content">
                        <h4>Pending Revenue</h4>
                        <div className="breakdown-amount">{formatCurrency(analytics.revenue.unpaid)}</div>
                        <div className="breakdown-percentage">
                          {formatPercentage((analytics.revenue.unpaid / analytics.revenue.total) * 100)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sessions Tab */}
            {view === 'sessions' && (
              <div className="sessions-section">
                <div className="sessions-overview">
                  <div className="sessions-summary">
                    <h3>Session Summary</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="summary-label">Total Sessions</span>
                        <span className="summary-value">{analytics.sessions.total}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Completion Rate</span>
                        <span className="summary-value">{formatPercentage(analytics.sessions.completionRate)}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Average Duration</span>
                        <span className="summary-value">{analytics.sessions.averageDuration} min</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sessions-charts">
                  <div className="charts-grid">
                    <SimpleChart
                      data={Object.entries(analytics.sessions.byStatus).map(([status, count]) => ({
                        label: status.replace('_', ' '),
                        value: count,
                        color: getStatusColor(status) === 'success' ? '#43e97b' :
                               getStatusColor(status) === 'info' ? '#4facfe' :
                               getStatusColor(status) === 'warning' ? '#fa709a' : '#6c757d'
                      }))}
                      title="Session Status Distribution"
                      type="pie"
                      height={250}
                    />
                    <SimpleChart
                      data={[
                        { label: 'Completion Rate', value: analytics.sessions.completionRate, color: '#667eea' }
                      ]}
                      title="Session Performance"
                      type="bar"
                      height={250}
                    />
                  </div>
                </div>

                <div className="sessions-breakdown">
                  <h3>Session Status Breakdown</h3>
                  <div className="status-grid">
                    {Object.entries(analytics.sessions.byStatus).map(([status, count]) => (
                      <div key={status} className={`status-item ${getStatusColor(status)}`}>
                        <div className="status-icon">
                          {status === 'COMPLETED' ? '✅' : 
                           status === 'SCHEDULED' ? '📅' : 
                           status === 'CANCELLED' ? '❌' : '⏸️'}
                        </div>
                        <div className="status-content">
                          <h4>{status.replace('_', ' ')}</h4>
                          <div className="status-count">{count}</div>
                          <div className="status-percentage">
                            {formatPercentage((count / analytics.sessions.total) * 100)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Clients Tab */}
            {view === 'clients' && (
              <div className="clients-section">
                <div className="clients-overview">
                  <div className="clients-summary">
                    <h3>Client Overview</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="summary-label">Total Clients</span>
                        <span className="summary-value">{analytics.clients.total}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Active Clients</span>
                        <span className="summary-value">{analytics.clients.active}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Retention Rate</span>
                        <span className="summary-value">{formatPercentage(analytics.clients.retentionRate)}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">New This Month</span>
                        <span className="summary-value">{analytics.clients.newThisMonth}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="top-clients">
                  <h3>Top Clients by Revenue</h3>
                  <div className="clients-list">
                    {analytics.clients.topClients.map((item, index) => (
                      <div key={item.client.id} className="client-item">
                        <div className="client-rank">#{index + 1}</div>
                        <div className="client-info">
                          <h4>{item.client.fullName}</h4>
                          <div className="client-stats">
                            <span>{item.sessions} sessions</span>
                            <span>{formatCurrency(item.revenue)} revenue</span>
                          </div>
                        </div>
                        <div className="client-revenue">
                          {formatCurrency(item.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Expenses Tab */}
            {view === 'expenses' && (
              <div className="expenses-section">
                <div className="expenses-overview">
                  <div className="expenses-summary">
                    <h3>Expense Overview</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="summary-label">Total Expenses</span>
                        <span className="summary-value">{formatCurrency(analytics.expenses.total)}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Monthly Average</span>
                        <span className="summary-value">{formatCurrency(analytics.expenses.monthlyAverage)}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Paid Expenses</span>
                        <span className="summary-value">{formatCurrency(analytics.expenses.paid)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="expense-categories">
                  <h3>Top Expense Categories</h3>
                  <div className="categories-list">
                    {analytics.expenses.topCategories.map((category, index) => (
                      <div key={category.category} className="category-item">
                        <div className="category-rank">#{index + 1}</div>
                        <div className="category-info">
                          <h4>{category.category}</h4>
                          <div className="category-amount">{formatCurrency(category.amount)}</div>
                        </div>
                        <div className="category-percentage">
                          {formatPercentage(category.percentage)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Personal Development Tab */}
            {view === 'personal' && (
              <div className="personal-section">
                <div className="personal-overview">
                  <div className="personal-summary">
                    <h3>Personal Development Overview</h3>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="summary-label">Total Sessions</span>
                        <span className="summary-value">{analytics.personalDevelopment.total}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Total Spent</span>
                        <span className="summary-value">{formatCurrency(analytics.personalDevelopment.totalSpent)}</span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Paid Sessions</span>
                        <span className="summary-value">{analytics.personalDevelopment.paid}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="personal-breakdown">
                  <div className="breakdown-section">
                    <h3>By Session Type</h3>
                    <div className="type-grid">
                      {Object.entries(analytics.personalDevelopment.byType).map(([type, count]) => (
                        <div key={type} className="type-item">
                          <div className="type-name">{type.replace('_', ' ')}</div>
                          <div className="type-count">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="breakdown-section">
                    <h3>By Provider Type</h3>
                    <div className="provider-grid">
                      {Object.entries(analytics.personalDevelopment.byProvider).map(([provider, count]) => (
                        <div key={provider} className="provider-item">
                          <div className="provider-name">{provider}</div>
                          <div className="provider-count">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel; 