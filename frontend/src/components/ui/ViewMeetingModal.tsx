import React, { useEffect, useState } from 'react';
import { Meeting, MeetingStatus } from '../../types';
import { meetings } from '../../services/api';
import './ViewMeetingModal.css';
import './Modal.css';

interface ViewMeetingModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const ViewMeetingModal: React.FC<ViewMeetingModalProps> = ({ meeting, isOpen, onClose, onRefresh }) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(meeting);

  // Update current meeting when prop changes
  useEffect(() => {
    setCurrentMeeting(meeting);
  }, [meeting]);

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
        case 'status':
          updateData.status = editValue as MeetingStatus;
          break;
      }

      const updatedMeeting = await meetings.update(currentMeeting.id, updateData);
      setCurrentMeeting(updatedMeeting);
      setEditingField(null);
      setEditValue('');
      onRefresh?.();
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
      onRefresh?.();
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
      onRefresh?.();
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
      onRefresh?.();
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

    return (
      <div className="detail-item">
        <label><strong>{label}:</strong></label>
        {isEditing ? (
          <div className="edit-field">
            {type === 'textarea' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="edit-input"
                rows={3}
              />
            ) : type === 'number' ? (
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="edit-input"
              />
            ) : options ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="edit-input"
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
                className="edit-input"
              />
            )}
            <div className="edit-actions">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="btn-save"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={cancelEditing}
                disabled={loading}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="display-field">
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
            <button 
              onClick={() => startEditing(field, value.toString())}
              className="edit-button"
              title="Click to edit"
            >
              ✏️
            </button>
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
              
              {currentMeeting.paymentDate && (
                <div className="detail-item">
                  <label><strong>Payment Date:</strong></label>
                  <p>{formatDateTime(currentMeeting.paymentDate)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>Notes</h3>
            {renderEditableField('notes', 'Notes', currentMeeting.notes || '', 'textarea')}
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