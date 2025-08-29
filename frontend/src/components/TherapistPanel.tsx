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
import BulkOperations, { BulkAction, BulkOperationProgress } from './BulkOperations';
import Pagination from './ui/Pagination';
import { clients, meetings, personalMeetings, expenses, paymentTypes as paymentTypesApi } from '../services/api';
import { 
  Client, 
  Meeting, 
  PersonalMeeting, 
  Expense, 
  MeetingStatus, 
  PersonalMeetingStatus, 
  PersonalMeetingTypeEntity, 
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
import PaymentTypeSelectionModal from './ui/PaymentTypeSelectionModal';
import AddClientModal from './ui/AddClientModal';
import AddSessionModal from './ui/AddSessionModal';
import AddPersonalMeetingModal from './ui/AddPersonalMeetingModal';
import AddExpenseModal from './ui/AddExpenseModal';

import './TherapistPanel.css';

// Sortable table header component
interface SortableHeaderProps {
  column: string;
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  column, 
  currentSortBy, 
  currentSortOrder, 
  onSort, 
  children,
  style 
}) => {
  const isActive = currentSortBy === column;
  
  return (
    <th 
      onClick={() => onSort(column)}
      style={{ 
        cursor: 'pointer', 
        userSelect: 'none',
        position: 'relative',
        paddingRight: '20px',
        ...style
      }}
      className="sortable-header"
    >
      {children}
      <span style={{ 
        marginLeft: '5px',
        color: isActive ? '#667eea' : '#ccc',
        fontSize: '0.8em'
      }}>
        {isActive ? (currentSortOrder === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  );
};

// Filter input component
interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'select';
  options?: { value: string; label: string }[];
}

const FilterInput: React.FC<FilterInputProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Filter...', 
  type = 'text',
  options = []
}) => {
  if (type === 'select') {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="filter-input"
        style={{
          width: '100%',
          padding: '4px 8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '0.8rem',
          backgroundColor: 'white'
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="filter-input"
      style={{
        width: '100%',
        padding: '4px 8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '0.8rem'
      }}
    />
  );
};

const TherapistPanel: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clientList, setClientList] = useState<Client[]>([]);
  const [meetingList, setMeetingList] = useState<Meeting[]>([]);
  const [personalMeetingList, setPersonalMeetingList] = useState<PersonalMeeting[]>([]);
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [clientSources, setClientSources] = useState<ClientSourceResponse[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<PersonalMeetingTypeEntity[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'meetings' | 'personal-meetings' | 'expenses' | 'analytics' | 'calendar'>('dashboard');
  // const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false); // Temporarily commented out to fix unused variable warning
  
  // Sorting state for each table
  const [clientSortBy, setClientSortBy] = useState<'id' | 'fullName' | 'email' | 'phone' | 'active' | 'createdAt' | 'source'>('id');
  const [clientSortOrder, setClientSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [meetingSortBy, setMeetingSortBy] = useState<'id' | 'client' | 'meetingDate' | 'duration' | 'price' | 'status' | 'isPaid' | 'clientSource'>('meetingDate');
  const [meetingSortOrder, setMeetingSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [personalMeetingSortBy, setPersonalMeetingSortBy] = useState<'id' | 'therapistName' | 'meetingType' | 'meetingDate' | 'duration' | 'price' | 'status' | 'isPaid'>('meetingDate');
  const [personalMeetingSortOrder, setPersonalMeetingSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [expenseSortBy, setExpenseSortBy] = useState<'id' | 'name' | 'amount' | 'category' | 'expenseDate' | 'isPaid'>('expenseDate');
  const [expenseSortOrder, setExpenseSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filtering state for each table
  const [clientFilters, setClientFilters] = useState({
    active: 'ALL',
    source: 'ALL'
  });

  const [meetingFilters, setMeetingFilters] = useState({
    client: '',
    status: 'ALL',
    isPaid: 'ALL',
    price: '',
    duration: '',
    clientSource: 'ALL',
    isActive: 'ALL'
  });

  const [personalMeetingFilters, setPersonalMeetingFilters] = useState({
    therapistName: '',
    meetingType: '',
    status: 'ALL',
    isPaid: 'ALL',
    price: '',
    duration: '',
    isActive: 'ALL'
  });

  const [expenseFilters, setExpenseFilters] = useState({
    category: 'ALL',
    isPaid: 'ALL',
    expenseDate: '',
    isActive: 'ALL'
  });

  // Bulk operations for meetings
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);
  const [bulkProgress, setBulkProgress] = useState<BulkOperationProgress | undefined>();
  const [showMeetingStatusSelector, setShowMeetingStatusSelector] = useState(false);
  const [pendingMeetingStatusChange, setPendingMeetingStatusChange] = useState<{actionId: string, selectedIds: string[]} | null>(null);
  const [showMeetingPaymentSelector, setShowMeetingPaymentSelector] = useState(false);
  const [pendingMeetingPaymentChange, setPendingMeetingPaymentChange] = useState<{actionId: string, selectedIds: string[]} | null>(null);
  const [showMeetingActivationSelector, setShowMeetingActivationSelector] = useState(false);
  const [pendingMeetingActivationChange, setPendingMeetingActivationChange] = useState<{actionId: string, selectedIds: string[]} | null>(null);

  // Bulk operations for clients
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clientBulkProgress, setClientBulkProgress] = useState<BulkOperationProgress | undefined>();
  const [showClientActivationSelector, setShowClientActivationSelector] = useState(false);
  const [pendingClientActivationChange, setPendingClientActivationChange] = useState<{actionId: string, selectedIds: string[]} | null>(null);

  // Bulk operations for personal meetings
  const [selectedPersonalMeetings, setSelectedPersonalMeetings] = useState<string[]>([]);
  const [personalMeetingBulkProgress, setPersonalMeetingBulkProgress] = useState<BulkOperationProgress | undefined>();
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{actionId: string, selectedIds: string[]} | null>(null);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [pendingPaymentChange, setPendingPaymentChange] = useState<{actionId: string, selectedIds: string[]} | null>(null);
  const [showActivationSelector, setShowActivationSelector] = useState(false);
  const [pendingActivationChange, setPendingActivationChange] = useState<{actionId: string, selectedIds: string[]} | null>(null);

  // Bulk operations for expenses
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [expenseBulkProgress, setExpenseBulkProgress] = useState<BulkOperationProgress | undefined>();
  const [showExpensePaymentSelector, setShowExpensePaymentSelector] = useState(false);
  const [pendingExpensePaymentChange, setPendingExpensePaymentChange] = useState<{actionId: string, selectedIds: string[]} | null>(null);
  const [showExpenseActivationSelector, setShowExpenseActivationSelector] = useState(false);
  const [pendingExpenseActivationChange, setPendingExpenseActivationChange] = useState<{actionId: string, selectedIds: string[]} | null>(null);

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

  // Add modal states
  const [addClientModal, setAddClientModal] = useState(false);
  // const [addMeetingModal, setAddMeetingModal] = useState(false); // Temporarily commented out to fix unused variable warning
  // const [addPersonalMeetingModal, setAddPersonalMeetingModal] = useState(false); // Temporarily commented out to fix unused variable warning
  const [addExpenseModal, setAddExpenseModal] = useState(false);

  // Payment type selection modal state
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
  const [pendingPaymentAction, setPendingPaymentAction] = useState<{
    type: 'meeting' | 'personalMeeting' | 'expense';
    id: number;
    isPaid: boolean;
  } | null>(null);



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

  // Pagination state for each table
  const [clientPagination, setClientPagination] = useState({
    currentPage: 1,
    itemsPerPage: 25
  });

  const [meetingPagination, setMeetingPagination] = useState({
    currentPage: 1,
    itemsPerPage: 25
  });

  const [personalMeetingPagination, setPersonalMeetingPagination] = useState({
    currentPage: 1,
    itemsPerPage: 25
  });

  const [expensePagination, setExpensePagination] = useState({
    currentPage: 1,
    itemsPerPage: 25
  });

  // Analytics state
  // const [analytics, setAnalytics] = useState<any>({ // Temporarily commented out to fix unused variable warning
  //   revenueStats: null,
  //   meetingStats: null,
  //   clientStats: null,
  //   expenseStats: null,
  //   personalMeetingStats: null
  // });

  // Analytics period state
  // const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly'); // Temporarily commented out to fix unused variable warning

  // Sorting handlers
  const handleClientSort = (column: string) => {
    if (clientSortBy === column) {
      setClientSortOrder(clientSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setClientSortBy(column as any);
      setClientSortOrder('asc');
    }
    setClientPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleMeetingSort = (column: string) => {
    if (meetingSortBy === column) {
      setMeetingSortOrder(meetingSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setMeetingSortBy(column as any);
      setMeetingSortOrder('asc');
    }
    setMeetingPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePersonalMeetingSort = (column: string) => {
    if (personalMeetingSortBy === column) {
      setPersonalMeetingSortOrder(personalMeetingSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setPersonalMeetingSortBy(column as any);
      setPersonalMeetingSortOrder('asc');
    }
    setPersonalMeetingPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleExpenseSort = (column: string) => {
    if (expenseSortBy === column) {
      setExpenseSortOrder(expenseSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setExpenseSortBy(column as any);
      setExpenseSortOrder('asc');
    }
    setExpensePagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Filter handlers
  const handleClientFilter = (column: string, value: string) => {
    setClientFilters(prev => ({ ...prev, [column]: value }));
    setClientPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleMeetingFilter = (column: string, value: string) => {
    setMeetingFilters(prev => ({ ...prev, [column]: value }));
    setMeetingPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePersonalMeetingFilter = (column: string, value: string) => {
    setPersonalMeetingFilters(prev => ({ ...prev, [column]: value }));
    setPersonalMeetingPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleExpenseFilter = (column: string, value: string) => {
    setExpenseFilters(prev => ({ ...prev, [column]: value }));
    setExpensePagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Pagination handlers
  const handleClientPageChange = (page: number) => {
    setClientPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleClientItemsPerPageChange = (itemsPerPage: number) => {
    setClientPagination({ currentPage: 1, itemsPerPage });
  };

  const handleMeetingPageChange = (page: number) => {
    setMeetingPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleMeetingItemsPerPageChange = (itemsPerPage: number) => {
    setMeetingPagination({ currentPage: 1, itemsPerPage });
  };

  const handlePersonalMeetingPageChange = (page: number) => {
    setPersonalMeetingPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handlePersonalMeetingItemsPerPageChange = (itemsPerPage: number) => {
    setPersonalMeetingPagination({ currentPage: 1, itemsPerPage });
  };

  const handleExpensePageChange = (page: number) => {
    setExpensePagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleExpenseItemsPerPageChange = (itemsPerPage: number) => {
    setExpensePagination({ currentPage: 1, itemsPerPage });
  };



  // Clear all filters
  const clearClientFilters = () => {
    setClientFilters({
      active: 'ALL',
      source: 'ALL'
    });
    setClientPagination(prev => ({ ...prev, currentPage: 1 }));
  };

      const clearMeetingFilters = () => {
      setMeetingFilters({
        client: '',
        status: 'ALL',
        isPaid: 'ALL',
        price: '',
        duration: '',
        clientSource: 'ALL',
        isActive: 'ALL'
      });
      setMeetingPagination(prev => ({ ...prev, currentPage: 1 }));
    };

  const clearPersonalMeetingFilters = () => {
    setPersonalMeetingFilters({
      therapistName: '',
      meetingType: '',
      status: 'ALL',
      isPaid: 'ALL',
      price: '',
      duration: '',
      isActive: 'ALL'
    });
    setPersonalMeetingPagination(prev => ({ ...prev, currentPage: 1 }));
  };

      const clearExpenseFilters = () => {
      setExpenseFilters({
        category: 'ALL',
        isPaid: 'ALL',
        expenseDate: '',
        isActive: 'ALL'
      });
      setExpensePagination(prev => ({ ...prev, currentPage: 1 }));
    };

  // Sorted and filtered data
  const sortedClientList = useMemo(() => {
    if (!clientList || !Array.isArray(clientList)) {
      return [];
    }
    
    let filtered = [...clientList];

    // Apply filters
    if (clientFilters.active !== 'ALL') {
      const isActive = clientFilters.active === 'ACTIVE';
      filtered = filtered.filter(client => client.active === isActive);
    }
    if (clientFilters.source !== 'ALL') {
      filtered = filtered.filter(client => 
        client.source?.name === clientFilters.source
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (clientSortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'fullName':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'email':
          comparison = (a.email || '').localeCompare(b.email || '');
          break;
        case 'phone':
          comparison = (a.phone || '').localeCompare(b.phone || '');
          break;
        case 'active':
          comparison = (a.active ? 1 : 0) - (b.active ? 1 : 0);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'source':
          comparison = (a.source?.name || '').localeCompare(b.source?.name || '');
          break;
      }
      
      return clientSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [clientList, clientSortBy, clientSortOrder, clientFilters]);

  // Paginated client data
  const paginatedClientList = useMemo(() => {
    const startIndex = (clientPagination.currentPage - 1) * clientPagination.itemsPerPage;
    const endIndex = startIndex + clientPagination.itemsPerPage;
    return sortedClientList.slice(startIndex, endIndex);
  }, [sortedClientList, clientPagination.currentPage, clientPagination.itemsPerPage]);

  const sortedMeetingList = useMemo(() => {
    if (!meetingList || !Array.isArray(meetingList)) {
      return [];
    }
    
    let filtered = [...meetingList];

    // Apply filters
    if (meetingFilters.client) {
      filtered = filtered.filter(meeting => 
        (meeting.client?.fullName || '').toLowerCase().includes(meetingFilters.client.toLowerCase())
      );
    }
    if (meetingFilters.status !== 'ALL') {
      filtered = filtered.filter(meeting => meeting.status === meetingFilters.status);
    }
    if (meetingFilters.isPaid !== 'ALL') {
      const isPaid = meetingFilters.isPaid === 'PAID';
      filtered = filtered.filter(meeting => meeting.isPaid === isPaid);
    }
    if (meetingFilters.price) {
      filtered = filtered.filter(meeting => 
        meeting.price.toString().includes(meetingFilters.price)
      );
    }
    if (meetingFilters.duration) {
      filtered = filtered.filter(meeting => 
        meeting.duration.toString().includes(meetingFilters.duration)
      );
    }
    if (meetingFilters.clientSource !== 'ALL') {
      filtered = filtered.filter(meeting => 
        meeting.client?.source?.name === meetingFilters.clientSource
      );
    }
    if (meetingFilters.isActive !== 'ALL') {
      const isActive = meetingFilters.isActive === 'ACTIVE';
      filtered = filtered.filter(meeting => meeting.active === isActive);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (meetingSortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'client':
          comparison = (a.client?.fullName || '').localeCompare(b.client?.fullName || '');
          break;
        case 'meetingDate':
          comparison = new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime();
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'isPaid':
          comparison = (a.isPaid ? 1 : 0) - (b.isPaid ? 1 : 0);
          break;
        case 'clientSource':
          comparison = (a.client?.source?.name || '').localeCompare(b.client?.source?.name || '');
          break;
      }
      
      return meetingSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [meetingList, meetingSortBy, meetingSortOrder, meetingFilters]);

  // Paginated meeting data
  const paginatedMeetingList = useMemo(() => {
    const startIndex = (meetingPagination.currentPage - 1) * meetingPagination.itemsPerPage;
    const endIndex = startIndex + meetingPagination.itemsPerPage;
    return sortedMeetingList.slice(startIndex, endIndex);
  }, [sortedMeetingList, meetingPagination.currentPage, meetingPagination.itemsPerPage]);

  const sortedPersonalMeetingList = useMemo(() => {
    if (!personalMeetingList || !Array.isArray(personalMeetingList)) {
      return [];
    }
    
    let filtered = [...personalMeetingList];

    // Apply filters
    if (personalMeetingFilters.therapistName) {
      filtered = filtered.filter(meeting => 
        meeting.therapistName.toLowerCase().includes(personalMeetingFilters.therapistName.toLowerCase())
      );
    }
    if (personalMeetingFilters.meetingType) {
      filtered = filtered.filter(meeting => 
        (meeting.meetingType?.name || '').toLowerCase().includes(personalMeetingFilters.meetingType.toLowerCase())
      );
    }
    if (personalMeetingFilters.status !== 'ALL') {
      filtered = filtered.filter(meeting => meeting.status === personalMeetingFilters.status);
    }
    if (personalMeetingFilters.isPaid !== 'ALL') {
      const isPaid = personalMeetingFilters.isPaid === 'PAID';
      filtered = filtered.filter(meeting => meeting.isPaid === isPaid);
    }
    if (personalMeetingFilters.price) {
      filtered = filtered.filter(meeting => 
        meeting.price.toString().includes(personalMeetingFilters.price)
      );
    }
    if (personalMeetingFilters.duration) {
      filtered = filtered.filter(meeting => 
        meeting.duration.toString().includes(personalMeetingFilters.duration)
      );
    }
    if (personalMeetingFilters.isActive !== 'ALL') {
      const isActive = personalMeetingFilters.isActive === 'ACTIVE';
      filtered = filtered.filter(meeting => meeting.active === isActive);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (personalMeetingSortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'therapistName':
          comparison = a.therapistName.localeCompare(b.therapistName);
          break;
        case 'meetingType':
          comparison = (a.meetingType?.name || '').localeCompare(b.meetingType?.name || '');
          break;
        case 'meetingDate':
          comparison = new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime();
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        case 'isPaid':
          comparison = (a.isPaid ? 1 : 0) - (b.isPaid ? 1 : 0);
          break;
      }
      
      return personalMeetingSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [personalMeetingList, personalMeetingSortBy, personalMeetingSortOrder, personalMeetingFilters]);

  // Paginated personal meeting data
  const paginatedPersonalMeetingList = useMemo(() => {
    const startIndex = (personalMeetingPagination.currentPage - 1) * personalMeetingPagination.itemsPerPage;
    const endIndex = startIndex + personalMeetingPagination.itemsPerPage;
    return sortedPersonalMeetingList.slice(startIndex, endIndex);
  }, [sortedPersonalMeetingList, personalMeetingPagination.currentPage, personalMeetingPagination.itemsPerPage]);

  const sortedExpenseList = useMemo(() => {
    if (!expenseList || !Array.isArray(expenseList)) {
      return [];
    }
    
    let filtered = [...expenseList];

    // Apply filters
    if (expenseFilters.category !== 'ALL') {
      filtered = filtered.filter(expense => 
        expense.category?.name === expenseFilters.category
      );
    }
    if (expenseFilters.isPaid !== 'ALL') {
      const isPaid = expenseFilters.isPaid === 'PAID';
      filtered = filtered.filter(expense => expense.isPaid === isPaid);
    }
    if (expenseFilters.expenseDate) {
      filtered = filtered.filter(expense => 
        new Date(expense.expenseDate).toLocaleDateString().includes(expenseFilters.expenseDate)
      );
    }
    if (expenseFilters.isActive !== 'ALL') {
      const isActive = expenseFilters.isActive === 'ACTIVE';
      filtered = filtered.filter(expense => expense.isActive === isActive);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (expenseSortBy) {
        case 'id':
          comparison = a.id - b.id;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = (a.category?.name || '').localeCompare(b.category?.name || '');
          break;
        case 'expenseDate':
          comparison = new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime();
          break;
        case 'isPaid':
          comparison = (a.isPaid ? 1 : 0) - (b.isPaid ? 1 : 0);
          break;
      }
      
      return expenseSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [expenseList, expenseSortBy, expenseSortOrder, expenseFilters]);

  // Paginated expense data
  const paginatedExpenseList = useMemo(() => {
    const startIndex = (expensePagination.currentPage - 1) * expensePagination.itemsPerPage;
    const endIndex = startIndex + expensePagination.itemsPerPage;
    return sortedExpenseList.slice(startIndex, endIndex);
  }, [sortedExpenseList, expensePagination.currentPage, expensePagination.itemsPerPage]);

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

  // Debounce mechanism to prevent rapid successive calls
  const [lastFetchExpensesCall, setLastFetchExpensesCall] = useState(0);
  
  const fetchExpenses = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchExpensesCall < 1000) { // Prevent calls within 1 second
      console.log('🔧 fetchExpenses call blocked - too soon after last call');
      return;
    }
    
    console.log('🔧 fetchExpenses called from:', new Error().stack?.split('\n')[2]?.trim() || 'unknown location');
    setLastFetchExpensesCall(now);
    
    try {
      const expensesData = await expenses.getAll();
      setExpenseList(expensesData);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  }, [lastFetchExpensesCall]);

  const fetchClientSources = async () => {
    try {
      const sources = await meetings.getActiveSources();
      setClientSources(sources);
    } catch (error) {
      console.error('❌ Failed to fetch client sources:', error);
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
      // const revenueStats = await meetings.getRevenueStats(analyticsPeriod); // Temporarily commented out to fix unused variable warning
      
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
        paid: expenseList.filter(e => e.isPaid).length,
        unpaid: expenseList.filter(e => !e.isPaid).length,
        totalAmount: expenseList.reduce((sum, e) => sum + e.amount, 0),
        paidAmount: expenseList.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0),
        unpaidAmount: expenseList.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0),
        byCategory: expenseList.reduce((acc, e) => {
          acc[e.category.name] = (acc[e.category.name] || 0) + e.amount;
          return acc;
        }, {} as Record<string, number>)
      };

      // Personal meeting analytics
      const personalMeetingStats = {
        total: personalMeetingList.length,
        byType: personalMeetingList.reduce((acc, m) => {
          if (m.meetingType?.name) {
            acc[m.meetingType.name] = (acc[m.meetingType.name] || 0) + 1;
          }
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

      // setAnalytics({ // Temporarily commented out to fix unused variable warning
      //   revenueStats,
      //   meetingStats,
      //   clientStats,
      //   expenseStats,
      //   personalMeetingStats
      // });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  }, [meetingList, clientList, expenseList, personalMeetingList]); // Temporarily removed analyticsPeriod to fix unused variable warning

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
          fetchClientSources()
        ]);
        
        // Load meeting types
        const types = await personalMeetings.getActiveMeetingTypes();
        setMeetingTypes(types);
        
        // Load payment types
        try {
          const paymentTypesData = await paymentTypesApi.getActive();
          setPaymentTypes(paymentTypesData);
        } catch (error) {
          console.warn('Failed to load payment types:', error);
          // Set default payment types as fallback
          setPaymentTypes([
            { id: 1, name: 'Bank Transfer', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 2, name: 'Bit', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 3, name: 'Paybox', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 4, name: 'Cash', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          ]);
        }
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

  // Reset pagination when data changes
  useEffect(() => {
    setClientPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [clientList.length]);

  useEffect(() => {
    setMeetingPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [meetingList.length]);

  useEffect(() => {
    setPersonalMeetingPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [personalMeetingList.length]);

  useEffect(() => {
    setExpensePagination(prev => ({ ...prev, currentPage: 1 }));
  }, [expenseList.length]);

  // Bulk operations handlers for meetings
  const bulkActions: BulkAction[] = [
    {
      id: 'changePayment',
      label: 'Change Payment Status',
      icon: '💰',
      color: '#28a745',
      requiresConfirmation: false
    },
    {
      id: 'changeStatus',
      label: 'Change Status',
      icon: '📝',
      color: '#17a2b8',
      requiresConfirmation: false
    },
    {
      id: 'changeActivation',
      label: 'Change Activation Status',
      icon: '🔄',
      color: '#17a2b8',
      requiresConfirmation: false
    }
  ];

  const handleMeetingSelect = (meetingId: number, selected: boolean) => {
    const meetingKey = meetingId.toString();
    if (selected) {
      setSelectedMeetings(prev => [...prev, meetingKey]);
    } else {
      setSelectedMeetings(prev => prev.filter(id => id !== meetingKey));
    }
  };

  const handleSelectAllMeetings = (selected: boolean) => {
    if (selected) {
      const allMeetingIds = sortedMeetingList.map(m => m.id.toString());
      setSelectedMeetings(allMeetingIds);
    } else {
      setSelectedMeetings([]);
    }
  };

  const handleClearMeetingSelection = () => {
    setSelectedMeetings([]);
  };

  const handleBulkMeetingActionExecute = async (actionId: string, selectedIds: string[]) => {
    // Handle selector actions
    if (actionId === 'changePayment') {
      setPendingMeetingPaymentChange({ actionId, selectedIds });
      setShowMeetingPaymentSelector(true);
      return;
    }
    
    if (actionId === 'changeStatus') {
      setPendingMeetingStatusChange({ actionId, selectedIds });
      setShowMeetingStatusSelector(true);
      return;
    }
    
    if (actionId === 'changeActivation') {
      setPendingMeetingActivationChange({ actionId, selectedIds });
      setShowMeetingActivationSelector(true);
      return;
    }

    setBulkProgress({
      id: actionId,
      total: selectedIds.length,
      completed: 0,
      failed: 0,
      status: 'running',
      message: `Processing ${selectedIds.length} meetings...`
    });

    try {
      for (let i = 0; i < selectedIds.length; i++) {
        const meetingId = parseInt(selectedIds[i]);
        
        switch (actionId) {
          // Handle payment changes from selector
          case 'PAID':
            await meetings.update(meetingId, { isPaid: true });
            break;
          case 'UNPAID':
            await meetings.update(meetingId, { isPaid: false });
            break;
          // Handle status changes from selector  
          case 'COMPLETED':
            await meetings.update(meetingId, { status: MeetingStatus.COMPLETED });
            break;
          case 'CANCELLED':
            await meetings.update(meetingId, { status: MeetingStatus.CANCELLED });
            break;
          case 'NO_SHOW':
            await meetings.update(meetingId, { status: MeetingStatus.NO_SHOW });
            break;
          // Handle activation changes from selector
          case 'ACTIVATE':
            await meetings.activate(meetingId);
            break;
          case 'DEACTIVATE':
            await meetings.deactivate(meetingId);
            break;
        }

        setBulkProgress(prev => prev ? {
          ...prev,
          completed: i + 1,
          message: `Processed ${i + 1} of ${selectedIds.length} meetings`
        } : undefined);
      }

      setBulkProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        message: `Successfully processed ${selectedIds.length} meetings`
      } : undefined);

      // Refresh data and clear selection
      await fetchMeetings();
      handleClearMeetingSelection();

      setTimeout(() => {
        setBulkProgress(undefined);
      }, 2000);

    } catch (error) {
      setBulkProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        message: 'Failed to process meetings'
      } : undefined);

      setTimeout(() => {
        setBulkProgress(undefined);
      }, 3000);
    }
  };

  const handleProgressCancel = () => {
    setBulkProgress(prev => prev ? {
      ...prev,
      status: 'cancelled',
      message: 'Operation cancelled'
    } : undefined);
    
    setTimeout(() => {
      setBulkProgress(undefined);
    }, 2000);
  };

  // Sessions selector handlers
  const handleMeetingPaymentSelect = async (isPaid: boolean) => {
    if (!pendingMeetingPaymentChange) return;
    
    setShowMeetingPaymentSelector(false);
    
    const paymentStatus = isPaid ? 'PAID' : 'UNPAID';
    await handleBulkMeetingActionExecute(paymentStatus, pendingMeetingPaymentChange.selectedIds);
    
    setPendingMeetingPaymentChange(null);
  };

  const handleMeetingPaymentSelectorCancel = () => {
    setShowMeetingPaymentSelector(false);
    setPendingMeetingPaymentChange(null);
  };

  const handleMeetingStatusSelect = async (status: MeetingStatus) => {
    if (!pendingMeetingStatusChange) return;
    
    setShowMeetingStatusSelector(false);
    
    await handleBulkMeetingActionExecute(status, pendingMeetingStatusChange.selectedIds);
    
    setPendingMeetingStatusChange(null);
  };

  const handleMeetingStatusSelectorCancel = () => {
    setShowMeetingStatusSelector(false);
    setPendingMeetingStatusChange(null);
  };

  const handleMeetingActivationSelect = async (isActive: boolean) => {
    if (!pendingMeetingActivationChange) return;
    
    setShowMeetingActivationSelector(false);
    
    const activationStatus = isActive ? 'ACTIVATE' : 'DEACTIVATE';
    await handleBulkMeetingActionExecute(activationStatus, pendingMeetingActivationChange.selectedIds);
    
    setPendingMeetingActivationChange(null);
  };

  const handleMeetingActivationSelectorCancel = () => {
    setShowMeetingActivationSelector(false);
    setPendingMeetingActivationChange(null);
  };

  // Client selector handlers
  const handleClientActivationSelect = async (isActive: boolean) => {
    if (!pendingClientActivationChange) return;
    
    setShowClientActivationSelector(false);
    
    const activationStatus = isActive ? 'ACTIVATE' : 'DEACTIVATE';
    await handleBulkClientActionExecute(activationStatus, pendingClientActivationChange.selectedIds);
    
    setPendingClientActivationChange(null);
  };

  // Expense selector handlers
  const handleExpensePaymentSelect = async (isPaid: boolean) => {
    console.log('🔧 Expense payment selector called:', { isPaid, pendingExpensePaymentChange });
    
    if (!pendingExpensePaymentChange) {
      console.error('❌ No pending expense payment change');
      return;
    }
    
    setShowExpensePaymentSelector(false);
    
    const paymentStatus = isPaid ? 'PAID' : 'UNPAID';
    console.log('🔧 Executing bulk action:', paymentStatus, 'for', pendingExpensePaymentChange.selectedIds);
    
    await handleBulkExpenseActionExecute(paymentStatus, pendingExpensePaymentChange.selectedIds);
    
    setPendingExpensePaymentChange(null);
  };

  const handleExpenseActivationSelect = async (isActive: boolean) => {
    if (!pendingExpenseActivationChange) return;
    
    setShowExpenseActivationSelector(false);
    
    const activationStatus = isActive ? 'ACTIVATE' : 'DEACTIVATE';
    await handleBulkExpenseActionExecute(activationStatus, pendingExpenseActivationChange.selectedIds);
    
    setPendingExpenseActivationChange(null);
  };

  // Bulk operations for clients
  const clientBulkActions: BulkAction[] = [
    {
      id: 'changeActivation',
      label: 'Change Activation Status',
      icon: '🔄',
      color: '#17a2b8',
      requiresConfirmation: false
    }
  ];

  const handleClientSelect = (clientId: number, selected: boolean) => {
    const clientKey = clientId.toString();
    if (selected) {
      setSelectedClients(prev => [...prev, clientKey]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientKey));
    }
  };

  const handleSelectAllClients = (selected: boolean) => {
    if (selected) {
      const allClientIds = sortedClientList.map(c => c.id.toString());
      setSelectedClients(allClientIds);
    } else {
      setSelectedClients([]);
    }
  };

  const handleClearClientSelection = () => {
    setSelectedClients([]);
  };

  const handleBulkClientActionExecute = async (actionId: string, selectedIds: string[]) => {
    // Handle selector actions
    if (actionId === 'changeActivation') {
      setPendingClientActivationChange({ actionId, selectedIds });
      setShowClientActivationSelector(true);
      return;
    }

    setClientBulkProgress({
      id: actionId,
      total: selectedIds.length,
      completed: 0,
      failed: 0,
      status: 'running',
      message: `Processing ${selectedIds.length} clients...`
    });

    try {
      for (let i = 0; i < selectedIds.length; i++) {
        const clientId = parseInt(selectedIds[i]);
        
        switch (actionId) {
          case 'ACTIVATE':
            await clients.activate(clientId);
            break;
          case 'DEACTIVATE':
            await clients.deactivate(clientId);
            break;
        }

        setClientBulkProgress(prev => prev ? {
          ...prev,
          completed: i + 1,
          message: `Processed ${i + 1} of ${selectedIds.length} clients`
        } : undefined);
      }

      setClientBulkProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        message: `Successfully processed ${selectedIds.length} clients`
      } : undefined);

      // Refresh data and clear selection
      await fetchClients();
      handleClearClientSelection();

      setTimeout(() => {
        setClientBulkProgress(undefined);
      }, 2000);

    } catch (error) {
      setClientBulkProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        message: 'Failed to process clients'
      } : undefined);

      setTimeout(() => {
        setClientBulkProgress(undefined);
      }, 3000);
    }
  };

  const handleClientProgressCancel = () => {
    setClientBulkProgress(prev => prev ? {
      ...prev,
      status: 'cancelled',
      message: 'Operation cancelled'
    } : undefined);
    
    setTimeout(() => {
      setClientBulkProgress(undefined);
    }, 2000);
  };

  // Bulk operations for personal meetings
  const personalMeetingBulkActions: BulkAction[] = [
    {
      id: 'changePayment',
      label: 'Change Payment Status',
      icon: '💰',
      color: '#28a745',
      requiresConfirmation: false
    },
    {
      id: 'changeStatus',
      label: 'Change Status',
      icon: '📝',
      color: '#17a2b8',
      requiresConfirmation: false
    },
    {
      id: 'changeActivation',
      label: 'Change Activation Status',
      icon: '🔄',
      color: '#17a2b8',
      requiresConfirmation: false
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: '📋',
      color: '#6c757d'
    }
  ];

  const handlePersonalMeetingSelect = (meetingId: number, selected: boolean) => {
    const meetingKey = meetingId.toString();
    if (selected) {
      setSelectedPersonalMeetings(prev => [...prev, meetingKey]);
    } else {
      setSelectedPersonalMeetings(prev => prev.filter(id => id !== meetingKey));
    }
  };

  const handleSelectAllPersonalMeetings = (selected: boolean) => {
    if (selected) {
      const allMeetingIds = sortedPersonalMeetingList.map(m => m.id.toString());
      setSelectedPersonalMeetings(allMeetingIds);
    } else {
      setSelectedPersonalMeetings([]);
    }
  };

  const handleClearPersonalMeetingSelection = () => {
    setSelectedPersonalMeetings([]);
  };

  const handleBulkPersonalMeetingActionExecute = async (actionId: string, selectedIds: string[]) => {
    // If it's a status change action, show the status selector instead
    if (actionId === 'changeStatus') {
      setPendingStatusChange({ actionId, selectedIds });
      setShowStatusSelector(true);
      return;
    }
    
    // If it's a payment change action, show the payment selector instead
    if (actionId === 'changePayment') {
      setPendingPaymentChange({ actionId, selectedIds });
      setShowPaymentSelector(true);
      return;
    }
    
    // If it's an activation change action, show the activation selector instead
    if (actionId === 'changeActivation') {
      setPendingActivationChange({ actionId, selectedIds });
      setShowActivationSelector(true);
      return;
    }

    setPersonalMeetingBulkProgress({
      id: actionId,
      total: selectedIds.length,
      completed: 0,
      failed: 0,
      status: 'running',
      message: `Processing ${selectedIds.length} personal meetings...`
    });

    try {
      for (let i = 0; i < selectedIds.length; i++) {
        const meetingId = parseInt(selectedIds[i]);
        
        switch (actionId) {
          // Handle status changes from the selector
          case 'SCHEDULED':
          case 'COMPLETED':
          case 'CANCELLED':
          case 'NO_SHOW':
            await personalMeetings.update(meetingId, { status: actionId as PersonalMeetingStatus });
            break;
          // Handle payment changes from the selector
          case 'PAID':
            // For paid meetings, we need to show payment type selection
            // This will be handled by the payment type modal
            setPendingPaymentAction({
              type: 'personalMeeting',
              id: meetingId,
              isPaid: true
            });
            setShowPaymentTypeModal(true);
            break;
          case 'UNPAID':
            // For unpaid meetings, we can call the API directly
            await personalMeetings.updatePayment(meetingId, false, undefined);
            break;
          // Handle activation changes from the selector
          case 'ACTIVATE':
            await personalMeetings.activate(meetingId);
            break;
          case 'DEACTIVATE':
            await personalMeetings.deactivate(meetingId);
            break;
        }

        setPersonalMeetingBulkProgress(prev => prev ? {
          ...prev,
          completed: i + 1,
          message: `Processed ${i + 1} of ${selectedIds.length} personal meetings`
        } : undefined);
      }

      setPersonalMeetingBulkProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        message: `Successfully processed ${selectedIds.length} personal meetings`
      } : undefined);

      // Refresh data and clear selection
      await fetchPersonalMeetings();
      handleClearPersonalMeetingSelection();

      setTimeout(() => {
        setPersonalMeetingBulkProgress(undefined);
      }, 2000);

    } catch (error) {
      setPersonalMeetingBulkProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        message: 'Failed to process personal meetings'
      } : undefined);

      setTimeout(() => {
        setPersonalMeetingBulkProgress(undefined);
      }, 3000);
    }
  };

  // Handle status selection from the dropdown
  const handleStatusSelect = async (status: PersonalMeetingStatus) => {
    if (!pendingStatusChange) return;
    
    setShowStatusSelector(false);
    
    // Execute the status change with the selected status
    await handleBulkPersonalMeetingActionExecute(status, pendingStatusChange.selectedIds);
    
    setPendingStatusChange(null);
  };

  const handleStatusSelectorCancel = () => {
    setShowStatusSelector(false);
    setPendingStatusChange(null);
  };

  // Handle payment selection from the dropdown
  const handlePaymentSelect = async (isPaid: boolean) => {
    if (!pendingPaymentChange) return;
    
    setShowPaymentSelector(false);
    
    // Execute the payment change with the selected status
    const paymentStatus = isPaid ? 'PAID' : 'UNPAID';
    await handleBulkPersonalMeetingActionExecute(paymentStatus, pendingPaymentChange.selectedIds);
    
    setPendingPaymentChange(null);
  };

  const handlePaymentSelectorCancel = () => {
    setShowPaymentSelector(false);
    setPendingPaymentChange(null);
  };

  // Handle activation selection from the dropdown
  const handleActivationSelect = async (isActive: boolean) => {
    if (!pendingActivationChange) return;
    
    setShowActivationSelector(false);
    
    // Execute the activation change with the selected status
    const activationStatus = isActive ? 'ACTIVATE' : 'DEACTIVATE';
    await handleBulkPersonalMeetingActionExecute(activationStatus, pendingActivationChange.selectedIds);
    
    setPendingActivationChange(null);
  };

  const handleActivationSelectorCancel = () => {
    setShowActivationSelector(false);
    setPendingActivationChange(null);
  };

  const handlePersonalMeetingProgressCancel = () => {
    setPersonalMeetingBulkProgress(prev => prev ? {
      ...prev,
      status: 'cancelled',
      message: 'Operation cancelled'
    } : undefined);
    
    setTimeout(() => {
      setPersonalMeetingBulkProgress(undefined);
    }, 2000);
  };

  // Bulk operations for expenses
  const expenseBulkActions: BulkAction[] = [
    {
      id: 'markAsPaid',
      label: 'Mark as Paid',
      icon: '💰',
      color: '#28a745',
      requiresConfirmation: false
    },
    {
      id: 'markAsUnpaid',
      label: 'Mark as Unpaid',
      icon: '💸',
      color: '#ffc107',
      requiresConfirmation: false
    },
    {
      id: 'changePayment',
      label: 'Change Payment Status',
      icon: '⚙️',
      color: '#17a2b8',
      requiresConfirmation: false
    },
    {
      id: 'changeActivation',
      label: 'Change Activation Status',
      icon: '🔄',
      color: '#6c757d',
      requiresConfirmation: false
    }
  ];

  // Debug effect for expense selection
  useEffect(() => {
    console.log('🔧 Expense selection changed:', { 
      selectedExpenses, 
      totalExpenses: sortedExpenseList?.length || 0,
      bulkActions: expenseBulkActions 
    });
  }, [selectedExpenses, expenseBulkActions]);

  const handleExpenseSelect = (expenseId: number, selected: boolean) => {
    const expenseKey = expenseId.toString();
    console.log('🔧 Expense selection changed:', { expenseId, expenseKey, selected });
    
    if (selected) {
      setSelectedExpenses(prev => {
        const newSelection = [...prev, expenseKey];
        console.log('🔧 New expense selection:', newSelection);
        return newSelection;
      });
    } else {
      setSelectedExpenses(prev => {
        const newSelection = prev.filter(id => id !== expenseKey);
        console.log('🔧 New expense selection:', newSelection);
        return newSelection;
      });
    }
  };

  const handleSelectAllExpenses = (selected: boolean) => {
    console.log('🔧 Select all expenses called:', { selected, totalExpenses: sortedExpenseList.length });
    
    if (selected) {
      const allExpenseIds = sortedExpenseList.map(e => e.id.toString());
      console.log('🔧 Selecting all expenses:', allExpenseIds);
      setSelectedExpenses(allExpenseIds);
    } else {
      console.log('🔧 Clearing all expense selections');
      setSelectedExpenses([]);
    }
  };

  const handleClearExpenseSelection = () => {
    setSelectedExpenses([]);
  };

  const handleBulkExpenseActionExecute = async (actionId: string, selectedIds: string[]) => {
    console.log('🔧 Bulk expense action executed:', { actionId, selectedIds });
    
    // Handle selector actions
    if (actionId === 'changePayment') {
      setPendingExpensePaymentChange({ actionId, selectedIds });
      setShowExpensePaymentSelector(true);
      return;
    }
    
    if (actionId === 'changeActivation') {
      setPendingExpenseActivationChange({ actionId, selectedIds });
      setShowExpenseActivationSelector(true);
      return;
    }

    setExpenseBulkProgress({
      id: actionId,
      total: selectedIds.length,
      completed: 0,
      failed: 0,
      status: 'running',
      message: `Processing ${selectedIds.length} expenses...`
    });

    try {
      for (let i = 0; i < selectedIds.length; i++) {
        const expenseId = parseInt(selectedIds[i]);
        console.log(`🔧 Processing expense ${i + 1}/${selectedIds.length}:`, expenseId, actionId);
        
        switch (actionId) {
          // Handle direct payment changes
          case 'markAsPaid':
            console.log(`🔧 Marking expense ${expenseId} as paid`);
            await expenses.update(expenseId, { isPaid: true });
            break;
          case 'markAsUnpaid':
            console.log(`🔧 Marking expense ${expenseId} as unpaid`);
            await expenses.update(expenseId, { isPaid: false });
            break;
          // Handle payment changes from selector
          case 'PAID':
            console.log(`🔧 Marking expense ${expenseId} as paid`);
            await expenses.update(expenseId, { isPaid: true });
            break;
          case 'UNPAID':
            console.log(`🔧 Marking expense ${expenseId} as unpaid`);
            await expenses.update(expenseId, { isPaid: false });
            break;
          // Handle activation changes from selector
          case 'ACTIVATE':
            console.log(`🔧 Activating expense ${expenseId}`);
            await expenses.activate(expenseId);
            break;
          case 'DEACTIVATE':
            console.log(`🔧 Deactivating expense ${expenseId}`);
            await expenses.deactivate(expenseId);
            break;
        }

        setExpenseBulkProgress(prev => prev ? {
          ...prev,
          completed: i + 1,
          message: `Processed ${i + 1} of ${selectedIds.length} expenses`
        } : undefined);
      }

      // Refresh the expenses data after bulk operation (only once)
      console.log('🔧 Bulk operation completed, refreshing expenses data...');
      await fetchExpenses();
      
      // Clear the selection after successful operation
      setSelectedExpenses([]);

      setExpenseBulkProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        message: `Successfully processed ${selectedIds.length} expenses`
      } : undefined);

      setTimeout(() => {
        setExpenseBulkProgress(undefined);
      }, 2000);

    } catch (error) {
      setExpenseBulkProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        message: 'Failed to process expenses'
      } : undefined);

      setTimeout(() => {
        setExpenseBulkProgress(undefined);
      }, 3000);
    }
  };

  const handleExpenseProgressCancel = () => {
    setExpenseBulkProgress(prev => prev ? {
      ...prev,
      status: 'cancelled',
      message: 'Operation cancelled'
    } : undefined);
    
    setTimeout(() => {
      setExpenseBulkProgress(undefined);
    }, 2000);
  };

  // Close dropdowns when clicking outside


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

  // const formatPaymentDate = (meeting: Meeting) => { // Temporarily commented out to fix unused variable warning
  //   if (meeting.isPaid && meeting.paymentDate) {
  //     return new Date(meeting.paymentDate).toLocaleDateString('en-US', {
  //       year: 'numeric',
  //       month: 'short',
  //       day: 'numeric',
  //       hour: '2-digit',
  //       minute: '2-digit'
  //     });
  //   } else if (meeting.isPaid) {
  //     return 'Paid (No date)';
  //   } else {
  //     return '-';
  //   }
  // };

  // const getPaymentDateStyle = (meeting: Meeting) => { // Temporarily commented out to fix unused variable warning
  //   if (meeting.isPaid && meeting.paymentDate) {
  //     return { fontSize: '0.75rem', color: '#059669', fontWeight: '500' };
  //   } else if (meeting.isPaid) {
  //     return { fontSize: '0.75rem', color: '#f59e0b', fontStyle: 'italic' };
  //   } else {
  //     return { fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' };
  //   }
  // };

  // const getSourceName = (meeting: Meeting) => { // Temporarily commented out to fix unused variable warning
  //   return meeting.source?.name || 'Unknown Source';
  // };

  // Payment update – direct, no modal
  const handleMeetingPaymentChange = async (meetingId: number, isPaid: boolean, paymentTypeId?: number) => {
    try {
  
      
      // If marking as paid, require payment type
      if (isPaid && !paymentTypeId) {
        alert('Please select a payment type when marking a meeting as paid.');
        return;
      }
      
      await meetings.updatePayment(meetingId, isPaid, paymentTypeId);
      await fetchMeetings();
    } catch (error) {
      console.error('❌ Failed to update meeting payment:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  const handlePersonalMeetingPaymentToggle = async (meetingId: number, currentPaidStatus: boolean, paymentTypeId?: number) => {
    try {
  
      
      const newStatus = !currentPaidStatus;
      
      // If marking as paid, require payment type
      if (newStatus && !paymentTypeId) {
        alert('Please select a payment type when marking a personal meeting as paid.');
        return;
      }
      
      await personalMeetings.updatePayment(meetingId, newStatus, paymentTypeId);
      console.log('✅ Personal meeting payment status updated successfully');
      await fetchPersonalMeetings();
    } catch (error) {
      console.error('❌ Failed to update personal meeting payment status:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  // Handle payment type selection from modal
  const handlePaymentTypeSelected = async (paymentTypeId: number) => {
    console.log('🔍 handlePaymentTypeSelected called with paymentTypeId:', paymentTypeId);
    console.log('🔍 pendingPaymentAction:', pendingPaymentAction);
    
    if (!pendingPaymentAction) {
      console.error('❌ No pending payment action found');
      return;
    }
    
    try {
      const { type, id, isPaid } = pendingPaymentAction;
      console.log('🔍 Processing payment action:', { type, id, isPaid });
      
      if (type === 'meeting') {
        console.log('🔍 Processing meeting payment');
        await handleMeetingPaymentChange(id, isPaid, paymentTypeId);
      } else if (type === 'personalMeeting') {
        console.log('🔍 Processing personal meeting payment');
        await handlePersonalMeetingPaymentToggle(id, !isPaid, paymentTypeId);
      } else if (type === 'expense') {
        console.log('🔍 Processing expense payment');
        // For expenses, we need to get the current status from the expenses list
        const currentExpense = expenseList.find(exp => exp.id === id);
        if (currentExpense) {
          console.log('🔍 Current expense status:', { id, currentPaidStatus: currentExpense.isPaid, desiredStatus: isPaid });
          await handleExpensePaymentToggle(id, currentExpense.isPaid, paymentTypeId);
        } else {
          console.error('❌ Expense not found in list:', id);
        }
      }
      
      // Clear the pending action
      setPendingPaymentAction(null);
      setShowPaymentTypeModal(false);
      console.log('✅ Payment action completed successfully');
    } catch (error) {
      console.error('❌ Failed to process payment type selection:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  const handleExpensePaymentToggle = async (expenseId: number, currentPaidStatus: boolean, paymentTypeId?: number) => {
    try {
      console.log('🔍 handleExpensePaymentToggle called:', { expenseId, currentPaidStatus, paymentTypeId });
      
              if (currentPaidStatus) {
          // Currently paid, marking as unpaid
          console.log('🔄 Marking expense as unpaid');
          await expenses.updatePayment(expenseId, false);
        } else {
          // Currently unpaid, marking as paid - require payment type
          console.log('💰 Marking expense as paid with payment type:', paymentTypeId);
          if (!paymentTypeId) {
            alert('Please select a payment type when marking an expense as paid.');
            return;
          }
          await expenses.updatePayment(expenseId, true, paymentTypeId);
        }
      
      console.log('✅ Expense payment status updated successfully');
      await fetchExpenses();
    } catch (error) {
      console.error('❌ Failed to update expense payment status:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  // Handle expense payment toggle with modal
  const handleExpensePaymentToggleWithModal = (expenseId: number, newPaidStatus: boolean) => {
    console.log('🔍 handleExpensePaymentToggleWithModal called:', { expenseId, newPaidStatus });
    
    if (newPaidStatus === false) {
      // Marking as unpaid - no payment type needed
      console.log('🔄 Marking expense as unpaid, calling handleExpensePaymentToggle directly');
      handleExpensePaymentToggle(expenseId, true); // true = current status (paid), false = new status (unpaid)
    } else {
      // Marking as paid - show payment type selection modal
      console.log('💰 Marking expense as paid, showing payment type modal');
      setPendingPaymentAction({
        type: 'expense',
        id: expenseId,
        isPaid: true
      });
      setShowPaymentTypeModal(true);
      console.log('✅ Payment type modal should now be visible');
    }
  };

  // Status update handlers
  const handleMeetingStatusUpdate = async (meetingId: number, newStatus: MeetingStatus) => {
    try {
  
      console.log('🔍 Calling meetings.update with payload:', { status: newStatus });
      
      const result = await meetings.update(meetingId, { status: newStatus });
      console.log('✅ Meeting status updated successfully, result:', result);
      
      await fetchMeetings();
      console.log('✅ Meetings refreshed after status update');
    } catch (error: any) {
      console.error('❌ Failed to update meeting status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Failed to update status. Please try again.');
    }
  };

  const handlePersonalMeetingStatusUpdate = async (meetingId: number, newStatus: PersonalMeetingStatus) => {
    try {
  
      console.log('🔍 Calling personalMeetings.update with payload:', { status: newStatus });
      
      const result = await personalMeetings.update(meetingId, { status: newStatus });
      console.log('✅ Personal meeting status updated successfully, result:', result);
      
      await fetchPersonalMeetings();
      console.log('✅ Personal meetings refreshed after status update');
    } catch (error: any) {
      console.error('❌ Failed to update personal meeting status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Failed to update status. Please try again.');
    }
  };

  // Status dropdown state


  const handleClientStatusToggle = async (clientId: number, currentActiveStatus: boolean) => {
    try {
  
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

  const handleClientSourceUpdate = async (clientId: number, sourceId: number) => {
    try {
      await clients.update(clientId, { sourceId });
      await fetchClients();
    } catch (error: any) {
      console.error('Error updating client source:', error);
      alert('Failed to update client source');
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

      const handlePersonalMeetingTypeUpdate = async (meetingId: number, meetingType: PersonalMeetingTypeEntity) => {
      try {
        await personalMeetings.update(meetingId, { meetingTypeId: meetingType.id });
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

  // const handleViewExpense = (expense: Expense) => { // Temporarily commented out to fix unused variable warning
  //   setViewExpenseModal({ isOpen: true, expense });
  // };

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

  // const handleAddMeeting = () => { // Temporarily commented out to fix unused variable warning
  //   setShowMeetingPanel(true);
  // };

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
    
        await meetings.disable(meetingId);
        console.log('✅ Meeting disabled successfully via API');
        
        // Update the local state immediately for visual feedback
        setMeetingList(prev => {
          const updated = prev.map(meeting => 
            meeting.id === meetingId ? { ...meeting, active: false } : meeting
          );
  
          return updated;
        });
        
        // Refresh the list from server

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

  // const formatPaymentType = (meeting: Meeting) => { // Temporarily commented out to fix unused variable warning
  //   if (meeting.isPaid && meeting.paymentType) {
  //     return meeting.paymentType.name;
  //   } else if (meeting.isPaid) {
  //     return 'Paid (No type)';
  //   } else {
  //     return 'Unpaid';
  //   }
  // };

  // const getPaymentTypeStyle = (meeting: Meeting) => { // Temporarily commented out to fix unused variable warning
  //   if (meeting.isPaid && meeting.paymentType) {
  //     return 'paid';
  //   } else if (meeting.isPaid) {
  //     return 'paid-no-type';
  //   } else {
  //     return 'unpaid';
  //   }
  // };

  // Payment type selection modal state
  // const handlePaymentTypeSelect = (type: PaymentType) => { // Temporarily commented out to fix unused variable warning
  //   setSelectedPaymentType(type);
  // };

  // Removed confirm/cancel handlers – no modal flow

  // Removed modal debug effect

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
              <div className="stat-card" title="Total number of clients currently under your care and active in your practice">
                <div className="stat-icon">🧑‍⚕️</div>
                <div className="stat-content">
                  <h4>Total Clients</h4>
                  <div className="stat-value">{stats.totalClients}</div>
                </div>
              </div>
              <div className="stat-card" title="Number of therapy sessions scheduled for today that require your attention">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h4>Today's Sessions</h4>
                  <div className="stat-value">{stats.todayMeetings}</div>
                </div>
              </div>
              <div className="stat-card" title="Total revenue earned from client sessions this month, helping track your financial performance">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h4>Monthly Revenue</h4>
                  <div className="stat-value">{formatCurrency(stats.monthlyRevenue)}</div>
                </div>
              </div>
              <div className="stat-card" title="Number of completed therapy sessions that haven't been paid yet - important for cash flow management">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h4>Unpaid Sessions</h4>
                  <div className="stat-value">{stats.unpaidSessions}</div>
                </div>
              </div>
              <div className="stat-card" title="Total number of your personal therapy or guidance sessions for professional development">
                <div className="stat-icon">🧘‍♀️</div>
                <div className="stat-content">
                  <h4>Personal Sessions</h4>
                  <div className="stat-value">{stats.totalPersonalMeetings}</div>
                </div>
              </div>
              <div className="stat-card" title="Total number of business expenses you've recorded for tax purposes and practice management">
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
                  className="btn btn--primary"
                  onClick={handleAddClient}
                >
                  ➕ Add New Client
                </button>

              </div>
            </div>
            <div className="clients-table">
              <div className="table-controls">
                <div className="filter-count">
                  Showing {paginatedClientList?.length || 0} of {sortedClientList?.length || 0} clients (Total: {clientList?.length || 0})
                </div>
                <div className="table-controls-right">
                  {sortedClientList && sortedClientList.length > 0 && (
                    <button 
                      className="select-all-button"
                      onClick={() => handleSelectAllClients(selectedClients.length === 0)}
                      title={selectedClients.length === 0 ? "Select all clients" : "Clear selection"}
                    >
                      {selectedClients.length === 0 ? "☐ Select All" : "☑ Clear All"} ({sortedClientList.length})
                    </button>
                  )}
                  <button 
                    onClick={clearClientFilters}
                    className="clear-filters-btn"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              
              {/* Filter Panel */}
              <div className="filter-panel">
                <div className="filter-group">
                  <label className="filter-label">Status:</label>
                  <FilterInput
                    value={clientFilters.active}
                    onChange={(value) => handleClientFilter('active', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All' },
                      { value: 'ACTIVE', label: 'Active' },
                      { value: 'INACTIVE', label: 'Inactive' }
                    ]}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Source:</label>
                  <FilterInput
                    value={clientFilters.source}
                    onChange={(value) => handleClientFilter('source', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All Sources' },
                      ...clientSources.map(source => ({
                        value: source.name,
                        label: source.name
                      }))
                    ]}
                  />
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedClients.length > 0 && selectedClients.length === sortedClientList.length}
                        onChange={(e) => handleSelectAllClients(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <SortableHeader
                      column="id"
                      currentSortBy={clientSortBy}
                      currentSortOrder={clientSortOrder}
                      onSort={handleClientSort}
                    >
                      ID
                    </SortableHeader>
                    <SortableHeader
                      column="fullName"
                      currentSortBy={clientSortBy}
                      currentSortOrder={clientSortOrder}
                      onSort={handleClientSort}
                    >
                      Full Name
                    </SortableHeader>
                    <SortableHeader
                      column="email"
                      currentSortBy={clientSortBy}
                      currentSortOrder={clientSortOrder}
                      onSort={handleClientSort}
                    >
                      Email
                    </SortableHeader>
                    <SortableHeader
                      column="phone"
                      currentSortBy={clientSortBy}
                      currentSortOrder={clientSortOrder}
                      onSort={handleClientSort}
                    >
                      Phone
                    </SortableHeader>
                    <SortableHeader
                      column="active"
                      currentSortBy={clientSortBy}
                      currentSortOrder={clientSortOrder}
                      onSort={handleClientSort}
                    >
                      Status
                    </SortableHeader>
                    <SortableHeader
                      column="createdAt"
                      currentSortBy={clientSortBy}
                      currentSortOrder={clientSortOrder}
                      onSort={handleClientSort}
                    >
                      Created
                    </SortableHeader>
                    <SortableHeader
                      column="source"
                      currentSortBy={clientSortBy}
                      currentSortOrder={clientSortOrder}
                      onSort={handleClientSort}
                    >
                      Source
                    </SortableHeader>
                    <th>Actions</th>
                  </tr>
                  
                </thead>
                <tbody>
                  {paginatedClientList.map((client) => (
                    <tr key={client.id} className={!client.active ? 'disabled-item' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id.toString())}
                          onChange={(e) => handleClientSelect(client.id, e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
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
                        <select
                          value={client.source?.id || 0}
                          onChange={(e) => handleClientSourceUpdate(client.id, parseInt(e.target.value) || 0)}
                          className="inline-select"
                          disabled={!client.active}
                        >
                          <option value={0}>Select a Source</option>
                          {clientSources.map(source => (
                            <option key={source.id} value={source.id}>
                              {source.name} - ₪{source.price}
                            </option>
                          ))}
                        </select>
                      </td>
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

            {/* Pagination for Clients */}
            <Pagination
              currentPage={clientPagination.currentPage}
              totalPages={Math.max(1, Math.ceil(sortedClientList.length / clientPagination.itemsPerPage))}
              totalItems={sortedClientList.length}
              itemsPerPage={clientPagination.itemsPerPage}
              onPageChange={handleClientPageChange}
              onItemsPerPageChange={handleClientItemsPerPageChange}
            />

            {/* Bulk Operations for Clients */}
            <BulkOperations
              selectedItems={selectedClients}
              totalItems={sortedClientList.length}
              onSelectAll={handleSelectAllClients}
              onClearSelection={handleClearClientSelection}
              actions={clientBulkActions}
              onActionExecute={handleBulkClientActionExecute}
              progress={clientBulkProgress}
              onProgressCancel={handleClientProgressCancel}
              isVisible={true}
            />
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
                  className="btn btn--primary"
                  onClick={handleAddSession}
                >
                  ➕ Add New Session
                </button>

              </div>
            </div>
            <div className="meetings-table">
              <div className="table-controls">
                <div className="filter-count">
                  Showing {paginatedMeetingList?.length || 0} of {sortedMeetingList?.length || 0} meetings (Total: {meetingList?.length || 0})
                </div>
                <div className="table-controls-right">
                  {sortedMeetingList && sortedMeetingList.length > 0 && (
                    <button 
                      className="select-all-button"
                      onClick={() => handleSelectAllMeetings(selectedMeetings.length === 0)}
                      title={selectedMeetings.length === 0 ? "Select all meetings" : "Clear selection"}
                    >
                      {selectedMeetings.length === 0 ? "☐ Select All" : "☑ Clear All"} ({sortedMeetingList.length})
                    </button>
                  )}
                  <button 
                    onClick={clearMeetingFilters}
                    className="clear-filters-btn"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              
              {/* Filter Panel */}
              <div className="filter-panel">
                <div className="filter-group">
                  <label className="filter-label">Client:</label>
                  <FilterInput
                    value={meetingFilters.client}
                    onChange={(value) => handleMeetingFilter('client', value)}
                    placeholder="Filter client..."
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Duration:</label>
                  <FilterInput
                    value={meetingFilters.duration}
                    onChange={(value) => handleMeetingFilter('duration', value)}
                    placeholder="Filter duration..."
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Price:</label>
                  <FilterInput
                    value={meetingFilters.price}
                    onChange={(value) => handleMeetingFilter('price', value)}
                    placeholder="Filter price..."
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Status:</label>
                  <FilterInput
                    value={meetingFilters.status}
                    onChange={(value) => handleMeetingFilter('status', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All' },
                      { value: 'SCHEDULED', label: 'Scheduled' },
                      { value: 'COMPLETED', label: 'Completed' },
                      { value: 'CANCELLED', label: 'Cancelled' }
                    ]}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Payment:</label>
                  <FilterInput
                    value={meetingFilters.isPaid}
                    onChange={(value) => handleMeetingFilter('isPaid', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All' },
                      { value: 'PAID', label: 'Paid' },
                      { value: 'UNPAID', label: 'Unpaid' }
                    ]}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Client Source:</label>
                  <FilterInput
                    value={meetingFilters.clientSource}
                    onChange={(value) => handleMeetingFilter('clientSource', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All Sources' },
                      ...clientSources.map(source => ({
                        value: source.name,
                        label: source.name
                      }))
                    ]}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Active Status:</label>
                  <FilterInput
                    value={meetingFilters.isActive}
                    onChange={(value) => handleMeetingFilter('isActive', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All' },
                      { value: 'ACTIVE', label: 'Active' },
                      { value: 'INACTIVE', label: 'Inactive' }
                    ]}
                  />
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>
                      <input
                        type="checkbox"
                        checked={selectedMeetings.length > 0 && selectedMeetings.length === sortedMeetingList.length}
                        onChange={(e) => handleSelectAllMeetings(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <SortableHeader
                      column="id"
                      currentSortBy={meetingSortBy}
                      currentSortOrder={meetingSortOrder}
                      onSort={handleMeetingSort}
                    >
                      ID
                    </SortableHeader>
                    <SortableHeader
                      column="client"
                      currentSortBy={meetingSortBy}
                      currentSortOrder={meetingSortOrder}
                      onSort={handleMeetingSort}
                    >
                      Client
                    </SortableHeader>
                    <SortableHeader
                      column="meetingDate"
                      currentSortBy={meetingSortBy}
                      currentSortOrder={meetingSortOrder}
                      onSort={handleMeetingSort}
                    >
                      Date & Time
                    </SortableHeader>
                    <SortableHeader
                      column="duration"
                      currentSortBy={meetingSortBy}
                      currentSortOrder={meetingSortOrder}
                      onSort={handleMeetingSort}
                    >
                      Duration
                    </SortableHeader>
                    <SortableHeader
                      column="price"
                      currentSortBy={meetingSortBy}
                      currentSortOrder={meetingSortOrder}
                      onSort={handleMeetingSort}
                    >
                      Price
                    </SortableHeader>
                    <SortableHeader
                      column="status"
                      currentSortBy={meetingSortBy}
                      currentSortOrder={meetingSortOrder}
                      onSort={handleMeetingSort}
                    >
                      Status
                    </SortableHeader>
                    <SortableHeader
                      column="isPaid"
                      currentSortBy={meetingSortBy}
                      currentSortOrder={meetingSortOrder}
                      onSort={handleMeetingSort}
                    >
                      Payment
                    </SortableHeader>
                    <SortableHeader
                      column="clientSource"
                      currentSortBy={meetingSortBy}
                      currentSortOrder={meetingSortOrder}
                      onSort={handleMeetingSort}
                    >
                      Client Source
                    </SortableHeader>
                    <th>Meeting Stats</th>
                    <th>Actions</th>
                  </tr>

                </thead>
                <tbody>
                  {paginatedMeetingList.map((meeting) => (
                    <tr key={meeting.id} className={meeting.active === false ? 'disabled-item' : ''} style={meeting.active === false ? { opacity: 0.6, backgroundColor: '#f8f9fa', borderLeft: '4px solid #dc3545' } : {}}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedMeetings.includes(meeting.id.toString())}
                          onChange={(e) => handleMeetingSelect(meeting.id, e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
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
                        />
                      </td>
                      <td>
                        <select
                          value={meeting.status || MeetingStatus.SCHEDULED}
                          onChange={(e) => {
                            const newStatus = e.target.value as MeetingStatus;
                            console.log('🔍 Status changed for meeting:', meeting.id, 'New status:', newStatus);
                            handleMeetingStatusUpdate(meeting.id, newStatus);
                          }}
                          className="status-select"
                          data-status={meeting.status || MeetingStatus.SCHEDULED}
                        >
                          <option value={MeetingStatus.SCHEDULED}>SCHEDULED</option>
                          <option value={MeetingStatus.COMPLETED}>COMPLETED</option>
                          <option value={MeetingStatus.CANCELLED}>CANCELLED</option>
                          <option value={MeetingStatus.NO_SHOW}>NO_SHOW</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={meeting.isPaid ? 'paid' : 'unpaid'}
                          onChange={(e) => {
                            const newPaymentStatus = e.target.value === 'paid';
                            console.log('🎯 Payment status changed for meeting:', meeting.id, 'New status:', newPaymentStatus);
                            
                            if (newPaymentStatus) {
                              // If marking as paid, show payment type selection modal
                              setPendingPaymentAction({
                                type: 'meeting',
                                id: meeting.id,
                                isPaid: newPaymentStatus
                              });
                              setShowPaymentTypeModal(true);
                              // Reset the select to unpaid until payment type is selected
                              e.target.value = 'unpaid';
                            } else {
                              // If marking as unpaid, no payment type needed
                              handleMeetingPaymentChange(meeting.id, newPaymentStatus);
                            }
                          }}
                          className="payment-select"
                          data-payment-status={meeting.isPaid ? 'paid' : 'unpaid'}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td>
                        {meeting.client?.source?.name || 'No source'}
                      </td>
                      <td>
                        {(() => {
                          const clientMeetings = meetingList.filter(m => m.client.id === meeting.client.id);
                          const completedMeetings = clientMeetings.filter(m => m.status === 'COMPLETED').length;
                          const scheduledMeetings = clientMeetings.filter(m => m.status === 'SCHEDULED').length;
                          return (
                            <div style={{ fontSize: '0.8rem', textAlign: 'center' }}>
                              <div style={{ color: '#28a745', fontWeight: 'bold' }}>
                                ✓ {completedMeetings} completed
                              </div>
                              <div style={{ color: '#007bff', fontWeight: 'bold' }}>
                                📅 {scheduledMeetings} scheduled
                              </div>
                            </div>
                          );
                        })()}
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

            {/* Pagination for Meetings */}
            <Pagination
              currentPage={meetingPagination.currentPage}
              totalPages={Math.max(1, Math.ceil(sortedMeetingList.length / meetingPagination.itemsPerPage))}
              totalItems={sortedMeetingList.length}
              itemsPerPage={meetingPagination.itemsPerPage}
              onPageChange={handleMeetingPageChange}
              onItemsPerPageChange={handleMeetingItemsPerPageChange}
            />

            {/* Bulk Operations for Meetings */}
            <BulkOperations
              selectedItems={selectedMeetings}
              totalItems={sortedMeetingList.length}
              onSelectAll={handleSelectAllMeetings}
              onClearSelection={handleClearMeetingSelection}
              actions={bulkActions}
              onActionExecute={handleBulkMeetingActionExecute}
              progress={bulkProgress}
              onProgressCancel={handleProgressCancel}
              isVisible={true}
            />
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
                  className="btn btn--primary"
                  onClick={handleAddPersonalMeeting}
                >
                  ➕ Add New Personal Session
                </button>

              </div>
            </div>
            <div className="personal-meetings-table">
              <div className="table-controls">
                <div className="filter-count">
                  Showing {paginatedPersonalMeetingList?.length || 0} of {sortedPersonalMeetingList?.length || 0} personal meetings (Total: {personalMeetingList?.length || 0})
                </div>
                <div className="table-controls-right">
                  {sortedPersonalMeetingList && sortedPersonalMeetingList.length > 0 && (
                    <button 
                      className="select-all-button"
                      onClick={() => handleSelectAllPersonalMeetings(selectedPersonalMeetings.length === 0)}
                      title={selectedPersonalMeetings.length === 0 ? "Select all personal meetings" : "Clear selection"}
                    >
                      {selectedPersonalMeetings.length === 0 ? "☐ Select All" : "☑ Clear All"} ({sortedPersonalMeetingList.length})
                    </button>
                  )}
                  <button 
                    onClick={clearPersonalMeetingFilters}
                    className="clear-filters-btn"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              
              {/* Filter Panel */}
              <div className="filter-panel">
                <div className="filter-group">
                  <label className="filter-label">Provider:</label>
                  <FilterInput
                    value={personalMeetingFilters.therapistName}
                    onChange={(value) => handlePersonalMeetingFilter('therapistName', value)}
                    placeholder="Filter provider..."
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Type:</label>
                  <FilterInput
                    value={personalMeetingFilters.meetingType}
                    onChange={(value) => handlePersonalMeetingFilter('meetingType', value)}
                    placeholder="Filter type..."
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Duration:</label>
                  <FilterInput
                    value={personalMeetingFilters.duration}
                    onChange={(value) => handlePersonalMeetingFilter('duration', value)}
                    placeholder="Filter duration..."
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Price:</label>
                  <FilterInput
                    value={personalMeetingFilters.price}
                    onChange={(value) => handlePersonalMeetingFilter('price', value)}
                    placeholder="Filter price..."
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Status:</label>
                  <FilterInput
                    value={personalMeetingFilters.status}
                    onChange={(value) => handlePersonalMeetingFilter('status', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All' },
                      { value: 'SCHEDULED', label: 'Scheduled' },
                      { value: 'COMPLETED', label: 'Completed' },
                      { value: 'CANCELLED', label: 'Cancelled' }
                    ]}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Payment:</label>
                  <FilterInput
                    value={personalMeetingFilters.isPaid}
                    onChange={(value) => handlePersonalMeetingFilter('isPaid', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All' },
                      { value: 'PAID', label: 'Paid' },
                      { value: 'UNPAID', label: 'Unpaid' }
                    ]}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Active Status:</label>
                  <FilterInput
                    value={personalMeetingFilters.isActive}
                    onChange={(value) => handlePersonalMeetingFilter('isActive', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All' },
                      { value: 'ACTIVE', label: 'Active' },
                      { value: 'INACTIVE', label: 'Inactive' }
                    ]}
                  />
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedPersonalMeetings.length > 0 && selectedPersonalMeetings.length === sortedPersonalMeetingList.length}
                        onChange={(e) => handleSelectAllPersonalMeetings(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <SortableHeader
                      column="id"
                      currentSortBy={personalMeetingSortBy}
                      currentSortOrder={personalMeetingSortOrder}
                      onSort={handlePersonalMeetingSort}
                    >
                      ID
                    </SortableHeader>
                    <SortableHeader
                      column="therapistName"
                      currentSortBy={personalMeetingSortBy}
                      currentSortOrder={personalMeetingSortOrder}
                      onSort={handlePersonalMeetingSort}
                    >
                      Provider
                    </SortableHeader>
                    <SortableHeader
                      column="meetingType"
                      currentSortBy={personalMeetingSortBy}
                      currentSortOrder={personalMeetingSortOrder}
                      onSort={handlePersonalMeetingSort}
                    >
                      Type
                    </SortableHeader>
                    <SortableHeader
                      column="meetingDate"
                      currentSortBy={personalMeetingSortBy}
                      currentSortOrder={personalMeetingSortOrder}
                      onSort={handlePersonalMeetingSort}
                    >
                      Date & Time
                    </SortableHeader>
                    <SortableHeader
                      column="duration"
                      currentSortBy={personalMeetingSortBy}
                      currentSortOrder={personalMeetingSortOrder}
                      onSort={handlePersonalMeetingSort}
                    >
                      Duration
                    </SortableHeader>
                    <SortableHeader
                      column="price"
                      currentSortBy={personalMeetingSortBy}
                      currentSortOrder={personalMeetingSortOrder}
                      onSort={handlePersonalMeetingSort}
                    >
                      Price
                    </SortableHeader>
                    <SortableHeader
                      column="status"
                      currentSortBy={personalMeetingSortBy}
                      currentSortOrder={personalMeetingSortOrder}
                      onSort={handlePersonalMeetingSort}
                    >
                      Status
                    </SortableHeader>
                    <SortableHeader
                      column="isPaid"
                      currentSortBy={personalMeetingSortBy}
                      currentSortOrder={personalMeetingSortOrder}
                      onSort={handlePersonalMeetingSort}
                    >
                      Payment
                    </SortableHeader>
                    <th>Actions</th>
                  </tr>

                </thead>
                <tbody>
                  {paginatedPersonalMeetingList.map((meeting) => (
                    <tr key={meeting.id} className={meeting.active === false ? 'disabled-item' : ''} style={meeting.active === false ? { opacity: 0.6, backgroundColor: '#f8f9fa', borderLeft: '4px solid #dc3545' } : {}}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedPersonalMeetings.includes(meeting.id.toString())}
                          onChange={(e) => handlePersonalMeetingSelect(meeting.id, e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
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
                          value={meeting.meetingType?.id || ''}
                          onChange={(e) => {
                            const selectedType = meetingTypes.find(type => type.id === parseInt(e.target.value));
                            if (selectedType) {
                              handlePersonalMeetingTypeUpdate(meeting.id, selectedType);
                            }
                          }}
                          className="inline-select"
                          disabled={meeting.active === false}
                        >
                          {meetingTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
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
                      <td>
                        <select
                          value={meeting.status || PersonalMeetingStatus.SCHEDULED}
                          onChange={(e) => {
                            const newStatus = e.target.value as PersonalMeetingStatus;
                            console.log('🔍 Status changed for personal meeting:', meeting.id, 'New status:', newStatus);
                            handlePersonalMeetingStatusUpdate(meeting.id, newStatus);
                          }}
                          className="status-select"
                          data-status={meeting.status || PersonalMeetingStatus.SCHEDULED}
                        >
                          <option value={PersonalMeetingStatus.SCHEDULED}>SCHEDULED</option>
                          <option value={PersonalMeetingStatus.COMPLETED}>COMPLETED</option>
                          <option value={PersonalMeetingStatus.CANCELLED}>CANCELLED</option>
                          <option value={PersonalMeetingStatus.NO_SHOW}>NO_SHOW</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={meeting.isPaid ? 'paid' : 'unpaid'}
                          onChange={async (e) => {
                            const newPaymentStatus = e.target.value === 'paid';
                            console.log('🎯 Payment status changed for personal meeting:', meeting.id, 'New status:', newPaymentStatus);
                            
                            if (newPaymentStatus) {
                              // If marking as paid, show payment type selection modal
                              setPendingPaymentAction({
                                type: 'personalMeeting',
                                id: meeting.id,
                                isPaid: newPaymentStatus
                              });
                              setShowPaymentTypeModal(true);
                              // Reset the select to unpaid until payment type is selected
                              e.target.value = 'unpaid';
                            } else {
                              // If marking as unpaid, no payment type needed - call directly
                              try {
                                await personalMeetings.updatePayment(meeting.id, false, undefined);
                                await fetchPersonalMeetings();
                              } catch (error) {
                                console.error('Error updating payment status:', error);
                                alert('Failed to update payment status. Please try again.');
                              }
                            }
                          }}
                          className="payment-select"
                          data-payment-status={meeting.isPaid ? 'paid' : 'unpaid'}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </select>
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

            {/* Pagination for Personal Meetings */}
            <Pagination
              currentPage={personalMeetingPagination.currentPage}
              totalPages={Math.max(1, Math.ceil(sortedPersonalMeetingList.length / personalMeetingPagination.itemsPerPage))}
              totalItems={sortedPersonalMeetingList.length}
              itemsPerPage={personalMeetingPagination.itemsPerPage}
              onPageChange={handlePersonalMeetingPageChange}
              onItemsPerPageChange={handlePersonalMeetingItemsPerPageChange}
            />

            {/* Bulk Operations for Personal Meetings */}
            <BulkOperations
              selectedItems={selectedPersonalMeetings}
              totalItems={sortedPersonalMeetingList.length}
              onSelectAll={handleSelectAllPersonalMeetings}
              onClearSelection={handleClearPersonalMeetingSelection}
              actions={personalMeetingBulkActions}
              onActionExecute={handleBulkPersonalMeetingActionExecute}
              progress={personalMeetingBulkProgress}
              onProgressCancel={handlePersonalMeetingProgressCancel}
              isVisible={true}
            />

            {/* Status Selector Modal */}
            {showStatusSelector && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '2rem',
                  minWidth: '400px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  <h3 style={{ marginBottom: '1rem', color: '#333' }}>
                    Select New Status for {pendingStatusChange?.selectedIds.length} Personal Meetings
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button
                      onClick={() => handleStatusSelect(PersonalMeetingStatus.SCHEDULED)}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      📅 Scheduled
                    </button>
                    <button
                      onClick={() => handleStatusSelect(PersonalMeetingStatus.COMPLETED)}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      ✅ Completed
                    </button>
                    <button
                      onClick={() => handleStatusSelect(PersonalMeetingStatus.CANCELLED)}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      ❌ Cancelled
                    </button>
                    <button
                      onClick={() => handleStatusSelect(PersonalMeetingStatus.NO_SHOW)}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      👻 No Show
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleStatusSelectorCancel}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                                 </div>
               </div>
             )}

             {/* Payment Selector Modal */}
             {showPaymentSelector && (
               <div style={{
                 position: 'fixed',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 backgroundColor: 'rgba(0, 0, 0, 0.5)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 zIndex: 1000
               }}>
                 <div style={{
                   backgroundColor: 'white',
                   borderRadius: '8px',
                   padding: '2rem',
                   minWidth: '400px',
                   boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                 }}>
                   <h3 style={{ marginBottom: '1rem', color: '#333' }}>
                     Select Payment Status for {pendingPaymentChange?.selectedIds.length} Personal Meetings
                   </h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                     <button
                       onClick={() => handlePaymentSelect(true)}
                       style={{
                         padding: '0.75rem 1rem',
                         backgroundColor: '#28a745',
                         color: 'white',
                         border: 'none',
                         borderRadius: '4px',
                         cursor: 'pointer',
                         fontSize: '1rem',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem'
                       }}
                     >
                       💰 Mark as Paid
                     </button>
                     <button
                       onClick={() => handlePaymentSelect(false)}
                       style={{
                         padding: '0.75rem 1rem',
                         backgroundColor: '#ffc107',
                         color: 'white',
                         border: 'none',
                         borderRadius: '4px',
                         cursor: 'pointer',
                         fontSize: '1rem',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem'
                       }}
                     >
                       💸 Mark as Unpaid
                     </button>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                     <button
                       onClick={handlePaymentSelectorCancel}
                       style={{
                         padding: '0.5rem 1rem',
                         backgroundColor: '#6c757d',
                         color: 'white',
                         border: 'none',
                         borderRadius: '4px',
                         cursor: 'pointer'
                       }}
                     >
                       Cancel
                     </button>
                   </div>
                 </div>
               </div>
             )}

             {/* Activation Selector Modal */}
             {showActivationSelector && (
               <div style={{
                 position: 'fixed',
                 top: 0,
                 left: 0,
                 right: 0,
                 bottom: 0,
                 backgroundColor: 'rgba(0, 0, 0, 0.5)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 zIndex: 1000
               }}>
                 <div style={{
                   backgroundColor: 'white',
                   borderRadius: '8px',
                   padding: '2rem',
                   minWidth: '400px',
                   boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                 }}>
                   <h3 style={{ marginBottom: '1rem', color: '#333' }}>
                     Select Activation Status for {pendingActivationChange?.selectedIds.length} Personal Meetings
                   </h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                     <button
                       onClick={() => handleActivationSelect(true)}
                       style={{
                         padding: '0.75rem 1rem',
                         backgroundColor: '#28a745',
                         color: 'white',
                         border: 'none',
                         borderRadius: '4px',
                         cursor: 'pointer',
                         fontSize: '1rem',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem'
                       }}
                     >
                       ✅ Activate Meetings
                     </button>
                     <button
                       onClick={() => handleActivationSelect(false)}
                       style={{
                         padding: '0.75rem 1rem',
                         backgroundColor: '#dc3545',
                         color: 'white',
                         border: 'none',
                         borderRadius: '4px',
                         cursor: 'pointer',
                         fontSize: '1rem',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem'
                       }}
                     >
                       ❌ Deactivate Meetings
                     </button>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                     <button
                       onClick={handleActivationSelectorCancel}
                       style={{
                         padding: '0.5rem 1rem',
                         backgroundColor: '#6c757d',
                         color: 'white',
                         border: 'none',
                         borderRadius: '4px',
                         cursor: 'pointer'
                       }}
                     >
                       Cancel
                     </button>
                   </div>
                 </div>
               </div>
             )}
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
                  className="btn btn--primary"
                  onClick={handleAddExpense}
                >
                  ➕ Add New Expense
                </button>

              </div>
            </div>
            <div className="expenses-table">
              <div className="table-controls">
                <div className="filter-count">
                  Showing {paginatedExpenseList?.length || 0} of {sortedExpenseList?.length || 0} expenses (Total: {expenseList?.length || 0})
                </div>
                <div className="table-controls-right">
                  {sortedExpenseList && sortedExpenseList.length > 0 && (
                    <button 
                      className="select-all-button"
                      onClick={() => handleSelectAllExpenses(selectedExpenses.length === 0)}
                      title={selectedExpenses.length === 0 ? "Select all expenses" : "Clear selection"}
                    >
                      {selectedExpenses.length === 0 ? "☐ Select All" : "☑ Clear All"} ({sortedExpenseList.length})
                    </button>
                  )}
                  <button 
                    onClick={clearExpenseFilters}
                    className="clear-filters-btn"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              
              {/* Filter Panel */}
              <div className="filter-panel">
                <div className="filter-group">
                  <label className="filter-label">Category:</label>
                  <FilterInput
                    value={expenseFilters.category}
                    onChange={(value) => handleExpenseFilter('category', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All Categories' },
                      ...Array.from(new Set(expenseList.map(expense => expense.category.name)))
                        .filter(Boolean)
                        .sort()
                        .map(categoryName => ({
                          value: categoryName,
                          label: categoryName
                        }))
                    ]}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Date:</label>
                  <FilterInput
                    value={expenseFilters.expenseDate}
                    onChange={(value) => handleExpenseFilter('expenseDate', value)}
                    placeholder="Filter date..."
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Status:</label>
                  <FilterInput
                    value={expenseFilters.isPaid}
                    onChange={(value) => handleExpenseFilter('isPaid', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All' },
                      { value: 'PAID', label: 'Paid' },
                      { value: 'UNPAID', label: 'Unpaid' }
                    ]}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Active Status:</label>
                  <FilterInput
                    value={expenseFilters.isActive}
                    onChange={(value) => handleExpenseFilter('isActive', value)}
                    type="select"
                    options={[
                      { value: 'ALL', label: 'All' },
                      { value: 'ACTIVE', label: 'Active' },
                      { value: 'INACTIVE', label: 'Inactive' }
                    ]}
                  />
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedExpenses.length > 0 && selectedExpenses.length === sortedExpenseList.length}
                        onChange={(e) => handleSelectAllExpenses(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <SortableHeader
                      column="id"
                      currentSortBy={expenseSortBy}
                      currentSortOrder={expenseSortOrder}
                      onSort={handleExpenseSort}
                    >
                      ID
                    </SortableHeader>
                    <SortableHeader
                      column="name"
                      currentSortBy={expenseSortBy}
                      currentSortOrder={expenseSortOrder}
                      onSort={handleExpenseSort}
                    >
                      Description
                    </SortableHeader>
                    <SortableHeader
                      column="amount"
                      currentSortBy={expenseSortBy}
                      currentSortOrder={expenseSortOrder}
                      onSort={handleExpenseSort}
                    >
                      Amount
                    </SortableHeader>
                    <SortableHeader
                      column="category"
                      currentSortBy={expenseSortBy}
                      currentSortOrder={expenseSortOrder}
                      onSort={handleExpenseSort}
                    >
                      Category
                    </SortableHeader>
                    <SortableHeader
                      column="expenseDate"
                      currentSortBy={expenseSortBy}
                      currentSortOrder={expenseSortOrder}
                      onSort={handleExpenseSort}
                    >
                      Date
                    </SortableHeader>
                    <SortableHeader
                      column="isPaid"
                      currentSortBy={expenseSortBy}
                      currentSortOrder={expenseSortOrder}
                      onSort={handleExpenseSort}
                    >
                      Status
                    </SortableHeader>
                    <th>Actions</th>
                  </tr>

                </thead>
                <tbody>
                  {paginatedExpenseList.map((expense) => (
                    <tr key={expense.id} className={expense.isActive === false ? 'disabled-item' : ''} style={expense.isActive === false ? { opacity: 0.6, backgroundColor: '#f8f9fa', borderLeft: '4px solid #dc3545' } : {}}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedExpenses.includes(expense.id.toString())}
                          onChange={(e) => handleExpenseSelect(expense.id, e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td>{expense.id}</td>
                      <td>
                        <input
                          type="text"
                          value={expense.name}
                          onChange={(e) => handleExpenseNameUpdate(expense.id, e.target.value)}
                          className="inline-input"
                          disabled={expense.isActive === false}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={expense.amount}
                          onChange={(e) => handleExpenseAmountUpdate(expense.id, parseFloat(e.target.value) || 0)}
                          className="inline-input"
                          disabled={expense.isActive === false}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={expense.category.name}
                          onChange={(e) => handleExpenseCategoryUpdate(expense.id, e.target.value)}
                          className="inline-input"
                          disabled={expense.isActive === false}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={expense.expenseDate.split('T')[0]}
                          onChange={(e) => handleExpenseDateUpdate(expense.id, e.target.value)}
                          className="inline-input"
                          disabled={expense.isActive === false}
                        />
                      </td>
                      <td>
                        <select
                          value={expense.isPaid ? 'paid' : 'unpaid'}
                          onChange={(e) => {
                            const newPaymentStatus = e.target.value === 'paid';
                            console.log('🎯 Payment status changed for expense:', expense.id, 'New status:', newPaymentStatus);
                            handleExpensePaymentToggleWithModal(expense.id, newPaymentStatus);
                            // Reset the select to current status until payment type is selected
                            e.target.value = expense.isPaid ? 'paid' : 'unpaid';
                          }}
                          className="payment-select"
                          data-payment-status={expense.isPaid ? 'paid' : 'unpaid'}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </select>
                      </td>
                      <td>
                        <button 
                          className="btn-small"
                          onClick={() => handleEditExpense(expense)}
                        >
                          Edit
                        </button>
                        {expense.isActive !== false ? (
                          <button 
                            className="btn-small"
                            style={{ backgroundColor: '#dc3545', color: 'white' }}
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            Delete
                          </button>
                        ) : (
                          <button 
                            className="btn-small"
                            style={{ backgroundColor: '#28a745', color: 'white' }}
                            onClick={() => handleRestoreExpense(expense.id)}
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

            {/* Pagination for Expenses */}
            <Pagination
              currentPage={expensePagination.currentPage}
              totalPages={Math.max(1, Math.ceil(sortedExpenseList.length / expensePagination.itemsPerPage))}
              totalItems={sortedExpenseList.length}
              itemsPerPage={expensePagination.itemsPerPage}
              onPageChange={handleExpensePageChange}
              onItemsPerPageChange={handleExpenseItemsPerPageChange}
            />

            {/* Bulk Operations for Expenses */}
            <BulkOperations
              selectedItems={selectedExpenses}
              totalItems={sortedExpenseList.length}
              onSelectAll={handleSelectAllExpenses}
              onClearSelection={handleClearExpenseSelection}
              actions={expenseBulkActions}
              onActionExecute={handleBulkExpenseActionExecute}
              progress={expenseBulkProgress}
              onProgressCancel={handleExpenseProgressCancel}
              isVisible={true}
            />
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
        session={null}
        isOpen={showAddSessionModal}
        onClose={closeAddModals}
        onSuccess={handleRefreshData}
      />

      <AddPersonalMeetingModal
        isOpen={showAddPersonalMeetingModal}
        onClose={closeAddModals}
        onSuccess={handleRefreshData}
      />

      <AddExpenseModal
        isOpen={addExpenseModal}
        onClose={closeAddModals}
        onSuccess={handleRefreshData}
      />

      {/* Payment Type Selection Modal */}
      <PaymentTypeSelectionModal
        isOpen={showPaymentTypeModal}
        onClose={() => {
          console.log('🔍 PaymentTypeSelectionModal onClose called');
          setShowPaymentTypeModal(false);
          setPendingPaymentAction(null);
        }}
        onConfirm={handlePaymentTypeSelected}
        paymentTypes={paymentTypes}
        title="Select Payment Type"
      />
      


      {/* Sessions/Meetings Selector Modals */}
      {showMeetingPaymentSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            minWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              Select Payment Status for {pendingMeetingPaymentChange?.selectedIds.length} Sessions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => handleMeetingPaymentSelect(true)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                💰 Mark as Paid
              </button>
              <button
                onClick={() => handleMeetingPaymentSelect(false)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                💸 Mark as Unpaid
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleMeetingPaymentSelectorCancel}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showMeetingStatusSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            minWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              Select Status for {pendingMeetingStatusChange?.selectedIds.length} Sessions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => handleMeetingStatusSelect('COMPLETED' as any)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ✅ Completed
              </button>
              <button
                onClick={() => handleMeetingStatusSelect('CANCELLED' as any)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ❌ Cancelled
              </button>
              <button
                onClick={() => handleMeetingStatusSelect('NO_SHOW' as any)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#6f42c1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                👻 No Show
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleMeetingStatusSelectorCancel}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showMeetingActivationSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            minWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              Select Activation Status for {pendingMeetingActivationChange?.selectedIds.length} Sessions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => handleMeetingActivationSelect(true)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🔄 Activate
              </button>
              <button
                onClick={() => handleMeetingActivationSelect(false)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ❌ Deactivate
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleMeetingActivationSelectorCancel}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clients Selector Modals */}
      {showClientActivationSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            minWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              Select Activation Status for {pendingClientActivationChange?.selectedIds.length} Clients
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => handleClientActivationSelect(true)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ✅ Activate
              </button>
              <button
                onClick={() => handleClientActivationSelect(false)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ❌ Deactivate
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowClientActivationSelector(false);
                  setPendingClientActivationChange(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Selector Modals */}
      {showExpensePaymentSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            minWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              Select Payment Status for {pendingExpensePaymentChange?.selectedIds.length} Expenses
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => handleExpensePaymentSelect(true)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                💰 Mark as Paid
              </button>
              <button
                onClick={() => handleExpensePaymentSelect(false)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                💸 Mark as Unpaid
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowExpensePaymentSelector(false);
                  setPendingExpensePaymentChange(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpenseActivationSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem',
            minWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>
              Select Activation Status for {pendingExpenseActivationChange?.selectedIds.length} Expenses
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => handleExpenseActivationSelect(true)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🔄 Activate
              </button>
              <button
                onClick={() => handleExpenseActivationSelect(false)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#ffc107',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ❌ Deactivate
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowExpenseActivationSelector(false);
                  setPendingExpenseActivationChange(null);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add some quick CSS for the new controls
const style = document.createElement('style');
style.textContent = `
  .table-controls-right {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .select-all-button {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .select-all-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  .table-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
`;
document.head.appendChild(style);

export default TherapistPanel; 