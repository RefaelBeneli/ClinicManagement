import React, { useState, useEffect } from 'react';
import { PersonalMeetingRequest, PersonalMeetingType } from '../../types';
import { personalMeetings } from '../../services/api';
import './Modal.css';

interface AddPersonalMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPersonalMeetingModal: React.FC<AddPersonalMeetingModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<PersonalMeetingRequest>({
    therapistName: '',
    meetingType: PersonalMeetingType.PERSONAL_THERAPY,
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
  const [error, setError] = useState('');

  // Helper functions for meeting type defaults
  const getDefaultDuration = (type: PersonalMeetingType): number => {
    switch (type) {
      case PersonalMeetingType.PERSONAL_THERAPY: return 60;
      case PersonalMeetingType.PROFESSIONAL_DEVELOPMENT: return 90;
      case PersonalMeetingType.SUPERVISION: return 60;
      case PersonalMeetingType.TEACHING_SESSION: return 120;
      default: return 60;
    }
  };

  const getDefaultPrice = (type: PersonalMeetingType): number => {
    switch (type) {
      case PersonalMeetingType.PERSONAL_THERAPY: return 400;
      case PersonalMeetingType.PROFESSIONAL_DEVELOPMENT: return 500;
      case PersonalMeetingType.SUPERVISION: return 350;
      case PersonalMeetingType.TEACHING_SESSION: return 600;
      default: return 400;
    }
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

  const handleMeetingTypeChange = (meetingType: PersonalMeetingType) => {
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
  };

  const resetForm = () => {
    const defaultType = PersonalMeetingType.PERSONAL_THERAPY;
    setFormData({
      therapistName: '',
      meetingType: defaultType,
      providerCredentials: '',
      meetingDate: '',
      duration: getDefaultDuration(defaultType),
      price: getDefaultPrice(defaultType),
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
    
    if (!formData.therapistName) {
      setError('Please enter the provider name');
      return;
    }

    if (!formData.meetingDate) {
      setError('Please select a date and time');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
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
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">Add New Personal Session</h3>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        <div className="modal__body">
          <form onSubmit={handleSubmit} className="personal-meeting-form">
            {/* Session Type - First Option */}
            <div className="form-group">
              <label htmlFor="meetingType">Session Type *</label>
              <select
                id="meetingType"
                required
                value={formData.meetingType}
                onChange={(e) => handleMeetingTypeChange(e.target.value as PersonalMeetingType)}
                className="form-input"
              >
                <option value={PersonalMeetingType.PERSONAL_THERAPY}>Personal Therapy</option>
                <option value={PersonalMeetingType.PROFESSIONAL_DEVELOPMENT}>Professional Development</option>
                <option value={PersonalMeetingType.SUPERVISION}>Supervision</option>
                <option value={PersonalMeetingType.TEACHING_SESSION}>Teaching Session</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="therapistName">Provider Name *</label>
              <input
                type="text"
                id="therapistName"
                name="therapistName"
                value={formData.therapistName}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Enter provider name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="meetingDate">Date & Time *</label>
                <input
                  type="datetime-local"
                  id="meetingDate"
                  name="meetingDate"
                  value={formData.meetingDate}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  min="15"
                  max="300"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="400.00"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="form-checkbox"
                  />
                  <span>Recurring Session</span>
                </label>
              </div>
            </div>

            {formData.isRecurring && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="recurrenceFrequency">Frequency</label>
                  <select
                    id="recurrenceFrequency"
                    name="recurrenceFrequency"
                    value={formData.recurrenceFrequency}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Select frequency</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="nextDueDate">Next Due Date</label>
                  <input
                    type="date"
                    id="nextDueDate"
                    name="nextDueDate"
                    value={formData.nextDueDate}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="providerCredentials">Credentials</label>
              <input
                type="text"
                id="providerCredentials"
                name="providerCredentials"
                value={formData.providerCredentials}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., PhD, LCSW, Certified Coach"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                rows={3}
                placeholder="Any additional notes about this personal session..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="summary">Session Summary</label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                className="form-textarea"
                rows={4}
                placeholder="Detailed summary of the session (can be added after the meeting)"
              />
            </div>

            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            )}
          </form>
        </div>
        <div className="modal__footer">
          <button className="btn btn-secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !formData.therapistName || !formData.meetingDate || !formData.price}
          >
            {loading ? 'Creating...' : 'Create Personal Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPersonalMeetingModal; 