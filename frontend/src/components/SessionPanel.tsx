import React, { useState, useEffect, useCallback } from 'react';
import { Meeting, MeetingStatus, MeetingRequest, UpdateMeetingRequest, Client } from '../types';
import { meetings as meetingsApi, clients as clientsApi } from '../services/api';
import './SessionPanel.css';

interface SessionPanelProps {
  onClose: () => void;
  onRefresh?: () => void;
}

interface SessionStats {
  sessionsToday: number;
  unpaidSessions: number;
  monthlyRevenue: number;
  totalSessions: number;
  paidSessions: number;
}

const SessionPanel: React.FC<SessionPanelProps> = ({ onClose, onRefresh }) => {
  const [sessions, setSessions] = useState<Meeting[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Meeting[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'ALL'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'status' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Form states for adding new sessions
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<MeetingRequest>({
    clientId: 0,
    meetingDate: '',
    duration: 60,
    price: 0,
    notes: '',
    summary: ''
  });

  // Stats state
  const [stats, setStats] = useState<SessionStats | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchClients();
    fetchStats();
  }, []);

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

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const sessionData = await meetingsApi.getAll();
      setSessions(sessionData);
      setError('');
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const clientsData = await clientsApi.getAll();
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await meetingsApi.getDashboardStats();
      setStats({
        sessionsToday: statsData.meetingsToday,
        unpaidSessions: statsData.unpaidSessions,
        monthlyRevenue: statsData.monthlyRevenue,
        totalSessions: sessions.length,
        paidSessions: sessions.filter(s => s.isPaid).length
      });
    } catch (error) {
      console.warn('Failed to fetch session stats:', error);
    }
  };

  const filterAndSortSessions = useCallback(() => {
    let filtered = [...sessions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(session => session.status === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== 'ALL') {
      filtered = filtered.filter(session => 
        paymentFilter === 'PAID' ? session.isPaid : !session.isPaid
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime();
          break;
        case 'client':
          comparison = a.client.fullName.localeCompare(b.client.fullName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredSessions(filtered);
  }, [sessions, searchTerm, statusFilter, paymentFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortSessions();
  }, [filterAndSortSessions]);

  const handleStatusUpdate = async (sessionId: number, newStatus: MeetingStatus) => {
    try {
      const updateData: UpdateMeetingRequest = { status: newStatus };
      await meetingsApi.update(sessionId, updateData);
      
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId
            ? { ...session, status: newStatus }
            : session
        )
      );
      
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating session status:', error);
      setError('Failed to update session status');
    }
  };

  const handlePaymentToggle = async (sessionId: number, currentPaidStatus: boolean) => {
    try {
      const updatedSession = await meetingsApi.updatePayment(sessionId, !currentPaidStatus);
      
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      );
      
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      setError('Failed to update payment status');
    }
  };

  const handleClientUpdate = async (sessionId: number, clientId: number) => {
    try {
      await meetingsApi.update(sessionId, { clientId });
      await fetchSessions();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating client:', error);
      setError('Failed to update client');
    }
  };

  const handleDateUpdate = async (sessionId: number, meetingDate: string) => {
    try {
      await meetingsApi.update(sessionId, { meetingDate });
      await fetchSessions();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating session date:', error);
      setError('Failed to update session date');
    }
  };

  const handleDurationUpdate = async (sessionId: number, duration: number) => {
    try {
      await meetingsApi.update(sessionId, { duration });
      await fetchSessions();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating duration:', error);
      setError('Failed to update duration');
    }
  };

  const handlePriceUpdate = async (sessionId: number, price: number) => {
    try {
      await meetingsApi.update(sessionId, { price });
      await fetchSessions();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating price:', error);
      setError('Failed to update price');
    }
  };

  const handleNotesUpdate = async (sessionId: number, notes: string) => {
    try {
      await meetingsApi.update(sessionId, { notes });
      await fetchSessions();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating notes:', error);
      setError('Failed to update notes');
    }
  };

  const handleSummaryUpdate = async (sessionId: number, summary: string) => {
    try {
      await meetingsApi.update(sessionId, { summary });
      await fetchSessions();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating summary:', error);
      setError('Failed to update summary');
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSession = await meetingsApi.create(formData);
      setSessions(prev => [...prev, newSession]);
      setShowAddForm(false);
      resetForm();
      await fetchStats();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error creating session:', error);
      setError('Failed to create session');
    }
  };



  const handleDeleteSession = async (sessionId: number) => {
    if (window.confirm('Are you sure you want to delete this session? This action will deactivate the session.')) {
      try {
        await meetingsApi.disable(sessionId);
        console.log('✅ Session deleted successfully');
        setSessions(prev => prev.map(session => 
          session.id === sessionId ? { ...session, active: false } : session
        ));
        await fetchSessions();
        await fetchStats();
        onRefresh?.();
      } catch (error) {
        console.error('❌ Failed to delete session:', error);
        setError('Failed to delete session');
      }
    }
  };

  const handleRestoreSession = async (sessionId: number) => {
    try {
      await meetingsApi.activate(sessionId);
      console.log('✅ Session restored successfully');
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, active: true } : session
      ));
      await fetchSessions();
      await fetchStats();
      onRefresh?.();
    } catch (error) {
      console.error('❌ Failed to restore session:', error);
      setError('Failed to restore session');
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: 0,
      meetingDate: '',
      duration: 60,
      price: 0,
      notes: '',
      summary: ''
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case MeetingStatus.SCHEDULED: return '#3498db';
      case MeetingStatus.COMPLETED: return '#2ecc71';
      case MeetingStatus.CANCELLED: return '#e74c3c';
      case MeetingStatus.NO_SHOW: return '#f39c12';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="session-panel-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="session-panel">
        <div className="session-panel-header">
          <div>
            <h2>Client Session Management</h2>
            <p>Manage your therapy sessions with clients</p>
          </div>
          <button 
            className="session-close-button" 
            onClick={onClose}
          >X</button>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="session-stats-section">
            <div className="stat-card">
              <div className="stat-value">{stats.totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.sessionsToday}</div>
              <div className="stat-label">Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.unpaidSessions}</div>
              <div className="stat-label">Unpaid</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(stats.monthlyRevenue)}</div>
              <div className="stat-label">This Month</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="session-controls">
          <div className="controls-left">
            <button 
              className="add-button"
              onClick={() => {
                setShowAddForm(true);
                resetForm();
              }}
            >
              + Add New Session
            </button>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search client or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="controls-right">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MeetingStatus | 'ALL')}
              className="filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'ALL' | 'PAID' | 'UNPAID')}
              className="filter-select"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
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
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="client-asc">Client A-Z</option>
              <option value="client-desc">Client Z-A</option>
              <option value="price-desc">Highest Price</option>
              <option value="price-asc">Lowest Price</option>
            </select>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="session-form-section">
            <form onSubmit={handleAddSession} className="session-form">
              <h3>Add New Session</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Client *</label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: parseInt(e.target.value) }))}
                  >
                    <option value={0}>Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.fullName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.meetingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                  />
                </div>
                
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="120.00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Session goals, topics to discuss, etc."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Session Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Detailed summary of the session (can be added after the meeting)"
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">
                  Add Session
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
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

        {/* Sessions List */}
        <div className="sessions-content">
          {loading ? (
            <div className="loading-spinner">Loading sessions...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No Sessions Found</h3>
              <p>Start managing your practice by adding your first client session.</p>
              <button 
                className="add-button"
                onClick={() => {
                  setShowAddForm(true);
                  resetForm();
                }}
              >
                Add Your First Session
              </button>
            </div>
          ) : (
            <div className="sessions-list">
              {filteredSessions.map((session) => (
                <div key={session.id} className={`session-card ${session.active === false ? 'disabled-card' : ''}`}>
                  <div className="session-header">
                    <div className="session-client">
                      <select
                        value={session.client.id}
                        onChange={(e) => handleClientUpdate(session.id, parseInt(e.target.value))}
                        className="inline-select"
                        disabled={session.active === false}
                      >
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.fullName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="datetime-local"
                        value={session.meetingDate.split('T')[0] + 'T' + session.meetingDate.split('T')[1]?.substring(0, 5) || ''}
                        onChange={(e) => handleDateUpdate(session.id, e.target.value)}
                        className="inline-input"
                        disabled={session.active === false}
                      />
                    </div>
                    <div className="session-actions">
                      {session.active !== false ? (
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteSession(session.id)}
                          title="Delete session"
                        >
                          🗑️
                        </button>
                      ) : (
                        <button
                          className="restore-button"
                          onClick={() => handleRestoreSession(session.id)}
                          title="Restore session"
                        >
                          🔄 Restore
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="session-details">
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <input
                        type="number"
                        min="15"
                        max="300"
                        value={session.duration}
                        onChange={(e) => handleDurationUpdate(session.id, parseInt(e.target.value) || 60)}
                        className="inline-input"
                        disabled={session.active === false}
                      />
                      <span>min</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Price:</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={session.price}
                        onChange={(e) => handlePriceUpdate(session.id, parseFloat(e.target.value) || 0)}
                        className="inline-input"
                        disabled={session.active === false}
                      />
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <select
                        value={session.status}
                        onChange={(e) => handleStatusUpdate(session.id, e.target.value as MeetingStatus)}
                        className="status-select"
                        style={{ color: getStatusColor(session.status) }}
                        disabled={session.active === false}
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="NO_SHOW">No Show</option>
                      </select>
                    </div>
                    <div className="detail-item">
                      <span className="label">Payment:</span>
                      <button
                        className={`payment-toggle ${session.isPaid ? 'paid' : 'unpaid'}`}
                        onClick={() => handlePaymentToggle(session.id, session.isPaid)}
                        disabled={session.active === false}
                      >
                        {session.isPaid ? '✅ Paid' : '❌ Unpaid'}
                      </button>
                    </div>
                  </div>

                  <div className="detail-item">
                    <span className="label">Notes:</span>
                    <textarea
                      value={session.notes || ''}
                      onChange={(e) => handleNotesUpdate(session.id, e.target.value)}
                      className="inline-textarea"
                      disabled={session.active === false}
                      placeholder="Add notes..."
                      rows={2}
                    />
                  </div>

                  <div className="detail-item">
                    <span className="label">Summary:</span>
                    <textarea
                      value={session.summary || ''}
                      onChange={(e) => handleSummaryUpdate(session.id, e.target.value)}
                      className="inline-textarea"
                      disabled={session.active === false}
                      placeholder="Add session summary..."
                      rows={3}
                    />
                  </div>

                  {session.isPaid && session.paymentDate && (
                    <div className="payment-date">
                      <small>Paid on: {formatDateTime(session.paymentDate)}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionPanel; 