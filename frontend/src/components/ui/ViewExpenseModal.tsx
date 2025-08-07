import React from 'react';
import { Expense } from '../../types';
import './ViewExpenseModal.css';

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
      <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Expense Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
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
            <h3>System Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Expense ID:</strong></label>
                <p>{expense.id}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Created:</strong></label>
                <p>{new Date(expense.createdAt).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Last Updated:</strong></label>
                <p>{new Date(expense.updatedAt).toLocaleDateString('he-IL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewExpenseModal; 