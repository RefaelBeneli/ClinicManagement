import React, { useState, useEffect } from 'react';
import { PersonalMeetingRequest, PersonalMeetingTypeEntity } from '../../types';
import { personalMeetings } from '../../services/api';
import './Modal.css';

interface AddPersonalMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPersonalMeetingModal: React.FC<AddPersonalMeetingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [meetingTypes, setMeetingTypes] = useState<PersonalMeetingTypeEntity[]>([]);
  const [formData, setFormData] = useState<PersonalMeetingRequest>({
    therapistName: '',
    meetingType: undefined,
    providerCredentials: '',
    meetingDate: '',
    duration: 60,
    price: 0,
    notes: '',
    summary: '',
    isRecurring: false,
    recurrenceFrequency: '',
    nextDueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load meeting types on mount
  useEffect(() => {
    const loadMeetingTypes = async () => {
      try {
        const types = await personalMeetings.getActiveMeetingTypes();
        setMeetingTypes(types);
        // Set default meeting type
        if (types.length > 0) {
          const defaultType = types[0];
          setFormData(prev => ({
            ...prev,
            meetingType: defaultType,
            duration: getDefaultDuration(defaultType),
            price: getDefaultPrice(defaultType)
          }));
        }
      } catch (error) {
        console.error('Error loading meeting types:', error);
      }
    };

    if (isOpen) {
      loadMeetingTypes();
    }
  }, [isOpen]);

  // Helper functions for meeting type defaults
  const getDefaultDuration = (type: PersonalMeetingTypeEntity): number => {
    return type.duration || 60;
  };

  const getDefaultPrice = (type: PersonalMeetingTypeEntity): number => {
    return type.price || 400;
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleMeetingTypeChange = (meetingType: PersonalMeetingTypeEntity) => {
    setFormData(prev => ({
      ...prev,
      meetingType,
      duration: getDefaultDuration(meetingType),
      price: getDefaultPrice(meetingType)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : name === 'duration' || name === 'price'
          ? parseFloat(value) || 0
          : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const resetForm = () => {
    setFormData({
      therapistName: '',
      meetingType: undefined,
      providerCredentials: '',
      meetingDate: '',
      duration: 60,
      price: 0,
      notes: '',
      summary: '',
      isRecurring: false,
      recurrenceFrequency: '',
      nextDueDate: ''
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.therapistName.trim()) {
      setError('Therapist name is required');
      return;
    }
    
    if (!formData.meetingType) {
      setError('Please select a meeting type');
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
      await personalMeetings.create(formData);
      console.log('✅ Personal meeting created successfully');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('❌ Failed to create personal meeting:', error);
      setError(error.response?.data?.message || 'Failed to create personal meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal--lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Add Personal Meeting</h2>
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
              <label className="form-label">
                Meeting Type <span className="required">*</span>
              </label>
              <div className="meeting-type-grid">
                {meetingTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    className={`meeting-type-card ${formData.meetingType?.id === type.id ? 'selected' : ''}`}
                    onClick={() => handleMeetingTypeChange(type)}
                    disabled={loading}
                  >
                    <div className="meeting-type-header">
                      <h4>{type.name}</h4>
                      <span className="meeting-type-price">₪{type.price}</span>
                    </div>
                    <div className="meeting-type-details">
                      <span className="meeting-type-duration">{type.duration} min</span>
                      {type.isRecurring && (
                        <span className="meeting-type-recurring">Recurring</span>
                      )}
                    </div>
                  </button>
                ))}
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
                    onChange={handleInputChange}
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
            disabled={loading || !formData.therapistName.trim() || !formData.meetingType || !formData.meetingDate || !formData.duration || !formData.price}
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
                Creating...
              </>
            ) : (
              'Create Personal Meeting'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPersonalMeetingModal; 