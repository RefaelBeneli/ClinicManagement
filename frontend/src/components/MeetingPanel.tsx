import React, { useState, useEffect, useCallback } from 'react';
import { Meeting, MeetingStatus } from '../types';
import { meetings as meetingsApi } from '../services/api';
import './MeetingPanel.css';

interface MeetingPanelProps {
  onClose: () => void;
}

const MeetingPanel: React.FC<MeetingPanelProps> = ({ onClose }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | 'ALL'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    filterAndSortMeetings();
  }, [meetings, searchTerm, statusFilter, paymentFilter, sortBy, sortOrder]);

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
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    }
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
          <h2>Meeting Management</h2>
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
                  <div key={meeting.id} className="meeting-card">
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
                        <p><strong>Date:</strong> {date}</p>
                        <p><strong>Time:</strong> {time}</p>
                        <p><strong>Duration:</strong> {meeting.duration} minutes</p>
                        <p><strong>Price:</strong> ${meeting.price}</p>
                        {meeting.notes && (
                          <p><strong>Notes:</strong> {meeting.notes}</p>
                        )}
                      </div>

                      <div className="meeting-actions">
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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingPanel; 