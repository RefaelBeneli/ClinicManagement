import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MeetingPanel from './MeetingPanel';
import PersonalMeetingPanel from './PersonalMeetingPanel';
import SessionPanel from './SessionPanel';
import ClientPanel from './ClientPanel';
import ExpensePanel from './ExpensePanel';
import Calendar from './Calendar';
import AnalyticsPanel from './AnalyticsPanel';
import { clients, meetings, personalMeetings, expenses, paymentTypes as paymentTypesApi } from '../services/api';
import { 
  Client, 
  Meeting, 
  PersonalMeeting, 
  Expense, 
  MeetingStatus, 
  PersonalMeetingStatus, 
  PersonalMeetingType, 
  ClientSourceResponse, 
  PaymentType 
} from '../types';
import ViewClientModal from './ui/ViewClientModal';
import ViewMeetingModal from './ui/ViewMeetingModal';
import ViewPersonalMeetingModal from './ui/ViewPersonalMeetingModal';
import ExpenseDetailsModal from './ui/ExpenseDetailsModal';
import EditClientModal from './ui/EditClientModal';
import EditMeetingModal from './ui/EditMeetingModal';
import EditPersonalMeetingModal from './ui/EditPersonalMeetingModal';
import EditExpenseModal from './ui/EditExpenseModal';
import AddClientModal from './ui/AddClientModal';
import AddSessionModal from './ui/AddSessionModal';
import AddPersonalMeetingModal from './ui/AddPersonalMeetingModal';
import './TherapistPanel.css';

