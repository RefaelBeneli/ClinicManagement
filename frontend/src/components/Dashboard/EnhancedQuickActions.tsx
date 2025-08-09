import React, { useState } from 'react';
import './EnhancedQuickActions.css';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  shortcut?: string;
  badge?: string;
  onClick: () => void;
}

interface EnhancedQuickActionsProps {
  onAddClient: () => void;
  onScheduleMeeting: () => void;
  onViewCalendar: () => void;
  onManageMeetings: () => void;
  onManagePersonalMeetings: () => void;
  onManageExpenses: () => void;
  onViewAnalytics: () => void;
  onExportData: () => void;
  userRole?: string;
}

const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({
  onAddClient,
  onScheduleMeeting,
  onViewCalendar,
  onManageMeetings,
  onManagePersonalMeetings,
  onManageExpenses,
  onViewAnalytics,
  onExportData,
  userRole
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const actions: QuickAction[] = [
    {
      id: 'add-client',
      title: 'Add Client',
      description: 'Register a new client to your practice',
      icon: '👤',
      color: 'primary',
      shortcut: 'C',
      onClick: onAddClient
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Session',
      description: 'Book a new therapy appointment',
      icon: '📅',
      color: 'success',
      shortcut: 'S',
      onClick: onScheduleMeeting
    },
    {
      id: 'view-calendar',
      title: 'View Calendar',
      description: 'See all your appointments',
      icon: '📊',
      color: 'info',
      shortcut: 'V',
      onClick: onViewCalendar
    },

    {
      id: 'personal-meetings',
      title: 'Personal Sessions',
      description: 'Manage your own therapy sessions',
      icon: '🧘‍♀️',
      color: 'purple',
      shortcut: 'P',
      onClick: onManagePersonalMeetings
    },
    {
      id: 'manage-expenses',
      title: 'Manage Expenses',
      description: 'Track business expenses',
      icon: '💰',
      color: 'danger',
      shortcut: 'E',
      onClick: onManageExpenses
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View detailed insights and reports',
      icon: '📈',
      color: 'secondary',
      shortcut: 'A',
      badge: 'New',
      onClick: onViewAnalytics
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download reports and data',
      icon: '📤',
      color: 'dark',
      shortcut: 'X',
      onClick: onExportData
    }
  ];

  const handleActionClick = (action: QuickAction) => {
    // Add click animation
    const element = document.getElementById(`action-${action.id}`);
    if (element) {
      element.classList.add('action-clicked');
      setTimeout(() => {
        element.classList.remove('action-clicked');
      }, 200);
    }
    
    action.onClick();
  };

  const handleKeyPress = (event: React.KeyboardEvent, action: QuickAction) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleActionClick(action);
    }
  };

  return (
    <div className="enhanced-quick-actions">
      <div className="quick-actions-header">
        <h2>⚡ Quick Actions</h2>
        <p>Get started with your most common tasks</p>
        <div className="shortcuts-hint">
          <span>💡 Tip: Use keyboard shortcuts for faster access</span>
        </div>
      </div>

      <div className="actions-grid">
        {actions.map((action) => (
          <div
            key={action.id}
            id={`action-${action.id}`}
            className={`action-card action-card--${action.color}`}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
            onClick={() => handleActionClick(action)}
            onKeyPress={(e) => handleKeyPress(e, action)}
            tabIndex={0}
            role="button"
            aria-label={`${action.title}: ${action.description}`}
          >
            <div className="action-header">
              <div className="action-icon">{action.icon}</div>
              {action.badge && (
                <div className="action-badge">{action.badge}</div>
              )}
              {action.shortcut && (
                <div className="action-shortcut">{action.shortcut}</div>
              )}
            </div>
            
            <div className="action-content">
              <h3 className="action-title">{action.title}</h3>
              <p className="action-description">{action.description}</p>
            </div>

            <div className="action-footer">
              <div className="action-hint">
                {hoveredAction === action.id && (
                  <span className="hint-text">Click or press {action.shortcut}</span>
                )}
              </div>
            </div>

            <div className="action-overlay">
              <div className="overlay-content">
                <span className="overlay-icon">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions-footer">
        <div className="usage-tips">
          <h4>💡 Pro Tips</h4>
          <ul>
            <li>Use keyboard shortcuts for faster navigation</li>
            <li>Check analytics regularly to track your progress</li>
            <li>Export data monthly for backup and reporting</li>
            <li>Keep your calendar updated for better scheduling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuickActions; 