import React, { useState, useEffect } from 'react';
import { Meeting, UpdateMeetingRequest, MeetingStatus, Client } from '../../types';
import { meetings, clients } from '../../services/api';
import './ViewMeetingModal.css';

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
      await meetings.update(meeting.id, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating meeting:', error);
      setError(error.response?.data?.message || 'Failed to update meeting');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !meeting) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Edit Meeting</h2>
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
              <label htmlFor="clientId">Client *</label>
              <select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a client</option>
                {clientList.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </select>
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
                <option value={MeetingStatus.SCHEDULED}>Scheduled</option>
                <option value={MeetingStatus.COMPLETED}>Completed</option>
                <option value={MeetingStatus.CANCELLED}>Cancelled</option>
                <option value={MeetingStatus.NO_SHOW}>No Show</option>
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

export default EditMeetingModal; 