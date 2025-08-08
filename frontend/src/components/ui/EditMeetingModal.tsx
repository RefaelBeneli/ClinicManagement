import React, { useState, useEffect } from 'react';
import { Meeting, UpdateMeetingRequest, MeetingStatus, Client } from '../../types';
import { meetings, clients } from '../../services/api';
import './Modal.css';

interface EditMeetingModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditMeetingModal: React.FC<EditMeetingModalProps> = ({ meeting, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UpdateMeetingRequest>({
    clientId: 0,
    meetingDate: '',
    duration: 0,
    price: 0,
    isPaid: false,
    paymentDate: '',
    notes: '',
    summary: '',
    status: MeetingStatus.SCHEDULED
  });
  const [clientList, setClientList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (meeting) {
      setFormData({
        clientId: meeting.client.id,
        meetingDate: meeting.meetingDate.split('T')[0],
        duration: meeting.duration,
        price: meeting.price,
        isPaid: meeting.isPaid,
        paymentDate: meeting.paymentDate ? meeting.paymentDate.split('T')[0] : '',
        notes: meeting.notes || '',
        summary: meeting.summary || '',
        status: meeting.status
      });
      setError('');
    }
  }, [meeting]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await clients.getAll();
        setClientList(clientsData);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meeting) return;

    // Validation
    if (!formData.clientId) {
      setError('Please select a client');
      return;
    }
    
    if (!formData.meetingDate) {
      setError('Please select a meeting date');
      return;
    }
    
    if (!formData.duration || formData.duration <= 0) {
      setError('Please enter a valid duration');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await meetings.update(meeting.id, formData);
      console.log('✅ Meeting updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error updating meeting:', error);
      setError(error.response?.data?.message || 'Failed to update meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError('');
    }
  };

  if (!isOpen || !meeting) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Edit Meeting</h2>
          <button 
            className="modal__close-button" 
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal__body">
          <form onSubmit={handleSubmit} className="enhanced-group">
            {error && (
              <div className="error-message enhanced">
                <div className="error-icon">⚠</div>
                <div className="error-content">{error}</div>
                <button 
                  type="button" 
                  className="error-close enhanced"
                  onClick={() => setError('')}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            <div className="enhanced-row">
              <div className="enhanced-group">
                <label htmlFor="clientId" className="form-label">
                  Client <span className="required">*</span>
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  required
                  className="enhanced-input"
                  disabled={loading}
                >
                  <option value={0}>Select a client</option>
                  {clientList.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="enhanced-group">
                <label htmlFor="meetingDate" className="form-label">
                  Meeting Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="meetingDate"
                  name="meetingDate"
                  value={formData.meetingDate}
                  onChange={handleInputChange}
                  required
                  className="enhanced-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="enhanced-row">
              <div className="enhanced-group">
                <label htmlFor="duration" className="form-label">
                  Duration (minutes) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="15"
                  step="15"
                  className="enhanced-input"
                  placeholder="60"
                  disabled={loading}
                />
              </div>

              <div className="enhanced-group">
                <label htmlFor="price" className="form-label">
                  Price (₪) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="enhanced-input"
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="enhanced-row">
              <div className="enhanced-group">
                <label htmlFor="status" className="form-label">
                  Status <span className="required">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="enhanced-input"
                  disabled={loading}
                >
                  <option value={MeetingStatus.SCHEDULED}>Scheduled</option>
                  <option value={MeetingStatus.COMPLETED}>Completed</option>
                  <option value={MeetingStatus.CANCELLED}>Cancelled</option>
                  <option value={MeetingStatus.NO_SHOW}>No Show</option>
                </select>
              </div>

              <div className="enhanced-group">
                <label htmlFor="paymentDate" className="form-label">Payment Date</label>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  className="enhanced-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="enhanced-group">
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="enhanced-textarea"
                placeholder="Enter meeting notes"
                disabled={loading}
              />
            </div>

            <div className="enhanced-group">
              <label htmlFor="summary" className="form-label">Summary</label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={4}
                className="enhanced-textarea"
                placeholder="Enter detailed meeting summary"
                disabled={loading}
              />
            </div>

            <div className="enhanced-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleCheckboxChange}
                  className="form-checkbox"
                  disabled={loading}
                />
                Mark as paid
              </label>
            </div>
          </form>
        </div>
        
        <div className="modal__footer">
          <button 
            type="button" 
            className="btn btn--secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={loading || !formData.clientId || !formData.meetingDate || !formData.duration || !formData.price}
          >
            {loading ? (
              <>
                <div className="btn__spinner">
                  <svg className="btn__spinner-icon" viewBox="0 0 24 24">
                    <circle className="btn__spinner-path" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite" />
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
                Updating...
              </>
            ) : (
              'Update Meeting'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMeetingModal; 