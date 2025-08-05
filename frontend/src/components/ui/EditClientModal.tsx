import React, { useState, useEffect } from 'react';
import { Client, ClientRequest, ClientSourceResponse } from '../../types';
import { clients, clientSources } from '../../services/api';
import './ViewClientModal.css';

interface EditClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ client, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<ClientRequest>({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    sourceId: 0
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
        } catch (error) {
          console.error('Error fetching sources:', error);
        }
      };
      fetchSources();
    }
  }, [isOpen]);

  useEffect(() => {
    if (client) {
      setFormData({
        fullName: client.fullName,
        email: client.email || '',
        phone: client.phone || '',
        notes: client.notes || '',
        sourceId: client.source?.id || 0
      });
      setError('');
    }
  }, [client]);

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sourceId' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setLoading(true);
    setError('');

    try {
      await clients.update(client.id, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating client:', error);
      setError(error.response?.data?.message || 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Edit Client</h2>
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
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
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
            {loading ? 'Updating...' : 'Update Client'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClientModal; 