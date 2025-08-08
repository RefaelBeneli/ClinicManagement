import React, { useState, useEffect } from 'react';
import { clients, clientSources } from '../../services/api';
import { ClientRequest, ClientSourceResponse } from '../../types';
import './Modal.css';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<ClientRequest>({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    sourceId: 1 // Default to first source (Private)
  });
  const [sources, setSources] = useState<ClientSourceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load sources when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchSources = async () => {
        try {
          const sourcesData = await clientSources.getAll();
          setSources(sourcesData);
          // Set default source if available
          if (sourcesData.length > 0) {
            setFormData(prev => ({ ...prev, sourceId: sourcesData[0].id }));
          }
        } catch (error) {
          console.error('Error fetching sources:', error);
        }
      };
      fetchSources();
    }
  }, [isOpen]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sourceId' ? parseInt(value, 10) : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    
    if (!formData.sourceId) {
      setError('Please select a source');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await clients.create(formData);
      console.log('✅ Client created successfully');
      onSuccess();
      onClose();
      setFormData({ 
        fullName: '', 
        email: '', 
        phone: '', 
        notes: '', 
        sourceId: sources.length > 0 ? sources[0].id : 1 
      });
    } catch (error: any) {
      console.error('❌ Failed to create client:', error);
      setError(error.response?.data?.message || 'Failed to create client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setFormData({ 
        fullName: '', 
        email: '', 
        phone: '', 
        notes: '', 
        sourceId: sources.length > 0 ? sources[0].id : 1 
      });
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">Add New Client</h3>
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
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="enhanced-input"
                placeholder="Enter client's full name"
                disabled={loading}
              />
            </div>
            
            <div className="enhanced-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="enhanced-input"
                placeholder="Enter client's email address"
                disabled={loading}
              />
            </div>
            
            <div className="enhanced-group">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="enhanced-input"
                placeholder="Enter client's phone number"
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
                className="enhanced-textarea"
                rows={3}
                placeholder="Enter any additional notes about the client"
                disabled={loading}
              />
            </div>
            
            <div className="enhanced-group">
              <label htmlFor="sourceId" className="form-label">
                Source <span className="required">*</span>
              </label>
              <select
                id="sourceId"
                name="sourceId"
                value={formData.sourceId}
                onChange={handleInputChange}
                required
                className="enhanced-input"
                disabled={loading}
              >
                <option value={0}>Select a source</option>
                {sources.map(source => (
                  <option key={source.id} value={source.id}>
                    {source.name} - ₪{source.price}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>
        
        <div className="modal__footer">
          <button 
            className="btn btn--secondary" 
            onClick={handleClose}
            disabled={loading}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="btn btn--primary" 
            onClick={handleSubmit}
            disabled={loading || !formData.fullName.trim() || !formData.sourceId}
            type="submit"
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
              'Create Client'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal; 