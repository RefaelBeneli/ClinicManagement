import React, { useState, useEffect } from 'react';
import { expenses } from '../services/api';
import { Expense, ExpenseRequest, UpdateExpenseRequest, ExpenseSummary } from '../types';
import './ExpensePanel.css';

interface ExpensePanelProps {
  onClose: () => void;
  onRefresh: () => void;
}

const EXPENSE_CATEGORIES = [
  'Office & Rent',
  'Insurance & Liability',
  'Software & Tools',
  'Marketing & Advertising',
  'Professional Development',
  'Supplies & Equipment',
  'Transportation',
  'Utilities',
  'Other'
];

const RECURRENCE_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'CUSTOM', label: 'Custom' }
];

const ExpensePanel: React.FC<ExpensePanelProps> = ({ onClose, onRefresh }) => {
  console.log('ExpensePanel component rendered');
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'recurring'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category' | 'name'>('date');

  // Form state
  const [formData, setFormData] = useState<ExpenseRequest>({
    name: '',
    description: '',
    amount: 0,
    currency: 'ILS',
    category: '',
    notes: '',
    expenseDate: new Date().toISOString().split('T')[0],
    recurring: false,
    recurrenceFrequency: '',
    nextDueDate: '',
    paid: false,
    paymentMethod: '',
    receiptUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesData, summaryData] = await Promise.all([
        expenses.getAll(),
        expenses.getSummary()
      ]);
      setExpenseList(expensesData);
      setSummary(summaryData);
      setError('');
    } catch (error: any) {
      console.error('Error fetching expenses:', error);
      setError(`Failed to load expenses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    setFormData({
      name: '',
      description: '',
      amount: 0,
      currency: 'ILS',
      category: '',
      notes: '',
      expenseDate: new Date().toISOString().split('T')[0],
      recurring: false,
      recurrenceFrequency: '',
      nextDueDate: '',
      paid: false,
      paymentMethod: '',
      receiptUrl: ''
    });
    setShowAddModal(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      name: expense.name,
      description: expense.description || '',
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      notes: expense.notes || '',
      expenseDate: expense.expenseDate,
      recurring: expense.recurring,
      recurrenceFrequency: expense.recurrenceFrequency || '',
      nextDueDate: expense.nextDueDate || '',
      paid: expense.paid,
      paymentMethod: expense.paymentMethod || '',
      receiptUrl: expense.receiptUrl || ''
    });
    setShowEditModal(true);
  };

  const handleSaveExpense = async () => {
    try {
      if (showEditModal && selectedExpense) {
        const updateData: UpdateExpenseRequest = {
          name: formData.name,
          description: formData.description || undefined,
          amount: formData.amount,
          currency: formData.currency,
          category: formData.category,
          notes: formData.notes || undefined,
          expenseDate: formData.expenseDate,
          recurring: formData.recurring,
          recurrenceFrequency: formData.recurrenceFrequency || undefined,
          nextDueDate: formData.nextDueDate || undefined,
          paid: formData.paid,
          paymentMethod: formData.paymentMethod || undefined,
          receiptUrl: formData.receiptUrl || undefined
        };
        await expenses.update(selectedExpense.id, updateData);
      } else {
        await expenses.create(formData);
      }
      
      await fetchData();
      onRefresh();
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedExpense(null);
    } catch (error: any) {
      console.error('Error saving expense:', error);
      setError(`Failed to save expense: ${error.message}`);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenses.delete(id);
        await fetchData();
        onRefresh();
      } catch (error: any) {
        console.error('Error deleting expense:', error);
        setError(`Failed to delete expense: ${error.message}`);
      }
    }
  };

  const handleTogglePaid = async (expense: Expense) => {
    try {
      if (expense.paid) {
        await expenses.markAsUnpaid(expense.id);
      } else {
        await expenses.markAsPaid(expense.id);
      }
      await fetchData();
      onRefresh();
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      setError(`Failed to update payment status: ${error.message}`);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const filteredExpenses = expenseList
    .filter(expense => {
      // Filter by status
          if (filter === 'paid' && !expense.paid) return false;
    if (filter === 'unpaid' && expense.paid) return false;
    if (filter === 'recurring' && !expense.recurring) return false;
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          expense.name.toLowerCase().includes(searchLower) ||
          expense.category.toLowerCase().includes(searchLower) ||
          (expense.description && expense.description.toLowerCase().includes(searchLower)) ||
          (expense.notes && expense.notes.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="expense-panel">
        <div className="panel-header">
          <h2>💰 Expense Management</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="loading">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="expense-panel">
      <div className="panel-header">
        <h2>💰 Expense Management</h2>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Summary Cards */}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Expenses</h3>
            <p className="amount">₪{summary.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Paid</h3>
            <p className="amount paid">₪{summary.paidExpenses.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Unpaid</h3>
            <p className="amount unpaid">₪{summary.unpaidExpenses.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Recurring</h3>
            <p className="amount">₪{summary.recurringExpenses.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All Expenses</option>
            <option value="paid">Paid Only</option>
            <option value="unpaid">Unpaid Only</option>
            <option value="recurring">Recurring Only</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="category">Sort by Category</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
        <button className="btn-primary" onClick={handleAddExpense}>
          ➕ Add Expense
        </button>
      </div>

      {/* Expense List */}
      <div className="expense-list">
        {filteredExpenses.length === 0 ? (
          <div className="no-expenses">
            <p>No expenses found. Add your first expense to get started!</p>
          </div>
        ) : (
          filteredExpenses.map(expense => (
                            <div key={expense.id} className={`expense-item ${expense.paid ? 'paid' : 'unpaid'}`}>
              <div className="expense-header">
                <h3>{expense.name}</h3>
                <div className="expense-amount">
                  ₪{expense.amount.toLocaleString()}
                </div>
              </div>
              <div className="expense-details">
                <span className="category">{expense.category}</span>
                <span className="date">{new Date(expense.expenseDate).toLocaleDateString()}</span>
                                  {expense.recurring && (
                  <span className="recurring">🔄 {expense.recurrenceFrequency}</span>
                )}
                                  {expense.paid ? (
                  <span className="status paid">✓ Paid</span>
                ) : (
                  <span className="status unpaid">⏳ Unpaid</span>
                )}
              </div>
              {expense.description && (
                <p className="description">{expense.description}</p>
              )}
              <div className="expense-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleTogglePaid(expense)}
                >
                                      {expense.paid ? 'Mark Unpaid' : 'Mark Paid'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => handleEditExpense(expense)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteExpense(expense.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{showEditModal ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button 
                className="close-button" 
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedExpense(null);
                }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSaveExpense(); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Expense Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="amount">Amount (ILS) *</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {EXPENSE_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="expenseDate">Date *</label>
                    <input
                      type="date"
                      id="expenseDate"
                      name="expenseDate"
                      value={formData.expenseDate}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                                        name="recurring"
                checked={formData.recurring}
                        onChange={handleFormChange}
                      />
                      Recurring Expense
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                                        name="paid"
                checked={formData.paid}
                        onChange={handleFormChange}
                      />
                      Already Paid
                    </label>
                  </div>
                </div>

                {formData.recurring && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="recurrenceFrequency">Frequency</label>
                      <select
                        id="recurrenceFrequency"
                        name="recurrenceFrequency"
                        value={formData.recurrenceFrequency}
                        onChange={handleFormChange}
                      >
                        <option value="">Select Frequency</option>
                        {RECURRENCE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="nextDueDate">Next Due Date</label>
                      <input
                        type="date"
                        id="nextDueDate"
                        name="nextDueDate"
                        value={formData.nextDueDate}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="paymentMethod">Payment Method</label>
                    <input
                      type="text"
                      id="paymentMethod"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleFormChange}
                      placeholder="e.g., Credit Card, Bank Transfer"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="receiptUrl">Receipt URL</label>
                    <input
                      type="url"
                      id="receiptUrl"
                      name="receiptUrl"
                      value={formData.receiptUrl}
                      onChange={handleFormChange}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={2}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedExpense(null);
                  }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {showEditModal ? 'Update Expense' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensePanel; 