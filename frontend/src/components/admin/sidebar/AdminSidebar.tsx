import React from 'react';
import { MainSection, PendingCounts } from '../types';
import styles from './AdminSidebar.module.css';

interface AdminSidebarProps {
  activeSection: MainSection;
  onSectionChange: (section: MainSection) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingCounts: PendingCounts;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface SidebarSection {
  id: MainSection;
  label: string;
  icon: string;
  description: string;
  badge?: number;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggleCollapse,
  pendingCounts,
  mobileOpen,
  onMobileClose
}) => {
  const sections: SidebarSection[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '🏠',
      description: 'Dashboard & Analytics'
    },
    {
      id: 'people',
      label: 'People',
      icon: '👥',
      description: 'Users & Clients',
      badge: pendingCounts.users
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: '📅',
      description: 'Meetings & Calendar',
      badge: pendingCounts.sessions
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: '💰',
      description: 'Expenses & Payments',
      badge: pendingCounts.expenses
    },
    {
      id: 'system',
      label: 'System',
      icon: '⚙️',
      description: 'Config & Types'
    }
  ];

  const handleSectionClick = (sectionId: MainSection) => {
    onSectionChange(sectionId);
    if (mobileOpen) {
      onMobileClose();
    }
  };

  return (
    <>
      {mobileOpen && <div className={styles.sidebarOverlay} onClick={onMobileClose} />}
      
      <aside className={`${styles.adminSidebar} ${isCollapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <button 
            className={styles.collapseButton}
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className={styles.collapseIcon}>{isCollapsed ? '→' : '←'}</span>
          </button>
        </div>
        
        <nav className={styles.sidebarNav}>
          {sections.map(section => (
            <button
              key={section.id}
              className={`${styles.navItem} ${activeSection === section.id ? styles.active : ''}`}
              onClick={() => handleSectionClick(section.id)}
              title={isCollapsed ? `${section.label}: ${section.description}` : ''}
            >
              <span className={styles.navIcon}>{section.icon}</span>
              {!isCollapsed && (
                <div className={styles.navContent}>
                  <span className={styles.navLabel}>{section.label}</span>
                  <span className={styles.navDescription}>{section.description}</span>
                </div>
              )}
              {section.badge && section.badge > 0 && (
                <span className={styles.navBadge}>{section.badge}</span>
              )}
            </button>
          ))}
        </nav>
        
        {!isCollapsed && (
          <div className={styles.sidebarFooter}>
            <div className={styles.footerContent}>
              <span className={styles.footerText}>Clinic Management</span>
              <span className={styles.footerVersion}>v2.0</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default AdminSidebar; 