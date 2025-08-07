import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MeetingSource, MeetingSourceRequest, UpdateMeetingSourceRequest } from '../types';
import './SourceManagementTab.css';

const SourceManagementTab: React.FC = () => {
  const { token } = useAuth();
  const [sources, setSources] = useState<MeetingSource[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<MeetingSource | null>(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
      ? 'https://web-production-9aa8.up.railway.app/api'
      : 'http://localhost:8085/api');

  const fetchSources = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/admin/sources`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSources(data);
      } else {
        console.error('Failed to fetch sources');
      }
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSource = async (data: MeetingSourceRequest) => {
    try {
      const response = await fetch(`${apiUrl}/admin/sources`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setIsCreateModalOpen(false);
        fetchSources();
      } else {
        console.error('Failed to create source');
      }
    } catch (error) {
      console.error('Failed to create source:', error);
    }
  };

  const handleUpdateSource = async (id: number, data: UpdateMeetingSourceRequest) => {
    try {
      const response = await fetch(`${apiUrl}/admin/sources/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setIsEditModalOpen(false);
        setEditingSource(null);
        fetchSources();
      } else {
        console.error('Failed to update source');
      }
    } catch (error) {
      console.error('Failed to update source:', error);
    }
  };

  const handleDeleteSource = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this source?')) {
      return;
    }
    
    try {
      const response = await fetch(`${apiUrl}/admin/sources/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        fetchSources();
      } else {
        console.error('Failed to delete source');
      }
    } catch (error) {
      console.error('Failed to delete source:', error);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const response = await fetch(`${apiUrl}/admin/sources/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        fetchSources();
      } else {
        console.error('Failed to toggle source');
      }
    } catch (error) {
      console.error('Failed to toggle source:', error);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  return (
    <div className="source-management">
      <div className="header">
        <h2>Meeting Sources</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add New Source
        </button>
      </div>
      
      {loading ? (
        <div className="loading">Loading sources...</div>
      ) : (
        <table className="sources-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Duration (min)</th>
              <th>Default Price (₪)</th>
              <th>No-Show Price (₪)</th>
              <th>Default Sessions</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.map(source => (
              <tr key={source.id}>
                <td>{source.name}</td>
                <td>{source.duration}</td>
                <td>{source.price}</td>
                <td>{source.noShowPrice}</td>
                <td>{source.defaultSessions}</td>
                <td>
                  <span className={`status ${source.isActive ? 'active' : 'inactive'}`}>
                    {source.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(source.updatedAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setEditingSource(source);
                      setIsEditModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => handleToggleActive(source.id)}
                  >
                    {source.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteSource(source.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create Source Modal */}
      {isCreateModalOpen && (
        <CreateSourceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSource}
        />
      )}

      {/* Edit Source Modal */}
      {isEditModalOpen && editingSource && (
        <EditSourceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSource(null);
          }}
          onSubmit={(data) => handleUpdateSource(editingSource.id, data)}
          source={editingSource}
        />
      )}
    </div>
  );
};

interface CreateSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MeetingSourceRequest) => void;
}

interface EditSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateMeetingSourceRequest) => void;
  source: MeetingSource;
}

const CreateSourceModal: React.FC<CreateSourceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    duration: 60,
    price: 0,
    noShowPrice: 0,
    defaultSessions: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be positive';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be positive';
    }
    
    if (formData.noShowPrice < 0) {
      newErrors.noShowPrice = 'No-show price cannot be negative';
    }
    
    if (formData.defaultSessions <= 0) {
      newErrors.defaultSessions = 'Default sessions must be positive';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal source-modal">
        <div className="modal-header">
          <h3>Create New Source</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Source Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="duration">Default Duration (minutes) *</label>
            <input
              id="duration"
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              className={errors.duration ? 'error' : ''}
            />
            {errors.duration && <span className="error-message">{errors.duration}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="price">Default Price (₪) *</label>
            <input
              id="price"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
              className={errors.price ? 'error' : ''}
            />
            {errors.price && <span className="error-message">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="noShowPrice">No-Show Price (₪) *</label>
            <input
              id="noShowPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.noShowPrice}
              onChange={(e) => handleInputChange('noShowPrice', parseFloat(e.target.value))}
              className={errors.noShowPrice ? 'error' : ''}
            />
            <small className="help-text">
              Price charged when client doesn't show up for the meeting
            </small>
            {errors.noShowPrice && <span className="error-message">{errors.noShowPrice}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="defaultSessions">Default Sessions *</label>
            <input
              id="defaultSessions"
              type="number"
              min="1"
              value={formData.defaultSessions}
              onChange={(e) => handleInputChange('defaultSessions', parseInt(e.target.value))}
              className={errors.defaultSessions ? 'error' : ''}
            />
            <small className="help-text">
              Number of sessions to be booked by default
            </small>
            {errors.defaultSessions && <span className="error-message">{errors.defaultSessions}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Source
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditSourceModal: React.FC<EditSourceModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  source 
}) => {
  const [formData, setFormData] = useState({
    name: source.name,
    duration: source.duration,
    price: source.price,
    noShowPrice: source.noShowPrice,
    defaultSessions: source.defaultSessions
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be positive';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Price must be positive';
    }
    
    if (formData.noShowPrice < 0) {
      newErrors.noShowPrice = 'No-show price cannot be negative';
    }
    
    if (formData.defaultSessions <= 0) {
      newErrors.defaultSessions = 'Default sessions must be positive';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal source-modal">
        <div className="modal-header">
          <h3>Edit Source</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Source Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="duration">Default Duration (minutes) *</label>
            <input
              id="duration"
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              className={errors.duration ? 'error' : ''}
            />
            {errors.duration && <span className="error-message">{errors.duration}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="price">Default Price (₪) *</label>
            <input
              id="price"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
              className={errors.price ? 'error' : ''}
            />
            {errors.price && <span className="error-message">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="noShowPrice">No-Show Price (₪) *</label>
            <input
              id="noShowPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.noShowPrice}
              onChange={(e) => handleInputChange('noShowPrice', parseFloat(e.target.value))}
              className={errors.noShowPrice ? 'error' : ''}
            />
            <small className="help-text">
              Price charged when client doesn't show up for the meeting
            </small>
            {errors.noShowPrice && <span className="error-message">{errors.noShowPrice}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="defaultSessions">Default Sessions *</label>
            <input
              id="defaultSessions"
              type="number"
              min="1"
              value={formData.defaultSessions}
              onChange={(e) => handleInputChange('defaultSessions', parseInt(e.target.value))}
              className={errors.defaultSessions ? 'error' : ''}
            />
            <small className="help-text">
              Number of sessions to be booked by default
            </small>
            {errors.defaultSessions && <span className="error-message">{errors.defaultSessions}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Source
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SourceManagementTab; 