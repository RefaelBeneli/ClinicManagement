import React, { useState, useEffect, useCallback } from 'react';
import { Client, ClientRequest, ClientSourceResponse } from '../types';
import { clients as clientsApi, clientSources } from '../services/api';
import './ClientPanel.css';

interface ClientPanelProps {
  onClose: () => void;
  onRefresh?: () => void;
}

interface ClientStats {
  totalClients: number;
  activeClients: number;
  inactiveClients: number;
  newClientsThisMonth: number;
}

const ClientPanel: React.FC<ClientPanelProps> = ({ onClose, onRefresh }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientRequest>({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    sourceId: 0 // NEW: Required source ID
  });

  // Source state
  const [sources, setSources] = useState<ClientSourceResponse[]>([]);

  // Stats state
  const [stats, setStats] = useState<ClientStats | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const clientData = await clientsApi.getAll();
      setClients(clientData);
      setError('');
      
      // Calculate stats after clients are loaded
      await fetchStats(clientData);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async (clientData?: Client[]) => {
    try {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      
      const clientsToUse = clientData || clients;
      
      const activeClients = clientsToUse.filter(c => c.active).length;
      const inactiveClients = clientsToUse.filter(c => !c.active).length;
      const newClientsThisMonth = clientsToUse.filter(c => {
        const createdAt = new Date(c.createdAt);
        return createdAt.getMonth() === thisMonth && 
               createdAt.getFullYear() === thisYear;
      }).length;

      setStats({
        totalClients: clientsToUse.length,
        activeClients,
        inactiveClients,
        newClientsThisMonth
      });
    } catch (error) {
      console.warn('Failed to fetch client stats:', error);
    }
  }, [clients]);

  const fetchSources = useCallback(async () => {
    try {
      const sourceData = await clientSources.getAll();
      setSources(sourceData);
    } catch (error) {
      console.warn('Failed to fetch client sources:', error);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchSources(); // NEW: Load client sources
  }, [fetchClients, fetchSources]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const filterAndSortClients = useCallback(() => {
    let filtered = [...clients];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(client => 
        statusFilter === 'ACTIVE' ? client.active : !client.active
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'email':
          comparison = (a.email || '').localeCompare(b.email || '');
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          comparison = (a.active ? 1 : 0) - (b.active ? 1 : 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortClients();
  }, [filterAndSortClients]);

  const handleStatusToggle = async (clientId: number, currentActiveStatus: boolean) => {
    try {
      if (currentActiveStatus) {
        await clientsApi.deactivate(clientId);
      } else {
        await clientsApi.activate(clientId);
      }
      
      const updatedClients = clients.map(client =>
        client.id === clientId
          ? { ...client, active: !currentActiveStatus }
          : client
      );
      
      setClients(updatedClients);
      
      // Recalculate stats with updated client data
      await fetchStats(updatedClients);
      
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating client status:', error);
      setError('Failed to update client status');
    }
  };

  const handleNameUpdate = async (clientId: number, fullName: string) => {
    try {
      await clientsApi.update(clientId, { fullName });
      await fetchClients();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating client name:', error);
      setError('Failed to update client name');
    }
  };

  const handleEmailUpdate = async (clientId: number, email: string) => {
    try {
      await clientsApi.update(clientId, { email });
      await fetchClients();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating client email:', error);
      setError('Failed to update client email');
    }
  };

  const handlePhoneUpdate = async (clientId: number, phone: string) => {
    try {
      await clientsApi.update(clientId, { phone });
      await fetchClients();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating client phone:', error);
      setError('Failed to update client phone');
    }
  };

  const handleNotesUpdate = async (clientId: number, notes: string) => {
    try {
      const updatedClient = await clientsApi.update(clientId, { notes });
      setClients(prev =>
        prev.map(client => client.id === clientId ? updatedClient : client)
      );
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating notes:', error);
      setError('Failed to update notes');
    }
  };

  const handleSourceUpdate = async (clientId: number, sourceId: number) => {
    try {
      const updatedClient = await clientsApi.update(clientId, { sourceId });
      setClients(prev =>
        prev.map(client => client.id === clientId ? updatedClient : client)
      );
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating source:', error);
      setError('Failed to update source');
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newClient = await clientsApi.create(formData);
      const updatedClients = [...clients, newClient];
      setClients(updatedClients);
      
      // Recalculate stats with new client
      await fetchStats(updatedClients);
      
      setShowAddForm(false);
      resetForm();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error creating client:', error);
      setError('Failed to create client');
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    try {
      const updatedClient = await clientsApi.update(editingClient.id, formData);
      setClients(prev =>
        prev.map(client => client.id === editingClient.id ? updatedClient : client)
      );
      setEditingClient(null);
      resetForm();
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating client:', error);
      setError('Failed to update client');
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client? This action will deactivate the client.')) {
      try {
        await clientsApi.disable(clientId);
        const updatedClients = clients.map(client => 
          client.id === clientId ? { ...client, active: false } : client
        );
        setClients(updatedClients);
        
        // Recalculate stats after deletion
        await fetchStats(updatedClients);
        
        onRefresh?.();
      } catch (error) {
        console.error('Failed to delete client:', error);
        setError('Failed to delete client');
      }
    }
  };

  const handleRestoreClient = async (clientId: number) => {
    try {
      await clientsApi.activate(clientId);
      const updatedClients = clients.map(client => 
        client.id === clientId ? { ...client, active: true } : client
      );
      setClients(updatedClients);
      
      // Recalculate stats after restoration
      await fetchStats(updatedClients);
      
      onRefresh?.();
    } catch (error) {
      console.error('Failed to restore client:', error);
      setError('Failed to restore client');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      notes: '',
      sourceId: 0 // Reset sourceId
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="client-panel-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="client-panel">
        <div className="client-panel-header">
          <div>
            <h2>Client Management</h2>
            <p>Manage your therapy clients and their information</p>
          </div>
          <button 
            className="client-close-button" 
            onClick={onClose}
          >X</button>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="client-stats-section">
            <div className="stat-card">
              <div className="stat-value">{stats.totalClients}</div>
              <div className="stat-label">Total Clients</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.activeClients}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.inactiveClients}</div>
              <div className="stat-label">Inactive</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.newClientsThisMonth}</div>
              <div className="stat-label">New This Month</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="client-controls">
          <div className="controls-left">
            <button 
              className="add-button"
              onClick={() => {
                setShowAddForm(true);
                setEditingClient(null);
                resetForm();
              }}
            >
              + Add New Client
            </button>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="controls-right">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              className="filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy as any);
                setSortOrder(newSortOrder as 'asc' | 'desc');
              }}
              className="sort-select"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="email-asc">Email A-Z</option>
              <option value="email-desc">Email Z-A</option>
              <option value="created-desc">Newest First</option>
              <option value="created-asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="client-form-section">
            <form onSubmit={editingClient ? handleEditClient : handleAddClient} className="client-form">
              <h3>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="form-group">
                  <label>Source</label>
                  <select
                    value={formData.sourceId}
                    onChange={(e) => setFormData(prev => ({ ...prev, sourceId: parseInt(e.target.value, 10) }))}
                    className="form-select"
                  >
                    <option value="0">Select a Source</option>
                    {sources.map(source => (
                      <option key={source.id} value={source.id}>{source.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Client notes, preferences, concerns, etc."
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingClient(null);
                    resetForm();
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="error-close">×</button>
          </div>
        )}

        {/* Clients List */}
        <div className="clients-content">
          {loading ? (
            <div className="loading-spinner">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No Clients Found</h3>
              <p>Start managing your practice by adding your first client.</p>
              <button 
                className="add-button"
                onClick={() => {
                  setShowAddForm(true);
                  setEditingClient(null);
                  resetForm();
                }}
              >
                Add Your First Client
              </button>
            </div>
          ) : (
            <div className="clients-list">
              {filteredClients.map((client) => (
                <div key={client.id} className={`client-card ${client.active === false ? 'disabled-card' : ''}`}>
                  <div className="client-header">
                    <div className="client-info">
                      <input
                        type="text"
                        value={client.fullName}
                        onChange={(e) => handleNameUpdate(client.id, e.target.value)}
                        className="inline-input client-name"
                        disabled={client.active === false}
                        placeholder="Client name"
                      />
                      <div className="client-meta">
                        <span>ID: {client.id}</span>
                        <span>Created: {formatDate(client.createdAt)}</span>
                      </div>
                    </div>
                    <div className="client-actions">
                      {client.active !== false ? (
                        <>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteClient(client.id)}
                            title="Delete client"
                          >
                            🗑️
                          </button>
                        </>
                      ) : (
                        <button
                          className="restore-button"
                          onClick={() => handleRestoreClient(client.id)}
                          title="Restore client"
                        >
                          🔄 Restore
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="client-details">
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <input
                        type="email"
                        value={client.email || ''}
                        onChange={(e) => handleEmailUpdate(client.id, e.target.value)}
                        className="inline-input"
                        disabled={client.active === false}
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <input
                        type="tel"
                        value={client.phone || ''}
                        onChange={(e) => handlePhoneUpdate(client.id, e.target.value)}
                        className="inline-input"
                        disabled={client.active === false}
                        placeholder="Enter phone"
                      />
                    </div>
                    <div className="detail-item">
                      <span className="label">Source:</span>
                      <select
                        value={client.source?.id || 0}
                        onChange={(e) => handleSourceUpdate(client.id, parseInt(e.target.value, 10))}
                        className="inline-select"
                        disabled={client.active === false}
                      >
                        <option value={0}>Select a Source</option>
                        {sources.map(source => (
                          <option key={source.id} value={source.id}>
                            {source.name} - ₪{source.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <button
                        className={`status-toggle ${client.active ? 'active' : 'inactive'}`}
                        onClick={() => handleStatusToggle(client.id, client.active)}
                        disabled={client.active === false}
                      >
                        {client.active ? '✅ Active' : '❌ Inactive'}
                      </button>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="label">Notes:</span>
                    <textarea
                      value={client.notes || ''}
                      onChange={(e) => handleNotesUpdate(client.id, e.target.value)}
                      className="inline-textarea"
                      disabled={client.active === false}
                      placeholder="Add notes..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientPanel; 