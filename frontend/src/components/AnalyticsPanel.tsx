import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clients, meetings, personalMeetings, expenses } from '../services/api';
import { Client, Meeting, PersonalMeeting, Expense } from '../types';
import SimpleChart from './SimpleChart';
import './AnalyticsPanel.css';

interface AnalyticsPanelProps {
  onClose?: () => void;
}

type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'specific-month' | 'custom-range';

interface FilteredData {
  meetings: Meeting[];
  personalMeetings: PersonalMeeting[];
  expenses: Expense[];
  clients: Client[];
}

interface AnalyticsMetrics {
  revenue: {
    gross: number;
    net: number;
    paid: number;
    unpaid: number;
    collectionRate: number;
    averageSessionValue: number;
    growth: number;
    bySource: Record<string, number>;
  };
  sessions: {
    total: number;
    completed: number;
    completionRate: number;
    averageDuration: number;
    growth: number;
    bySource: Record<string, number>;
  };
  clients: {
    active: number;
    new: number;
    retention: number;
    averageValue: number;
  };
  expenses: {
    total: number;
    ratio: number; // expense to revenue ratio
    byCategory: Record<string, number>;
  };
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('month');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [customStartDate, setCustomStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [rawData, setRawData] = useState<{
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

  // Get date range based on period
  const getDateRange = useCallback((period: TimePeriod) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        return { startDate, endDate: new Date(now.getTime()) };
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'year':
        startDate.setDate(now.getDate() - 365);
        break;
      case 'specific-month':
        const [year, month] = selectedMonth.split('-').map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
        return { startDate: monthStart, endDate: monthEnd };
      case 'custom-range':
        const customStart = new Date(customStartDate);
        const customEnd = new Date(customEndDate);
        customStart.setHours(0, 0, 0, 0);
        customEnd.setHours(23, 59, 59, 999);
        return { startDate: customStart, endDate: customEnd };
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    return { startDate, endDate: now };
  }, [selectedMonth, customStartDate, customEndDate]);

  // Get previous period range for growth calculations
  const getPreviousDateRange = useCallback((period: TimePeriod) => {
    const now = new Date();
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        // Previous day
        endDate.setDate(now.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        // Previous 7 days before current week
        endDate.setDate(now.getDate() - 7);
        startDate.setDate(now.getDate() - 14);
        break;
      case 'month':
        // Previous 30 days before current month
        endDate.setDate(now.getDate() - 30);
        startDate.setDate(now.getDate() - 60);
        break;
      case 'quarter':
        // Previous 90 days before current quarter
        endDate.setDate(now.getDate() - 90);
        startDate.setDate(now.getDate() - 180);
        break;
      case 'year':
        // Previous 365 days before current year
        endDate.setDate(now.getDate() - 365);
        startDate.setDate(now.getDate() - 730);
        break;
      case 'specific-month':
        const [year, month] = selectedMonth.split('-').map(Number);
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        const prevMonthStart = new Date(prevYear, prevMonth - 1, 1);
        const prevMonthEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);
        return { startDate: prevMonthStart, endDate: prevMonthEnd };
      case 'custom-range':
        const customStart = new Date(customStartDate);
        const customEnd = new Date(customEndDate);
        const rangeDays = Math.ceil((customEnd.getTime() - customStart.getTime()) / (1000 * 60 * 60 * 24));
        const prevStart = new Date(customStart);
        const prevEnd = new Date(customStart);
        prevStart.setDate(prevStart.getDate() - rangeDays);
        prevEnd.setDate(prevEnd.getDate() - 1);
        prevStart.setHours(0, 0, 0, 0);
        prevEnd.setHours(23, 59, 59, 999);
        return { startDate: prevStart, endDate: prevEnd };
      default:
        // Default to previous week
        endDate.setDate(now.getDate() - 7);
        startDate.setDate(now.getDate() - 14);
    }
    
    return { startDate, endDate };
  }, [selectedMonth, customStartDate, customEndDate]);

