import React from 'react';
import { MainSection, PendingCounts } from './types';
import PendingApprovalsCard from './cards/PendingApprovalsCard';
import SystemHealthCard from './cards/SystemHealthCard';
import TodaysSessionsCard from './cards/TodaysSessionsCard';
import QuickActionsCard from './cards/QuickActionsCard';
import RecentActivityCard from './cards/RecentActivityCard';
import FinancialSummaryCard from './cards/FinancialSummaryCard';
import ClickableStatusDropdown from './shared/ClickableStatusDropdown';
import { User, Client } from '../../types';
import styles from './DashboardContent.module.css';

interface DashboardContentProps {
  activeSection: MainSection;
  adminUsers?: User[];
  clients?: Client[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  pendingCounts?: PendingCounts;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeSection,
  adminUsers = [],
  clients = [],
  loading = false,
  error = null,
  onRefresh,
  pendingCounts = { users: 0, sessions: 0, expenses: 0 }
}) => {
  const handlePendingApprovalsViewAll = () => {
    // TODO: Implement view all pending approvals
    console.log('View all pending approvals');
  };

  const handlePendingApprovalsQuickApprove = () => {
    // TODO: Implement quick approve
    console.log('Quick approve pending approvals');
  };

  const handleUserStatusChange = async (userId: number, newStatus: boolean) => {
    try {
      // TODO: Implement API call to update user status
      console.log('Updating user status:', userId, newStatus);
      // This would typically call an API to update the user status
      // For now, we'll just log the action
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleClientStatusChange = async (clientId: number, newStatus: boolean) => {
    try {
      // TODO: Implement API call to update client status
      console.log('Updating client status:', clientId, newStatus);
      // This would typically call an API to update the client status
      // For now, we'll just log the action
    } catch (error) {
      console.error('Error updating client status:', error);
    }
  };

  const renderOverviewSection = () => (
    <div className={styles.dashboardContent}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>Admin Dashboard</h1>
        <p className={styles.sectionDescription}>
          Monitor system health, manage pending approvals, and oversee daily operations.
        </p>
      </div>

      <div className={styles.priorityCards}>
        <PendingApprovalsCard
          pendingCount={pendingCounts.users}
          onViewAll={handlePendingApprovalsViewAll}
          onQuickApprove={handlePendingApprovalsQuickApprove}
          loading={loading}
        />
        <SystemHealthCard loading={loading} />
        <TodaysSessionsCard loading={loading} />
        <QuickActionsCard onQuickAction={() => {}} loading={loading} />
      </div>

      <div className={styles.secondaryCards}>
        <RecentActivityCard loading={loading} />
        <FinancialSummaryCard loading={loading} />
      </div>
    </div>
  );

  const renderPeopleSection = () => (
    <div className={styles.dashboardContent}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>People Management</h1>
        <p className={styles.sectionDescription}>
          Manage users, clients, and their access to the system.
        </p>
        {onRefresh && (
          <button 
            className={styles.refreshButton}
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        )}
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          <p>❌ Error: {error}</p>
          {onRefresh && (
            <button onClick={onRefresh} className={styles.retryButton}>
              Retry
            </button>
          )}
        </div>
      )}
      
      <div className={styles.sectionContent}>
        <div className={styles.peopleGrid}>
          {/* Users Section */}
          <div className={styles.peopleSection}>
            <h3 className={styles.subsectionTitle}>
              👥 Users ({adminUsers.length})
            </h3>
            {loading ? (
              <div className={styles.loadingState}>
                <p>Loading users...</p>
              </div>
            ) : adminUsers.length > 0 ? (
              <div className={styles.dataTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.slice(0, 10).map((user) => (
                      <tr key={user.id}>
                        <td>{user.fullName}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`${styles.role} ${styles[user.role.toLowerCase()]}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <ClickableStatusDropdown
                            currentStatus={true} // Default to active for dashboard view
                            onStatusChange={(newStatus) => handleUserStatusChange(user.id, newStatus as boolean)}
                            entityId={user.id}
                            entityType="user"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {adminUsers.length > 10 && (
                  <p className={styles.moreItems}>
                    Showing 10 of {adminUsers.length} users
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No users found</p>
              </div>
            )}
          </div>

          {/* Clients Section */}
          <div className={styles.peopleSection}>
            <h3 className={styles.subsectionTitle}>
              🧑‍⚕️ Clients ({clients.length})
            </h3>
            {loading ? (
              <div className={styles.loadingState}>
                <p>Loading clients...</p>
              </div>
            ) : clients.length > 0 ? (
              <div className={styles.dataTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.slice(0, 10).map((client) => (
                      <tr key={client.id}>
                        <td>{client.fullName}</td>
                        <td>{client.email || 'N/A'}</td>
                        <td>{client.phone || 'N/A'}</td>
                        <td>
                          <ClickableStatusDropdown
                            currentStatus={client.active}
                            onStatusChange={(newStatus) => handleClientStatusChange(client.id, newStatus as boolean)}
                            entityId={client.id}
                            entityType="client"
                          />
                        </td>
                        <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {clients.length > 10 && (
                  <p className={styles.moreItems}>
                    Showing 10 of {clients.length} clients
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No clients found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSessionsSection = () => (
    <div className={styles.dashboardContent}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>Session Management</h1>
        <p className={styles.sectionDescription}>
          Manage meetings, appointments, and calendar integration.
        </p>
      </div>
      
      <div className={styles.sectionContent}>
        <div className={styles.comingSoon}>
          <h3>Session Management</h3>
          <p>Comprehensive session management interface coming soon.</p>
        </div>
      </div>
    </div>
  );

  const renderFinanceSection = () => (
    <div className={styles.dashboardContent}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>Financial Management</h1>
        <p className={styles.sectionDescription}>
          Monitor expenses, revenue, and financial reports.
        </p>
      </div>
      
      <div className={styles.sectionContent}>
        <div className={styles.comingSoon}>
          <h3>Financial Management</h3>
          <p>Comprehensive financial management interface coming soon.</p>
        </div>
      </div>
    </div>
  );

  const renderSystemSection = () => (
    <div className={styles.dashboardContent}>
      <div className={styles.sectionHeader}>
        <h1 className={styles.sectionTitle}>System Configuration</h1>
        <p className={styles.sectionDescription}>
          Configure system settings, manage integrations, and monitor system health.
        </p>
      </div>
      
      <div className={styles.sectionContent}>
        <div className={styles.comingSoon}>
          <h3>System Configuration</h3>
          <p>Comprehensive system configuration interface coming soon.</p>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverviewSection();
      case 'people':
        return renderPeopleSection();
      case 'sessions':
        return renderSessionsSection();
      case 'finance':
        return renderFinanceSection();
      case 'system':
        return renderSystemSection();
      default:
        return renderOverviewSection();
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {renderSection()}
    </div>
  );
};

export default DashboardContent; 