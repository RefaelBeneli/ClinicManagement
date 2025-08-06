import React, { useState, useEffect } from 'react';
import { Expense, ExpenseRequest, UpdateExpenseRequest, ExpenseCategoryResponse, PaymentType } from '../../types';
import { expenses, expenseCategories, paymentTypes } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './ViewExpenseModal.css';

interface EditExpenseModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Helper function to get default payment types
const getDefaultPaymentTypes = (): PaymentType[] => [
  { id: 1, name: 'Cash', isActive: true, createdAt: '', updatedAt: '' },
  { id: 2, name: 'Credit Card', isActive: true, createdAt: '', updatedAt: '' },
  { id: 3, name: 'Bank Transfer', isActive: true, createdAt: '', updatedAt: '' },
  { id: 4, name: 'Check', isActive: true, createdAt: '', updatedAt: '' }
];

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ expense, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ExpenseRequest>({
    name: '',
    description: '',
    amount: 0,
    currency: 'ILS',
    categoryId: 1,
    notes: '',
    expenseDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurrenceFrequency: '',
    nextDueDate: '',
    isPaid: false,
    paymentTypeId: undefined,
    receiptUrl: ''
  });

  const [categories, setCategories] = useState<ExpenseCategoryResponse[]>([]);
  const [paymentTypesList, setPaymentTypesList] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const CURRENCY_OPTIONS = ['ILS', 'USD', 'EUR'];

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
        categoryId: expense.category.id,
        notes: expense.notes || '',
        expenseDate: expense.expenseDate,
        isRecurring: expense.isRecurring,
        recurrenceFrequency: expense.recurrenceFrequency || '',
        nextDueDate: expense.nextDueDate || '',
        isPaid: expense.isPaid,
        paymentTypeId: expense.paymentType?.id,
        receiptUrl: expense.receiptUrl || ''
      });
      setError('');
    }
  }, [expense]);

  // Load categories and payment types when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          // Load categories (critical)
          const categoriesData = await expenseCategories.getActive();
          setCategories(categoriesData);

          // Load payment types based on user role
          if (user?.role === 'ADMIN') {
            try {
              const paymentTypesData = await paymentTypes.getActive();
              setPaymentTypesList(paymentTypesData);
            } catch (paymentTypeError: any) {
              console.warn('Failed to load payment types from API:', paymentTypeError);
              setPaymentTypesList(getDefaultPaymentTypes());
            }
          } else {
            // Non-admin users get default payment types without API call
            console.log('Using default payment types for non-admin user');
            setPaymentTypesList(getDefaultPaymentTypes());
          }
        } catch (error) {
          console.error('Error loading categories:', error);
          setError('Failed to load expense categories');
        }
      };
      loadData();
    }
  }, [isOpen]);

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
    setLoading(true);
    setError('');

    try {
      if (expense) {
        // Update existing expense
        await expenses.update(expense.id, formData as UpdateExpenseRequest);
      } else {
        // Create new expense
        await expenses.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      setError(error.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button className="modal__close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal__body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message enhanced">
                <span className="error-icon">⚠️</span>
                <div className="error-content">{error}</div>
                <button 
                  type="button" 
                  className="error-close enhanced"
                  onClick={() => setError('')}
                >
                  ×
                </button>
              </div>
            )}

            <div className="enhanced-group">
              <label htmlFor="name">Expense Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="enhanced-input"
              />
            </div>

            <div className="enhanced-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="enhanced-textarea"
              />
            </div>

            <div className="enhanced-group">
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
                className="enhanced-input"
              />
            </div>

            <div className="enhanced-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="enhanced-select"
              >
                {CURRENCY_OPTIONS.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            <div className="enhanced-group">
              <label htmlFor="categoryId">Category *</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="enhanced-select"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="enhanced-group">
              <label htmlFor="expenseDate">Date *</label>
              <input
                type="date"
                id="expenseDate"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleInputChange}
                required
                className="enhanced-input"
              />
            </div>

            <div className="enhanced-group">
              <label htmlFor="paymentTypeId">Payment Type</label>
              <select
                id="paymentTypeId"
                name="paymentTypeId"
                value={formData.paymentTypeId || ''}
                onChange={handleInputChange}
                className="enhanced-select"
              >
                <option value="">Select a payment type</option>
                {paymentTypesList.map(paymentType => (
                  <option key={paymentType.id} value={paymentType.id}>
                    {paymentType.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="enhanced-group">
              <label>
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleCheckboxChange}
                />
                Mark as Paid
              </label>
            </div>

            <div className="enhanced-group">
              <label>
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleCheckboxChange}
                />
                Recurring Expense
              </label>
            </div>

            {formData.isRecurring && (
              <>
                <div className="enhanced-group">
                  <label htmlFor="recurrenceFrequency">Recurrence Frequency</label>
                  <select
                    id="recurrenceFrequency"
                    name="recurrenceFrequency"
                    value={formData.recurrenceFrequency}
                    onChange={handleInputChange}
                    className="enhanced-select"
                  >
                    <option value="">Select frequency</option>
                    {RECURRENCE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="enhanced-group">
                  <label htmlFor="nextDueDate">Next Due Date</label>
                  <input
                    type="date"
                    id="nextDueDate"
                    name="nextDueDate"
                    value={formData.nextDueDate}
                    onChange={handleInputChange}
                    className="enhanced-input"
                  />
                </div>
              </>
            )}

            <div className="enhanced-group">
              <label htmlFor="receiptUrl">Receipt URL</label>
              <input
                type="url"
                id="receiptUrl"
                name="receiptUrl"
                value={formData.receiptUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/receipt"
                className="enhanced-input"
              />
            </div>

            <div className="enhanced-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="enhanced-textarea"
              />
            </div>
          </form>
        </div>
        
        <div className="modal__footer">
          <button 
            type="button" 
            className="btn btn-secondary enhanced"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary enhanced"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (expense ? 'Updating...' : 'Adding...') : (expense ? 'Update Expense' : 'Add Expense')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal; 