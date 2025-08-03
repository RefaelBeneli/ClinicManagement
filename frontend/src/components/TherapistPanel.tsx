import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MeetingPanel from './MeetingPanel';
import PersonalMeetingPanel from './PersonalMeetingPanel';
import ExpensePanel from './ExpensePanel';
import Calendar from './Calendar';
import { clients, meetings, personalMeetings, expenses } from '../services/api';
import { Client, Meeting, PersonalMeeting, Expense, MeetingStatus, PersonalMeetingStatus } from '../types';
import ViewClientModal from './ui/ViewClientModal';
import ViewMeetingModal from './ui/ViewMeetingModal';
import ViewPersonalMeetingModal from './ui/ViewPersonalMeetingModal';
import ExpenseDetailsModal from './ui/ExpenseDetailsModal';
import EditClientModal from './ui/EditClientModal';
import EditMeetingModal from './ui/EditMeetingModal';
import EditPersonalMeetingModal from './ui/EditPersonalMeetingModal';
import EditExpenseModal from './ui/EditExpenseModal';
import './TherapistPanel.css';

const TherapistPanel: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [clientList, setClientList] = useState<Client[]>([]);
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const [personalMeetingList, setPersonalMeetingList] = useState<PersonalMeeting[]>([]);
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'meetings' | 'personal-meetings' | 'expenses' | 'analytics' | 'calendar'>('dashboard');
  
  // Panel states
  const [showMeetingPanel, setShowMeetingPanel] = useState(false);
  const [showPersonalMeetingPanel, setShowPersonalMeetingPanel] = useState(false);
  const [showExpensePanel, setShowExpensePanel] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // View modal states
  const [viewClientModal, setViewClientModal] = useState<{ isOpen: boolean; client: Client | null }>({ isOpen: false, client: null });
  const [viewMeetingModal, setViewMeetingModal] = useState<{ isOpen: boolean; meeting: Meeting | null }>({ isOpen: false, meeting: null });
  const [viewPersonalMeetingModal, setViewPersonalMeetingModal] = useState<{ isOpen: boolean; meeting: PersonalMeeting | null }>({ isOpen: false, meeting: null });
  const [viewExpenseModal, setViewExpenseModal] = useState<{ isOpen: boolean; expense: Expense | null }>({ isOpen: false, expense: null });

  // Edit modal states
  const [editClientModal, setEditClientModal] = useState<{ isOpen: boolean; client: Client | null }>({ isOpen: false, client: null });
  const [editMeetingModal, setEditMeetingModal] = useState<{ isOpen: boolean; meeting: Meeting | null }>({ isOpen: false, meeting: null });
  const [editPersonalMeetingModal, setEditPersonalMeetingModal] = useState<{ isOpen: boolean; meeting: PersonalMeeting | null }>({ isOpen: false, meeting: null });
  const [editExpenseModal, setEditExpenseModal] = useState<{ isOpen: boolean; expense: Expense | null }>({ isOpen: false, expense: null });

  // Stats state
  const [stats, setStats] = useState({
    totalClients: 0,
    totalMeetings: 0,
    totalPersonalMeetings: 0,
    totalExpenses: 0,
    todayMeetings: 0,
    unpaidSessions: 0,
    monthlyRevenue: 0
  });

  // Analytics state
  const [analytics, setAnalytics] = useState<any>({
    revenueStats: null,
    meetingStats: null,
    clientStats: null,
    expenseStats: null,
    personalMeetingStats: null
  });

  // Analytics period state
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Use the same API URL logic as the main API service
  const apiUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
        ? 'https://web-production-9aa8.up.railway.app/api'
        : 'http://localhost:8085/api');
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const clientsData = await clients.getAll();
      console.log('📋 Fetched clients data:', clientsData);
      console.log('📋 First client details:', clientsData[0]);
                      console.log('📋 First client active field:', clientsData[0]?.active);
      setClientList(clientsData);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  }, []);

  const fetchMeetings = useCallback(async () => {
    try {
      const meetingsData = await meetings.getAll();
      setMeetingList(meetingsData);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    }
  }, []);

  const fetchPersonalMeetings = useCallback(async () => {
    try {
      const personalMeetingsData = await personalMeetings.getAll();
      setPersonalMeetingList(personalMeetingsData);
    } catch (error) {
      console.error('Failed to fetch personal meetings:', error);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const expensesData = await expenses.getAll();
      setExpenseList(expensesData);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const statsData = await meetings.getDashboardStats();
      setStats({
        totalClients: clientList.length,
        totalMeetings: meetingList.length,
        totalPersonalMeetings: personalMeetingList.length,
        totalExpenses: expenseList.length,
        todayMeetings: statsData.meetingsToday,
        unpaidSessions: statsData.unpaidSessions,
        monthlyRevenue: statsData.monthlyRevenue
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  }, [clientList.length, meetingList.length, personalMeetingList.length, expenseList.length]);

  const fetchAnalytics = useCallback(async () => {
    try {
      // Revenue analytics
      const revenueStats = await meetings.getRevenueStats(analyticsPeriod);
      
      // Meeting analytics
      const meetingStats = {
        total: meetingList.length,
        completed: meetingList.filter(m => m.status === 'COMPLETED').length,
        scheduled: meetingList.filter(m => m.status === 'SCHEDULED').length,
        cancelled: meetingList.filter(m => m.status === 'CANCELLED').length,
        paid: meetingList.filter(m => m.isPaid).length,
        unpaid: meetingList.filter(m => !m.isPaid).length,
        averagePrice: meetingList.length > 0 ? 
          meetingList.reduce((sum, m) => sum + m.price, 0) / meetingList.length : 0
      };

      // Client analytics
      const clientStats = {
        total: clientList.length,
        active: clientList.filter(c => c.active).length,
        inactive: clientList.filter(c => !c.active).length,
        newThisMonth: clientList.filter(c => {
          const createdAt = new Date(c.createdAt);
          const now = new Date();
          return createdAt.getMonth() === now.getMonth() && 
                 createdAt.getFullYear() === now.getFullYear();
        }).length
      };

      // Expense analytics
      const expenseStats = {
        total: expenseList.length,
        paid: expenseList.filter(e => e.paid).length,
        unpaid: expenseList.filter(e => !e.paid).length,
        totalAmount: expenseList.reduce((sum, e) => sum + e.amount, 0),
        paidAmount: expenseList.filter(e => e.paid).reduce((sum, e) => sum + e.amount, 0),
        unpaidAmount: expenseList.filter(e => !e.paid).reduce((sum, e) => sum + e.amount, 0),
        byCategory: expenseList.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        }, {} as Record<string, number>)
      };

      // Personal meeting analytics
      const personalMeetingStats = {
        total: personalMeetingList.length,
        byType: personalMeetingList.reduce((acc, m) => {
          acc[m.meetingType] = (acc[m.meetingType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byProvider: personalMeetingList.reduce((acc, m) => {
          acc[m.providerType] = (acc[m.providerType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        paid: personalMeetingList.filter(m => m.isPaid).length,
        unpaid: personalMeetingList.filter(m => !m.isPaid).length,
        totalSpent: personalMeetingList.reduce((sum, m) => sum + m.price, 0)
      };

      setAnalytics({
        revenueStats,
        meetingStats,
        clientStats,
        expenseStats,
        personalMeetingStats
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  }, [meetingList, clientList, expenseList, personalMeetingList, analyticsPeriod]);

  const loadTherapistData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClients(),
        fetchMeetings(),
        fetchPersonalMeetings(),
        fetchExpenses()
      ]);
    } catch (error) {
      console.error('Failed to load therapist data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTherapistData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchDashboardStats();
      fetchAnalytics();
    }
  }, [loading, fetchDashboardStats, fetchAnalytics]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.status-badge')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefreshData = async () => {
    await loadTherapistData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  // Payment toggle functions
  const handleMeetingPaymentToggle = async (meetingId: number, currentPaidStatus: boolean) => {
    try {
      console.log('🔄 Updating meeting payment status:', { meetingId, currentPaidStatus, newStatus: !currentPaidStatus });
      await meetings.updatePayment(meetingId, !currentPaidStatus);
      console.log('✅ Meeting payment status updated successfully');
      await fetchMeetings();
    } catch (error) {
      console.error('❌ Failed to update meeting payment status:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  const handlePersonalMeetingPaymentToggle = async (meetingId: number, currentPaidStatus: boolean) => {
    try {
      console.log('🔄 Updating personal meeting payment status:', { meetingId, currentPaidStatus, newStatus: !currentPaidStatus });
      await personalMeetings.updatePayment(meetingId, !currentPaidStatus);
      console.log('✅ Personal meeting payment status updated successfully');
      await fetchPersonalMeetings();
    } catch (error) {
      console.error('❌ Failed to update personal meeting payment status:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  const handleExpensePaymentToggle = async (expenseId: number, currentPaidStatus: boolean) => {
    try {
      console.log('🔄 Updating expense payment status:', { expenseId, currentPaidStatus, newStatus: !currentPaidStatus });
      if (currentPaidStatus) {
        await expenses.markAsUnpaid(expenseId);
      } else {
        await expenses.markAsPaid(expenseId);
      }
      console.log('✅ Expense payment status updated successfully');
      await fetchExpenses();
    } catch (error) {
      console.error('❌ Failed to update expense payment status:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  // Status update handlers
  const handleMeetingStatusUpdate = async (meetingId: number, newStatus: MeetingStatus) => {
    try {
      console.log('🔄 Updating meeting status:', { meetingId, newStatus });
      await meetings.update(meetingId, { status: newStatus });
      console.log('✅ Meeting status updated successfully');
      await fetchMeetings();
    } catch (error) {
      console.error('❌ Failed to update meeting status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handlePersonalMeetingStatusUpdate = async (meetingId: number, newStatus: PersonalMeetingStatus) => {
    try {
      console.log('🔄 Updating personal meeting status:', { meetingId, newStatus });
      await personalMeetings.update(meetingId, { status: newStatus });
      console.log('✅ Personal meeting status updated successfully');
      await fetchPersonalMeetings();
    } catch (error) {
      console.error('❌ Failed to update personal meeting status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // Status dropdown state
  const [statusDropdowns, setStatusDropdowns] = useState<{
    meetings: { [key: number]: boolean };
    personalMeetings: { [key: number]: boolean };
  }>({
    meetings: {},
    personalMeetings: {}
  });

  const toggleStatusDropdown = (type: 'meetings' | 'personalMeetings', id: number) => {
    setStatusDropdowns(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [id]: !prev[type][id]
      }
    }));
  };

  const closeAllDropdowns = () => {
    setStatusDropdowns({
      meetings: {},
      personalMeetings: {}
    });
  };

  const handleClientStatusToggle = async (clientId: number, currentActiveStatus: boolean) => {
    try {
      console.log('🔄 Updating client status:', { clientId, currentActiveStatus, newStatus: !currentActiveStatus });
      if (currentActiveStatus) {
        await clients.deactivate(clientId);
      } else {
        await clients.activate(clientId);
      }
      console.log('✅ Client status updated successfully');
      await fetchClients();
    } catch (error: any) {
      console.error('❌ Failed to update client status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update client status. Please try again.';
      alert(`Failed to update client status: ${errorMessage}`);
    }
  };

  // View modal handlers
  const handleViewClient = (client: Client) => {
    setViewClientModal({ isOpen: true, client });
  };

  const handleViewMeeting = (meeting: Meeting) => {
    setViewMeetingModal({ isOpen: true, meeting });
  };

  const handleViewPersonalMeeting = (meeting: PersonalMeeting) => {
    setViewPersonalMeetingModal({ isOpen: true, meeting });
  };

  const handleViewExpense = (expense: Expense) => {
    setViewExpenseModal({ isOpen: true, expense });
  };

  // Edit handlers
  const handleEditClient = (client: Client) => {
    setEditClientModal({ isOpen: true, client });
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditMeetingModal({ isOpen: true, meeting });
  };

  const handleEditPersonalMeeting = (meeting: PersonalMeeting) => {
    setEditPersonalMeetingModal({ isOpen: true, meeting });
  };

  const handleEditExpense = (expense: Expense) => {
    setEditExpenseModal({ isOpen: true, expense });
  };

  const closeViewModals = () => {
    setViewClientModal({ isOpen: false, client: null });
    setViewMeetingModal({ isOpen: false, meeting: null });
    setViewPersonalMeetingModal({ isOpen: false, meeting: null });
    setViewExpenseModal({ isOpen: false, expense: null });
  };

  const closeEditModals = () => {
    setEditClientModal({ isOpen: false, client: null });
    setEditMeetingModal({ isOpen: false, meeting: null });
    setEditPersonalMeetingModal({ isOpen: false, meeting: null });
    setEditExpenseModal({ isOpen: false, expense: null });
  };

  if (loading) {
    return (
      <div className="therapist-panel">
        <div className="therapist-loading">
          <div className="loading-spinner"></div>
          <p>Loading your therapy dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="therapist-panel">
      {/* Therapist Header */}
      <div className="therapist-header">
        <div className="therapist-header-left">
          <h2>🧘‍♀️ Therapy Dashboard</h2>
          <p>Welcome back, {user?.fullName || user?.username}! Manage your practice and personal development.</p>
        </div>
        <div className="therapist-header-right">
          <button className="btn-refresh" onClick={handleRefreshData}>
            🔄 Refresh
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Therapist Navigation Tabs */}
      <div className="therapist-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'tab-active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'clients' ? 'tab-active' : ''}
          onClick={() => setActiveTab('clients')}
        >
          🧑‍⚕️ Clients ({stats.totalClients})
        </button>
        <button 
          className={activeTab === 'meetings' ? 'tab-active' : ''}
          onClick={() => setActiveTab('meetings')}
        >
          📅 Sessions ({stats.totalMeetings})
        </button>
        <button 
          className={activeTab === 'personal-meetings' ? 'tab-active' : ''}
          onClick={() => setActiveTab('personal-meetings')}
        >
          🧘‍♀️ Personal ({stats.totalPersonalMeetings})
        </button>
        <button 
          className={activeTab === 'expenses' ? 'tab-active' : ''}
          onClick={() => setActiveTab('expenses')}
        >
          💰 Expenses ({stats.totalExpenses})
        </button>
        <button 
          className={activeTab === 'analytics' ? 'tab-active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button 
          className={activeTab === 'calendar' ? 'tab-active' : ''}
          onClick={() => setActiveTab('calendar')}
        >
          📆 Calendar
        </button>
      </div>

      {/* Therapist Content */}
      <div className="therapist-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="therapist-dashboard">
            <h3>📊 Practice Overview</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🧑‍⚕️</div>
                <div className="stat-content">
                  <h4>Total Clients</h4>
                  <div className="stat-value">{stats.totalClients}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h4>Today's Sessions</h4>
                  <div className="stat-value">{stats.todayMeetings}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h4>Monthly Revenue</h4>
                  <div className="stat-value">{formatCurrency(stats.monthlyRevenue)}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h4>Unpaid Sessions</h4>
                  <div className="stat-value">{stats.unpaidSessions}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🧘‍♀️</div>
                <div className="stat-content">
                  <h4>Personal Sessions</h4>
                  <div className="stat-value">{stats.totalPersonalMeetings}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💸</div>
                <div className="stat-content">
                  <h4>Total Expenses</h4>
                  <div className="stat-value">{stats.totalExpenses}</div>
                </div>
              </div>
            </div>


          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="therapist-clients">
            <div className="section-header">
              <h3>🧑‍⚕️ Client Management</h3>
              <p>Total Clients: {stats.totalClients}</p>
            </div>
            <div className="clients-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clientList.map((client) => (
                    <tr key={client.id}>
                      <td>{client.id}</td>
                      <td>{client.fullName}</td>
                      <td>{client.email || 'N/A'}</td>
                      <td>{client.phone || 'N/A'}</td>
                      <td>
                        <button
                          className={`status-badge ${client.active ? 'enabled' : 'disabled'}`}
                                        onClick={() => {
                console.log('🎯 Status button clicked for client:', client.id, 'Current status:', client.active);
                handleClientStatusToggle(client.id, client.active);
              }}
                          style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}
                        >
                          {client.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => {
                            console.log('🎯 View button clicked for client:', client.id);
                            handleViewClient(client);
                          }}
                        >
                          View
                        </button>
                        <button 
                          className="btn-small"
                          onClick={() => {
                            console.log('🎯 Edit button clicked for client:', client.id);
                            handleEditClient(client);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="therapist-meetings">
            <div className="section-header">
              <h3>📅 Session Management</h3>
              <p>Total Sessions: {stats.totalMeetings}</p>
            </div>
            <div className="meetings-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetingList.map((meeting) => (
                    <tr key={meeting.id}>
                      <td>{meeting.id}</td>
                      <td>{meeting.client.fullName}</td>
                      <td>{new Date(meeting.meetingDate).toLocaleString()}</td>
                      <td>{meeting.duration} min</td>
                      <td>{formatCurrency(meeting.price)}</td>
                                            <td style={{ position: 'relative' }}>
                        <button
                          className={`status-badge ${meeting.status?.toLowerCase() || 'unknown'}`}
                          onClick={() => toggleStatusDropdown('meetings', meeting.id)}
                          style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}
                        >
                          {meeting.status ? meeting.status.replace('_', ' ') : 'Scheduled'}
                        </button>
                        {statusDropdowns.meetings[meeting.id] && (
                          <div 
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: '0',
                              zIndex: 1000,
                              backgroundColor: 'white',
                              border: '1px solid #ddd',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              minWidth: '120px'
                            }}
                          >
                            <div
                              style={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => {
                                handleMeetingStatusUpdate(meeting.id, MeetingStatus.SCHEDULED);
                                closeAllDropdowns();
                              }}
                            >
                              Scheduled
                            </div>
                            <div
                              style={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => {
                                handleMeetingStatusUpdate(meeting.id, MeetingStatus.COMPLETED);
                                closeAllDropdowns();
                              }}
                            >
                              Completed
                            </div>
                            <div
                              style={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => {
                                handleMeetingStatusUpdate(meeting.id, MeetingStatus.CANCELLED);
                                closeAllDropdowns();
                              }}
                            >
                              Cancelled
                            </div>
                            <div
                              style={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => {
                                handleMeetingStatusUpdate(meeting.id, MeetingStatus.NO_SHOW);
                                closeAllDropdowns();
                              }}
                            >
                              No Show
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          className={`payment-badge ${meeting.isPaid ? 'paid' : 'unpaid'}`}
                          onClick={() => {
                            console.log('🎯 Payment button clicked for meeting:', meeting.id, 'Current status:', meeting.isPaid);
                            handleMeetingPaymentToggle(meeting.id, meeting.isPaid);
                          }}
                          style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}
                        >
                          {meeting.isPaid ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => {
                            console.log('🎯 View button clicked for meeting:', meeting.id);
                            handleViewMeeting(meeting);
                          }}
                        >
                          View
                        </button>
                        <button 
                          className="btn-small"
                          onClick={() => {
                            console.log('🎯 Edit button clicked for meeting:', meeting.id);
                            handleEditMeeting(meeting);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Personal Meetings Tab */}
        {activeTab === 'personal-meetings' && (
          <div className="therapist-personal-meetings">
            <div className="section-header">
              <h3>🧘‍♀️ Personal Development</h3>
              <p>Total Personal Sessions: {stats.totalPersonalMeetings}</p>
            </div>
            <div className="personal-meetings-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Provider</th>
                    <th>Type</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {personalMeetingList.map((meeting) => (
                    <tr key={meeting.id}>
                      <td>{meeting.id}</td>
                      <td>{meeting.therapistName}</td>
                      <td>{meeting.meetingType.replace('_', ' ')}</td>
                      <td>{new Date(meeting.meetingDate).toLocaleString()}</td>
                      <td>{meeting.duration} min</td>
                      <td>{formatCurrency(meeting.price)}</td>
                      <td style={{ position: 'relative' }}>
                        <button
                          className={`status-badge ${meeting.status?.toLowerCase() || 'unknown'}`}
                          onClick={() => toggleStatusDropdown('personalMeetings', meeting.id)}
                          style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}
                        >
                          {meeting.status ? meeting.status.replace('_', ' ') : 'Scheduled'}
                        </button>
                        {statusDropdowns.personalMeetings[meeting.id] && (
                          <div 
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: '0',
                              zIndex: 1000,
                              backgroundColor: 'white',
                              border: '1px solid #ddd',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              minWidth: '120px'
                            }}
                          >
                            <div
                              style={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => {
                                handlePersonalMeetingStatusUpdate(meeting.id, PersonalMeetingStatus.SCHEDULED);
                                closeAllDropdowns();
                              }}
                            >
                              Scheduled
                            </div>
                            <div
                              style={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => {
                                handlePersonalMeetingStatusUpdate(meeting.id, PersonalMeetingStatus.COMPLETED);
                                closeAllDropdowns();
                              }}
                            >
                              Completed
                            </div>
                            <div
                              style={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #eee',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => {
                                handlePersonalMeetingStatusUpdate(meeting.id, PersonalMeetingStatus.CANCELLED);
                                closeAllDropdowns();
                              }}
                            >
                              Cancelled
                            </div>
                            <div
                              style={{
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                              onClick={() => {
                                handlePersonalMeetingStatusUpdate(meeting.id, PersonalMeetingStatus.NO_SHOW);
                                closeAllDropdowns();
                              }}
                            >
                              No Show
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <button
                          className={`payment-badge ${meeting.isPaid ? 'paid' : 'unpaid'}`}
                          onClick={() => {
                            console.log('🎯 Payment button clicked for personal meeting:', meeting.id, 'Current status:', meeting.isPaid);
                            handlePersonalMeetingPaymentToggle(meeting.id, meeting.isPaid);
                          }}
                          style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}
                        >
                          {meeting.isPaid ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => {
                            console.log('🎯 View button clicked for personal meeting:', meeting.id);
                            handleViewPersonalMeeting(meeting);
                          }}
                        >
                          View
                        </button>
                        <button 
                          className="btn-small"
                          onClick={() => {
                            console.log('🎯 Edit button clicked for personal meeting:', meeting.id);
                            handleEditPersonalMeeting(meeting);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="therapist-expenses">
            <div className="section-header">
              <h3>💰 Expense Management</h3>
              <p>Total Expenses: {stats.totalExpenses}</p>
            </div>
            <div className="expenses-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseList.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.id}</td>
                      <td>{expense.name}</td>
                      <td>{formatCurrency(expense.amount)}</td>
                      <td>{expense.category}</td>
                      <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                      <td>
                        <button
                                        className={`payment-badge ${expense.paid ? 'paid' : 'unpaid'}`}
              onClick={() => {
                console.log('🎯 Payment button clicked for expense:', expense.id, 'Current status:', expense.paid);
                handleExpensePaymentToggle(expense.id, expense.paid);
              }}
                          style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}
                        >
                          {expense.paid ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => {
                            console.log('🎯 View button clicked for expense:', expense.id);
                            handleViewExpense(expense);
                          }}
                        >
                          View
                        </button>
                        <button 
                          className="btn-small"
                          onClick={() => {
                            console.log('🎯 Edit button clicked for expense:', expense.id);
                            handleEditExpense(expense);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="therapist-analytics">
            <div className="section-header">
              <h3>📊 Practice Analytics</h3>
              <p>Comprehensive insights into your practice performance</p>
              <div className="analytics-period-selector">
                <label>Period:</label>
                <select
                  value={analyticsPeriod}
                  onChange={(e) => setAnalyticsPeriod(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                  className="period-select"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
            
            {/* Revenue Analytics */}
            {analytics.revenueStats && (
              <div className="analytics-section">
                <h4>💰 Revenue Analytics</h4>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-icon">💵</div>
                    <div className="analytics-content">
                      <h5>Total Revenue</h5>
                      <div className="analytics-value">{formatCurrency(analytics.revenueStats.totalRevenue)}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">✅</div>
                    <div className="analytics-content">
                      <h5>Paid Revenue</h5>
                      <div className="analytics-value">{formatCurrency(analytics.revenueStats.paidRevenue)}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">⏳</div>
                    <div className="analytics-content">
                      <h5>Pending Revenue</h5>
                      <div className="analytics-value">{formatCurrency(analytics.revenueStats.unpaidRevenue)}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">📈</div>
                    <div className="analytics-content">
                      <h5>Collection Rate</h5>
                      <div className="analytics-value">
                        {analytics.revenueStats.totalRevenue > 0 
                          ? Math.round((analytics.revenueStats.paidRevenue / analytics.revenueStats.totalRevenue) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Session Analytics */}
            {analytics.meetingStats && (
              <div className="analytics-section">
                <h4>📅 Session Analytics</h4>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-icon">📊</div>
                    <div className="analytics-content">
                      <h5>Total Sessions</h5>
                      <div className="analytics-value">{analytics.meetingStats.total}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">✅</div>
                    <div className="analytics-content">
                      <h5>Completed</h5>
                      <div className="analytics-value">{analytics.meetingStats.completed}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">📅</div>
                    <div className="analytics-content">
                      <h5>Scheduled</h5>
                      <div className="analytics-value">{analytics.meetingStats.scheduled}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">💰</div>
                    <div className="analytics-content">
                      <h5>Average Price</h5>
                      <div className="analytics-value">{formatCurrency(analytics.meetingStats.averagePrice)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Client Analytics */}
            {analytics.clientStats && (
              <div className="analytics-section">
                <h4>👥 Client Analytics</h4>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-icon">👥</div>
                    <div className="analytics-content">
                      <h5>Total Clients</h5>
                      <div className="analytics-value">{analytics.clientStats.total}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">✅</div>
                    <div className="analytics-content">
                      <h5>Active Clients</h5>
                      <div className="analytics-value">{analytics.clientStats.active}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">🆕</div>
                    <div className="analytics-content">
                      <h5>New This Month</h5>
                      <div className="analytics-value">{analytics.clientStats.newThisMonth}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">📊</div>
                    <div className="analytics-content">
                      <h5>Retention Rate</h5>
                      <div className="analytics-value">
                        {analytics.clientStats.total > 0 
                          ? Math.round((analytics.clientStats.active / analytics.clientStats.total) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Expense Analytics */}
            {analytics.expenseStats && (
              <div className="analytics-section">
                <h4>💸 Expense Analytics</h4>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-icon">💸</div>
                    <div className="analytics-content">
                      <h5>Total Expenses</h5>
                      <div className="analytics-value">{formatCurrency(analytics.expenseStats.totalAmount)}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">✅</div>
                    <div className="analytics-content">
                      <h5>Paid Expenses</h5>
                      <div className="analytics-value">{formatCurrency(analytics.expenseStats.paidAmount)}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">⏳</div>
                    <div className="analytics-content">
                      <h5>Pending Expenses</h5>
                      <div className="analytics-value">{formatCurrency(analytics.expenseStats.unpaidAmount)}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">📊</div>
                    <div className="analytics-content">
                      <h5>Payment Rate</h5>
                      <div className="analytics-value">
                        {analytics.expenseStats.totalAmount > 0 
                          ? Math.round((analytics.expenseStats.paidAmount / analytics.expenseStats.totalAmount) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Development Analytics */}
            {analytics.personalMeetingStats && (
              <div className="analytics-section">
                <h4>🧘‍♀️ Personal Development Analytics</h4>
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <div className="analytics-icon">🧘‍♀️</div>
                    <div className="analytics-content">
                      <h5>Total Sessions</h5>
                      <div className="analytics-value">{analytics.personalMeetingStats.total}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">💰</div>
                    <div className="analytics-content">
                      <h5>Total Spent</h5>
                      <div className="analytics-value">{formatCurrency(analytics.personalMeetingStats.totalSpent)}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">✅</div>
                    <div className="analytics-content">
                      <h5>Paid Sessions</h5>
                      <div className="analytics-value">{analytics.personalMeetingStats.paid}</div>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-icon">📊</div>
                    <div className="analytics-content">
                      <h5>Payment Rate</h5>
                      <div className="analytics-value">
                        {analytics.personalMeetingStats.total > 0 
                          ? Math.round((analytics.personalMeetingStats.paid / analytics.personalMeetingStats.total) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="therapist-calendar">
            <div className="section-header">
              <h3>📆 Calendar View</h3>
              <p>All sessions and appointments</p>
            </div>
            <Calendar meetings={meetingList} onClose={() => setActiveTab('dashboard')} />
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showMeetingPanel && (
        <MeetingPanel 
          onClose={() => setShowMeetingPanel(false)}
          onRefresh={fetchMeetings}
        />
      )}

      {showPersonalMeetingPanel && (
        <PersonalMeetingPanel 
          onClose={() => setShowPersonalMeetingPanel(false)}
          onRefresh={fetchPersonalMeetings}
        />
      )}

      {showExpensePanel && (
        <ExpensePanel 
          onClose={() => setShowExpensePanel(false)}
          onRefresh={fetchExpenses}
        />
      )}

      {showCalendar && (
        <div className="modal-overlay">
          <div className="modal calendar-modal">
            <div className="modal-header">
              <h3>📆 Calendar View</h3>
              <button className="close-button" onClick={() => setShowCalendar(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <Calendar meetings={meetingList} onClose={() => setShowCalendar(false)} />
            </div>
          </div>
        </div>
      )}

      {/* View Modals */}
      <ViewClientModal
        client={viewClientModal.client}
        isOpen={viewClientModal.isOpen}
        onClose={closeViewModals}
      />

      <ViewMeetingModal
        meeting={viewMeetingModal.meeting}
        isOpen={viewMeetingModal.isOpen}
        onClose={closeViewModals}
      />

      <ViewPersonalMeetingModal
        meeting={viewPersonalMeetingModal.meeting}
        isOpen={viewPersonalMeetingModal.isOpen}
        onClose={closeViewModals}
      />

      <ExpenseDetailsModal
        expense={viewExpenseModal.expense}
        isOpen={viewExpenseModal.isOpen}
        onClose={closeViewModals}
      />

      {/* Edit Modals */}
      <EditClientModal
        client={editClientModal.client}
        isOpen={editClientModal.isOpen}
        onClose={closeEditModals}
        onSuccess={handleRefreshData}
      />

      <EditMeetingModal
        meeting={editMeetingModal.meeting}
        isOpen={editMeetingModal.isOpen}
        onClose={closeEditModals}
        onSuccess={handleRefreshData}
      />

      <EditPersonalMeetingModal
        meeting={editPersonalMeetingModal.meeting}
        isOpen={editPersonalMeetingModal.isOpen}
        onClose={closeEditModals}
        onSuccess={handleRefreshData}
      />

      <EditExpenseModal
        expense={editExpenseModal.expense}
        isOpen={editExpenseModal.isOpen}
        onClose={closeEditModals}
        onSuccess={handleRefreshData}
      />
    </div>
  );
};

export default TherapistPanel; 