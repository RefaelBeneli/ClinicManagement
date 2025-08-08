import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './MeetingTypeManagement.css';

interface MeetingType {
  id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive: boolean;
  totalMeetings: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

interface MeetingTypeRequest {
  name: string;
  description?: string;
  duration: number;
  price: number;
}

interface UpdateMeetingTypeRequest {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}

interface MeetingTypeManagementProps {
  onRefresh?: () => void;
}

const MeetingTypeManagement: React.FC<MeetingTypeManagementProps> = ({ onRefresh }) => {
  const { token } = useAuth();
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMeetingType, setEditingMeetingType] = useState<MeetingType | null>(null);
  
  // This formData is used in the CreateMeetingTypeModal component
  // Removed unused formData from main component

  const apiUrl = process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
      ? 'https://web-production-9aa8.up.railway.app/api'
      : 'http://localhost:8085/api');
  const rootUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

  const fetchMeetingTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${rootUrl}/admin/personal-meeting-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetingTypes(data);
      } else {
        throw new Error('Failed to fetch meeting types');
      }
    } catch (error) {
      console.error('Failed to fetch meeting types:', error);
      setError('Failed to load meeting types');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchMeetingTypes();
  }, [fetchMeetingTypes]);

  const handleCreateMeetingType = async (data: MeetingTypeRequest) => {
    try {
      const response = await fetch(`${rootUrl}/admin/personal-meeting-types`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        fetchMeetingTypes();
        onRefresh?.();
      } else {
        throw new Error('Failed to create meeting type');
      }
    } catch (error) {
      console.error('Failed to create meeting type:', error);
      setError('Failed to create meeting type');
    }
  };

  const handleUpdateMeetingType = async (id: number, data: UpdateMeetingTypeRequest) => {
    try {
      const response = await fetch(`${apiUrl}/admin/personal-meeting-types/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setShowEditModal(false);
        setEditingMeetingType(null);
        fetchMeetingTypes();
        onRefresh?.();
      } else {
        throw new Error('Failed to update meeting type');
      }
    } catch (error) {
      console.error('Failed to update meeting type:', error);
      setError('Failed to update meeting type');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const response = await fetch(`${apiUrl}/admin/personal-meeting-types/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        fetchMeetingTypes();
        onRefresh?.();
      } else {
        throw new Error('Failed to toggle meeting type');
      }
    } catch (error) {
      console.error('Failed to toggle meeting type:', error);
      setError('Failed to toggle meeting type');
    }
  };

  const handleDeleteMeetingType = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this meeting type?')) {
      return;
    }
    
    try {
      const response = await fetch(`${apiUrl}/admin/personal-meeting-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        fetchMeetingTypes();
        onRefresh?.();
      } else {
        throw new Error('Failed to delete meeting type');
      }
    } catch (error) {
      console.error('Failed to delete meeting type:', error);
      setError('Failed to delete meeting type');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="meeting-type-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading meeting types...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="meeting-type-management">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Meeting Types</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchMeetingTypes}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-type-management">
      {/* Header */}
      <div className="section-header">
        <div className="header-content">
          <h2>📋 Meeting Types Management</h2>
          <p>Configure personal meeting types and their settings</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            ➕ Add Meeting Type
          </button>
          <button className="btn-refresh" onClick={fetchMeetingTypes}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Meeting Types Table */}
      <div className="meeting-types-table-container">
        <div className="table-header">
          <h3>Meeting Types ({meetingTypes.length})</h3>
        </div>

        <div className="meeting-types-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Duration (min)</th>
                <th>Price</th>
                <th>Status</th>
                <th>Total Meetings</th>
                <th>Total Revenue</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetingTypes.map((meetingType) => (
                <tr key={meetingType.id}>
                  <td>{meetingType.id}</td>
                  <td>{meetingType.name}</td>
                  <td>{meetingType.description || 'N/A'}</td>
                  <td>{meetingType.duration}</td>
                  <td>{formatCurrency(meetingType.price)}</td>
                  <td>
                    <span className={`status-badge ${meetingType.isActive ? 'active' : 'inactive'}`}>
                      {meetingType.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{meetingType.totalMeetings}</td>
                  <td>{formatCurrency(meetingType.totalRevenue)}</td>
                  <td>{formatDate(meetingType.createdAt)}</td>
                  <td>{formatDate(meetingType.updatedAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-small"
                        onClick={() => {
                          setEditingMeetingType(meetingType);
                          setShowEditModal(true);
                        }}
                        title="Edit meeting type"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-small"
                        onClick={() => handleToggleActive(meetingType.id)}
                        title={meetingType.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {meetingType.isActive ? '🔴' : '🟢'}
                      </button>
                      <button 
                        className="btn-small btn-danger"
                        onClick={() => handleDeleteMeetingType(meetingType.id)}
                        title="Delete meeting type"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {meetingTypes.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No meeting types found</h3>
              <p>Create your first meeting type to get started</p>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                Add Meeting Type
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Type Modal */}
      {showCreateModal && (
        <CreateMeetingTypeModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
          }}
          onSubmit={handleCreateMeetingType}
        />
      )}

      {/* Edit Meeting Type Modal */}
      {showEditModal && editingMeetingType && (
        <EditMeetingTypeModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingMeetingType(null);
          }}
          onSubmit={(data) => handleUpdateMeetingType(editingMeetingType.id, data)}
          meetingType={editingMeetingType}
        />
      )}
    </div>
  );
};

// Create Meeting Type Modal Component
interface CreateMeetingTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MeetingTypeRequest) => void;
}

const CreateMeetingTypeModal: React.FC<CreateMeetingTypeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<MeetingTypeRequest>({
    name: '',
    description: '',
    duration: 60,
    price: 400
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Create Meeting Type</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
              placeholder="e.g., Therapy Session, Consultation"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes) *</label>
              <input
                type="number"
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                className={errors.duration ? 'error' : ''}
                min="15"
                max="300"
              />
              {errors.duration && <span className="error-message">{errors.duration}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price (₪) *</label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className={errors.price ? 'error' : ''}
                min="0"
                step="0.01"
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Meeting Type
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Meeting Type Modal Component
interface EditMeetingTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateMeetingTypeRequest) => void;
  meetingType: MeetingType;
}

const EditMeetingTypeModal: React.FC<EditMeetingTypeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  meetingType 
}) => {
  const [formData, setFormData] = useState<UpdateMeetingTypeRequest>({
    name: meetingType.name,
    description: meetingType.description || '',
    duration: meetingType.duration,
    price: meetingType.price,
    isActive: meetingType.isActive
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if ((formData.duration || 0) <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    if ((formData.price || 0) < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Edit Meeting Type</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes) *</label>
              <input
                type="number"
                id="duration"
                value={formData.duration || 0}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                className={errors.duration ? 'error' : ''}
                min="15"
                max="300"
              />
              {errors.duration && <span className="error-message">{errors.duration}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Price (₪) *</label>
              <input
                type="number"
                id="price"
                value={formData.price || 0}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className={errors.price ? 'error' : ''}
                min="0"
                step="0.01"
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isActive || false}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
              />
              Active
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update Meeting Type
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingTypeManagement; 