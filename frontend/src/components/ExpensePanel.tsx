import React, { useState, useEffect, useCallback } from 'react';
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
    category: '',
    notes: '',
    expenseDate: '',
    recurring: false,
    recurrenceFrequency: '',
    nextDueDate: '',
    paid: false,
    paymentMethod: '',
    receiptUrl: ''
  });

  // Stats state
  const [stats, setStats] = useState<ExpenseStats | null>(null);

  useEffect(() => {
    fetchExpenses();
    fetchStats();
  }, []);

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

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const expenseData = await expensesApi.getAll();
      setExpenses(expenseData);
      setError('');
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const paidExpenses = expenses.filter(e => e.paid).length;
      const unpaidExpenses = expenses.filter(e => !e.paid).length;
      const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
      const paidAmount = expenses.filter(e => e.paid).reduce((sum, e) => sum + e.amount, 0);
      const unpaidAmount = expenses.filter(e => !e.paid).reduce((sum, e) => sum + e.amount, 0);

      setStats({
        totalExpenses: expenses.length,
        paidExpenses,
        unpaidExpenses,
        totalAmount,
        paidAmount,
        unpaidAmount
      });
    } catch (error) {
      console.warn('Failed to fetch expense stats:', error);
    }
  };

  const filterAndSortExpenses = useCallback(() => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(expense => 
        statusFilter === 'PAID' ? expense.paid : !expense.paid
      );
    }

    // Apply category filter
    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'date':
          comparison = new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime();
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'status':
          comparison = (a.paid ? 1 : 0) - (b.paid ? 1 : 0);
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
      
      setExpenses(prevExpenses =>
        prevExpenses.map(expense =>
          expense.id === expenseId
            ? { ...expense, paid: !currentPaidStatus }
            : expense
        )
      );
      
      await fetchStats();
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

  const handleCategoryUpdate = async (expenseId: number, category: string) => {
    try {
      await expensesApi.update(expenseId, { category });
      await fetchExpenses();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating expense category:', error);
      setError('Failed to update expense category');
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
      setExpenses(prev => [...prev, newExpense]);
      setShowAddForm(false);
      resetForm();
      await fetchStats();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error creating expense:', error);
      setError('Failed to create expense');
    }
  };

  const handleEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    try {
      const updatedExpense = await expensesApi.update(editingExpense.id, formData);
      setExpenses(prev =>
        prev.map(expense => expense.id === editingExpense.id ? updatedExpense : expense)
      );
      setEditingExpense(null);
      resetForm();
      await fetchStats();
    } catch (error: any) {
      console.error('Error updating expense:', error);
      setError('Failed to update expense');
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (window.confirm('Are you sure you want to delete this expense? This action will deactivate the expense.')) {
      try {
        await expensesApi.disable(expenseId);
        console.log('✅ Expense deleted successfully');
        setExpenses(prev => prev.map(expense => 
          expense.id === expenseId ? { ...expense, active: false } : expense
        ));
        await fetchExpenses();
        await fetchStats();
        onRefresh?.();
      } catch (error) {
        console.error('❌ Failed to delete expense:', error);
        setError('Failed to delete expense');
      }
    }
  };

  const handleRestoreExpense = async (expenseId: number) => {
    try {
      await expensesApi.activate(expenseId);
      console.log('✅ Expense restored successfully');
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId ? { ...expense, active: true } : expense
      ));
      await fetchExpenses();
      await fetchStats();
      onRefresh?.();
    } catch (error) {
      console.error('❌ Failed to restore expense:', error);
      setError('Failed to restore expense');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: 0,
      currency: 'USD',
      category: '',
      notes: '',
      expenseDate: '',
      recurring: false,
      recurrenceFrequency: '',
      nextDueDate: '',
      paid: false,
      paymentMethod: '',
      receiptUrl: ''
    });
  };

  const startEditing = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      name: expense.name,
      description: expense.description || '',
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      notes: expense.notes || '',
      expenseDate: expense.expenseDate.split('T')[0],
      recurring: expense.recurring,
      recurrenceFrequency: expense.recurrenceFrequency || '',
      nextDueDate: expense.nextDueDate || '',
      paid: expense.paid,
      paymentMethod: expense.paymentMethod || '',
      receiptUrl: expense.receiptUrl || ''
    });
    setShowAddForm(true);
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
    const categories = Array.from(new Set(expenses.map(e => e.category)));
    return categories.sort();
  };

  return (
    <div className="expense-panel-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
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
              onClick={() => {
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

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="expense-form-section">
            <form onSubmit={editingExpense ? handleEditExpense : handleAddExpense} className="expense-form">
              <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Expense Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Office supplies"
                  />
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Office, Marketing, etc."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.recurring}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                    />
                    Recurring Expense
                  </label>
                </div>
                
                {formData.recurring && (
                  <div className="form-group">
                    <label>Recurrence Frequency</label>
                    <select
                      value={formData.recurrenceFrequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceFrequency: e.target.value }))}
                    >
                      <option value="">Select frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
              </div>

              {formData.recurring && formData.recurrenceFrequency && (
                <div className="form-group">
                  <label>Next Due Date</label>
                  <input
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextDueDate: e.target.value }))}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Method</label>
                  <input
                    type="text"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    placeholder="Credit card, cash, etc."
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.paid}
                      onChange={(e) => setFormData(prev => ({ ...prev, paid: e.target.checked }))}
                    />
                    Mark as Paid
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the expense"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or comments"
                  rows={2}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingExpense(null);
                    resetForm();
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

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
                <div key={expense.id} className={`expense-card ${expense.active === false ? 'disabled-card' : ''}`}>
                  <div className="expense-header">
                    <div className="expense-info">
                      <input
                        type="text"
                        value={expense.name}
                        onChange={(e) => handleNameUpdate(expense.id, e.target.value)}
                        className="inline-input expense-name"
                        disabled={expense.active === false}
                        placeholder="Expense name"
                      />
                      <div className="expense-meta">
                        <span>ID: {expense.id}</span>
                        <span>Date: {formatDate(expense.expenseDate)}</span>
                      </div>
                    </div>
                    <div className="expense-actions">
                      {expense.active !== false ? (
                        <>
                          <button
                            className="edit-button"
                            onClick={() => startEditing(expense)}
                            title="Edit expense"
                          >
                            ✏️
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteExpense(expense.id)}
                            title="Delete expense"
                          >
                            🗑️
                          </button>
                        </>
                      ) : (
                        <button
                          className="restore-button"
                          onClick={() => handleRestoreExpense(expense.id)}
                          title="Restore expense"
                        >
                          🔄 Restore
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="expense-details">
                    <div className="detail-item">
                      <span className="label">Amount:</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={expense.amount}
                        onChange={(e) => handleAmountUpdate(expense.id, parseFloat(e.target.value) || 0)}
                        className="inline-input"
                        disabled={expense.active === false}
                      />
                      <span className="currency-display">{formatCurrency(expense.amount)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Category:</span>
                      <input
                        type="text"
                        value={expense.category}
                        onChange={(e) => handleCategoryUpdate(expense.id, e.target.value)}
                        className="inline-input"
                        disabled={expense.active === false}
                        placeholder="Category"
                      />
                    </div>
                    <div className="detail-item">
                      <span className="label">Date:</span>
                      <input
                        type="date"
                        value={expense.expenseDate.split('T')[0]}
                        onChange={(e) => handleDateUpdate(expense.id, e.target.value)}
                        className="inline-input"
                        disabled={expense.active === false}
                      />
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <button
                        className={`payment-toggle ${expense.paid ? 'paid' : 'unpaid'}`}
                        onClick={() => handlePaymentToggle(expense.id, expense.paid)}
                        disabled={expense.active === false}
                      >
                        {expense.paid ? '✅ Paid' : '❌ Unpaid'}
                      </button>
                    </div>
                    {expense.recurring && (
                      <div className="detail-item">
                        <span className="label">Recurring:</span>
                        <span>🔄 {expense.recurrenceFrequency}</span>
                      </div>
                    )}
                  </div>

                  <div className="detail-item">
                    <span className="label">Notes:</span>
                    <textarea
                      value={expense.notes || ''}
                      onChange={(e) => handleNotesUpdate(expense.id, e.target.value)}
                      className="inline-textarea"
                      disabled={expense.active === false}
                      placeholder="Add notes..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpensePanel; 