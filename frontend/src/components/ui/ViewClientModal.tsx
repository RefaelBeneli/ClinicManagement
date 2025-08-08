import React, { useEffect } from 'react';
import { Client } from '../../types';
import './ViewClientModal.css';
import './Modal.css';

interface ViewClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewClientModal: React.FC<ViewClientModalProps> = ({ client, isOpen, onClose }) => {
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

  if (!isOpen || !client) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--lg view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Client Details</h2>
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
                <p>{client.fullName}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Email:</strong></label>
                <p>{client.email || 'Not provided'}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Phone:</strong></label>
                <p>{client.phone || 'Not provided'}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Status:</strong></label>
                <span className={`status-badge ${client.active ? 'enabled' : 'disabled'}`}>
                  {client.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {client.notes && (
            <div className="detail-section">
              <h3>Notes</h3>
              <div className="notes-content">
                <p>{client.notes}</p>
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>System Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label><strong>Client ID:</strong></label>
                <p>{client.id}</p>
              </div>
              
              <div className="detail-item">
                <label><strong>Created:</strong></label>
                <p>{new Date(client.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })} {new Date(client.createdAt).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
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

export default ViewClientModal; 