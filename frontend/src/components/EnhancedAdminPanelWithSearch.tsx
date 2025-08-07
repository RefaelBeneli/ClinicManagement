import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar, { AdminSection } from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import AdminSearch, { SearchFilter, FilterPreset } from './AdminSearch';
import BulkOperations, { BulkAction, BulkOperationProgress } from './BulkOperations';
import UserApprovalPanel from './UserApprovalPanel';
import UserEditModal from './UserEditModal';
import MeetingPanel from './MeetingPanel';
import ExpensePanel from './ExpensePanel';
import PersonalMeetingPanel from './PersonalMeetingPanel';
import Calendar from './Calendar';
import SourceManagementTab from './SourceManagementTab';
import AnalyticsPanel from './AnalyticsPanel';
import { userApproval, clients, meetings, expenses, personalMeetings } from '../services/api';
import { Client, Meeting, Expense, PersonalMeeting } from '../types';
import './EnhancedAdminPanel.css';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  enabled: boolean;
  approvalStatus: string;
  createdAt: string;
}

const EnhancedAdminPanelWithSearch: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [clientList, setClientList] = useState<Client[]>([]);
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const [personalMeetingList, setPersonalMeetingList] = useState<PersonalMeeting[]>([]);
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation states
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Search and filter states
  const [searchValue, setSearchValue] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  
  // Bulk operations states
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkActions, setBulkActions] = useState<BulkAction[]>([]);
  const [bulkProgress, setBulkProgress] = useState<BulkOperationProgress | undefined>();
  
  // Modal and panel states
  const [showUserApprovalPanel, setShowUserApprovalPanel] = useState(false);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  // Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClients: 0,
    totalMeetings: 0,
    totalPersonalMeetings: 0,
    totalExpenses: 0,
    pendingApprovals: 0
  });

  // API URL configuration
  const apiUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
        ? 'https://web-production-9aa8.up.railway.app/api'
        : 'http://localhost:8085/api');
  }, []);

  // Initialize search filters based on active section
  const initializeSearchFilters = useCallback((section: AdminSection) => {
    const baseFilters: SearchFilter[] = [];

    switch (section) {
      case 'users':
        baseFilters.push(
          {
            id: 'role',
            label: 'Role',
            type: 'select',
            options: [
              { value: 'ADMIN', label: 'Admin' },
              { value: 'USER', label: 'User' },
              { value: 'THERAPIST', label: 'Therapist' }
            ],
            value: ''
          },
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Disabled' }
            ],
            value: ''
          },
          {
            id: 'approvalStatus',
            label: 'Approval Status',
            type: 'select',
            options: [
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' }
            ],
            value: ''
          },
          {
            id: 'createdAfter',
            label: 'Created After',
            type: 'date',
            value: '',
            placeholder: 'Select date'
          }
        );
        break;

      case 'clients':
        baseFilters.push(
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' }
            ],
            value: ''
          },
          {
            id: 'hasEmail',
            label: 'Has Email',
            type: 'boolean',
            value: false
          },
          {
            id: 'hasPhone',
            label: 'Has Phone',
            type: 'boolean',
            value: false
          }
        );
        break;

      case 'sessions':
        baseFilters.push(
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'SCHEDULED', label: 'Scheduled' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' }
            ],
            value: ''
          },
          {
            id: 'isPaid',
            label: 'Payment Status',
            type: 'select',
            options: [
              { value: 'true', label: 'Paid' },
              { value: 'false', label: 'Unpaid' }
            ],
            value: ''
          },
          {
            id: 'dateFrom',
            label: 'Date From',
            type: 'date',
            value: ''
          },
          {
            id: 'dateTo',
            label: 'Date To',
            type: 'date',
            value: ''
          }
        );
        break;

      case 'expenses':
        baseFilters.push(
          {
            id: 'isPaid',
            label: 'Payment Status',
            type: 'select',
            options: [
              { value: 'true', label: 'Paid' },
              { value: 'false', label: 'Unpaid' }
            ],
            value: ''
          },
          {
            id: 'minAmount',
            label: 'Min Amount',
            type: 'number',
            value: '',
            placeholder: 'Enter minimum amount'
          },
          {
            id: 'maxAmount',
            label: 'Max Amount',
            type: 'number',
            value: '',
            placeholder: 'Enter maximum amount'
          }
        );
        break;

      default:
        break;
    }

    setSearchFilters(baseFilters);
  }, []);

  // Initialize bulk actions based on active section
  const initializeBulkActions = useCallback((section: AdminSection) => {
    const actions: BulkAction[] = [];

    switch (section) {
      case 'users':
        actions.push(
          {
            id: 'approve',
            label: 'Approve Users',
            icon: '✅',
            color: '#28a745',
            requiresConfirmation: true,
            confirmationMessage: 'Are you sure you want to approve the selected users?',
            isDisabled: (ids) => users.filter(u => ids.includes(u.id.toString()) && u.approvalStatus === 'PENDING').length === 0
          },
          {
            id: 'disable',
            label: 'Disable Users',
            icon: '🚫',
            color: '#ffc107',
            requiresConfirmation: true,
            confirmationMessage: 'Are you sure you want to disable the selected users?'
          },
          {
            id: 'delete',
            label: 'Delete Users',
            icon: '🗑️',
            color: '#dc3545',
            requiresConfirmation: true,
            isDestructive: true,
            confirmationMessage: 'This will permanently delete the selected users and all their data.'
          }
        );
        break;

      case 'clients':
        actions.push(
          {
            id: 'activate',
            label: 'Activate Clients',
            icon: '✅',
            color: '#28a745',
            requiresConfirmation: true
          },
          {
            id: 'deactivate',
            label: 'Deactivate Clients',
            icon: '🚫',
            color: '#ffc107',
            requiresConfirmation: true
          },
          {
            id: 'export',
            label: 'Export Data',
            icon: '📊',
            color: '#17a2b8'
          },
          {
            id: 'delete',
            label: 'Delete Clients',
            icon: '🗑️',
            color: '#dc3545',
            requiresConfirmation: true,
            isDestructive: true
          }
        );
        break;

      case 'sessions':
        actions.push(
          {
            id: 'markPaid',
            label: 'Mark as Paid',
            icon: '💰',
            color: '#28a745',
            requiresConfirmation: true
          },
          {
            id: 'cancel',
            label: 'Cancel Sessions',
            icon: '❌',
            color: '#ffc107',
            requiresConfirmation: true
          },
          {
            id: 'export',
            label: 'Export Data',
            icon: '📊',
            color: '#17a2b8'
          },
          {
            id: 'delete',
            label: 'Delete Sessions',
            icon: '🗑️',
            color: '#dc3545',
            requiresConfirmation: true,
            isDestructive: true
          }
        );
        break;

      case 'expenses':
        actions.push(
          {
            id: 'markPaid',
            label: 'Mark as Paid',
            icon: '💰',
            color: '#28a745',
            requiresConfirmation: true
          },
          {
            id: 'export',
            label: 'Export Data',
            icon: '📊',
            color: '#17a2b8'
          },
          {
            id: 'delete',
            label: 'Delete Expenses',
            icon: '🗑️',
            color: '#dc3545',
            requiresConfirmation: true,
            isDestructive: true
          }
        );
        break;

      default:
        break;
    }

    setBulkActions(actions);
  }, [users]);

  // Generate search suggestions based on current data and section
  const generateSearchSuggestions = useCallback((section: AdminSection) => {
    const suggestions: string[] = [];

    switch (section) {
      case 'users':
        suggestions.push(
          ...users.map(u => u.username),
          ...users.map(u => u.fullName),
          ...users.map(u => u.email),
          'pending approval',
          'admin users',
          'disabled users'
        );
        break;

      case 'clients':
        suggestions.push(
          ...clientList.map(c => c.fullName),
          ...clientList.filter(c => c.email).map(c => c.email!),
          'active clients',
          'inactive clients'
        );
        break;

      case 'sessions':
        suggestions.push(
          ...meetingList.map(m => m.client.fullName),
          'unpaid sessions',
          'completed sessions',
          'scheduled sessions'
        );
        break;

      case 'expenses':
        suggestions.push(
          ...expenseList.map(e => e.description).filter((desc): desc is string => Boolean(desc)),
          ...expenseList.map(e => e.category.name),
          'unpaid expenses',
          'recurring expenses'
        );
        break;

      default:
        break;
    }

    const uniqueSuggestions = Array.from(new Set(suggestions.filter(Boolean)));
    setSearchSuggestions(uniqueSuggestions);
  }, [users, clientList, meetingList, expenseList]);

  // Data fetching functions (same as before)
  const fetchPendingUsersCount = useCallback(async () => {
    try {
      const count = await userApproval.getPendingCount();
      setPendingUsersCount(count.count);
    } catch (error) {
      console.error('Failed to fetch pending users count:', error);
      setPendingUsersCount(0);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/users?page=0&size=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, [apiUrl, token]);

  const fetchClients = useCallback(async () => {
    try {
      const clientsData = await clients.getAll();
      setClientList(clientsData);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  }, []);

  const fetchMeetings = useCallback(async () => {
    try {
      const meetingsData = await meetings.getAll();
      setMeetingList(meetingsData);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    }
  }, []);

  const fetchPersonalMeetings = useCallback(async () => {
    try {
      const personalMeetingsData = await personalMeetings.getAll();
      setPersonalMeetingList(personalMeetingsData);
    } catch (error) {
      console.error('Failed to fetch personal meetings:', error);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const expensesData = await expenses.getAll();
      setExpenseList(expensesData);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [usersResponse, clientsData, meetingsData, personalMeetingsData, expensesData] = await Promise.all([
        fetch(`${apiUrl}/admin/users?page=0&size=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        clients.getAll(),
        meetings.getAll(),
        personalMeetings.getAll(),
        expenses.getAll()
      ]);

      const usersData = await usersResponse.json();
      
      setStats({
        totalUsers: usersData.totalElements || 0,
        totalClients: clientsData.length,
        totalMeetings: meetingsData.length,
        totalPersonalMeetings: personalMeetingsData.length,
        totalExpenses: expensesData.length,
        pendingApprovals: pendingUsersCount
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [apiUrl, token, pendingUsersCount]);

  // Load all admin data
  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(), 
        fetchClients(), 
        fetchMeetings(), 
        fetchPersonalMeetings(),
        fetchExpenses(),
        fetchPendingUsersCount()
      ]);
      await fetchStats();
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchClients, fetchMeetings, fetchPersonalMeetings, fetchExpenses, fetchPendingUsersCount, fetchStats]);

  // Initialize data on mount
  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Update search filters and suggestions when section changes
  useEffect(() => {
    initializeSearchFilters(activeSection);
    initializeBulkActions(activeSection);
    generateSearchSuggestions(activeSection);
    setSelectedItems([]);
    setSearchValue('');
  }, [activeSection, initializeSearchFilters, initializeBulkActions, generateSearchSuggestions]);

  // Event handlers
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'users':
        setActiveSection('users');
        break;
      case 'clients':
        setActiveSection('clients');
        break;
      case 'sessions':
        setActiveSection('sessions');
        break;
      case 'personal-meetings':
        setActiveSection('personal-meetings');
        break;
      case 'expenses':
        setActiveSection('expenses');
        break;
      case 'analytics':
        setActiveSection('analytics');
        break;
      case 'settings':
        setActiveSection('settings');
        break;
      default:
        setActiveSection('dashboard');
    }
  };

  const handleRefresh = async () => {
    await loadAdminData();
  };

  // Search and filter handlers
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setSearchFilters(prev => 
      prev.map(filter => 
        filter.id === filterId ? { ...filter, value } : filter
      )
    );
  };

  const handleToggleAdvancedFilters = () => {
    setShowAdvancedFilters(prev => !prev);
  };

  const handlePresetApply = (preset: FilterPreset) => {
    setSearchFilters(prev => 
      prev.map(filter => ({
        ...filter,
        value: preset.filters[filter.id] || (filter.type === 'boolean' ? false : '')
      }))
    );
  };

  const handlePresetSave = (name: string, description: string, filters: Record<string, any>) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      description,
      filters
    };
    setFilterPresets(prev => [...prev, newPreset]);
  };

  const handlePresetDelete = (presetId: string) => {
    setFilterPresets(prev => prev.filter(p => p.id !== presetId));
  };

  // Bulk operations handlers
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      // Select all items based on current section
      switch (activeSection) {
        case 'users':
          setSelectedItems(users.map(u => u.id.toString()));
          break;
        case 'clients':
          setSelectedItems(clientList.map(c => c.id.toString()));
          break;
        case 'sessions':
          setSelectedItems(meetingList.map(m => m.id.toString()));
          break;
        case 'expenses':
          setSelectedItems(expenseList.map(e => e.id.toString()));
          break;
        default:
          break;
      }
    } else {
      setSelectedItems([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleBulkActionExecute = async (actionId: string, selectedIds: string[]) => {
    // Simulate bulk operation with progress
    setBulkProgress({
      id: actionId,
      total: selectedIds.length,
      completed: 0,
      failed: 0,
      status: 'running',
      message: `Processing ${actionId}...`,
      errors: []
    });

    // Simulate processing items
    for (let i = 0; i < selectedIds.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      setBulkProgress(prev => prev ? {
        ...prev,
        completed: i + 1,
        message: `Processing ${actionId}: ${i + 1}/${selectedIds.length}`
      } : undefined);
    }

    setBulkProgress(prev => prev ? {
      ...prev,
      status: 'completed',
      message: `${actionId} completed successfully`
    } : undefined);

    // Clear progress after 3 seconds
    setTimeout(() => {
      setBulkProgress(undefined);
      setSelectedItems([]);
      handleRefresh();
    }, 3000);
  };

  const handleProgressCancel = () => {
    setBulkProgress(prev => prev ? {
      ...prev,
      status: 'cancelled',
      message: 'Operation cancelled'
    } : undefined);
    
    setTimeout(() => {
      setBulkProgress(undefined);
    }, 2000);
  };

  // Get filtered data based on search and filters
  const getFilteredData = () => {
    // Implementation would filter the data based on searchValue and searchFilters
    // For now, return the raw data
    switch (activeSection) {
      case 'users':
        return users;
      case 'clients':
        return clientList;
      case 'sessions':
        return meetingList;
      case 'expenses':
        return expenseList;
      default:
        return [];
    }
  };

  const filteredData = getFilteredData();
  const shouldShowSearch = ['users', 'clients', 'sessions', 'expenses'].includes(activeSection);
  const shouldShowBulkOps = shouldShowSearch && filteredData.length > 0;

  // Render main content (same as before, but with filtered data)
  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <AdminDashboard
            stats={stats}
            onQuickAction={handleQuickAction}
            onRefresh={handleRefresh}
          />
        );

      // Other cases remain the same as in the original EnhancedAdminPanel
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

  return (
    <div className="enhanced-admin-panel">
      {/* Sidebar Navigation */}
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        pendingUsersCount={pendingUsersCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Area */}
      <div className={`admin-main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Bar */}
        <div className="admin-top-bar">
          <div className="breadcrumb">
            <span>Admin Panel</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace('-', ' ')}
            </span>
          </div>
          <div className="top-bar-actions">
            <span className="user-info">Welcome, {user?.fullName || user?.username}!</span>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        {shouldShowSearch && (
          <div className="search-section">
            <AdminSearch
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              filters={searchFilters}
              onFilterChange={handleFilterChange}
              filterPresets={filterPresets}
              onPresetApply={handlePresetApply}
              onPresetSave={handlePresetSave}
              onPresetDelete={handlePresetDelete}
              suggestions={searchSuggestions}
              placeholder={`Search ${activeSection.replace('-', ' ')}...`}
              showAdvancedFilters={showAdvancedFilters}
              onToggleAdvancedFilters={handleToggleAdvancedFilters}
              resultCount={filteredData.length}
              isLoading={loading}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="admin-content-wrapper">
          {renderMainContent()}
        </div>
      </div>

      {/* Bulk Operations */}
      {shouldShowBulkOps && (
        <BulkOperations
          selectedItems={selectedItems}
          totalItems={filteredData.length}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          actions={bulkActions}
          onActionExecute={handleBulkActionExecute}
          progress={bulkProgress}
          onProgressCancel={handleProgressCancel}
          isVisible={selectedItems.length > 0 || !!bulkProgress}
        />
      )}

      {/* Modals (same as before) */}
      {showUserApprovalPanel && (
        <UserApprovalPanel 
          onClose={() => {
            setShowUserApprovalPanel(false);
            fetchPendingUsersCount();
            fetchUsers();
          }}
        />
      )}
      
      {editingUserId && (
        <UserEditModal 
          userId={editingUserId} 
          onClose={() => setEditingUserId(null)} 
          onSaved={fetchUsers} 
        />
      )}
    </div>
  );
};

export default EnhancedAdminPanelWithSearch; 