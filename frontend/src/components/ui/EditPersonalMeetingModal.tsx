import React, { useState, useEffect } from 'react';
import { PersonalMeeting, UpdatePersonalMeetingRequest, PersonalMeetingStatus, PersonalMeetingType } from '../../types';
import { personalMeetings } from '../../services/api';
import './ViewPersonalMeetingModal.css';

interface EditPersonalMeetingModalProps {
  meeting: PersonalMeeting | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPersonalMeetingModal: React.FC<EditPersonalMeetingModalProps> = ({ meeting, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UpdatePersonalMeetingRequest>({
    therapistName: '',
    meetingType: PersonalMeetingType.PERSONAL_THERAPY,
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

    setLoading(true);
    setError('');

    try {
      await personalMeetings.update(meeting.id, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating personal meeting:', error);
      setError(error.response?.data?.message || 'Failed to update personal meeting');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !meeting) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Edit Personal Meeting</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal__body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="therapistName">Therapist Name *</label>
              <input
                type="text"
                id="therapistName"
                name="therapistName"
                value={formData.therapistName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="meetingType">Meeting Type *</label>
              <select
                id="meetingType"
                name="meetingType"
                value={formData.meetingType}
                onChange={handleInputChange}
                required
              >
                <option value={PersonalMeetingType.PERSONAL_THERAPY}>Personal Therapy</option>
                <option value={PersonalMeetingType.PROFESSIONAL_DEVELOPMENT}>Professional Development</option>
                <option value={PersonalMeetingType.SUPERVISION}>Supervision</option>
                <option value={PersonalMeetingType.TEACHING_SESSION}>Teaching Session</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="providerType">Provider Type *</label>
              <input
                type="text"
                id="providerType"
                name="providerType"
                value={formData.providerType}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="providerCredentials">Provider Credentials</label>
              <input
                type="text"
                id="providerCredentials"
                name="providerCredentials"
                value={formData.providerCredentials}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="meetingDate">Date *</label>
              <input
                type="date"
                id="meetingDate"
                name="meetingDate"
                value={formData.meetingDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (minutes) *</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="15"
                step="15"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (ILS) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value={PersonalMeetingStatus.SCHEDULED}>Scheduled</option>
                <option value={PersonalMeetingStatus.COMPLETED}>Completed</option>
                <option value={PersonalMeetingStatus.CANCELLED}>Cancelled</option>
                <option value={PersonalMeetingStatus.NO_SHOW}>No Show</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleCheckboxChange}
                />
                Mark as Paid
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleCheckboxChange}
                />
                Recurring Meeting
              </label>
            </div>

            {formData.isRecurring && (
              <>
                <div className="form-group">
                  <label htmlFor="recurrenceFrequency">Recurrence Frequency</label>
                  <select
                    id="recurrenceFrequency"
                    name="recurrenceFrequency"
                    value={formData.recurrenceFrequency}
                    onChange={handleInputChange}
                  >
                    <option value="">Select frequency</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Bi-weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="CUSTOM">Custom</option>
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
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="summary">Session Summary</label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={6}
                placeholder="Detailed summary of the session"
              />
            </div>
          </form>
        </div>
        
        <div className="modal__footer">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Meeting'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPersonalMeetingModal; 