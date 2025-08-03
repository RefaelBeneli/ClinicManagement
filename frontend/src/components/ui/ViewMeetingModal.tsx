import React, { useEffect } from 'react';
import { Meeting } from '../../types';
import './ViewMeetingModal.css';
import './Modal.css';

interface ViewMeetingModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewMeetingModal: React.FC<ViewMeetingModalProps> = ({ meeting, isOpen, onClose }) => {
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
          <h2 className="modal__title">Meeting Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal__body">
          <div className="detail-section">
            <h3>Client Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Client Name:</strong></label>
                <p>{meeting.client.fullName}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Client Email:</strong></label>
                <p>{meeting.client.email || 'Not provided'}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Client Phone:</strong></label>
                <p>{meeting.client.phone || 'Not provided'}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Client Status:</strong></label>
                <span className={`status-badge ${meeting.client.active ? 'enabled' : 'disabled'}`}>
                  {meeting.client.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Meeting Information</h3>
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

export default ViewMeetingModal; 