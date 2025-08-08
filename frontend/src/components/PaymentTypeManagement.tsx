import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './PaymentTypeManagement.css';

interface PaymentType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  totalTransactions: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface PaymentTypeRequest {
  name: string;
  description?: string;
}

interface UpdatePaymentTypeRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface PaymentTypeManagementProps {
  onRefresh?: () => void;
}

const PaymentTypeManagement: React.FC<PaymentTypeManagementProps> = ({ onRefresh }) => {
  const { token } = useAuth();
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPaymentType, setEditingPaymentType] = useState<PaymentType | null>(null);
  
  // This formData is used in the CreatePaymentTypeModal component
  // Removed unused formData from main component

  const apiUrl = process.env.REACT_APP_API_URL || 
    (window.location.hostname === 'frolicking-granita-900c53.netlify.app' 
      ? 'https://web-production-9aa8.up.railway.app/api'
      : 'http://localhost:8085/api');
  const rootUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

  const fetchPaymentTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${rootUrl}/admin/payment-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentTypes(data);
      } else {
        throw new Error('Failed to fetch payment types');
      }
    } catch (error) {
      console.error('Failed to fetch payment types:', error);
      setError('Failed to load payment types');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchPaymentTypes();
  }, [fetchPaymentTypes]);

  const handleCreatePaymentType = async (data: PaymentTypeRequest) => {
    try {
      const response = await fetch(`${rootUrl}/admin/payment-types`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        fetchPaymentTypes();
        onRefresh?.();
      } else {
        throw new Error('Failed to create payment type');
      }
    } catch (error) {
      console.error('Failed to create payment type:', error);
      setError('Failed to create payment type');
    }
  };

  const handleUpdatePaymentType = async (id: number, data: UpdatePaymentTypeRequest) => {
    try {
      const response = await fetch(`${rootUrl}/admin/payment-types/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setShowEditModal(false);
        setEditingPaymentType(null);
        fetchPaymentTypes();
        onRefresh?.();
      } else {
        throw new Error('Failed to update payment type');
      }
    } catch (error) {
      console.error('Failed to update payment type:', error);
      setError('Failed to update payment type');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const response = await fetch(`${rootUrl}/admin/payment-types/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        fetchPaymentTypes();
        onRefresh?.();
      } else {
        throw new Error('Failed to toggle payment type');
      }
    } catch (error) {
      console.error('Failed to toggle payment type:', error);
      setError('Failed to toggle payment type');
    }
  };

  const handleDeletePaymentType = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this payment type?')) {
      return;
    }
    
    try {
      const response = await fetch(`${rootUrl}/admin/payment-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        fetchPaymentTypes();
        onRefresh?.();
      } else {
        throw new Error('Failed to delete payment type');
      }
    } catch (error) {
      console.error('Failed to delete payment type:', error);
      setError('Failed to delete payment type');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="payment-type-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading payment types...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-type-management">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Payment Types</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={fetchPaymentTypes}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-type-management">
      {/* Header */}
      <div className="section-header">
        <div className="header-content">
          <h2>💳 Payment Types Management</h2>
          <p>Configure payment methods and their settings</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            ➕ Add Payment Type
          </button>
          <button className="btn-refresh" onClick={fetchPaymentTypes}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Payment Types Table */}
      <div className="payment-types-table-container">
        <div className="table-header">
          <h3>Payment Types ({paymentTypes.length})</h3>
        </div>

        <div className="payment-types-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Total Transactions</th>
                <th>Total Amount</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentTypes.map((paymentType) => (
                <tr key={paymentType.id}>
                  <td>{paymentType.id}</td>
                  <td>{paymentType.name}</td>
                  <td>{paymentType.description || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${paymentType.isActive ? 'active' : 'inactive'}`}>
                      {paymentType.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{paymentType.totalTransactions}</td>
                  <td>₪{paymentType.totalAmount}</td>
                  <td>{formatDate(paymentType.createdAt)}</td>
                  <td>{formatDate(paymentType.updatedAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-small"
                        onClick={() => {
                          setEditingPaymentType(paymentType);
                          setShowEditModal(true);
                        }}
                        title="Edit payment type"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-small"
                        onClick={() => handleToggleActive(paymentType.id)}
                        title={paymentType.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {paymentType.isActive ? '🔴' : '🟢'}
                      </button>
                      <button 
                        className="btn-small btn-danger"
                        onClick={() => handleDeletePaymentType(paymentType.id)}
                        title="Delete payment type"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paymentTypes.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <h3>No payment types found</h3>
              <p>Create your first payment type to get started</p>
              <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                Add Payment Type
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Payment Type Modal */}
      {showCreateModal && (
        <CreatePaymentTypeModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
          }}
          onSubmit={handleCreatePaymentType}
        />
      )}

      {/* Edit Payment Type Modal */}
      {showEditModal && editingPaymentType && (
        <EditPaymentTypeModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPaymentType(null);
          }}
          onSubmit={(data) => handleUpdatePaymentType(editingPaymentType.id, data)}
          paymentType={editingPaymentType}
        />
      )}
    </div>
  );
};

// Create Payment Type Modal Component
interface CreatePaymentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentTypeRequest) => void;
}

const CreatePaymentTypeModal: React.FC<CreatePaymentTypeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<PaymentTypeRequest>({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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

  const handleInputChange = (field: string, value: string) => {
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
          <h3>Create Payment Type</h3>
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
              placeholder="e.g., Credit Card, Cash, Bank Transfer"
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
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Payment Type
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Payment Type Modal Component
interface EditPaymentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdatePaymentTypeRequest) => void;
  paymentType: PaymentType;
}

const EditPaymentTypeModal: React.FC<EditPaymentTypeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  paymentType 
}) => {
  const [formData, setFormData] = useState<UpdatePaymentTypeRequest>({
    name: paymentType.name,
    description: paymentType.description || '',
    isActive: paymentType.isActive
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
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

  const handleInputChange = (field: string, value: string | boolean) => {
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
          <h3>Edit Payment Type</h3>
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
              Update Payment Type
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentTypeManagement; 