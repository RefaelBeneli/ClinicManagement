import React, { useState, useEffect } from 'react';
import { MeetingRequest, Client, MeetingSource } from '../../types';
import { clients as clientsApi, meetings as meetingsApi } from '../../services/api';
import './Modal.css';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSessionModal: React.FC<AddSessionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [meetingSources, setMeetingSources] = useState<MeetingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<MeetingRequest>({
    clientId: 0,
    sourceId: 0,
    meetingDate: '',
    duration: 60,
    price: 0,
    notes: '',
    summary: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchMeetingSources();
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

  const fetchMeetingSources = async () => {
    try {
      const sourcesData = await meetingsApi.getActiveSources();
      setMeetingSources(sourcesData);
      
      // Apply default values from the first source if available
      if (sourcesData.length > 0) {
        const defaultSource = sourcesData[0];
        setFormData(prev => ({
          ...prev,
          sourceId: defaultSource.id,
          duration: defaultSource.duration,
          price: defaultSource.price
        }));
      }
    } catch (error) {
      console.error('Error fetching meeting sources:', error);
      setError('Failed to load meeting sources');
    }
  };

  const handleSourceChange = (sourceId: number) => {
    const selectedSource = meetingSources.find(source => source.id === sourceId);
    if (selectedSource) {
      setFormData(prev => ({
        ...prev,
        sourceId: selectedSource.id,
        duration: selectedSource.duration,
        price: selectedSource.price
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        sourceId: sourceId
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: 0,
      sourceId: meetingSources.length > 0 ? meetingSources[0].id : 0,
      meetingDate: '',
      duration: 60,
      price: 0,
      notes: '',
      summary: ''
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.sourceId === 0) {
      setError('Please select a meeting source');
      return;
    }

    if (formData.clientId === 0) {
      setError('Please select a client');
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

  const getSelectedSource = () => {
    return meetingSources.find(source => source.id === formData.sourceId);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal add-session-modal" onClick={(e) => e.stopPropagation()}>
        {/* Enhanced Header */}
        <div className="modal-header enhanced-header">
          <div className="header-content">
            <div className="header-icon">📅</div>
            <div className="header-text">
              <h3>Schedule New Session</h3>
              <p>Create a new therapy session with your client</p>
            </div>
          </div>
          <button 
            className="close-button enhanced-close" 
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body enhanced-body">
          <form onSubmit={handleSubmit} className="session-form enhanced-form">
            {/* Source Selection Section */}
            <div className="form-section source-section">
              <div className="form-group enhanced-group">
                <label htmlFor="sourceId">Meeting Source *</label>
                <select
                  id="sourceId"
                  required
                  value={formData.sourceId}
                  onChange={(e) => handleSourceChange(parseInt(e.target.value))}
                  disabled={loading}
                  className="form-select enhanced-select"
                >
                  <option value={0}>Select a meeting source</option>
                  {meetingSources.map(source => (
                    <option key={source.id} value={source.id}>
                      {source.name} (${source.price}, {source.duration}min)
                    </option>
                  ))}
                </select>
                {getSelectedSource() && (
                  <div className="source-preview">
                    <span className="preview-label">Selected:</span>
                    <span className="preview-value">
                      {getSelectedSource()?.name} • {getSelectedSource()?.duration}min • {formatCurrency(getSelectedSource()?.price || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Client and Schedule Section */}
            <div className="form-section schedule-section">
              <div className="section-header">
                <h4>👤 Client & Schedule</h4>
                <p>Select the client and set the appointment time</p>
              </div>
              
              <div className="form-row enhanced-row">
                <div className="form-group enhanced-group">
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
                    className="form-select enhanced-select"
                  >
                    <option value={0}>Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group enhanced-group">
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
                    className="form-input enhanced-input"
                  />
                </div>
              </div>
            </div>

            {/* Session Details Section */}
            <div className="form-section details-section">
              <div className="section-header">
                <h4>💰 Session Details</h4>
                <p>Duration and pricing information</p>
              </div>
              
              <div className="form-row enhanced-row">
                <div className="form-group enhanced-group">
                  <label htmlFor="duration">Duration (minutes)</label>
                  <div className="input-with-icon">
                    <input
                      id="duration"
                      type="number"
                      min="15"
                      max="300"
                      value={formData.duration || 60}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        duration: parseInt(e.target.value) || 60 
                      }))}
                      disabled={loading}
                      className="form-input enhanced-input"
                    />
                    <span className="input-icon">⏱️</span>
                  </div>
                </div>

                <div className="form-group enhanced-group">
                  <label htmlFor="price">Price *</label>
                  <div className="input-with-icon">
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        price: parseFloat(e.target.value) || 0 
                      }))}
                      disabled={loading}
                      className="form-input enhanced-input"
                      placeholder="120.00"
                    />
                    <span className="input-icon">💵</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="form-section notes-section">
              <div className="section-header">
                <h4>📝 Session Notes</h4>
                <p>Add any notes or goals for this session</p>
              </div>
              
              <div className="form-group enhanced-group">
                <label htmlFor="notes">Session Notes</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  disabled={loading}
                  className="form-textarea enhanced-textarea"
                  placeholder="Session goals, topics to discuss, client concerns, etc."
                  rows={3}
                />
              </div>

              <div className="form-group enhanced-group">
                <label htmlFor="summary">Session Summary</label>
                <textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    summary: e.target.value 
                  }))}
                  disabled={loading}
                  className="form-textarea enhanced-textarea"
                  placeholder="Detailed summary of the session (can be added after the meeting)"
                  rows={4}
                />
              </div>
            </div>

            {error && (
              <div className="error-message enhanced">
                <div className="error-icon">⚠️</div>
                <div className="error-content">
                  <strong>Error:</strong> {error}
                </div>
                <button 
                  className="error-close enhanced" 
                  onClick={() => setError('')}
                  aria-label="Close error"
                >
                  ×
                </button>
              </div>
            )}

            <div className="form-actions enhanced">
              <button 
                type="button" 
                onClick={handleClose}
                className="btn-secondary enhanced"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary enhanced"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating Session...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">✅</span>
                    Create Session
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSessionModal; 