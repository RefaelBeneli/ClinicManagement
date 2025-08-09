import React, { useState, useEffect } from 'react';
import { ExpenseRequest, ExpenseCategoryResponse, PaymentType } from '../../types';
import { expenses, expenseCategories, paymentTypes } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Modal.css';

interface AddExpenseModalProps {
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

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSuccess }) => {
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
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'BIWEEKLY', label: 'Bi-weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' }
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        amount: 0,
        currency: 'ILS',
        categoryId: 1,
        notes: '',
        expenseDate: new Date().toISOString().split('T')[0],
        isRecurring: false,
        recurrenceFrequency: '',
        isPaid: false,
        paymentTypeId: undefined,
        receiptUrl: ''
      });
      setError('');
    }
  }, [isOpen]);

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
  }, [isOpen, user?.role]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Expense name is required');
      return;
    }
    
    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await expenses.create(formData);
      console.log('✅ Expense created successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error creating expense:', error);
      setError(error.response?.data?.message || 'Failed to create expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Add New Expense</h2>
          <button 
            className="modal__close-button" 
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal__body">
          <form onSubmit={handleSubmit} className="enhanced-group">
            {error && (
              <div className="error-message enhanced">
                <div className="error-icon">⚠</div>
                <div className="error-content">{error}</div>
                <button 
                  type="button" 
                  className="error-close enhanced"
                  onClick={() => setError('')}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            <div className="enhanced-row">
              <div className="enhanced-group">
                <label htmlFor="name" className="form-label">
                  Expense Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="enhanced-input"
                  placeholder="Enter expense name"
                  required
                />
              </div>

              <div className="enhanced-group">
                <label htmlFor="amount" className="form-label">
                  Amount <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="enhanced-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="enhanced-row">
              <div className="enhanced-group">
                <label htmlFor="currency" className="form-label">
                  Currency
                </label>
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
                <label htmlFor="categoryId" className="form-label">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="enhanced-select"
                  required
                >
                  <option value="">Select a category...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="enhanced-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="enhanced-textarea"
                placeholder="Enter expense description"
                rows={3}
              />
            </div>

            <div className="enhanced-row">
              <div className="enhanced-group">
                <label htmlFor="expenseDate" className="form-label">
                  Expense Date
                </label>
                <input
                  type="date"
                  id="expenseDate"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleInputChange}
                  className="enhanced-input"
                />
              </div>

              <div className="enhanced-group">
                <label htmlFor="paymentTypeId" className="form-label">
                  Payment Type
                </label>
                <select
                  id="paymentTypeId"
                  name="paymentTypeId"
                  value={formData.paymentTypeId || ''}
                  onChange={handleInputChange}
                  className="enhanced-select"
                >
                  <option value="">Select payment type...</option>
                  {paymentTypesList.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="enhanced-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleCheckboxChange}
                  className="enhanced-checkbox"
                />
                <span className="checkbox-label">Recurring Expense</span>
              </label>
            </div>

            {formData.isRecurring && (
              <div className="enhanced-row">
                <div className="enhanced-group">
                  <label htmlFor="recurrenceFrequency" className="form-label">
                    Recurrence Frequency
                  </label>
                  <select
                    id="recurrenceFrequency"
                    name="recurrenceFrequency"
                    value={formData.recurrenceFrequency}
                    onChange={handleInputChange}
                    className="enhanced-select"
                  >
                    <option value="">Select frequency...</option>
                    {RECURRENCE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="enhanced-group">
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="enhanced-textarea"
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="enhanced-group">
              <label htmlFor="receiptUrl" className="form-label">
                Receipt URL
              </label>
              <input
                type="url"
                id="receiptUrl"
                name="receiptUrl"
                value={formData.receiptUrl}
                onChange={handleInputChange}
                className="enhanced-input"
                placeholder="https://example.com/receipt"
              />
            </div>

            <div className="enhanced-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleCheckboxChange}
                  className="enhanced-checkbox"
                />
                <span className="checkbox-label">Mark as Paid</span>
              </label>
            </div>

            <div className="modal__actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn__spinner"></span>
                    Creating...
                  </>
                ) : (
                  'Create Expense'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal; 