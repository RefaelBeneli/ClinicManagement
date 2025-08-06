import React, { useState, useEffect, useCallback } from 'react';
import { expenseCategories } from '../services/api';
import { ExpenseCategoryResponse, ExpenseCategoryRequest, UpdateExpenseCategoryRequest } from '../types';
import './ExpenseCategoryManagement.css';

const ExpenseCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategoryResponse | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await expenseCategories.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch expense categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleToggleActive = async (id: number) => {
    try {
      await expenseCategories.toggleActive(id);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to toggle category:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense category?')) {
      try {
        await expenseCategories.delete(id);
        await fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleAddCategory = async (data: ExpenseCategoryRequest) => {
    try {
      await expenseCategories.create(data);
      setShowAddModal(false);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const handleUpdateCategory = async (id: number, data: UpdateExpenseCategoryRequest) => {
    try {
      await expenseCategories.update(id, data);
      setEditingCategory(null);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading expense categories...</div>;
  }

  return (
    <div className="expense-category-management">
      <div className="header">
        <h2>Expense Categories Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New Category
        </button>
      </div>

      <div className="categories-list">
        {categories.map(category => (
          <div key={category.id} className="category-item">
            <div className="category-info">
              <h3>{category.name}</h3>
              {category.description && (
                <p className="description">{category.description}</p>
              )}
              <div className="category-meta">
                <span className={`status ${category.isActive ? 'active' : 'inactive'}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="created">Created: {new Date(category.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="category-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => handleToggleActive(category.id)}
              >
                {category.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => setEditingCategory(category)}
              >
                Edit
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(category.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <AddExpenseCategoryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddCategory}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <EditExpenseCategoryModal
          category={editingCategory}
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={(data) => handleUpdateCategory(editingCategory.id, data)}
        />
      )}
    </div>
  );
};

// Add Category Modal Component
interface AddExpenseCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: ExpenseCategoryRequest) => void;
}

const AddExpenseCategoryModal: React.FC<AddExpenseCategoryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<ExpenseCategoryRequest>({
    name: '',
    description: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess(formData);
      setFormData({ name: '', description: '', isActive: true });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--md" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Add Expense Category</h2>
          <button className="modal__close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal__body">
          <form onSubmit={handleSubmit}>
            <div className="enhanced-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="enhanced-input"
              />
            </div>
            <div className="enhanced-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="enhanced-textarea"
              />
            </div>
          </form>
        </div>
        <div className="modal__footer">
          <button 
            type="button" 
            className="btn btn-secondary enhanced"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary enhanced"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Category Modal Component
interface EditExpenseCategoryModalProps {
  category: ExpenseCategoryResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: UpdateExpenseCategoryRequest) => void;
}

const EditExpenseCategoryModal: React.FC<EditExpenseCategoryModalProps> = ({ category, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<UpdateExpenseCategoryRequest>({
    name: category.name,
    description: category.description || '',
    isActive: category.isActive
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    });
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess(formData);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--md" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Edit Expense Category</h2>
          <button className="modal__close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal__body">
          <form onSubmit={handleSubmit}>
            <div className="enhanced-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="enhanced-input"
              />
            </div>
            <div className="enhanced-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="enhanced-textarea"
              />
            </div>
            <div className="enhanced-group">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                Active
              </label>
            </div>
          </form>
        </div>
        <div className="modal__footer">
          <button 
            type="button" 
            className="btn btn-secondary enhanced"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary enhanced"
            onClick={handleSubmit}
            disabled={loading || !formData.name?.trim()}
          >
            {loading ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategoryManagement; 