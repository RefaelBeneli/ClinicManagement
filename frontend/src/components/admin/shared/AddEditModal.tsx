import React, { useState, useEffect } from 'react';
import './AddEditModal.css';

interface Field {
  key: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'date' | 'number';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  initialData: any;
  onSubmit: (data: any) => void;
}

const AddEditModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  title,
  fields,
  initialData,
  onSubmit
}) => {
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value
    }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev: Record<string, string>) => ({
        ...prev,
        [key]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && (!formData[field.key] || formData[field.key].toString().trim() === '')) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: Field) => {
    const value = formData[field.key] || '';
    const error = errors[field.key];
    
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={`form-input ${error ? 'error' : ''}`}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`form-input ${error ? 'error' : ''}`}
            rows={3}
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className={`form-input ${error ? 'error' : ''}`}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`form-input ${error ? 'error' : ''}`}
          />
        );
        
      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`form-input ${error ? 'error' : ''}`}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-fields">
            {fields.map(field => (
              <div key={field.key} className="form-field">
                <label className="form-label">
                  {field.label}
                  {field.required && <span className="required">*</span>}
                </label>
                {renderField(field)}
                {errors[field.key] && (
                  <span className="error-message">{errors[field.key]}</span>
                )}
              </div>
            ))}
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditModal; 