import React, { useState, useEffect } from 'react';
import { clients, clientSources } from '../../services/api';
import { ClientRequest, ClientSourceResponse } from '../../types';
import './ViewClientModal.css';

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
    } catch (error) {
      console.error('❌ Failed to create client:', error);
      alert('Failed to create client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">Add New Client</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal__body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
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
              />
            </div>
            <div className="form-group">
              <label htmlFor="sourceId">Source *</label>
              <select
                id="sourceId"
                name="sourceId"
                value={formData.sourceId}
                onChange={handleInputChange}
                required
                className="form-input"
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
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={loading || !formData.fullName.trim() || !formData.sourceId}
          >
            {loading ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal; 