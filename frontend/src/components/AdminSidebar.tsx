import React, { useState } from 'react';
import './AdminSidebar.css';

export type AdminSection = 
  | 'dashboard' 
  | 'users' 
  | 'clients' 
  | 'sessions' 
  | 'personal-meetings'
  | 'expenses' 
  | 'expense-categories'
  | 'payment-types'
  | 'sources'
  | 'meeting-types'
  | 'calendar'
  | 'analytics'
  | 'settings';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  pendingUsersCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

interface NavigationItem {
  id: AdminSection;
  label: string;
  icon: string;
  badge?: number;
  description?: string;
}

interface NavigationCategory {
  label: string;
  items: NavigationItem[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  pendingUsersCount,
  isCollapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileToggle,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['overview', 'user-management', 'client-management', 'session-management', 'financial-management', 'system-configuration'])
  );

  const navigationCategories: NavigationCategory[] = [
    {
      label: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: '🏠',
          description: 'System overview and quick actions'
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: '📊',
          description: 'Reports and system insights'
        }
      ]
    },
    {
      label: 'User Management',
      items: [
        {
          id: 'users',
          label: 'Users',
          icon: '👥',
          badge: pendingUsersCount > 0 ? pendingUsersCount : undefined,
          description: 'User accounts and approvals'
        }
      ]
    },
    {
      label: 'Client Management',
      items: [
        {
          id: 'clients',
          label: 'Clients',
          icon: '🧑‍⚕️',
          description: 'Client records and management'
        }
      ]
    },
    {
      label: 'Session Management',
      items: [
        {
          id: 'sessions',
          label: 'Client Sessions',
          icon: '📅',
          description: 'Therapy sessions and appointments'
        },
        {
          id: 'personal-meetings',
          label: 'Personal Sessions',
          icon: '👤',
          description: 'Therapist personal sessions'
        },
        {
          id: 'calendar',
          label: 'Calendar',
          icon: '📆',
          description: 'Calendar view and integration'
        }
      ]
    },
    {
      label: 'Financial Management',
      items: [
        {
          id: 'expenses',
          label: 'Expenses',
          icon: '💰',
          description: 'Expense tracking and management'
        },
        {
          id: 'expense-categories',
          label: 'Expense Categories',
          icon: '🏷️',
          description: 'Manage expense categories'
        },
        {
          id: 'payment-types',
          label: 'Payment Types',
          icon: '💳',
          description: 'Configure payment methods'
        }
      ]
    },
    {
      label: 'System Configuration',
      items: [
        {
          id: 'sources',
          label: 'Client Sources',
          icon: '🏥',
          description: 'Configure client sources'
        },
        {
          id: 'meeting-types',
          label: 'Meeting Types',
          icon: '📋',
          description: 'Personal meeting type settings'
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: '⚙️',
          description: 'Global system configuration'
        }
      ]
    }
  ];

  const toggleCategory = (categoryLabel: string) => {
    console.log('Category toggle clicked:', categoryLabel);
    const categoryKey = categoryLabel.toLowerCase().replace(/\s+/g, '-');
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  const handleItemClick = (section: AdminSection) => {
    console.log('Sidebar item clicked:', section);
    console.log('Current activeSection:', activeSection);
    onSectionChange(section);
    
    // Close mobile sidebar when item is clicked
    if (mobileOpen && onMobileToggle) {
      onMobileToggle();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={onMobileToggle}
          aria-label="Close sidebar"
          style={{ pointerEvents: 'auto' }}
        />
      )}
      
      <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">🛡️</span>
            {!isCollapsed && <span className="brand-text">Admin Panel</span>}
          </div>
          <button 
            className="collapse-toggle"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

      {/* Navigation */}
      <nav className="sidebar-nav" role="navigation" aria-label="Admin navigation">
        {navigationCategories.map((category) => {
          const categoryKey = category.label.toLowerCase().replace(/\s+/g, '-');
          const isExpanded = expandedCategories.has(categoryKey);
          
          return (
            <div key={category.label} className="nav-category">
              {!isCollapsed && (
                <button
                  className={`category-header ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleCategory(category.label)}
                  aria-expanded={isExpanded}
                  aria-controls={`category-${categoryKey}`}
                >
                  <span className="category-label">{category.label}</span>
                  <span className="category-chevron" aria-hidden="true">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                </button>
              )}
              
              <div 
                id={`category-${categoryKey}`}
                className={`category-items ${!isCollapsed && isExpanded ? 'expanded' : ''} ${isCollapsed ? 'collapsed-items' : ''}`}
                role={isCollapsed ? 'none' : 'group'}
                aria-labelledby={!isCollapsed ? `category-${categoryKey}-header` : undefined}
              >
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed ? `${item.label}${item.description ? ` - ${item.description}` : ''}` : undefined}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    <span className="item-icon" aria-hidden="true">{item.icon}</span>
                    <span className="item-label">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="item-badge" aria-label={`${item.badge} pending`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="footer-info">
            <small>Admin Panel v2.0</small>
            <small>Enhanced Navigation</small>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default AdminSidebar; 