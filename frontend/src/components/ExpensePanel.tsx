import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Expense, ExpenseRequest } from '../types';
import { expenses as expensesApi } from '../services/api';
import './ExpensePanel.css';

interface ExpensePanelProps {
  onClose: () => void;
  onRefresh?: () => void;
}

interface ExpenseStats {
  totalExpenses: number;
  paidExpenses: number;
  unpaidExpenses: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
}

const ExpensePanel: React.FC<ExpensePanelProps> = ({ onClose, onRefresh }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'date' | 'category' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseRequest>({
    name: '',
    description: '',
    amount: 0,
    currency: 'USD',
    categoryId: 1,
    notes: '',
    expenseDate: '',
    isRecurring: false,
    recurrenceFrequency: '',
    recurrenceCount: 1,
    isPaid: false,
    paymentTypeId: undefined,
    receiptUrl: ''
  });

  // Stats state
  const [stats, setStats] = useState<ExpenseStats | null>(null);

  // Ref to prevent double fetching
  const hasInitialized = useRef(false);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const expenseData = await expensesApi.getAll();
      setExpenses(expenseData);
      setError('');
      
      // Calculate stats after expenses are loaded
      await fetchStats(expenseData);
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async (expenseData?: Expense[]) => {
    try {
      const expensesToUse = expenseData || expenses;
      const paidExpenses = expensesToUse.filter(e => e.isPaid).length;
      const unpaidExpenses = expensesToUse.filter(e => !e.isPaid).length;
      const totalAmount = expensesToUse.reduce((sum, e) => sum + e.amount, 0);
      const paidAmount = expensesToUse.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
      const unpaidAmount = expensesToUse.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0);

      setStats({
        totalExpenses: expensesToUse.length,
        paidExpenses,
        unpaidExpenses,
        totalAmount,
        paidAmount,
        unpaidAmount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [expenses]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchExpenses();
      // fetchStats(); // This will be called after expenses are loaded
    }
  }, [fetchExpenses]);

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const filterAndSortExpenses = useCallback(() => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(expense => 
        statusFilter === 'PAID' ? expense.isPaid : !expense.isPaid
      );
    }

    // Apply category filter
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(expense => expense.category.name === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'amount':
          comparison = b.amount - a.amount;
          break;
        case 'date':
          comparison = new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime();
          break;
        case 'category':
          comparison = a.category.name.localeCompare(b.category.name);
          break;
        case 'status':
          comparison = (a.isPaid ? 1 : 0) - (b.isPaid ? 1 : 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortExpenses();
  }, [filterAndSortExpenses]);

  const handlePaymentToggle = async (expenseId: number, currentPaidStatus: boolean) => {
    try {
      if (currentPaidStatus) {
        await expensesApi.markAsUnpaid(expenseId);
      } else {
        await expensesApi.markAsPaid(expenseId);
      }
      
      const updatedExpenses = expenses.map(expense =>
        expense.id === expenseId
          ? { ...expense, isPaid: !currentPaidStatus }
          : expense
      );
      
      setExpenses(updatedExpenses);
      
      // Recalculate stats with updated expense data
      await fetchStats(updatedExpenses);
    } catch (error: any) {
      console.error('Error updating expense payment status:', error);
      setError('Failed to update payment status');
    }
  };

  const handleNameUpdate = async (expenseId: number, name: string) => {
    try {
      await expensesApi.update(expenseId, { name });
      await fetchExpenses();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating expense name:', error);
      setError('Failed to update expense name');
    }
  };

  const handleAmountUpdate = async (expenseId: number, amount: number) => {
    try {
      await expensesApi.update(expenseId, { amount });
      await fetchExpenses();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating expense amount:', error);
      setError('Failed to update expense amount');
    }
  };

  const handleCategoryUpdate = async (expenseId: number, newCategory: string) => {
    try {
      // Find the category by name
      const category = expenses.find(c => c.category.name === newCategory);
      if (!category) {
        console.error('Category not found:', newCategory);
        return;
      }
      
      await expensesApi.update(expenseId, { categoryId: category.category.id });
      await fetchExpenses();
    } catch (error) {
      console.error('Error updating expense category:', error);
    }
  };

  const handleDateUpdate = async (expenseId: number, expenseDate: string) => {
    try {
      await expensesApi.update(expenseId, { expenseDate });
      await fetchExpenses();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating expense date:', error);
      setError('Failed to update expense date');
    }
  };

  const handleNotesUpdate = async (expenseId: number, notes: string) => {
    try {
      await expensesApi.update(expenseId, { notes });
      await fetchExpenses();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating expense notes:', error);
      setError('Failed to update expense notes');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newExpense = await expensesApi.create(formData);
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      
      // Recalculate stats with new expense
      await fetchStats(updatedExpenses);
      
      setShowAddForm(false);
      resetForm();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error creating expense:', error);
      setError('Failed to create expense');
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      description: expense.description || '',
      amount: expense.amount,
      currency: expense.currency,
      categoryId: expense.category.id,
      notes: expense.notes || '',
      expenseDate: expense.expenseDate.split('T')[0],
      isRecurring: expense.isRecurring,
      recurrenceFrequency: expense.recurrenceFrequency || '',
      recurrenceCount: expense.recurrenceCount === null ? null : (expense.recurrenceCount || 1),
      isPaid: expense.isPaid,
      paymentTypeId: expense.paymentType?.id,
      receiptUrl: expense.receiptUrl || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      try {
        await expensesApi.disable(expenseId);
        const updatedExpenses = expenses.map(expense => 
          expense.id === expenseId ? { ...expense, isActive: false } : expense
        );
        setExpenses(updatedExpenses);
        
        // Recalculate stats after deletion
        await fetchStats(updatedExpenses);
        
        onRefresh?.();
      } catch (error) {
        console.error('Failed to delete expense:', error);
        setError('Failed to delete expense');
      }
    }
  };

  const handleRestoreExpense = async (expenseId: number) => {
    try {
      await expensesApi.activate(expenseId);
      const updatedExpenses = expenses.map(expense => 
        expense.id === expenseId ? { ...expense, isActive: true } : expense
      );
      setExpenses(updatedExpenses);
      
      // Recalculate stats after restoration
      await fetchStats(updatedExpenses);
      
      onRefresh?.();
    } catch (error) {
      console.error('Failed to restore expense:', error);
      setError('Failed to restore expense');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: 0,
      currency: 'USD',
      categoryId: 1,
      notes: '',
      expenseDate: '',
      isRecurring: false,
      recurrenceFrequency: '',
      recurrenceCount: 1,
      isPaid: false,
      paymentTypeId: undefined,
      receiptUrl: ''
    });
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingExpense(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await expensesApi.update(editingExpense.id, formData);
      } else {
        await expensesApi.create(formData);
      }
      await fetchExpenses();
      onRefresh?.();
      handleCloseForm();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setError('Failed to save expense');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategories = () => {
    const categories = Array.from(new Set(expenses.map(expense => expense.category.name)));
    return categories.sort();
  };

  const paymentTypes = [
    { id: 1, name: 'Cash' },
    { id: 2, name: 'Bank Transfer' },
    { id: 3, name: 'Credit Card' },
    { id: 4, name: 'Check' },
    { id: 5, name: 'Other' }
  ];

  return (
    <>
      <div className="expense-panel-overlay" onClick={(e) => {
        if (e.target === e.currentTarget && !showAddForm) {
          onClose();
        }
      }}>
        <div className="expense-panel">
          <div className="expense-panel-header">
            <div>
              <h2>Expense Management</h2>
              <p>Manage your practice expenses and financial records</p>
            </div>
            <button 
              className="expense-close-button" 
              onClick={onClose}
            >X</button>
          </div>

          {/* Stats Dashboard */}
          {stats && (
            <div className="expense-stats-section">
              <div className="stat-card">
                <div className="stat-value">{stats.totalExpenses}</div>
                <div className="stat-label">Total Expenses</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.paidExpenses}</div>
                <div className="stat-label">Paid</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.unpaidExpenses}</div>
                <div className="stat-label">Unpaid</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{formatCurrency(stats.totalAmount)}</div>
                <div className="stat-label">Total Amount</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="expense-controls">
            <div className="controls-left">
              
              <button 
                className="add-button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowAddForm(true);
                  setEditingExpense(null);
                  resetForm();
                }}
              >
                + Add New Expense
              </button>
              
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="controls-right">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PAID' | 'UNPAID')}
                className="filter-select"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="ALL">All Categories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
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
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError('')} className="error-close">×</button>
            </div>
          )}

          {/* Expenses List */}
          <div className="expenses-content">
            {loading ? (
              <div className="loading-spinner">Loading expenses...</div>
            ) : filteredExpenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💰</div>
                <h3>No Expenses Found</h3>
                <p>Start tracking your practice expenses by adding your first expense.</p>
                <button 
                  className="add-button"
                  onClick={() => {
                    setShowAddForm(true);
                    setEditingExpense(null);
                    resetForm();
                  }}
                >
                  Add Your First Expense
                </button>
              </div>
            ) : (
              <div className="expenses-list">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className={`expense-card ${expense.isActive === false ? 'disabled-card' : ''}`}>
                    <div className="expense-header">
                      <div className="expense-info">
                        <input
                          type="text"
                          value={expense.name}
                          onChange={(e) => handleNameUpdate(expense.id, e.target.value)}
                          className="inline-input expense-name"
                          disabled={expense.isActive === false}
                          placeholder="Expense name"
                        />
                        <div className="expense-meta">
                          <span className="expense-id">#{expense.id}</span>
                          <span className="expense-date">{new Date(expense.expenseDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="expense-actions">
                        {expense.isActive !== false ? (
                          <>
                            <button
                              className="edit-button"
                              onClick={() => handleEditExpense(expense)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            className="restore-button"
                            onClick={() => handleRestoreExpense(expense.id)}
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="expense-details">
                      <div className="detail-row">
                        <span className="label">Category:</span>
                        <input
                          type="text"
                          value={expense.category.name}
                          onChange={(e) => handleCategoryUpdate(expense.id, e.target.value)}
                          className="inline-input"
                          disabled={expense.isActive === false}
                          placeholder="Category"
                        />
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">Amount:</span>
                        <div className="amount-input-group">
                          <input
                            type="number"
                            value={expense.amount}
                            onChange={(e) => handleAmountUpdate(expense.id, parseFloat(e.target.value) || 0)}
                            className="inline-input"
                            disabled={expense.isActive === false}
                            placeholder="0.00"
                          />
                          <span className="currency-display">USD</span>
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">Date:</span>
                        <input
                          type="date"
                          value={expense.expenseDate.split('T')[0]}
                          onChange={(e) => handleDateUpdate(expense.id, e.target.value)}
                          className="inline-input"
                          disabled={expense.isActive === false}
                        />
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">Payment Status:</span>
                        <button
                          className={`payment-toggle ${expense.isPaid ? 'paid' : 'unpaid'}`}
                          onClick={() => handlePaymentToggle(expense.id, expense.isPaid)}
                          disabled={expense.isActive === false}
                        >
                          {expense.isPaid ? '✅ Paid' : '❌ Unpaid'}
                        </button>
                      </div>
                      
                      <div className="detail-row">
                        <span className="label">Notes:</span>
                        <textarea
                          value={expense.notes || ''}
                          onChange={(e) => handleNotesUpdate(expense.id, e.target.value)}
                          className="inline-textarea"
                          disabled={expense.isActive === false}
                          placeholder="Add notes..."
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Form - Rendered outside the expense panel */}
      {showAddForm && (
        <div className="expense-form-overlay" onClick={handleCloseForm}>
          <div className="expense-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="expense-form-header">
              <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button className="form-close-button" onClick={handleCloseForm}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="expense-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Expense name"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label>Category *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: parseInt(e.target.value) }))}
                >
                  <option value="">Select a category</option>
                  {expenses.map(expense => (
                    <option key={expense.category.id} value={expense.category.id}>
                      {expense.category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  required
                  value={formData.expenseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      isRecurring: e.target.checked,
                      recurrenceFrequency: e.target.checked ? prev.recurrenceFrequency : '',
                      recurrenceCount: e.target.checked ? prev.recurrenceCount : 1
                    }))}
                  />
                  Recurring Expense
                </label>
              </div>
              
              {formData.isRecurring && (
                <div className="form-group">
                  <label>Recurrence Frequency</label>
                  <select
                    value={formData.recurrenceFrequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceFrequency: e.target.value, recurrenceCount: 1 }))}
                  >
                    <option value="">Select frequency</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              )}
              
              {formData.isRecurring && formData.recurrenceFrequency && (
                <div className="form-group">
                  <label>
                    Recurrence Count
                    <span 
                      className="tooltip" 
                      title="Number of times this expense should repeat. Leave unchecked for specific count, or check 'Infinite' for ongoing recurring expense."
                    >
                      ℹ️
                    </span>
                  </label>
                  <div className="recurrence-count-container">
                    <div className="count-input-group">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.recurrenceCount === null ? '' : formData.recurrenceCount}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          recurrenceCount: e.target.value ? parseInt(e.target.value) : 1
                        }))}
                        placeholder="Enter count"
                        disabled={formData.recurrenceCount === null}
                        className="count-input"
                      />
                      <span className="frequency-unit">
                        {formData.recurrenceFrequency === 'DAILY' && 'days'}
                        {formData.recurrenceFrequency === 'WEEKLY' && 'weeks'}
                        {formData.recurrenceFrequency === 'MONTHLY' && 'months'}
                        {formData.recurrenceFrequency === 'QUARTERLY' && 'quarters'}
                        {formData.recurrenceFrequency === 'YEARLY' && 'years'}
                      </span>
                    </div>
                    <div className="infinite-checkbox">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.recurrenceCount === null}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            recurrenceCount: e.target.checked ? null : 1
                          }))}
                        />
                        ♾️ Infinite
                      </label>
                    </div>
                  </div>
                </div>
              )}
              
              
              <div className="form-group">
                <label>Payment Type</label>
                <select
                  value={formData.paymentTypeId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentTypeId: e.target.value ? parseInt(e.target.value) : undefined }))}
                >
                  <option value="">Select payment type</option>
                  {paymentTypes.map(paymentType => (
                    <option key={paymentType.id} value={paymentType.id}>
                      {paymentType.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPaid}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPaid: e.target.checked }))}
                  />
                  Mark as Paid
                </label>
              </div>
              
              <div className="form-group">
                <label>Receipt URL</label>
                <input
                  type="url"
                  value={formData.receiptUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, receiptUrl: e.target.value }))}
                  placeholder="https://example.com/receipt"
                />
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCloseForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpensePanel; 