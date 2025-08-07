import React, { useState, useEffect, useCallback } from 'react';
import './AdminDashboard.css';

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalClients: number;
    totalMeetings: number;
    totalExpenses: number;
    pendingApprovals: number;
    totalPersonalMeetings?: number;
  };
  onQuickAction: (action: string) => void;
  onRefresh: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  onQuickAction,
  onRefresh,
}) => {
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    integrations: 'healthy',
    performance: 'good'
  });

  // Generate system alerts based on stats
  useEffect(() => {
    const alerts: SystemAlert[] = [];

    if (stats.pendingApprovals > 0) {
      alerts.push({
        id: 'pending-approvals',
        type: 'warning',
        title: 'Pending User Approvals',
        message: `${stats.pendingApprovals} user${stats.pendingApprovals > 1 ? 's' : ''} waiting for approval`,
        action: {
          label: 'Review Users',
          onClick: () => onQuickAction('users')
        }
      });
    }

    if (stats.totalMeetings === 0 && stats.totalClients > 0) {
      alerts.push({
        id: 'no-meetings',
        type: 'info',
        title: 'No Meetings Scheduled',
        message: 'Consider scheduling meetings for your clients',
        action: {
          label: 'Manage Sessions',
          onClick: () => onQuickAction('sessions')
        }
      });
    }

    if (stats.totalExpenses === 0) {
      alerts.push({
        id: 'no-expenses',
        type: 'info',
        title: 'No Expenses Recorded',
        message: 'Start tracking clinic expenses for better financial management',
        action: {
          label: 'Add Expenses',
          onClick: () => onQuickAction('expenses')
        }
      });
    }

    setSystemAlerts(alerts);
  }, [stats, onQuickAction]);

  const quickActions: QuickAction[] = [
    {
      id: 'users',
      label: 'Manage Users',
      icon: '👥',
      description: 'Review user accounts and approvals',
      color: '#667eea',
      priority: stats.pendingApprovals > 0 ? 'high' : 'medium'
    },
    {
      id: 'clients',
      label: 'Add Client',
      icon: '🧑‍⚕️',
      description: 'Register new client',
      color: '#4facfe',
      priority: 'medium'
    },
    {
      id: 'sessions',
      label: 'Schedule Session',
      icon: '📅',
      description: 'Book new therapy session',
      color: '#43e97b',
      priority: 'high'
    },
    {
      id: 'expenses',
      label: 'Add Expense',
      icon: '💰',
      description: 'Record new expense',
      color: '#fa709a',
      priority: 'medium'
    },
    {
      id: 'analytics',
      label: 'View Reports',
      icon: '📊',
      description: 'Access system analytics',
      color: '#ff9a9e',
      priority: 'low'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: '⚙️',
      description: 'Configure system',
      color: '#764ba2',
      priority: 'low'
    }
  ];

  const handleQuickAction = (actionId: string) => {
    onQuickAction(actionId);
  };

  const dismissAlert = (alertId: string) => {
    setSystemAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getStatCardColor = (index: number) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
    return colors[index % colors.length];
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      description: 'Registered system users',
      action: () => onQuickAction('users')
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: '🧑‍⚕️',
      description: 'Active client records',
      action: () => onQuickAction('clients')
    },
    {
      title: 'Client Sessions',
      value: stats.totalMeetings,
      icon: '📅',
      description: 'Scheduled therapy sessions',
      action: () => onQuickAction('sessions')
    },
    {
      title: 'Personal Sessions',
      value: stats.totalPersonalMeetings || 0,
      icon: '👤',
      description: 'Therapist personal sessions',
      action: () => onQuickAction('personal-meetings')
    },
    {
      title: 'Total Expenses',
      value: stats.totalExpenses,
      icon: '💰',
      description: 'Recorded expenses',
      action: () => onQuickAction('expenses')
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: '⏳',
      description: 'Users awaiting approval',
      action: () => onQuickAction('users'),
      highlight: stats.pendingApprovals > 0
    }
  ];

  return (
    <div className="admin-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2>🏠 System Overview</h2>
          <p>Comprehensive view of your clinic management system</p>
        </div>
        <button 
          className="refresh-button"
          onClick={onRefresh}
          title="Refresh dashboard data"
        >
          🔄 Refresh
        </button>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="system-alerts">
          <h3>🚨 Priority Alerts</h3>
          <div className="alerts-container">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`alert alert-${alert.type}`}>
                <div className="alert-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.message}</p>
                </div>
                <div className="alert-actions">
                  {alert.action && (
                    <button 
                      className="alert-action-btn"
                      onClick={alert.action.onClick}
                    >
                      {alert.action.label}
                    </button>
                  )}
                  <button 
                    className="alert-dismiss-btn"
                    onClick={() => dismissAlert(alert.id)}
                    title="Dismiss alert"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="stats-section">
        <h3>📊 System Statistics</h3>
        <div className="stats-grid">
          {statCards.map((card, index) => (
            <div 
              key={card.title}
              className={`stat-card ${card.highlight ? 'highlight' : ''}`}
              style={{ background: getStatCardColor(index) }}
              onClick={card.action}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  card.action();
                }
              }}
            >
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-content">
                <h4>{card.title}</h4>
                <div className="stat-value">{formatNumber(card.value)}</div>
                <p className="stat-description">{card.description}</p>
              </div>
              {card.highlight && (
                <div className="stat-highlight-indicator">!</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Hub */}
      <div className="quick-actions-section">
        <h3>🚀 Quick Actions</h3>
        <div className="quick-actions-grid">
          {quickActions
            .sort((a, b) => {
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
            .map((action) => (
              <button
                key={action.id}
                className={`quick-action-btn priority-${action.priority}`}
                onClick={() => handleQuickAction(action.id)}
                style={{ borderColor: action.color }}
              >
                <span className="action-icon" style={{ color: action.color }}>
                  {action.icon}
                </span>
                <span className="action-label">{action.label}</span>
                <span className="action-description">{action.description}</span>
              </button>
            ))}
        </div>
      </div>

      {/* System Health */}
      <div className="system-health-section">
        <h3>🔧 System Health</h3>
        <div className="health-indicators">
          <div className="health-item">
            <span className="health-label">Database</span>
            <span className={`health-status status-${systemHealth.database}`}>
              {systemHealth.database === 'healthy' ? '🟢' : '🟡'} {systemHealth.database}
            </span>
          </div>
          <div className="health-item">
            <span className="health-label">Integrations</span>
            <span className={`health-status status-${systemHealth.integrations}`}>
              {systemHealth.integrations === 'healthy' ? '🟢' : '🟡'} {systemHealth.integrations}
            </span>
          </div>
          <div className="health-item">
            <span className="health-label">Performance</span>
            <span className={`health-status status-${systemHealth.performance}`}>
              {systemHealth.performance === 'good' ? '🟢' : '🟡'} {systemHealth.performance}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 