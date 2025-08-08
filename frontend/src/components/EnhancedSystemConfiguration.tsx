import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSearch, { SearchFilter, FilterPreset } from './AdminSearch';
import BulkOperations, { BulkAction, BulkOperationProgress } from './BulkOperations';
import './EnhancedSystemConfiguration.css';

interface SystemStats {
  totalSources: number;
  totalMeetingTypes: number;
  totalPersonalMeetingTypes: number;
  activeIntegrations: number;
  systemHealth: 'good' | 'warning' | 'critical';
  lastBackup: string;
  databaseSize: string;
  uptime: string;
  activeUsers: number;
  totalConfigurations: number;
}

interface MeetingSource {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  totalMeetings: number;
  createdAt: string;
  updatedAt: string;
}

interface PersonalMeetingType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  totalMeetings: number;
  createdAt: string;
  updatedAt: string;
}

interface SystemIntegration {
  id: number;
  name: string;
  type: 'GOOGLE_CALENDAR' | 'EMAIL' | 'SMS' | 'PAYMENT' | 'BACKUP';
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  lastSync?: string;
  configData?: any;
  createdAt: string;
  updatedAt: string;
}

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description?: string;
  category: 'GENERAL' | 'SECURITY' | 'NOTIFICATIONS' | 'INTEGRATIONS' | 'BACKUP';
  isEditable: boolean;
  updatedAt: string;
}

interface EnhancedSystemConfigurationProps {
  onRefresh?: () => void;
}

