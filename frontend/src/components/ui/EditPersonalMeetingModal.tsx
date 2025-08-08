import React, { useState, useEffect } from 'react';
import { PersonalMeeting, UpdatePersonalMeetingRequest, PersonalMeetingStatus, PersonalMeetingTypeEntity } from '../../types';
import { personalMeetings } from '../../services/api';
import './Modal.css';

interface EditPersonalMeetingModalProps {
  meeting: PersonalMeeting | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPersonalMeetingModal: React.FC<EditPersonalMeetingModalProps> = ({ meeting, isOpen, onClose, onSuccess }) => {
  const [meetingTypes, setMeetingTypes] = useState<PersonalMeetingTypeEntity[]>([]);
  const [formData, setFormData] = useState<UpdatePersonalMeetingRequest>({
    therapistName: '',
    meetingType: undefined,
    providerType: '',
    providerCredentials: '',
    meetingDate: '',
    duration: 0,
    price: 0,
    isPaid: false,
    notes: '',
    summary: '',
    status: PersonalMeetingStatus.SCHEDULED,
    isRecurring: false,
    recurrenceFrequency: '',
    nextDueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load meeting types when modal opens
  useEffect(() => {
    const loadMeetingTypes = async () => {
      try {
        const types = await personalMeetings.getActiveMeetingTypes();
        setMeetingTypes(types);
      } catch (error) {
        console.error('Error loading meeting types:', error);
      }
    };

    if (isOpen) {
      loadMeetingTypes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (meeting) {
      setFormData({
        therapistName: meeting.therapistName,
        meetingType: meeting.meetingType,
        providerType: meeting.providerType,
        providerCredentials: meeting.providerCredentials || '',
        meetingDate: meeting.meetingDate.split('T')[0],
        duration: meeting.duration,
        price: meeting.price,
        isPaid: meeting.isPaid,
        notes: meeting.notes || '',
        summary: meeting.summary || '',
        status: meeting.status,
        isRecurring: meeting.isRecurring,
        recurrenceFrequency: meeting.recurrenceFrequency || '',
        nextDueDate: meeting.nextDueDate || ''
      });
      setError('');
    }
  }, [meeting]);

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
    if (!formData.therapistName?.trim()) {
      setError('Therapist name is required');
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
      await personalMeetings.update(meeting.id, formData);
      console.log('✅ Personal meeting updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Error updating personal meeting:', error);
      setError(error.response?.data?.message || 'Failed to update personal meeting. Please try again.');
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
          <h2 className="modal__title">Edit Personal Meeting</h2>
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
                <label htmlFor="therapistName" className="form-label">
                  Therapist Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="therapistName"
                  name="therapistName"
                  value={formData.therapistName}
                  onChange={handleInputChange}
                  required
                  className="enhanced-input"
                  placeholder="Enter therapist name"
                  disabled={loading}
                />
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

            <div className="enhanced-group">
              <label htmlFor="meetingType" className="form-label">Meeting Type</label>
              <select
                id="meetingType"
                name="meetingType"
                value={formData.meetingType?.id || ''}
                onChange={(e) => {
                  const selectedType = meetingTypes.find(type => type.id === parseInt(e.target.value));
                  setFormData(prev => ({
                    ...prev,
                    meetingType: selectedType
                  }));
                }}
                className="enhanced-input"
                disabled={loading}
              >
                <option value="">Select meeting type</option>
                {meetingTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} - ₪{type.price} ({type.duration} min)
                  </option>
                ))}
              </select>
            </div>

            <div className="enhanced-row">
              <div className="enhanced-group">
                <label htmlFor="providerType" className="form-label">Provider Type</label>
                <input
                  type="text"
                  id="providerType"
                  name="providerType"
                  value={formData.providerType}
                  onChange={handleInputChange}
                  className="enhanced-input"
                  placeholder="Enter provider type"
                  disabled={loading}
                />
              </div>

              <div className="enhanced-group">
                <label htmlFor="providerCredentials" className="form-label">Provider Credentials</label>
                <input
                  type="text"
                  id="providerCredentials"
                  name="providerCredentials"
                  value={formData.providerCredentials}
                  onChange={handleInputChange}
                  className="enhanced-input"
                  placeholder="Enter provider credentials"
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
                <option value={PersonalMeetingStatus.SCHEDULED}>Scheduled</option>
                <option value={PersonalMeetingStatus.COMPLETED}>Completed</option>
                <option value={PersonalMeetingStatus.CANCELLED}>Cancelled</option>
                <option value={PersonalMeetingStatus.NO_SHOW}>No Show</option>
              </select>
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

            <div className="recurring-section">
              <h4>Recurring Settings</h4>
              
              <div className="enhanced-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleCheckboxChange}
                    className="form-checkbox"
                    disabled={loading}
                  />
                  This is a recurring meeting
                </label>
              </div>

              {formData.isRecurring && (
                <div className="enhanced-row">
                  <div className="enhanced-group">
                    <label htmlFor="recurrenceFrequency" className="form-label">
                      Recurrence Frequency <span className="required">*</span>
                    </label>
                    <select
                      id="recurrenceFrequency"
                      name="recurrenceFrequency"
                      value={formData.recurrenceFrequency}
                      onChange={handleInputChange}
                      required
                      className="enhanced-input"
                      disabled={loading}
                    >
                      <option value="">Select frequency</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="BIWEEKLY">Bi-weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>

                  <div className="enhanced-group">
                    <label htmlFor="nextDueDate" className="form-label">Next Due Date</label>
                    <input
                      type="date"
                      id="nextDueDate"
                      name="nextDueDate"
                      value={formData.nextDueDate}
                      onChange={handleInputChange}
                      className="enhanced-input"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
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
            disabled={loading || !formData.therapistName?.trim() || !formData.meetingDate || !formData.duration || !formData.price}
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
              'Update Personal Meeting'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPersonalMeetingModal; 