import React, { useState, useEffect, useCallback } from 'react';
import { clients, meetings, expenses } from '../../services/api';
import { Client, Meeting, DashboardStats, ExpenseSummary, MeetingSource, PaymentType } from '../../types';
import DashboardLayout from './DashboardLayout';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Calendar from '../Calendar';
import MeetingPanel from '../MeetingPanel';
import ExpensePanel from '../ExpensePanel';
import ClientForm from './ClientForm';
import MeetingForm from './MeetingForm';
import './SimplifiedDashboard.css';

const SimplifiedDashboard: React.FC = () => {
  // Core data state
  const [clientList, setClientList] = useState<Client[]>([]);
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const [todayMeetings, setTodayMeetings] = useState<Meeting[]>([]);
  const [sources, setSources] = useState<MeetingSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Mock payment types - in a real app, this would come from an API
  const paymentTypes: PaymentType[] = [
    { id: 1, name: 'Bank Transfer', isActive: true, createdAt: '', updatedAt: '' },
    { id: 2, name: 'Bit', isActive: true, createdAt: '', updatedAt: '' },
    { id: 3, name: 'Paybox', isActive: true, createdAt: '', updatedAt: '' },
    { id: 4, name: 'Cash', isActive: true, createdAt: '', updatedAt: '' }
  ];
  
  // Stats state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    meetingsToday: 0,
    unpaidSessions: 0,
    monthlyRevenue: 0
  });
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary | null>(null);
  const [netProfit, setNetProfit] = useState<number>(0);
  
  // Modal state
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsData, meetingsData, statsData, sourcesData] = await Promise.all([
        clients.getAll(),
        meetings.getAll(),
        meetings.getDashboardStats(),
        meetings.getActiveSources()
      ]);
      
      setClientList(clientsData);
      setMeetingList(meetingsData);
      setDashboardStats(statsData);
      setSources(sourcesData);
      
      // Filter today's meetings
      const today = new Date().toISOString().split('T')[0];
      const todayMeetingsFiltered = meetingsData.filter(meeting => 
        meeting.meetingDate.startsWith(today)
      );
      setTodayMeetings(todayMeetingsFiltered);
      
      setError('');
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExpenseSummary = useCallback(async () => {
    try {
      const summary = await expenses.getSummary();
      setExpenseSummary(summary);
      
      // Calculate net profit (monthly revenue - monthly expenses)
      const monthlyExpenses = summary.monthlyAverage || 0;
      const profit = dashboardStats.monthlyRevenue - monthlyExpenses;
      setNetProfit(profit);
    } catch (error: any) {
      console.error('Error fetching expense summary:', error);
    }
  }, [dashboardStats.monthlyRevenue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (dashboardStats.monthlyRevenue > 0) {
      fetchExpenseSummary();
    }
  }, [fetchExpenseSummary, dashboardStats.monthlyRevenue]);

  // Modal handlers
  const openModal = (modalType: string) => {
    setActiveModal(modalType);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="simplified-dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="simplified-dashboard">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={() => setError('')} className="error-dismiss">
              ✕
            </button>
          </div>
        )}

        {/* Key Metrics */}
        <div className="key-metrics">
          <div className="metric-card metric-card--profit">
            <div className="metric-icon">
              💰
            </div>
            <div className="metric-content">
              <h2>Net Profit</h2>
              <div className="metric-value">
                {formatCurrency(netProfit)}
              </div>
              <p className="metric-description">This month</p>
            </div>
          </div>

          <div className="metric-card metric-card--today">
            <div className="metric-icon">
              📅
            </div>
            <div className="metric-content">
              <h2>Today's Sessions</h2>
              <div className="metric-value">
                {todayMeetings.length}
              </div>
              <p className="metric-description">Scheduled for today</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="action-buttons">
            <Button
              variant="primary"
              size="lg"
              onClick={() => openModal('add-client')}
              leftIcon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" y1="8" x2="19" y2="14"></line>
                  <line x1="22" y1="11" x2="16" y2="11"></line>
                </svg>
              }
            >
              Add New Client
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => openModal('schedule-meeting')}
              leftIcon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              }
            >
              Schedule Session
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => openModal('calendar')}
              leftIcon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              }
            >
              View Calendar
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => openModal('expenses')}
              leftIcon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              }
            >
              Manage Expenses
            </Button>
          </div>
        </div>

        {/* Today's Meetings */}
        <div className="todays-meetings-section">
          <h2 className="section-title">Today's Schedule</h2>
          {todayMeetings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No sessions scheduled for today</h3>
              <p>Your schedule is clear. Time to relax or catch up on other tasks!</p>
            </div>
          ) : (
            <div className="meetings-list">
              {todayMeetings.map((meeting) => (
                <div key={meeting.id} className="meeting-card">
                  <div className="meeting-time">
                    {formatTime(meeting.meetingDate)}
                  </div>
                  <div className="meeting-info">
                    <h4>{meeting.client.fullName}</h4>
                    <p>{meeting.duration} minutes • {formatCurrency(meeting.price)}</p>
                    {meeting.notes && <p className="meeting-notes">{meeting.notes}</p>}
                  </div>
                  <div className={`meeting-status ${meeting.isPaid ? 'paid' : 'unpaid'}`}>
                    {meeting.isPaid ? '✅ Paid' : '⏳ Unpaid'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <Modal
          isOpen={activeModal === 'calendar'}
          onClose={closeModal}
          title="Calendar View"
          size="xl"
        >
          <Calendar meetings={meetingList} onClose={closeModal} />
        </Modal>

        <Modal
          isOpen={activeModal === 'add-client'}
          onClose={closeModal}
          title="Add New Client"
          size="lg"
        >
          <ClientForm
            onSubmit={async (data) => {
              try {
                await clients.create(data);
                await fetchData();
                closeModal();
              } catch (error) {
                console.error('Error creating client:', error);
              }
            }}
            onCancel={closeModal}
          />
        </Modal>

        <Modal
          isOpen={activeModal === 'schedule-meeting'}
          onClose={closeModal}
          title="Schedule New Session"
          size="lg"
        >
          <MeetingForm
            clients={clientList}
            sources={sources}
            paymentTypes={paymentTypes}
            onSubmit={async (data) => {
              try {
                // Handle recurring meetings
                if (data.isRecurring) {
                  // Create multiple meetings for the recurring period
                  const startDate = new Date(data.meetingDate);
                  const endDate = new Date(startDate);
                  endDate.setMonth(endDate.getMonth() + data.recurringMonths);
                  
                  const meetingsToCreate = [];
                  let currentDate = new Date(startDate);
                  
                  while (currentDate < endDate) {
                    const meetingData = {
                      ...data,
                      meetingDate: currentDate.toISOString().split('T')[0] + 'T' + data.meetingTime
                    };
                    meetingsToCreate.push(meetingData);
                    
                    // Move to next week
                    currentDate.setDate(currentDate.getDate() + 7);
                  }
                  
                  // Create all meetings
                  for (const meetingData of meetingsToCreate) {
                    await meetings.create(meetingData);
                  }
                } else {
                  // Single meeting
                  const meetingData = {
                    ...data,
                    meetingDate: data.meetingDate + 'T' + data.meetingTime
                  };
                  await meetings.create(meetingData);
                }
                
                await fetchData();
                closeModal();
              } catch (error) {
                console.error('Error creating meeting:', error);
              }
            }}
            onCancel={closeModal}
          />
        </Modal>

        <Modal
          isOpen={activeModal === 'meetings'}
          onClose={closeModal}
          title="Manage Sessions"
          size="xl"
        >
          <MeetingPanel onClose={closeModal} onRefresh={fetchData} />
        </Modal>

        <Modal
          isOpen={activeModal === 'expenses'}
          onClose={closeModal}
          title="Expense Management"
          size="xl"
        >
          <ExpensePanel onClose={closeModal} onRefresh={fetchExpenseSummary} />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default SimplifiedDashboard; 