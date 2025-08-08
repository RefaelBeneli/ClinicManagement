import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSearch, { SearchFilter, FilterPreset } from './AdminSearch';
import BulkOperations, { BulkAction, BulkOperationProgress } from './BulkOperations';
import MeetingForm from './Dashboard/MeetingForm';
import AddPersonalMeetingModal from './ui/AddPersonalMeetingModal';
import EditMeetingModal from './ui/EditMeetingModal';
import EditPersonalMeetingModal from './ui/EditPersonalMeetingModal';
import ViewMeetingModal from './ui/ViewMeetingModal';
import ViewPersonalMeetingModal from './ui/ViewPersonalMeetingModal';
import './EnhancedSessionManagement.css';

interface UnifiedSession {
  id: number;
  type: 'MEETING' | 'PERSONAL_MEETING';
  title: string;
  clientName?: string;
  therapistName: string;
  date: string;
  time: string;
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  source?: string;
  meetingType?: string;
  notes?: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'CANCELLED';
  amount?: number;
  currency?: string;
  isRecurring: boolean;
  recurringPattern?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface SessionActivity {
  id: number;
  sessionId: number;
  sessionType: 'MEETING' | 'PERSONAL_MEETING';
  action: string;
  timestamp: string;
  details?: string;
  performedBy: string;
}

interface SessionStats {
  totalSessions: number;
  scheduledSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  totalRevenue: number;
  pendingPayments: number;
  recurringCount: number;
}

interface EnhancedSessionManagementProps {
  onRefresh?: () => void;
}

const EnhancedSessionManagement: React.FC<EnhancedSessionManagementProps> = ({
  onRefresh
}) => {
  const { user: currentUser, token } = useAuth();
  
  // Data states
  const [sessions, setSessions] = useState<UnifiedSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<UnifiedSession[]>([]);
  const [sessionActivity, setSessionActivity] = useState<SessionActivity[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSessions: 0,
    scheduledSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    noShowSessions: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    recurringCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchValue, setSearchValue] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  
  // Bulk operations states
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [bulkProgress, setBulkProgress] = useState<BulkOperationProgress | undefined>();
  
  // Modal states
  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [showAddPersonalMeetingModal, setShowAddPersonalMeetingModal] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingSessionType, setEditingSessionType] = useState<'MEETING' | 'PERSONAL_MEETING' | null>(null);
  const [viewingSessionId, setViewingSessionId] = useState<number | null>(null);
  const [viewingSessionType, setViewingSessionType] = useState<'MEETING' | 'PERSONAL_MEETING' | null>(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedSessionForActivity, setSelectedSessionForActivity] = useState<{ id: number; type: 'MEETING' | 'PERSONAL_MEETING' } | null>(null);
  const [showCalendarView, setShowCalendarView] = useState(false);

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
        id: 'sessionType',
        label: 'Session Type',
        type: 'select',
        options: [
          { value: 'MEETING', label: 'Regular Meeting' },
          { value: 'PERSONAL_MEETING', label: 'Personal Meeting' }
        ],
        value: ''
      },
      {
        id: 'status',
        label: 'Session Status',
        type: 'select',
        options: [
          { value: 'SCHEDULED', label: 'Scheduled' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'CANCELLED', label: 'Cancelled' },
          { value: 'NO_SHOW', label: 'No Show' }
        ],
        value: ''
      },
      {
        id: 'paymentStatus',
        label: 'Payment Status',
        type: 'select',
        options: [
          { value: 'PENDING', label: 'Pending Payment' },
          { value: 'PAID', label: 'Paid' },
          { value: 'CANCELLED', label: 'Cancelled' }
        ],
        value: ''
      },
      {
        id: 'therapist',
        label: 'Therapist',
        type: 'text',
        value: '',
        placeholder: 'Enter therapist name'
      },
      {
        id: 'client',
        label: 'Client',
        type: 'text',
        value: '',
        placeholder: 'Enter client name'
      },
      {
        id: 'dateRange',
        label: 'Date Range',
        type: 'select',
        options: [
          { value: 'today', label: 'Today' },
          { value: 'thisWeek', label: 'This Week' },
          { value: 'thisMonth', label: 'This Month' },
          { value: 'nextWeek', label: 'Next Week' },
          { value: 'nextMonth', label: 'Next Month' }
        ],
        value: ''
      },
      {
        id: 'dateAfter',
        label: 'Date After',
        type: 'date',
        value: '',
        placeholder: 'Select start date'
      },
      {
        id: 'dateBefore',
        label: 'Date Before',
        type: 'date',
        value: '',
        placeholder: 'Select end date'
      },
      {
        id: 'isRecurring',
        label: 'Recurring Sessions Only',
        type: 'boolean',
        value: false
      },
      {
        id: 'hasNotes',
        label: 'Has Session Notes',
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
        id: 'updateStatus',
        label: 'Update Status',
        icon: '🔄',
        color: '#17a2b8',
        requiresConfirmation: true,
        confirmationMessage: 'Select the new status for the selected sessions.'
      },
      {
        id: 'markCompleted',
        label: 'Mark Completed',
        icon: '✅',
        color: '#28a745',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to mark the selected sessions as completed?',
        isDisabled: (ids) => {
          const selectedSessionsData = sessions.filter(s => ids.includes(`${s.type}-${s.id}`));
          return selectedSessionsData.every(s => s.status === 'COMPLETED');
        }
      },
      {
        id: 'markPaid',
        label: 'Mark as Paid',
        icon: '💰',
        color: '#28a745',
        requiresConfirmation: true,
        confirmationMessage: 'Mark the selected sessions as paid?',
        isDisabled: (ids) => {
          const selectedSessionsData = sessions.filter(s => ids.includes(`${s.type}-${s.id}`));
          return selectedSessionsData.every(s => s.paymentStatus === 'PAID');
        }
      },
      {
        id: 'reschedule',
        label: 'Bulk Reschedule',
        icon: '📅',
        color: '#ffc107',
        requiresConfirmation: true,
        confirmationMessage: 'This will open a dialog to reschedule the selected sessions.',
        isDisabled: (ids) => {
          const selectedSessionsData = sessions.filter(s => ids.includes(`${s.type}-${s.id}`));
          return selectedSessionsData.some(s => s.status === 'COMPLETED' || s.status === 'CANCELLED');
        }
      },
      {
        id: 'addNotes',
        label: 'Add Notes',
        icon: '📝',
        color: '#6f42c1',
        requiresConfirmation: true,
        confirmationMessage: 'Add notes to the selected sessions.'
      },
      {
        id: 'generateReport',
        label: 'Generate Report',
        icon: '📊',
        color: '#fd7e14'
      },
      {
        id: 'export',
        label: 'Export Sessions',
        icon: '📋',
        color: '#6c757d'
      },
      {
        id: 'sendReminders',
        label: 'Send Reminders',
        icon: '📧',
        color: '#17a2b8',
        requiresConfirmation: true,
        confirmationMessage: 'Send reminder notifications for the selected upcoming sessions?',
        isDisabled: (ids) => {
          const selectedSessionsData = sessions.filter(s => ids.includes(`${s.type}-${s.id}`));
          return selectedSessionsData.some(s => s.status !== 'SCHEDULED' || new Date(s.date) <= new Date());
        }
      },
      {
        id: 'cancel',
        label: 'Cancel Sessions',
        icon: '❌',
        color: '#dc3545',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to cancel the selected sessions? This action can be undone.',
        isDisabled: (ids) => {
          const selectedSessionsData = sessions.filter(s => ids.includes(`${s.type}-${s.id}`));
          return selectedSessionsData.every(s => s.status === 'CANCELLED' || s.status === 'COMPLETED');
        }
      },
      {
        id: 'delete',
        label: 'Delete Sessions',
        icon: '🗑️',
        color: '#dc3545',
        requiresConfirmation: true,
        isDestructive: true,
        confirmationMessage: 'This will permanently delete the selected sessions and all associated data. This action cannot be undone.',
        isDisabled: (ids) => {
          const selectedSessionsData = sessions.filter(s => ids.includes(`${s.type}-${s.id}`));
          return selectedSessionsData.some(s => s.status === 'COMPLETED' && s.paymentStatus === 'PAID');
        }
      }
    ];
    return actions;
  }, [sessions]);

  // Generate search suggestions
  const generateSearchSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    // Add session-specific suggestions
    sessions.forEach(s => {
      if (s.title) suggestions.push(s.title);
      if (s.clientName) suggestions.push(s.clientName);
      if (s.therapistName) suggestions.push(s.therapistName);
      if (s.source) suggestions.push(s.source);
      if (s.meetingType) suggestions.push(s.meetingType);
    });
    
    // Add static suggestions
    suggestions.push(
      'today sessions',
      'upcoming sessions',
      'completed sessions',
      'cancelled sessions',
      'no show sessions',
      'pending payments',
      'recurring sessions',
      'personal therapy',
      'guidance sessions'
    );
    
    return Array.from(new Set(suggestions.filter(Boolean)));
  }, [sessions]);

  // Fetch sessions (both meetings and personal meetings)
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both meetings and personal meetings
      const [meetingsResponse, personalMeetingsResponse] = await Promise.all([
        fetch(`${apiUrl}/admin/meetings?page=0&size=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${apiUrl}/admin/personal-meetings?page=0&size=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);
      
      if (meetingsResponse.ok && personalMeetingsResponse.ok) {
        const meetingsData = await meetingsResponse.json();
        const personalMeetingsData = await personalMeetingsResponse.json();
        
        // Transform meetings to unified format
        const meetingSessions: UnifiedSession[] = (meetingsData.content || []).map((meeting: any) => ({
          id: meeting.id,
          type: 'MEETING' as const,
          title: `${meeting.clientName} - ${meeting.source || 'Meeting'}`,
          clientName: meeting.clientName,
          therapistName: meeting.therapistName || 'Unassigned',
          date: meeting.date,
          time: meeting.time,
          duration: meeting.duration || 60,
          status: meeting.status || 'SCHEDULED',
          source: meeting.source,
          notes: meeting.notes,
          paymentStatus: meeting.paymentStatus || 'PENDING',
          amount: meeting.amount || 0,
          currency: meeting.currency || 'USD',
          isRecurring: meeting.isRecurring || false,
          recurringPattern: meeting.recurringPattern,
          createdAt: meeting.createdAt,
          updatedAt: meeting.updatedAt,
          createdBy: meeting.createdBy || 'System'
        }));
        
        // Transform personal meetings to unified format
        const personalMeetingSessions: UnifiedSession[] = (personalMeetingsData.content || []).map((pm: any) => ({
          id: pm.id,
          type: 'PERSONAL_MEETING' as const,
          title: `${pm.meetingType || 'Personal Session'} - ${pm.provider || 'Provider'}`,
          therapistName: pm.provider || 'Provider',
          date: pm.date,
          time: pm.time,
          duration: pm.duration || 60,
          status: pm.status || 'SCHEDULED',
          meetingType: pm.meetingType,
          notes: pm.notes,
          paymentStatus: pm.paymentStatus || 'PENDING',
          amount: pm.amount || 0,
          currency: pm.currency || 'USD',
          isRecurring: pm.isRecurring || false,
          recurringPattern: pm.recurringPattern,
          createdAt: pm.createdAt,
          updatedAt: pm.updatedAt,
          createdBy: pm.createdBy || 'System'
        }));
        
        // Combine and sort by date/time
        const allSessions = [...meetingSessions, ...personalMeetingSessions];
        allSessions.sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());
        
        setSessions(allSessions);
        
        // Calculate stats
        const stats: SessionStats = {
          totalSessions: allSessions.length,
          scheduledSessions: allSessions.filter(s => s.status === 'SCHEDULED').length,
          completedSessions: allSessions.filter(s => s.status === 'COMPLETED').length,
          cancelledSessions: allSessions.filter(s => s.status === 'CANCELLED').length,
          noShowSessions: allSessions.filter(s => s.status === 'NO_SHOW').length,
          totalRevenue: allSessions.filter(s => s.paymentStatus === 'PAID').reduce((sum, s) => sum + (s.amount || 0), 0),
          pendingPayments: allSessions.filter(s => s.paymentStatus === 'PENDING').reduce((sum, s) => sum + (s.amount || 0), 0),
          recurringCount: allSessions.filter(s => s.isRecurring).length
        };
        setSessionStats(stats);
      } else {
        throw new Error('Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  // Fetch session activity
  const fetchSessionActivity = useCallback(async (sessionId: number, sessionType: 'MEETING' | 'PERSONAL_MEETING') => {
    try {
      // Mock activity data - replace with actual API call
      const mockActivity: SessionActivity[] = [
        {
          id: 1,
          sessionId,
          sessionType,
          action: 'SESSION_CREATED',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          details: 'Session scheduled and created',
          performedBy: 'System'
        },
        {
          id: 2,
          sessionId,
          sessionType,
          action: 'STATUS_UPDATED',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          details: 'Session status changed to Scheduled',
          performedBy: 'Admin User'
        },
        {
          id: 3,
          sessionId,
          sessionType,
          action: 'NOTES_ADDED',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          details: 'Session notes updated by therapist',
          performedBy: 'Dr. Smith'
        }
      ];
      setSessionActivity(mockActivity);
    } catch (error) {
      console.error('Failed to fetch session activity:', error);
    }
  }, []);

  // Apply search and filters
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...sessions];

    // Apply search
    if (searchValue.trim()) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchTerm) ||
        session.clientName?.toLowerCase().includes(searchTerm) ||
        session.therapistName.toLowerCase().includes(searchTerm) ||
        session.source?.toLowerCase().includes(searchTerm) ||
        session.meetingType?.toLowerCase().includes(searchTerm) ||
        session.status.toLowerCase().includes(searchTerm) ||
        session.notes?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    searchFilters.forEach(filter => {
      if (filter.value !== undefined && filter.value !== '' && filter.value !== false) {
        switch (filter.id) {
          case 'sessionType':
            filtered = filtered.filter(session => session.type === filter.value);
            break;
          case 'status':
            filtered = filtered.filter(session => session.status === filter.value);
            break;
          case 'paymentStatus':
            filtered = filtered.filter(session => session.paymentStatus === filter.value);
            break;
          case 'therapist':
            filtered = filtered.filter(session => 
              session.therapistName.toLowerCase().includes((filter.value as string).toLowerCase())
            );
            break;
          case 'client':
            filtered = filtered.filter(session => 
              session.clientName?.toLowerCase().includes((filter.value as string).toLowerCase())
            );
            break;
          case 'dateRange':
            const now = new Date();
            let startDate: Date, endDate: Date;
            switch (filter.value) {
              case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
              case 'thisWeek':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7);
                break;
              case 'thisMonth':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                break;
              case 'nextWeek':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 14);
                break;
              case 'nextMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 2, 1);
                break;
              default:
                break;
            }
            filtered = filtered.filter(session => {
              const sessionDate = new Date(session.date);
              return sessionDate >= startDate && sessionDate < endDate;
            });
            break;
          case 'dateAfter':
            filtered = filtered.filter(session => new Date(session.date) >= new Date(filter.value));
            break;
          case 'dateBefore':
            filtered = filtered.filter(session => new Date(session.date) <= new Date(filter.value));
            break;
          case 'isRecurring':
            if (filter.value) {
              filtered = filtered.filter(session => session.isRecurring);
            }
            break;
          case 'hasNotes':
            if (filter.value) {
              filtered = filtered.filter(session => session.notes && session.notes.trim().length > 0);
            }
            break;
        }
      }
    });

    setFilteredSessions(filtered);
  }, [sessions, searchValue, searchFilters]);

  // Initialize on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeSearchFilters();
      fetchSessions();
    }
  }, [initializeSearchFilters, fetchSessions]);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Clear selection when filtered data changes
  useEffect(() => {
    setSelectedSessions([]);
  }, [filteredSessions]);

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
      setSelectedSessions(filteredSessions.map(s => `${s.type}-${s.id}`));
    } else {
      setSelectedSessions([]);
    }
  };

  const handleSessionSelect = (sessionKey: string, selected: boolean) => {
    if (selected) {
      setSelectedSessions(prev => [...prev, sessionKey]);
    } else {
      setSelectedSessions(prev => prev.filter(key => key !== sessionKey));
    }
  };

  const handleClearSelection = () => {
    setSelectedSessions([]);
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
      // Simulate processing each session
      for (let i = 0; i < selectedIds.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API call
        
        const sessionKey = selectedIds[i];
        
        try {
          // Mock API calls - replace with actual implementation
          switch (actionId) {
            case 'updateStatus':
            case 'markCompleted':
            case 'markPaid':
            case 'reschedule':
            case 'addNotes':
            case 'cancel':
            case 'delete':
              console.log(`${actionId} session ${sessionKey}`);
              break;
            case 'generateReport':
            case 'export':
            case 'sendReminders':
              console.log(`${actionId} for sessions`);
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
            errors: [...(prev.errors || []), `Failed to ${actionId} session ${sessionKey}: ${error}`]
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
        fetchSessions();
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
      setSelectedSessions([]);
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

  // Session action handlers
  const handleSessionView = (sessionId: number, sessionType: 'MEETING' | 'PERSONAL_MEETING') => {
    setViewingSessionId(sessionId);
    setViewingSessionType(sessionType);
  };

  const handleSessionEdit = (sessionId: number, sessionType: 'MEETING' | 'PERSONAL_MEETING') => {
    setEditingSessionId(sessionId);
    setEditingSessionType(sessionType);
  };

  const handleSessionActivity = (sessionId: number, sessionType: 'MEETING' | 'PERSONAL_MEETING') => {
    setSelectedSessionForActivity({ id: sessionId, type: sessionType });
    fetchSessionActivity(sessionId, sessionType);
    setShowActivityLog(true);
  };

  const handleAddMeeting = () => {
    setShowAddMeetingModal(true);
  };

  const handleAddPersonalMeeting = () => {
    setShowAddPersonalMeetingModal(true);
  };

  const handleRefreshData = () => {
    fetchSessions();
    if (onRefresh) onRefresh();
  };

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  // Format date and time helper
  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date} ${time}`);
    return dateTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'status-badge scheduled';
      case 'completed': return 'status-badge completed';
      case 'cancelled': return 'status-badge cancelled';
      case 'no_show': return 'status-badge no-show';
      default: return 'status-badge unknown';
    }
  };

  // Get payment badge class
  const getPaymentBadgeClass = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'paid': return 'payment-badge paid';
      case 'pending': return 'payment-badge pending';
      case 'cancelled': return 'payment-badge cancelled';
      default: return 'payment-badge unknown';
    }
  };

  // Get session type badge class
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'MEETING': return 'type-badge meeting';
      case 'PERSONAL_MEETING': return 'type-badge personal';
      default: return 'type-badge unknown';
    }
  };

  const bulkActions = initializeBulkActions();
  const searchSuggestions = generateSearchSuggestions();

  if (loading) {
    return (
      <div className="enhanced-session-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enhanced-session-management">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Sessions</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={handleRefreshData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-session-management">
      {/* Header */}
      <div className="section-header">
        <div className="header-content">
          <h2>📅 Session Management</h2>
          <p>Unified oversight of all meetings and personal sessions</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowCalendarView(!showCalendarView)}>
            {showCalendarView ? '📋 List View' : '📅 Calendar View'}
          </button>
          <button className="btn-secondary" onClick={handleAddPersonalMeeting}>
            ➕ Personal Meeting
          </button>
          <button className="btn-primary" onClick={handleAddMeeting}>
            ➕ Meeting
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
        placeholder="Search sessions by client, therapist, type, status, or notes..."
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={handleToggleAdvancedFilters}
        resultCount={filteredSessions.length}
        isLoading={loading}
      />

      {/* Session Statistics */}
      <div className="session-stats">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-details">
            <div className="stat-value">{sessionStats.totalSessions}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon scheduled">⏰</div>
          <div className="stat-details">
            <div className="stat-value">{sessionStats.scheduledSessions}</div>
            <div className="stat-label">Scheduled</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">✅</div>
          <div className="stat-details">
            <div className="stat-value">{sessionStats.completedSessions}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-details">
            <div className="stat-value">{formatCurrency(sessionStats.totalRevenue)}</div>
            <div className="stat-label">Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-details">
            <div className="stat-value">{formatCurrency(sessionStats.pendingPayments)}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon recurring">🔄</div>
          <div className="stat-details">
            <div className="stat-value">{sessionStats.recurringCount}</div>
            <div className="stat-label">Recurring</div>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="sessions-table-container">
        <div className="table-header">
          <h3>Sessions ({filteredSessions.length})</h3>
          {selectedSessions.length > 0 && (
            <span className="selection-count">
              {selectedSessions.length} selected
            </span>
          )}
        </div>

        <div className="sessions-table">
          <table>
            <thead>
              <tr>
                <th className="select-column">
                  <input
                    type="checkbox"
                    checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    ref={input => {
                      if (input) {
                        input.indeterminate = selectedSessions.length > 0 && selectedSessions.length < filteredSessions.length;
                      }
                    }}
                  />
                </th>
                <th>Session Info</th>
                <th>Type</th>
                <th>Client/Provider</th>
                <th>Therapist</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => {
                const sessionKey = `${session.type}-${session.id}`;
                return (
                  <tr 
                    key={sessionKey} 
                    className={selectedSessions.includes(sessionKey) ? 'selected' : ''}
                  >
                    <td className="select-column">
                      <input
                        type="checkbox"
                        checked={selectedSessions.includes(sessionKey)}
                        onChange={(e) => handleSessionSelect(sessionKey, e.target.checked)}
                      />
                    </td>
                    <td className="session-info">
                      <div className="session-details">
                        <div className="session-title">{session.title}</div>
                        <div className="session-meta">
                          <span className="duration">{session.duration} min</span>
                          {session.isRecurring && <span className="recurring-indicator">🔄 Recurring</span>}
                          {session.notes && <span className="notes-indicator">📝 Has Notes</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={getTypeBadgeClass(session.type)}>
                        {session.type === 'MEETING' ? 'Meeting' : 'Personal'}
                      </span>
                    </td>
                    <td className="client-therapist-column">
                      <div className="participant-info">
                        {session.clientName && (
                          <div className="client-name">{session.clientName}</div>
                        )}
                        {session.source && (
                          <div className="source-info">{session.source}</div>
                        )}
                        {session.meetingType && (
                          <div className="meeting-type">{session.meetingType}</div>
                        )}
                      </div>
                    </td>
                    <td className="therapist-column">
                      <span className="therapist-name">{session.therapistName}</span>
                    </td>
                    <td className="datetime-column">
                      <div className="datetime-info">
                        <div className="date-time">{formatDateTime(session.date, session.time)}</div>
                      </div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(session.status)}>
                        {session.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="payment-column">
                      {session.amount && session.amount > 0 ? (
                        <div className="payment-info">
                          <span className={getPaymentBadgeClass(session.paymentStatus || 'PENDING')}>
                            {session.paymentStatus}
                          </span>
                          <div className="amount">{formatCurrency(session.amount, session.currency)}</div>
                        </div>
                      ) : (
                        <span className="no-payment">No Payment</span>
                      )}
                    </td>
                    <td className="actions-column">
                      <div className="action-buttons">
                        <button 
                          className="btn-small"
                          onClick={() => handleSessionView(session.id, session.type)}
                          title="View session details"
                        >
                          👁️
                        </button>
                        <button 
                          className="btn-small"
                          onClick={() => handleSessionEdit(session.id, session.type)}
                          title="Edit session"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-small"
                          onClick={() => handleSessionActivity(session.id, session.type)}
                          title="View activity"
                        >
                          📊
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSessions.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No sessions found</h3>
              <p>Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        selectedItems={selectedSessions}
        totalItems={filteredSessions.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        actions={bulkActions}
        onActionExecute={handleBulkActionExecute}
        progress={bulkProgress}
        onProgressCancel={handleProgressCancel}
        isVisible={selectedSessions.length > 0 || !!bulkProgress}
      />

      {/* Modals */}
      {showAddMeetingModal && (
        <div className="modal-overlay">
          <div className="activity-modal">
            <div className="modal-header">
              <h3>Add Meeting</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddMeetingModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Meeting creation functionality will be integrated here.</p>
              <p>This will connect to the existing meeting creation system.</p>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowAddMeetingModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowAddMeetingModal(false);
                    fetchSessions();
                    if (onRefresh) onRefresh();
                  }}
                >
                  Create Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showAddPersonalMeetingModal && (
        <AddPersonalMeetingModal 
          isOpen={showAddPersonalMeetingModal}
          onClose={() => setShowAddPersonalMeetingModal(false)}
          onSuccess={() => {
            setShowAddPersonalMeetingModal(false);
            fetchSessions();
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {editingSessionId && editingSessionType === 'MEETING' && (
        <div className="modal-overlay">
          <div className="activity-modal">
            <div className="modal-header">
              <h3>Edit Meeting</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setEditingSessionId(null);
                  setEditingSessionType(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Meeting editing functionality will be integrated here.</p>
              <p>Meeting ID: {editingSessionId}</p>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setEditingSessionId(null);
                    setEditingSessionType(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setEditingSessionId(null);
                    setEditingSessionType(null);
                    fetchSessions();
                    if (onRefresh) onRefresh();
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingSessionId && editingSessionType === 'PERSONAL_MEETING' && (
        <div className="modal-overlay">
          <div className="activity-modal">
            <div className="modal-header">
              <h3>Edit Personal Meeting</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setEditingSessionId(null);
                  setEditingSessionType(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Personal meeting editing functionality will be integrated here.</p>
              <p>Personal Meeting ID: {editingSessionId}</p>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setEditingSessionId(null);
                    setEditingSessionType(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setEditingSessionId(null);
                    setEditingSessionType(null);
                    fetchSessions();
                    if (onRefresh) onRefresh();
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingSessionId && viewingSessionType === 'MEETING' && (
        <div className="modal-overlay">
          <div className="activity-modal">
            <div className="modal-header">
              <h3>View Meeting Details</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setViewingSessionId(null);
                  setViewingSessionType(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Meeting details will be displayed here.</p>
              <p>Meeting ID: {viewingSessionId}</p>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setViewingSessionId(null);
                    setViewingSessionType(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingSessionId && viewingSessionType === 'PERSONAL_MEETING' && (
        <div className="modal-overlay">
          <div className="activity-modal">
            <div className="modal-header">
              <h3>View Personal Meeting Details</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setViewingSessionId(null);
                  setViewingSessionType(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>Personal meeting details will be displayed here.</p>
              <p>Personal Meeting ID: {viewingSessionId}</p>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setViewingSessionId(null);
                    setViewingSessionType(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityLog && selectedSessionForActivity && (
        <div className="modal-overlay">
          <div className="activity-modal">
            <div className="modal-header">
              <h3>Session Activity Log</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowActivityLog(false);
                  setSelectedSessionForActivity(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="activity-logs">
                {sessionActivity.map((log) => (
                  <div key={log.id} className="activity-item">
                    <div className="activity-icon">📝</div>
                    <div className="activity-details">
                      <div className="activity-action">{log.action.replace('_', ' ')}</div>
                      <div className="activity-timestamp">{formatDateTime(log.timestamp.split('T')[0], log.timestamp.split('T')[1])}</div>
                      <div className="activity-performer">by {log.performedBy}</div>
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

export default EnhancedSessionManagement; 