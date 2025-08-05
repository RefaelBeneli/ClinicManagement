import React, { useState, useEffect } from 'react';
import { ClientSourceResponse } from '../../types';
import { clientSources } from '../../services/api';
import Button from '../ui/Button';
import './ClientForm.css';

interface ClientFormData {
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  sourceId: number; // NEW: Required source ID
}

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ClientFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    sourceId: 0 // NEW: Required source ID
  });
  const [sources, setSources] = useState<ClientSourceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});

  useEffect(() => {
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
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sourceId' ? parseInt(value, 10) : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ClientFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.sourceId || formData.sourceId === 0) {
      newErrors.sourceId = 'Please select a source';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="client-form">
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="fullName" className="form-label">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={`form-input ${errors.fullName ? 'error' : ''}`}
            placeholder="Enter client's full name"
            required
          />
          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="client@example.com"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`form-input ${errors.phone ? 'error' : ''}`}
            placeholder="+1 (555) 123-4567"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="sourceId" className="form-label">
            Source *
          </label>
          <select
            id="sourceId"
            name="sourceId"
            value={formData.sourceId}
            onChange={handleChange}
            className={`form-input ${errors.sourceId ? 'error' : ''}`}
            required
          >
            <option value={0}>Select a source</option>
            {sources.map(source => (
              <option key={source.id} value={source.id}>
                {source.name} - ₪{source.price}
              </option>
            ))}
          </select>
          {errors.sourceId && <span className="error-message">{errors.sourceId}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="address" className="form-label">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-input"
            placeholder="123 Main Street, City, State"
          />
        </div>

        <div className="form-field form-field--full">
          <label htmlFor="notes" className="form-label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Any additional notes about the client..."
            rows={4}
          />
        </div>
      </div>

      <div className="form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          Add Client
        </Button>
      </div>
    </form>
  );
};

export default ClientForm; 