import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clients, meetings } from '../services/api';
import { Client, ClientRequest, Meeting, MeetingStatus, RevenueResponse, DashboardStats } from '../types';
import AdminPanel from './AdminPanel';
import Calendar from './Calendar';
import MeetingPanel from './MeetingPanel';
import PersonalMeetingPanel from './PersonalMeetingPanel';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [clientList, setClientList] = useState<Client[]>([]);
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Revenue tracking state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    meetingsToday: 0,
    unpaidSessions: 0,
    monthlyRevenue: 0
  });
  const [revenueStats, setRevenueStats] = useState<RevenueResponse | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [revenueLoading, setRevenueLoading] = useState(false);
  
  // Modal states
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showScheduleMeetingModal, setShowScheduleMeetingModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMeetingPanel, setShowMeetingPanel] = useState(false);
  const [showPersonalMeetingPanel, setShowPersonalMeetingPanel] = useState(false);
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Form states
  const [newClientData, setNewClientData] = useState<ClientRequest>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    notes: ''
  });
  const [newMeetingData, setNewMeetingData] = useState({
    clientId: '',
    meetingDate: '',
    meetingTime: '',
    duration: 60,
    price: 150,
    notes: ''
  });

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const stats = await meetings.getDashboardStats();
      setDashboardStats(stats);
    } catch (error: any) {
      console.error('❌ Error fetching dashboard stats:', error);
    }
  }, []);

  // Fetch revenue stats
  const fetchRevenueStats = useCallback(async () => {
    setRevenueLoading(true);
    try {
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      if (selectedPeriod === 'custom') {
        if (!customStartDate || !customEndDate) {
          throw new Error('Please select both start and end dates for custom period');
        }
        startDate = new Date(customStartDate).toISOString();
        endDate = new Date(customEndDate).toISOString();
      }
      
      const revenue = await meetings.getRevenueStats(selectedPeriod, startDate, endDate);
      setRevenueStats(revenue);
    } catch (error: any) {
      console.error('❌ Error fetching revenue stats:', error);
      setError(`Failed to load revenue data: ${error.message}`);
    } finally {
      setRevenueLoading(false);
    }
  }, [selectedPeriod, customStartDate, customEndDate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Starting to fetch data...');
        
        const [clientData, meetingData] = await Promise.all([
          clients.getAll(),
          meetings.getAll()
        ]);
        
        console.log('📋 Clients loaded:', clientData.length);
        console.log('📅 Meetings loaded:', meetingData.length);
        
        setClientList(clientData);
        setMeetingList(meetingData);
        
        // Fetch dashboard and revenue stats
        await Promise.all([
          fetchDashboardStats(),
          fetchRevenueStats()
        ]);
        
      } catch (error: any) {
        console.error('❌ Error fetching data:', error);
        setError(`Failed to load data: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchDashboardStats, fetchRevenueStats]);

  // Refresh revenue stats when period changes
  useEffect(() => {
    if (!loading) {
      fetchRevenueStats();
    }
  }, [selectedPeriod, customStartDate, customEndDate, fetchRevenueStats, loading]);

  // Function to refresh all data (useful after payment updates)
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchRevenueStats()
    ]);
  }, [fetchDashboardStats, fetchRevenueStats]);

  const handleLogout = () => {
    logout();
  };

  const handleAddClient = () => {
    setShowAddClientModal(true);
  };

  const handleScheduleMeeting = () => {
    setShowScheduleMeetingModal(true);
  };

  const handleAddPersonalSession = () => {
    console.log('🧘‍♀️ Opening personal meetings panel...');
    setShowPersonalMeetingPanel(true);
  };

  const handleClosePersonalMeetingPanel = () => {
    console.log('🧘‍♀️ Closing personal meetings panel...');
    setShowPersonalMeetingPanel(false);
  };

  const handleViewCalendar = () => {
    console.log('📅 Opening calendar view...');
    setShowCalendar(true);
  };

  const handleCloseCalendar = () => {
    console.log('📅 Closing calendar view...');
    setShowCalendar(false);
  };

  const handleManageMeetings = () => {
    console.log('📊 Opening meeting management panel...');
    setShowMeetingPanel(true);
  };

  const handleCloseMeetingPanel = () => {
    console.log('📊 Closing meeting management panel...');
    setShowMeetingPanel(false);
  };

  const handleViewClient = (client: Client) => {
    console.log('👤 Opening client details for:', client.fullName);
    setSelectedClient(client);
    setShowClientDetailsModal(true);
  };

  const handleCloseClientDetails = () => {
    console.log('👤 Closing client details modal...');
    setShowClientDetailsModal(false);
    setSelectedClient(null);
  };

  const handleClientInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveClient = async () => {
    try {
      const savedClient = await clients.create(newClientData);
      setClientList(prev => [...prev, savedClient]);
      setShowAddClientModal(false);
      setNewClientData({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client. Please try again.');
    }
  };

  const handleCancelAddClient = () => {
    setShowAddClientModal(false);
    setNewClientData({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      notes: ''
    });
  };

  const handleMeetingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMeetingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveMeeting = async () => {
    try {
      // Combine date and time into a single datetime
      const meetingDateTime = new Date(`${newMeetingData.meetingDate}T${newMeetingData.meetingTime}`);
      
      const meetingRequest = {
        clientId: parseInt(newMeetingData.clientId),
        meetingDate: meetingDateTime.toISOString(),
        duration: newMeetingData.duration,
        price: newMeetingData.price,
        notes: newMeetingData.notes
      };

      // Import the meetings API if not already imported
      const { meetings } = await import('../services/api');
      const newMeeting = await meetings.create(meetingRequest);
      
      // Add the new meeting to the local list
      setMeetingList(prevMeetings => [...prevMeetings, newMeeting]);
      
      alert('Meeting scheduled successfully!');
      handleCancelScheduleMeeting();
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    }
  };

  const handleCancelScheduleMeeting = () => {
    setShowScheduleMeetingModal(false);
    setNewMeetingData({
      clientId: '',
      meetingDate: '',
      meetingTime: '',
      duration: 60,
      price: 150,
      notes: ''
    });
  };

  const refreshMeetings = async () => {
    try {
      setLoading(true);
      console.log('🔄 Manually refreshing data...');
      
      const meetingData = await meetings.getAll();
      
      console.log('📅 Refreshed meetings:', meetingData.length);
      
      setMeetingList(meetingData);
      setError('');
      
      // Also refresh revenue data
      await refreshData();
    } catch (error: any) {
      console.error('❌ Error refreshing data:', error);
      setError(`Failed to refresh data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMeetingStatus = async (meetingId: number, newStatus: MeetingStatus) => {
    try {
      console.log('🔄 Updating meeting status:', meetingId, 'to', newStatus);
      
      // Import the meetings API
      const { meetings } = await import('../services/api');
      await meetings.update(meetingId, { status: newStatus });
      
      // Update the local meeting list
      setMeetingList(prevMeetings => 
        prevMeetings.map(meeting => 
          meeting.id === meetingId 
            ? { ...meeting, status: newStatus }
            : meeting
        )
      );
      
      console.log('✅ Meeting status updated successfully!');
      alert('Meeting status updated successfully!');
    } catch (error: any) {
      console.error('❌ Error updating meeting status:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to update meeting status: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Clinic Management Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.fullName}</span>
            <span className={`role-badge ${user?.role?.toLowerCase()}`}>
              {user?.role}
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Admin Panel - Only visible to admin users */}
        {user?.role === 'ADMIN' && (
          <div className="admin-section">
            <AdminPanel />
          </div>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Quick Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <h3>{clientList.length}</h3>
                <p>Active Clients</p>
              </div>
              <div className="stat-item">
                <h3>{dashboardStats.meetingsToday}</h3>
                <p>Meetings Today</p>
              </div>
              <div className="stat-item">
                <h3>{dashboardStats.unpaidSessions}</h3>
                <p>Unpaid Sessions</p>
              </div>
              <div className="stat-item">
                <h3>${dashboardStats.monthlyRevenue.toFixed(2)}</h3>
                <p>Monthly Revenue</p>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>Recent Clients</h2>
            {loading ? (
              <p>Loading clients...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : clientList.length === 0 ? (
              <p>No clients yet. Start by adding your first client!</p>
            ) : (
              <div className="client-list">
                {clientList.slice(0, 5).map((client) => (
                  <div key={client.id} className="client-item">
                    <div className="client-info">
                      <h4>{client.fullName}</h4>
                      <p>{client.email || 'No email'}</p>
                    </div>
                    <div className="client-actions">
                      <button 
                        className="btn-small" 
                        onClick={() => handleViewClient(client)}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-button" onClick={handleAddClient}>Add New Client</button>
              <button className="action-button" onClick={handleScheduleMeeting}>Schedule Meeting</button>
              <button className="action-button" onClick={handleManageMeetings}>Manage Meetings</button>
              <button className="action-button" onClick={handleAddPersonalSession}>My Personal Sessions</button>
              <button className="action-button" onClick={handleViewCalendar}>View Calendar</button>
            </div>
          </div>

          {/* Revenue Tracking Section */}
          <div className="dashboard-card revenue-section">
            <div className="revenue-header">
              <h2>📊 Revenue Analytics</h2>
              <div className="period-selector">
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'monthly' | 'yearly' | 'custom')}
                  className="period-select"
                >
                  <option value="daily">Today</option>
                  <option value="monthly">This Month</option>
                  <option value="yearly">This Year</option>
                  <option value="custom">Custom Period</option>
                </select>
              </div>
            </div>

            {selectedPeriod === 'custom' && (
              <div className="custom-date-range">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="date-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
            )}

            {revenueLoading ? (
              <div className="loading">Loading revenue data...</div>
            ) : revenueStats ? (
              <div className="revenue-stats">
                <div className="revenue-grid">
                  <div className="revenue-item total">
                    <div className="revenue-amount">${revenueStats.totalRevenue.toFixed(2)}</div>
                    <div className="revenue-label">Total Potential</div>
                    <div className="revenue-count">{revenueStats.totalMeetings} meetings</div>
                  </div>
                  <div className="revenue-item paid">
                    <div className="revenue-amount">${revenueStats.paidRevenue.toFixed(2)}</div>
                    <div className="revenue-label">Paid Revenue</div>
                    <div className="revenue-count">{revenueStats.paidMeetings} paid</div>
                  </div>
                  <div className="revenue-item unpaid">
                    <div className="revenue-amount">${revenueStats.unpaidRevenue.toFixed(2)}</div>
                    <div className="revenue-label">Pending Payment</div>
                    <div className="revenue-count">{revenueStats.unpaidMeetings} unpaid</div>
                  </div>
                  <div className="revenue-item completed">
                    <div className="revenue-amount">{revenueStats.completedMeetings}</div>
                    <div className="revenue-label">Completed Sessions</div>
                    <div className="revenue-count">
                      {revenueStats.totalMeetings > 0 
                        ? Math.round((revenueStats.completedMeetings / revenueStats.totalMeetings) * 100)
                        : 0
                      }% completion rate
                    </div>
                  </div>
                </div>
                
                <div className="revenue-summary">
                  <div className="summary-item">
                    <span className="summary-label">Collection Rate:</span>
                    <span className="summary-value">
                      {revenueStats.totalRevenue > 0 
                        ? Math.round((revenueStats.paidRevenue / revenueStats.totalRevenue) * 100)
                        : 0
                      }%
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Period:</span>
                    <span className="summary-value">
                      {new Date(revenueStats.startDate).toLocaleDateString()} - {new Date(revenueStats.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-data">No revenue data available</div>
            )}
          </div>

          <div className="dashboard-card meetings-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Your Meetings {!loading && `(${meetingList.length})`}</h2>
              <button 
                onClick={refreshMeetings} 
                className="btn-secondary"
                disabled={loading}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                {loading ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
            </div>
            {loading ? (
              <p>Loading meetings...</p>
            ) : error ? (
              <div className="error">
                <p><strong>Error:</strong> {error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn-secondary"
                  style={{ marginTop: '10px' }}
                >
                  Reload Page
                </button>
              </div>
            ) : meetingList.length === 0 ? (
              <div>
                <p>No meetings scheduled yet. Use "Schedule Meeting" to add one!</p>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                  💡 <strong>Tip:</strong> Make sure you have clients added first, then schedule meetings with them.
                </p>
              </div>
            ) : (
              <div className="meetings-list">
                {meetingList.slice(0, 10).map((meeting) => (
                  <div key={meeting.id} className="meeting-item">
                    <div className="meeting-info">
                      <h4>{meeting.client.fullName}</h4>
                      <p className="meeting-date">
                        {new Date(meeting.meetingDate).toLocaleDateString()} at{' '}
                        {new Date(meeting.meetingDate).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      <p className="meeting-details">
                        {meeting.duration} minutes - ${meeting.price}
                        {meeting.isPaid && <span className="paid-badge">✓ Paid</span>}
                      </p>
                      {meeting.notes && <p className="meeting-notes">{meeting.notes}</p>}
                    </div>
                    <div className="meeting-actions">
                      <div className="status-section">
                        <span className={`status-badge ${meeting.status.toLowerCase()}`}>
                          {meeting.status}
                        </span>
                        <select
                          value={meeting.status}
                          onChange={(e) => handleUpdateMeetingStatus(meeting.id, e.target.value as MeetingStatus)}
                          className="status-select"
                        >
                          <option value={MeetingStatus.SCHEDULED}>Scheduled</option>
                          <option value={MeetingStatus.COMPLETED}>Completed</option>
                          <option value={MeetingStatus.CANCELLED}>Cancelled</option>
                          <option value={MeetingStatus.NO_SHOW}>No Show</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Client Modal */}
      {showAddClientModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Client</h3>
              <button className="close-button" onClick={handleCancelAddClient}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveClient(); }}>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={newClientData.fullName}
                    onChange={handleClientInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newClientData.email}
                    onChange={handleClientInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={newClientData.phone}
                    onChange={handleClientInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={newClientData.dateOfBirth}
                    onChange={handleClientInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={newClientData.notes}
                    onChange={handleClientInputChange}
                    rows={3}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={handleCancelAddClient}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleMeetingModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Schedule Meeting</h3>
              <button className="close-button" onClick={() => setShowScheduleMeetingModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {clientList.length === 0 ? (
                <div className="no-clients">
                  <p>No clients available. Add a client first to schedule meetings.</p>
                  <button className="btn-primary" onClick={() => {
                    setShowScheduleMeetingModal(false);
                    setShowAddClientModal(true);
                  }}>
                    Add Client First
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveMeeting(); }}>
                  <div className="form-group">
                    <label htmlFor="clientId">Select Client *</label>
                    <select
                      id="clientId"
                      name="clientId"
                      value={newMeetingData.clientId}
                      onChange={handleMeetingInputChange}
                      required
                    >
                      <option value="">Choose a client...</option>
                      {clientList.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="meetingDate">Date *</label>
                      <input
                        type="date"
                        id="meetingDate"
                        name="meetingDate"
                        value={newMeetingData.meetingDate}
                        onChange={handleMeetingInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="meetingTime">Time *</label>
                      <input
                        type="time"
                        id="meetingTime"
                        name="meetingTime"
                        value={newMeetingData.meetingTime}
                        onChange={handleMeetingInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="duration">Duration (minutes) *</label>
                      <select
                        id="duration"
                        name="duration"
                        value={newMeetingData.duration}
                        onChange={handleMeetingInputChange}
                        required
                      >
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                        <option value={120}>120 minutes</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="price">Price ($) *</label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={newMeetingData.price}
                        onChange={handleMeetingInputChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={newMeetingData.notes}
                      onChange={handleMeetingInputChange}
                      placeholder="Any additional notes about this meeting..."
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">
                      Schedule Meeting
                    </button>
                    <button type="button" className="btn-cancel" onClick={handleCancelScheduleMeeting}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meeting Management Panel */}
      {showMeetingPanel && (
        <MeetingPanel 
          onClose={handleCloseMeetingPanel}
          onRefresh={refreshData}
        />
      )}

      {/* Personal Meeting Panel */}
      {showPersonalMeetingPanel && (
        <PersonalMeetingPanel 
          onClose={handleClosePersonalMeetingPanel}
          onRefresh={refreshData}
        />
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <Calendar 
          meetings={meetingList} 
          onClose={handleCloseCalendar} 
        />
      )}

      {/* Client Details Modal */}
      {showClientDetailsModal && selectedClient && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Client Details</h3>
              <button 
                onClick={handleCloseClientDetails}
                className="close-button"
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="client-details">
                <div className="detail-item">
                  <label><strong>Full Name:</strong></label>
                  <p>{selectedClient.fullName}</p>
                </div>
                <div className="detail-item">
                  <label><strong>Email:</strong></label>
                  <p>{selectedClient.email || 'Not provided'}</p>
                </div>
                <div className="detail-item">
                  <label><strong>Phone:</strong></label>
                  <p>{selectedClient.phone || 'Not provided'}</p>
                </div>
                <div className="detail-item">
                  <label><strong>Date of Birth:</strong></label>
                  <p>{selectedClient.dateOfBirth || 'Not provided'}</p>
                </div>
                <div className="detail-item">
                  <label><strong>Status:</strong></label>
                  <p>{selectedClient.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                {selectedClient.notes && (
                  <div className="detail-item">
                    <label><strong>Notes:</strong></label>
                    <p>{selectedClient.notes}</p>
                  </div>
                )}
                <div className="detail-item">
                  <label><strong>Joined:</strong></label>
                  <p>{new Date(selectedClient.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={handleCloseClientDetails}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 