const TherapistPanel: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clientList, setClientList] = useState<Client[]>([]);
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const [personalMeetingList, setPersonalMeetingList] = useState<PersonalMeeting[]>([]);
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [meetingSources, setMeetingSources] = useState<ClientSourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'meetings' | 'personal-meetings' | 'expenses' | 'analytics' | 'calendar'>('dashboard');
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  
  // Panel states
  const [showMeetingPanel, setShowMeetingPanel] = useState(false);
  const [showPersonalMeetingPanel, setShowPersonalMeetingPanel] = useState(false);
  const [showSessionPanel, setShowSessionPanel] = useState(false);
  const [showClientPanel, setShowClientPanel] = useState(false);
  const [showExpensePanel, setShowExpensePanel] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showAddPersonalMeetingModal, setShowAddPersonalMeetingModal] = useState(false);
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

  // Add new modal states
  const [addClientModal, setAddClientModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [addMeetingModal, setAddMeetingModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [addPersonalMeetingModal, setAddPersonalMeetingModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [addExpenseModal, setAddExpenseModal] = useState(false);

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      console.log('🔄 Fetching meetings from server...');
      const meetingsData = await meetings.getAll();
      console.log('📋 Fetched meetings data:', meetingsData);
      console.log('📋 Meetings active status:', meetingsData.map(m => ({ id: m.id, active: m.active })));
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

  const fetchMeetingSources = async () => {
    try {
      const sources = await meetings.getActiveSources();
      setMeetingSources(sources);
    } catch (error) {
      console.error('❌ Failed to fetch meeting sources:', error);
    }
  };

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

  const loadTherapistData = useCallback(async () => {
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
  }, [fetchClients, fetchMeetings, fetchPersonalMeetings, fetchExpenses]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchClients(),
          fetchMeetings(),
          fetchPersonalMeetings(),
          fetchExpenses(),
          fetchMeetingSources()
        ]);
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const formatPaymentDate = (meeting: Meeting) => {
    if (meeting.isPaid && meeting.paymentDate) {
      return new Date(meeting.paymentDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (meeting.isPaid) {
      return 'Paid (No date)';
    } else {
      return '-';
    }
  };

  const getPaymentDateStyle = (meeting: Meeting) => {
    if (meeting.isPaid && meeting.paymentDate) {
      return { fontSize: '0.75rem', color: '#059669', fontWeight: '500' };
    } else if (meeting.isPaid) {
      return { fontSize: '0.75rem', color: '#f59e0b', fontStyle: 'italic' };
    } else {
      return { fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' };
    }
  };

  const getSourceName = (meeting: Meeting) => {
    return meeting.source?.name || 'Unknown Source';
  };

  // Payment toggle functions
  const handleMeetingPaymentToggle = async (meetingId: number, currentPaidStatus: boolean) => {
    try {
      console.log('🎯 Payment button clicked for meeting:', meetingId, 'Current status:', currentPaidStatus);
      if (currentPaidStatus) {
        // Mark as unpaid - use updatePayment for simplicity
        console.log('💰 Marking as unpaid - direct update');
        await meetings.updatePayment(meetingId, false);
      } else {
        // Mark as paid - show payment type selection modal
        console.log('💰 Marking as paid - showing payment type modal');
        try {
          const paymentTypes = await paymentTypesApi.getAll();
          console.log('✅ Payment types fetched:', paymentTypes);
          setPaymentTypes(paymentTypes);
        } catch (error) {
          console.log('⚠️ Failed to fetch payment types from API, using fallback:', error);
          // Fallback payment types if API fails
          const fallbackPaymentTypes: PaymentType[] = [
            { id: 1, name: 'Bank Transfer', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 2, name: 'Bit', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 3, name: 'Paybox', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 4, name: 'Cash', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ];
          console.log('✅ Using fallback payment types:', fallbackPaymentTypes);
          setPaymentTypes(fallbackPaymentTypes);
        }
        setSelectedPaymentType(null);
        setShowPaymentTypeModal(true);
        const session = meetingList.find(m => m.id === meetingId);
        setSessionToPay(session || null);
        console.log('✅ Session found:', session?.client?.fullName);
      }
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

  const handleClientNameUpdate = async (clientId: number, fullName: string) => {
    try {
      await clients.update(clientId, { fullName });
      await fetchClients();
    } catch (error: any) {
      console.error('Error updating client name:', error);
      alert('Failed to update client name');
    }
  };

  const handleClientEmailUpdate = async (clientId: number, email: string) => {
    try {
      await clients.update(clientId, { email });
      await fetchClients();
    } catch (error: any) {
      console.error('Error updating client email:', error);
      alert('Failed to update client email');
    }
  };

  const handleClientPhoneUpdate = async (clientId: number, phone: string) => {
    try {
      await clients.update(clientId, { phone });
      await fetchClients();
    } catch (error: any) {
      console.error('Error updating client phone:', error);
      alert('Failed to update client phone');
    }
  };

  const handlePersonalMeetingTherapistUpdate = async (meetingId: number, therapistName: string) => {
    try {
      await personalMeetings.update(meetingId, { therapistName });
      await fetchPersonalMeetings();
    } catch (error: any) {
      console.error('Error updating therapist name:', error);
      alert('Failed to update therapist name');
    }
  };

  const handlePersonalMeetingTypeUpdate = async (meetingId: number, meetingType: PersonalMeetingType) => {
    try {
      await personalMeetings.update(meetingId, { meetingType });
      await fetchPersonalMeetings();
    } catch (error: any) {
      console.error('Error updating meeting type:', error);
      alert('Failed to update meeting type');
    }
  };

  const handlePersonalMeetingDateUpdate = async (meetingId: number, meetingDate: string) => {
    try {
      await personalMeetings.update(meetingId, { meetingDate });
      await fetchPersonalMeetings();
    } catch (error: any) {
      console.error('Error updating meeting date:', error);
      alert('Failed to update meeting date');
    }
  };

  const handlePersonalMeetingDurationUpdate = async (meetingId: number, duration: number) => {
    try {
      await personalMeetings.update(meetingId, { duration });
      await fetchPersonalMeetings();
    } catch (error: any) {
      console.error('Error updating duration:', error);
      alert('Failed to update duration');
    }
  };

  const handlePersonalMeetingPriceUpdate = async (meetingId: number, price: number) => {
    try {
      await personalMeetings.update(meetingId, { price });
      await fetchPersonalMeetings();
    } catch (error: any) {
      console.error('Error updating price:', error);
      alert('Failed to update price');
    }
  };

  const handleExpenseNameUpdate = async (expenseId: number, name: string) => {
    try {
      await expenses.update(expenseId, { name });
      await fetchExpenses();
    } catch (error: any) {
      console.error('Error updating expense name:', error);
      alert('Failed to update expense name');
    }
  };

  const handleExpenseAmountUpdate = async (expenseId: number, amount: number) => {
    try {
      await expenses.update(expenseId, { amount });
      await fetchExpenses();
    } catch (error: any) {
      console.error('Error updating expense amount:', error);
      alert('Failed to update expense amount');
    }
  };

  const handleExpenseCategoryUpdate = async (expenseId: number, category: string) => {
    try {
      await expenses.update(expenseId, { category });
      await fetchExpenses();
    } catch (error: any) {
      console.error('Error updating expense category:', error);
      alert('Failed to update expense category');
    }
  };

  const handleExpenseDateUpdate = async (expenseId: number, expenseDate: string) => {
    try {
      await expenses.update(expenseId, { expenseDate });
      await fetchExpenses();
    } catch (error: any) {
      console.error('Error updating expense date:', error);
      alert('Failed to update expense date');
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

  // Add new handlers
  const handleAddClient = () => {
    setAddClientModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddMeeting = () => {
    setShowMeetingPanel(true);
  };

  const handleAddSession = () => {
    setShowAddSessionModal(true);
  };

  const handleAddPersonalMeeting = () => {
    setShowAddPersonalMeetingModal(true);
  };

  const handleAddExpense = () => {
    setAddExpenseModal(true);
  };

  const closeAddModals = () => {
    setAddClientModal(false);
    setShowMeetingPanel(false);
    setShowPersonalMeetingPanel(false);
    setShowExpensePanel(false);
    setShowAddSessionModal(false);
    setShowAddPersonalMeetingModal(false);
    setAddExpenseModal(false);
  };

  // Delete handlers (soft delete)
  const handleDeleteClient = async (clientId: number) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await clients.disable(clientId);
        console.log('✅ Client deleted successfully');
        // Update the local state immediately for visual feedback
        setClientList(prev => prev.map(client => 
          client.id === clientId ? { ...client, active: false } : client
        ));
        await fetchClients(); // Refresh the list
      } catch (error) {
        console.error('❌ Failed to delete client:', error);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  const handleDeleteMeeting = async (meetingId: number) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        console.log('🔄 Disabling meeting:', meetingId);
        await meetings.disable(meetingId);
        console.log('✅ Meeting disabled successfully via API');
        
        // Update the local state immediately for visual feedback
        setMeetingList(prev => {
          const updated = prev.map(meeting => 
            meeting.id === meetingId ? { ...meeting, active: false } : meeting
          );
          console.log('🔄 Updated meeting list:', updated.map(m => ({ id: m.id, active: m.active })));
          return updated;
        });
        
        // Refresh the list from server
        console.log('🔄 Refreshing meetings from server...');
        await fetchMeetings();
        console.log('✅ Meetings refreshed from server');
      } catch (error) {
        console.error('❌ Failed to delete meeting:', error);
        alert('Failed to delete session. Please try again.');
      }
    }
  };

  const handleDeletePersonalMeeting = async (meetingId: number) => {
    if (window.confirm('Are you sure you want to delete this personal session? This action cannot be undone.')) {
      try {
        await personalMeetings.disable(meetingId);
        console.log('✅ Personal meeting deleted successfully');
        // Update the local state immediately for visual feedback
        setPersonalMeetingList(prev => prev.map(meeting => 
          meeting.id === meetingId ? { ...meeting, active: false } : meeting
        ));
        await fetchPersonalMeetings(); // Refresh the list
      } catch (error) {
        console.error('❌ Failed to delete personal meeting:', error);
        alert('Failed to delete personal session. Please try again.');
      }
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      try {
        await expenses.disable(expenseId);
        console.log('✅ Expense deleted successfully');
        // Update the local state immediately for visual feedback
        setExpenseList(prev => prev.map(expense => 
          expense.id === expenseId ? { ...expense, active: false } : expense
        ));
        await fetchExpenses(); // Refresh the list
      } catch (error) {
        console.error('❌ Failed to delete expense:', error);
        alert('Failed to delete expense. Please try again.');
      }
    }
  };

  // Restore handlers
  const handleRestoreClient = async (clientId: number) => {
    try {
      await clients.activate(clientId);
      console.log('✅ Client restored successfully');
      // Update the local state immediately for visual feedback
      setClientList(prev => prev.map(client => 
        client.id === clientId ? { ...client, active: true } : client
      ));
      await fetchClients(); // Refresh the list
    } catch (error) {
      console.error('❌ Failed to restore client:', error);
      alert('Failed to restore client. Please try again.');
    }
  };

  const handleRestoreMeeting = async (meetingId: number) => {
    try {
      await meetings.activate(meetingId);
      console.log('✅ Meeting restored successfully');
      // Update the local state immediately for visual feedback
      setMeetingList(prev => prev.map(meeting => 
        meeting.id === meetingId ? { ...meeting, active: true } : meeting
      ));
      await fetchMeetings(); // Refresh the list
    } catch (error) {
      console.error('❌ Failed to restore meeting:', error);
      alert('Failed to restore session. Please try again.');
    }
  };

  const handleRestorePersonalMeeting = async (meetingId: number) => {
    try {
      await personalMeetings.activate(meetingId);
      console.log('✅ Personal meeting restored successfully');
      // Update the local state immediately for visual feedback
      setPersonalMeetingList(prev => prev.map(meeting => 
        meeting.id === meetingId ? { ...meeting, active: true } : meeting
      ));
      await fetchPersonalMeetings(); // Refresh the list
    } catch (error) {
      console.error('❌ Failed to restore personal meeting:', error);
      alert('Failed to restore personal session. Please try again.');
    }
  };

  const handleRestoreExpense = async (expenseId: number) => {
    try {
      await expenses.activate(expenseId);
      console.log('✅ Expense restored successfully');
      // Update the local state immediately for visual feedback
      setExpenseList(prev => prev.map(expense => 
        expense.id === expenseId ? { ...expense, active: true } : expense
      ));
      await fetchExpenses(); // Refresh the list
    } catch (error) {
      console.error('❌ Failed to restore expense:', error);
      alert('Failed to restore expense. Please try again.');
    }
  };

  // Meeting update handlers for inline editing
  const handleMeetingClientUpdate = async (meetingId: number, clientId: number) => {
    try {
      console.log('🔄 Updating meeting client:', { meetingId, clientId });
      await meetings.update(meetingId, { clientId });
      console.log('✅ Meeting client updated successfully');
      await fetchMeetings();
    } catch (error) {
      console.error('❌ Failed to update meeting client:', error);
      alert('Failed to update client. Please try again.');
    }
  };

  const handleMeetingDateUpdate = async (meetingId: number, meetingDate: string) => {
    try {
      console.log('🔄 Updating meeting date:', { meetingId, meetingDate });
      await meetings.update(meetingId, { meetingDate });
      console.log('✅ Meeting date updated successfully');
      await fetchMeetings();
    } catch (error) {
      console.error('❌ Failed to update meeting date:', error);
      alert('Failed to update date. Please try again.');
    }
  };

  const handleMeetingDurationUpdate = async (meetingId: number, duration: number) => {
    try {
      console.log('🔄 Updating meeting duration:', { meetingId, duration });
      await meetings.update(meetingId, { duration });
      console.log('✅ Meeting duration updated successfully');
      await fetchMeetings();
    } catch (error) {
      console.error('❌ Failed to update meeting duration:', error);
      alert('Failed to update duration. Please try again.');
    }
  };

  const handleMeetingPriceUpdate = async (meetingId: number, price: number) => {
    try {
      const updatedMeeting = await meetings.update(meetingId, { price });
      setMeetingList(prev =>
        prev.map(meeting => meeting.id === meetingId ? updatedMeeting : meeting)
      );
      await fetchMeetings();
    } catch (error) {
      console.error('Failed to update meeting price:', error);
    }
  };

  const formatPaymentType = (meeting: Meeting) => {
    if (meeting.isPaid && meeting.paymentType) {
      return meeting.paymentType.name;
    } else if (meeting.isPaid) {
      return 'Paid (No type)';
    } else {
      return 'Unpaid';
    }
  };

  const getPaymentTypeStyle = (meeting: Meeting) => {
    if (meeting.isPaid && meeting.paymentType) {
      return 'paid';
    } else if (meeting.isPaid) {
      return 'paid-no-type';
    } else {
      return 'unpaid';
    }
  };

  // Payment type selection modal state
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
  const [sessionToPay, setSessionToPay] = useState<Meeting | null>(null);

  const handlePaymentTypeSelect = (type: PaymentType) => {
    setSelectedPaymentType(type);
  };

  const handleConfirmPaymentType = async () => {
    if (selectedPaymentType && sessionToPay) {
      try {
        console.log('💰 Confirming payment type:', selectedPaymentType.name, 'for session:', sessionToPay.id);
        const updateData = {
          isPaid: true,
          paymentTypeId: selectedPaymentType.id
        };
        console.log('🔧 Update data:', updateData);
        await meetings.update(sessionToPay.id, updateData);
        console.log('✅ Meeting payment type updated successfully');
        await fetchMeetings();
        setShowPaymentTypeModal(false);
        setSelectedPaymentType(null);
        setSessionToPay(null);
      } catch (error) {
        console.error('❌ Failed to update meeting payment type:', error);
        alert('Failed to update payment type. Please try again.');
      }
    }
  };

  const handleCancelPaymentType = () => {
    console.log('❌ Payment type selection cancelled');
    setShowPaymentTypeModal(false);
    setSelectedPaymentType(null);
    setSessionToPay(null);
  };

  // Debug modal state changes
  useEffect(() => {
    console.log('🔍 Modal state changed:', {
      showPaymentTypeModal,
      sessionToPay: sessionToPay?.client?.fullName,
      paymentTypesCount: paymentTypes.length
    });
  }, [showPaymentTypeModal, sessionToPay, paymentTypes.length]);

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
              <div>
                <h3>🧑‍⚕️ Client Management</h3>
                <p>Total Clients: {stats.totalClients}</p>
              </div>
              <div className="section-actions">
                <button 
                  className="btn-primary"
                  onClick={handleAddClient}
                >
                  ➕ Add New Client
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowClientPanel(true)}
                >
                  📊 Client Management
                </button>
              </div>
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
                    <tr key={client.id} className={!client.active ? 'disabled-item' : ''}>
                      <td>{client.id}</td>
                      <td>
                        <input
                          type="text"
                          value={client.fullName}
                          onChange={(e) => handleClientNameUpdate(client.id, e.target.value)}
                          className="inline-input"
                          disabled={!client.active}
                        />
                      </td>
                      <td>
                        <input
                          type="email"
                          value={client.email || ''}
                          onChange={(e) => handleClientEmailUpdate(client.id, e.target.value)}
                          className="inline-input"
                          placeholder="Enter email"
                          disabled={!client.active}
                        />
                      </td>
                      <td>
                        <input
                          type="tel"
                          value={client.phone || ''}
                          onChange={(e) => handleClientPhoneUpdate(client.id, e.target.value)}
                          className="inline-input"
                          placeholder="Enter phone"
                          disabled={!client.active}
                        />
                      </td>
                      <td>
                        <button
                          className={`status-badge ${client.active ? 'enabled' : 'disabled'}`}
                          onClick={() => {
                            console.log('🎯 Status button clicked for client:', client.id, 'Current status:', client.active);
                            handleClientStatusToggle(client.id, client.active);
                          }}
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
                        {client.active ? (
                          <button 
                            className="btn-small"
                            style={{ backgroundColor: '#dc3545', color: 'white' }}
                            onClick={() => {
                              console.log('🎯 Delete button clicked for client:', client.id);
                              handleDeleteClient(client.id);
                            }}
                          >
                            Delete
                          </button>
                        ) : (
                          <button 
                            className="btn-small btn-restore"
                            style={{ backgroundColor: '#28a745', color: 'white' }}
                            onClick={() => {
                              console.log('🎯 Restore button clicked for client:', client.id);
                              handleRestoreClient(client.id);
                            }}
                          >
                            Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'meetings' && (
          <div className="therapist-meetings">
            <div className="section-header">
              <div>
                <h3>📅 Session Management</h3>
                <p>Total Sessions: {stats.totalMeetings}</p>
              </div>
              <div className="button-group">
                <button 
                  className="btn-primary"
                  onClick={handleAddSession}
                >
                  ➕ Add New Session
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowSessionPanel(true)}
                >
                  📊 Sessions Management
                </button>
              </div>
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
                    <th>Payment Type</th>
                    <th>Source</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {meetingList.map((meeting) => (
                    <tr key={meeting.id} className={meeting.active === false ? 'disabled-item' : ''} style={meeting.active === false ? { opacity: 0.6, backgroundColor: '#f8f9fa', borderLeft: '4px solid #dc3545' } : {}}>
                      <td>{meeting.id}</td>
                      <td>
                        <select
                          value={meeting.client.id}
                          onChange={(e) => handleMeetingClientUpdate(meeting.id, parseInt(e.target.value) || 0)}
                          className="inline-select"
                          disabled={meeting.active === false}
                        >
                          {clientList.map(client => (
                            <option key={client.id} value={client.id}>{client.fullName}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="datetime-local"
                          value={meeting.meetingDate.split('T')[0] + 'T' + meeting.meetingDate.split('T')[1]?.substring(0, 5) || ''}
                          onChange={(e) => handleMeetingDateUpdate(meeting.id, e.target.value)}
                          className="inline-input"
                          disabled={meeting.active === false}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="15"
                          max="300"
                          value={meeting.duration}
                          onChange={(e) => handleMeetingDurationUpdate(meeting.id, parseInt(e.target.value) || 60)}
                          className="inline-input"
                          disabled={meeting.active === false}
                        />
                        <span>min</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={meeting.price}
                          onChange={(e) => handleMeetingPriceUpdate(meeting.id, parseFloat(e.target.value) || 0)}
                          className="inline-input"
                          disabled={meeting.active === false}
                        />
                      </td>
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
                        <span className={`payment-date-cell ${
                          meeting.isPaid && meeting.paymentType ? 'paid' : 
                          meeting.isPaid ? 'paid-no-type' : 'unpaid'
                        }`}>
                          {formatPaymentType(meeting)}
                        </span>
                      </td>
                      <td>
                        <span>Source: {meeting.client?.source?.name || 'No source'}</span>
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
                        {meeting.active !== false ? (
                          <button 
                            className="btn-small"
                            style={{ backgroundColor: '#dc3545', color: 'white' }}
                            onClick={() => {
                              console.log('🎯 Delete button clicked for meeting:', meeting.id);
                              handleDeleteMeeting(meeting.id);
                            }}
                          >
                            Delete
                          </button>
                        ) : (
                          <button 
                            className="btn-small btn-restore"
                            style={{ backgroundColor: '#28a745', color: 'white' }}
                            onClick={() => {
                              console.log('🎯 Restore button clicked for meeting:', meeting.id);
                              handleRestoreMeeting(meeting.id);
                            }}
                          >
                            Restore
                          </button>
                        )}
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
              <div>
                <h3>🧘‍♀️ Personal Development</h3>
                <p>Total Personal Sessions: {stats.totalPersonalMeetings}</p>
              </div>
              <div className="button-group">
                <button 
                  className="btn-primary"
                  onClick={handleAddPersonalMeeting}
                >
                  ➕ Add New Personal Session
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowPersonalMeetingPanel(true)}
                >
                  📊 Personal Sessions Manager
                </button>
              </div>
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
                    <tr key={meeting.id} className={meeting.active === false ? 'disabled-item' : ''} style={meeting.active === false ? { opacity: 0.6, backgroundColor: '#f8f9fa', borderLeft: '4px solid #dc3545' } : {}}>
                      <td>{meeting.id}</td>
                      <td>
                        <input
                          type="text"
                          value={meeting.therapistName}
                          onChange={(e) => handlePersonalMeetingTherapistUpdate(meeting.id, e.target.value)}
                          className="inline-input"
                          disabled={meeting.active === false}
                        />
                      </td>
                      <td>
                        <select
                          value={meeting.meetingType}
                          onChange={(e) => handlePersonalMeetingTypeUpdate(meeting.id, e.target.value as PersonalMeetingType)}
                          className="inline-select"
                          disabled={meeting.active === false}
                        >
                          <option value={PersonalMeetingType.PERSONAL_THERAPY}>Personal Therapy</option>
                          <option value={PersonalMeetingType.PROFESSIONAL_DEVELOPMENT}>Professional Development</option>
                          <option value={PersonalMeetingType.SUPERVISION}>Supervision</option>
                          <option value={PersonalMeetingType.TEACHING_SESSION}>Teaching Session</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="datetime-local"
                          value={meeting.meetingDate.split('T')[0] + 'T' + meeting.meetingDate.split('T')[1]?.substring(0, 5) || ''}
                          onChange={(e) => handlePersonalMeetingDateUpdate(meeting.id, e.target.value)}
                          className="inline-input"
                          disabled={meeting.active === false}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="15"
                          max="300"
                          value={meeting.duration}
                          onChange={(e) => handlePersonalMeetingDurationUpdate(meeting.id, parseInt(e.target.value) || 60)}
                          className="inline-input"
                          disabled={meeting.active === false}
                        />
                        <span>min</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={meeting.price}
                          onChange={(e) => handlePersonalMeetingPriceUpdate(meeting.id, parseFloat(e.target.value) || 0)}
                          className="inline-input"
                          disabled={meeting.active === false}
                        />
                      </td>
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
                        {meeting.active !== false ? (
                          <button 
                            className="btn-small"
                            style={{ backgroundColor: '#dc3545', color: 'white' }}
                            onClick={() => {
                              console.log('🎯 Delete button clicked for personal meeting:', meeting.id);
                              handleDeletePersonalMeeting(meeting.id);
                            }}
                          >
                            Delete
                          </button>
                        ) : (
                          <button 
                            className="btn-small btn-restore"
                            style={{ backgroundColor: '#28a745', color: 'white' }}
                            onClick={() => {
                              console.log('🎯 Restore button clicked for personal meeting:', meeting.id);
                              handleRestorePersonalMeeting(meeting.id);
                            }}
                          >
                            Restore
                          </button>
                        )}
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
              <div>
                <h3>💰 Expense Management</h3>
                <p>Total Expenses: {stats.totalExpenses}</p>
              </div>
              <div className="section-actions">
                <button 
                  className="btn-primary"
                  onClick={handleAddExpense}
                >
                  ➕ Add New Expense
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowExpensePanel(true)}
                >
                  📊 Expense Management
                </button>
              </div>
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
                    <tr key={expense.id} className={expense.active === false ? 'disabled-item' : ''} style={expense.active === false ? { opacity: 0.6, backgroundColor: '#f8f9fa', borderLeft: '4px solid #dc3545' } : {}}>
                      <td>{expense.id}</td>
                      <td>
                        <input
                          type="text"
                          value={expense.name}
                          onChange={(e) => handleExpenseNameUpdate(expense.id, e.target.value)}
                          className="inline-input"
                          disabled={expense.active === false}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={expense.amount}
                          onChange={(e) => handleExpenseAmountUpdate(expense.id, parseFloat(e.target.value) || 0)}
                          className="inline-input"
                          disabled={expense.active === false}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={expense.category}
                          onChange={(e) => handleExpenseCategoryUpdate(expense.id, e.target.value)}
                          className="inline-input"
                          disabled={expense.active === false}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={expense.expenseDate.split('T')[0]}
                          onChange={(e) => handleExpenseDateUpdate(expense.id, e.target.value)}
                          className="inline-input"
                          disabled={expense.active === false}
                        />
                      </td>
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
                        {expense.active !== false ? (
                          <button 
                            className="btn-small"
                            style={{ backgroundColor: '#dc3545', color: 'white' }}
                            onClick={() => {
                              console.log('🎯 Delete button clicked for expense:', expense.id);
                              handleDeleteExpense(expense.id);
                            }}
                          >
                            Delete
                          </button>
                        ) : (
                          <button 
                            className="btn-small btn-restore"
                            style={{ backgroundColor: '#28a745', color: 'white' }}
                            onClick={() => {
                              console.log('🎯 Restore button clicked for expense:', expense.id);
                              handleRestoreExpense(expense.id);
                            }}
                          >
                            Restore
                          </button>
                        )}
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
          <AnalyticsPanel onClose={() => setActiveTab('dashboard')} />
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="therapist-calendar">
            <div className="section-header">
              <h3>📆 Calendar View</h3>
              <p>All sessions and appointments</p>
            </div>
            <Calendar 
              meetings={meetingList} 
              personalMeetings={personalMeetingList}
              onClose={() => setActiveTab('dashboard')}
              onMeetingClick={(meeting) => {
                setViewMeetingModal({ isOpen: true, meeting });
                setActiveTab('dashboard');
              }}
              onPersonalMeetingClick={(meeting) => {
                setViewPersonalMeetingModal({ isOpen: true, meeting });
                setActiveTab('dashboard');
              }}
              onRefresh={handleRefreshData}
            />
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

      {showSessionPanel && (
        <SessionPanel 
          onClose={() => setShowSessionPanel(false)}
          onRefresh={fetchMeetings}
        />
      )}

      {showClientPanel && (
        <ClientPanel 
          onClose={() => setShowClientPanel(false)}
          onRefresh={fetchClients}
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
        <Calendar 
          meetings={meetingList} 
          personalMeetings={personalMeetingList}
          onClose={() => setShowCalendar(false)}
          onMeetingClick={(meeting) => {
            setViewMeetingModal({ isOpen: true, meeting });
            setShowCalendar(false);
          }}
          onPersonalMeetingClick={(meeting) => {
            setViewPersonalMeetingModal({ isOpen: true, meeting });
            setShowCalendar(false);
          }}
          onRefresh={handleRefreshData}
        />
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

      {/* Add Modals */}
      <AddClientModal
        isOpen={addClientModal}
        onClose={closeAddModals}
        onSuccess={handleRefreshData}
      />

      <AddSessionModal
        isOpen={showAddSessionModal}
        onClose={closeAddModals}
        onSessionAdded={handleRefreshData}
      />

      <AddPersonalMeetingModal
        isOpen={showAddPersonalMeetingModal}
        onClose={closeAddModals}
        onSuccess={handleRefreshData}
      />

      <EditExpenseModal
        expense={null}
        isOpen={addExpenseModal}
        onClose={closeAddModals}
        onSuccess={handleRefreshData}
      />

      {/* Payment Type Selection Modal */}
      {showPaymentTypeModal && sessionToPay && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Payment Type</h3>
              <button className="modal-close-button" onClick={handleCancelPaymentType}>×</button>
            </div>
            <div className="modal-body">
              <p>Select payment type for <strong>{sessionToPay.client?.fullName}</strong>:</p>
              <div className="payment-type-selection">
                <select
                  className="payment-type-select"
                  value={selectedPaymentType?.id || ''}
                  onChange={(e) => {
                    const type = paymentTypes.find(t => t.id === parseInt(e.target.value));
                    setSelectedPaymentType(type || null);
                  }}
                >
                  <option value="">Select a payment type...</option>
                  {paymentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleCancelPaymentType}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={handleConfirmPaymentType}
                disabled={!selectedPaymentType}
              >
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistPanel; 