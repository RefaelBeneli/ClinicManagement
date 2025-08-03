import React, { useState, useEffect } from 'react';
import { Expense, UpdateExpenseRequest } from '../../types';
import { expenses } from '../../services/api';
import './ViewExpenseModal.css';

interface EditExpenseModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ expense, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UpdateExpenseRequest>({
    name: '',
    description: '',
    amount: 0,
    currency: 'ILS',
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const CATEGORIES = [
    'Office Supplies',
    'Professional Development',
    'Software & Tools',
    'Travel & Transportation',
    'Marketing & Advertising',
    'Insurance',
    'Utilities',
    'Rent',
    'Equipment',
    'Other'
  ];

  const RECURRENCE_OPTIONS = [
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'BIWEEKLY', label: 'Bi-weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' },
    { value: 'CUSTOM', label: 'Custom' }
  ];

  useEffect(() => {
    if (expense) {
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
      setError('');
    }
  }, [expense]);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;

    setLoading(true);
    setError('');

    try {
      await expenses.update(expense.id, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating expense:', error);
      setError(error.response?.data?.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Edit Expense</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal__body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Expense Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (ILS) *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
              >
                <option value="ILS">ILS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
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
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <input
                type="text"
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                placeholder="e.g., Credit Card, Cash, Bank Transfer"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="paid"
                  checked={formData.paid}
                  onChange={handleCheckboxChange}
                />
                Mark as Paid
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="recurring"
                  checked={formData.recurring}
                  onChange={handleCheckboxChange}
                />
                Recurring Expense
              </label>
            </div>

            {formData.recurring && (
              <>
                <div className="form-group">
                  <label htmlFor="recurrenceFrequency">Recurrence Frequency</label>
                  <select
                    id="recurrenceFrequency"
                    name="recurrenceFrequency"
                    value={formData.recurrenceFrequency}
                    onChange={handleInputChange}
                  >
                    <option value="">Select frequency</option>
                    {RECURRENCE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
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
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="receiptUrl">Receipt URL</label>
              <input
                type="url"
                id="receiptUrl"
                name="receiptUrl"
                value={formData.receiptUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/receipt"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </form>
        </div>
        
        <div className="modal__footer">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal; 