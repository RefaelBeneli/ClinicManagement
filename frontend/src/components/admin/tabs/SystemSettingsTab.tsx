import React, { useState, useEffect } from 'react';
import DataTable from '../shared/DataTable';
import AddEditModal from '../shared/AddEditModal';
import SearchFilter from '../shared/SearchFilter';
import FilterPanel from '../shared/FilterPanel';
import './SystemSettingsTab.css';

interface SystemEnum {
  id: number;
  name: string;
  description: string;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
}

const SystemSettingsTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState('meeting-sources');
  const [clientSources, setClientSources] = useState<SystemEnum[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<SystemEnum[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<SystemEnum[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SystemEnum | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API calls
      // const [sourcesRes, categoriesRes, typesRes] = await Promise.all([
      //   adminApi.getMeetingSources(),
      //   adminApi.getExpenseCategories(),
      //   adminApi.getPaymentTypes()
      // ]);
      
      // Mock data for now
      setTimeout(() => {
        setClientSources([
          { id: 1, name: 'Private', description: 'Private client referrals', isDefault: true, sortOrder: 1, isActive: true },
          { id: 2, name: 'Natal', description: 'Natal clinic referrals', isDefault: false, sortOrder: 2, isActive: true },
          { id: 3, name: 'Clalit', description: 'Clalit health services', isDefault: false, sortOrder: 3, isActive: true },
          { id: 4, name: 'Insurance', description: 'Insurance company referrals', isDefault: false, sortOrder: 4, isActive: true },
          { id: 5, name: 'Self-Referral', description: 'Direct client contact', isDefault: false, sortOrder: 5, isActive: false },
        ]);
        
        setExpenseCategories([
          { id: 1, name: 'Office Supplies', description: 'General office materials', isDefault: true, sortOrder: 1, isActive: true },
          { id: 2, name: 'Technology', description: 'Software and hardware expenses', isDefault: false, sortOrder: 2, isActive: true },
          { id: 3, name: 'Maintenance', description: 'Facility and equipment maintenance', isDefault: false, sortOrder: 3, isActive: true },
          { id: 4, name: 'Utilities', description: 'Electricity, water, internet', isDefault: false, sortOrder: 4, isActive: true },
          { id: 5, name: 'Marketing', description: 'Advertising and promotion', isDefault: false, sortOrder: 5, isActive: true },
          { id: 6, name: 'Training', description: 'Professional development', isDefault: false, sortOrder: 6, isActive: false },
        ]);
        
        setPaymentTypes([
          { id: 1, name: 'Cash', description: 'Cash payments', isDefault: false, sortOrder: 1, isActive: true },
          { id: 2, name: 'Credit Card', description: 'Credit card transactions', isDefault: true, sortOrder: 2, isActive: true },
          { id: 3, name: 'Bank Transfer', description: 'Direct bank transfers', isDefault: false, sortOrder: 3, isActive: true },
          { id: 4, name: 'Check', description: 'Paper check payments', isDefault: false, sortOrder: 4, isActive: true },
          { id: 5, name: 'Digital Wallet', description: 'PayPal, Apple Pay, etc.', isDefault: false, sortOrder: 5, isActive: false },
        ]);
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching system data:', error);
      setIsLoading(false);
    }
  };

  const getCurrentData = () => {
    switch (activeSection) {
      case 'meeting-sources':
        return clientSources;
      case 'expense-categories':
        return expenseCategories;
      case 'payment-types':
        return paymentTypes;
      default:
        return [];
    }
  };

  const getCurrentDataSetter = () => {
    switch (activeSection) {
      case 'meeting-sources':
        return setClientSources;
      case 'expense-categories':
        return setExpenseCategories;
      case 'payment-types':
        return setPaymentTypes;
      default:
        return () => {};
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'meeting-sources':
        return 'Client Sources';
      case 'expense-categories':
        return 'Expense Categories';
      case 'payment-types':
        return 'Payment Types';
      default:
        return '';
    }
  };

  const getModalTitle = () => {
    const action = editingItem ? 'Edit' : 'Add';
    return `${action} ${getSectionTitle().slice(0, -1)}`;
  };

  const handleCreate = async (data: any) => {
    try {
      // TODO: Replace with actual API calls
      const setter = getCurrentDataSetter();
      const currentData = getCurrentData();
      
      const newItem: SystemEnum = {
        ...data,
        id: Math.max(...currentData.map(item => item.id)) + 1,
        isDefault: false, // New items are never default by default
        sortOrder: data.sortOrder || (Math.max(...currentData.map(item => item.sortOrder)) + 1),
        isActive: data.isActive === 'true' || data.isActive === true
      };
      
      setter(prev => [...prev, newItem]);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingItem) return;
    
    try {
      // TODO: Replace with actual API calls
      const setter = getCurrentDataSetter();
      
      const updatedData = {
        ...data,
        isActive: data.isActive === 'true' || data.isActive === true,
        sortOrder: parseInt(data.sortOrder) || data.sortOrder
      };
      
      setter(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, ...updatedData } : item
      ));
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
    };

  const handleDelete = async (item: SystemEnum) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        // TODO: Replace with actual API calls
        const setter = getCurrentDataSetter();
        
        setter(prev => prev.filter(i => i.id !== item.id));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleSetDefault = async (item: SystemEnum) => {
    try {
      // Set all other items in the same category to not default
      const setCurrentData = getCurrentDataSetter();
      setCurrentData(prevData => 
        prevData.map(i => ({
          ...i,
          isDefault: i.id === item.id
        }))
      );
      
      alert(`"${item.name}" is now the default ${getSectionTitle().slice(0, -1).toLowerCase()}`);
    } catch (error) {
      console.error('Error setting default:', error);
      alert('Failed to set default. Please try again.');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', editable: true },
    { key: 'description', label: 'Description', editable: true },
    { 
      key: 'isDefault', 
      label: 'Default', 
      editable: false,
      render: (value: boolean, row: SystemEnum) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`default-badge ${value ? 'default' : 'not-default'}`}>
            {value ? '✓ Default' : 'Not Default'}
          </span>
          {!value && (
            <button
              onClick={() => handleSetDefault(row)}
              className="set-default-btn"
              title="Set as default"
            >
              Set Default
            </button>
          )}
        </div>
      )
    },
    { 
      key: 'sortOrder', 
      label: 'Sort Order', 
      editable: true 
    },

  ];

  const filteredData = getCurrentData().filter(item =>
    !searchTerm || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="system-settings-tab">
      <h2>System Settings</h2>
      
      <div className="settings-sections">
        <button
          className={`section-btn ${activeSection === 'meeting-sources' ? 'active' : ''}`}
          onClick={() => setActiveSection('meeting-sources')}
        >
                          Client Sources
        </button>
        <button
          className={`section-btn ${activeSection === 'expense-categories' ? 'active' : ''}`}
          onClick={() => setActiveSection('expense-categories')}
        >
          Expense Categories
        </button>
        <button
          className={`section-btn ${activeSection === 'payment-types' ? 'active' : ''}`}
          onClick={() => setActiveSection('payment-types')}
        >
          Payment Types
        </button>
      </div>
      
      <div className="section-content">
        <div className="section-header">
          <h3>{getSectionTitle()}</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="add-btn"
              onClick={() => setShowModal(true)}
            >
              Add {getSectionTitle().slice(0, -1)}
            </button>
            <button 
              className="manage-defaults-btn"
              onClick={() => {
                const currentData = getCurrentData();
                const defaultItem = currentData.find(item => item.isDefault);
                if (defaultItem) {
                  alert(`Current default: "${defaultItem.name}"\n\nTo change the default, click "Set Default" on any other item.`);
                } else {
                  alert('No default item set. Please select a default item.');
                }
              }}
            >
              Manage Defaults
            </button>
          </div>
        </div>
        
        <FilterPanel
          filters={[
            { key: 'isActive', label: 'Status', type: 'select' as const, options: ['true', 'false'] },
            { key: 'isDefault', label: 'Default', type: 'select' as const, options: ['true', 'false'] },
          ]}
          onFiltersChange={() => {}}
          onBulkAction={() => {}}
          selectedRows={[]}
          totalRows={filteredData.length}
          bulkActions={[]}
        />
        
                  <DataTable
            columns={columns}
            data={filteredData}
            onSave={async (item, updatedData) => {
              try {
                // Call backend API to update system enum
                const response = await fetch(`http://localhost:8085/api/admin/system-enums/${item.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify(updatedData)
                });
                
                if (!response.ok) {
                  throw new Error('Failed to update system enum');
                }
                
                // Update local state to reflect changes
                const updatedItem = await response.json();
                const setCurrentData = getCurrentDataSetter();
                setCurrentData(prevData => 
                  prevData.map((i: SystemEnum) => i.id === item.id ? updatedItem : i)
                );
                
                // Show success message
                alert('System enum updated successfully!');
              } catch (error) {
                console.error('Error updating system enum:', error);
                alert('Failed to update system enum. Please try again.');
                throw error; // Re-throw to keep editing state
              }
            }}
            onDelete={handleDelete}
            onRestore={async (item) => {
              try {
                // Call backend API to restore system enum
                const response = await fetch(`http://localhost:8085/api/admin/system-enums/${item.id}/restore`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                
                if (!response.ok) {
                  throw new Error('Failed to restore system enum');
                }
                
                // Update local state
                const setCurrentData = getCurrentDataSetter();
                setCurrentData(prevData => 
                  prevData.map((i: SystemEnum) => i.id === item.id ? { ...i, deleted: false } : i)
                );
                
                alert('System enum restored successfully!');
              } catch (error) {
                console.error('Error restoring system enum:', error);
                alert('Failed to restore system enum. Please try again.');
              }
            }}
            isLoading={isLoading}
          />
      </div>
      
      {showModal && (
        <AddEditModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          title={getModalTitle()}
          fields={[
            { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter name' },
            { key: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Enter description' },
            { key: 'sortOrder', label: 'Sort Order', type: 'number', required: true, placeholder: 'Enter sort order (1, 2, 3...)' },
            { key: 'isActive', label: 'Active Status', type: 'select', required: true, options: ['true', 'false'] },
          ]}
          initialData={editingItem || {}}
          onSubmit={editingItem ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
};

export default SystemSettingsTab; 