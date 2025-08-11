import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminHeader from './header/AdminHeader';
import AdminSidebar from './sidebar/AdminSidebar';
import DashboardContent from './DashboardContent';
import QuickActionModal from './modals/QuickActionModal';
import { MainSection, PendingCounts, QuickActionConfig } from './types';
import { adminUsers, clients, userApproval } from '../../services/api';
import { User, Client } from '../../types';
import styles from './UnifiedAdminPanel.module.css';

interface UnifiedAdminPanelProps {}

interface AdminUser extends User {
  enabled: boolean;
  approvalStatus: string;
  createdAt: string;
}

interface AdminClient extends Client {
  // Client interface already has all the fields we need
}

const UnifiedAdminPanel: React.FC<UnifiedAdminPanelProps> = () => {
  const { user } = useAuth();
    const [activeSection, setActiveSection] = useState<MainSection>('overview');
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false);
  const [quickActionConfig, setQuickActionConfig] = useState<QuickActionConfig | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data state
  const [adminUsersData, setAdminUsersData] = useState<AdminUser[]>([]);
  const [clientsData, setClientsData] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pending counts state
  const [pendingCounts, setPendingCounts] = useState<PendingCounts>({
    users: 0,
    sessions: 0,
    expenses: 0
  });

  // Fetch admin users data
  const fetchAdminUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminUsers.getAll(0, 100); // Get first 100 users
      setAdminUsersData(response.content || response);
    } catch (err) {
      console.error('Error fetching admin users:', err);
      setError('Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch clients data
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clients.getAll(); // Get all clients
      setClientsData(response);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to fetch clients data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch pending counts
  const fetchPendingCounts = useCallback(async () => {
    try {
      const pendingUsersResponse = await userApproval.getPendingCount();
      const pendingUsers = pendingUsersResponse.count || 0;
      
      setPendingCounts({
        users: pendingUsers,
        sessions: 0, // TODO: Implement session pending count
        expenses: 0  // TODO: Implement expense pending count
      });
    } catch (err) {
      console.error('Error fetching pending counts:', err);
    }
  }, []);

  // Load data based on active section
  useEffect(() => {
    if (activeSection === 'people') {
      fetchAdminUsers();
      fetchClients();
    }
    fetchPendingCounts();
  }, [activeSection, fetchAdminUsers, fetchClients, fetchPendingCounts]);

  const handleSectionChange = (section: MainSection) => {
    setActiveSection(section);
  };

  const handleQuickAction = (config: QuickActionConfig) => {
    setQuickActionConfig(config);
    setIsQuickActionModalOpen(true);
  };

  const handleQuickActionComplete = () => {
    setIsQuickActionModalOpen(false);
    setQuickActionConfig(null);
    
    // Refresh data if needed
    if (activeSection === 'people') {
      fetchAdminUsers();
      fetchClients();
    }
    fetchPendingCounts();
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className={styles.accessDenied}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className={styles.adminPanel}>
                        <AdminHeader
                    user={user}
                    notificationCount={pendingCounts.users}
                    onSearch={(query: string) => console.log('Search:', query)}
                    onLogout={() => console.log('Logout')}
                    onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  />
      
      <div className={styles.mainContent}>
                            <AdminSidebar
                      activeSection={activeSection}
                      onSectionChange={handleSectionChange}
                      isCollapsed={isSidebarCollapsed}
                      onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                      pendingCounts={pendingCounts}
                      mobileOpen={isMobileMenuOpen}
                      onMobileClose={() => setIsMobileMenuOpen(false)}
                    />
        
        <DashboardContent
          activeSection={activeSection}
          adminUsers={adminUsersData}
          clients={clientsData}
          loading={loading}
          error={error}
          onRefresh={() => {
            if (activeSection === 'people') {
              fetchAdminUsers();
              fetchClients();
            }
            fetchPendingCounts();
          }}
        />
      </div>

                        {isQuickActionModalOpen && quickActionConfig && (
                    <QuickActionModal
                      isOpen={isQuickActionModalOpen}
                      action={quickActionConfig.action}
                      entityType={quickActionConfig.entityType}
                      data={quickActionConfig.data}
                      onClose={() => setIsQuickActionModalOpen(false)}
                      onSubmit={handleQuickActionComplete}
                    />
                  )}
    </div>
  );
};

export default UnifiedAdminPanel; 