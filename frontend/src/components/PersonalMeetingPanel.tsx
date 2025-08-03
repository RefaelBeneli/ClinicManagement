import React, { useState, useEffect, useCallback } from 'react';
import { PersonalMeeting, PersonalMeetingStatus, PersonalMeetingType, PersonalMeetingRequest, UpdatePersonalMeetingRequest } from '../types';
import { personalMeetings as personalMeetingsApi } from '../services/api';
import './PersonalMeetingPanel.css';

interface PersonalMeetingPanelProps {
  onClose: () => void;
  onRefresh?: () => void;
}

interface PersonalMeetingStats {
  personalMeetingsToday: number;
  unpaidPersonalSessions: number;
  monthlyPersonalSpent: number;
  totalPersonalSessions: number;
  paidPersonalSessions: number;
}

const PersonalMeetingPanel: React.FC<PersonalMeetingPanelProps> = ({ onClose, onRefresh }) => {
  const [personalMeetings, setPersonalMeetings] = useState<PersonalMeeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<PersonalMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PersonalMeetingStatus | 'ALL'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'therapist' | 'status' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<PersonalMeeting | null>(null);
  const [formData, setFormData] = useState<PersonalMeetingRequest>({
    therapistName: '',
    meetingType: PersonalMeetingType.PERSONAL_THERAPY,
    providerType: 'Therapist',
    providerCredentials: '',
    meetingDate: '',
    duration: 60,
    price: 0,
    notes: '',
    isRecurring: false,
    recurrenceFrequency: '',
    nextDueDate: ''
  });

  // Stats state
  const [stats, setStats] = useState<PersonalMeetingStats | null>(null);

  useEffect(() => {
    fetchPersonalMeetings();
    fetchStats();
  }, []);

  const fetchPersonalMeetings = async () => {
    try {
      setLoading(true);
      const meetingData = await personalMeetingsApi.getAll();
      setPersonalMeetings(meetingData);
      setError('');
    } catch (error: any) {
      console.error('Error fetching personal meetings:', error);
      setError('Failed to load personal meetings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await personalMeetingsApi.getStats();
      setStats(statsData);
    } catch (error) {
      console.warn('Failed to fetch personal meeting stats:', error);
    }
  };

  const filterAndSortMeetings = useCallback(() => {
    let filtered = [...personalMeetings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(meeting =>
        meeting.therapistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(meeting => meeting.status === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== 'ALL') {
      filtered = filtered.filter(meeting => 
        paymentFilter === 'PAID' ? meeting.isPaid : !meeting.isPaid
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime();
          break;
        case 'therapist':
          comparison = a.therapistName.localeCompare(b.therapistName);
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

    setFilteredMeetings(filtered);
  }, [personalMeetings, searchTerm, statusFilter, paymentFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortMeetings();
  }, [filterAndSortMeetings]);

  const handleStatusUpdate = async (meetingId: number, newStatus: PersonalMeetingStatus) => {
    try {
      const updateData: UpdatePersonalMeetingRequest = { status: newStatus };
      await personalMeetingsApi.update(meetingId, updateData);
      
      setPersonalMeetings(prevMeetings =>
        prevMeetings.map(meeting =>
          meeting.id === meetingId
            ? { ...meeting, status: newStatus }
            : meeting
        )
      );
      
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating meeting status:', error);
      setError('Failed to update meeting status');
    }
  };

  const handlePaymentToggle = async (meetingId: number, currentPaidStatus: boolean) => {
    try {
      const updatedMeeting = await personalMeetingsApi.updatePayment(meetingId, !currentPaidStatus);
      
      setPersonalMeetings(prevMeetings =>
        prevMeetings.map(meeting =>
          meeting.id === meetingId ? updatedMeeting : meeting
        )
      );
      
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      setError('Failed to update payment status');
    }
  };

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMeeting = await personalMeetingsApi.create(formData);
      setPersonalMeetings(prev => [...prev, newMeeting]);
      setShowAddForm(false);
      resetForm();
      await fetchStats();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error creating personal meeting:', error);
      setError('Failed to create personal meeting');
    }
  };

  const handleEditMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;

    try {
      const updateData: UpdatePersonalMeetingRequest = {
        therapistName: formData.therapistName,
        meetingDate: formData.meetingDate,
        duration: formData.duration,
        price: formData.price,
        notes: formData.notes
      };
      const updatedMeeting = await personalMeetingsApi.update(editingMeeting.id, updateData);
      setPersonalMeetings(prev =>
        prev.map(meeting => meeting.id === editingMeeting.id ? updatedMeeting : meeting)
      );
      setEditingMeeting(null);
      resetForm();
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating personal meeting:', error);
      setError('Failed to update personal meeting');
    }
  };

  const handleDeleteMeeting = async (meetingId: number) => {
    if (!window.confirm('Are you sure you want to delete this personal meeting?')) return;

    try {
      await personalMeetingsApi.delete(meetingId);
      setPersonalMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
      await fetchStats();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error deleting personal meeting:', error);
      setError('Failed to delete personal meeting');
    }
  };

  const resetForm = () => {
    setFormData({
      therapistName: '',
      meetingDate: '',
      duration: 60,
      price: 0,
      notes: ''
    });
  };

  const startEditing = (meeting: PersonalMeeting) => {
    setEditingMeeting(meeting);
    setFormData({
      therapistName: meeting.therapistName,
      meetingDate: meeting.meetingDate.split('T')[0] + 'T' + meeting.meetingDate.split('T')[1]?.substring(0, 5) || '',
      duration: meeting.duration,
      price: meeting.price,
      notes: meeting.notes || ''
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: PersonalMeetingStatus) => {
    switch (status) {
      case PersonalMeetingStatus.SCHEDULED: return '#3498db';
      case PersonalMeetingStatus.COMPLETED: return '#2ecc71';
      case PersonalMeetingStatus.CANCELLED: return '#e74c3c';
      case PersonalMeetingStatus.NO_SHOW: return '#f39c12';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="personal-meeting-panel-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="personal-meeting-panel">
        <div className="personal-meeting-panel-header">
          <div>
            <h2>My Personal Therapy Sessions</h2>
            <p>Manage your own therapy and wellness appointments</p>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="personal-stats-section">
            <div className="stat-card">
              <div className="stat-value">{stats.totalPersonalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.personalMeetingsToday}</div>
              <div className="stat-label">Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.unpaidPersonalSessions}</div>
              <div className="stat-label">Unpaid</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(stats.monthlyPersonalSpent)}</div>
              <div className="stat-label">This Month</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="personal-meeting-controls">
          <div className="controls-left">
            <button 
              className="add-button"
              onClick={() => {
                setShowAddForm(true);
                setEditingMeeting(null);
                resetForm();
              }}
            >
              + Add Personal Session
            </button>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search therapist or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="controls-right">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PersonalMeetingStatus | 'ALL')}
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
              <option value="therapist-asc">Therapist A-Z</option>
              <option value="therapist-desc">Therapist Z-A</option>
              <option value="price-desc">Highest Price</option>
              <option value="price-asc">Lowest Price</option>
            </select>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="personal-meeting-form-section">
            <form onSubmit={editingMeeting ? handleEditMeeting : handleAddMeeting} className="personal-meeting-form">
              <h3>{editingMeeting ? 'Edit Personal Session' : 'Add New Personal Session'}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Therapist/Guide Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.therapistName}
                    onChange={(e) => setFormData(prev => ({ ...prev, therapistName: e.target.value }))}
                    placeholder="Dr. Jane Smith"
                  />
                </div>
                
                <div className="form-group">
                  <label>Provider Type *</label>
                  <select
                    required
                    value={formData.providerType}
                    onChange={(e) => setFormData(prev => ({ ...prev, providerType: e.target.value }))}
                  >
                    <option value="Therapist">Therapist</option>
                    <option value="Guide">Guide</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Teacher">Teacher</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Session Type *</label>
                  <select
                    required
                    value={formData.meetingType}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingType: e.target.value as PersonalMeetingType }))}
                  >
                    <option value={PersonalMeetingType.PERSONAL_THERAPY}>Personal Therapy</option>
                    <option value={PersonalMeetingType.PROFESSIONAL_DEVELOPMENT}>Professional Development</option>
                    <option value={PersonalMeetingType.SUPERVISION}>Supervision</option>
                    <option value={PersonalMeetingType.TEACHING_SESSION}>Teaching Session</option>
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

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    />
                    Recurring Session
                  </label>
                </div>
                
                {formData.isRecurring && (
                  <div className="form-group">
                    <label>Recurrence Frequency</label>
                    <select
                      value={formData.recurrenceFrequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceFrequency: e.target.value }))}
                    >
                      <option value="">Select frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                )}
              </div>

              {formData.isRecurring && formData.recurrenceFrequency && (
                <div className="form-group">
                  <label>Next Due Date</label>
                  <input
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextDueDate: e.target.value }))}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Session goals, topics to discuss, etc."
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">
                  {editingMeeting ? 'Update Session' : 'Add Session'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMeeting(null);
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

        {/* Meetings List */}
        <div className="personal-meetings-content">
          {loading ? (
            <div className="loading-spinner">Loading personal sessions...</div>
          ) : filteredMeetings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧘‍♀️</div>
              <h3>No Personal Sessions Found</h3>
              <p>Start your wellness journey by adding your first personal therapy session.</p>
              <button 
                className="add-button"
                onClick={() => {
                  setShowAddForm(true);
                  setEditingMeeting(null);
                  resetForm();
                }}
              >
                Add Your First Session
              </button>
            </div>
          ) : (
            <div className="personal-meetings-list">
              {filteredMeetings.map((meeting) => (
                <div key={meeting.id} className="personal-meeting-card">
                  <div className="meeting-header">
                    <div className="meeting-therapist">
                      <h4>{meeting.therapistName}</h4>
                      <span className="meeting-date">{formatDateTime(meeting.meetingDate)}</span>
                    </div>
                    <div className="meeting-actions">
                      <button
                        className="edit-button"
                        onClick={() => startEditing(meeting)}
                        title="Edit session"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        title="Delete session"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="meeting-details">
                    <div className="detail-item">
                      <span className="label">Provider:</span>
                      <span>{meeting.providerType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Type:</span>
                      <span>{meeting.meetingType.replace('_', ' ')}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span>{meeting.duration} minutes</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Price:</span>
                      <span>{formatCurrency(meeting.price)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <select
                        value={meeting.status}
                        onChange={(e) => handleStatusUpdate(meeting.id, e.target.value as PersonalMeetingStatus)}
                        className="status-select"
                        style={{ color: getStatusColor(meeting.status) }}
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
                        className={`payment-toggle ${meeting.isPaid ? 'paid' : 'unpaid'}`}
                        onClick={() => handlePaymentToggle(meeting.id, meeting.isPaid)}
                      >
                        {meeting.isPaid ? '✅ Paid' : '❌ Unpaid'}
                      </button>
                    </div>
                    {meeting.isRecurring && (
                      <div className="detail-item">
                        <span className="label">Recurring:</span>
                        <span>🔄 {meeting.recurrenceFrequency}</span>
                      </div>
                    )}
                  </div>

                  {meeting.notes && (
                    <div className="meeting-notes">
                      <strong>Notes:</strong> {meeting.notes}
                    </div>
                  )}

                  {meeting.isPaid && meeting.paymentDate && (
                    <div className="payment-date">
                      <small>Paid on: {formatDateTime(meeting.paymentDate)}</small>
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

export default PersonalMeetingPanel; 