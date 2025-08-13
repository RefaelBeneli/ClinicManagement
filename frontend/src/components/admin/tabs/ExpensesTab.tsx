import React, { useState, useEffect, useRef } from 'react';
import DataTable from '../shared/DataTable';
import AddEditModal from '../shared/AddEditModal';
import SearchFilter from '../shared/SearchFilter';
import FilterPanel from '../shared/FilterPanel';
import { adminApi } from '../../../services/adminApi';
import './ExpensesTab.css';

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  therapistName: string;
  status: string;
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
  
  // Prevent duplicate API calls in React StrictMode
  const hasFetchedRef = useRef(false);


  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchExpenses();
    }
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [searchTerm]);

  // Update filteredExpenses when expenses change
  useEffect(() => {
    setFilteredExpenses(expenses);
  }, [expenses]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getExpenses();
      console.log('🔍 Raw expenses response:', response.data);
      
      // Handle Spring Data Page response
      const expensesData = response.data.content || response.data || [];
      console.log('🔍 Extracted expenses data:', expensesData);
      
      // Transform the data to match our interface
      const transformedExpenses: Expense[] = expensesData.map((expense: any) => ({
        id: expense.id,
        description: expense.description || 'Unknown',
        amount: expense.amount || 0,
        category: expense.category || 'Uncategorized',
        date: expense.date || expense.expenseDate ? new Date(expense.date || expense.expenseDate).toLocaleDateString() : 'Unknown',
        therapistName: expense.therapistName || expense.userFullName || 'Unassigned',
        status: expense.isActive ? 'ACTIVE' : 'INACTIVE'
      }));
      
      console.log('🔍 Transformed expenses:', transformedExpenses);
      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
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
      await adminApi.createExpense(expenseData);
      // Refresh the expenses list
      fetchExpenses();
      setShowModal(false);
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const handleUpdateExpense = async (expenseData: any) => {
    if (!editingExpense) return;
    
    try {
      await adminApi.updateExpense(editingExpense.id, expenseData);
      // Refresh the expenses list
      fetchExpenses();
      setShowModal(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    if (window.confirm(`Are you sure you want to delete expense ${expense.description}?`)) {
      try {
        await adminApi.deleteExpense(expense.id);
        // Refresh the expenses list
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleExpenseStatusChange = async (entityId: number | string, newStatus: string | boolean) => {
    try {
      // Update the expense status
      const expenseId = typeof entityId === 'string' ? parseInt(entityId) : entityId;
      const status = typeof newStatus === 'string' ? newStatus : (newStatus ? 'ACTIVE' : 'INACTIVE');
      
      await adminApi.updateExpense(expenseId, { status });
      // Refresh the expenses list
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expense status:', error);
    }
  };

  const handleBulkAction = async (action: string, selectedIds: number[]) => {
    switch (action) {
      case 'Delete':
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} expenses?`)) {
          try {
            await Promise.all(selectedIds.map(id => adminApi.deleteExpense(id)));
            setSelectedExpenseIds([]);
            fetchExpenses();
          } catch (error) {
            console.error('Error deleting expenses:', error);
          }
        }
        break;
      case 'Update Category':
        const newCategory = prompt('Enter new category:');
        if (newCategory) {
          try {
            await Promise.all(selectedIds.map(id => adminApi.updateExpense(id, { category: newCategory })));
            setSelectedExpenseIds([]);
            fetchExpenses();
          } catch (error) {
            console.error('Error updating expense categories:', error);
          }
        }
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
      validatedInput: true,
      onValidatedChange: (value: string, row: any) => {
        // Update the therapist field when input changes
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
            await adminApi.updateExpense(expense.id, updatedData);
            // Refresh the expenses list
            fetchExpenses();
          } catch (error) {
            console.error('Error updating expense:', error);
            throw error; // Re-throw to keep editing state
          }
        }}
        onDelete={handleDeleteExpense}
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
