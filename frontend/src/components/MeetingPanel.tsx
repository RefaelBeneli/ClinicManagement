import React, { useState, useEffect, useCallback } from 'react';
import { Meeting, MeetingStatus, MeetingRequest } from '../types';
import { meetings as meetingsApi, clients as clientsApi } from '../services/api';
import './MeetingPanel.css';

interface MeetingPanelProps {
  onClose: () => void;
  onRefresh?: () => void;
}

const MeetingPanel: React.FC<MeetingPanelProps> = ({ onClose, onRefresh }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'ALL'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState({
    clientId: 0,
    meetingDate: '',
    duration: 60,
    price: 0,
    notes: '',
    status: MeetingStatus.SCHEDULED,
    isPaid: false
  });
  const [clients, setClients] = useState<Array<{id: number, fullName: string}>>([]);

  const fetchClients = async () => {
    try {
      const clientsData = await clientsApi.getAll();
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchClients();
  }, []);



  // Handle ESC key and click outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('meeting-panel-overlay')) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const meetingData = await meetingsApi.getAll();
      setMeetings(meetingData);
      setError('');
    } catch (error: any) {
      console.error('Error fetching meetings:', error);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMeetings = useCallback(() => {
    let filtered = [...meetings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(meeting =>
        meeting.client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        case 'client':
          comparison = a.client.fullName.localeCompare(b.client.fullName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredMeetings(filtered);
  }, [meetings, searchTerm, statusFilter, paymentFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortMeetings();
  }, [filterAndSortMeetings]);

  const handleStatusUpdate = async (meetingId: number, newStatus: MeetingStatus) => {
    try {
      await meetingsApi.update(meetingId, { status: newStatus });
      
      // Update local state
      setMeetings(prevMeetings =>
        prevMeetings.map(meeting =>
          meeting.id === meetingId
            ? { ...meeting, status: newStatus }
            : meeting
        )
      );
      
      console.log('Meeting status updated successfully');
      onRefresh?.(); // Call onRefresh if provided
    } catch (error: any) {
      console.error('Error updating meeting status:', error);
      alert('Failed to update meeting status');
    }
  };

  const handlePaymentToggle = async (meetingId: number, isPaid: boolean) => {
    try {
      await meetingsApi.update(meetingId, { isPaid });
      
      // Update local state
      setMeetings(prevMeetings =>
        prevMeetings.map(meeting =>
          meeting.id === meetingId
            ? { ...meeting, isPaid, paymentDate: isPaid ? new Date().toISOString() : undefined }
            : meeting
        )
      );
      
      console.log('Payment status updated successfully');
      onRefresh?.(); // Call onRefresh if provided
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const handleClientUpdate = async (meetingId: number, clientId: number) => {
    try {
      await meetingsApi.update(meetingId, { clientId });
      await fetchMeetings();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating client:', error);
      setError('Failed to update client');
    }
  };

  const handleDateUpdate = async (meetingId: number, meetingDate: string) => {
    try {
      await meetingsApi.update(meetingId, { meetingDate });
      await fetchMeetings();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating date:', error);
      setError('Failed to update date');
    }
  };

  const handleDurationUpdate = async (meetingId: number, duration: number) => {
    try {
      await meetingsApi.update(meetingId, { duration });
      await fetchMeetings();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating duration:', error);
      setError('Failed to update duration');
    }
  };

  const handlePriceUpdate = async (meetingId: number, price: number) => {
    try {
      await meetingsApi.update(meetingId, { price });
      await fetchMeetings();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating price:', error);
      setError('Failed to update price');
    }
  };

  const handleNotesUpdate = async (meetingId: number, notes: string) => {
    try {
      await meetingsApi.update(meetingId, { notes });
      await fetchMeetings();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating notes:', error);
      setError('Failed to update notes');
    }
  };

  // Delete handler
  const handleDeleteMeeting = async (meetingId: number) => {
    if (window.confirm('Are you sure you want to delete this session? This action will deactivate the meeting.')) {
      try {
        await meetingsApi.disable(meetingId);
        console.log('✅ Meeting deleted successfully');
        // Update the local state immediately for visual feedback
        setMeetings(prev => prev.map(meeting => 
          meeting.id === meetingId ? { ...meeting, active: false } : meeting
        ));
        await fetchMeetings(); // Refresh the list
      } catch (error) {
        console.error('❌ Failed to delete meeting:', error);
        alert('Failed to delete session. Please try again.');
      }
    }
  };

  // Restore handler
  const handleRestoreMeeting = async (meetingId: number) => {
    try {
      await meetingsApi.activate(meetingId);
      console.log('✅ Meeting restored successfully');
      // Update the local state immediately for visual feedback
      setMeetings(prev => prev.map(meeting => 
        meeting.id === meetingId ? { ...meeting, active: true } : meeting
      ));
      await fetchMeetings(); // Refresh the list
    } catch (error) {
      console.error('❌ Failed to restore meeting:', error);
      alert('Failed to restore session. Please try again.');
    }
  };

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const meetingRequest: MeetingRequest = {
        clientId: formData.clientId,
        meetingDate: formData.meetingDate,
        duration: formData.duration,
        price: formData.price,
        notes: formData.notes
      };
      
      const newMeeting = await meetingsApi.create(meetingRequest);
      
      setShowAddForm(false);
      resetForm();
      await fetchMeetings();
      onRefresh?.();
    } catch (error: any) {
      console.error('❌ Error adding meeting:', error);
      setError('Failed to add meeting: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeeting) return;
    
    try {
      const updateRequest = {
        clientId: formData.clientId,
        meetingDate: formData.meetingDate,
        duration: formData.duration,
        price: formData.price,
        notes: formData.notes,
        status: formData.status,
        isPaid: formData.isPaid
      };
      
      await meetingsApi.update(editingMeeting.id, updateRequest);
      setShowAddForm(false);
      setEditingMeeting(null);
      resetForm();
      await fetchMeetings();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating meeting:', error);
      setError('Failed to update meeting');
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: 0,
      meetingDate: '',
      duration: 60,
      price: 0,
      notes: '',
      status: MeetingStatus.SCHEDULED,
      isPaid: false
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startEditing = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      clientId: meeting.client.id,
      meetingDate: meeting.meetingDate.split('T')[0] + 'T' + meeting.meetingDate.split('T')[1]?.substring(0, 5) || '',
      duration: meeting.duration,
      price: meeting.price,
      notes: meeting.notes || '',
      status: meeting.status,
      isPaid: meeting.isPaid
    });
    setShowAddForm(true);
  };

  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case MeetingStatus.SCHEDULED: return '#007bff';
      case MeetingStatus.COMPLETED: return '#28a745';
      case MeetingStatus.CANCELLED: return '#dc3545';
      case MeetingStatus.NO_SHOW: return '#ffc107';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTotalStats = () => {
    const total = meetings.length;
    const completed = meetings.filter(m => m.status === MeetingStatus.COMPLETED).length;
    const scheduled = meetings.filter(m => m.status === MeetingStatus.SCHEDULED).length;
    const paid = meetings.filter(m => m.isPaid).length;
    const totalRevenue = meetings.filter(m => m.isPaid).reduce((sum, m) => sum + Number(m.price), 0);
    
    return { total, completed, scheduled, paid, totalRevenue };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="meeting-panel-overlay">
        <div className="meeting-panel">
          <div className="loading">Loading meetings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-panel-overlay">
      <div className="meeting-panel">
        <div className="meeting-panel-header">
          <h2>Sessions Management</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        {/* Stats Section */}
        <div className="meeting-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Meetings</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.scheduled}</span>
            <span className="stat-label">Scheduled</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.paid}</span>
            <span className="stat-label">Paid</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">${stats.totalRevenue}</span>
            <span className="stat-label">Revenue</span>
          </div>
        </div>

        {/* Filters Section */}
        <div className="meeting-filters">
          <div className="filter-row">
            <input
              type="text"
              placeholder="Search by client name or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MeetingStatus | 'ALL')}
              className="filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value={MeetingStatus.SCHEDULED}>Scheduled</option>
              <option value={MeetingStatus.COMPLETED}>Completed</option>
              <option value={MeetingStatus.CANCELLED}>Cancelled</option>
              <option value={MeetingStatus.NO_SHOW}>No Show</option>
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
          </div>

          <div className="filter-row">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'client' | 'status')}
              className="filter-select"
            >
              <option value="date">Sort by Date</option>
              <option value="client">Sort by Client</option>
              <option value="status">Sort by Status</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="filter-select"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>

            <button onClick={fetchMeetings} className="refresh-button">
              🔄 Refresh
            </button>
            
            <button 
              className="add-button"
              onClick={() => {
                setShowAddForm(true);
                setEditingMeeting(null);
                resetForm();
              }}
            >
              + Add Session
            </button>
          </div>
        </div>

        {/* Meetings List */}
        <div className="meetings-container">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {filteredMeetings.length === 0 ? (
            <div className="no-meetings">
              {searchTerm || statusFilter !== 'ALL' || paymentFilter !== 'ALL' 
                ? 'No meetings match your filters' 
                : 'No meetings found'}
            </div>
          ) : (
            <div className="meetings-grid">
              {filteredMeetings.map((meeting) => {
                const { date, time } = formatDate(meeting.meetingDate);
                return (
                  <div key={meeting.id} className={`meeting-card ${meeting.active === false ? 'disabled-card' : ''}`}>
                    <div className="meeting-card-header">
                      <h3>{meeting.client.fullName}</h3>
                      <div 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(meeting.status) }}
                      >
                        {meeting.status}
                      </div>
                    </div>

                    <div className="meeting-card-body">
                      <div className="meeting-info">
                        <div className="info-row">
                          <label>Client:</label>
                          <select
                            value={meeting.client.id}
                            onChange={(e) => handleClientUpdate(meeting.id, parseInt(e.target.value))}
                            className="inline-select"
                          >
                            {clients.map(client => (
                              <option key={client.id} value={client.id}>
                                {client.fullName}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="info-row">
                          <label>Date & Time:</label>
                          <input
                            type="datetime-local"
                            value={meeting.meetingDate.split('T')[0] + 'T' + meeting.meetingDate.split('T')[1]?.substring(0, 5) || ''}
                            onChange={(e) => handleDateUpdate(meeting.id, e.target.value)}
                            className="inline-input"
                          />
                        </div>
                        
                        <div className="info-row">
                          <label>Duration:</label>
                          <input
                            type="number"
                            min="15"
                            max="300"
                            value={meeting.duration}
                            onChange={(e) => handleDurationUpdate(meeting.id, parseInt(e.target.value) || 60)}
                            className="inline-input"
                          />
                          <span>minutes</span>
                        </div>
                        
                        <div className="info-row">
                          <label>Price:</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={meeting.price}
                            onChange={(e) => handlePriceUpdate(meeting.id, parseFloat(e.target.value) || 0)}
                            className="inline-input"
                          />
                        </div>
                        
                        <div className="info-row">
                          <label>Notes:</label>
                          <textarea
                            value={meeting.notes || ''}
                            onChange={(e) => handleNotesUpdate(meeting.id, e.target.value)}
                            className="inline-textarea"
                            rows={2}
                            placeholder="Add notes..."
                          />
                        </div>
                      </div>

                      <div className="meeting-actions">
                        {meeting.active !== false ? (
                          <>
                            <div className="action-group">
                              <label>Status:</label>
                              <select
                                value={meeting.status}
                                onChange={(e) => handleStatusUpdate(meeting.id, e.target.value as MeetingStatus)}
                                className="status-select"
                              >
                                <option value={MeetingStatus.SCHEDULED}>Scheduled</option>
                                <option value={MeetingStatus.COMPLETED}>Completed</option>
                                <option value={MeetingStatus.CANCELLED}>Cancelled</option>
                                <option value={MeetingStatus.NO_SHOW}>No Show</option>
                              </select>
                            </div>

                            <div className="action-group">
                              <label>Payment:</label>
                              <div className="payment-toggle">
                                <input
                                  type="checkbox"
                                  checked={meeting.isPaid}
                                  onChange={(e) => handlePaymentToggle(meeting.id, e.target.checked)}
                                  id={`payment-${meeting.id}`}
                                />
                                <label htmlFor={`payment-${meeting.id}`}>
                                  {meeting.isPaid ? '✓ Paid' : '○ Unpaid'}
                                </label>
                              </div>
                            </div>

                            <div className="action-group">
                              <button 
                                className="delete-btn"
                                onClick={() => handleDeleteMeeting(meeting.id)}
                              >
                                Delete Session
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="action-group">
                            <button 
                              className="restore-btn"
                              onClick={() => handleRestoreMeeting(meeting.id)}
                            >
                              Restore Session
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="meeting-form-section">
            <form onSubmit={editingMeeting ? handleEditMeeting : handleAddMeeting} className="meeting-form">
              <h3>{editingMeeting ? 'Edit Session' : 'Add New Session'}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Client *</label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: parseInt(e.target.value) }))}
                  >
                    <option value="">Select a client</option>
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

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status || MeetingStatus.SCHEDULED}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as MeetingStatus }))}
                  >
                    <option value={MeetingStatus.SCHEDULED}>Scheduled</option>
                    <option value={MeetingStatus.COMPLETED}>Completed</option>
                    <option value={MeetingStatus.CANCELLED}>Cancelled</option>
                    <option value={MeetingStatus.NO_SHOW}>No Show</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Payment Status</label>
                  <div className="payment-toggle">
                    <input
                      type="checkbox"
                      checked={formData.isPaid || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPaid: e.target.checked }))}
                      id="form-payment-toggle"
                    />
                    <label htmlFor="form-payment-toggle">
                      {formData.isPaid ? '✓ Paid' : '○ Unpaid'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Any additional notes about this meeting..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => {
                  setShowAddForm(false);
                  setEditingMeeting(null);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingMeeting ? 'Update Session' : 'Add Session'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingPanel; 