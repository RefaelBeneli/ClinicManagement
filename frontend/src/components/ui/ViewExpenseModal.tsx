import React from 'react';
import { Expense } from '../../types';
import './Modal.css';

interface ViewExpenseModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewExpenseModal: React.FC<ViewExpenseModalProps> = ({ expense, isOpen, onClose }) => {
  if (!isOpen || !expense) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Expense Details</h2>
          <button 
            className="modal__close-button" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal__body">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Name:</strong></label>
                <p>{expense.name}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Category:</strong></label>
                <p>{expense.category.name}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Amount:</strong></label>
                <p>₪{expense.amount}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Currency:</strong></label>
                <p>{expense.currency}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Date:</strong></label>
                <p>{new Date(expense.expenseDate).toLocaleDateString()}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Payment Status:</strong></label>
                <span className={`status-badge ${expense.isPaid ? 'enabled' : 'disabled'}`}>
                  {expense.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              
              <div className="detail-item">
                <label><strong>Payment Type:</strong></label>
                <p>{expense.paymentType?.name || 'Not specified'}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Receipt URL:</strong></label>
                <p>{expense.receiptUrl || 'Not provided'}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Notes:</strong></label>
                <p>{expense.notes || 'No notes'}</p>
              </div>
            </div>
            
            {expense.isRecurring && (
              <div className="detail-section">
                <h3>Recurrence Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label><strong>Recurrence Frequency:</strong></label>
                    <p>{expense.recurrenceFrequency}</p>
                  </div>
                </div>
              </div>
            )}

            {expense.description && (
              <div className="detail-section">
                <h3>Description</h3>
                <div className="notes-content">
                  <p>{expense.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewExpenseModal; 