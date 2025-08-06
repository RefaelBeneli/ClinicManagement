import React, { useEffect } from 'react';
import { Expense } from '../../types';
import './ViewExpenseModal.css';
import './Modal.css';

interface ExpenseDetailsModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
}

const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({ expense, isOpen, onClose }) => {
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
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal__body">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-grid">
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
                <span className={`payment-badge ${expense.isPaid ? 'paid' : 'unpaid'}`}>
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
                  
                  <div className="detail-item">
                    <label><strong>Next Due Date:</strong></label>
                    <p>{expense.nextDueDate ? new Date(expense.nextDueDate).toLocaleDateString() : 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}

            {expense.description && (
              <div className="detail-section">
                <h3>Description</h3>
                <p>{expense.description}</p>
              </div>
            )}
          </div>

          <div className="detail-section">
            <h3>Payment Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Payment Status:</strong></label>
                <span className={`payment-badge ${expense.isPaid ? 'paid' : 'unpaid'}`}>
                  {expense.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              
              <div className="detail-item">
                <label><strong>Payment Type:</strong></label>
                <p>{expense.paymentType?.name || 'Not specified'}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Expense Date:</strong></label>
                <p>{new Date(expense.expenseDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}</p>
              </div>
            </div>
          </div>

          {expense.isRecurring && (
            <div className="detail-section">
              <h3>Recurrence Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label><strong>Recurring:</strong></label>
                  <span className="recurring-badge">🔄 Yes</span>
                </div>
                
                {expense.recurrenceFrequency && (
                  <div className="detail-item">
                    <label><strong>Frequency:</strong></label>
                    <p>{expense.recurrenceFrequency}</p>
                  </div>
                )}
                
                {expense.nextDueDate && (
                  <div className="detail-item">
                    <label><strong>Next Due Date:</strong></label>
                    <p>{new Date(expense.nextDueDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {expense.notes && (
            <div className="detail-section">
              <h3>Notes</h3>
              <div className="notes-content">
                <p>{expense.notes}</p>
              </div>
            </div>
          )}

          {expense.receiptUrl && (
            <div className="detail-section">
              <h3>Receipt</h3>
              <div className="receipt-content">
                <a 
                  href={expense.receiptUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="receipt-link"
                >
                  📄 View Receipt
                </a>
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>System Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Expense ID:</strong></label>
                <p>{expense.id}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Created:</strong></label>
                <p>{new Date(expense.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })} {new Date(expense.createdAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Last Updated:</strong></label>
                <p>{new Date(expense.updatedAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })} {new Date(expense.updatedAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal__footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailsModal; 