  // Filter data by date range
  const filterDataByPeriod = useCallback((data: any[], dateField: string, startDate: Date, endDate: Date) => {
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, []);

  // Get filtered data based on selected period
  const filteredData = useMemo((): FilteredData => {
    const { startDate, endDate } = getDateRange(period);
    
    console.log(`Analytics Filter Debug - Period: ${period}`);
    console.log(`Date Range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
    console.log(`Raw data counts:`, {
      meetings: rawData.meetings.length,
      expenses: rawData.expenses.length,
      clients: rawData.clients.length
    });
    
    const filtered = {
      meetings: filterDataByPeriod(rawData.meetings, 'meetingDate', startDate, endDate),
      personalMeetings: filterDataByPeriod(rawData.personalMeetings, 'meetingDate', startDate, endDate),
      expenses: filterDataByPeriod(rawData.expenses, 'expenseDate', startDate, endDate),
      clients: filterDataByPeriod(rawData.clients, 'createdAt', startDate, endDate)
    };
    
    console.log(`Filtered data counts:`, {
      meetings: filtered.meetings.length,
      expenses: filtered.expenses.length,
      clients: filtered.clients.length
    });
    
    if (rawData.meetings.length > 0) {
      console.log('Sample meeting dates:', rawData.meetings.slice(0, 3).map(m => ({
        id: m.id,
        meetingDate: m.meetingDate,
        parsed: new Date(m.meetingDate)
      })));
    }
    
    return filtered;
  }, [rawData, period, getDateRange, filterDataByPeriod]);

  // Check if there's any data to display
  const hasData = useMemo(() => {
    return rawData.meetings.length > 0 || rawData.clients.length > 0 || rawData.expenses.length > 0;
  }, [rawData]);

  // Calculate analytics metrics
  const analytics = useMemo((): AnalyticsMetrics => {
    const { meetings, personalMeetings, expenses, clients } = filteredData;
    
    // Previous period data for growth calculations
    const { startDate: prevStart, endDate: prevEnd } = getPreviousDateRange(period);
    const prevMeetings = filterDataByPeriod(rawData.meetings, 'meetingDate', prevStart, prevEnd);
    const prevClients = filterDataByPeriod(rawData.clients, 'createdAt', prevStart, prevEnd);
    
    // Revenue calculations
    const totalRevenue = meetings.reduce((sum, m) => sum + m.price, 0);
    const paidRevenue = meetings.filter(m => m.isPaid).reduce((sum, m) => sum + m.price, 0);
    const unpaidRevenue = totalRevenue - paidRevenue;
    const collectionRate = totalRevenue > 0 ? (paidRevenue / totalRevenue) * 100 : 0;
    const averageSessionValue = meetings.length > 0 ? totalRevenue / meetings.length : 0;
    
    const prevTotalRevenue = prevMeetings.reduce((sum, m) => sum + m.price, 0);
    const revenueGrowth = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0;
    
    // Session calculations
    const totalSessions = meetings.length;
    const completedSessions = meetings.filter(m => m.status === 'COMPLETED').length;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const averageDuration = 60; // Default session duration
    
    const prevTotalSessions = prevMeetings.length;
    const sessionGrowth = prevTotalSessions > 0 ? ((totalSessions - prevTotalSessions) / prevTotalSessions) * 100 : 0;
    
    // Sessions by source
    const sessionsBySource: Record<string, number> = {};
    meetings.forEach(m => {
      const source = m.client.source?.name || 'Unknown Source';
      sessionsBySource[source] = (sessionsBySource[source] || 0) + 1;
    });

    // Income by source
    const incomeBySource: Record<string, number> = {};
    meetings.forEach(m => {
      const source = m.client.source?.name || 'Unknown Source';
      incomeBySource[source] = (incomeBySource[source] || 0) + m.price;
    });
    
    // Client calculations
    const activeClients = clients.length;
    const newClients = clients.length; // All clients in period are "new" for this period
    const retention = 85; // Placeholder
    const averageValue = activeClients > 0 ? totalRevenue / activeClients : 0;
    
    // Expense calculations
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

    // Expenses by category
    const expensesByCategory: Record<string, number> = {};
    expenses.forEach(e => {
      const category = e.category?.name || 'Uncategorized';
      expensesByCategory[category] = (expensesByCategory[category] || 0) + e.amount;
    });
    
    return {
      revenue: {
        gross: totalRevenue,
        net: totalRevenue - totalExpenses,
        paid: paidRevenue,
        unpaid: unpaidRevenue,
        collectionRate,
        averageSessionValue,
        growth: revenueGrowth,
        bySource: incomeBySource
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        completionRate,
        averageDuration,
        growth: sessionGrowth,
        bySource: sessionsBySource
      },
      clients: {
        active: activeClients,
        new: newClients,
        retention,
        averageValue
      },
      expenses: {
        total: totalExpenses,
        ratio: expenseRatio,
        byCategory: expensesByCategory
      }
    };
  }, [filteredData, period, getPreviousDateRange, filterDataByPeriod, rawData]);

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

      setRawData({
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '📈';
    if (growth < 0) return '📉';
    return '➖';
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'positive';
    if (growth < 0) return 'negative';
    return 'neutral';
  };

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'year': return 'This Year';
      case 'specific-month':
        const [year, month] = selectedMonth.split('-').map(Number);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[month - 1]} ${year}`;
      case 'custom-range':
        const startDate = new Date(customStartDate);
        const endDate = new Date(customEndDate);
        const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      default: return 'This Week';
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

  // Show no data message
  if (!hasData) {
  return (
    <div className="analytics-panel">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <h2>📊 Practice Analytics</h2>
            <p>Performance insights for {getPeriodLabel(period).toLowerCase()}</p>
        </div>
        <div className="analytics-header-right">
          <div className="period-selector">
            <div className="period-main-controls">
              <label htmlFor="period-select">Time Period:</label>
              <select 
                id="period-select"
                value={period} 
                onChange={(e) => setPeriod(e.target.value as TimePeriod)}
                className="period-select-dropdown"
                title="Select the time period for analytics data"
              >
                <option value="day" title="Today only">Today</option>
                <option value="week" title="Last 7 days">This Week</option>
                <option value="month" title="Last 30 days">This Month</option>
                <option value="quarter" title="Last 90 days">This Quarter</option>
                <option value="year" title="Last 365 days">This Year</option>
                <option value="specific-month" title="Choose a specific month">Specific Month</option>
                <option value="custom-range" title="Choose a custom date range">Custom Range</option>
              </select>
            </div>
            
            {/* Specific Month Selector */}
            {period === 'specific-month' && (
              <div className="period-additional-controls">
                <div className="date-input-group">
                  <label htmlFor="month-select">Month:</label>
                  <input
                    type="month"
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="date-input"
                    title="Select the specific month to analyze"
                  />
                </div>
              </div>
            )}
            
            {/* Custom Range Selectors */}
            {period === 'custom-range' && (
              <div className="period-additional-controls">
                <div className="date-range-inputs">
                  <div className="date-input-group">
                    <label htmlFor="start-date">From:</label>
                    <input
                      type="date"
                      id="start-date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="date-input"
                      title="Select the start date for the range"
                    />
                  </div>
                  <div className="date-input-group">
                    <label htmlFor="end-date">To:</label>
                    <input
                      type="date"
                      id="end-date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="date-input"
                      title="Select the end date for the range"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {onClose && (
            <button className="btn-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

        {/* No Data Message */}
      <div className="analytics-content">
          <div className="no-data-message">
            <div className="no-data-icon">📊</div>
            <h3>No Data Available</h3>
            <p>Start by adding clients, scheduling sessions, or recording expenses to see your practice analytics.</p>
            <div className="no-data-suggestions">
              <h4>Get started by:</h4>
              <ul>
                <li>Adding your first client</li>
                <li>Scheduling meetings</li>
                <li>Recording business expenses</li>
              </ul>
                      </div>
                    </div>
                  </div>
                      </div>
    );
  }

  const chartColors = [
    '#667eea', '#43e97b', '#fa709a', '#4facfe', '#feca57', 
    '#ff6b6b', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'
  ];

  return (
    <div className="analytics-panel">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <h2>📊 Practice Analytics</h2>
          <p>Performance insights for {getPeriodLabel(period).toLowerCase()}</p>
                      </div>
        <div className="analytics-header-right">
          <div className="period-selector">
            <div className="period-main-controls">
              <label htmlFor="period-select">Time Period:</label>
              <select 
                id="period-select"
                value={period} 
                onChange={(e) => setPeriod(e.target.value as TimePeriod)}
                className="period-select-dropdown"
                title="Select the time period for analytics data"
              >
                <option value="day" title="Today only">Today</option>
                <option value="week" title="Last 7 days">This Week</option>
                <option value="month" title="Last 30 days">This Month</option>
                <option value="quarter" title="Last 90 days">This Quarter</option>
                <option value="year" title="Last 365 days">This Year</option>
                <option value="specific-month" title="Choose a specific month">Specific Month</option>
                <option value="custom-range" title="Choose a custom date range">Custom Range</option>
              </select>
            </div>
            
            {/* Specific Month Selector */}
            {period === 'specific-month' && (
              <div className="period-additional-controls">
                <div className="date-input-group">
                  <label htmlFor="month-select">Month:</label>
                  <input
                    type="month"
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="date-input"
                    title="Select the specific month to analyze"
                  />
                </div>
              </div>
            )}
            
            {/* Custom Range Selectors */}
            {period === 'custom-range' && (
              <div className="period-additional-controls">
                <div className="date-range-inputs">
                  <div className="date-input-group">
                    <label htmlFor="start-date">From:</label>
                    <input
                      type="date"
                      id="start-date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="date-input"
                      title="Select the start date for the range"
                    />
                  </div>
                  <div className="date-input-group">
                    <label htmlFor="end-date">To:</label>
                    <input
                      type="date"
                      id="end-date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="date-input"
                      title="Select the end date for the range"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {onClose && (
            <button className="btn-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="analytics-content">
        {/* Key Metrics */}
        <div className="metrics-section">
          <div className="metrics-grid">
            {/* Revenue Card */}
            <div className="metric-card revenue">
              <div className="metric-header">
                <div className="metric-icon">💰</div>
                <div className="metric-info">
                  <h3>Gross Revenue</h3>
                  <div className="metric-growth">
                    <span 
                      className={`growth-indicator ${getGrowthColor(analytics.revenue.growth)}`}
                      title={`Growth compared to previous ${period}: ${analytics.revenue.growth >= 0 ? 'increase' : 'decrease'} of ${formatPercentage(Math.abs(analytics.revenue.growth))}`}
                    >
                      {getGrowthIcon(analytics.revenue.growth)} {formatPercentage(Math.abs(analytics.revenue.growth))}
                    </span>
                      </div>
                      </div>
                    </div>
              <div className="metric-value" title="Total income from all sessions in the selected time period">
                {formatCurrency(analytics.revenue.gross)}
                      </div>
              <div className="metric-details">
                <div className="detail-item">
                  <span title="Revenue remaining after subtracting all business expenses">Net Revenue:</span>
                  <span 
                    className={analytics.revenue.net >= 0 ? 'positive' : 'negative'}
                    title="Gross revenue minus total expenses for the period"
                  >
                    {formatCurrency(analytics.revenue.net)}
                  </span>
                      </div>
                <div className="detail-item">
                  <span title="Revenue that has been actually received from clients">Collected:</span>
                  <span title="Amount of revenue that has been actually received (paid sessions)">
                    {formatCurrency(analytics.revenue.paid)}
                  </span>
                    </div>
                <div className="detail-item">
                  <span title="Percentage of total revenue that has been successfully collected">Collection Rate:</span>
                  <span title="Percentage of gross revenue that has been collected">
                    {formatPercentage(analytics.revenue.collectionRate)}
                  </span>
                  </div>
                  </div>
                </div>

            {/* Sessions Card */}
            <div className="metric-card sessions">
              <div className="metric-header">
                <div className="metric-icon">📅</div>
                <div className="metric-info">
                  <h3>Sessions</h3>
                  <div className="metric-growth">
                    <span 
                      className={`growth-indicator ${getGrowthColor(analytics.sessions.growth)}`}
                      title={`Sessions growth compared to previous ${period}: ${analytics.sessions.growth >= 0 ? 'increase' : 'decrease'} of ${formatPercentage(Math.abs(analytics.sessions.growth))}`}
                    >
                      {getGrowthIcon(analytics.sessions.growth)} {formatPercentage(Math.abs(analytics.sessions.growth))}
                    </span>
                      </div>
                    </div>
                      </div>
              <div className="metric-value" title="Total number of sessions scheduled in the selected time period">
                {analytics.sessions.total}
                    </div>
              <div className="metric-details">
                <div className="detail-item">
                  <span title="Sessions that have finished and been marked as completed">Completed:</span>
                  <span title="Number of sessions that have been completed">
                    {analytics.sessions.completed}
                  </span>
                      </div>
                <div className="detail-item">
                  <span title="Percentage of scheduled sessions that were actually completed">Completion Rate:</span>
                  <span title="Percentage of scheduled sessions that were completed">
                    {formatPercentage(analytics.sessions.completionRate)}
                  </span>
                    </div>
                <div className="detail-item">
                  <span title="Average length of time for each session">Avg Duration:</span>
                  <span title="Average duration of sessions in minutes">
                    {analytics.sessions.averageDuration} min
                  </span>
                    </div>
                  </div>
                </div>

            {/* Clients Card */}
            <div className="metric-card clients">
              <div className="metric-header">
                <div className="metric-icon">👥</div>
                <div className="metric-info">
                  <h3>Clients</h3>
                      </div>
                    </div>
              <div className="metric-value" title="Number of active clients in the selected time period">
                {analytics.clients.active}
                      </div>
              <div className="metric-details">
                <div className="detail-item">
                  <span title="Clients who have joined during the selected time period">New Clients:</span>
                  <span title="Number of new clients added in the selected time period">
                    {analytics.clients.new}
                  </span>
                    </div>
                <div className="detail-item">
                  <span title="Percentage of clients who continue booking sessions over time">Retention:</span>
                  <span title="Percentage of clients who continue to book sessions">
                    {formatPercentage(analytics.clients.retention)}
                  </span>
                      </div>
                <div className="detail-item">
                  <span title="Average revenue generated per client during the period">Avg Value:</span>
                  <span title="Average revenue generated per client in the selected period">
                    {formatCurrency(analytics.clients.averageValue)}
                  </span>
                    </div>
                  </div>
                </div>

            {/* Expenses Card */}
            <div className="metric-card expenses">
              <div className="metric-header">
                <div className="metric-icon">💸</div>
                <div className="metric-info">
                  <h3>Expenses</h3>
                    </div>
                  </div>
              <div className="metric-value" title="Total business expenses in the selected time period">
                {formatCurrency(analytics.expenses.total)}
              </div>
              <div className="metric-details">
                <div className="detail-item">
                  <span title="What percentage of revenue is being spent on business expenses">Expense Ratio:</span>
                  <span 
                    className={analytics.expenses.ratio > 50 ? 'negative' : 'neutral'}
                    title="Percentage of gross revenue spent on expenses (lower is better)"
                  >
                    {formatPercentage(analytics.expenses.ratio)}
                      </span>
                    </div>
              </div>
                    </div>
                  </div>
                </div>

        {/* Charts Section */}
        {(analytics.revenue.gross > 0 || analytics.sessions.total > 0) && (
          <div className="charts-section">
                  <div className="charts-grid">
              {analytics.revenue.gross > 0 && (
                <div className="chart-card">
                  <h3 title="Shows the breakdown of revenue that has been collected vs pending collection">
                    Revenue Distribution
                  </h3>
                    <SimpleChart
                      data={[
                      { label: 'Collected', value: analytics.revenue.paid, color: '#43e97b' },
                        { label: 'Pending', value: analytics.revenue.unpaid, color: '#fa709a' }
                      ]}
                    title=""
                      type="pie"
                    height={200}
                  />
              </div>
            )}

              {analytics.sessions.total > 0 && Object.keys(analytics.sessions.bySource).length > 0 && (
                <div className="chart-card">
                  <h3 title="Shows the number of sessions from each client source (Private, Natal, Clalit, etc.)">
                    Sessions by Client Source
                  </h3>
                    <SimpleChart
                    data={Object.entries(analytics.sessions.bySource).map(([source, count], index) => ({
                      label: source,
                        value: count,
                      color: chartColors[index % chartColors.length]
                      }))}
                    title=""
                      type="pie"
                    height={200}
                  />
                </div>
              )}

              {analytics.revenue.gross > 0 && Object.keys(analytics.revenue.bySource).length > 0 && (
                <div className="chart-card">
                  <h3 title="Shows the revenue amount generated from each client source">
                    Income by Client Source
                  </h3>
                    <SimpleChart
                    data={Object.entries(analytics.revenue.bySource).map(([source, income], index) => ({
                      label: source,
                      value: income,
                      color: chartColors[index % chartColors.length]
                    }))}
                    title=""
                    type="pie"
                      height={250}
                    />
              </div>
            )}

              {analytics.expenses.total > 0 ? (
                <div className="chart-card">
                  <h3 title="Shows the breakdown of expenses by category">
                    Expenses by Category
                  </h3>
                  <SimpleChart
                    data={Object.entries(analytics.expenses.byCategory).map(([category, amount], index) => ({
                      label: category,
                      value: amount,
                      color: chartColors[index % chartColors.length]
                    }))}
                    title=""
                    type="pie"
                    height={250}
                  />
                      </div>
              ) : (
                <div className="chart-card">
                  <h3 title="Shows the breakdown of expenses by category">
                    Expenses by Category
                  </h3>
                  <div className="no-data-message">
                    <div className="no-data-icon">📊</div>
                    <div className="no-data-text">
                      <h4>No Expenses Recorded</h4>
                      <p>Add business expenses to see the breakdown by category</p>
                      </div>
                </div>
              </div>
            )}

              {(analytics.revenue.gross > 0 || analytics.expenses.total > 0) && (
                <div className="chart-card">
                  <h3 title="Compares total gross revenue with total expenses">
                    Revenue vs Expenses
                  </h3>
                  <SimpleChart
                    data={[
                      { label: 'Gross Revenue', value: analytics.revenue.gross, color: '#43e97b' },
                      { label: 'Total Expenses', value: analytics.expenses.total, color: '#fa709a' }
                    ]}
                    title=""
                    type="pie"
                    height={250}
                  />
              </div>
            )}
                </div>
              </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel; 