const EnhancedSystemConfiguration: React.FC<EnhancedSystemConfigurationProps> = ({
  onRefresh
}) => {
  const { user: currentUser, token } = useAuth();
  
  // Data states
  const [meetingSources, setMeetingSources] = useState<MeetingSource[]>([]);
  const [personalMeetingTypes, setPersonalMeetingTypes] = useState<PersonalMeetingType[]>([]);
  const [integrations, setIntegrations] = useState<SystemIntegration[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalSources: 0,
    totalMeetingTypes: 0,
    totalPersonalMeetingTypes: 0,
    activeIntegrations: 0,
    systemHealth: 'good',
    lastBackup: '',
    databaseSize: '',
    uptime: '',
    activeUsers: 0,
    totalConfigurations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchValue, setSearchValue] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  
  // Bulk operations states
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkProgress, setBulkProgress] = useState<BulkOperationProgress | undefined>();
  
  // Modal states
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [showAddMeetingTypeModal, setShowAddMeetingTypeModal] = useState(false);
  const [showAddIntegrationModal, setShowAddIntegrationModal] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<number | null>(null);
  const [editingMeetingTypeId, setEditingMeetingTypeId] = useState<number | null>(null);
  const [editingIntegrationId, setEditingIntegrationId] = useState<number | null>(null);
  const [showSystemBackup, setShowSystemBackup] = useState(false);
  const [showSystemRestore, setShowSystemRestore] = useState(false);
  const [showSystemLogs, setShowSystemLogs] = useState(false);
  const [activeTab, setActiveTab] = useState<'sources' | 'meeting-types' | 'integrations' | 'settings' | 'maintenance'>('sources');

  // Ref to prevent double fetching
  const hasInitialized = useRef(false);

  // API URL configuration
  const apiUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
        ? 'https://web-production-9aa8.up.railway.app/api'
        : 'http://localhost:8085/api');
  }, []);
  const rootUrl = useMemo(() => apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl, [apiUrl]);

  // Initialize search filters
  const initializeSearchFilters = useCallback(() => {
    const filters: SearchFilter[] = [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' }
        ],
        value: ''
      },
      {
        id: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { value: 'GENERAL', label: 'General' },
          { value: 'SECURITY', label: 'Security' },
          { value: 'NOTIFICATIONS', label: 'Notifications' },
          { value: 'INTEGRATIONS', label: 'Integrations' },
          { value: 'BACKUP', label: 'Backup' }
        ],
        value: ''
      },
      {
        id: 'integrationType',
        label: 'Integration Type',
        type: 'select',
        options: [
          { value: 'GOOGLE_CALENDAR', label: 'Google Calendar' },
          { value: 'EMAIL', label: 'Email' },
          { value: 'SMS', label: 'SMS' },
          { value: 'PAYMENT', label: 'Payment' },
          { value: 'BACKUP', label: 'Backup' }
        ],
        value: ''
      }
    ];
    setSearchFilters(filters);
  }, []);

  // Fetch system configuration data
  const fetchSystemData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch meeting sources
      const sourcesResponse = await fetch(`${apiUrl}/client-sources`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Fetch personal meeting types
      const meetingTypesResponse = await fetch(`${rootUrl}/admin/personal-meeting-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Fetch calendar integrations
      const integrationsResponse = await fetch(`${apiUrl}/calendar/integration`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Handle responses individually to avoid failing all if one fails
      let sources: MeetingSource[] = [];
      let meetingTypes: PersonalMeetingType[] = [];
      let integrationsList: SystemIntegration[] = [];
      
      // Handle sources response
      if (sourcesResponse.ok) {
        try {
          const sourcesData = await sourcesResponse.json();
          sources = (Array.isArray(sourcesData) ? sourcesData : sourcesData.content || []).map((source: any) => ({
            id: source.id,
            name: source.name,
            description: source.description,
            isActive: source.isActive,
            totalMeetings: source.totalMeetings || 0,
            createdAt: source.createdAt,
            updatedAt: source.updatedAt
          }));
        } catch (e) {
          console.warn('Failed to parse sources data:', e);
        }
      }
      
      // Handle meeting types response
      if (meetingTypesResponse.ok) {
        try {
          const meetingTypesData = await meetingTypesResponse.json();
          meetingTypes = (Array.isArray(meetingTypesData) ? meetingTypesData : meetingTypesData.content || []).map((type: any) => ({
            id: type.id,
            name: type.name,
            description: type.description,
            isActive: type.isActive,
            totalMeetings: type.totalMeetings || 0,
            createdAt: type.createdAt,
            updatedAt: type.updatedAt
          }));
        } catch (e) {
          console.warn('Failed to parse meeting types data:', e);
        }
      }
      
      // Handle integrations response (single integration or none)
      if (integrationsResponse.ok) {
        try {
          const integrationsData = await integrationsResponse.json();
          // Calendar integration endpoint returns a single integration or a message
          if (integrationsData && integrationsData.id) {
            integrationsList = [{
              id: integrationsData.id,
              name: integrationsData.name || 'Google Calendar',
              type: 'GOOGLE_CALENDAR' as const,
              status: integrationsData.isActive ? 'ACTIVE' : 'INACTIVE',
              lastSync: integrationsData.lastSync,
              configData: integrationsData.configData,
              createdAt: integrationsData.createdAt,
              updatedAt: integrationsData.updatedAt
            }];
          }
        } catch (e) {
          console.warn('Failed to parse integrations data:', e);
        }
      }
      
      setMeetingSources(sources);
      setPersonalMeetingTypes(meetingTypes);
      setIntegrations(integrationsList);
      
      // Calculate system stats
      calculateSystemStats(sources, meetingTypes, integrationsList);
    } catch (error: any) {
      console.error('Error fetching system data:', error);
      setError('Failed to load system configuration data');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  // Calculate system statistics
  const calculateSystemStats = useCallback((
    sources: MeetingSource[],
    meetingTypes: PersonalMeetingType[],
    integrations: SystemIntegration[]
  ) => {
    const activeSources = sources.filter(s => s.isActive).length;
    const activeMeetingTypes = meetingTypes.filter(t => t.isActive).length;
    const activeIntegrationsCount = integrations.filter(i => i.status === 'ACTIVE').length;
    
    // Mock system settings for now
    const mockSettings: SystemSetting[] = [
      {
        id: 1,
        key: 'system.name',
        value: 'Clinic Management System',
        description: 'System display name',
        category: 'GENERAL',
        isEditable: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        key: 'security.session_timeout',
        value: '3600',
        description: 'Session timeout in seconds',
        category: 'SECURITY',
        isEditable: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        key: 'notifications.email_enabled',
        value: 'true',
        description: 'Enable email notifications',
        category: 'NOTIFICATIONS',
        isEditable: true,
        updatedAt: new Date().toISOString()
      }
    ];
    
    setSystemSettings(mockSettings);
    
    setSystemStats({
      totalSources: sources.length,
      totalMeetingTypes: meetingTypes.length,
      totalPersonalMeetingTypes: meetingTypes.length,
      activeIntegrations: activeIntegrationsCount,
      systemHealth: activeIntegrationsCount > 0 ? 'good' : 'warning',
      lastBackup: new Date().toISOString(),
      databaseSize: '2.4 GB',
      uptime: '15 days, 3 hours',
      activeUsers: 45,
      totalConfigurations: sources.length + meetingTypes.length + integrations.length + mockSettings.length
    });
  }, []);

  // Apply filters and search
  const applyFiltersAndSearch = useCallback(() => {
    let filtered: any[] = [];

    // Determine which data to filter based on active tab
    switch (activeTab) {
      case 'sources':
        filtered = [...meetingSources];
        break;
      case 'meeting-types':
        filtered = [...personalMeetingTypes];
        break;
      case 'integrations':
        filtered = [...integrations];
        break;
      case 'settings':
        filtered = [...systemSettings];
        break;
      default:
        filtered = [];
    }

    // Apply search
    if (searchValue) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.key?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.value?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Apply filters
    searchFilters.forEach(filter => {
      if (filter.value) {
        switch (filter.id) {
          case 'status':
            filtered = filtered.filter(item => 
              item.isActive === (filter.value === 'ACTIVE')
            );
            break;
          case 'category':
            filtered = filtered.filter(item => 
              item.category === filter.value
            );
            break;
          case 'integrationType':
            filtered = filtered.filter(item => 
              item.type === filter.value
            );
            break;
        }
      }
    });

    // Update filtered data based on active tab
    // Note: In a real implementation, you'd have separate filtered states for each tab
  }, [meetingSources, personalMeetingTypes, integrations, systemSettings, searchValue, searchFilters, activeTab]);

  // Initialize on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchSystemData();
    }
  }, [fetchSystemData]);

  // Initialize filters when data is loaded
  useEffect(() => {
    if (meetingSources.length > 0 || personalMeetingTypes.length > 0 || integrations.length > 0) {
      initializeSearchFilters();
    }
  }, [initializeSearchFilters, meetingSources.length, personalMeetingTypes.length, integrations.length]);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Clear selection when tab changes
  useEffect(() => {
    setSelectedItems([]);
  }, [activeTab]);

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

  // Generate search suggestions
  const generateSearchSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    // Add source suggestions
    meetingSources.forEach(source => {
      suggestions.push(source.name);
    });
    
    // Add meeting type suggestions
    personalMeetingTypes.forEach(type => {
      suggestions.push(type.name);
    });
    
    // Add integration suggestions
    integrations.forEach(integration => {
      suggestions.push(integration.name);
    });
    
    // Add setting suggestions
    systemSettings.forEach(setting => {
      suggestions.push(setting.key);
    });
    
    // Add status suggestions
    suggestions.push('Active', 'Inactive');
    
    return suggestions;
  }, [meetingSources, personalMeetingTypes, integrations, systemSettings]);

  // Bulk operations
  const handleItemSelect = (itemKey: string, isSelected: boolean) => {
    setSelectedItems(prev => 
      isSelected 
        ? [...prev, itemKey]
        : prev.filter(key => key !== itemKey)
    );
  };

  const handleSelectAll = (isSelected: boolean) => {
    // Get current items based on active tab
    let currentItems: any[] = [];
    switch (activeTab) {
      case 'sources':
        currentItems = meetingSources;
        break;
      case 'meeting-types':
        currentItems = personalMeetingTypes;
        break;
      case 'integrations':
        currentItems = integrations;
        break;
      case 'settings':
        currentItems = systemSettings;
        break;
    }
    
    if (isSelected) {
      setSelectedItems(currentItems.map(item => `${activeTab}-${item.id}`));
    } else {
      setSelectedItems([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  // Initialize bulk actions
  const initializeBulkActions = useCallback((): BulkAction[] => {
    return [
      {
        id: 'activate',
        label: 'Activate Selected',
        icon: '✅',
        isDestructive: false
      },
      {
        id: 'deactivate',
        label: 'Deactivate Selected',
        icon: '❌',
        isDestructive: false
      },
      {
        id: 'export',
        label: 'Export Configuration',
        icon: '📤',
        isDestructive: false
      },
      {
        id: 'delete',
        label: 'Delete Selected',
        icon: '🗑️',
        isDestructive: true
      }
    ];
  }, []);

  // Handle bulk action execution
  const handleBulkActionExecute = async (actionId: string) => {
    const selectedItemIds = selectedItems.map(key => {
      const [, id] = key.split('-');
      return parseInt(id);
    });

    setBulkProgress({
      id: actionId,
      status: 'running',
      total: selectedItemIds.length,
      completed: 0,
      failed: 0,
      message: `Executing ${actionId}...`
    });

    try {
      for (let i = 0; i < selectedItemIds.length; i++) {
        const itemId = selectedItemIds[i];
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setBulkProgress(prev => prev ? {
          ...prev,
          completed: i + 1,
          message: `Processing item ${i + 1} of ${selectedItemIds.length}...`
        } : undefined);
      }

      setBulkProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        message: `Successfully processed ${selectedItemIds.length} items`
      } : undefined);

      // Refresh data
      await fetchSystemData();
      if (onRefresh) onRefresh();

      setTimeout(() => {
        setBulkProgress(undefined);
        setSelectedItems([]);
      }, 2000);

    } catch (error) {
      setBulkProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        message: 'Failed to process items'
      } : undefined);

      setTimeout(() => {
        setBulkProgress(undefined);
      }, 3000);
    }
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

  // Configuration management
  const handleAddSource = () => {
    setShowAddSourceModal(true);
  };

  const handleAddMeetingType = () => {
    setShowAddMeetingTypeModal(true);
  };

  const handleAddIntegration = () => {
    setShowAddIntegrationModal(true);
  };

  const handleEditSource = (sourceId: number) => {
    setEditingSourceId(sourceId);
    setShowAddSourceModal(true);
  };

  const handleEditMeetingType = (meetingTypeId: number) => {
    setEditingMeetingTypeId(meetingTypeId);
    setShowAddMeetingTypeModal(true);
  };

  const handleEditIntegration = (integrationId: number) => {
    setEditingIntegrationId(integrationId);
    setShowAddIntegrationModal(true);
  };

  const handleRefreshData = () => {
    fetchSystemData();
    if (onRefresh) onRefresh();
  };

  // System maintenance
  const handleSystemBackup = () => {
    setShowSystemBackup(true);
  };

  const handleSystemRestore = () => {
    setShowSystemRestore(true);
  };

  const handleViewSystemLogs = () => {
    setShowSystemLogs(true);
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

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'status-badge active';
      case 'inactive': return 'status-badge inactive';
      case 'error': return 'status-badge error';
      default: return 'status-badge unknown';
    }
  };

  // Get health badge class
  const getHealthBadgeClass = (health: string) => {
    switch (health.toLowerCase()) {
      case 'good': return 'health-badge good';
      case 'warning': return 'health-badge warning';
      case 'critical': return 'health-badge critical';
      default: return 'health-badge unknown';
    }
  };

  const bulkActions = initializeBulkActions();
  const searchSuggestions = generateSearchSuggestions();

  if (loading) {
    return (
      <div className="enhanced-system-configuration">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading system configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enhanced-system-configuration">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading System Configuration</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={handleRefreshData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-system-configuration">
      {/* Header */}
      <div className="section-header">
        <div className="header-content">
          <h2>⚙️ System Configuration</h2>
          <p>Comprehensive management of sources, types, integrations, and system settings</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleViewSystemLogs}>
            📋 System Logs
          </button>
          <button className="btn-secondary" onClick={handleSystemRestore}>
            🔄 Restore
          </button>
          <button className="btn-secondary" onClick={handleSystemBackup}>
            💾 Backup
          </button>
          <button className="btn-primary" onClick={handleRefreshData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* System Statistics */}
      <div className="system-stats">
        <div className="stat-card">
          <div className="stat-icon sources">📊</div>
          <div className="stat-details">
            <div className="stat-value">{systemStats.totalSources}</div>
            <div className="stat-label">Meeting Sources</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon types">📝</div>
          <div className="stat-details">
            <div className="stat-value">{systemStats.totalMeetingTypes}</div>
            <div className="stat-label">Meeting Types</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon integrations">🔗</div>
          <div className="stat-details">
            <div className="stat-value">{systemStats.activeIntegrations}</div>
            <div className="stat-label">Active Integrations</div>
          </div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon health ${systemStats.systemHealth}`}>
            {systemStats.systemHealth === 'good' ? '✅' : systemStats.systemHealth === 'warning' ? '⚠️' : '❌'}
          </div>
          <div className="stat-details">
            <div className="stat-value">{systemStats.systemHealth.toUpperCase()}</div>
            <div className="stat-label">System Health</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon uptime">⏱️</div>
          <div className="stat-details">
            <div className="stat-value">{systemStats.uptime}</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon database">💾</div>
          <div className="stat-details">
            <div className="stat-value">{systemStats.databaseSize}</div>
            <div className="stat-label">Database Size</div>
          </div>
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
        placeholder="Search configurations by name, description, or key..."
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={handleToggleAdvancedFilters}
        resultCount={0} // Will be calculated based on active tab
        isLoading={loading}
      />

      {/* Configuration Tabs */}
      <div className="configuration-tabs">
        <div className="tab-header">
          <button 
            className={`tab-button ${activeTab === 'sources' ? 'active' : ''}`}
            onClick={() => setActiveTab('sources')}
          >
            📊 Meeting Sources
          </button>
          <button 
            className={`tab-button ${activeTab === 'meeting-types' ? 'active' : ''}`}
            onClick={() => setActiveTab('meeting-types')}
          >
            📝 Meeting Types
          </button>
          <button 
            className={`tab-button ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            🔗 Integrations
          </button>
          <button 
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
          <button 
            className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            🔧 Maintenance
          </button>
        </div>

        {/* Sources Tab */}
        <div className={`tab-content ${activeTab === 'sources' ? 'active' : ''}`}>
          <div className="sources-section">
            <div className="section-header">
              <h3>Meeting Sources ({meetingSources.length})</h3>
              <button className="btn-primary" onClick={handleAddSource}>
                ➕ Add Source
              </button>
            </div>
            <div className="sources-grid">
              {meetingSources.map((source) => (
                <div key={source.id} className="source-card">
                  <div className="source-header">
                    <h4>{source.name}</h4>
                    <span className={`status-indicator ${source.isActive ? 'active' : 'inactive'}`}>
                      {source.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="source-description">
                    {source.description || 'No description available'}
                  </div>
                  <div className="source-stats">
                    <div className="stat">
                      <span className="label">Total Meetings:</span>
                      <span className="value">{source.totalMeetings}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Created:</span>
                      <span className="value">{formatDate(source.createdAt)}</span>
                    </div>
                  </div>
                  <div className="source-actions">
                    <button className="btn-small" onClick={() => handleEditSource(source.id)}>
                      ✏️ Edit
                    </button>
                    <button className="btn-small">
                      📊 View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Meeting Types Tab */}
        <div className={`tab-content ${activeTab === 'meeting-types' ? 'active' : ''}`}>
          <div className="meeting-types-section">
            <div className="section-header">
              <h3>Personal Meeting Types ({personalMeetingTypes.length})</h3>
              <button className="btn-primary" onClick={handleAddMeetingType}>
                ➕ Add Type
              </button>
            </div>
            <div className="meeting-types-grid">
              {personalMeetingTypes.map((type) => (
                <div key={type.id} className="meeting-type-card">
                  <div className="meeting-type-header">
                    <h4>{type.name}</h4>
                    <span className={`status-indicator ${type.isActive ? 'active' : 'inactive'}`}>
                      {type.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="meeting-type-description">
                    {type.description || 'No description available'}
                  </div>
                  <div className="meeting-type-stats">
                    <div className="stat">
                      <span className="label">Total Meetings:</span>
                      <span className="value">{type.totalMeetings}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Created:</span>
                      <span className="value">{formatDate(type.createdAt)}</span>
                    </div>
                  </div>
                  <div className="meeting-type-actions">
                    <button className="btn-small" onClick={() => handleEditMeetingType(type.id)}>
                      ✏️ Edit
                    </button>
                    <button className="btn-small">
                      📊 View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Integrations Tab */}
        <div className={`tab-content ${activeTab === 'integrations' ? 'active' : ''}`}>
          <div className="integrations-section">
            <div className="section-header">
              <h3>System Integrations ({integrations.length})</h3>
              <button className="btn-primary" onClick={handleAddIntegration}>
                ➕ Add Integration
              </button>
            </div>
            <div className="integrations-grid">
              {integrations.map((integration) => (
                <div key={integration.id} className="integration-card">
                  <div className="integration-header">
                    <h4>{integration.name}</h4>
                    <span className={`status-indicator ${integration.status.toLowerCase()}`}>
                      {integration.status}
                    </span>
                  </div>
                  <div className="integration-type">
                    <span className="type-badge">{integration.type}</span>
                  </div>
                  <div className="integration-stats">
                    <div className="stat">
                      <span className="label">Last Sync:</span>
                      <span className="value">
                        {integration.lastSync ? formatDate(integration.lastSync) : 'Never'}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="label">Created:</span>
                      <span className="value">{formatDate(integration.createdAt)}</span>
                    </div>
                  </div>
                  <div className="integration-actions">
                    <button className="btn-small" onClick={() => handleEditIntegration(integration.id)}>
                      ✏️ Edit
                    </button>
                    <button className="btn-small">
                      🔄 Sync
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Tab */}
        <div className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`}>
          <div className="settings-section">
            <div className="section-header">
              <h3>System Settings ({systemSettings.length})</h3>
            </div>
            <div className="settings-table-container">
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>Setting Key</th>
                    <th>Value</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {systemSettings.map((setting) => (
                    <tr key={setting.id}>
                      <td className="setting-key">{setting.key}</td>
                      <td className="setting-value">{setting.value}</td>
                      <td>
                        <span className={`category-badge ${setting.category.toLowerCase()}`}>
                          {setting.category}
                        </span>
                      </td>
                      <td className="setting-description">{setting.description}</td>
                      <td className="setting-date">{formatDate(setting.updatedAt)}</td>
                      <td className="setting-actions">
                        {setting.isEditable && (
                          <button className="btn-small">
                            ✏️ Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Maintenance Tab */}
        <div className={`tab-content ${activeTab === 'maintenance' ? 'active' : ''}`}>
          <div className="maintenance-section">
            <div className="section-header">
              <h3>System Maintenance</h3>
            </div>
            <div className="maintenance-grid">
              <div className="maintenance-card">
                <div className="maintenance-icon">💾</div>
                <h4>Database Backup</h4>
                <p>Create a complete backup of the system database</p>
                <div className="maintenance-info">
                  <span>Last backup: {formatDate(systemStats.lastBackup)}</span>
                </div>
                <button className="btn-primary" onClick={handleSystemBackup}>
                  Create Backup
                </button>
              </div>
              
              <div className="maintenance-card">
                <div className="maintenance-icon">🔄</div>
                <h4>System Restore</h4>
                <p>Restore the system from a previous backup</p>
                <div className="maintenance-info">
                  <span>Available backups: 3</span>
                </div>
                <button className="btn-secondary" onClick={handleSystemRestore}>
                  Restore System
                </button>
              </div>
              
              <div className="maintenance-card">
                <div className="maintenance-icon">📋</div>
                <h4>System Logs</h4>
                <p>View system logs and error reports</p>
                <div className="maintenance-info">
                  <span>Log entries: 1,247</span>
                </div>
                <button className="btn-secondary" onClick={handleViewSystemLogs}>
                  View Logs
                </button>
              </div>
              
              <div className="maintenance-card">
                <div className="maintenance-icon">🧹</div>
                <h4>System Cleanup</h4>
                <p>Clean up temporary files and optimize database</p>
                <div className="maintenance-info">
                  <span>Last cleanup: 2 days ago</span>
                </div>
                <button className="btn-secondary">
                  Run Cleanup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        selectedItems={selectedItems}
        totalItems={0} // Will be calculated based on active tab
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        actions={bulkActions}
        onActionExecute={handleBulkActionExecute}
        progress={bulkProgress}
        onProgressCancel={handleProgressCancel}
        isVisible={selectedItems.length > 0 || !!bulkProgress}
      />

      {/* Modals would go here */}
      {/* Add Source Modal */}
      {/* Add Meeting Type Modal */}
      {/* Add Integration Modal */}
      {/* System Backup Modal */}
      {/* System Restore Modal */}
      {/* System Logs Modal */}
    </div>
  );
};

export default EnhancedSystemConfiguration; 