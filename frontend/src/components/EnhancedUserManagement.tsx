import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSearch, { SearchFilter, FilterPreset } from './AdminSearch';
import BulkOperations, { BulkAction, BulkOperationProgress } from './BulkOperations';
import UserApprovalPanel from './UserApprovalPanel';
import UserEditModal from './UserEditModal';
import { userApproval } from '../services/api';
import './EnhancedUserManagement.css';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  enabled: boolean;
  approvalStatus: string;
  createdAt: string;
  lastLogin?: string;
}

interface UserActivityLog {
  id: number;
  userId: number;
  action: string;
  timestamp: string;
  details?: string;
}

interface EnhancedUserManagementProps {
  onRefresh?: () => void;
}

const EnhancedUserManagement: React.FC<EnhancedUserManagementProps> = ({
  onRefresh
}) => {
  const { user: currentUser, token } = useAuth();
  
  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [userActivityLogs, setUserActivityLogs] = useState<UserActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchValue, setSearchValue] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  
  // Bulk operations states
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkProgress, setBulkProgress] = useState<BulkOperationProgress | undefined>();
  
  // Modal states
  const [showUserApprovalPanel, setShowUserApprovalPanel] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedUserForActivity, setSelectedUserForActivity] = useState<number | null>(null);

  // Ref to prevent double fetching
  const hasInitialized = useRef(false);

  // API URL configuration
  const apiUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
        ? 'https://web-production-9aa8.up.railway.app/api'
        : 'http://localhost:8085/api');
  }, []);

  // Initialize search filters
  const initializeSearchFilters = useCallback(() => {
    const filters: SearchFilter[] = [
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
        label: 'Account Status',
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
      },
      {
        id: 'hasRecentActivity',
        label: 'Has Recent Activity',
        type: 'boolean',
        value: false
      }
    ];
    setSearchFilters(filters);
  }, []);

  // Initialize bulk actions
  const initializeBulkActions = useCallback(() => {
    const actions: BulkAction[] = [
      {
        id: 'approve',
        label: 'Approve Users',
        icon: '✅',
        color: '#28a745',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to approve the selected users?',
        isDisabled: (ids) => {
          const selectedUsersData = users.filter(u => ids.includes(u.id.toString()));
          return selectedUsersData.every(u => u.approvalStatus !== 'PENDING');
        }
      },
      {
        id: 'reject',
        label: 'Reject Users',
        icon: '❌',
        color: '#dc3545',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to reject the selected users?',
        isDisabled: (ids) => {
          const selectedUsersData = users.filter(u => ids.includes(u.id.toString()));
          return selectedUsersData.every(u => u.approvalStatus !== 'PENDING');
        }
      },
      {
        id: 'enable',
        label: 'Enable Accounts',
        icon: '🔓',
        color: '#28a745',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to enable the selected user accounts?',
        isDisabled: (ids) => {
          const selectedUsersData = users.filter(u => ids.includes(u.id.toString()));
          return selectedUsersData.every(u => u.enabled);
        }
      },
      {
        id: 'disable',
        label: 'Disable Accounts',
        icon: '🔒',
        color: '#ffc107',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to disable the selected user accounts? This will prevent them from logging in.',
        isDisabled: (ids) => {
          const selectedUsersData = users.filter(u => ids.includes(u.id.toString()));
          return selectedUsersData.every(u => !u.enabled);
        }
      },
      {
        id: 'changeRole',
        label: 'Change Role',
        icon: '👤',
        color: '#17a2b8',
        requiresConfirmation: true,
        confirmationMessage: 'This will open a dialog to change roles for selected users.'
      },
      {
        id: 'export',
        label: 'Export Data',
        icon: '📊',
        color: '#6f42c1'
      },
      {
        id: 'delete',
        label: 'Delete Users',
        icon: '🗑️',
        color: '#dc3545',
        requiresConfirmation: true,
        isDestructive: true,
        confirmationMessage: 'This will permanently delete the selected users and all their associated data. This action cannot be undone.',
        isDisabled: (ids) => {
          // Prevent deleting current user or other admins
          const selectedUsersData = users.filter(u => ids.includes(u.id.toString()));
          return selectedUsersData.some(u => u.id === currentUser?.id || u.role === 'ADMIN');
        }
      }
    ];
    return actions;
  }, [users, currentUser?.id]);

  // Generate search suggestions
  const generateSearchSuggestions = useCallback(() => {
    const suggestions: string[] = [
      ...users.map(u => u.username),
      ...users.map(u => u.fullName),
      ...users.map(u => u.email),
      'pending approval',
      'admin users',
      'disabled users',
      'active users',
      'recently created'
    ];
    return Array.from(new Set(suggestions.filter(Boolean)));
  }, [users]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${apiUrl}/admin/users?page=0&size=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.content || []);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  // Fetch user activity logs
  const fetchUserActivityLogs = useCallback(async (userId: number) => {
    try {
      // Mock activity logs for now - replace with actual API call
      const mockLogs: UserActivityLog[] = [
        {
          id: 1,
          userId,
          action: 'LOGIN',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          details: 'Successful login from IP 192.168.1.1'
        },
        {
          id: 2,
          userId,
          action: 'UPDATE_PROFILE',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          details: 'Updated profile information'
        }
      ];
      setUserActivityLogs(mockLogs);
    } catch (error) {
      console.error('Failed to fetch user activity logs:', error);
    }
  }, []);

  // Apply search and filters
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...users];

    // Apply search
    if (searchValue.trim()) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm) ||
        user.fullName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.role || '').toLowerCase().includes(searchTerm) ||
        (user.approvalStatus || '').toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    searchFilters.forEach(filter => {
      if (filter.value !== undefined && filter.value !== '' && filter.value !== false) {
        switch (filter.id) {
          case 'role':
            filtered = filtered.filter(user => (user.role || '') === filter.value);
            break;
          case 'status':
            filtered = filtered.filter(user => user.enabled === (filter.value === 'true'));
            break;
          case 'approvalStatus':
            filtered = filtered.filter(user => (user.approvalStatus || '') === filter.value);
            break;
          case 'createdAfter':
            filtered = filtered.filter(user => new Date(user.createdAt) >= new Date(filter.value));
            break;
          case 'hasRecentActivity':
            if (filter.value) {
              // Mock recent activity check - replace with actual logic
              filtered = filtered.filter(user => user.lastLogin && 
                new Date(user.lastLogin) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              );
            }
            break;
        }
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchValue, searchFilters]);

  // Initialize on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeSearchFilters();
      fetchUsers();
    }
  }, [initializeSearchFilters, fetchUsers]);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Clear selection when filtered data changes
  useEffect(() => {
    setSelectedUsers([]);
  }, [filteredUsers]);

  // Event handlers
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
      setSelectedUsers(filteredUsers.map(u => u.id.toString()));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleUserSelect = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
  };

  const handleBulkActionExecute = async (actionId: string, selectedIds: string[]) => {
    setBulkProgress({
      id: actionId,
      total: selectedIds.length,
      completed: 0,
      failed: 0,
      status: 'running',
      message: `Processing ${actionId}...`,
      errors: []
    });

    try {
      // Simulate processing each user
      for (let i = 0; i < selectedIds.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
        
        const userId = selectedIds[i];
        
        try {
          // Mock API calls - replace with actual implementation
          switch (actionId) {
            case 'approve':
              await userApproval.approveUser(parseInt(userId), { approvalStatus: 'APPROVED' });
              break;
            case 'reject':
              await userApproval.rejectUser(parseInt(userId), { approvalStatus: 'REJECTED', rejectionReason: 'Bulk rejection' });
              break;
            case 'enable':
            case 'disable':
            case 'delete':
              // Mock implementation
              console.log(`${actionId} user ${userId}`);
              break;
            case 'export':
              // Mock export
              console.log('Exporting user data...');
              break;
          }
          
          setBulkProgress(prev => prev ? {
            ...prev,
            completed: i + 1,
            message: `Processing ${actionId}: ${i + 1}/${selectedIds.length}`
          } : undefined);
        } catch (error) {
          setBulkProgress(prev => prev ? {
            ...prev,
            failed: prev.failed + 1,
            errors: [...(prev.errors || []), `Failed to ${actionId} user ${userId}: ${error}`]
          } : undefined);
        }
      }

      setBulkProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        message: `${actionId} completed successfully`
      } : undefined);

      // Refresh data after bulk operation
      setTimeout(() => {
        fetchUsers();
        if (onRefresh) onRefresh();
      }, 1000);

    } catch (error) {
      setBulkProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        message: `${actionId} failed: ${error}`
      } : undefined);
    }

    // Clear progress after 3 seconds
    setTimeout(() => {
      setBulkProgress(undefined);
      setSelectedUsers([]);
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

  // User action handlers
  const handleUserEdit = (userId: number) => {
    setEditingUserId(userId);
  };

  const handleUserActivity = (userId: number) => {
    setSelectedUserForActivity(userId);
    fetchUserActivityLogs(userId);
    setShowActivityLog(true);
  };

  const handleCreateUser = () => {
    setShowCreateUserModal(true);
  };

  const handleRefreshData = () => {
    fetchUsers();
    if (onRefresh) onRefresh();
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role badge class
  const getRoleBadgeClass = (role: string | undefined | null) => {
    if (!role) return 'role-badge unknown';
    
    switch (role.toLowerCase()) {
      case 'admin': return 'role-badge admin';
      case 'therapist': return 'role-badge therapist';
      default: return 'role-badge user';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (enabled: boolean) => {
    return enabled ? 'status-badge enabled' : 'status-badge disabled';
  };

  // Get approval badge class
  const getApprovalBadgeClass = (status: string | undefined | null) => {
    if (!status) return 'approval-badge unknown';
    
    switch (status.toLowerCase()) {
      case 'approved': return 'approval-badge approved';
      case 'pending': return 'approval-badge pending';
      case 'rejected': return 'approval-badge rejected';
      default: return 'approval-badge unknown';
    }
  };

  const bulkActions = initializeBulkActions();
  const searchSuggestions = generateSearchSuggestions();

  if (loading) {
    return (
      <div className="enhanced-user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enhanced-user-management">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Users</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={handleRefreshData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-user-management">
      {/* Header */}
      <div className="section-header">
        <div className="header-content">
          <h2>👥 User Management</h2>
          <p>Manage user accounts, roles, and permissions</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowUserApprovalPanel(true)}>
            📋 Pending Approvals
          </button>
          <button className="btn-primary" onClick={handleCreateUser}>
            ➕ Add User
          </button>
          <button className="btn-refresh" onClick={handleRefreshData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
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
        placeholder="Search users by name, email, username, or role..."
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={handleToggleAdvancedFilters}
        resultCount={filteredUsers.length}
        isLoading={loading}
      />

      {/* Users Table */}
      <div className="users-table-container">
        <div className="table-header">
          <h3>Users ({filteredUsers.length})</h3>
          {selectedUsers.length > 0 && (
            <span className="selection-count">
              {selectedUsers.length} selected
            </span>
          )}
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th className="select-column">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    ref={input => {
                      if (input) {
                        input.indeterminate = selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length;
                      }
                    }}
                  />
                </th>
                <th>User Info</th>
                <th>Role</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className={selectedUsers.includes(user.id.toString()) ? 'selected' : ''}
                >
                  <td className="select-column">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id.toString())}
                      onChange={(e) => handleUserSelect(user.id.toString(), e.target.checked)}
                    />
                  </td>
                  <td className="user-info">
                    <div className="user-details">
                      <div className="user-name">{user.fullName}</div>
                      <div className="user-meta">
                        <span className="username">@{user.username}</span>
                        <span className="email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={getRoleBadgeClass(user.role)}>
                      {user.role || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(user.enabled)}>
                      {user.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <span className={getApprovalBadgeClass(user.approvalStatus)}>
                      {user.approvalStatus || 'Unknown'}
                    </span>
                  </td>
                  <td className="date-column">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="actions-column">
                    <div className="action-buttons">
                      <button 
                        className="btn-small"
                        onClick={() => handleUserEdit(user.id)}
                        title="Edit user"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-small"
                        onClick={() => handleUserActivity(user.id)}
                        title="View activity"
                      >
                        📊
                      </button>
                      {user.approvalStatus === 'PENDING' && (
                        <button 
                          className="btn-small btn-approve"
                          onClick={() => userApproval.approveUser(user.id, { approvalStatus: 'APPROVED' }).then(fetchUsers)}
                          title="Quick approve"
                        >
                          ✅
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No users found</h3>
              <p>Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        selectedItems={selectedUsers}
        totalItems={filteredUsers.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        actions={bulkActions}
        onActionExecute={handleBulkActionExecute}
        progress={bulkProgress}
        onProgressCancel={handleProgressCancel}
        isVisible={selectedUsers.length > 0 || !!bulkProgress}
      />

      {/* Modals */}
      {showUserApprovalPanel && (
        <UserApprovalPanel 
          onClose={() => {
            setShowUserApprovalPanel(false);
            fetchUsers();
          }}
        />
      )}
      
      {editingUserId && (
        <UserEditModal 
          userId={editingUserId} 
          onClose={() => setEditingUserId(null)} 
          onSaved={() => {
            fetchUsers();
            if (onRefresh) onRefresh();
          }} 
        />
      )}

      {/* Activity Log Modal */}
      {showActivityLog && selectedUserForActivity && (
        <div className="modal-overlay">
          <div className="activity-modal">
            <div className="modal-header">
              <h3>User Activity Log</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowActivityLog(false);
                  setSelectedUserForActivity(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="activity-logs">
                {userActivityLogs.map((log) => (
                  <div key={log.id} className="activity-item">
                    <div className="activity-icon">📝</div>
                    <div className="activity-details">
                      <div className="activity-action">{log.action}</div>
                      <div className="activity-timestamp">{formatDate(log.timestamp)}</div>
                      {log.details && <div className="activity-description">{log.details}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUserManagement; 