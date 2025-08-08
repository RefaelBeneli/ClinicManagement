import React, { useState, useEffect } from 'react';
import { Meeting, MeetingStatus, PaymentType, Client, UpdateMeetingRequest } from '../types';
import { meetings, clients, paymentTypes as paymentTypesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AddSessionModal from './ui/AddSessionModal';
import './SessionPanel.css';

// Helper function to get default payment types
const getDefaultPaymentTypes = (): PaymentType[] => [
  { id: 1, name: 'Bank Transfer', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, name: 'Bit', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, name: 'Paybox', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 4, name: 'Cash', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
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

// Define a type for the session data with editing state
interface EditableSession extends Meeting {
  isEditing: boolean;
  originalData: Meeting; // To revert changes if cancelled
}

const SessionPanel: React.FC<SessionPanelProps> = ({ onClose, onRefresh }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<EditableSession[]>([]); // Use EditableSession
  const [clientList, setClientList] = useState<Client[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SessionStats>({
    sessionsToday: 0,
    unpaidSessions: 0,
    monthlyRevenue: 0,
    totalSessions: 0,
    paidSessions: 0
  });

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Meeting | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'ALL'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Payment type selection
  const [showPaymentTypeSelection, setShowPaymentTypeSelection] = useState(false);
  const [selectedSessionForPayment, setSelectedSessionForPayment] = useState<Meeting | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPaymentTypeSelection) {
          setShowPaymentTypeSelection(false);
          setSelectedSessionForPayment(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, showPaymentTypeSelection]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsData, clientsData] = await Promise.all([
        meetings.getAll(),
        clients.getAll()
      ]);
      
      // Initialize sessions with editing state
      setSessions(sessionsData.map(session => ({
        ...session,
        isEditing: false,
        originalData: { ...session } // Store a copy of original data
      })));
      setClientList(clientsData);
      
      // Load payment types based on user role
      if (user?.role === 'ADMIN') {
        try {
          const paymentTypesData = await paymentTypesApi.getActive();
          setPaymentTypes(paymentTypesData);
        } catch (paymentTypeError: any) {
          console.warn('Failed to load payment types from API:', paymentTypeError);
          setPaymentTypes(getDefaultPaymentTypes());
        }
      } else {
        // Non-admin users get default payment types without API call
        console.log('Using default payment types for non-admin user');
        setPaymentTypes(getDefaultPaymentTypes());
      }
      
      calculateStats(sessionsData);
    } catch (error: any) {
      console.error('Error loading sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sessionsData: Meeting[]) => {
    const today = new Date().toDateString();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const sessionsToday = sessionsData.filter(session => 
      new Date(session.meetingDate).toDateString() === today
    ).length;

    const unpaidSessions = sessionsData.filter(session => !session.isPaid).length;
    const paidSessions = sessionsData.filter(session => session.isPaid).length;

    const monthlyRevenue = sessionsData
      .filter(session => {
        const sessionDate = new Date(session.meetingDate);
        return session.isPaid && 
               sessionDate.getMonth() === currentMonth && 
               sessionDate.getFullYear() === currentYear;
      })
      .reduce((total, session) => total + session.price, 0);

    setStats({
      sessionsToday,
      unpaidSessions,
      monthlyRevenue,
      totalSessions: sessionsData.length,
      paidSessions
    });
  };

  // --- Inline Editing Handlers ---
  const toggleEditing = (sessionId: number) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, isEditing: !session.isEditing } : session
    ));
  };

  const handleFieldChange = (sessionId: number, field: keyof Meeting, value: any) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session, [field]: value } : session
    ));
  };

  const handleSave = async (sessionToSave: EditableSession) => {
    try {
      const updatedFields: UpdateMeetingRequest = {
        clientId: sessionToSave.client.id,
        meetingDate: sessionToSave.meetingDate,
        duration: sessionToSave.duration,
        price: sessionToSave.price,
        status: sessionToSave.status,
        isPaid: sessionToSave.isPaid,
        notes: sessionToSave.notes,
        summary: sessionToSave.summary,
        paymentTypeId: sessionToSave.paymentType?.id || undefined
      };

      const updatedSession = await meetings.update(sessionToSave.id, updatedFields);
      setSessions(prev => prev.map(session => 
        session.id === updatedSession.id ? { ...updatedSession, isEditing: false, originalData: { ...updatedSession } } : session
      ));
      calculateStats(sessions); // Recalculate stats after save
      console.log('✅ Session updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating session:', error);
      setError('Failed to update session');
    }
  };

  const handleCancelEdit = (sessionId: number) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId ? { ...session.originalData, isEditing: false, originalData: session.originalData } : session
    ));
  };

  const handleStatusToggle = async (sessionId: number, currentStatus: MeetingStatus) => {
    let nextStatus: MeetingStatus;
    switch (currentStatus) {
      case MeetingStatus.SCHEDULED:
        nextStatus = MeetingStatus.COMPLETED;
        break;
      case MeetingStatus.COMPLETED:
        nextStatus = MeetingStatus.CANCELLED;
        break;
      case MeetingStatus.CANCELLED:
        nextStatus = MeetingStatus.NO_SHOW;
        break;
      case MeetingStatus.NO_SHOW:
        nextStatus = MeetingStatus.SCHEDULED;
        break;
      default:
        nextStatus = MeetingStatus.SCHEDULED;
    }
    handleFieldChange(sessionId, 'status', nextStatus);
  };

  const handlePaymentStatusToggle = (sessionId: number, currentPaidStatus: boolean) => {
    handleFieldChange(sessionId, 'isPaid', !currentPaidStatus);
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      await meetings.delete(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      calculateStats(sessions.filter(session => session.id !== sessionId));
      console.log('✅ Session deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting session:', error);
      setError('Failed to delete session');
    }
  };

  const handleRestoreSession = async (sessionId: number) => {
    try {
      const updatedSession = await meetings.update(sessionId, {
        status: MeetingStatus.SCHEDULED
      });
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...updatedSession, isEditing: false, originalData: { ...updatedSession } } : session
      ));
      console.log('✅ Session restored successfully');
    } catch (error: any) {
      console.error('❌ Error restoring session:', error);
      setError('Failed to restore session');
    }
  };

  const resetForm = () => {
    setEditingSession(null);
    setError('');
  };

  const startAddSession = () => {
    setEditingSession(null);
    setShowAddModal(true);
  };

  const startEditingModal = (session: Meeting) => {
    setEditingSession(session);
    setShowAddModal(true);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const getStatusColorClass = (status: MeetingStatus) => {
    switch (status) {
      case MeetingStatus.COMPLETED:
        return 'status-badge--success';
      case MeetingStatus.CANCELLED:
        return 'status-badge--danger';
      case MeetingStatus.SCHEDULED:
        return 'status-badge--primary';
      case MeetingStatus.NO_SHOW:
        return 'status-badge--warning';
      default:
        return 'status-badge--secondary';
    }
  };

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(session => {
      const matchesSearch = searchTerm === '' || 
        session.client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (session.notes && session.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (session.summary && session.summary.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || session.status === statusFilter;
      const matchesPayment = paymentFilter === 'ALL' || 
        (paymentFilter === 'PAID' && session.isPaid) ||
        (paymentFilter === 'UNPAID' && !session.isPaid);

      return matchesSearch && matchesStatus && matchesPayment;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.meetingDate).getTime();
          bValue = new Date(b.meetingDate).getTime();
          break;
        case 'client':
          aValue = a.client.fullName.toLowerCase();
          bValue = b.client.fullName.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        default:
          aValue = new Date(a.meetingDate).getTime();
          bValue = new Date(b.meetingDate).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="session-panel-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="session-panel">
        <div className="session-panel-header">
          <div>
            <h2>Sessions Management</h2>
            <p>Manage your client therapy sessions and appointments</p>
          </div>
          <button 
            className="session-close-button" 
            onClick={onClose}
          >X</button>
        </div>
        
        <div className="session-panel-body">
          {/* Stats Overview */}
          <div className="session-stats-section">
            <div className="stat-card">
              <div className="stat-value">{stats.sessionsToday}</div>
              <div className="stat-label">Today's Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(stats.monthlyRevenue)}</div>
              <div className="stat-label">Monthly Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.unpaidSessions}</div>
              <div className="stat-label">Unpaid Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message enhanced">
              {error}
              <button onClick={() => setError(null)} className="error-close">×</button>
            </div>
          )}

          {/* Controls */}
          <div className="session-controls">
            <div className="controls-left">
              <button 
                className="add-button"
                onClick={startAddSession}
              >
                ➕ Add New Session
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
                  onClick={startAddSession}
                >
                  Add Your First Session
                </button>
              </div>
            ) : (
              <div className="sessions-list">
                {filteredSessions.map(session => (
                  <div key={session.id} className={`session-card ${session.status === MeetingStatus.CANCELLED || session.status === MeetingStatus.NO_SHOW ? 'disabled-card' : ''}`}>
                    <div className="session-header">
                      <div className="session-info">
                        {session.isEditing ? (
                          <select
                            className="inline-select client-name-select"
                            value={session.client.id}
                            onChange={(e) => handleFieldChange(session.id, 'client', { ...session.client, id: parseInt(e.target.value) })}
                          >
                            {clientList.map(client => (
                              <option key={client.id} value={client.id}>{client.fullName}</option>
                            ))}
                          </select>
                        ) : (
                          <h4 className="session-client-name">{session.client.fullName}</h4>
                        )}
                        <div className="session-meta">
                          <span>ID: {session.id}</span>
                          <span>Created: {formatDate(session.createdAt)}</span>
                        </div>
                      </div>
                      <div className="session-actions">
                        {session.isEditing ? (
                          <>
                            <button 
                              className="save-button"
                              onClick={() => handleSave(session)}
                              title="Save changes"
                            >
                              💾 Save
                            </button>
                            <button 
                              className="cancel-button"
                              onClick={() => handleCancelEdit(session.id)}
                              title="Cancel editing"
                            >
                              ❌ Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="edit-button"
                              onClick={() => toggleEditing(session.id)}
                              title="Edit session"
                            >
                              ✏️ Edit
                            </button>
                            {session.status === MeetingStatus.CANCELLED || session.status === MeetingStatus.NO_SHOW ? (
                              <button 
                                className="restore-button"
                                onClick={() => handleRestoreSession(session.id)}
                                title="Restore session"
                              >
                                🔄 Restore
                              </button>
                            ) : (
                              <button 
                                className="delete-button"
                                onClick={() => handleDeleteSession(session.id)}
                                title="Delete session"
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="session-details">
                      <div className="detail-item">
                        <span className="label">Date:</span>
                        {session.isEditing ? (
                          <input
                            type="datetime-local"
                            className="inline-input"
                            value={session.meetingDate.substring(0, 16)}
                            onChange={(e) => handleFieldChange(session.id, 'meetingDate', e.target.value)}
                          />
                        ) : (
                          <span className="detail-value">{formatDateTime(session.meetingDate)}</span>
                        )}
                      </div>
                      <div className="detail-item">
                        <span className="label">Duration:</span>
                        {session.isEditing ? (
                          <input
                            type="number"
                            className="inline-input"
                            value={session.duration}
                            onChange={(e) => handleFieldChange(session.id, 'duration', parseInt(e.target.value))}
                          />
                        ) : (
                          <span className="detail-value">{session.duration} minutes</span>
                        )}
                      </div>
                      <div className="detail-item">
                        <span className="label">Price:</span>
                        {session.isEditing ? (
                          <input
                            type="number"
                            className="inline-input"
                            value={session.price}
                            onChange={(e) => handleFieldChange(session.id, 'price', parseFloat(e.target.value))}
                          />
                        ) : (
                          <span className="detail-value">{formatCurrency(session.price)}</span>
                        )}
                      </div>
                      <div className="detail-item">
                        <span className="label">Status:</span>
                        {session.isEditing ? (
                          <select
                            className="inline-select"
                            value={session.status}
                            onChange={(e) => handleFieldChange(session.id, 'status', e.target.value as MeetingStatus)}
                          >
                            {Object.values(MeetingStatus).map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        ) : (
                          <button 
                            className={`status-toggle ${getStatusColorClass(session.status)}`}
                            onClick={() => handleStatusToggle(session.id, session.status)}
                            disabled={session.status === MeetingStatus.CANCELLED || session.status === MeetingStatus.NO_SHOW}
                          >
                            {session.status}
                          </button>
                        )}
                      </div>
                      <div className="detail-item">
                        <span className="label">Payment:</span>
                        {session.isEditing ? (
                          <button 
                            className={`status-toggle ${session.isPaid ? 'active' : 'inactive'}`}
                            onClick={() => handlePaymentStatusToggle(session.id, session.isPaid)}
                          >
                            {session.isPaid ? 'Paid' : 'Unpaid'}
                          </button>
                        ) : (
                          <span className={`status-badge ${session.isPaid ? 'enabled' : 'disabled'}`}>
                            {session.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="label">Notes:</span>
                      {session.isEditing ? (
                        <textarea
                          className="inline-textarea"
                          placeholder="Add notes..."
                          rows={2}
                          value={session.notes || ''}
                          onChange={(e) => handleFieldChange(session.id, 'notes', e.target.value)}
                        />
                      ) : (
                        <span className="detail-value notes-content">{session.notes || 'No notes'}</span>
                      )}
                    </div>

                    <div className="detail-item">
                      <span className="label">Summary:</span>
                      {session.isEditing ? (
                        <textarea
                          className="inline-textarea"
                          placeholder="Add summary..."
                          rows={2}
                          value={session.summary || ''}
                          onChange={(e) => handleFieldChange(session.id, 'summary', e.target.value)}
                        />
                      ) : (
                        <span className="detail-value summary-content">{session.summary || 'No summary'}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Session Modal */}
        <AddSessionModal
          session={editingSession}
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingSession(null);
          }}
          onSuccess={() => {
            loadData();
            onRefresh?.();
          }}
        />
      </div>
    </div>
  );
};

export default SessionPanel; 