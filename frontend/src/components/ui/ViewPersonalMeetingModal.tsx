import React, { useEffect } from 'react';
import { PersonalMeeting } from '../../types';
import './ViewPersonalMeetingModal.css';
import './Modal.css';

interface ViewPersonalMeetingModalProps {
  meeting: PersonalMeeting | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewPersonalMeetingModal: React.FC<ViewPersonalMeetingModalProps> = ({ meeting, isOpen, onClose }) => {
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

  if (!isOpen || !meeting) return null;

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
          <h2 className="modal__title">Personal Meeting Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal__body">
          <div className="detail-section">
            <h3>Meeting Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Therapist Name:</strong></label>
                <p>{meeting.therapistName}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Meeting Type:</strong></label>
                <p>{meeting.meetingType}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Provider Type:</strong></label>
                <p>{meeting.providerType}</p>
              </div>
              
              {meeting.providerCredentials && (
                <div className="detail-item">
                  <label><strong>Provider Credentials:</strong></label>
                  <p>{meeting.providerCredentials}</p>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>Session Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Date & Time:</strong></label>
                <p>{new Date(meeting.meetingDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })} {new Date(meeting.meetingDate).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Duration:</strong></label>
                <p>{meeting.duration} minutes</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Price:</strong></label>
                <p className="price-text">{formatCurrency(meeting.price)}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Status:</strong></label>
                <span className={`status-badge ${meeting.status.toLowerCase()}`}>
                  {meeting.status}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Payment Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Payment Status:</strong></label>
                <span className={`payment-badge ${meeting.isPaid ? 'paid' : 'unpaid'}`}>
                  {meeting.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              
              {meeting.paymentDate && (
                <div className="detail-item">
                  <label><strong>Payment Date:</strong></label>
                  <p>{new Date(meeting.paymentDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })} {new Date(meeting.paymentDate).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              )}
            </div>
          </div>

          {meeting.isRecurring && (
            <div className="detail-section">
              <h3>Recurrence Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label><strong>Recurring:</strong></label>
                  <span className="recurring-badge">🔄 Yes</span>
                </div>
                
                {meeting.recurrenceFrequency && (
                  <div className="detail-item">
                    <label><strong>Frequency:</strong></label>
                    <p>{meeting.recurrenceFrequency}</p>
                  </div>
                )}
                
                {meeting.nextDueDate && (
                  <div className="detail-item">
                    <label><strong>Next Due Date:</strong></label>
                    <p>{new Date(meeting.nextDueDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {meeting.notes && (
            <div className="detail-section">
              <h3>Notes</h3>
              <div className="notes-content">
                <p>{meeting.notes}</p>
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>System Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Meeting ID:</strong></label>
                <p>{meeting.id}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Created:</strong></label>
                <p>{new Date(meeting.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })} {new Date(meeting.createdAt).toLocaleTimeString('en-GB', {
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

export default ViewPersonalMeetingModal; 