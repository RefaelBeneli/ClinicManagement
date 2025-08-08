import React, { useEffect, useState } from 'react';
import { Meeting, MeetingStatus, PaymentType } from '../../types';
import { meetings, paymentTypes as paymentTypesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Modal.css';

// Helper function to get default payment types
const getDefaultPaymentTypes = (): PaymentType[] => [
  { id: 1, name: 'Bank Transfer', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, name: 'Bit', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, name: 'Paybox', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 4, name: 'Cash', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

interface ViewMeetingModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const ViewMeetingModal: React.FC<ViewMeetingModalProps> = ({ meeting, isOpen, onClose, onRefresh }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(meeting);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Update current meeting when prop changes
  useEffect(() => {
    setCurrentMeeting(meeting);
  }, [meeting]);

  // Fetch payment types when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPaymentTypes();
    }
  }, [isOpen]);

  const fetchPaymentTypes = async () => {
    if (user?.role === 'ADMIN') {
      try {
        const types = await paymentTypesApi.getActive();
        setPaymentTypes(types);
      } catch (error) {
        console.warn('Failed to load payment types from API:', error);
        setPaymentTypes(getDefaultPaymentTypes());
      }
    } else {
      // Non-admin users get default payment types without API call
      console.log('Using default payment types for non-admin user');
      setPaymentTypes(getDefaultPaymentTypes());
    }
  };

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (editingField) {
          setEditingField(null);
          setEditValue('');
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, editingField]);

  if (!isOpen || !currentMeeting) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: MeetingStatus) => {
    switch (status) {
      case MeetingStatus.COMPLETED:
        return 'enabled';
      case MeetingStatus.CANCELLED:
        return 'disabled';
      case MeetingStatus.SCHEDULED:
        return 'enabled';
      default:
        return 'disabled';
    }
  };

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSave = async () => {
    if (!editingField || !currentMeeting) return;

    setLoading(true);
    setError(null);

    try {
      let updateData: any = {};
      
      switch (editingField) {
        case 'notes':
          updateData.notes = editValue;
          break;
        case 'summary':
          updateData.summary = editValue;
          break;
        case 'price':
          updateData.price = parseFloat(editValue);
          break;
        case 'duration':
          updateData.duration = parseInt(editValue, 10);
          break;
        case 'paymentTypeId':
          updateData.paymentTypeId = parseInt(editValue, 10);
          break;
        default:
          throw new Error('Invalid field for editing');
      }

      const updatedMeeting = await meetings.update(currentMeeting.id, updateData);
      setCurrentMeeting(updatedMeeting);
      setEditingField(null);
      setEditValue('');
      onRefresh?.();
      console.log('✅ Meeting updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating meeting:', error);
      setError(error.response?.data?.message || 'Failed to update meeting');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentToggle = async () => {
    if (!currentMeeting) return;

    setLoading(true);
    setError(null);

    try {
      const updatedMeeting = await meetings.update(currentMeeting.id, {
        isPaid: !currentMeeting.isPaid
      });
      setCurrentMeeting(updatedMeeting);
      onRefresh?.();
      console.log('✅ Payment status updated successfully');
    } catch (error: any) {
      console.error('❌ Error updating payment status:', error);
      setError(error.response?.data?.message || 'Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentMeeting) return;

    if (!window.confirm('Are you sure you want to delete this meeting?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await meetings.delete(currentMeeting.id);
      onClose();
      onRefresh?.();
      console.log('✅ Meeting deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting meeting:', error);
      setError(error.response?.data?.message || 'Failed to delete meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!currentMeeting) return;

    setLoading(true);
    setError(null);

    try {
      const updatedMeeting = await meetings.update(currentMeeting.id, {
        status: MeetingStatus.SCHEDULED
      });
      setCurrentMeeting(updatedMeeting);
      onRefresh?.();
      console.log('✅ Meeting restored successfully');
    } catch (error: any) {
      console.error('❌ Error restoring meeting:', error);
      setError(error.response?.data?.message || 'Failed to restore meeting');
    } finally {
      setLoading(false);
    }
  };

  const renderEditableField = (
    field: string,
    label: string,
    value: string | number,
    type: 'text' | 'number' | 'textarea' = 'text',
    options?: { value: string; label: string }[]
  ) => {
    const isEditing = editingField === field;

    if (isEditing) {
      return (
        <div className="detail-item">
          <label><strong>{label}:</strong></label>
          <div className="edit-controls">
            {type === 'textarea' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="enhanced-textarea"
                rows={3}
                disabled={loading}
              />
            ) : type === 'number' ? (
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="enhanced-input"
                disabled={loading}
              />
            ) : options ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="enhanced-input"
                disabled={loading}
              >
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="enhanced-input"
                disabled={loading}
              />
            )}
            <div className="edit-actions">
              <button
                className="btn btn--primary"
                onClick={handleSave}
                disabled={loading}
              >
                Save
              </button>
              <button
                className="btn btn--secondary"
                onClick={cancelEditing}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="detail-item">
        <label><strong>{label}:</strong></label>
        <div className="detail-content">
          <p>{value}</p>
          <button
            className="edit-button"
            onClick={() => startEditing(field, String(value))}
            disabled={loading}
            aria-label={`Edit ${label.toLowerCase()}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderPaymentTypeField = () => {
    const currentPaymentType = paymentTypes.find(pt => pt.id === currentMeeting?.paymentType?.id);
    const paymentTypeOptions = paymentTypes.map(pt => ({
      value: pt.id.toString(),
      label: pt.name
    }));

    return renderEditableField(
      'paymentTypeId',
      'Payment Type',
      currentPaymentType?.name || 'Not specified',
      'text',
      paymentTypeOptions
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--xl view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Meeting Details</h2>
          <button 
            className="modal__close-button" 
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal__body">
          {error && (
            <div className="error-message enhanced">
              <div className="error-icon">⚠</div>
              <div className="error-content">{error}</div>
              <button 
                type="button" 
                className="error-close enhanced"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Client:</strong></label>
                <p>{currentMeeting.client.fullName}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Date & Time:</strong></label>
                <p>{formatDateTime(currentMeeting.meetingDate)}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Duration:</strong></label>
                <p>{currentMeeting.duration} minutes</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Price:</strong></label>
                <p>{formatCurrency(currentMeeting.price)}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Status:</strong></label>
                <span className={`status-badge ${getStatusColor(currentMeeting.status)}`}>
                  {currentMeeting.status}
                </span>
              </div>
              
              <div className="detail-item">
                <label><strong>Payment Status:</strong></label>
                <span className={`status-badge ${currentMeeting.isPaid ? 'enabled' : 'disabled'}`}>
                  {currentMeeting.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Editable Information</h3>
            <div className="detail-grid">
              {renderEditableField('price', 'Price', formatCurrency(currentMeeting.price), 'number')}
              {renderEditableField('duration', 'Duration (minutes)', currentMeeting.duration, 'number')}
              {renderPaymentTypeField()}
            </div>
          </div>

          {currentMeeting.notes && (
            <div className="detail-section">
              <h3>Notes</h3>
              {renderEditableField('notes', 'Notes', currentMeeting.notes, 'textarea')}
            </div>
          )}

          {currentMeeting.summary && (
            <div className="detail-section">
              <h3>Summary</h3>
              {renderEditableField('summary', 'Summary', currentMeeting.summary, 'textarea')}
            </div>
          )}

          <div className="detail-section">
            <h3>System Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Meeting ID:</strong></label>
                <p>{currentMeeting.id}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Created:</strong></label>
                <p>{formatDateTime(currentMeeting.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal__footer">
          <div className="action-buttons">
            <button 
              className="btn btn--secondary"
              onClick={handlePaymentToggle}
              disabled={loading}
            >
              {currentMeeting.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
            </button>
            
            {currentMeeting.status === MeetingStatus.CANCELLED ? (
              <button 
                className="btn btn--primary"
                onClick={handleRestore}
                disabled={loading}
              >
                Restore Meeting
              </button>
            ) : (
              <button 
                className="btn btn--danger"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Meeting
              </button>
            )}
          </div>
          
          <button className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewMeetingModal; 