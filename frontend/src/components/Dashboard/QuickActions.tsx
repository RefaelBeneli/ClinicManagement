import React from 'react';
import Button from '../ui/Button';
import './QuickActions.css';

interface QuickActionsProps {
  onAddClient: () => void;
  onScheduleMeeting: () => void;
  onViewCalendar: () => void;
  onManageMeetings: () => void;
  onManagePersonalMeetings: () => void;
  onManageExpenses: () => void;
  userRole?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onAddClient,
  onScheduleMeeting,
  onViewCalendar,
  onManageMeetings,
  onManagePersonalMeetings,
  onManageExpenses,
  userRole
}) => {
  const actions = [
    {
      id: 'add-client',
      label: 'Add Client',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <line x1="19" y1="8" x2="19" y2="14"></line>
          <line x1="22" y1="11" x2="16" y2="11"></line>
        </svg>
      ),
      onClick: onAddClient,
      variant: 'primary' as const,
      description: 'Add a new client to your practice'
    },
    {
      id: 'schedule-meeting',
      label: 'Schedule Session',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <path d="M8 14h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 14h.01"></path>
          <path d="M8 18h.01"></path>
          <path d="M12 18h.01"></path>
        </svg>
      ),
      onClick: onScheduleMeeting,
      variant: 'secondary' as const,
      description: 'Book a new therapy session'
    },
    {
      id: 'view-calendar',
      label: 'View Calendar',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
      onClick: onViewCalendar,
      variant: 'outline' as const,
      description: 'View your appointment calendar'
    },

    {
      id: 'manage-personal',
      label: 'Personal Sessions',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      onClick: onManagePersonalMeetings,
      variant: 'outline' as const,
      description: 'Manage your personal therapy sessions'
    },
    {
      id: 'manage-expenses',
      label: 'Manage Expenses',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"></line>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ),
      onClick: onManageExpenses,
      variant: 'outline' as const,
      description: 'Track and manage business expenses'
    }
  ];

  return (
    <div className="quick-actions">
      <div className="quick-actions__header">
        <h2 className="quick-actions__title">Quick Actions</h2>
        <p className="quick-actions__subtitle">
          Get started with your most common tasks
        </p>
      </div>

      <div className="quick-actions__grid">
        {actions.map((action) => (
          <div key={action.id} className="quick-action-card">
            <div className="quick-action-card__icon">
              {action.icon}
            </div>
            <div className="quick-action-card__content">
              <h3 className="quick-action-card__title">
                {action.label}
              </h3>
              <p className="quick-action-card__description">
                {action.description}
              </p>
            </div>
            <div className="quick-action-card__button">
              <Button
                variant={action.variant}
                size="sm"
                onClick={action.onClick}
                fullWidth
              >
                {action.label}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions; 