import React, { useState, useEffect } from 'react';
import { Meeting, MeetingRequest, UpdateMeetingRequest, MeetingStatus, Client } from '../../types';
import { meetings, clients } from '../../services/api';
import DateTimePicker from './DateTimePicker';
import './Modal.css';

interface AddSessionModalProps {
  session: Meeting | null; // null for add, Meeting for edit
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSessionModal: React.FC<AddSessionModalProps> = ({ session, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<MeetingRequest>({
    clientId: 0,
    meetingDate: '',
    duration: 60,
    price: 0,
    notes: '',
    summary: ''
  });
  const [clientList, setClientList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load clients when modal opens
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await clients.getAll();
        setClientList(clientsData);
      } catch (error) {
        console.error('Error loading clients:', error);
      }
    };

    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  // Update form data when session changes (for editing)
  useEffect(() => {
    if (session) {
      setFormData({
        clientId: session.client.id,
        meetingDate: session.meetingDate.split('T')[0] + 'T' + session.meetingDate.split('T')[1]?.substring(0, 5) || '',
        duration: session.duration,
        price: session.price,
        notes: session.notes || '',
        summary: session.summary || ''
      });
      setError('');
    } else {
      // Reset form for new session
      setFormData({
        clientId: 0,
        meetingDate: '',
        duration: 60,
        price: 0,
        notes: '',
        summary: ''
      });
      setError('');
    }
  }, [session]);

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

  // Custom handler for client selection to auto-fill price
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = Number(e.target.value);
    setFormData(prev => ({
      ...prev,
      clientId
    }));
    
    // Auto-fill price and duration based on selected client's source defaults
    if (clientId > 0) {
      const selectedClient = clientList.find(client => client.id === clientId);
      const sourcePrice = selectedClient?.source?.price;
      const sourceDuration = selectedClient?.source?.duration;
      
      if (sourcePrice !== undefined) {
        setFormData(prev => ({
          ...prev,
          price: sourcePrice
        }));
      }
      
      if (sourceDuration !== undefined) {
        setFormData(prev => ({
          ...prev,
          duration: sourceDuration
        }));
      }
    } else {
      // Reset price and duration when no client is selected
      setFormData(prev => ({
        ...prev,
        price: 0,
        duration: 60
      }));
    }
    
    // Clear error when user makes a selection
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.clientId) {
      setError('Please select a client');
      return;
    }
    
    if (!formData.meetingDate) {
      setError('Please select a meeting date and time');
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
      if (session) {
        // Update existing session
        const updateData: UpdateMeetingRequest = {
          clientId: formData.clientId,
          meetingDate: formData.meetingDate,
          duration: formData.duration,
          price: formData.price,
          notes: formData.notes,
          summary: formData.summary
        };
        await meetings.update(session.id, updateData);
        console.log('✅ Session updated successfully');
      } else {
        // Create new session
        await meetings.create(formData);
        console.log('✅ Session created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error saving session:', error);
      setError(error.response?.data?.message || 'Failed to save session. Please try again.');
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">{session ? 'Edit Session' : 'Add New Session'}</h2>
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

            <div className="enhanced-group">
              <label htmlFor="clientId" className="form-label">
                Client <span className="required">*</span>
              </label>
              <select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleClientChange}
                required
                className="enhanced-input"
                disabled={loading}
              >
                <option value={0}>Select a client</option>
                {clientList.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.fullName} {client.source ? `(${client.source.name} - ₪${client.source.price})` : ''}
                  </option>
                ))}
              </select>
              <small className="form-help">
                Selecting a client will automatically fill the price and duration based on their source defaults
              </small>
              {formData.clientId > 0 && (() => {
                const selectedClient = clientList.find(client => client.id === formData.clientId);
                return selectedClient?.source ? (
                  <div className="client-source-info" style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    color: '#6c757d'
                  }}>
                    <strong>Source:</strong> {selectedClient.source.name} | 
                    <strong>Default Price:</strong> ₪{selectedClient.source.price} | 
                    <strong>Duration:</strong> {selectedClient.source.duration} min
                  </div>
                ) : null;
              })()}
            </div>

            <div className="enhanced-row">
              <div className="enhanced-group">
                <label htmlFor="meetingDate" className="form-label">
                  Date & Time <span className="required">*</span>
                </label>
                <DateTimePicker
                  value={formData.meetingDate}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, meetingDate: value }));
                    if (error) setError('');
                  }}
                  disabled={loading}
                  placeholder="Select date and time"
                />
              </div>

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
                  max="300"
                  step="15"
                  className="enhanced-input"
                  placeholder="60"
                  disabled={loading}
                />
                <small className="form-help">
                  Duration is automatically filled based on the selected client's source default
                </small>
              </div>
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
                placeholder="120.00"
                disabled={loading}
              />
              <small className="form-help">
                Price and duration are automatically filled based on the selected client's source defaults
              </small>
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
                placeholder="Session goals, topics to discuss, etc."
                disabled={loading}
              />
            </div>

            <div className="enhanced-group">
              <label htmlFor="summary" className="form-label">Session Summary</label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={4}
                className="enhanced-textarea"
                placeholder="Detailed summary of the session (can be added after the meeting)"
                disabled={loading}
              />
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
                {session ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              session ? 'Update Session' : 'Add Session'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSessionModal; 