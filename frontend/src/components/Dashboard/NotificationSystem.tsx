import React, { useState, useEffect } from 'react';
import './NotificationSystem.css';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  onAction?: (notification: Notification) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss,
  onAction
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications);
  }, [notifications]);

  const handleDismiss = (id: string) => {
    const notification = visibleNotifications.find(n => n.id === id);
    if (notification) {
      // Add exit animation
      const element = document.getElementById(`notification-${id}`);
      if (element) {
        element.classList.add('notification-exit');
        setTimeout(() => {
          onDismiss(id);
        }, 300);
      } else {
        onDismiss(id);
      }
    }
  };

  const handleAction = (notification: Notification) => {
    if (notification.action && onAction) {
      onAction(notification);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-system">
      <div className="notification-container">
        {visibleNotifications.map((notification) => (
          <div
            key={notification.id}
            id={`notification-${notification.id}`}
            className={`notification notification--${notification.type}`}
            role="alert"
            aria-live="polite"
          >
            <div className="notification-header">
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h4 className="notification-title">{notification.title}</h4>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-meta">
                  <span className="notification-time">
                    {formatTimeAgo(notification.timestamp)}
                  </span>
                  {notification.action && (
                    <button
                      className="notification-action"
                      onClick={() => handleAction(notification)}
                    >
                      {notification.action.label}
                    </button>
                  )}
                </div>
              </div>
              <button
                className="notification-dismiss"
                onClick={() => handleDismiss(notification.id)}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
            
            {notification.duration && (
              <div className="notification-progress">
                <div 
                  className="notification-progress-bar"
                  style={{
                    animationDuration: `${notification.duration}ms`
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationSystem; 