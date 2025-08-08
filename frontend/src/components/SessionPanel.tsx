import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Meeting, 
  MeetingRequest, 
  UpdateMeetingRequest,
  Client, 
  PaymentType, 
  MeetingStatus 
} from '../types';
import { meetings as meetingsApi, clients as clientsApi, paymentTypes as paymentTypesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './SessionPanel.css';

// Helper function to get default payment types
const getDefaultPaymentTypes = (): PaymentType[] => [
  { id: 1, name: 'Cash', isActive: true, createdAt: '', updatedAt: '' },
  { id: 2, name: 'Credit Card', isActive: true, createdAt: '', updatedAt: '' },
  { id: 3, name: 'Bank Transfer', isActive: true, createdAt: '', updatedAt: '' },
  { id: 4, name: 'Check', isActive: true, createdAt: '', updatedAt: '' }
];

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
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Meeting[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MeetingStatus>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'status' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState<MeetingRequest>({
    clientId: 0,
    meetingDate: '',
    duration: 60,
    price: 0,
    notes: '',
    summary: ''
  });

  // Data states
  const [clients, setClients] = useState<Client[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);

  // Payment type selection state
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
  const [sessionToPay, setSessionToPay] = useState<Meeting | null>(null);
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<number>(0);

  // Ref to prevent double fetching
  const hasInitialized = useRef(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const sessionData = await meetingsApi.getAll();
      setSessions(sessionData);
      setError('');
      
      // Calculate stats after sessions are loaded
      await fetchStats(sessionData);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const clientData = await clientsApi.getAll();
      setClients(clientData);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, []);

  const fetchPaymentTypes = useCallback(async () => {
    if (user?.role === 'ADMIN') {
      try {
        const paymentTypeData = await paymentTypesApi.getActive();
        setPaymentTypes(paymentTypeData);
      } catch (error) {
        console.warn('Failed to load payment types from API:', error);
        setPaymentTypes(getDefaultPaymentTypes());
      }
    } else {
      // Non-admin users get default payment types without API call
      console.log('Using default payment types for non-admin user');
      setPaymentTypes(getDefaultPaymentTypes());
    }
  }, [user?.role]);

  const fetchStats = useCallback(async (sessionData?: Meeting[]) => {
    try {
      const statsData = await meetingsApi.getDashboardStats();
      const sessionsToUse = sessionData || sessions;
      
      setStats({
        sessionsToday: statsData.meetingsToday,
        unpaidSessions: statsData.unpaidSessions,
        monthlyRevenue: statsData.monthlyRevenue,
        totalSessions: sessionsToUse.length,
        paidSessions: sessionsToUse.filter(s => s.isPaid).length
      });
    } catch (error) {
      console.warn('Failed to fetch session stats:', error);
    }
  }, [sessions]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchSessions();
      fetchClients();
      fetchPaymentTypes();
      // fetchStats(); // This will be called after sessions are fetched
    }
  }, [fetchSessions, fetchClients, fetchPaymentTypes]);

  // Debug modal state
  useEffect(() => {
    console.log('🔍 Modal state changed:', { 
      showPaymentTypeModal, 
      sessionToPay: sessionToPay?.id, 
      paymentTypesCount: paymentTypes.length 
    });
  }, [showPaymentTypeModal, sessionToPay, paymentTypes.length]);

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

  const filterAndSortSessions = useCallback(() => {
    let filtered = [...sessions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.client?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.summary?.toLowerCase().includes(searchTerm.toLowerCase())
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
          comparison = (a.client?.fullName || '').localeCompare(b.client?.fullName || '');
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
      
      const updatedSessions = sessions.map(session =>
        session.id === sessionId
          ? { ...session, status: newStatus }
          : session
      );
      
      setSessions(updatedSessions);
      
      // Recalculate stats with updated session data
      await fetchStats(updatedSessions);
    } catch (error: any) {
      console.error('Error updating session status:', error);
      setError('Failed to update session status');
    }
  };

  const handlePaymentToggle = async (sessionId: number, currentPaidStatus: boolean) => {
    console.log('🔍 Payment toggle clicked:', { sessionId, currentPaidStatus });
    
    if (!currentPaidStatus) {
      // Marking as paid - show payment type selection
      console.log('💰 Marking as paid - showing payment type modal');
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        console.log('✅ Session found:', session.client.fullName);
        setSessionToPay(session);
        setSelectedPaymentTypeId(0);
        setShowPaymentTypeModal(true);
      }
    } else {
      // Marking as unpaid
      try {
        const updateData: UpdateMeetingRequest = { 
          isPaid: false,
          paymentDate: undefined,
          paymentTypeId: undefined
        };
        await meetingsApi.update(sessionId, updateData);
        
        const updatedSessions = sessions.map(session =>
          session.id === sessionId
            ? { ...session, isPaid: false, paymentDate: undefined, paymentType: undefined }
            : session
        );
        
        setSessions(updatedSessions);
        
        // Recalculate stats with updated session data
        await fetchStats(updatedSessions);
        
        onRefresh?.();
      } catch (error: any) {
        console.error('Error updating session payment status:', error);
        setError('Failed to update session payment status');
      }
    }
  };

  const handleClientUpdate = async (sessionId: number, clientId: number) => {
    try {
      const updatedSession = await meetingsApi.update(sessionId, { clientId });
      
      // Update the session locally instead of fetching all sessions
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      );
      
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating client:', error);
      setError('Failed to update client');
    }
  };

  const handleDateUpdate = async (sessionId: number, meetingDate: string) => {
    try {
      const updatedSession = await meetingsApi.update(sessionId, { meetingDate });
      
      // Update the session locally instead of fetching all sessions
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      );
      
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating session date:', error);
      setError('Failed to update session date');
    }
  };

  const handleDurationUpdate = async (sessionId: number, duration: number) => {
    try {
      const updatedSession = await meetingsApi.update(sessionId, { duration });
      
      // Update the session locally instead of fetching all sessions
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      );
      
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating duration:', error);
      setError('Failed to update duration');
    }
  };

  const handlePriceUpdate = async (sessionId: number, price: number) => {
    try {
      const updatedSession = await meetingsApi.update(sessionId, { price });
      
      // Update the session locally instead of fetching all sessions
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      );
      
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating price:', error);
      setError('Failed to update price');
    }
  };

  const handleNotesUpdate = async (sessionId: number, notes: string) => {
    try {
      const updatedSession = await meetingsApi.update(sessionId, { notes });
      
      // Update the session locally instead of fetching all sessions
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      );
      
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating notes:', error);
      setError('Failed to update notes');
    }
  };

  const handleSummaryUpdate = async (sessionId: number, summary: string) => {
    try {
      const updatedSession = await meetingsApi.update(sessionId, { summary });
      
      // Update the session locally instead of fetching all sessions
      setSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      );
      
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
      const updatedSessions = [...sessions, newSession];
      setSessions(updatedSessions);
      
      // Recalculate stats with new session
      await fetchStats(updatedSessions);
      
      setShowAddForm(false);
      resetForm();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error creating session:', error);
      setError('Failed to create session');
    }
  };

  const handleEditSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    try {
      const updatedSession = await meetingsApi.update(editingSession.id, formData);
      setSessions(prev =>
        prev.map(session => session.id === editingSession.id ? updatedSession : session)
      );
      setEditingSession(null);
      resetForm();
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating session:', error);
      setError('Failed to update session');
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        await meetingsApi.disable(sessionId);
        const updatedSessions = sessions.map(session => 
          session.id === sessionId ? { ...session, active: false } : session
        );
        setSessions(updatedSessions);
        
        // Recalculate stats after deletion
        await fetchStats(updatedSessions);
        
        onRefresh?.();
      } catch (error) {
        console.error('Failed to delete session:', error);
        setError('Failed to delete session');
      }
    }
  };

  const handleRestoreSession = async (sessionId: number) => {
    try {
      await meetingsApi.activate(sessionId);
      const updatedSessions = sessions.map(session => 
        session.id === sessionId ? { ...session, active: true } : session
      );
      setSessions(updatedSessions);
      
      // Recalculate stats after restoration
      await fetchStats(updatedSessions);
      
      onRefresh?.();
    } catch (error) {
      console.error('Failed to restore session:', error);
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

  const startEditing = (session: Meeting) => {
    setEditingSession(session);
    setFormData({
      clientId: session.client?.id || 0,
      meetingDate: session.meetingDate.split('T')[0] + 'T' + session.meetingDate.split('T')[1]?.substring(0, 5) || '',
      duration: session.duration,
      price: session.price,
      notes: session.notes || '',
      summary: session.summary || ''
    });
    setShowAddForm(true);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
      case 'COMPLETED': return '#28a745';
      case 'CANCELLED': return '#dc3545';
      case 'NO_SHOW': return '#ffc107';
      default: return '#007bff';
    }
  };

  const handlePaymentTypeSelection = async () => {
    console.log('🔍 Payment type selection confirmed:', { sessionToPay: sessionToPay?.id, selectedPaymentTypeId });
    
    if (!sessionToPay) {
      console.error('❌ No session to pay');
      return;
    }

    try {
      // Update the meeting with payment type and mark as paid
      const updateData: UpdateMeetingRequest = {
        isPaid: true,
        paymentTypeId: selectedPaymentTypeId === 0 ? undefined : selectedPaymentTypeId
      };

      console.log('📤 Sending update data:', updateData);
      const updatedSession = await meetingsApi.update(sessionToPay.id, updateData);
      console.log('✅ Session updated successfully:', updatedSession);
      
      const updatedSessions = sessions.map(session =>
        session.id === sessionToPay.id ? updatedSession : session
      );
      
      setSessions(updatedSessions);
      
      // Recalculate stats with updated session data
      await fetchStats(updatedSessions);
      
      // Close modal and reset state
      setShowPaymentTypeModal(false);
      setSessionToPay(null);
      setSelectedPaymentTypeId(0);
    } catch (error: any) {
      console.error('❌ Error updating payment with type:', error);
      setError('Failed to update payment with type');
    }
  };

  const handleCancelPaymentTypeSelection = () => {
    setShowPaymentTypeModal(false);
    setSessionToPay(null);
    setSelectedPaymentTypeId(0);
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
                setEditingSession(null);
                resetForm();
              }}
            >
              + Add New Session
            </button>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search client, notes, or summary..."
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
            <form onSubmit={editingSession ? handleEditSession : handleAddSession} className="session-form">
              <h3>{editingSession ? 'Edit Session' : 'Add New Session'}</h3>
              
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.meetingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingDate: e.target.value }))}
                  />
                </div>
                
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
              </div>

              <div className="form-row">
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
                  {editingSession ? 'Update Session' : 'Add Session'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSession(null);
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
                  setEditingSession(null);
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
                    <div className="session-info">
                      <select
                        value={session.client?.id || 0}
                        onChange={(e) => handleClientUpdate(session.id, parseInt(e.target.value))}
                        className="inline-input session-client-name"
                        disabled={session.active === false}
                      >
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.fullName}
                          </option>
                        ))}
                      </select>
                      <div className="session-meta">
                        <span>Source: {session.client?.source?.name || 'No source'}</span>
                      </div>
                    </div>
                    <div className="session-actions">
                      {session.active !== false ? (
                        <>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteSession(session.id)}
                            title="Delete session"
                          >
                            🗑️
                          </button>
                        </>
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
                    <div className="detail-item">
                      <span className="label">Date:</span>
                      <input
                        type="datetime-local"
                        value={session.meetingDate.split('T')[0] + 'T' + session.meetingDate.split('T')[1]?.substring(0, 5) || ''}
                        onChange={(e) => handleDateUpdate(session.id, e.target.value)}
                        className="inline-input"
                        disabled={session.active === false}
                      />
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

                  {/* Enhanced Payment Type Display - More Prominent */}
                  {session.isPaid && (
                    <div className="payment-date-section enhanced">
                      <div className="payment-date-header">
                        <span className="payment-date-label">💰 Payment Type:</span>
                        <span className="payment-date-value">
                          {session.paymentType ? session.paymentType.name : 'No payment type recorded'}
                        </span>
                      </div>
                      {session.paymentDate && (
                        <div className="payment-date-details">
                          <small>Payment processed on {formatDate(session.paymentDate)}</small>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Type Selection Modal */}
      {showPaymentTypeModal && sessionToPay && (
        <div className="modal-overlay" onClick={handleCancelPaymentTypeSelection}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Payment Type</h3>
              <button 
                className="modal-close-button" 
                onClick={handleCancelPaymentTypeSelection}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Please select a payment type for the session with <strong>{sessionToPay.client.fullName}</strong>:</p>
              <div className="payment-type-selection">
                <select
                  value={selectedPaymentTypeId}
                  onChange={(e) => setSelectedPaymentTypeId(parseInt(e.target.value) || 0)}
                  className="payment-type-select"
                >
                  <option value={0}>Select Payment Type</option>
                  {paymentTypes.map(paymentType => (
                    <option key={paymentType.id} value={paymentType.id}>
                      {paymentType.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={handleCancelPaymentTypeSelection}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handlePaymentTypeSelection}
                  disabled={selectedPaymentTypeId === 0}
                >
                  Mark as Paid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionPanel; 