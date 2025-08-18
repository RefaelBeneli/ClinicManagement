import React, { useState } from 'react';
import { PaymentType } from '../../types';
import './Modal.css';

interface PaymentTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentTypeId: number) => void;
  paymentTypes: PaymentType[];
  title?: string;
}

const PaymentTypeSelectionModal: React.FC<PaymentTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  paymentTypes,
  title = 'Select Payment Type'
}) => {
  const [selectedPaymentTypeId, setSelectedPaymentTypeId] = useState<number | ''>('');

  const handleConfirm = () => {
    if (selectedPaymentTypeId !== '') {
      onConfirm(selectedPaymentTypeId as number);
      onClose();
      setSelectedPaymentTypeId('');
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedPaymentTypeId('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content payment-type-modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="paymentTypeSelect">Payment Type:</label>
            <select
              id="paymentTypeSelect"
              value={selectedPaymentTypeId}
              onChange={(e) => setSelectedPaymentTypeId(e.target.value ? Number(e.target.value) : '')}
              className="form-select"
            >
              <option value="">Select a payment type...</option>
              {paymentTypes.map((paymentType) => (
                <option key={paymentType.id} value={paymentType.id}>
                  {paymentType.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="payment-type-info">
            <p>Please select the payment method used for this transaction.</p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirm}
            disabled={selectedPaymentTypeId === ''}
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTypeSelectionModal;
