import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar, { AdminSection } from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import EnhancedUserManagement from './EnhancedUserManagement';
import EnhancedClientManagement from './EnhancedClientManagement';
import SessionPanel from './SessionPanel';
import EnhancedPersonalMeetingManagement from './EnhancedPersonalMeetingManagement';
import EnhancedFinancialManagement from './EnhancedFinancialManagement';
import EnhancedSystemConfiguration from './EnhancedSystemConfiguration';
import ExpensePanel from './ExpensePanel';
import AnalyticsPanel from './AnalyticsPanel';
import Calendar from './Calendar';
import SourceManagementTab from './SourceManagementTab';
import ExpenseCategoryManagement from './ExpenseCategoryManagement';
import PaymentTypeManagement from './PaymentTypeManagement';
import MeetingTypeManagement from './MeetingTypeManagement';
import { meetings, personalMeetings } from '../services/api';
import { Meeting, PersonalMeeting } from '../types';
import './EnhancedAdminPanelIntegrated.css';

interface AdminStats {
  totalUsers: number;
  totalClients: number;
  totalMeetings: number;
  totalExpenses: number;
  pendingApprovals: number;
  totalPersonalMeetings?: number;
  // Additional stats for our enhanced features
  activeClients: number;
  upcomingSessions: number;
  totalRevenue: number;
  pendingPayments: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

const EnhancedAdminPanelIntegrated: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Navigation state
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Data state
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalClients: 0,
    totalMeetings: 0,
    totalExpenses: 0,
    pendingApprovals: 0,
    totalPersonalMeetings: 0,
    activeClients: 0,
    upcomingSessions: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    systemHealth: 'good'
  });
  const [meetingsData, setMeetingsData] = useState<Meeting[]>([]);
  const [personalMeetingsData, setPersonalMeetingsData] = useState<PersonalMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Check admin access
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  // Fetch meetings data
  const fetchMeetingsData = useCallback(async () => {
    try {
      const meetingsList = await meetings.getAll();
      setMeetingsData(meetingsList);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    }
  }, []);

  // Fetch personal meetings data
  const fetchPersonalMeetingsData = useCallback(async () => {
    try {
      const personalMeetingsList = await personalMeetings.getAll();
      setPersonalMeetingsData(personalMeetingsList);
    } catch (error) {
      console.error('Failed to fetch personal meetings:', error);
    }
  }, []);

  // Fetch admin statistics
  const fetchAdminStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock stats for now - replace with actual API calls
      const mockStats: AdminStats = {
        totalUsers: 45,
        totalClients: 127,
        totalMeetings: 342,
        totalExpenses: 89,
        pendingApprovals: 3,
        totalPersonalMeetings: 156,
        // Additional enhanced stats
        activeClients: 98,
        upcomingSessions: 28,
        totalRevenue: 45750,
        pendingPayments: 2340,
        systemHealth: 'good'
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchAdminStats(),
        fetchMeetingsData(),
        fetchPersonalMeetingsData()
      ]);
    };
    loadAllData();
  }, [fetchAdminStats, fetchMeetingsData, fetchPersonalMeetingsData]);

  // Handle data refresh from child components
  const handleRefresh = useCallback(() => {
    const refreshAllData = async () => {
      await Promise.all([
        fetchAdminStats(),
        fetchMeetingsData(),
        fetchPersonalMeetingsData()
      ]);
    };
    refreshAllData();
  }, [fetchAdminStats, fetchMeetingsData, fetchPersonalMeetingsData]);

  // Handle quick actions from dashboard
  const handleQuickAction = (action: string) => {
    // Map string actions to AdminSection types
    const actionMap: Record<string, AdminSection> = {
      'user-management': 'users',
      'client-management': 'clients',
      'session-management': 'sessions',
      'personal-meetings': 'personal-meetings',
      'financial-management': 'analytics',
      'expense-management': 'expenses',
      'expense-categories': 'expense-categories',
      'payment-types': 'payment-types',
      'calendar': 'calendar',
      'sources': 'sources',
      'meeting-types': 'meeting-types',
      'analytics': 'analytics',
      'system-configuration': 'settings'
    };
    
    const mappedAction = actionMap[action];
    if (mappedAction) {
      setActiveSection(mappedAction);
    }
  };

  // Handle section navigation
  const handleSectionChange = (section: AdminSection) => {
    console.log('Section change requested:', section);
    console.log('Previous activeSection:', activeSection);
    setActiveSection(section);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Render active section content
  const renderActiveSection = () => {
    console.log('Rendering section:', activeSection);
    switch (activeSection) {
      case 'dashboard':
        return (
          <AdminDashboard
            stats={stats}
            onQuickAction={handleQuickAction}
            onRefresh={handleRefresh}
          />
        );
      
      case 'users':
        return (
          <EnhancedUserManagement
            onRefresh={handleRefresh}
          />
        );
      
      case 'clients':
        return (
          <EnhancedClientManagement
            onRefresh={handleRefresh}
          />
        );
      
      case 'sessions':
        return (
          <SessionPanel
            onClose={() => {}} // Admin panel doesn't need close functionality
            onRefresh={handleRefresh}
          />
        );
      
      case 'personal-meetings':
        return (
          <EnhancedPersonalMeetingManagement
            onRefresh={handleRefresh}
          />
        );
      
      case 'expenses':
        return (
          <div className="section-wrapper">
            <EnhancedFinancialManagement 
              onRefresh={handleRefresh}
            />
          </div>
        );
      
      case 'expense-categories':
        return (
          <div className="section-wrapper">
            <ExpenseCategoryManagement />
          </div>
        );
      
      case 'payment-types':
        return (
          <div className="section-wrapper">
            <PaymentTypeManagement onRefresh={handleRefresh} />
          </div>
        );
      
      case 'sources':
        return (
          <div className="section-wrapper">
            <SourceManagementTab />
          </div>
        );
      
      case 'meeting-types':
        return (
          <div className="section-wrapper">
            <MeetingTypeManagement onRefresh={handleRefresh} />
          </div>
        );
      
      case 'calendar':
        return (
          <div className="section-wrapper">
            <Calendar 
              meetings={meetingsData}
              personalMeetings={personalMeetingsData}
              onClose={() => setActiveSection('dashboard')}
              onRefresh={handleRefresh}
            />
          </div>
        );
      
      case 'analytics':
        return (
          <div className="section-wrapper">
            <AnalyticsPanel />
          </div>
        );
      
      case 'settings':
        return (
          <div className="section-wrapper">
            <EnhancedSystemConfiguration 
              onRefresh={handleRefresh}
            />
          </div>
        );
      
      default:
        return (
          <AdminDashboard
            stats={stats}
            onQuickAction={handleQuickAction}
            onRefresh={handleRefresh}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="enhanced-admin-panel-integrated">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-admin-panel-integrated">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        pendingUsersCount={stats.pendingApprovals}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle mobile menu"
            >
              ☰
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-home">Admin Panel</span>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-current">
                {activeSection === 'dashboard' && 'Dashboard'}
                {activeSection === 'users' && 'User Management'}
                {activeSection === 'clients' && 'Client Management'}
                {activeSection === 'sessions' && 'Session Management'}
                {activeSection === 'personal-meetings' && 'Personal Meetings'}
                {activeSection === 'expenses' && 'Expense Management'}
                {activeSection === 'expense-categories' && 'Expense Categories'}
                {activeSection === 'payment-types' && 'Payment Types'}
                {activeSection === 'sources' && 'Client Sources'}
                {activeSection === 'meeting-types' && 'Meeting Types'}
                {activeSection === 'calendar' && 'Calendar'}
                {activeSection === 'analytics' && 'Analytics'}
                {activeSection === 'settings' && 'System Settings'}
              </span>
            </div>
          </div>
          
          <div className="top-bar-actions">
            <div className="user-info">
              <span className="user-name">{user?.fullName}</span>
              <span className="user-role">Admin</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Section Content */}
        <div className="section-content">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminPanelIntegrated; 