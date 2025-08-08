import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminSearch, { SearchFilter, FilterPreset } from './AdminSearch';
import BulkOperations, { BulkAction, BulkOperationProgress } from './BulkOperations';
import './EnhancedFinancialManagement.css';

interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
  overduePayments: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  revenueGrowth: number;
  expenseGrowth: number;
  topCategories: Array<{ name: string; amount: number; percentage: number }>;
  topPaymentTypes: Array<{ name: string; count: number; amount: number }>;
}

interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  totalExpenses: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface PaymentType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  totalTransactions: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface FinancialTransaction {
  id: number;
  type: 'REVENUE' | 'EXPENSE';
  amount: number;
  currency: string;
  category: string;
  paymentType: string;
  description: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  isRecurring: boolean;
  recurringPattern?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface EnhancedFinancialManagementProps {
  onRefresh?: () => void;
}

const EnhancedFinancialManagement: React.FC<EnhancedFinancialManagementProps> = ({
  onRefresh
}) => {
  const { user: currentUser, token } = useAuth();
  
  // Data states
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<FinancialTransaction[]>([]);
  const [financialStats, setFinancialStats] = useState<FinancialStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0,
    overduePayments: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    revenueGrowth: 0,
    expenseGrowth: 0,
    topCategories: [],
    topPaymentTypes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchValue, setSearchValue] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilter[]>([]);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  
  // Bulk operations states
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [bulkProgress, setBulkProgress] = useState<BulkOperationProgress | undefined>();
  
  // Modal states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddPaymentTypeModal, setShowAddPaymentTypeModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingPaymentTypeId, setEditingPaymentTypeId] = useState<number | null>(null);
  const [showFinancialReport, setShowFinancialReport] = useState(false);
  const [selectedReportPeriod, setSelectedReportPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Ref to prevent double fetching
  const hasInitialized = useRef(false);

  // API URL configuration
  const apiUrl = useMemo(() => {
    return process.env.REACT_APP_API_URL || 
      (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
        ? 'https://web-production-9aa8.up.railway.app/api'
        : 'http://localhost:8085/api');
  }, []);
  const rootUrl = useMemo(() => apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl, [apiUrl]);

  // Initialize search filters
  const initializeSearchFilters = useCallback(() => {
    const filters: SearchFilter[] = [
      {
        id: 'transactionType',
        label: 'Transaction Type',
        type: 'select',
        options: [
          { value: 'REVENUE', label: 'Revenue' },
          { value: 'EXPENSE', label: 'Expense' }
        ],
        value: ''
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'PENDING', label: 'Pending' },
          { value: 'CANCELLED', label: 'Cancelled' }
        ],
        value: ''
      },
      {
        id: 'category',
        label: 'Category',
        type: 'select',
        options: expenseCategories.map(cat => ({ value: cat.name, label: cat.name })),
        value: ''
      },
      {
        id: 'paymentType',
        label: 'Payment Type',
        type: 'select',
        options: paymentTypes.map(pt => ({ value: pt.name, label: pt.name })),
        value: ''
      },
      {
        id: 'amountRange',
        label: 'Amount Range',
        type: 'number',
        value: ''
      },
      {
        id: 'dateRange',
        label: 'Date Range',
        type: 'date',
        value: ''
      },
      {
        id: 'isRecurring',
        label: 'Recurring',
        type: 'boolean',
        value: false
      }
    ];
    setSearchFilters(filters);
  }, [expenseCategories, paymentTypes]);

  // Fetch financial data
  const fetchFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch expense categories
      const categoriesResponse = await fetch(`${apiUrl}/expense-categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Fetch payment types
      const paymentTypesResponse = await fetch(`${rootUrl}/admin/payment-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Fetch expenses (as transactions)
      const expensesResponse = await fetch(`${apiUrl}/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (categoriesResponse.ok && paymentTypesResponse.ok && expensesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const paymentTypesData = await paymentTypesResponse.json();
        const expensesData = await expensesResponse.json();
        
        // Transform categories
        const categories: ExpenseCategory[] = (categoriesData.content || []).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          isActive: cat.isActive,
          totalExpenses: cat.totalExpenses || 0,
          totalAmount: cat.totalAmount || 0,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt
        }));
        
        // Transform payment types
        const paymentTypesList: PaymentType[] = (paymentTypesData.content || []).map((pt: any) => ({
          id: pt.id,
          name: pt.name,
          description: pt.description,
          isActive: pt.isActive,
          totalTransactions: pt.totalTransactions || 0,
          totalAmount: pt.totalAmount || 0,
          createdAt: pt.createdAt,
          updatedAt: pt.updatedAt
        }));
        
        // Transform expenses to transactions
        const expenseTransactions: FinancialTransaction[] = (expensesData.content || []).map((expense: any) => ({
          id: expense.id,
          type: 'EXPENSE' as const,
          amount: expense.amount,
          currency: expense.currency || 'USD',
          category: expense.category?.name || 'Uncategorized',
          paymentType: expense.paymentType?.name || 'Unknown',
          description: expense.name,
          date: expense.expenseDate,
          status: expense.isPaid ? 'COMPLETED' : 'PENDING',
          isRecurring: expense.isRecurring || false,
          recurringPattern: expense.recurrenceFrequency,
          notes: expense.notes,
          createdAt: expense.createdAt,
          updatedAt: expense.updatedAt
        }));
        
        setExpenseCategories(categories);
        setPaymentTypes(paymentTypesList);
        setTransactions(expenseTransactions);
        
        // Calculate financial stats
        calculateFinancialStats(expenseTransactions, categories, paymentTypesList);
      } else {
        throw new Error('Failed to fetch financial data');
      }
    } catch (error: any) {
      console.error('Error fetching financial data:', error);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, rootUrl, token]);

  // Calculate financial statistics
  const calculateFinancialStats = useCallback((
    transactions: FinancialTransaction[],
    categories: ExpenseCategory[],
    paymentTypes: PaymentType[]
  ) => {
    const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const totalRevenue = transactions.filter(t => t.type === 'REVENUE').reduce((sum, t) => sum + t.amount, 0);
    const pendingPayments = transactions.filter(t => t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0);
    const overduePayments = transactions.filter(t => 
      t.status === 'PENDING' && new Date(t.date) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate monthly stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
    
    const monthlyRevenue = monthlyTransactions.filter(t => t.type === 'REVENUE').reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = monthlyTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate top categories
    const categoryStats = categories.map(cat => {
      const categoryTransactions = transactions.filter(t => t.category === cat.name);
      const totalAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        name: cat.name,
        amount: totalAmount,
        percentage: totalExpenses > 0 ? (totalAmount / totalExpenses) * 100 : 0
      };
    }).sort((a, b) => b.amount - a.amount).slice(0, 5);
    
    // Calculate top payment types
    const paymentTypeStats = paymentTypes.map(pt => {
      const paymentTransactions = transactions.filter(t => t.paymentType === pt.name);
      const totalAmount = paymentTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        name: pt.name,
        count: paymentTransactions.length,
        amount: totalAmount
      };
    }).sort((a, b) => b.amount - a.amount).slice(0, 5);
    
    setFinancialStats({
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      pendingPayments,
      overduePayments,
      monthlyRevenue,
      monthlyExpenses,
      revenueGrowth: 0, // Would need historical data to calculate
      expenseGrowth: 0, // Would need historical data to calculate
      topCategories: categoryStats,
      topPaymentTypes: paymentTypeStats
    });
  }, []);

  // Apply filters and search
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...transactions];

    // Apply search
    if (searchValue) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchValue.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchValue.toLowerCase()) ||
        transaction.paymentType.toLowerCase().includes(searchValue.toLowerCase()) ||
        transaction.notes?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Apply filters
    searchFilters.forEach(filter => {
      if (filter.value) {
        switch (filter.id) {
          case 'transactionType':
            filtered = filtered.filter(transaction => transaction.type === filter.value);
            break;
          case 'status':
            filtered = filtered.filter(transaction => transaction.status === filter.value);
            break;
          case 'category':
            filtered = filtered.filter(transaction => transaction.category === filter.value);
            break;
          case 'paymentType':
            filtered = filtered.filter(transaction => transaction.paymentType === filter.value);
            break;
          case 'amountRange':
            const range = filter.value as { min: string; max: string };
            if (range.min) {
              filtered = filtered.filter(transaction => transaction.amount >= parseFloat(range.min));
            }
            if (range.max) {
              filtered = filtered.filter(transaction => transaction.amount <= parseFloat(range.max));
            }
            break;
          case 'dateRange':
            const dateRange = filter.value as { start: string; end: string };
            if (dateRange.start) {
              filtered = filtered.filter(transaction => new Date(transaction.date) >= new Date(dateRange.start));
            }
            if (dateRange.end) {
              filtered = filtered.filter(transaction => new Date(transaction.date) <= new Date(dateRange.end));
            }
            break;
          case 'isRecurring':
            if (filter.value) {
              filtered = filtered.filter(transaction => transaction.isRecurring);
            }
            break;
        }
      }
    });

    setFilteredTransactions(filtered);
  }, [transactions, searchValue, searchFilters]);

  // Initialize on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchFinancialData();
    }
  }, [fetchFinancialData]);

  // Initialize filters when data is loaded
  useEffect(() => {
    if (expenseCategories.length > 0 || paymentTypes.length > 0) {
      initializeSearchFilters();
    }
  }, [initializeSearchFilters, expenseCategories.length, paymentTypes.length]);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Clear selection when filtered data changes
  useEffect(() => {
    setSelectedTransactions([]);
  }, [filteredTransactions]);

  // Event handlers
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setSearchFilters(prev => 
      prev.map(filter => 
        filter.id === filterId ? { ...filter, value } : filter
      )
    );
  };

  const handleToggleAdvancedFilters = () => {
    setShowAdvancedFilters(prev => !prev);
  };

  const handlePresetApply = (preset: FilterPreset) => {
    setSearchFilters(prev => 
      prev.map(filter => ({
        ...filter,
        value: preset.filters[filter.id] || (filter.type === 'boolean' ? false : '')
      }))
    );
  };

  const handlePresetSave = (name: string, description: string, filters: Record<string, any>) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      description,
      filters
    };
    setFilterPresets(prev => [...prev, newPreset]);
  };

  const handlePresetDelete = (presetId: string) => {
    setFilterPresets(prev => prev.filter(p => p.id !== presetId));
  };

  // Generate search suggestions
  const generateSearchSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    // Add category suggestions
    expenseCategories.forEach(cat => {
      suggestions.push(cat.name);
    });
    
    // Add payment type suggestions
    paymentTypes.forEach(pt => {
      suggestions.push(pt.name);
    });
    
    // Add status suggestions
    suggestions.push('Completed', 'Pending', 'Cancelled');
    
    // Add transaction type suggestions
    suggestions.push('Revenue', 'Expense');
    
    return suggestions;
  }, [expenseCategories, paymentTypes]);

  // Bulk operations
  const handleTransactionSelect = (transactionKey: string, isSelected: boolean) => {
    setSelectedTransactions(prev => 
      isSelected 
        ? [...prev, transactionKey]
        : prev.filter(key => key !== transactionKey)
    );
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedTransactions(filteredTransactions.map(t => `${t.type}-${t.id}`));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedTransactions([]);
  };

  // Initialize bulk actions
  const initializeBulkActions = useCallback((): BulkAction[] => {
    return [
      {
        id: 'export',
        label: 'Export Selected',
        icon: '📤',
        isDestructive: false
      },
      {
        id: 'mark-completed',
        label: 'Mark as Completed',
        icon: '✅',
        isDestructive: false
      },
      {
        id: 'mark-pending',
        label: 'Mark as Pending',
        icon: '⏳',
        isDestructive: false
      },
      {
        id: 'delete',
        label: 'Delete Selected',
        icon: '🗑️',
        isDestructive: true
      }
    ];
  }, []);

  // Handle bulk action execution
  const handleBulkActionExecute = async (actionId: string) => {
    const selectedTransactionIds = selectedTransactions.map(key => {
      const [type, id] = key.split('-');
      return parseInt(id);
    });

    setBulkProgress({
      id: actionId,
      status: 'running',
      total: selectedTransactionIds.length,
      completed: 0,
      failed: 0,
      message: `Executing ${actionId}...`
    });

    try {
      for (let i = 0; i < selectedTransactionIds.length; i++) {
        const transactionId = selectedTransactionIds[i];
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setBulkProgress(prev => prev ? {
          ...prev,
          completed: i + 1,
          message: `Processing transaction ${i + 1} of ${selectedTransactionIds.length}...`
        } : undefined);
      }

      setBulkProgress(prev => prev ? {
        ...prev,
        status: 'completed',
        message: `Successfully processed ${selectedTransactionIds.length} transactions`
      } : undefined);

      // Refresh data
      await fetchFinancialData();
      if (onRefresh) onRefresh();

      setTimeout(() => {
        setBulkProgress(undefined);
        setSelectedTransactions([]);
      }, 2000);

    } catch (error) {
      setBulkProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        message: 'Failed to process transactions'
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

  // Category and payment type management
  const handleAddCategory = () => {
    setShowAddCategoryModal(true);
  };

  const handleAddPaymentType = () => {
    setShowAddPaymentTypeModal(true);
  };

  const handleEditCategory = (categoryId: number) => {
    setEditingCategoryId(categoryId);
    setShowAddCategoryModal(true);
  };

  const handleEditPaymentType = (paymentTypeId: number) => {
    setEditingPaymentTypeId(paymentTypeId);
    setShowAddPaymentTypeModal(true);
  };

  const handleRefreshData = () => {
    fetchFinancialData();
    if (onRefresh) onRefresh();
  };

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-badge completed';
      case 'pending': return 'status-badge pending';
      case 'cancelled': return 'status-badge cancelled';
      default: return 'status-badge unknown';
    }
  };

  // Get transaction type badge class
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'REVENUE': return 'type-badge revenue';
      case 'EXPENSE': return 'type-badge expense';
      default: return 'type-badge unknown';
    }
  };

  const bulkActions = initializeBulkActions();
  const searchSuggestions = generateSearchSuggestions();

  if (loading) {
    return (
      <div className="enhanced-financial-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enhanced-financial-management">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Financial Data</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={handleRefreshData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-financial-management">
      {/* Header */}
      <div className="section-header">
        <div className="header-content">
          <h2>💰 Financial Management</h2>
          <p>Comprehensive oversight of expenses, categories, payment types, and financial reporting</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setShowFinancialReport(!showFinancialReport)}>
            {showFinancialReport ? '📊 Hide Report' : '📊 Financial Report'}
          </button>
          <button className="btn-secondary" onClick={handleAddPaymentType}>
            ➕ Payment Type
          </button>
          <button className="btn-secondary" onClick={handleAddCategory}>
            ➕ Category
          </button>
          <button className="btn-primary" onClick={handleRefreshData}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Financial Statistics */}
      <div className="financial-stats">
        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-details">
            <div className="stat-value">{formatCurrency(financialStats.totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon expense">💸</div>
          <div className="stat-details">
            <div className="stat-value">{formatCurrency(financialStats.totalExpenses)}</div>
            <div className="stat-label">Total Expenses</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon profit">📈</div>
          <div className="stat-details">
            <div className="stat-value">{formatCurrency(financialStats.netProfit)}</div>
            <div className="stat-label">Net Profit</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-details">
            <div className="stat-value">{formatCurrency(financialStats.pendingPayments)}</div>
            <div className="stat-label">Pending Payments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon overdue">🚨</div>
          <div className="stat-details">
            <div className="stat-value">{formatCurrency(financialStats.overduePayments)}</div>
            <div className="stat-label">Overdue Payments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon monthly">📅</div>
          <div className="stat-details">
            <div className="stat-value">{formatCurrency(financialStats.monthlyRevenue - financialStats.monthlyExpenses)}</div>
            <div className="stat-label">Monthly Net</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <AdminSearch
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        filters={searchFilters}
        onFilterChange={handleFilterChange}
        filterPresets={filterPresets}
        onPresetApply={handlePresetApply}
        onPresetSave={handlePresetSave}
        onPresetDelete={handlePresetDelete}
        suggestions={searchSuggestions}
        placeholder="Search transactions by description, category, payment type, or notes..."
        showAdvancedFilters={showAdvancedFilters}
        onToggleAdvancedFilters={handleToggleAdvancedFilters}
        resultCount={filteredTransactions.length}
        isLoading={loading}
      />

      {/* Financial Overview Tabs */}
      <div className="financial-tabs">
        <div className="tab-header">
          <button className="tab-button active">Transactions</button>
          <button className="tab-button">Categories</button>
          <button className="tab-button">Payment Types</button>
          <button className="tab-button">Reports</button>
        </div>

        {/* Transactions Tab */}
        <div className="tab-content active">
          <div className="transactions-table-container">
            <div className="table-header">
              <h3>Financial Transactions ({filteredTransactions.length})</h3>
              {selectedTransactions.length > 0 && (
                <span className="selection-count">
                  {selectedTransactions.length} selected
                </span>
              )}
            </div>

            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th className="select-column">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        ref={input => {
                          if (input) {
                            input.indeterminate = selectedTransactions.length > 0 && selectedTransactions.length < filteredTransactions.length;
                          }
                        }}
                      />
                    </th>
                    <th>Transaction Info</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Payment Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const transactionKey = `${transaction.type}-${transaction.id}`;
                    return (
                      <tr 
                        key={transactionKey} 
                        className={selectedTransactions.includes(transactionKey) ? 'selected' : ''}
                      >
                        <td className="select-column">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(transactionKey)}
                            onChange={(e) => handleTransactionSelect(transactionKey, e.target.checked)}
                          />
                        </td>
                        <td className="transaction-info">
                          <div className="transaction-details">
                            <div className="transaction-title">{transaction.description}</div>
                            <div className="transaction-meta">
                              <span className="currency">{transaction.currency}</span>
                              {transaction.isRecurring && <span className="recurring-indicator">🔄 Recurring</span>}
                              {transaction.notes && <span className="notes-indicator">📝 Has Notes</span>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={getTypeBadgeClass(transaction.type)}>
                            {transaction.type === 'REVENUE' ? 'Revenue' : 'Expense'}
                          </span>
                        </td>
                        <td className="category-column">
                          <span className="category-name">{transaction.category}</span>
                        </td>
                        <td className="payment-type-column">
                          <span className="payment-type-name">{transaction.paymentType}</span>
                        </td>
                        <td className="amount-column">
                          <span className={`amount ${transaction.type === 'EXPENSE' ? 'negative' : 'positive'}`}>
                            {transaction.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
                          </span>
                        </td>
                        <td className="date-column">
                          <span className="date-time">{formatDate(transaction.date)}</span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(transaction.status)}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="actions-column">
                          <div className="action-buttons">
                            <button 
                              className="btn-small"
                              onClick={() => {/* View transaction details */}}
                              title="View transaction details"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn-small"
                              onClick={() => {/* Edit transaction */}}
                              title="Edit transaction"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn-small"
                              onClick={() => {/* View activity */}}
                              title="View activity"
                            >
                              📊
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredTransactions.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">💰</div>
                  <h3>No transactions found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Tab */}
        <div className="tab-content">
          <div className="categories-section">
            <div className="section-header">
              <h3>Expense Categories ({expenseCategories.length})</h3>
              <button className="btn-primary" onClick={handleAddCategory}>
                ➕ Add Category
              </button>
            </div>
            <div className="categories-grid">
              {expenseCategories.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="category-header">
                    <h4>{category.name}</h4>
                    <span className={`status-indicator ${category.isActive ? 'active' : 'inactive'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="category-stats">
                    <div className="stat">
                      <span className="label">Total Expenses:</span>
                      <span className="value">{category.totalExpenses}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Total Amount:</span>
                      <span className="value">{formatCurrency(category.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="category-actions">
                    <button className="btn-small" onClick={() => handleEditCategory(category.id)}>
                      ✏️ Edit
                    </button>
                    <button className="btn-small">
                      📊 View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Types Tab */}
        <div className="tab-content">
          <div className="payment-types-section">
            <div className="section-header">
              <h3>Payment Types ({paymentTypes.length})</h3>
              <button className="btn-primary" onClick={handleAddPaymentType}>
                ➕ Add Payment Type
              </button>
            </div>
            <div className="payment-types-grid">
              {paymentTypes.map((paymentType) => (
                <div key={paymentType.id} className="payment-type-card">
                  <div className="payment-type-header">
                    <h4>{paymentType.name}</h4>
                    <span className={`status-indicator ${paymentType.isActive ? 'active' : 'inactive'}`}>
                      {paymentType.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="payment-type-stats">
                    <div className="stat">
                      <span className="label">Transactions:</span>
                      <span className="value">{paymentType.totalTransactions}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Total Amount:</span>
                      <span className="value">{formatCurrency(paymentType.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="payment-type-actions">
                    <button className="btn-small" onClick={() => handleEditPaymentType(paymentType.id)}>
                      ✏️ Edit
                    </button>
                    <button className="btn-small">
                      📊 View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reports Tab */}
        <div className="tab-content">
          <div className="reports-section">
            <div className="section-header">
              <h3>Financial Reports</h3>
              <div className="report-controls">
                <select 
                  value={selectedReportPeriod} 
                  onChange={(e) => setSelectedReportPeriod(e.target.value as 'month' | 'quarter' | 'year')}
                  className="period-selector"
                >
                  <option value="month">Monthly</option>
                  <option value="quarter">Quarterly</option>
                  <option value="year">Yearly</option>
                </select>
                <button className="btn-primary">📊 Generate Report</button>
              </div>
            </div>
            <div className="reports-grid">
              <div className="report-card">
                <h4>Top Categories</h4>
                <div className="report-content">
                  {financialStats.topCategories.map((category, index) => (
                    <div key={index} className="report-item">
                      <span className="item-name">{category.name}</span>
                      <span className="item-value">{formatCurrency(category.amount)} ({category.percentage.toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="report-card">
                <h4>Top Payment Types</h4>
                <div className="report-content">
                  {financialStats.topPaymentTypes.map((paymentType, index) => (
                    <div key={index} className="report-item">
                      <span className="item-name">{paymentType.name}</span>
                      <span className="item-value">{formatCurrency(paymentType.amount)} ({paymentType.count} transactions)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Operations */}
      <BulkOperations
        selectedItems={selectedTransactions}
        totalItems={filteredTransactions.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        actions={bulkActions}
        onActionExecute={handleBulkActionExecute}
        progress={bulkProgress}
        onProgressCancel={handleProgressCancel}
        isVisible={selectedTransactions.length > 0 || !!bulkProgress}
      />

      {/* Modals would go here */}
      {/* Add Category Modal */}
      {/* Add Payment Type Modal */}
      {/* Financial Report Modal */}
    </div>
  );
};

export default EnhancedFinancialManagement; 