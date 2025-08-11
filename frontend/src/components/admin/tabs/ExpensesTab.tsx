import React, { useState, useEffect } from 'react';
import DataTable from '../shared/DataTable';
import AddEditModal from '../shared/AddEditModal';
import SearchFilter from '../shared/SearchFilter';
import FilterPanel from '../shared/FilterPanel';
import './ExpensesTab.css';

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  therapistName: string;
  status: string; // Added status field
}

const ExpensesTab: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<number[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await adminApi.getExpenses();
      // setExpenses(response.data);
      
      // Mock data for now
      setTimeout(() => {
        setExpenses([
          { id: 1, description: 'Office Supplies', amount: 150.00, category: 'Office', date: '2025-01-15', therapistName: 'Dr. Sarah Wilson', status: 'ACTIVE' },
          { id: 2, description: 'Software License', amount: 299.99, category: 'Technology', date: '2025-01-14', therapistName: 'Dr. Michael Chen', status: 'ACTIVE' },
          { id: 3, description: 'Cleaning Services', amount: 200.00, category: 'Maintenance', date: '2025-01-13', therapistName: 'Dr. Sarah Wilson', status: 'ACTIVE' },
          { id: 4, description: 'Internet Service', amount: 89.99, category: 'Technology', date: '2025-01-12', therapistName: 'Dr. Emily Rodriguez', status: 'ACTIVE' },
          { id: 5, description: 'Electricity Bill', amount: 125.50, category: 'Utilities', date: '2025-01-11', therapistName: 'Dr. Michael Chen', status: 'ACTIVE' },
          { id: 6, description: 'Water Bill', amount: 45.75, category: 'Utilities', date: '2025-01-10', therapistName: 'Dr. Sarah Wilson', status: 'ACTIVE' },
          { id: 7, description: 'Insurance Premium', amount: 450.00, category: 'Insurance', date: '2025-01-09', therapistName: 'Dr. Emily Rodriguez', status: 'ACTIVE' },
          { id: 8, description: 'Marketing Materials', amount: 75.25, category: 'Marketing', date: '2025-01-08', therapistName: 'Dr. Michael Chen', status: 'ACTIVE' },
          { id: 9, description: 'Equipment Maintenance', amount: 180.00, category: 'Maintenance', date: '2025-01-07', therapistName: 'Dr. Sarah Wilson', status: 'ACTIVE' },
          { id: 10, description: 'Professional Development', amount: 350.00, category: 'Training', date: '2025-01-06', therapistName: 'Dr. Emily Rodriguez', status: 'ACTIVE' },
          { id: 11, description: 'Conference Registration', amount: 275.00, category: 'Training', date: '2025-01-05', therapistName: 'Dr. Michael Chen', status: 'ACTIVE' },
          { id: 12, description: 'Legal Consultation', amount: 400.00, category: 'Professional Services', date: '2025-01-04', therapistName: 'Dr. Sarah Wilson', status: 'ACTIVE' },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setIsLoading(false);
    }
  };

  const filterExpenses = () => {
    if (!searchTerm) {
      setFilteredExpenses(expenses);
      return;
    }
    
    const filtered = expenses.filter(expense =>
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.therapistName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExpenses(filtered);
  };

  const handleCreateExpense = async (expenseData: any) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.createExpense(expenseData);
      
      // Mock creation
      const newExpense = {
        ...expenseData,
        id: Math.max(...expenses.map(e => e.id)) + 1
      };
      setExpenses(prev => [...prev, newExpense]);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleUpdateExpense = async (expenseData: any) => {
    if (!editingExpense) return;
    
    try {
      // TODO: Replace with actual API call
      // await adminApi.updateExpense(editingExpense.id, expenseData);
      
      // Mock update
      setExpenses(prev => prev.map(expense => 
        expense.id === editingExpense.id ? { ...expense, ...expenseData } : expense
      ));
      setShowModal(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    if (window.confirm(`Are you sure you want to delete expense: ${expense.description}?`)) {
      try {
        // TODO: Replace with actual API call
        // await adminApi.deleteExpense(expense.id);
        
        // Mock deletion
        setExpenses(prev => prev.filter(e => e.id !== expense.id));
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleExpenseStatusChange = async (entityId: number | string, newStatus: string | boolean) => {
    try {
      // TODO: Replace with actual API call
      // await adminApi.updateExpenseStatus(entityId, newStatus);
      
      // Mock status update
      setExpenses(prev => prev.map(e => 
        e.id === entityId ? { ...e, status: newStatus as string } : e
      ));
      
      console.log('Expense status updated:', entityId, newStatus);
    } catch (error) {
      console.error('Error updating expense status:', error);
    }
  };

  const handleBulkAction = async (action: string, selectedIds: number[]) => {
    switch (action) {
      case 'Delete':
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} expenses?`)) {
          setExpenses(prev => prev.filter(e => !selectedIds.includes(e.id)));
          setSelectedExpenseIds([]);
        }
        break;
      case 'Update Category':
        setExpenses(prev => prev.map(e => 
          selectedIds.includes(e.id) 
            ? { ...e, category: 'Office' }
            : e
        ));
        setSelectedExpenseIds([]);
        break;
      case 'Export':
        alert(`Exporting ${selectedIds.length} expenses...`);
        break;
      default:
        alert(`Bulk action '${action}' not implemented yet.`);
    }
  };

  const filterDefinitions = [
    { key: 'category', label: 'Category', type: 'select' as const, options: ['Office', 'Technology', 'Maintenance', 'Utilities', 'Insurance', 'Marketing', 'Training', 'Professional Services'] },
    { key: 'therapistName', label: 'Therapist', type: 'text' as const, placeholder: 'Filter by therapist' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const columns = [
    { key: 'description', label: 'Description', editable: true },
    { 
      key: 'amount', 
      label: 'Amount',
      editable: true,
      render: (value: number) => formatCurrency(value)
    },
    { key: 'category', label: 'Category', editable: true, enumValues: ['Office', 'Technology', 'Maintenance', 'Utilities', 'Insurance', 'Marketing', 'Training', 'Professional Services'] },
    { key: 'date', label: 'Date', editable: true },
    { 
      key: 'therapistName', 
      label: 'Therapist', 
      editable: true,
      clickableDropdown: true,
      searchableOptions: [
        { value: 'Dr. Sarah Wilson', label: 'Dr. Sarah Wilson' },
        { value: 'Dr. Michael Chen', label: 'Dr. Michael Chen' },
        { value: 'Dr. Emily Rodriguez', label: 'Dr. Emily Rodriguez' },
      ],
      onDropdownChange: (value: string, row: any) => {
        // Update the therapist field when dropdown selection changes
        setExpenses(prev => prev.map(e => 
          e.id === row.id ? { ...e, therapistName: value } : e
        ));
      }
    },
  ];

  return (
    <div className="expenses-tab">
      <div className="tab-header">
        <h2>Expense Management</h2>
        <button 
          className="add-btn"
          onClick={() => setShowModal(true)}
        >
          Add Expense
        </button>
      </div>
      
      <FilterPanel
        filters={filterDefinitions}
        onFiltersChange={setActiveFilters}
        onBulkAction={handleBulkAction}
        selectedRows={selectedExpenseIds}
        totalRows={filteredExpenses.length}
        bulkActions={['Delete', 'Update Category', 'Export']}
      />
      
              <DataTable
          columns={columns}
          data={filteredExpenses}
          selectable={true}
          onSelectionChange={setSelectedExpenseIds}
          statusColumn={{
            enabled: true,
            entityType: 'expense',
            statusKey: 'status',
            onStatusChange: handleExpenseStatusChange
          }}
          onSave={async (expense, updatedData) => {
            try {
              // Call backend API to update expense
              const response = await fetch(`http://localhost:8085/api/admin/expenses/${expense.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updatedData)
              });
              
              if (!response.ok) {
                throw new Error('Failed to update expense');
              }
              
              // Update local state to reflect changes
              const updatedExpense = await response.json();
              setExpenses(prevExpenses => 
                prevExpenses.map(e => e.id === expense.id ? updatedExpense : e)
              );
              
              // Show success message
              alert('Expense updated successfully!');
            } catch (error) {
              console.error('Error updating expense:', error);
              alert('Failed to update expense. Please try again.');
              throw error; // Re-throw to keep editing state
            }
          }}
          onDelete={handleDeleteExpense}
          onRestore={async (expense) => {
            try {
              // Call backend API to restore expense
              const response = await fetch(`http://localhost:8085/api/admin/expenses/${expense.id}/restore`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (!response.ok) {
                throw new Error('Failed to restore expense');
              }
              
              // Update local state
              setExpenses(prevExpenses => 
                prevExpenses.map(e => e.id === expense.id ? { ...e, deleted: false } : e)
              );
              
              alert('Expense restored successfully!');
            } catch (error) {
              console.error('Error restoring expense:', error);
              alert('Failed to restore expense. Please try again.');
            }
          }}
          isLoading={isLoading}
        />
      
      {showModal && (
        <AddEditModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingExpense(null);
          }}
          title={editingExpense ? 'Edit Expense' : 'Add Expense'}
          fields={[
            { key: 'description', label: 'Description', type: 'text', required: true, placeholder: 'Enter expense description' },
            { key: 'amount', label: 'Amount', type: 'number', required: true, placeholder: 'Enter amount' },
            { key: 'category', label: 'Category', type: 'select', options: ['Office', 'Technology', 'Maintenance', 'Other'], required: true },
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'status', label: 'Activity Status', type: 'select', options: ['ACTIVE', 'INACTIVE'], required: true },
          ]}
          initialData={editingExpense || {}}
          onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
        />
      )}
    </div>
  );
};

export default ExpensesTab; 