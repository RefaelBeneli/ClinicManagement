import React, { useState, useEffect } from 'react';
import { MeetingRequest, Client } from '../../types';
import { clients as clientsApi, meetings as meetingsApi } from '../../services/api';
import './Modal.css';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSessionModal: React.FC<AddSessionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<MeetingRequest>({
    clientId: 0,
    meetingDate: '',
    duration: 60,
    price: 0,
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      resetForm();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      const clientsData = await clientsApi.getAll();
      setClients(clientsData.filter(client => client.active));
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients');
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: 0,
      meetingDate: '',
      duration: 60,
      price: 0,
      notes: ''
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.clientId === 0) {
      setError('Please select a client');
      return;
    }

    if (!formData.meetingDate) {
      setError('Please select a date and time');
      return;
    }

    if (formData.price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await meetingsApi.create(formData);
      
      console.log('✅ Session created successfully');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('❌ Failed to create session:', error);
      setError(error.response?.data?.message || 'Failed to create session. Please try again.');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal add-session-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>➕ Add New Session</h3>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="session-form">
            <div className="form-group">
              <label htmlFor="clientId">Client *</label>
              <select
                id="clientId"
                required
                value={formData.clientId}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  clientId: parseInt(e.target.value) || 0 
                }))}
                disabled={loading}
                className="form-select"
              >
                <option value={0}>Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="meetingDate">Date & Time *</label>
              <input
                id="meetingDate"
                type="datetime-local"
                required
                value={formData.meetingDate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  meetingDate: e.target.value 
                }))}
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <input
                  id="duration"
                  type="number"
                  min="15"
                  max="300"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    duration: parseInt(e.target.value) || 60 
                  }))}
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    price: parseFloat(e.target.value) || 0 
                  }))}
                  disabled={loading}
                  className="form-input"
                  placeholder="120.00"
                />
                {formData.price > 0 && (
                  <small className="price-preview">
                    Preview: {formatCurrency(formData.price)}
                  </small>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Session Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                disabled={loading}
                className="form-textarea"
                placeholder="Session goals, topics to discuss, client concerns, etc."
                rows={4}
              />
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
              <button 
                type="button" 
                onClick={handleClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSessionModal; 