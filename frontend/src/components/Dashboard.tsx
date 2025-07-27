import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clients } from '../services/api';
import { Client, ClientRequest } from '../types';
import AdminPanel from './AdminPanel';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [clientList, setClientList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showScheduleMeetingModal, setShowScheduleMeetingModal] = useState(false);
  const [newClientData, setNewClientData] = useState<ClientRequest>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    notes: ''
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await clients.getAll();
        setClientList(data);
      } catch (error) {
        setError('Failed to load clients');
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

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
    alert('Personal Session feature coming soon!');
  };

  const handleViewCalendar = () => {
    alert('Calendar view coming soon!');
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
                <h3>0</h3>
                <p>Meetings Today</p>
              </div>
              <div className="stat-item">
                <h3>0</h3>
                <p>Unpaid Sessions</p>
              </div>
              <div className="stat-item">
                <h3>$0</h3>
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
                      <button className="btn-small">View</button>
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
              <button className="action-button" onClick={handleAddPersonalSession}>Add Personal Session</button>
              <button className="action-button" onClick={handleViewCalendar}>View Calendar</button>
            </div>
          </div>

          <div className="dashboard-card">
            <h2>Upcoming Sessions</h2>
            <p>No upcoming sessions scheduled.</p>
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
              <p>Please add clients first before scheduling meetings.</p>
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
                <div className="coming-soon">
                  <p>Full meeting scheduling coming soon!</p>
                  <p>Available clients: {clientList.map(c => c.fullName).join(', ')}</p>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowScheduleMeetingModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 