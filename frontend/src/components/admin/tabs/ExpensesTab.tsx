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
  
  // Helper function to get category ID by name
  const getCategoryIdByName = (categoryName: string): number => {
    const categoryMap: Record<string, number> = {
      'Office': 1,
      'Technology': 2,
      'Maintenance': 3,
      'Utilities': 4,
      'Insurance': 5,
      'Marketing': 6,
      'Training': 7,
      'Professional Services': 8,
      'Professional Development': 11,
      'Rent': 2
    };
    return categoryMap[categoryName] || 1; // Default to Office if not found
  };
  
  // Helper function to get user ID by therapist name
  const getUserIdByName = (therapistName: string): number => {
    // Map therapist names to user IDs based on the seed data
    // Base schema: admin user with ID 1
    // Seed data: therapists starting from ID 2
    const userMap: Record<string, number> = {
      'Dr. Sarah Cohen': 2,        // therapist1
      'Dr. David Levy': 3,         // therapist2  
      'Dr. Rachel Green': 4,       // therapist3
      'Dr. Michael Rosen': 5,      // therapist4
      'Dr. Lisa Chen': 6,          // therapist5
      'Dr. Jonathan Weiss': 7,     // therapist6
      'Dr. Miriam Goldstein': 8,   // therapist7
      'Dr. Aaron Cohen': 9,        // therapist8
      'Dr. Rebecca Stern': 10,     // therapist9
      'Dr. Daniel Friedman': 11,   // therapist10
      // Common variations
      'Dr. Sarah': 2,
      'Sarah Cohen': 2,
      'Dr. David': 3,
      'David Levy': 3,
      'Dr. Rachel': 4,
      'Rachel Green': 4,
      'Dr. Michael': 5,
      'Michael Rosen': 5,
      'Dr. Lisa': 6,
      'Lisa Chen': 6,
      'Dr. Jonathan': 7,
      'Jonathan Weiss': 7,
      'Dr. Miriam': 8,
      'Miriam Goldstein': 8,
      'Dr. Aaron': 9,
      'Aaron Cohen': 9,
      'Dr. Rebecca': 10,
      'Rebecca Stern': 10,
      'Dr. Daniel': 11,
      'Daniel Friedman': 11
    };
    
    // Try exact match first
    if (userMap[therapistName]) {
      console.log('🔍 DEBUG: Exact match found for therapist:', therapistName, '-> ID:', userMap[therapistName]);
      return userMap[therapistName];
    }
    
    // Try partial matches (case-insensitive) - but be more strict
    const normalizedInput = therapistName.toLowerCase();
    for (const [name, id] of Object.entries(userMap)) {
      // Only match if the input contains the full name or vice versa
      if (normalizedInput === name.toLowerCase() || 
          (normalizedInput.includes(name.toLowerCase()) && name.length > 3)) {
        console.log('🔍 DEBUG: Partial match found for therapist:', therapistName, '->', name, '-> ID:', id);
        return id;
      }
    }
    
    // For completely new therapists, use a default valid user ID
    // We'll use user ID 2 (Dr. Sarah Cohen) as the default for now
    console.log('🔍 DEBUG: New therapist detected:', therapistName, '- using default user ID 2');
    return 2; // Default to Dr. Sarah Cohen for new therapists
  };
  
  // Helper function to fix date conversion (prevents timezone issues)
  const fixDateConversion = (dateInput: any): Date => {
    console.log('🔍 DEBUG: fixDateConversion input:', dateInput, 'type:', typeof dateInput);
    
    // If it's already a Date object, return it directly
    if (dateInput instanceof Date) {
      console.log('🔍 DEBUG: Input is already a Date object:', dateInput);
      return dateInput;
    }
    
    // If it's a string, parse it
    if (typeof dateInput === 'string') {
      if (dateInput.includes('-')) {
        // HTML date input format: YYYY-MM-DD
        const [year, month, day] = dateInput.split('-');
        console.log('🔍 DEBUG: Parsing YYYY-MM-DD format:', { year, month, day });
        // Create date in local timezone to avoid timezone issues
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        console.log('🔍 DEBUG: Created date:', date, 'Local date:', date.toLocaleDateString());
        return date;
      } else if (dateInput.includes('/')) {
        // MM/DD/YYYY format
        const [month, day, year] = dateInput.split('/');
        console.log('🔍 DEBUG: Parsing MM/DD/YYYY format:', { month, day, year });
        // Create date in local timezone to avoid timezone issues
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        console.log('🔍 DEBUG: Created date:', date, 'Local date:', date.toLocaleDateString());
        return date;
      } else {
        // Try direct Date constructor
        console.log('🔍 DEBUG: Using direct Date constructor');
        const date = new Date(dateInput);
        console.log('🔍 DEBUG: Direct date result:', date, 'Local date:', date.toLocaleDateString());
        return date;
      }
    }
    
    // If it's a number (timestamp), create Date from it
    if (typeof dateInput === 'number') {
      console.log('🔍 DEBUG: Input is a timestamp:', dateInput);
      const date = new Date(dateInput);
      console.log('🔍 DEBUG: Created date from timestamp:', date, 'Local date:', date.toLocaleDateString());
      return date;
    }
    
    // Fallback: return current date
    console.log('🔍 DEBUG: Fallback to current date');
    return new Date();
  };
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);


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

  const fetchExpenses = async (page: number = currentPage, size: number = pageSize) => {
    setIsLoading(true);
    try {
      const response = await adminApi.getExpenses(page, size);
      
      // Handle Spring Data Page response
      const expensesData = response.data.content || response.data || [];
      
      // Extract pagination info
      if (response.data.totalElements !== undefined) {
        setTotalElements(response.data.totalElements);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.number);
      }
      
      // Transform the data to match our interface
      const transformedExpenses: Expense[] = expensesData.map((expense: any) => ({
        id: expense.id,
        description: expense.description || 'Unknown',
        amount: expense.amount || 0,
        category: expense.category || 'Uncategorized',
        date: expense.date || expense.expenseDate ? new Date(expense.date || expense.expenseDate) : new Date(),
        therapistName: expense.therapistName || expense.userFullName || 'Unassigned',
        status: expense.isActive ? 'ACTIVE' : 'INACTIVE'
      }));
      
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
      console.log('🔍 DEBUG: Modal create expenseData:', expenseData);
      
      // Transform modal form data to backend DTO format
      const transformedData = {
        name: expenseData.description || expenseData.name,
        description: expenseData.description,
        amount: expenseData.amount,
        categoryId: getCategoryIdByName(expenseData.category),
        expenseDate: expenseData.date ? fixDateConversion(expenseData.date) : new Date(),
        userId: getUserIdByName(expenseData.therapistName || 'Dr. Sarah Cohen'),
        isActive: expenseData.status === 'ACTIVE'
      };
      
      console.log('🔍 DEBUG: Modal create transformedData:', transformedData);
      
      await adminApi.createExpense(transformedData);
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
      console.log('🔍 DEBUG: Modal update expenseData:', expenseData);
      
      // Transform modal form data to backend DTO format
      const transformedData = {
        name: expenseData.description || expenseData.name,
        description: expenseData.description,
        amount: expenseData.amount,
        categoryId: getCategoryIdByName(expenseData.category),
        expenseDate: expenseData.date ? fixDateConversion(expenseData.date) : undefined,
        userId: getUserIdByName(expenseData.therapistName || 'Dr. Sarah Cohen'),
        isActive: expenseData.status === 'ACTIVE'
      };
      
      console.log('🔍 DEBUG: Modal update transformedData:', transformedData);
      
      await adminApi.updateExpense(editingExpense.id, transformedData);
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
  
  // Pagination handlers
  const handlePageChange = (page: number) => {
    const zeroBasedPage = page - 1; // Convert from 1-based UI to 0-based backend
    setCurrentPage(zeroBasedPage);
    fetchExpenses(zeroBasedPage, pageSize);
  };
  
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page when changing page size
    fetchExpenses(0, size);
  };

  const handleExpenseStatusChange = async (entityId: number | string, newStatus: string | boolean) => {
    try {
      // Update the expense status
      const expenseId = typeof entityId === 'string' ? parseInt(entityId) : entityId;
      const isActive = typeof newStatus === 'string' ? (newStatus === 'ACTIVE') : newStatus;
      
      const payload = { isActive: isActive };
      
      // Call the real endpoint
      await adminApi.updateExpense(expenseId, payload);
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
              await Promise.all(selectedIds.map(id => adminApi.updateExpense(id, { categoryId: getCategoryIdByName(newCategory) })));
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
    { key: 'category', label: 'Category', type: 'select' as const, options: ['Office', 'Technology', 'Maintenance', 'Utilities', 'Insurance', 'Marketing', 'Training', 'Professional Services', 'Professional Development', 'Rent'] },
    { key: 'therapistName', label: 'Therapist', type: 'text' as const, placeholder: 'Filter by therapist' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const columns = [
    { key: 'description', label: 'Description', editable: true, sortable: true },
    { 
      key: 'amount', 
      label: 'Amount',
      editable: true,
      sortable: true,
      render: (value: number) => formatCurrency(value)
    },
    { key: 'category', label: 'Category', editable: true, sortable: true, enumValues: ['Office', 'Technology', 'Maintenance', 'Utilities', 'Insurance', 'Marketing', 'Training', 'Professional Services', 'Professional Development', 'Rent'] },
    { 
      key: 'date', 
      label: 'Date', 
      editable: true, 
      sortable: true,
      type: 'date',
      render: (value: any) => {
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        return value;
      }
    },
    { 
      key: 'therapistName', 
      label: 'Therapist', 
      editable: true,
      sortable: true,
      onValidatedChange: (value: string, row: any) => {
        // Update the therapist field when input changes
        setExpenses(prev => prev.map(e => 
          e.id === row.id ? { ...e, therapistName: value } : e
        ));
      }
    },
    { 
      key: 'status', 
      label: 'Status', 
      editable: true,
      sortable: true,
      enumValues: ['ACTIVE', 'INACTIVE']
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
        pagination={{
          enabled: true,
          currentPage: currentPage + 1, // Convert from 0-based to 1-based for display
          pageSize: pageSize,
          totalElements: totalElements,
          totalPages: totalPages,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange
        }}
        statusColumn={{
          enabled: true,
          entityType: 'expense',
          statusKey: 'status',
          onStatusChange: handleExpenseStatusChange
        }}
        onSave={async (expense, updatedData) => {
          try {
            console.log('🔍 DEBUG: Original expense:', expense);
            console.log('🔍 DEBUG: Original updatedData:', updatedData);
            
            // Merge current expense data with updated data to ensure all fields are captured
            const mergedData = {
              ...expense,
              ...updatedData
            };
            
            console.log('🔍 DEBUG: Merged data:', mergedData);
            
            // Transform frontend field names to backend DTO field names
            const transformedData = {
              description: mergedData.description,
              amount: mergedData.amount,
              categoryId: getCategoryIdByName(mergedData.category), // Convert category name to ID
              expenseDate: mergedData.date ? fixDateConversion(mergedData.date) : undefined, // Convert date string to Date
              userId: getUserIdByName(mergedData.therapistName), // Convert therapist name to user ID
              isActive: mergedData.status === 'ACTIVE' // Convert status string to boolean
            };
            
            console.log('🔍 DEBUG: Transformed data:', transformedData);
            console.log('🔍 DEBUG: Category mapping:', { original: mergedData.category, mapped: getCategoryIdByName(mergedData.category) });
            console.log('🔍 DEBUG: Therapist mapping:', { original: mergedData.therapistName, mapped: getUserIdByName(mergedData.therapistName) });
            console.log('🔍 DEBUG: Date conversion:', { original: mergedData.date, converted: mergedData.date ? fixDateConversion(mergedData.date) : undefined });
            
            await adminApi.updateExpense(expense.id, transformedData);
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
            { key: 'category', label: 'Category', type: 'select', options: ['Office', 'Technology', 'Maintenance', 'Utilities', 'Insurance', 'Marketing', 'Training', 'Professional Services', 'Professional Development', 'Rent'], required: true },
            { key: 'date', label: 'Date', type: 'date', required: true },
            { key: 'therapistName', label: 'Therapist', type: 'text', required: true, placeholder: 'Enter therapist name' },
            { key: 'status', label: 'Activity Status', type: 'select', options: ['ACTIVE', 'INACTIVE'], required: true },
          ]}
          initialData={editingExpense ? { ...editingExpense, therapistName: editingExpense.therapistName || 'Dr. Sarah Cohen' } : { therapistName: 'Dr. Sarah Cohen' }}
          onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
        />
      )}
    </div>
  );
};

export default ExpensesTab;
