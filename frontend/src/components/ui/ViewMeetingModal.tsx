import React, { useEffect, useState } from 'react';
import { Meeting, MeetingStatus, PaymentType } from '../../types';
import { meetings, paymentTypes as paymentTypesApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './ViewMeetingModal.css';
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
      case 'COMPLETED': return '#38a169';
      case 'CANCELLED': return '#e53e3e';
      case 'NO_SHOW': return '#d53f8c';
      default: return '#3182ce';
    }
  };

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
    setError(null);
  };

  const handleSave = async () => {
    if (!editingField || !currentMeeting) return;

    setLoading(true);
    setError(null);

    try {
      let updateData: any = {};

      switch (editingField) {
        case 'date':
          updateData.meetingDate = editValue;
          break;
        case 'duration':
          updateData.duration = parseInt(editValue);
          break;
        case 'price':
          updateData.price = parseFloat(editValue);
          break;
        case 'notes':
          updateData.notes = editValue;
          break;
        case 'summary':
          updateData.summary = editValue;
          break;
        case 'status':
          updateData.status = editValue as MeetingStatus;
          break;
        case 'paymentType':
          updateData.paymentTypeId = parseInt(editValue) || null;
          break;
      }

      const updatedMeeting = await meetings.update(currentMeeting.id, updateData);
      setCurrentMeeting(updatedMeeting);
      setEditingField(null);
      setEditValue('');
      // Don't call onRefresh to avoid page refresh/scrolling
    } catch (error: any) {
      console.error('Error updating meeting:', error);
      setError('Failed to update meeting');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentToggle = async () => {
    if (!currentMeeting) return;

    setLoading(true);
    setError(null);

    try {
      const updatedMeeting = await meetings.updatePayment(currentMeeting.id, !currentMeeting.isPaid);
      setCurrentMeeting(updatedMeeting);
      // Don't call onRefresh to avoid page refresh/scrolling
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      setError('Failed to update payment status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentMeeting || !window.confirm('Are you sure you want to delete this meeting? This action will deactivate the meeting.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await meetings.disable(currentMeeting.id);
      setCurrentMeeting({ ...currentMeeting, active: false });
      // Don't call onRefresh to avoid page refresh/scrolling
    } catch (error: any) {
      console.error('Error deleting meeting:', error);
      setError('Failed to delete meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!currentMeeting) return;

    setLoading(true);
    setError(null);

    try {
      await meetings.activate(currentMeeting.id);
      setCurrentMeeting({ ...currentMeeting, active: true });
      // Don't call onRefresh to avoid page refresh/scrolling
    } catch (error: any) {
      console.error('Error restoring meeting:', error);
      setError('Failed to restore meeting');
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
    const displayValue = isEditing ? editValue : value;

    return (
      <div className="detail-item">
        <label><strong>{label}:</strong></label>
        {isEditing ? (
          <div className="edit-field">
            {type === 'textarea' ? (
              <textarea
                value={displayValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="edit-input"
                rows={field === 'summary' ? 15 : 8}
                placeholder={field === 'notes' ? 'Enter session notes here...' : 'Enter detailed session summary here (up to 2 A4 pages)...'}
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSave();
                  } else if (e.key === 'Escape') {
                    cancelEditing();
                  }
                }}
                autoFocus
              />
            ) : type === 'number' ? (
              <input
                type="number"
                value={displayValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="edit-input"
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  } else if (e.key === 'Escape') {
                    cancelEditing();
                  }
                }}
                autoFocus
              />
            ) : options ? (
              <select
                value={displayValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="edit-input"
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  } else if (e.key === 'Escape') {
                    cancelEditing();
                  }
                }}
                autoFocus
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
                value={displayValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="edit-input"
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  } else if (e.key === 'Escape') {
                    cancelEditing();
                  }
                }}
                autoFocus
              />
            )}
            {loading && <div className="saving-indicator">Saving...</div>}
          </div>
        ) : (
          <div className="display-field" onClick={() => startEditing(field, value.toString())}>
            <span className="field-value">
              {field === 'price' ? formatCurrency(value as number) : 
               field === 'date' ? formatDateTime(value as string) :
               field === 'status' ? (
                 <span 
                   className="status-badge" 
                   style={{ backgroundColor: getStatusColor(value as MeetingStatus) }}
                 >
                   {value}
                 </span>
               ) : 
               value}
            </span>
            <div className="edit-hint">Click to edit</div>
          </div>
        )}
      </div>
    );
  };

  const renderPaymentTypeField = () => {
    const isEditing = editingField === 'paymentType';
    const currentPaymentTypeId = currentMeeting.paymentType?.id?.toString() || '';
    const currentPaymentTypeName = currentMeeting.paymentType?.name || 'No payment type selected';

    return (
      <div className="detail-item">
        <label><strong>💰 Payment Type:</strong></label>
        {isEditing ? (
          <div className="edit-field">
            <select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="edit-input"
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                } else if (e.key === 'Escape') {
                  cancelEditing();
                }
              }}
              autoFocus
            >
              <option value="">Select a payment type...</option>
              {paymentTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {loading && <div className="saving-indicator">Saving...</div>}
          </div>
        ) : (
          <div className="display-field" onClick={() => startEditing('paymentType', currentPaymentTypeId)}>
            <span className="field-value">
              {currentPaymentTypeName}
            </span>
            <div className="edit-hint">Click to edit</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Session Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="modal__body">
          <div className="detail-section">
            <h3>Client Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Client Name:</strong></label>
                <p>{currentMeeting.client.fullName}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Client Email:</strong></label>
                <p>{currentMeeting.client.email || 'Not provided'}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Client Phone:</strong></label>
                <p>{currentMeeting.client.phone || 'Not provided'}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Client Status:</strong></label>
                <span className={`status-badge ${currentMeeting.client.active ? 'enabled' : 'disabled'}`}>
                  {currentMeeting.client.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Session Information</h3>
            <div className="detail-grid">
              {renderEditableField('date', 'Date & Time', currentMeeting.meetingDate, 'text')}
              {renderEditableField('duration', 'Duration (minutes)', currentMeeting.duration, 'number')}
              {renderEditableField('price', 'Price', currentMeeting.price, 'number')}
              {renderEditableField('status', 'Status', currentMeeting.status, 'text', [
                { value: 'SCHEDULED', label: 'Scheduled' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'NO_SHOW', label: 'No Show' }
              ])}
            </div>
          </div>

          <div className="detail-section">
            <h3>Payment Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Payment Status:</strong></label>
                <div className="payment-controls">
                  <span className={`payment-badge ${currentMeeting.isPaid ? 'paid' : 'unpaid'}`}>
                    {currentMeeting.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                  <button 
                    onClick={handlePaymentToggle}
                    disabled={loading}
                    className="toggle-payment-btn"
                  >
                    {currentMeeting.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                  </button>
                </div>
              </div>
              
              {currentMeeting.isPaid && renderPaymentTypeField()}
              
              {currentMeeting.isPaid && currentMeeting.paymentDate && (
                <div className="detail-item payment-date-item">
                  <label><strong>Payment Date:</strong></label>
                  <div className="payment-date-display">
                    <p className="payment-date-value">
                      {new Date(currentMeeting.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="notes-section">
            <h3>Notes</h3>
            {renderEditableField('notes', 'Notes', currentMeeting.notes || '', 'textarea')}
          </div>

          <div className="summary-section">
            <h3>Session Summary</h3>
            <div className="summary-textarea-container">
              {renderEditableField('summary', 'Summary', currentMeeting.summary || '', 'textarea')}
            </div>
            {editingField === 'summary' && (
              <div className="summary-char-counter">
                <span className="char-count">{editValue.length} characters</span>
                <span className="char-limit">Up to 2 A4 pages (~2000 characters)</span>
              </div>
            )}
          </div>

          <div className="detail-section">
            <h3>System Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Session ID:</strong></label>
                <p>{currentMeeting.id}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Status:</strong></label>
                <span className={`status-badge ${currentMeeting.active ? 'enabled' : 'disabled'}`}>
                  {currentMeeting.active ? 'Active' : 'Inactive'}
                </span>
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
            {currentMeeting.active ? (
              <button 
                onClick={handleDelete}
                disabled={loading}
                className="btn btn-danger"
              >
                {loading ? 'Deleting...' : 'Delete Session'}
              </button>
            ) : (
              <button 
                onClick={handleRestore}
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? 'Restoring...' : 'Restore Session'}
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMeetingModal; 