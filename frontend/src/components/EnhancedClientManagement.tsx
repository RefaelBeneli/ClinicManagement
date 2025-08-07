import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSearch, { SearchFilter, FilterPreset } from './AdminSearch';
import BulkOperations, { BulkAction, BulkOperationProgress } from './BulkOperations';
import AddClientModal from './ui/AddClientModal';
import EditClientModal from './ui/EditClientModal';
import ViewClientModal from './ui/ViewClientModal';
import { Client } from '../types';
import './EnhancedClientManagement.css';

interface AdminClient extends Client {
  therapistName?: string;
  sessionCount: number;
  lastSessionDate?: string;
  totalRevenue: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  createdBy: string;
}

interface ClientActivity {
  id: number;
  clientId: number;
  action: string;
  timestamp: string;
  details?: string;
  performedBy: string;
}

interface TherapistAssignment {
  therapistId: number;
  therapistName: string;
  clientCount: number;
  lastAssigned: string;
}

interface EnhancedClientManagementProps {
  onRefresh?: () => void;
}

const EnhancedClientManagement: React.FC<EnhancedClientManagementProps> = ({
  onRefresh
}) => {
  const { user: currentUser, token } = useAuth();
  
  // Data states
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<AdminClient[]>([]);
  const [therapists, setTherapists] = useState<TherapistAssignment[]>([]);
  const [clientActivity, setClientActivity] = useState<ClientActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchValue, setSearchValue] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  
  // Bulk operations states
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [bulkProgress, setBulkProgress] = useState<BulkOperationProgress | undefined>();
  
  // Modal states
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [viewingClientId, setViewingClientId] = useState<number | null>(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedClientForActivity, setSelectedClientForActivity] = useState<number | null>(null);
  const [showTherapistAssignment, setShowTherapistAssignment] = useState(false);

  // API URL configuration
  const apiUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
        ? 'https://web-production-9aa8.up.railway.app/api'
        : 'http://localhost:8085/api');
  }, []);

  // Helper function to split fullName
  const splitFullName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { firstName, lastName };
  };

  // Initialize search filters
  const initializeSearchFilters = useCallback(() => {
    const filters: SearchFilter[] = [
      {
        id: 'therapist',
        label: 'Assigned Therapist',
        type: 'select',
        options: therapists.map(t => ({ value: t.therapistId.toString(), label: t.therapistName })),
        value: ''
      },
      {
        id: 'status',
        label: 'Client Status',
        type: 'select',
        options: [
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
          { value: 'ARCHIVED', label: 'Archived' }
        ],
        value: ''
      },
      {
        id: 'riskLevel',
        label: 'Risk Level',
        type: 'select',
        options: [
          { value: 'LOW', label: 'Low Risk' },
          { value: 'MEDIUM', label: 'Medium Risk' },
          { value: 'HIGH', label: 'High Risk' }
        ],
        value: ''
      },
      {
        id: 'sessionCount',
        label: 'Minimum Sessions',
        type: 'number',
        value: '',
        placeholder: 'Enter minimum session count'
      },
      {
        id: 'revenueRange',
        label: 'Revenue Range',
        type: 'select',
        options: [
          { value: '0-1000', label: '$0 - $1,000' },
          { value: '1000-5000', label: '$1,000 - $5,000' },
          { value: '5000-10000', label: '$5,000 - $10,000' },
          { value: '10000+', label: '$10,000+' }
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
  }, [therapists]);

  // Initialize bulk actions
  const initializeBulkActions = useCallback(() => {
    const actions: BulkAction[] = [
      {
        id: 'assignTherapist',
        label: 'Assign Therapist',
        icon: '👨‍⚕️',
        color: '#28a745',
        requiresConfirmation: true,
        confirmationMessage: 'Select a therapist to assign to the selected clients.'
      },
      {
        id: 'changeStatus',
        label: 'Change Status',
        icon: '🔄',
        color: '#17a2b8',
        requiresConfirmation: true,
        confirmationMessage: 'Select the new status for the selected clients.'
      },
      {
        id: 'updateRiskLevel',
        label: 'Update Risk Level',
        icon: '⚠️',
        color: '#ffc107',
        requiresConfirmation: true,
        confirmationMessage: 'Select the risk level for the selected clients.'
      },
      {
        id: 'addNotes',
        label: 'Add Notes',
        icon: '📝',
        color: '#6f42c1',
        requiresConfirmation: true,
        confirmationMessage: 'Add administrative notes to the selected clients.'
      },
      {
        id: 'generateReport',
        label: 'Generate Report',
        icon: '📊',
        color: '#fd7e14'
      },
      {
        id: 'export',
        label: 'Export Data',
        icon: '📋',
        color: '#6c757d'
      },
      {
        id: 'archive',
        label: 'Archive Clients',
        icon: '📦',
        color: '#6c757d',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to archive the selected clients? They will be moved to inactive status.',
        isDisabled: (ids) => {
          const selectedClientsData = clients.filter(c => ids.includes(c.id.toString()));
          return selectedClientsData.every(c => c.status === 'ARCHIVED');
        }
      },
      {
        id: 'delete',
        label: 'Delete Clients',
        icon: '🗑️',
        color: '#dc3545',
        requiresConfirmation: true,
        isDestructive: true,
        confirmationMessage: 'This will permanently delete the selected clients and all their associated data including sessions, notes, and history. This action cannot be undone.',
        isDisabled: (ids) => {
          // Prevent deleting clients with recent sessions
          const selectedClientsData = clients.filter(c => ids.includes(c.id.toString()));
          return selectedClientsData.some(c => c.sessionCount > 0 && c.lastSessionDate && 
            new Date(c.lastSessionDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          );
        }
      }
    ];
    return actions;
  }, [clients]);

  // Generate search suggestions
  const generateSearchSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    // Add client full names
    clients.forEach(c => {
      if (c.fullName) suggestions.push(c.fullName);
    });
    
    // Add first and last names
    clients.forEach(c => {
      if (c.fullName) {
        const { firstName, lastName } = splitFullName(c.fullName);
        if (firstName) suggestions.push(firstName);
        if (lastName) suggestions.push(lastName);
      }
    });
    
    // Add other client properties
    clients.forEach(c => {
      if (c.email) suggestions.push(c.email);
      if (c.phone) suggestions.push(c.phone);
      if (c.therapistName) suggestions.push(c.therapistName);
    });
    
    // Add static suggestions
    suggestions.push(
      'high risk clients',
      'active clients',
      'archived clients',
      'recent sessions',
      'no recent activity'
    );
    
    return Array.from(new Set(suggestions));
  }, [clients]);

  // Fetch clients
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${apiUrl}/admin/clients?page=0&size=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform to AdminClient format with mock additional data
        const adminClients: AdminClient[] = (data.content || []).map((client: Client) => ({
          ...client,
          therapistName: 'Dr. Smith', // Mock - replace with actual therapist lookup
          sessionCount: Math.floor(Math.random() * 50), // Mock - replace with actual count
          lastSessionDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : undefined,
          totalRevenue: Math.floor(Math.random() * 15000), // Mock - replace with actual calculation
          status: (['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const)[Math.floor(Math.random() * 3)],
          riskLevel: (['LOW', 'MEDIUM', 'HIGH'] as const)[Math.floor(Math.random() * 3)],
          createdBy: 'System' // Mock - replace with actual user lookup
        }));
        setClients(adminClients);
      } else {
        throw new Error('Failed to fetch clients');
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  // Fetch therapists
  const fetchTherapists = useCallback(async () => {
    try {
      // Mock therapist data - replace with actual API call
      const mockTherapists: TherapistAssignment[] = [
        {
          therapistId: 1,
          therapistName: 'Dr. Sarah Smith',
          clientCount: 15,
          lastAssigned: new Date().toISOString()
        },
        {
          therapistId: 2,
          therapistName: 'Dr. John Doe',
          clientCount: 12,
          lastAssigned: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          therapistId: 3,
          therapistName: 'Dr. Emily Johnson',
          clientCount: 8,
          lastAssigned: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      ];
      setTherapists(mockTherapists);
    } catch (error) {
      console.error('Failed to fetch therapists:', error);
    }
  }, []);

  // Fetch client activity
  const fetchClientActivity = useCallback(async (clientId: number) => {
    try {
      // Mock activity data - replace with actual API call
      const mockActivity: ClientActivity[] = [
        {
          id: 1,
          clientId,
          action: 'SESSION_CREATED',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          details: 'New therapy session scheduled',
          performedBy: 'Dr. Smith'
        },
        {
          id: 2,
          clientId,
          action: 'STATUS_UPDATED',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          details: 'Client status changed to Active',
          performedBy: 'Admin User'
        },
        {
          id: 3,
          clientId,
          action: 'NOTES_ADDED',
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          details: 'Administrative notes updated',
          performedBy: 'Dr. Johnson'
        }
      ];
      setClientActivity(mockActivity);
    } catch (error) {
      console.error('Failed to fetch client activity:', error);
    }
  }, []);

  // Apply search and filters
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...clients];

    // Apply search
    if (searchValue.trim()) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(client => {
        const { firstName, lastName } = splitFullName(client.fullName);
        return client.fullName.toLowerCase().includes(searchTerm) ||
          firstName.toLowerCase().includes(searchTerm) ||
          lastName.toLowerCase().includes(searchTerm) ||
          client.email?.toLowerCase().includes(searchTerm) ||
          client.phone?.toLowerCase().includes(searchTerm) ||
          client.therapistName?.toLowerCase().includes(searchTerm) ||
          client.status.toLowerCase().includes(searchTerm) ||
          client.riskLevel.toLowerCase().includes(searchTerm);
      });
    }

    // Apply filters
    searchFilters.forEach(filter => {
      if (filter.value !== undefined && filter.value !== '' && filter.value !== false) {
        switch (filter.id) {
          case 'therapist':
            filtered = filtered.filter(client => 
              client.therapistName === therapists.find(t => t.therapistId.toString() === filter.value)?.therapistName
            );
            break;
          case 'status':
            filtered = filtered.filter(client => client.status === filter.value);
            break;
          case 'riskLevel':
            filtered = filtered.filter(client => client.riskLevel === filter.value);
            break;
          case 'sessionCount':
            filtered = filtered.filter(client => client.sessionCount >= parseInt(filter.value as string));
            break;
          case 'revenueRange':
            const [min, max] = (filter.value as string).split('-').map(v => v.replace('+', ''));
            const minRevenue = parseInt(min);
            const maxRevenue = max ? parseInt(max) : Infinity;
            filtered = filtered.filter(client => 
              client.totalRevenue >= minRevenue && client.totalRevenue <= maxRevenue
            );
            break;
          case 'createdAfter':
            filtered = filtered.filter(client => new Date(client.createdAt) >= new Date(filter.value));
            break;
          case 'hasRecentActivity':
            if (filter.value) {
              filtered = filtered.filter(client => 
                client.lastSessionDate && 
                new Date(client.lastSessionDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              );
            }
            break;
        }
      }
    });

    setFilteredClients(filtered);
  }, [clients, searchValue, searchFilters, therapists]);

  // Initialize on mount
  useEffect(() => {
    fetchTherapists();
    fetchClients();
  }, [fetchTherapists, fetchClients]);

  // Initialize filters after therapists are loaded
  useEffect(() => {
    if (therapists.length > 0) {
      initializeSearchFilters();
    }
  }, [therapists, initializeSearchFilters]);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Clear selection when filtered data changes
  useEffect(() => {
    setSelectedClients([]);
  }, [filteredClients]);

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
      setSelectedClients(filteredClients.map(c => c.id.toString()));
    } else {
      setSelectedClients([]);
    }
  };

  const handleClientSelect = (clientId: string, selected: boolean) => {
    if (selected) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };

  const handleClearSelection = () => {
    setSelectedClients([]);
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
      // Simulate processing each client
      for (let i = 0; i < selectedIds.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        const clientId = selectedIds[i];
        
        try {
          // Mock API calls - replace with actual implementation
          switch (actionId) {
            case 'assignTherapist':
            case 'changeStatus':
            case 'updateRiskLevel':
            case 'addNotes':
            case 'archive':
            case 'delete':
              console.log(`${actionId} client ${clientId}`);
              break;
            case 'generateReport':
            case 'export':
              console.log(`${actionId} for clients`);
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
            errors: [...(prev.errors || []), `Failed to ${actionId} client ${clientId}: ${error}`]
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
        fetchClients();
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
      setSelectedClients([]);
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

  // Client action handlers
  const handleClientView = (clientId: number) => {
    setViewingClientId(clientId);
  };

  const handleClientEdit = (clientId: number) => {
    setEditingClientId(clientId);
  };

  const handleClientActivity = (clientId: number) => {
    setSelectedClientForActivity(clientId);
    fetchClientActivity(clientId);
    setShowActivityLog(true);
  };

  const handleAddClient = () => {
    setShowAddClientModal(true);
  };

  const handleRefreshData = () => {
    fetchClients();
    fetchTherapists();
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
      case 'active': return 'status-badge active';
      case 'inactive': return 'status-badge inactive';
      case 'archived': return 'status-badge archived';
      default: return 'status-badge unknown';
    }
  };

  // Get risk level badge class
  const getRiskBadgeClass = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'risk-badge low';
      case 'medium': return 'risk-badge medium';
      case 'high': return 'risk-badge high';
      default: return 'risk-badge unknown';
    }
  };

  const bulkActions = initializeBulkActions();
  const searchSuggestions = generateSearchSuggestions();

  if (loading) {
    return (
      <div className="enhanced-client-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enhanced-client-management">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Clients</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={handleRefreshData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-client-management">
      {/* Header */}
      <div className="section-header">
        <div className="header-content">
          <h2>👥 Client Management</h2>
          <p>Comprehensive client oversight and cross-therapist management</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowTherapistAssignment(true)}>
            👨‍⚕️ Therapist Assignment
          </button>
          <button className="btn-primary" onClick={handleAddClient}>
            ➕ Add Client
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
        placeholder="Search clients by name, email, phone, therapist, or status..."
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={handleToggleAdvancedFilters}
        resultCount={filteredClients.length}
        isLoading={loading}
      />

      {/* Client Statistics */}
      <div className="client-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-details">
            <div className="stat-value">{clients.length}</div>
            <div className="stat-label">Total Clients</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">✅</div>
          <div className="stat-details">
            <div className="stat-value">{clients.filter(c => c.status === 'ACTIVE').length}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon high-risk">⚠️</div>
          <div className="stat-details">
            <div className="stat-value">{clients.filter(c => c.riskLevel === 'HIGH').length}</div>
            <div className="stat-label">High Risk</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-details">
            <div className="stat-value">{formatCurrency(clients.reduce((sum, c) => sum + c.totalRevenue, 0))}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="clients-table-container">
        <div className="table-header">
          <h3>Clients ({filteredClients.length})</h3>
          {selectedClients.length > 0 && (
            <span className="selection-count">
              {selectedClients.length} selected
            </span>
          )}
        </div>

        <div className="clients-table">
          <table>
            <thead>
              <tr>
                <th className="select-column">
                  <input
                    type="checkbox"
                    checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    ref={input => {
                      if (input) {
                        input.indeterminate = selectedClients.length > 0 && selectedClients.length < filteredClients.length;
                      }
                    }}
                  />
                </th>
                <th>Client Info</th>
                <th>Therapist</th>
                <th>Status</th>
                <th>Risk Level</th>
                <th>Sessions</th>
                <th>Revenue</th>
                <th>Last Session</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => {
                const { firstName, lastName } = splitFullName(client.fullName);
                return (
                  <tr 
                    key={client.id} 
                    className={selectedClients.includes(client.id.toString()) ? 'selected' : ''}
                  >
                    <td className="select-column">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id.toString())}
                        onChange={(e) => handleClientSelect(client.id.toString(), e.target.checked)}
                      />
                    </td>
                    <td className="client-info">
                      <div className="client-details">
                        <div className="client-name">{client.fullName}</div>
                        <div className="client-meta">
                          {client.email && <span className="email">{client.email}</span>}
                          {client.phone && <span className="phone">{client.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="therapist-column">
                      <span className="therapist-name">{client.therapistName || 'Unassigned'}</span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(client.status)}>
                        {client.status}
                      </span>
                    </td>
                    <td>
                      <span className={getRiskBadgeClass(client.riskLevel)}>
                        {client.riskLevel}
                      </span>
                    </td>
                    <td className="sessions-column">
                      <span className="session-count">{client.sessionCount}</span>
                    </td>
                    <td className="revenue-column">
                      <span className="revenue-amount">{formatCurrency(client.totalRevenue)}</span>
                    </td>
                    <td className="date-column">
                      {client.lastSessionDate ? formatDate(client.lastSessionDate) : 'Never'}
                    </td>
                    <td className="actions-column">
                      <div className="action-buttons">
                        <button 
                          className="btn-small"
                          onClick={() => handleClientView(client.id)}
                          title="View client details"
                        >
                          👁️
                        </button>
                        <button 
                          className="btn-small"
                          onClick={() => handleClientEdit(client.id)}
                          title="Edit client"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-small"
                          onClick={() => handleClientActivity(client.id)}
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

          {filteredClients.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No clients found</h3>
              <p>Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        selectedItems={selectedClients}
        totalItems={filteredClients.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        actions={bulkActions}
        onActionExecute={handleBulkActionExecute}
        progress={bulkProgress}
        onProgressCancel={handleProgressCancel}
        isVisible={selectedClients.length > 0 || !!bulkProgress}
      />

      {/* Modals */}
      {showAddClientModal && (
        <AddClientModal 
          isOpen={showAddClientModal}
          onClose={() => setShowAddClientModal(false)}
          onSuccess={() => {
            setShowAddClientModal(false);
            fetchClients();
            if (onRefresh) onRefresh();
          }}
        />
      )}
      
      {editingClientId && (
        <EditClientModal 
          client={clients.find(c => c.id === editingClientId) || null}
          isOpen={!!editingClientId}
          onClose={() => setEditingClientId(null)} 
          onSuccess={() => {
            setEditingClientId(null);
            fetchClients();
            if (onRefresh) onRefresh();
          }} 
        />
      )}

      {viewingClientId && (
        <ViewClientModal 
          client={clients.find(c => c.id === viewingClientId) || null}
          isOpen={!!viewingClientId}
          onClose={() => setViewingClientId(null)} 
        />
      )}

      {/* Activity Log Modal */}
      {showActivityLog && selectedClientForActivity && (
        <div className="modal-overlay">
          <div className="activity-modal">
            <div className="modal-header">
              <h3>Client Activity Log</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowActivityLog(false);
                  setSelectedClientForActivity(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="activity-logs">
                {clientActivity.map((log) => (
                  <div key={log.id} className="activity-item">
                    <div className="activity-icon">📝</div>
                    <div className="activity-details">
                      <div className="activity-action">{log.action.replace('_', ' ')}</div>
                      <div className="activity-timestamp">{formatDate(log.timestamp)}</div>
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

      {/* Therapist Assignment Modal */}
      {showTherapistAssignment && (
        <div className="modal-overlay">
          <div className="therapist-assignment-modal">
            <div className="modal-header">
              <h3>Therapist Assignment Overview</h3>
              <button
                className="modal-close"
                onClick={() => setShowTherapistAssignment(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="therapist-assignments">
                {therapists.map((therapist) => (
                  <div key={therapist.therapistId} className="therapist-card">
                    <div className="therapist-info">
                      <div className="therapist-name">{therapist.therapistName}</div>
                      <div className="therapist-stats">
                        <span className="client-count">{therapist.clientCount} clients</span>
                        <span className="last-assigned">Last assigned: {formatDate(therapist.lastAssigned)}</span>
                      </div>
                    </div>
                    <div className="therapist-actions">
                      <button className="btn-small">View Clients</button>
                      <button className="btn-small">Assign New</button>
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

export default EnhancedClientManagement; 