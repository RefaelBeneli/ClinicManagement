import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSearch, { SearchFilter, FilterPreset } from './AdminSearch';
import BulkOperations, { BulkAction, BulkOperationProgress } from './BulkOperations';
import AddPersonalMeetingModal from './ui/AddPersonalMeetingModal';
import EditPersonalMeetingModal from './ui/EditPersonalMeetingModal';
import ViewPersonalMeetingModal from './ui/ViewPersonalMeetingModal';
import { PersonalMeeting, PersonalMeetingTypeEntity, PersonalMeetingStatus } from '../types';
import './EnhancedPersonalMeetingManagement.css';

interface PersonalMeetingStats {
  totalPersonalSessions: number;
  personalMeetingsToday: number;
  unpaidPersonalSessions: number;
  monthlyPersonalSpent: number;
  activeSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageSessionDuration: number;
}

interface PersonalMeetingActivity {
  id: number;
  meetingId: number;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
  changes?: Record<string, any>;
}

interface EnhancedPersonalMeetingManagementProps {
  onRefresh?: () => void;
}

const EnhancedPersonalMeetingManagement: React.FC<EnhancedPersonalMeetingManagementProps> = ({
  onRefresh
}) => {
  const { user: currentUser, token } = useAuth();
  
  // Data states
  const [personalMeetings, setPersonalMeetings] = useState<PersonalMeeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<PersonalMeeting[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<PersonalMeetingTypeEntity[]>([]);
  const [meetingActivity, setMeetingActivity] = useState<PersonalMeetingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchValue, setSearchValue] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  
  // Bulk operations states
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);
  const [bulkProgress, setBulkProgress] = useState<BulkOperationProgress | undefined>();
  
  // Modal states
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null);
  const [viewingMeetingId, setViewingMeetingId] = useState<number | null>(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedMeetingForActivity, setSelectedMeetingForActivity] = useState<number | null>(null);

  // Ref to prevent double fetching
  const hasInitialized = useRef(false);

  // Stats state
  const [stats, setStats] = useState<PersonalMeetingStats>({
    totalPersonalSessions: 0,
    personalMeetingsToday: 0,
    unpaidPersonalSessions: 0,
    monthlyPersonalSpent: 0,
    activeSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    averageSessionDuration: 0
  });

  // API URL configuration
  const apiUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
        ? 'https://web-production-9aa8.up.railway.app/api'
        : 'http://localhost:8085/api');
  }, []);

  // Fetch personal meetings
  const fetchPersonalMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${apiUrl}/admin/personal-meetings?page=0&size=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPersonalMeetings(data.content || []);
      } else {
        throw new Error('Failed to fetch personal meetings');
      }
    } catch (error) {
      console.error('Failed to fetch personal meetings:', error);
      setError('Failed to load personal meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  // Fetch meeting types
  const fetchMeetingTypes = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/personal-meeting-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetingTypes(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch meeting types:', error);
    }
  }, [apiUrl, token]);

  // Fetch meeting activity
  const fetchMeetingActivity = useCallback(async (meetingId: number) => {
    try {
      const response = await fetch(`${apiUrl}/admin/personal-meetings/${meetingId}/activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetingActivity(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch meeting activity:', error);
    }
  }, [apiUrl, token]);

  // Calculate stats
  const calculateStats = useCallback(() => {
    const total = personalMeetings.length;
    const today = personalMeetings.filter(m => {
      const meetingDate = new Date(m.meetingDate);
      const today = new Date();
      return meetingDate.toDateString() === today.toDateString();
    }).length;
    const unpaid = personalMeetings.filter(m => !m.isPaid).length;
    const monthlySpent = personalMeetings
      .filter(m => {
        const meetingDate = new Date(m.meetingDate);
        const now = new Date();
        return meetingDate.getMonth() === now.getMonth() && meetingDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, m) => sum + (m.price || 0), 0);
    const active = personalMeetings.filter(m => m.active !== false).length;
    const completed = personalMeetings.filter(m => m.status === PersonalMeetingStatus.COMPLETED).length;
    const cancelled = personalMeetings.filter(m => m.status === PersonalMeetingStatus.CANCELLED).length;
    const avgDuration = personalMeetings.length > 0 
      ? personalMeetings.reduce((sum, m) => sum + (m.duration || 0), 0) / personalMeetings.length 
      : 0;

    setStats({
      totalPersonalSessions: total,
      personalMeetingsToday: today,
      unpaidPersonalSessions: unpaid,
      monthlyPersonalSpent: monthlySpent,
      activeSessions: active,
      completedSessions: completed,
      cancelledSessions: cancelled,
      averageSessionDuration: avgDuration
    });
  }, [personalMeetings]);

  // Initialize search filters
  const initializeSearchFilters = useCallback(() => {
    const filters: SearchFilter[] = [
      {
        id: 'therapistName',
        label: 'Therapist',
        type: 'text',
        value: '',
        placeholder: 'Search by therapist name'
      },
      {
        id: 'meetingType',
        label: 'Session Type',
        type: 'select',
        value: '',
        options: meetingTypes.map(type => ({ value: type.id.toString(), label: type.name }))
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        value: '',
        options: [
          { value: 'SCHEDULED', label: 'Scheduled' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'CANCELLED', label: 'Cancelled' },
          { value: 'NO_SHOW', label: 'No Show' }
        ]
      },
      {
        id: 'isPaid',
        label: 'Payment Status',
        type: 'select',
        value: '',
        options: [
          { value: 'PAID', label: 'Paid' },
          { value: 'UNPAID', label: 'Unpaid' }
        ]
      },
      {
        id: 'dateRange',
        label: 'Date Range',
        type: 'date',
        value: ''
      }
    ];
    setSearchFilters(filters);
  }, [meetingTypes]);

  // Apply filters and search
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...personalMeetings];

    // Apply search
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(meeting =>
        meeting.therapistName.toLowerCase().includes(searchLower) ||
        meeting.meetingType?.name.toLowerCase().includes(searchLower) ||
        meeting.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    searchFilters.forEach(filter => {
      if (filter.value && filter.value !== '') {
        switch (filter.id) {
          case 'therapistName':
            filtered = filtered.filter(meeting =>
              meeting.therapistName.toLowerCase().includes(filter.value.toLowerCase())
            );
            break;
          case 'meetingType':
            filtered = filtered.filter(meeting =>
              meeting.meetingType?.id.toString() === filter.value
            );
            break;
          case 'status':
            filtered = filtered.filter(meeting => meeting.status === filter.value);
            break;
          case 'isPaid':
            if (filter.value === 'PAID') {
              filtered = filtered.filter(meeting => meeting.isPaid);
            } else if (filter.value === 'UNPAID') {
              filtered = filtered.filter(meeting => !meeting.isPaid);
            }
            break;
        }
      }
    });

    setFilteredMeetings(filtered);
  }, [personalMeetings, searchValue, searchFilters]);

  // Initialize bulk actions
  const initializeBulkActions = useCallback((): BulkAction[] => {
    return [
      {
        id: 'mark-paid',
        label: 'Mark as Paid',
        icon: '💰',
        color: '#28a745'
      },
      {
        id: 'mark-completed',
        label: 'Mark as Completed',
        icon: '✅',
        color: '#28a745'
      },
      {
        id: 'archive',
        label: 'Archive Sessions',
        icon: '📦',
        color: '#6c757d'
      },
      {
        id: 'export',
        label: 'Export Data',
        icon: '📊',
        color: '#17a2b8'
      }
    ];
  }, []);

  // Generate search suggestions
  const generateSearchSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    // Add therapist names
    const therapistNames = personalMeetings.map(m => m.therapistName);
    suggestions.push(...therapistNames);
    
    // Add meeting type names
    const typeNames = personalMeetings.map(m => m.meetingType?.name).filter(Boolean) as string[];
    suggestions.push(...typeNames);
    
    // Add status values
    suggestions.push('Scheduled', 'Completed', 'Cancelled', 'No Show');
    
    return suggestions;
  }, [personalMeetings]);

  // Load data on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchPersonalMeetings();
      fetchMeetingTypes();
    }
  }, [fetchPersonalMeetings, fetchMeetingTypes]);

  // Calculate stats when data changes
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Initialize filters after meeting types are loaded
  useEffect(() => {
    if (meetingTypes.length > 0) {
      initializeSearchFilters();
    }
  }, [meetingTypes, initializeSearchFilters]);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Clear selection when filtered data changes
  useEffect(() => {
    setSelectedMeetings([]);
  }, [filteredMeetings]);

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
      setSelectedMeetings(filteredMeetings.map(m => m.id.toString()));
    } else {
      setSelectedMeetings([]);
    }
  };

  const handleMeetingSelect = (meetingId: string, selected: boolean) => {
    if (selected) {
      setSelectedMeetings(prev => [...prev, meetingId]);
    } else {
      setSelectedMeetings(prev => prev.filter(id => id !== meetingId));
    }
  };

  const handleClearSelection = () => {
    setSelectedMeetings([]);
  };

  const handleBulkActionExecute = async (actionId: string, selectedIds: string[]) => {
    setBulkProgress({
      id: actionId,
      total: selectedIds.length,
      completed: 0,
      failed: 0,
      status: 'running',
      message: `Executing ${actionId}...`
    });

    try {
      // Simulate processing each meeting
      for (let i = 0; i < selectedIds.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
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

      // Refresh data
      fetchPersonalMeetings();
      if (onRefresh) onRefresh();
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
      setSelectedMeetings([]);
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

  // Meeting action handlers
  const handleMeetingView = (meetingId: number) => {
    setViewingMeetingId(meetingId);
  };

  const handleMeetingEdit = (meetingId: number) => {
    setEditingMeetingId(meetingId);
  };

  const handleMeetingActivity = (meetingId: number) => {
    setSelectedMeetingForActivity(meetingId);
    fetchMeetingActivity(meetingId);
    setShowActivityLog(true);
  };

  const handleAddMeeting = () => {
    setShowAddMeetingModal(true);
  };

  const handleRefreshData = () => {
    fetchPersonalMeetings();
    fetchMeetingTypes();
    if (onRefresh) onRefresh();
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'status-badge active';
      case 'completed': return 'status-badge completed';
      case 'cancelled': return 'status-badge cancelled';
      case 'no_show': return 'status-badge no-show';
      default: return 'status-badge unknown';
    }
  };

  const bulkActions = initializeBulkActions();
  const searchSuggestions = generateSearchSuggestions();

  if (loading) {
    return (
      <div className="enhanced-personal-meeting-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading personal meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enhanced-personal-meeting-management">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Personal Meetings</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={handleRefreshData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-personal-meeting-management">
      {/* Header */}
      <div className="section-header">
        <div className="header-content">
          <h2>🧘‍♀️ Personal Meeting Management</h2>
          <p>Comprehensive oversight of personal therapy sessions and wellness appointments</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowActivityLog(true)}>
            📊 Activity Log
          </button>
          <button className="btn-primary" onClick={handleAddMeeting}>
            ➕ Add Personal Session
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
        placeholder="Search personal meetings by therapist, type, status, or notes..."
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={handleToggleAdvancedFilters}
        resultCount={filteredMeetings.length}
        isLoading={loading}
      />

      {/* Personal Meeting Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalPersonalSessions}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.personalMeetingsToday}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.unpaidPersonalSessions}</div>
            <div className="stat-label">Unpaid</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats.monthlyPersonalSpent)}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeSessions}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{Math.round(stats.averageSessionDuration)}m</div>
            <div className="stat-label">Avg Duration</div>
          </div>
        </div>
      </div>

      {/* Personal Meetings Table */}
      <div className="meetings-table-container">
        <div className="table-header">
          <h3>Personal Meetings ({filteredMeetings.length})</h3>
          {selectedMeetings.length > 0 && (
            <span className="selection-count">
              {selectedMeetings.length} selected
            </span>
          )}
        </div>

        <div className="meetings-table">
          <table>
            <thead>
              <tr>
                <th className="select-column">
                  <input
                    type="checkbox"
                    checked={selectedMeetings.length === filteredMeetings.length && filteredMeetings.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    ref={input => {
                      if (input) {
                        input.indeterminate = selectedMeetings.length > 0 && selectedMeetings.length < filteredMeetings.length;
                      }
                    }}
                  />
                </th>
                <th>Session Info</th>
                <th>Therapist</th>
                <th>Type</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.map((meeting) => (
                <tr 
                  key={meeting.id} 
                  className={selectedMeetings.includes(meeting.id.toString()) ? 'selected' : ''}
                >
                  <td className="select-column">
                    <input
                      type="checkbox"
                      checked={selectedMeetings.includes(meeting.id.toString())}
                      onChange={(e) => handleMeetingSelect(meeting.id.toString(), e.target.checked)}
                    />
                  </td>
                  <td className="meeting-info">
                    <div className="meeting-details">
                      <div className="meeting-date">{formatDate(meeting.meetingDate)}</div>
                      <div className="meeting-meta">
                        {meeting.notes && <span className="notes">{meeting.notes}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="therapist-column">
                    <span className="therapist-name">{meeting.therapistName}</span>
                  </td>
                  <td className="type-column">
                    <span className="meeting-type">{meeting.meetingType?.name || 'N/A'}</span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(meeting.status)}>
                      {meeting.status}
                    </span>
                  </td>
                  <td className="payment-column">
                    <div className="payment-info">
                      <span className="payment-amount">{formatCurrency(meeting.price || 0)}</span>
                      <span className={`payment-status ${meeting.isPaid ? 'paid' : 'unpaid'}`}>
                        {meeting.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </td>
                  <td className="duration-column">
                    <span className="duration">{meeting.duration || 0}m</span>
                  </td>
                  <td className="actions-column">
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => handleMeetingView(meeting.id)}
                        title="View details"
                      >
                        👁️
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => handleMeetingEdit(meeting.id)}
                        title="Edit meeting"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-activity"
                        onClick={() => handleMeetingActivity(meeting.id)}
                        title="View activity"
                      >
                        📊
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        selectedItems={selectedMeetings}
        totalItems={filteredMeetings.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        actions={bulkActions}
        onActionExecute={handleBulkActionExecute}
        progress={bulkProgress}
        onProgressCancel={handleProgressCancel}
        isVisible={selectedMeetings.length > 0 || !!bulkProgress}
      />

      {/* Modals */}
      {showAddMeetingModal && (
        <AddPersonalMeetingModal 
          isOpen={showAddMeetingModal}
          onClose={() => setShowAddMeetingModal(false)}
          onSuccess={() => {
            setShowAddMeetingModal(false);
            fetchPersonalMeetings();
            if (onRefresh) onRefresh();
          }}
        />
      )}
      
      {editingMeetingId && (
        <EditPersonalMeetingModal 
          meeting={personalMeetings.find(m => m.id === editingMeetingId) || null}
          isOpen={!!editingMeetingId}
          onClose={() => setEditingMeetingId(null)} 
          onSuccess={() => {
            setEditingMeetingId(null);
            fetchPersonalMeetings();
            if (onRefresh) onRefresh();
          }} 
        />
      )}

      {viewingMeetingId && (
        <ViewPersonalMeetingModal 
          meeting={personalMeetings.find(m => m.id === viewingMeetingId) || null}
          isOpen={!!viewingMeetingId}
          onClose={() => setViewingMeetingId(null)} 
        />
      )}

      {/* Activity Log Modal */}
      {showActivityLog && (
        <div className="modal-overlay">
          <div className="activity-modal">
            <div className="modal-header">
              <h3>📊 Activity Log</h3>
              <button
                className="modal-close"
                onClick={() => setShowActivityLog(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {meetingActivity.length === 0 ? (
                <p>No activity found for this meeting.</p>
              ) : (
                <div className="activity-list">
                  {meetingActivity.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-header">
                        <span className="activity-action">{activity.action}</span>
                        <span className="activity-timestamp">{formatDate(activity.timestamp)}</span>
                      </div>
                      <div className="activity-description">{activity.description}</div>
                      <div className="activity-performer">by {activity.performedBy}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPersonalMeetingManagement; 